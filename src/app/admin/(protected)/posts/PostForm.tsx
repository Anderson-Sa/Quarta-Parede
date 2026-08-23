"use client";

import { useActionState, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";
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
  const postedTagIds = new Set(post?.tags.map((tag) => tag.id));

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="title" className="mb-1 block text-sm text-neutral-600">
          Título
        </label>
        <input
          id="title"
          name="title"
          required
          maxLength={200}
          defaultValue={post?.title}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand"
        />
      </div>

      <div>
        <label htmlFor="categoryId" className="mb-1 block text-sm text-neutral-600">
          Categoria
        </label>
        <select
          id="categoryId"
          name="categoryId"
          required
          defaultValue={post?.categoryId ?? ""}
          className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand"
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
      </div>

      {tags.length > 0 && (
        <div>
          <span className="mb-1 block text-sm text-neutral-600">Tags</span>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {tags.map((tag) => (
              <label key={tag.id} className="flex items-center gap-1.5 text-sm text-neutral-700">
                <input
                  type="checkbox"
                  name="tagIds"
                  value={tag.id}
                  defaultChecked={postedTagIds.has(tag.id)}
                  className="h-4 w-4"
                />
                {tag.name}
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <label htmlFor="coverImageUrl" className="mb-1 block text-sm text-neutral-600">
          URL da imagem de capa (opcional)
        </label>
        <input
          id="coverImageUrl"
          name="coverImageUrl"
          type="url"
          maxLength={20000}
          defaultValue={post?.coverImageUrl ?? ""}
          placeholder="https://..."
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand"
        />
      </div>

      <div>
        <label htmlFor="coverImageFile" className="mb-1 block text-sm text-neutral-600">
          ...ou envie um arquivo (substitui a URL acima)
        </label>
        <input
          id="coverImageFile"
          name="coverImageFile"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="w-full text-sm text-neutral-600 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-100 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-neutral-200"
        />
      </div>

      <div>
        <label htmlFor="coverImageAlt" className="mb-1 block text-sm text-neutral-600">
          Texto alternativo da capa (acessibilidade/SEO)
        </label>
        <input
          id="coverImageAlt"
          name="coverImageAlt"
          maxLength={300}
          defaultValue={post?.coverImageAlt ?? ""}
          placeholder="Descreva a imagem para leitores de tela"
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand"
        />
      </div>

      <div>
        <label htmlFor="excerpt" className="mb-1 block text-sm text-neutral-600">
          Resumo
        </label>
        <textarea
          id="excerpt"
          name="excerpt"
          required
          rows={2}
          maxLength={500}
          defaultValue={post?.excerpt}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand"
        />
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label htmlFor="content" className="block text-sm text-neutral-600">
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
            rows={16}
            maxLength={20000}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 font-mono text-sm outline-none focus:border-brand"
          />
          {showPreview && (
            <div className="prose prose-sm max-w-none overflow-y-auto rounded-md border border-neutral-300 p-3">
              <ReactMarkdown rehypePlugins={[rehypeRaw, [rehypeSanitize, postContentSchema], rehypeHighlight]}>
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            name="published"
            defaultChecked={post?.published}
            className="h-4 w-4"
          />
          Publicado
        </label>

        <div>
          <label htmlFor="publishedAt" className="mb-1 block text-sm text-neutral-600">
            Publicar em (opcional — deixe em branco para agora)
          </label>
          <input
            id="publishedAt"
            name="publishedAt"
            type="datetime-local"
            defaultValue={toDateTimeLocal(post?.publishedAt ?? null)}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </div>
      </div>
      <p className="-mt-3 text-xs text-neutral-500">
        Uma data futura com &quot;Publicado&quot; marcado agenda o post: ele só aparece no blog
        a partir dessa data.
      </p>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
      >
        {pending ? "Salvando..." : submitLabel}
      </button>
    </form>
  );
}
