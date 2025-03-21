import os
import shutil
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException
from moviepy.editor import VideoFileClip

video_router = APIRouter()

class VideoConverter:
    """
    A class to convert videos to a vertical format with quality enhancements.
    """
    def _init_(self, target_width: int = 1080, target_height: int = 1920, max_duration: int = 60):
        self.target_width = target_width
        self.target_height = target_height
        self.max_duration = max_duration

    def convert_to_vertical(self, input_path: str, output_path: str):
        # Load the video clip
        clip = VideoFileClip(input_path)
        
        # Trim if the clip duration exceeds max_duration
        if clip.duration > self.max_duration:
            clip = clip.subclip(0, self.max_duration)
        
        # Resize to match target height while preserving aspect ratio
        clip_resized = clip.resize(height=self.target_height)
        
        # Crop to center if the resized width exceeds target width,
        # otherwise resize to target width (this might stretch the image)
        if clip_resized.w > self.target_width:
            x_center = clip_resized.w // 2
            left = x_center - self.target_width // 2
            clip_cropped = clip_resized.crop(x1=left, x2=left + self.target_width)
        else:
            clip_cropped = clip_resized.resize(width=self.target_width)
        
        # Apply noise reduction and sharpening filters using ffmpeg parameters
        ffmpeg_params = ["-vf", "hqdn3d=1.5:1.5:6:6,unsharp=5:5:1.0:3:3:1.0"]
        
        # Write the final video with appropriate codec settings
        clip_cropped.write_videofile(
            output_path,
            fps=clip.fps,
            codec="libx264",
            audio_codec="aac",
            ffmpeg_params=ffmpeg_params
        )

# Create an instance of VideoConverter with default settings
converter = VideoConverter()

@video_router.post("/convert", summary="Convert video to vertical format")
async def convert_video(file: UploadFile = File(...)):
    """
    Endpoint to convert an uploaded video into a vertical format.
    The converted file is saved locally with a unique name.
    """
    input_filename = f"temp_{uuid.uuid4().hex}.mp4"
    output_filename = f"converted_{uuid.uuid4().hex}.mp4"
    
    try:
        # Save the uploaded file to a temporary location
        with open(input_filename, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Perform the conversion
        converter.convert_to_vertical(input_filename, output_filename)
        
        return {"message": "Video conversion successful", "output_file": output_filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Remove the temporary input file
        if os.path.exists(input_filename):
            os.remove(input_filename)