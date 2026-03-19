import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type Note } from "@/components/keep/NoteCard";

const initialNotes: Note[] = [
  { id: "1", title: "Danh sách mua sắm", content: "Sữa\nTrứng\nBánh mì\nBơ\nPhô mai", color: "sand", pinned: true, archived: false },
  { id: "2", title: "Ý tưởng dự án", content: "Xây dựng ứng dụng ghi chú với React và Tailwind CSS. Tham khảo Google Keep để thiết kế giao diện.", color: "mint", pinned: true, archived: false },
  { id: "3", title: "", content: "Gọi điện cho bác sĩ lúc 3 giờ chiều", color: "coral", pinned: false, archived: false },
  { id: "4", title: "Sách cần đọc", content: "1. Atomic Habits\n2. Deep Work\n3. The Pragmatic Programmer\n4. Clean Code", color: "fog", pinned: false, archived: false },
  { id: "5", title: "Công thức nấu ăn", content: "Phở bò:\n- Xương bò 1kg\n- Bánh phở\n- Hành tây, gừng\n- Quế, hồi, thảo quả\n- Rau thơm các loại", color: "peach", pinned: false, archived: false },
  { id: "6", title: "Ghi chú họp", content: "Sprint review thứ 6 tuần này. Chuẩn bị slide demo cho khách hàng.", color: "default", pinned: false, archived: false },
  { id: "7", title: "", content: "Học TypeScript generics và utility types", color: "dusk", pinned: false, archived: false },
  { id: "8", title: "Du lịch Đà Lạt", content: "Đặt khách sạn\nThuê xe máy\nThăm vườn hoa\nCà phê view đẹp", color: "sage", pinned: false, archived: false },
  { id: "9", title: "Workout", content: "Thứ 2: Ngực + Vai\nThứ 4: Lưng + Tay\nThứ 6: Chân\nCuối tuần: Cardio", color: "blossom", pinned: false, archived: false },
];

const notesSlice = createSlice({
  name: "notes",
  initialState: {
    notes: initialNotes,
  },
  reducers: {
    addNote(state, action: PayloadAction<{ title: string; content: string; color?: string; pinned?: boolean; archived?: boolean }>) {
      const { title, content, color = "default", pinned = false, archived = false } = action.payload;
      state.notes.unshift({
        id: Date.now().toString(),
        title,
        content,
        color,
        pinned,
        archived,
      });
    },
    pinNote(state, action: PayloadAction<string>) {
      const note = state.notes.find((n) => n.id === action.payload);
      if (note) note.pinned = !note.pinned;
    },
    deleteNote(state, action: PayloadAction<string>) {
      const note = state.notes.find((n) => n.id === action.payload);
      if (note) note.deleted = true;
    },
    permanentDelete(state, action: PayloadAction<string>) {
      state.notes = state.notes.filter((n) => n.id !== action.payload);
    },
    restoreNote(state, action: PayloadAction<string>) {
      const note = state.notes.find((n) => n.id === action.payload);
      if (note) {
        note.deleted = false;
        note.archived = false;
      }
    },
    archiveNote(state, action: PayloadAction<string>) {
      const note = state.notes.find((n) => n.id === action.payload);
      if (note) {
        note.archived = !note.archived;
        note.pinned = false;
      }
    },
    changeColor(state, action: PayloadAction<{ id: string; color: string }>) {
      const note = state.notes.find((n) => n.id === action.payload.id);
      if (note) note.color = action.payload.color;
    },
    updateNote(state, action: PayloadAction<{ id: string; updates: Partial<Note> }>) {
      const note = state.notes.find((n) => n.id === action.payload.id);
      if (note) Object.assign(note, action.payload.updates);
    },
    reorderNotes(state, action: PayloadAction<{ fromId: string; toId: string }>) {
      const { fromId, toId } = action.payload;
      const oldIndex = state.notes.findIndex((n) => n.id === fromId);
      const newIndex = state.notes.findIndex((n) => n.id === toId);
      if (oldIndex === -1 || newIndex === -1) return;
      const [moved] = state.notes.splice(oldIndex, 1);
      state.notes.splice(newIndex, 0, moved);
    },
  },
  selectors: {
    selectActiveNotes: (state) => state.notes.filter((n) => !n.archived && !n.deleted),
    selectArchivedNotes: (state) => state.notes.filter((n) => n.archived && !n.deleted),
    selectDeletedNotes: (state) => state.notes.filter((n) => n.deleted),
  },
});

export const {
  addNote, pinNote, deleteNote, permanentDelete,
  restoreNote, archiveNote, changeColor, updateNote, reorderNotes,
} = notesSlice.actions;

export const { selectActiveNotes, selectArchivedNotes, selectDeletedNotes } = notesSlice.selectors;

export default notesSlice.reducer;
