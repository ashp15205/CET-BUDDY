from __future__ import annotations

import csv
import re
from collections import OrderedDict
from pathlib import Path

import pdfplumber


ROOT = Path(__file__).resolve().parent.parent
BACKEND_DIR = ROOT / "backend"
FRONTEND_DIR = ROOT / "frontend"

PDF_TO_OUTPUTS = {
    BACKEND_DIR / "cap 23-24.pdf": (
        BACKEND_DIR / "cutoff 23-24.csv",
        FRONTEND_DIR / "cutoff-23-24.csv",
    ),
    BACKEND_DIR / "cap 24-25.pdf": (
        BACKEND_DIR / "cutoff 24-25.csv",
        FRONTEND_DIR / "cutoff-24-25.csv",
    ),
    BACKEND_DIR / "cap 25-26.pdf": (
        BACKEND_DIR / "cutoff 25-26.csv",
        FRONTEND_DIR / "cutoff-25-26.csv",
    ),
}

COLLEGE_RE = re.compile(r"^0*(\d{4,5})\s*-\s*(.+)$")
BRANCH_RE = re.compile(r"^\d{9,10}\s*-\s*(.+)$")
STAGE_VALUE_RE = re.compile(r"^(I|II|III|IV|V|VI|VII|VIII|IX|X)\s+(.*)$")
PERCENTILE_RE = re.compile(r"\(([^)]+)\)")


def clean_line(raw: str) -> str:
    return re.sub(r"\s+", " ", raw).strip()


def is_college_line(line: str) -> bool:
    match = COLLEGE_RE.match(line)
    return bool(match and " - " in line)


def is_branch_line(line: str) -> bool:
    match = BRANCH_RE.match(line)
    if not match:
        return False
    return " - " in line and not line.startswith("Stage ")


def is_percentile_line(line: str) -> bool:
    return line.startswith("(")


def is_break_line(line: str) -> bool:
    if not line:
        return True
    if line.startswith("Legends:"):
        return True
    if line.startswith("Maharashtra State Seats"):
        return True
    if line.startswith("Status:"):
        return True
    if line.isdigit():
        return True
    if is_college_line(line) or is_branch_line(line):
        return True
    return False


def normalize_categories(header_lines: list[str]) -> list[str]:
    tokens = " ".join(header_lines).split()
    merged: list[str] = []

    for token in tokens:
        if len(token) <= 2 and token.isalpha() and merged:
            merged[-1] += token
        else:
            merged.append(token)

    return merged


def parse_pdf(pdf_path: Path) -> list[dict[str, str]]:
    rows: "OrderedDict[tuple[str, str, str], dict[str, str]]" = OrderedDict()
    college_code = ""
    college_name = ""
    branch_name = ""

    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text() or ""
            lines = [clean_line(line) for line in text.splitlines()]

            i = 0
            while i < len(lines):
                line = lines[i]

                college_match = COLLEGE_RE.match(line)
                branch_match = BRANCH_RE.match(line)

                if college_match and "Degree Courses" not in line:
                    college_code = college_match.group(1)
                    college_name = college_match.group(2)
                    i += 1
                    continue

                if branch_match and not line.startswith("Stage "):
                    branch_name = branch_match.group(1)
                    i += 1
                    continue

                if not line.startswith("Stage "):
                    i += 1
                    continue

                header_lines = [line.removeprefix("Stage ").strip()]
                i += 1

                while i < len(lines):
                    current = lines[i]
                    if STAGE_VALUE_RE.match(current) or is_break_line(current):
                        break
                    header_lines.append(current)
                    i += 1

                categories = normalize_categories(header_lines)
                if not categories or not college_code or not branch_name:
                    continue

                while i < len(lines):
                    current = lines[i]
                    stage_match = STAGE_VALUE_RE.match(current)
                    if not stage_match:
                        break

                    rank_parts = [stage_match.group(2)]
                    i += 1

                    while i < len(lines):
                        next_line = lines[i]
                        if is_percentile_line(next_line) or STAGE_VALUE_RE.match(next_line) or is_break_line(next_line):
                            break
                        rank_parts.append(next_line)
                        i += 1

                    percentile_parts: list[str] = []
                    while i < len(lines) and is_percentile_line(lines[i]):
                        percentile_parts.append(lines[i])
                        i += 1

                    ranks = re.findall(r"\d+", " ".join(rank_parts))
                    percentiles = PERCENTILE_RE.findall(" ".join(percentile_parts))

                    pair_count = min(len(categories), len(ranks), len(percentiles))
                    for index in range(pair_count):
                        key = (college_code, branch_name, categories[index])
                        rows[key] = {
                            "College Code": college_code,
                            "College Name": college_name,
                            "Branch": branch_name,
                            "Category": categories[index],
                            "Percentile": percentiles[index].strip(),
                            "Rank": ranks[index].strip(),
                        }

                continue

    return list(rows.values())


def write_csv(rows: list[dict[str, str]], output_path: Path) -> None:
    with output_path.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(
            file,
            fieldnames=["College Code", "College Name", "Branch", "Category", "Percentile", "Rank"],
        )
        writer.writeheader()
        writer.writerows(rows)


def main() -> None:
    for pdf_path, outputs in PDF_TO_OUTPUTS.items():
        rows = parse_pdf(pdf_path)
        for output in outputs:
            write_csv(rows, output)
        print(f"{pdf_path.name}: wrote {len(rows)} rows")


if __name__ == "__main__":
    main()
