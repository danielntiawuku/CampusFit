#!/usr/bin/env python3
"""
Port the 20 Google Stitch screen HTML files into React TSX screen components.

The screens were exported from Stitch with a Tailwind CDN config whose tokens we
reproduced 1:1 in tailwind.config.js, so the class names transfer unchanged.
This script does the mechanical JSX conversion (class -> className, style
strings -> objects, self-closing tags, comment/script stripping); interactivity
is wired by hand afterwards.
"""
import json
import re
import sys
from pathlib import Path

SRC = Path(__file__).resolve().parent.parent.parent / "_campusfit_screens"
OUT = Path(__file__).resolve().parent.parent / "src" / "screens"

# <nav class="fixed bottom-..."> is the Stitch bottom bar; we render our own
# shared BottomNav (with the Scan action) once in App.tsx instead.
NAV_RE = re.compile(r"<nav[^>]*class=\"fixed bottom-[^\"]*\"[^>]*>.*?</nav>", re.S)

SCRIPT_RE = re.compile(r"<script\b.*?</script>", re.S)
STYLE_TAG_RE = re.compile(r"<style\b.*?</style>", re.S)
COMMENT_RE = re.compile(r"<!--.*?-->", re.S)

VOID_TAGS = (
    "img|input|br|hr|source|area|base|col|embed|track|wbr|param|"
    "circle|path|rect|line|polygon|polyline|ellipse|stop|use"
)

ATTR_RENAMES = {
    "class": "className",
    "for": "htmlFor",
    "stroke-width": "strokeWidth",
    "stroke-dasharray": "strokeDasharray",
    "stroke-dashoffset": "strokeDashoffset",
    "stroke-linecap": "strokeLinecap",
    "stroke-linejoin": "strokeLinejoin",
    "stroke-opacity": "strokeOpacity",
    "fill-rule": "fillRule",
    "clip-rule": "clipRule",
    "clip-path": "clipPath",
    "tabindex": "tabIndex",
    "viewbox": "viewBox",
    "preserveaspectratio": "preserveAspectRatio",
    "maxlength": "maxLength",
    "maxlength_": "maxLength",
    "autofocus": "autoFocus",
    "readonly": "readOnly",
    "spellcheck": "spellCheck",
    "contenteditable": "contentEditable",
    "crossorigin": "crossOrigin",
    "srcset": "srcSet",
    "accept-charset": "acceptCharset",
    "http-equiv": "httpEquiv",
    "novalidate": "noValidate",
    "autocomplete": "autoComplete",
    "autocapitalize": "autoCapitalize",
    "autocomplete_": "autoComplete",
    "tabindex_": "tabIndex",
}


def css_prop_to_camel(prop: str) -> str:
    prop = prop.strip()
    if prop.startswith("--"):
        return prop  # custom properties stay verbatim
    parts = prop.split("-")
    return parts[0] + "".join(p[:1].upper() + p[1:] for p in parts[1:])


def style_object(raw: str) -> str:
    decls = [d.strip() for d in raw.split(";") if d.strip()]
    pairs = []
    for decl in decls:
        if ":" not in decl:
            continue
        prop, value = decl.split(":", 1)
        value = value.strip()
        # JSX string literal: keep inner single quotes, escape any double quotes
        value = value.replace('"', '\\"')
        pairs.append(f'{css_prop_to_camel(prop)}: "{value}"')
    if not pairs:
        return "style={{}}"
    return "style={{ " + ", ".join(pairs) + " }}"


def rename_attr(match: re.Match) -> str:
    name = match.group(1).lower()
    value = match.group(2)
    mapped = ATTR_RENAMES.get(name, name.replace("-", "_") if name.count("-") and name in ATTR_RENAMES else name)
    if mapped == name and "-" in name and name not in ("data-alt",):
        # unknown hyphenated attribute (non data-/aria-): camelCase it
        if not (name.startswith("data-") or name.startswith("aria-")):
            parts = name.split("-")
            mapped = parts[0] + "".join(p.capitalize() for p in parts[1:])
    return f"{mapped}={value}"


ATTR_TOKEN = re.compile(r"([A-Za-z_:@][\w:.-]*)(?:\s*=\s*(\"[^\"]*\"|'[^']*'|[^\s>]+))?", re.S)

# SVG filter elements that must be camel-cased for JSX.
SVG_TAGS = {
    "fegaussianblur": "feGaussianBlur",
    "femerge": "feMerge",
    "femergenode": "feMergeNode",
    "feflood": "feFlood",
    "fecomposite": "feComposite",
    "feblend": "feBlend",
    "feoffset": "feOffset",
    "fedropshadow": "feDropShadow",
    "fecolormatrix": "feColorMatrix",
}

# HTML attributes whose empty-string value means `true` in JSX.
BOOL_ATTRS = {
    "required", "disabled", "checked", "readonly", "autofocus", "multiple",
    "selected", "controls", "autoplay", "loop", "muted", "default", "open",
    "novalidate", "hidden", "async", "defer", "itemscope", "allowfullscreen",
    "playsinline",
}

# Attributes React expects as numbers.
NUMERIC_ATTRS = {"maxlength", "tabindex", "colspan", "rowspan", "start", "reversed", "rows", "cols", "size", "tabindex"}

# SVG presentation attributes with special casing.
SVG_ATTRS = {"stddeviation": "stdDeviation", "basefrequency": "baseFrequency", "pathlength": "pathLength"}


def map_attr_name(name: str) -> str:
    lower = name.lower()
    if lower in ATTR_RENAMES:
        return ATTR_RENAMES[lower]
    if lower in SVG_ATTRS:
        return SVG_ATTRS[lower]
    if name.startswith(("data-", "aria-", "--")):
        return name
    if re.fullmatch(r"on[a-z]+", name):  # onclick -> onClick, onsubmit -> onSubmit
        return "on" + name[2:].capitalize()
    if "-" in name:
        parts = lower.split("-")
        return parts[0] + "".join(p.capitalize() for p in parts[1:])
    return name


def convert_attrs(tag: str) -> str:
    """Rewrite one '<...>' chunk into valid JSX."""
    m = re.match(r"<(?P<close>/?)\s*(?P<name>[A-Za-z][\w-]*)(?P<rest>.*?)(?P<tail>/?)>$", tag, re.S)
    if not m:
        return tag
    close, name, rest, tail = m.group("close"), m.group("name"), m.group("rest"), m.group("tail")
    if close:  # closing tag: </div>
        return f"</{SVG_TAGS.get(name.lower(), name)}>"
    name = SVG_TAGS.get(name.lower(), name)

    attrs = []
    pos = 0
    for am in ATTR_TOKEN.finditer(rest):
        aname, aval = am.group(1), am.group(2)
        pos = am.end()
        inner = aval[1:-1] if aval and aval[0] in "\"'" else None
        if aname.lower() == "style" and inner is not None:
            attrs.append(style_object(inner))
            continue
        if aname == "data-alt":  # Stitch's alt text (only valid on media tags)
            if name.lower() in ("img", "source", "video", "picture", "image"):
                attrs.append(f'alt="{inner if inner is not None else ""}"')
            else:
                attrs.append(f'data-alt="{inner if inner is not None else ""}"')
            continue
        if aname.lower() in ("onclick", "onsubmit"):
            continue  # Stitch's inline JS — rewired to React handlers by hand
        mapped = map_attr_name(aname)
        lower = aname.lower()
        if aval is None:
            attrs.append(f"{mapped}={{true}}")
        elif lower in BOOL_ATTRS and (inner == "" or inner is None):
            attrs.append(f"{mapped}={{true}}")
        elif lower in NUMERIC_ATTRS and inner is not None and inner.strip().lstrip("-").isdigit():
            attrs.append(f"{mapped}={{{int(inner.strip())}}}")
        else:
            attrs.append(f"{mapped}={aval}")
    leftover = rest[pos:].strip().rstrip("/")

    self_close = bool(tail) or bool(re.search(r"/\s*$", rest))
    body = "".join(" " + a for a in attrs)
    if leftover:
        body += " " + leftover
    return f"<{name}{body}{'/' if self_close else ''}>"


def escape_text(text: str) -> str:
    if "{" in text or "}" in text:
        text = text.replace("{", "&#123;").replace("}", "&#125;")
    return text


def convert_file(path: Path) -> str:
    html = path.read_text(encoding="utf-8")
    body = re.search(r"<body[^>]*>(.*)</body>", html, re.S)
    content = body.group(1) if body else html
    content = SCRIPT_RE.sub("", content)
    content = STYLE_TAG_RE.sub("", content)
    content = COMMENT_RE.sub("", content)
    content = NAV_RE.sub("", content)

    chunks = re.split(r"(<[^>]+>)", content)
    out = []
    for chunk in chunks:
        if not chunk:
            continue
        if chunk.startswith("<"):
            out.append(convert_attrs(chunk))
        else:
            out.append(escape_text(chunk))

    jsx = "".join(out)
    # collapse the long runs of whitespace left by removed blocks
    jsx = re.sub(r"[ \t]+\n", "\n", jsx)
    jsx = re.sub(r"\n{3,}", "\n\n", jsx)

    m = re.match(r"(\d+)_(.+)\.html", path.name)
    number, name = m.group(1), m.group(2)
    comp = f"Stitch{number}_{name}"
    return (
        f"/* eslint-disable */\n"
        f"/**\n"
        f" * Screen {number} — {name.replace('_', ' ')}\n"
        f" * Ported verbatim from the Google Stitch export\n"
        f" * (_campusfit_screens/{path.name}); interactivity is wired to the app\n"
        f" * (routing, auth, gamification data) in App/routes.\n"
        f" */\n"
        f"export default function {comp}() {{\n"
        f"  return (\n"
        f"    <>\n"
        f"{jsx}\n"
        f"    </>\n"
        f"  );\n"
        f"}}\n"
    )


def main() -> int:
    if not SRC.exists():
        print(f"missing source dir: {SRC}", file=sys.stderr)
        return 1
    OUT.mkdir(parents=True, exist_ok=True)
    index = {}
    for path in sorted(SRC.glob("*.html")):
        tsx = convert_file(path)
        m = re.match(r"(\d+)_(.+)\.html", path.name)
        out_path = OUT / f"{m.group(1)}_{m.group(2)}.tsx"
        out_path.write_text(tsx, encoding="utf-8")
        index[m.group(1)] = {
            "file": out_path.name,
            "component": f"Stitch{m.group(1)}_{m.group(2)}",
            "source": path.name,
        }
        print(f"wrote {out_path.name} ({len(tsx)} bytes)")
    (OUT / "_index.json").write_text(json.dumps(index, indent=2), encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
