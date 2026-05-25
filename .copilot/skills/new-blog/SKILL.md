---
name: new-blog
description: "Create a new Docusaurus blog post with proper frontmatter, directory structure, and optional i18n English mirror. Use when: scaffolding a new blog post with correct slug/title/tags, or adding an English translation mirror. Also handles adding new tags to blog/tags.yml."
argument-hint: "<topic> [slug: my-slug] [title: 标题] [tags: tag1,tag2] [with i18n] [draft] [recommended] [mdx] [refs: url1 url2]"
---

# new-blog Workflow

This skill scaffolds a new Docusaurus blog post for this site. It generates the correct directory structure and frontmatter — then asks you to confirm before writing any file.

---

## Conventions

### Slug Rules

- **Format**: kebab-case, all lowercase, English words only
- **Style**: content-oriented and concise, 2–4 words
- **Examples**: `nginx-proxy`, `python-venv`, `fzf-tips`, `docker-compose-setup`
- ❌ Do NOT use: dates, generic words (`post`, `article`, `blog`), or Chinese characters
- **Uniqueness check**: `git ls-files blog/ | grep -i <candidate-slug>`
  - If a match is found, append a qualifier (e.g., `fzf-tips` → `fzf-tips-advanced`) and re-check

### Title Rules

- **Default**: concise Chinese phrase (e.g., `Nginx 反向代理配置指南`)
- **English only when**: the topic is a product name, acronym, or CLI command (e.g., `FZF 使用技巧`)
- **Troubleshooting posts**: suffix with `问题` (e.g., `Python 环境问题`)
- **Version-specific posts**: include version number (e.g., `Node.js 20 升级指南`)
- **碎碎念/随笔 posts**: use `【碎碎念#N】` style, increment N from the latest existing post

### Known Tags (`blog/tags.yml`)

The following tags already exist — prefer these over creating new ones:

| Key | Label |
|---|---|
| `docusaurus` | Docusaurus |
| `aliyun` | Aliyun |
| `ecs` | ECS |
| `config` | Config |
| `linux` | Linux |
| `centos` | CentOS |
| `installation` | Installation |
| `nvm` | Nvm |
| `frontend` | Frontend |
| `backend` | Backend |
| `python` | Python |
| `fundamental` | Fundamental |
| `tools` | Tools |

Any tag NOT in this list must be flagged as **⚠️ NEW** during the confirm step — a YAML entry will be appended to `blog/tags.yml` upon confirmation.

---

## Workflow

### Step 1 — Get today's date

```bash
date +%Y-%m-%d
```

Parse into `{YYYY}`, `{MM}`, `{DD}` (zero-padded).

---

### Step 2 — Parse user input

Extract from the user's message:

| Field | How to detect |
|---|---|
| **Topic** | Core subject matter (always present) |
| **Slug** | Explicit `slug: foo` or `` `foo` `` in the message |
| **Title** | Explicit `title: 标题` in the message |
| **Tags** | Explicit `tags: tag1,tag2` or a list of tag names |
| **Reference URLs** | Any `http://` / `https://` URLs |
| **`with i18n`** / **`add i18n`** | Create English mirror under `i18n/en/docusaurus-plugin-content-blog/` |
| **`draft`** | Add `draft: true` to frontmatter |
| **`recommended`** | Add `recommended: true` to frontmatter |
| **`mdx`** | Use `.mdx` extension instead of `.md` |

Use whatever the user gave verbatim — do NOT overwrite explicit values.

---

### Step 3 — Generate slug (if not provided)

1. Derive a kebab-case English slug from the topic (see Slug Rules above).
2. Check uniqueness:
   ```bash
   git ls-files blog/ | grep -i <candidate-slug>
   ```
3. If a match is found, append a qualifier (e.g., `fzf-tips` → `fzf-tips-advanced`) and re-check.

---

### Step 4 — Generate title (if not provided)

Apply the Title Rules above to produce a concise, appropriate title from the topic.

---

### Step 5 — Suggest tags

1. Consult the Known Tags table in the Conventions section above.
2. Suggest 1–5 tags relevant to the topic, preferring tags that already exist.
3. Mark any tag NOT in the Known Tags table as **⚠️ NEW** — it will need a new entry in `blog/tags.yml`.

---

### Step 6 — Format references (if URLs provided)

For each URL the user gave, infer or fetch: `title`, `author`, `date`.
If any field is unavailable, use a placeholder and mark it `# TODO: fill in`.

Structure as YAML under a `references:` key:

```yaml
references:
  - title: "文章标题"
    url: https://example.com/article
    author: "Author Name"
    date: "2026-01-01"
```

---

### Step 7 — Confirm before writing

**Always confirm first**, unless the user's message was fully explicit (slug + title + tags all specified with no ambiguity).

Show the user:

1. **Directory**: `blog/{YYYY}/{MM}/{DD}-{slug}/`
2. **File**: `index.md` (or `index.mdx` if `mdx` modifier was given)
3. **Frontmatter preview** (full YAML block, as it will be written)
4. **⚠️ New tags** that will be appended to `blog/tags.yml` (if any)
5. **i18n mirror path** (if `with i18n` was given):
   `i18n/en/docusaurus-plugin-content-blog/{YYYY}/{MM}/{DD}-{slug}/index.md`

Then ask: **"Proceed?"**

---

### Step 8 — Write files (after "Proceed")

**8a — Create blog post**

Create: `blog/{YYYY}/{MM}/{DD}-{slug}/index.md` using the Blog Post Template below.

**8b — Append new tags to `blog/tags.yml`** (if any were flagged ⚠️ NEW)

Append each new tag in this format:

```yaml
{tag-key}:
  label: {Tag Label}
  permalink: /{tag-key}
  description: {Tag Label} related posts
```

**8c — Create i18n mirror** (only if `with i18n` was specified)

Create: `i18n/en/docusaurus-plugin-content-blog/{YYYY}/{MM}/{DD}-{slug}/index.md`
using the i18n Mirror Template below.

---

## Templates

### Blog Post (`blog/{YYYY}/{MM}/{DD}-{slug}/index.md`)

```md
---
slug: {slug}
title: {title}
authors:
  name: Achinoise1
  title: Website Owner
  url: https://github.com/Achinoise1
  image_url: https://github.com/Achinoise1.png
tags: [{tags}]
---

<!-- TODO: Write intro / excerpt here (shown in blog list preview) -->

<!--truncate-->

<!-- TODO: Write full post body here -->
```

- When `draft: true` is active, add `draft: true` to the frontmatter block (not commented out).
- When `recommended: true` is active, add `recommended: true` to the frontmatter block.
- When `references:` was built in Step 6, append it inside the frontmatter block.
- Use `.mdx` extension when the `mdx` modifier was given.

### i18n Mirror (`i18n/en/docusaurus-plugin-content-blog/{YYYY}/{MM}/{DD}-{slug}/index.md`)

```md
---
slug: {slug}
title: {title-in-english}
authors:
  name: Achinoise1
  title: Website Owner
  url: https://github.com/Achinoise1
  image_url: https://github.com/Achinoise1.png
tags: [{tags}]
---

<!-- TODO: Add English translation -->

<!--truncate-->

<!-- TODO: Full English body here -->
```
