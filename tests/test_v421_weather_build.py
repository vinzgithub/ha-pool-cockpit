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
