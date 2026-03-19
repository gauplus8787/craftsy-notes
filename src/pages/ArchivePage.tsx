import NoteCard from "@/components/keep/NoteCard";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectArchivedNotes, pinNote, deleteNote, archiveNote, changeColor } from "@/store/notesSlice";
import { Archive } from "lucide-react";

const ArchivePage = () => {
  const dispatch = useAppDispatch();
  const archivedNotes = useAppSelector(selectArchivedNotes);

  if (archivedNotes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Archive className="w-16 h-16 mb-4 opacity-30" />
        <p className="text-lg">Ghi chú đã lưu trữ sẽ xuất hiện ở đây</p>
      </div>
    );
  }

  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
      {archivedNotes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onPin={(id) => dispatch(pinNote(id))}
          onDelete={(id) => dispatch(deleteNote(id))}
          onColorChange={(id, c) => dispatch(changeColor({ id, color: c }))}
          onArchive={(id) => dispatch(archiveNote(id))}
        />
      ))}
    </div>
  );
};

export default ArchivePage;
