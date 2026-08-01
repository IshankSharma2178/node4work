import { marked } from "marked";

const escapeHtml = (value: string): string => {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
};

/**
 * Converts markdown to HTML that Telegram's `parse_mode: "HTML"` accepts.
 *
 * Telegram HTML mode supports a limited tag set: b, strong, i, em, u, ins,
 * s, strike, del, a[href], code, pre, blockquote, tg-spoiler. Tags that
 * `marked` emits for headings, lists, paragraphs and rules are rewritten into
 * supported equivalents so LLM output renders cleanly instead of triggering
 * a "can't parse entities" error.
 */
export const markdownToTelegramHtml = (text: string): string => {
  const html = marked.parse(text, { async: false }) as string;

  const converted = html
    .replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/g, "<b>$2</b>")
    .replace(/<hr[^>]*>/g, "\n────────\n")
    .replace(/<\/?p>/g, "\n")
    .replace(/<\/?ul>/g, "\n")
    .replace(/<\/?ol>/g, "\n")
    .replace(/<li[^>]*>/g, "\n• ")
    .replace(/<\/li>/g, "")
    .replace(/<br\s*\/?>/g, "\n")
    .replace(/<img[^>]*>/g, "")
    .replace(/<([a-zA-Z/][^>]*?)>/g, (match, tag) => {
      const name = tag.replace(/^\/|\s.*$/g, "").toLowerCase();
      const supported = [
        "b",
        "strong",
        "i",
        "em",
        "u",
        "ins",
        "s",
        "strike",
        "del",
        "a",
        "code",
        "pre",
        "blockquote",
        "tg-spoiler",
      ];
      return supported.includes(name) ? match : escapeHtml(match);
    });

  return converted
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^\n+|\n+$/g, "")
    .trim();
};
