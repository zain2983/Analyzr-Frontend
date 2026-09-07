# Roadmap

This tracks the next phase of frontend work for the CSV Utility Platform. It builds on top of what's already documented in `CONTRIBUTING.md` ("Things Already Done" / existing to-dos) — this file is the more granular, actively-worked list for the upcoming milestone.

---

## 1. Export

- [ ] **Download results as CSV**
  - Add a "Download CSV" action wherever a result table is rendered (SQL Tab query results, Compare Tab matrix, EDA/Data Ops outputs, etc.).
  - Should work client-side (convert the in-memory `Record<string, any>[]` result to CSV and trigger a browser download) since the platform is explicitly stateless/in-memory — no backend round-trip needed for this.
  - Reuse one shared helper (e.g. `lib/export/to-csv.ts`) instead of duplicating CSV-stringify logic per tab.

## 2. Upload

- [ ] **JSON and XLSX upload support**
  - `components/file-upload.tsx` already accepts `.csv,.json,.xlsx` on the `<input>` and filters by `/\.(csv|json|xlsx)$/i`, so the *frontend* dropzone already advertises this.
  - What's missing: confirming/handling the backend's actual support for non-CSV files end-to-end (`lib/api/upload-dataset.ts` just POSTs the raw `File` to `/api/upload` regardless of type). Needs:
    - Backend contract check (does `/api/upload` parse JSON/XLSX today, or only CSV?) — coordinate with [Analyzr-Backend](https://github.com/zain2983/Analyzr-Backend).
    - Per-type error messaging in `FileUploadModal` if a format isn't supported yet, instead of a generic failure.
    - Verify `Dataset` metadata (`rows`, `columns`, `columnNames`) is populated correctly for JSON (nested/array-of-objects) and XLSX (multi-sheet) inputs.

## 3. Compare Tab

- [ ] **Fuzzy column matching + inline merge**
  - `components/tabs/compare-tab.tsx` currently does exact-name matching only (`dataset.columnNames.includes(column)`) to build the presence matrix and the "unique columns" list.
  - Add fuzzy matching (e.g. Levenshtein/`fuzzysort`) so near-duplicate columns across files (`customer_id` vs `cust_id`, `Email` vs `email_address`) are surfaced as likely-same-column suggestions instead of showing up as two separate "unique" rows.
  - Let the user merge/rename these suggested pairs directly from the Compare Tab (updates the working column mapping for that dataset without leaving the page).
- [ ] **Hover preview of sample data**
  - On hovering a column name in the presence matrix, show a small popover/tooltip with a few sample values from that column (first N non-null rows) so users can visually confirm a fuzzy match before merging.
  - Likely reuses the `HoverCard` primitive already in `components/ui/hover-card.tsx`.

## 4. SQL Tab

- [ ] **UI polish**
  - `components/tabs/sql-tab.tsx` uses CodeMirror (`@uiw/react-codemirror` + `@codemirror/lang-sql`) with `autocompletion: true` already on — but autocompletion currently only knows the selected dataset's column names via `sql({ schema: { dataset: selectedDs.columnNames } })`.
  - Improve layout/spacing around the query editor and results table (current layout is a single flat `Card`), and add clearer loading/error states than the inline red text.
- [ ] **Smarter suggestions and autofill**
  - Extend the schema passed to `sql()` with per-column type hints if the backend can supply them, so autocomplete can suggest more than just column names (e.g. templated `WHERE`/`GROUP BY` snippets).
  - Consider a quick "starter query" picker (e.g. `SELECT * LIMIT 10`, `SELECT col, COUNT(*) GROUP BY col`) to reduce manual typing for common patterns.

## 5. Datasets

- [ ] **Unify the dataset selector pattern**
  - Right now there are at least three different dataset-selector UIs across tabs for the same underlying concept:
    - Card-grid buttons keyed by `dataset.id` (`sql-tab.tsx`, `check-commas-tab.tsx`)
    - Card-grid buttons keyed by array index (`eda-tab.tsx`)
    - shadcn `<Select>` keyed by `dataset.name` (`data-cleaning-tab.tsx`, `transformation-tab.tsx`, `merge-join-tab.tsx`)
    - Native `<select>` keyed by index (`conversion-tab.tsx`, `visualizations-tab.tsx`)
  - Consolidate into one shared `DatasetSelector` component (`components/dataset-selector.tsx`) that all tabs use, keyed consistently by `dataset.id` (not `name` or array index — names aren't guaranteed unique and index breaks when datasets are removed/reordered). Swap each tab over one at a time.
- [ ] **"Remove all datasets" action**
  - `components/file-toolbar.tsx` only supports removing one dataset at a time via `onRemoveDataset(index)`. Add a "Clear all" button next to the upload button (with a confirmation, since it's destructive) that resets the `datasets` state in `app/page.tsx` back to `[]`.
- [ ] **Rename dataset**
  - No rename affordance exists today — `dataset.name` is fixed at upload time from the original filename. Add inline rename (e.g. double-click or an edit icon in `file-toolbar.tsx` / `dataset-summary.tsx`) that updates `Dataset.name` in state.
  - Since several tabs currently key selectors off `dataset.name` (see above), renaming should happen *after* or alongside the selector unification so a rename doesn't silently break an active selection elsewhere.

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

odileeds' guidance is really the *prevention* side of this same coin — one table per file, ISO dates, no summary/total rows mixed into the data, no units embedded in numeric cells — worth keeping in mind for our own CSV *export* feature (item 1 above) so we don't reintroduce these problems on the way out.

### Proposed approach: repair happens on upload, in the backend

Looking at how upload currently works end to end: `components/file-upload.tsx` only validates the file *extension* client-side; the actual bytes are handed off untouched via `lib/api/upload-dataset.ts` (`uploadDataset`) to the FastAPI `/api/upload` endpoint. No CSV parsing happens in the browser today — which is the right foundation to build on, since fault-tolerant parsing needs `pandas`/`csv`/`chardet`-grade tooling that isn't practical to replicate in JS, and large/broken files are safer to process server-side than in-tab.

So the plan is: **keep the frontend upload flow exactly as-is**, and add a repair stage inside the backend's `/api/upload` handler, between "file received" and "return dataset metadata":

```
Upload → Detect (encoding/delimiter/quote char) → Fault-tolerant parse → Auto-repair → Schema inference → Normalize → Return metadata (+ repair report)
```

Backend-side building blocks (tracked here for context, actual implementation is an Analyzr-Backend task):
- **Detection**: `chardet.detect(file_bytes)` for encoding, `csv.Sniffer().sniff(sample)` for delimiter (falling back to `csv.get_dialect('excel')` if sniffing fails)
- **Fault-tolerant parsing**: read row-by-row instead of failing the whole file on one bad row — pad short rows with nulls, merge cells back together when a row has too many columns (likely a broken quote), and re-join lines when a quote was opened but never closed before continuing to the next row
- **Schema inference**: after repair, infer per-column types (int/float/date/string) with a confidence score, rather than treating everything as a string
- **Normalization**: collapse the null-variant list (`NULL`, `N/A`, `-`, `""`, …) to one representation, strip thousands separators from numeric-looking text columns, and standardize date columns to ISO 8601

### What the frontend needs once the backend can repair

This is the part that's actually in-scope for this repo, and it's the reason this section belongs on the frontend roadmap:

- [ ] **Surface a "repair report" after upload**, e.g. in `FileUploadModal` or as a follow-up toast/panel:
  > "Fixed 213 malformed rows · Detected encoding: UTF-16 → converted to UTF-8 · Repaired 54 broken quotes · Normalized 3 date formats"
  This means extending the `uploadDataset` response contract (and the `Dataset` type in `app/page.tsx`) with a `repairReport` field the backend returns alongside `dataset_id`/`rows`/`columns`.
- [ ] **"Repair preview" (nice-to-have, high trust value)**: a side-by-side of a handful of original-vs-fixed rows so users can verify what got changed before relying on the dataset. Only worth doing once the backend can return sample before/after rows.
- [ ] **Distinguish "repaired with warnings" from "clean upload"** in the `FileToolbar` dataset chips (e.g. a small warning-triangle badge on a dataset that needed repair), so users know which files to double check.
- [ ] Treat this as a dependency for the **CSV download** item (Section 1) and **JSON/XLSX upload** item (Section 2) — repaired/normalized data should be what gets exported, and the same detect → repair → normalize pipeline should apply regardless of source format.

---

### Suggested sequencing

1. Dataset selector unification first — several other items (rename, Compare Tab merge) get simpler once there's one consistent `id`-based selector component.
2. Datasets: remove-all + rename (small, self-contained, unblocks nothing else but is low risk).
3. Broken CSV handling — backend repair pipeline + frontend repair-report surfacing. Do this before the two items below, since both should build on the repaired/normalized data path rather than the raw upload path.
4. CSV download (now exports repaired/normalized data).
5. Upload: JSON/XLSX (reuses the same detect → repair → normalize pipeline).
6. Compare Tab fuzzy match + hover preview.
7. SQL Tab UI/autocomplete polish.
