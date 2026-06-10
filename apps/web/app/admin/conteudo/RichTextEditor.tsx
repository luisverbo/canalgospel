'use client'

import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import { useRef, useState } from 'react'
import { uploadStudyImage } from './upload-actions'
import {
  Bold, Italic, Underline as UnderlineIcon, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Link as LinkIcon, Image as ImageIcon,
  AlignLeft, AlignCenter, AlignRight, Undo, Redo,
} from 'lucide-react'

interface RichTextEditorProps {
  name: string
  initialHTML?: string
  uploadAction?: (formData: FormData) => Promise<{ url?: string; error?: string }>
}

export function RichTextEditor({ name, initialHTML = '', uploadAction = uploadStudyImage }: RichTextEditorProps) {
  const [html, setHtml] = useState(initialHTML)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: { openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' } },
      }),
      Image.configure({ HTMLAttributes: { class: 'rounded-xl max-w-full' } }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: initialHTML,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[280px] px-4 py-3 focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
  })

  if (!editor) {
    return <div className="border border-[#1E1B2E]/15 rounded-xl min-h-[320px] animate-pulse bg-[#FAF7F1]" />
  }

  const setLink = () => {
    const previous = editor.getAttributes('link').href
    const url = window.prompt('URL do link:', previous ?? 'https://')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError(null)
    try {
      const fd = new FormData()
      fd.set('file', file)
      const result = await uploadAction(fd)
      if (result.error || !result.url) throw new Error(result.error ?? 'Falha no upload')
      editor.chain().focus().setImage({ src: result.url }).run()
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Falha no upload da imagem')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="border border-[#1E1B2E]/15 rounded-xl overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-[#1E1B2E]/10 bg-[#FAF7F1] px-2 py-1.5">
        <Btn editor={editor} onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Negrito"><Bold size={16} /></Btn>
        <Btn editor={editor} onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Itálico"><Italic size={16} /></Btn>
        <Btn editor={editor} onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Sublinhado"><UnderlineIcon size={16} /></Btn>
        <Divider />
        <Btn editor={editor} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Título 1"><Heading1 size={16} /></Btn>
        <Btn editor={editor} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Título 2"><Heading2 size={16} /></Btn>
        <Btn editor={editor} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Título 3"><Heading3 size={16} /></Btn>
        <Divider />
        <Btn editor={editor} onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Lista"><List size={16} /></Btn>
        <Btn editor={editor} onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Lista numerada"><ListOrdered size={16} /></Btn>
        <Btn editor={editor} onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Citação"><Quote size={16} /></Btn>
        <Divider />
        <Btn editor={editor} onClick={setLink} active={editor.isActive('link')} title="Link"><LinkIcon size={16} /></Btn>
        <Btn editor={editor} onClick={() => fileInputRef.current?.click()} active={false} title="Inserir imagem">
          <ImageIcon size={16} />
        </Btn>
        <Divider />
        <Btn editor={editor} onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Alinhar à esquerda"><AlignLeft size={16} /></Btn>
        <Btn editor={editor} onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Centralizar"><AlignCenter size={16} /></Btn>
        <Btn editor={editor} onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Alinhar à direita"><AlignRight size={16} /></Btn>
        <Divider />
        <Btn editor={editor} onClick={() => editor.chain().focus().undo().run()} active={false} title="Desfazer"><Undo size={16} /></Btn>
        <Btn editor={editor} onClick={() => editor.chain().focus().redo().run()} active={false} title="Refazer"><Redo size={16} /></Btn>

        {uploading && <span className="text-xs text-[#8A8797] ml-2">Enviando imagem…</span>}
      </div>

      {uploadError && (
        <div className="bg-red-50 text-red-700 text-xs px-4 py-2">{uploadError}</div>
      )}

      <EditorContent editor={editor} />

      {/* HTML enviado no submit */}
      <input type="hidden" name={name} value={html} />
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
    </div>
  )
}

function Btn({
  onClick, active, title, children,
}: {
  editor: Editor
  onClick: () => void
  active: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-md transition-colors ${
        active ? 'bg-[#2E2860] text-white' : 'text-[#1E1B2E] hover:bg-[#2E2860]/10'
      }`}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <span className="w-px h-5 bg-[#1E1B2E]/10 mx-1" />
}
