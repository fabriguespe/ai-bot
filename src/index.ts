import { run, HandlerContext } from "@xmtp/message-kit";
import { textGeneration } from "./lib/openai.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { startCron, stopCron } from "./lib/cron.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let clientInitialized = false;

run(async (context: HandlerContext) => {
  const { OPEN_AI_API_KEY, MSG_LOG } = process.env;

  if (!OPEN_AI_API_KEY) {
    console.log("No OPEN_AI_API_KEY found in environment variables");
    return;
  }

  const {
    message: {
      content: { content, reference },
    },
  } = context;

  if (await shouldProcessMessage(context)) {
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
    group,
    getReplyChain,
    version,
  } = context;
  //@bubbles

  if (
    !group &&
    !clientInitialized &&
    context?.message?.content?.content?.includes("gm")
  ) {
    startCron(context.client);
    clientInitialized = true;
    return true;
  } else if (
    !group &&
    clientInitialized &&
    context?.message?.content?.content?.includes("stop")
  ) {
    stopCron();
    clientInitialized = true;
    return true;
  } else if (!group) return true;
  else if (typeId === "text" && content.includes("@ai")) return true;
  else if (typeId === "reply") {
    const { content: reply } = context.message;
    const { chain } = await getReplyChain(reference, version, v2client.address);

    let userPrompt = `The following is a conversation history. \nMessage History:\n${chain
      .map((c) => c.content)
      .join("\n")}\nLatest reply: ${reply}`;

    return userPrompt.includes("@ai");
  }
  return false;
}

function generateSystemPrompt(): string {
  const systemPrompt = `You are a helpful and playful mascot bot called Bubbles from Ephemera that will assist the user with their request for the Nashville Offsite. `;

  const language =
    "### Important\n" +
    "- Keep it simple and short.\n" +
    `- You live in Nashville, TN. Current time: ${new Date().toLocaleTimeString(
      "en-US",
      {
        weekday: "long",
      }
    )}\n` +
    "- Always answer in first person.\n" +
    "- Never mention users\n" +
    "- Be aware of your timezone and sleep needs.\n" +
    "- Dont use markdown.\n" +
    "- Never mention speakers or people related to the event outside explicitly asking for it.\n" +
    "- Only provide answers based on verified information. If the data or facts are unknown or unclear, respond with 'I do not know' or request further clarification from the user. " +
    "- Do not make guesses or assumptions";

  const experiences =
    "### Experiences:\nWordle Game: https://framedl.xyz. Only send the game url when asked.\n\n ENS Domain Registration and Checking Tool: https://ens.steer.fun/. Only send the tool url when asked.\n\n ";

  return systemPrompt + language + experiences;
}
