import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ChecklistItem } from "@/hooks/useNoteEditor";

interface EditorState {
  // Editing session
  editingNoteId: string | null;
  sourceRect: { top: number; left: number; width: number; height: number } | null;
  // Editor UI toggles
  showMore: boolean;
  showColors: boolean;
  showFormatting: boolean;
  // Checklist
  isChecklist: boolean;
  checklistItems: ChecklistItem[];
  showCompleted: boolean;
}

const initialState: EditorState = {
  editingNoteId: null,
  sourceRect: null,
  showMore: false,
  showColors: false,
  showFormatting: false,
  isChecklist: false,
  checklistItems: [],
  showCompleted: true,
};

const editorSlice = createSlice({
  name: "editor",
  initialState,
  reducers: {
    openEditor(state, action: PayloadAction<{ noteId: string; sourceRect: EditorState["sourceRect"] }>) {
      state.editingNoteId = action.payload.noteId;
      state.sourceRect = action.payload.sourceRect;
    },
    closeEditor(state) {
      state.editingNoteId = null;
      state.sourceRect = null;
      state.showMore = false;
      state.showColors = false;
      state.showFormatting = false;
    },
    setShowMore(state, action: PayloadAction<boolean>) {
      state.showMore = action.payload;
      if (action.payload) state.showColors = false;
    },
    setShowColors(state, action: PayloadAction<boolean>) {
      state.showColors = action.payload;
      if (action.payload) state.showMore = false;
    },
    setShowFormatting(state, action: PayloadAction<boolean>) {
      state.showFormatting = action.payload;
      state.showColors = false;
      state.showMore = false;
    },
    setIsChecklist(state, action: PayloadAction<boolean>) {
      state.isChecklist = action.payload;
    },
    setChecklistItems(state, action: PayloadAction<ChecklistItem[]>) {
      state.checklistItems = action.payload;
    },
    toggleChecklistItem(state, action: PayloadAction<number>) {
      const item = state.checklistItems[action.payload];
      if (item) item.checked = !item.checked;
    },
    updateChecklistItem(state, action: PayloadAction<{ index: number; text: string }>) {
      const item = state.checklistItems[action.payload.index];
      if (item) item.text = action.payload.text;
    },
    removeChecklistItem(state, action: PayloadAction<number>) {
      if (state.checklistItems.length > 1) {
        state.checklistItems.splice(action.payload, 1);
      }
    },
    addChecklistItem(state) {
      state.checklistItems.push({ text: "", checked: false });
    },
    insertChecklistItem(state, action: PayloadAction<{ index: number }>) {
      state.checklistItems.splice(action.payload.index + 1, 0, { text: "", checked: false });
    },
    setShowCompleted(state, action: PayloadAction<boolean>) {
      state.showCompleted = action.payload;
    },
    resetEditorState(state) {
      Object.assign(state, initialState);
    },
  },
});

export const {
  openEditor, closeEditor,
  setShowMore, setShowColors, setShowFormatting,
  setIsChecklist, setChecklistItems, toggleChecklistItem,
  updateChecklistItem, removeChecklistItem, addChecklistItem,
  insertChecklistItem, setShowCompleted, resetEditorState,
} = editorSlice.actions;

export default editorSlice.reducer;
