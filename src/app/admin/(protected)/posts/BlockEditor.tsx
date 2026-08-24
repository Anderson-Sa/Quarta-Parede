"use client";

import { useRef, useState, useTransition } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Bold,
  Code,
  Columns as ColumnsIcon,
  Copy,
  GripVertical,
  Heading2,
  ImagePlus,
  Images,
  Italic,
  Link2,
  MousePointerClick,
  Plus,
  Sparkles,
  Trash2,
  Type,
  X,
} from "lucide-react";
import { BlockRenderer } from "@/components/BlockRenderer";
import {
  BLOCK_LABELS,
  createBlock,
  parseContent,
  serializeBlocks,
  type BlockType,
  type ColumnsBlockData,
  type ContentBlock,
  type CtaBlockData,
  type GalleryBlockData,
  type HighlightBlockData,
} from "@/lib/contentBlocks";
import { uploadPostImage } from "./actions";

const inputClass =
  "w-full rounded-md border border-surface-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-foreground/30 focus:border-brand";
const labelClass = "mb-1.5 block text-xs font-medium text-foreground/60";

const blockTypeOptions: { type: BlockType; icon: typeof Type; label: string }[] = [
  { type: "markdown", icon: Type, label: BLOCK_LABELS.markdown },
  { type: "columns", icon: ColumnsIcon, label: BLOCK_LABELS.columns },
  { type: "cta", icon: MousePointerClick, label: BLOCK_LABELS.cta },
  { type: "gallery", icon: Images, label: BLOCK_LABELS.gallery },
  { type: "highlight", icon: Sparkles, label: BLOCK_LABELS.highlight },
];

type ToolbarAction = "bold" | "italic" | "heading" | "link" | "image" | "code";

/** Markdown textarea + formatting toolbar, self-contained so each block
 * instance owns its own ref/selection state (no shared textarea to fight
 * over, unlike the old single-field PostForm editor). */
function MarkdownField({
  value,
  onChange,
  rows = 8,
}: {
  value: string;
  onChange: (next: string) => void;
  rows?: number;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function insertAroundSelection(before: string, after: string, placeholder: string) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end) || placeholder;
    const next = value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      textarea.focus();
      const cursorStart = start + before.length;
      textarea.setSelectionRange(cursorStart, cursorStart + selected.length);
    });
  }

  function insertLinePrefix(prefix: string) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const next = value.slice(0, lineStart) + prefix + value.slice(lineStart);
    onChange(next);
    requestAnimationFrame(() => {
      textarea.focus();
      const pos = start + prefix.length;
      textarea.setSelectionRange(pos, pos);
    });
  }

  function runToolbarAction(action: ToolbarAction) {
    switch (action) {
      case "bold":
        insertAroundSelection("**", "**", "negrito");
        break;
      case "italic":
        insertAroundSelection("_", "_", "itálico");
        break;
      case "heading":
        insertLinePrefix("## ");
        break;
      case "link":
        insertAroundSelection("[", "](https://)", "texto do link");
        break;
      case "image":
        insertAroundSelection("![", "](https://)", "descrição da imagem");
        break;
      case "code":
        insertAroundSelection("`", "`", "código");
        break;
    }
  }

  const toolbarButtons: { label: string; icon: typeof Bold; action: ToolbarAction }[] = [
    { label: "Negrito", icon: Bold, action: "bold" },
    { label: "Itálico", icon: Italic, action: "italic" },
    { label: "Título", icon: Heading2, action: "heading" },
    { label: "Link", icon: Link2, action: "link" },
    { label: "Imagem", icon: ImagePlus, action: "image" },
    { label: "Código", icon: Code, action: "code" },
  ];

  return (
    <div>
      <div className="mb-1.5 flex flex-wrap gap-1">
        {toolbarButtons.map(({ label, icon: Icon, action }) => (
          <button
            key={label}
            type="button"
            onClick={() => runToolbarAction(action)}
            title={label}
            aria-label={label}
            className="inline-flex items-center justify-center rounded-md border border-surface-border p-1.5 text-foreground/60 transition-colors hover:border-brand hover:text-brand"
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </div>
      <textarea
        ref={textareaRef}
        rows={rows}
        maxLength={20000}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClass} font-mono`}
      />
    </div>
  );
}

function ColumnsEditor({
  data,
  onChange,
}: {
  data: ColumnsBlockData;
  onChange: (next: ColumnsBlockData) => void;
}) {
  function updateColumn(index: number, markdown: string) {
    const next = data.columns.map((column, i) => (i === index ? { markdown } : column));
    onChange({ columns: next });
  }

  return (
    <div>
      <div className={`grid gap-3 ${data.columns.length >= 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
        {data.columns.map((column, index) => (
          <div key={index} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground/50">Coluna {index + 1}</span>
              {data.columns.length > 2 && (
                <button
                  type="button"
                  onClick={() => onChange({ columns: data.columns.filter((_, i) => i !== index) })}
                  className="text-foreground/40 hover:text-red-400"
                  aria-label="Remover coluna"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <textarea
              rows={6}
              maxLength={5000}
              value={column.markdown}
              onChange={(event) => updateColumn(index, event.target.value)}
              className={`${inputClass} font-mono text-xs`}
            />
          </div>
        ))}
      </div>
      {data.columns.length < 3 && (
        <button
          type="button"
          onClick={() => onChange({ columns: [...data.columns, { markdown: "" }] })}
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-brand hover:underline"
        >
          <Plus className="h-3.5 w-3.5" /> Adicionar coluna
        </button>
      )}
    </div>
  );
}

function CtaEditor({ data, onChange }: { data: CtaBlockData; onChange: (next: CtaBlockData) => void }) {
  return (
    <div className="space-y-3">
      <div>
        <label className={labelClass}>Texto do botão</label>
        <input
          value={data.label}
          onChange={(event) => onChange({ ...data, label: event.target.value })}
          maxLength={100}
          placeholder="Ex: Assine a newsletter"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>URL de destino</label>
        <input
          value={data.url}
          onChange={(event) => onChange({ ...data, url: event.target.value })}
          maxLength={2000}
          placeholder="https://..."
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Estilo</label>
        <select
          value={data.style}
          onChange={(event) => onChange({ ...data, style: event.target.value as CtaBlockData["style"] })}
          className={inputClass}
        >
          <option value="primary">Preenchido</option>
          <option value="secondary">Secundário</option>
          <option value="outline">Contornado</option>
        </select>
      </div>
    </div>
  );
}

function GalleryEditor({
  data,
  onChange,
}: {
  data: GalleryBlockData;
  onChange: (next: GalleryBlockData) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    const picked = Array.from(files);
    startTransition(async () => {
      let images = data.images;
      for (const file of picked) {
        const formData = new FormData();
        formData.set("file", file);
        const result = await uploadPostImage(formData);
        if (result.error) {
          setError(result.error);
          continue;
        }
        if (result.url) {
          images = [...images, { url: result.url, alt: "" }];
          onChange({ images });
        }
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    });
  }

  return (
    <div>
      {data.images.length > 0 && (
        <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {data.images.map((image, index) => (
            <div key={index} className="space-y-1.5 rounded-md border border-surface-border p-2">
              {/* eslint-disable-next-line @next/next/no-img-element -- small local thumbnail, no need for next/image here */}
              <img src={image.url} alt="" className="h-20 w-full rounded object-cover" />
              <input
                value={image.alt}
                onChange={(event) => {
                  const next = data.images.map((img, i) =>
                    i === index ? { ...img, alt: event.target.value } : img,
                  );
                  onChange({ images: next });
                }}
                placeholder="Texto alternativo"
                maxLength={300}
                className={`${inputClass} text-xs`}
              />
              <button
                type="button"
                onClick={() => onChange({ images: data.images.filter((_, i) => i !== index) })}
                className="flex w-full items-center justify-center gap-1 text-xs text-foreground/50 hover:text-red-400"
              >
                <Trash2 className="h-3 w-3" /> Remover
              </button>
            </div>
          ))}
        </div>
      )}

      <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-surface-border px-3 py-2 text-xs font-medium text-foreground/60 hover:border-brand hover:text-brand">
        <ImagePlus className="h-4 w-4" />
        {pending ? "Enviando..." : "Enviar imagens"}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          multiple
          disabled={pending}
          onChange={(event) => handleFiles(event.target.files)}
          className="hidden"
        />
      </label>
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  );
}

function HighlightEditor({
  data,
  onChange,
}: {
  data: HighlightBlockData;
  onChange: (next: HighlightBlockData) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className={labelClass}>Tipo</label>
        <select
          value={data.icon}
          onChange={(event) => onChange({ ...data, icon: event.target.value as HighlightBlockData["icon"] })}
          className={inputClass}
        >
          <option value="info">Informação</option>
          <option value="warning">Aviso</option>
          <option value="tip">Dica</option>
          <option value="quote">Citação</option>
        </select>
      </div>
      <div>
        <label className={labelClass}>Texto</label>
        <textarea
          value={data.text}
          onChange={(event) => onChange({ ...data, text: event.target.value })}
          rows={3}
          maxLength={1000}
          className={inputClass}
        />
      </div>
    </div>
  );
}

function BlockFields({
  block,
  onChange,
}: {
  block: ContentBlock;
  onChange: (data: ContentBlock["data"]) => void;
}) {
  switch (block.type) {
    case "markdown":
      return (
        <MarkdownField value={block.data.markdown} onChange={(markdown) => onChange({ markdown })} />
      );
    case "columns":
      return <ColumnsEditor data={block.data} onChange={onChange} />;
    case "cta":
      return <CtaEditor data={block.data} onChange={onChange} />;
    case "gallery":
      return <GalleryEditor data={block.data} onChange={onChange} />;
    case "highlight":
      return <HighlightEditor data={block.data} onChange={onChange} />;
  }
}

function SortableBlockCard({
  block,
  onChange,
  onDelete,
  onDuplicate,
}: {
  block: ContentBlock;
  onChange: (data: ContentBlock["data"]) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-lg border border-surface-border bg-background"
    >
      <div className="flex items-center justify-between gap-2 border-b border-surface-border px-3 py-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-grab touch-none text-foreground/40 hover:text-foreground/70"
            aria-label="Arrastar para reordenar"
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <span className="text-xs font-semibold uppercase tracking-wide text-foreground/50">
            {BLOCK_LABELS[block.type]}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onDuplicate}
            title="Duplicar bloco"
            aria-label="Duplicar bloco"
            className="rounded-md p-1.5 text-foreground/50 hover:text-brand"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            title="Remover bloco"
            aria-label="Remover bloco"
            className="rounded-md p-1.5 text-foreground/50 hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="p-3">
        <BlockFields block={block} onChange={onChange} />
      </div>
    </div>
  );
}

export function BlockEditor({
  initialContent,
  onDirty,
}: {
  initialContent: string;
  onDirty: () => void;
}) {
  const [blocks, setBlocks] = useState<ContentBlock[]>(() => parseContent(initialContent));
  const [showPreview, setShowPreview] = useState(false);
  const [addMenuOpen, setAddMenuOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function updateBlock(id: string, data: ContentBlock["data"]) {
    setBlocks((prev) => prev.map((block) => (block.id === id ? ({ ...block, data } as ContentBlock) : block)));
    onDirty();
  }

  function deleteBlock(id: string) {
    if (!confirm("Remover este bloco?")) return;
    setBlocks((prev) => prev.filter((block) => block.id !== id));
    onDirty();
  }

  function duplicateBlock(id: string) {
    setBlocks((prev) => {
      const index = prev.findIndex((block) => block.id === id);
      if (index === -1) return prev;
      const copy = { ...prev[index], id: globalThis.crypto.randomUUID() } as ContentBlock;
      return [...prev.slice(0, index + 1), copy, ...prev.slice(index + 1)];
    });
    onDirty();
  }

  function addBlock(type: BlockType) {
    setBlocks((prev) => [...prev, createBlock(type)]);
    setAddMenuOpen(false);
    onDirty();
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setBlocks((prev) => {
      const oldIndex = prev.findIndex((block) => block.id === active.id);
      const newIndex = prev.findIndex((block) => block.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
    onDirty();
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="block text-sm font-medium text-foreground/70">Conteúdo</span>
        <button
          type="button"
          onClick={() => setShowPreview((value) => !value)}
          className="text-xs font-medium text-brand hover:underline"
        >
          {showPreview ? "Ocultar preview" : "Mostrar preview"}
        </button>
      </div>

      <div className={showPreview ? "grid grid-cols-1 gap-4 xl:grid-cols-2" : ""}>
        <div>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={blocks.map((block) => block.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {blocks.map((block) => (
                  <SortableBlockCard
                    key={block.id}
                    block={block}
                    onChange={(data) => updateBlock(block.id, data)}
                    onDelete={() => deleteBlock(block.id)}
                    onDuplicate={() => duplicateBlock(block.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {blocks.length === 0 && (
            <p className="rounded-md border border-dashed border-surface-border p-4 text-center text-sm text-foreground/40">
              Nenhum bloco ainda. Adicione um abaixo.
            </p>
          )}

          <div className="relative mt-3 inline-block">
            <button
              type="button"
              onClick={() => setAddMenuOpen((value) => !value)}
              className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-surface-border px-3 py-2 text-sm font-medium text-foreground/60 hover:border-brand hover:text-brand"
            >
              <Plus className="h-4 w-4" /> Adicionar bloco
            </button>
            {addMenuOpen && (
              <div className="absolute z-10 mt-1 w-56 rounded-md border border-surface-border bg-surface-muted p-1 shadow-lg">
                {blockTypeOptions.map(({ type, icon: Icon, label }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => addBlock(type)}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-foreground/80 hover:bg-foreground/5"
                  >
                    <Icon className="h-4 w-4" /> {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {showPreview && (
          <div className="max-h-[600px] overflow-y-auto rounded-md border border-surface-border p-4">
            {blocks.length > 0 ? (
              <BlockRenderer blocks={blocks} />
            ) : (
              <p className="text-sm text-foreground/40">Nada para mostrar ainda.</p>
            )}
          </div>
        )}
      </div>

      <input type="hidden" name="content" value={serializeBlocks(blocks)} readOnly />
    </div>
  );
}
