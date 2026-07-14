"use client";
import { plainTextToHtml } from "@/utils/textToHtml";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import {
  RiBold,
  RiH1,
  RiH2,
  RiItalic,
  RiListOrdered,
  RiListUnordered,
  RiMarkPenLine,
  RiUnderline,
} from "react-icons/ri";

export default function RichTextEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight.configure({
        multicolor: true,
      }),
    ],
    content: plainTextToHtml(value),
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "tiptap-editor min-h-[160px] px-3 py-2 focus:outline-none",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;

    if (editor.getHTML() !== (value || "")) {
      editor.commands.setContent(value || "", false);
    }
  }, [editor, value]);

  if (!editor) return null;

  const btnClass = (active) =>
    `p-2 rounded ${active ? "bg-gray-800 text-white" : "text-gray-600 hover:bg-gray-100"}`;

  return (
    <div className="border border-gray-300 rounded-md">
      <div className="flex flex-wrap gap-1 border-b border-gray-200 p-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={btnClass(editor.isActive("bold"))}
        >
          <RiBold />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={btnClass(editor.isActive("italic"))}
        >
          <RiItalic />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={btnClass(editor.isActive("underline"))}
        >
          <RiUnderline />
        </button>
        <button
          type="button"
          onClick={() => {
            console.log(
              editor.can().chain().focus().toggleHeading({ level: 1 }).run(),
            );
            editor.chain().focus().toggleHeading({ level: 1 }).run();
          }}
        >
          H1
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={btnClass(editor.isActive("heading", { level: 2 }))}
        >
          <RiH2 />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={btnClass(editor.isActive("bulletList"))}
        >
          <RiListUnordered />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={btnClass(editor.isActive("orderedList"))}
        >
          <RiListOrdered />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={btnClass(editor.isActive("highlight"))}
        >
          <RiMarkPenLine />
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
