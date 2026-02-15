import { GoogleGenAI, Type } from "@google/genai";
import { User, Chore, Expense } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = "gemini-3-flash-preview";

export const generateChoreSchedule = async (
  users: User[],
  tasks: string[]
): Promise<{ title: string; assignedToName: string; frequency: string }[]> => {
  try {
    const prompt = `
      Assign the following household tasks fairly among these roommates: ${users.map(u => u.name).join(', ')}.
      Tasks: ${tasks.join(', ')}.
      Return a JSON array where each object has 'title', 'assignedToName', and 'frequency' (Weekly).
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              assignedToName: { type: Type.STRING },
              frequency: { type: Type.STRING },
            },
          },
        },
      },
    });

    const jsonStr = response.text || "[]";
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error generating chores:", error);
    return [];
  }
};

export const analyzeExpenses = async (expenses: Expense[], users: User[]): Promise<string> => {
  try {
    const expenseSummary = expenses.map(e => 
      `${e.description}: $${e.amount} (Category: ${e.category}, Paid by: ${users.find(u => u.id === e.paidBy)?.name})`
    ).join('\n');

    const prompt = `
      Analyze these household expenses and provide a brief, friendly summary (max 3 sentences). 
      Identify who has paid the most and if there are any spending trends.
      Expenses:
      ${expenseSummary}
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    return response.text || "Unable to analyze expenses at this time.";
  } catch (error) {
    console.error("Error analyzing expenses:", error);
    return "AI service temporarily unavailable.";
  }
};

export const draftAnnouncement = async (topic: string, tone: string): Promise<string> => {
  try {
    const prompt = `Write a short house announcement about "${topic}". The tone should be ${tone}. Keep it under 50 words.`;
    
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    return response.text || "";
  } catch (error) {
    return "Error generating announcement.";
  }
};

export const draftPollProposal = async (idea: string): Promise<string> => {
  try {
    const prompt = `Rewrite this household proposal to be neutral, clear, and persuasive for a vote: "${idea}". Keep it under 20 words.`;
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    return response.text || idea;
  } catch (error) {
    return idea;
  }
};

export const categorizeShoppingItem = async (item: string): Promise<string> => {
  try {
    const prompt = `
      Categorize the shopping item "${item}" into exactly one of these categories:
      - Snacks
      - Canned Goods
      - Fresh Produce
      - Meat and Fish
      - Household Items
      
      Return ONLY the category name.
    `;
    
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    
    const text = response.text?.trim() || "";
    if (text.includes("Snack")) return "Snacks";
    if (text.includes("Canned")) return "Canned Goods";
    if (text.includes("Produce")) return "Fresh Produce";
    if (text.includes("Meat") || text.includes("Fish")) return "Meat and Fish";
    if (text.includes("Household")) return "Household Items";
    
    return "Household Items";
  } catch (error) {
    return "Household Items";
  }
};
