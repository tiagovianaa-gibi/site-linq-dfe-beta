"""
Valida links locais nos HTML.
- Abre arquivos .html e coleta href/src relativos.
- Verifica se os alvos existem no disco (ignora absolutos e anchors).
Saída: lista de faltantes; exit 1 se houver erro.
"""

import sys
import re
from pathlib import Path
from urllib.parse import urlparse

root = Path(".")
html_files = list(root.glob("*.html")) + list(root.glob("**/*.html"))

missing = []

link_pattern = re.compile(r'href="([^"]+)"|src="([^"]+)"')

def is_local(url: str) -> bool:
    parsed = urlparse(url)
    return not parsed.scheme and not parsed.netloc and not url.startswith("#")

for html in html_files:
    content = html.read_text(encoding="utf-8", errors="ignore")
    for match in link_pattern.finditer(content):
        url = match.group(1) or match.group(2)
        if not url or not is_local(url):
            continue
        target = (html.parent / url).resolve()
        if not target.exists():
            missing.append(f"{html}: {url}")

if missing:
    print("Links quebrados encontrados:")
    for m in missing:
        print(" -", m)
    sys.exit(1)

print("OK: links locais válidos")
sys.exit(0)
