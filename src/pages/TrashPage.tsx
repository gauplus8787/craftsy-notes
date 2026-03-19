import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectDeletedNotes, permanentDelete, restoreNote } from "@/store/notesSlice";
import { Trash2, RotateCcw } from "lucide-react";

const TrashPage = () => {
  const dispatch = useAppDispatch();
  const deletedNotes = useAppSelector(selectDeletedNotes);

  if (deletedNotes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Trash2 className="w-16 h-16 mb-4 opacity-30" />
        <p className="text-lg">Không có ghi chú nào trong thùng rác</p>
      </div>
    );
  }

  return (
    <>
      <p className="text-sm text-muted-foreground mb-4 px-2">
        Ghi chú trong thùng rác sẽ bị xoá vĩnh viễn sau 7 ngày.
      </p>
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
        {deletedNotes.map((note) => (
          <div
            key={note.id}
            className="relative rounded-lg keep-border mb-4 break-inside-avoid bg-card group"
          >
            <div className="px-4 pt-3 pb-1">
              {note.title && (
                <h3 className="text-sm font-medium text-foreground mb-1">{note.title}</h3>
              )}
              <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
                {note.content}
              </p>
            </div>
            <div className="flex items-center gap-1 px-1.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => dispatch(restoreNote(note.id))}
                className="p-2 rounded-full hover:bg-secondary/50 transition-colors"
                title="Khôi phục"
              >
                <RotateCcw className="w-4 h-4 text-keep-toolbar" />
              </button>
              <button
                onClick={() => dispatch(permanentDelete(note.id))}
                className="p-2 rounded-full hover:bg-secondary/50 transition-colors"
                title="Xoá vĩnh viễn"
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default TrashPage;
