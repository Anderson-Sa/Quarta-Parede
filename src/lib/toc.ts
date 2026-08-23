import GithubSlugger from "github-slugger";

export type TocEntry = { id: string; text: string; depth: 2 | 3 };

/**
 * Extracts an ## / ### heading outline from Markdown source, generating the
 * same ids that rehype-slug assigns to the rendered headings (both use
 * github-slugger, walked in document order), so TOC links (#id) resolve.
 */
export function extractToc(markdown: string): TocEntry[] {
  const slugger = new GithubSlugger();
  const entries: TocEntry[] = [];
  const withoutCodeBlocks = markdown.replace(/```[\s\S]*?```/g, "");

  for (const line of withoutCodeBlocks.split("\n")) {
    const match = /^(#{2,3})\s+(.+?)\s*#*$/.exec(line);
    if (!match) continue;
    const depth = match[1].length as 2 | 3;
    const text = match[2].trim();
    if (!text) continue;
    entries.push({ id: slugger.slug(text), text, depth });
  }

  return entries;
}
