import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// The admin light/dark anti-flash script lives in the root layout
// (src/app/layout.tsx) as a `beforeInteractive` next/script — that strategy
// only works when placed in the root layout, not a nested one like this
// file, since it needs to run ahead of hydration for the whole document.
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
