import { useState } from "react";
import { CheckSquare, Paintbrush, Image as ImageIcon } from "lucide-react";

interface NoteInputProps {
  onAddNote: (title: string, content: string) => void;
}

const NoteInput = ({ onAddNote }: NoteInputProps) => {
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleClose = () => {
    if (title.trim() || content.trim()) {
      onAddNote(title, content);
    }
    setTitle("");
    setContent("");
    setExpanded(false);
  };

  if (!expanded) {
    return (
      <div className="max-w-[600px] mx-auto mb-8">
        <div
          onClick={() => setExpanded(true)}
          className="flex items-center keep-shadow rounded-lg px-4 py-3 cursor-text bg-card"
        >
          <span className="flex-1 text-muted-foreground text-base">
            Tạo ghi chú...
          </span>
          <div className="flex items-center gap-4">
            <CheckSquare className="w-5 h-5 text-keep-icon" />
            <Paintbrush className="w-5 h-5 text-keep-icon" />
            <ImageIcon className="w-5 h-5 text-keep-icon" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[600px] mx-auto mb-8">
      <div className="keep-shadow rounded-lg bg-card overflow-hidden">
        <input
          type="text"
          placeholder="Tiêu đề"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 pt-3 pb-1 bg-transparent outline-none text-foreground font-medium placeholder:text-muted-foreground"
          autoFocus
        />
        <textarea
          placeholder="Tạo ghi chú..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 bg-transparent outline-none text-foreground text-sm placeholder:text-muted-foreground resize-none"
        />
        <div className="flex items-center justify-between px-2 py-1.5">
          <div className="flex items-center gap-1">
            <button className="p-2 rounded-full hover:bg-secondary transition-colors">
              <Paintbrush className="w-4 h-4 text-keep-toolbar" />
            </button>
            <button className="p-2 rounded-full hover:bg-secondary transition-colors">
              <ImageIcon className="w-4 h-4 text-keep-toolbar" />
            </button>
          </div>
          <button
            onClick={handleClose}
            className="px-6 py-1.5 text-sm font-medium text-foreground hover:bg-secondary rounded transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteInput;
