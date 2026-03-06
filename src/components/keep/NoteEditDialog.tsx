import { useState, useRef, useEffect, useCallback } from "react";
import {
  Pin,
  Palette,
  Bell,
  UserPlus,
  Image as ImageIcon,
  Archive,
  MoreVertical,
  Undo2,
  Redo2,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  X,
  Baseline,
  Tag,
  Copy,
  Trash2,
  CheckSquare,
  GripVertical,
} from "lucide-react";
import { noteColors, getColorClass } from "./noteColors";
import { type Note } from "./NoteCard";

interface NoteEditDialogProps {
  note: Note;
  open: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Note>) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onPin: (id: string) => void;
  onColorChange: (id: string, color: string) => void;
}

interface HistoryEntry {
  title: string;
  content: string;
}

const NoteEditDialog = ({
  note,
  open,
  onClose,
  onUpdate,
  onDelete,
  onArchive,
  onPin,
  onColorChange,
}: NoteEditDialogProps) => {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [showMore, setShowMore] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [showFormatting, setShowFormatting] = useState(false);
  const [isChecklist, setIsChecklist] = useState(false);
  const [checklistItems, setChecklistItems] = useState<{ text: string; checked: boolean }[]>([]);
  const [showCompleted, setShowCompleted] = useState(true);

  const [history, setHistory] = useState<HistoryEntry[]>([{ title: note.title, content: note.content }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const historyTimeout = useRef<ReturnType<typeof setTimeout>>();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const colorRef = useRef<HTMLDivElement>(null);

  // Sync state when note changes
  useEffect(() => {
    if (open) {
      setTitle(note.title);
      setContent(note.content);
      setShowMore(false);
      setShowColors(false);
      setShowFormatting(false);
      setHistory([{ title: note.title, content: note.content }]);
      setHistoryIndex(0);

      // Detect checklist content
      const lines = note.content.split("\n");
      const isChecklistContent = lines.some(l => l.startsWith("☐ ") || l.startsWith("☑ "));
      if (isChecklistContent) {
        setIsChecklist(true);
        setChecklistItems(
          lines.filter(l => l.trim()).map(l => {
            if (l.startsWith("☑ ")) return { text: l.slice(2), checked: true };
            if (l.startsWith("☐ ")) return { text: l.slice(2), checked: false };
            return { text: l, checked: false };
          })
        );
      } else {
        setIsChecklist(false);
        setChecklistItems([]);
      }
    }
  }, [note, open]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current && open && !isChecklist) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [content, open, isChecklist]);

  const pushHistory = useCallback((t: string, c: string) => {
    if (historyTimeout.current) clearTimeout(historyTimeout.current);
    historyTimeout.current = setTimeout(() => {
      setHistory(prev => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push({ title: t, content: c });
        return newHistory;
      });
      setHistoryIndex(prev => prev + 1);
    }, 500);
  }, [historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      const i = historyIndex - 1;
      setHistoryIndex(i);
      setTitle(history[i].title);
      setContent(history[i].content);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const i = historyIndex + 1;
      setHistoryIndex(i);
      setTitle(history[i].title);
      setContent(history[i].content);
    }
  };

  // Close dropdowns
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setShowMore(false);
      if (colorRef.current && !colorRef.current.contains(e.target as Node)) setShowColors(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSaveAndClose = () => {
    let finalContent = content;
    if (isChecklist) {
      finalContent = checklistItems
        .filter(item => item.text.trim())
        .map(item => `${item.checked ? "☑" : "☐"} ${item.text}`)
        .join("\n");
    }
    onUpdate(note.id, { title, content: finalContent });
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) handleSaveAndClose();
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    pushHistory(val, content);
  };

  const handleContentChange = (val: string) => {
    setContent(val);
    pushHistory(title, val);
  };

  const handleTextarea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleContentChange(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = ta.scrollHeight + "px";
    }
  };

  const toggleChecklist = () => {
    if (!isChecklist) {
      const lines = content.split("\n").filter(l => l.trim());
      setChecklistItems(lines.length > 0 ? lines.map(l => ({ text: l, checked: false })) : [{ text: "", checked: false }]);
      setIsChecklist(true);
    } else {
      setContent(checklistItems.filter(i => i.text.trim()).map(i => i.text).join("\n"));
      setIsChecklist(false);
    }
  };

  const updateChecklistItem = (index: number, text: string) => {
    setChecklistItems(prev => prev.map((item, i) => i === index ? { ...item, text } : item));
  };

  const toggleChecklistItem = (index: number) => {
    setChecklistItems(prev => prev.map((item, i) => i === index ? { ...item, checked: !item.checked } : item));
  };

  const handleChecklistKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const newItems = [...checklistItems];
      newItems.splice(index + 1, 0, { text: "", checked: false });
      setChecklistItems(newItems);
      setTimeout(() => {
        dialogRef.current?.querySelectorAll<HTMLInputElement>(".checklist-input")?.[index + 1]?.focus();
      }, 0);
    }
    if (e.key === "Backspace" && checklistItems[index].text === "" && checklistItems.length > 1) {
      e.preventDefault();
      setChecklistItems(checklistItems.filter((_, i) => i !== index));
      setTimeout(() => {
        dialogRef.current?.querySelectorAll<HTMLInputElement>(".checklist-input")?.[Math.max(0, index - 1)]?.focus();
      }, 0);
    }
  };

  const removeChecklistItem = (index: number) => {
    if (checklistItems.length > 1) setChecklistItems(checklistItems.filter((_, i) => i !== index));
  };

  const insertFormat = (prefix: string, suffix: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = content.substring(start, end);
    const newContent = content.substring(0, start) + prefix + selected + suffix + content.substring(end);
    handleContentChange(newContent);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  if (!open) return null;

  const colorClass = getColorClass(note.color);
  const uncheckedItems = checklistItems.map((item, i) => ({ ...item, originalIndex: i })).filter(item => !item.checked);
  const checkedItems = checklistItems.map((item, i) => ({ ...item, originalIndex: i })).filter(item => item.checked);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-black/50"
      onClick={handleOverlayClick}
    >
      <div
        ref={dialogRef}
        className={`w-full max-w-[600px] rounded-lg keep-shadow relative ${colorClass} max-h-[80vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pin */}
        <button
          onClick={() => onPin(note.id)}
          className="absolute top-2 right-2 p-2 rounded-full hover:bg-secondary/50 transition-colors z-10"
          title={note.pinned ? "Bỏ ghim" : "Ghim ghi chú"}
        >
          <Pin className={`w-5 h-5 ${note.pinned ? "text-foreground fill-foreground" : "text-keep-icon"}`} />
        </button>

        {/* Title */}
        <input
          type="text"
          placeholder="Tiêu đề"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="w-full px-4 pt-3 pb-1 bg-transparent outline-none text-foreground font-medium placeholder:text-muted-foreground pr-12 text-base"
          autoFocus
        />

        {/* Content */}
        <div className="py-1 overflow-y-auto flex-1 min-h-0">
          {isChecklist ? (
            <div className="px-2 space-y-0.5">
              {uncheckedItems.map((item) => (
                <div key={item.originalIndex} className="flex items-center gap-1 group/item">
                  <GripVertical className="w-4 h-4 text-muted-foreground/40 cursor-grab opacity-0 group-hover/item:opacity-100 transition-opacity" />
                  <input
                    type="checkbox"
                    checked={false}
                    onChange={() => toggleChecklistItem(item.originalIndex)}
                    className="w-[18px] h-[18px] rounded border-muted-foreground/50 accent-primary cursor-pointer"
                  />
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => updateChecklistItem(item.originalIndex, e.target.value)}
                    onKeyDown={(e) => handleChecklistKeyDown(item.originalIndex, e)}
                    placeholder="Mục danh sách"
                    className="checklist-input flex-1 px-2 py-1.5 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                  />
                  <button
                    onClick={() => removeChecklistItem(item.originalIndex)}
                    className="p-1 rounded-full opacity-0 group-hover/item:opacity-100 hover:bg-secondary/50 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5 text-keep-icon" />
                  </button>
                </div>
              ))}

              <button
                onClick={() => setChecklistItems([...checklistItems, { text: "", checked: false }])}
                className="flex items-center gap-2 px-5 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="text-lg leading-none">+</span> Mục danh sách
              </button>

              {checkedItems.length > 0 && (
                <div className="border-t border-border/40 mt-1 pt-1">
                  <button
                    onClick={() => setShowCompleted(!showCompleted)}
                    className="flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
                  >
                    <svg className={`w-4 h-4 transition-transform ${showCompleted ? "rotate-0" : "-rotate-90"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                    {checkedItems.length} mục đã hoàn tất
                  </button>
                  {showCompleted && checkedItems.map((item) => (
                    <div key={item.originalIndex} className="flex items-center gap-1 group/item">
                      <GripVertical className="w-4 h-4 text-muted-foreground/40 cursor-grab opacity-0 group-hover/item:opacity-100 transition-opacity" />
                      <input
                        type="checkbox"
                        checked={true}
                        onChange={() => toggleChecklistItem(item.originalIndex)}
                        className="w-[18px] h-[18px] rounded border-muted-foreground/50 accent-primary cursor-pointer"
                      />
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) => updateChecklistItem(item.originalIndex, e.target.value)}
                        onKeyDown={(e) => handleChecklistKeyDown(item.originalIndex, e)}
                        className="checklist-input flex-1 px-2 py-1.5 bg-transparent outline-none text-sm line-through text-muted-foreground"
                      />
                      <button
                        onClick={() => removeChecklistItem(item.originalIndex)}
                        className="p-1 rounded-full opacity-0 group-hover/item:opacity-100 hover:bg-secondary/50 transition-opacity"
                      >
                        <X className="w-3.5 h-3.5 text-keep-icon" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              placeholder="Ghi chú..."
              value={content}
              onChange={handleTextarea}
              className="w-full px-4 mb-1 bg-transparent outline-none text-foreground text-sm placeholder:text-muted-foreground resize-none overflow-hidden min-h-[60px]"
            />
          )}
        </div>

        {/* Formatting toolbar */}
        {showFormatting && !isChecklist && (
          <div className="flex items-center gap-0.5 px-2 py-1 border-t border-border/30">
            <button onClick={() => insertFormat("**", "**")} className="p-2 rounded-full hover:bg-secondary/50" title="Đậm"><Bold className="w-4 h-4 text-keep-toolbar" /></button>
            <button onClick={() => insertFormat("_", "_")} className="p-2 rounded-full hover:bg-secondary/50" title="Nghiêng"><Italic className="w-4 h-4 text-keep-toolbar" /></button>
            <button onClick={() => insertFormat("<u>", "</u>")} className="p-2 rounded-full hover:bg-secondary/50" title="Gạch chân"><Underline className="w-4 h-4 text-keep-toolbar" /></button>
            <button onClick={() => insertFormat("~~", "~~")} className="p-2 rounded-full hover:bg-secondary/50" title="Gạch ngang"><Strikethrough className="w-4 h-4 text-keep-toolbar" /></button>
            <div className="w-px h-5 bg-border/50 mx-1" />
            <button onClick={() => insertFormat("- ", "")} className="p-2 rounded-full hover:bg-secondary/50" title="Danh sách"><List className="w-4 h-4 text-keep-toolbar" /></button>
            <button onClick={() => insertFormat("1. ", "")} className="p-2 rounded-full hover:bg-secondary/50" title="Danh sách số"><ListOrdered className="w-4 h-4 text-keep-toolbar" /></button>
          </div>
        )}

        {/* Main toolbar */}
        <div className="flex items-center justify-between px-2 py-1.5">
          <div className="flex items-center gap-0.5 flex-wrap">
            {/* Formatting toggle */}
            <button
              onClick={() => { setShowFormatting(!showFormatting); setShowColors(false); setShowMore(false); }}
              className={`p-2 rounded-full hover:bg-secondary/50 transition-colors ${showFormatting ? "bg-secondary/50" : ""}`}
              title="Tuỳ chọn định dạng"
            >
              <Baseline className="w-4 h-4 text-keep-toolbar" />
            </button>

            {/* Color picker */}
            <div ref={colorRef} className="relative">
              <button
                onClick={() => { setShowColors(!showColors); setShowMore(false); setShowFormatting(false); }}
                className="p-2 rounded-full hover:bg-secondary/50 transition-colors"
                title="Màu nền"
              >
                <Palette className="w-4 h-4 text-keep-toolbar" />
              </button>
              {showColors && (
                <div className="absolute bottom-full left-0 mb-1 p-2 bg-card rounded-lg keep-shadow z-20 flex gap-1 flex-wrap w-[180px] animate-in fade-in zoom-in-95">
                  {noteColors.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => { onColorChange(note.id, c.value); setShowColors(false); }}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${
                        note.color === c.value ? "border-primary scale-110" : "border-transparent hover:border-keep-icon"
                      } ${c.class}`}
                      title={c.name}
                    />
                  ))}
                </div>
              )}
            </div>

            <button className="p-2 rounded-full hover:bg-secondary/50 transition-colors" title="Nhắc tôi">
              <Bell className="w-4 h-4 text-keep-toolbar" />
            </button>
            <button className="p-2 rounded-full hover:bg-secondary/50 transition-colors" title="Cộng tác viên">
              <UserPlus className="w-4 h-4 text-keep-toolbar" />
            </button>
            <button className="p-2 rounded-full hover:bg-secondary/50 transition-colors" title="Thêm hình ảnh">
              <ImageIcon className="w-4 h-4 text-keep-toolbar" />
            </button>
            <button
              onClick={() => { onArchive(note.id); onClose(); }}
              className="p-2 rounded-full hover:bg-secondary/50 transition-colors"
              title="Lưu trữ"
            >
              <Archive className="w-4 h-4 text-keep-toolbar" />
            </button>

            {/* More options */}
            <div ref={moreRef} className="relative">
              <button
                onClick={() => { setShowMore(!showMore); setShowColors(false); setShowFormatting(false); }}
                className="p-2 rounded-full hover:bg-secondary/50 transition-colors"
                title="Tuỳ chọn khác"
              >
                <MoreVertical className="w-4 h-4 text-keep-toolbar" />
              </button>
              {showMore && (
                <div className="absolute bottom-full left-0 mb-1 bg-card rounded-lg keep-shadow z-20 py-1 min-w-[180px] animate-in fade-in zoom-in-95">
                  <button
                    onClick={() => { onDelete(note.id); onClose(); setShowMore(false); }}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-card-foreground hover:bg-secondary transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Xoá ghi chú
                  </button>
                  <button
                    onClick={() => { toggleChecklist(); setShowMore(false); }}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-card-foreground hover:bg-secondary transition-colors"
                  >
                    <CheckSquare className="w-4 h-4" />
                    {isChecklist ? "Ẩn hộp kiểm" : "Hiện hộp kiểm"}
                  </button>
                  <button
                    onClick={() => setShowMore(false)}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-card-foreground hover:bg-secondary transition-colors"
                  >
                    <Tag className="w-4 h-4" />
                    Thêm nhãn
                  </button>
                  <button
                    onClick={() => setShowMore(false)}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-card-foreground hover:bg-secondary transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    Tạo bản sao
                  </button>
                </div>
              )}
            </div>

            {/* Undo / Redo */}
            <button onClick={undo} disabled={historyIndex <= 0} className="p-2 rounded-full hover:bg-secondary/50 transition-colors disabled:opacity-30" title="Hoàn tác">
              <Undo2 className="w-4 h-4 text-keep-toolbar" />
            </button>
            <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-2 rounded-full hover:bg-secondary/50 transition-colors disabled:opacity-30" title="Làm lại">
              <Redo2 className="w-4 h-4 text-keep-toolbar" />
            </button>
          </div>

          <button
            onClick={handleSaveAndClose}
            className="px-6 py-1.5 text-sm font-medium text-foreground hover:bg-secondary/50 rounded transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteEditDialog;
