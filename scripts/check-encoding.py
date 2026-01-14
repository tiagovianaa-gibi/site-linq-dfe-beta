#!/usr/bin/env python
"""Check for broken characters (encoding mojibake) in site files."""
from __future__ import annotations

from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
EXTS = {".html", ".js", ".css", ".json", ".md", ".txt", ".xml"}

# Codepoints that should never appear in clean content.
BAD_CODEPOINTS = {0xFFFD, 0x00AD}  # replacement char, soft hyphen

# Known mojibake sequences seen in this repo (use escapes to keep ASCII).
BAD_SEQUENCES = [
    ("utf8_mojibake", [0x00C3, range(0x0080, 0x00C0)]),
    ("utf8_mojibake", [0x00C2, range(0x0080, 0x00C0)]),
    ("cedilla_mojibake", [0x00C7, {0x003F, 0x00AD, 0x00F0, 0x00FC, 0x0153}]),
]


def iter_files(root: Path):
    for path in root.rglob("*"):
        if not path.is_file():
            continue
        if ".git" in path.parts:
            continue
        if path.suffix.lower() not in EXTS:
            continue
        yield path


def has_bad_sequence(line: str) -> bool:
    codepoints = [ord(c) for c in line]
    for _label, pattern in BAD_SEQUENCES:
        if len(pattern) != 2:
            continue
        first, second = pattern
        for i in range(len(codepoints) - 1):
            if codepoints[i] != first:
                continue
            nxt = codepoints[i + 1]
            if isinstance(second, range):
                if nxt in second:
                    return True
            elif isinstance(second, set):
                if nxt in second:
                    return True
    return False


def main() -> int:
    issues: list[str] = []

    for path in iter_files(ROOT):
        rel = path.relative_to(ROOT)
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError as exc:
            issues.append(f"{rel}:decode_error:{exc}")
            continue

        for i, line in enumerate(text.splitlines(), 1):
            if any(ord(c) in BAD_CODEPOINTS for c in line):
                issues.append(f"{rel}:{i}:bad_codepoint")
                continue
            if has_bad_sequence(line):
                issues.append(f"{rel}:{i}:mojibake_sequence")

    if issues:
        sys.stderr.write("Encoding issues found:\n")
        for item in issues:
            sys.stderr.write(f"- {item}\n")
        return 1

    print("OK: no encoding issues detected.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
