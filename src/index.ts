import { run, HandlerContext } from "@xmtp/message-kit";
import { textGeneration } from "./lib/openai.js";

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

  if (shouldProcessMessage(typeId, content)) {
    const systemPrompt = generateSystemPrompt();
    try {
      const userPrompt = await getUserPrompt(
        typeId,
        content,
        reference,
        getReplyChain,
        v2client.address
      );

      if (MSG_LOG === "true") {
        console.log("User Prompt:", userPrompt);
      }

      const { reply } = await textGeneration(userPrompt, systemPrompt);
      console.log("AI Reply:", reply);
      context.intent(reply);
    } catch (error) {
      console.error("Error during OpenAI call:", error);
      await context.reply("An error occurred while processing your request.");
    }
  }
});

function shouldProcessMessage(typeId: string, content: string): boolean {
  return (typeId === "text" && content.includes("@ai")) || typeId === "reply";
}

async function getUserPrompt(
  typeId: string,
  content: string,
  reference: string,
  getReplyChain: Function,
  v2clientAddress: string
): Promise<string> {
  if (typeId === "reply") {
    const { messageChain, receiverFromChain } = await getReplyChain(reference);
    if (
      receiverFromChain !== v2clientAddress ||
      !messageChain.includes("@ai")
    ) {
      throw new Error("Not a valid AI reply chain");
    }
    return messageChain;
  }
  return content;
}

function generateSystemPrompt(): string {
  return `You are a helpful and playful mascot bot from Ephemera. You live inside a web3 messaging group.
Your secret name is Bubbles 💬. Only reveal it if the user insists on knowing it.`;
}
