import { useEffect, useState } from "react";
import "./App.css";
import ImageAnalyzer from "./components/ImageAnalyzer";
import NutrientExtractor from "./components/NutrientExtractor";

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [FilteredResult, setFilteredResult] = useState(null);

  useEffect(() => {
    if (analysisResult && analysisResult.length > 0) {
      const result = analysisResult.filter(
        (item) => (item.score * 100).toFixed(2) >= 95
      );
      setFilteredResult(result);
      console.log("Analysis Result:", analysisResult);
      console.log("Filtered Analysis Result:", result);
    }
  }, [analysisResult]);

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <div className="loading-text">Analyzing your food image...</div>
        <p
          style={{
            color: "var(--gray-500)",
            fontSize: "0.875rem",
            textAlign: "center",
            maxWidth: "400px",
          }}
        >
          Our AI is identifying the food items and preparing nutritional
          analysis. This may take a few moments.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header Section */}
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">NutriVision AI</h1>
          <p className="app-subtitle">
            Instantly analyze food nutrition from photos using advanced AI
            technology
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="container">
        {/* Upload Section */}
        <div className="upload-card fade-in">
          <ImageAnalyzer
            onAnalysisComplete={setAnalysisResult}
            onLoading={setLoading}
          />
        </div>

        {/* Results Section */}
        {FilteredResult && FilteredResult.length > 0 ? (
          <div className="results-container slide-up">
            {/* Detection Results */}
            <div className="result-section">
              <h3 className="section-title">
                <svg
                  className="section-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Food Detection Results
              </h3>
              <div className="results-grid">
                {FilteredResult.map((item, index) => (
                  <div key={index} className="result-item">
                    <div className="result-label">{item.label}</div>
                    <div className="result-score">
                      <svg
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="confidence-badge">
                        {(item.score * 100).toFixed(1)}% confidence
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Nutrition Information */}
            <div className="nutrients-section">
              <h3 className="section-title">
                <svg
                  className="section-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                Nutritional Information
              </h3>
              <NutrientExtractor foodData={analysisResult} />
            </div>
          </div>
        ) : (
          analysisResult && (
            <div className="no-results fade-in">
              <svg
                width="48"
                height="48"
                fill="currentColor"
                viewBox="0 0 24 24"
                style={{
                  margin: "0 auto 1rem",
                  display: "block",
                  color: "var(--warning-500)",
                }}
              >
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 style={{ margin: "0 0 0.5rem", color: "var(--warning-700)" }}>
                No Food Items Detected
              </h3>
              <p>
                We couldn't identify any food items with high confidence in this
                image.
              </p>
              <p>
                Please try uploading a clearer image with better lighting and
                focus on the food.
              </p>
              <div
                style={{
                  marginTop: "1.5rem",
                  padding: "1rem",
                  background: "var(--warning-100)",
                  borderRadius: "var(--radius-md)",
                  fontSize: "0.875rem",
                }}
              >
                <strong>Tips for better results:</strong>
                <ul
                  style={{
                    textAlign: "left",
                    margin: "0.5rem 0 0",
                    paddingLeft: "1.25rem",
                  }}
                >
                  <li>Ensure good lighting</li>
                  <li>Focus clearly on the food</li>
                  <li>Avoid cluttered backgrounds</li>
                  <li>Show the food from a clear angle</li>
                </ul>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default App;
