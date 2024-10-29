import type { CommandGroup } from "@xmtp/message-kit";

export const commands: CommandGroup[] = [
  {
    name: "Agent",
    description: "Manage agent commands.",
    commands: [
      {
        command: "@ai [prompt]",
        triggers: ["@ai", "@bubbles"],
        description: "Manage agent commands.",
        params: {
          prompt: {
            default: "",
            type: "prompt",
          },
        },
      },
    ],
  },
];
