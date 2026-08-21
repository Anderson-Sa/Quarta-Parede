function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function categoryCoverImage(
  categoryName: string,
  hex: string,
  width = 1200,
  height = 675,
) {
  const label = escapeXml(categoryName.toUpperCase());
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${hex}" stop-opacity="0.35" />
      <stop offset="100%" stop-color="#101012" stop-opacity="1" />
    </linearGradient>
    <pattern id="stripes" width="40" height="40" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
      <line x1="0" y1="0" x2="0" y2="40" stroke="${hex}" stroke-opacity="0.12" stroke-width="16" />
    </pattern>
  </defs>
  <rect width="${width}" height="${height}" fill="#101012" />
  <rect width="${width}" height="${height}" fill="url(#stripes)" />
  <rect width="${width}" height="${height}" fill="url(#bg)" />
  <rect x="0" y="0" width="10" height="${height}" fill="${hex}" />
  <text x="60" y="${height - 60}" font-family="Arial, Helvetica, sans-serif" font-size="64" font-weight="800" letter-spacing="2" fill="${hex}">${label}</text>
</svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
