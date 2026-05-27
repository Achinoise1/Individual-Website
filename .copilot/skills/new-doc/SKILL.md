---
name: new-doc
description: "Scaffold a new docs page under docs/<Topic>/<PageName>.md with proper frontmatter, add the doc ID to the correct category in sidebars.ts, and add any new tags to docs/tags.yml. Use when: creating a new documentation page with correct path/frontmatter/sidebar wiring."
disable-model-invocation: false
argument-hint: "<topic/page description and optional tag/ref hints>"
---

# new-doc Workflow

This skill scaffolds a new Docusaurus docs page for this site. It reads the existing sidebar and directory structure, then asks you to confirm before writing any file.

---

## Conventions

### Path Rules

- Target pattern: `docs/<Topic>/<PageName>.md`
- `<Topic>` must match an **existing** directory under `docs/` (e.g., `Backend/Python/basic`, `Backend/Python/framework/Django`).
- `<PageName>` must be **kebab-case**, all lowercase, content-oriented and concise (e.g., `async-await`, `class-based-views`, `virtual-env`).
- Use `.mdx` extension **only** if the user explicitly says `mdx` or the page clearly needs JSX/component imports.
- If the target file already exists, **stop and ask**.

### Frontmatter Rules

Docs pages use **only** these two fields — match exactly what sibling pages use:

```yaml
---
tags: [tag1, tag2]
title: 页面标题
---
```

- `title`: concise Chinese phrase by default; use English when the topic is a product name, acronym, or CLI tool (e.g., `FastAPI 依赖注入`, `Git Rebase`).
- Mirror the style of sibling pages in the same directory.
- **No** `keywords`, `description`, `references`, `sidebar_position`, or other fields unless explicitly requested.

### Known Tags (`docs/tags.yml`)

Prefer existing tags over creating new ones:

| Key | Label |
|---|---|
| `python` | Python |
| `fundamental` | Fundamental |
| `backend` | Backend |
| `frontend` | Frontend |
| `django` | Django |
| `fastapi` | FastAPI |
| `flask` | Flask |
| `tools` | Tools |
| `config` | Config |
| `linux` | Linux |
| `installation` | Installation |
| `centos` | CentOS |
| `aliyun` | Aliyun |
| `ecs` | ECS |
| `docusaurus` | Docusaurus |
| `nvm` | Nvm |

Any tag NOT in this table must be flagged **⚠️ NEW** during the confirm step — a YAML entry will be appended to `docs/tags.yml` upon confirmation.

### Sidebar (`sidebars.ts`) Rules

- The file is TypeScript; all item IDs are plain strings (e.g., `'Backend/Python/basic/async-await'`).
- The only sidebar is `tutorialSidebar`. There is no `snippetsSidebar`.
- Categories are nested `{ type: 'category', label: '...', items: [...] }` objects.
- Indentation is **2 spaces**; string items use **single quotes**; a trailing comma is used on each item.
- When inserting, append to the **end** of the matching `items` array, on its own line, matching surrounding indent.

---

## Workflow

### Step 1 — Parse user input

Extract from the user's message:

| Field | How to detect |
|---|---|
| **Topic** | Core subject matter — maps to a docs directory path |
| **Page name** | Explicit name hint, or derive kebab-case from the topic |
| **Tags** | Explicit `tags: tag1,tag2` or inferred from topic |
| **`mdx`** | Use `.mdx` extension |
| **`with i18n`** | Also create English mirror under `i18n/en/docusaurus-plugin-content-docs/current/` |

Use whatever the user gave verbatim — do NOT overwrite explicit values.

---

### Step 2 — Determine target path

1. List `docs/` directory to find existing topic directories.
2. Match the user's topic to an existing path (e.g., "Python基础" → `Backend/Python/basic`, "Django" → `Backend/Python/framework/Django`).
3. If no existing directory matches:
   - **Stop and ask** before creating a new top-level topic — it also requires a new category block in `sidebars.ts` and a `README.md`.
4. Generate a kebab-case `<PageName>` from the topic/description if not provided by the user.
5. Check whether `docs/<Topic>/<PageName>.md` already exists — if yes, **stop and ask**.

---

### Step 3 — Suggest tags

1. Consult the Known Tags table above.
2. Suggest 1–3 tags relevant to the topic, preferring tags that already exist.
3. Mark any tag NOT in the Known Tags table as **⚠️ NEW**.

---

### Step 4 — Determine sidebar insertion point

1. Read `sidebars.ts`.
2. Walk the nested category tree inside `tutorialSidebar` to find the category whose `items` array should contain the new doc ID.
   - Match by navigating labels that correspond to the topic path (e.g., `后端 → Python → Django 框架` for `Backend/Python/framework/Django/<PageName>`).
   - Confirm the match by checking that sibling items already share the same ID prefix.
3. **If the matching category is found**:
   - The new item ID is `'<Topic>/<PageName>'`.
   - Append to the end of that category's `items` array.
   - Preserve 2-space indent and trailing comma style.
4. **If no matching category is found**:
   - Show the exact TypeScript `{ type: 'category', ... }` block that would need to be added.
   - Note that a `README.md` for the new category is also required.
   - Ask: "Proceed with creating a new category?"

---

### Step 5 — Confirm before writing

**Always confirm first** unless the user's input was fully explicit (path + title + tags with no ambiguity).

Show the user:

1. **File**: `docs/<Topic>/<PageName>.md`
2. **Frontmatter preview** (full YAML block)
3. **Sidebar**: which category label + position (e.g., `tutorialSidebar → 后端 → Python → 基础, appended at end`)
4. **⚠️ New tags** to be added to `docs/tags.yml` (if any)
5. **i18n mirror path** (if `with i18n` was given)

Then ask: **"Proceed?"**

---

### Step 6 — Create the doc file

After confirmation, create `docs/<Topic>/<PageName>.md` with **frontmatter only** — no heading, no body, no placeholder comments:

```markdown
---
tags: [<tag1>, <tag2>]
title: <Title>
---
```

- For `.mdx`, add any needed imports above the frontmatter block.

---

### Step 7 — Insert into `sidebars.ts`

Use Edit to add `'<Topic>/<PageName>',` at the end of the target `items` array.

**Example** — appending `'Backend/Python/basic/async-await'` to the `基础` category:

```typescript
              items: [
                'Backend/Python/basic/data-container',
                // ... existing items ...
                'Backend/Python/basic/memory-manage',
                'Backend/Python/basic/async-await',   // ← inserted here
              ],
```

- Match the surrounding indentation exactly (count spaces from the existing items).
- Use single quotes and a trailing comma.
- Never duplicate an ID that is already present in any `items` array.

---

### Step 8 — Update `docs/tags.yml` (if new tags)

Append each new tag in this format (alphabetical order, blank-line-separated):

```yaml
<tagkey>:
  label: <Tag Label>
  permalink: /<tagkey>
  description: <Tag Label> related posts
```

---

### Step 9 — i18n mirror (only if `with i18n` was requested)

1. Check the existing structure under `i18n/en/docusaurus-plugin-content-docs/` to confirm the mirrored path shape.
2. Create: `i18n/en/docusaurus-plugin-content-docs/current/<Topic>/<PageName>.md`

```markdown
---
tags: [<tags>]
title: <English Title>
---

# <English Title>

<!-- TODO: Add English translation -->

## 
```

---

### Step 10 — Report

Print all created/modified file paths. Show the exact line inserted into `sidebars.ts`. Flag any `<!-- TODO -->` placeholders for the user to fill in. Do **not** stage or commit.

---

## Guardrails

- **Never overwrite** an existing doc file. If the target exists, stop and ask.
- **Never add** a doc ID to `sidebars.ts` that is already present anywhere in the file.
- **Never create** a new top-level topic/category without asking — it also requires a `README.md` and a new category block.
- **Never create** an i18n mirror unless the user explicitly asked.
- **Never invent** tag descriptions. Use `<Tag Label> related posts` as the template.
