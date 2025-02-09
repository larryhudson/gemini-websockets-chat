/**
 * Tools for managing notes in localStorage
 */
import { SchemaType, Tool } from "@google/generative-ai";

export const noteTools: Tool[] = [
  {
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
  },
];

// Tool execution functions
export const executeNoteTool = async (name: string, args: any) => {
  switch (name) {
    case "save_note":
      const notes = JSON.parse(localStorage.getItem("notes") || "[]");
      notes.push({
        id: Date.now(),
        content: args.content,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem("notes", JSON.stringify(notes));
      return { result: { success: true, message: "Note saved successfully" } };

    case "get_notes":
      const savedNotes = JSON.parse(localStorage.getItem("notes") || "[]");
      return { result: { notes: savedNotes } };

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
};
