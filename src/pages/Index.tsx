import { useState } from "react";
import KeepHeader from "@/components/keep/KeepHeader";
import KeepSidebar from "@/components/keep/KeepSidebar";
import NoteInput from "@/components/keep/NoteInput";
import NoteCard, { type Note } from "@/components/keep/NoteCard";

const initialNotes: Note[] = [
  { id: "1", title: "Danh sách mua sắm", content: "Sữa\nTrứng\nBánh mì\nBơ\nPhô mai", color: "sand", pinned: true },
  { id: "2", title: "Ý tưởng dự án", content: "Xây dựng ứng dụng ghi chú với React và Tailwind CSS. Tham khảo Google Keep để thiết kế giao diện.", color: "mint", pinned: true },
  { id: "3", title: "", content: "Gọi điện cho bác sĩ lúc 3 giờ chiều", color: "coral", pinned: false },
  { id: "4", title: "Sách cần đọc", content: "1. Atomic Habits\n2. Deep Work\n3. The Pragmatic Programmer\n4. Clean Code", color: "fog", pinned: false },
  { id: "5", title: "Công thức nấu ăn", content: "Phở bò:\n- Xương bò 1kg\n- Bánh phở\n- Hành tây, gừng\n- Quế, hồi, thảo quả\n- Rau thơm các loại", color: "peach", pinned: false },
  { id: "6", title: "Ghi chú họp", content: "Sprint review thứ 6 tuần này. Chuẩn bị slide demo cho khách hàng.", color: "default", pinned: false },
  { id: "7", title: "", content: "Học TypeScript generics và utility types", color: "dusk", pinned: false },
  { id: "8", title: "Du lịch Đà Lạt", content: "Đặt khách sạn\nThuê xe máy\nThăm vườn hoa\nCà phê view đẹp", color: "sage", pinned: false },
  { id: "9", title: "Workout", content: "Thứ 2: Ngực + Vai\nThứ 4: Lưng + Tay\nThứ 6: Chân\nCuối tuần: Cardio", color: "blossom", pinned: false },
];

const Index = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [activeNav, setActiveNav] = useState("notes");
  const [notes, setNotes] = useState<Note[]>(initialNotes);

  const handleAddNote = (title: string, content: string) => {
    const newNote: Note = {
      id: Date.now().toString(),
      title,
      content,
      color: "default",
      pinned: false,
    };
    setNotes([newNote, ...notes]);
  };

  const handlePin = (id: string) => {
    setNotes(notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)));
  };

  const handleDelete = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  const handleColorChange = (id: string, color: string) => {
    setNotes(notes.map((n) => (n.id === id ? { ...n, color } : n)));
  };

  const pinnedNotes = notes.filter((n) => n.pinned);
  const otherNotes = notes.filter((n) => !n.pinned);

  return (
    <div className="min-h-screen bg-background">
      <KeepHeader onToggleSidebar={() => setSidebarExpanded(!sidebarExpanded)} />
      <div className="flex">
        <KeepSidebar
          expanded={sidebarExpanded}
          activeItem={activeNav}
          onItemClick={setActiveNav}
        />
        <main className="flex-1 p-4 sm:p-8 transition-all duration-200">
          <NoteInput onAddNote={handleAddNote} />

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
                    onPin={handlePin}
                    onDelete={handleDelete}
                    onColorChange={handleColorChange}
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
                onPin={handlePin}
                onDelete={handleDelete}
                onColorChange={handleColorChange}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
