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
