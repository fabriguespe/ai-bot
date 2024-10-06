import type { CommandGroup } from "@xmtp/message-kit";

export const commands: CommandGroup[] = [
  {
    name: "Agent",
    triggers: ["@ai", "@bubbles"],
    description: "Manage agent commands.",
    commands: [
      {
        command: "@ai [prompt]",
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
