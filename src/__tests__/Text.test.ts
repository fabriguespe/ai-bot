// src/__tests__/openai.test.ts
import { textGeneration } from "../lib/openai";

describe("textGeneration", () => {
  it("should generate a reply based on user and system prompts", async () => {
    const userPrompt = "Hello!";
    const systemPrompt = "You are a helpful bot.";

    const response = await textGeneration(userPrompt, systemPrompt);

    expect(response.reply).toBeDefined();
    expect(response.history).toHaveLength(3);
  });
});
