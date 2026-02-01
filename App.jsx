import React, { useState } from 'react';
import axios from 'axios';
import { Download, Sparkles, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import './App.css';

function App() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateImage = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    const finalPrompt = style ? `${style}, ${prompt}` : prompt;

    try {
      const res = await axios.post("http://localhost:8000/generate", { prompt: finalPrompt });
        
      
      setImage(res.data.image);
      setError(null);
    } catch (err) {
      console.error("Error:", err);
      
      if (err.code === 'ECONNABORTED') {
        setError("Request timed out. The model might be loading. Try again.");
      } else if (err.response) {
        setError(err.response.data.detail || "Failed to generate image.");
      } else if (err.request) {
        setError("Cannot connect to backend. Is the server running on port 8000?");
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!image) return;
    const link = document.createElement("a");
    link.href = image;
    link.download = `ai-art-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      generateImage();
    }
  };

  return (
    <div className="app-container">
      <div className="card">
        <div className="header">
          <h1>✨ Visionary AI Studio</h1>
          <p style={{color: '#94a3b8', fontSize: '0.9rem', marginTop: '8px'}}>
            Create professional AI art in seconds
          </p>
        </div>

        <div className="input-section">
          <textarea 
            placeholder="Describe your imagination..." 
            rows="3"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          
          <select 
            value={style} 
            onChange={(e) => setStyle(e.target.value)}
            disabled={loading}
          >
            <option value="">No Style (Default)</option>
            <option value="Cinematic, 8k, highly detailed, photorealistic">Cinematic Realistic</option>
            <option value="Digital art, anime style, vibrant colors">Anime / Manga</option>
            <option value="Cyberpunk style, neon lights, futuristic">Cyberpunk</option>
            <option value="Oil painting, thick brushstrokes, classical art">Oil Painting</option>
            <option value="Watercolor, soft colors, artistic">Watercolor</option>
          </select>

          <button 
            className="gen-btn" 
            onClick={generateImage} 
            disabled={loading || !prompt.trim()}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="spin" />
                Creating...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generate Artwork
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="display-area">
          {image ? (
            <>
              <img src={image} alt="AI Generated" className="result-img" />
              <button className="download-float" onClick={downloadImage}>
                <Download size={16} /> Save
              </button>
            </>
          ) : (
            <div style={{textAlign: 'center', color: '#475569'}}>
              <ImageIcon size={48} style={{opacity: 0.2, marginBottom: '10px'}} />
              <p>
                {loading ? "🎨 AI is creating your masterpiece..." : "Enter a prompt to begin"}
              </p>
              {loading && (
                <p style={{fontSize: '0.85rem', marginTop: '8px', color: '#64748b'}}>
                  This may take 10-30 seconds
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;