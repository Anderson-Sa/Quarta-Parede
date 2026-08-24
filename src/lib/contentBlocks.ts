/**
 * Post.content stays a plain String column in Prisma (no migration). What
 * changes is how we *interpret* it:
 *
 * - Legacy posts: a plain Markdown string, same as before this feature
 *   existed. Treated as a single implicit "markdown" block so they keep
 *   rendering and editing exactly as they always have.
 * - New posts: a JSON-encoded envelope ({ __qpBlocks: true, version, blocks })
 *   describing an ordered list of typed content blocks, edited via the block
 *   editor UI (see BlockEditor.tsx) and rendered via <BlockRenderer>.
 *
 * This lets the "Elementor-lite" block editor ship with zero data migration
 * and zero risk to existing posts.
 */

export type MarkdownBlockData = { markdown: string };
export type ColumnsBlockData = { columns: { markdown: string }[] };
export type CtaBlockData = { label: string; url: string; style: "primary" | "secondary" | "outline" };
export type GalleryBlockData = { images: { url: string; alt: string }[] };
export type HighlightBlockData = { icon: "info" | "warning" | "tip" | "quote"; text: string };
export type DividerBlockData = Record<string, never>;
/** "Ficha técnica" / review-style rating box: a title, a 0–10 score, and a
 * freeform list of label/value pairs (Diretor, Estúdio, Ano, Gênero...). */
export type RatingBlockData = {
  title: string;
  score: number;
  fields: { label: string; value: string }[];
};
/** A YouTube or Vimeo URL, resolved to an embeddable iframe src at render
 * time by getVideoEmbedUrl — see that function for supported URL shapes. */
export type VideoBlockData = { url: string };
/** A public Instagram/X (Twitter)/Threads post URL, resolved to an
 * embeddable iframe src at render time by getSocialEmbedUrl. */
export type SocialEmbedBlockData = { url: string };

export type ContentBlock =
  | { id: string; type: "markdown"; data: MarkdownBlockData }
  | { id: string; type: "columns"; data: ColumnsBlockData }
  | { id: string; type: "cta"; data: CtaBlockData }
  | { id: string; type: "gallery"; data: GalleryBlockData }
  | { id: string; type: "highlight"; data: HighlightBlockData }
  | { id: string; type: "divider"; data: DividerBlockData }
  | { id: string; type: "rating"; data: RatingBlockData }
  | { id: string; type: "video"; data: VideoBlockData }
  | { id: string; type: "socialEmbed"; data: SocialEmbedBlockData };

export type BlockType = ContentBlock["type"];

export const BLOCK_LABELS: Record<BlockType, string> = {
  markdown: "Texto",
  columns: "Colunas",
  cta: "Botão de ação",
  gallery: "Galeria de imagens",
  highlight: "Caixa de destaque",
  divider: "Divisor",
  rating: "Nota / Ficha técnica",
  video: "Vídeo (YouTube/Vimeo)",
  socialEmbed: "Post social (Instagram/X/Threads)",
};

const MARKER = "__qpBlocks";
const CURRENT_VERSION = 1;

function newId(): string {
  return globalThis.crypto.randomUUID();
}

/** Builds a fresh, empty block of the given type with a new id. */
export function createBlock(type: BlockType): ContentBlock {
  const id = newId();
  switch (type) {
    case "markdown":
      return { id, type, data: { markdown: "" } };
    case "columns":
      return { id, type, data: { columns: [{ markdown: "" }, { markdown: "" }] } };
    case "cta":
      return { id, type, data: { label: "", url: "", style: "primary" } };
    case "gallery":
      return { id, type, data: { images: [] } };
    case "highlight":
      return { id, type, data: { icon: "info", text: "" } };
    case "divider":
      return { id, type, data: {} };
    case "rating":
      return { id, type, data: { title: "", score: 0, fields: [] } };
    case "video":
      return { id, type, data: { url: "" } };
    case "socialEmbed":
      return { id, type, data: { url: "" } };
  }
}

function isValidBlock(value: unknown): value is ContentBlock {
  if (!value || typeof value !== "object") return false;
  const block = value as Record<string, unknown>;
  return (
    typeof block.id === "string" &&
    typeof block.type === "string" &&
    [
      "markdown",
      "columns",
      "cta",
      "gallery",
      "highlight",
      "divider",
      "rating",
      "video",
      "socialEmbed",
    ].includes(block.type) &&
    typeof block.data === "object" &&
    block.data !== null
  );
}

/**
 * Parses stored Post.content into an ordered list of blocks. Any string that
 * isn't a recognizable `__qpBlocks` JSON envelope (including every post
 * written before this feature existed) is treated as one legacy markdown
 * block, so nothing needs to be backfilled.
 */
export function parseContent(raw: string): ContentBlock[] {
  const trimmed = raw.trim();
  if (trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed) as Record<string, unknown>;
      if (parsed[MARKER] === true && Array.isArray(parsed.blocks)) {
        const blocks = parsed.blocks.filter(isValidBlock);
        if (blocks.length > 0) return blocks;
      }
    } catch {
      // Not valid JSON -> fall through, treat the whole string as Markdown.
    }
  }
  return [{ id: "legacy", type: "markdown", data: { markdown: raw } }];
}

/** Inverse of parseContent: serializes blocks back into a Post.content string. */
export function serializeBlocks(blocks: ContentBlock[]): string {
  return JSON.stringify({ [MARKER]: true, version: CURRENT_VERSION, blocks });
}

/**
 * Flattens blocks into a single Markdown-ish plain-text string. Used
 * anywhere that just needs the words/headings — reading time estimation,
 * table-of-contents extraction, and full-text search indexing — without
 * needing to know about block structure.
 */
export function blocksToPlainMarkdown(blocks: ContentBlock[]): string {
  return blocks
    .map((block) => {
      switch (block.type) {
        case "markdown":
          return block.data.markdown;
        case "columns":
          return block.data.columns.map((column) => column.markdown).join("\n\n");
        case "cta":
          return block.data.label ? `[${block.data.label}](${block.data.url})` : "";
        case "gallery":
          return block.data.images
            .map((image) => image.alt)
            .filter(Boolean)
            .join("\n");
        case "highlight":
          return block.data.text;
        case "divider":
          return "";
        case "rating":
          return [
            block.data.title,
            ...block.data.fields.map((field) => `${field.label}: ${field.value}`),
          ]
            .filter(Boolean)
            .join("\n");
        case "video":
          return "";
        case "socialEmbed":
          return "";
      }
    })
    .join("\n\n");
}

/**
 * Resolves a YouTube or Vimeo watch/share URL to an embeddable iframe src.
 * Returns null for anything else so callers can fall back to a plain link
 * instead of embedding an arbitrary (and potentially unsafe) iframe src.
 *
 * Supported shapes:
 * - youtube.com/watch?v=ID, youtu.be/ID, youtube.com/shorts/ID, youtube.com/embed/ID
 * - vimeo.com/ID, player.vimeo.com/video/ID
 */
export function getVideoEmbedUrl(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    return null;
  }
  if (!/^https?:$/.test(parsed.protocol)) return null;
  const host = parsed.hostname.replace(/^www\./, "");

  if (host === "youtu.be") {
    const id = parsed.pathname.slice(1).split("/")[0];
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }
  if (host === "youtube.com" || host === "m.youtube.com") {
    if (parsed.pathname === "/watch") {
      const id = parsed.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    const shortsMatch = parsed.pathname.match(/^\/shorts\/([^/]+)/);
    if (shortsMatch) return `https://www.youtube.com/embed/${shortsMatch[1]}`;
    const embedMatch = parsed.pathname.match(/^\/embed\/([^/]+)/);
    if (embedMatch) return `https://www.youtube.com/embed/${embedMatch[1]}`;
    return null;
  }
  if (host === "vimeo.com") {
    const id = parsed.pathname.slice(1).split("/")[0];
    return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null;
  }
  if (host === "player.vimeo.com") {
    const match = parsed.pathname.match(/^\/video\/(\d+)/);
    return match ? `https://player.vimeo.com/video/${match[1]}` : null;
  }
  return null;
}

export type SocialPlatform = "instagram" | "x" | "threads";

/**
 * Resolves a public Instagram/X (Twitter)/Threads post URL to embeddable
 * data. Instagram and Threads both send `X-Frame-Options: DENY` on their
 * `/embed` endpoint, so those can't be framed directly — instead we return
 * the normalized post permalink, which <SocialEmbedWidget> turns into an
 * iframe via each platform's own embed.js widget script. X/Twitter's embed
 * endpoint has no such restriction, so it's framed directly with no
 * external script needed. Returns null for anything else so callers can
 * fall back to a plain link instead of an arbitrary iframe src.
 *
 * Supported shapes:
 * - instagram.com/p/ID, instagram.com/reel/ID
 * - threads.net/@user/post/ID (also threads.com)
 * - x.com/user/status/ID, twitter.com/user/status/ID
 */
export function getSocialEmbedUrl(
  url: string,
): { platform: "instagram" | "threads"; permalink: string } | { platform: "x"; src: string } | null {
  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    return null;
  }
  if (!/^https?:$/.test(parsed.protocol)) return null;
  const host = parsed.hostname.replace(/^www\./, "");

  if (host === "instagram.com") {
    const match = parsed.pathname.match(/^\/(p|reel|reels)\/([^/]+)/);
    if (!match) return null;
    return { platform: "instagram", permalink: `https://www.instagram.com/${match[1]}/${match[2]}/` };
  }
  if (host === "threads.net" || host === "threads.com") {
    const match = parsed.pathname.match(/^\/(@[^/]+)\/post\/([^/]+)/);
    if (!match) return null;
    return { platform: "threads", permalink: `https://www.threads.net/${match[1]}/post/${match[2]}` };
  }
  if (host === "x.com" || host === "twitter.com") {
    const match = parsed.pathname.match(/\/status\/(\d+)/);
    if (!match) return null;
    return {
      platform: "x",
      src: `https://platform.twitter.com/embed/Tweet.html?id=${match[1]}&theme=dark&dnt=true`,
    };
  }
  return null;
}
