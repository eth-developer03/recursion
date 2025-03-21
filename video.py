import autogen
import praw
import asyncio
import requests
import datetime
import os
import openai

from typing import List, Dict, Any, Optional
from openai import APIError, AzureOpenAI, OpenAI
from dotenv import load_dotenv
load_dotenv()  
# from openai.error import Timeout as APITimeoutError  # For newer OpenAI versions
from openai import OpenAIError

import video
# Step 1: Configure API Clients
def setup_reddit_client(client_id=None, client_secret=None, user_agent=None):
    """Set up and return a Reddit API client."""
    client_id = client_id or os.environ.get("REDDIT_CLIENT_ID", "YOUR_CLIENT_ID")
    client_secret = client_secret or os.environ.get("REDDIT_CLIENT_SECRET", "YOUR_CLIENT_SECRET")
    user_agent = user_agent or "TrendingNewsVideoGenerator/1.0.0"
    
    return praw.Reddit(
        client_id=client_id,
        client_secret=client_secret,
        user_agent=user_agent
    )

def setup_news_api_client(api_key=None):
    """Return the News API key."""
    return api_key or os.environ.get("NEWS_API_KEY", "YOUR_NEWS_API_KEY")

# Step 2: Define AutoGen Agents
class ContentFetcherAgent(autogen.AssistantAgent):
    def __init__(self, name, reddit_client, news_api_key):
        super().__init__(name=name)
        self.reddit_client = reddit_client
        self.news_api_key = news_api_key
        
    async def fetch_trending_reddit_posts(self, subreddits: List[str], limit=5):
        """Fetch trending posts from multiple subreddits."""
        all_posts = []
        for subreddit_name in subreddits:
            try:
                subreddit = self.reddit_client.subreddit(subreddit_name)
                posts = subreddit.hot(limit=limit)
                subreddit_posts = [
                    {
                        "source": f"Reddit - r/{subreddit_name}",
                        "title": post.title,
                        "content": post.selftext[:500] if post.selftext else "",
                        "score": post.score,
                        "url": post.url,
                        "comments": post.num_comments,
                        "created": datetime.datetime.fromtimestamp(post.created_utc).strftime('%Y-%m-%d %H:%M:%S')
                    } 
                    for post in posts
                ]
                all_posts.extend(subreddit_posts)
                print(f"✓ Fetched {len(subreddit_posts)} posts from r/{subreddit_name}")
            except Exception as e:
                print(f"⚠ Error fetching from r/{subreddit_name}: {str(e)}")
        
        # Sort by engagement (score + comments)
        all_posts.sort(key=lambda x: (x["score"] + x["comments"]), reverse=True)
        return all_posts[:limit]
    
    async def fetch_news_api_headlines(self, topics: List[str] = ["technology", "science"], limit=5):
        """Fetch trending news from NewsAPI.org."""
        all_articles = []
        
        for topic in topics:
            try:
                url = f"https://newsapi.org/v2/top-headlines?category={topic}&language=en&apiKey={self.news_api_key}"
                response = requests.get(url)
                if response.status_code == 200:
                    data = response.json()
                    articles = [
                        {
                            "source": article["source"]["name"] if article["source"]["name"] else "NewsAPI",
                            "title": article["title"],
                            "content": article["description"] if article["description"] else "",
                            "url": article["url"],
                            "created": article["publishedAt"]
                        }
                        for article in data["articles"][:limit]
                    ]
                    all_articles.extend(articles)
                    print(f"✓ Fetched {len(articles)} {topic} news articles")
                else:
                    print(f"⚠ NewsAPI returned status code {response.status_code}")
            except Exception as e:
                print(f"⚠ Error fetching {topic} news: {str(e)}")
        
        return all_articles[:limit]

# class VideoScriptGenerator(autogen.AssistantAgent):
#     def __init__(self, name, llm_config):
#         super().__init__(name=name, llm_config=llm_config)
#         self.client = openai.AsyncOpenAI(api_key=llm_config["api_key"])

#     async def generate_script(self, prompt):
#         """Generates a video script using OpenAI's GPT API."""
#         response = await self.client.chat.completions.create(  # ✅ Correct API call
#             model=self.llm_config["model"],  
#             messages=[{"role": "user", "content": prompt}]
#         )
#         return response.choices[0].message.content
    
#     async def create_video_script(self, content_items: List[Dict[str, Any]], video_style="informative"):
#     """Generate a video script from content items."""
    
#     # Create a prompt that instructs the LLM to generate a video script
#     context = "\n\n".join([
#         f"HEADLINE: {item['title']}\n"
#         f"SOURCE: {item['source']}\n"
#         f"CONTENT: {item['content']}\n"
#         f"URL: {item['url']}"
#         for item in content_items
#     ])
    
#     styles = {
#         "informative": "Create an objective, informative video script suitable for a news channel",
#         "entertaining": "Create an engaging, entertaining script with a casual tone and some humor",
#         "educational": "Create an educational script that explains concepts thoroughly",
#         "dramatic": "Create a dramatic script with narrative tension and engagement"
#     }
    
#     style_instruction = styles.get(video_style, styles["informative"])
    
#     prompt = f"""
#     You are a professional video script writer. Based on the following trending news and social media content, 
#     {style_instruction}. The script should:
    
#     1. Have an engaging introduction with a hook
#     2. Cover 3-5 main trending topics
#     3. Include transitions between topics
#     4. Provide relevant context and background
#     5. End with a call to action or thought-provoking conclusion
#     6. Be around 500-700 words (3-4 minutes when spoken)
#     7. Include [VISUAL: description] notes for suggested visuals
#     8. Include [MUSIC: mood] notes for background music suggestions
    
#     CONTENT TO COVER:
#     {context}
    
#     FORMAT YOUR RESPONSE AS:
#     TITLE: [Catchy video title]
    
#     [Full video script with visual and music cues]
#     """
    
#     # Generate the script using the configured LLM
#     script = await self.generate_script(prompt)
    
#     return {
#         "title": next((line.replace("TITLE:", "").strip() for line in script.split("\n") if line.startswith("TITLE:")), "Trending News Roundup"),
#         "script": script
#     }
    
#     # async def create_video_script(self, content_items: List[Dict[str, Any]], video_style="informative"):
#     #     """Generate a video script from content items."""
        
#     #     # Create a prompt that instructs the LLM to generate a video script
#     #     context = "\n\n".join([
#     #         f"HEADLINE: {item['title']}\n"
#     #         f"SOURCE: {item['source']}\n"
#     #         f"CONTENT: {item['content']}\n"
#     #         f"URL: {item['url']}"
#     #         for item in content_items
#     #     ])
        
#     #     styles = {
#     #         "informative": "Create an objective, informative video script suitable for a news channel",
#     #         "entertaining": "Create an engaging, entertaining script with a casual tone and some humor",
#     #         "educational": "Create an educational script that explains concepts thoroughly",
#     #         "dramatic": "Create a dramatic script with narrative tension and engagement"
#     #     }
        
#     #     style_instruction = styles.get(video_style, styles["informative"])
        
#     #     prompt = f"""
#     #     You are a professional video script writer. Based on the following trending news and social media content, 
#     #     {style_instruction}. The script should:
        
#     #     1. Have an engaging introduction with a hook
#     #     2. Cover 3-5 main trending topics
#     #     3. Include transitions between topics
#     #     4. Provide relevant context and background
#     #     5. End with a call to action or thought-provoking conclusion
#     #     6. Be around 500-700 words (3-4 minutes when spoken)
#     #     7. Include [VISUAL: description] notes for suggested visuals
#     #     8. Include [MUSIC: mood] notes for background music suggestions
        
#     #     CONTENT TO COVER:
#     #     {context}
        
#     #     FORMAT YOUR RESPONSE AS:
#     #     TITLE: [Catchy video title]
        
#     #     [Full video script with visual and music cues]
#     #     """
        
#     #     # Generate the script using the configured LLM
#     #     # script = await self.llm_generate(prompt)
#     #     # generator = video.VideoScriptGenerator(credentials.openai_api_key)
#     #     # script = await generator.create_video_script(content_items, video_style="informative")
#     #     # llm_config = {"api_key": credentials.openai_api_key, "model": "gpt-4"}
#     #     # generator = video.VideoScriptGenerator(name="video_generator", llm_config=llm_config)


#     #     return {
#     #         "title": next((line.replace("TITLE:", "").strip() for line in script.split("\n") if line.startswith("TITLE:")), "Trending News Roundup"),
#     #         "script": script
#     #     }
    
    
import openai
import autogen
from typing import List, Dict, Any

class VideoScriptGenerator(autogen.AssistantAgent):
    def __init__(self, name, llm_config):
        super().__init__(name=name, llm_config=llm_config)
        self.client = openai.AsyncOpenAI(api_key=llm_config["api_key"])

    async def generate_script(self, prompt):
        """Generates a video script using OpenAI's GPT API."""
        response = await self.client.chat.completions.create(  # ✅ Correct API call
            model=self.llm_config["model"],  
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content

    async def create_video_script(self, content_items: List[Dict[str, Any]], video_style="informative"):
        """Generate a video script from content items."""
        
        # Create a prompt that instructs the LLM to generate a video script
        context = "\n\n".join([
            f"HEADLINE: {item['title']}\n"
            f"SOURCE: {item['source']}\n"
            f"CONTENT: {item['content']}\n"
            f"URL: {item['url']}"
            for item in content_items
        ])
        
        styles = {
            "informative": "Create an objective, informative video script suitable for a news channel",
            "entertaining": "Create an engaging, entertaining script with a casual tone and some humor",
            "educational": "Create an educational script that explains concepts thoroughly",
            "dramatic": "Create a dramatic script with narrative tension and engagement"
        }
        
        style_instruction = styles.get(video_style, styles["informative"])
        
        prompt = f"""
        You are a professional video script writer. Based on the following trending news and social media content, 
        {style_instruction}. The script should:
        
        1. Have an engaging introduction with a hook
        2. Cover 3-5 main trending topics
        3. Include transitions between topics
        4. Provide relevant context and background
        5. End with a call to action or thought-provoking conclusion
        6. Be around 500-700 words (3-4 minutes when spoken)
        7. Include [VISUAL: description] notes for suggested visuals
        8. Include [MUSIC: mood] notes for background music suggestions
        
        CONTENT TO COVER:
        {context}
        
        FORMAT YOUR RESPONSE AS:
        TITLE: [Catchy video title]
        
        [Full video script with visual and music cues]
        """
        
        # Generate the script using the configured LLM
        script = await self.generate_script(prompt)
        
        return {
            "title": next((line.replace("TITLE:", "").strip() for line in script.split("\n") if line.startswith("TITLE:")), "Trending News Roundup"),
            "script": script
        }



# Step 3: Orchestrator
class VideoContentOrchestrator:
    def __init__(self, content_fetcher, script_generator):
        self.content_fetcher = content_fetcher
        self.script_generator = script_generator
    
    async def run(self, subreddits=None, news_topics=None, video_style="informative", content_limit=5):
        if subreddits is None:
            subreddits = ["technology", "science", "worldnews", "futurology"]
        
        if news_topics is None:
            news_topics = ["technology", "science"]
        
        print("🔍 Fetching trending content...")
        
        # Fetch content from Reddit and News API concurrently
        reddit_posts_task = asyncio.create_task(
            self.content_fetcher.fetch_trending_reddit_posts(subreddits, content_limit)
        )
        news_articles_task = asyncio.create_task(
            self.content_fetcher.fetch_news_api_headlines(news_topics, content_limit)
        )
        
        reddit_posts = await reddit_posts_task
        news_articles = await news_articles_task
        
        # Combine and prioritize content
        all_content = reddit_posts + news_articles
        
        # Sort by recency for news articles and by engagement for Reddit posts
        news_articles.sort(key=lambda x: x.get("created", ""), reverse=True)
        reddit_posts.sort(key=lambda x: x["score"] + x["comments"], reverse=True)
        
        # Take top items from each source to ensure diversity
        selected_content = []
        if news_articles:
            selected_content.extend(news_articles[:min(3, len(news_articles))])
        if reddit_posts:
            selected_content.extend(reddit_posts[:min(3, len(reddit_posts))])
        
        if not selected_content:
            raise ValueError("No content was fetched. Please check your API credentials.")
        
        print(f"📊 Collected {len(selected_content)} trending items")
        print("\nGenerating video script...")
        
        script_data = await self.script_generator.create_video_script(selected_content, video_style)
        
        print("\n✨ VIDEO SCRIPT GENERATED ✨")
        print(f"Title: {script_data['title']}")
        
        return {
            "title": script_data["title"],
            "script": script_data["script"],
            "source_content": selected_content
        }

# Helper function to initialize and run the system
async def generate_video_script(
    subreddits=None, 
    news_topics=None, 
    video_style="informative", 
    content_limit=5,
    reddit_client_id=None,
    reddit_client_secret=None,
    reddit_user_agent=None,
    news_api_key=None,
    openai_api_key=None
):
    """Generate a video script from trending Reddit posts and news articles."""
    # Setup API Clients
    reddit_client = setup_reddit_client(
        client_id=reddit_client_id,
        client_secret=reddit_client_secret,
        user_agent=reddit_user_agent
    )
    news_api_key = news_api_key or setup_news_api_client()
    
    # Configure LLM
    llm_config = {
        "model": "gpt-4-turbo",
        "api_key": openai_api_key or os.environ.get("OPENAI_API_KEY", ""),
        "temperature": 0.7,
        "max_tokens": 1500
    }
    
    # Initialize Agents
    content_fetcher = ContentFetcherAgent(
        name="ContentFetcher", 
        reddit_client=reddit_client,
        news_api_key=news_api_key
    )
    
    script_generator = VideoScriptGenerator(
        name="ScriptGenerator", 
        llm_config=llm_config
    )
    
    # Orchestrator to manage workflow
    orchestrator = VideoContentOrchestrator(content_fetcher, script_generator)
    
    # Run with provided parameters
    result = await orchestrator.run(
        subreddits=subreddits,
        news_topics=news_topics,
        video_style=video_style,
        content_limit=content_limit
    )
    
    return result

# For running as a standalone script
async def main():
    # Example usage
    subreddits = ["technology", "worldnews", "science", "todayilearned"]
    news_topics = ["technology", "science", "business"]
    
    try:
        result = await generate_video_script(
            subreddits=subreddits,
            news_topics=news_topics,
            video_style="entertaining"
        )
        
        # Save the full script to a file
        with open("video_script.txt", "w") as f:
            f.write(f"# {result['title']}\n\n")
            f.write(result['script'])
        print("📄 Full script saved to video_script.txt")
        
    except Exception as e:
        print(f"Error: {str(e)}")

# Run the workflow when executed directly
if __name__ == "__main__":
    asyncio.run(main())