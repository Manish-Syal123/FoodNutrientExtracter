import { useState, useEffect } from "react";
import axios from "axios";

const USDA_API_KEY = import.meta.env.VITE_USDA_API_KEY;

const NutrientExtractor = ({ foodData, setFoodNutrients }) => {
  const [nutrients, setNutrients] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (foodData && foodData[0]) {
      extractNutrients(foodData[0].label);
    }
  }, [foodData]);

  const extractNutrients = async (foodName) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `https://api.nal.usda.gov/fdc/v1/foods/search`,
        {
          params: {
            api_key: USDA_API_KEY,
            query: foodName,
            dataType: "Survey (FNDDS)",
          },
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        const searchData = response.data;

        if (!searchData.foods || searchData.foods.length === 0) {
          throw new Error("No nutritional information found for this food");
        }

        const food = searchData.foods[0];

        const nutrientData = {
          name: food.description,
          serving_size: food.servingSize ? `${food.servingSize}g` : "100g",
          calories:
            food.foodNutrients.find((n) => n.nutrientName === "Energy")
              ?.value || "N/A",
          total_fat:
            food.foodNutrients.find(
              (n) => n.nutrientName === "Total lipid (fat)"
            )?.value || "N/A",
          saturated_fat:
            food.foodNutrients.find(
              (n) => n.nutrientName === "Fatty acids, total saturated"
            )?.value || "N/A",
          cholesterol:
            food.foodNutrients.find((n) => n.nutrientName === "Cholesterol")
              ?.value || "N/A",
          sodium:
            food.foodNutrients.find((n) => n.nutrientName === "Sodium, Na")
              ?.value || "N/A",
          carbohydrates:
            food.foodNutrients.find(
              (n) => n.nutrientName === "Carbohydrate, by difference"
            )?.value || "N/A",
          fiber:
            food.foodNutrients.find(
              (n) => n.nutrientName === "Fiber, total dietary"
            )?.value || "N/A",
          sugar:
            food.foodNutrients.find(
              (n) => n.nutrientName === "Sugars, total including NLEA"
            )?.value || "N/A",
          protein:
            food.foodNutrients.find((n) => n.nutrientName === "Protein")
              ?.value || "N/A",
        };

        setNutrients(nutrientData);
        setFoodNutrients(nutrientData); // Pass nutrients to parent component
        console.log("Nutrient data extracted:", nutrientData);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "var(--space-4)",
          padding: "var(--space-8)",
        }}
      >
        <div className="loading-spinner"></div>
        <div className="loading-text">Fetching nutritional data...</div>
        <p
          style={{
            color: "var(--gray-500)",
            fontSize: "0.875rem",
            textAlign: "center",
            margin: "0",
          }}
        >
          Searching USDA database for detailed nutrition information
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>
          <strong>Unable to fetch nutrition data</strong>
          <br />
          {error}
        </div>
      </div>
    );
  }

  if (!nutrients) return null;

  const formatValue = (value, unit = "") => {
    if (value === "N/A" || value === null || value === undefined) {
      return "N/A";
    }
    const numValue = typeof value === "number" ? value : parseFloat(value);
    if (isNaN(numValue)) return "N/A";
    return `${numValue.toFixed(1)}${unit}`;
  };

  const nutritionItems = [
    {
      label: "Serving Size",
      value: nutrients.serving_size,
      icon: "📏",
      category: "basic",
    },
    {
      label: "Calories",
      value: formatValue(nutrients.calories, " kcal"),
      icon: "🔥",
      category: "energy",
      highlight: true,
    },
    {
      label: "Total Fat",
      value: formatValue(nutrients.total_fat, "g"),
      icon: "🥑",
      category: "macros",
    },
    {
      label: "Saturated Fat",
      value: formatValue(nutrients.saturated_fat, "g"),
      icon: "🧈",
      category: "fats",
    },
    {
      label: "Cholesterol",
      value: formatValue(nutrients.cholesterol, "mg"),
      icon: "❤️",
      category: "fats",
    },
    {
      label: "Sodium",
      value: formatValue(nutrients.sodium, "mg"),
      icon: "🧂",
      category: "minerals",
    },
    {
      label: "Carbohydrates",
      value: formatValue(nutrients.carbohydrates, "g"),
      icon: "🌾",
      category: "macros",
    },
    {
      label: "Fiber",
      value: formatValue(nutrients.fiber, "g"),
      icon: "🥬",
      category: "carbs",
    },
    {
      label: "Sugar",
      value: formatValue(nutrients.sugar, "g"),
      icon: "🍯",
      category: "carbs",
    },
    {
      label: "Protein",
      value: formatValue(nutrients.protein, "g"),
      icon: "💪",
      category: "macros",
    },
  ];

  return (
    <div className="fade-in">
      {/* Food Name */}
      <div
        style={{
          marginBottom: "var(--space-6)",
          textAlign: "center",
          padding: "var(--space-4)",
          background: "var(--primary-50)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--primary-200)",
        }}
      >
        <h4
          style={{
            margin: "0",
            fontSize: "1.125rem",
            fontWeight: "600",
            color: "var(--primary-800)",
            textTransform: "capitalize",
          }}
        >
          {nutrients.name}
        </h4>
        <p
          style={{
            margin: "var(--space-1) 0 0",
            fontSize: "0.875rem",
            color: "var(--primary-600)",
          }}
        >
          Nutritional information per serving
        </p>
      </div>

      {/* Nutrition Grid */}
      <div className="nutrients-table">
        <div
          style={{
            display: "grid",
            gap: "var(--space-3)",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          }}
        >
          {nutritionItems.map((item, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "var(--space-4)",
                background: item.highlight
                  ? "var(--success-50)"
                  : "var(--gray-50)",
                borderRadius: "var(--radius-lg)",
                border: `1px solid ${
                  item.highlight ? "var(--success-200)" : "var(--gray-200)"
                }`,
                transition: "all 0.2s ease",
              }}
              className="nutrient-row"
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-3)",
                }}
              >
                <span style={{ fontSize: "1.25rem" }}>{item.icon}</span>
                <span
                  className="nutrient-name"
                  style={{
                    fontWeight: "500",
                    color: "var(--gray-900)",
                    fontSize: "0.875rem",
                  }}
                >
                  {item.label}
                </span>
              </div>
              <span
                className="nutrient-value"
                style={{
                  fontWeight: "600",
                  color: item.highlight
                    ? "var(--success-700)"
                    : "var(--primary-700)",
                  fontSize: "0.875rem",
                }}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Nutrition Summary Cards */}
      <div
        style={{
          marginTop: "var(--space-8)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "var(--space-4)",
        }}
      >
        {/* Macros Summary */}
        <div
          style={{
            padding: "var(--space-4)",
            background: "var(--primary-50)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--primary-200)",
            textAlign: "center",
          }}
        >
          <h5
            style={{
              margin: "0 0 var(--space-2) 0",
              fontSize: "0.875rem",
              fontWeight: "600",
              color: "var(--primary-800)",
            }}
          >
            Macronutrients
          </h5>
          <div style={{ fontSize: "0.75rem", color: "var(--primary-600)" }}>
            <div>Carbs: {formatValue(nutrients.carbohydrates, "g")}</div>
            <div>Fat: {formatValue(nutrients.total_fat, "g")}</div>
            <div>Protein: {formatValue(nutrients.protein, "g")}</div>
          </div>
        </div>

        {/* Health Indicators */}
        <div
          style={{
            padding: "var(--space-4)",
            background: "var(--success-50)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--success-200)",
            textAlign: "center",
          }}
        >
          <h5
            style={{
              margin: "0 0 var(--space-2) 0",
              fontSize: "0.875rem",
              fontWeight: "600",
              color: "var(--success-800)",
            }}
          >
            Health Metrics
          </h5>
          <div style={{ fontSize: "0.75rem", color: "var(--success-600)" }}>
            <div>Fiber: {formatValue(nutrients.fiber, "g")}</div>
            <div>Sugar: {formatValue(nutrients.sugar, "g")}</div>
            <div>Sodium: {formatValue(nutrients.sodium, "mg")}</div>
          </div>
        </div>

        {/* Energy Info */}
        <div
          style={{
            padding: "var(--space-4)",
            background: "var(--warning-50)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--warning-200)",
            textAlign: "center",
          }}
        >
          <h5
            style={{
              margin: "0 0 var(--space-2) 0",
              fontSize: "0.875rem",
              fontWeight: "600",
              color: "var(--warning-800)",
            }}
          >
            Energy
          </h5>
          <div style={{ fontSize: "0.75rem", color: "var(--warning-600)" }}>
            <div style={{ fontSize: "1rem", fontWeight: "600" }}>
              {formatValue(nutrients.calories, " kcal")}
            </div>
            <div>Per {nutrients.serving_size}</div>
          </div>
        </div>
      </div>

      {/* Data Source */}
      <div
        style={{
          marginTop: "var(--space-6)",
          padding: "var(--space-3)",
          background: "var(--gray-50)",
          borderRadius: "var(--radius-md)",
          textAlign: "center",
          fontSize: "0.75rem",
          color: "var(--gray-500)",
        }}
      >
        <svg
          width="14"
          height="14"
          fill="currentColor"
          viewBox="0 0 24 24"
          style={{ marginRight: "var(--space-1)" }}
        >
          <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Data sourced from USDA Food Data Central
      </div>
    </div>
  );
};

export default NutrientExtractor;
