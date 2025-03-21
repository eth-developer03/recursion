import os
import cv2
import numpy as np
import torch
import requests
from PIL import Image, ImageDraw, ImageEnhance
from moviepy import VideoFileClip
from transformers import CLIPProcessor, CLIPModel
from typing import Dict, List, Tuple
import requests
import os
import google.generativeai as genai
from dotenv import load_dotenv

# This will parse the .env file and load the variables into your environment.
load_dotenv()
# Instantiate the CLIP processor once at the top level (or pass it in as a parameter).
clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

def _truncate_prompt_with_clip(text: str, max_tokens: int = 75) -> str:
    """
    Tokenize `text` with the CLIP tokenizer and truncate it to at most `max_tokens` tokens.
    Then decode it back to a string for further usage.
    """
    tokens = clip_processor.tokenizer.encode(text, add_special_tokens=False)
    if len(tokens) > max_tokens:
        tokens = tokens[:max_tokens]
    truncated_text = clip_processor.tokenizer.decode(tokens)
    return truncated_text

def gemini_api_refine(prompt: str) -> str:
    """
    Refines a prompt using the Gemini API via the google-generativeai SDK, then truncates via CLIP tokenizer.
    """
    # Load the API key from environment variables
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable not set.")
    
    genai.configure(api_key=api_key)
    
    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content(
            f"Refine the following prompt: '{prompt}' make sure the final output is at max 77 tokens. "
            f"Only provide a summarized 77-token reply.",
            generation_config=genai.GenerationConfig(
                temperature=0.7,
                top_k=1,
                top_p=1
            )
        )
        
        # Extract the refined text
        refined_prompt = response.text
        
        # Truncate using CLIP’s tokenizer
        truncated_prompt = _truncate_prompt_with_clip(refined_prompt, max_tokens=77)
        return truncated_prompt
    
    except Exception as e:
        raise Exception(f"Error using Gemini API: {e}")

class ViralityThumbnailAgent:
    """
    AI-Agent that extracts frames from a video, creates thumbnails in a vertical 9:16 format,
    and uses a multimodal model (CLIP) to rank and select thumbnails that are most likely to go viral.
    If a user-provided prompt is given, it will be refined using the Gemini API and used for ranking,
    otherwise a default ensemble of prompts is used.
    """
    def __init__(
        self, 
        target_sizes: List[Tuple[int, int]] = [(1080, 1920)],
        ensemble_prompts: List[str] = None,
        default_prompt: str = (
            "An ultra-dynamic, high-energy thumbnail designed for viral impact: featuring vivid, bold colors, "
            "dramatic contrasts, and striking typography. The image should evoke excitement and curiosity with a balanced, "
            "eye-catching composition and clear focal points, optimized for social media reels and shorts"
        ),
        device: str = "cpu"
    ):
        self.target_sizes = target_sizes
        self.device = device
        self.default_prompt = default_prompt
        # Use ensemble prompts only if a user prompt is not provided
        self.ensemble_prompts = ensemble_prompts or [
            "A vibrant and eye-catching thumbnail with bold colors and dynamic composition.",
            "A highly engaging thumbnail that looks modern and trendy for social media reels and shorts.",
            "A viral thumbnail with dramatic contrasts, clear focal points, and exciting typography."
        ]
        
        # Load CLIP model and processor
        self.clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(self.device)
        self.clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
        
        # For potential future use (e.g., face detection)
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

    def process(self, inputs: Dict[str, any]) -> Dict[str, any]:
        video_path = inputs.get("video_path")
        output_dir = inputs.get("output_dir", "virality_thumbnails")
        num_frames = inputs.get("num_frames", 20)
        num_thumbnails = inputs.get("num_thumbnails", 5)
        # If provided, use the user's prompt; otherwise, we'll fall back on the default
        selection_string = inputs.get("selection_string", None)
        
        if not video_path:
            raise ValueError("Video path is required")
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        
        print(f"Extracting frames from {video_path}...")
        frames = self._extract_frames(video_path, num_frames)
        
        # Generate thumbnails (vertical format for reels/shorts)
        all_thumbnail_paths = []
        for idx, frame in enumerate(frames):
            thumb = self._process_frame(frame, self.target_sizes[0][0], self.target_sizes[0][1])
            thumb_filename = os.path.join(
                output_dir, 
                f"thumbnail_frame{idx}_{self.target_sizes[0][0]}x{self.target_sizes[0][1]}.jpg"
            )
            thumb.convert("RGB").save(thumb_filename, quality=95)
            all_thumbnail_paths.append(thumb_filename)
        
        # Use user-provided prompt if available; refine it using the Gemini API and rank thumbnails with it.
        if selection_string:
            refined_prompt = self._refine_prompt(selection_string)
            ranked_thumbnail_paths = self._rank_thumbnails_with_prompt(all_thumbnail_paths, refined_prompt)
            best_thumbnail = ranked_thumbnail_paths[0]
        else:
            # Otherwise, use default ensemble ranking
            ranked_indices = self._rank_thumbnails_with_ensemble(all_thumbnail_paths)
            re_ranked = self._rank_thumbnails_with_prompt(
                [all_thumbnail_paths[i] for i in ranked_indices], self.default_prompt
            )
            best_thumbnail = re_ranked[0]
        
        print("Thumbnail generation completed. Check the output directory.")
        return {
            "all_thumbnail_paths": all_thumbnail_paths,
            "best_thumbnail": best_thumbnail
        }
    
    def _extract_frames(self, video_path: str, num_frames: int) -> List[np.ndarray]:
        clip = VideoFileClip(video_path)
        duration = clip.duration
        frames = []
        for i in range(num_frames):
            t = (i + 1) * duration / (num_frames + 1)
            frame = clip.get_frame(t)  # frame in RGB format
            frames.append(frame)
        clip.close()
        return frames

    def _process_frame(self, frame: np.ndarray, target_width: int, target_height: int) -> Image.Image:
        image = Image.fromarray(frame)
        image = self._resize_to_size(image, target_width, target_height)
        image = self._enhance_thumbnail(image)
        image = self._add_gradient_overlay(image)
        return image

    def _resize_to_size(self, image: Image.Image, target_width: int, target_height: int) -> Image.Image:
        width, height = image.size
        target_ratio = target_height / target_width
        current_ratio = height / width

        if current_ratio < target_ratio:
            new_height = target_height
            new_width = int(new_height / current_ratio)
            resized = image.resize((new_width, new_height), Image.LANCZOS)
            left = (new_width - target_width) // 2
            cropped = resized.crop((left, 0, left + target_width, new_height))
        else:
            new_width = target_width
            new_height = int(new_width * current_ratio)
            resized = image.resize((new_width, new_height), Image.LANCZOS)
            top = (new_height - target_height) // 2
            cropped = resized.crop((0, top, new_width, top + target_height))
        return cropped

    def _enhance_thumbnail(self, image: Image.Image) -> Image.Image:
        enhancer = ImageEnhance.Contrast(image)
        image = enhancer.enhance(1.2)
        enhancer = ImageEnhance.Brightness(image)
        image = enhancer.enhance(1.1)
        enhancer = ImageEnhance.Color(image)
        image = enhancer.enhance(1.3)
        enhancer = ImageEnhance.Sharpness(image)
        image = enhancer.enhance(1.5)
        return image

    def _add_gradient_overlay(self, image: Image.Image, opacity: float = 0.3) -> Image.Image:
        width, height = image.size
        gradient = Image.new('RGBA', (width, height), color=(0, 0, 0, 0))
        draw = ImageDraw.Draw(gradient)
        for y in range(height // 2, height):
            alpha = int(255 * opacity * ((y - height // 2) / (height // 2)))
            draw.line([(0, y), (width, y)], fill=(0, 0, 0, alpha))
        return Image.alpha_composite(image.convert('RGBA'), gradient).convert('RGB')

    def _refine_prompt(self, prompt: str) -> str:
        """
        Uses the Gemini API to refine the user-provided prompt by correcting typos,
        adjusting wording, and emphasizing key visual impact details so that the prompt
        is perfectly optimized for the CLIP model.
        """
        try:
            refined_prompt = gemini_api_refine(prompt)
        except Exception as e:
            print("Gemini API call failed, using original prompt. Error:", e)
            refined_prompt = prompt
        return refined_prompt

    def _rank_thumbnails_with_ensemble(self, thumbnail_paths: List[str]) -> List[int]:
        """
        Uses an ensemble of prompts to score each thumbnail.
        Returns the indices sorted by the average CLIP similarity score (highest first).
        """
        ensemble_scores = []
        for thumb_path in thumbnail_paths:
            image = Image.open(thumb_path)
            prompt_scores = []
            for prompt in self.ensemble_prompts:
                inputs = self.clip_processor(text=[prompt], images=image, return_tensors="pt", padding=True)
                inputs = {k: v.to(self.device) for k, v in inputs.items()}
                outputs = self.clip_model(**inputs)
                score = outputs.logits_per_image.item()
                prompt_scores.append(score)
            # Average the scores across all ensemble prompts
            avg_score = sum(prompt_scores) / len(prompt_scores)
            ensemble_scores.append(avg_score)
        ranked_indices = sorted(range(len(ensemble_scores)), key=lambda i: ensemble_scores[i], reverse=True)
        return ranked_indices

    def _rank_thumbnails_with_prompt(self, thumbnail_paths: List[str], prompt: str) -> List[str]:
        """
        Uses a single prompt (e.g., the refined user-provided prompt) to rank thumbnails.
        Returns the list of thumbnail paths sorted by CLIP similarity (highest first).
        """
        scores = []
        for thumb_path in thumbnail_paths:
            image = Image.open(thumb_path)
            inputs = self.clip_processor(text=[prompt], images=image, return_tensors="pt", padding=True)
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            outputs = self.clip_model(**inputs)
            score = outputs.logits_per_image.item()
            scores.append(score)
        # Sort the thumbnail paths based on the scores
        sorted_paths = [x for _, x in sorted(zip(scores, thumbnail_paths), key=lambda pair: pair[0], reverse=True)]
        return sorted_paths


if __name__ == "__main__":
    # Define input parameters for the thumbnail agent.
    inputs = {
        "video_path": "Video-152.mp4",  # Replace with your actual video file path.
        "output_dir": "virality_thumbnails",  # Output directory for thumbnails.
        "num_frames": 20,  # Number of frames to extract from the video.
        "num_thumbnails": 5,  # Number of thumbnails to generate (for further use, if needed).
        "selection_string": "A vibrant thumbnail with dynamic colors and modern design"  # Optional user prompt.
    }

    # Create an instance of ViralityThumbnailAgent.
    # Use "cuda" if you have GPU support; otherwise, "cpu" is fine.
    agent = ViralityThumbnailAgent(device="cpu")

    # Process the video to generate thumbnails.
    result = agent.process(inputs)

    # Output all generated thumbnail paths.
    print("Generated Thumbnail Paths:")
    for path in result["all_thumbnail_paths"]:
        print(path)

    # Output the best thumbnail as determined by the agent.
    print("\nBest Thumbnail Path:")
    print(result["best_thumbnail"])
