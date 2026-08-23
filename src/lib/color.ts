const HEX_COLOR = /^#([0-9a-f]{6})$/i;

/** Darkens a "#rrggbb" hex color by the given fraction (0-1). Used to derive
 * a hover/active shade from a single admin-picked brand color. */
export function darkenHex(hex: string, amount = 0.12): string {
  const match = HEX_COLOR.exec(hex);
  if (!match) return hex;
  const num = parseInt(match[1], 16);
  const channel = (shift: number) =>
    Math.max(0, Math.round(((num >> shift) & 0xff) * (1 - amount)));
  const r = channel(16);
  const g = channel(8);
  const b = channel(0);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
