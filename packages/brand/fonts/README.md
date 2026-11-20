# Scilla subsets

`site.css` loads only `scilla-misery-subset.woff2`; `store.css` loads only
`scilla-store-subset.woff2`. Each declares the `Scilla` family, enables `dlig`,
and limits `unicode-range` to its font's actual cmap. Layout belongs to the apps.

The homepage font preserves all 44 original characters, including uppercase
`C` and `O` required by CSS capitalization, and adds `0`, `4` and `P` for the
404 page. Its 47-character subset is regenerated from the same Scilla source
with discretionary ligatures retained. Regenerate it only when its copy needs
additional characters.

The store inventory contains 115 characters: A–Z, a–z, digits, supported printable
ASCII punctuation, space, £ € ¥ ¢ © ® ™, en/em dashes, curly single/double quotes,
and cardinal/diagonal arrows. The full source font does not support ASCII caret
`^` (U+005E), so it is omitted. All other printable ASCII characters are included.
These characters cover the current store copy, including “you’re”.

To regenerate one selected font and its CSS from the repository root:

```sh
python3 scripts/subset-fonts.py --site store
python3 scripts/subset-fonts.py --site site
python3 scripts/subset-fonts.py --site store --source /path/to/scilla-regular-webfont.ttf
```

Install `fonttools[woff]` in your Python environment if needed. The full source
defaults to `fonts/scilla-regular-webfont.ttf`; it stays local and gitignored.
The command requires `--site`, so running it without arguments cannot overwrite
the homepage font. Edit the matching `*.characters.json` when adding characters.
Inventories contain an explicit string of Unicode characters, with no implicit
character ranges or text extraction.

Generation preserves fontTools' default GSUB feature selection plus `dlig`,
writes WOFF2, and validates the serialized result before replacing its selected
outputs. Unsupported source characters fail explicitly; output cmap coverage,
missing glyphs, and retained discretionary ligatures are checked. CSS ranges are
generated from the resulting cmap. A deliberately regenerated homepage font may
have different bytes from the preserved original even with the same inventory.
