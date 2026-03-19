import { useState, useRef, useCallback, useEffect } from "react";
import { useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setShowMore, setShowColors, setShowFormatting,
  setIsChecklist, setChecklistItems, toggleChecklistItem,
  updateChecklistItem as updateChecklistItemAction,
  removeChecklistItem as removeChecklistItemAction,
  addChecklistItem, insertChecklistItem, setShowCompleted,
  resetEditorState,
} from "@/store/editorSlice";

export interface ChecklistItem {
  text: string;
  checked: boolean;
}

interface UseNoteEditorOptions {
  initialTitle?: string;
  initialContent?: string;
  containerRef: React.RefObject<HTMLElement>;
}

export function useNoteEditor({ initialTitle = "", initialContent = "", containerRef }: UseNoteEditorOptions) {
  const dispatch = useAppDispatch();
  const {
    showMore, showColors, showFormatting,
    isChecklist, checklistItems, showCompleted,
  } = useAppSelector((state) => state.editor);

  // Local state for title/content (per-instance, not global)
  const titleRef = useRef(initialTitle);
  const contentRef = useRef(initialContent);
  const [title, setTitle] = [titleRef.current, (val: string) => { titleRef.current = val; }];

  const moreRef = useRef<HTMLDivElement>(null);
  const colorRef = useRef<HTMLDivElement>(null);
  const activeFormatsRef = useRef<Set<string>>(new Set());

  // Force re-render helper
  const [, forceUpdate] = useForceUpdate();

  // Tiptap editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2] },
      }),
      Underline,
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      contentRef.current = html === "<p></p>" ? "" : html;
    },
    onSelectionUpdate: ({ editor }) => {
      updateFormatsFromEditor(editor);
    },
    onTransaction: ({ editor }) => {
      updateFormatsFromEditor(editor);
    },
  });

  const updateFormatsFromEditor = useCallback((ed: Editor) => {
    const formats = new Set<string>();
    if (ed.isActive("bold")) formats.add("bold");
    if (ed.isActive("italic")) formats.add("italic");
    if (ed.isActive("underline")) formats.add("underline");
    if (ed.isActive("strike")) formats.add("strikeThrough");
    if (ed.isActive("heading", { level: 1 })) formats.add("h1");
    if (ed.isActive("heading", { level: 2 })) formats.add("h2");
    activeFormatsRef.current = formats;
    forceUpdate();
  }, [forceUpdate]);

  const undo = useCallback(() => {
    editor?.commands.undo();
  }, [editor]);

  const redo = useCallback(() => {
    editor?.commands.redo();
  }, [editor]);

  const canUndo = editor?.can().undo() ?? false;
  const canRedo = editor?.can().redo() ?? false;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) dispatch(setShowMore(false));
      if (colorRef.current && !colorRef.current.contains(e.target as Node)) dispatch(setShowColors(false));
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dispatch]);

  const handleTitleChange = useCallback((val: string) => {
    titleRef.current = val;
    forceUpdate();
  }, [forceUpdate]);

  const handleContentInput = useCallback(() => {}, []);

  const toggleChecklist = useCallback(() => {
    if (!isChecklist) {
      const text = editor?.getText() || contentRef.current.replace(/<[^>]*>/g, '');
      const lines = text.split("\n").filter(l => l.trim());
      dispatch(setChecklistItems(lines.length > 0 ? lines.map(l => ({ text: l, checked: false })) : [{ text: "", checked: false }]));
      dispatch(setIsChecklist(true));
    } else {
      contentRef.current = checklistItems.filter(i => i.text.trim()).map(i => i.text).join("\n");
      editor?.commands.setContent(checklistItems.filter(i => i.text.trim()).map(i => `<p>${i.text}</p>`).join(""));
      dispatch(setIsChecklist(false));
    }
  }, [isChecklist, checklistItems, editor, dispatch]);

  const handleUpdateChecklistItem = useCallback((index: number, text: string) => {
    dispatch(updateChecklistItemAction({ index, text }));
  }, [dispatch]);

  const handleToggleChecklistItem = useCallback((index: number) => {
    dispatch(toggleChecklistItem(index));
  }, [dispatch]);

  const handleChecklistKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      dispatch(insertChecklistItem({ index }));
      setTimeout(() => {
        containerRef.current?.querySelectorAll<HTMLInputElement>(".checklist-input")?.[index + 1]?.focus();
      }, 0);
    }
    if (e.key === "Backspace" && checklistItems[index]?.text === "" && checklistItems.length > 1) {
      e.preventDefault();
      dispatch(removeChecklistItemAction(index));
      setTimeout(() => {
        containerRef.current?.querySelectorAll<HTMLInputElement>(".checklist-input")?.[Math.max(0, index - 1)]?.focus();
      }, 0);
    }
  }, [checklistItems, containerRef, dispatch]);

  const handleRemoveChecklistItem = useCallback((index: number) => {
    dispatch(removeChecklistItemAction(index));
  }, [dispatch]);

  const applyFormat = useCallback((command: string) => {
    if (!editor) return;
    switch (command) {
      case "bold": editor.chain().focus().toggleBold().run(); break;
      case "italic": editor.chain().focus().toggleItalic().run(); break;
      case "underline": editor.chain().focus().toggleUnderline().run(); break;
      case "strikeThrough": editor.chain().focus().toggleStrike().run(); break;
    }
  }, [editor]);

  const applyHeading = useCallback((tag: string) => {
    if (!editor) return;
    if (tag === "h1") {
      if (editor.isActive("heading", { level: 1 })) {
        editor.chain().focus().setParagraph().run();
      } else {
        editor.chain().focus().toggleHeading({ level: 1 }).run();
      }
    } else if (tag === "h2") {
      if (editor.isActive("heading", { level: 2 })) {
        editor.chain().focus().setParagraph().run();
      } else {
        editor.chain().focus().toggleHeading({ level: 2 }).run();
      }
    } else {
      editor.chain().focus().setParagraph().run();
    }
  }, [editor]);

  const getContent = useCallback(() => {
    if (isChecklist) {
      return checklistItems
        .filter(item => item.text.trim())
        .map(item => `${item.checked ? "☑" : "☐"} ${item.text}`)
        .join("\n");
    }
    const html = editor?.getHTML() || contentRef.current;
    return html === "<p></p>" ? "" : html;
  }, [isChecklist, checklistItems, editor]);

  const resetEditor = useCallback((newTitle = "", newContent = "") => {
    titleRef.current = newTitle;
    contentRef.current = newContent;
    editor?.commands.setContent(newContent);
    dispatch(resetEditorState());
    forceUpdate();
  }, [editor, dispatch, forceUpdate]);

  const initFromContent = useCallback((noteTitle: string, noteContent: string) => {
    titleRef.current = noteTitle;
    contentRef.current = noteContent;
    editor?.commands.setContent(noteContent);
    dispatch(setShowMore(false));
    dispatch(setShowColors(false));
    dispatch(setShowFormatting(false));

    // Detect checklist
    const lines = noteContent.split("\n");
    const isChecklistContent = lines.some(l => l.startsWith("☐ ") || l.startsWith("☑ "));
    if (isChecklistContent) {
      dispatch(setIsChecklist(true));
      dispatch(setChecklistItems(
        lines.filter(l => l.trim()).map(l => {
          if (l.startsWith("☑ ")) return { text: l.slice(2), checked: true };
          if (l.startsWith("☐ ")) return { text: l.slice(2), checked: false };
          return { text: l, checked: false };
        })
      ));
    } else {
      dispatch(setIsChecklist(false));
      dispatch(setChecklistItems([]));
    }
    forceUpdate();
  }, [editor, dispatch, forceUpdate]);

  return {
    // State
    title: titleRef.current, content: contentRef.current,
    showMore, showColors, showFormatting, isChecklist,
    checklistItems, showCompleted, activeFormats: activeFormatsRef.current,
    canUndo, canRedo,
    // Refs
    moreRef, colorRef,
    // Tiptap editor instance
    editor,
    // Setters (dispatch wrappers)
    setTitle: handleTitleChange,
    setContent: (val: string) => { contentRef.current = val; },
    setShowMore: (val: boolean) => dispatch(setShowMore(val)),
    setShowColors: (val: boolean) => dispatch(setShowColors(val)),
    setShowFormatting: (val: boolean) => dispatch(setShowFormatting(val)),
    setChecklistItems: (items: ChecklistItem[]) => dispatch(setChecklistItems(items)),
    setShowCompleted: (val: boolean) => dispatch(setShowCompleted(val)),
    // Actions
    handleTitleChange, handleContentInput, toggleChecklist,
    updateChecklistItem: handleUpdateChecklistItem,
    toggleChecklistItem: handleToggleChecklistItem,
    handleChecklistKeyDown,
    removeChecklistItem: handleRemoveChecklistItem,
    applyFormat, applyHeading,
    undo, redo, getContent, resetEditor, initFromContent,
  };
}

function useForceUpdate() {
  const [, setState] = useState(0);
  return [undefined, useCallback(() => setState((c: number) => c + 1), [])] as const;
}
