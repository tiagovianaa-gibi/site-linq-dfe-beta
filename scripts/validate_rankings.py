"""
Validação de rankings das temporadas.
- Confere tipos numéricos (pos, total, etapas[])
- Campos obrigatórios (pos, quadrilha, total)
- Etapas devem ser lista de números ou null
Saída: status no stdout e exit code 1 em caso de erro.
"""

import json
import sys
from pathlib import Path


def main() -> int:
    path = Path("data/historico_circuito.json")
    data = json.loads(path.read_text(encoding="utf-8"))
    errors = []

    for ano, grupos in data.items():
        if not isinstance(grupos, dict):
            errors.append(f"{ano}: grupos deve ser objeto")
            continue
        for grupo, rankings in grupos.items():
            if not isinstance(rankings, list):
                errors.append(f"{ano}/{grupo}: deve ser lista")
                continue
            for idx, item in enumerate(rankings, start=1):
                ctx = f"{ano}/{grupo}[{idx}]"
                if not isinstance(item, dict):
                    errors.append(f"{ctx}: item deve ser objeto")
                    continue

                # obrigatórios
                for field in ("pos", "quadrilha", "total"):
                    if field not in item:
                        errors.append(f"{ctx}: falta campo {field}")

                # tipos numéricos
                if "pos" in item and not isinstance(item["pos"], (int, float)):
                    errors.append(f"{ctx}: pos precisa ser número")
                if "total" in item and not isinstance(item["total"], (int, float)):
                    errors.append(f"{ctx}: total precisa ser número")

                etapas = item.get("etapas", [])
                if etapas is None:
                    etapas = []
                if not isinstance(etapas, list):
                    errors.append(f"{ctx}: etapas deve ser lista")
                else:
                    for i, e in enumerate(etapas):
                        if e is not None and not isinstance(e, (int, float)):
                            errors.append(f"{ctx}: etapas[{i}] precisa ser número ou null")

    if errors:
        print("Erros de validação em data/historico_circuito.json:")
        for err in errors:
            print(f" - {err}")
        return 1

    print("OK: historico_circuito.json válido")
    return 0


if __name__ == "__main__":
    sys.exit(main())
