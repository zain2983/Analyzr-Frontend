# Roadmap

This tracks the next phase of frontend work for the CSV Utility Platform. It builds on top of what's already documented in `CONTRIBUTING.md` ("Things Already Done" / existing to-dos) — this file is the more granular, actively-worked list for the upcoming milestone.

Line references point at the state of the code as of this writing; treat them as "roughly here", not as anchors.

**Ordering note:** Upload (JSON/XLSX) was previously item 2 and has been moved to item 5, directly before the broken-CSV work. This is a dependency ordering, not a demotion — see the note at the top of Section 5. Datasets moved up to item 2 because the selector unification it contains unblocks Compare Tab merges, rename, and any future per-dataset action.

---

## 1. Export — mostly shipped

- [x] **Download the full dataset as CSV — backend-driven, not client-side**
  - Decision (still holds): this is a backend export, not a client-side re-serialization of what's on screen. The frontend never holds the full dataset — `/api/upload` returns only metadata (`dataset_id`, `rows`, `columns`), and `/api/query` caps its payload at `result_df.head(100)`. Exporting what's rendered would silently produce a truncated file on any dataset bigger than the preview, and would diverge further as backend-side mutation features (Data Cleaning, Merge/Join, Transform) land and change the server-held `df` without the frontend seeing the result.
  - **Backend — done.** `app/api/download.py` exposes `GET /api/dataset/{dataset_id}/download`: looks the dataset up via `dataset_manager.get_dataset()`, 404s if absent, writes `df.to_csv(index=False)` into a `StringIO` and returns it as a `StreamingResponse` with `media_type="text/csv"` and a `Content-Disposition` attachment header. Mounted in `main.py` under the `/api` prefix.
  - **Frontend — done.** `lib/api/download-dataset.ts` fetches that endpoint, converts to a `blob()`, and triggers the browser download through a temporary `<a download>` + `URL.createObjectURL` / `revokeObjectURL`. `components/file-toolbar.tsx` renders a per-dataset download button inside each file chip, with a `downloadingId` spinner so concurrent clicks are visibly distinct.

### Remaining gaps in this section

- [ ] **The server-side filename is a UUID.** `download.py` sets `filename="{dataset_id}.csv"`. It only looks right in the browser because the frontend overrides it with `a.download = filename` from client-held `Dataset.name`. Any non-browser consumer (curl, a future API user) gets `9f3c…-….csv`. Either have the backend store the original filename at `create_dataset()` time and echo it in the header, or consciously document that naming is the frontend's job. Right now it's neither — it works by accident.
- [ ] **Download failures are invisible.** `file-toolbar.tsx` catches the error and only `console.error`s it; the spinner stops and nothing else happens, which reads as "the download silently didn't work". `sonner` is already a dependency and `components/ui/sonner.tsx` exists — surface a toast. This matters most for the stale-id case in Section 2, where a 404 is the *expected* failure after a backend restart.
- [ ] **No export of a SQL result set.** Distinct from exporting the dataset: `/api/query` truncates `data` to 100 rows, so a client-side export of the results table would silently drop everything past row 100. This needs a query-scoped backend endpoint (run the query, stream the full frame) rather than a frontend change. Not in scope for this pass, but don't ship a "download results" button without it.

## 2. Datasets

Ordered first because everything else in this file touches dataset selection, and the current inconsistency makes each of those touches a small migration of its own.

- [x] **Unify the dataset selector pattern**
  - There are four different selector UIs for the same concept, across eight tabs:
    - Card-grid buttons keyed by `dataset.id` — `sql-tab.tsx`, `check-commas-tab.tsx`
    - Card-grid buttons keyed by array index — `eda-tab.tsx`
    - shadcn `<Select>` keyed by `dataset.name` — `data-cleaning-tab.tsx`, `transformation-tab.tsx`, `merge-join-tab.tsx`
    - Native `<select>` keyed by index — `conversion-tab.tsx`, `visualizations-tab.tsx`, `data-ops-tab.tsx`
  - **Why `id` and not the other two:**
    - *Name isn't unique.* Nothing stops a user uploading `sales.csv` twice — `file-upload-modal.tsx` takes the name straight from `files[idx].name` with no dedupe. `merge-join-tab.tsx` even uses `key={dataset.name}` as a React key, so a duplicate name produces duplicate keys and a selection that can't distinguish the two.
    - *Index breaks on removal.* `handleRemoveDataset` in `app/page.tsx` does `datasets.filter((_, i) => i !== index)`, so every index above the removed one shifts down. An index-keyed tab holding `selectedDatasetIndex = 2` silently starts pointing at a different dataset — or past the end of the array — with no re-render signal that anything changed.
    - *`id` is what the backend keys on.* `dataset_manager.DATASETS` is a dict of UUID → `{df, created_at}`, and every working endpoint (`/api/query`, `/api/check-commas`, `/api/dataset/{id}/download`) takes `dataset_id`. Selector state keyed by `id` maps 1:1 onto what any API call needs, with no lookup step that can fail.
  - **Implementation:** one `components/dataset-selector.tsx` taking `value: string` (the id), `onChange: (id: string) => void`, `datasets: Dataset[]`, and a `variant: "grid" | "dropdown"` — the two shapes need to coexist, because the card grid suits tabs where picking a dataset *is* the page, and the dropdown suits the form-heavy tabs where it's one field among many. One component, two renderings, so migration doesn't force a visual redesign of six tabs at once.
  - Migrate one tab per change. Start with `sql-tab.tsx` and `check-commas-tab.tsx` — they're already id-keyed, so they validate the component's API without also changing behavior. The index-keyed tabs are the ones carrying the actual bug, so they follow immediately.
  - **Superseded:** the two-variant plan above shipped, but the `"grid"` card-buttons variant (`sql-tab.tsx`, `eda-tab.tsx`, `check-commas-tab.tsx`) was later removed on user feedback that it looked inconsistent with the rest of the app. `DatasetSelector` now renders only the dropdown; the `variant` prop is gone.

- [x] **Consistent `<Select>` styling, and highlight the active dataset in the file toolbar**
  - The shared `components/ui/select.tsx` fell back to shadcn's generic `--popover`/`--accent` theme tokens for the open dropdown panel and item hover, while every call site pasted the same `border-zinc-700 bg-zinc-800 text-zinc-100` override just for the closed trigger — flat, low-contrast, and inconsistent with the rest of the app's zinc/blue palette. Baked zinc borders, a real shadow, and blue hover/selected states into `SelectTrigger`/`SelectContent`/`SelectItem` directly so every `<Select>` (dataset picker, join columns, join type, etc.) looks consistent by default, and dropped the ~13 duplicate per-usage overrides.
  - The top file-toolbar strip gave no indication of which dataset was active while working in a single-dataset tab. Lifted `selectedDatasetId` out of `sql-tab.tsx`, `eda-tab.tsx`, and `check-commas-tab.tsx` (each tracked it independently) into shared state in `app/page.tsx` — switching between those three tabs now also keeps the same dataset selected — and pass it to `file-toolbar.tsx` so the matching chip gets a blue border/accent, shown only while `activeTab` is one of that trio.

- [x] **Reconcile stale dataset ids after a backend restart**
  - Not previously on this roadmap, and it's the most user-visible dataset bug today.
  - `app/page.tsx` rehydrates `datasets` from `sessionStorage` on mount. Those ids are UUIDs from `dataset_manager.DATASETS`, which is a plain module-level dict with no persistence — the backend is deliberately stateless per `CONTRIBUTING.md`.
  - So any backend restart empties that dict while the browser tab keeps rendering the chips: a redeploy, or a free-tier spin-down — which is precisely the cold-start case that `components/WakeBackend.tsx` and the backend-status pill in `app/page.tsx` already exist to handle. The frontend knows the backend was asleep and still trusts the ids it cached.
  - Every subsequent call then 404s with `"Dataset not found"`, surfaced as a raw status-and-JSON string, or as nothing at all in the download case.
  - **Fix:** add `GET /api/datasets` returning the live id list (trivial — it's `list(DATASETS.keys())`). On mount, once the wake probe reports `ready`, diff cached ids against that list and mark the missing ones as stale: disable their actions, badge the chip, offer re-upload. Prefer marking over silently dropping — the user still wants to know *which* files they had.

- [x] **"Remove all datasets" action — and actually evict on the backend**
  - `file-toolbar.tsx` supports removing one dataset at a time via `onRemoveDataset(index)`, and `app/page.tsx` handles it by filtering React state.
  - **Nothing tells the backend.** `delete_dataset()` is defined in `app/core/dataset_manager.py` but no router calls it — grepping the backend, the only occurrence is the definition itself. Every "removed" dataset's DataFrame stays resident for the life of the process. With a 20MB upload cap and five slots, that's a slow leak that a long-lived instance will feel.
  - So this is two changes: expose `DELETE /api/dataset/{dataset_id}` wrapping the existing `delete_dataset()`, add `lib/api/delete-dataset.ts`, and call it from *both* single-remove and clear-all. Treat it as best-effort — a 404 means it's already gone, which is the desired end state, so don't block the UI on it.
  - The "Clear all" button goes next to the upload button in `file-toolbar.tsx`, behind a confirmation. `components/ui/alert-dialog.tsx` is already present; use it rather than `window.confirm`.

- [x] **Rename dataset**
  - Cheaper than it looks: **the backend has no concept of a dataset name.** `create_dataset(df)` stores only `{df, created_at}` — the name exists purely on the client, set from `files[idx].name` in `file-upload-modal.tsx`. So rename is one `setDatasets` update, persisted for free through the existing `sessionStorage` effect, with no API call and no server migration.
  - **But it must land after the selector unification**, because three API clients key operations by name rather than id: `data-cleaning.ts`, `transformation.ts`, and `merge-join.ts` all take `dataset_name` / `dataset_names` / `source_dataset` in their request bodies, and the corresponding tabs pass the selected *name* through. Renaming before that migration means an operation silently addresses a dataset that no longer answers to that name.
  - Worth doing as part of the same change: **none of those three contracts are implemented yet.** They target `/api/clean/*`, `/api/transform/*`, and `/api/merge/*`, and `main.py` mounts only four routers — `upload`, `sql_query`, `check_commas_script`, `download`. Nothing on the backend implements the name-keyed contract, so switching those interfaces to `dataset_id` costs nothing today and gets progressively more expensive once the endpoints exist.
  - Same neighborhood, same change: those three modules each define their own `const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"`, while every module that actually works imports `BACKEND_URL` from `lib/config.ts` — which is a hardcoded localhost string with the production URL sitting commented out beside it. Two sources of truth for the backend address, one of which is a comment. Consolidate on `lib/config.ts` and have it read the env var.
  - UI: inline rename in `file-toolbar.tsx` chips and/or `dataset-summary.tsx`. Keep the original filename around (a `sourceName` field) so the download filename and any repair report can still refer to the file the user actually uploaded.

## 3. Compare Tab

- [ ] **Fuzzy column matching (detection)**
  - `components/tabs/compare-tab.tsx` builds a `Set` of every column name across datasets, then tests presence with `dataset.columnNames.includes(column)` — exact and case-sensitive. `Email` and `email` are two unrelated rows in the matrix today, and both land in "unique columns", which is exactly the signal a user would read as "these files disagree".
  - **No fuzzy dependency, hand-roll it.** `package.json` has no `fuzzysort` / `Fuse` / `leven`. The problem is small and bounded — at most 5 datasets, tens of columns each, short ASCII-ish strings — so a `lib/fuzzy-columns.ts` of a few dozen lines beats pulling in a general-purpose search library whose ranking model is tuned for a different problem (interactive prefix search over long documents).
  - Layer the checks cheapest-first, and keep them separable so each can be tuned or disabled:
    1. **Normalize** — lowercase, strip non-alphanumerics. Catches `Customer ID` / `customer_id` / `customerId`, which is likely the bulk of real-world cases, at exact-match cost.
    2. **Token containment** — split on `_`, spaces, and camel boundaries; flag when one token set is a subset of the other. Catches `email` vs `email_address`, which normalization alone misses because the strings genuinely differ.
    3. **Levenshtein ratio** on the normalized forms, threshold around 0.8. Catches abbreviations like `customer_id` vs `cust_id` that neither earlier layer gets. Run it last — it's the only quadratic-ish step, and by then most pairs are resolved.
  - **Always present as suggestions, never auto-merge.** A wrong merge doesn't throw an error, it quietly tells the user two different columns are the same one — and the entire purpose of this tab is letting them trust a cross-file comparison. Show the matched pair with its score and let the user accept.

- [ ] **Inline merge — deliberately split from detection**
  - Merging two near-duplicate columns means renaming a column in the server-held `df`. There is no endpoint for that: `main.py` mounts upload, query, check-commas, and download, and none of them mutate.
  - A frontend-only "merge" would mutate `Dataset.columnNames` and change nothing real — that field is never sent on any request, and the backend re-derives columns from its own `df` on every call. The Compare Tab would show a merge that no other tab or query agrees with.
  - So: ship detection now (independently useful — it turns a wall of "unique" rows into a short list of likely matches), and hold merge until the transform pipeline from `CONTRIBUTING.md`'s to-dos exists. At that point this becomes a thin caller of `POST /api/transform/rename`, not a feature of its own.

- [ ] **Hover preview of sample data**
  - Blocked on something not previously captured here: **the frontend holds no row data at all.** `Dataset.data` is declared optional in `app/page.tsx` and is never populated — `file-upload-modal.tsx` constructs each `Dataset` from the upload response, which carries only `dataset_id`, `rows`, and `columns`. (This is also why `eda-tab.tsx` computes its column stats over `dataset.data?.map(...) || []` and reports zeros for everything.)
  - Two ways to get sample values: a new `GET /api/dataset/{id}/sample` endpoint, or reuse the shipped `/api/query` with `SELECT "col" FROM dataset WHERE "col" IS NOT NULL LIMIT 5`.
  - **Prefer reusing `/api/query`** — it costs zero backend work. `sql_query.py` already registers the frame in DuckDB under both `data` and `dataset`, already normalizes `NaN` to `None` so the JSON is clean, and already 404s consistently. A dedicated sample endpoint would reimplement all three for no gain at this scale.
  - Fetch lazily on hover-open, and cache per `dataset.id + column` in a `useRef` map so re-hovering the same header doesn't re-query. `components/ui/hover-card.tsx` and `@radix-ui/react-hover-card` are already installed.
  - **Quote the column identifier** (`"col"`) when building that SQL. Column names come from arbitrary user files and routinely contain spaces, punctuation, or reserved words; an unquoted identifier is both a correctness bug and an injection seam. Escape embedded double-quotes by doubling them.

## 4. SQL Tab

- [x] **Fix the result count — a correctness bug, not polish**
  - `sql_query.py` returns `rows: len(result_df)` (the true match count) alongside `data: result_df.head(100).to_dict(...)` (the capped payload).
  - `sql-tab.tsx` reads `res.data` into `resultRows` and then renders the heading from `resultRows.length`. A query matching 5,000 rows displays **"Results (100 rows)"**.
  - That's actively misleading — a user checking "how many records match this filter" gets a wrong answer with no indication it's truncated. Keep `res.rows` in state and render "Showing first 100 of 5,000". Do this before any layout work.

- [x] **Autocomplete: cover both table aliases, then add types**
  - `sql-tab.tsx` builds the CodeMirror SQL extension with `schema: { dataset: selectedDs.columnNames }` and `defaultTable: "dataset"`. But the backend registers the frame under **two** names — `con.register("data", df)` and `con.register("dataset", df)` — so `SELECT * FROM data` is valid SQL that gets no completions. Add `data` to the schema map; it's a one-line fix that removes a silent dead end.
  - Type hints need a backend change first: `/api/upload` returns `list(df.columns)` and nothing else. Adding `df.dtypes.astype(str).to_dict()` to that response is additive — existing clients ignore the new key — and gives the editor enough to annotate completions and to offer type-appropriate snippets (date range filters on datetime columns, aggregates on numerics).

- [x] **Starter-query picker — and why it can't use `useState`**
  - The editor is intentionally uncontrolled: the query text lives in `queryRef`, fed to CodeMirror as `defaultValue`, with a comment at the declaration explaining the reason — keeping it out of React state stops every keystroke re-rendering the tab.
  - So inserting a starter query cannot be a `setQuery(...)` call; `defaultValue` is read once and won't re-apply. It needs an `EditorView` handle via `onCreateEditor`, then an explicit `view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: q } })`, *and* a write to `queryRef.current` so `execute()` sends what the user sees.
  - Spelled out here because the obvious implementation is to lift the query into state, which would regress the exact typing-performance problem the ref was introduced to solve.
  - Starter set worth having: `SELECT * FROM dataset LIMIT 10`, `SELECT col, COUNT(*) FROM dataset GROUP BY col ORDER BY 2 DESC`, and a null-audit query. Generate them against the selected dataset's real column names rather than shipping placeholder text.
  - Shipped with an additional fix beyond scope: `defaultValue` turned out not to be a real prop on the installed `@uiw/react-codemirror` version, so the editor rendered blank on every mount — switched to `value`, which is what actually seeds the initial doc here.

- [x] **Reconsider `sanitizeQuery`**
  - `sanitizeQuery` strips everything after the first `--` on each line, flattens newlines, and then rewrites a `LIMIT n WHERE ...` pattern into `WHERE ... LIMIT n` via regex.
  - It has no notion of string literals, so `WHERE code = 'a--b'` is truncated to `WHERE code = 'a` and DuckDB rejects it with a parse error that points nowhere near the real cause. The `LIMIT`/`WHERE` rewrite is likewise guessing at intent and silently changing what the user typed.
  - **Recommendation: delete the rewriting and send the query as-is.** DuckDB is the authority on whether the SQL is valid and already returns a precise message that `sql_query.py` surfaces as a 400 `detail`. Silently editing a user's query to make it parse is worse than an honest error. If comment-stripping turns out to be genuinely needed, do it with a single-pass scanner that tracks quote state — not line-wise `indexOf`.

- [x] **Error presentation** — parse `detail` out of the JSON body in the API client and throw that alone, so the tab shows the DuckDB message without the status code and braces. Applied to `sql.ts`, `upload-dataset.ts`, and `download-dataset.ts` via a shared `parseApiError` helper.
- [x] **Drop debug logging** — removed the `console.log` of every query payload and response in `sql-tab.tsx` and `lib/api/sql.ts`.
- [ ] **Layout** — the selector, editor, and run button still share one flat `Card`, with results in a second. `react-resizable-panels` is already a dependency — a resizable split would let users grow the results pane, which matters for the wide tables this tab produces.
  - Attempted and reverted: a vertical `ResizablePanelGroup` around the query/results cards caused CodeMirror's internal layout measurement to break (editor content became invisible after the panel resized), traced to `PanelGroup` always setting an inline `height: 100%` that fights Tailwind height classes. Revisit with a fixed-height wrapper div around the whole group (not just a class on it) if this is picked back up.

## 5. Upload — JSON and XLSX support

**Why this moved down:** not a priority drop. Everything below — dispatching on file type, inferring shape and dtypes, reporting per-format problems back to the user — is the same "detect → parse → normalize" seam that Section 6 builds properly. Landing JSON/XLSX first means writing that logic once for the new formats and then again, differently, for the repair pipeline. The two exceptions are the format-mismatch bug and the case-sensitivity bug below, which should be fixed now regardless of sequencing.

- [x] **The dropzone advertises formats the backend rejects — fix now**
  - `components/file-upload.tsx` sets `accept=".csv,.json,.xlsx"` and filters with `/\.(csv|json|xlsx)$/i`, and the help text explicitly promises all three.
  - `app/api/upload.py` rejects anything that isn't `.csv` with a 400 before reading a byte.
  - A user dragging an `.xlsx` gets `Upload failed: 400 {"detail":"Only CSV files are allowed"}` rendered verbatim in the modal. Either gate the dropzone back to `.csv` until the backend catches up, or land the backend change first — but don't leave the UI promising something the API refuses.
  - **Resolved by landing backend format dispatch below** rather than gating the dropzone — the promise is now true.
- [x] **Case-sensitivity bug — fix regardless of this section's sequencing**
  - The backend check is `file.filename.endswith(".csv")`, so `DATA.CSV` (a very normal export from Windows tooling) is rejected. The frontend's regex is case-insensitive, so the two sides disagree about what a valid file is. Use `Path(file.filename).suffix.lower()`.
- [x] **Backend format dispatch**
  - `.csv` → `pd.read_csv`; `.json` → `pd.read_json` / `pd.json_normalize`; `.xlsx` → `pd.read_excel`.
  - **`read_excel` requires `openpyxl`, which is not in `requirements.txt`** (currently: fastapi, uvicorn, pandas, duckdb, python-multipart). Pandas imports it lazily, so this fails at *request* time with an `ImportError`, not at boot — it would pass any import-level smoke test and then break in production on the first upload. Add it in the same change.
  - **JSON shape:** an array of objects maps cleanly to a frame; a nested or envelope-wrapped document does not. Use `pd.json_normalize` for nesting, and reject non-record-shaped input with a specific message rather than producing a one-row frame whose cells are dicts — that "succeeds" and then breaks every downstream tab.
  - **XLSX sheets:** `pd.read_excel(..., sheet_name=None)` returns a dict of frames. Decide explicitly rather than by default: first sheet with the chosen sheet name echoed in the response is the right v1; a sheet picker means a two-phase upload flow and a real UI change, so don't drift into it accidentally.
  - **Size cap:** the 20MB check seeks the uploaded temp file. XLSX is zip-compressed, so a 20MB file can expand into a far larger frame in memory — worth a post-parse row/cell guard, especially given datasets are never evicted today (Section 2).
  - Shipped as `pd.ExcelFile(...).parse(sheet_name)` rather than `read_excel(sheet_name=None)`, so only the first sheet is ever parsed — no wasted work reading sheets that get thrown away. Needed one fix beyond the plan: openpyxl requires a real seekable stream, which Starlette's `SpooledTemporaryFile` doesn't fully provide — reading it into `io.BytesIO` first fixed a `'SpooledTemporaryFile' object has no attribute 'seekable'` error. The post-parse guard landed as a flat 5M-cell cap, verified against a 13MB XLSX (well under the 20MB file cap) that expands to 6M cells and correctly gets rejected.
- [x] **Tighten the upload contract**
  - `lib/api/upload-dataset.ts` sends an optional `dataset_id` form field that `upload.py` doesn't declare, so FastAPI silently discards it. Either implement client-supplied ids or remove the field — a parameter that looks supported but isn't will eventually be trusted by someone.
  - Parse FastAPI's `detail` in `uploadDataset` and throw that, so `FileUploadModal` can render "XLSX files aren't supported yet" instead of a status code and a JSON blob.
  - Verify `rows` / `columns` / `columnNames` populate correctly for each format. `file-upload-modal.tsx` currently tolerates `columns` being either an array *or* a number (`Array.isArray(resp.columns) ? resp.columns.length : (resp.columns ?? 0)`) — defensive code around an unsettled response shape. Once the contract is pinned per format, pick one shape and drop the branch.
  - The `detail`-parsing half of this had already shipped in Section 4's `parseApiError` work. Removed the unused `dataset_id` field and the array-or-number branch; verified `rows`/`columns`/`columnNames` end to end for all three formats via curl and through the actual upload modal in the browser.

## 6. Handling Broken / Malformed CSV Files

This is the highest-leverage item on this roadmap: it's the difference between "CSV analytics tool" and "the tool that makes messy data usable at all." It's split out separately because — unlike the items above — most of the actual work lands in [Analyzr-Backend](https://github.com/zain2983/Analyzr-Backend), and the frontend's job is mainly to *surface* what happened during upload rather than to do the repair itself.

Sources for this section: research notes from a [ChatGPT conversation](https://chatgpt.com/share/69d4684e-2fd0-8323-a58e-b9159b399ede) walking through where CSVs actually break and how to build a repair pipeline, and [odileeds/open-data-tips](https://github.com/odileeds/open-data-tips), a reference list of common open-data/CSV publishing mistakes and how to avoid them.

### Where CSVs actually break

Pulled together from both sources, the failure modes fall into four buckets:

1. **Structural problems** (the parser itself chokes)
   - Uneven number of columns per row (a trailing comma missing, or an extra one)
   - Mixed delimiters in the same file (`,` in some rows, `;` in others — common when a file's been re-exported or hand-edited)
   - Broken/unterminated quoting, e.g. `"John, Doe,25` where a quote was never closed — this is what usually causes a whole file to fail rather than just one row
2. **Encoding problems**
   - UTF-8 vs UTF-16 vs ISO-8859-1 exports (very common from Excel/legacy systems)
   - A leading BOM (byte-order-mark) character that silently breaks the first column's header name
   - Garbled symbols from a mismatched encoding (`â€™` instead of `’`, stray `�`)
3. **Data-level problems** (file parses fine, but the data itself is unreliable)
   - Numbers stored as text, or with thousands separators baked in (`"1,200"` instead of `1200`) — odileeds flags this specifically: locale-dependent separators make `1.200` ambiguous between "one point two" and "one thousand two hundred"
   - Dates in inconsistent formats within the *same* column (`01/02/24`, `2024-02-01`, `Feb 1 2024`) — odileeds' fix is to standardize on ISO 8601 (`2024-02-01`) on ingest
   - Inconsistent null representations across cells: `NULL`, `null`, `N/A`, `-`, `""` all meaning "no value"
4. **Spreadsheet export corruption** (the single biggest real-world source, per the research) — Excel/Google Sheets silently mangle CSVs on export/re-save:
   - Line breaks embedded inside a quoted cell (breaks naive line-by-line readers)
   - Long numeric IDs auto-converted to scientific notation (`123456789012345` → `1.23457E+14`) — this one is especially nasty because it's silent data loss, not a parse error
   - Auto "helpful" date conversion changing the underlying value

odileeds' guidance is really the *prevention* side of this same coin — one table per file, ISO dates, no summary/total rows mixed into the data, no units embedded in numeric cells — worth keeping in mind for our own CSV *export* feature (Section 1) so we don't reintroduce these problems on the way out.

### Proposed approach: repair happens on upload, in the backend

Looking at how upload works end to end: `components/file-upload.tsx` only validates the file *extension* client-side; the bytes are handed off untouched via `lib/api/upload-dataset.ts` to the FastAPI `/api/upload` endpoint, which does a single unguarded `pd.read_csv(file.file)` — no encoding detection, no delimiter sniffing, no per-row error tolerance. One malformed row fails the entire upload with a generic `Invalid CSV file: ...`.

No CSV parsing happens in the browser today, which is the right foundation to build on: fault-tolerant parsing needs `pandas`/`csv`/`chardet`-grade tooling that isn't practical to replicate in JS, and large or broken files are safer to process server-side than in-tab.

So the plan is: **keep the frontend upload flow as-is**, and add a repair stage inside the backend's `/api/upload` handler, between "file received" and "return dataset metadata":

```
Upload → Detect (encoding/delimiter/quote char) → Fault-tolerant parse → Auto-repair → Schema inference → Normalize → Return metadata (+ repair report)
```

Backend-side building blocks (tracked here for context; the implementation is an Analyzr-Backend task):
- **Detection**: `chardet.detect(file_bytes)` for encoding, `csv.Sniffer().sniff(sample)` for delimiter (falling back to `csv.get_dialect('excel')` if sniffing fails). Note this means reading the bytes once up front rather than handing the file object straight to pandas — `upload.py` already seeks the file for its size check, so the read-then-parse shape is a small change.
- **Fault-tolerant parsing**: read row-by-row instead of failing the whole file on one bad row — pad short rows with nulls, merge cells back together when a row has too many columns (usually a broken quote), and re-join lines when a quote was opened but never closed.
- **Schema inference**: after repair, infer per-column types (int/float/date/string) with a confidence score, rather than treating everything as a string. This is the same dtype information Section 4 wants for SQL autocomplete — build it once and return it from `/api/upload` for both consumers.
- **Normalization**: collapse the null-variant list (`NULL`, `N/A`, `-`, `""`, …) to one representation, strip thousands separators from numeric-looking text columns, and standardize date columns to ISO 8601.
- Note there's already a narrow precedent for this in `app/api/check_commas_script.py`, which scans raw CSV text for lines with an odd number of `"` characters. That's the "unterminated quote" case from bucket 1, detected post-hoc as a separate user-invoked step. The repair pipeline should subsume that detection at ingest; keep the Check Commas tab as a report over the *repair* results rather than a second, independent implementation of the same scan.

### What the frontend needs once the backend can repair

This is the part that's in-scope for this repo, and the reason this section belongs on the frontend roadmap:

- [ ] **Surface a "repair report" after upload**, e.g. in `FileUploadModal` or as a follow-up toast/panel:
  > "Fixed 213 malformed rows · Detected encoding: UTF-16 → converted to UTF-8 · Repaired 54 broken quotes · Normalized 3 date formats"

  This means extending the `uploadDataset` response contract and the `Dataset` type in `app/page.tsx` with a `repairReport` field. Since `Dataset` is persisted to `sessionStorage`, keep the report small and serializable — counts and short strings, not sample rows.
- [ ] **"Repair preview" (nice-to-have, high trust value)**: a side-by-side of a handful of original-vs-fixed rows so users can verify what changed before relying on the dataset. Only worth doing once the backend can return sample before/after rows — and it should be fetched on demand rather than stuffed into the upload response, for the same sessionStorage-size reason.
- [ ] **Distinguish "repaired with warnings" from "clean upload"** in the `FileToolbar` dataset chips (e.g. a small warning-triangle badge), so users know which files to double-check. The chips are already tight on space at a fixed 200px width — this likely lands as an icon next to the existing download and remove buttons.
- [ ] Treat this as a dependency for **Section 5 (JSON/XLSX upload)** — the same detect → repair → normalize pipeline should apply regardless of source format — and as the guarantee that **Section 1's export** returns repaired, normalized data rather than the raw bytes as parsed.

---

### Suggested sequencing

1. **Dataset selector unification** (Section 2) — several other items get simpler once there's one consistent `id`-based selector, and it's a prerequisite for rename.
2. **Stale-id reconciliation + backend eviction** (Section 2) — both are small, both fix real breakage today, and neither depends on anything else.
3. **Rename + clear-all** (Section 2) — low risk once 1 and 2 are in.
4. **SQL Tab correctness fixes** (Section 4: the 100-row count, the `data` table alias, dropping `sanitizeQuery`'s rewriting) — independent of everything above, and they're bugs rather than features.
5. **Compare Tab fuzzy detection + hover preview** (Section 3) — detection is self-contained; the preview reuses the shipped `/api/query` endpoint.
6. **Broken CSV handling** (Section 6) — the backend repair pipeline plus frontend repair-report surfacing. Do this before item 7, since JSON/XLSX should build on the repaired path rather than the raw one, and its schema inference also feeds SQL autocomplete type hints.
7. **Upload: JSON/XLSX** (Section 5) — reuses the same detect → repair → normalize pipeline. The format-mismatch and case-sensitivity bugs in that section are exceptions: fix them immediately, they don't need to wait.
8. **SQL Tab polish** (Section 4: layout, starter queries, type-aware autocomplete) — the type hints depend on Section 6's schema inference.
9. **Compare Tab inline merge** (Section 3) — blocked on a backend transform/rename endpoint that doesn't exist yet.
