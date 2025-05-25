import { useState, useEffect } from "react";
import axios from "axios";

const USDA_API_KEY = import.meta.env.VITE_USDA_API_KEY;

const NutrientExtractor = ({ foodData }) => {
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
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return <div className="loading-message">Extracting nutrients...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!nutrients) return null;

  return (
    <div className="nutrients-table">
      <h3>Nutritional Information</h3>
      <table>
        <thead>
          <tr>
            <th>Nutrient</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Serving Size</td>
            <td>{nutrients.serving_size || "N/A"}</td>
          </tr>
          <tr>
            <td>Calories</td>
            <td>{nutrients.calories || "N/A"}</td>
          </tr>
          <tr>
            <td>Total Fat</td>
            <td>{nutrients.total_fat || "N/A"}</td>
          </tr>
          <tr>
            <td>Saturated Fat</td>
            <td>{nutrients.saturated_fat || "N/A"}</td>
          </tr>
          <tr>
            <td>Cholesterol</td>
            <td>{nutrients.cholesterol || "N/A"}</td>
          </tr>
          <tr>
            <td>Sodium</td>
            <td>{nutrients.sodium || "N/A"}</td>
          </tr>
          <tr>
            <td>Carbohydrates</td>
            <td>{nutrients.carbohydrates || "N/A"}</td>
          </tr>
          <tr>
            <td>Fiber</td>
            <td>{nutrients.fiber || "N/A"}</td>
          </tr>
          <tr>
            <td>Sugar</td>
            <td>{nutrients.sugar || "N/A"}</td>
          </tr>
          <tr>
            <td>Protein</td>
            <td>{nutrients.protein || "N/A"}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default NutrientExtractor;
