import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// const prompt = `You are a Food Detection and Nutrition Analysis AI. Your task is to analyze nutritional of food and provide detailed information about the food. You should also be able to answer questions about food items based on the nutritional details of the food provided.
// Nutritional information of the food item is provided in the following format:
// \n
// ${data}
// \n
// You will not provide any additional information or context outside of the nutritional details provided. You will only respond with the nutritional details of the food item and answer questions based on the nutritional details provided.
// `;
export const generateContent = async (data) => {
  const prompt = `You are a Food Detection and Nutrition Analysis AI. Your task is to analyze nutritional of food and provide detailed information about the food. Nutritional information of the food item is:
    \n
${data}
    \n
    Tell the user about the food item, its nutritional value, and any health benefits or concerns associated with it.
    Tell the Pros and Cons of the food item based on the nutritional details provided. 
    `;
  const result = await model.generateContent(prompt);
  console.log(result.response.text());
  return result.response.text; // return the response
};
