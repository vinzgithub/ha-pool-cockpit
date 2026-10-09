from __future__ import annotations

import hashlib
import json
import re
import subprocess
import tomllib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VERSION_DEPOT = "3.0.2"
VERSION_BUNDLE_GELE = "3.0.2"
RESOURCE = f"/local/ha-pool-dashboard/pool-dashboard.js?v={VERSION_BUNDLE_GELE}"


def _text(relative: str) -> str:
    return (ROOT / relative).read_text(encoding="utf-8")


def _excluded(path: Path) -> bool:
    relative = path.relative_to(ROOT)
    parts = relative.parts
    return (
        path == ROOT / "SHA256SUMS"
        or ".git" in parts
        or "node_modules" in parts
        or "__pycache__" in parts
        or ".pytest_cache" in parts
        or path.suffix in {".pyc", ".pyo"}
    )


def test_static_version_consistency() -> None:
    pyproject = tomllib.loads(_text("pyproject.toml"))
    manifest = json.loads(_text("home_assistant/custom_components/ha_pool_dashboard/manifest.json"))
    package = json.loads(_text("package.json"))
    init_match = re.search(r'__version__\s*=\s*"([^"]+)"', _text("ha_pool_dashboard/__init__.py"))
    bundle_match = re.search(r'const VERSION="([^"]+)";', _text("frontend/dist/pool-dashboard.js"))

    assert pyproject["project"]["version"] == VERSION_DEPOT
    assert manifest["version"] == VERSION_DEPOT
    assert package["version"] == VERSION_DEPOT
    assert init_match and init_match.group(1) == VERSION_DEPOT
    assert bundle_match and bundle_match.group(1) == VERSION_BUNDLE_GELE


def test_static_package_integrity() -> None:
    entries: dict[str, str] = {}
    for line in _text("SHA256SUMS").splitlines():
        digest, relative = line.split("  ", 1)
        entries[relative.removeprefix("./")] = digest

    files = sorted(path for path in ROOT.rglob("*") if path.is_file() and not _excluded(path))
    expected_paths = {path.relative_to(ROOT).as_posix() for path in files}
    assert set(entries) == expected_paths

    for relative, expected_digest in entries.items():
        actual_digest = hashlib.sha256((ROOT / relative).read_bytes()).hexdigest()
        assert actual_digest == expected_digest, relative


def test_static_minimal_delivery_files() -> None:
    required = {
        "README.md",
        "frontend/dist/pool-dashboard.js",
        "frontend/pool-dashboard.template.js",
        "home_assistant/custom_components/ha_pool_dashboard/manifest.json",
        "home_assistant/custom_components/ha_pool_dashboard/treatment_journal.py",
        "src/moteur/filtration.js",
        "src/moteur/saisons.js",
        "install.sh",
        "install_pool_dashboard.py",
        "uninstall_pool_dashboard.py",
        "package.json",
        "package-lock.json",
        "pyproject.toml",
        "tests/runtime_rc28_3_smoke.js",
    }
    assert required <= {
        path.relative_to(ROOT).as_posix()
        for path in ROOT.rglob("*")
        if path.is_file()
    }

def test_static_bundle_syntax(tmp_path: Path) -> None:
    # Home Assistant charge la ressource Lovelace avec res_type=module.
    # Une vérification .js CommonJS ne détecte pas les collisions de noms
    # interdites en module ES (ex. deux `function nombreOuNull`).
    module_path = tmp_path / "pool-dashboard.mjs"
    module_path.write_bytes((ROOT / "frontend/dist/pool-dashboard.js").read_bytes())
    subprocess.run(
        ["node", "--check", str(module_path)],
        check=True,
        capture_output=True,
        text=True,
    )


def test_static_forbidden_artifacts_absent(
    preexisting_forbidden_artifacts: tuple[Path, ...],
) -> None:
    assert not (ROOT / "frontend/src").exists()
    assert preexisting_forbidden_artifacts == ()

    runtime_files = sorted(path.name for path in (ROOT / "tests").glob("runtime*.js"))
    assert runtime_files == ["runtime_rc28_3_smoke.js"]


def test_static_generated_bundle_matches_sources() -> None:
    result = subprocess.run(
        ["node", str(ROOT / "outils/construire-bundle.mjs"), "--verifier"],
        capture_output=True,
        text=True,
    )
    assert result.returncode == 0, result.stdout + result.stderr


def test_static_pac_fix8_backend_schema() -> None:
    const = _text("home_assistant/custom_components/ha_pool_dashboard/const.py")
    scheduler = _text("home_assistant/custom_components/ha_pool_dashboard/scheduler.py")
    assert '"control_mode_entity": ""' in const
    assert '"compressor_fault_code_entity": ""' in const
    assert '"daily_energy_entity": ""' in const
    assert '"monthly_energy_entity": ""' in const
    assert 'pac["write_enabled"] = False' in scheduler
    assert 'pac.pop("compressor_entity", None)' in scheduler
    assert '"requires_pump": True' in const
    assert 'for target in ("pump", "light", "pac")' in scheduler
