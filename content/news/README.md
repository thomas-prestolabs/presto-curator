# News

One Markdown file per news item. The site shows the newest items by `date`
(how many: `newsSection.limit` in `src/data/site.ts`, currently 3). Older files
stay here as an archive and are simply not displayed.

## Add an item

1. Copy an existing file, name it `YYYY-MM-DD-short-slug.md`.
2. Fill in the front matter between the `---` lines:

   | field      | required | notes                                                       |
   | ---------- | -------- | ----------------------------------------------------------- |
   | `title`    | yes      | Wrap in quotes if it contains a colon (`:`)                 |
   | `date`     | yes      | `YYYY-MM-DD`; newest first                                  |
   | `category` | yes      | Shown after the date, e.g. `Curator Announcement`           |
   | `image`    | yes      | Path under `public/` (e.g. `/images/news/foo.png`) or a URL |
   | `imageAlt` | no       | Accessibility text for the image                            |
   | `href`     | no       | Where the card links to (omit for a non-clickable card)     |

3. Write the excerpt below the front matter (plain text, 2–4 sentences).
4. Put the thumbnail in `public/images/news/` (425×239 or the same 16:9 ratio).
5. Commit — the site redeploys automatically. On GitHub: open `content/news`,
   **Add file → Create new file**, paste, **Commit changes**.

A missing required field or a bad date fails the build with the file name in
the error, so a typo cannot silently drop a post.
