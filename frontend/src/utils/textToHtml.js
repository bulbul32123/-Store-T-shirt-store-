export function plainTextToHtml(text) {
  if (!text) return "";
  if (/<\/?[a-z][\s\S]*>/i.test(text)) return text;
  return text
    .split(/\n+/)
    .filter(Boolean)
    .map((line) => `<p>${line}</p>`)
    .join("");
}
