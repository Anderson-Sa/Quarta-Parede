"use client";

import { useActionState } from "react";
import type { PostFormState } from "./actions";

type Category = { id: string; name: string };

type Post = {
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl: string | null;
  categoryId: string;
  published: boolean;
};

export function PostForm({
  categories,
  post,
  action,
  submitLabel,
}: {
  categories: Category[];
  post?: Post;
  action: (state: PostFormState, formData: FormData) => Promise<PostFormState>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

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

      <div>
        <label htmlFor="coverImageUrl" className="mb-1 block text-sm text-neutral-600">
          URL da imagem de capa (opcional)
        </label>
        <input
          id="coverImageUrl"
          name="coverImageUrl"
          defaultValue={post?.coverImageUrl ?? ""}
          placeholder="https://..."
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
          defaultValue={post?.excerpt}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand"
        />
      </div>

      <div>
        <label htmlFor="content" className="mb-1 block text-sm text-neutral-600">
          Conteúdo (Markdown)
        </label>
        <textarea
          id="content"
          name="content"
          required
          rows={16}
          defaultValue={post?.content}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 font-mono text-sm outline-none focus:border-brand"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-neutral-700">
        <input
          type="checkbox"
          name="published"
          defaultChecked={post?.published}
          className="h-4 w-4"
        />
        Publicado
      </label>

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
