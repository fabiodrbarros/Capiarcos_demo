import 'server-only';

/**
 * Translate a short string using the free MyMemory API (no key required).
 * Falls back to the original text on any error/timeout — category creation
 * must never fail just because translation is unavailable.
 */
/** Tidy up the raw machine-translation output to look like a clean label. */
function clean(s: string): string {
  let out = s
    .replace(/\s+/g, ' ')
    .replace(/^["'«»\s]+|["'«».,;:!?\s]+$/g, '') // strip surrounding quotes/punctuation
    .trim();
  if (out) out = out.charAt(0).toUpperCase() + out.slice(1);
  return out;
}

async function mymemory(text: string, pair: string): Promise<string> {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${pair}`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 4000);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    if (!r.ok) return text;
    const data = await r.json();
    const out = data?.responseData?.translatedText;
    if (typeof out === 'string' && out.trim() && Number(data?.responseStatus) === 200) {
      return clean(out) || text;
    }
    return text;
  } catch {
    return text;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Given a Portuguese label, produce the EN and FR translations.
 * Any provided override is kept as-is (only empty ones are auto-translated).
 */
export async function translateLabels(
  pt: string,
  en?: string,
  fr?: string,
): Promise<{ label: string; label_en: string; label_fr: string }> {
  const label = pt.trim();
  const [label_en, label_fr] = await Promise.all([
    en?.trim() ? Promise.resolve(en.trim()) : mymemory(label, 'pt|en'),
    fr?.trim() ? Promise.resolve(fr.trim()) : mymemory(label, 'pt|fr'),
  ]);
  return { label, label_en: label_en || label, label_fr: label_fr || label };
}
