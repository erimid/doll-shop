#!/usr/bin/env python3
"""Inline src/ into a single self-contained index.html."""
from pathlib import Path
s = Path(__file__).parent / "src"
js = "\n".join((s / f).read_text() for f in ["art.js", "art2.js", "art3.js", "audio.js", "game.js", "maps.js", "meta.js", "v5.js", "render.js"])
html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Doll Shop Survivors</title>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="theme-color" content="#0c0718">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Rubik+Wet+Paint&display=swap" rel="stylesheet">
<style>
{(s / "style.css").read_text()}</style>
</head>
<body>
{(s / "body.html").read_text()}<script>
{js}</script>
</body>
</html>
"""
(Path(__file__).parent / "index.html").write_text(html)
print("index.html", len(html), "bytes")
