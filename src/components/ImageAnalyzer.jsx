import { useState } from "react";
import axios from "axios";

const HF_API_TOKEN = import.meta.env.VITE_HF_API_TOKEN;

const ImageAnalyzer = ({ onAnalysisComplete, onLoading }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewSrc, setPreviewSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewSrc(reader.result);
      };
      reader.readAsDataURL(file);
      //   analyzeImage(file); // Automatically analyze when file is selected
    } else {
      setError("Please select a valid image file");
      setSelectedFile(null);
      setPreviewSrc(null);
    }
  };

  const analyzeImage = async () => {
    if (!selectedFile) {
      setError("Please select an image first");
      return;
    }

    setLoading(true);
    onLoading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.readAsArrayBuffer(selectedFile);

      reader.onloadend = async () => {
        const arrayBuffer = reader.result;
        const blob = new Blob([arrayBuffer], { type: "image/jpeg" });

        const response = await axios.post(
          "https://api-inference.huggingface.co/models/nateraw/food",
          blob,
          {
            headers: {
              Authorization: `Bearer ${HF_API_TOKEN}`,
              "Content-Type": "image/jpeg",
            },
          }
        );

        if (response.status === 200) {
          onAnalysisComplete(response.data);
          console.log("Analysis Result:", response.data);
        }
      };
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      onLoading(false);
    }
  };

  return (
    <div>
      <div className="upload-section">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="file-input"
        />
      </div>

      {previewSrc && (
        <div className="preview-section">
          <img src={previewSrc} alt="Preview" className="preview-image" />
        </div>
      )}

      {error && <div className="error-message">{error}</div>}
      <button
        onClick={analyzeImage}
        disabled={!selectedFile || loading}
        className="analyze-btn"
      >
        {loading ? "Analyzing..." : "Analyze"}
      </button>
      {/* {loading && <div className="loading-message">Analyzing image...</div>} */}
    </div>
  );
};

export default ImageAnalyzer;
