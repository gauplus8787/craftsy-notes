import { useState, useRef, useCallback, useEffect } from "react";

export interface ChecklistItem {
  text: string;
  checked: boolean;
}

export interface HistoryEntry {
  title: string;
  content: string;
}

interface UseNoteEditorOptions {
  initialTitle?: string;
  initialContent?: string;
  containerRef: React.RefObject<HTMLElement>;
}

export function useNoteEditor({ initialTitle = "", initialContent = "", containerRef }: UseNoteEditorOptions) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [showMore, setShowMore] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [showFormatting, setShowFormatting] = useState(false);
  const [isChecklist, setIsChecklist] = useState(false);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [showCompleted, setShowCompleted] = useState(true);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());

  // Undo/Redo
  const [history, setHistory] = useState<HistoryEntry[]>([{ title: initialTitle, content: initialContent }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const historyTimeout = useRef<ReturnType<typeof setTimeout>>();

  const contentRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const colorRef = useRef<HTMLDivElement>(null);

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

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const i = historyIndex - 1;
      setHistoryIndex(i);
      setTitle(history[i].title);
      setContent(history[i].content);
      if (contentRef.current) contentRef.current.innerHTML = history[i].content;
    }
  }, [historyIndex, history]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const i = historyIndex + 1;
      setHistoryIndex(i);
      setTitle(history[i].title);
      setContent(history[i].content);
      if (contentRef.current) contentRef.current.innerHTML = history[i].content;
    }
  }, [historyIndex, history]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setShowMore(false);
      if (colorRef.current && !colorRef.current.contains(e.target as Node)) setShowColors(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Track active formatting states
  const updateActiveFormats = useCallback(() => {
    const formats = new Set<string>();
    if (document.queryCommandState("bold")) formats.add("bold");
    if (document.queryCommandState("italic")) formats.add("italic");
    if (document.queryCommandState("underline")) formats.add("underline");
    if (document.queryCommandState("strikeThrough")) formats.add("strikeThrough");
    const block = document.queryCommandValue("formatBlock");
    if (block) formats.add(block.toLowerCase());
    setActiveFormats(formats);
  }, []);

  useEffect(() => {
    document.addEventListener("selectionchange", updateActiveFormats);
    return () => document.removeEventListener("selectionchange", updateActiveFormats);
  }, [updateActiveFormats]);

  const handleTitleChange = useCallback((val: string) => {
    setTitle(val);
    pushHistory(val, content);
  }, [content, pushHistory]);

  const handleContentInput = useCallback(() => {
    const html = contentRef.current?.innerHTML || "";
    setContent(html);
    pushHistory(title, html);
  }, [title, pushHistory]);

  const toggleChecklist = useCallback(() => {
    if (!isChecklist) {
      const lines = content.split("\n").filter(l => l.trim());
      setChecklistItems(lines.length > 0 ? lines.map(l => ({ text: l, checked: false })) : [{ text: "", checked: false }]);
      setIsChecklist(true);
    } else {
      setContent(checklistItems.filter(i => i.text.trim()).map(i => i.text).join("\n"));
      setIsChecklist(false);
    }
  }, [isChecklist, content, checklistItems]);

  const updateChecklistItem = useCallback((index: number, text: string) => {
    setChecklistItems(prev => prev.map((item, i) => i === index ? { ...item, text } : item));
  }, []);

  const toggleChecklistItem = useCallback((index: number) => {
    setChecklistItems(prev => prev.map((item, i) => i === index ? { ...item, checked: !item.checked } : item));
  }, []);

  const handleChecklistKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setChecklistItems(prev => {
        const newItems = [...prev];
        newItems.splice(index + 1, 0, { text: "", checked: false });
        return newItems;
      });
      setTimeout(() => {
        containerRef.current?.querySelectorAll<HTMLInputElement>(".checklist-input")?.[index + 1]?.focus();
      }, 0);
    }
    if (e.key === "Backspace" && checklistItems[index]?.text === "" && checklistItems.length > 1) {
      e.preventDefault();
      setChecklistItems(prev => prev.filter((_, i) => i !== index));
      setTimeout(() => {
        containerRef.current?.querySelectorAll<HTMLInputElement>(".checklist-input")?.[Math.max(0, index - 1)]?.focus();
      }, 0);
    }
  }, [checklistItems, containerRef]);

  const removeChecklistItem = useCallback((index: number) => {
    if (checklistItems.length > 1) setChecklistItems(prev => prev.filter((_, i) => i !== index));
  }, [checklistItems.length]);

  const applyFormat = useCallback((command: string, value?: string) => {
    contentRef.current?.focus();
    document.execCommand(command, false, value);
    setTimeout(updateActiveFormats, 0);
  }, [updateActiveFormats]);

  const applyHeading = useCallback((tag: string) => {
    contentRef.current?.focus();
    const current = document.queryCommandValue("formatBlock").toLowerCase();
    if (current === tag) {
      document.execCommand("formatBlock", false, "div");
    } else {
      document.execCommand("formatBlock", false, tag);
    }
    setTimeout(updateActiveFormats, 0);
  }, [updateActiveFormats]);

  const getContent = useCallback(() => {
    if (isChecklist) {
      return checklistItems
        .filter(item => item.text.trim())
        .map(item => `${item.checked ? "☑" : "☐"} ${item.text}`)
        .join("\n");
    }
    return contentRef.current?.innerHTML || content;
  }, [isChecklist, checklistItems, content]);

  const resetEditor = useCallback((newTitle = "", newContent = "") => {
    setTitle(newTitle);
    setContent(newContent);
    if (contentRef.current) contentRef.current.innerHTML = newContent;
    setShowMore(false);
    setShowColors(false);
    setShowFormatting(false);
    setIsChecklist(false);
    setChecklistItems([]);
    setShowCompleted(true);
    setHistory([{ title: newTitle, content: newContent }]);
    setHistoryIndex(0);
  }, []);

  const initFromContent = useCallback((noteTitle: string, noteContent: string) => {
    setTitle(noteTitle);
    setContent(noteContent);
    setShowMore(false);
    setShowColors(false);
    setShowFormatting(false);
    setHistory([{ title: noteTitle, content: noteContent }]);
    setHistoryIndex(0);

    // Detect checklist
    const lines = noteContent.split("\n");
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
  }, []);

  return {
    // State
    title, content, showMore, showColors, showFormatting, isChecklist,
    checklistItems, showCompleted, activeFormats, history, historyIndex,
    // Refs
    contentRef, moreRef, colorRef,
    // Setters
    setTitle, setContent, setShowMore, setShowColors, setShowFormatting,
    setChecklistItems, setShowCompleted,
    // Actions
    handleTitleChange, handleContentInput, toggleChecklist,
    updateChecklistItem, toggleChecklistItem, handleChecklistKeyDown,
    removeChecklistItem, applyFormat, applyHeading,
    undo, redo, getContent, resetEditor, initFromContent,
  };
}
