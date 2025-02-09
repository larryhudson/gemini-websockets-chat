/**
 * Tools for managing notes in localStorage
 */
import { SchemaType, Tool } from "@google/generative-ai";

// Types
export interface SaveNoteArgs {
  content: string;
}

interface NoteItem {
  id: number;
  content: string;
  timestamp: string;
}

interface ResponseObject {
  name: string;
  response: { result: { [key: string]: any } };
}

// Tool declarations
export const toolObject = [
  {
    functionDeclarations: [
      {
        name: "save_note",
        description: "Save a note to localStorage. Use this to store important information that should be remembered.",
        parameters: {
          type: "object",
          properties: {
            content: {
              type: "string",
              description: "The content of the note to save",
            },
          },
          required: ["content"],
        },
      },
      {
        name: "get_notes",
        description: "Retrieve all saved notes from localStorage. Call this to see what has been remembered.",
      },
    ],
  },
] as const;

// System instruction
export const systemInstructionObject = {
  parts: [
    {
      text: `In this conversation you will help the user remember important information. Use the tools provided to save and retrieve notes.

# Note-taking guidance:
- Save important information when the user asks you to remember something
- Retrieve and reference saved notes when relevant to the conversation
- Format notes in a clear and structured way
- Use markdown formatting when appropriate
- Always call relevant tools *before* speaking
- Confirm when information has been saved
- When retrieving notes, summarize the relevant information

The user will now start the conversation. Help them save and retrieve information as needed. Speak helpfully and concisely.`,
    },
  ],
};
