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

export type ContentBlock =
  | { id: string; type: "markdown"; data: MarkdownBlockData }
  | { id: string; type: "columns"; data: ColumnsBlockData }
  | { id: string; type: "cta"; data: CtaBlockData }
  | { id: string; type: "gallery"; data: GalleryBlockData }
  | { id: string; type: "highlight"; data: HighlightBlockData };

export type BlockType = ContentBlock["type"];

export const BLOCK_LABELS: Record<BlockType, string> = {
  markdown: "Texto",
  columns: "Colunas",
  cta: "Botão de ação",
  gallery: "Galeria de imagens",
  highlight: "Caixa de destaque",
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
  }
}

function isValidBlock(value: unknown): value is ContentBlock {
  if (!value || typeof value !== "object") return false;
  const block = value as Record<string, unknown>;
  return (
    typeof block.id === "string" &&
    typeof block.type === "string" &&
    ["markdown", "columns", "cta", "gallery", "highlight"].includes(block.type) &&
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
      }
    })
    .join("\n\n");
}
