import type { IconType } from "react-icons";
import {
  FaInstagram,
  FaFacebook,
  FaThreads,
  FaTwitter,
  FaPinterest,
  FaWhatsapp,
  FaTelegram,
} from "react-icons/fa6";

/** Footer/post "Fique por dentro de nossas Redes Sociais" links. Only
 * networks with a URL configured in Configurações do site are rendered,
 * each with its brand color and logo. */

type SocialLinksProps = {
  /** "pills" (default) is the labeled, brand-colored style used on post
   * pages. "icons" is a compact, icon-only circular style for the footer. */
  variant?: "pills" | "icons";
  instagramUrl: string | null;
  facebookUrl: string | null;
  threadsUrl: string | null;
  twitterUrl: string | null;
  pinterestUrl: string | null;
  whatsappUrl: string | null;
  telegramUrl: string | null;
};

type SocialNetworkKey = Exclude<keyof SocialLinksProps, "variant">;

const NETWORKS: {
  key: SocialNetworkKey;
  label: string;
  icon: IconType;
  className: string;
}[] = [
  {
    key: "instagramUrl",
    label: "Instagram",
    icon: FaInstagram,
    className: "bg-gradient-to-tr from-fuchsia-600 via-pink-600 to-orange-500",
  },
  { key: "facebookUrl", label: "Facebook", icon: FaFacebook, className: "bg-[#1877F2]" },
  { key: "threadsUrl", label: "Threads", icon: FaThreads, className: "bg-black" },
  { key: "twitterUrl", label: "Twitter", icon: FaTwitter, className: "bg-[#1DA1F2]" },
  { key: "pinterestUrl", label: "Pinterest", icon: FaPinterest, className: "bg-[#E60023]" },
  { key: "whatsappUrl", label: "WhatsApp", icon: FaWhatsapp, className: "bg-[#25D366]" },
  { key: "telegramUrl", label: "Telegram", icon: FaTelegram, className: "bg-[#229ED9]" },
];

type NetworkLink = { label: string; url: string; icon: IconType; className: string };

export function SocialLinks({ variant = "pills", ...props }: SocialLinksProps) {
  const links = NETWORKS.map(({ key, label, icon, className }) => ({
    label,
    icon,
    className,
    url: props[key],
  })).filter((link): link is NetworkLink => Boolean(link.url));

  if (links.length === 0) return null;

  if (variant === "icons") {
    return (
      <div className="flex flex-wrap items-center justify-center gap-3">
        {links.map(({ label, url, icon: Icon }) => (
          <a
            key={label}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground/10 text-foreground/70 transition-colors hover:bg-brand hover:text-white"
          >
            <Icon className="h-4 w-4" />
          </a>
        ))}
      </div>
    );
  }

  return (
    <div className="text-center">
      <p className="mb-3 text-lg font-extrabold text-foreground">
        Fique por dentro de nossas Redes Sociais:
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {links.map(({ label, url, icon: Icon, className }) => (
          <a
            key={label}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 ${className}`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </a>
        ))}
      </div>
    </div>
  );
}
