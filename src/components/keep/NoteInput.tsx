import { useRef, useState } from "react";
import { CheckSquare, Paintbrush, Image as ImageIcon, Pin, Palette, Bell, UserPlus, Archive, MoreVertical, Baseline, Undo2, Redo2 } from "lucide-react";

interface NoteInputProps {
  onAddNote: (title: string, content: string) => void;
}

const NoteInput = ({ onAddNote }: NoteInputProps) => {
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleClose = () => {
    if (title.trim() || content.trim()) {
      onAddNote(title, content);
    }
    setTitle("");
    setContent("");
    setExpanded(false);
  };
  const handleTextarea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);

    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    }
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
            <button>
              <CheckSquare className="w-5 h-5 text-keep-icon" />
            </button>
            <button>
              <Paintbrush className="w-5 h-5 text-keep-icon" />
            </button>
            <button>
              <ImageIcon className="w-5 h-5 text-keep-icon" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[600px] mx-auto mb-8">
      <div className="keep-shadow h-auto rounded-lg bg-card relative">
        <button
        
        className={`absolute top-2 right-2 p-2 rounded-full transition-opacity hover:bg-secondary/50`}
      >
        <Pin className={`w-5 h-5`} />
      </button>
        <input
          type="text"
          placeholder="Tiêu đề"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 pt-3 pb-1 bg-transparent outline-none text-foreground font-medium placeholder:text-muted-foreground"
          autoFocus
        />
        <div className="py-1">
          <textarea
            ref={textareaRef}
            placeholder="Ghi chú..."
            value={content}
            onChange={handleTextarea}
            className="w-full px-4 mb-1 bg-transparent outline-none text-foreground text-sm placeholder:text-muted-foreground resize-none overflow-hidden"
          />
        </div>
        <div className="flex items-center justify-between px-2 py-1.5">
          <div className="flex items-center gap-1">
            <button className="p-2 rounded-full hover:bg-secondary transition-colors">
              <Baseline className="w-4 h-4 text-keep-toolbar" />
            </button>
            <button className="p-2 rounded-full hover:bg-secondary transition-colors">
              <Palette className="w-4 h-4 text-keep-toolbar" />
            </button>
            <button className="p-2 rounded-full hover:bg-secondary transition-colors">
              <Bell className="w-4 h-4 text-keep-toolbar" />
            </button>
            <button className="p-2 rounded-full hover:bg-secondary transition-colors">
              <UserPlus className="w-4 h-4 text-keep-toolbar" />
            </button>
            <button className="p-2 rounded-full hover:bg-secondary transition-colors">
              <ImageIcon className="w-4 h-4 text-keep-toolbar" />
            </button>
            <button className="p-2 rounded-full hover:bg-secondary transition-colors">
              <Archive className="w-4 h-4 text-keep-toolbar" />
            </button>
            {/* More options */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowMore(!showMore);
                    setShowColors(false);
                  }}
                  className="p-2 rounded-full hover:bg-secondary/50 transition-colors"
                  title="Tuỳ chọn khác"
                >
                  <MoreVertical className="w-4 h-4 text-keep-toolbar" />
                </button>
                {showMore && (
                  <div className="absolute top-full left-1 mt-1 bg-card rounded-lg keep-shadow z-10 py-1 min-w-[160px] animate-in fade-in zoom-in-95">
                    <button
                      onClick={() => setShowMore(false)}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-card-foreground hover:bg-secondary transition-colors"
                    >
                      Thêm nhãn
                    </button>
                    <button
                      onClick={() => setShowMore(false)}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-card-foreground hover:bg-secondary transition-colors"
                    >
                      Thêm hộp kiểm
                    </button>
                    </div>
                )}
                </div>
            <button className="p-2 rounded-full hover:bg-secondary transition-colors">
              <Undo2 className="w-4 h-4 text-keep-toolbar" />
            </button>
            <button className="p-2 rounded-full hover:bg-secondary transition-colors">
              <Redo2 className="w-4 h-4 text-keep-toolbar" />
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
