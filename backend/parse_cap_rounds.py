"""
parse_cap_rounds.py
-------------------
Parses CAP Round 2, 3, 4 PDFs for all available years for CET-BUDDY.

Available rounds per year:
  2025-26 → Rounds 2, 3, 4
  2024-25 → Rounds 2, 3
  2023-24 → Rounds 2, 3

Key approach:
- Uses pdfplumber's find_tables() to get table bboxes, which lets us correctly
  assign each table to the right college/branch that appears above it on the page.
- Table extraction preserves empty cells (''/None), so sparse tables (where some
  category columns have no data for a given stage) are handled correctly:
  empty cells are simply skipped, non-empty cells are mapped to their column category.
- Only the first occurrence (lowest stage/earliest appearance) is kept per
  (college_code, branch, category) triple.
"""

from __future__ import annotations

import csv
import re
from collections import OrderedDict
from pathlib import Path

import pdfplumber

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
ROOT = Path(__file__).resolve().parent.parent
BACKEND_DIR = ROOT / "backend"
FRONTEND_DIR = ROOT / "frontend"

PDF_TO_OUTPUTS = {
    # 2025-26
    ROOT / "cap round 2 25-26.pdf": (
        BACKEND_DIR / "cutoff-cap-round-2-25-26.csv",
        FRONTEND_DIR / "cutoff-cap-round-2-25-26.csv",
    ),
    ROOT / "cap round 3 25-26": (
        BACKEND_DIR / "cutoff-cap-round-3-25-26.csv",
        FRONTEND_DIR / "cutoff-cap-round-3-25-26.csv",
    ),
    ROOT / "cap round 4 25-26.pdf": (
        BACKEND_DIR / "cutoff-cap-round-4-25-26.csv",
        FRONTEND_DIR / "cutoff-cap-round-4-25-26.csv",
    ),
    # 2024-25
    ROOT / "cap round 2 24-25.pdf": (
        BACKEND_DIR / "cutoff-cap-round-2-24-25.csv",
        FRONTEND_DIR / "cutoff-cap-round-2-24-25.csv",
    ),
    ROOT / "cap round 3 24-25.pdf": (
        BACKEND_DIR / "cutoff-cap-round-3-24-25.csv",
        FRONTEND_DIR / "cutoff-cap-round-3-24-25.csv",
    ),
    # 2023-24
    ROOT / "cap round 2 23-24.pdf": (
        BACKEND_DIR / "cutoff-cap-round-2-23-24.csv",
        FRONTEND_DIR / "cutoff-cap-round-2-23-24.csv",
    ),
    ROOT / "cap round 3 23-24.pdf": (
        BACKEND_DIR / "cutoff-cap-round-3-23-24.csv",
        FRONTEND_DIR / "cutoff-cap-round-3-23-24.csv",
    ),
}

# ---------------------------------------------------------------------------
# Regex patterns
# ---------------------------------------------------------------------------
COLLEGE_RE = re.compile(r"^0*(\d{4,5})\s*-\s*(.+)$")
BRANCH_RE = re.compile(r"^\d{9,10}\s*-\s*(.+)$")
PERCENTILE_RE = re.compile(r"\(([0-9.]+)\)")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def clean(s: str | None) -> str:
    """Strip and collapse whitespace."""
    if s is None:
        return ""
    return re.sub(r"\s+", " ", str(s)).strip()


def extract_rank_percentile(cell: str) -> tuple[str, str] | None:
    """
    Extract (rank, percentile) from a table cell like '39713\\n(88.2484746)'.
    Returns None if the cell has no valid numeric data.
    """
    cell = clean(cell)
    if not cell:
        return None

    # Rank: first bare integer NOT inside parentheses
    rank_match = re.search(r"(?<!\()\b(\d+)\b", cell)
    pct_match = PERCENTILE_RE.search(cell)

    rank = rank_match.group(1) if rank_match else ""
    percentile = pct_match.group(1) if pct_match else ""

    if not rank and not percentile:
        return None
    return rank, percentile


def get_branch_y_map(page) -> list[tuple[float, str, str, str]]:
    """
    Scan text lines on a page and return a list of
    (y_position, college_code, college_name, branch_name)
    for every branch heading found, in top-to-bottom order.
    """
    branch_y_map: list[tuple[float, str, str, str]] = []
    temp_code = ""
    temp_name = ""

    for line_obj in (page.extract_text_lines() or []):
        lt = clean(line_obj.get("text", ""))
        y = float(line_obj.get("top", 0))

        cm = COLLEGE_RE.match(lt)
        bm = BRANCH_RE.match(lt)

        if cm and "Degree Courses" not in lt and "Cut Off" not in lt:
            temp_code = cm.group(1)
            temp_name = cm.group(2)
        elif bm and "Stage" not in lt:
            branch_y_map.append((y, temp_code, temp_name, bm.group(1)))

    return branch_y_map


def best_branch_for_table(table_top: float,
                           branch_y_map: list[tuple[float, str, str, str]],
                           fallback: tuple[str, str, str]) -> tuple[str, str, str]:
    """Return the (code, name, branch) whose heading is closest above table_top."""
    best = None
    for (y, code, name, branch) in branch_y_map:
        if y <= table_top:
            best = (code, name, branch)
    if best:
        return best
    return fallback


# ---------------------------------------------------------------------------
# Core parser
# ---------------------------------------------------------------------------

def parse_pdf(pdf_path: Path) -> list[dict[str, str]]:
    """
    Parse the PDF and return rows as list of dicts:
    College Code, College Name, Branch, Category, Percentile, Rank
    """
    rows: OrderedDict[tuple[str, str, str], dict[str, str]] = OrderedDict()

    with pdfplumber.open(pdf_path) as pdf:
        total = len(pdf.pages)
        print(f"  {total} pages to process...", flush=True)

        # Running context for college/branch (carries across pages)
        curr_code = ""
        curr_name = ""
        curr_branch = ""

        for page_num, page in enumerate(pdf.pages):
            if page_num % 200 == 0:
                print(f"    Page {page_num}/{total}", flush=True)

            raw_text = page.extract_text() or ""

            # ------------------------------------------------------------------
            # Update running college/branch context from raw text
            # ------------------------------------------------------------------
            for raw_line in raw_text.splitlines():
                line = clean(raw_line)
                cm = COLLEGE_RE.match(line)
                bm = BRANCH_RE.match(line)

                if cm and "Degree Courses" not in line and "Cut Off" not in line:
                    curr_code = cm.group(1)
                    curr_name = cm.group(2)
                    curr_branch = ""
                elif bm and "Stage" not in line:
                    curr_branch = bm.group(1)

            # ------------------------------------------------------------------
            # Build per-page branch y-position map for accurate table→branch mapping
            # ------------------------------------------------------------------
            branch_y_map = get_branch_y_map(page)
            fallback = (curr_code, curr_name, curr_branch)

            # ------------------------------------------------------------------
            # Extract tables with bboxes via find_tables()
            # ------------------------------------------------------------------
            table_objects = page.find_tables()
            if not table_objects:
                continue

            for table_obj in table_objects:
                table_bbox = table_obj.bbox  # (x0, y0, x1, y1)
                table_top = table_bbox[1]

                # Assign this table to the correct branch
                col_code, col_name, col_branch = best_branch_for_table(
                    table_top, branch_y_map, fallback
                )

                if not col_code or not col_branch:
                    continue

                table_data = table_obj.extract()
                if not table_data or len(table_data) < 2:
                    continue

                header_row = table_data[0]
                # Categories = all header cells except column 0 (Stage column)
                categories = [clean(c) for c in header_row[1:]]

                if not any(categories):
                    continue

                # Process each data row (skip header row)
                for data_row in table_data[1:]:
                    if not data_row or len(data_row) < 2:
                        continue

                    for col_idx, category in enumerate(categories):
                        if not category:
                            continue

                        # col_idx+1 because column 0 is the Stage label
                        cell = data_row[col_idx + 1] if (col_idx + 1) < len(data_row) else None
                        cell_str = clean(cell)

                        # Empty cell → no cutoff data for this category in this stage, skip
                        if not cell_str:
                            continue

                        result = extract_rank_percentile(cell_str)
                        if result is None:
                            continue

                        rank, percentile = result

                        # Deduplicate: keep first (earliest stage) occurrence
                        key = (col_code, col_branch, category)
                        if key not in rows:
                            rows[key] = {
                                "College Code": col_code,
                                "College Name": col_name,
                                "Branch": col_branch,
                                "Category": category,
                                "Percentile": percentile,
                                "Rank": rank,
                            }

    return list(rows.values())


# ---------------------------------------------------------------------------
# CSV output
# ---------------------------------------------------------------------------

def write_csv(rows: list[dict[str, str]], output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(
            file,
            fieldnames=["College Code", "College Name", "Branch", "Category", "Percentile", "Rank"],
        )
        writer.writeheader()
        writer.writerows(rows)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    for pdf_path, outputs in PDF_TO_OUTPUTS.items():
        if not pdf_path.exists():
            print(f"WARNING: {pdf_path.name!r} not found, skipping.")
            continue

        print(f"\nParsing: {pdf_path.name}")
        rows = parse_pdf(pdf_path)
        print(f"  → {len(rows):,} rows extracted")

        for output_path in outputs:
            write_csv(rows, output_path)
            print(f"  → Written: {output_path.relative_to(ROOT.parent)}")

    print("\nDone.")


if __name__ == "__main__":
    main()
