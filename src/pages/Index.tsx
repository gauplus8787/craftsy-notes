import NoteInput from "@/components/keep/NoteInput";
import NoteCard from "@/components/keep/NoteCard";
import { useNotesContext } from "@/contexts/NotesContext";

const Index = () => {
  const { activeNotes, addNote, pinNote, deleteNote, archiveNote, changeColor } = useNotesContext();

  const pinnedNotes = activeNotes.filter((n) => n.pinned);
  const otherNotes = activeNotes.filter((n) => !n.pinned);

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
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
        {otherNotes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onPin={pinNote}
            onDelete={deleteNote}
            onColorChange={changeColor}
            onArchive={archiveNote}
          />
        ))}
      </div>
    </>
  );
};

export default Index;
