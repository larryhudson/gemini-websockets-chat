/**
 * Tools for managing notes in localStorage
 */

export const noteTools = {
  saveNote: {
    name: "saveNote",
    description: "Save a note to localStorage",
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
    execute: async ({ content }: { content: string }) => {
      const notes = JSON.parse(localStorage.getItem("notes") || "[]");
      notes.push({
        id: Date.now(),
        content,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem("notes", JSON.stringify(notes));
      return { success: true, message: "Note saved successfully" };
    },
  },

  getNotes: {
    name: "getNotes",
    description: "Retrieve all saved notes from localStorage",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
    execute: async () => {
      const notes = JSON.parse(localStorage.getItem("notes") || "[]");
      return { notes };
    },
  },
};
