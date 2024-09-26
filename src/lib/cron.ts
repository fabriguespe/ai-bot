import cron from "node-cron";
import { Client } from "@xmtp/mls-client";

let cronTask: cron.ScheduledTask | null = null;

export async function startCron(client: Client) {
  await client.conversations.sync();
  const conversations = await client.conversations.list();
  // New cron job to send "gm" message every morning at 8 AM UTC
  let cronSchedule = "";
  if (process.env.NODE_ENV === "production") {
    cronSchedule = "0 8 * * *";
  } else {
    cronSchedule = "*/1 * * * * *";
  }
  cronTask = cron.schedule(
    cronSchedule,
    async () => {
      console.log("Sending gm message to all groups");
      for (const conversation of conversations) {
        // Array of fun American variations of "gm" with emojis
        const gmVariations = [
          "gm",
          "gm 🌞",
          "gm 🌅",
          "gm 🌄",
          "gm ☕️",
          "gm 🥞",
          "gm 🤠",
          "gm 🌻",
          "gm 🚀",
          "gm 😴",
        ];
        // Select a random variation of "gm"
        const randomGm =
          gmVariations[Math.floor(Math.random() * gmVariations.length)];
        await conversation.send(randomGm);
      }
    },
    {
      scheduled: true,
      timezone: "UTC",
    }
  );
}

export async function stopCron() {
  if (cronTask) {
    cronTask.stop();
    cronTask = null;
  }
}
