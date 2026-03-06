import { useState } from "react";
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

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>(initialNotes);

  const addNote = (title: string, content: string, options?: { color?: string; pinned?: boolean; archived?: boolean }) => {
    const newNote: Note = {
      id: Date.now().toString(),
      title,
      content,
      color: options?.color || "default",
      pinned: options?.pinned || false,
      archived: options?.archived || false,
    };
    setNotes([newNote, ...notes]);
  };

  const pinNote = (id: string) => {
    setNotes(notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)));
  };

  const deleteNote = (id: string) => {
    setNotes(notes.map((n) => (n.id === id ? { ...n, deleted: true } : n)));
  };

  const permanentDelete = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  const restoreNote = (id: string) => {
    setNotes(notes.map((n) => (n.id === id ? { ...n, deleted: false, archived: false } : n)));
  };

  const archiveNote = (id: string) => {
    setNotes(notes.map((n) => (n.id === id ? { ...n, archived: !n.archived, pinned: false } : n)));
  };

  const changeColor = (id: string, color: string) => {
    setNotes(notes.map((n) => (n.id === id ? { ...n, color } : n)));
  };

  const activeNotes = notes.filter((n) => !n.archived && !n.deleted);
  const archivedNotes = notes.filter((n) => n.archived && !n.deleted);
  const deletedNotes = notes.filter((n) => n.deleted);

  return {
    notes,
    activeNotes,
    archivedNotes,
    deletedNotes,
    addNote,
    pinNote,
    deleteNote,
    permanentDelete,
    restoreNote,
    archiveNote,
    changeColor,
  };
};
