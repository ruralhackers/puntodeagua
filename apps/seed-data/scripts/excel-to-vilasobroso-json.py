#!/usr/bin/env python3
"""Convert Vilasobroso Excel export to community seed JSON (+ import CSV)."""

from __future__ import annotations

import csv
import json
import sys
from pathlib import Path

try:
    import openpyxl
except ImportError:
    print("Need openpyxl: pip install openpyxl", file=sys.stderr)
    sys.exit(1)

RESIDENTIAL_TYPES = {"C", "F", ""}
COMMUNITY_NAME = "Comunidad de Aguas Vilasobroso, Mondariz"
ADMIN_EMAIL = "augasvilasobroso@gmail.com"
FIXED_POPULATION = 3
WATER_LIMIT_L_PER_PERSON = 180


def clean(value) -> str:
    if value is None:
        return ""
    return str(value).strip()


def is_valid_contador(value) -> bool:
    if value is None:
        return False
    if isinstance(value, (int, float)):
        return True
    text = str(value).strip()
    return text.isdigit()


def contador_str(value) -> str:
    if isinstance(value, float) and value.is_integer():
        return str(int(value))
    if isinstance(value, int):
        return str(value)
    return str(value).strip()


def zone_name(zona) -> str:
    if zona is None or zona == "":
        return "Zona 1"
    try:
        n = int(zona)
    except (TypeError, ValueError):
        return "Zona 1"
    return f"Zona {n}"


def parse_rows(xlsx_path: Path) -> list[dict]:
    wb = openpyxl.load_workbook(xlsx_path, data_only=True)
    ws = wb["Hoja1"]
    parsed: list[dict] = []

    for row in ws.iter_rows(min_row=3, values_only=True):
        zona = row[1]
        calle = row[2]
        contador = row[3]
        titular = clean(row[4])
        direccion = clean(row[5])
        tipo = clean(row[6]).upper() if clean(row[6]) else ""
        pago = clean(row[7])
        nota_pago = clean(row[8])
        telefono = clean(row[10])
        catastro = clean(row[11])

        if not titular:
            continue
        if not is_valid_contador(contador):
            continue

        notes_parts = []
        if pago:
            notes_parts.append(f"Pago: {pago}")
        if nota_pago:
            notes_parts.append(nota_pago)
        if tipo and tipo not in RESIDENTIAL_TYPES:
            notes_parts.append(f"Tipo: {tipo}")

        is_residential = tipo in RESIDENTIAL_TYPES
        parsed.append(
            {
                "zona": zone_name(zona),
                "calle": calle,
                "contador": contador_str(contador),
                "titular": titular,
                "direccion": direccion,
                "tipo": tipo or "C",
                "telefono": telefono,
                "cadastralReference": catastro,
                "notes": " | ".join(notes_parts),
                # Casas/fincas: 3 personas. Grifos/otros: 1 para mínimo de uso.
                "fixedPopulation": FIXED_POPULATION if is_residential else 1,
                "floatingPopulation": 0,
                "isActive": True,
            }
        )

    return parsed


def build_json(rows: list[dict]) -> dict:
    zones_present = sorted({r["zona"] for r in rows}, key=lambda z: int(z.split()[-1]))
    account_by_titular: dict[str, str] = {}
    phone_by_titular: dict[str, str] = {}
    water_accounts: list[dict] = []
    water_points: list[dict] = []
    water_meters: list[dict] = []

    for idx, row in enumerate(rows, start=1):
        titular = row["titular"]
        telefono = row.get("telefono") or ""
        if titular not in account_by_titular:
            account_id = f"WA{len(water_accounts) + 1:03d}"
            account_by_titular[titular] = account_id
            phone_by_titular[titular] = telefono
            water_accounts.append(
                {
                    "tempId": account_id,
                    "name": titular,
                    "nationalId": "",
                    "phone": telefono,
                    "notes": "",
                }
            )
        elif telefono and not phone_by_titular.get(titular):
            phone_by_titular[titular] = telefono
            account_id = account_by_titular[titular]
            for account in water_accounts:
                if account["tempId"] == account_id:
                    account["phone"] = telefono
                    break

        point_id = f"WP{idx:03d}"
        point_name = row["direccion"] or f"Contador {row['contador']}"
        water_points.append(
            {
                "tempId": point_id,
                "name": point_name,
                "location": row["direccion"] or point_name,
                "connectionNumber": row["contador"],
                "zone": row["zona"],
                "cadastralReference": row["cadastralReference"],
                "fixedPopulation": row["fixedPopulation"],
                "floatingPopulation": row["floatingPopulation"],
                "notes": row["notes"],
            }
        )
        water_meters.append(
            {
                "name": "Contador",
                "waterAccountId": account_by_titular[titular],
                "waterPointId": point_id,
                "measurementUnit": "M3",
                "isActive": row["isActive"],
                "readings": [],
            }
        )

    return {
        "community": {
            "name": COMMUNITY_NAME,
            "waterLimitRule": {
                "type": "PERSON_BASED",
                "value": WATER_LIMIT_L_PER_PERSON,
            },
        },
        "deposits": [
            {
                "name": "Depósito Vilasobroso",
                "location": "Vilasobroso, Mondariz",
                "notes": "Depósito de abastecimiento de la comunidad",
            }
        ],
        "zones": [{"name": z, "notes": f"Zona de lecturas {z.split()[-1]}"} for z in zones_present],
        "users": [
            {
                "email": ADMIN_EMAIL,
                "name": "Admin Aguas Vilasobroso",
                "password": "vilasobroso123",
                "roles": ["COMMUNITY_ADMIN"],
            }
        ],
        "waterAccounts": water_accounts,
        "waterPoints": water_points,
        "waterMeters": water_meters,
    }


def write_import_csv(rows: list[dict], csv_path: Path) -> None:
    """CSV in the exemplo-importacion-contadores format (for reference / UI import)."""
    fieldnames = [
        "Numero_contador",
        "Nome",
        "Apelidos",
        "DNI",
        "Telefono",
        "Enderezo_ou_localizacion",
        "Zona",
        "Referencia_catastral",
        "Residentes_fixos",
        "Residentes_flotantes",
        "Data_ultima_lectura",
        "Ultima_lectura",
        "Estado",
    ]
    with csv_path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for row in rows:
            # Titular comes as "APELLIDOS, NOMBRE" in the Excel
            titular = row["titular"]
            if "," in titular:
                apelidos, nome = [p.strip() for p in titular.split(",", 1)]
            else:
                apelidos, nome = titular, ""
            writer.writerow(
                {
                    "Numero_contador": row["contador"],
                    "Nome": nome,
                    "Apelidos": apelidos,
                    "DNI": "",
                    "Telefono": row.get("telefono") or "",
                    "Enderezo_ou_localizacion": row["direccion"],
                    "Zona": row["zona"],
                    "Referencia_catastral": row["cadastralReference"],
                    "Residentes_fixos": row["fixedPopulation"],
                    "Residentes_flotantes": row["floatingPopulation"],
                    "Data_ultima_lectura": "",
                    "Ultima_lectura": "",
                    "Estado": "ACTIVO",
                }
            )


def main() -> None:
    base = Path(__file__).resolve().parents[1] / "info-files"
    xlsx_path = base / "vilasobroso.xlsx"
    json_path = base / "vilasobroso.json"
    csv_path = base / "vilasobroso.csv"

    if not xlsx_path.exists():
        print(f"Excel not found: {xlsx_path}", file=sys.stderr)
        sys.exit(1)

    rows = parse_rows(xlsx_path)
    data = build_json(rows)

    json_path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    write_import_csv(rows, csv_path)

    residential = sum(1 for r in rows if r["fixedPopulation"] == FIXED_POPULATION)
    minimal = sum(1 for r in rows if r["fixedPopulation"] == 1)
    print(f"Wrote {json_path}")
    print(f"Wrote {csv_path}")
    print(f"  accounts:     {len(data['waterAccounts'])}")
    print(f"  points:       {len(data['waterPoints'])}")
    print(f"  meters:       {len(data['waterMeters'])}")
    print(f"  residential:  {residential} (fixedPopulation={FIXED_POPULATION})")
    print(f"  grifos/otros: {minimal} (fixedPopulation=1)")
    print(f"  zones:        {', '.join(z['name'] for z in data['zones'])}")
    print(f"  limit:        PERSON_BASED {WATER_LIMIT_L_PER_PERSON} L/persona")
    print(f"  admin:        {ADMIN_EMAIL}")


if __name__ == "__main__":
    main()
