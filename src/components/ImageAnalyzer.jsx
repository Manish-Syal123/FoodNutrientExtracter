import { useState } from "react";
import axios from "axios";
import { supabase } from "../config/supabase";
import { useAuth } from "../context/AuthContext";

const HF_API_TOKEN = import.meta.env.VITE_HF_API_TOKEN;

const ImageAnalyzer = ({
  setAnalysisResult,
  loading,
  setLoading: setParentLoading,
  setImageUrl,
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewSrc, setPreviewSrc] = useState(null);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Function to determine if food is healthy based on analysis
  const determineHealthLabel = (analysisData) => {
    const healthyFoods = [
      "salad",
      "fruit",
      "vegetable",
      "fish",
      "chicken",
      "turkey",
      "quinoa",
      "yogurt",
      "eggs",
      "smoothie",
      "soup",
      "nuts",
    ];
    const unhealthyFoods = [
      "pizza",
      "burger",
      "fries",
      "cake",
      "ice cream",
      "candy",
      "chips",
      "soda",
      "donut",
      "fried",
    ];

    // Get the top result
    const topResult = analysisData[0]?.label.toLowerCase() || "";

    // Check if any healthy food keywords are in the result
    const isHealthy = healthyFoods.some((food) => topResult.includes(food));
    const isUnhealthy = unhealthyFoods.some((food) => topResult.includes(food));

    return isHealthy ? "Healthy" : isUnhealthy ? "UnHealthy" : "Unknown";
  };

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
    setParentLoading(true);
    setError(null);

    try {
      // 1. Upload image to Supabase Storage
      const filename = `${Date.now()}-${selectedFile.name}`;
      const filePath = `${user.id}/${filename}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("food-images")
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // 2. Get the public URL of the uploaded image
      const {
        data: { publicUrl },
      } = supabase.storage.from("food-images").getPublicUrl(filePath);

      // Update parent component's imageUrl state
      setImageUrl(publicUrl);

      // 3. Analyze image with Hugging Face DeiT model
      const arrayBuffer = await selectedFile.arrayBuffer();
      const base64String = btoa(
        new Uint8Array(arrayBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );

      const response = await fetch(
        "https://api-inference.huggingface.co/models/facebook/deit-base-distilled-patch16-224",
        {
          headers: {
            Authorization: `Bearer ${HF_API_TOKEN}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({ inputs: base64String }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const analysisData = await response.json();
      console.log("Raw DeiT Analysis Data:", analysisData);

      // The data is already in the correct format, just clean up the labels
      const formattedData = analysisData.map((item) => ({
        label: item.label.split(",")[0].trim(), // Take only the main label before any comma
        score: item.score,
      }));

      console.log("Formatted Analysis Data:", formattedData);

      // 4. Create initial FoodDetails entry with image info and health label
      const healthLabel = determineHealthLabel(formattedData);
      console.log("Health Label:", healthLabel);

      const { error: insertError } = await supabase.from("FoodDetails").insert([
        {
          id: user.id,
          created_at: new Date().toISOString().split("T")[0],
          imagelink: publicUrl,
          health_label: healthLabel,
        },
      ]);

      if (insertError) throw insertError;

      // 5. Set the analysis result to be used by NutrientExtractor
      setAnalysisResult(formattedData);
      console.log("Setting Analysis Result:", formattedData);
    } catch (err) {
      setError(err.message);
      console.error("Error in analyzeImage:", err);
    } finally {
      setParentLoading(false);
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

      {/* Preview Section */}
      {previewSrc && (
        <div
          style={{
            marginBottom: "1rem",
            textAlign: "center",
          }}
        >
          <img
            src={previewSrc}
            alt="Preview"
            style={{
              maxWidth: "100%",
              maxHeight: "300px",
              borderRadius: "0.5rem",
            }}
          />
        </div>
      )}

      {/* File Input and Analyze Button */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="file-input"
          style={{ display: "none" }}
          id="food-image-input"
        />
        <label
          htmlFor="food-image-input"
          className="custom-file-input"
          style={{
            padding: "0.75rem 1rem",
            backgroundColor: "var(--primary-600)",
            color: "white",
            borderRadius: "0.375rem",
            cursor: "pointer",
            textAlign: "center",
          }}
        >
          Select Image
        </label>
        <button
          onClick={analyzeImage}
          disabled={!selectedFile}
          style={{
            padding: "0.75rem 1rem",
            backgroundColor: !selectedFile
              ? "var(--gray-400)"
              : "var(--primary-600)",
            color: "white",
            border: "none",
            borderRadius: "0.375rem",
            cursor: !selectedFile ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Analyzing..." : "Analyze Image"}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div
          style={{
            marginTop: "1rem",
            padding: "1rem",
            backgroundColor: "var(--red-50)",
            color: "var(--red-700)",
            borderRadius: "0.375rem",
            textAlign: "center",
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
};

export default ImageAnalyzer;
