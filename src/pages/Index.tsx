import { useState, useRef } from "react";
import NoteInput from "@/components/keep/NoteInput";
import NoteCard, { type Note } from "@/components/keep/NoteCard";
import NoteEditDialog from "@/components/keep/NoteEditDialog";
import { useNotesContext } from "@/contexts/NotesContext";

const Index = () => {
  const { activeNotes, addNote, pinNote, deleteNote, archiveNote, changeColor, updateNote } = useNotesContext();
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [sourceRect, setSourceRect] = useState<DOMRect | null>(null);

  const pinnedNotes = activeNotes.filter((n) => n.pinned);
  const otherNotes = activeNotes.filter((n) => !n.pinned);

  const currentEditNote = editingNote ? activeNotes.find(n => n.id === editingNote.id) || editingNote : null;

  const handleNoteClick = (note: Note, rect: DOMRect) => {
    setSourceRect(rect);
    setEditingNote(note);
  };

  return (
    <>
      <NoteInput onAddNote={addNote} />

      {pinnedNotes.length > 0 && (
        <>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-2">
            Đã ghim
          </p>
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 mb-8">
            {pinnedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onPin={pinNote}
                onDelete={deleteNote}
                onColorChange={changeColor}
                onArchive={archiveNote}
                onClick={(rect) => handleNoteClick(note, rect)}
              />
            ))}
          </div>
        </>
      )}

      {otherNotes.length > 0 && pinnedNotes.length > 0 && (
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-2">
          Khác
        </p>
      )}
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 2xl:columns-6 gap-4">
        {otherNotes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onPin={pinNote}
            onDelete={deleteNote}
            onColorChange={changeColor}
            onArchive={archiveNote}
            onClick={(rect) => handleNoteClick(note, rect)}
          />
        ))}
      </div>

      {currentEditNote && (
        <NoteEditDialog
          note={currentEditNote}
          open={!!currentEditNote}
          onClose={() => { setEditingNote(null); setSourceRect(null); }}
          onUpdate={updateNote}
          onDelete={(id) => { deleteNote(id); setEditingNote(null); }}
          onArchive={(id) => { archiveNote(id); setEditingNote(null); }}
          onPin={pinNote}
          onColorChange={changeColor}
          sourceRect={sourceRect}
        />
      )}
    </>
  );
};

export default Index;
