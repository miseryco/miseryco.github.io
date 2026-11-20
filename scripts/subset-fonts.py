#!/usr/bin/env python3
"""Build one explicitly selected Scilla subset and its matching font-face CSS."""

import argparse
import json
import tempfile
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont


ROOT = Path(__file__).resolve().parents[1]
FONT_DIR = ROOT / "packages/brand/fonts"
OUTPUTS = {"site": "scilla-misery-subset.woff2", "store": "scilla-store-subset.woff2"}


def unicode_ranges(codepoints):
    ranges = []
    start = end = None
    for codepoint in sorted(codepoints):
        if end is not None and codepoint == end + 1:
            end = codepoint
            continue
        if start is not None:
            ranges.append((start, end))
        start = end = codepoint
    if start is not None:
        ranges.append((start, end))
    return ", ".join(
        f"U+{start:04X}" if start == end else f"U+{start:04X}-{end:04X}"
        for start, end in ranges
    )


def font_css(filename, codepoints):
    return (
        "/* Generated from the matching font's actual Unicode cmap. */\n"
        "@font-face {\n"
        "  font-family: 'Scilla';\n"
        f"  src: url('./{filename}') format('woff2');\n"
        "  font-style: normal;\n"
        "  font-weight: 400;\n"
        "  font-display: swap;\n"
        "  font-feature-settings: 'dlig' 1;\n"
        f"  unicode-range: {unicode_ranges(codepoints)};\n"
        "}\n"
    )


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--site", required=True, choices=OUTPUTS)
    parser.add_argument("--source", type=Path, default=ROOT / "fonts/scilla-regular-webfont.ttf")
    args = parser.parse_args()
    inventory = FONT_DIR / f"{args.site}.characters.json"
    characters = json.loads(inventory.read_text(encoding="utf-8"))["characters"]
    if not isinstance(characters, str) or not characters:
        parser.error(f"{inventory}: characters must be a nonempty string")
    requested = {ord(character) for character in characters}
    if not args.source.is_file():
        parser.error(f"Source font not found: {args.source}")
    with TTFont(args.source) as font:
        source_cmap = font.getBestCmap() or {}
        unsupported = sorted(
            codepoint for codepoint in requested
            if codepoint not in source_cmap or source_cmap[codepoint] == ".notdef"
        )
        if unsupported:
            parser.error("Unsupported inventory Unicode: " + ", ".join(f"U+{c:04X} ({chr(c)!r})" for c in unsupported))

        options = subset.Options()
        # Keep fontTools' default shaping features and add discretionary ligatures.
        options.layout_features = list(dict.fromkeys([*options.layout_features, "dlig"]))
        options.flavor = "woff2"
        options.recalc_timestamp = False
        subsetter = subset.Subsetter(options=options)
        subsetter.populate(unicodes=requested)
        subsetter.subset(font)
        font.flavor = "woff2"
        filename = OUTPUTS[args.site]
        # Validate a serialized font before replacing either selected output.
        with tempfile.TemporaryDirectory() as temporary:
            candidate = Path(temporary) / filename
            font.save(candidate)
            with TTFont(candidate) as generated:
                cmap = generated.getBestCmap() or {}
                missing = requested - cmap.keys()
                if missing or any(cmap[c] == ".notdef" for c in requested):
                    raise RuntimeError(f"Generated font has missing glyphs: {sorted(missing)}")
                if set(cmap) != requested:
                    raise RuntimeError("Generated cmap does not match the character inventory")
                features = {
                    record.FeatureTag
                    for record in generated["GSUB"].table.FeatureList.FeatureRecord
                } if "GSUB" in generated else set()
                if "dlig" not in features:
                    raise RuntimeError("Generated font lost discretionary ligatures (dlig)")
                css = font_css(filename, cmap)
            (FONT_DIR / filename).write_bytes(candidate.read_bytes())
            (FONT_DIR / f"{args.site}.css").write_text(css, encoding="utf-8")
    print(f"Generated {filename}: {len(requested)} Unicode characters; dlig retained")


if __name__ == "__main__":
    main()
