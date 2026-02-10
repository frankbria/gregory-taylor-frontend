'use client'

import { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'

export default function TipTapEditor({ content = '', onChange, editable = true }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content,
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML())
      }
    },
  })

  // Sync content prop changes (e.g. async page load) into the editor
  useEffect(() => {
    if (!editor) return
    const html = content || ''
    if (editor.getHTML() !== html) {
      editor.commands.setContent(html, false)
    }
  }, [editor, content])

  if (!editor) return null

  const activeClass = 'bg-gray-800 text-white'
  const inactiveClass = 'bg-white hover:bg-gray-100'
  const btnBase = 'px-2 py-1 text-sm rounded'

  const getButtonClass = (type, attrs) =>
    `${btnBase} ${editor.isActive(type, attrs) ? activeClass : inactiveClass}`

  const handleLink = () => {
    const url = window.prompt('Enter URL')
    if (url === null) return
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    } else {
      editor.chain().focus().unsetLink().run()
    }
  }

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden">
      {editable && (
        <div className="flex flex-wrap gap-1 p-2 border-b border-gray-300 bg-gray-50">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={getButtonClass('bold')}
            aria-label="Bold"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={getButtonClass('italic')}
            aria-label="Italic"
          >
            <em>I</em>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={getButtonClass('heading', { level: 1 })}
            aria-label="Heading 1"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={getButtonClass('heading', { level: 2 })}
            aria-label="Heading 2"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={getButtonClass('heading', { level: 3 })}
            aria-label="Heading 3"
          >
            H3
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={getButtonClass('bulletList')}
            aria-label="Bullet List"
          >
            UL
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={getButtonClass('orderedList')}
            aria-label="Ordered List"
          >
            OL
          </button>
          <button
            type="button"
            onClick={handleLink}
            className={getButtonClass('link')}
            aria-label="Link"
          >
            Link
          </button>
        </div>
      )}
      <div className="p-4 min-h-[200px] prose max-w-none">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
