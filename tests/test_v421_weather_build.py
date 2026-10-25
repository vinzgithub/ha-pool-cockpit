from pathlib import Path
import sys, unittest, subprocess
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'tools'))
import build_weather_v421 as b
class WeatherV421(unittest.TestCase):
 def test_build_matches(self):
  self.assertEqual(b.generate(),(ROOT/'release/v4.2.1/pool-cockpit.js').read_bytes())
 def test_single_alert(self):
  s=b.generate().decode()
  self.assertEqual(s.count('const weatherAlertBanner='),1)
  self.assertEqual(s.count('rendreBandeauMeteoV421(weatherAlertBanner)'),1)
  self.assertNotIn('promoteWeatherAlert',s)
  self.assertIn('this.v4NaviguerVers("advice")',s)
 def test_syntax(self):
  subprocess.run(['node','--check',str(ROOT/'release/v4.2.1/pool-cockpit.js')],check=True)

 def test_weather_visibility_contract(self):
  css=(ROOT/'frontend/v4.2.1/weather.css').read_text()
  self.assertIn('z-index:2',css)
  self.assertIn('data-v4-legacy-view="advice"',css)
  self.assertIn('.v3-info-grid>:not(#rc26-weather-card)',css)
  self.assertIn('min-height:44px!important',css)
 def test_ci_has_no_write_permissions(self):
  wf=(ROOT/'.github/workflows/weather-v421-manifest.yml').read_text()
  self.assertIn('contents: read',wf)
  self.assertNotIn('git push',wf)
