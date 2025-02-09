/**
 * Component for managing notes using the Gemini API tools
 */
import { useEffect, useState } from "react";
import { useLiveAPIContext } from "../../contexts/LiveAPIContext";
import { ToolCall } from "../../multimodal-live-types";
import { noteTools, SaveNoteArgs } from "../../lib/note-tools";

interface NoteItem {
  id: number;
  content: string;
  timestamp: string;
}

interface ResponseObject {
  name: string;
  response: { result: { [key: string]: any } };
}

export function Notes() {
  const { client, setConfig, connect, connected } = useLiveAPIContext();
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [isStarting, setIsStarting] = useState(false);

  // Set up the configuration with our note tools
  useEffect(() => {
    setConfig({
      model: "models/gemini-2.0-flash-exp",
      tools: [noteTools],
    });
  }, [setConfig]);

  // Handle start conversation
  const handleStart = async () => {
    setIsStarting(true);
    try {
      await connect();
    } catch (error) {
      console.error('Failed to connect:', error);
    } finally {
      setIsStarting(false);
    }
  };

  useEffect(() => {
    if (connected) {
      // Fetch existing notes when connected
      const savedNotes = JSON.parse(localStorage.getItem("notes") || "[]");
      setNotes(savedNotes);
    }
  }, [connected]);

  // Handle tool execution
  useEffect(() => {
    const onToolCall = (toolCall: ToolCall) => {
      const functionResponses = toolCall.functionCalls.map((fCall) => {
        let response = { result: {} };

        switch (fCall.name) {
          case "save_note": {
            const notes: NoteItem[] = JSON.parse(localStorage.getItem("notes") || "[]");
            const args = fCall.args as SaveNoteArgs;
            const newNote: NoteItem = {
              id: Date.now(),
              content: args.content,
              timestamp: new Date().toISOString(),
            };
            notes.push(newNote);
            localStorage.setItem("notes", JSON.stringify(notes));
            setNotes(notes);
            response.result = { success: true, message: "Note saved successfully" };
            break;
          }
          case "get_notes": {
            const notes: NoteItem[] = JSON.parse(localStorage.getItem("notes") || "[]");
            setNotes(notes);
            response.result = { notes };
            break;
          }
          default:
            throw new Error(`Unknown tool: ${fCall.name}`);
        }

        return {
          name: fCall.name,
          response,
          id: fCall.id,
        };
      });

      client.sendToolResponse({ functionResponses });
    };

    client.on("toolcall", onToolCall);
    return () => {
      client.off("toolcall", onToolCall);
    };
  }, [client]);

  // Display the notes
  return (
    <div className="notes">
      {!connected && (
        <div className="start-section">
          <h2>Chat with Memory</h2>
          <p>Start a conversation and I'll remember what you tell me to remember!</p>
          <button 
            onClick={handleStart} 
            disabled={isStarting}
            className="start-button"
          >
            {isStarting ? 'Starting...' : 'Start Conversation'}
          </button>
        </div>
      )}
      
      <h2>Stored Notes</h2>
      {notes.length === 0 ? (
        <p>No notes stored yet. Try asking me to remember something!</p>
      ) : (
        <ul>
          {notes.map((note) => (
            <li key={note.id}>
              <p>{note.content}</p>
              <small>{new Date(note.timestamp).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
