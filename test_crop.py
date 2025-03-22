import requests
import sys
import os

def test_crop_endpoint(video_path):
    if not os.path.exists(video_path):
        print(f"Error: File {video_path} does not exist.")
        return
    
    url = "http://localhost:8000/crop/convert"
    
    try:
        with open(video_path, "rb") as video_file:
            files = {"file": (os.path.basename(video_path), video_file, "video/mp4")}
            print(f"Sending {video_path} to {url}...")
            response = requests.post(url, files=files)
        
        if response.status_code == 200:
            result = response.json()
            print("Success!")
            print(f"Output file: {result.get('output_file')}")
        else:
            print(f"Error: Status code {response.status_code}")
            print(response.text)
    
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python test_crop.py /path/to/video.mp4")
    else:
        test_crop_endpoint(sys.argv[1])