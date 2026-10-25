#!/usr/bin/env python3
"""Build Pool Cockpit 4.2.1 by changing weather presentation only."""
from __future__ import annotations
import argparse
import hashlib
from pathlib import Path
import build_unified_pool_cockpit as v420

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "frontend/v4.2.1"
DESTINATION = ROOT / "release/v4.2.1/pool-cockpit.js"

def once(text: str, original: str, replacement: str) -> str:
    if text.count(original) != 1:
        raise ValueError(f"Expected one occurrence ({text.count(original)}): {original[:90]!r}")
    return text.replace(original, replacement, 1)

def between(text: str, first: str, last: str, replacement: str) -> str:
    if text.count(first) != 1 or text.count(last) != 1:
        raise ValueError(f"Unable to find unique block delimiters: {first[:70]!r}")
    start, end = text.index(first), text.index(last)
    if end <= start:
        raise ValueError("Block delimiters are out of order")
    return text[:start] + replacement + text[end:]

def generate() -> bytes:
    text = v420.generate().decode("utf-8")
    # V4.2.1-only: raise real/demo controls and explicit fictitious-data notice
    # above the legacy mobile background, without changing the frozen V4.1 wrapper.
    text = once(text, ":host{display:block}.bar{",
                ":host{display:block}.bar,.notice{position:relative;z-index:1}.bar{")
    weather_css = (SOURCE / "weather.css").read_text(encoding="utf-8")
    renderer = (SOURCE / "render-cockpit.js").read_text(encoding="utf-8")
    handler = (SOURCE / "host.js").read_text(encoding="utf-8")
    text = once(text, "Pool Cockpit 4.2.0 — unified, single-resource distribution.",
                "Pool Cockpit 4.2.1 — weather alert corrective, single-resource distribution.")
    text = once(text, 'const VERSION="4.2.0";', 'const VERSION="4.2.1";')
    text = once(text, 'const POOL_COCKPIT_UI_VERSION="4.2.0";',
                'const POOL_COCKPIT_UI_VERSION="4.2.1";')
    text = once(text, "function rendreCockpitV4({", renderer + "\nfunction rendreCockpitV4({")
    text = once(text, "  modeSombrePrefere = false,\n} = {}) {",
                '  modeSombrePrefere = false,\n  weatherAlertBanner = "",\n} = {}) {')
    text = once(text, '    <div\n      class="pool-cockpit-v4"',
                f'    <style data-pool-cockpit-v421-weather>{weather_css}</style>\n    <div\n      class="pool-cockpit-v4"')
    text = once(text, '      '+chr(36)+'{rendreNavigationCockpitV4({',
                '      '+chr(36)+'{rendreBandeauMeteoV421(weatherAlertBanner)}\n      '+chr(36)+'{rendreNavigationCockpitV4({')
    text = once(text, "preferences:this._preferences,weatherAlertBanner,smart",
                'preferences:this._preferences,weatherAlertBanner:"",smart')
    text = once(text,
                "    const coquilleHtml=\n      rendreCockpitV4({\n        ongletActif:ongletV4,",
                "    const coquilleHtml=\n      rendreCockpitV4({\n        weatherAlertBanner,\n        ongletActif:ongletV4,")
    text = between(text,
                   '    this.shadowRoot.querySelectorAll("[data-weather-alert-focus]").forEach(control=>control.addEventListener("click",()=>{',
                   '    if(!this._v4Ui)this.bindRc271CollapseControls();',
                   handler)
    text = between(text,
                   "      // V4.1: keep the original V3 weather banner",
                   "      // V4.1 : conserver les retouches validées",
                   "      // V4.2.1: V4 renders the single banner; never move it.\n")
    # Configuration CSS observer stays in place, no weather observer.
    text = once(text, "          promoteWeatherAlert();\n", "")
    if "promoteWeatherAlert" in text:
        raise ValueError("Legacy DOM promotion still present")
    return text.encode("utf-8")

def build(destination: Path = DESTINATION) -> tuple[Path, str]:
    data = generate()
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_bytes(data)
    return destination, hashlib.sha256(data).hexdigest()

if __name__ == "__main__":
    cli = argparse.ArgumentParser()
    cli.add_argument("--output", type=Path, default=DESTINATION)
    args = cli.parse_args()
    file, digest = build(args.output)
    print(f"Built {file} ({file.stat().st_size} bytes), SHA256 {digest}")
