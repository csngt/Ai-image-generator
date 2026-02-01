import os
import base64
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# NEW CORRECT ENDPOINT - router.huggingface.co
API_URL = "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev"
HF_TOKEN = os.getenv('HF_TOKEN', '').strip()

if not HF_TOKEN:
    print("WARNING: HF_TOKEN not found in .env file!")

headers = {"Authorization": f"Bearer {HF_TOKEN}"}

# Request model
class ImageRequest(BaseModel):
    prompt: str

# Root endpoint
@app.get("/")
def root():
    return {
        "status": "online",
        "message": "AI Image Generator is running",
        "endpoints": ["/", "/generate"],
        "model": "FLUX.1-dev"
    }

# Generate image endpoint
@app.post("/generate")
def generate_image(request: ImageRequest):
    try:
        print(f"\n🎨 Generating: {request.prompt}")
        
        # Make request to Hugging Face
        response = requests.post(
            API_URL,
            headers=headers,
            json={"inputs": request.prompt},
            timeout=120
        )
        
        print(f"📡 Status: {response.status_code}")
        
        # Handle different responses
        if response.status_code == 503:
            raise HTTPException(
                status_code=503,
                detail="Model is loading. Wait 30 seconds and try again."
            )
        elif response.status_code == 401:
            raise HTTPException(
                status_code=401,
                detail="Invalid token. Check your .env file."
            )
        elif response.status_code == 410:
            raise HTTPException(
                status_code=410,
                detail="This model endpoint is deprecated. Using alternative."
            )
        elif response.status_code != 200:
            error_msg = response.text
            print(f"❌ Error: {error_msg}")
            raise HTTPException(
                status_code=response.status_code,
                detail=error_msg
            )
        
        # Convert to base64
        image_base64 = base64.b64encode(response.content).decode('utf-8')
        print("✅ Success!\n")
        
        return {"image": f"data:image/png;base64,{image_base64}"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"💥 Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Run the app
if __name__ == "__main__":
    import uvicorn
    print("\n" + "="*50)
    print("🚀 AI Image Generator Backend")
    print("="*50)
    print(f"🌐 Server: http://localhost:8000")
    print(f"📋 Model: FLUX.1-dev (Hugging Face)")
    print(f"🔑 Token: {'✅ Found' if HF_TOKEN else '❌ Missing'}")
    print("="*50 + "\n")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
