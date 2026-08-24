import { describe, expect, it } from "vitest";
import {
  blocksToPlainMarkdown,
  createBlock,
  getVideoEmbedUrl,
  parseContent,
  serializeBlocks,
  type ContentBlock,
} from "./contentBlocks";

describe("parseContent", () => {
  it("treats a plain Markdown string (legacy post) as a single markdown block", () => {
    const blocks = parseContent("# Hello\n\nSome *legacy* content.");
    expect(blocks).toEqual([
      { id: "legacy", type: "markdown", data: { markdown: "# Hello\n\nSome *legacy* content." } },
    ]);
  });

  it("treats malformed/unrecognized JSON as legacy markdown instead of throwing", () => {
    const raw = '{"not": "a block envelope"}';
    const blocks = parseContent(raw);
    expect(blocks).toEqual([{ id: "legacy", type: "markdown", data: { markdown: raw } }]);
  });

  it("treats invalid JSON starting with { as legacy markdown instead of throwing", () => {
    const raw = "{ this is not valid json";
    const blocks = parseContent(raw);
    expect(blocks).toEqual([{ id: "legacy", type: "markdown", data: { markdown: raw } }]);
  });

  it("parses a valid __qpBlocks envelope back into its blocks", () => {
    const blocks: ContentBlock[] = [
      { id: "1", type: "markdown", data: { markdown: "hi" } },
      { id: "2", type: "cta", data: { label: "Assine", url: "https://example.com", style: "primary" } },
    ];
    const raw = serializeBlocks(blocks);
    expect(parseContent(raw)).toEqual(blocks);
  });

  it("falls back to legacy markdown when the envelope has an empty blocks array", () => {
    const raw = JSON.stringify({ __qpBlocks: true, version: 1, blocks: [] });
    const blocks = parseContent(raw);
    expect(blocks).toEqual([{ id: "legacy", type: "markdown", data: { markdown: raw } }]);
  });
});

describe("serializeBlocks / parseContent round-trip", () => {
  it("round-trips every block type", () => {
    const blocks: ContentBlock[] = [
      createBlock("markdown"),
      createBlock("columns"),
      createBlock("cta"),
      createBlock("gallery"),
      createBlock("highlight"),
      createBlock("divider"),
      createBlock("rating"),
      createBlock("video"),
    ];
    const raw = serializeBlocks(blocks);
    expect(parseContent(raw)).toEqual(blocks);
  });
});

describe("createBlock", () => {
  it("gives each block a unique id", () => {
    const a = createBlock("markdown");
    const b = createBlock("markdown");
    expect(a.id).not.toBe(b.id);
  });
});

describe("blocksToPlainMarkdown", () => {
  it("flattens all block types into a single plain-text string", () => {
    const blocks: ContentBlock[] = [
      { id: "1", type: "markdown", data: { markdown: "## Heading\n\nbody" } },
      { id: "2", type: "columns", data: { columns: [{ markdown: "left" }, { markdown: "right" }] } },
      { id: "3", type: "cta", data: { label: "Clique aqui", url: "https://example.com", style: "primary" } },
      { id: "4", type: "gallery", data: { images: [{ url: "/a.png", alt: "uma foto" }] } },
      { id: "5", type: "highlight", data: { icon: "tip", text: "uma dica" } },
      { id: "6", type: "divider", data: {} },
      {
        id: "7",
        type: "rating",
        data: { title: "Filme X", score: 8.5, fields: [{ label: "Diretor", value: "Fulano" }] },
      },
      { id: "8", type: "video", data: { url: "https://youtu.be/abc123" } },
    ];
    const text = blocksToPlainMarkdown(blocks);
    expect(text).toContain("## Heading");
    expect(text).toContain("left");
    expect(text).toContain("right");
    expect(text).toContain("[Clique aqui](https://example.com)");
    expect(text).toContain("uma foto");
    expect(text).toContain("uma dica");
    expect(text).toContain("Filme X");
    expect(text).toContain("Diretor: Fulano");
  });

  it("omits a CTA block with no label", () => {
    const blocks: ContentBlock[] = [{ id: "1", type: "cta", data: { label: "", url: "", style: "primary" } }];
    expect(blocksToPlainMarkdown(blocks)).toBe("");
  });
});

describe("getVideoEmbedUrl", () => {
  it("resolves youtube.com/watch URLs", () => {
    expect(getVideoEmbedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      "https://www.youtube.com/embed/dQw4w9WgXcQ",
    );
  });

  it("resolves youtu.be short URLs", () => {
    expect(getVideoEmbedUrl("https://youtu.be/dQw4w9WgXcQ")).toBe(
      "https://www.youtube.com/embed/dQw4w9WgXcQ",
    );
  });

  it("resolves youtube shorts URLs", () => {
    expect(getVideoEmbedUrl("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toBe(
      "https://www.youtube.com/embed/dQw4w9WgXcQ",
    );
  });

  it("resolves vimeo.com URLs", () => {
    expect(getVideoEmbedUrl("https://vimeo.com/76979871")).toBe(
      "https://player.vimeo.com/video/76979871",
    );
  });

  it("returns null for unsupported hosts", () => {
    expect(getVideoEmbedUrl("https://example.com/video")).toBeNull();
  });

  it("returns null for javascript: URLs", () => {
    expect(getVideoEmbedUrl("javascript:alert(1)")).toBeNull();
  });

  it("returns null for garbage input", () => {
    expect(getVideoEmbedUrl("not a url")).toBeNull();
  });
});
