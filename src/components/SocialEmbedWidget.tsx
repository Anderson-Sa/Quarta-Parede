"use client";

import { useEffect, useRef } from "react";

const WIDGET_SCRIPT_SRC: Record<"instagram" | "threads", string> = {
  instagram: "https://www.instagram.com/embed.js",
  threads: "https://www.threads.net/embed.js",
};

/**
 * Renders an Instagram or Threads post via each platform's official embed
 * widget (a `<blockquote>` processed by their `embed.js`). Both platforms
 * send `X-Frame-Options: DENY` on their `/embed` endpoint, so a raw iframe
 * (like the video and X/Twitter embeds use) cannot render the post at all —
 * this script-based widget is the only way to embed a public post from
 * either platform. The script is (re-)injected on every mount so it always
 * scans and processes this instance's blockquote, even if another instance
 * already loaded the same script elsewhere on the page.
 */
export function SocialEmbedWidget({
  platform,
  permalink,
}: {
  platform: "instagram" | "threads";
  permalink: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = WIDGET_SCRIPT_SRC[platform];
    script.async = true;
    document.body.appendChild(script);
    return () => {
      script.remove();
    };
  }, [platform, permalink]);

  return (
    <div ref={containerRef} className="flex justify-center">
      {platform === "instagram" ? (
        <blockquote
          className="instagram-media"
          data-instgrm-permalink={permalink}
          data-instgrm-version="14"
          style={{ margin: 0, width: "100%", maxWidth: 540, minWidth: 326 }}
        >
          <a href={permalink} target="_blank" rel="noopener noreferrer">
            Ver publicação no Instagram
          </a>
        </blockquote>
      ) : (
        <blockquote
          className="text-post-media"
          data-text-post-permalink={permalink}
          data-text-post-version="0"
          style={{ margin: 0, width: "100%", maxWidth: 540, minWidth: 326 }}
        >
          <a href={permalink} target="_blank" rel="noopener noreferrer">
            Ver publicação no Threads
          </a>
        </blockquote>
      )}
    </div>
  );
}
