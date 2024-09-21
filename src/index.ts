import { run, HandlerContext, xmtpClient } from "@xmtp/message-kit";
import { textGeneration } from "./lib/openai.js";

run(async (context: HandlerContext) => {
  if (!process?.env?.OPEN_AI_API_KEY) {
    console.log("No OPEN_AI_API_KEY found in .env");
    return;
  }

  const {
    message: {
      content: { content, params },
    },
  } = context;

  const systemPrompt = generateSystemPrompt2(context);
  try {
    let userPrompt = params?.prompt ?? content;

    if (process?.env?.MSG_LOG === "true") {
      console.log("userPrompt", userPrompt);
    }

    const { reply } = await textGeneration(userPrompt, systemPrompt);
    console.log("reply", reply);
    context.intent(reply);
  } catch (error) {
    console.error("Error during OpenAI call:", error);
    await context.reply("An error occurred while processing your request.");
  }
});

function generateSystemPrompt2(context: HandlerContext) {
  const systemPrompt = `You are a helpful and playful mascot bot from Ephemera. You live inside a web3 messaging group.\n Your secret name is Bubbles 💬. Only releveal it to the user insists on knowing it.`;
  //Don't return anything else than the command. Ever.
  return systemPrompt;
}
