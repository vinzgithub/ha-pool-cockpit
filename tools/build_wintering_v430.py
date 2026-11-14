#!/usr/bin/env python3
"""Reproducible V4.3 resource: frozen V4.2.1 + reviewed wintering sources."""
from pathlib import Path
import argparse
import hashlib
import re
import build_weather_v421 as v421

ROOT = Path(__file__).resolve().parents[1]
DESTINATION = ROOT / 'release/v4.3.0/pool-cockpit.js'


def generate():
    text = v421.generate().decode('utf-8')
    pure = (ROOT / 'src/hivernage/presentation.js').read_text()
    pure = re.sub(r'^export ', '', pure, flags=re.MULTILINE)
    host = (ROOT / 'frontend/v4.3.0/host.js').read_text()
    css = (ROOT / 'frontend/v4.3.0/wintering.css').read_text()
    text = v421.once(text, 'const VERSION="4.2.1";', 'const VERSION="4.3.0";')
    text = v421.once(text, 'const POOL_COCKPIT_UI_VERSION="4.2.1";', 'const POOL_COCKPIT_UI_VERSION="4.3.0";')
    text = v421.once(text, 'Pool Cockpit 4.2.1 — weather alert corrective, single-resource distribution.', 'Pool Cockpit 4.3.0 — active wintering, single-resource distribution.')
    # Applied after the historical prototype extensions, before registration.
    text = v421.once(text, 'installerRC8V4(PoolDashboardCard);', 'installerRC8V4(PoolDashboardCard);\n'+pure+'\n'+host)
    text = v421.once(text, '<style data-pool-cockpit-v421-weather>', '<style data-pool-cockpit-v430-wintering>'+css+'</style><style data-pool-cockpit-v421-weather>')
    # The old V4 distribution overrode the PAC lock; never restore that write path.
    text = v421.once(text, 'result.pac.write_enabled=result.coordination.role==="master";', 'result.pac.write_enabled=false;')
    # The fictional demo probe needs an acquisition time under the unchanged
    # v4.3 freshness rules. This only amends fakeHass, never real HA readings.
    text = v421.once(text, 'temperature:"sensor.pool_cockpit_demo_temperature",',
                    'temperature:"sensor.pool_cockpit_demo_temperature",sample:"sensor.pool_cockpit_demo_sample",')
    text = v421.once(text, 'entities:{temperature:ids.temperature,ph:ids.ph,orp:ids.orp,battery:ids.battery,bluetooth_signal:ids.signal}',
                    'entities:{temperature:ids.temperature,last_analysis:ids.sample,ph:ids.ph,orp:ids.orp,battery:ids.battery,bluetooth_signal:ids.signal}')
    text = v421.once(text, '[ids.temperature]:state(ids.temperature,27.9,"°C"),',
                    '[ids.temperature]:state(ids.temperature,27.9,"°C"),[ids.sample]:state(ids.sample,at),')
    return text.encode('utf-8')


def build(destination=DESTINATION):
    data=generate()
    destination.parent.mkdir(parents=True,exist_ok=True)
    destination.write_bytes(data)
    return destination,hashlib.sha256(data).hexdigest()


if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--output',type=Path,default=DESTINATION)
    args=parser.parse_args()
    path,digest=build(args.output)
    print(f'Built {path} ({path.stat().st_size} bytes), SHA256 {digest}')
