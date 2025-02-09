/**
 * Component for managing notes using the Gemini API tools
 */
import { useEffect, useState, useCallback } from 'react';
import { useLiveAPIContext } from '../../contexts/LiveAPIContext';
import { ToolCall, ToolResponse } from '../../multimodal-live-types';
import { toolObject, systemInstructionObject, SaveNoteArgs } from '../../lib/note-tools';

interface NoteItem {
  id: number;
  content: string;
  timestamp: string;
}

export function Notes() {
  const { client, setConfig, connect, connected } = useLiveAPIContext();
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [isStarting, setIsStarting] = useState(false);
  const [toolResponse, setToolResponse] = useState<ToolResponse | null>(null);

  // Set up the configuration with our note tools
  useEffect(() => {
    setConfig({
      model: 'models/gemini-2.0-flash-exp',
      generationConfig: {
        responseModalities: 'audio',
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
        },
      },
      systemInstruction: systemInstructionObject,
      tools: toolObject,
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

  // Load notes from localStorage when component mounts
  useEffect(() => {
    const savedNotes = JSON.parse(localStorage.getItem('notes') || '[]');
    setNotes(savedNotes);
  }, []);

  // Handle tool execution
  useEffect(() => {
    const onToolCall = (toolCall: ToolCall) => {
      const functionResponses = toolCall.functionCalls.map((fCall) => {
        let response = { result: {} };

        switch (fCall.name) {
          case 'save_note': {
            const notes: NoteItem[] = JSON.parse(localStorage.getItem('notes') || '[]');
            const args = fCall.args as SaveNoteArgs;
            const newNote: NoteItem = {
              id: Date.now(),
              content: args.content,
              timestamp: new Date().toISOString(),
            };
            notes.push(newNote);
            localStorage.setItem('notes', JSON.stringify(notes));
            setNotes(notes);
            response.result = { success: true, message: 'Note saved successfully' };
            break;
          }
          case 'get_notes': {
            const notes: NoteItem[] = JSON.parse(localStorage.getItem('notes') || '[]');
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

      setToolResponse({ functionResponses });
      client.sendToolResponse({ functionResponses });
    };

    client.on('toolcall', onToolCall);
    return () => {
      client.off('toolcall', onToolCall);
    };
  }, [client]);

  // Display the notes
  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">
      {!connected && (
        <div className="space-y-4 text-center bg-neutral-10 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-200">Chat with Memory</h2>
          <p className="text-gray-400">
            Start a conversation and I'll remember what you tell me to remember!
          </p>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-300">Stored Notes</h2>
        {notes.length === 0 ? (
          <p className="text-gray-400 italic">
            No notes stored yet. Try asking me to remember something!
          </p>
        ) : (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-b from-neutral-5 to-transparent h-4 pointer-events-none" />
            <ul className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 -mr-2 scroll-smooth">
              {notes.map((note) => (
                <li key={note.id} className="bg-neutral-10 rounded-lg p-4 space-y-2">
                  <div
                    className="prose prose-invert prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: note.content }}
                  />
                  <time className="block text-xs text-gray-500">
                    {new Date(note.timestamp).toLocaleString()}
                  </time>
                </li>
              ))}
            </ul>
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-neutral-5 to-transparent h-4 pointer-events-none" />
          </div>
        )}
      </div>
    </div>
  );
}
