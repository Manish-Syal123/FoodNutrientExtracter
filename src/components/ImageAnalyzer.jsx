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
    <div className="upload-section">
      {/* Upload Instructions */}
      <div style={{ textAlign: "center", marginBottom: "var(--space-6)" }}>
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: "700",
            color: "var(--gray-900)",
            margin: "0 0 var(--space-2) 0",
          }}
        >
          Upload Food Image
        </h2>
        <p
          style={{
            color: "var(--gray-600)",
            margin: "0",
            fontSize: "1rem",
          }}
        >
          Take a photo or upload an image of your food to get instant
          nutritional analysis
        </p>
      </div>

      {/* File Upload Area */}
      <div className="file-input-wrapper">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="file-input"
          id="food-image-input"
        />
        <label htmlFor="food-image-input" className="file-input-label">
          <svg
            className="upload-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          {selectedFile ? selectedFile.name : "Choose image or drag & drop"}
        </label>
      </div>

      {/* Image Preview */}
      {previewSrc && (
        <div className="preview-section fade-in">
          <img src={previewSrc} alt="Food preview" className="preview-image" />
          <div
            style={{
              marginTop: "var(--space-4)",
              padding: "var(--space-3)",
              background: "var(--success-50)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--success-200)",
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              justifyContent: "center",
            }}
          >
            <svg
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 24 24"
              style={{ color: "var(--success-600)" }}
            >
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span
              style={{
                color: "var(--success-700)",
                fontWeight: "500",
                fontSize: "0.875rem",
              }}
            >
              Image uploaded successfully
            </span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {error}
        </div>
      )}

      {/* Analyze Button */}
      <button
        onClick={analyzeImage}
        disabled={!selectedFile || loading}
        className="btn btn-primary analyze-btn"
      >
        {loading ? (
          <>
            <div
              style={{
                width: "16px",
                height: "16px",
                border: "2px solid transparent",
                borderTop: "2px solid currentColor",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            ></div>
            Analyzing...
          </>
        ) : (
          <>
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Analyze Food
          </>
        )}
      </button>

      {/* Features List */}
      {!selectedFile && (
        <div
          style={{
            marginTop: "var(--space-8)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "var(--space-4)",
            textAlign: "left",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "var(--space-3)",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                background: "var(--primary-100)",
                borderRadius: "var(--radius-md)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 24 24"
                style={{ color: "var(--primary-600)" }}
              >
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h4
                style={{
                  margin: "0 0 var(--space-1) 0",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  color: "var(--gray-900)",
                }}
              >
                AI-Powered Detection
              </h4>
              <p
                style={{
                  margin: "0",
                  fontSize: "0.75rem",
                  color: "var(--gray-600)",
                }}
              >
                Advanced machine learning identifies food items with high
                accuracy
              </p>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "var(--space-3)",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                background: "var(--success-100)",
                borderRadius: "var(--radius-md)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 24 24"
                style={{ color: "var(--success-600)" }}
              >
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4
                style={{
                  margin: "0 0 var(--space-1) 0",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  color: "var(--gray-900)",
                }}
              >
                Instant Results
              </h4>
              <p
                style={{
                  margin: "0",
                  fontSize: "0.75rem",
                  color: "var(--gray-600)",
                }}
              >
                Get comprehensive nutritional information in seconds
              </p>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "var(--space-3)",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                background: "var(--warning-100)",
                borderRadius: "var(--radius-md)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 24 24"
                style={{ color: "var(--warning-600)" }}
              >
                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h4
                style={{
                  margin: "0 0 var(--space-1) 0",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  color: "var(--gray-900)",
                }}
              >
                Detailed Nutrition
              </h4>
              <p
                style={{
                  margin: "0",
                  fontSize: "0.75rem",
                  color: "var(--gray-600)",
                }}
              >
                Complete breakdown of calories, macros, and micronutrients
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageAnalyzer;
