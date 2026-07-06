#!/usr/bin/env python3
"""Convert Vilarchán Excel export to community seed JSON."""

from __future__ import annotations

import json
import re
import sys
import zipfile
import xml.etree.ElementTree as ET
from datetime import date, datetime, timedelta
from pathlib import Path

ZONE_RE = re.compile(r"^Z[123]$", re.IGNORECASE)
ZONE_MAP = {"Z1": "Zona 1", "Z2": "Zona 2", "Z3": "Zona 3"}


def read_xlsx_rows(path: Path) -> list[list[str | None]]:
    with zipfile.ZipFile(path) as z:
        shared: list[str] = []
        root = ET.fromstring(z.read("xl/sharedStrings.xml"))
        ns = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
        for si in root.findall(".//m:si", ns):
            shared.append("".join((t.text or "") for t in si.findall(".//m:t", ns)))

        rels = ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
        relmap = {r.attrib["Id"]: r.attrib["Target"] for r in rels}
        wb = ET.fromstring(z.read("xl/workbook.xml"))
        rid = wb.find(".//m:sheet", ns).attrib[
            "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"
        ]
        sheet = ET.fromstring(z.read("xl/" + relmap[rid].lstrip("/")))

        def cell_value(c: ET.Element) -> str | None:
            cell_type = c.attrib.get("t")
            value = c.find("{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v")
            if value is None or value.text is None:
                return None
            if cell_type == "s":
                return shared[int(value.text)]
            return value.text

        rows: list[list[str | None]] = []
        for row in sheet.findall(".//m:sheetData/m:row", ns):
            rows.append([cell_value(c) for c in row.findall("m:c", ns)])
        return rows


def parse_excel_row(row: list[str | None]) -> dict | None:
    if len(row) < 4 or not row[1]:
        return None

    estado = (row[0] or "").strip().upper()
    num_contador = str(row[1]).strip()
    titular = (row[2] or "").strip()
    num_vivienda = str(row[3]).strip() if row[3] is not None else ""

    alias = ""
    zona = ""
    orden = None
    ultima_lec = None
    fecha = None

    if len(row) > 4 and row[4] is not None:
        col4 = str(row[4]).strip()
        if col4 and not ZONE_RE.match(col4):
            alias = col4
            if len(row) > 5 and row[5] is not None:
                zona = str(row[5]).strip().upper()
            if len(row) > 6:
                orden = row[6]
            if len(row) > 7:
                ultima_lec = row[7]
            if len(row) > 8:
                fecha = row[8]
        elif col4 and ZONE_RE.match(col4):
            # Alias empty: zone shifts into column 4
            zona = col4.upper()
            if len(row) > 5:
                orden = row[5]
            if len(row) > 6:
                ultima_lec = row[6]
            if len(row) > 7:
                fecha = row[7]

    is_active = estado == "ACTIVO"
    zone_name = "Inactivos" if not is_active else ZONE_MAP.get(zona, "Zona 1")

    return {
        "estado": estado,
        "num_contador": num_contador,
        "titular": titular,
        "num_vivienda": num_vivienda,
        "alias": alias,
        "zona": zona,
        "zone_name": zone_name,
        "orden": orden,
        "ultima_lec": ultima_lec,
        "fecha": fecha,
        "is_active": is_active,
    }


def excel_serial_to_iso(value: str | float | None) -> str | None:
    if value is None:
        return None
    try:
        serial = float(value)
    except (TypeError, ValueError):
        return None
    if serial <= 0:
        return None
    base = date(1899, 12, 30)
    parsed = base + timedelta(days=int(serial))
    return datetime(parsed.year, parsed.month, parsed.day, 10, 0, 0).isoformat()


def to_float(value: str | float | None) -> float | None:
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def build_json(rows: list[list[str | None]], existing_meta: dict) -> dict:
    parsed_rows = []
    for row in rows[1:]:
        parsed = parse_excel_row(row)
        if parsed:
            parsed_rows.append(parsed)

    account_by_titular: dict[str, str] = {}
    water_accounts = []
    water_points = []
    water_meters = []

    for idx, row in enumerate(parsed_rows, start=1):
        titular = row["titular"]
        if titular not in account_by_titular:
            account_id = f"WA{len(water_accounts) + 1:03d}"
            account_by_titular[titular] = account_id
            water_accounts.append(
                {
                    "tempId": account_id,
                    "name": titular,
                    "nationalId": "",
                    "notes": "",
                }
            )

        point_id = f"WP{idx:03d}"
        house_name = row["alias"] if row["alias"] else row["num_vivienda"]

        water_points.append(
            {
                "tempId": point_id,
                "name": house_name,
                "location": row["num_vivienda"],
                "connectionNumber": row["num_contador"],
                "zone": row["zone_name"],
                "cadastralReference": "",
                "fixedPopulation": 0,
                "floatingPopulation": 0,
                "notes": "",
            }
        )

        readings = []
        reading_value = to_float(row["ultima_lec"])
        reading_date = excel_serial_to_iso(row["fecha"])
        if row["is_active"] and reading_value is not None and reading_date:
            readings.append(
                {
                    "reading": round(reading_value, 3),
                    "readingDate": reading_date,
                    "notes": "Lectura inicial importada",
                }
            )

        water_meters.append(
            {
                "name": "Contador",
                "waterAccountId": account_by_titular[titular],
                "waterPointId": point_id,
                "measurementUnit": "M3",
                "isActive": row["is_active"],
                "readings": readings,
            }
        )

    return {
        "community": existing_meta["community"],
        "deposits": existing_meta["deposits"],
        "zones": existing_meta["zones"],
        "users": existing_meta["users"],
        "waterAccounts": water_accounts,
        "waterPoints": water_points,
        "waterMeters": water_meters,
    }


def main() -> None:
    base = Path(__file__).resolve().parents[1] / "info-files"
    xlsx_path = base / "vilarchan 06072026.xlsx"
    json_path = base / "vilarchan.json"

    if not xlsx_path.exists():
        print(f"Excel not found: {xlsx_path}", file=sys.stderr)
        sys.exit(1)

    existing_meta = {
        "community": {
            "name": "Vilarchán",
            "waterLimitRule": {"type": "HOUSEHOLD_BASED", "value": 600},
        },
        "deposits": [
            {
                "name": "Depósito Vilarchán",
                "location": "Vilarchán",
                "notes": "Depósito único de abastecimiento",
            }
        ],
        "zones": [
            {"name": "Zona 1", "notes": "Zona de lecturas 1 (Z1)"},
            {"name": "Zona 2", "notes": "Zona de lecturas 2 (Z2)"},
            {"name": "Zona 3", "notes": "Zona de lecturas 3 (Z3)"},
            {"name": "Inactivos", "notes": "Contadores dados de baja"},
        ],
        "users": [
            {
                "email": "santiargibay@gmail.com",
                "name": "Santiago Argibay",
                "password": "vilarchan123",
                "roles": ["COMMUNITY_ADMIN"],
            }
        ],
    }

    rows = read_xlsx_rows(xlsx_path)
    data = build_json(rows, existing_meta)

    json_path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(f"Wrote {json_path}")
    print(f"  accounts: {len(data['waterAccounts'])}")
    print(f"  points:   {len(data['waterPoints'])}")
    print(f"  meters:   {len(data['waterMeters'])}")
    print(f"  readings: {sum(len(m['readings']) for m in data['waterMeters'])}")


if __name__ == "__main__":
    main()
