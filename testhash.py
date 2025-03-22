import os
import unittest
import tempfile
import shutil
from unittest.mock import patch, MagicMock
import time

from backend.thumbnail import ViralityThumbnailAgent
from hashtag import VideoProcessor, OpenAIService, VideoHashtagGenerator

class TestVideoProcessor(unittest.TestCase):
    def setUp(self):
        # Create temporary directories for testing
        self.temp_dir = tempfile.mkdtemp()
        self.video_path = os.path.join(self.temp_dir, "test_video.mp4")
        self.audio_path = os.path.join(self.temp_dir, "test_audio.mp3")
        self.frames_folder = os.path.join(self.temp_dir, "frames")
        
        # Create a dummy video file (just for path testing)
        with open(self.video_path, "wb") as f:
            f.write(b"dummy video content")

    def tearDown(self):
        # Clean up the temporary directory
        shutil.rmtree(self.temp_dir)

    @patch('av.open')
    def test_extract_audio(self, mock_av_open):
        # Mock the PyAV objects
        mock_container = MagicMock()
        mock_audio_stream = MagicMock()
        mock_audio_stream.type = 'audio'
        mock_container.streams = [mock_audio_stream]
        mock_av_open.return_value = mock_container
        
        # Setup mock demux behavior
        mock_packet = MagicMock()
        mock_frame = MagicMock()
        mock_packet.decode.return_value = [mock_frame]
        mock_container.demux.return_value = [mock_packet]
        
        # Setup mock out_container
        mock_out_container = MagicMock()
        mock_out_stream = MagicMock()
        mock_out_container.add_stream.return_value = mock_out_stream
        mock_av_open.side_effect = [mock_container, mock_out_container]
        
        # Create processor and test
        processor = VideoProcessor(self.video_path, self.audio_path, self.frames_folder)
        processor.extract_audio()
        
        # Assert that av.open was called with correct parameters
        mock_av_open.assert_any_call(self.video_path)
        mock_av_open.assert_any_call(self.audio_path, mode='w', format='mp3')
        
        # Assert that demux was called with the audio stream
        mock_container.demux.assert_called_with(mock_audio_stream)
        
        # Assert that close was called on the output container
        mock_out_container.close.assert_called_once()

    @patch('cv2.VideoCapture')
    @patch('cv2.imwrite')
    def test_extract_frames(self, mock_imwrite, mock_video_capture):
        # Mock the OpenCV video capture
        mock_cap = MagicMock()
        mock_cap.isOpened.side_effect = [True, True, False]  # Return True twice, then False to end the loop
        mock_cap.read.side_effect = [(True, "frame1"), (True, "frame2")]
        mock_cap.get.return_value = 30  # Mock 30 FPS
        mock_video_capture.return_value = mock_cap
        
        # Create processor and test
        processor = VideoProcessor(self.video_path, self.audio_path, self.frames_folder, frame_interval=1)
        frames = processor.extract_frames()
        
        # Assert VideoCapture was called with the correct file path
        mock_video_capture.assert_called_with(self.video_path)
        
        # Assert frames were saved
        self.assertEqual(len(frames), 2)
        
        # Assert cv2.imwrite was called twice (once for each frame)
        self.assertEqual(mock_imwrite.call_count, 2)


class TestOpenAIService(unittest.TestCase):
    @patch('os.getenv')
    @patch('openai.api_key', new_callable=property)
    def setUp(self, mock_api_key, mock_getenv):
        # Mock environment variables
        mock_getenv.return_value = "fake-api-key"
        self.service = OpenAIService()

    @patch('openai.Audio.transcribe')
    def test_transcribe_audio(self, mock_transcribe):
        # Mock the OpenAI transcribe response
        mock_transcribe.return_value = {"text": "This is a test transcript"}
        
        # Create a temporary audio file
        with tempfile.NamedTemporaryFile(suffix=".mp3") as temp_file:
            temp_file.write(b"test audio content")
            temp_file.flush()
            
            # Test the transcribe function
            result = self.service.transcribe_audio(temp_file.name)
            
            # Assert that the API was called and returns the expected result
            mock_transcribe.assert_called_once()
            self.assertEqual(result, "This is a test transcript")

    @patch('base64.b64encode')
    def test_encode_image(self, mock_b64encode):
        # Mock base64 encoding
        mock_b64encode.return_value = b"base64-encoded-content"
        
        # Create a temporary image file
        with tempfile.NamedTemporaryFile(suffix=".jpg") as temp_file:
            temp_file.write(b"test image content")
            temp_file.flush()
            
            # Test the encode_image function
            result = self.service.encode_image(temp_file.name)
            
            # Assert base64 encode was called
            mock_b64encode.assert_called_once()
            self.assertEqual(result, "base64-encoded-content")

    @patch('openai.ChatCompletion.create')
    def test_analyze_images(self, mock_chat_completion):
        # Mock the OpenAI chat completion response
        mock_response = MagicMock()
        mock_response.choices[0].message.content = "Test image description"
        mock_chat_completion.return_value = mock_response
        
        # Mock the encode_image method
        self.service.encode_image = MagicMock(return_value="base64-encoded-content")
        
        # Create temporary image files
        with tempfile.NamedTemporaryFile(suffix=".jpg") as temp_file1, \
             tempfile.NamedTemporaryFile(suffix=".jpg") as temp_file2:
            
            frames = [temp_file1.name, temp_file2.name]
            
            # Test the analyze_images function
            result = self.service.analyze_images(frames)
            
            # Assert encode_image was called for each frame
            self.assertEqual(self.service.encode_image.call_count, 2)
            
            # Assert ChatCompletion.create was called
            mock_chat_completion.assert_called_once()
            self.assertEqual(result, "Test image description")


class TestVideoHashtagGenerator(unittest.TestCase):
    def setUp(self):
        # Create temporary directories for testing
        self.temp_dir = tempfile.mkdtemp()
        self.video_path = os.path.join(self.temp_dir, "test_video.mp4")
        self.audio_path = os.path.join(self.temp_dir, "test_audio.mp3")
        self.frames_folder = os.path.join(self.temp_dir, "frames")
        
        # Create a dummy video file
        with open(self.video_path, "wb") as f:
            f.write(b"dummy video content")

    def tearDown(self):
        # Clean up the temporary directory
        shutil.rmtree(self.temp_dir)

    @patch('hashtag.VideoProcessor')
    @patch('hashtag.OpenAIService')
    def test_process_video(self, mock_openai_service, mock_video_processor):
        # Mock the processor and service instances
        mock_processor_instance = MagicMock()
        mock_service_instance = MagicMock()
        
        mock_video_processor.return_value = mock_processor_instance
        mock_openai_service.return_value = mock_service_instance
        
        # Set up the return values for the mocked methods
        mock_processor_instance.audio_path = self.audio_path
        mock_processor_instance.extract_frames.return_value = ["frame1.jpg", "frame2.jpg"]
        
        mock_service_instance.transcribe_audio.return_value = "Test transcript"
        mock_service_instance.analyze_images.return_value = "Test image descriptions"
        mock_service_instance.generate_hashtags.return_value = "#test #hashtags"
        mock_service_instance.generate_caption.return_value = "Test caption"
        
        # Create the generator and test the process_video method
        generator = VideoHashtagGenerator(self.video_path, self.audio_path, self.frames_folder)
        
        # Manually replace the processor and service with mocks
        generator.video_processor = mock_processor_instance
        generator.openai_service = mock_service_instance
        
        # Call the method
        transcript, image_descriptions, hashtags, caption = generator.process_video()
        
        # Assert that all the required methods were called
        mock_processor_instance.extract_audio.assert_called_once()
        mock_processor_instance.extract_frames.assert_called_once()
        
        mock_service_instance.transcribe_audio.assert_called_once_with(self.audio_path)
        mock_service_instance.analyze_images.assert_called_once_with(["frame1.jpg", "frame2.jpg"])
        mock_service_instance.generate_hashtags.assert_called_once_with("Test transcript", "Test image descriptions")
        mock_service_instance.generate_caption.assert_called_once_with("Test transcript", "Test image descriptions")
        
        # Assert the return values
        self.assertEqual(transcript, "Test transcript")
        self.assertEqual(image_descriptions, "Test image descriptions")
        self.assertEqual(hashtags, "#test #hashtags")
        self.assertEqual(caption, "Test caption")


if __name__ == "__main__":
    inputs = {
        "video_path": "Video-152.mp4",  # Replace with your actual video file path.
        "output_dir": "virality_thumbnails",  # Output directory for thumbnails.
        "num_frames": 20,  # Number of frames to extract from the video.
        "num_thumbnails": 5,  # Number of thumbnails to generate (for further use, if needed).
        "selection_string": "A vibrant thumbnail with dynamic colors and modern design"  # Optional user prompt.
    }
    agent = ViralityThumbnailAgent(device="cpu")

    # Process the video to generate thumbnails.
    result = agent.process(inputs)

    unittest.main()