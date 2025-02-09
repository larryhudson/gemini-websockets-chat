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

// Tool declaration
export const noteTools: Tool = {
  functionDeclarations: [
    {
      name: "save_note",
      description: "Save a note to localStorage",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          content: {
            type: SchemaType.STRING,
            description: "The content of the note to save",
          },
        },
        required: ["content"],
      },
    },
    {
      name: "get_notes",
      description: "Retrieve all saved notes from localStorage",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {},
      },
    },
  ],
};

// Tool execution function
export const executeNoteTool = (toolCall: { name: string; args: any }): ResponseObject => {
  let response = { result: {} };

  switch (toolCall.name) {
    case "save_note": {
      const args = toolCall.args as SaveNoteArgs;
      const notes: NoteItem[] = JSON.parse(localStorage.getItem("notes") || "[]");
      const newNote: NoteItem = {
        id: Date.now(),
        content: args.content,
        timestamp: new Date().toISOString(),
      };
      notes.push(newNote);
      localStorage.setItem("notes", JSON.stringify(notes));
      response.result = { success: true, message: "Note saved successfully" };
      break;
    }
    case "get_notes": {
      const notes: NoteItem[] = JSON.parse(localStorage.getItem("notes") || "[]");
      response.result = { notes };
      break;
    }
    default:
      throw new Error(`Unknown tool: ${toolCall.name}`);
  }

  return {
    name: toolCall.name,
    response,
  };
};
