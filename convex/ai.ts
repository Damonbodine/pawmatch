import { action } from "./_generated/server";
import { v } from "convex/values";

const PROMPTS: Record<string, string> = {
  animalDescription:
    "You are an animal shelter adoption coordinator. Write a warm, engaging adoption profile that will help this animal find a home. Highlight personality traits, good matches, and any endearing qualities. Be honest about special needs. 100-200 words. Output only the profile text.",
  animalTemperament:
    "You are a shelter behavioral specialist. Describe this animal's temperament including energy level, sociability with people and animals, training status, and ideal home environment. Be specific and honest. 50-100 words. Output only the temperament text.",
  animalSpecialNeeds:
    "You are a shelter veterinary specialist. Document this animal's special needs for potential adopters. Include medical conditions, required medications, dietary needs, and accommodation requirements. Be factual and reassuring. Output only the special needs text.",
  reviewNotes:
    "You are an adoption counselor reviewing an application. Based on the applicant's information and the animal's needs, write a professional assessment of the match. Note strengths, concerns, and follow-up needed. Be fair and thorough. Output only the review notes.",
  personalStatement:
    "You are helping a potential pet adopter write a personal statement for their adoption application. Based on their living situation and experience, write a sincere statement explaining why they would be a great match. Write in first person. 100-200 words. Output only the statement text.",
  adoptionMatchScore:
    "You are an expert adoption compatibility analyst. Analyze the adopter's lifestyle and living situation against the animal's temperament, needs, and medical conditions. Return a JSON object with this exact structure: {\"score\": <number 1-100>, \"factors\": [{\"name\": \"<factor name>\", \"score\": <number 1-100>, \"detail\": \"<brief explanation>\"}], \"summary\": \"<2-3 sentence overall assessment>\"}. Factors to evaluate: Living Space, Experience Level, Household Compatibility, Activity Match, Special Needs Readiness. Output ONLY valid JSON, no other text.",
  animalBio:
    "You are an expert animal adoption copywriter. Write a compelling adoption listing for this animal based on the structured data provided. The tone should be: {tone}. Include personality highlights, ideal home description, and a heartfelt call to action. 150-250 words. Output only the bio text.",
  behavioralAssessment:
    "You are a certified animal behaviorist. Based on the animal's data and any behavioral observations, create a standardized behavioral profile. Return a JSON object with this exact structure: {\"sociability\": {\"rating\": \"<Low|Medium|High>\", \"detail\": \"<explanation>\"}, \"energyLevel\": {\"rating\": \"<Low|Medium|High>\", \"detail\": \"<explanation>\"}, \"trainingNeeds\": {\"rating\": \"<Minimal|Moderate|Significant>\", \"detail\": \"<explanation>\"}, \"idealHome\": \"<2-3 sentence description of the ideal home environment>\"}. Output ONLY valid JSON, no other text.",
  followUpEmail:
    "You are a compassionate adoption follow-up coordinator. Write a personalized 2-week check-in email for a new pet adopter. Reference the specific animal by name, mention any known medical needs or behavioral traits to watch for, and provide relevant care tips based on the adopter's living situation. Be warm, supportive, and practical. Include a greeting, body with specific tips, and a sign-off. 200-300 words. Output only the email text.",
};

export const generate = action({
  args: {
    fieldName: v.string(),
    context: v.any(),
  },
  handler: async (_ctx, args) => {
    const systemPrompt = PROMPTS[args.fieldName];
    if (!systemPrompt) {
      throw new Error(`Unknown field name: ${args.fieldName}`);
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY environment variable is not set");
    }

    const userMessage =
      typeof args.context === "string"
        ? args.context
        : JSON.stringify(args.context, null, 2);

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "nvidia/nemotron-3-super-120b-a12b:free",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
        }),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`OpenRouter API error ${response.status}: ${text}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content ?? "";
    return text.trim();
  },
});

async function callOpenRouter(systemPrompt: string, userMessage: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY environment variable is not set");
  }

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "nvidia/nemotron-3-super-120b-a12b:free",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenRouter API error ${response.status}: ${text}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content ?? "";
  return text.trim();
}

export const scoreAdoptionMatch = action({
  args: {
    animalData: v.any(),
    applicantData: v.any(),
  },
  handler: async (_ctx, args) => {
    const prompt = PROMPTS.adoptionMatchScore;
    const userMessage = JSON.stringify(
      { animal: args.animalData, applicant: args.applicantData },
      null,
      2
    );
    const result = await callOpenRouter(prompt, userMessage);
    try {
      return JSON.parse(result);
    } catch {
      return { score: 50, factors: [], summary: result };
    }
  },
});

export const generateAnimalBio = action({
  args: {
    animalData: v.any(),
    tone: v.union(v.literal("heartwarming"), v.literal("playful"), v.literal("dignified")),
  },
  handler: async (_ctx, args) => {
    const prompt = PROMPTS.animalBio.replace("{tone}", args.tone);
    const userMessage = JSON.stringify(args.animalData, null, 2);
    return await callOpenRouter(prompt, userMessage);
  },
});

export const generateBehavioralAssessment = action({
  args: {
    animalData: v.any(),
  },
  handler: async (_ctx, args) => {
    const prompt = PROMPTS.behavioralAssessment;
    const userMessage = JSON.stringify(args.animalData, null, 2);
    const result = await callOpenRouter(prompt, userMessage);
    try {
      return JSON.parse(result);
    } catch {
      return {
        sociability: { rating: "Medium", detail: result },
        energyLevel: { rating: "Medium", detail: "" },
        trainingNeeds: { rating: "Moderate", detail: "" },
        idealHome: "Could not parse assessment. Raw response: " + result,
      };
    }
  },
});

export const generateFollowUpEmail = action({
  args: {
    animalData: v.any(),
    applicantData: v.any(),
  },
  handler: async (_ctx, args) => {
    const prompt = PROMPTS.followUpEmail;
    const userMessage = JSON.stringify(
      { animal: args.animalData, adopter: args.applicantData },
      null,
      2
    );
    return await callOpenRouter(prompt, userMessage);
  },
});
