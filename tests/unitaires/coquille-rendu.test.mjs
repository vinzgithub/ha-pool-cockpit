import test from "node:test";
import assert from "node:assert/strict";
import { rendreCoquillePrincipaleDashboard } from "../../src/interface/coquille-rendu.js";

const echapperHtml=(value)=>String(value??"")
  .replaceAll("&","&amp;")
  .replaceAll("<","&lt;")
  .replaceAll(">","&gt;")
  .replaceAll('"',"&quot;")
  .replaceAll("'","&#039;");

function modele(overrides={}){
  const sections=Object.fromEntries(["charts","summary","score","health","information"].map(cle=>[cle,{classe:`classe-${cle}`,attributs:`data-test-${cle}=oui`,chevron:`<i>${cle}</i>`}]));
  return {
    preferences:{compact_mobile:true,animations:true,advanced_measurements:false,temperature_unit:"C",weather_alert_entity:"auto"},
    weatherAlertBanner:"<aside>ALERTE-BANNIERE</aside>",
    smart:{level:"good",label:"Eau équilibrée",message:"Aucune action urgente."},
    ICONS:{drop:"DROP",shield:"SHIELD",device:"DEVICE",cloud:"CLOUD",flask:"FLASK",calendar:"CAL"},
    titre:"Piscine test",
    displayTemp:{value:"27,1",unit:"°C"},
    temp:{count:2,unit:"°C"},
    aggregated:{ph:{value:"7,31",number:7.31},orp:{value:"756",number:756},activeCount:2},
    libelleConfiance:"Élevée",
    confidence:95,
    enabledCount:2,
    nombreAppareils:2,
    weather:{available:true,condition:"sunny",temperature:"25",temperatureUnit:"°C",humidity:"52",wind:"12",windUnit:"km/h",uv:"4"},
    presentationMeteo:{classe:"weather-sunny",icone:"SUN",libelle:"Ensoleillé",glyphe:"☀️"},
    h:{suspended:false,score:90},
    analyseDisponible:true,
    scoreValue:90,
    scoreDisplay:90,
    sourceLabel:"Flipr + Blue Connect",
    derniereAnalyseFormatee:"6 sept. 2026, 22:00",
    fragments:{
      barreSections:"<x-barre>BARRE</x-barre>",
      programmation:"<x-programmation>PROGRAMMATION</x-programmation>",
      recommandationEauMeteo:"<x-eau-meteo>EAU-METEO</x-eau-meteo>",
      filtration:"<x-filtration>FILTRATION</x-filtration>",
      capteurs:"<x-capteurs>CAPTEURS</x-capteurs>",
      graphiqueTemperature:"<x-temp>GRAPH-T</x-temp>",
      graphiquePh:"<x-ph>GRAPH-PH</x-ph>",
      graphiqueOrp:"<x-orp>GRAPH-ORP</x-orp>",
      traitement:"<x-traitement>TRAITEMENT</x-traitement>",
    },
    sections,
    phAssessment:{tone:"good",score:100,label:"Optimal"},
    pourcentagePh:70,
    pourcentageOrp:68,
    breakdown:{temperature:20,ph:20,orp:20,stability:20,coherence:20},
    confidenceDetail:"Deux sources cohérentes.",
    weatherAlert:{levelKey:"green",active:false,available:true,configured:true,levelLabel:"Verte",alerts:[],department:"Site B",source:"Météo-France",updatedAt:""},
    weatherAlertOptions:[],
    vigilanceUrl:"https://example.invalid/vigilance",
    echapperHtml,
    conseilAlerteMeteo:()=>"Conseil météo",
    treatmentModel:{summary:"RAS",confidence:{label:"Bonne"},volume:16,feeder:{short:"Dossi-3"}},
    smartAdviceLines:["Conseil 1"],
    recent:[],
    comparisons:[],
    metaComparaison:{state:"single",activeName:"Flipr",detail:"Une seule source"},
    typeTraitement:"bromine",
    assistantExpertHtml:"<x-expert>EXPERT</x-expert>",
    ...overrides,
  };
}

test("la coquille conserve l'ordre structurel des fragments déjà rendus",()=>{
  const html=rendreCoquillePrincipaleDashboard(modele());
  const marqueurs=["ALERTE-BANNIERE","PROGRAMMATION","EAU-METEO","FILTRATION","CAPTEURS","GRAPH-T","GRAPH-PH","GRAPH-ORP","TRAITEMENT","EXPERT"];
  let precedent=-1;
  for(const marqueur of marqueurs){
    const index=html.indexOf(marqueur);
    assert.ok(index>precedent,`${marqueur} doit rester après le fragment précédent`);
    precedent=index;
  }
  assert.match(html,/Piscine test/);
  assert.match(html,/Eau équilibrée/);
  assert.match(html,/Informations utiles/);
});

test("les préférences historiques ne modifient que les classes et valeurs prévues",()=>{
  const html=rendreCoquillePrincipaleDashboard(modele({
    preferences:{compact_mobile:false,animations:false,advanced_measurements:true,temperature_unit:"F",weather_alert_entity:"auto"},
  }));
  assert.match(html,/<main class="app  pref-no-animations pref-advanced">/);
  assert.match(html,/<em>°F<\/em>/);
  assert.doesNotMatch(html,/pref-compact-mobile/);
});

test("les libellés externes de vigilance restent échappés dans la coquille",()=>{
  const html=rendreCoquillePrincipaleDashboard(modele({
    weatherAlert:{levelKey:"orange",active:true,available:true,configured:true,levelLabel:"Orange",alerts:[{key:"heatwave",icon:"🌡️",label:'Canicule <script>alert("x")</script>',levelLabel:"Orange"}],department:'85 <Site B>',source:'Météo & test',updatedAt:""},
  }));
  assert.match(html,/Canicule &lt;script&gt;alert\(&quot;x&quot;\)&lt;\/script&gt;/);
  assert.match(html,/85 &lt;Site B&gt;/);
  assert.doesNotMatch(html,/<script>alert/);
  assert.match(html,/Conseil météo/);
});

test("SEC-000 : la coquille ne lit ni Home Assistant, ni DOM, ni stockage, ni API de commande",()=>{
  const prototypeHostile={};
  for(const cle of ["hass","_hass","callService","callWS","document","window","localStorage"]){
    Object.defineProperty(prototypeHostile,cle,{get(){throw new Error(`lecture interdite: ${cle}`)}});
  }
  const entree=Object.assign(Object.create(prototypeHostile),modele());
  assert.doesNotThrow(()=>rendreCoquillePrincipaleDashboard(entree));
});

test("le hero présente proprement un Home Assistant sans données de piscine",()=>{
  const html=rendreCoquillePrincipaleDashboard(modele({
    displayTemp:{value:"—",unit:""},
    temp:{count:0,unit:"°C"},
    aggregated:{
      ph:{value:"—",number:null},
      orp:{value:"—",number:null},
      activeCount:0,
    },
    libelleConfiance:"Indisponible",
    confidence:0,
    enabledCount:0,
    nombreAppareils:1,
  }));

  assert.match(html,/Température de l'eau · Aucune mesure disponible/);
  assert.match(html,/<small>Confiance<\/small><strong>—<\/strong><em>Indisponible<\/em>/);

  assert.doesNotMatch(html,/Température moyenne de l'eau · 0 appareil/);
  assert.doesNotMatch(html,/Confiance Indisponible/);
  assert.doesNotMatch(html,/<small>Confiance<\/small><strong>0%<\/strong>/);
});
