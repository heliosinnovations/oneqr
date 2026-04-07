"use client";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { useEffect } from "react";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  showLists?: boolean;
}

interface ToolbarProps {
  editor: Editor;
  showLists?: boolean;
}

function Toolbar({ editor, showLists = false }: ToolbarProps) {
  const toggleBold = () => {
    editor.chain().focus().toggleBold().run();
  };

  const toggleItalic = () => {
    editor.chain().focus().toggleItalic().run();
  };

  const toggleUnderline = () => {
    editor.chain().focus().toggleUnderline().run();
  };

  const setAlignment = (alignment: "left" | "center" | "right") => {
    editor.chain().focus().setTextAlign(alignment).run();
  };

  const toggleBulletList = () => {
    editor.chain().focus().toggleBulletList().run();
  };

  const toggleOrderedList = () => {
    editor.chain().focus().toggleOrderedList().run();
  };

  const setHeading = (level: 1 | 2 | 3 | "normal") => {
    if (level === "normal") {
      editor.chain().focus().setParagraph().run();
    } else {
      editor.chain().focus().toggleHeading({ level }).run();
    }
  };

  const getCurrentHeading = () => {
    if (editor.isActive("heading", { level: 1 })) return "h1";
    if (editor.isActive("heading", { level: 2 })) return "h2";
    if (editor.isActive("heading", { level: 3 })) return "h3";
    return "normal";
  };

  return (
    <div className="rich-editor-toolbar">
      <select
        className="tb-select"
        value={getCurrentHeading()}
        onChange={(e) => {
          const val = e.target.value;
          if (val === "h1") setHeading(1);
          else if (val === "h2") setHeading(2);
          else if (val === "h3") setHeading(3);
          else setHeading("normal");
        }}
      >
        <option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
        <option value="normal">Normal</option>
      </select>
      <div className="tb-divider" />
      <div className="toolbar-group">
        <button
          type="button"
          onClick={toggleBold}
          className={`tb-btn ${editor.isActive("bold") ? "active" : ""}`}
          title="Bold"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
            <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={toggleItalic}
          className={`tb-btn ${editor.isActive("italic") ? "active" : ""}`}
          title="Italic"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="19" y1="4" x2="10" y2="4" />
            <line x1="14" y1="20" x2="5" y2="20" />
            <line x1="15" y1="4" x2="9" y2="20" />
          </svg>
        </button>
        <button
          type="button"
          onClick={toggleUnderline}
          className={`tb-btn ${editor.isActive("underline") ? "active" : ""}`}
          title="Underline"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" />
            <line x1="4" y1="21" x2="20" y2="21" />
          </svg>
        </button>
      </div>
      <div className="tb-divider" />
      <div className="toolbar-group">
        <button
          type="button"
          onClick={() => setAlignment("left")}
          className={`tb-btn ${editor.isActive({ textAlign: "left" }) ? "active" : ""}`}
          title="Align Left"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="17" y1="10" x2="3" y2="10" />
            <line x1="21" y1="6" x2="3" y2="6" />
            <line x1="21" y1="14" x2="3" y2="14" />
            <line x1="17" y1="18" x2="3" y2="18" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => setAlignment("center")}
          className={`tb-btn ${editor.isActive({ textAlign: "center" }) ? "active" : ""}`}
          title="Align Center"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="18" y1="10" x2="6" y2="10" />
            <line x1="21" y1="6" x2="3" y2="6" />
            <line x1="21" y1="14" x2="3" y2="14" />
            <line x1="18" y1="18" x2="6" y2="18" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => setAlignment("right")}
          className={`tb-btn ${editor.isActive({ textAlign: "right" }) ? "active" : ""}`}
          title="Align Right"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="21" y1="10" x2="7" y2="10" />
            <line x1="21" y1="6" x2="3" y2="6" />
            <line x1="21" y1="14" x2="3" y2="14" />
            <line x1="21" y1="18" x2="7" y2="18" />
          </svg>
        </button>
      </div>
      {showLists && (
        <>
          <div className="tb-divider" />
          <div className="toolbar-group">
            <button
              type="button"
              onClick={toggleBulletList}
              className={`tb-btn ${editor.isActive("bulletList") ? "active" : ""}`}
              title="Bullet List"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </button>
            <button
              type="button"
              onClick={toggleOrderedList}
              className={`tb-btn ${editor.isActive("orderedList") ? "active" : ""}`}
              title="Numbered List"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="10" y1="6" x2="21" y2="6" />
                <line x1="10" y1="12" x2="21" y2="12" />
                <line x1="10" y1="18" x2="21" y2="18" />
                <path d="M4 6h1v4" />
                <path d="M4 10h2" />
                <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = "Type something...",
  showLists = false,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: showLists ? {} : false,
        orderedList: showLists ? {} : false,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
    ],
    content,
    editorProps: {
      attributes: {
        class: "rich-editor-content",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Update editor content when external content changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const charCount = editor?.getText().length || 0;

  return (
    <div className="rich-editor">
      {editor && <Toolbar editor={editor} showLists={showLists} />}
      <div className="rich-editor-content-wrapper">
        <EditorContent editor={editor} />
        {charCount === 0 && (
          <div className="rich-editor-placeholder">{placeholder}</div>
        )}
      </div>
      <div className="rich-editor-footer">
        <span>{charCount} characters</span>
        <span>{showLists ? "Lists supported" : "Markdown supported"}</span>
      </div>
    </div>
  );
}
