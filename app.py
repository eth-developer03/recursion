# Standard library imports
import asyncio
import datetime
import os
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, BackgroundTasks, HTTPException, Depends, UploadFile, File
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
import uvicorn
from openai import OpenAIError
from dotenv import load_dotenv
import shutil
import sys
from pathlib import Path

# Import local modules
import video

# Add the folder containing config.py to the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../python-code")))

# Now you can import the config module
from config import OUTPUT_FOLDER

# Load environment variables
load_dotenv()

# ✅ Set up FastAPI app
app = FastAPI(
    title="Trending Content Video Script Generator",
    description="API for generating video scripts from trending Reddit posts and news articles",
    version="1.0.0"
)

# ✅ CORS Middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow access from React app
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# ✅ Serve the 'clipper' folder with static files
CLIPPER_FOLDER = "./python-code/clipper"
os.makedirs(CLIPPER_FOLDER, exist_ok=True)  # Ensure the folder exists
app.mount("/clipper", StaticFiles(directory=CLIPPER_FOLDER), name="clipper")

# ✅ In-memory job storage
jobs = {}

# ✅ Upload directory
UPLOAD_DIR = "./python-code/input_files"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ✅ Helper functions
def get_credentials():
    """Get API credentials from environment variables."""
    return APICredentials(
        reddit_client_id=os.environ.get("REDDIT_CLIENT_ID"),
        reddit_client_secret=os.environ.get("REDDIT_CLIENT_SECRET"),
        reddit_user_agent="TrendingNewsVideoGenerator/1.0.0",
        news_api_key=os.environ.get("NEWS_API_KEY"),
        openai_api_key=os.environ.get("OPENAI_API_KEY")
    )

def validate_credentials(credentials: APICredentials = Depends(get_credentials)):
    """Validate that required credentials are present."""
    missing = []
    
    if not credentials.reddit_client_id:
        missing.append("REDDIT_CLIENT_ID")
    if not credentials.reddit_client_secret:
        missing.append("REDDIT_CLIENT_SECRET")
    if not credentials.news_api_key:
        missing.append("NEWS_API_KEY")
    if not credentials.openai_api_key:
        missing.append("OPENAI_API_KEY")
    
    if missing:
        raise HTTPException(
            status_code=400, 
            detail=f"Missing required credentials: {', '.join(missing)}"
        )
    
    return credentials

# ✅ Background task to generate script
async def generate_script_task(
    job_id: str,
    request: ScriptGenerationRequest,
    credentials: APICredentials
):
    """Background task that generates a video script."""
    try:
        # Call the video processing module
        result = await video.generate_video_script(
            subreddits=request.subreddits,
            news_topics=request.news_topics,
            video_style=request.video_style,
            content_limit=request.content_limit,
            reddit_client_id=credentials.reddit_client_id,
            reddit_client_secret=credentials.reddit_client_secret,
            reddit_user_agent=credentials.reddit_user_agent,
            news_api_key=credentials.news_api_key,
            openai_api_key=credentials.openai_api_key
        )
        
        jobs[job_id] = {
            "status": "completed",
            "result": {
                "title": result["title"],
                "script": result["script"],
                "sources": result["source_content"]
            }
        }
    
    except Exception as e:
        jobs[job_id] = {
            "status": "failed",
            "error": str(e)
        }

# ✅ Upload Video Route
@app.post("/upload-video")
async def upload_video(file: UploadFile = File(...)):
    """
    Upload a video file and save it to the server.
    """
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    try:
        with open(file_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
        
        return {
            "message": "File uploaded successfully",
            "file_path": file_path
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")

# ✅ API Endpoints
@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": "Trending Content Video Script Generator API",
        "version": "1.0.0",
        "endpoints": [
            "/upload-video (POST): Upload a video",
            "/generate-script (POST): Generate a video script from trending content",
            "/job/{job_id} (GET): Check the status of a script generation job",
            "/health (GET): Check API health",
            "/get-videos (GET): List processed videos",
            "/download-video/{video_name} (GET): Download specific video"
        ]
    }

# ✅ Get Processed Videos
@app.get("/get-videos")
async def get_videos():
    """List all processed video files from the clipper folder."""
    video_files = [f.name for f in Path(CLIPPER_FOLDER).glob("*.mp4")]

    if not video_files:
        raise HTTPException(status_code=404, detail="No processed videos found")
    
    return {"videos": video_files}

# ✅ Download Specific Video
@app.get("/download-video/{video_name}")
async def download_video(video_name: str):
    """Download a specific video"""
    video_path = Path(f"{CLIPPER_FOLDER}/{video_name}")
    
    if not video_path.exists():
        raise HTTPException(status_code=404, detail="Video not found")
    
    return FileResponse(video_path)

# ✅ Script Generation Route
@app.post("/generate-script", response_model=Dict[str, str])
async def generate_script(
    request: ScriptGenerationRequest,
    background_tasks: BackgroundTasks,
    credentials: APICredentials = Depends(validate_credentials)
):
    """Generate a video script from trending content."""
    job_id = f"job_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}_{len(jobs)}"
    jobs[job_id] = {"status": "processing"}
    
    background_tasks.add_task(
        generate_script_task,
        job_id=job_id,
        request=request,
        credentials=credentials
    )
    
    return {"job_id": job_id, "status": "processing"}

# ✅ Job Status Route
@app.get("/job/{job_id}", response_model=Dict[str, Any])
async def get_job_status(job_id: str):
    """Get the status of a script generation job."""
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = jobs[job_id]
    
    if job["status"] == "completed":
        return {
            "status": "completed",
            "result": job["result"]
        }
    elif job["status"] == "failed":
        return {
            "status": "failed",
            "error": job["error"]
        }
    else:
        return {
            "status": "processing"
        }

# ✅ Health Check
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

# ✅ Run the app when executed directly
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True)
