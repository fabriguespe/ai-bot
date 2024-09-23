import dotenv from "dotenv";
dotenv.config();
import OpenAI from "openai";
const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});

export async function textGeneration(userPrompt: string, systemPrompt: string) {
  let messages = [];
  messages.push({
    role: "system",
    content: systemPrompt,
  });
  messages.push({
    role: "user",
    content: userPrompt,
  });
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages as any,
    });
    const reply = response.choices[0].message.content;
    const cleanedReply = reply
      ?.replace(/(\*\*|__)(.*?)\1/g, "$2") // Remove bold
      ?.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$2") // Keep URL instead of link text
      ?.replace(/^#+\s*(.*)$/gm, "$1") // Remove titles
      ?.replace(/`([^`]+)`/g, "$1"); // Remove inline code

    messages.push({
      role: "assistant",
      content: cleanedReply || "No response from OpenAI.",
    });
    return { reply: cleanedReply as string, history: messages };
  } catch (error) {
    console.error("Failed to fetch from OpenAI:", error);
    throw error;
  }
}
