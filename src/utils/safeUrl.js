// Keep imported URLs inert unless they use an explicitly supported protocol.
export function safeUrl(value, image = false) {
  if (typeof value !== 'string') return undefined;
  const url = value.trim();
  if (image && /^data:image\/(png|jpe?g|gif|webp);base64,[a-z0-9+/=\s]+$/i.test(url)) return url;
  if (/^https?:\/\//i.test(url)) return url;
  if (!image && /^(mailto:|tel:|#)/i.test(url)) return url;
  return undefined;
}
