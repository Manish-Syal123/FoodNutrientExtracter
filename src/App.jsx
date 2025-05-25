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
    return <div className="loading">Analyzing image...</div>;
  }
  return (
    <div className="container">
      <h2>Food Nutrients Extracter</h2>
      <p>Upload an image of food item</p>

      <ImageAnalyzer
        onAnalysisComplete={setAnalysisResult}
        onLoading={setLoading}
      />

      {FilteredResult && FilteredResult.length > 0 ? (
        <>
          <div className="result-section">
            <h3>Analysis Results:</h3>
            <div className="results-grid">
              {FilteredResult.map((item, index) => (
                <div key={index} className="result-item">
                  <span className="label">{item.label}</span>
                  <span className="score">
                    {(item.score * 100).toFixed(2)}% confidence
                  </span>
                </div>
              ))}
            </div>
          </div>

          <NutrientExtractor foodData={analysisResult} />
        </>
      ) : (
        analysisResult && (
          <div className="no-results">
            <p>No food items detected or confidence too low.</p>
            <p>Please try uploading a cleaner image.</p>
          </div>
        )
      )}
    </div>
  );
}

export default App;
