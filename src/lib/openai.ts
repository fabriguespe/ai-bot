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
    messages.push({
      role: "assistant",
      content: reply || "No response from OpenAI.",
    });
    const cleanedReply = reply
      ?.replace(/(\*\*|__)(.*?)\1/g, "$2")
      ?.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$2")
      ?.replace(/^#+\s*(.*)$/gm, "$1")
      ?.replace(/`([^`]+)`/g, "$1")
      ?.replace(/^`|`$/g, "");

    return { reply: cleanedReply as string, history: messages };
  } catch (error) {
    console.error("Failed to fetch from OpenAI:", error);
    throw error;
  }
}
