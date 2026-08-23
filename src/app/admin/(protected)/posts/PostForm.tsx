"use client";

import { useActionState, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";
import { ImageOff } from "lucide-react";
import { AdminCard } from "@/components/admin/AdminCard";
import type { PostFormState } from "./actions";

const postContentSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), "video", "source"],
  attributes: {
    ...defaultSchema.attributes,
    video: ["controls", "src", "poster", "width", "height", "muted", "loop"],
    source: ["src", "type"],
  },
};

const inputClass =
  "w-full rounded-md border border-surface-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-foreground/30 focus:border-brand";
const labelClass = "mb-1.5 block text-sm font-medium text-foreground/70";

type Category = { id: string; name: string };
type Tag = { id: string; name: string };

type Post = {
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  categoryId: string;
  tags: { id: string }[];
  published: boolean;
  publishedAt: Date | null;
};

/** Formats a Date as the "YYYY-MM-DDTHH:mm" value a datetime-local input expects, in local time. */
function toDateTimeLocal(date: Date | null) {
  if (!date) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function PostForm({
  categories,
  tags,
  post,
  action,
  submitLabel,
}: {
  categories: Category[];
  tags: Tag[];
  post?: Post;
  action: (state: PostFormState, formData: FormData) => Promise<PostFormState>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [content, setContent] = useState(post?.content ?? "");
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(post?.coverImageUrl ?? "");
  const postedTagIds = new Set(post?.tags.map((tag) => tag.id));

  return (
    <form action={formAction} className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        <AdminCard>
          <div>
            <label htmlFor="title" className={labelClass}>
              Título
            </label>
            <input
              id="title"
              name="title"
              required
              maxLength={200}
              defaultValue={post?.title}
              className={inputClass}
            />
          </div>

          <div className="mt-5">
            <label htmlFor="excerpt" className={labelClass}>
              Resumo
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              required
              rows={2}
              maxLength={500}
              defaultValue={post?.excerpt}
              className={inputClass}
            />
          </div>

          <div className="mt-5">
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="content" className="block text-sm font-medium text-foreground/70">
                Conteúdo (Markdown)
              </label>
              <button
                type="button"
                onClick={() => setShowPreview((value) => !value)}
                className="text-xs font-medium text-brand hover:underline"
              >
                {showPreview ? "Ocultar preview" : "Mostrar preview"}
              </button>
            </div>
            <div className={showPreview ? "grid grid-cols-2 gap-3" : ""}>
              <textarea
                id="content"
                name="content"
                required
                rows={20}
                maxLength={20000}
                value={content}
                onChange={(event) => setContent(event.target.value)}
                className={`${inputClass} font-mono`}
              />
              {showPreview && (
                <div className="prose prose-invert prose-sm max-w-none overflow-y-auto rounded-md border border-surface-border p-3">
                  <ReactMarkdown
                    rehypePlugins={[rehypeRaw, [rehypeSanitize, postContentSchema], rehypeHighlight]}
                  >
                    {content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        </AdminCard>

        {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-50"
        >
          {pending ? "Salvando..." : submitLabel}
        </button>
      </div>

      <div className="space-y-5">
        <AdminCard>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/50">
            Publicação
          </h2>
          <label className="mt-4 flex items-center gap-2 text-sm text-foreground/80">
            <input
              type="checkbox"
              name="published"
              defaultChecked={post?.published}
              className="h-4 w-4 accent-brand"
            />
            Publicado
          </label>

          <div className="mt-4">
            <label htmlFor="publishedAt" className={labelClass}>
              Publicar em
            </label>
            <input
              id="publishedAt"
              name="publishedAt"
              type="datetime-local"
              defaultValue={toDateTimeLocal(post?.publishedAt ?? null)}
              className={inputClass}
            />
            <p className="mt-1.5 text-xs text-foreground/40">
              Deixe em branco para agora. Uma data futura agenda o post: ele só aparece no blog a
              partir dela.
            </p>
          </div>
        </AdminCard>

        <AdminCard>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/50">
            Categoria
          </h2>
          <select
            id="categoryId"
            name="categoryId"
            required
            defaultValue={post?.categoryId ?? ""}
            className={`${inputClass} mt-4`}
          >
            <option value="" disabled>
              Selecione...
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          {tags.length > 0 && (
            <div className="mt-5">
              <span className="text-sm font-semibold uppercase tracking-wide text-foreground/50">
                Tags
              </span>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                {tags.map((tag) => (
                  <label
                    key={tag.id}
                    className="flex items-center gap-1.5 text-sm text-foreground/80"
                  >
                    <input
                      type="checkbox"
                      name="tagIds"
                      value={tag.id}
                      defaultChecked={postedTagIds.has(tag.id)}
                      className="h-4 w-4 accent-brand"
                    />
                    {tag.name}
                  </label>
                ))}
              </div>
            </div>
          )}
        </AdminCard>

        <AdminCard>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/50">
            Imagem de capa
          </h2>

          <div className="mt-4 flex aspect-video items-center justify-center overflow-hidden rounded-md border border-dashed border-surface-border bg-background">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- may be a blob: preview URL from a local file input, which next/image can't optimize.
              <img src={previewUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <ImageOff className="h-8 w-8 text-foreground/20" />
            )}
          </div>

          <div className="mt-4">
            <label htmlFor="coverImageUrl" className={labelClass}>
              URL da imagem (opcional)
            </label>
            <input
              id="coverImageUrl"
              name="coverImageUrl"
              type="url"
              maxLength={20000}
              defaultValue={post?.coverImageUrl ?? ""}
              placeholder="https://..."
              onChange={(event) => setPreviewUrl(event.target.value)}
              className={inputClass}
            />
          </div>

          <div className="mt-4">
            <label htmlFor="coverImageFile" className={labelClass}>
              ...ou envie um arquivo
            </label>
            <input
              id="coverImageFile"
              name="coverImageFile"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) setPreviewUrl(URL.createObjectURL(file));
              }}
              className="w-full text-sm text-foreground/60 file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-foreground hover:file:bg-white/20"
            />
            <p className="mt-1.5 text-xs text-foreground/40">Substitui a URL acima, se enviado.</p>
          </div>

          <div className="mt-4">
            <label htmlFor="coverImageAlt" className={labelClass}>
              Texto alternativo (acessibilidade/SEO)
            </label>
            <input
              id="coverImageAlt"
              name="coverImageAlt"
              maxLength={300}
              defaultValue={post?.coverImageAlt ?? ""}
              placeholder="Descreva a imagem"
              className={inputClass}
            />
          </div>
        </AdminCard>
      </div>
    </form>
  );
}
