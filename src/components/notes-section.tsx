
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { storage } from "@/lib/storage";

interface Note {
  id: string;
  content: string;
  updatedAt: string;
}

export function NotesSection() {
  const [notes, setNotes] = useState<Note[]>(() =>
    storage.get<Note[]>("focusnest-notes", [])
  );
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const activeNote = notes.find((note) => note.id === activeNoteId) || null;

  // Initialize with a default note if none exists
  useEffect(() => {
    if (notes.length === 0) {
      const newNote: Note = {
        id: Date.now().toString(),
        content: "",
        updatedAt: new Date().toISOString(),
      };
      setNotes([newNote]);
      setActiveNoteId(newNote.id);
    } else if (!activeNoteId) {
      setActiveNoteId(notes[0].id);
    }
  }, [notes, activeNoteId]);

  // Save notes to local storage whenever they change
  useEffect(() => {
    storage.set("focusnest-notes", notes);
  }, [notes]);

  const handleNoteChange = (content: string) => {
    if (!activeNoteId) return;

    setNotes(
      notes.map((note) =>
        note.id === activeNoteId
          ? { ...note, content, updatedAt: new Date().toISOString() }
          : note
      )
    );
  };

  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      content: "",
      updatedAt: new Date().toISOString(),
    };
    setNotes([...notes, newNote]);
    setActiveNoteId(newNote.id);
  };

  const deleteNote = (id: string) => {
    const filteredNotes = notes.filter((note) => note.id !== id);
    setNotes(filteredNotes);
    
    // If we deleted the active note, activate another one
    if (id === activeNoteId && filteredNotes.length > 0) {
      setActiveNoteId(filteredNotes[0].id);
    } else if (filteredNotes.length === 0) {
      // If we deleted the last note, create a new one
      createNewNote();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Auto-save timer
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      storage.set("focusnest-notes", notes);
    }, 5000); // Save every 5 seconds

    return () => clearInterval(autoSaveInterval);
  }, [notes]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-2 mb-4">
        <div className="flex-grow overflow-x-auto flex gap-1">
          {notes.map((note) => (
            <Button
              key={note.id}
              variant={note.id === activeNoteId ? "default" : "outline"}
              className="whitespace-nowrap text-sm"
              onClick={() => setActiveNoteId(note.id)}
            >
              Note {notes.indexOf(note) + 1}
            </Button>
          ))}
        </div>
        <Button onClick={createNewNote} size="icon" variant="outline">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-grow flex flex-col">
        {activeNote && (
          <>
            <div className="flex justify-between items-center mb-2 text-xs text-muted-foreground">
              <span>Last updated: {formatDate(activeNote.updatedAt)}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => deleteNote(activeNote.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Textarea
              className="flex-grow resize-none"
              placeholder="Write your notes here..."
              value={activeNote.content}
              onChange={(e) => handleNoteChange(e.target.value)}
            />
          </>
        )}
      </div>
    </div>
  );
}
