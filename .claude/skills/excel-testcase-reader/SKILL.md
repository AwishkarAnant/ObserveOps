---
name: excel-testcase-reader
description: Read a single-sheet Excel (.xlsx) workbook of test cases and produce a Markdown report containing the total test-case count and the details of every test case (Title, Step Action, Step Expected Result). Use this whenever the user asks to read, parse, count, list, summarize, or convert test cases from an Excel / xlsx / spreadsheet file — even if they don't explicitly say "skill" or "markdown". Also triggers on phrases like "how many test cases are in this file", "extract test cases from xlsx", or "convert test case sheet to md".
---

# Excel Test Case Reader

Reads an Excel workbook where each row is one test case and emits a Markdown report with the total count and every test case's details.

## Expected input

A `.xlsx` file with a header row and these columns (order may vary; extra columns are ignored):

- `Title`
- `Step Action`
- `Step Expected Result`

Match headers case-insensitively and tolerate extra whitespace. If a required column is missing, tell the user which ones were found and which are missing — don't guess.

## Workflow

1. If the user hasn't given a file path, ask for it. Windows paths with spaces must be quoted.
2. Run the bundled reader:
   ```bash
   python scripts/read_testcases.py "<input.xlsx>" -o "<output.md>"
   ```
   - `-o` is optional. If omitted, the script writes `<input-stem>_testcases.md` next to the input file.
   - `--sheet "<name>"` selects a specific sheet. Default is the first sheet.
3. The script prints a one-line summary (`Wrote N test cases to <path>`) on success. Relay that to the user and show the output path.
4. If openpyxl is missing, install it with `pip install openpyxl` and retry — don't rewrite the reader using another library.

## Why a script (and not inline parsing)

Excel parsing has quiet gotchas — merged cells, trailing empty rows, `None` vs empty string, headers with stray spaces. The script handles all of these in one place so behavior stays consistent across invocations. Prefer running the script over re-implementing the logic in each conversation.

## Output format

The script writes this exact structure:

```markdown
# Test Cases — <input filename>

**Total test cases:** <N>

**Source sheet:** <sheet name>

---

## 1. <Title>

- **Step Action:** <step action>
- **Step Expected Result:** <expected result>

## 2. <Title>
...
```

Empty cells render as `_(empty)_` so the reader can spot gaps in the source sheet rather than silently dropping them.

## Edge cases the script already handles

- **Trailing empty rows** — skipped, not counted.
- **Fully blank rows mid-sheet** — skipped.
- **Header-name variance** — matched case-insensitively with whitespace collapsed (`"step  action"` matches `"Step Action"`).
- **Missing cells** — rendered as `_(empty)_`.
- **Extra columns** — ignored.
- **Multiple sheets** — defaults to the first sheet; warn the user and list the other sheet names so they can rerun with `--sheet` if needed.

## After running

Give the user:
1. The output file path.
2. The total count.
3. The first 2–3 titles as a sanity check.

Keep the recap short — the full detail lives in the `.md` file.
