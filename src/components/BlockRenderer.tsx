import Image from "next/image";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import { AlertTriangle, ExternalLink, Info, Lightbulb, Quote } from "lucide-react";
import {
  getSocialEmbedUrl,
  getVideoEmbedUrl,
  type ContentBlock,
  type HighlightBlockData,
} from "@/lib/contentBlocks";
import { SocialEmbedWidget } from "./SocialEmbedWidget";

// Allow <video>/<source> in Markdown blocks (used for embedded clips) on top
// of the default safe HTML allowlist. Everything else (scripts, event
// handlers, iframes, etc.) is stripped by rehype-sanitize. Exported so
// PostForm's live preview uses the exact same allowlist.
export const postContentSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), "video", "source"],
  attributes: {
    ...defaultSchema.attributes,
    video: ["controls", "src", "poster", "width", "height", "muted", "loop"],
    source: ["src", "type"],
  },
};

/** Only allow http(s)/relative/hash URLs in block-authored links & images —
 * blocks are admin-authored (same trust level as Markdown content today),
 * but this cheaply blocks `javascript:`-style hrefs. */
function safeHref(url: string): string {
  if (/^(https?:\/\/|\/|#)/i.test(url)) return url;
  return "#";
}

const columnGridClass: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
};

const ctaStyleClass: Record<string, string> = {
  primary: "bg-brand text-white hover:bg-brand-dark",
  secondary: "bg-white/10 text-foreground hover:bg-white/20",
  outline: "border border-brand text-brand hover:bg-brand/10",
};

// Fixed height for the X/Twitter embed iframe, which (unlike Instagram and
// Threads) has no framing restriction and needs no widget script — see
// getSocialEmbedUrl.
const X_EMBED_HEIGHT = 560;

const highlightConfig: Record<HighlightBlockData["icon"], { icon: typeof Info; className: string }> = {
  info: { icon: Info, className: "border-accent/50 bg-accent/5 text-accent" },
  warning: { icon: AlertTriangle, className: "border-amber-500/50 bg-amber-500/5 text-amber-400" },
  tip: { icon: Lightbulb, className: "border-brand/50 bg-brand/5 text-brand" },
  quote: { icon: Quote, className: "border-foreground/30 bg-white/5 text-foreground/70" },
};

export function MarkdownBlockContent({ markdown }: { markdown: string }) {
  return (
    <div className="prose prose-invert max-w-none prose-headings:font-bold prose-a:text-brand prose-video:rounded-lg prose-video:border prose-video:border-surface-border">
      <ReactMarkdown
        rehypePlugins={[rehypeRaw, [rehypeSanitize, postContentSchema], rehypeSlug, rehypeHighlight]}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}

function BlockView({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "markdown":
      return <MarkdownBlockContent markdown={block.data.markdown} />;

    case "columns":
      return (
        <div className={`grid gap-6 ${columnGridClass[block.data.columns.length] ?? columnGridClass[2]}`}>
          {block.data.columns.map((column, index) => (
            <div key={index} className="min-w-0">
              <MarkdownBlockContent markdown={column.markdown} />
            </div>
          ))}
        </div>
      );

    case "cta":
      if (!block.data.label) return null;
      return (
        <div className="flex justify-center py-2">
          <a
            href={safeHref(block.data.url)}
            target={/^https?:\/\//i.test(block.data.url) ? "_blank" : undefined}
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-semibold transition-colors ${ctaStyleClass[block.data.style] ?? ctaStyleClass.primary}`}
          >
            {block.data.label}
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      );

    case "gallery":
      if (block.data.images.length === 0) return null;
      return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {block.data.images.map((image, index) => (
            <div
              key={index}
              className="relative aspect-square overflow-hidden rounded-lg border border-surface-border"
            >
              <Image
                src={image.url}
                alt={image.alt}
                fill
                unoptimized
                sizes="(max-width: 640px) 50vw, 33vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      );

    case "highlight": {
      if (!block.data.text) return null;
      const { icon: Icon, className } = highlightConfig[block.data.icon] ?? highlightConfig.info;
      return (
        <div className={`flex gap-3 rounded-lg border-l-4 p-4 ${className}`}>
          <Icon className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="text-sm leading-relaxed text-foreground/90">{block.data.text}</p>
        </div>
      );
    }

    case "divider":
      return <hr className="border-surface-border" />;

    case "rating": {
      if (!block.data.title) return null;
      return (
        <div className="rounded-lg border border-surface-border bg-white/5 p-5">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-foreground">{block.data.title}</h3>
            <div className="flex shrink-0 items-baseline gap-1 rounded-md bg-brand px-3 py-1.5 text-white">
              <span className="text-xl font-bold leading-none">{block.data.score}</span>
              <span className="text-xs opacity-80">/10</span>
            </div>
          </div>
          {block.data.fields.length > 0 && (
            <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
              {block.data.fields.map((field, index) => (
                <div key={index} className="flex gap-1.5 text-sm">
                  <dt className="font-medium text-foreground/50">{field.label}:</dt>
                  <dd className="text-foreground/90">{field.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      );
    }

    case "video": {
      const embedUrl = getVideoEmbedUrl(block.data.url);
      if (!embedUrl) return null;
      return (
        <div className="aspect-video w-full overflow-hidden rounded-lg border border-surface-border">
          <iframe
            src={embedUrl}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    case "socialEmbed": {
      const embed = getSocialEmbedUrl(block.data.url);
      if (!embed) return null;
      if (embed.platform === "x") {
        return (
          <div className="flex justify-center">
            <iframe
              src={embed.src}
              className="w-full max-w-[540px] overflow-hidden rounded-lg border border-surface-border"
              style={{ height: X_EMBED_HEIGHT }}
              allow="encrypted-media; picture-in-picture"
              scrolling="no"
            />
          </div>
        );
      }
      return <SocialEmbedWidget platform={embed.platform} permalink={embed.permalink} />;
    }
  }
}

/** Renders an ordered list of content blocks. Shared by the public post page
 * and the admin editor's live preview, so both stay pixel-identical. */
export function BlockRenderer({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="space-y-8">
      {blocks.map((block) => (
        <BlockView key={block.id} block={block} />
      ))}
    </div>
  );
}
