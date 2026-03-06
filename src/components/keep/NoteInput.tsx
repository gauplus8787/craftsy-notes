import { useRef, useState, useCallback, useEffect } from "react";
import {
  CheckSquare,
  Paintbrush,
  Image as ImageIcon,
  Pin,
  Palette,
  Bell,
  UserPlus,
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
  GripVertical
} from "lucide-react";
import { noteColors, getColorClass } from "./noteColors";

interface NoteInputProps {
  onAddNote: (title: string, content: string, options?: { color?: string; pinned?: boolean; archived?: boolean }) => void;
}

interface HistoryEntry {
  title: string;
  content: string;
}

const NoteInput = ({ onAddNote }: NoteInputProps) => {
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState("default");
  const [pinned, setPinned] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [showFormatting, setShowFormatting] = useState(false);
  const [isChecklist, setIsChecklist] = useState(false);
  const [checklistItems, setChecklistItems] = useState<{ text: string; checked: boolean }[]>([{ text: "", checked: false }]);
  const [showCompleted, setShowCompleted] = useState(true);

  // Undo/Redo
  const [history, setHistory] = useState<HistoryEntry[]>([{ title: "", content: "" }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const historyTimeout = useRef<ReturnType<typeof setTimeout>>();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const colorRef = useRef<HTMLDivElement>(null);
  const formatRef = useRef<HTMLDivElement>(null);

  // Push to history with debounce
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
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setTitle(history[newIndex].title);
      setContent(history[newIndex].content);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setTitle(history[newIndex].title);
      setContent(history[newIndex].content);
    }
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        if (expanded) handleClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  });

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setShowMore(false);
      if (colorRef.current && !colorRef.current.contains(e.target as Node)) setShowColors(false);
      if (formatRef.current && !formatRef.current.contains(e.target as Node)) setShowFormatting(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleClose = () => {
    let finalContent = content;
    if (isChecklist) {
      finalContent = checklistItems
        .filter(item => item.text.trim())
        .map(item => `${item.checked ? "☑" : "☐"} ${item.text}`)
        .join("\n");
    }
    if (title.trim() || finalContent.trim()) {
      onAddNote(title, finalContent, { color, pinned, archived: false });
    }
    resetState();
  };

  const handleArchive = () => {
    let finalContent = content;
    if (isChecklist) {
      finalContent = checklistItems
        .filter(item => item.text.trim())
        .map(item => `${item.checked ? "☑" : "☐"} ${item.text}`)
        .join("\n");
    }
    if (title.trim() || finalContent.trim()) {
      onAddNote(title, finalContent, { color, pinned: false, archived: true });
    }
    resetState();
  };

  const resetState = () => {
    setTitle("");
    setContent("");
    setColor("default");
    setPinned(false);
    setExpanded(false);
    setShowMore(false);
    setShowColors(false);
    setShowFormatting(false);
    setIsChecklist(false);
    setChecklistItems([{ text: "", checked: false }]);
    setHistory([{ title: "", content: "" }]);
    setHistoryIndex(0);
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
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    }
  };

  const toggleChecklist = () => {
    if (!isChecklist) {
      // Convert content to checklist
      const lines = content.split("\n").filter(l => l.trim());
      setChecklistItems(
        lines.length > 0
          ? lines.map(l => ({ text: l, checked: false }))
          : [{ text: "", checked: false }]
      );
      setIsChecklist(true);
    } else {
      // Convert checklist to content
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
        const inputs = containerRef.current?.querySelectorAll<HTMLInputElement>(".checklist-input");
        inputs?.[index + 1]?.focus();
      }, 0);
    }
    if (e.key === "Backspace" && checklistItems[index].text === "" && checklistItems.length > 1) {
      e.preventDefault();
      const newItems = checklistItems.filter((_, i) => i !== index);
      setChecklistItems(newItems);
      setTimeout(() => {
        const inputs = containerRef.current?.querySelectorAll<HTMLInputElement>(".checklist-input");
        inputs?.[Math.max(0, index - 1)]?.focus();
      }, 0);
    }
  };

  const removeChecklistItem = (index: number) => {
    if (checklistItems.length > 1) {
      setChecklistItems(checklistItems.filter((_, i) => i !== index));
    }
  };

  // Insert formatting markers
  const insertFormat = (prefix: string, suffix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const newContent = content.substring(0, start) + prefix + selected + suffix + content.substring(end);
    handleContentChange(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const colorClass = getColorClass(color);

  if (!expanded) {
    return (
      <div className="max-w-[600px] mx-auto mb-8">
        <div
          onClick={() => setExpanded(true)}
          className="flex items-center keep-shadow rounded-lg px-4 py-3 cursor-text bg-card"
        >
          <span className="flex-1 text-muted-foreground text-base">Tạo ghi chú...</span>
          <div className="flex items-center gap-4">
            <button onClick={(e) => { e.stopPropagation(); setExpanded(true); setIsChecklist(true); setChecklistItems([{ text: "", checked: false }]); }}>
              <CheckSquare className="w-5 h-5 text-keep-icon" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); setExpanded(true); }}>
              <Paintbrush className="w-5 h-5 text-keep-icon" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); setExpanded(true); }}>
              <ImageIcon className="w-5 h-5 text-keep-icon" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[600px] mx-auto mb-8" ref={containerRef}>
      <div className={`keep-shadow h-auto rounded-lg relative transition-colors ${colorClass}`}>
        {/* Pin */}
        <button
          onClick={() => setPinned(!pinned)}
          className="absolute top-2 right-2 p-2 rounded-full hover:bg-secondary/50 transition-colors z-10"
          title={pinned ? "Bỏ ghim" : "Ghim ghi chú"}
        >
          <Pin className={`w-5 h-5 ${pinned ? "text-foreground fill-foreground" : "text-keep-icon"}`} />
        </button>

        {/* Title */}
        <input
          type="text"
          placeholder="Tiêu đề"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="w-full px-4 pt-3 pb-1 bg-transparent outline-none text-foreground font-medium placeholder:text-muted-foreground pr-12"
          autoFocus
        />

        {/* Content area */}
        <div className="py-1">
          {isChecklist ? (
            <div className="px-2 space-y-0.5">
              {/* Unchecked items */}
              {checklistItems.filter(item => !item.checked).length > 0 && (
                checklistItems.map((item, index) => !item.checked && (
                  <div key={index} className="flex items-center gap-1 group/item">
                    <GripVertical className="w-4 h-4 text-muted-foreground/40 cursor-grab opacity-0 group-hover/item:opacity-100 transition-opacity" />
                    <input
                      type="checkbox"
                      checked={false}
                      onChange={() => toggleChecklistItem(index)}
                      className="w-[18px] h-[18px] rounded border-muted-foreground/50 accent-primary cursor-pointer"
                    />
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) => updateChecklistItem(index, e.target.value)}
                      onKeyDown={(e) => handleChecklistKeyDown(index, e)}
                      placeholder="Mục danh sách"
                      className="checklist-input flex-1 px-2 py-1.5 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                    />
                    <button
                      onClick={() => removeChecklistItem(index)}
                      className="p-1 rounded-full opacity-0 group-hover/item:opacity-100 hover:bg-secondary/50 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5 text-keep-icon" />
                    </button>
                  </div>
                ))
              )}

              {/* Add item button */}
              <button
                onClick={() => setChecklistItems([...checklistItems, { text: "", checked: false }])}
                className="flex items-center gap-2 px-5 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="text-lg leading-none">+</span> Mục danh sách
              </button>

              {/* Completed items section */}
              {checklistItems.some(item => item.checked) && (
                <div className="border-t border-border/40 mt-1 pt-1">
                  <button
                    onClick={() => setShowCompleted(!showCompleted)}
                    className="flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
                  >
                    <svg className={`w-4 h-4 transition-transform ${showCompleted ? "rotate-0" : "-rotate-90"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                    {checklistItems.filter(i => i.checked).length} mục đã hoàn tất
                  </button>
                  {showCompleted && checklistItems.map((item, index) => item.checked && (
                    <div key={index} className="flex items-center gap-1 group/item">
                      <GripVertical className="w-4 h-4 text-muted-foreground/40 cursor-grab opacity-0 group-hover/item:opacity-100 transition-opacity" />
                      <input
                        type="checkbox"
                        checked={true}
                        onChange={() => toggleChecklistItem(index)}
                        className="w-[18px] h-[18px] rounded border-muted-foreground/50 accent-primary cursor-pointer"
                      />
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) => updateChecklistItem(index, e.target.value)}
                        onKeyDown={(e) => handleChecklistKeyDown(index, e)}
                        className="checklist-input flex-1 px-2 py-1.5 bg-transparent outline-none text-sm line-through text-muted-foreground"
                      />
                      <button
                        onClick={() => removeChecklistItem(index)}
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
              className="w-full px-4 mb-1 bg-transparent outline-none text-foreground text-sm placeholder:text-muted-foreground resize-none overflow-hidden"
            />
          )}
        </div>

        {/* Formatting toolbar */}
        {showFormatting && !isChecklist && (
          <div className="flex items-center gap-0.5 px-2 py-1 border-t border-border/30">
            <button onClick={() => insertFormat("**", "**")} className="p-2 rounded-full hover:bg-secondary/50 transition-colors" title="Đậm">
              <Bold className="w-4 h-4 text-keep-toolbar" />
            </button>
            <button onClick={() => insertFormat("_", "_")} className="p-2 rounded-full hover:bg-secondary/50 transition-colors" title="Nghiêng">
              <Italic className="w-4 h-4 text-keep-toolbar" />
            </button>
            <button onClick={() => insertFormat("<u>", "</u>")} className="p-2 rounded-full hover:bg-secondary/50 transition-colors" title="Gạch chân">
              <Underline className="w-4 h-4 text-keep-toolbar" />
            </button>
            <button onClick={() => insertFormat("~~", "~~")} className="p-2 rounded-full hover:bg-secondary/50 transition-colors" title="Gạch ngang">
              <Strikethrough className="w-4 h-4 text-keep-toolbar" />
            </button>
            <div className="w-px h-5 bg-border/50 mx-1" />
            <button onClick={() => insertFormat("- ", "")} className="p-2 rounded-full hover:bg-secondary/50 transition-colors" title="Danh sách">
              <List className="w-4 h-4 text-keep-toolbar" />
            </button>
            <button onClick={() => insertFormat("1. ", "")} className="p-2 rounded-full hover:bg-secondary/50 transition-colors" title="Danh sách số">
              <ListOrdered className="w-4 h-4 text-keep-toolbar" />
            </button>
          </div>
        )}

        {/* Main toolbar */}
        <div className="flex items-center justify-between px-2 py-1.5">
          <div className="flex items-center gap-0.5 flex-wrap">
            {/* Formatting toggle */}
            <div ref={formatRef} className="relative">
              <button
                onClick={() => { setShowFormatting(!showFormatting); setShowColors(false); setShowMore(false); }}
                className={`p-2 rounded-full hover:bg-secondary/50 transition-colors ${showFormatting ? "bg-secondary/50" : ""}`}
                title="Tuỳ chọn định dạng"
              >
                <Baseline className="w-4 h-4 text-keep-toolbar" />
              </button>
            </div>

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
                <div className="absolute top-full left-0 mt-1 p-2 bg-card rounded-lg keep-shadow z-20 flex gap-1 flex-wrap w-[180px] animate-in fade-in zoom-in-95">
                  {noteColors.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => { setColor(c.value); setShowColors(false); }}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${
                        color === c.value ? "border-primary scale-110" : "border-transparent hover:border-keep-icon"
                      } ${c.class}`}
                      title={c.name}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Reminder */}
            <button className="p-2 rounded-full hover:bg-secondary/50 transition-colors" title="Nhắc tôi">
              <Bell className="w-4 h-4 text-keep-toolbar" />
            </button>

            {/* Collaborator */}
            <button className="p-2 rounded-full hover:bg-secondary/50 transition-colors" title="Cộng tác viên">
              <UserPlus className="w-4 h-4 text-keep-toolbar" />
            </button>

            {/* Image */}
            <button className="p-2 rounded-full hover:bg-secondary/50 transition-colors" title="Thêm hình ảnh">
              <ImageIcon className="w-4 h-4 text-keep-toolbar" />
            </button>

            {/* Archive */}
            <button
              onClick={handleArchive}
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
                <div className="absolute top-full left-0 mt-1 bg-card rounded-lg keep-shadow z-20 py-1 min-w-[180px] animate-in fade-in zoom-in-95">
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
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="p-2 rounded-full hover:bg-secondary/50 transition-colors disabled:opacity-30"
              title="Hoàn tác"
            >
              <Undo2 className="w-4 h-4 text-keep-toolbar" />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="p-2 rounded-full hover:bg-secondary/50 transition-colors disabled:opacity-30"
              title="Làm lại"
            >
              <Redo2 className="w-4 h-4 text-keep-toolbar" />
            </button>
          </div>

          <button
            onClick={handleClose}
            className="px-6 py-1.5 text-sm font-medium text-foreground hover:bg-secondary/50 rounded transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteInput;
