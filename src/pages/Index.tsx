import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import NoteInput from "@/components/keep/NoteInput";
import { type Note } from "@/components/keep/NoteCard";
import SortableNoteCard from "@/components/keep/SortableNoteCard";
import NoteEditDialog from "@/components/keep/NoteEditDialog";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectActiveNotes, pinNote, deleteNote, archiveNote, changeColor, updateNote, reorderNotes } from "@/store/notesSlice";
import { openEditor, closeEditor } from "@/store/editorSlice";

const Index = () => {
  const dispatch = useAppDispatch();
  const activeNotes = useAppSelector(selectActiveNotes);
  const { editingNoteId, sourceRect } = useAppSelector((state) => state.editor);

  const pinnedNotes = activeNotes.filter((n) => n.pinned);
  const otherNotes = activeNotes.filter((n) => !n.pinned);

  const editingNote = editingNoteId ? activeNotes.find(n => n.id === editingNoteId) || null : null;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      dispatch(reorderNotes({ fromId: active.id as string, toId: over.id as string }));
    }
  };

  const handleNoteClick = (note: Note, rect: DOMRect) => {
    dispatch(openEditor({
      noteId: note.id,
      sourceRect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
    }));
  };

  const renderNoteCard = (note: Note) => (
    <SortableNoteCard
      key={note.id}
      note={note}
      onPin={(id) => dispatch(pinNote(id))}
      onDelete={(id) => dispatch(deleteNote(id))}
      onColorChange={(id, c) => dispatch(changeColor({ id, color: c }))}
      onArchive={(id) => dispatch(archiveNote(id))}
      onClick={(rect) => handleNoteClick(note, rect)}
      hidden={editingNoteId === note.id}
    />
  );

  const sourceRectAsDomRect = sourceRect
    ? { ...sourceRect, right: sourceRect.left + sourceRect.width, bottom: sourceRect.top + sourceRect.height, x: sourceRect.left, y: sourceRect.top, toJSON: () => {} } as DOMRect
    : null;

  return (
    <>
      <NoteInput />

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        {pinnedNotes.length > 0 && (
          <>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-2">
              Đã ghim
            </p>
            <SortableContext items={pinnedNotes.map(n => n.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                {pinnedNotes.map(renderNoteCard)}
              </div>
            </SortableContext>
          </>
        )}

        {otherNotes.length > 0 && pinnedNotes.length > 0 && (
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-2">
            Khác
          </p>
        )}
        <SortableContext items={otherNotes.map(n => n.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
            {otherNotes.map(renderNoteCard)}
          </div>
        </SortableContext>
      </DndContext>

      {editingNote && (
        <NoteEditDialog
          note={editingNote}
          open={!!editingNote}
          onClose={() => dispatch(closeEditor())}
          onUpdate={(id, updates) => dispatch(updateNote({ id, updates }))}
          onDelete={(id) => { dispatch(deleteNote(id)); dispatch(closeEditor()); }}
          onArchive={(id) => { dispatch(archiveNote(id)); dispatch(closeEditor()); }}
          onPin={(id) => dispatch(pinNote(id))}
          onColorChange={(id, c) => dispatch(changeColor({ id, color: c }))}
          sourceRect={sourceRectAsDomRect}
        />
      )}
    </>
  );
};

export default Index;
