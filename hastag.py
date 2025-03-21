import os
import cv2
import base64
import av  # PyAV for video/audio handling
from dotenv import load_dotenv
import openai

# -------------------------------
# VideoProcessor: Handles video processing (audio and frame extraction) using PyAV and OpenCV
# -------------------------------
class VideoProcessor:
    def __init__(self, video_path: str, audio_path: str, frames_folder: str, frame_interval: int = 5):
        self.video_path = video_path
        self.audio_path = audio_path
        self.frames_folder = frames_folder
        self.frame_interval = frame_interval
        os.makedirs(self.frames_folder, exist_ok=True)

    def extract_audio(self) -> None:
        """
        Extracts audio from the video and saves it to the specified audio_path using PyAV.
        """
        container = av.open(self.video_path)
        audio_stream = next((s for s in container.streams if s.type == 'audio'), None)
        if audio_stream is None:
            raise ValueError("No audio stream found in the video.")
        
        # Open an output container for MP3; PyAV will handle encoding via built-in libraries.
        out_container = av.open(self.audio_path, mode='w', format='mp3')
        out_stream = out_container.add_stream('mp3')

        # Demux and decode audio frames from the input video
        for packet in container.demux(audio_stream):
            for frame in packet.decode():
                # Encode the audio frame and mux the packet into the output container
                for packet in out_stream.encode(frame):
                    out_container.mux(packet)
        
        # Flush any remaining packets
        for packet in out_stream.encode():
            out_container.mux(packet)
        
        out_container.close()
        print("✅ Audio extracted successfully!")

    def extract_frames(self) -> list:
        """
        Extracts frames from the video at every 'frame_interval' seconds using OpenCV.
        Returns a list of file paths for the extracted frames.
        """
        cap = cv2.VideoCapture(self.video_path)
        fps = int(cap.get(cv2.CAP_PROP_FPS))
        frame_count = 0
        extracted_frames = []

        while cap.isOpened():
            success, frame = cap.read()
            if not success:
                break
            # Save a frame at every (fps * frame_interval) frames
            if frame_count % (fps * self.frame_interval) == 0:
                frame_filename = os.path.join(self.frames_folder, f"frame_{frame_count}.jpg")
                cv2.imwrite(frame_filename, frame)
                extracted_frames.append(frame_filename)
            frame_count += 1

        cap.release()
        print(f"✅ {len(extracted_frames)} frames extracted!")
        return extracted_frames

# -------------------------------
# OpenAIService: Handles all OpenAI API interactions
# -------------------------------
class OpenAIService:
    def __init__(self, api_key: str = None):
        load_dotenv()  # Load environment variables from .env
        if api_key is None:
            api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OpenAI API key not found. Please set OPENAI_API_KEY in your .env file.")
        self.api_key = api_key
        openai.api_key = self.api_key

    def transcribe_audio(self, audio_path: str) -> str:
        """
        Transcribes the given audio file using OpenAI's Whisper API.
        """
        with open(audio_path, "rb") as audio_file:
            # Use the new transcribe method
            transcript = openai.Audio.transcribe("whisper-1", audio_file)
        print("✅ Transcription completed!")
        return transcript["text"] if isinstance(transcript, dict) else transcript

    def encode_image(self, image_path: str) -> str:
        """
        Encodes an image file to a Base64 string.
        """
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode("utf-8")

    def analyze_images(self, frames: list) -> str:
        """
        Sends Base64 encoded images to GPT-4-Turbo for generating image descriptions.
        """
        image_data_list = [self.encode_image(frame) for frame in frames]

        response = openai.ChatCompletion.create(
            model="gpt-4-turbo",  # Assuming this is the latest vision-enabled model
            messages=[
                {"role": "system", "content": "You are an AI that describes images to generate trending hashtags."},
                {"role": "user", "content": [
                    {"type": "text", "text": "Describe this image and suggest the best hashtags:"},
                    *[{"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_data}"}} for image_data in image_data_list]
                ]}
            ],
            max_tokens=200
        )
        return response.choices[0].message.content

    def generate_hashtags(self, transcript: str, image_descriptions: str) -> str:
        """
        Generates trending hashtags based on the video transcript and image descriptions.
        """
        response = openai.ChatCompletion.create(
            model="gpt-4-turbo",
            messages=[
                {"role": "system", "content": "You are an AI that generates trending hashtags based on video content."},
                {"role": "user", "content": f"Here is the video transcript: {transcript}"},
                {"role": "user", "content": f"Here are image descriptions: {image_descriptions}"},
                {"role": "user", "content": "Based on this, suggest the most viral hashtags."}
            ],
            max_tokens=50
        )
        return response.choices[0].message.content

    def generate_caption(self, transcript: str, image_descriptions: str) -> str:
        """
        Generates an engaging caption for the reel based on the video transcript and image descriptions.
        """
        response = openai.ChatCompletion.create(
            model="gpt-4-turbo",
            messages=[
                {"role": "system", "content": "You are an AI that creates engaging and creative captions for social media reels."},
                {"role": "user", "content": f"Video Transcript: {transcript}"},
                {"role": "user", "content": f"Image Descriptions: {image_descriptions}"},
                {"role": "user", "content": "Based on this, generate a captivating caption for a social media reel."}
            ],
            max_tokens=100
        )
        return response.choices[0].message.content

# -------------------------------
# VideoHashtagGenerator: Orchestrates the video processing and OpenAI services
# -------------------------------
class VideoHashtagGenerator:
    def __init__(self, video_path: str, audio_path: str, frames_folder: str, frame_interval: int = 5, api_key: str = None):
        self.video_processor = VideoProcessor(video_path, audio_path, frames_folder, frame_interval)
        self.openai_service = OpenAIService(api_key)

    def process_video(self):
        """
        Processes the video by extracting audio, transcribing it, extracting frames, analyzing images,
        and finally generating trending hashtags and a caption.
        Returns the transcript, image descriptions, generated hashtags, and caption.
        """
        self.video_processor.extract_audio()
        transcript = self.openai_service.transcribe_audio(self.video_processor.audio_path)
        frames = self.video_processor.extract_frames()
        image_descriptions = self.openai_service.analyze_images(frames)
        hashtags = self.openai_service.generate_hashtags(transcript, image_descriptions)
        caption = self.openai_service.generate_caption(transcript, image_descriptions)
        return transcript, image_descriptions, hashtags, caption

# -------------------------------
# Example usage
# -------------------------------
if __name__ == "__main__":
    video_path = "/Users/amanmehra/Desktop/final/Video-152.mp4"  # Change this to your video file path if needed
    audio_path = "extracted_audio.mp3"
    frames_folder = "frames/"

    generator = VideoHashtagGenerator(video_path, audio_path, frames_folder)
    transcript, image_descriptions, hashtags, caption = generator.process_video()

    print("\n🎯 Generated Hashtags:\n", hashtags)
    print("\n📝 Generated Caption:\n", caption)
