
import asyncio
import datetime
import os
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, BackgroundTasks, HTTPException, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import uvicorn
# from openai import APIError, AzureOpenAI, OpenAI
# from openai.error import Timeout as APITimeoutError  # For newer OpenAI versions
from openai import OpenAIError
# Import our video generation module
import video
from dotenv import load_dotenv
load_dotenv()  
app = FastAPI(
    title="Trending Content Video Script Generator",
    description="API for generating video scripts from trending Reddit posts and news articles",
    version="1.0.0"
)

# Model definitions
class APICredentials(BaseModel):
    reddit_client_id: Optional[str] = None
    reddit_client_secret: Optional[str] = None
    reddit_user_agent: str = "TrendingNewsVideoGenerator/1.0.0"
    news_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None

class ScriptGenerationRequest(BaseModel):
    subreddits: List[str] = Field(
        default=["technology", "worldnews", "science", "todayilearned"],
        description="List of subreddits to fetch trending posts from"
    )
    news_topics: List[str] = Field(
        default=["technology", "science", "business"],
        description="List of news topics to fetch headlines for"
    )
    video_style: str = Field(
        default="informative",
        description="Style of the video script (informative, entertaining, educational, dramatic)"
    )
    content_limit: int = Field(
        default=5, 
        description="Number of items to fetch from each source",
        ge=1, le=10
    )

# In-memory job storage
jobs = {}

# Helper functions
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

# Background task to generate script
async def generate_script_task(
    job_id: str,
    request: ScriptGenerationRequest,
    credentials: APICredentials
):
    """Background task that generates a video script."""
    try:
        # Call our video module's generate function
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

# API Endpoints
@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": "Trending Content Video Script Generator API",
        "version": "1.0.0",
        "endpoints": [
            "/generate-script (POST): Generate a video script from trending content",
            "/job/{job_id} (GET): Check the status of a script generation job",
            "/health (GET): Check API health"
        ]
    }

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

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

@app.get("/config/video-styles")
async def get_video_styles():
    """Get available video script styles."""
    return {
        "styles": {
            "informative": "Objective, factual style suitable for a news channel",
            "entertaining": "Engaging, casual style with some humor",
            "educational": "Thorough explanations of concepts",
            "dramatic": "Narrative tension and engagement"
        }
    }

@app.get("/check-credentials")
async def check_credentials(credentials: APICredentials = Depends(get_credentials)):
    """Check if all required API credentials are set."""
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
        return {
            "status": "incomplete",
            "missing": missing
        }
    else:
        return {
            "status": "complete",
            "message": "All required credentials are set"
        }

# Run the app when executed directly
if __name__ == "__main__":
    # Get port from environment variable or use default
    port = int(os.environ.get("PORT", 8000))
    
    # Run FastAPI with uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True)

