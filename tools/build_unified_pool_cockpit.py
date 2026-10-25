#!/usr/bin/env python3
"""Build the stable, single-resource Pool Cockpit 4.2 candidate.

The original engine is intentionally kept byte-identical in the repository.
Legacy internal identifiers remain until separately tested migrations.
The generated artifact is the only JavaScript resource required by Lovelace.
"""
from __future__ import annotations

import argparse
import hashlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ENGINE = ROOT / "release/v4-rc8-2/pool-dashboard-v4-rc8-2.js"
WRAPPER = ROOT / "release/v4.1.0/pool-cockpit-dual-mode-card.js"
DESTINATION = ROOT / "release/v4.2.0/pool-cockpit.js"
CORE_ELEMENT = "pool-dashboard-v4-test-card"
PUBLIC_ELEMENT = "pool-cockpit-card"
DEMO_ELEMENT = "pool-cockpit-demo-card"
VERSION = "4.2.0"


def replace_once(source: str, old: str, new: str) -> str:
    if source.count(old) != 1:
        raise RuntimeError(f"Expected exactly one source marker: {old[:70]}")
    return source.replace(old, new, 1)


def generate() -> bytes:
    core = ENGINE.read_text(encoding="utf-8")
    wrapper = WRAPPER.read_text(encoding="utf-8")
    # The old engine name and its storage identifiers are compatibility contracts.
    # Renaming them without migrating existing data, CSS and tests would be unsafe.
    core = replace_once(core, 'const VERSION="3.0.1";', 'const VERSION="4.2.0";')
    core = replace_once(core,
        'const POOL_COCKPIT_UI_VERSION="4.0.0-rc.8.2";',
        'const POOL_COCKPIT_UI_VERSION="4.2.0";')
    old_catalog = 'window.customCards.push({type:"pool-dashboard-v4-test-card",name:"HA Pool Dashboard",description:"Application piscine premium",preview:true});'
    core = replace_once(core, old_catalog, "// The public card is registered by the stable wrapper below.")

    wrapper = replace_once(
        wrapper, 'const DUAL="pool-cockpit-dual-mode-card";',
        'const DUAL="pool-cockpit-card";'
    )
    wrapper = replace_once(
        wrapper, 'const STANDALONE="pool-cockpit-v4-demo-card";',
        'const STANDALONE="pool-cockpit-demo-card";'
    )

    # A single .js file, with an internal registration guard to avoid
    # redefining the existing core if a user still has an old resource active.
    output = (
        "/* Pool Cockpit 4.2.0 — unified, single-resource distribution.\n"
        " * Public card: custom:pool-cockpit-card.\n"
        " * No separate core or demo JavaScript resource is required.\n"
        " * Keep old internal runtime identifiers until compatibility migration.\n"
        " */\n"
        f'if (!customElements.get("{CORE_ELEMENT}")) {{\n'
        + core + "\n}\n"
        + wrapper + "\n"
        'window.customCards=window.customCards||[];\n'
        'if (!window.customCards.some(item=>item.type==="pool-cockpit-card")) {\n'
        '  window.customCards.push({type:"pool-cockpit-card",name:"Pool Cockpit",'
        'description:"Piscine réelle et démonstration",preview:true});\n'
        '}\n'
    )
    if output.count('const DUAL="pool-cockpit-card";') != 1:
        raise RuntimeError("Stable custom element registration is missing")
    if output.index('customElements.define("pool-dashboard-v4-test-card"') > output.index('const DUAL="pool-cockpit-card";'):
        raise RuntimeError("Core must be registered before its wrapper")
    return output.encode("utf-8")


def build(destination: Path = DESTINATION) -> tuple[Path, str]:
    data = generate()
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_bytes(data)
    return destination, hashlib.sha256(data).hexdigest()


if __name__ == "__main__":
    cli = argparse.ArgumentParser(description="Generate the Pool Cockpit single JavaScript resource")
    cli.add_argument("--version", choices=("4.2.0", "4.2.1"), default="4.2.0")
    cli.add_argument("--output", type=Path)
    args = cli.parse_args()
    if args.version == "4.2.1":
        import build_weather_v421
        p, digest = build_weather_v421.build(args.output or build_weather_v421.DESTINATION)
    else:
        p, digest = build(args.output or DESTINATION)
    print(f"Built: {p} ({p.stat().st_size} bytes); SHA256: {digest}")
