import os
import unittest
import tempfile
import shutil
from unittest.mock import patch, MagicMock, Mock
import numpy as np
from PIL import Image

from thumbnail import ViralityThumbnailAgent, gemini_api_refine, _truncate_prompt_with_clip

class TestPromptHelper(unittest.TestCase):
    @patch('thumbnail.clip_processor')
    def test_truncate_prompt_with_clip(self, mock_clip_processor):
        # Setup mock tokenizer
        mock_tokenizer = MagicMock()
        mock_tokenizer.encode.return_value = list(range(100))  # 100 tokens
        mock_tokenizer.decode.return_value = "truncated text"
        mock_clip_processor.tokenizer = mock_tokenizer
        
        # Test the function
        result = _truncate_prompt_with_clip("test prompt", max_tokens=50)
        
        # Assert encode was called with the correct parameters
        mock_tokenizer.encode.assert_called_with("test prompt", add_special_tokens=False)
        
        # Assert decode was called with the first 50 tokens
        mock_tokenizer.decode.assert_called_with(list(range(50)))
        
        # Assert the return value
        self.assertEqual(result, "truncated text")
    
    @patch('os.environ.get')
    @patch('google.generativeai.configure')
    @patch('google.generativeai.GenerativeModel')
    def test_gemini_api_refine(self, mock_generative_model, mock_configure, mock_env_get):
        # Mock environment variables
        mock_env_get.return_value = "fake-gemini-key"
        
        # Mock Gemini API response
        mock_model = MagicMock()
        mock_response = MagicMock()
        mock_response.text = "Refined prompt text"
        mock_model.generate_content.return_value = mock_response
        mock_generative_model.return_value = mock_model
        
        # Add mock for _truncate_prompt_with_clip
        with patch('thumbnail._truncate_prompt_with_clip') as mock_truncate:
            mock_truncate.return_value = "Truncated refined text"
            
            # Test the function
            result = gemini_api_refine("test prompt")
            
            # Assert environment variable was checked
            mock_env_get.assert_called_with("GEMINI_API_KEY")
            
            # Assert Gemini API was configured with the key
            mock_configure.assert_called_with(api_key="fake-gemini-key")
            
            # Assert GenerativeModel was instantiated with the correct model name
            mock_generative_model.assert_called_with("gemini-2.0-flash")
            
            # Assert generate_content was called with the prompt
            mock_model.generate_content.assert_called_once()
            self.assertIn("test prompt", mock_model.generate_content.call_args[0][0])
            
            # Assert _truncate_prompt_with_clip was called
            mock_truncate.assert_called_with("Refined prompt text", max_tokens=77)
            
            # Assert the return value
            self.assertEqual(result, "Truncated refined text")


class TestViralityThumbnailAgent(unittest.TestCase):
    def setUp(self):
        # Create temporary directories for testing
        self.temp_dir = tempfile.mkdtemp()
        self.video_path = os.path.join(self.temp_dir, "test_video.mp4")
        self.output_dir = os.path.join(self.temp_dir, "thumbnails")
        os.makedirs(self.output_dir, exist_ok=True)
        
        # Create a dummy video file
        with open(self.video_path, "wb") as f:
            f.write(b"dummy video content")
            
        # Setup patches for external dependencies
        self.clip_model_patch = patch('thumbnail.CLIPModel.from_pretrained')
        self.clip_processor_patch = patch('thumbnail.CLIPProcessor.from_pretrained')
        self.face_cascade_patch = patch('cv2.CascadeClassifier')
        
        # Start patches
        self.mock_clip_model = self.clip_model_patch.start()
        self.mock_clip_processor = self.clip_processor_patch.start()
        self.mock_face_cascade = self.face_cascade_patch.start()
        
        # Mock returns
        self.mock_model = MagicMock()
        self.mock_model.to.return_value = self.mock_model
        self.mock_clip_model.return_value = self.mock_model
        
        self.mock_processor = MagicMock()
        self.mock_clip_processor.return_value = self.mock_processor
        
        # Initialize the agent
        self.agent = ViralityThumbnailAgent()
        
    def tearDown(self):
        # Clean up the temporary directory
        shutil.rmtree(self.temp_dir)
        
        # Stop patches
        self.clip_model_patch.stop()
        self.clip_processor_patch.stop()
        self.face_cascade_patch.stop()
    
    @patch('thumbnail.VideoFileClip')
    def test_extract_frames(self, mock_video_file_clip):
        # Mock VideoFileClip behavior
        mock_clip = MagicMock()
        mock_clip.duration = 10.0
        mock_clip.get_frame.side_effect = [np.zeros((720, 1280, 3), dtype=np.uint8) for _ in range(5)]
        mock_video_file_clip.return_value = mock_clip
        
        # Test the method
        frames = self.agent._extract_frames(self.video_path, 5)
        
        # Assert VideoFileClip was called with the correct path
        mock_video_file_clip.assert_called_with(self.video_path)
        
        # Assert get_frame was called 5 times
        self.assertEqual(mock_clip.get_frame.call_count, 5)
        
        # Assert close was called
        mock_clip.close.assert_called_once()
        
        # Assert 5 frames were returned
        self.assertEqual(len(frames), 5)
    
    def test_process_frame(self):
        # Create a test frame
        frame = np.zeros((720, 1280, 3), dtype=np.uint8)
        
        # Mock the enhancement methods
        self.agent._resize_to_size = MagicMock(return_value=Image.fromarray(frame))
        self.agent._enhance_thumbnail = MagicMock(return_value=Image.fromarray(frame))
        self.agent._add_gradient_overlay = MagicMock(return_value=Image.fromarray(frame))
        
        # Test the method
        result = self.agent._process_frame(frame, 1080, 1920)
        
        # Assert the methods were called with correct parameters
        self.agent._resize_to_size.assert_called_with(Image.fromarray(frame), 1080, 1920)
        self.agent._enhance_thumbnail.assert_called_once()
        self.agent._add_gradient_overlay.assert_called_once()
        
        # Assert a PIL Image is returned
        self.assertIsInstance(result, Image.Image)
    
    def test_resize_to_size(self):
        # Create test images with different aspect ratios
        tall_image = Image.new('RGB', (720, 1280))  # Taller than 9:16
        wide_image = Image.new('RGB', (1920, 720))  # Wider than 9:16
        
        # Test resizing tall image
        result_tall = self.agent._resize_to_size(tall_image, 1080, 1920)
        
        # Test resizing wide image
        result_wide = self.agent._resize_to_size(wide_image, 1080, 1920)
        
        # Assert the results have the correct dimensions
        self.assertEqual(result_tall.size, (1080, 1920))
        self.assertEqual(result_wide.size, (1080, 1920))
    
    @patch('thumbnail.gemini_api_refine')
    def test_refine_prompt(self, mock_gemini_api_refine):
        # Mock gemini_api_refine
        mock_gemini_api_refine.return_value = "Refined prompt"
        
        # Test success case
        result = self.agent._refine_prompt("Test prompt")
        mock_gemini_api_refine.assert_called_with("Test prompt")
        self.assertEqual(result, "Refined prompt")
        
        # Test failure case
        mock_gemini_api_refine.side_effect = Exception("API error")
        result = self.agent._refine_prompt("Test prompt")
        self.assertEqual(result, "Test prompt")  # Should return original on error
    
    @patch('PIL.Image.open')
    def test_rank_thumbnails_with_ensemble(self, mock_image_open):
        # Mock Image.open
        mock_image = MagicMock()
        mock_image_open.return_value = mock_image
        
        # Mock CLIP processor and model
        self.agent.clip_processor = MagicMock()
        inputs = {"input_ids": MagicMock(), "pixel_values": MagicMock()}
        self.agent.clip_processor.return_value = inputs
        
        self.agent.clip_model = MagicMock()
        mock_outputs = MagicMock()
        mock_outputs.logits_per_image = MagicMock()
        mock_outputs.logits_per_image.item.return_value = 0.8
        self.agent.clip_model.return_value = mock_outputs
        
        # Test with two thumbnail paths
        thumbnail_paths = [
            os.path.join(self.temp_dir, "thumb1.jpg"),
            os.path.join(self.temp_dir, "thumb2.jpg")
        ]
        
        # Create the files
        for path in thumbnail_paths:
            with open(path, "wb") as f:
                f.write(b"dummy thumbnail")
        
        # Test the method
        result = self.agent._rank_thumbnails_with_ensemble(thumbnail_paths)
        
        # Assert Image.open was called twice
        self.assertEqual(mock_image_open.call_count, 2 * len(self.agent.ensemble_prompts))
        
        # Assert we got 2 indices back
        self.assertEqual(len(result), 2)
        
        # Indices should be 0 and 1 in some order
        self.assertTrue(set(result) == {0, 1})
    
    @patch('PIL.Image.open')
    def test_rank_thumbnails_with_prompt(self, mock_image_open):
        # Mock Image.open
        mock_image = MagicMock()
        mock_image_open.return_value = mock_image
        
        # Mock CLIP processor and model
        self.agent.clip_processor = MagicMock()
        inputs = {"input_ids": MagicMock(), "pixel_values": MagicMock()}
        self.agent.clip_processor.return_value = inputs
        
        self.agent.clip_model = MagicMock()
        mock_outputs = MagicMock()
        # First thumbnail scores higher
        mock_outputs.logits_per_image.item.side_effect = [0.9, 0.7]
        self.agent.clip_model.return_value = mock_outputs
        
        # Test with two thumbnail paths
        thumbnail_paths = [
            os.path.join(self.temp_dir, "thumb1.jpg"),
            os.path.join(self.temp_dir, "thumb2.jpg")
        ]
        
        # Create the files
        for path in thumbnail_paths:
            with open(path, "wb") as f:
                f.write(b"dummy thumbnail")
        
        # Test the method
        result = self.agent._rank_thumbnails_with_prompt(thumbnail_paths, "Test prompt")
        
        # Assert Image.open was called twice
        self.assertEqual(mock_image_open.call_count, 2)
        
        # Assert we got the paths back in the right order
        self.assertEqual(result[0], thumbnail_paths[0])  # 0.9 score
        self.assertEqual(result[1], thumbnail_paths[1])  # 0.7 score
    
    @patch('thumbnail.ViralityThumbnailAgent._extract_frames')
    @patch('thumbnail.ViralityThumbnailAgent._process_frame')
    @patch('thumbnail.ViralityThumbnailAgent._refine_prompt')
    @patch('thumbnail.ViralityThumbnailAgent._rank_thumbnails_with_prompt')
    def test_process_with_user_prompt(self, mock_rank_prompt, mock_refine_prompt, 
                                       mock_process_frame, mock_extract_frames):
        # Mock the internal methods
        mock_extract_frames.return_value = [np.zeros((720, 1280, 3), dtype=np.uint8) for _ in range(3)]
        
        mock_pil_image = Image.new('RGB', (1080, 1920))
        mock_process_frame.return_value = mock_pil_image
        
        mock_refine_prompt.return_value = "Refined test prompt"
        
        mock_rank_prompt.return_value = [
            os.path.join(self.output_dir, "best_thumbnail.jpg"),
            os.path.join(self.output_dir, "second_best.jpg")
        ]
        
        # Create the input dictionary
        inputs = {
            "video_path": self.video_path,
            "output_dir": self.output_dir,
            "num_frames": 3,
            "selection_string": "Test prompt"
        }
        
        # Test the method
        result = self.agent.process(inputs)
        
        # Assert the frames were extracted
        mock_extract_frames.assert_called_with(self.video_path, 3)
        
        # Assert _process_frame was called for each frame
        self.assertEqual(mock_process_frame.call_count, 3)
        
        # Assert the prompt was refined
        mock_refine_prompt.assert_called_with("Test prompt")
        
        # Assert _rank_thumbnails_with_prompt was called with the refined prompt
        mock_rank_prompt.assert_called_once()
        self.assertIn("Refined test prompt", mock_rank_prompt.call_args[0])
        
        # Assert the result has the expected keys
        self.assertIn("all_thumbnail_paths", result)
        self.assertIn("best_thumbnail", result)
        
        # Assert the best thumbnail is the first one from the ranking
        self.assertEqual(result["best_thumbnail"], os.path.join(self.output_dir, "best_thumbnail.jpg"))


if __name__ == "__main__":
    unittest.main()