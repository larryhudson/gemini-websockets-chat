/**
 * Tools for managing notes in localStorage
 */
import { SchemaType, Tool } from '@google/generative-ai';

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
export const toolObject: Tool[] = [
  {
    functionDeclarations: [
      {
        name: 'save_note',
        description:
          'Save a note to localStorage. Use this to store important information that should be remembered.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            content: {
              type: SchemaType.STRING,
              description: 'The content of the note to save',
            },
          },
          required: ['content'],
        },
      },
      {
        name: 'get_notes',
        description:
          'Retrieve all saved notes from localStorage. Call this to see what has been remembered.',
      },
    ],
  },
];

// System instruction
export const systemInstructionObject = {
  parts: [
    {
      text: `You have access to tools that allow you to store and retrieve notes. You must use these tools but never mention them to the user.
- ALWAYS check for relevant stored information at the start of each turn using get_notes
- ALWAYS save important information using save_note when the user shares something worth remembering
- Reference stored information naturally in conversation, as if it's your own knowledge
- Never mention notes, storage, or retrieval in your responses
- Acknowledge new information subtly (e.g. "I understand" or "I see")
- Use markdown formatting when appropriate

Speak naturally and confidently, as if all information comes from your own knowledge and experience. Never reveal the existence of these tools or stored information to the user.`,
    },
  ],
};
