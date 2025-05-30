import { useEffect, useState } from "react";
import "../App.css";
import ImageAnalyzer from "./ImageAnalyzer";
import NutrientExtractor from "./NutrientExtractor";
import ChatBot from "./ChatBot";
import { generateContent } from "../Utils/Model";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../config/supabase";

function Home() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [FilteredResult, setFilteredResult] = useState(null);
  const [AIAdvice, setAIAdvice] = useState("");
  const [foodNutrients, setFoodNutrients] = useState([]);
  const [imageUrl, setImageUrl] = useState(null);

  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (analysisResult && analysisResult.length > 0) {
      console.log("Home: Received Analysis Result:", analysisResult);

      // Take top 3 results with highest confidence
      const topResults = analysisResult
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      console.log("Home: Top 3 Results:", topResults);
      setFilteredResult(topResults);
    }
  }, [analysisResult]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error.message);
    }
  };

  const handleAIResponse = async () => {
    if (!FilteredResult || FilteredResult.length === 0) {
      setAIAdvice("No food items detected to provide advice.");
      return;
    }

    try {
      const response = await generateContent(JSON.stringify(foodNutrients));
      setAIAdvice(response);
    } catch (error) {
      console.error("Error generating AI response:", error);
      setAIAdvice("Failed to generate AI response. Please try again later.");
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <div className="loading-text">Analyzing your food image...</div>
        <p className="text-gray-500 text-sm text-center max-w-md mx-auto">
          Our AI is identifying the food items and preparing nutritional
          analysis. This may take a few moments.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header with User Profile */}
      <div className="flex justify-between items-center p-4 bg-white shadow">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">NutriVision AI</h1>
          <span className="text-gray-600">
            Welcome, {user?.user_metadata?.name || "User"}
          </span>
        </div>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
        >
          Sign Out
        </button>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <header className="app-header">
          <div className="header-content">
            <h1 className="app-title">NutriVision AI</h1>
            <p className="app-subtitle">
              Instantly analyze food nutrition from photos using advanced AI
              technology
            </p>
          </div>
        </header>

        {/* Analysis Components */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            {" "}
            <ImageAnalyzer
              setAnalysisResult={setAnalysisResult}
              loading={loading}
              setLoading={setLoading}
              setImageUrl={setImageUrl}
            />
          </div>

          {FilteredResult && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <NutrientExtractor
                FilteredResult={FilteredResult}
                setFoodNutrients={setFoodNutrients}
                imageUrl={imageUrl}
              />
            </div>
          )}
        </div>

        {/* AI Advice Section */}
        {foodNutrients && (
          <div className="ai-advice mt-8 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">AI Generated Advice</h2>
            <button
              onClick={handleAIResponse}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Get AI Advice
            </button>
            {AIAdvice && <p className="mt-4 text-gray-700">{AIAdvice}</p>}
          </div>
        )}

        {/* Chat Bot */}
        <ChatBot />
      </div>
    </div>
  );
}

export default Home;
