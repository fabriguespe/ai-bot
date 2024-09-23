import { run, HandlerContext } from "@xmtp/message-kit";
import { textGeneration } from "./lib/openai.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

run(async (context: HandlerContext) => {
  const { OPEN_AI_API_KEY, MSG_LOG } = process.env;

  if (!OPEN_AI_API_KEY) {
    console.log("No OPEN_AI_API_KEY found in environment variables");
    return;
  }

  const {
    message: {
      typeId,
      content: { content, reference },
    },
    v2client,
    getReplyChain,
  } = context;

  if (await shouldProcessMessage(context)) {
    console.log("entra");
    const filePath = path.resolve(__dirname, "../src/nash.md");
    const nashville = fs.readFileSync(filePath, "utf8");
    const systemPrompt = generateSystemPrompt() + nashville;

    try {
      const userPrompt = content.content ?? content;

      if (MSG_LOG === "true") {
        console.log("User Prompt:", userPrompt);
      }

      const { reply } = await textGeneration(userPrompt, systemPrompt);

      context.intent(reply);
    } catch (error) {
      console.error("Error during OpenAI call:", error);
      await context.reply("An error occurred while processing your request.");
    }
  }
});

async function shouldProcessMessage(context: HandlerContext): Promise<boolean> {
  const {
    message: {
      typeId,
      content: { content, reference },
    },
    v2client,
    getReplyChain,
  } = context;

  if (typeId === "text" && content.includes("@ai")) return true;
  else if (typeId === "reply") {
    const { messageChain, receiverFromChain, isReceiverInChain } =
      await getReplyChain(reference, v2client.address);
    console.log(messageChain, isReceiverInChain);
    return isReceiverInChain || messageChain.includes("@ai");
  }
  return false;
}

function generateSystemPrompt(): string {
  return `You are a helpful and playful mascot bot from Ephemera. You live inside a web3 messaging group.
Your secret name is Bubbles 💬. Only reveal it if the user insists on knowing it.`;
}
