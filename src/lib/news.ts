import "server-only";

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

/**
 * News items live as Markdown files in content/news/ (see the README there).
 * This module reads them, validates the front matter and returns the newest
 * first. It runs on the server at build / regeneration time only.
 */

export type NewsItem = {
  slug: string;
  title: string;
  excerpt: string;
  /** ISO date (YYYY-MM-DD) */
  date: string;
  category: string;
  /** Path under /public or an absolute URL */
  image: string;
  imageAlt: string;
  href?: string;
};

const NEWS_DIR = path.join(process.cwd(), "content", "news");
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function requireString(data: Record<string, unknown>, key: string, file: string): string {
  const value = data[key];
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`content/news/${file}: "${key}" is required`);
  }
  return value.trim();
}

function normaliseDate(value: unknown, file: string): string {
  // YAML turns an unquoted 2026-07-30 into a Date object; a quoted one stays a string.
  const iso =
    value instanceof Date
      ? value.toISOString().slice(0, 10)
      : typeof value === "string"
        ? value.trim()
        : "";
  if (!DATE_RE.test(iso) || Number.isNaN(Date.parse(iso))) {
    throw new Error(`content/news/${file}: "date" must be YYYY-MM-DD (got ${String(value)})`);
  }
  return iso;
}

async function parseFile(file: string): Promise<NewsItem> {
  const raw = await readFile(path.join(NEWS_DIR, file), "utf8");
  const { data, content } = matter(raw);

  const excerpt = content.trim().replace(/\s+/g, " ");
  if (!excerpt) throw new Error(`content/news/${file}: the body (excerpt) is empty`);

  const href = typeof data.href === "string" && data.href.trim() ? data.href.trim() : undefined;
  const imageAlt =
    typeof data.imageAlt === "string" && data.imageAlt.trim() ? data.imageAlt.trim() : undefined;

  return {
    slug: file.replace(/\.md$/, ""),
    title: requireString(data, "title", file),
    date: normaliseDate(data.date, file),
    category: requireString(data, "category", file),
    image: requireString(data, "image", file),
    imageAlt: imageAlt ?? requireString(data, "title", file),
    excerpt,
    href,
  };
}

/** All items, newest first. */
export async function getAllNews(): Promise<NewsItem[]> {
  const files = (await readdir(NEWS_DIR)).filter((f) => f.endsWith(".md") && f !== "README.md");
  const items = await Promise.all(files.map(parseFile));
  return items.sort((a, b) =>
    a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug < b.slug ? 1 : -1
  );
}

/** The newest `limit` items. */
export async function getLatestNews(limit: number): Promise<NewsItem[]> {
  return (await getAllNews()).slice(0, Math.max(0, limit));
}
