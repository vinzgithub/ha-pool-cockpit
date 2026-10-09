/*
 * SPDX-FileCopyrightText: 2026 Vincent Fournet
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */

const VERSION="3.0.1";



/*__HA_POOL_GENERATED_EAU_METEO__*/

const THEMES=THEMES_TABLEAU_PISCINE;

function resolveTheme(name){
  return resoudreThemeInterface(
    name,
    Boolean(window.matchMedia?.("(prefers-color-scheme: dark)").matches),
  );
}

const ICONS={
  drop:'<svg viewBox="0 0 24 24"><path d="M12 2.4S5.2 9.4 5.2 14.1a6.8 6.8 0 0 0 13.6 0C18.8 9.4 12 2.4 12 2.4Z"/></svg>',
  battery:'<svg viewBox="0 0 24 24"><path d="M17 7V5H4v14h13v-2h2V7h-2Zm-2 10H6V7h9v10Zm4-7h2v4h-2v-4Z"/></svg>',
  bluetooth:'<svg viewBox="0 0 24 24"><path d="m12 2 6 5-4.4 5 4.4 5-6 5v-7.5L7.6 19 6 17.4l5.4-5.4L6 6.6 7.6 5 12 9.5V2Z"/></svg>',
  flask:'<svg viewBox="0 0 24 24"><path d="M9 2h6v2h-1v5l5.3 8.5A3 3 0 0 1 16.8 22H7.2a3 3 0 0 1-2.5-4.5L10 9V4H9V2Z"/></svg>',
  play:'<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7Z"/></svg>',
  check:'<svg viewBox="0 0 24 24"><path d="m9.2 16.2-4.1-4.1L3.7 13.5l5.5 5.5L20.5 7.7l-1.4-1.4Z"/></svg>',
  alert:'<svg viewBox="0 0 24 24"><path d="M12 3 1.7 21h20.6L12 3Zm-1 7h2v5h-2Zm0 6.5h2v2h-2Z"/></svg>',
  shield:'<svg viewBox="0 0 24 24"><path d="M12 2 4.5 5v5.8c0 4.8 3.1 9.2 7.5 11.2 4.4-2 7.5-6.4 7.5-11.2V5L12 2Zm0 2.2 5.3 2.1v4.5c0 3.7-2.2 7.2-5.3 8.9-3.1-1.7-5.3-5.2-5.3-8.9V6.3L12 4.2Z"/></svg>',
  device:'<svg viewBox="0 0 24 24"><path d="M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm0 2v14h12V5H6Zm3 2h6v2H9V7Zm0 4h6v5H9v-5Z"/></svg>',
  rain:'<svg viewBox="0 0 24 24"><path d="M7 17h10a4 4 0 0 0 .6-8A6 6 0 0 0 6.2 8.2 4.5 4.5 0 0 0 7 17Zm1.2 1.2 1.5.8-1.4 2.6-1.5-.8 1.4-2.6Zm4 0 1.5.8-1.4 2.6-1.5-.8 1.4-2.6Zm4 0 1.5.8-1.4 2.6-1.5-.8 1.4-2.6Z"/></svg>',
  sun:'<svg viewBox="0 0 24 24"><path d="M12 6.5A5.5 5.5 0 1 1 12 17.5 5.5 5.5 0 0 1 12 6.5Zm0-5h1v3h-2v-3h1Zm0 18h1v3h-2v-3h1ZM1.5 11h3v2h-3v-2Zm18 0h3v2h-3v-2ZM4.2 3.5l2.1 2.1-1.4 1.4-2.1-2.1 1.4-1.4Zm14.9 14.9 2.1 2.1-1.4 1.4-2.1-2.1 1.4-1.4ZM19.8 3.5l1.4 1.4L19.1 7l-1.4-1.4 2.1-2.1ZM4.9 17l1.4 1.4-2.1 2.1-1.4-1.4L4.9 17Z"/></svg>',
  moon:'<svg viewBox="0 0 24 24"><path d="M20.7 15.1A8.8 8.8 0 0 1 8.9 3.3 9.2 9.2 0 1 0 20.7 15.1ZM17.8 3.2l.65 1.45 1.45.65-1.45.65-.65 1.45-.65-1.45-1.45-.65 1.45-.65.65-1.45Zm-4.1 2.5.45 1 .99.45-.99.45-.45 1-.45-1-.99-.45.99-.45.45-1Z"/></svg>',
  partlycloudy:'<svg viewBox="0 0 24 24"><path d="M8.2 3.1A5.3 5.3 0 0 1 14.8 8a5.8 5.8 0 0 1 1.6-.2 5 5 0 0 1 .7 10H7.2a4.2 4.2 0 0 1-.8-8.3A5.3 5.3 0 0 1 8.2 3.1Zm.9 2a3.3 3.3 0 0 0-1.2 4.4 4.3 4.3 0 0 1 3.5 2.1 5.8 5.8 0 0 1 1.5-2.5A3.3 3.3 0 0 0 9.1 5.1Z"/></svg>',
  cloud:'<svg viewBox="0 0 24 24"><path d="M7 18h10a5 5 0 0 0 .4-10A6.5 6.5 0 0 0 5.2 8.5 4.8 4.8 0 0 0 7 18Z"/></svg>',
  lightning:'<svg viewBox="0 0 24 24"><path d="M7 16h9.2l-3.4 6 1-5H9.5l2.1-4H7a4.5 4.5 0 0 1-.8-8.9A6 6 0 0 1 17.5 7a4.5 4.5 0 0 1-.5 9h-2l2.5-5h-4.4l1.4-4-6 9H7Z"/></svg>',
  snow:'<svg viewBox="0 0 24 24"><path d="M11 2h2v4.3l3-1.7 1 1.7-3 1.7 3 1.7-1 1.7-3-1.7V13l3-1.7 1 1.7-3 1.7 3 1.7-1 1.7-3-1.7V22h-2v-5.6l-3 1.7-1-1.7 3-1.7-3-1.7 1-1.7 3 1.7V9.7l-3 1.7-1-1.7 3-1.7-3-1.7 1-1.7 3 1.7V2Z"/></svg>',
  fog:'<svg viewBox="0 0 24 24"><path d="M4 6h16v2H4V6Zm-2 4h16v2H2v-2Zm4 4h16v2H6v-2Zm-2 4h16v2H4v-2Z"/></svg>',
  wind:'<svg viewBox="0 0 24 24"><path d="M3 7h11a3 3 0 1 0-3-3h2a1 1 0 1 1 1 1H3v2Zm0 5h16a3 3 0 1 1-3 3h2a1 1 0 1 0 1-1H3v-2Zm0 5h8a3 3 0 1 1-3 3h2a1 1 0 1 0 1-1H3v-2Z"/></svg>',
  calendar:'<svg viewBox="0 0 24 24"><path d="M7 2h2v2h6V2h2v2h3v18H4V4h3V2Zm11 8H6v10h12V10ZM6 6v2h12V6H6Z"/></svg>'
};


function readEntity(card,id){
  const obj=id&&card._hass?card._hass.states[id]:null;
  const state=obj?.state;
  const unavailable=!obj||["unknown","unavailable","none",""].includes(String(state??"").toLowerCase());
  return{
    value:unavailable?"—":state,
    number:unavailable?null:Number.parseFloat(state),
    unit:unavailable?"":(obj.attributes.unit_of_measurement||""),
    available:!unavailable,
    obj
  };
}

function formatDate(card,value){
  if(!value||value==="—")return"Aucune donnée";
  const date=new Date(value);
  if(Number.isNaN(date.getTime()))return value;
  return new Intl.DateTimeFormat(card._hass?.locale?.language||"fr-FR",{dateStyle:"medium",timeStyle:"short"}).format(date);
}

function weatherLabel(condition){
  const map={
    "clear-night":"Nuit claire","cloudy":"Nuageux","fog":"Brouillard",
    "hail":"Grêle","lightning":"Orage","lightning-rainy":"Orage et pluie",
    "partlycloudy":"Partiellement nuageux","pouring":"Fortes pluies",
    "rainy":"Pluvieux","snowy":"Neige","snowy-rainy":"Pluie et neige",
    "sunny":"Ensoleillé","windy":"Venteux","windy-variant":"Venteux et nuageux"
  };
  return map[condition]||String(condition||"Conditions inconnues");
}

function weatherGlyph(condition){
  if(condition==="sunny")return"☀️";
  if(condition==="clear-night")return"🌙";
  if(condition==="partlycloudy")return"🌤️";
  if(condition==="cloudy")return"☁️";
  if(["rainy","pouring"].includes(condition))return"🌧️";
  if(condition==="lightning-rainy")return"⛈️";
  if(condition==="lightning")return"⚡";
  if(condition==="snowy")return"❄️";
  if(condition==="snowy-rainy")return"🌨️";
  if(condition==="hail")return"🌨️";
  if(condition==="fog")return"🌫️";
  if(["windy","windy-variant"].includes(condition))return"💨";
  return"⛅";
}

function weatherIcon(condition){
  if(condition==="sunny")return ICONS.sun;
  if(condition==="clear-night")return ICONS.moon;
  if(condition==="partlycloudy")return ICONS.partlycloudy;
  if(condition==="cloudy")return ICONS.cloud;
  if(["rainy","pouring"].includes(condition))return ICONS.rain;
  if(["lightning","lightning-rainy"].includes(condition))return ICONS.lightning;
  if(["snowy","snowy-rainy","hail"].includes(condition))return ICONS.snow;
  if(condition==="fog")return ICONS.fog;
  if(["windy","windy-variant"].includes(condition))return ICONS.wind;
  return ICONS.partlycloudy;
}

function weatherClass(condition){
  if(condition==="clear-night")return"weather-night";
  if(condition==="sunny")return"weather-sunny";
  if(["rainy","pouring"].includes(condition))return"weather-rainy";
  if(["lightning","lightning-rainy"].includes(condition))return"weather-storm";
  if(["cloudy","partlycloudy"].includes(condition))return"weather-cloudy";
  return"weather-neutral";
}

const RC26_ALERT_LEVELS={0:{key:"green",label:"Verte"},1:{key:"yellow",label:"Jaune"},2:{key:"orange",label:"Orange"},3:{key:"red",label:"Rouge"}};
const RC26_ALERT_TYPES=[
  {key:"heatwave",label:"Canicule",icon:"🌡️",aliases:["canicule","heatwave"]},
  {key:"thunderstorm",label:"Orages",icon:"⛈️",aliases:["orage","thunderstorm"]},
  {key:"wind",label:"Vent violent",icon:"💨",aliases:["vent violent","violent wind","wind"]},
  {key:"rain_flood",label:"Pluie-inondation",icon:"🌧️",aliases:["pluie inondation","pluie-inondation","rain flood","rain_flood"]},
  {key:"flood",label:"Crues",icon:"🌊",aliases:["crue","flood"]},
  {key:"snow_ice",label:"Neige-verglas",icon:"❄️",aliases:["neige verglas","neige-verglas","snow ice","snow_ice"]},
  {key:"cold",label:"Grand froid",icon:"🥶",aliases:["grand froid","cold"]},
  {key:"avalanche",label:"Avalanches",icon:"🏔️",aliases:["avalanche"]},
  {key:"coastal",label:"Vagues-submersion",icon:"🌊",aliases:["vagues submersion","vagues-submersion","coastal"]}
];
function rc26Normalize(value){
  return String(value??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[_-]+/g," ").replace(/\s+/g," ").trim();
}
function rc26AlertSeverity(value){
  if(typeof value==="number")return value>=4?3:value===3?2:value===2?1:0;
  const normalized=rc26Normalize(value);
  if(!normalized)return 0;
  if(normalized.includes("rouge")||normalized.includes("red"))return 3;
  if(normalized.includes("orange"))return 2;
  if(normalized.includes("jaune")||normalized.includes("yellow"))return 1;
  if(normalized.includes("vert")||normalized.includes("green"))return 0;
  const numeric=Number(normalized);
  return Number.isFinite(numeric)?(numeric>=4?3:numeric===3?2:numeric===2?1:0):0;
}
function rc26AlertType(attribute){
  const normalized=rc26Normalize(attribute);
  return RC26_ALERT_TYPES.find(type=>type.aliases.some(alias=>normalized.includes(alias)))||null;
}
function rc26AlertPoolAdvice(type){
  return{
    heatwave:"Surveillez chaque jour la température et le désinfectant. Le mode 24 h/24 n’est proposé qu’avec une eau chaude et un facteur aggravant.",
    thunderstorm:"Suspendez la baignade, sécurisez les équipements puis retirez les débris après l’épisode.",
    wind:"Sécurisez couverture et objets mobiles, puis contrôlez paniers et skimmers.",
    rain_flood:"Après l’épisode, contrôlez le niveau d’eau, le pH et le désinfectant.",
    flood:"Évitez toute intervention pendant le danger et contrôlez la qualité de l’eau après l’épisode.",
    snow_ice:"Protégez les équipements et limitez les déplacements autour du bassin.",
    cold:"Piscine active : surveillez le gel du circuit hydraulique et adaptez la filtration.",
    avalanche:"Aucun changement automatique de filtration ; suivez les consignes officielles.",
    coastal:"Aucun changement automatique de filtration ; éloignez-vous du littoral concerné."
  }[type]||"Consultez les consignes officielles avant toute intervention extérieure.";
}

function rc28PhAssessment(value){
  if(value===null||!Number.isFinite(Number(value)))return{score:0,tone:"neutral",label:"Indisponible",detail:"Aucune mesure de pH exploitable."};
  const ph=Number(value);
  let score,label,tone;
  if(ph>=7.2&&ph<=7.5){score=100;label="Optimal";tone="good"}
  else if(ph>=7.1&&ph<7.2){score=97+((ph-7.1)/.1)*3;label="Très bon";tone="good"}
  else if(ph>7.5&&ph<=7.6){score=100-((ph-7.5)/.1)*3;label="Très bon";tone="good"}
  else if(ph>=7.0&&ph<7.1){score=88+((ph-7.0)/.1)*9;label="À surveiller";tone="warn"}
  else if(ph>7.6&&ph<=7.7){score=97-((ph-7.6)/.1)*9;label="À surveiller";tone="warn"}
  else if(ph>=6.8&&ph<7.0){score=65+((ph-6.8)/.2)*23;label="Correction conseillée";tone="warning"}
  else if(ph>7.7&&ph<=8.0){score=87-((ph-7.7)/.3)*22;label="Correction conseillée";tone="warning"}
  else if(ph<6.8){score=Math.max(0,65-((6.8-ph)/.4)*65);label="Correction prioritaire";tone="bad"}
  else{score=Math.max(0,65-((ph-8.0)/.4)*65);label="Correction prioritaire";tone="bad"}
  score=Math.max(0,Math.min(100,score));
  const detail=label==="Optimal"?"Zone optimale 7,20 à 7,50.":label==="Très bon"?"Valeur très proche de la zone optimale, sans correction urgente.":label==="À surveiller"?"Contrôlez la tendance avant toute correction.":label==="Correction conseillée"?"Corrigez progressivement par paliers et mesurez de nouveau.":"Une correction progressive et un nouveau contrôle sont prioritaires.";
  return{score,tone,label,detail};
}

function health(ph,orp,activeCount=1){
  if(activeCount===0)return{score:0,label:"Mesures suspendues",advice:"Aucun appareil de mesure actif",details:[],suspended:true};
  let score=100;
  const details=[];
  if(ph===null){score-=20;details.push(["pH","Indisponible","warn"])}
  else{
    const assessment=rc28PhAssessment(ph);
    score-=Math.round((100-assessment.score)*.5);
    details.push(["pH",assessment.label,assessment.tone==="good"?"good":assessment.tone==="bad"?"bad":"warn"]);
  }

  if(orp===null){score-=20;details.push(["ORP","Indisponible","warn"])}
  else if(orp<550||orp>850){score-=35;details.push(["ORP","À corriger","bad"])}
  else if(orp<650||orp>800){score-=15;details.push(["ORP","À surveiller","warn"])}
  else details.push(["ORP","Optimal","good"]);

  score=Math.max(0,Math.min(100,score));
  const label=score>=90?"Baignade parfaite":score>=75?"Eau équilibrée":score>=55?"À surveiller":"Intervention conseillée";
  const advice=details.find(d=>d[2]==="bad")?.[1]||details.find(d=>d[2]==="warn")?.[1]||"Aucune action nécessaire";
  return{score,label,advice,details,suspended:false};
}

class PoolGauge extends HTMLElement{
  set data(d){this._data=d;this.render()}
  render(){
    if(!this._data)return;
    if(!this.shadowRoot)this.attachShadow({mode:"open"});
    const d=this._data,p=Math.max(0,Math.min(100,d.percent||0)),dash=251.2*p/100;
    this.setAttribute("status",d.status||"neutral");
    this.shadowRoot.innerHTML=`<style>
      :host{display:block;--g:#35a9ff}
      :host([status=good]){--g:#31c48d}:host([status=warn]){--g:#f6ad3c}:host([status=bad]){--g:#f05d6f}
      .w{position:relative;aspect-ratio:1;max-width:112px;margin:auto;filter:drop-shadow(0 8px 14px rgba(0,0,0,.08))}
      svg{width:100%;height:100%;transform:rotate(-90deg)}
      /* legacy visual baseline stroke-width:8 */circle{fill:none;stroke-width:9}.t{stroke:var(--track)}.v{stroke:var(--g);stroke-linecap:round;filter:drop-shadow(0 0 5px var(--g));stroke-dasharray:${dash} 251.2;animation:draw .8s ease-out}
      .c{position:absolute;inset:0;display:grid;place-content:center;text-align:center}
      .n{font-size:1.5rem;font-weight:800;color:var(--text)}.u{font-size:.58rem;opacity:.62;margin-left:3px}
      .l{font-size:.58rem;color:var(--muted);text-transform:uppercase;letter-spacing:.08em}
      @keyframes draw{from{stroke-dasharray:0 251.2}}

      /* =========================================================
         Beta16 — Premium UI / responsive architecture
         ========================================================= */
      :host{font-family:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
      .app{background:
        radial-gradient(circle at 12% 2%,rgba(113,211,255,.18),transparent 26%),
        radial-gradient(circle at 92% 32%,rgba(79,137,255,.09),transparent 28%),
        linear-gradient(180deg,#eaf8ff 0%,#f5fbff 55%,#eef8ff 100%);
      }

      /* 1 + 9 + 11: Hero desktop V3, capped height, dedicated layout */
      @media(min-width:761px){
        .hero{
          height:clamp(300px,24vw,338px)!important;
          min-height:300px!important;
          max-height:338px!important;
          padding:24px 30px!important;
          display:grid!important;
          grid-template-rows:auto 1fr!important;
          align-content:stretch!important;
          justify-content:initial!important;
          background-position:center 54%!important;
          transform:translateZ(0);
        }
        .hero-head{align-self:start}
        .hero-main{
          align-self:end;
          display:grid!important;
          grid-template-columns:minmax(0,1.25fr) minmax(280px,.75fr)!important;
          gap:28px!important;
          align-items:end!important;
        }
        .temperature{font-size:clamp(4.8rem,7.4vw,7rem)!important}
        .hero-weather{right:160px!important;top:22px!important}
        .health{display:grid;grid-template-columns:auto;justify-items:end;align-content:end}
        .score-ring{width:102px!important;height:102px!important}
        .health-advice{max-width:520px}
        .smart-grid{grid-template-columns:repeat(4,minmax(120px,1fr))!important;gap:9px!important;margin-top:14px!important}
        .smart-chip{min-height:68px!important;padding:11px 13px!important}
      }
      @media(min-width:1500px){
        .hero{height:330px!important;max-height:330px!important}
        .hero-main{grid-template-columns:minmax(0,1.15fr) minmax(420px,.85fr)!important}
      }

      /* Natural water layers and subtle desktop parallax illusion */
      .hero{background-attachment:local}
      .hero:after{
        background:
          radial-gradient(ellipse at 80% 12%,rgba(255,245,188,.38),transparent 15%),
          radial-gradient(ellipse at 23% 3%,rgba(255,255,255,.26),transparent 18%),
          linear-gradient(180deg,rgba(255,255,255,.08),transparent 38%),
          linear-gradient(112deg,transparent 38%,rgba(255,255,255,.12) 49%,transparent 61%)!important;
        animation:heroGlow 12s ease-in-out infinite alternate;
      }
      .wave-a{opacity:.58}.wave-b{opacity:.38}.wave-c{opacity:.24}
      .hero-bubble{opacity:.7}
      @keyframes heroGlow{from{transform:translate3d(-1%,0,0)}to{transform:translate3d(1.5%,.6%,0)}}

      /* 2: premium glass cards */
      .chart-card,.summary-card,.score-details>div,.health-meter,.info-card,.compare-card{
        position:relative;
        background:
          linear-gradient(145deg,rgba(255,255,255,.92),rgba(238,247,255,.78))!important;
        border:1px solid rgba(89,137,181,.16)!important;
        box-shadow:
          0 14px 34px rgba(42,87,127,.09),
          inset 0 1px 0 rgba(255,255,255,.92)!important;
        backdrop-filter:blur(18px) saturate(1.12);
        -webkit-backdrop-filter:blur(18px) saturate(1.12);
      }
      .chart-card:before,.summary-card:before,.score-details>div:before,.health-meter:before,.info-card:before,.compare-card:before{
        content:"";position:absolute;left:9%;right:9%;top:0;height:1px;
        background:linear-gradient(90deg,transparent,rgba(255,255,255,.95),transparent);
        pointer-events:none;
      }
      @media(hover:hover){
        .chart-card,.summary-card,.score-details>div,.health-meter,.info-card,.compare-card{
          transition:transform .22s ease,box-shadow .22s ease,border-color .22s ease;
        }
        .chart-card:hover,.summary-card:hover,.score-details>div:hover,.health-meter:hover,.compare-card:hover{
          transform:translateY(-3px);
          box-shadow:0 20px 42px rgba(42,87,127,.14),inset 0 1px rgba(255,255,255,.95)!important;
          border-color:rgba(65,153,221,.24)!important;
        }
      }

      /* 3 + 8: graph V2 */
      .chart-card{overflow:hidden}
      .chart-card:after{
        content:"";position:absolute;inset:auto 12px 12px;height:42%;
        background:linear-gradient(180deg,rgba(65,181,236,.07),rgba(72,137,235,.015));
        border-radius:20px;pointer-events:none;
      }
      .spark{position:relative;z-index:1;height:126px}
      .spark .line{
        stroke-width:3.8!important;
        filter:drop-shadow(0 5px 7px rgba(47,145,232,.26)) drop-shadow(0 0 3px rgba(74,178,255,.2))!important;
      }
      .spark .area{opacity:.92}
      .spark circle:last-of-type{
        filter:drop-shadow(0 0 7px rgba(61,162,241,.8));
        animation:endPulse 2.2s ease-in-out infinite!important;
      }

      /* 4: richer current summary */
      .summary-card{min-height:118px!important;padding:17px 18px 18px 72px!important}
      .summary-icon{width:46px!important;height:46px!important;left:16px!important;top:18px!important}
      .summary-card strong{font-size:1.48rem!important}
      .summary-meter{height:9px!important;box-shadow:inset 0 1px 3px rgba(22,57,96,.08)}
      .summary-meter b{
        position:relative;overflow:hidden;
        background:linear-gradient(90deg,#48d294,#46bcd7 56%,#469cf0)!important;
        box-shadow:0 0 10px rgba(67,175,225,.22);
      }
      .summary-meter b:after,.health-meter .bar i:after{
        content:"";position:absolute;inset:0;
        background:linear-gradient(180deg,rgba(255,255,255,.42),transparent 55%);
      }
      .summary-card.warning .summary-meter b{background:linear-gradient(90deg,#ffc85b,#f49327)!important}

      /* 5: Apple Fitness-inspired score details */
      .score-details>div{
        min-height:130px!important;
        padding:16px 15px 23px!important;
        background:
          radial-gradient(circle at 16% 18%,rgba(103,181,255,.12),transparent 27%),
          linear-gradient(145deg,rgba(255,255,255,.94),rgba(239,247,255,.82))!important;
      }
      .score-icon{
        width:46px!important;height:46px!important;border-radius:50%!important;
        background:
          radial-gradient(circle at center,rgba(255,255,255,.94) 51%,transparent 53%),
          conic-gradient(#47c98f calc(var(--ring, 75)*1%),rgba(90,130,170,.12) 0)!important;
        box-shadow:0 7px 18px rgba(54,115,170,.14),inset 0 0 0 1px rgba(255,255,255,.72);
      }
      .score-details>div:nth-child(1) .score-icon{--ring:100}
      .score-details>div:nth-child(2) .score-icon{--ring:60}
      .score-details>div:nth-child(3) .score-icon{--ring:100}
      .score-details>div:nth-child(4) .score-icon{--ring:100}
      .score-details>div:nth-child(5) .score-icon{--ring:65}
      .score-percent{position:absolute;right:15px;top:16px;font-size:.72rem;font-weight:850;color:#287dc8}
      .score-details>div>i{height:8px!important}
      .score-details>div>i:after{box-shadow:0 0 9px rgba(65,174,224,.24)}

      /* 6: iOS glossy health bars */
      .health-grid{gap:15px!important}
      .health-meter{min-height:112px!important;padding:18px 20px!important;overflow:hidden}
      .health-meter header span{font-size:1.02rem}
      .health-meter .bar{height:10px!important;overflow:visible!important;background:rgba(51,85,119,.08)!important}
      .health-meter .bar i{
        position:relative;border-radius:99px!important;
        background:linear-gradient(90deg,#49d294,#43bad7,#479ff0)!important;
        box-shadow:0 2px 8px rgba(57,163,219,.22),inset 0 1px rgba(255,255,255,.5);
      }
      .health-meter .bar i:before{
        content:"";position:absolute;right:-4px;top:50%;width:14px;height:14px;
        transform:translateY(-50%);border-radius:50%;
        background:radial-gradient(circle,#fff 0 21%,#44b9d4 24% 65%,rgba(68,185,212,.24) 68%);
        box-shadow:0 0 0 6px rgba(68,185,212,.10),0 0 15px rgba(68,185,212,.35);
      }

      /* 7: comparison V2 */
      .comparison-card{overflow:hidden}
      .mobile-compare{gap:14px!important}
      .compare-card{padding:18px!important;border-radius:22px!important}
      .compare-card h4{font-size:1rem!important;margin-bottom:14px!important}
      .compare-line{grid-template-columns:104px minmax(0,1fr) auto!important;gap:10px!important}
      .compare-line i{height:10px!important;background:rgba(35,74,115,.08)!important}
      .compare-line i b{
        position:relative;
        background:linear-gradient(90deg,#43cf91,#43b8d6 58%,#438fe9)!important;
        box-shadow:0 2px 7px rgba(54,152,213,.18);
      }
      .compare-line i b:after{
        content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,255,255,.46),transparent 54%);
      }
      .compare-status{margin-top:15px!important;align-items:center}
      .compare-badge{
        display:inline-flex;align-items:center;padding:6px 10px;border-radius:999px;
        font-size:.7rem!important;line-height:1;background:rgba(58,200,139,.12);
      }
      .compare-badge.warn{background:rgba(240,165,48,.14)}
      @media(min-width:761px){
        .compare{display:none!important}
        .mobile-compare{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))}
      }

      /* 8: immersive weather */
      .weather-card{
        overflow:hidden;
        background:
          radial-gradient(circle at 84% 16%,rgba(255,220,101,.33),transparent 19%),
          radial-gradient(ellipse at 18% 23%,rgba(255,255,255,.68),transparent 24%),
          linear-gradient(145deg,rgba(247,252,255,.94),rgba(221,241,255,.8))!important;
      }
      .weather-card:after{
        content:"";position:absolute;width:150px;height:54px;right:-25px;top:48px;
        border-radius:50%;background:rgba(255,255,255,.22);
        filter:blur(14px);animation:weatherDrift 16s ease-in-out infinite alternate;pointer-events:none;
      }
      .weather-main{position:relative;z-index:1}
      .weather-main>div:first-child{filter:drop-shadow(0 8px 13px rgba(64,110,154,.14))}
      @keyframes weatherDrift{from{transform:translateX(-8px)}to{transform:translateX(22px)}}

      /* 9: coordinated entrance animations */
      .section-title,.summary-card,.score-details>div,.health-meter,.info-card{
        animation:premiumEnter .55s cubic-bezier(.2,.8,.2,1) both;
      }
      .summary-card:nth-child(2),.score-details>div:nth-child(2),.health-meter:nth-child(2){animation-delay:.06s}
      .summary-card:nth-child(3),.score-details>div:nth-child(3),.health-meter:nth-child(3){animation-delay:.12s}
      .score-details>div:nth-child(4){animation-delay:.16s}.score-details>div:nth-child(5){animation-delay:.2s}
      @keyframes premiumEnter{from{opacity:0;transform:translateY(12px) scale(.992)}to{opacity:1;transform:none}}

      /* 10: typography and section identity */
      .section-title{
        display:flex;align-items:center;gap:8px;margin-top:32px!important;
        font-size:.83rem!important;letter-spacing:.13em!important;color:#62758a!important;
      }
      .section-title span{font-size:1rem;letter-spacing:0;filter:saturate(.8)}
      .section-title:after{
        content:"";height:2px;flex:1;margin-left:7px;border-radius:99px;
        background:linear-gradient(90deg,rgba(57,163,226,.32),transparent);
      }
      h2,h3,h4,.health-label{letter-spacing:-.018em}
      .info-card h3{font-size:1.02rem!important;letter-spacing:.055em!important}

      /* Mobile-specific tuning remains independent */
      @media(max-width:760px){
        .app{padding:8px!important;border-radius:0!important}
        .hero{
          height:auto!important;min-height:0!important;max-height:none!important;
          padding:17px!important;display:block!important;
        }
        .section-title{margin:27px 7px 13px!important}
        .section-title:after{opacity:.55}
        .summary-card{min-height:104px!important;padding-left:68px!important}
        .score-details>div{min-height:112px!important}
        .health-meter{min-height:104px!important}
        .compare-line{grid-template-columns:84px minmax(0,1fr) auto!important}
      }
      @media(max-width:390px){
        .summary-card{padding-left:64px!important}
        .score-details>div{min-height:106px!important}
        .compare-line{grid-template-columns:72px minmax(0,1fr) auto!important}
      }


      /* =========================================================
         Beta17 — 9.7 visual polish
         ========================================================= */

      @media(min-width:761px){
        .hero{
          height:clamp(250px,18vw,286px)!important;
          min-height:250px!important;
          max-height:286px!important;
          padding:18px 26px!important;
        }
        .hero-head{min-height:40px}
        .hero-main{
          grid-template-columns:minmax(0,1.32fr) minmax(300px,.68fr)!important;
          gap:22px!important;
        }
        .temperature{
          font-size:clamp(4rem,6vw,5.8rem)!important;
          line-height:.88!important;
        }
        .hero-subtitle{margin-top:7px!important;font-size:.82rem!important}
        .smart-grid{margin-top:10px!important;gap:8px!important}
        .smart-chip{
          min-height:56px!important;
          padding:8px 11px!important;
          border-radius:17px!important;
        }
        .smart-chip small{font-size:.64rem!important}
        .smart-chip strong{font-size:.82rem!important}
        .score-ring{width:88px!important;height:88px!important}
        .health-label{font-size:1rem!important;margin-top:4px!important}
        .health-stars{font-size:.82rem!important;margin-top:3px!important}
        .health-advice{
          font-size:.72rem!important;
          line-height:1.35!important;
          max-width:520px!important;
          margin-top:6px!important;
        }
        .hero-weather{
          right:132px!important;
          top:16px!important;
          transform:scale(.9);
          transform-origin:top right;
        }
      }
      @media(min-width:1500px){
        .hero{height:274px!important;min-height:274px!important;max-height:274px!important}
      }

      .chart-card{
        background:linear-gradient(180deg,rgba(255,255,255,.96),rgba(232,246,255,.90))!important;
      }
      .chart-card:after{
        height:48%!important;
        background:linear-gradient(180deg,rgba(91,204,231,.11),rgba(65,142,235,.035))!important;
      }
      .spark{
        height:134px!important;
        background-image:
          linear-gradient(rgba(75,134,181,.055) 1px,transparent 1px),
          linear-gradient(90deg,rgba(75,134,181,.04) 1px,transparent 1px);
        background-size:100% 26px,72px 100%;
        border-radius:18px;
      }
      .spark .line{
        stroke-width:4.4!important;
        filter:drop-shadow(0 7px 9px rgba(42,137,226,.24)) drop-shadow(0 0 5px rgba(72,181,255,.28))!important;
      }
      .spark circle:last-of-type{
        stroke-width:4!important;
        filter:drop-shadow(0 0 8px rgba(65,170,245,.96)) drop-shadow(0 0 15px rgba(65,170,245,.4))!important;
      }

      .hero-weather{
        backdrop-filter:blur(16px) saturate(1.15);
        -webkit-backdrop-filter:blur(16px) saturate(1.15);
        border:1px solid rgba(255,255,255,.18)!important;
      }
      .score-ring{filter:drop-shadow(0 0 10px rgba(255,255,255,.16))}

      pool-gauge{
        filter:drop-shadow(0 10px 20px rgba(0,57,105,.16)) drop-shadow(0 0 8px rgba(88,205,255,.15))!important;
      }
      pool-gauge svg{
        filter:drop-shadow(0 0 7px rgba(255,255,255,.12)) drop-shadow(0 0 10px rgba(84,190,255,.18))!important;
      }

      .section-title{margin-top:24px!important;margin-bottom:10px!important}
      .section-title:after{opacity:.72}
      .app section + .section-title,.app article + .section-title{margin-top:22px!important}

      .score-icon{
        box-shadow:0 8px 20px rgba(46,113,169,.14),inset 0 1px 0 rgba(255,255,255,.95),inset 0 -5px 12px rgba(74,143,212,.06)!important;
        position:relative;
      }
      .score-icon:after{
        content:"";position:absolute;inset:5px;border-radius:50%;
        border:1px solid rgba(255,255,255,.76);
        box-shadow:inset 0 0 8px rgba(255,255,255,.52);
        pointer-events:none;
      }
      .score-percent{
        color:#236ea8!important;background:rgba(67,151,218,.09);
        padding:4px 7px;border-radius:999px;
      }

      .weather-card{
        background:
          radial-gradient(circle at 82% 17%,rgba(255,218,96,.38),transparent 17%),
          radial-gradient(ellipse at 18% 25%,rgba(255,255,255,.76),transparent 22%),
          linear-gradient(145deg,rgba(249,253,255,.97),rgba(221,241,255,.84))!important;
      }
      .weather-card:before{
        height:2px!important;
        background:linear-gradient(90deg,transparent,rgba(255,255,255,1),transparent)!important;
      }
      .advice-card{
        background:
          radial-gradient(circle at 10% 10%,rgba(78,211,155,.12),transparent 20%),
          linear-gradient(145deg,rgba(255,255,255,.97),rgba(240,249,255,.86))!important;
      }
      .advice-card:after{
        content:"";position:absolute;left:28px;right:28px;bottom:76px;height:2px;
        background:linear-gradient(90deg,rgba(61,202,151,.18),rgba(70,150,235,.07),transparent);
        border-radius:99px;
      }

      .scroll-top{
        width:42px!important;height:42px!important;min-width:42px!important;min-height:42px!important;
        opacity:.62!important;
        backdrop-filter:blur(12px)!important;-webkit-backdrop-filter:blur(12px)!important;
        background:rgba(255,255,255,.68)!important;
        border:1px solid rgba(84,116,150,.14)!important;
        box-shadow:0 8px 18px rgba(42,78,112,.10)!important;
        transition:opacity .2s ease,transform .2s ease!important;
      }
      .scroll-top:hover{opacity:.88!important;transform:translateY(-2px)!important}
      .scroll-top ha-icon,.scroll-top svg{transform:scale(.82)}

      @media(max-width:760px){
        .section-title{margin-top:21px!important;margin-bottom:9px!important}
        .scroll-top{
          width:40px!important;height:40px!important;min-width:40px!important;min-height:40px!important;
          opacity:.58!important;
        }
        .spark{height:128px!important}
      }


      /* =========================================================
         Beta17.1 — Desktop Hero vertical compression fix
         ========================================================= */
      @media(min-width:761px){
        .hero{
          height:240px!important;
          min-height:240px!important;
          max-height:240px!important;
          padding:12px 24px 14px!important;
          grid-template-rows:auto auto!important;
          align-content:start!important;
          overflow:hidden!important;
        }
        .hero-head{
          min-height:0!important;
          margin:0 0 6px!important;
          align-self:start!important;
        }
        .hero-title{
          margin:0!important;
          transform:none!important;
        }
        .hero-main{
          align-self:start!important;
          margin-top:0!important;
          grid-template-columns:minmax(0,1.28fr) minmax(300px,.72fr)!important;
          gap:18px!important;
        }
        .hero-left{
          align-self:start!important;
          padding-top:0!important;
        }
        .temperature{
          margin-top:0!important;
          font-size:clamp(3.7rem,5.4vw,5.1rem)!important;
          line-height:.84!important;
        }
        .hero-subtitle{
          margin-top:4px!important;
          margin-bottom:0!important;
          font-size:.78rem!important;
        }
        .smart-grid{
          margin-top:8px!important;
          gap:7px!important;
        }
        .smart-chip{
          min-height:50px!important;
          padding:7px 10px!important;
        }
        .health{
          align-self:start!important;
          padding-top:0!important;
        }
        .score-ring{
          width:82px!important;
          height:82px!important;
        }
        .hero-weather{
          top:8px!important;
          right:122px!important;
          transform:scale(.84)!important;
        }
        .health-label{
          margin-top:2px!important;
          font-size:.95rem!important;
        }
        .health-stars{
          margin-top:1px!important;
          font-size:.78rem!important;
        }
        .health-advice{
          margin-top:4px!important;
          font-size:.68rem!important;
          line-height:1.3!important;
        }
      }
      @media(min-width:1500px){
        .hero{
          height:236px!important;
          min-height:236px!important;
          max-height:236px!important;
        }
      }

      /* Mobile remains unchanged */
      @media(max-width:760px){
        .hero{
          height:auto!important;
          min-height:0!important;
          max-height:none!important;
          padding:17px!important;
          overflow:visible!important;
        }
      }

      @media(prefers-reduced-motion:reduce){.v{animation:none}}
    </style><div class=w><svg viewBox="0 0 100 100"><circle class=t cx=50 cy=50 r=40></circle><circle class=v cx=50 cy=50 r=40></circle></svg><div class=c><div class=n>${d.value}<span class=u>${d.unit||""}</span></div><div class=l>${d.label}</div></div></div>`;
  }
}
if(!customElements.get("pool-gauge"))customElements.define("pool-gauge",PoolGauge);


function smartTrend(points,metric){
  if(!Array.isArray(points)||points.length<2)return{label:"Données insuffisantes",direction:"flat",delta:null};
  const delta=points.at(-1).value-points[0].value;
  const threshold=metric==="temperature"?.15:metric==="ph"?.03:8;
  if(Math.abs(delta)<threshold)return{label:"Stable",direction:"flat",delta};
  return{label:delta>0?"En hausse":"En baisse",direction:delta>0?"up":"down",delta};
}
function smartConfidence(comparisons,sourceCount=0,activeCount=sourceCount,completeCount=sourceCount){
  if(activeCount<=0||sourceCount<=0)return 0;
  if(completeCount<=0)return 45;
  if(completeCount<activeCount)return Math.max(55,80-(activeCount-completeCount)*10);
  if(activeCount===1)return 100;
  const valid=comparisons.filter(row=>row.delta!==null);
  if(!valid.length)return 90;
  const penalty=valid.reduce((total,row)=>total+(Number(row.confidencePenalty)||0),0);
  return Math.max(50,Math.min(100,100-penalty));
}
function confidenceLabel(value){
  if(value>=90)return"Élevée";
  if(value>=75)return"Moyenne";
  if(value>0)return"Faible";
  return"Indisponible";
}
function smartBreakdown(aggregated,comparisons){
  if(aggregated.usableCount===0)return{temperature:0,ph:0,orp:0,stability:0,coherence:0,total:0};
  const temperature=aggregated.temperature.number!==null&&(aggregated.temperature.number<22||aggregated.temperature.number>32)?10:20;
  const ph=aggregated.ph.number===null?10:Math.max(0,Math.min(20,Math.round(rc28PhAssessment(aggregated.ph.number).score/5)));
  const orp=aggregated.orp.number!==null&&(aggregated.orp.number<650||aggregated.orp.number>800)?12:20;
  const stability=20;
  const coherence=Math.max(5,20-comparisons.filter(row=>row.delta!==null&&!row.good).length*7);
  return{temperature,ph,orp,stability,coherence,total:temperature+ph+orp+stability+coherence};
}

const PREFS_KEY="ha-pool-dashboard:preferences";
function readPoolPreferences(){
  const defaults={compact_mobile:true,animations:true,advanced_measurements:false,temperature_unit:"C",weather_alert_entity:"auto"};
  try{return{...defaults,...JSON.parse(localStorage.getItem(PREFS_KEY)||"{}")}}
  catch(_error){return defaults}
}
function writePoolPreferences(preferences){
  try{localStorage.setItem(PREFS_KEY,JSON.stringify(preferences))}catch(_error){}
}

const RC24_TREATMENT_KEY="ha-pool-dashboard:treatment-profile";
const RC24_TREATMENT_DETAILS_KEY="ha-pool-dashboard:treatment-details";
const RC24_FEEDERS={
  astralpool_dossi3_inline:{label:"AstralPool Dossi-3 · en ligne",short:"Dossi-3",supports:["bromine","chlorine"],capacityKg:3.5},
  astralpool_dossi3_offline:{label:"AstralPool Dossi-3 · bypass",short:"Dossi-3 bypass",supports:["bromine","chlorine"],capacityKg:3.5},
  hayward_cl200:{label:"Hayward CL200 · en ligne",short:"Hayward CL200",supports:["bromine","chlorine"]},
  hayward_cl220:{label:"Hayward CL220 · bypass",short:"Hayward CL220",supports:["bromine","chlorine"]},
  pentair_rainbow300:{label:"Pentair Rainbow 300 · bypass",short:"Rainbow 300",supports:["bromine","chlorine"]},
  pentair_rainbow320:{label:"Pentair Rainbow 320 · en ligne",short:"Rainbow 320",supports:["bromine","chlorine"]},
  custom:{label:"Autre doseur",short:"Doseur personnalisé",supports:["bromine","chlorine"]}
};
const RC24_PRODUCTS=CATALOGUE_PRODUITS_TRAITEMENT;
const RC24_DEFAULT_TREATMENT={
  volume_m3:16,
  treatment:"bromine",
  feeder_model:"astralpool_dossi3_inline",
  feeder_setting:3,
  feeder_scale_max:8,
  sanitizer_level:"",
  water_condition:"clear",
  ph_plus_product:"bayrol_ph_plus",
  ph_minus_product:"bayrol_ph_minus",
  sanitizer_product:"sunval_bromine_activator",
  algaecide_product:"none",
  degreaser_product:"none",
  supplemental_products_mode:"on_demand",
  custom_ph_plus_name:"Mon pH+",
  custom_ph_minus_name:"Mon pH-",
  custom_sanitizer_name:"Mon produit",
  custom_ph_plus_rate:100,
  custom_ph_minus_rate:100,
  custom_ph_plus_unit:"g",
  custom_ph_minus_unit:"g",
  custom_weekly_rate:100,
  custom_shock_rate:250,
  pump_flow_m3h:10,
  total_alkalinity:"",
  calcium_hardness:"",
  filter_type:"sand",
  filter_clean_pressure:"",
  filter_current_pressure:"",
  filter_pressure_threshold:"",
  pool_mode:"active",
  recent_load:"normal",
  sanitizer_stock_g:"",
  remeasure_delay_hours:"",
  sanitizer_measured_at:""
};
// Façades historiques conservées pendant le refactor ; la logique numérique commune vit désormais dans traitement/produits-dosage.js.
const rc24Number=lireNombreTraitement;
const rc24Clamp=bornerNombreTraitement;
function rc24Escape(value){
  return String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[char]));
}
function rc24SanitizeTreatmentProfile(profile={}){
  const merged={...RC24_DEFAULT_TREATMENT,...profile};
  const treatment=["bromine","chlorine"].includes(merged.treatment)?merged.treatment:"bromine";
  const feeder_model=RC24_FEEDERS[merged.feeder_model]?merged.feeder_model:"custom";
  const feeder_scale_max=rc24Clamp(Math.round(rc24Number(merged.feeder_scale_max,8)),1,20);
  const produits=normaliserConfigurationProduitsTraitement(merged);
  return{
    ...merged,
    treatment,
    feeder_model,
    volume_m3:rc24Clamp(rc24Number(merged.volume_m3,16),1,500),
    feeder_scale_max,
    feeder_setting:rc24Clamp(Math.round(rc24Number(merged.feeder_setting,0)),0,feeder_scale_max),
    sanitizer_level:merged.sanitizer_level===""?"":rc24Clamp(rc24Number(merged.sanitizer_level,0),0,20),
    water_condition:["clear","cloudy","green"].includes(merged.water_condition)?merged.water_condition:"clear",
    ph_plus_product:produits.ph_plus_product,
    ph_minus_product:produits.ph_minus_product,
    sanitizer_product:produits.sanitizer_product,
    algaecide_product:produits.algaecide_product,
    degreaser_product:produits.degreaser_product,
    supplemental_products_mode:produits.supplemental_products_mode,
    custom_ph_plus_rate:produits.custom_ph_plus_rate,
    custom_ph_minus_rate:produits.custom_ph_minus_rate,
    custom_ph_plus_unit:produits.custom_ph_plus_unit,
    custom_ph_minus_unit:produits.custom_ph_minus_unit,
    custom_weekly_rate:produits.custom_weekly_rate,
    custom_shock_rate:produits.custom_shock_rate,
    pump_flow_m3h:merged.pump_flow_m3h===""?10:rc24Clamp(rc24Number(merged.pump_flow_m3h,10),.1,200),
    total_alkalinity:merged.total_alkalinity===""?"":rc24Clamp(rc24Number(merged.total_alkalinity,0),0,500),
    calcium_hardness:merged.calcium_hardness===""?"":rc24Clamp(rc24Number(merged.calcium_hardness,0),0,2000),
    filter_type:["sand","glass","cartridge","diatom"].includes(merged.filter_type)?merged.filter_type:"sand",
    filter_clean_pressure:merged.filter_clean_pressure===""?"":rc24Clamp(rc24Number(merged.filter_clean_pressure,0),0,10),
    filter_current_pressure:merged.filter_current_pressure===""?"":rc24Clamp(rc24Number(merged.filter_current_pressure,0),0,10),
    filter_pressure_threshold:merged.filter_pressure_threshold===""?"":rc24Clamp(rc24Number(merged.filter_pressure_threshold,0),0,5),
    pool_mode:["active","winterized"].includes(merged.pool_mode)?merged.pool_mode:"active",
    recent_load:["normal","busy","polluted"].includes(merged.recent_load)?merged.recent_load:"normal",
    sanitizer_stock_g:merged.sanitizer_stock_g===""?"":rc24Clamp(rc24Number(merged.sanitizer_stock_g,0),0,100000),
    remeasure_delay_hours:merged.remeasure_delay_hours===""?"":rc24Clamp(rc24Number(merged.remeasure_delay_hours,0),0,168),
    sanitizer_measured_at:String(merged.sanitizer_measured_at||"")
  };
}
function readTreatmentProfile(configProfile={}){
  let stored={};
  try{stored=JSON.parse(localStorage.getItem(RC24_TREATMENT_KEY)||"{}")}catch(_error){}
  return rc24SanitizeTreatmentProfile({...configProfile,...stored});
}
function writeTreatmentProfile(profile){
  try{localStorage.setItem(RC24_TREATMENT_KEY,JSON.stringify(profile))}catch(_error){}
}
function resetTreatmentProfile(configProfile={}){
  try{localStorage.removeItem?.(RC24_TREATMENT_KEY)}catch(_error){}
  const profile=rc24SanitizeTreatmentProfile(configProfile);
  writeTreatmentProfile(profile);
  return profile;
}
// Façades historiques : le journal local et sa fusion vivent dans traitement/journal.js.
function readTreatmentHistory(){return lireJournalTraitementLocal(localStorage)}
function writeTreatmentHistory(history){ecrireJournalTraitementLocal(localStorage,history)}
function rc24SanitizeTreatmentDetailsState(value={}){
  return{products:Boolean(value?.products),maintenance:Boolean(value?.maintenance)};
}
function readTreatmentDetailsState(){
  try{return rc24SanitizeTreatmentDetailsState(JSON.parse(localStorage.getItem(RC24_TREATMENT_DETAILS_KEY)||"{}"))}
  catch(_error){return rc24SanitizeTreatmentDetailsState()}
}
function writeTreatmentDetailsState(value){
  try{localStorage.setItem(RC24_TREATMENT_DETAILS_KEY,JSON.stringify(rc24SanitizeTreatmentDetailsState(value)))}catch(_error){}
}
const rc24TreatmentHistoryKey=construireCleEntreeJournalTraitement;
const rc24MergeTreatmentHistories=fusionnerJournauxTraitement;

const RC27_CONTROL_KEY="ha-pool-dashboard:rc27-control";
// Façades historiques : l'état et le rendu pur des sections vivent dans interface/composants/sections-repliables.js.
const RC271_SECTION_KEY=CLE_STOCKAGE_SECTIONS_REPLIABLES;
const RC271_SECTION_IDS=IDENTIFIANTS_SECTIONS_REPLIABLES;
const rc271DefaultSections=creerEtatSectionsRepliablesParDefaut;
const rc271SanitizeSections=normaliserEtatSectionsRepliables;
function readRc271Sections(){
  try{return rc271SanitizeSections(JSON.parse(localStorage.getItem(RC271_SECTION_KEY)||"{}"))}catch(_error){return rc271DefaultSections()}
}
function writeRc271Sections(value){try{localStorage.setItem(RC271_SECTION_KEY,JSON.stringify(rc271SanitizeSections(value)))}catch(_error){}}
const RC27_WEEKDAYS=[
  ["mon","Lun"],["tue","Mar"],["wed","Mer"],["thu","Jeu"],["fri","Ven"],["sat","Sam"],["sun","Dim"]
];
const RC30_PAC_STABLE_ENTITIES=Object.freeze({
  command_entity:"switch.piscine_pac_commande",
  setpoint_entity:"number.piscine_pac_consigne",
  mode_entity:"select.piscine_pac_mode",
  status_entity:"binary_sensor.piscine_pac_activite",
  inlet_temperature_entity:"sensor.piscine_pac_temperature_entree",
  outlet_temperature_entity:"sensor.piscine_pac_temperature_sortie",
  ambient_temperature_entity:"sensor.piscine_pac_temperature_ambiante",
  coil_temperature_entity:"sensor.piscine_pac_temperature_echangeur",
  ipm_temperature_entity:"sensor.piscine_pac_temperature_ipm",
  voltage_entity:"sensor.piscine_pac_tension",
  compressor_fault_code_entity:"sensor.piscine_pac_code_defaut_compresseur",
  water_flow_entity:"binary_sensor.piscine_pac_debit_eau",
  high_pressure_entity:"binary_sensor.piscine_pac_haute_pression",
  low_pressure_entity:"binary_sensor.piscine_pac_basse_pression",
  fault_entity:"binary_sensor.piscine_pac_defaut",
  communication_entity:"binary_sensor.piscine_pac_communication"
});
const RC27_DEFAULT_CONTROL={
  backend_available:false,
  pump:{entity_id:"",power_entity:"",energy_entity:"",mode:"manual",weekdays:RC27_WEEKDAYS.map(([key])=>key),periods:[{enabled:true,start:"06:00",end:"13:00"},{enabled:true,start:"16:00",end:"22:00"},{enabled:false,start:"00:00",end:"00:00"}],recommended_hours:0,scheduled_hours:13,next_boundary:"",extension:{date:"",status:"none",target_hours:0,minutes:0}},
  light:{entity_id:"",power_entity:"",mode:"manual",weekdays:RC27_WEEKDAYS.map(([key])=>key),periods:[{enabled:true,start:"20:00",end:"23:00"},{enabled:false,start:"00:00",end:"00:00"},{enabled:false,start:"00:00",end:"00:00"}],auto_off_minutes:120,scheduled_hours:3,next_boundary:""},
  pac:{command_entity:"",control_mode_entity:"",setpoint_entity:"",mode_entity:"",status_entity:"",inlet_temperature_entity:"",outlet_temperature_entity:"",ambient_temperature_entity:"",coil_temperature_entity:"",ipm_temperature_entity:"",voltage_entity:"",current_entity:"",power_entity:"",energy_entity:"",daily_energy_entity:"",monthly_energy_entity:"",compressor_fault_code_entity:"",water_flow_entity:"",high_pressure_entity:"",low_pressure_entity:"",fault_entity:"",communication_entity:"",mode:"manual",weekdays:RC27_WEEKDAYS.map(([key])=>key),periods:[{enabled:true,start:"09:00",end:"20:00"},{enabled:false,start:"00:00",end:"00:00"},{enabled:false,start:"00:00",end:"00:00"}],scheduled_hours:11,next_boundary:"",requires_pump:true,write_enabled:false},
  coordination:{role:"master",site_name:"Site A",peer_name:"Site B",allow_satellite_manual:true},
  camera_entity:"",notify_service:"",notifications_enabled:false,boost_until:null,light_auto_off_at:null,overrides:{},measurement_sources:{},history:[],watch:{}
};
function rc27Clone(value){return value===undefined?undefined:JSON.parse(JSON.stringify(value))}
function rc27Merge(base,update){
  const result=rc27Clone(base);
  Object.entries(update||{}).forEach(([key,value])=>{
    result[key]=value&&typeof value==="object"&&!Array.isArray(value)&&result[key]&&typeof result[key]==="object"&&!Array.isArray(result[key])?rc27Merge(result[key],value):rc27Clone(value);
  });
  return result;
}
function rc27SanitizeControl(value={}){
  const result=rc27Merge(RC27_DEFAULT_CONTROL,value);
  ["pump","light"].forEach(target=>{
    const block=result[target];
    block.mode=block.mode==="automatic_full"?"automatic":["off","manual","program","automatic"].includes(block.mode)?block.mode:"manual";
    block.weekdays=(block.weekdays||[]).filter(day=>RC27_WEEKDAYS.some(([key])=>key===day));
    block.periods=(block.periods||[]).slice(0,3).map(period=>({enabled:Boolean(period.enabled),start:String(period.start||"00:00").slice(0,5),end:String(period.end||"00:00").slice(0,5)}));
    while(block.periods.length<3)block.periods.push({enabled:false,start:"00:00",end:"00:00"});
  });
  result.pac=normaliserConfigurationPacSecurisee(result.pac,RC27_WEEKDAYS);
  result.coordination=result.coordination&&typeof result.coordination==="object"&&!Array.isArray(result.coordination)?result.coordination:{};
  result.coordination.role=["master","satellite"].includes(result.coordination.role)?result.coordination.role:"master";
  result.coordination.site_name=String(result.coordination.site_name||"Site A").slice(0,40);
  result.coordination.peer_name=String(result.coordination.peer_name||"Site B").slice(0,40);
  result.coordination.allow_satellite_manual=result.coordination.allow_satellite_manual!==false;
  // PAC : le dashboard commande les entités Home Assistant stables uniquement sur l'instance maître.
  // Les garde-fous du package HA Site B et d'ESPHome restent indépendants et continuent de s'appliquer.
  result.pac.write_enabled=result.coordination.role==="master";
  result.pump.extension=result.pump.extension&&typeof result.pump.extension==="object"?result.pump.extension:{date:"",status:"none",target_hours:0,minutes:0};
  result.pump.extension.status=["none","approved","ignored"].includes(result.pump.extension.status)?result.pump.extension.status:"none";
  result.measurement_sources=result.measurement_sources&&typeof result.measurement_sources==="object"&&!Array.isArray(result.measurement_sources)?Object.fromEntries(Object.entries(result.measurement_sources).map(([key,enabled])=>[key,enabled!==false])):{};
  result.seasonal_profiles=rc30SanitizeProfiles(result.seasonal_profiles,result.pump);
  result.history=Array.isArray(result.history)?result.history.slice(0,100):[];
  return result;
}
function readRc27Control(){
  try{return rc27SanitizeControl(JSON.parse(localStorage.getItem(RC27_CONTROL_KEY)||"{}"))}catch(_error){return rc27SanitizeControl()}
}
function writeRc27Control(value){try{localStorage.setItem(RC27_CONTROL_KEY,JSON.stringify(value))}catch(_error){}}

function rc30SanitizeProfiles(value={},pump={}){
  const schema=Number(value.schema||0),legacyProfiles=schema<2;
  const follow=legacyProfiles?true:value.follow_astronomical!==false;
  const suggested=determinerProfilSaisonnierDeReference();
  const requested=String(value.current||suggested);
  const selected=follow?suggested:(PROFILS_SAISONNIERS[requested]?requested:suggested);
  const profiles={};
  for(const [key,definition] of Object.entries(PROFILS_SAISONNIERS)){
    const stored=!legacyProfiles&&value.profiles?.[key]?value.profiles[key]:{};
    profiles[key]={
      weekdays:(stored.weekdays||RC27_WEEKDAYS.map(([day])=>day)).filter(day=>RC27_WEEKDAYS.some(([known])=>known===day)),
      periods:(stored.periods||definition.periods).slice(0,3).map(period=>({enabled:Boolean(period.enabled),start:String(period.start||"00:00").slice(0,5),end:String(period.end||"00:00").slice(0,5)}))
    };
    while(profiles[key].periods.length<3)profiles[key].periods.push({enabled:false,start:"00:00",end:"00:00"});
  }
  const source=normaliserSourceProgrammation(value.source);
  return{schema:3,current:selected,follow_astronomical:follow,source,initialized:true,profiles,last_adaptive_signature:String(value.last_adaptive_signature||""),suspended_at:String(value.suspended_at||""),manual_revision:Number(value.manual_revision||0)};
}
function rc30RememberActiveProfile(control){
  const seasonal=rc30SanitizeProfiles(control.seasonal_profiles,control.pump);
  seasonal.profiles[seasonal.current]={weekdays:rc27Clone(control.pump.weekdays),periods:rc27Clone(control.pump.periods)};
  return rc27Merge(control,{seasonal_profiles:seasonal});
}
function rc30MarkCustomSchedule(control){
  const seasonal=rc30SanitizeProfiles(control.seasonal_profiles,control.pump);
  const personnalisee=rendreProgrammationPersonnalisee(seasonal,Date.now());
  return rc27Merge(control,{seasonal_profiles:personnalisee});
}
// Façades historiques : les primitives horaires de l’adaptatif vivent dans programmation/programme-adaptatif.js.
const rc30ClockMinutes=convertirHeureEnMinutes;
const rc30ClockLabel=formaterMinutesHorloge;
const rc30ProfileStart=determinerDebutProfil;
const rc30AdaptivePeriods=construirePlagesAdaptatives;
function rc27SetPath(source,path,value){
  const result=rc27Clone(source),parts=String(path).split(".");
  let cursor=result;
  parts.slice(0,-1).forEach(part=>{cursor=cursor[Number.isInteger(Number(part))&&part!==""?Number(part):part]});
  const last=parts.at(-1),key=Number.isInteger(Number(last))&&last!==""?Number(last):last;
  cursor[key]=value;
  return result;
}
const rc27Minutes=calculerMinutesPlage;
const rc27ScheduledHours=calculerHeuresProgramme;
function rc27RelativeDate(value){
  const time=new Date(value).getTime();
  if(!Number.isFinite(time))return"non planifié";
  const minutes=Math.round((time-Date.now())/60000),absolute=Math.abs(minutes);
  if(absolute<1)return"maintenant";
  if(minutes>0)return absolute<60?`dans ${absolute} min`:`dans ${Math.floor(absolute/60)} h ${absolute%60?absolute%60+" min":""}`.trim();
  return absolute<60?`il y a ${absolute} min`:`il y a ${Math.floor(absolute/60)} h`;
}
function rc27DateTime(value){
  const date=new Date(value);
  return Number.isFinite(date.getTime())?date.toLocaleString([], {day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}):"—";
}
function rc24LastTreatment(history,kinds){
  return history.find(item=>kinds.includes(item.kind)&&Number.isFinite(new Date(item.date).getTime()))||null;
}
function rc24DaysSince(value){
  const timestamp=new Date(value).getTime();
  return Number.isFinite(timestamp)?Math.max(0,(Date.now()-timestamp)/86400000):Infinity;
}
function rc24TreatmentModel(profile,context={}){
  const volume=profile.volume_m3;
  const isBromine=profile.treatment==="bromine";
  const ph=rc24Number(context.ph,null);
  const temperature=rc24Number(context.temperature,null);
  const sanitizer=rc24Number(profile.sanitizer_level,null);
  const targetPh=isBromine?{min:7.2,max:7.5}:{min:7.0,max:7.4};
  const acceptablePh=isBromine?{min:7.0,max:7.7}:targetPh;
  const sanitizerTarget=isBromine?{min:1,max:3,unit:"mg/L",label:"Brome"}:{min:.5,max:1,unit:"mg/L",label:"Chlore"};
  const feeder=RC24_FEEDERS[profile.feeder_model]||RC24_FEEDERS.custom;
  const history=Array.isArray(context.history)?context.history:[];
  const weatherAlert=context.weatherAlert||{available:false,alerts:[]};
  const lastActivator=rc24LastTreatment(history,["bromine_weekly","bromine_shock"]);
  const lastTreatmentDays=lastActivator?rc24DaysSince(lastActivator.date):Infinity;
  const lastDose=rc24LastTreatment(history,["ph_plus","ph_minus","bromine_weekly","bromine_shock"]);
  const lastDoseAt=lastDose?new Date(lastDose.date).getTime():0;
  const lastAnalysisAt=new Date(context.lastAnalysis||0).getTime();
  const lastManualMeasure=rc24LastTreatment(history,["sanitizer_measurement"]);
  const lastManualMeasureAt=lastManualMeasure?new Date(lastManualMeasure.date).getTime():0;
  const remeasureDelay=rc24Number(profile.remeasure_delay_hours,null);
  const nextMeasureAt=lastDoseAt&&remeasureDelay!==null?lastDoseAt+remeasureDelay*3600000:0;
  const doseLocked=Boolean(nextMeasureAt>Date.now()&&Math.max(lastAnalysisAt,lastManualMeasureAt)<=lastDoseAt);
  const dosagePhPlus=preparerDosageCorrectionPh(profile,"plus",volume);
  const dosagePhMinus=preparerDosageCorrectionPh(profile,"minus",volume);
  const phPlus=dosagePhPlus.produit,phMinus=dosagePhMinus.produit;
  const phPlusUnit=dosagePhPlus.unite,phMinusUnit=dosagePhMinus.unite;
  const phPlusName=dosagePhPlus.nom,phMinusName=dosagePhMinus.nom;
  const phOkay=ph!==null&&ph>=acceptablePh.min&&ph<=acceptablePh.max;
  const phAssessment=rc28PhAssessment(ph);
  const actions=[];
  let phAdvice;
  if(ph===null){
    phAdvice={tone:"pending",title:"Mesure de pH nécessaire",detail:"Aucun dosage n’est calculé sans mesure disponible."};
  }else if(doseLocked){
    phAdvice={tone:"blocked",title:`pH ${ph.toFixed(2)} · nouvelle mesure attendue`,detail:`Une action est déjà enregistrée. Attendez le contrôle prévu ${new Date(nextMeasureAt).toLocaleString([], {dateStyle:"short",timeStyle:"short"})} avant une nouvelle dose.`};
  }else if(phAssessment.score>=97){
    phAdvice={tone:"good",title:`pH ${ph.toFixed(2)} · ${phAssessment.label.toLowerCase()}`,detail:phAssessment.detail};
  }else if(phAssessment.score>=88){
    phAdvice={tone:"pending",title:`pH ${ph.toFixed(2)} · à surveiller`,detail:"Aucune correction immédiate : confirmez la tendance avec une nouvelle mesure."};
  }else if(ph<acceptablePh.min){
    const dose=dosagePhPlus.dose;
    const instruction=phPlus.safety||phPlus.note?` ${phPlus.safety||phPlus.note}`:"";
    phAdvice={tone:ph<6.8?"critical":"warning",title:`pH ${ph.toFixed(2)} · ${phAssessment.label.toLowerCase()}`,detail:`Procéder par palier de +0,1 avec ${rc24Escape(phPlusName)} : ${dose} ${phPlusUnit}, puis mesurer de nouveau.${instruction}`,dose,doseUnit:phPlusUnit};
    actions.push({kind:"ph_plus",label:phPlus.application==="dosing_pump"?`J’ai injecté ${dose} ${phPlusUnit} via pompe`:`J’ai ajouté ${dose} ${phPlusUnit}`,product:phPlusName,dose_amount:dose,dose_unit:phPlusUnit,dose_g:phPlusUnit==="g"?dose:null,dose_ml:phPlusUnit==="ml"?dose:null,detail:"Palier de pH +0,1"});
  }else if(ph>acceptablePh.max){
    const dose=dosagePhMinus.dose;
    const instruction=phMinus.safety||phMinus.note?` ${phMinus.safety||phMinus.note}`:"";
    phAdvice={tone:ph>8?"critical":"warning",title:`pH ${ph.toFixed(2)} · ${phAssessment.label.toLowerCase()}`,detail:`Procéder par palier de -0,1 avec ${rc24Escape(phMinusName)} : ${dose} ${phMinusUnit}, puis mesurer de nouveau.${instruction}`,dose,doseUnit:phMinusUnit};
    actions.push({kind:"ph_minus",label:phMinus.application==="dosing_pump"?`J’ai injecté ${dose} ${phMinusUnit} via pompe`:`J’ai ajouté ${dose} ${phMinusUnit}`,product:phMinusName,dose_amount:dose,dose_unit:phMinusUnit,dose_g:phMinusUnit==="g"?dose:null,dose_ml:phMinusUnit==="ml"?dose:null,detail:"Palier de pH -0,1"});
  }else{
    phAdvice={tone:"warning",title:`pH ${ph.toFixed(2)} · ${phAssessment.label.toLowerCase()}`,detail:phAssessment.detail};
  }

  const measurements=history.filter(item=>item.kind==="sanitizer_measurement"&&(!item.treatment||item.treatment===profile.treatment)&&Number.isFinite(Number(item.sanitizer_level))).slice(0,2);
  const lastFeederChange=rc24LastTreatment(history,["feeder_setting"]);
  const lastFeederAt=lastFeederChange?new Date(lastFeederChange.date).getTime():0;
  const needsMeasureAfterSetting=Boolean(lastFeederAt&&lastManualMeasureAt<=lastFeederAt);
  const confirmedLow=measurements.length>=2&&measurements.every(item=>Number(item.sanitizer_level)<sanitizerTarget.min);
  const confirmedHigh=measurements.length>=2&&measurements.every(item=>Number(item.sanitizer_level)>sanitizerTarget.max);
  let feederAdvice;
  let suggestedSetting=profile.feeder_setting;
  if(sanitizer===null){
    feederAdvice={tone:"pending",title:`${sanitizerTarget.label} à mesurer`,detail:`Saisissez une mesure en ${sanitizerTarget.unit}. L’ORP seul ne déclenche aucun changement de réglage.`};
  }else if(needsMeasureAfterSetting){
    feederAdvice={tone:"pending",title:`Réglage ${profile.feeder_setting}/${profile.feeder_scale_max} conservé`,detail:"Un réglage vient d’être enregistré. Attendez un cycle complet de filtration puis saisissez une nouvelle mesure."};
  }else if(!phOkay){
    feederAdvice={tone:"blocked",title:`Réglage ${profile.feeder_setting}/${profile.feeder_scale_max} conservé`,detail:"Corrigez et contrôlez d’abord le pH avant de modifier le doseur."};
  }else if(sanitizer<sanitizerTarget.min&&!confirmedLow){
    feederAdvice={tone:"pending",title:`${sanitizerTarget.label} ${sanitizer.toFixed(1)} ${sanitizerTarget.unit} · bas à confirmer`,detail:"Une deuxième mesure basse est demandée avant de proposer un changement de cran."};
  }else if(sanitizer<sanitizerTarget.min){
    suggestedSetting=Math.min(profile.feeder_scale_max,profile.feeder_setting+1);
    feederAdvice={tone:"warning",title:`${sanitizerTarget.label} bas sur deux contrôles`,detail:suggestedSetting===profile.feeder_setting?"Le doseur est déjà au maximum ; contrôlez la charge, le stock et la circulation.":`Proposition prudente : ${profile.feeder_setting}/${profile.feeder_scale_max} → ${suggestedSetting}/${profile.feeder_scale_max}, puis nouvelle mesure après un cycle complet.`};
  }else if(sanitizer>sanitizerTarget.max&&!confirmedHigh){
    feederAdvice={tone:"pending",title:`${sanitizerTarget.label} ${sanitizer.toFixed(1)} ${sanitizerTarget.unit} · haut à confirmer`,detail:"Une deuxième mesure haute est demandée avant de proposer un changement de cran."};
  }else if(sanitizer>sanitizerTarget.max){
    suggestedSetting=Math.max(0,profile.feeder_setting-1);
    feederAdvice={tone:"warning",title:`${sanitizerTarget.label} haut sur deux contrôles`,detail:`Proposition prudente : ${profile.feeder_setting}/${profile.feeder_scale_max} → ${suggestedSetting}/${profile.feeder_scale_max}, puis nouvelle mesure après un cycle complet.`};
  }else{
    feederAdvice={tone:"good",title:`${sanitizerTarget.label} ${sanitizer.toFixed(1)} ${sanitizerTarget.unit} · cible atteinte`,detail:`Conserver le réglage ${profile.feeder_setting}/${profile.feeder_scale_max}.`};
  }
  if(suggestedSetting!==profile.feeder_setting){
    actions.push({kind:"feeder_setting",label:`J’ai réglé sur ${suggestedSetting}/${profile.feeder_scale_max}`,setting:suggestedSetting,product:feeder.short,detail:`Réglage précédent ${profile.feeder_setting}/${profile.feeder_scale_max}`});
  }

  let sanitizerAdvice;
  let weeklyDose=null;
  if(!isBromine){
    sanitizerAdvice={tone:"pending",title:"Produit chloré à configurer",detail:"Aucun dosage de galet n’est inventé sans contre-étiquette spécifique au produit."};
  }else{
    const dosageDesinfectant=preparerDosageDesinfectantBrome(profile,volume);
    const product=dosageDesinfectant.produit;
    const productName=dosageDesinfectant.nom;
    const weeklyRate=dosageDesinfectant.tauxHebdomadaire;
    const shockRate=dosageDesinfectant.tauxChoc;
    weeklyDose=dosageDesinfectant.doseHebdomadaire;
    const shockDose=dosageDesinfectant.doseChoc;
    const problem=profile.water_condition==="green"||profile.water_condition==="cloudy";
    if(problem&&!phOkay){
      sanitizerAdvice={tone:"blocked",title:"Traitement choc bloqué",detail:`Ramenez d’abord le pH entre ${acceptablePh.min.toFixed(1)} et ${acceptablePh.max.toFixed(1)}.`};
    }else if(problem&&doseLocked){
      sanitizerAdvice={tone:"blocked",title:"Nouvelle mesure attendue",detail:"Une dose est déjà enregistrée ; ne cumulez pas les traitements avant le prochain contrôle."};
    }else if(problem){
      sanitizerAdvice={tone:"critical",title:`Traitement choc : ${shockDose} g`,detail:`${rc24Escape(productName)} · ${shockRate} g/10 m³ × ${volume} m³. À verser dans le bassin, jamais dans le doseur.`};
      actions.push({kind:"bromine_shock",label:`J’ai ajouté ${shockDose} g`,product:productName,dose_amount:shockDose,dose_unit:"g",dose_g:shockDose,detail:`${profile.water_condition==="green"?"Eau verte":"Eau trouble"} · traitement choc`});
    }else if(!protocoleFabricantHebdomadaireActif(profile.supplemental_products_mode)){
      sanitizerAdvice={tone:"info",title:"Brome lent : traitement de fond",detail:`${rc24Escape(productName)} reste disponible en complément. Repères de la contre-étiquette : ${weeklyDose} g pour le protocole d’entretien et ${shockDose} g en traitement choc. Mode ponctuel / urgence actif : aucun rappel hebdomadaire et aucun bouton d’ajout n’est affiché. Le traitement choc n’est proposé que si l’eau est déclarée verte ou trouble.`};
    }else if(lastTreatmentDays>=6.5&&!doseLocked){
      const withoutMeasurement=sanitizer===null;
      sanitizerAdvice={tone:"info",title:`Protocole fabricant hebdomadaire : ${weeklyDose} g`,detail:`${rc24Escape(productName)} · ${weeklyRate} g/10 m³ × ${volume} m³. Prévu par la notice en complément du brome lent ; ce n’est pas une alerte calculée par le dashboard. ${withoutMeasurement?"Aucune mesure de brome n’a été utilisée pour calculer cette dose. ":""}À verser dans le bassin, filtration en marche.`};
      if(phOkay)actions.push({kind:"bromine_weekly",label:withoutMeasurement?`Confirmer l’ajout fabricant de ${weeklyDose} g`:`J’ai ajouté ${weeklyDose} g`,product:productName,dose_amount:weeklyDose,dose_unit:"g",dose_g:weeklyDose,detail:withoutMeasurement?"Protocole fabricant hebdomadaire · brome non mesuré":"Protocole fabricant hebdomadaire",manualConfirmation:withoutMeasurement});
    }else{
      const remaining=Math.max(0,Math.ceil(7-lastTreatmentDays));
      sanitizerAdvice={tone:"good",title:"Entretien déjà enregistré",detail:`Dernier activateur il y a ${Math.max(0,Math.floor(lastTreatmentDays))} jour(s). Prochain rappel dans environ ${remaining} jour(s).`};
    }
  }

  const supplementalAdvice=[];
  const manufacturerSchedule=protocoleFabricantHebdomadaireActif(profile.supplemental_products_mode);
  if(profile.algaecide_product==="bayrol_desalgin_classic"){
    const product=RC24_PRODUCTS.bayrol_desalgin_classic;
    const dose=calculerDoseDesalginClassic(volume);
    if(!manufacturerSchedule){
      supplementalAdvice.push({tone:"info",title:`Desalgin Classic disponible · repère ${dose} ml`,detail:`Anti-algues préventif · contre-étiquette ${product.weeklyPer10m3} ml/10 m³. Mode ponctuel / urgence : aucun rappel hebdomadaire et aucun bouton d’ajout.`});
    }else{
      const last=rc24LastTreatment(history,["desalgin_weekly"]);
      const days=last?rc24DaysSince(last.date):Infinity;
      if(days>=6.5){
        supplementalAdvice.push({tone:"info",title:`Desalgin Classic : ${dose} ml`,detail:`Dose fabricant hebdomadaire · ${product.weeklyPer10m3} ml/10 m³ × ${volume} m³.`});
        actions.push({kind:"desalgin_weekly",label:`Confirmer ${dose} ml de Desalgin Classic`,product:product.label,dose_amount:dose,dose_unit:"ml",dose_ml:dose,detail:"Entretien anti-algues hebdomadaire",manualConfirmation:true});
      }else{
        supplementalAdvice.push({tone:"good",title:"Desalgin Classic déjà enregistré",detail:`Dernier ajout il y a ${Math.max(0,Math.floor(days))} jour(s).`});
      }
    }
  }
  if(profile.degreaser_product==="piscimar_grease_killer"){
    const dosageGrease=preparerDosageGreaseKiller({volumeM3:volume,brome:isBromine,niveauDesinfectant:sanitizer});
    const product=dosageGrease.produit;
    const initialDose=dosageGrease.doseInitiale;
    const weeklyDoseGrease=dosageGrease.doseHebdomadaire;
    const limit=dosageGrease.limite;
    const sanitizerReady=dosageGrease.mesureCompatible;
    if(!manufacturerSchedule){
      supplementalAdvice.push({tone:sanitizerReady?"info":"pending",title:`Grease Killer disponible · repères ${initialDose} / ${weeklyDoseGrease} ml`,detail:`Mode ponctuel / urgence : aucun rappel hebdomadaire et aucun bouton d’ajout. Contre-étiquette : ${initialDose} ml en dose initiale puis ${weeklyDoseGrease} ml en entretien pour ${volume} m³ ; avant utilisation, vérifier ${isBromine?"brome":"chlore"} ≤ ${limit} mg/L et filtrer ${product.filtrationHours} h.`});
    }else{
      const last=rc24LastTreatment(history,["grease_killer_initial","grease_killer_weekly"]);
      if(!sanitizerReady){
        supplementalAdvice.push({tone:"blocked",title:"Grease Killer en attente",detail:`Mesurez le ${isBromine?"brome":"chlore"} et vérifiez qu’il est ≤ ${limit} mg/L avant utilisation. Filtration 8 h après ajout.`});
      }else if(!last){
        supplementalAdvice.push({tone:"info",title:`Grease Killer · dose initiale ${initialDose} ml`,detail:`Contre-étiquette : 0,75 L/100 m³, puis filtration ${product.filtrationHours} h.`});
        actions.push({kind:"grease_killer_initial",label:`Confirmer ${initialDose} ml de Grease Killer`,product:product.label,dose_amount:initialDose,dose_unit:"ml",dose_ml:initialDose,detail:`Dose initiale · filtration ${product.filtrationHours} h`,manualConfirmation:true});
      }else{
        const days=rc24DaysSince(last.date);
        if(days>=6.5){
          supplementalAdvice.push({tone:"info",title:`Grease Killer · entretien ${weeklyDoseGrease} ml`,detail:`Contre-étiquette : 0,35 L/100 m³ par semaine, puis filtration ${product.filtrationHours} h.`});
          actions.push({kind:"grease_killer_weekly",label:`Confirmer ${weeklyDoseGrease} ml de Grease Killer`,product:product.label,dose_amount:weeklyDoseGrease,dose_unit:"ml",dose_ml:weeklyDoseGrease,detail:`Entretien hebdomadaire · filtration ${product.filtrationHours} h`,manualConfirmation:true});
        }else{
          supplementalAdvice.push({tone:"good",title:"Grease Killer déjà enregistré",detail:`Dernier ajout il y a ${Math.max(0,Math.floor(days))} jour(s).`});
        }
      }
    }
  }

  const pumpFlow=rc24Number(profile.pump_flow_m3h,null);
  const {
    dureeTemperatureHeures:temperatureHours,
    plancherHydrauliqueHeures:hydraulicHours,
    dureeRecommandeeHeures:normalHours,
  }=calculerDureeFiltrationDeBase({
    temperatureEauC:temperature,
    volumeBassinM3:volume,
    debitPompeM3H:pumpFlow,
  });
  const alerts=Array.isArray(weatherAlert.alerts)?weatherAlert.alerts:[];
  const heatAlert=alerts.find(alert=>alert.key==="heatwave"&&alert.severity>=2);
  const coldAlert=alerts.find(alert=>alert.key==="cold"&&alert.severity>=2);
  const problem=profile.water_condition==="green"||profile.water_condition==="cloudy";
  const sanitizerLow=sanitizer!==null&&sanitizer<sanitizerTarget.min;
  let filtrationHours=normalHours;
  let filtrationMode="normal";
  let filtrationReason="Règle température ÷ 2";
  if(problem){filtrationHours=24;filtrationMode="continuous";filtrationReason="Eau trouble ou verte"}
  else if(heatAlert&&temperature!==null&&temperature>=28){filtrationHours=24;filtrationMode="continuous";filtrationReason=`Vigilance ${heatAlert.levelLabel.toLowerCase()} canicule et eau chaude`}
  else if(sanitizerLow&&temperature!==null&&temperature>=28){filtrationHours=24;filtrationMode="continuous";filtrationReason="Désinfectant bas et eau chaude"}
  else if(profile.recent_load==="polluted"){filtrationHours=24;filtrationMode="continuous";filtrationReason="Pollution importante déclarée"}
  else if(coldAlert&&profile.pool_mode==="active"){filtrationHours=24;filtrationMode="continuous";filtrationReason="Grand froid et piscine active"}
  else if(profile.recent_load==="busy"&&normalHours!==null){filtrationHours=Math.min(24,normalHours+2);filtrationMode="reinforced";filtrationReason="Fréquentation élevée"}
  else if(temperature!==null&&temperature>30&&normalHours!==null){filtrationHours=Math.min(24,normalHours+4);filtrationMode="reinforced";filtrationReason="Eau > 30 °C · recommandation renforcée"}
  else if(temperature!==null&&temperature>28&&normalHours!==null){const extra=Math.max(1,Math.ceil((temperature-28)*2));filtrationHours=Math.min(24,normalHours+extra);filtrationMode="reinforced";filtrationReason="Eau très chaude · renforcement progressif"}
  const hydraulicText=hydraulicHours===null?"Débit de pompe non renseigné":`plancher hydraulique ≈ ${hydraulicHours} h/j (1 renouvellement théorique)`;
  const filtrationAdvice=filtrationHours===null?"Température et débit indisponibles.":filtrationMode==="continuous"?`${filtrationReason} : filtration temporaire 24 h/24 fortement recommandée, à valider selon le bassin.`:`Eau à ${temperature===null?"—":temperature.toFixed(1)+" °C"} : recommandation indicative ${filtrationHours} h/j (${filtrationReason.toLowerCase()} ; ${hydraulicText}).${temperature!==null&&temperature>28?" Eau chaude : contrôlez le désinfectant chaque jour.":""}`;
  const filtrationTone=filtrationMode==="continuous"?"critical":filtrationMode==="reinforced"?"warning":"info";

  const tac=rc24Number(profile.total_alkalinity,null);
  const hardness=rc24Number(profile.calcium_hardness,null);
  const balanceAdvice=tac===null?{tone:"pending",title:"TAC à renseigner",detail:"Mesurez le TAC si le pH varie ou résiste aux corrections."}:tac<80?{tone:"warning",title:`TAC ${tac} mg/L · bas`,detail:"Stabilisez d’abord l’alcalinité avec un produit et un dosage de contre-étiquette."}:tac>120?{tone:"warning",title:`TAC ${tac} mg/L · élevé`,detail:"Le pH peut devenir difficile à corriger ; demandez une analyse complète avant dosage."}:{tone:"good",title:`TAC ${tac} mg/L`,detail:hardness===null?"Zone courante satisfaisante ; TH non renseigné.":hardness<150?`TH ${hardness} mg/L · eau douce, surveillez le risque corrosif.`:hardness>400?`TH ${hardness} mg/L · eau dure, surveillez les dépôts.`:`TH ${hardness} mg/L · équilibre renseigné.`};
  const cleanPressure=rc24Number(profile.filter_clean_pressure,null);
  const currentPressure=rc24Number(profile.filter_current_pressure,null);
  const configuredThreshold=rc24Number(profile.filter_pressure_threshold,null);
  const automaticThreshold=cleanPressure===null?null:cleanPressure+.3;
  const pressureThreshold=configuredThreshold!==null&&cleanPressure!==null&&configuredThreshold>cleanPressure?configuredThreshold:automaticThreshold;
  const pressureDelta=cleanPressure!==null&&currentPressure!==null?currentPressure-cleanPressure:null;
  const filterAdvice=pressureDelta===null?{tone:"pending",state:"Non renseigné",title:"Pression du filtre à renseigner",detail:"Enregistrez la pression juste après nettoyage et la pression actuelle."}:pressureThreshold!==null&&currentPressure>=pressureThreshold?{tone:"warning",state:"Contre-lavage conseillé",title:`Contre-lavage conseillé · ${currentPressure.toFixed(2)} bar`,detail:`Seuil ${pressureThreshold.toFixed(2)} bar atteint (écart +${pressureDelta.toFixed(2)} bar).`}:pressureDelta>=.2?{tone:"pending",state:"À surveiller",title:`Filtre à surveiller · ${currentPressure.toFixed(2)} bar`,detail:`Écart +${pressureDelta.toFixed(2)} bar ; seuil de contre-lavage ${pressureThreshold?.toFixed(2)||"—"} bar.`}:{tone:"good",state:"Filtre propre",title:`Filtre propre · ${currentPressure.toFixed(2)} bar`,detail:`Écart +${pressureDelta.toFixed(2)} bar ; seuil de contre-lavage ${pressureThreshold?.toFixed(2)||"—"} bar.`};
  const stock=rc24Number(profile.sanitizer_stock_g,null);
  const stockAdvice=stock===null?{tone:"pending",title:"Stock produit non renseigné",detail:"Indiquez le poids restant pour activer l’alerte de stock."}:weeklyDose&&stock<weeklyDose*2?{tone:"warning",title:`Stock faible : ${Math.round(stock)} g`,detail:`Moins de deux doses d’entretien estimées (${weeklyDose} g par dose).`}:{tone:"good",title:`Stock estimé : ${Math.round(stock)} g`,detail:weeklyDose?`Environ ${Math.floor(stock/weeklyDose)} dose(s) d’entretien disponible(s).`:"Stock enregistré."};
  const remeasureAdvice=doseLocked?{tone:"warning",title:"Nouvelle dose temporairement bloquée",detail:`Contrôle attendu ${new Date(nextMeasureAt).toLocaleString([], {dateStyle:"short",timeStyle:"short"})}.`}:{tone:"good",title:"Historique des actions actif",detail:remeasureDelay===null?"Renseignez le délai de la contre-étiquette pour activer le compte à rebours.":`Délai configuré : ${remeasureDelay} h après une dose.`};

  const lastBaskets=rc24LastTreatment(history,["maintenance_baskets"]);
  const lastWaterline=rc24LastTreatment(history,["maintenance_waterline"]);
  const lastFilter=rc24LastTreatment(history,["maintenance_filter"]);
  if(!lastBaskets||rc24DaysSince(lastBaskets.date)>=7)actions.push({kind:"maintenance_baskets",label:"Paniers et préfiltre nettoyés",product:"Entretien",detail:"Nettoyage des paniers et du préfiltre"});
  if(!lastWaterline||rc24DaysSince(lastWaterline.date)>=7)actions.push({kind:"maintenance_waterline",label:"Ligne d’eau nettoyée",product:"Entretien",detail:"Nettoyage de la ligne d’eau"});
  if((pressureThreshold!==null&&pressureDelta!==null&&pressureDelta>=pressureThreshold)||!lastFilter||rc24DaysSince(lastFilter.date)>=30)actions.push({kind:"maintenance_filter",label:"Filtre contrôlé / nettoyé",product:"Entretien",detail:"Contrôle ou nettoyage du filtre"});

  const confidence=ph===null?{tone:"pending",label:"À confirmer",detail:"pH manquant"}:sanitizer===null?{tone:"medium",label:"Fiabilité moyenne",detail:"Mesure du désinfectant manquante"}:{tone:"high",label:"Fiabilité élevée",detail:"Étiquette, volume, pH et désinfectant renseignés"};
  const summary=actions.find(action=>action.kind==="bromine_shock")?`Traitement choc calculé pour ${volume} m³`:actions.find(action=>action.kind==="ph_plus"||action.kind==="ph_minus")?`Correction pH par palier pour ${volume} m³`:sanitizerAdvice.title;
  return{volume,isBromine,targetPh,acceptablePh,sanitizerTarget,feeder,phAdvice,feederAdvice,sanitizerAdvice,supplementalAdvice,filtrationAdvice,filtrationHours,filtrationTone,filtrationMode,filtrationReason,hydraulicHours,confidence,actions,summary,suggestedSetting,lastTreatment:lastActivator,balanceAdvice,filterAdvice,filterThreshold:pressureThreshold,filterDelta:pressureDelta,stockAdvice,remeasureAdvice};
}


const RC18_ANALYSIS_STATE_MAP = {
  idle:{label:"Prêt pour une analyse",detail:"Appareil disponible",tone:"idle",progress:0},
  waiting:{label:"Mesure en attente",detail:"L'appareil attend le démarrage",tone:"waiting",progress:12},
  queued:{label:"Analyse programmée",detail:"La demande a été transmise",tone:"waiting",progress:18},
  connecting:{label:"Connexion Bluetooth…",detail:"Recherche et connexion à l'appareil",tone:"connecting",progress:30},
  scanning:{label:"Recherche de l'appareil…",detail:"Détection Bluetooth en cours",tone:"connecting",progress:24},
  measuring:{label:"Mesure en cours…",detail:"Lecture des paramètres de l'eau",tone:"running",progress:62},
  analyzing:{label:"Analyse en cours…",detail:"Traitement des nouvelles mesures",tone:"running",progress:78},
  syncing:{label:"Synchronisation…",detail:"Mise à jour de Home Assistant",tone:"syncing",progress:88},
  completed:{label:"Analyse terminée",detail:"Dernières mesures disponibles",tone:"success",progress:100},
  done:{label:"Analyse terminée",detail:"Dernières mesures disponibles",tone:"success",progress:100},
  success:{label:"Analyse terminée",detail:"Dernières mesures disponibles",tone:"success",progress:100},
  error:{label:"Analyse impossible",detail:"Vérifiez la connexion et l'intégration",tone:"error",progress:100},
  error_retry:{label:"Nouvelle tentative nécessaire",detail:"Vérifiez la connexion puis relancez l'analyse",tone:"error",progress:100},
  unavailable:{label:"Appareil indisponible",detail:"Aucune communication avec l'appareil",tone:"offline",progress:0},
  disconnected:{label:"Connexion perdue",detail:"L'appareil n'est plus joignable",tone:"offline",progress:0},
  unknown:{label:"État inconnu",detail:"En attente d'une information de l'intégration",tone:"unknown",progress:0}
};

function rc18AnalysisState(rawState){
  const key=String(rawState??"unknown").trim().toLowerCase().replace(/\s+/g,"_");
  if(RC18_ANALYSIS_STATE_MAP[key])return RC18_ANALYSIS_STATE_MAP[key];
  if(key.includes("finish")||key.includes("complete")||key.includes("termin"))return RC18_ANALYSIS_STATE_MAP.completed;
  if(key.includes("measure")||key.includes("analyse")||key.includes("analyz"))return RC18_ANALYSIS_STATE_MAP.analyzing;
  if(key.includes("connect")||key.includes("scan")||key.includes("bluetooth"))return RC18_ANALYSIS_STATE_MAP.connecting;
  if(key.includes("sync"))return RC18_ANALYSIS_STATE_MAP.syncing;
  if(key.includes("wait")||key.includes("idle")||key.includes("ready"))return RC18_ANALYSIS_STATE_MAP.waiting;
  if(key.includes("error")||key.includes("fail")||key.includes("retry"))return RC18_ANALYSIS_STATE_MAP.error_retry;
  if(key.includes("unavailable")||key.includes("disconnect")||key.includes("offline"))return RC18_ANALYSIS_STATE_MAP.unavailable;
  return {...RC18_ANALYSIS_STATE_MAP.unknown,detail:`État reçu : ${rawState||"non renseigné"}`};
}

function rc18PolishRenderedDashboard(root){
  if(!root)return;
  const apply=()=>{
    root.querySelectorAll(".device-analysis-status").forEach(box=>{
      const text=(box.textContent||"").toLowerCase();
      let raw=box.dataset.rawState||"";
      const known=["error_retry","waiting","connecting","scanning","measuring","analyzing","syncing","completed","success","unavailable","disconnected"];
      if(!raw)raw=known.find(k=>text.includes(k))||"";
      if(!raw){
        if(text.includes("analyse terminée"))raw="completed";
        else if(text.includes("appareil disponible"))raw="waiting";
        else if(text.includes("vérifiez la connexion"))raw="error_retry";
      }
      const meta=rc18AnalysisState(raw||"unknown");
      box.dataset.analysisTone=meta.tone;
      [...box.querySelectorAll("*")].filter(el=>!el.children.length).forEach(el=>{
        const v=(el.textContent||"").trim().toLowerCase();
        if(known.includes(v))el.textContent=meta.label;
      });
      box.title=`${meta.label} — ${meta.detail}`;
      box.setAttribute("aria-label",`${meta.label}. ${meta.detail}`);
    });
    root.querySelectorAll(".v3-summary-card").forEach(card=>{
      if(card.querySelector(".rc18-summary-caption"))return;
      const caption=document.createElement("div");
      caption.className="rc18-summary-caption";
      caption.textContent=card.textContent.includes("pH")?"Équilibre à surveiller":card.textContent.includes("ORP")?"Désinfection consolidée":"État général de la piscine";
      card.appendChild(caption);
    });
    root.querySelectorAll(".v3-score-card").forEach(card=>{
      if(card.querySelector(".rc18-score-badge"))return;
      const badge=document.createElement("div");
      badge.className="rc18-score-badge";
      const pct=Number((card.textContent.match(/(\d+)%/)||[,"0"])[1]);
      badge.textContent=pct>=85?"Excellent":pct>=65?"Bon niveau":"À améliorer";
      card.appendChild(badge);
    });
    root.querySelectorAll(".preferences-card,.v3-preferences,.preferences").forEach(card=>card.classList.add("rc18-preferences"));
  };
  apply();
  if(!root.__rc18Observer){
    root.__rc18Observer=new MutationObserver(apply);
    root.__rc18Observer.observe(root,{childList:true,subtree:true,characterData:true});
  }
}

class PoolDashboardCard extends HTMLElement{
  rc30ReadLastValidConfig(){
    try{
      const cached=JSON.parse(localStorage.getItem("ha_pool_dashboard_last_valid_config")||"null");
      return cached?.devices?.length?cached:null;
    }catch(_error){return null}
  }
  rc30RememberValidConfig(config){
    try{localStorage.setItem("ha_pool_dashboard_last_valid_config",JSON.stringify(config))}catch(_error){}
  }
  rc30RenderConfigurationLoading(){
    if(!this.shadowRoot)this.attachShadow({mode:"open"});
    this.shadowRoot.innerHTML=`<style>:host{display:block;min-height:180px}.rc30-loading{box-sizing:border-box;display:grid;place-items:center;min-height:180px;padding:24px;border-radius:18px;background:linear-gradient(135deg,#0c3a67,#12658d);color:#eefaff;font-family:Arial,sans-serif;text-align:center}.rc30-loading b{display:block;margin-bottom:8px;font-size:1rem}.rc30-loading span{font-size:.78rem;opacity:.8}</style><div class="rc30-loading"><div><b>Chargement du dashboard piscine…</b><span>Home Assistant prépare la configuration des appareils.</span></div></div>`;
  }
  setConfig(config){
    const validConfig=config?.devices?.length?config:this.rc30ReadLastValidConfig();
    if(!validConfig){
      this._pendingConfig=config||null;
      this.rc30RenderConfigurationLoading();
      return;
    }
    this._pendingConfig=null;
    this.rc30RememberValidConfig(validConfig);
    this.config={title:"Ma Piscine",visual_theme:"ocean",...validConfig};
    if(!this._preferences)this._preferences=readPoolPreferences();
    if(!this._treatmentProfile)this._treatmentProfile=readTreatmentProfile(this.config.treatment||{});
    if(!this._treatmentHistory)this._treatmentHistory=readTreatmentHistory();
    if(!this._treatmentDetailsState)this._treatmentDetailsState=readTreatmentDetailsState();
    if(!this._rc27Control)this._rc27Control=readRc27Control();
    if(!this._rc271Sections)this._rc271Sections=readRc271Sections();
    if(!this._analysisProgress)this._analysisProgress={};
    if(!this._analysisTimeouts)this._analysisTimeouts={};
    this.render();
  }
  rc30RelevantEntityIds(hass){
    const ids=new Set(),states=hass?.states||{};
    const add=value=>{
      if(typeof value==="string"&&value.includes(".")&&Object.prototype.hasOwnProperty.call(states,value))ids.add(value);
      else if(Array.isArray(value))value.forEach(add);
      else if(value&&typeof value==="object")Object.values(value).forEach(add);
    };
    add(this.config);add(this._rc27Control);
    Object.entries(states).forEach(([entityId,state])=>{
      if(!entityId.startsWith("sensor."))return;
      const haystack=rc26Normalize(`${entityId} ${state?.attributes?.friendly_name||""}`);
      if(haystack.includes("vigilance")||haystack.includes("alerte meteo")||haystack.includes("weather alert"))ids.add(entityId);
    });
    return[...ids].sort();
  }
  rc30HassRenderSignature(hass){
    const states=hass?.states||{},parts=[`count:${Object.keys(states).length}`];
    for(const entityId of this.rc30RelevantEntityIds(hass)){
      const state=states[entityId];
      parts.push(`${entityId}|${state?.state??""}|${JSON.stringify(state?.attributes||{})}`);
    }
    const notify=Object.keys(hass?.services?.notify||{}).sort().join(",");
    parts.push(`notify:${notify}`);
    return parts.join("\n");
  }
  rc30ConfigurationInteractionActive(){
    const settings=this.shadowRoot?.querySelector?.(".rc27-settings");
    const active=this.shadowRoot?.activeElement;
    return Boolean(this._rc27ConfigOpen||this._rc30PacGaugeDragging||Number.isFinite(this._rc30PacDraftSetpoint)||settings?.open||this.shadowRoot?.querySelector?.(".rc30-entity-picker.is-open,.rc30-choice-picker.is-open")||active?.matches?.("input,select,textarea"));
  }
  rc30RequestBackgroundRender(){
    if(this.rc30ConfigurationInteractionActive()){this._rc30PendingBackgroundRender=true;return}
    this._rc30PendingBackgroundRender=false;
    this.render();
  }
  rc30FlushBackgroundRender(){
    if(!this._rc30PendingBackgroundRender||this.rc30ConfigurationInteractionActive())return;
    this._rc30PendingBackgroundRender=false;
    this.render();
  }
  set hass(hass){
    const first=!this._hass;
    this._hass=hass;
    this.reconcileAnalysisProgress();
    this.rc30PacReconcileModeEnAttente();
    const signature=this.rc30HassRenderSignature(hass);
    const changed=first||signature!==this._rc30LastHassSignature;
    this._rc30LastHassSignature=signature;
    if(changed)this.rc30RequestBackgroundRender();
    if(first){this.scheduleHistoryLoad();this.loadRc27ControlState(true);this.syncTreatmentHistoryFromBackend();this.scheduleFiltrationLoad()}
  }
  getCardSize(){return 12}
  getGridOptions(){return{columns:12,rows:12,min_columns:6,min_rows:8}}

  connectedCallback(){
    this._connected=true;
    this.scheduleHistoryLoad();
    this.startRc27Sync();
    this.syncTreatmentHistoryFromBackend();
    this.scheduleFiltrationLoad();
    this._rc271ViewportMode=this.rc271ViewportMode();
    if(!this._rc271ResizeHandler&&window.addEventListener){
      this._rc271ResizeHandler=()=>{const mode=this.rc271ViewportMode();if(mode!==this._rc271ViewportMode){this._rc271ViewportMode=mode;this.render()}};
      window.addEventListener("resize",this._rc271ResizeHandler,{passive:true});
    }
  }

  disconnectedCallback(){
    this._connected=false;
    if(this._rc27SyncTimer){clearInterval(this._rc27SyncTimer);this._rc27SyncTimer=null}
    if(this._historyTimer)clearTimeout(this._historyTimer);
    if(this._filtrationTimer){clearTimeout(this._filtrationTimer);this._filtrationTimer=null}
    if(this._rc30PacPendingModeTimer){clearTimeout(this._rc30PacPendingModeTimer);this._rc30PacPendingModeTimer=null}
    Object.values(this._analysisTimeouts||{}).forEach(timer=>clearTimeout(timer));
    this._analysisTimeouts={};
    if(this._rc271ResizeHandler&&window.removeEventListener){window.removeEventListener("resize",this._rc271ResizeHandler);this._rc271ResizeHandler=null}
  }

  scheduleHistoryLoad(){
    if(!this._hass||!this.config||this._historyLoading)return;
    if(this._historyTimer)clearTimeout(this._historyTimer);
    this._historyTimer=setTimeout(()=>this.loadHistory(),250);
  }

  normalizeDeviceKey(raw,fallback){
    return String(raw||fallback||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"")||String(fallback||"device");
  }
  deviceKey(device,index=this.config?.devices?.indexOf(device)??-1){
    const explicit=device?.key||device?.device_id||device?.id;
    if(explicit)return this.normalizeDeviceKey(explicit,`device_${index}`);
    const primaryEntity=Object.values(device?.entities||{}).find(value=>typeof value==="string"&&value.includes("."));
    const raw=primaryEntity||`${device?.brand||"device"}_${device?.name||"analyseur"}_${index}`;
    return this.normalizeDeviceKey(raw,`device_${index}`);
  }
  legacyDeviceKey(device,index=this.config?.devices?.indexOf(device)??-1){
    return this.normalizeDeviceKey(device?.brand||device?.name||`device_${index}`,`device_${index}`);
  }
  deviceEnabledEntity(device){
    const helper=device?.enabled_entity;
    if(!helper)return"";
    const occurrences=(this.config?.devices||[]).filter(candidate=>candidate?.enabled_entity===helper).length;
    return occurrences===1?helper:"";
  }
  deviceEnabled(device,index=this.config?.devices?.indexOf(device)??-1){
    const helper=this.deviceEnabledEntity(device);
    if(helper&&this._hass?.states?.[helper])return["on","true","1","enabled"].includes(String(this._hass.states[helper].state).toLowerCase());
    const sources=this._rc27Control?.measurement_sources||{},key=this.deviceKey(device,index);
    if(Object.prototype.hasOwnProperty.call(sources,key))return sources[key]!==false;
    const legacyKey=this.legacyDeviceKey(device,index);
    return !Object.prototype.hasOwnProperty.call(sources,legacyKey)||sources[legacyKey]!==false;
  }
  deviceFresh(device,maxAgeHours=24){
    const last=this.deviceReading(device,"last_analysis");
    if(!last.available)return true;
    const timestamp=new Date(last.value).getTime();
    return !Number.isFinite(timestamp)||Date.now()-timestamp<=maxAgeHours*3600000;
  }
  activeDevices(){return(this.config?.devices||[]).filter((device,index)=>this.deviceEnabled(device,index))}
  usableDevices(metric){return(this.config?.devices||[]).filter((device,index)=>this.deviceEnabled(device,index)&&this.deviceFresh(device)&&this.deviceReading(device,metric).available)}
  measurementSourceLabel(){
    const enabled=this.activeDevices();
    if(!enabled.length)return"Mesures suspendues · aucun appareil actif";
    const usable=enabled.filter(device=>this.deviceFresh(device)&&["ph","orp","temperature"].some(metric=>this.deviceReading(device,metric).available));
    if(!usable.length)return"Aucune mesure récente exploitable";
    if(usable.length===1)return`Mesures consolidées : ${usable[0].name} uniquement`;
    return`Mesures consolidées : moyenne ${usable.map(device=>device.name).join(" + ")}`;
  }
  async toggleMeasurementDevice(index){
    const device=this.config?.devices?.[index];
    if(!device||!this._hass)return;
    const enabled=this.deviceEnabled(device,index),next=!enabled;
    const helper=this.deviceEnabledEntity(device);
    if(helper&&this._hass.states?.[helper]){
      const domain=helper.split(".")[0];
      try{await this._hass.callService(domain,next?"turn_on":"turn_off",{entity_id:helper})}catch(error){console.error("HA Pool Dashboard: impossible de modifier le helper de mesure",error)}
      return;
    }
    const key=this.deviceKey(device,index);
    const measurement_sources={...(this._rc27Control?.measurement_sources||{}),[key]:next};
    await this.saveRc27Control(rc27Merge(this._rc27Control,{measurement_sources}));
  }
  scheduleFiltrationLoad(){
    if(!this._hass?.callApi||!this._connected&&this._filtrationLastLoad)return;
    if(this._filtrationTimer)clearTimeout(this._filtrationTimer);
    this._filtrationTimer=setTimeout(()=>this.loadFiltrationHistory(),350);
  }
  async loadFiltrationHistory(force=false){
    const entityId=this._rc27Control?.pump?.entity_id;
    if(!entityId||!this._hass?.callApi){this._filtrationStats={available:false,hours:null,entityId:entityId||"",source:"non configuré"};return}
    if(this._filtrationLoading)return;
    if(!force&&this._filtrationLastLoad&&Date.now()-this._filtrationLastLoad<300000)return;
    this._filtrationLoading=true;
    try{
      const startDate=new Date();startDate.setHours(0,0,0,0);
      const endDate=new Date();
      const path=`history/period/${encodeURIComponent(startDate.toISOString())}?filter_entity_id=${encodeURIComponent(entityId)}&end_time=${encodeURIComponent(endDate.toISOString())}&minimal_response&no_attributes`;
      const payload=await this._hass.callApi("GET",path);
      const series=(Array.isArray(payload)&&Array.isArray(payload[0])?payload[0]:[]).map(item=>({state:String(item.state||"").toLowerCase(),time:new Date(item.last_changed||item.last_updated||startDate).getTime()})).filter(item=>Number.isFinite(item.time)).sort((a,b)=>a.time-b.time);
      if(!series.length)throw new Error("Historique de filtration vide");
      const on=state=>["on","true","1","running","active","open"].includes(String(state).toLowerCase());
      let currentState=series[0]?.state||String(this._hass.states?.[entityId]?.state||"off").toLowerCase();
      let cursor=startDate.getTime(),milliseconds=0;
      for(const event of series.slice(1)){
        const timestamp=Math.max(cursor,Math.min(endDate.getTime(),event.time));
        if(on(currentState))milliseconds+=timestamp-cursor;
        currentState=event.state;cursor=timestamp;
      }
      if(on(currentState))milliseconds+=Math.max(0,endDate.getTime()-cursor);
      this._filtrationStats={available:true,hours:milliseconds/3600000,entityId,source:"historique réel",running:on(this._hass.states?.[entityId]?.state||currentState),updatedAt:endDate.toISOString()};
      this._filtrationLastLoad=Date.now();
    }catch(error){
      this._filtrationStats={available:false,hours:null,entityId,source:"historique indisponible"};
      console.warn("HA Pool Dashboard: durée de filtration indisponible",error);
    }finally{
      this._filtrationLoading=false;
      if(this._connected)this.rc30RequestBackgroundRender();
      if(this._connected){if(this._filtrationTimer)clearTimeout(this._filtrationTimer);this._filtrationTimer=setTimeout(()=>this.loadFiltrationHistory(true),300000)}
    }
  }

  historyEntities(){
    const result={};
    for(const metric of ["temperature","ph","orp"]){
      result[metric]=this.activeDevices()
        .map(device=>device.entities?.[metric])
        .filter(Boolean);
    }
    return result;
  }

  async loadHistory(){
    if(!this._hass||!this.config||this._historyLoading)return;
    const groups=this.historyEntities();
    const ids=[...new Set(Object.values(groups).flat())];
    if(!ids.length)return;

    this._historyLoading=true;
    try{
      const start=new Date(Date.now()-24*60*60*1000).toISOString();
      const path=`history/period/${encodeURIComponent(start)}?filter_entity_id=${encodeURIComponent(ids.join(","))}&minimal_response&no_attributes`;
      const payload=await this._hass.callApi("GET",path);
      const byEntity={};
      for(const series of Array.isArray(payload)?payload:[]){
        const entityId=series?.[0]?.entity_id;
        if(entityId)byEntity[entityId]=series;
      }

      const history={};
      for(const [metric,entityIds] of Object.entries(groups)){
        const perEntity={};
        for(const entityId of entityIds){
          const points=[];
          for(const state of byEntity[entityId]||[]){
            const value=Number.parseFloat(state.state);
            const timestamp=new Date(state.last_changed||state.last_updated).getTime();
            if(Number.isFinite(value)&&Number.isFinite(timestamp))points.push({timestamp,value});
          }
          perEntity[entityId]=this.bucketSeries(points);
        }
        history[metric]=this.mergeDeviceHistory(metric,perEntity);
      }
      this._history=history;
    }catch(error){
      console.warn("HA Pool Dashboard: historique indisponible",error);
      this._historyError=true;
    }finally{
      this._historyLoading=false;
      if(this._connected)this.rc30RequestBackgroundRender();
    }
  }

  bucketSeries(points){
    return regrouperHistoriqueHoraire(points);
  }

  mergeDeviceHistory(metric,perEntity){
    return fusionnerHistoriqueAppareils({
      metric,
      perEntity,
      obtenirAppareilsActifs:()=>this.activeDevices(),
    });
  }

  idealRange(metric){
    return plageIdealeHistorique(metric);
  }

  historySourceLabel(points){
    return libelleSourceHistorique(points);
  }

  sparkline(metric,label,unit){
    return rendreGraphiqueHistoriqueCapteur({
      metric,
      label,
      unit,
      sourcePoints:this._history?.[metric]||[],
      temperatureUnit:this._preferences?.temperature_unit,
      historyLoading:this._historyLoading,
      historyError:this._historyError,
    });
  }

  deviceReading(device,metric){return readEntity(this,device?.entities?.[metric])}
  displayTemperature(reading){
    if(!reading||!Number.isFinite(reading.number))return reading||{value:"—",number:null,unit:""};
    if(this._preferences?.temperature_unit!=="F")return reading;
    const number=reading.number*9/5+32;
    return{...reading,number,value:number.toFixed(2).replace(/\.00$/,""),unit:"°F"};
  }
  displayTemperatureNumber(number){
    return this._preferences?.temperature_unit==="F"&&Number.isFinite(number)?number*9/5+32:number;
  }
  analysisEntity(device){
    const entities=device?.entities||{};
    const aliases=["start_analysis","analysis","start_measurement","measure","measurement","refresh","force_update","update"];
    for(const key of aliases){
      const id=entities[key];
      if(typeof id==="string"&&id.includes("."))return id;
    }
    for(const [key,id] of Object.entries(entities)){
      if(typeof id==="string"&&id.includes(".")&&/(analys|measure|refresh|update)/i.test(`${key} ${id}`))return id;
    }
    return null;
  }
  analysisStatusEntity(device){
    const entities=device?.entities||{};
    const aliases=["analysis_status","measurement_status","measure_status","bluetooth_status","connection_status","sync_status","status","last_analysis_status"];
    for(const key of aliases){const id=entities[key];if(typeof id==="string"&&id.includes("."))return id}
    for(const [key,id] of Object.entries(entities)){
      if(typeof id==="string"&&id.includes(".")&&/(analysis|measure|bluetooth|connection|sync).*(status|state)|(status|state).*(analysis|measure|bluetooth|connection|sync)/i.test(`${key} ${id}`))return id;
    }
    return null;
  }
  analysisLastValue(device){
    const reading=this.deviceReading(device,"last_analysis");
    return reading.available?String(reading.value):"";
  }
  analysisBusy(index){
    return["requested","connecting","analyzing","sync"].includes(this._analysisProgress?.[index]?.phase);
  }
  clearAnalysisTimeout(index){
    const timer=this._analysisTimeouts?.[index];
    if(timer)clearTimeout(timer);
    if(this._analysisTimeouts)delete this._analysisTimeouts[index];
  }
  reconcileAnalysisProgress(){
    if(!this._hass||!this.config?.devices?.length)return;
    for(const [rawIndex,progress] of Object.entries(this._analysisProgress||{})){
      const index=Number(rawIndex),device=this.config.devices[index];
      if(!device||!["requested","connecting","analyzing","sync"].includes(progress?.phase))continue;
      const currentLast=this.analysisLastValue(device);
      const statusEntity=this.analysisStatusEntity(device);
      const rawStatus=String(statusEntity?readEntity(this,statusEntity).value:"").toLowerCase();
      const statusChanged=Boolean(rawStatus&&rawStatus!==progress.baselineAnalysisStatus);
      const activeTransition=statusChanged&&/request|demand|start|lanc|queued|attente|connect|bluetooth|pair|scan|recherche|analy|mesure|reading|sample|sync|synchron|upload/.test(rawStatus);
      const observedStatusChange=Boolean(progress.observedStatusChange||activeTransition);
      if(activeTransition&&!progress.observedStatusChange)this._analysisProgress={...this._analysisProgress,[index]:{...progress,observedStatusChange:true}};
      const lastChanged=progress.baselineLastAnalysis&&currentLast&&currentLast!==progress.baselineLastAnalysis;
      const completed=lastChanged||((statusChanged||observedStatusChange)&&/termin|complete|done|success|succès|updated|à jour/.test(rawStatus));
      const failed=(statusChanged||observedStatusChange)&&/error|erreur|failed|échec|timeout|offline/.test(rawStatus);
      if(completed){
        this.clearAnalysisTimeout(index);
        this._analysisProgress={...this._analysisProgress,[index]:{...progress,phase:"done",label:"Analyse terminée",detail:"Dernières mesures disponibles",progress:100,updated:Date.now()}};
      }else if(failed){
        this.clearAnalysisTimeout(index);
        this._analysisProgress={...this._analysisProgress,[index]:{...progress,phase:"error",label:"Échec de l’analyse",detail:"Vérifiez la connexion Bluetooth et l’intégration",progress:100,updated:Date.now()}};
      }
    }
  }
  normalizeAnalysisStatus(reading,index){
    const local=this._analysisProgress?.[index];
    const terminalLocal=local&&["error","done"].includes(local.phase)&&Date.now()-(local.updated||0)<10*60*1000;
    const busyLocal=local&&["requested","connecting","analyzing","sync"].includes(local.phase);
    const value=String(reading?.value??"").trim();
    const normalizedValue=value.toLowerCase();
    const unchangedStatus=busyLocal&&normalizedValue===String(local.baselineAnalysisStatus||"").toLowerCase();
    const source=terminalLocal?local.label:unchangedStatus?local.label:(value&&!['unknown','unavailable','none','null','—'].includes(normalizedValue)?value:(local?.label||"Prêt"));
    const state=source.toLowerCase();
    let phase="idle",label=source,progress=0;
    if(terminalLocal){phase=local.phase;label=local.label;progress=local.progress??100}
    else if(/error|erreur|failed|échec|timeout|offline/.test(state)){phase="error";progress=100}
    else if(/termin|complete|done|success|succès|updated|à jour/.test(state)){phase="done";label="Analyse terminée";progress=100}
    else if(/sync|synchron|upload|cloud/.test(state)){phase="sync";label="Synchronisation des données";progress=82}
    else if(/analy|mesure|measuring|reading|sample|test/.test(state)){phase="analyzing";label="Analyse de l’eau en cours";progress=58}
    else if(/connect|bluetooth|pair|scan|recherche/.test(state)){phase="connecting";label="Connexion Bluetooth";progress=28}
    else if(/wait|waiting|idle|ready|prêt|disponible/.test(state)){phase="idle";label="En attente";progress=0}
    else if(/request|demand|start|lanc|queued|attente/.test(state)){phase="requested";label="Demande d’analyse envoyée";progress=12}
    else if(local){phase=local.phase;label=local.label;progress=local.progress}
    const detail=local?.detail&&["error","done"].includes(phase)?local.detail:
      phase==="requested"?"Commande transmise à Home Assistant":
      phase==="connecting"?"Recherche et ouverture de la liaison":
      phase==="analyzing"?"Lecture des sondes pH, ORP et température":
      phase==="sync"?"Récupération des nouvelles valeurs":
      phase==="done"?"Dernières mesures disponibles":
      phase==="error"?"Vérifiez la connexion et l’intégration":
      "Appareil disponible";
    return{phase,label,progress,detail};
  }
  scheduleAnalysisProgress(index,requestId){
    const advance=(delay,phase,label,progress)=>setTimeout(()=>{
      const current=this._analysisProgress?.[index];
      if(!current||current.requestId!==requestId||["error","done"].includes(current.phase))return;
      this._analysisProgress={...this._analysisProgress,[index]:{...current,phase,label,progress,updated:Date.now()}};
      this.render();
    },delay);
    advance(1400,"connecting","Connexion Bluetooth",28);
    advance(4200,"analyzing","Analyse de l’eau en cours",58);
    advance(8500,"sync","Synchronisation des données",82);
    this.clearAnalysisTimeout(index);
    this._analysisTimeouts[index]=setTimeout(()=>{
      const current=this._analysisProgress?.[index];
      if(!current||current.requestId!==requestId||["error","done"].includes(current.phase))return;
      this._analysisProgress={...this._analysisProgress,[index]:{...current,phase:"error",label:"Analyse non terminée",detail:"Aucune nouvelle mesure reçue après 90 secondes. Vérifiez le Bluetooth de l’appareil.",progress:100,updated:Date.now()}};
      this.clearAnalysisTimeout(index);
      this.render();
    },90000);
  }
  primary(){return this.activeDevices().find(d=>d.brand==="blue_connect")||this.activeDevices()[0]||this.config.devices[0]}

  aggregate(metric){
    const candidates=(this.config?.devices||[]).map((device,index)=>({device,index,reading:this.deviceReading(device,metric)})).filter(item=>this.deviceEnabled(item.device,item.index));
    const readings=(metric==="last_analysis"?candidates:candidates.filter(item=>this.deviceFresh(item.device))).map(item=>item.reading).filter(reading=>reading.available);

    if(!readings.length)return{value:"—",number:null,unit:"",available:false,count:0};
    if(metric==="last_analysis"){
      const dated=readings.map(reading=>({reading,date:new Date(reading.value)})).filter(item=>!Number.isNaN(item.date.getTime())).sort((a,b)=>b.date-a.date);
      const selected=dated[0]?.reading||readings[0];
      return{...selected,count:readings.length};
    }
    const numeric=readings.filter(reading=>Number.isFinite(reading.number));
    if(!numeric.length)return{...readings[0],count:readings.length};
    const average=numeric.reduce((sum,reading)=>sum+reading.number,0)/numeric.length;
    const decimals=metric==="temperature"?2:metric==="ph"?2:0;
    return{value:average.toFixed(decimals).replace(/\.00$/,"") ,number:average,unit:numeric[0].unit,available:true,count:numeric.length};
  }

  aggregateHealth(){
    const temperature=this.aggregate("temperature"),ph=this.aggregate("ph"),orp=this.aggregate("orp");
    const active=this.activeDevices();
    const fresh=active.filter(device=>this.deviceFresh(device));
    const usableCount=fresh.filter(device=>["ph","orp","temperature"].some(metric=>this.deviceReading(device,metric).available)).length;
    const completeCount=fresh.filter(device=>["ph","orp","temperature"].every(metric=>this.deviceReading(device,metric).available)).length;
    const activeCount=active.length;
    return{result:health(ph.number,orp.number,usableCount),temperature,ph,orp,activeCount,usableCount,completeCount,freshCount:fresh.length,sourceLabel:this.measurementSourceLabel()};
  }
  range(m){return{ph:[6.6,8.2],orp:[450,900],conductivity:[0,2000],salinity:[0,10],free_chlorine:[0,5],battery:[0,100],bluetooth_signal:[-100,-35]}[m]||[0,100]}
  pct(m,n){if(n===null||!Number.isFinite(n))return 0;const[a,b]=this.range(m);return 100*Math.max(0,Math.min(1,(n-a)/(b-a)))}
  status(m,n){if(n===null)return"neutral";if(m==="ph"){const assessment=rc28PhAssessment(n);return assessment.tone==="good"?"good":assessment.tone==="bad"?"bad":"warn"}if(m==="orp")return n>=650&&n<=800?"good":n>=550&&n<=850?"warn":"bad";if(m==="battery")return n>=50?"good":n>=20?"warn":"bad";return"neutral"}
  gauge(d,m,l){const r=this.deviceReading(d,m);return`<pool-gauge data-p="${encodeURIComponent(JSON.stringify({label:l,value:r.value,unit:r.unit,percent:this.pct(m,r.number),status:this.status(m,r.number)}))}"></pool-gauge>`}
  specific(d){if(d.entities.conductivity)return["conductivity","Conductivité"];if(d.entities.free_chlorine)return["free_chlorine","Chlore libre"];if(d.entities.salinity)return["salinity","Salinité"];return[null,null]}
  async analyze(device,index=this.config.devices.indexOf(device)){
    const id=this.analysisEntity(device);
    if(!id||!this._hass||this.analysisBusy(index))return false;
    const requestId=Date.now()+Math.random();
    const baselineLastAnalysis=this.analysisLastValue(device);
    const statusEntity=this.analysisStatusEntity(device);
    const baselineAnalysisStatus=String(statusEntity?readEntity(this,statusEntity).value:"").toLowerCase();
    this._analysisProgress={...(this._analysisProgress||{}),[index]:{phase:"requested",label:"Demande d’analyse envoyée",detail:"Commande transmise à Home Assistant",progress:12,updated:Date.now(),requestId,baselineLastAnalysis,baselineAnalysisStatus}};
    this.render();
    this.scheduleAnalysisProgress(index,requestId);
    const domain=id.split(".")[0];
    const service=domain==="button"||domain==="input_button"?"press":
      domain==="sensor"||domain==="binary_sensor"?"update_entity":"turn_on";
    const serviceDomain=service==="update_entity"?"homeassistant":domain;
    try{
      await this._hass.callService(serviceDomain,service,{entity_id:id});
      return true;
    }catch(error){
      this.clearAnalysisTimeout(index);
      const current=this._analysisProgress?.[index]||{};
      this._analysisProgress={...this._analysisProgress,[index]:{...current,phase:"error",label:"Échec du lancement",detail:"La commande Home Assistant a échoué. Vérifiez l’entité d’analyse.",progress:100,updated:Date.now()}};
      this.render();
      console.error(`HA Pool Dashboard: analyse impossible pour ${device?.name||id}`,error);
      return false;
    }
  }
  async analyzeAll(){
    const devices=this.config.devices.map((device,index)=>({device,index})).filter(({device,index})=>this.deviceEnabled(device,index)&&this.analysisEntity(device));
    await Promise.all(devices.map(({device,index})=>this.analyze(device,index)));
  }

  weatherReading(metric){return readEntity(this,this.config.weather?.[metric])}
  currentWeather(){
    const id=this.config.weather?.weather;
    const obj=id&&this._hass?this._hass.states[id]:null;
    const attrs=obj?.attributes||{}, explicit=this.weatherReading("air_temperature");
    const rawTemperature=explicit.available?explicit.number:Number.parseFloat(attrs.temperature);
    const useF=this._preferences?.temperature_unit==="F";
    const converted=Number.isFinite(rawTemperature)&&useF?rawTemperature*9/5+32:rawTemperature;
    return{available:Boolean(obj||explicit.available),condition:obj?.state||"unknown",temperature:Number.isFinite(converted)?converted.toFixed(1).replace(/\.0$/,""):"—",temperatureUnit:useF?"°F":(explicit.available?explicit.unit:(attrs.temperature_unit||"°C")),humidity:this.weatherReading("humidity").available?this.weatherReading("humidity").value:(attrs.humidity??"—"),wind:this.weatherReading("wind_speed").available?this.weatherReading("wind_speed").value:(attrs.wind_speed??"—"),windUnit:this.weatherReading("wind_speed").available?this.weatherReading("wind_speed").unit:(attrs.wind_speed_unit||"km/h"),uv:this.weatherReading("uv_index").value};
  }
  weatherAlertEntityIds(){
    const configured=this.config.weather||{};
    const candidates=[];
    const append=value=>{
      if(Array.isArray(value))value.forEach(append);
      else if(typeof value==="string"&&value.includes("."))candidates.push(value);
    };
    append(configured.weather_alerts);
    append(configured.weather_alert);
    Object.entries(configured).filter(([key])=>key.startsWith("weather_alert_")).forEach(([,value])=>append(value));
    if(this._hass?.states){
      Object.keys(this._hass.states).forEach(entityId=>{
        if(!entityId.startsWith("sensor."))return;
        const haystack=rc26Normalize(`${entityId} ${this._hass.states[entityId]?.attributes?.friendly_name||""}`);
        if(haystack.includes("vigilance")||haystack.includes("alerte meteo")||haystack.includes("weather alert"))candidates.push(entityId);
      });
    }
    return[...new Set(candidates)];
  }
  weatherAlertOptions(){
    return this.weatherAlertEntityIds().map(entityId=>({
      entityId,
      label:this._hass?.states?.[entityId]?.attributes?.friendly_name||entityId
    })).sort((a,b)=>a.label.localeCompare(b.label,"fr"));
  }
  currentWeatherAlert(){
    const entityIds=this.weatherAlertEntityIds();
    const selected=this._preferences?.weather_alert_entity;
    const entityId=selected&&selected!=="auto"&&entityIds.includes(selected)?selected:entityIds[0];
    if(!entityId)return{configured:false,available:false,active:false,alerts:[],severity:0,levelKey:"green",levelLabel:"Verte",department:"Non configuré",entityId:null};
    const stateObject=this._hass?.states?.[entityId];
    if(!stateObject||["unknown","unavailable"].includes(String(stateObject.state).toLowerCase()))return{configured:true,available:false,active:false,alerts:[],severity:0,levelKey:"green",levelLabel:"Verte",department:stateObject?.attributes?.friendly_name||entityId,entityId};
    const attrs=stateObject.attributes||{};
    const alerts=[];
    for(const [key,value] of Object.entries(attrs)){
      const type=rc26AlertType(`${key} ${typeof value==="string"?value:""}`);
      if(!type)continue;
      const severity=Math.max(rc26AlertSeverity(value),rc26AlertSeverity(key));
      if(severity>0){const alertLevel=RC26_ALERT_LEVELS[severity];alerts.push({...type,severity,levelKey:alertLevel.key,levelLabel:alertLevel.label})}
    }
    const rawStateSeverity=rc26AlertSeverity(stateObject.state);
    const severity=Math.max(rawStateSeverity,...alerts.map(alert=>alert.severity),0);
    const level=RC26_ALERT_LEVELS[severity]||RC26_ALERT_LEVELS[0];
    if(severity>0&&!alerts.length)alerts.push({key:"generic",label:"Vigilance météo",icon:"⚠️",severity,levelKey:level.key,levelLabel:level.label});
    const uniqueAlerts=[...new Map(alerts.map(alert=>[alert.key,alert])).values()].sort((a,b)=>b.severity-a.severity);
    const department=attrs.department||attrs.departement||attrs.area||attrs.zone||attrs.friendly_name||this.config.weather?.alert_department||entityId;
    const updatedAt=stateObject.last_updated||stateObject.last_changed||"";
    return{configured:true,available:true,active:severity>0,alerts:uniqueAlerts,severity,levelKey:level.key,levelLabel:level.label,department,entityId,updatedAt,source:"Météo-France",stale:false};
  }
  deviceMeasurementTimestamp(device){
    const last=this.deviceReading(device,"last_analysis");
    if(last.available){const timestamp=new Date(last.value).getTime();if(Number.isFinite(timestamp))return timestamp}
    const timestamps=["ph","orp","temperature"].map(metric=>this.deviceReading(device,metric).obj).filter(Boolean).map(obj=>new Date(obj.last_updated||obj.last_changed||0).getTime()).filter(Number.isFinite);
    return timestamps.length?Math.max(...timestamps):null;
  }
  comparisonRows(){
    const devices=this.config.devices.filter((device,index)=>this.deviceEnabled(device,index)&&this.deviceFresh(device));
    if(devices.length<2){
      this._comparisonMeta={state:"single",activeName:devices[0]?.name||this.activeDevices()[0]?.name||"Aucune source",detail:devices.length?`${devices[0].name} est actuellement la seule source active.`:"Aucune paire de mesures active n’est disponible."};
      return[];
    }
    const a=devices[0],b=devices[1],aTime=this.deviceMeasurementTimestamp(a),bTime=this.deviceMeasurementTimestamp(b);
    const timeGapMinutes=aTime!==null&&bTime!==null?Math.abs(aTime-bTime)/60000:null;
    if(timeGapMinutes!==null&&timeGapMinutes>60){
      this._comparisonMeta={state:"time_gap",a,b,timeGapMinutes,detail:`Les relevés sont espacés de ${Math.round(timeGapMinutes)} minutes.`};
      return[];
    }
    const rows=[["Température","temperature","°C",1.5],["pH","ph","",.20],["ORP","orp","mV",200]].map(([label,metric,unit,limit])=>{
      const ar=this.deviceReading(a,metric),br=this.deviceReading(b,metric);
      const delta=ar.number!==null&&br.number!==null?Math.abs(ar.number-br.number):null;
      let good=delta!==null&&delta<=limit,severity=good?"coherent":"watch",statusLabel=good?"Cohérent":"À surveiller",confidencePenalty=good?0:12;
      if(metric==="orp"&&delta!==null){
        if(delta<=100){good=true;severity="coherent";statusLabel="Cohérent";confidencePenalty=0}
        else if(delta<=200){good=true;severity="acceptable";statusLabel="Compatible avec les emplacements";confidencePenalty=0}
        else if(delta<=300){good=false;severity="watch";statusLabel="Écart notable";confidencePenalty=8}
        else{good=false;severity="critical";statusLabel="Sondes à vérifier";confidencePenalty=20}
      }
      return{label,metric,unit,a:ar,b:br,delta,limit,good,severity,statusLabel,confidencePenalty};
    });
    this._comparisonMeta={state:"ready",a,b,timeGapMinutes,rows,detail:"Tolérance ORP adaptée à l’installation : jusqu’à 200 mV sans pénalité."};
    return rows;
  }
  recentAnalyses(){
    return this.activeDevices().map(device=>({device,date:this.deviceReading(device,"last_analysis").value})).filter(item=>item.date&&item.date!=="—").map(item=>({...item,parsed:new Date(item.date)})).filter(item=>!Number.isNaN(item.parsed.getTime())).sort((a,b)=>b.parsed-a.parsed).slice(0,5);
  }

  // Compatibilité tests historiques: smartStatus(aggregated,comparisons)
  smartStatus(aggregated,comparisons,score){
    if(aggregated.usableCount===0)return{level:"suspended",label:"Mesures suspendues",message:aggregated.activeCount?"Aucune donnée récente exploitable : le score et les recommandations sont suspendus.":"Activez au moins un appareil pour reprendre le score et les recommandations."};
    if(score>=95)return{level:"excellent",label:"Eau parfaite",message:"Tous les indicateurs sont excellents."};
    if(score>=85)return{level:"good",label:"Eau équilibrée",message:"Aucune action urgente n’est nécessaire. La qualité générale de l’eau est très bonne."};
    if(score>=70)return{level:"watch",label:"À surveiller",message:"La qualité reste correcte, avec quelques paramètres à suivre."};
    if(score>=50)return{level:"warning",label:"Intervention conseillée",message:"Une correction ou une nouvelle analyse est recommandée."};
    return{level:"danger",label:"Action urgente",message:"Plusieurs paramètres nécessitent une intervention rapide."};
  }
  smartAdvice(aggregated,comparisons){
    const advice=[];
    if(aggregated.usableCount===0)return[aggregated.activeCount?"Les appareils actifs ne fournissent aucune donnée récente : les calculs sont suspendus.":"Aucun appareil n’est utilisé par HA Pool. Les calculs sont suspendus."];
    if(aggregated.ph.number===null)advice.push("Aucune mesure de pH récente n’est disponible.");
    else{
      const assessment=rc28PhAssessment(aggregated.ph.number);
      advice.push(`pH ${assessment.label.toLowerCase()} : ${assessment.detail}`);
    }
    const gaps=comparisons.filter(row=>row.delta!==null&&!row.good);
    const acceptableOrp=comparisons.find(row=>row.metric==="orp"&&row.severity==="acceptable");
    if(gaps.length)advice.push(`Écart notable entre les appareils : ${gaps.map(row=>`${row.label} ${row.delta.toFixed(row.metric==="orp"?0:2)} ${row.unit}`).join(" · ")}.`);
    else if(acceptableOrp)advice.push(`Écart ORP de ${acceptableOrp.delta.toFixed(0)} mV compatible avec les emplacements différents des sondes ; aucune pénalité appliquée.`);
    else if(comparisons.length)advice.push("Les mesures des deux appareils restent dans les seuils de cohérence définis.");
    else if(this._comparisonMeta?.state==="time_gap")advice.push(`Comparaison suspendue : ${this._comparisonMeta.detail}`);
    else advice.push("Une seule source est actuellement utilisée pour les mesures consolidées.");
    return advice;
  }
  /**
   * Façade de compatibilité : le calcul du libellé vit dans le module Assistant Expert.
   */
  rc30AssistantScheduleLabel(periods=[]){
    return construireLibellePlagesAssistantExpert(periods,{
      calculerHeuresProgramme:rc27ScheduledHours,
      calculerMinutesPlage:rc27Minutes
    });
  }

  /**
   * Façade de compatibilité vers l'adaptateur Assistant Expert.
   * La recommandation adaptative est reçue du render principal et n'est jamais recalculée ici.
   */
  rc30AssistantExpertModel({aggregated,smart,confidence,comparisons,weather,weatherAlert,treatmentModel,adaptiveRecommendation,smartAdviceLines=[]}){
    const control=rc27SanitizeControl(this._rc27Control||{});
    const seasonal=rc30SanitizeProfiles(control.seasonal_profiles,control.pump);
    const pacModel=this.rc30PacModel(control.pac||{});
    return construireModeleAssistantExpertDepuisDonnees({
      controle:control,
      profilsSaisonniers:seasonal,
      agregation:aggregated,
      etatIntelligent:smart,
      confiance:confidence,
      comparaisons:comparisons,
      metaComparaison:this._comparisonMeta||{},
      meteo:weather,
      alerteMeteo:weatherAlert,
      modeleTraitement:treatmentModel,
      recommandationAdaptative:adaptiveRecommendation,
      conseilsIntelligents:smartAdviceLines,
      temperatureAirC:weather.available?this.rc30AirTemperatureC():null,
      libelleConditionMeteo:weather.available?weatherLabel(weather.condition):"Indisponible",
      modelePac:pacModel,
      formaterHeures:value=>this.formatHours(value),
      calculerHeuresProgramme:rc27ScheduledHours,
      calculerMinutesPlage:rc27Minutes
    });
  }

  /** Façade de compatibilité vers l'état de popup extrait. */
  rc30CaptureAssistantExpertScroll(){
    capturerDefilementAssistantExpert(this);
  }

  /** Façade de compatibilité vers l'état de popup extrait. */
  rc30ApplyAssistantExpertState({focus=false}={}){
    appliquerEtatPopupAssistantExpert(this,{focus});
  }

  /** Façade de compatibilité vers l'ouverture de popup extraite. */
  rc30OpenAssistantExpert(trigger=null){
    ouvrirPopupAssistantExpert(this,trigger);
  }

  /** Façade de compatibilité vers la fermeture de popup extraite. */
  rc30CloseAssistantExpert(){
    fermerPopupAssistantExpert(this);
  }

  /** Façade de compatibilité vers le rendu Gemini extrait. */
  rc30RenderGeminiState(){
    rendreEtatGemini(this);
  }

  /** Façade de compatibilité vers le contrôleur Gemini extrait. */
  async rc30GenerateGemini(){
    return genererReformulationGemini(this);
  }

  treatmentModel(aggregated,weatherAlert){
    const model=rc24TreatmentModel(this._treatmentProfile,{
      ph:aggregated.ph.number,
      temperature:aggregated.temperature.number,
      orp:aggregated.orp.number,
      orpTrend:smartTrend(this._history?.orp||[],"orp"),
      history:this._treatmentHistory||[],
      weatherAlert,
      lastAnalysis:this.aggregate("last_analysis").value
    });
    if(aggregated.usableCount===0){
      const detail=aggregated.activeCount?"Aucune donnée récente exploitable. Les conseils reprendront automatiquement dès le retour d’une mesure valide.":"Activez Flipr ou Blue Connect pour reprendre les conseils calculés.";
      return{...model,summary:"Recommandations de traitement suspendues",confidence:{tone:"pending",label:"Suspendu",detail},phAdvice:{tone:"pending",title:"Mesures suspendues",detail},feederAdvice:{tone:"pending",title:"Réglage conservé",detail:"Aucun changement du doseur n’est proposé sans mesure active."},sanitizerAdvice:{tone:"pending",title:"Traitement suspendu",detail:"Aucun dosage de désinfectant n’est proposé sans mesure active."},actions:[]};
    }
    return model;
  }
  treatmentOptions(items,current){
    return rendreOptionsTraitement(items,current,rc24Escape);
  }
  rc271ViewportMode(){return resoudreModeAffichageSections(Boolean(window.matchMedia?.("(max-width:760px)")?.matches))}
  rc271IsCollapsed(key){return sectionEstRepliee(this._rc271Sections,this.rc271ViewportMode(),key)}
  rc271SectionClass(key){return classeSectionRepliable(this.rc271IsCollapsed(key))}
  rc271HeaderAttributes(key){return attributsEnteteSectionRepliable(key,this.rc271IsCollapsed(key))}
  rc271Chevron(key){return rendreChevronSectionRepliable(this.rc271IsCollapsed(key))}
  rc271SetCollapsed(key,collapsed){
    if(!RC271_SECTION_IDS.includes(key))return;
    const mode=this.rc271ViewportMode();
    this._rc271Sections=definirSectionRepliee(this._rc271Sections,mode,key,collapsed);
    writeRc271Sections(this._rc271Sections);
  }
  rc271ToggleSection(key){this.rc271SetCollapsed(key,!this.rc271IsCollapsed(key));this.render()}
  renderRc271Toolbar(){return rendreBarreSectionsRepliables(this.rc271ViewportMode())}
  bindRc271CollapseControls(){
    this.shadowRoot.querySelectorAll("[data-rc271-toggle]").forEach(header=>{
      const toggle=event=>{
        if(event.type==="keydown"&&!['Enter',' '].includes(event.key))return;
        if(event.target?.closest?.("button,a,input,select,textarea,summary"))return;
        event.preventDefault?.();
        this.rc271ToggleSection(header.dataset.rc271Toggle);
      };
      header.addEventListener("click",toggle);
      header.addEventListener("keydown",toggle);
    });
    this.shadowRoot.querySelectorAll("[data-rc271-all]").forEach(button=>button.addEventListener("click",()=>{
      const collapsed=button.dataset.rc271All==="collapse";
      RC271_SECTION_IDS.forEach(key=>this.rc271SetCollapsed(key,collapsed));
      this.render();
    }));
  }
  formatHours(hours){return formaterDureeHeures(hours)}
  filtrationPerformance(model){
    return calculerPerformanceCarteFiltration({
      profilTraitement:this._treatmentProfile,
      statistiquesFiltration:this._filtrationStats,
      controle:this._rc27Control,
      modele:model
    });
  }
  renderFiltrationSection(model){
    return rendreCarteFiltration({
      modele:model,
      profilTraitement:this._treatmentProfile,
      statistiquesFiltration:this._filtrationStats,
      controle:this._rc27Control,
      classeSection:this.rc271SectionClass("filtration"),
      attributsEntete:this.rc271HeaderAttributes("filtration"),
      chevronHtml:this.rc271Chevron("filtration")
    });
  }

  renderTreatmentSection(model){
    return rendreCarteTraitement({
      modele:model,
      profil:this._treatmentProfile,
      etatDetails:rc24SanitizeTreatmentDetailsState(this._treatmentDetailsState||{}),
      historique:this._treatmentHistory||[],
      doseurs:RC24_FEEDERS,
      produits:RC24_PRODUCTS,
      classeSection:this.rc271SectionClass("treatment"),
      attributsEntete:this.rc271HeaderAttributes("treatment"),
      chevronHtml:this.rc271Chevron("treatment"),
      echapperHtml:rc24Escape
    });
  }
  recordTreatment(action){
    if(!action)return;
    if(action.kind==="feeder_setting"){
      this._treatmentProfile=rc24SanitizeTreatmentProfile({...this._treatmentProfile,feeder_setting:action.setting});
      writeTreatmentProfile(this._treatmentProfile);
    }
    const stock=rc24Number(this._treatmentProfile.sanitizer_stock_g,null);
    if(stock!==null&&Number.isFinite(Number(action.dose_g))&&["bromine_weekly","bromine_shock"].includes(action.kind)){
      this._treatmentProfile=rc24SanitizeTreatmentProfile({...this._treatmentProfile,sanitizer_stock_g:Math.max(0,stock-Number(action.dose_g))});
      writeTreatmentProfile(this._treatmentProfile);
    }
    const remeasureDelay=rc24Number(this._treatmentProfile.remeasure_delay_hours,null);
    const entry={
      date:new Date().toISOString(),
      kind:action.kind,
      product:action.product||"",
      dose_amount:action.dose_amount??action.dose_g??action.dose_ml??null,
      dose_unit:action.dose_unit||(action.dose_ml?"ml":action.dose_g?"g":""),
      dose_g:action.dose_g||null,
      dose_ml:action.dose_ml||null,
      setting:action.setting??null,
      detail:action.detail||"",
      volume_m3:this._treatmentProfile.volume_m3,
      treatment:this._treatmentProfile.treatment,
      sanitizer_level:this._treatmentProfile.sanitizer_level,
      feeder_setting:this._treatmentProfile.feeder_setting,
      next_measure_at:remeasureDelay!==null&&["ph_plus","ph_minus","bromine_weekly","bromine_shock"].includes(action.kind)?new Date(Date.now()+remeasureDelay*3600000).toISOString():null
    };
    this._treatmentHistory=[entry,...(this._treatmentHistory||[])].slice(0,500);
    this.persistTreatmentHistory();
    this.render();
  }
  bindTreatmentControls(){
    this.shadowRoot.querySelectorAll("[data-treatment-details]").forEach(details=>details.addEventListener("toggle",()=>{
      const key=details.dataset.treatmentDetails;
      if(!["products","maintenance"].includes(key))return;
      this._treatmentDetailsState=rc24SanitizeTreatmentDetailsState({...this._treatmentDetailsState,[key]:details.open});
      writeTreatmentDetailsState(this._treatmentDetailsState);
    }));
    this.shadowRoot.querySelectorAll("[data-treatment-field]").forEach(control=>{
      if(control.tagName!=="SELECT")control.addEventListener("input",()=>{
        const key=control.dataset.treatmentField;
        const value=control.type==="number"?(control.value===""?"":Number(control.value)):control.value;
        this._treatmentProfile=rc24SanitizeTreatmentProfile({...this._treatmentProfile,[key]:value});
        writeTreatmentProfile(this._treatmentProfile);
      });
      control.addEventListener("change",()=>{
        const key=control.dataset.treatmentField;
        const value=control.type==="number"?(control.value===""?"":Number(control.value)):control.value;
        const measuredAt=key==="sanitizer_level"&&value!==""?new Date().toISOString():this._treatmentProfile.sanitizer_measured_at;
        this._treatmentProfile=rc24SanitizeTreatmentProfile({...this._treatmentProfile,[key]:value,sanitizer_measured_at:measuredAt});
        writeTreatmentProfile(this._treatmentProfile);
        if(key==="sanitizer_level"&&value!==""){
          const previous=(this._treatmentHistory||[])[0];
          const duplicate=previous?.kind==="sanitizer_measurement"&&previous.treatment===this._treatmentProfile.treatment&&Number(previous.sanitizer_level)===Number(value)&&Date.now()-new Date(previous.date).getTime()<5*60000;
          if(!duplicate){
            this._treatmentHistory=[{
              date:measuredAt,
              kind:"sanitizer_measurement",
              product:"Mesure manuelle",
              detail:`Mesure ${this._treatmentProfile.treatment==="bromine"?"brome":"chlore"}`,
              treatment:this._treatmentProfile.treatment,
              sanitizer_level:Number(value),
              volume_m3:this._treatmentProfile.volume_m3,
              feeder_setting:this._treatmentProfile.feeder_setting
            },...(this._treatmentHistory||[])].slice(0,500);
            this.persistTreatmentHistory();
          }
        }
        this.render();
      });
    });
    this.shadowRoot.querySelectorAll("[data-treatment-action]").forEach(button=>button.addEventListener("click",()=>{
      const action=this._rc24TreatmentModel?.actions?.[Number(button.dataset.treatmentAction)];
      if(action?.manualConfirmation){
        const confirmed=typeof window.confirm!=="function"||window.confirm(`Confirmer que vous avez réellement effectué : ${action.label.replace(/^Confirmer /,"" )} ?`);
        if(!confirmed)return;
      }
      this.recordTreatment(action);
    }));
    this.shadowRoot.querySelectorAll("[data-treatment-undo]").forEach(button=>button.addEventListener("click",()=>{
      this._treatmentHistory=(this._treatmentHistory||[]).slice(1);
      this.persistTreatmentHistory();
      this.render();
    }));
    this.shadowRoot.querySelectorAll("[data-treatment-reset]").forEach(button=>button.addEventListener("click",()=>{
      const confirmed=typeof window.confirm!=="function"||window.confirm("Réinitialiser tous les paramètres du profil du bassin ? Le journal des actions sera conservé.");
      if(!confirmed)return;
      this._treatmentProfile=resetTreatmentProfile(this.config.treatment||{});
      this.render();
    }));
    this.shadowRoot.querySelectorAll("[data-treatment-focus]").forEach(button=>button.addEventListener("click",()=>{
      if(this.rc271IsCollapsed("treatment")){this.rc271SetCollapsed("treatment",false);this.render()}
      this.shadowRoot.querySelector("#rc24-treatment")?.scrollIntoView({behavior:this._preferences.animations?"smooth":"auto",block:"start"});
    }));
  }
  async syncTreatmentHistoryFromBackend(){
    if(!this._hass?.callWS||this._treatmentJournalLoading)return;
    this._treatmentJournalLoading=true;
    try{
      const response=await this._hass.callWS({type:"ha_pool_dashboard/get_treatment_history"});
      const backend=Array.isArray(response?.history)?response.history:[];
      const local=Array.isArray(this._treatmentHistory)?this._treatmentHistory:readTreatmentHistory();
      const {historique:merged,localModifie:changed,backendModifie:backendChanged}=preparerSynchronisationJournauxTraitement(backend,local);
      this._treatmentHistory=merged;
      writeTreatmentHistory(merged);
      if(backendChanged){
        await this._hass.callWS({type:"ha_pool_dashboard/save_treatment_history",history:merged});
      }
      this._treatmentJournalSynced=true;
      if(changed&&this._connected)this.rc30RequestBackgroundRender();
    }catch(_error){
      // Le miroir local reste disponible si le backend est momentanément indisponible.
      this._treatmentJournalSynced=false;
    }finally{this._treatmentJournalLoading=false}
  }
  persistTreatmentHistory(){
    this._treatmentHistory=rc24MergeTreatmentHistories(this._treatmentHistory||[]).slice(0,500);
    writeTreatmentHistory(this._treatmentHistory);
    if(this._hass?.callWS){
      this._hass.callWS({type:"ha_pool_dashboard/save_treatment_history",history:this._treatmentHistory}).then(()=>{this._treatmentJournalSynced=true}).catch(()=>{this._treatmentJournalSynced=false});
    }
  }
  startRc27Sync(){
    if(this._rc27SyncTimer)return;
    this.loadRc27ControlState(true);
    this._rc27SyncTimer=setInterval(()=>this.loadRc27ControlState(true),30000);
  }
  async loadRc27ControlState(silent=false){
    if(!this._hass?.callWS||this._rc27Loading)return;
    if(silent&&this._rc27LastLoad&&Date.now()-this._rc27LastLoad<5000)return;
    this._rc27Loading=true;
    try{
      const state=await this._hass.callWS({type:"ha_pool_dashboard/get_state"});
      const next=rc27SanitizeControl({...state,backend_available:true});
      const nextHash=JSON.stringify(next);
      const changed=nextHash!==this._rc30LastControlHash;
      this._rc27Control=next;
      this._rc30LastControlHash=nextHash;
      this._rc27LastLoad=Date.now();
      writeRc27Control(this._rc27Control);
      this.scheduleFiltrationLoad();
      if(changed&&this._connected)this.rc30RequestBackgroundRender();
    }catch(_error){
      this._rc27Control=rc27SanitizeControl({...this._rc27Control,backend_available:false});
      if(!silent&&this._connected)this.rc30RequestBackgroundRender();
    }finally{this._rc27Loading=false}
  }
  async saveRc27Control(next,{render=true}={}){
    this._rc27Control=rc27SanitizeControl(next);
    writeRc27Control(this._rc27Control);
    if(render)this.render();
    if(!this._hass?.callWS)return;
    try{
      const state=await this._hass.callWS({type:"ha_pool_dashboard/save_state",config:this._rc27Control});
      const next=rc27SanitizeControl({...state,backend_available:true});
      const nextHash=JSON.stringify(next),changed=nextHash!==JSON.stringify(this._rc27Control);
      this._rc27Control=next;
      this._rc30LastControlHash=nextHash;
      writeRc27Control(this._rc27Control);
      this.scheduleFiltrationLoad();
      if(render&&changed&&this._connected)this.rc30RequestBackgroundRender();
    }catch(_error){
      this._rc27Control=rc27SanitizeControl({...this._rc27Control,backend_available:false});
      if(render&&this._connected)this.rc30RequestBackgroundRender();
    }
  }
  syncRc27Context(model){
    if(!this._rc27Control)return;
    const nextDose=(this._treatmentHistory||[]).find(item=>item.next_measure_at&&new Date(item.next_measure_at).getTime()>Date.now());
    const stock=this.rc27StockEstimate(model);
    const weatherAlert=this.currentWeatherAlert();
    const context={
      recommended_hours:Number(model.filtrationHours||0),
      watch:{
        ph_entities:this.activeDevices().filter(device=>this.deviceFresh(device)).map(device=>device.entities?.ph).filter(Boolean),
        sanitizer_level:this._treatmentProfile.sanitizer_level,
        sanitizer_label:model.sanitizerTarget.label,
        sanitizer_min:model.sanitizerTarget.min,
        next_measure_at:nextDose?.next_measure_at||"",
        stock_low:Boolean(stock.stock!==null&&stock.weekly&&stock.stock<stock.weekly*2),
        stock_g:stock.stock,
        maintenance_due:this.rc27MaintenanceRows().filter(row=>row.due).map(row=>row.label),
        weather_alert:weatherAlert.active?`Vigilance ${weatherAlert.levelLabel} · ${weatherAlert.alerts.map(alert=>alert.label).join(", ")}`:"",
        temperature_entities:this.activeDevices().filter(device=>this.deviceFresh(device)).map(device=>device.entities?.temperature).filter(Boolean),
        weather_entity:String(this.config.weather?.weather||""),
        air_temperature_entity:String(this.config.weather?.air_temperature||""),
        weather_alert_entity:String(weatherAlert.entityId||""),
        weather_heat_alert:Boolean(weatherAlert.alerts?.some(alert=>alert.key==="heatwave"&&alert.severity>=2)),
        weather_cold_alert:Boolean(weatherAlert.alerts?.some(alert=>alert.key==="cold"&&alert.severity>=2)),
        pool_volume_m3:Number(this._treatmentProfile?.volume_m3||0),
        pump_flow_m3h:Number(this._treatmentProfile?.pump_flow_m3h||0),
        water_condition:String(this._treatmentProfile?.water_condition||"clear"),
        recent_load:String(this._treatmentProfile?.recent_load||"normal"),
        context_updated_at:new Date().toISOString()
      }
    };
    const hash=JSON.stringify(context);
    if(hash===this._rc27ContextHash)return;
    this._rc27ContextHash=hash;
    this._rc27Control=rc27SanitizeControl(rc27Merge(this._rc27Control,{pump:{recommended_hours:context.recommended_hours},watch:context.watch}));
    writeRc27Control(this._rc27Control);
    if(this._hass?.callWS)this._hass.callWS({type:"ha_pool_dashboard/save_state",config:{pump:{recommended_hours:context.recommended_hours},watch:context.watch}}).catch(()=>{});
  }
  rc27EntityOptions(domains,current,placeholder="Sélectionner une entité"){
    const allowed=new Set(domains);
    const entities=Object.entries(this._hass?.states||{}).filter(([entityId])=>allowed.has(entityId.split(".")[0])).sort((a,b)=>String(a[1]?.attributes?.friendly_name||a[0]).localeCompare(String(b[1]?.attributes?.friendly_name||b[0])));
    return`<option value="">${placeholder}</option>${entities.map(([entityId,state])=>`<option value="${rc24Escape(entityId)}" ${current===entityId?"selected":""}>${rc24Escape(state.attributes?.friendly_name||entityId)} · ${rc24Escape(entityId)}</option>`).join("")}`;
  }
  rc30EntityCatalog(domains,current=""){
    return construireCatalogueEntites({etats:this._hass?.states||{},domaines:domains,courant:current});
  }
  rc30EntityPicker(label,path,domains,current,placeholder="Facultatif"){
    return rendreSelecteurEntiteConfiguration({libelle:label,chemin:path,domaines:domains,courant:current,placeholder,etats:this._hass?.states||{},echapperHtml:rc24Escape});
  }
  rc30EnhanceChoiceSelects(){
    const root=this.shadowRoot;if(!root)return;
    root.querySelectorAll("select:not([data-rc30-choice-enhanced])").forEach(select=>{
      select.dataset.rc30ChoiceEnhanced="true";select.classList.add("rc30-native-select");
      const picker=document.createElement("div");picker.className=`rc30-choice-picker${select.disabled?" is-disabled":""}`;
      const renderOptions=()=>[...select.options].map((option,index)=>`<button type=button role=option class="rc30-choice-picker__option ${option.selected?"is-selected":""}" data-rc30-choice-index="${index}" aria-selected="${option.selected}"><span>${rc24Escape(option.textContent||option.value||"—")}</span>${option.selected?"<b>✓</b>":""}</button>`).join("");
      picker.innerHTML=`<button type=button class=rc30-choice-picker__trigger aria-haspopup=listbox aria-expanded=false ${select.disabled?"disabled":""}><span>${rc24Escape(select.selectedOptions?.[0]?.textContent||"—")}</span><i>⌄</i></button><div class=rc30-choice-picker__panel role=listbox>${renderOptions()}</div>`;
      select.insertAdjacentElement("afterend",picker);
      const trigger=picker.querySelector(".rc30-choice-picker__trigger"),panel=picker.querySelector(".rc30-choice-picker__panel");
      const close=()=>{picker.classList.remove("is-open");trigger?.setAttribute("aria-expanded","false")};
      const sync=()=>{if(trigger)trigger.querySelector("span").textContent=select.selectedOptions?.[0]?.textContent||"—";panel.innerHTML=renderOptions();bindOptions()};
      const choose=index=>{const option=select.options[index];if(!option||option.disabled||select.disabled)return;select.selectedIndex=index;sync();close();select.dispatchEvent(new Event("change",{bubbles:true}));trigger?.focus()};
      const bindOptions=()=>panel.querySelectorAll("[data-rc30-choice-index]").forEach(option=>option.addEventListener("click",()=>choose(Number(option.dataset.rc30ChoiceIndex))));
      bindOptions();
      trigger?.addEventListener("click",event=>{event.preventDefault();if(select.disabled)return;const open=!picker.classList.contains("is-open");root.querySelectorAll(".rc30-choice-picker.is-open,.rc30-entity-picker.is-open").forEach(other=>{if(other!==picker){other.classList.remove("is-open");other.querySelector("[aria-expanded]")?.setAttribute("aria-expanded","false")}});picker.classList.toggle("is-open",open);trigger.setAttribute("aria-expanded",String(open));if(open)this._rc27ConfigOpen=true});
      trigger?.addEventListener("keydown",event=>{if(select.disabled)return;const current=Math.max(0,select.selectedIndex);if(event.key==="Escape"){event.preventDefault();close()}else if(event.key==="ArrowDown"){event.preventDefault();choose(Math.min(select.options.length-1,current+1))}else if(event.key==="ArrowUp"){event.preventDefault();choose(Math.max(0,current-1))}else if(event.key==="Enter"||event.key===" "){event.preventDefault();trigger.click()}});
      picker.addEventListener("focusout",()=>setTimeout(()=>{const active=root.activeElement;if(!active||!picker.contains(active))close()},0));
      select._rc30ChoiceSync=sync;
    });
    if(!this._rc30ChoiceOutsideBound){
      this._rc30ChoiceOutsideBound=true;
      root.addEventListener("click",event=>{if(event.target.closest?.(".rc30-choice-picker,.rc30-entity-picker"))return;root.querySelectorAll(".rc30-choice-picker.is-open,.rc30-entity-picker.is-open").forEach(picker=>{picker.classList.remove("is-open");picker.querySelector("[aria-expanded]")?.setAttribute("aria-expanded","false")})});
    }
  }
  rc30SyncChoiceSelect(select){select?._rc30ChoiceSync?.()}
  rc27NotifyOptions(current){
    const services=Object.keys(this._hass?.services?.notify||{}).sort();
    return`<option value="">Notification persistante uniquement</option>${services.map(service=>`<option value="notify.${rc24Escape(service)}" ${current===`notify.${service}`?"selected":""}>notify.${rc24Escape(service)}</option>`).join("")}`;
  }
  rc27EntityValue(entityId,unit=""){
    const state=entityId?this._hass?.states?.[entityId]:null;
    if(!state||["unknown","unavailable"].includes(state.state))return"—";
    return`${state.state}${unit||state.attributes?.unit_of_measurement?` ${unit||state.attributes.unit_of_measurement}`:""}`;
  }
  rc30PacEntity(entityId){
    const state=entityId?this._hass?.states?.[entityId]:null;
    return state&&!["unknown","unavailable"].includes(state.state)?state:null;
  }
  rc30PacNumber(entityId,attribute=""){
    const state=this.rc30PacEntity(entityId);
    if(!state)return null;
    const raw=attribute?state.attributes?.[attribute]:state.state,value=Number.parseFloat(raw);
    return Number.isFinite(value)?value:null;
  }
  rc30PacSetpoint(pac){
    const state=this.rc30PacEntity(pac.setpoint_entity);
    if(!state)return null;
    const value=Number.parseFloat(state.state);
    return Number.isFinite(value)?value:null;
  }
  rc30PacText(entityId,attribute=""){
    const state=this.rc30PacEntity(entityId);
    if(!state)return"";
    const value=attribute?state.attributes?.[attribute]:state.state;
    return value===undefined||value===null?"":String(value);
  }
  rc30PacEntityId(pac,cle){return String(pac?.[cle]||RC30_PAC_STABLE_ENTITIES[cle]||"")}
  rc30PacConfigured(pac){
    if(Object.entries(pac||{}).some(([key,value])=>key.endsWith("_entity")&&Boolean(value)))return true;
    return Object.values(RC30_PAC_STABLE_ENTITIES).some(entityId=>Boolean(this._hass?.states?.[entityId]));
  }
  rc30PacModel(pac){
    const commandId=this.rc30PacEntityId(pac,"command_entity"),statusId=this.rc30PacEntityId(pac,"status_entity"),setpointId=this.rc30PacEntityId(pac,"setpoint_entity"),modeId=this.rc30PacEntityId(pac,"mode_entity");
    const configured=this.rc30PacConfigured(pac),command=this.rc30PacEntity(commandId),status=this.rc30PacEntity(statusId);
    const on=status?!["off","false","0","idle","standby","veille","arrêt","arret"].includes(String(status.state).toLowerCase()):command?command.state==="on":null;
    const setpoint=this.rc30PacNumber(setpointId);
    const inlet=this.rc30PacNumber(this.rc30PacEntityId(pac,"inlet_temperature_entity")),outlet=this.rc30PacNumber(this.rc30PacEntityId(pac,"outlet_temperature_entity"));
    const mode=this.rc30PacText(modeId),controlMode=this.rc30PacText(pac.control_mode_entity);
    const fault=this.rc30PacText(this.rc30PacEntityId(pac,"fault_entity")),communication=this.rc30PacText(this.rc30PacEntityId(pac,"communication_entity"));
    return{
      configured,on,setpoint,inlet,outlet,delta:inlet!==null&&outlet!==null?outlet-inlet:null,mode,controlMode,
      ambient:this.rc30PacNumber(this.rc30PacEntityId(pac,"ambient_temperature_entity")),coil:this.rc30PacNumber(this.rc30PacEntityId(pac,"coil_temperature_entity")),ipm:this.rc30PacNumber(this.rc30PacEntityId(pac,"ipm_temperature_entity")),
      voltage:this.rc30PacNumber(this.rc30PacEntityId(pac,"voltage_entity")),current:this.rc30PacNumber(pac.current_entity),power:this.rc30PacNumber(pac.power_entity),powerUnit:String(this.rc30PacEntity(pac.power_entity)?.attributes?.unit_of_measurement||"W"),energy:this.rc30PacNumber(pac.energy_entity),dailyEnergy:this.rc30PacNumber(pac.daily_energy_entity),monthlyEnergy:this.rc30PacNumber(pac.monthly_energy_entity),
      compressorFaultCode:this.rc30PacText(this.rc30PacEntityId(pac,"compressor_fault_code_entity")),waterFlow:this.rc30PacText(this.rc30PacEntityId(pac,"water_flow_entity")),highPressure:this.rc30PacText(this.rc30PacEntityId(pac,"high_pressure_entity")),lowPressure:this.rc30PacText(this.rc30PacEntityId(pac,"low_pressure_entity")),fault,communication
    };
  }
  // Façades historiques : la présentation PAC vit désormais dans interface/carte-pac.js.
  rc30PacValue(value,unit="",digits=1){return formaterValeurCartePac(value,unit,digits)}
  rc30PacModeParts(mode){return decomposerModeCartePac(mode)}
  rc30PacOperationLabel(value){return libellerFonctionnementCartePac(value)}
  rc30PacRegulationLabel(value){return libellerRegulationCartePac(value)}
  rc30PacGaugeState(pacModel){return determinerEtatCadranCartePac(pacModel)}
  rc30PacGaugeLimits(){
    const state=this.rc30PacEntity(this.rc30PacEntityId(this._rc27Control?.pac||{},"setpoint_entity"));
    return calculerLimitesConsignePac(state?.attributes?.step);
  }
  rc30PacGaugeDisplayValue(pacModel){
    return choisirValeurAfficheeConsignePac({brouillon:this._rc30PacDraftSetpoint,pacConfiguree:pacModel.configured,consigne:pacModel.setpoint,simulation:this._rc30PacSimulatedSetpoint});
  }
  rc30PacGaugeGeometry(value){
    return calculerGeometrieCadranPac(value,this.rc30PacGaugeLimits());
  }
  rc30PacGaugeValueFromPointer(event,ring){
    return calculerConsigneDepuisPointeurPac({clientX:event.clientX,clientY:event.clientY,rect:ring?.getBoundingClientRect?.(),limites:this.rc30PacGaugeLimits()});
  }
  rc30RenderPacCard(pacModel){
    const pending=this._rc30PacPendingMode;
    const modeleAffiche=pending?.option?{...pacModel,mode:pending.option,modePending:true}:pacModel;
    const gaugeValue=this.rc30PacGaugeDisplayValue(modeleAffiche);
    const gaugeGeometry=this.rc30PacGaugeGeometry(gaugeValue);
    const waterRef=this.aggregate("temperature")?.number;
    return rendreCartePac({modelePac:modeleAffiche,valeurConsigne:gaugeValue,geometrieCadran:gaugeGeometry,temperatureEauC:waterRef,echapperHtml:rc24Escape});
  }
  rc30PacAnnulerModeEnAttente({rendre=false}={}){
    if(this._rc30PacPendingModeTimer){clearTimeout(this._rc30PacPendingModeTimer);this._rc30PacPendingModeTimer=null}
    this._rc30PacPendingMode=null;
    if(rendre&&this.config)this.render();
  }
  rc30PacDemarrerModeEnAttente(option){
    if(!option)return;
    this.rc30PacAnnulerModeEnAttente();
    const attendu=String(option);
    this._rc30PacPendingMode={option:attendu,startedAt:Date.now()};
    this._rc30PacPendingModeTimer=setTimeout(()=>{
      if(this._rc30PacPendingMode?.option!==attendu)return;
      this._rc30PacPendingMode=null;
      this._rc30PacPendingModeTimer=null;
      if(this.config)this.render();
    },10000);
  }
  rc30PacReconcileModeEnAttente(){
    const pending=this._rc30PacPendingMode;if(!pending)return;
    const entityId=this.rc30PacEntityId(this._rc27Control?.pac||{},"mode_entity");
    const modeReel=this.rc30PacText(entityId);
    if(modeReel&&modeReel===pending.option)this.rc30PacAnnulerModeEnAttente();
  }
  rc30PacGaugeApplyDraft(value,ring){
    if(!Number.isFinite(value)||!ring)return;
    this._rc30PacDraftSetpoint=value;
    const geometry=this.rc30PacGaugeGeometry(value),strong=ring.querySelector('.rc30-pac-gauge__center strong'),knob=ring.querySelector('.rc30-pac-gauge__knob'),confirm=this.shadowRoot?.querySelector?.('[data-rc30-pac-confirm]');
    ring.style.setProperty('--pac-progress',`${geometry.progress}%`);
    ring.setAttribute('aria-valuenow',String(value));
    if(strong)strong.textContent=this.rc30PacValue(value,'°C',1);
    if(knob){knob.style.left=`${geometry.x}%`;knob.style.top=`${geometry.y}%`;}
    if(confirm){const text=`Valider ${this.rc30PacValue(value,'°C',1)}`;confirm.hidden=false;confirm.setAttribute('aria-label',text);confirm.setAttribute('title',text);}
  }
  rc30PacCombinedOption(operation,regulation){return composerOptionModePac(operation,regulation)}
  rc30PacResolveSelectOption(operation,regulation){
    const pac=this._rc27Control?.pac||{},entity=this.rc30PacEntity(pac.mode_entity),options=Array.isArray(entity?.attributes?.options)?entity.attributes.options:[];
    return resoudreOptionModePac(operation,regulation,options);
  }
  rc30PacPeutCommander(){return this._rc27Control?.coordination?.role==="master"&&this._rc27Control?.pac?.write_enabled===true}
  async rc30PacAppelerService(domaine,nom,donnees){
    if(!this.rc30PacPeutCommander())return false;
    if(typeof this._hass?.callService!=="function")throw new Error("Service Home Assistant indisponible");
    await this._hass.callService(domaine,nom,donnees);
    return true;
  }
  async rc30PacCommanderMarche(demarrer){
    const entity=this.rc30PacEntityId(this._rc27Control?.pac||{},"command_entity");
    if(!entity)return false;
    return this.rc30PacAppelerService("switch",demarrer?"turn_on":"turn_off",{entity_id:entity});
  }
  async rc30PacCommanderConsigne(valeur){
    const value=Number(valeur),entity=this.rc30PacEntityId(this._rc27Control?.pac||{},"setpoint_entity");
    if(!Number.isFinite(value)||value<8||value>32||!entity)return false;
    return this.rc30PacAppelerService("number","set_value",{entity_id:entity,value});
  }
  async rc30PacCommanderMode(fonctionnement,regulation){
    const pac=this._rc27Control?.pac||{},entityId=this.rc30PacEntityId(pac,"mode_entity"),entity=this.rc30PacEntity(entityId),options=Array.isArray(entity?.attributes?.options)?entity.attributes.options:[];
    const option=resoudreOptionModePac(fonctionnement,regulation,options);
    if(!entityId||!option)return false;
    return this.rc30PacAppelerService("select","select_option",{entity_id:entityId,option});
  }
  rc30PacAfficherErreur(error){
    console.error("[HA Pool Dashboard] Commande PAC échouée",error);
    if(typeof window.alert==="function")window.alert(`Commande PAC non envoyée : ${error?.message||error||"erreur inconnue"}`);
  }
  rc30PacConfigEditor(){
    const pac=this._rc27Control?.pac||RC27_DEFAULT_CONTROL.pac,satellite=this._rc27Control?.coordination?.role==="satellite",locked=satellite?"disabled":"";
    const row=(label,path,domains,placeholder="Facultatif")=>this.rc30EntityPicker(label,`pac.${path}`,domains,pac[path],placeholder);
    const pacHours=rc27ScheduledHours(pac.periods||[]);
    return`<div class="rc27-schedule-editor rc30-pac-config">
      <h4>PAC Polytropic · entités ESPHome / Home Assistant</h4>
      <p class=rc30-pac-config-note>FIX12 conserve l’architecture ESPHome éprouvée et rend le cadran de consigne interactif (8 à 32 °C, validation par coche) avec les sélecteurs Fonctionnement / Régulation : <b>switch</b> Marche/Arrêt, <b>number</b> consigne, <b>select</b> mode, <b>sensor</b> mesures et <b>binary_sensor</b> sécurités. La programmation horaire est maintenant préparée côté Home Assistant. Le dashboard ne contient aucune adresse de registre Modbus. Les écritures restent verrouillées jusqu’à validation de la table Polytropic exacte de votre PAC.</p>
      <h5>Commandes ESPHome préparées</h5>
      <div class=rc27-config-grid>
        ${row("Marche / arrêt · switch","command_entity",["switch"],"switch PAC Ordre Marche")}
        ${row("Pilotage Auto / Arrêt / Marche · select (optionnel)","control_mode_entity",["select"],"select Auto / Manu PAC")}
        ${row("Température de consigne · number","setpoint_entity",["number"],"number PAC Consigne température")}
        ${row("Mode PAC · select","mode_entity",["select"],"select PAC Mode")}
      </div>
      <h5>Programmation PAC</h5>
      <div class=rc27-config-grid>
        <label><span>Mode de programmation</span><select data-rc27-path="pac.mode" ${locked}><option value=off ${pac.mode==="off"?"selected":""}>Arrêt</option><option value=manual ${pac.mode==="manual"?"selected":""}>Manuel</option><option value=program ${pac.mode==="program"?"selected":""}>Programme strict</option></select></label>
        <label class=rc27-check><input type=checkbox data-rc27-path="pac.requires_pump" ${pac.requires_pump!==false?"checked":""} ${locked}><span>Sécurité hydraulique : PAC autorisée seulement si la filtration est en marche</span></label>
      </div>
      <div class=rc27-weekdays>${RC27_WEEKDAYS.map(([key,short])=>`<button type=button class="${pac.weekdays.includes(key)?"is-active":""}" data-rc27-weekday="${key}" data-rc27-target="pac" ${locked}>${short}</button>`).join("")}</div>
      <div class=rc27-periods>${pac.periods.map((period,index)=>`<div class="rc27-period ${period.enabled?"is-enabled":""}"><label><input type=checkbox data-rc27-path="pac.periods.${index}.enabled" ${period.enabled?"checked":""} ${locked}><span>Plage ${index+1}</span></label><input type=time data-rc27-path="pac.periods.${index}.start" value="${period.start}" ${locked}><b>→</b><input type=time data-rc27-path="pac.periods.${index}.end" value="${period.end}" ${locked}></div>`).join("")}</div>
      <p class=rc30-pac-config-note><b>${this.formatHours(pacHours)}</b> programmées. ${satellite?`Cette instance est satellite : les plages locales sont verrouillées et ne sont pas exécutées.`:`Les commandes manuelles du maître passent par les entités stables Home Assistant ; le package Site B conserve les garde-fous terrain et arme le verrou ESPHome uniquement pendant chaque commande.`}</p>
      <h5>Mesures analogiques · sensor</h5>
      <div class=rc27-config-grid>
        ${row("Température eau entrée","inlet_temperature_entity",["sensor"])}
        ${row("Température eau sortie","outlet_temperature_entity",["sensor"])}
        ${row("Température échangeur / coil","coil_temperature_entity",["sensor"])}
        ${row("Température ambiante","ambient_temperature_entity",["sensor"])}
        ${row("Température IPM","ipm_temperature_entity",["sensor"])}
        ${row("Tension alimentation","voltage_entity",["sensor"])}
        ${row("Intensité alimentation","current_entity",["sensor"])}
        ${row("Puissance calculée (optionnel)","power_entity",["sensor"])}
        ${row("Énergie totale / compteur (optionnel)","energy_entity",["sensor"])}
        ${row("Énergie du jour (optionnel)","daily_energy_entity",["sensor"])}
        ${row("Énergie du mois (optionnel · installation)","monthly_energy_entity",["sensor"])}
        ${row("Code défaut compresseur","compressor_fault_code_entity",["sensor"])}
      </div>
      <h5>Sécurités · binary_sensor</h5>
      <div class=rc27-config-grid>
        ${row("Water flow switch","water_flow_entity",["binary_sensor"])}
        ${row("High pressure switch · HP","high_pressure_entity",["binary_sensor"])}
        ${row("Low pressure switch · LP","low_pressure_entity",["binary_sensor"])}
      </div>
      <h5>Diagnostics optionnels</h5>
      <div class=rc27-config-grid>
        ${row("État / activité PAC","status_entity",["sensor","binary_sensor"],"Optionnel · sinon état du switch")}
        ${row("Défaut général","fault_entity",["sensor","binary_sensor"],"Optionnel")}
        ${row("Communication ESPHome / Modbus","communication_entity",["sensor","binary_sensor"],"Optionnel")}
      </div>
    </div>`;
  }
  rc27MaintenanceRows(){
    const definitions=[
      ["maintenance_baskets","Paniers et préfiltre",7,"🧺"],
      ["maintenance_waterline","Ligne d’eau",7,"🧽"],
      ["maintenance_filter","Filtre",30,"🫧"],
      ["maintenance_calibration","Contrôle / calibration des sondes",90,"🎯"]
    ];
    return definitions.map(([kind,label,days,icon])=>{
      const last=(this._treatmentHistory||[]).find(item=>item.kind===kind);
      const next=last?new Date(new Date(last.date).getTime()+days*86400000):new Date();
      const due=!last||next.getTime()<=Date.now();
      return{kind,label,days,icon,last,next,due};
    });
  }
  rc27DataQuality(){
    const issues=[];
    this.config.devices.forEach((device,index)=>{
      if(!this.deviceEnabled(device,index))return;
      this.deviceAnomalies(device).forEach(issue=>issues.push(`${device.name} · ${issue}`));
      const last=this.deviceReading(device,"last_analysis").value;
      const timestamp=new Date(last).getTime();
      if(!Number.isFinite(timestamp))issues.push(`${device.name} · dernière analyse indisponible`);
      else if(Date.now()-timestamp>24*3600000)issues.push(`${device.name} · analyse ancienne de plus de 24 h`);
    });
    for(const metric of ["ph","orp","temperature"]){
      const points=(this._history?.[metric]||[]).slice(-8);
      if(points.length>=6&&Math.max(...points.map(point=>point.value))-Math.min(...points.map(point=>point.value))<.0001)issues.push(`${metric.toUpperCase()} · valeur figée à contrôler`);
    }
    return issues;
  }
  rc27TodayActions(model){
    const actions=[];
    const nextDose=(this._treatmentHistory||[]).find(item=>item.next_measure_at&&new Date(item.next_measure_at).getTime()>Date.now());
    if(nextDose)actions.push({tone:"warning",icon:"⏳",title:"Nouvelle mesure attendue",detail:`${rc27RelativeDate(nextDose.next_measure_at)} · ${rc27DateTime(nextDose.next_measure_at)}`,focus:"treatment"});
    if(this._treatmentProfile.sanitizer_level==="")actions.push({tone:"warning",icon:"🧪",title:`Mesurer le ${this._treatmentProfile.treatment==="bromine"?"brome":"chlore"}`,detail:"Une mesure dédiée est nécessaire avant tout réglage du doseur.",focus:"treatment"});
    if(["warning","critical"].includes(model.phAdvice.tone))actions.push({tone:"critical",icon:"pH",title:model.phAdvice.title,detail:model.phAdvice.detail,focus:"treatment"});
    this.rc27MaintenanceRows().filter(row=>row.due).forEach(row=>actions.push({tone:"info",icon:row.icon,title:`${row.label} à effectuer`,detail:row.last?`Échéance atteinte · intervalle ${row.days} jours`:"Aucune réalisation enregistrée",maintenance:row.kind}));
    const quality=this.rc27DataQuality();
    if(quality.length)actions.push({tone:"warning",icon:"📡",title:"Qualité des mesures à vérifier",detail:quality[0]});
    return actions.slice(0,3);
  }
  rc27StockEstimate(model){
    const stock=rc24Number(this._treatmentProfile.sanitizer_stock_g,null);
    const dosageDesinfectant=preparerDosageDesinfectantBrome(this._treatmentProfile,this._treatmentProfile.volume_m3);
    const weekly=model.isBromine?dosageDesinfectant.doseHebdomadaire:null;
    return{stock,weekly,weeks:stock!==null&&weekly?stock/weekly:null};
  }
  rc30CoordinationCard(control){
    return rendreCarteCoordination({coordination:control.coordination,coordinationParDefaut:RC27_DEFAULT_CONTROL.coordination,echapperHtml:rc24Escape});
  }
  rc27ScheduleEditor(target,label){
    return rendreEditeurProgrammationEquipement({
      cible:target,
      libelle:label,
      bloc:this._rc27Control[target],
      coordination:this._rc27Control?.coordination,
      joursSemaine:RC27_WEEKDAYS,
      rendreSelecteurEntite:(pickerLabel,path,domains,current,placeholder)=>this.rc30EntityPicker(pickerLabel,path,domains,current,placeholder),
      echapperHtml:rc24Escape,
    });
  }
  rc30AirTemperatureC(){
    const explicit=this.weatherReading("air_temperature");
    if(explicit.available&&Number.isFinite(explicit.number)){
      const unit=String(explicit.unit||"").toLowerCase();
      return unit.includes("°f")||unit==="f"?(explicit.number-32)*5/9:explicit.number;
    }
    const id=this.config.weather?.weather,obj=id&&this._hass?this._hass.states[id]:null;
    const raw=Number.parseFloat(obj?.attributes?.temperature),unit=String(obj?.attributes?.temperature_unit||"°C").toLowerCase();
    if(!Number.isFinite(raw))return null;
    return unit.includes("°f")||unit==="f"?(raw-32)*5/9:raw;
  }
  rc30AdaptiveRecommendation(control,model){
    const seasonal=rc30SanitizeProfiles(control.seasonal_profiles,control.pump),astronomical=determinerProfilSaisonnierDeReference();
    const water=this.aggregate("temperature")?.number,air=this.rc30AirTemperatureC(),weatherAlert=this.currentWeatherAlert();
    return calculerRecommandationProgrammeAdaptatif({
      profilsSaisonniers:seasonal,
      profilAstronomique:astronomical,
      modele:model,
      heuresRecommandeesPompe:control.pump?.recommended_hours,
      temperatureEau:water,
      temperatureAir:air,
      alerteMeteo:weatherAlert,
      volumeM3:Number(this._treatmentProfile?.volume_m3||0),
      debitM3h:Number(this._treatmentProfile?.pump_flow_m3h||0)
    });
  }
  rc30SeasonalProfileCard(control,model,adaptiveRecommendation=null){
    const saisonnalite=rc30SanitizeProfiles(control.seasonal_profiles,control.pump);
    return rendreCarteProfilProgrammationSaisonniere({
      saisonnalite,
      profilsSaisonniers:PROFILS_SAISONNIERS,
      profilSuggere:determinerProfilSaisonnierDeReference(),
      recommandationAdaptative:adaptiveRecommendation||this.rc30AdaptiveRecommendation(control,model),
      coordination:control?.coordination,
      formaterDuree:(hours)=>this.formatHours(hours),
      echapperHtml:rc24Escape,
    });
  }
  async rc30SelectSeasonalProfile(key){
    if(this._rc27Control?.coordination?.role==="satellite"||!PROFILS_SAISONNIERS[key])return;
    let control=this._rc27Control,seasonal=rc30SanitizeProfiles(control.seasonal_profiles,control.pump);
    if(key===seasonal.current&&!seasonal.follow_astronomical)return;
    const adaptive=seasonal.source==="adaptive",definition=PROFILS_SAISONNIERS[key];
    if(adaptive){const confirmed=typeof window.confirm!=="function"||window.confirm(`Utiliser « ${definition.label} » comme profil de référence ?\n\nLe programme adaptatif est actif : les plages seront recalculées immédiatement. Votre forçage manuel Démarrer/Arrêter reste prioritaire.`);if(!confirmed){this.render();return}}
    seasonal.current=key;seasonal.follow_astronomical=false;
    if(key==="maintenance"){seasonal.source="custom";seasonal.last_adaptive_signature="";control=rc27Merge(control,{seasonal_profiles:seasonal,pump:{mode:"manual"}})}
    else{control=rc27Merge(control,{seasonal_profiles:seasonal});if(adaptive){const recommendation=this.rc30AdaptiveRecommendation(control,this._rc30LastTreatmentModel);seasonal.last_adaptive_signature=recommendation.signature;control=rc27Merge(control,{seasonal_profiles:seasonal,pump:{weekdays:recommendation.weekdays,periods:recommendation.periods}})}}
    await this.saveRc27Control(control);
  }
  async rc30ResumeAdaptiveSchedule(){
    if(this._rc27Control?.coordination?.role==="satellite")return;
    let control=this._rc27Control,seasonal=rc30SanitizeProfiles(control.seasonal_profiles,control.pump);
    if(seasonal.current==="maintenance"){if(typeof window.alert==="function")window.alert("Le profil Maintenance reste volontairement manuel. Choisissez un profil saisonnier avant de reprendre le programme adaptatif.");return}
    const recommendation=this.rc30AdaptiveRecommendation(control,this._rc30LastTreatmentModel);
    const confirmed=typeof window.confirm!=="function"||window.confirm(`Reprendre le programme adaptatif ?\n\nRecommandation indicative maintenant : ${recommendation.scheduleLabel} (${this.formatHours(recommendation.hours)}).\nLe moteur pourra recalculer selon saison astronomique, températures, hydraulique et alertes. Toute modification manuelle des horaires repassera immédiatement en priorité personnalisée.`);
    if(!confirmed)return;
    seasonal.source="adaptive";seasonal.suspended_at="";seasonal.last_adaptive_signature=recommendation.signature;
    control=rc27Merge(control,{seasonal_profiles:seasonal,pump:{weekdays:recommendation.weekdays,periods:recommendation.periods}});
    await this.saveRc27Control(control);
  }
  async rc30SuspendAdaptiveSchedule(){
    if(this._rc27Control?.coordination?.role==="satellite")return;
    const seasonal=rc30SanitizeProfiles(this._rc27Control.seasonal_profiles,this._rc27Control.pump);
    if(seasonal.source!=="adaptive")return;
    const confirmed=typeof window.confirm!=="function"||window.confirm("Suspendre le programme adaptatif ?\n\nLes horaires actuellement appliqués seront figés. Aucun recalcul automatique ne sera effectué jusqu’à ce que vous choisissiez explicitement de reprendre l’adaptatif.");
    if(!confirmed)return;
    seasonal.source="suspended";seasonal.suspended_at=new Date().toISOString();
    await this.saveRc27Control(rc27Merge(this._rc27Control,{seasonal_profiles:seasonal}));
  }
  async rc30StopAdaptiveSchedule(){
    if(this._rc27Control?.coordination?.role==="satellite")return;
    let seasonal=rc30SanitizeProfiles(this._rc27Control.seasonal_profiles,this._rc27Control.pump);seasonal.source="custom";seasonal.last_adaptive_signature="";seasonal.suspended_at="";seasonal.manual_revision=Date.now();
    await this.saveRc27Control(rc27Merge(this._rc27Control,{seasonal_profiles:seasonal}));
  }
  async rc30FollowAstronomical(){
    if(this._rc27Control?.coordination?.role==="satellite")return;
    let control=this._rc27Control,seasonal=rc30SanitizeProfiles(control.seasonal_profiles,control.pump);seasonal.follow_astronomical=true;seasonal.current=determinerProfilSaisonnierDeReference();control=rc27Merge(control,{seasonal_profiles:seasonal});
    if(seasonal.source==="adaptive"){const recommendation=this.rc30AdaptiveRecommendation(control,this._rc30LastTreatmentModel);seasonal.last_adaptive_signature=recommendation.signature;control=rc27Merge(control,{seasonal_profiles:seasonal,pump:{weekdays:recommendation.weekdays,periods:recommendation.periods}})}
    await this.saveRc27Control(control);
  }
  async rc30SaveCurrentAsProfileBase(){
    if(this._rc27Control?.coordination?.role==="satellite")return;
    const seasonal=rc30SanitizeProfiles(this._rc27Control.seasonal_profiles,this._rc27Control.pump),definition=PROFILS_SAISONNIERS[seasonal.current];
    const confirmed=typeof window.confirm!=="function"||window.confirm(`Mémoriser la programmation actuelle comme nouvelle base de « ${definition.label} » ?\n\nCela modifie uniquement la référence de ce profil. La programmation en cours reste inchangée.`);
    if(!confirmed)return;
    await this.saveRc27Control(rc30RememberActiveProfile(this._rc27Control));
  }
  renderRc27Section(model,adaptiveRecommendation=null){
    this._rc30LastTreatmentModel=model;
    const control=this._rc27Control||rc27SanitizeControl(),coordination=control.coordination||RC27_DEFAULT_CONTROL.coordination,isMaster=coordination.role!=="satellite",satelliteManualAllowed=coordination.allow_satellite_manual!==false;
    const adaptive=adaptiveRecommendation||this.rc30AdaptiveRecommendation(control,model);
    const pumpEntity=control.pump.entity_id?this._hass?.states?.[control.pump.entity_id]:null;
    const lightEntity=control.light.entity_id?this._hass?.states?.[control.light.entity_id]:null;
    const pumpOn=pumpEntity?.state==="on",lightOn=lightEntity?.state==="on";
    const pac=control.pac||RC27_DEFAULT_CONTROL.pac,pacModel=this.rc30PacModel(pac);
    const pumpHours=Number(control.pump.scheduled_hours??rc27ScheduledHours(control.pump.periods));
    const basePumpHours=Number(control.pump.base_scheduled_hours??rc27ScheduledHours(control.pump.periods));
    const recommended=Number(model.filtrationHours||0),difference=basePumpHours-recommended;
    const sourceProgrammationProlongation=rc30SanitizeProfiles(control.seasonal_profiles,control.pump).source;
    const etatProlongation=construireEtatProlongationPourAffichage({sourceProgrammation:sourceProgrammationProlongation,heuresRecommandees:recommended,heuresProgrammeesBase:basePumpHours,minutesProposeesBackend:control.pump.proposed_extension_minutes,statutBackend:control.pump.extension_status,finProposeeBackend:control.pump.proposed_end,minutesValideesBackend:control.pump.approved_extension_minutes});
    const missingHours=etatProlongation.heuresManquantes,proposedMinutes=etatProlongation.minutesProposees;
    const extensionStatus=etatProlongation.statut,proposedEnd=etatProlongation.finProposee,approvedMinutes=etatProlongation.minutesValidees;
    const filtrationPerf=this.filtrationPerformance(model);
    const boostUntil=new Date(control.boost_until||0).getTime()>Date.now()?control.boost_until:null;
    const pumpNext=control.pump.next_boundary?new Date(control.pump.next_boundary).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}):"—";
    const basePumpNext=control.pump.base_next_boundary?new Date(control.pump.base_next_boundary).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}):pumpNext;
    const lightNext=control.light.next_boundary?new Date(control.light.next_boundary).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}):"—";
    const rawPumpOverride=control.overrides?.pump||null;
    const prioriteProgrammation=evaluerPrioriteProgrammation({source:rc30SanitizeProfiles(control.seasonal_profiles,control.pump).source,overridePompe:rawPumpOverride});
    const pumpOverride=prioriteProgrammation.overrideActif;
    const pumpOverridePersistent=prioriteProgrammation.forcageManuelPersistant;
    const lightOverride=control.overrides?.light?.until&&new Date(control.overrides.light.until).getTime()>Date.now()?control.overrides.light:null;
    const pumpStatus=boostUntil?`Boost actif ${rc27RelativeDate(boostUntil)}`:pumpOverridePersistent?`Forçage manuel prioritaire : ${pumpOverride.state==="on"?"marche":"arrêt"} · programme suspendu`:pumpOverride?`Dérogation manuelle jusqu’à ${pumpNext}`:control.pump.mode==="manual"?"Commande manuelle":control.pump.mode==="automatic"&&extensionStatus==="approved"?`Prolongation validée jusqu’à ${proposedEnd}`:`${pumpOn?"En marche":"À l’arrêt"} par programme jusqu’à ${basePumpNext}`;
    const lightStatus=lightOverride?`Dérogation manuelle jusqu’à ${lightNext}`:control.light.mode==="manual"?"Commande manuelle":`${lightOn?"Allumé":"Éteint"} par programme jusqu’à ${lightNext}`;
    const camera=control.camera_entity?this._hass?.states?.[control.camera_entity]:null;
    const picture=camera?.attributes?.entity_picture|| (control.camera_entity?`/api/camera_proxy/${control.camera_entity}`:"");
    const cameraUrl=picture&&this._hass?.hassUrl?this._hass.hassUrl(picture):picture;
    const today=this.rc27TodayActions(model),maintenance=this.rc27MaintenanceRows(),quality=this.rc27DataQuality(),stock=this.rc27StockEstimate(model);
    const controlHistory=(control.history||[]).slice(0,10);
    return`<section class="v3-section rc27-operations ${this.rc271SectionClass("operations")}" id=rc27-operations data-rc271-section=operations>
      <header class=v3-section__header ${this.rc271HeaderAttributes("operations")}><span class=v3-section__icon>🎛️</span><div><h2>Pilotage & actions</h2><p>Priorités, programmations Home Assistant et équipements de la piscine</p></div><b class="rc27-backend ${control.backend_available?isMaster?"is-ready":"is-satellite":"is-offline"}">${control.backend_available?isMaster?`Maître · ${rc24Escape(coordination.site_name||"local")}`:`Satellite · maître ${rc24Escape(coordination.peer_name||"distant")}`:"Redémarrage requis"}</b>${this.rc271Chevron("operations")}</header>
      <h3 class=rc27-today-title>À faire aujourd’hui</h3>
      <div class=rc27-today>${today.length?today.map((item,index)=>`<article class="is-${item.tone}"><i>${item.icon}</i><span><small>Priorité ${index+1}</small><b>${rc24Escape(item.title)}</b><em>${rc24Escape(item.detail)}</em></span>${item.focus?`<button type=button data-treatment-focus>Ouvrir</button>`:item.maintenance?`<button type=button data-rc27-maintenance="${item.maintenance}">Fait</button>`:""}</article>`).join(""):`<article class=is-good><i>✓</i><span><small>Aujourd’hui</small><b>Aucune action prioritaire</b><em>Les paramètres et échéances renseignés sont à jour.</em></span></article>`}</div>
      <div class=rc27-control-grid>
        <article class="v3-info-card rc27-equipment ${pumpOn?"is-on":""}">
          <header><span>⚙️</span><h3>Pompe de filtration</h3><b>${pumpOn?"En marche":"Arrêtée"}</b></header>
          <div class=rc27-equipment-main><strong>${this.rc27EntityValue(control.pump.power_entity)}</strong>${control.pump.energy_entity?`<em>Énergie : ${this.rc27EntityValue(control.pump.energy_entity)}</em>`:""}<small>${pumpStatus}</small></div>
          <div class=rc27-control-buttons><button type=button data-rc27-control="pump:on" ${!isMaster&&!satelliteManualAllowed?"disabled":""}>Démarrer</button><button type=button class=is-stop data-rc27-control="pump:off" ${!isMaster&&!satelliteManualAllowed?"disabled":""}>Arrêter</button></div>
          ${pumpOverridePersistent?`<div class="rc282-extension is-approved"><div><b>Forçage manuel actif</b><small>Le programmateur ne changera plus l’état de la pompe tant que vous ne reprenez pas explicitement le programme.</small></div><button type=button data-rc27-control="pump:auto" ${!isMaster?"disabled":""}>Reprendre le programme</button></div>`:""}
          <div class=rc27-boost><span>Boost filtration</span>${[1,2,4].map(hours=>`<button type=button data-rc27-boost="${hours}" ${!isMaster?"disabled":""}>${hours} h</button>`).join("")}${boostUntil?`<button type=button data-rc27-boost="0" ${!isMaster?"disabled":""}>Annuler</button>`:""}</div>
          <div class=rc27-schedule-balance><span><b>${this.formatHours(basePumpHours)}</b> plage configurée</span><span><b>${recommended?this.formatHours(recommended):"—"}</b> recommandation indicative</span><em class="${difference<0?"is-short":"is-good"}">${recommended?difference<0?`Il manque ${this.formatHours(Math.abs(difference))}`:`Marge ${this.formatHours(difference)}`:"Conseil indisponible"}</em></div>
          ${control.pump.mode==="automatic"?`<div class="rc282-extension is-${extensionStatus}">${extensionStatus==="approved"?`<div><b>Prolongation validée aujourd’hui</b><small>+${this.formatHours(approvedMinutes/60)} · fin prévue ${proposedEnd}. La programmation permanente reste inchangée.</small></div><button type=button data-rc282-extension=reset ${!isMaster?"disabled":""}>Annuler</button>`:missingHours<=0?`<div><b>Programme suffisant</b><small>La plage configurée couvre la recommandation du jour.</small></div>`:extensionStatus==="ignored"?`<div><b>Prolongation ignorée aujourd’hui</b><small>Arrêt normal à ${basePumpNext}. La proposition expirera à minuit.</small></div><button type=button data-rc282-extension=reset ${!isMaster?"disabled":""}>Reproposer</button>`:`<div><b>Prolongation proposée</b><small>Il manque ${this.formatHours(missingHours)}. Fin normale ${basePumpNext}, fin proposée ${proposedEnd}.</small></div><span><button type=button data-rc282-extension=approve ${!isMaster?"disabled":""}>Valider aujourd’hui</button><button type=button class=is-secondary data-rc282-extension=ignore ${!isMaster?"disabled":""}>Ignorer</button></span>`}</div>`:""}
          <div class=rc281-pump-performance><span><small>${filtrationPerf.actual?"Réel aujourd’hui":"Prévu aujourd’hui"}</small><b>${this.formatHours(filtrationPerf.hours)}</b></span><span><small>Volume théorique</small><b>${filtrationPerf.filtered===null?"—":Math.round(filtrationPerf.filtered)+" m³"}</b></span><span><small>Renouvellements</small><b>${filtrationPerf.turnovers===null?"—":filtrationPerf.turnovers.toFixed(1)}</b></span><em>${filtrationPerf.actual?"Historique de la pompe":"Programme prévu"}</em></div>
        </article>
        ${this.rc30RenderPacCard(pacModel)}
        <article class="v3-info-card rc27-equipment ${lightOn?"is-on":""}">
          <header><span>💡</span><h3>Éclairage piscine</h3><b>${lightOn?"Allumé":"Éteint"}</b></header>
          <div class=rc27-equipment-main><strong>${this.rc27EntityValue(control.light.power_entity)}</strong><small>${lightStatus}</small></div>
          <div class=rc27-control-buttons><button type=button data-rc27-control="light:on" ${!isMaster&&!satelliteManualAllowed?"disabled":""}>Allumer</button><button type=button class=is-stop data-rc27-control="light:off" ${!isMaster&&!satelliteManualAllowed?"disabled":""}>Éteindre</button></div>
          <div class=rc27-light-timer><span>Extinction automatique</span><b>${Number(control.light.auto_off_minutes||0)?`${control.light.auto_off_minutes} min`:"désactivée"}</b></div>
        </article>
        <article class="v3-info-card rc27-camera">
          <header><span>📷</span><h3>Caméra piscine</h3><b>${camera?.state||"Non configurée"}</b></header>
          ${cameraUrl?`<button type=button class=rc27-camera-view data-rc27-camera><img src="${rc24Escape(cameraUrl)}" alt="Vue de la piscine" loading=lazy><span>Ouvrir en grand</span></button>`:`<div class=rc27-camera-empty><span>📷</span><p>Sélectionnez une entité caméra dans les paramètres de pilotage.</p></div>`}
        </article>
      </div>
      <div class=rc27-insights>
        <article><span>📦</span><div><small>Stock et autonomie</small><b>${stock.stock===null?"Stock à renseigner":`${Math.round(stock.stock)} g restants`}</b><em>${stock.weeks===null?"Ajoutez le stock dans le profil du bassin":`environ ${stock.weeks.toFixed(1)} semaine(s) au rythme d’entretien`}</em></div></article>
        <article><span>${quality.length?"📡":"✅"}</span><div><small>Qualité des mesures</small><b>${quality.length?`${quality.length} point(s) à vérifier`:"Mesures cohérentes"}</b><em>${quality[0]||"Aucune anomalie ou mesure figée détectée"}</em></div></article>
        <article><span>🗓️</span><div><small>Entretien</small><b>${maintenance.filter(row=>row.due).length} échéance(s)</b><em>${maintenance.find(row=>row.due)?.label||`Prochaine : ${maintenance.sort((a,b)=>a.next-b.next)[0]?.label||"—"}`}</em></div></article>
      </div>
      <details class="rc27-settings ${this._rc27ConfigOpen?"is-open":""}" ${this._rc27ConfigOpen?"open":""}><summary>Configurer les entités, horaires et notifications</summary>
        ${this.rc30CoordinationCard(control)}
        ${this.rc30SeasonalProfileCard(control,model,adaptive)}
        ${this.rc27ScheduleEditor("pump","Programmation de la pompe")}
        ${this.rc30PacConfigEditor()}
        ${this.rc27ScheduleEditor("light","Programmation de l’éclairage")}
        <div class=rc27-config-grid>
          ${this.rc30EntityPicker("Caméra","camera_entity",["camera"],control.camera_entity,"Sélectionner une caméra")}
          <label><span>Service de notification</span><select data-rc27-path="notify_service">${this.rc27NotifyOptions(control.notify_service)}</select></label>
          <label class=rc27-check><input type=checkbox data-rc27-path="notifications_enabled" ${control.notifications_enabled?"checked":""}><span>Notifications automatiques activées</span></label>
          <button type=button class=rc27-test-notify data-rc27-notify-test>Tester la notification</button>
        </div>
        <p>Les programmes sont exécutés par Home Assistant même lorsque ce dashboard est fermé. Les boutons Démarrer et Arrêter de la pompe créent un forçage manuel prioritaire et persistant : aucune plage, prolongation ou changement de saison ne peut remettre la pompe dans l’autre état tant que « Reprendre le programme » n’a pas été choisi. La PAC dispose maintenant de ses propres jours et plages horaires ; par sécurité, son programme peut être conditionné à une filtration réellement en marche. Les commandes PAC manuelles sont émises uniquement par l’instance maître et passent par les entités stables Home Assistant.</p>
      </details>
      <details class=rc27-maintenance><summary>Carnet d’entretien et historique</summary>
        <div class=rc27-maintenance-grid>${maintenance.map(row=>`<article class="${row.due?"is-due":""}"><span>${row.icon}</span><div><b>${row.label}</b><small>${row.last?`Dernier : ${rc27DateTime(row.last.date)}`:"Jamais enregistré"}</small><em>${row.due?"À effectuer":`Prochain ${rc27RelativeDate(row.next)}`}</em></div><button type=button data-rc27-maintenance="${row.kind}">Fait</button></article>`).join("")}</div>
        <div class=rc27-log-tools><button type=button data-rc27-export>Exporter le journal CSV</button>${controlHistory.length?`<button type=button class=is-danger data-rc27-clear-history>Effacer l’historique de pilotage</button>`:""}</div>
        <ol class=rc27-control-log>${controlHistory.length?controlHistory.map(item=>`<li><time>${rc27DateTime(item.date)}</time><span>${item.target==="pump"?"Pompe":item.target==="pac"?"PAC":"Éclairage"} · ${item.state==="on"?"marche":item.state==="off"?"arrêt":item.state} · ${rc24Escape(item.reason||"")}</span></li>`).join(""):`<li>Aucune commande enregistrée.</li>`}</ol>
      </details>
    </section>`;
  }
  async rc27ControlEquipment(target,state){
    if(target==="pump"&&state==="off"&&(this._rc24TreatmentModel?.filtrationMode==="continuous"||(this._treatmentHistory||[]).some(item=>item.next_measure_at&&new Date(item.next_measure_at).getTime()>Date.now()))){
      const confirmed=typeof window.confirm!=="function"||window.confirm("Une filtration renforcée ou un délai après traitement est en cours. Confirmer l’arrêt de la pompe ?");
      if(!confirmed)return;
    }
    try{
      if(this._rc27Control.backend_available&&this._hass?.callWS){
        const response=await this._hass.callWS({type:"ha_pool_dashboard/control",target,state});
        this._rc27Control=rc27SanitizeControl({...response,backend_available:true});
      }else{
        const entityId=this._rc27Control[target].entity_id,domain=entityId?.split(".")[0];
        if(state!=="auto"&&entityId&&domain)this._hass?.callService(domain,state==="on"?"turn_on":"turn_off",{}, {entity_id:entityId});
      }
      writeRc27Control(this._rc27Control);this.render();
    }catch(_error){this._rc27Control.backend_available=false;this.render()}
  }
  async rc27Boost(hours){
    if(!this._hass?.callWS)return;
    try{const response=await this._hass.callWS({type:"ha_pool_dashboard/boost",hours});this._rc27Control=rc27SanitizeControl({...response,backend_available:true});writeRc27Control(this._rc27Control);this.render()}catch(_error){}
  }
  async rc282Extension(action){
    if(!this._hass?.callWS)return;
    try{
      const response=await this._hass.callWS({type:"ha_pool_dashboard/extension",action});
      this._rc27Control=rc27SanitizeControl({...response,backend_available:true});
      writeRc27Control(this._rc27Control);this.render();
    }catch(_error){this._rc27Control.backend_available=false;this.render()}
  }
  rc27RecordMaintenance(kind){
    const labels={maintenance_baskets:"Paniers et préfiltre nettoyés",maintenance_waterline:"Ligne d’eau nettoyée",maintenance_filter:"Filtre contrôlé / nettoyé",maintenance_calibration:"Sondes contrôlées / calibrées"};
    this.recordTreatment({kind,label:labels[kind]||"Entretien effectué",product:"Entretien",detail:labels[kind]||"Entretien effectué"});
  }
  rc27ExportCsv(){
    const rows=[["date","catégorie","action","produit","dose","unité","détail"]];
    (this._treatmentHistory||[]).forEach(item=>rows.push([item.date,"traitement",item.kind,item.product||"",item.dose_amount??"",item.dose_unit||"",item.detail||""]));
    (this._rc27Control.history||[]).forEach(item=>rows.push([item.date,"pilotage",`${item.target}:${item.state}`,"","","",item.reason||""]));
    const csv=rows.map(row=>row.map(value=>`"${String(value??"").replaceAll('"','""')}"`).join(";")).join("\n");
    const blob=new Blob(["\ufeff",csv],{type:"text/csv;charset=utf-8"}),url=URL.createObjectURL(blob),link=document.createElement("a");
    link.href=url;link.download=`ha-pool-dashboard-${new Date().toISOString().slice(0,10)}.csv`;link.click();URL.revokeObjectURL(url);
  }
  bindRc27Controls(){
    const details=this.shadowRoot.querySelector?.(".rc27-settings");
    details?.addEventListener("toggle",()=>{
      this._rc27ConfigOpen=details.open;
      if(!details.open)this.rc30FlushBackgroundRender();
    });
    details?.addEventListener("focusout",()=>setTimeout(()=>this.rc30FlushBackgroundRender(),0));
    this.shadowRoot.querySelectorAll("[data-rc30-entity-picker]").forEach(picker=>{
      const trigger=picker.querySelector("[data-rc30-entity-trigger]"),search=picker.querySelector("[data-rc30-entity-search]"),options=[...picker.querySelectorAll("[data-rc30-entity-option]")],empty=picker.querySelector(".rc30-entity-picker__empty");
      const close=()=>{picker.classList.remove("is-open");trigger?.setAttribute("aria-expanded","false")};
      const filter=()=>{const query=rc26Normalize(search?.value||"");let visible=0;options.forEach(option=>{const match=!query||rc26Normalize(option.textContent||"").includes(query);option.hidden=!match;if(match)visible+=1});if(empty)empty.hidden=visible>0};
      trigger?.addEventListener("click",()=>{
        const open=!picker.classList.contains("is-open");
        this.shadowRoot.querySelectorAll(".rc30-entity-picker.is-open,.rc30-choice-picker.is-open").forEach(other=>{if(other!==picker){other.classList.remove("is-open");other.querySelector("[aria-expanded]")?.setAttribute("aria-expanded","false")}});
        picker.classList.toggle("is-open",open);trigger.setAttribute("aria-expanded",String(open));
        if(open){this._rc27ConfigOpen=true;if(search){search.value="";filter();requestAnimationFrame(()=>search.focus())}}
      });
      search?.addEventListener("input",filter);
      search?.addEventListener("keydown",event=>{if(event.key==="Escape"){event.preventDefault();close();trigger?.focus()}else if(event.key==="Enter"){const first=options.find(option=>!option.hidden);if(first){event.preventDefault();first.click()}}});
      options.forEach(option=>option.addEventListener("click",()=>{
        this._rc27ConfigOpen=true;
        const value=option.dataset.rc30EntityOption||"",path=picker.dataset.rc27Path;
        const next=rc27SetPath(this._rc27Control,path,value);
        options.forEach(item=>item.classList.toggle("is-selected",item===option));
        const valueNode=trigger?.querySelector("span"),labelNode=option.querySelector("b"),metaNode=option.querySelector("small");
        if(valueNode&&labelNode&&metaNode)valueNode.innerHTML=`<b>${rc24Escape(labelNode.textContent)}</b><small>${rc24Escape(metaNode.textContent)}</small>`;
        this._rc30PendingBackgroundRender=true;
        this.saveRc27Control(next,{render:false});
        close();trigger?.focus();
      }));
      picker.addEventListener("focusout",()=>setTimeout(()=>{const active=this.shadowRoot?.activeElement;if(!active||!picker.contains(active))close()},0));
    });
    this.shadowRoot.querySelectorAll("select[data-rc27-path],input[data-rc27-path]").forEach(control=>control.addEventListener("change",()=>{
      this._rc27ConfigOpen=true;
      const path=control.dataset.rc27Path,value=control.type==="checkbox"?control.checked:control.type==="number"?Number(control.value):control.value;
      const oldValue=String(path).split(".").reduce((cursor,key)=>cursor?.[Number.isInteger(Number(key))&&key!==""?Number(key):key],this._rc27Control);
      if(path==="coordination.role"&&value!==oldValue){
        const message=value==="master"?"Cette instance va devenir MAÎTRE et pourra exécuter les programmations locales. Vérifiez que l’autre Home Assistant est bien en mode Satellite. Continuer ?":"Cette instance va devenir SATELLITE : ses programmations automatiques locales seront immédiatement neutralisées. Continuer ?";
        const confirmed=typeof window.confirm!=="function"||window.confirm(message);
        if(!confirmed){control.value=oldValue;this.rc30SyncChoiceSelect(control);return}
      }
      let next=rc27SetPath(this._rc27Control,path,value);
      const manualPumpEdit=path.startsWith("pump.periods");
      if(manualPumpEdit)next=rc30MarkCustomSchedule(next);
      this._rc30PendingBackgroundRender=!manualPumpEdit;
      this.saveRc27Control(next,{render:manualPumpEdit||path==="coordination.role"});
    }));
    this.shadowRoot.querySelectorAll("[data-rc27-weekday]").forEach(button=>button.addEventListener("click",()=>{
      this._rc27ConfigOpen=true;
      const target=button.dataset.rc27Target,day=button.dataset.rc27Weekday,days=[...this._rc27Control[target].weekdays];
      const next=days.includes(day)?days.filter(item=>item!==day):[...days,day];
      let updated=rc27SetPath(this._rc27Control,`${target}.weekdays`,next);
      if(target==="pump")updated=rc30MarkCustomSchedule(updated);
      button.classList.toggle("is-active",next.includes(day));
      this._rc30PendingBackgroundRender=target!=="pump";
      this.saveRc27Control(updated,{render:target==="pump"});
    }));
    this.shadowRoot.querySelectorAll("[data-rc30-profile]").forEach(select=>select.addEventListener("change",()=>this.rc30SelectSeasonalProfile(select.value)));
    this.shadowRoot.querySelectorAll("[data-rc30-resume-adaptive]").forEach(button=>button.addEventListener("click",()=>this.rc30ResumeAdaptiveSchedule()));
    this.shadowRoot.querySelectorAll("[data-rc30-suspend-adaptive]").forEach(button=>button.addEventListener("click",()=>this.rc30SuspendAdaptiveSchedule()));
    this.shadowRoot.querySelectorAll("[data-rc30-stop-adaptive]").forEach(button=>button.addEventListener("click",()=>this.rc30StopAdaptiveSchedule()));
    this.shadowRoot.querySelectorAll("[data-rc30-follow-astronomical]").forEach(button=>button.addEventListener("click",()=>this.rc30FollowAstronomical()));
    this.shadowRoot.querySelectorAll("[data-rc30-save-profile-base]").forEach(button=>button.addEventListener("click",()=>this.rc30SaveCurrentAsProfileBase()));
    this.shadowRoot.querySelectorAll("[data-rc27-control]").forEach(button=>button.addEventListener("click",()=>{const [target,state]=button.dataset.rc27Control.split(":");this.rc27ControlEquipment(target,state)}));
    this.shadowRoot.querySelectorAll("[data-rc30-pac-sim]").forEach(button=>button.addEventListener("click",async()=>{
      try{await this.rc30PacCommanderMarche(button.dataset.rc30PacSim==="on")}catch(error){this.rc30PacAfficherErreur(error)}
    }));
    this.shadowRoot.querySelectorAll("[data-rc30-pac-gauge]").forEach(ring=>{
      const update=event=>{const value=this.rc30PacGaugeValueFromPointer(event,ring);if(value!==null)this.rc30PacGaugeApplyDraft(value,ring)};
      ring.addEventListener("pointerdown",event=>{if(event.target?.closest?.("[data-rc30-pac-confirm]"))return;event.preventDefault();this._rc30PacGaugeDragging=true;ring.classList.add("is-dragging");ring.setPointerCapture?.(event.pointerId);update(event)});
      ring.addEventListener("pointermove",event=>{if(!this._rc30PacGaugeDragging)return;event.preventDefault();update(event)});
      const finish=event=>{if(!this._rc30PacGaugeDragging)return;this._rc30PacGaugeDragging=false;ring.classList.remove("is-dragging");try{ring.releasePointerCapture?.(event.pointerId)}catch(_error){}};
      ring.addEventListener("pointerup",finish);ring.addEventListener("pointercancel",finish);
      ring.addEventListener("keydown",event=>{
        const {min,max,step}=this.rc30PacGaugeLimits(),current=Number.isFinite(this._rc30PacDraftSetpoint)?this._rc30PacDraftSetpoint:this.rc30PacGaugeDisplayValue(this.rc30PacModel(this._rc27Control?.pac||{}));
        let next=null;if(["ArrowUp","ArrowRight"].includes(event.key))next=current+step;else if(["ArrowDown","ArrowLeft"].includes(event.key))next=current-step;else if(event.key==="Home")next=min;else if(event.key==="End")next=max;else if(event.key==="Enter"){this.shadowRoot.querySelector("[data-rc30-pac-confirm]")?.click();return}
        if(next!==null){event.preventDefault();this.rc30PacGaugeApplyDraft(Math.max(min,Math.min(max,next)),ring)}
      });
    });
    this.shadowRoot.querySelectorAll("[data-rc30-pac-confirm]").forEach(button=>button.addEventListener("click",async event=>{
      event.preventDefault?.();event.stopPropagation?.();
      const value=Number(this._rc30PacDraftSetpoint);if(!Number.isFinite(value))return;
      try{
        const sent=await this.rc30PacCommanderConsigne(value);
        if(sent){this._rc30PacDraftSetpoint=null;this._rc30PendingBackgroundRender=false}
      }catch(error){this.rc30PacAfficherErreur(error)}
    }));
    const pacModeChange=async()=>{
      const operation=this.shadowRoot.querySelector("[data-rc30-pac-operation]")?.value||"",regulation=this.shadowRoot.querySelector("[data-rc30-pac-regulation]")?.value||"smart";
      const option=this.rc30PacResolveSelectOption(operation,regulation);
      if(this.rc30PacPeutCommander()&&option){this.rc30PacDemarrerModeEnAttente(option);this.render()}
      try{
        const sent=await this.rc30PacCommanderMode(operation,regulation);
        if(!sent&&this._rc30PacPendingMode?.option===option)this.rc30PacAnnulerModeEnAttente({rendre:true});
      }catch(error){if(this._rc30PacPendingMode?.option===option)this.rc30PacAnnulerModeEnAttente({rendre:true});this.rc30PacAfficherErreur(error)}
    };
    this.shadowRoot.querySelectorAll("[data-rc30-pac-operation],[data-rc30-pac-regulation]").forEach(select=>select.addEventListener("change",pacModeChange));
    this.shadowRoot.querySelectorAll("[data-rc27-boost]").forEach(button=>button.addEventListener("click",()=>this.rc27Boost(Number(button.dataset.rc27Boost))));
    this.shadowRoot.querySelectorAll("[data-rc282-extension]").forEach(button=>button.addEventListener("click",()=>this.rc282Extension(button.dataset.rc282Extension)));
    this.shadowRoot.querySelectorAll("[data-rc27-maintenance]").forEach(button=>button.addEventListener("click",()=>this.rc27RecordMaintenance(button.dataset.rc27Maintenance)));
    this.shadowRoot.querySelectorAll("[data-rc27-camera]").forEach(button=>button.addEventListener("click",()=>this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:this._rc27Control.camera_entity},bubbles:true,composed:true}))));
    this.shadowRoot.querySelectorAll("[data-rc27-export]").forEach(button=>button.addEventListener("click",()=>this.rc27ExportCsv()));
    this.shadowRoot.querySelectorAll("[data-rc27-clear-history]").forEach(button=>button.addEventListener("click",async()=>{if(typeof window.confirm==="function"&&!window.confirm("Effacer l’historique de pilotage ?"))return;try{const response=await this._hass.callWS({type:"ha_pool_dashboard/clear_history"});this._rc27Control=rc27SanitizeControl({...response,backend_available:true});this.render()}catch(_error){}}));
    this.shadowRoot.querySelectorAll("[data-rc27-notify-test]").forEach(button=>button.addEventListener("click",()=>this._hass?.callWS?.({type:"ha_pool_dashboard/test_notification"}).catch(()=>{})));
  }
  deviceAnomalies(device){
    const issues=[];
    const number=key=>{const id=device.entities?.[key],s=id?this._hass?.states?.[id]:null,v=Number.parseFloat(s?.state);return Number.isFinite(v)?v:null};
    const ph=number("ph"),orp=number("orp"),battery=number("battery"),signal=number("bluetooth_signal");
    if(ph!==null&&(ph<6.5||ph>8.2))issues.push("pH improbable");
    if(orp!==null&&(orp<300||orp>1000))issues.push("ORP improbable");
    if(battery!==null&&battery<20)issues.push("Batterie faible");
    if(signal!==null&&signal<-90)issues.push("Bluetooth faible");
    return issues;
  }

  relativeTime(value){
    if(!value||value==="—")return"Mesure indisponible";
    const date=new Date(value);
    if(Number.isNaN(date.getTime()))return"Mesure disponible";
    const minutes=Math.max(0,Math.round((Date.now()-date.getTime())/60000));
    if(minutes<1)return"Synchronisé à l’instant";
    if(minutes<60)return`Synchronisé il y a ${minutes} min`;
    return`Synchronisé il y a ${Math.round(minutes/60)} h`;
  }

  deviceCard(d,index){
    const enabled=this.deviceEnabled(d,index),fresh=this.deviceFresh(d);
    const temp=this.displayTemperature(this.deviceReading(d,"temperature")),battery=this.deviceReading(d,"battery"),bt=this.deviceReading(d,"bluetooth_signal"),last=this.deviceReading(d,"last_analysis");
    const[key,label]=this.specific(d),specific=key?this.deviceReading(d,key):null;
    const analysisEntity=this.analysisEntity(d),statusEntity=this.analysisStatusEntity(d),statusReading=statusEntity?readEntity(this,statusEntity):null;
    const liveAnalysis=this.normalizeAnalysisStatus(statusReading,index),busy=this.analysisBusy(index);
    const analysisStatus=busy||["done","error"].includes(liveAnalysis.phase)?liveAnalysis:!enabled?{phase:"disabled",label:"Désactivé pour les calculs",progress:0,detail:"La mesure manuelle reste disponible ; l’appareil est ignoré dans les moyennes et recommandations"}:!fresh?{phase:"offline",label:"Donnée trop ancienne",progress:0,detail:"Appareil écarté temporairement des calculs"}:liveAnalysis;
    const anomalies=enabled?this.deviceAnomalies(d):[];
    const trend=smartTrend(this._history?.temperature||[],"temperature");
    return rendreCarteCapteur({
      index,
      nom:d.name,
      marque:d.brand,
      actif:enabled,
      recent:fresh,
      synchronisation:this.relativeTime(last.value),
      temperature:temp,
      tendance:trend,
      jaugePhHtml:this.gauge(d,"ph","pH"),
      jaugeOrpHtml:this.gauge(d,"orp","ORP"),
      mesureSpecifique:specific?{label,value:specific.value,unit:specific.unit,percent:this.pct(key,specific.number)}:null,
      statutAnalyse:analysisStatus,
      batterie:battery,
      bluetooth:bt,
      derniereAnalyse:formatDate(this,last.value),
      analyseDisponible:Boolean(analysisEntity),
      analyseOccupee:busy,
      anomalies,
      icones:{battery:ICONS.battery,bluetooth:ICONS.bluetooth,calendar:ICONS.calendar,flask:ICONS.flask},
    });
  }

  rc284FonctionnaliteEauMeteoActive(){return this.config?.fonctionnalites_experimentales?.moteurEauMeteoV1===true||FONCTIONNALITES_EXPERIMENTALES.moteurEauMeteoV1===true}
  rc288ObservationsCapteurs(){return (this.config?.devices||[]).map((device,index)=>({device,index})).filter(({device,index})=>this.deviceEnabled(device,index)&&this.deviceFresh(device)).map(({device,index})=>({identifiant:device.id||device.name||`source-${index+1}`,libelle:device.name||device.brand||`Source ${index+1}`,temperatureEauC:this.deviceReading(device,"temperature").number,ph:this.deviceReading(device,"ph").number,redoxMv:this.deviceReading(device,"orp").number}))}
  rc285EvaluationEauMeteo(){return evaluerRecommandationEauMeteoTempsReelRc285({actif:this.rc284FonctionnaliteEauMeteoActive(),hass:this._hass,configurationCarte:this.config,temperatureEauC:this.aggregate("temperature").number,ph:this.aggregate("ph").number,redoxMv:this.aggregate("orp").number,observationsCapteurs:this.rc288ObservationsCapteurs(),alerteMeteo:this.currentWeatherAlert(),maintenant:new Date()})}
  renderRecommandationEauMeteoExperimentale(){const evaluation=this.rc285EvaluationEauMeteo();return evaluation?creerHtmlRecommandationEauMeteoRc284(evaluation):""}
  render(){
    if(!this.config)return;
    if(!this.shadowRoot)this.attachShadow({mode:"open"});
    // FIX14.4.1 : sauvegarder l'ascenseur de la popup avant de reconstruire le DOM.
    this.rc30CaptureAssistantExpertScroll();
    const theme=THEMES[resolveTheme(this.config.visual_theme)]||THEMES.ocean;
    const temp=this.aggregate("temperature");
    const displayTemp=this.displayTemperature(temp);
    const last=this.aggregate("last_analysis");
    const aggregated=this.aggregateHealth();
    const h=aggregated.result;
    const weather=this.currentWeather();
    const weatherAlert=this.currentWeatherAlert();
    const weatherAlertOptions=this.weatherAlertOptions();
    const comparisons=this.comparisonRows();
    const recent=this.recentAnalyses();
    const smart=this.smartStatus(aggregated,comparisons,h.score);
    const confidence=smartConfidence(comparisons,aggregated.usableCount,aggregated.activeCount,aggregated.completeCount);
    const breakdown=smartBreakdown(aggregated,comparisons);
    const treatmentModel=this.treatmentModel(aggregated,weatherAlert);
    const smartAdviceLines=this.smartAdvice(aggregated,comparisons);
    const adaptiveRecommendation=this.rc30AdaptiveRecommendation(rc27SanitizeControl(this._rc27Control||{}),treatmentModel);
    const assistantExpertModel=this.rc30AssistantExpertModel({aggregated,smart,confidence,comparisons,weather,weatherAlert,treatmentModel,adaptiveRecommendation,smartAdviceLines});
    const geminiPayload=construirePayloadGemini(assistantExpertModel);
    const geminiSignature=signaturePayloadGemini(geminiPayload);
    if(this._rc30GeminiState?.signature&&this._rc30GeminiState.signature!==geminiSignature)this._rc30GeminiState={statut:"idle",message:"",texte:"",signature:""};
    this._rc30GeminiPayload=geminiPayload;
    const assistantExpertHtml=creerHtmlAssistantExpert(assistantExpertModel,{gemini:this._rc30GeminiState||{statut:"idle"}});
    const phAssessment=aggregated.usableCount===0?{score:0,tone:"neutral",label:"Suspendu",detail:"Aucune source récente exploitable."}:rc28PhAssessment(aggregated.ph.number);
    const enabledCount=this.activeDevices().length;
    const sourceLabel=this.measurementSourceLabel();
    const confidenceDetail=confidence===100?(aggregated.activeCount===1?"Une source active, complète et récemment synchronisée.":"Toutes les sources actives sont complètes et exploitables."):aggregated.completeCount<aggregated.activeCount?"Au moins une source activée est ancienne ou incomplète.":this._comparisonMeta?.state==="time_gap"?"Les relevés actifs ne sont pas assez proches dans le temps pour être comparés.":"Vérifiez la fraîcheur et la cohérence des mesures.";
    const scoreDisplay=h.suspended?"—":h.score;
    const scoreValue=h.suspended?0:h.score;
    this._rc24TreatmentModel=treatmentModel;
    this.syncRc27Context(treatmentModel);
    const vigilanceUrl="https://vigilance.meteofrance.fr/fr";
    const weatherAlertNames=weatherAlert.alerts.map(alert=>`${alert.icon} ${alert.label}`).join(" · ");
    const weatherAlertBanner=weatherAlert.active?`<aside class="rc26-weather-banner is-${weatherAlert.levelKey} ${weatherAlert.severity>=2?"is-sticky":""}" role=alert>
      <span class=rc26-weather-banner__level>Vigilance ${weatherAlert.levelLabel}</span>
      <span><b>${rc24Escape(weatherAlertNames||"Vigilance météo")}</b><small>${rc24Escape(weatherAlert.department)}</small></span>
      <button type=button data-weather-alert-focus>Voir les conseils</button>
      <a href="${vigilanceUrl}" target=_blank rel="noopener noreferrer">Carte Météo-France ↗</a>
    </aside>`:"";
    const analysisDevices=this.config.devices.filter((device,index)=>this.deviceEnabled(device,index)&&Boolean(this.analysisEntity(device)));
    const fragmentsCoquille={
      barreSections:this.renderRc271Toolbar(),
      programmation:this.renderRc27Section(treatmentModel,adaptiveRecommendation),
      recommandationEauMeteo:this.renderRecommandationEauMeteoExperimentale(),
      filtration:this.renderFiltrationSection(treatmentModel),
      capteurs:rendreSectionCapteurs({
        sourceLabel,
        nombreActifs:enabledCount,
        nombreTotal:this.config.devices.length,
        cartesHtml:this.config.devices.map((d,i)=>this.deviceCard(d,i)).join(""),
        classeSection:this.rc271SectionClass("devices"),
        attributsEntete:this.rc271HeaderAttributes("devices"),
        chevronHtml:this.rc271Chevron("devices"),
      }),
      graphiqueTemperature:this.sparkline("temperature","Température",temp.unit||"°C"),
      graphiquePh:this.sparkline("ph","pH",""),
      graphiqueOrp:this.sparkline("orp","ORP","mV"),
      traitement:this.renderTreatmentSection(treatmentModel),
    };
    const sectionsCoquille=Object.fromEntries(["charts","summary","score","health","information"].map(cle=>[cle,{classe:this.rc271SectionClass(cle),attributs:this.rc271HeaderAttributes(cle),chevron:this.rc271Chevron(cle)}]));
    const presentationMeteo={
      classe:weatherClass(weather.condition),
      icone:weatherIcon(weather.condition),
      libelle:weatherLabel(weather.condition),
      glyphe:weatherGlyph(weather.condition),
    };
    const recentCoquille=recent.map(item=>({...item,dateFormatee:formatDate(this,item.date)}));
    const coquilleHtml=rendreCoquillePrincipaleDashboard({
      preferences:this._preferences,weatherAlertBanner,smart,ICONS,titre:this.config.title,displayTemp,temp,aggregated,
      libelleConfiance:confidenceLabel(confidence),confidence,enabledCount,nombreAppareils:this.config.devices.length,weather,presentationMeteo,h,
      analyseDisponible:Boolean(analysisDevices.length),scoreValue,scoreDisplay,sourceLabel,derniereAnalyseFormatee:formatDate(this,last.value),
      fragments:fragmentsCoquille,sections:sectionsCoquille,phAssessment,pourcentagePh:this.pct("ph",aggregated.ph.number),
      pourcentageOrp:this.pct("orp",aggregated.orp.number),breakdown,confidenceDetail,weatherAlert,weatherAlertOptions,vigilanceUrl,
      echapperHtml:rc24Escape,conseilAlerteMeteo:rc26AlertPoolAdvice,treatmentModel,smartAdviceLines,recent:recentCoquille,comparisons,
      metaComparaison:this._comparisonMeta,typeTraitement:this._treatmentProfile.treatment,assistantExpertHtml,
    });
    this.shadowRoot.innerHTML=`<style>
      :host{--text:${theme.text};
    rc18PolishRenderedDashboard(this.shadowRoot);--dark:${theme.darkText};--muted:${theme.muted};--surface:${theme.surface};--border:${theme.border};--track:rgba(255,255,255,.2);display:block;font-size:16px}
      *{box-sizing:border-box}svg{width:20px;height:20px;fill:currentColor}.app *{min-width:0}.app{min-height:100%;padding:clamp(8px,2vw,24px);background:${theme.app};border-radius:28px;color:var(--dark)}
      .hero{position:relative;overflow:hidden;min-height:280px;padding:clamp(22px,4vw,38px);border-radius:34px;color:${theme.text};background-image:linear-gradient(90deg,rgba(5,39,92,.58),rgba(0,102,168,.12) 48%,rgba(3,37,82,.5)),url("/local/ha-pool-dashboard/hero-ocean.svg");background-size:cover;background-position:center;box-shadow:0 24px 54px rgba(28,90,140,.24);display:flex;flex-direction:column;justify-content:space-between}
      .hero:before{content:"";position:absolute;left:-12%;right:-12%;bottom:-58px;height:160px;background:repeating-radial-gradient(ellipse at center,rgba(255,255,255,.22) 0 2px,transparent 3px 20px);opacity:.46;animation:waves 18s linear infinite;will-change:transform}
      .hero:after{content:"";position:absolute;inset:0;background:radial-gradient(circle at 78% 18%,rgba(255,255,255,.24),transparent 20%),linear-gradient(120deg,transparent 42%,rgba(255,255,255,.09) 50%,transparent 58%);pointer-events:none}
      .wave{position:absolute;left:-14%;width:128%;border-radius:50%;border-top:2px solid rgba(255,255,255,.2);pointer-events:none;will-change:transform}
      .wave-a{height:92px;bottom:62px;animation:waveA 18s ease-in-out infinite}
      .wave-b{height:118px;bottom:34px;opacity:.72;animation:waveB 28s ease-in-out infinite reverse}
      .wave-c{height:146px;bottom:8px;opacity:.42;border-top-color:rgba(115,225,255,.24);animation:waveC 42s ease-in-out infinite}
      .light-sweep{position:absolute;inset:-25% -35%;background:linear-gradient(115deg,transparent 42%,rgba(255,255,255,.16) 50%,transparent 58%);transform:translateX(-55%);animation:lightSweep 24s ease-in-out infinite;pointer-events:none}
      .hero-bubble{position:absolute;border:1px solid rgba(255,255,255,.22);border-radius:50%;background:rgba(255,255,255,.035);box-shadow:inset 0 0 12px rgba(255,255,255,.08);pointer-events:none}
      .hero-bubble.b1{width:15px;height:15px;left:12%;bottom:18%;animation:bubbleRise 15s linear infinite}
      .hero-bubble.b2{width:9px;height:9px;left:55%;bottom:8%;animation:bubbleRise 19s linear infinite 5s}
      .hero-bubble.b3{width:12px;height:12px;left:84%;bottom:22%;animation:bubbleRise 23s linear infinite 9s}
      .bubble{position:absolute;border-radius:50%;border:1px solid rgba(255,255,255,.28);background:rgba(255,255,255,.08);animation:rise 8s linear infinite}.b1{width:12px;height:12px;left:12%;bottom:-20px}.b2{width:8px;height:8px;left:28%;bottom:-30px;animation-delay:2s}.b3{width:16px;height:16px;left:58%;bottom:-25px;animation-delay:4s}
      .hero-head,.hero-main{position:relative;z-index:1}.hero-head{display:flex;align-items:center;gap:12px;font-weight:850}.logo{width:48px;height:48px;border-radius:17px;display:grid;place-items:center;color:white;background:linear-gradient(145deg,#37a8ff,#5e77ed);box-shadow:0 12px 25px rgba(25,80,170,.2)}
      .hero-main{display:grid;grid-template-columns:1fr auto;gap:24px;align-items:end}
      .hero-weather{position:absolute;right:180px;top:24px;z-index:2;padding:12px 15px;border-radius:18px;background:rgba(0,48,94,.22);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.18)}
      .mobile-quick{display:none}
.temperature{font-size:clamp(4.4rem,10vw,7.2rem);font-weight:240;line-height:.86;letter-spacing:-.07em}.temperature small{font-size:1.15rem;letter-spacing:0;opacity:.74}.hero-label{margin-top:14px;font-size:.85rem;opacity:.82}
      .health{text-align:right}.score-ring{width:112px;height:112px;margin-left:auto;border-radius:50%;display:grid;place-content:center;background:conic-gradient(#fff ${h.score}%,rgba(255,255,255,.18) 0);position:relative}.score-ring:after{content:"";position:absolute;inset:8px;border-radius:50%;background:color-mix(in srgb,#168dcc 85%,transparent)}.score-ring strong{position:relative;z-index:1;font-size:2rem}.score-ring small{font-size:.7rem}.health-label{margin-top:10px;font-weight:800}.health-advice{font-size:.74rem;opacity:.82;margin-top:4px}.hero-last{font-size:.7rem;opacity:.76;margin-top:10px}.hero-last strong{display:block;font-size:.8rem;margin-top:3px}
      .section-title{margin:30px 4px 14px;font-size:.82rem;font-weight:850;letter-spacing:.14em;text-transform:uppercase;color:color-mix(in srgb,var(--dark) 58%,transparent)}
      .devices{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;align-items:start}.devices>*{min-width:0}.device-card{display:flex;flex-direction:column;min-height:455px;border-radius:30px;padding:20px;color:${theme.text};background:${theme.card};border:1px solid ${theme.border};box-shadow:0 18px 40px rgba(20,55,90,.15);animation:enter .55s ease both;animation-delay:var(--delay)}
      .device-card header{display:flex;justify-content:space-between;gap:14px}.device-card h2{margin:0;font-size:1.15rem}.device-card header span{font-size:.72rem;opacity:.64;text-transform:uppercase;letter-spacing:.1em}.fresh{display:block;margin-top:4px;font-size:.68rem;font-style:normal;opacity:.78;text-transform:none;letter-spacing:0}.device-card header>strong{font-size:2.25rem;font-weight:350}.device-card header small{font-size:.7rem;margin-left:3px;opacity:.72}
      .gauges{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:16px 0}.linear{margin-bottom:14px}.linear>div{display:flex;justify-content:space-between;font-size:.74rem;margin-bottom:7px}.linear i{display:block;height:7px;border-radius:99px;background:rgba(255,255,255,.16);overflow:hidden}.linear b{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#3da8ff,#6de8f6)}
      .chips{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.chips>*{min-width:0}.chips>div,.last{display:flex;align-items:center;gap:9px;padding:11px;border-radius:15px;background:${theme.surface};border:1px solid ${theme.border};backdrop-filter:blur(10px)}.chips span,.last span{display:flex;flex-direction:column;font-size:.82rem;opacity:.86}.chips strong,.last strong{font-size:1.15rem;line-height:1.15;opacity:1;margin-top:3px}.last{margin-top:8px}
      button{margin-top:auto;width:100%;min-height:46px;border:0;border-radius:15px;color:white;background:${theme.button};font:inherit;font-weight:780;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer}button{position:relative;overflow:hidden;box-shadow:0 10px 22px rgba(23,98,210,.18)}button:active{transform:scale(.985)}button{transition:transform .15s ease,box-shadow .2s ease}button:hover{box-shadow:0 13px 28px rgba(23,98,210,.24)}button:before{content:"";position:absolute;inset:-2px;background:linear-gradient(120deg,transparent 25%,rgba(255,255,255,.28),transparent 75%);transform:translateX(-120%);animation:shine 4.5s ease-in-out infinite}
      .summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.summary-card{position:relative;min-height:112px;border-radius:22px;padding:16px 16px 15px 64px;background:rgba(255,255,255,.8);border:1px solid rgba(35,90,140,.12);box-shadow:0 10px 24px rgba(30,80,120,.06);overflow:hidden}.summary-icon{position:absolute;left:15px;top:18px;width:38px;height:38px;border-radius:50%;display:grid;place-items:center;font-size:.72rem;font-weight:900;background:linear-gradient(145deg,#37a8ff,#5e77ed);color:#fff;box-shadow:0 7px 16px rgba(34,118,213,.2)}.summary-card.good .summary-icon{background:linear-gradient(145deg,#37d39b,#20ad78)}.summary-card.warning .summary-icon{background:linear-gradient(145deg,#ffc45d,#f19a22)}.summary-card small{display:block;opacity:.58}.summary-card strong{display:block;margin-top:4px;font-size:1.35rem;line-height:1.1;overflow-wrap:anywhere}.summary-card em{display:block;margin-top:6px;font-size:.72rem;font-style:normal;font-weight:750;opacity:.78}
      .advice{border-radius:24px;padding:20px;background:rgba(255,255,255,.78);border:1px solid rgba(35,90,140,.12)}.advice h3{margin:0 0 8px}.advice p{margin:0;opacity:.68}
      .charts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
      .chart-card{animation:cardIn .48s ease both;min-width:0;border-radius:24px;padding:17px;background:rgba(255,255,255,.8);border:1px solid rgba(35,90,140,.12);box-shadow:0 12px 28px rgba(30,80,120,.07);color:#17324f}
      .chart-card header{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}.chart-card header div{display:flex;flex-direction:column}.chart-card small{font-size:.8rem;opacity:.58}.chart-card strong{font-size:1.35rem;margin-top:3px}.chart-card header>span{font-size:.82rem;font-weight:750;color:#2773d6}.chart-card header>span.up{color:#d98419}.chart-card header>span.down{color:#198f78}
      .spark{display:block;width:100%;height:118px;margin-top:10px;color:#2f91e8;overflow:visible}.spark .line{fill:none;stroke:currentColor;stroke-width:3;stroke-linecap:round;stroke-linejoin:round;filter:drop-shadow(0 4px 6px rgba(47,145,232,.18));stroke-dasharray:520;stroke-dashoffset:520;animation:drawLine .8s ease forwards}.spark circle{animation:endPulse 2.4s ease-in-out infinite}.ideal-band{fill:#31c48d;fill-opacity:.1}.chart-source{margin-top:3px;font-size:.66rem;color:#2773d6;opacity:.72}.spark circle{fill:white;stroke:currentColor;stroke-width:3}
      .spark-wrap{position:relative}.spark-hit{position:absolute;inset:0;cursor:crosshair}.spark-tip{position:absolute;z-index:4;pointer-events:none;transform:translate(-50%,-110%);padding:7px 9px;border-radius:10px;background:#0c3159;color:#fff;font-size:.72rem;box-shadow:0 8px 18px rgba(0,0,0,.2);opacity:0;transition:opacity .12s}.spark-tip.show{opacity:1}

      .chart-card footer{display:flex;justify-content:space-between;font-size:.62rem;opacity:.52;margin-top:5px}.chart-empty{height:118px;display:grid;place-items:center;font-size:.75rem;opacity:.55}.lower-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;align-items:start}.lower-grid>*{min-width:0}.info-card{animation:cardIn .52s ease both;min-width:0;border-radius:26px;padding:22px;background:rgba(255,255,255,.82);border:1px solid rgba(35,90,140,.12);box-shadow:0 12px 28px rgba(30,80,120,.07);color:#17324f}.info-card h3{margin:0 0 16px;font-size:1rem;text-transform:uppercase;letter-spacing:.08em}.weather-main{display:flex;align-items:center;gap:12px}.weather-main strong{font-size:2.15rem}.weather-main small{display:block;font-size:.9rem;opacity:.7}.weather-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:14px}.weather-stats div{padding:9px;border-radius:12px;background:rgba(37,119,205,.07)}.weather-stats small{display:block;font-size:.75rem;opacity:.58}.weather-stats strong{display:block;font-size:1rem;margin-top:3px}.timeline{display:grid;gap:6px}.timeline-row{display:grid;grid-template-columns:1fr auto;gap:8px;padding:8px 0;border-bottom:1px solid rgba(23,50,79,.08)}.timeline-row strong{font-size:.9rem}.timeline-row small{display:block;font-size:.75rem;opacity:.58}.pill{font-size:.61rem;font-weight:800;padding:4px 7px;border-radius:999px;background:#dff8ea;color:#14824d}.compare{width:100%;border-collapse:collapse;font-size:.82rem}.compare th,.compare td{text-align:left;padding:7px 4px;border-bottom:1px solid rgba(23,50,79,.08)}.compare th{font-size:.72rem;opacity:.55}.advice-copy{max-height:76px;overflow:hidden;transition:max-height .28s ease}.advice-copy.open{max-height:420px}.advice-toggle{margin-top:10px;width:auto;min-height:34px;padding:0 12px;background:rgba(39,115,214,.1);color:#245f9f;font-size:.76rem}.mobile-compare{display:none}.compare-card{padding:14px;border-radius:16px;background:linear-gradient(180deg,rgba(37,119,205,.07),rgba(37,119,205,.035));border:1px solid rgba(23,50,79,.08);box-shadow:0 10px 24px rgba(29,72,118,.05)}.compare-card h4{margin:0 0 8px;font-size:.86rem}.compare-values{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.compare-values div{padding:8px;border-radius:10px;background:rgba(255,255,255,.66)}.compare-values small{display:block;opacity:.58}.compare-values strong{display:block;margin-top:7px;font-size:1.05rem;overflow-wrap:anywhere}.compare-status{display:flex;justify-content:space-between;align-items:center;margin-top:9px;font-size:.76rem}
      .compare-track{height:6px;border-radius:99px;background:rgba(23,50,79,.1);overflow:hidden;margin-top:4px}.compare-fill{height:100%;border-radius:inherit;background:linear-gradient(90deg,#31c48d,#f6ad3c)}
      .stars{letter-spacing:.08em;color:#ffe36c;font-size:1rem;margin-top:5px}
      .timeline-row:before{content:"";width:8px;height:8px;border-radius:50%;background:#31c48d;box-shadow:0 0 0 4px rgba(49,196,141,.12)}
      .timeline-row{grid-template-columns:auto 1fr auto}
.warn{color:#a96700;font-weight:800}.good{color:#14824d;font-weight:800}
      @keyframes waves{from{transform:translateX(0)}to{transform:translateX(48px)}}@keyframes waveA{0%,100%{transform:translateX(-2%) scaleY(1)}50%{transform:translateX(2%) scaleY(1.11)}}@keyframes waveB{0%,100%{transform:translateX(1.5%) scaleY(1)}50%{transform:translateX(-1.5%) scaleY(1.08)}}@keyframes waveC{0%,100%{transform:translateX(-1%) scaleY(1)}50%{transform:translateX(1%) scaleY(1.05)}}@keyframes lightSweep{0%,78%{transform:translateX(-55%)}90%,100%{transform:translateX(55%)}}@keyframes bubbleRise{0%{transform:translateY(0) scale(.8);opacity:0}18%{opacity:.3}100%{transform:translateY(-260px) scale(1.2);opacity:0}}@keyframes rise{from{transform:translateY(0);opacity:0}20%{opacity:.8}to{transform:translateY(-330px);opacity:0}}@keyframes enter{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}@keyframes cardIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}@keyframes shine{0%,70%{transform:translateX(-120%)}100%{transform:translateX(120%)}}@keyframes barGloss{0%,70%{transform:translateX(-120%)}100%{transform:translateX(120%)}}@keyframes drawLine{to{stroke-dashoffset:0}}@keyframes endPulse{0%,100%{r:4;opacity:1}50%{r:5.5;opacity:.72}}
      @media(max-width:1100px) and (min-width:761px){.lower-grid{grid-template-columns:repeat(2,1fr)}}.hero[data-health="warning"]{box-shadow:0 24px 54px rgba(202,139,37,.22)}.hero[data-health="danger"]{box-shadow:0 24px 54px rgba(189,66,77,.24)}
      .smart-strip{position:relative;z-index:3;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:13px;width:100%}.smart-chip{min-width:0;overflow:hidden;padding:9px 11px;border-radius:13px;background:rgba(255,255,255,.13);border:1px solid rgba(255,255,255,.16);backdrop-filter:blur(8px)}.smart-chip small{display:block;font-size:.6rem;opacity:.72}.smart-chip strong{display:block;margin-top:3px;font-size:.78rem;line-height:1.25;overflow-wrap:anywhere}
      .trend{display:block;margin-top:5px;font-size:.63rem;font-style:normal;opacity:.78}.trend.up{color:#ffd172}.trend.down{color:#91d8ff}.trend.flat{color:#8ce7bb}
      .score-details{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px}.score-details>*{min-width:0}.score-details>div,.health-meter{padding:12px;border-radius:15px;background:rgba(255,255,255,.75);border:1px solid rgba(35,90,140,.1)}.score-details small{display:block;font-size:.62rem;opacity:.62}.score-details strong{display:block;margin-top:3px}
      .health-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.health-grid>*{min-width:0}.health-meter header{display:flex;justify-content:space-between;gap:8px}.health-meter .bar{height:7px;margin-top:9px;border-radius:99px;background:rgba(37,75,118,.09);overflow:hidden}.health-meter .bar i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#42c98f,#58a8f4)}
      .anomaly{margin:8px 0;padding:8px 10px;border-radius:11px;background:rgba(245,87,87,.18);font-size:.7rem;color:#fff}.settings-row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.setting-pill{padding:8px 10px;text-align:center;border-radius:999px;background:rgba(37,119,205,.07);border:1px solid rgba(36,95,159,.13);font-size:.7rem}
      @media(max-width:760px){.smart-strip{grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}.smart-chip{min-height:70px;padding:10px}.score-details{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.score-details>div{min-height:90px}.score-details>div:last-child{grid-column:1/-1}.health-grid{grid-template-columns:1fr}.health-meter{min-height:100px}
        .app{padding:8px;border-radius:20px}
        .hero{min-height:0;padding:17px;border-radius:24px;display:block;overflow:hidden}
        .hero-head{margin-bottom:14px}
        .hero-main{display:block;min-width:0}
        .temperature{font-size:clamp(3.45rem,15.5vw,4.75rem);line-height:.9}
        .hero-label{font-size:.74rem;margin-top:8px;max-width:100%}
        .hero-weather{position:static;display:flex;align-items:center;gap:8px;margin:13px 0 0;padding:10px 12px;width:max-content;max-width:100%;border-radius:14px;background:rgba(0,48,94,.28)}
        .hero-weather strong{font-size:1rem!important}
        .hero-weather small{font-size:.7rem!important}
        .health{margin-top:13px;text-align:left;display:grid;grid-template-columns:86px 1fr;column-gap:14px;align-items:center}
        .score-ring{width:86px;height:86px;margin:0;grid-row:1 / span 4}
        .score-ring strong{font-size:1.55rem}
        .health-label{margin-top:0;font-size:1.05rem}
        .stars{margin-top:2px}
        .health-advice{font-size:.72rem;margin-top:2px}
        .hero-last{font-size:.66rem;margin-top:5px}
        .mobile-quick{display:none}
        .devices{grid-template-columns:1fr;gap:14px}
        .device-card{min-height:0;padding:14px;border-radius:24px;overflow:hidden}.device-card button{min-height:40px;border-radius:14px}
        .device-card header>strong{font-size:1.9rem}
        .gauges{margin:8px 0 10px}
        .chips{grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}
        .chips>div,.last{padding:8px 9px;border-radius:13px;min-height:60px}.chips strong,.last strong{font-size:1rem}
        .charts{grid-template-columns:1fr;gap:12px}
        .chart-card{padding:13px;border-radius:20px}
        .spark{height:76px}
        .chart-empty{height:76px}
        .spark-tip{font-size:.61rem;line-height:1.35;max-width:180px;white-space:normal;padding:6px 8px}
        .summary{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;align-items:stretch}
        .summary-card{padding:14px 12px 13px 56px;border-radius:18px;min-height:104px}.summary-icon{left:12px;top:14px;width:34px;height:34px}.summary-card strong{font-size:1.2rem}
        .summary-card:last-child{grid-column:1 / -1}
        .lower-grid{grid-template-columns:1fr;gap:12px}
        .info-card{padding:16px;border-radius:20px;overflow:hidden}
        .weather-stats{grid-template-columns:repeat(3,minmax(0,1fr));gap:5px}
        .section-title{margin:24px 4px 10px;font-size:.76rem;line-height:1.4}.compare{display:none}.mobile-compare{display:grid;gap:10px}.timeline-row .pill{width:34px;height:34px;padding:0;font-size:0;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 35% 30%,#b8f6d3,#67d69d);box-shadow:0 6px 14px rgba(49,196,141,.18)}.timeline-row .pill:after{content:"✓";font-size:.78rem;color:#176f48;font-weight:900}
      }
      @media(max-width:390px){
        .hero{padding:15px}
        .temperature{font-size:3.5rem}
        .health{grid-template-columns:78px 1fr;column-gap:10px}
        .score-ring{width:78px;height:78px}
        .score-ring strong{font-size:1.25rem}
        .smart-strip{gap:6px}
        .smart-chip{min-height:66px;padding:8px}
        .summary{grid-template-columns:1fr}
        .summary-card:last-child{grid-column:auto}
        .chips{grid-template-columns:repeat(2,minmax(0,1fr))}
        .chips>div{min-height:58px;padding:8px}
        .chips strong,.last strong{font-size:.94rem}
        .compare-status{align-items:flex-start;gap:8px;flex-direction:column}
      }

      /* Beta14 premium finish */
      .hero[data-health="excellent"]{filter:saturate(1.12) brightness(1.03)}
      .hero[data-health="watch"]{box-shadow:0 24px 58px rgba(232,174,46,.22)}
      .hero:after{background:radial-gradient(circle at 76% 14%,rgba(255,255,255,.28),transparent 18%),linear-gradient(120deg,transparent 36%,rgba(255,255,255,.13) 49%,transparent 60%)}
      .temperature{letter-spacing:-.06em;text-shadow:0 8px 28px rgba(0,58,112,.22)}
      .temperature small{font-size:.32em;margin-left:4px;vertical-align:top}
      .smart-chip{min-height:62px;display:flex;flex-direction:column;justify-content:center}
      .chart-card{background:linear-gradient(180deg,rgba(255,255,255,.92),rgba(239,248,255,.88))}
      .summary-card{min-height:98px;padding-top:14px;padding-bottom:13px}
      .score-details>div{position:relative;overflow:hidden;min-height:112px;padding:12px 12px 20px;text-align:left}
      .score-icon{display:grid;width:34px;height:34px;place-items:center;border-radius:12px;background:linear-gradient(145deg,rgba(70,170,255,.18),rgba(90,110,235,.12));font-size:1rem;margin-bottom:8px}
      .score-details>div>i{position:absolute;left:12px;right:12px;bottom:10px;height:6px;border-radius:99px;background:rgba(36,82,132,.08);overflow:hidden}
      .score-details>div>i:after{content:"";display:block;width:var(--score);height:100%;border-radius:inherit;background:linear-gradient(90deg,#42c98f,#4aa7f5);animation:scoreFill .8s ease both}
      .health-meter{box-shadow:0 10px 25px rgba(38,85,130,.06)}
      .health-meter .bar i{animation:scoreFill .85s ease both}
      .timeline-row .pill{width:28px;height:28px;box-shadow:0 5px 12px rgba(49,196,141,.15)}
      .compare-line{display:grid;grid-template-columns:88px 1fr auto;gap:8px;align-items:center;margin-top:10px}
      .compare-line span{font-size:.68rem;opacity:.65}.compare-line i{height:7px;border-radius:99px;background:rgba(30,75,120,.08);overflow:hidden}
      .compare-line i b{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#42c98f,#4a9ff0)}
      .compare-line strong{font-size:.78rem;white-space:nowrap}
      @keyframes scoreFill{from{width:0;opacity:.45}}
      @media(max-width:760px){.smart-chip{min-height:60px}.device-card{padding:13px}.device-card header>strong{font-size:2rem}.summary-card{min-height:92px}.score-details>div{min-height:104px}.compare-line{grid-template-columns:78px 1fr auto;gap:6px}}
      @media(max-width:390px){.temperature{font-size:3.35rem}.smart-chip{min-height:58px}.score-details>div{min-height:98px}.compare-line{grid-template-columns:68px 1fr auto}.compare-line strong{font-size:.72rem}}


      /* Beta15 visual refinement: points 1 to 6 */
      .hero{isolation:isolate;background-image:linear-gradient(180deg,rgba(5,35,82,.42),rgba(0,116,180,.08) 40%,rgba(2,38,86,.6)),url("/local/ha-pool-dashboard/hero-ocean.svg");box-shadow:0 28px 70px rgba(17,93,151,.3),inset 0 1px rgba(255,255,255,.18)}
      .hero:before{height:210px;bottom:-72px;opacity:.6;background:repeating-radial-gradient(ellipse at center,rgba(255,255,255,.24) 0 2px,transparent 3px 18px),linear-gradient(180deg,transparent,rgba(0,70,145,.2));animation:waves 16s linear infinite,waterPulse 7s ease-in-out infinite}
      .hero:after{z-index:0;background:radial-gradient(circle at 74% 14%,rgba(255,255,255,.38),transparent 15%),linear-gradient(115deg,transparent 30%,rgba(255,255,255,.16) 46%,transparent 60%);animation:heroLight 9s ease-in-out infinite}
      .hero>*{position:relative;z-index:2}.hero .temperature{filter:drop-shadow(0 10px 24px rgba(0,43,91,.22));animation:temperatureGlow 5s ease-in-out infinite}
      .smart-chip{backdrop-filter:blur(14px) saturate(1.2);background:linear-gradient(145deg,rgba(255,255,255,.18),rgba(255,255,255,.08));box-shadow:inset 0 1px rgba(255,255,255,.25),0 12px 30px rgba(0,57,112,.12)}
      .device-card{min-height:420px;padding:16px 17px;border-radius:28px}.device-card header{margin-bottom:0}.gauges{margin:9px 0 5px}.chips{gap:8px}.chips>div{padding:10px 11px}.last{padding:10px 12px;margin-top:8px}.device-card button{min-height:43px;margin-top:8px}.linear{margin:5px 0 8px}
      .chart-card{position:relative;overflow:hidden;background:linear-gradient(180deg,rgba(255,255,255,.96),rgba(234,247,255,.9));box-shadow:0 14px 34px rgba(27,86,137,.08)}
      .chart-card:after{content:"";position:absolute;inset:auto -15% -45% 35%;height:95px;background:radial-gradient(circle,rgba(61,171,255,.12),transparent 67%);pointer-events:none}
      .spark-grid line{stroke:rgba(33,92,145,.1);stroke-width:.7;stroke-dasharray:3 5}.spark .area{opacity:.68}.spark .line{stroke-width:3;stroke-dasharray:700;stroke-dashoffset:700;animation:drawChart 1s ease forwards}.spark .end-halo{fill:rgba(67,162,238,.18);stroke:none;animation:endPulse 2.4s ease-in-out infinite}.spark .end-dot{fill:#fff;stroke:currentColor;stroke-width:2.5}
      .summary-card{min-height:90px;padding-bottom:22px}.summary-meter{position:absolute;left:64px;right:16px;bottom:11px;height:5px;border-radius:99px;background:rgba(26,78,126,.08);overflow:hidden}.summary-meter b{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#43ca90,#49a6ef);animation:summaryFill .8s ease both}.summary-card.warning .summary-meter b{background:linear-gradient(90deg,#ffbc4f,#ef8f2b)}
      .health-meter{position:relative;overflow:hidden;min-height:116px;padding:18px 20px}.health-meter:after{content:"";position:absolute;right:18px;bottom:17px;width:12px;height:12px;border-radius:50%;background:linear-gradient(145deg,#45ca91,#48a3ed);box-shadow:0 0 0 5px rgba(68,181,200,.11),0 0 18px rgba(71,163,237,.25)}.health-meter strong{animation:numberPop .55s ease both}
      .advice-actions{display:grid;gap:8px;margin:13px 0}.advice-actions div{display:flex;gap:9px;align-items:flex-start;padding:9px 11px;border-radius:13px;background:linear-gradient(145deg,rgba(51,194,139,.1),rgba(71,162,237,.07));font-size:.78rem;line-height:1.35}.advice-actions div:first-child{color:#168457;font-weight:750}.advice-actions span{color:#17324f;font-weight:650}
      @keyframes heroLight{0%,100%{transform:translateX(-3%);opacity:.74}50%{transform:translateX(4%);opacity:1}}@keyframes waterPulse{0%,100%{transform:translateX(0) scaleY(1)}50%{transform:translateX(2.5%) scaleY(1.04)}}@keyframes temperatureGlow{0%,100%{text-shadow:0 8px 28px rgba(0,58,112,.22)}50%{text-shadow:0 8px 34px rgba(125,229,255,.34)}}@keyframes drawChart{to{stroke-dashoffset:0}}@keyframes endPulse{0%,100%{transform:scale(.92);opacity:.42;transform-origin:center}50%{transform:scale(1.12);opacity:.85}}@keyframes summaryFill{from{width:0}}@keyframes numberPop{from{opacity:.45;transform:translateY(4px)}}
      /* Desktop: prevent Home Assistant panel/grid stretching the Hero vertically. */
      @media(min-width:761px){
        .hero{height:clamp(360px,32vw,480px);min-height:360px;max-height:480px;align-self:start}
        .hero-main{margin-top:auto}
      }
      @media(min-width:1400px){.hero{height:440px;min-height:440px;max-height:440px}}
      @media(max-width:760px){.device-card{padding:12px 13px;border-radius:24px}.gauges{margin:5px 0 2px}.chips>div{padding:9px}.last{padding:9px 10px}.device-card button{min-height:40px}.summary-meter{left:56px;right:12px}.health-meter{min-height:108px;padding:16px 18px}.hero{height:auto;max-height:none;box-shadow:0 22px 48px rgba(17,93,151,.27)}}

      @media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}.hero:before,.hero:after,.wave,.light-sweep,.hero-bubble{transform:none!important}}

      /* =========================================================
         Beta17.2 — FINAL desktop hero override
         Placed at the end of the stylesheet to win the CSS cascade.
         ========================================================= */
      @media(min-width:761px){
        .hero{
          height:220px!important;
          min-height:220px!important;
          max-height:220px!important;
          padding:12px 24px 12px!important;
          display:grid!important;
          grid-template-rows:auto 1fr!important;
          justify-content:initial!important;
          align-content:start!important;
          overflow:hidden!important;
        }
        .hero-head{
          min-height:0!important;
          margin:0 0 4px!important;
          align-self:start!important;
          gap:10px!important;
        }
        .hero-head .logo{
          width:42px!important;
          height:42px!important;
          border-radius:15px!important;
        }
        .hero-main{
          margin-top:0!important;
          align-self:start!important;
          display:grid!important;
          grid-template-columns:minmax(0,1.34fr) minmax(290px,.66fr)!important;
          gap:18px!important;
          align-items:start!important;
        }
        .hero-main>div:first-child{
          align-self:start!important;
          min-width:0!important;
        }
        .temperature{
          margin:0!important;
          font-size:clamp(3.45rem,5vw,4.75rem)!important;
          line-height:.82!important;
        }
        .temperature small{
          font-size:.9rem!important;
        }
        .hero-label{
          margin-top:4px!important;
          font-size:.71rem!important;
          line-height:1.2!important;
        }
        .smart-grid{
          margin-top:7px!important;
          gap:7px!important;
          grid-template-columns:repeat(4,minmax(108px,1fr))!important;
        }
        .smart-chip{
          min-height:47px!important;
          padding:6px 9px!important;
          border-radius:15px!important;
        }
        .smart-chip small{
          font-size:.58rem!important;
          line-height:1.05!important;
        }
        .smart-chip strong{
          font-size:.75rem!important;
          line-height:1.12!important;
        }
        .health{
          align-self:start!important;
          text-align:right!important;
          padding-top:0!important;
        }
        .score-ring{
          width:76px!important;
          height:76px!important;
        }
        .score-ring strong{
          font-size:1.55rem!important;
        }
        .health-label{
          margin-top:2px!important;
          font-size:.88rem!important;
          line-height:1.1!important;
        }
        .stars{
          margin-top:1px!important;
          font-size:.72rem!important;
          line-height:1!important;
        }
        .health-advice{
          margin-top:3px!important;
          font-size:.62rem!important;
          line-height:1.22!important;
          max-width:500px!important;
        }
        .hero-last{
          margin-top:4px!important;
          font-size:.58rem!important;
          line-height:1.15!important;
        }
        .hero-last strong{
          margin-top:1px!important;
          font-size:.67rem!important;
        }
        .hero-weather{
          top:6px!important;
          right:108px!important;
          padding:8px 11px!important;
          border-radius:14px!important;
          transform:scale(.78)!important;
          transform-origin:top right!important;
        }
      }
      @media(min-width:1500px){
        .hero{
          height:216px!important;
          min-height:216px!important;
          max-height:216px!important;
        }
      }
      @media(max-width:760px){
        .hero{
          height:auto!important;
          min-height:0!important;
          max-height:none!important;
          padding:17px!important;
          display:block!important;
          overflow:hidden!important;
        }
      }


      /* =========================================================
         Beta17.3 — Restore decorative layers outside CSS grid
         ========================================================= */
      .hero > .wave,
      .hero > .hero-bubble,
      .hero > .bubble,
      .hero > .light-sweep{
        position:absolute!important;
        z-index:1!important;
        display:block!important;
      }
      .hero > .hero-head,
      .hero > .hero-main,
      .hero > .hero-weather{
        position:relative!important;
        z-index:3!important;
      }
      @media(min-width:761px){
        .hero{
          height:228px!important;
          min-height:228px!important;
          max-height:228px!important;
          grid-template-rows:42px minmax(0,1fr)!important;
        }
        .hero-head{
          grid-row:1!important;
        }
        .hero-main{
          grid-row:2!important;
          min-height:0!important;
        }
        .hero-weather{
          position:absolute!important;
        }
      }
      @media(min-width:1500px){
        .hero{
          height:224px!important;
          min-height:224px!important;
          max-height:224px!important;
        }
      }
      @media(max-width:760px){
        .hero{
          height:auto!important;
          min-height:0!important;
          max-height:none!important;
        }
      }


      /* =========================================================
         Beta17.4 — Balanced desktop hero
         ========================================================= */
      @media(min-width:761px){
        .hero{
          height:278px!important;
          min-height:278px!important;
          max-height:278px!important;
          padding:18px 28px 18px!important;
          grid-template-rows:52px minmax(0,1fr)!important;
          align-content:start!important;
          overflow:hidden!important;
        }
        .hero-head{
          grid-row:1!important;
          min-height:0!important;
          margin:0!important;
          align-self:start!important;
        }
        .hero-head .logo{
          width:50px!important;
          height:50px!important;
          border-radius:17px!important;
        }
        .hero-main{
          grid-row:2!important;
          align-self:start!important;
          display:grid!important;
          grid-template-columns:minmax(0,1.28fr) minmax(390px,.72fr)!important;
          gap:28px!important;
          align-items:start!important;
          min-height:0!important;
          margin-top:0!important;
        }
        .hero-main>div:first-child{
          min-width:0!important;
          align-self:start!important;
        }
        .temperature{
          margin:0!important;
          font-size:clamp(4.25rem,6.2vw,6rem)!important;
          line-height:.88!important;
        }
        .temperature small{
          font-size:1rem!important;
        }
        .hero-label{
          margin-top:6px!important;
          font-size:.84rem!important;
          line-height:1.25!important;
        }
        .smart-grid{
          margin-top:12px!important;
          gap:10px!important;
          grid-template-columns:repeat(4,minmax(128px,1fr))!important;
        }
        .smart-chip{
          min-height:62px!important;
          padding:10px 13px!important;
          border-radius:18px!important;
        }
        .smart-chip small{
          font-size:.66rem!important;
          line-height:1.1!important;
        }
        .smart-chip strong{
          font-size:.86rem!important;
          line-height:1.18!important;
        }
        .health{
          align-self:start!important;
          text-align:right!important;
          padding-top:0!important;
        }
        .score-ring{
          width:100px!important;
          height:100px!important;
        }
        .score-ring strong{
          font-size:2rem!important;
        }
        .health-label{
          margin-top:5px!important;
          font-size:1.08rem!important;
          line-height:1.12!important;
        }
        .stars{
          margin-top:3px!important;
          font-size:.9rem!important;
          line-height:1!important;
        }
        .health-advice{
          margin-top:8px!important;
          font-size:.76rem!important;
          line-height:1.34!important;
          max-width:560px!important;
        }
        .hero-last{
          margin-top:8px!important;
          font-size:.68rem!important;
          line-height:1.2!important;
        }
        .hero-last strong{
          margin-top:2px!important;
          font-size:.78rem!important;
        }
        .hero-weather{
          position:absolute!important;
          top:14px!important;
          right:138px!important;
          padding:11px 14px!important;
          border-radius:17px!important;
          transform:scale(.94)!important;
          transform-origin:top right!important;
        }
      }
      @media(min-width:1500px){
        .hero{
          height:272px!important;
          min-height:272px!important;
          max-height:272px!important;
        }
      }
      @media(max-width:760px){
        .hero{
          height:auto!important;
          min-height:0!important;
          max-height:none!important;
          padding:17px!important;
          display:block!important;
          overflow:hidden!important;
        }
      }


      /* =========================================================
         Beta17.5 — Final premium hero polish
         ========================================================= */
      @media(min-width:761px){
        /* 1. Lift the principal left-side content */
        .hero-head{
          transform:translateY(-6px)!important;
        }
        .hero-main>div:first-child{
          transform:translateY(-8px)!important;
        }

        /* 2. Weather alignment with score */
        .hero-weather{
          top:4px!important;
          right:154px!important;
        }

        /* 3. Advice readability */
        .health{
          padding-right:15px!important;
        }
        .health-advice{
          max-width:520px!important;
          margin-left:auto!important;
          line-height:1.42!important;
          text-wrap:balance;
        }
        .hero-last{
          max-width:520px!important;
          margin-left:auto!important;
        }

        /* 4. Stronger water depth */
        .wave{
          opacity:.72!important;
          filter:
            drop-shadow(0 0 4px rgba(151,219,255,.22))
            drop-shadow(0 2px 3px rgba(0,66,126,.12))!important;
        }
        .wave-a{opacity:.70!important}
        .wave-b{opacity:.50!important}
        .wave-c{opacity:.34!important}

        /* 5. Move the score group left */
        .health{
          transform:translateX(-15px)!important;
        }
      }

      @media(min-width:1500px){
        .hero-weather{
          right:168px!important;
        }
        .health{
          transform:translateX(-18px)!important;
        }
      }

      @media(max-width:760px){
        .hero-head,
        .hero-main>div:first-child,
        .health{
          transform:none!important;
        }
        .health{
          padding-right:0!important;
        }
        .health-advice,
        .hero-last{
          max-width:none!important;
        }
      }


      /* =========================================================
         Beta17.6 — Coded desktop hero matching validated layout
         ========================================================= */
      @media(min-width:761px){
        .hero{
          height:304px!important;
          min-height:304px!important;
          max-height:304px!important;
          padding:24px 34px 30px!important;
          grid-template-rows:58px minmax(0,1fr)!important;
          align-content:start!important;
          overflow:hidden!important;
        }

        /* More breathing room around top-left logo/title */
        .hero-head{
          transform:none!important;
          margin:0!important;
          padding-top:2px!important;
          align-self:start!important;
        }
        .hero-head .logo{
          width:54px!important;
          height:54px!important;
          border-radius:18px!important;
          margin:0!important;
        }
        .hero-title{
          margin-left:4px!important;
        }

        /* Balanced left column */
        .hero-main{
          grid-template-columns:minmax(0,1.28fr) minmax(410px,.72fr)!important;
          gap:30px!important;
          align-items:start!important;
          margin-top:0!important;
        }
        .hero-main>div:first-child{
          transform:none!important;
          align-self:start!important;
          min-width:0!important;
        }
        .temperature{
          margin-top:0!important;
          font-size:clamp(4.6rem,6.4vw,6.3rem)!important;
          line-height:.88!important;
        }
        .temperature small{
          font-size:1.05rem!important;
        }
        .hero-label{
          margin-top:8px!important;
          font-size:.86rem!important;
          line-height:1.25!important;
        }
        .smart-grid{
          margin-top:14px!important;
          gap:11px!important;
          grid-template-columns:repeat(4,minmax(132px,1fr))!important;
        }
        .smart-chip{
          min-height:66px!important;
          padding:11px 14px!important;
          border-radius:19px!important;
        }
        .smart-chip small{
          font-size:.68rem!important;
        }
        .smart-chip strong{
          font-size:.88rem!important;
        }

        /* Right column: keep score centered and preserve bottom margin */
        .health{
          transform:translateX(-18px)!important;
          padding-right:18px!important;
          padding-bottom:18px!important;
          align-self:start!important;
        }
        .score-ring{
          width:104px!important;
          height:104px!important;
        }
        .health-label{
          margin-top:6px!important;
          font-size:1.08rem!important;
        }
        .stars{
          margin-top:4px!important;
          font-size:.92rem!important;
        }
        .health-advice{
          max-width:520px!important;
          margin-top:10px!important;
          margin-left:auto!important;
          line-height:1.42!important;
        }
        .hero-last{
          max-width:520px!important;
          margin-top:10px!important;
          margin-left:auto!important;
          padding-bottom:8px!important;
          line-height:1.25!important;
        }
        .hero-last strong{
          display:block!important;
          margin-top:3px!important;
        }

        /* Weather aligned with score */
        .hero-weather{
          top:18px!important;
          right:162px!important;
          transform:scale(.96)!important;
          transform-origin:top right!important;
        }

        /* Keep decorative layers behind content */
        .hero > .wave,
        .hero > .hero-bubble,
        .hero > .bubble,
        .hero > .light-sweep{
          position:absolute!important;
          z-index:1!important;
        }
        .hero > .hero-head,
        .hero > .hero-main,
        .hero > .hero-weather{
          position:relative!important;
          z-index:3!important;
        }

        /* Slightly stronger but controlled water lines */
        .wave-a{opacity:.67!important}
        .wave-b{opacity:.47!important}
        .wave-c{opacity:.31!important}
      }

      @media(min-width:1500px){
        .hero{
          height:300px!important;
          min-height:300px!important;
          max-height:300px!important;
        }
        .hero-weather{
          right:176px!important;
        }
        .health{
          transform:translateX(-22px)!important;
        }
      }

      @media(max-width:760px){
        .hero{
          height:auto!important;
          min-height:0!important;
          max-height:none!important;
          padding:17px!important;
          display:block!important;
        }
        .hero-head,
        .hero-main>div:first-child,
        .health{
          transform:none!important;
        }
        .health{
          padding-right:0!important;
          padding-bottom:0!important;
        }
        .hero-last{
          padding-bottom:0!important;
        }
      }


      /* =========================================================
         Beta17.7 — Crisp vector ocean background
         ========================================================= */
      .hero{
        background-image:
          linear-gradient(180deg,rgba(4,54,111,.04),rgba(4,43,96,.18)),
          none!important;
        background-size:cover!important;
        background-position:center center!important;
        background-repeat:no-repeat!important;
      }

      /* Preserve animated overlays above the sharp background */
      .hero:before,
      .hero:after,
      .hero > .wave,
      .hero > .hero-bubble,
      .hero > .bubble,
      .hero > .light-sweep{
        pointer-events:none!important;
      }

      .hero:before{
        opacity:.48!important;
        mix-blend-mode:screen;
      }
      .hero:after{
        opacity:.42!important;
      }

      @media(max-width:760px){
        .hero{
          background-position:center top!important;
        }
      }


      /* =========================================================
         Beta17.8 — Remove washed-out overlay
         ========================================================= */
      .hero{
        background-image:
          linear-gradient(180deg,rgba(4,42,91,.03),rgba(4,34,82,.10)),
          none!important;
        background-color:#0d66bb!important;
      }

      /* Neutralize bright overlays that washed out the whole hero */
      .hero:before{
        opacity:.12!important;
        mix-blend-mode:normal!important;
        background:
          radial-gradient(circle at 78% 12%,rgba(255,255,255,.16),transparent 18%),
          linear-gradient(120deg,transparent 38%,rgba(255,255,255,.06) 49%,transparent 61%)!important;
      }
      .hero:after{
        opacity:.10!important;
        mix-blend-mode:normal!important;
        background:
          radial-gradient(circle at 82% 14%,rgba(255,245,190,.18),transparent 15%),
          linear-gradient(180deg,rgba(255,255,255,.03),transparent 38%)!important;
      }

      /* Keep animated layers subtle */
      .hero > .light-sweep{opacity:.14!important}
      .hero > .hero-bubble,
      .hero > .bubble{opacity:.42!important}
      .wave-a{opacity:.58!important}
      .wave-b{opacity:.38!important}
      .wave-c{opacity:.24!important}

      /* Restore text and glass contrast */
      .hero,
      .hero *{
        text-shadow:none;
      }
      .hero-title,
      .temperature,
      .hero-label,
      .smart-chip small,
      .smart-chip strong,
      .health-label,
      .health-advice,
      .hero-last,
      .hero-weather,
      .score-ring{
        color:#fff!important;
      }
      .smart-chip,
      .hero-weather{
        background:linear-gradient(145deg,rgba(36,102,170,.58),rgba(28,78,145,.54))!important;
        border-color:rgba(255,255,255,.18)!important;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.14),
          0 8px 20px rgba(0,35,80,.12)!important;
      }

      /* Keep score ring readable */
      .score-ring{
        background:conic-gradient(#fff var(--score),rgba(255,255,255,.18) 0)!important;
      }
      .score-ring:before{
        background:rgba(63,132,198,.92)!important;
      }

      @media(max-width:760px){
        .hero:before{opacity:.10!important}
        .hero:after{opacity:.08!important}
      }


/* Compatibility reference: none */

      /* =========================================================
         Beta18 — Realistic ocean hero background
         ========================================================= */
      .hero{
        background-image:
          linear-gradient(180deg,rgba(3,38,88,.04),rgba(3,32,80,.16)),
          image-set(
            none type("image/webp"),
            none type("image/png")
          )!important;
        background-size:cover!important;
        background-position:center center!important;
        background-repeat:no-repeat!important;
        background-color:#0b68bd!important;
      }

      /* Keep all premium animated overlays above the real background. */
      .hero:before{
        opacity:.08!important;
        mix-blend-mode:normal!important;
      }
      .hero:after{
        opacity:.08!important;
        mix-blend-mode:normal!important;
      }
      .hero > .wave,
      .hero > .hero-bubble,
      .hero > .bubble,
      .hero > .light-sweep{
        pointer-events:none!important;
      }
      .wave-a{opacity:.52!important}
      .wave-b{opacity:.32!important}
      .wave-c{opacity:.20!important}
      .hero > .light-sweep{opacity:.12!important}
      .hero > .hero-bubble,
      .hero > .bubble{opacity:.36!important}

      /* Strong contrast for text and glass cards on the photo-real background. */
      .smart-chip,
      .hero-weather{
        background:linear-gradient(145deg,rgba(12,70,143,.66),rgba(7,50,116,.62))!important;
        border-color:rgba(255,255,255,.24)!important;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.16),
          0 10px 24px rgba(0,27,68,.18)!important;
      }
      .hero-title,
      .temperature,
      .hero-label,
      .smart-chip small,
      .smart-chip strong,
      .health-label,
      .health-advice,
      .hero-last,
      .hero-weather{
        color:#fff!important;
        text-shadow:0 1px 4px rgba(0,35,78,.25)!important;
      }

      @media(max-width:760px){
        .hero{
          background-position:center top!important;
        }
      }


      /* =========================================================
         Beta18.1 — Clean realistic background + visible effects
         ========================================================= */
      .hero{
        background-image:
          linear-gradient(180deg,rgba(2,30,72,.03),rgba(2,28,74,.14)),
          image-set(
            none type("image/webp"),
            none type("image/png")
          )!important;
        background-size:cover!important;
        background-position:center center!important;
        background-repeat:no-repeat!important;
      }

      /* Bring back animated effects clearly above the photo-real background. */
      .hero > .wave{
        opacity:.78!important;
        filter:
          drop-shadow(0 0 5px rgba(157,224,255,.28))
          drop-shadow(0 2px 4px rgba(0,48,100,.18))!important;
      }
      .wave-a{opacity:.76!important}
      .wave-b{opacity:.55!important}
      .wave-c{opacity:.38!important}

      .hero > .hero-bubble,
      .hero > .bubble{
        opacity:.72!important;
        filter:drop-shadow(0 0 5px rgba(210,244,255,.30))!important;
      }

      .hero > .light-sweep{
        opacity:.26!important;
        mix-blend-mode:screen!important;
      }

      .hero:before{
        opacity:.14!important;
        mix-blend-mode:screen!important;
      }
      .hero:after{
        opacity:.12!important;
        mix-blend-mode:screen!important;
      }

      /* Ensure overlays remain below content. */
      .hero > .wave,
      .hero > .hero-bubble,
      .hero > .bubble,
      .hero > .light-sweep{
        position:absolute!important;
        z-index:2!important;
        pointer-events:none!important;
      }
      .hero > .hero-head,
      .hero > .hero-main,
      .hero > .hero-weather{
        position:relative!important;
        z-index:4!important;
      }

      @media(max-width:760px){
        .hero{
          background-position:center top!important;
        }
        .hero > .wave{opacity:.62!important}
        .hero > .hero-bubble,
        .hero > .bubble{opacity:.58!important}
      }


      /* =========================================================
         Beta19 — Premium ocean background + restored overlays
         ========================================================= */
      .hero{
        background-image:
          linear-gradient(180deg,rgba(2,28,68,.02),rgba(2,24,64,.13)),
          image-set(
            none type("image/webp"),
            none type("image/png")
          )!important;
        background-size:cover!important;
        background-position:center center!important;
        background-repeat:no-repeat!important;
      }

      .hero > .wave{
        opacity:.88!important;
        filter:
          drop-shadow(0 0 6px rgba(174,232,255,.34))
          drop-shadow(0 2px 5px rgba(0,44,96,.20))!important;
      }
      .wave-a{opacity:.86!important}
      .wave-b{opacity:.66!important}
      .wave-c{opacity:.46!important}

      .hero > .hero-bubble,
      .hero > .bubble{
        opacity:.82!important;
        filter:
          drop-shadow(0 0 5px rgba(222,247,255,.40))
          drop-shadow(0 3px 8px rgba(0,56,112,.16))!important;
      }

      .hero > .light-sweep{
        opacity:.32!important;
        mix-blend-mode:screen!important;
      }
      .hero:before{
        opacity:.18!important;
        mix-blend-mode:screen!important;
      }
      .hero:after{
        opacity:.15!important;
        mix-blend-mode:screen!important;
      }

      .hero > .wave,
      .hero > .hero-bubble,
      .hero > .bubble,
      .hero > .light-sweep{
        position:absolute!important;
        z-index:2!important;
        pointer-events:none!important;
      }
      .hero > .hero-head,
      .hero > .hero-main,
      .hero > .hero-weather{
        position:relative!important;
        z-index:5!important;
      }

      .score-ring{
        opacity:1!important;
        filter:
          drop-shadow(0 0 9px rgba(255,255,255,.18))
          drop-shadow(0 8px 18px rgba(0,35,84,.18))!important;
      }
      .hero-weather{
        background:linear-gradient(145deg,rgba(30,94,164,.76),rgba(13,63,135,.72))!important;
        border-color:rgba(255,255,255,.26)!important;
      }
      .smart-chip{
        background:linear-gradient(145deg,rgba(18,81,153,.70),rgba(7,55,127,.66))!important;
        border-color:rgba(255,255,255,.22)!important;
      }

      @media(max-width:760px){
        .hero{background-position:center top!important}
        .hero > .wave{opacity:.70!important}
        .hero > .hero-bubble,
        .hero > .bubble{opacity:.64!important}
      }


      /* =========================================================
         Beta20 — Pool Premium photorealistic hero
         ========================================================= */
      .hero{
        background-image:
          linear-gradient(180deg,rgba(1,34,70,.02),rgba(1,31,76,.12)),
          image-set(
            none type("image/webp"),
            none type("image/png")
          )!important;
        background-size:cover!important;
        background-position:center center!important;
        background-repeat:no-repeat!important;
        background-color:#0a8ec4!important;
      }

      /* Premium pool effects above the realistic background. */
      .hero > .wave{
        opacity:.82!important;
        filter:
          drop-shadow(0 0 6px rgba(190,245,255,.40))
          drop-shadow(0 2px 5px rgba(0,58,105,.18))!important;
      }
      .wave-a{opacity:.80!important}
      .wave-b{opacity:.60!important}
      .wave-c{opacity:.42!important}

      .hero > .hero-bubble,
      .hero > .bubble{
        opacity:.80!important;
        filter:
          drop-shadow(0 0 6px rgba(235,252,255,.46))
          drop-shadow(0 4px 9px rgba(0,67,110,.18))!important;
      }

      .hero > .light-sweep{
        opacity:.28!important;
        mix-blend-mode:screen!important;
      }
      .hero:before{
        opacity:.16!important;
        mix-blend-mode:screen!important;
      }
      .hero:after{
        opacity:.13!important;
        mix-blend-mode:screen!important;
      }

      .hero > .wave,
      .hero > .hero-bubble,
      .hero > .bubble,
      .hero > .light-sweep{
        position:absolute!important;
        z-index:2!important;
        pointer-events:none!important;
      }
      .hero > .hero-head,
      .hero > .hero-main,
      .hero > .hero-weather{
        position:relative!important;
        z-index:5!important;
      }

      /* Glass tuned for turquoise pool photography. */
      .smart-chip,
      .hero-weather{
        background:linear-gradient(145deg,rgba(0,119,166,.62),rgba(0,74,139,.58))!important;
        border-color:rgba(255,255,255,.30)!important;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.18),
          0 10px 24px rgba(0,44,82,.18)!important;
        backdrop-filter:blur(12px) saturate(125%)!important;
      }

      .score-ring{
        opacity:1!important;
        filter:
          drop-shadow(0 0 10px rgba(137,255,244,.26))
          drop-shadow(0 9px 20px rgba(0,44,82,.20))!important;
      }

      @media(max-width:760px){
        .hero{background-position:center top!important}
        .hero > .wave{opacity:.68!important}
        .hero > .hero-bubble,
        .hero > .bubble{opacity:.66!important}
      }


      /* =========================================================
         Beta21 — Resort Premium hero + harmonized device cards
         ========================================================= */
      .hero{
        background-image:
          linear-gradient(180deg,rgba(3,35,78,.10),rgba(2,28,70,.28)),
          image-set(
            none type("image/webp"),
            none type("image/png")
          )!important;
        background-size:cover!important;
        background-position:center center!important;
        background-repeat:no-repeat!important;
        background-color:#087ba8!important;
      }

      /* 1. Darker premium overlay for readability and depth */
      .hero:before{
        opacity:.20!important;
        mix-blend-mode:multiply!important;
        background:
          linear-gradient(180deg,rgba(3,36,80,.04),rgba(2,28,70,.24)),
          radial-gradient(circle at 52% 18%,rgba(255,255,255,.10),transparent 28%)!important;
      }

      /* 2. Stronger lower-water depth */
      .hero:after{
        opacity:.34!important;
        mix-blend-mode:multiply!important;
        background:
          linear-gradient(180deg,transparent 42%,rgba(0,45,92,.14) 68%,rgba(0,28,66,.34) 100%)!important;
      }

      /* 3. Visible elegant animated waves */
      .hero > .wave{
        opacity:.76!important;
        filter:
          drop-shadow(0 0 5px rgba(178,244,255,.32))
          drop-shadow(0 2px 5px rgba(0,55,105,.20))!important;
      }
      .wave-a{opacity:.72!important}
      .wave-b{opacity:.52!important}
      .wave-c{opacity:.34!important}

      /* 4. More numerous-looking microbubbles */
      .hero > .hero-bubble,
      .hero > .bubble{
        opacity:.68!important;
        transform:scale(.72);
        filter:
          drop-shadow(0 0 4px rgba(235,252,255,.40))
          drop-shadow(0 3px 7px rgba(0,62,108,.16))!important;
      }

      /* 5. Brighter light sweep / shimmer */
      .hero > .light-sweep{
        opacity:.24!important;
        mix-blend-mode:screen!important;
      }

      .hero > .wave,
      .hero > .hero-bubble,
      .hero > .bubble,
      .hero > .light-sweep{
        position:absolute!important;
        z-index:2!important;
        pointer-events:none!important;
      }
      .hero > .hero-head,
      .hero > .hero-main,
      .hero > .hero-weather{
        position:relative!important;
        z-index:5!important;
      }

      /* 6. More modern glassmorphism */
      .smart-chip,
      .hero-weather{
        background:linear-gradient(145deg,rgba(7,73,132,.52),rgba(3,52,107,.48))!important;
        border:1px solid rgba(255,255,255,.18)!important;
        backdrop-filter:blur(18px) saturate(135%)!important;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.16),
          0 12px 28px rgba(0,31,68,.18)!important;
      }

      /* 7. Score stays opaque and premium */
      .score-ring{
        opacity:1!important;
        filter:
          drop-shadow(0 0 12px rgba(83,243,236,.28))
          drop-shadow(0 10px 24px rgba(0,39,82,.24))!important;
      }

      /* 8. Harmonize device cards with the hero */
      .device-card{
        background:
          linear-gradient(155deg,rgba(11,69,139,.96),rgba(7,48,108,.98))!important;
        border:1px solid rgba(255,255,255,.14)!important;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.08),
          0 18px 38px rgba(0,39,86,.14)!important;
      }
      .device-card:before{
        content:"";
        position:absolute;
        inset:0;
        pointer-events:none;
        border-radius:inherit;
        background:
          linear-gradient(120deg,rgba(255,255,255,.06),transparent 36%),
          radial-gradient(circle at 80% 10%,rgba(93,202,255,.10),transparent 34%);
      }

      @media(min-width:761px){
        .hero{
          background-size:cover!important;
          background-position:center 48%!important;
        }
      }

      @media(max-width:760px){
        .hero{
          background-position:center top!important;
        }
        .hero > .wave{opacity:.62!important}
        .hero > .hero-bubble,
        .hero > .bubble{opacity:.56!important}
      }


      /* =========================================================
         Beta21.1 — Corrective Resort framing and ghost suppression
         ========================================================= */
      .hero{
        background-image:
          linear-gradient(180deg,rgba(2,30,70,.20),rgba(1,27,64,.42)),
          image-set(
            none type("image/webp"),
            none type("image/png")
          )!important;
        background-repeat:no-repeat!important;
        background-color:#0877a4!important;
        overflow:hidden!important;
      }

      /* Desktop: preserve the whole resort panorama, including palms. */
      @media(min-width:1200px){
        .hero{
          background-size:100% 100%!important;
          background-position:center center!important;
        }
      }

      @media(min-width:761px) and (max-width:1199px){
        .hero{
          background-size:cover!important;
          background-position:center 46%!important;
        }
      }

      /* Mobile: prioritize the pool and central horizon. */
      @media(max-width:760px){
        .hero{
          background-size:auto 100%!important;
          background-position:center top!important;
        }
      }

      /* Stronger, cleaner overlay to hide any residual UI ghosting in the source asset. */
      .hero:before{
        opacity:1!important;
        mix-blend-mode:normal!important;
        background:
          linear-gradient(90deg,
            rgba(4,40,88,.18) 0%,
            rgba(4,40,88,.08) 28%,
            rgba(4,40,88,.06) 58%,
            rgba(4,40,88,.18) 100%
          ),
          linear-gradient(180deg,
            rgba(6,46,96,.08) 0%,
            rgba(3,38,86,.16) 42%,
            rgba(1,28,68,.32) 100%
          )!important;
      }

      .hero:after{
        opacity:1!important;
        mix-blend-mode:normal!important;
        background:
          radial-gradient(circle at 66% 18%,rgba(255,255,255,.10),transparent 24%),
          linear-gradient(180deg,transparent 45%,rgba(0,26,66,.18) 74%,rgba(0,20,54,.34) 100%)!important;
      }

      /* Restore elegant but controlled animated effects. */
      .hero > .wave{
        opacity:.68!important;
        filter:
          drop-shadow(0 0 5px rgba(184,240,255,.28))
          drop-shadow(0 2px 4px rgba(0,50,98,.16))!important;
      }
      .wave-a{opacity:.66!important}
      .wave-b{opacity:.48!important}
      .wave-c{opacity:.30!important}

      .hero > .hero-bubble,
      .hero > .bubble{
        opacity:.58!important;
        transform:scale(.68)!important;
        filter:
          drop-shadow(0 0 4px rgba(236,252,255,.34))
          drop-shadow(0 3px 6px rgba(0,58,102,.14))!important;
      }

      .hero > .light-sweep{
        opacity:.18!important;
        mix-blend-mode:screen!important;
      }

      .hero > .wave,
      .hero > .hero-bubble,
      .hero > .bubble,
      .hero > .light-sweep{
        position:absolute!important;
        z-index:2!important;
        pointer-events:none!important;
      }

      .hero > .hero-head,
      .hero > .hero-main,
      .hero > .hero-weather{
        position:relative!important;
        z-index:5!important;
      }

      /* Unified glass language. */
      .smart-chip,
      .hero-weather{
        background:linear-gradient(145deg,rgba(6,67,127,.58),rgba(3,48,101,.54))!important;
        border:1px solid rgba(255,255,255,.20)!important;
        backdrop-filter:blur(16px) saturate(125%)!important;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.14),
          0 10px 24px rgba(0,28,64,.18)!important;
      }

      .device-card{
        background:
          linear-gradient(155deg,rgba(11,67,134,.97),rgba(5,44,99,.99))!important;
        border:1px solid rgba(255,255,255,.13)!important;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.07),
          0 16px 34px rgba(0,34,76,.14)!important;
      }

      .score-ring{
        opacity:1!important;
        filter:
          drop-shadow(0 0 10px rgba(90,232,236,.22))
          drop-shadow(0 9px 20px rgba(0,35,78,.20))!important;
      }


      /* =========================================================
         Beta22 — Clean autonomous Resort background
         ========================================================= */
      .hero{
        background-image:
          linear-gradient(180deg,rgba(1,31,71,.08),rgba(1,25,62,.28)),
          image-set(
            none type("image/webp"),
            none type("image/png")
          )!important;
        background-color:#087cab!important;
        background-repeat:no-repeat!important;
        overflow:hidden!important;
      }

      @media(min-width:1200px){
        .hero{
          background-size:100% 100%!important;
          background-position:center center!important;
        }
      }
      @media(min-width:761px) and (max-width:1199px){
        .hero{
          background-size:cover!important;
          background-position:center 48%!important;
        }
      }
      @media(max-width:760px){
        .hero{
          background-size:auto 100%!important;
          background-position:center top!important;
        }
      }

      /* Clean overlays only; no masking needed because the asset has no UI. */
      .hero:before{
        opacity:1!important;
        mix-blend-mode:normal!important;
        background:
          linear-gradient(90deg,rgba(2,37,82,.10),transparent 32%,transparent 68%,rgba(2,37,82,.12)),
          linear-gradient(180deg,rgba(3,44,91,.03),rgba(1,29,69,.17))!important;
      }
      .hero:after{
        opacity:1!important;
        mix-blend-mode:normal!important;
        background:
          radial-gradient(circle at 69% 15%,rgba(255,255,255,.10),transparent 24%),
          linear-gradient(180deg,transparent 46%,rgba(0,33,74,.10) 70%,rgba(0,22,57,.24) 100%)!important;
      }

      .hero > .wave{
        opacity:.74!important;
        filter:
          drop-shadow(0 0 5px rgba(192,244,255,.30))
          drop-shadow(0 2px 4px rgba(0,54,101,.16))!important;
      }
      .wave-a{opacity:.72!important}
      .wave-b{opacity:.52!important}
      .wave-c{opacity:.34!important}

      .hero > .hero-bubble,
      .hero > .bubble{
        opacity:.62!important;
        transform:scale(.70)!important;
        filter:
          drop-shadow(0 0 4px rgba(239,253,255,.36))
          drop-shadow(0 3px 6px rgba(0,61,106,.14))!important;
      }

      .hero > .light-sweep{
        opacity:.20!important;
        mix-blend-mode:screen!important;
      }

      .hero > .wave,
      .hero > .hero-bubble,
      .hero > .bubble,
      .hero > .light-sweep{
        position:absolute!important;
        z-index:2!important;
        pointer-events:none!important;
      }

      .hero > .hero-head,
      .hero > .hero-main,
      .hero > .hero-weather{
        position:relative!important;
        z-index:5!important;
      }

      .smart-chip,
      .hero-weather{
        background:linear-gradient(145deg,rgba(6,73,132,.52),rgba(3,52,108,.48))!important;
        border:1px solid rgba(255,255,255,.20)!important;
        backdrop-filter:blur(17px) saturate(130%)!important;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.15),
          0 11px 26px rgba(0,31,67,.18)!important;
      }

      .device-card{
        background:
          linear-gradient(155deg,rgba(10,67,134,.97),rgba(5,44,99,.99))!important;
        border:1px solid rgba(255,255,255,.13)!important;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.07),
          0 16px 34px rgba(0,34,76,.14)!important;
      }

      .score-ring{
        opacity:1!important;
        filter:
          drop-shadow(0 0 10px rgba(88,235,236,.24))
          drop-shadow(0 9px 20px rgba(0,35,78,.20))!important;
      }


      /* =========================================================
         Beta23 — Authoritative clean Hero rewrite
         ========================================================= */
      .hero{
        isolation:isolate!important;
        overflow:hidden!important;
        background:
          linear-gradient(180deg,rgba(2,31,72,.08),rgba(1,24,61,.25)),
          image-set(
            none type("image/webp"),
            none type("image/png")
          ) center center / cover no-repeat!important;
        background-color:#087cac!important;
      }
      .hero::before,.hero:before{
        content:""!important;position:absolute!important;inset:0!important;z-index:1!important;
        opacity:1!important;mix-blend-mode:normal!important;pointer-events:none!important;
        background:
          linear-gradient(90deg,rgba(2,35,79,.12),transparent 30%,transparent 70%,rgba(2,35,79,.13)),
          linear-gradient(180deg,rgba(3,42,89,.02),rgba(0,27,67,.18))!important;
      }
      .hero::after,.hero:after{
        content:""!important;position:absolute!important;inset:0!important;z-index:1!important;
        opacity:1!important;mix-blend-mode:normal!important;pointer-events:none!important;
        background:
          radial-gradient(circle at 72% 15%,rgba(255,255,255,.10),transparent 23%),
          linear-gradient(180deg,transparent 46%,rgba(0,31,71,.08) 68%,rgba(0,20,54,.20) 100%)!important;
      }
      @media(min-width:1400px){.hero{background-size:100% 100%!important;background-position:center center!important}}
      @media(min-width:761px) and (max-width:1399px){.hero{background-size:cover!important;background-position:center 48%!important}}
      @media(max-width:760px){.hero{background-size:auto 100%!important;background-position:center top!important}}
      .hero>.wave,.hero>.hero-bubble,.hero>.bubble,.hero>.light-sweep{
        position:absolute!important;z-index:2!important;pointer-events:none!important;
      }
      .hero>.wave{
        opacity:.76!important;
        filter:drop-shadow(0 0 5px rgba(194,245,255,.31)) drop-shadow(0 2px 4px rgba(0,52,98,.16))!important;
      }
      .wave-a{opacity:.74!important}.wave-b{opacity:.54!important}.wave-c{opacity:.36!important}
      .hero>.hero-bubble,.hero>.bubble{
        opacity:.66!important;transform:scale(.72)!important;
        filter:drop-shadow(0 0 4px rgba(240,253,255,.38)) drop-shadow(0 3px 6px rgba(0,60,105,.14))!important;
      }
      .hero>.light-sweep{opacity:.21!important;mix-blend-mode:screen!important}
      .hero>.hero-head,.hero>.hero-main,.hero>.hero-weather,
      .hero>*:not(.wave):not(.hero-bubble):not(.bubble):not(.light-sweep){
        position:relative!important;z-index:5!important;
      }
      .smart-chip,.hero-weather{
        background:linear-gradient(145deg,rgba(5,71,130,.54),rgba(2,49,103,.50))!important;
        border:1px solid rgba(255,255,255,.21)!important;
        backdrop-filter:blur(17px) saturate(132%)!important;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.15),0 11px 26px rgba(0,30,67,.18)!important;
      }
      .score-ring{
        opacity:1!important;
        filter:drop-shadow(0 0 10px rgba(88,235,236,.24)) drop-shadow(0 9px 20px rgba(0,35,78,.20))!important;
      }


      /* =========================================================
         Beta24 — Single clean photographic pool background
         ========================================================= */
      .hero{
        isolation:isolate!important;
        overflow:hidden!important;
        background:
          linear-gradient(180deg,rgba(3,30,67,.06),rgba(1,25,60,.22)),
          image-set(
            none type("image/webp"),
            none type("image/png")
          ) center center / cover no-repeat!important;
        background-color:#0785b6!important;
      }

      .hero::before,.hero:before{
        content:""!important;
        position:absolute!important;
        inset:0!important;
        z-index:1!important;
        pointer-events:none!important;
        opacity:1!important;
        mix-blend-mode:normal!important;
        background:
          linear-gradient(90deg,rgba(3,34,76,.12),transparent 31%,transparent 69%,rgba(3,34,76,.12)),
          linear-gradient(180deg,rgba(4,39,82,.01),rgba(0,25,61,.16))!important;
      }
      .hero::after,.hero:after{
        content:""!important;
        position:absolute!important;
        inset:0!important;
        z-index:1!important;
        pointer-events:none!important;
        opacity:1!important;
        mix-blend-mode:normal!important;
        background:
          radial-gradient(circle at 69% 15%,rgba(255,255,255,.09),transparent 23%),
          linear-gradient(180deg,transparent 48%,rgba(0,30,68,.07) 70%,rgba(0,19,51,.18) 100%)!important;
      }

      @media(min-width:1400px){
        .hero{
          background-size:100% 100%!important;
          background-position:center center!important;
        }
      }
      @media(min-width:761px) and (max-width:1399px){
        .hero{
          background-size:cover!important;
          background-position:center 48%!important;
        }
      }
      @media(max-width:760px){
        .hero{
          background-size:auto 100%!important;
          background-position:center top!important;
        }
      }

      .hero>.wave,.hero>.hero-bubble,.hero>.bubble,.hero>.light-sweep{
        position:absolute!important;
        z-index:2!important;
        pointer-events:none!important;
      }
      .hero>.wave{
        opacity:.70!important;
        filter:drop-shadow(0 0 5px rgba(196,246,255,.28)) drop-shadow(0 2px 4px rgba(0,50,94,.14))!important;
      }
      .wave-a{opacity:.68!important}
      .wave-b{opacity:.49!important}
      .wave-c{opacity:.31!important}

      .hero>.hero-bubble,.hero>.bubble{
        opacity:.60!important;
        transform:scale(.70)!important;
        filter:drop-shadow(0 0 4px rgba(242,254,255,.35)) drop-shadow(0 3px 6px rgba(0,58,101,.13))!important;
      }
      .hero>.light-sweep{
        opacity:.19!important;
        mix-blend-mode:screen!important;
      }

      .hero>.hero-head,.hero>.hero-main,.hero>.hero-weather,
      .hero>*:not(.wave):not(.hero-bubble):not(.bubble):not(.light-sweep){
        position:relative!important;
        z-index:5!important;
      }

      .smart-chip,.hero-weather{
        background:linear-gradient(145deg,rgba(5,72,130,.53),rgba(2,49,102,.49))!important;
        border:1px solid rgba(255,255,255,.21)!important;
        backdrop-filter:blur(17px) saturate(130%)!important;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.15),0 11px 26px rgba(0,30,66,.18)!important;
      }

      .score-ring{
        opacity:1!important;
        filter:drop-shadow(0 0 10px rgba(88,235,236,.23)) drop-shadow(0 9px 20px rgba(0,35,78,.19))!important;
      }


      /* =========================================================
         Beta25 — Mockup-accurate resort composition
         ========================================================= */
      .app{
        position:relative!important;
        isolation:isolate!important;
        padding:clamp(10px,1.35vw,22px)!important;
        border-radius:30px!important;
        color:#fff!important;
        background:
          linear-gradient(180deg,rgba(0,25,61,.05),rgba(0,29,70,.28)),
          image-set(
            none type("image/webp"),
            none type("image/png")
          ) center top / cover fixed no-repeat!important;
        box-shadow:inset 0 0 0 1px rgba(255,255,255,.08)!important;
      }
      .app::before{
        content:"";
        position:absolute;
        inset:0;
        z-index:-1;
        border-radius:inherit;
        pointer-events:none;
        background:
          linear-gradient(180deg,rgba(0,20,50,.05),rgba(0,23,58,.18) 44%,rgba(0,20,53,.44) 100%);
      }

      .hero{
        min-height:500px!important;
        height:500px!important;
        max-height:500px!important;
        padding:34px 44px 30px!important;
        border-radius:34px!important;
        color:#fff!important;
        background:linear-gradient(90deg,rgba(0,30,72,.26),rgba(0,58,102,.06) 50%,rgba(0,29,70,.32))!important;
        border:1px solid rgba(255,255,255,.16)!important;
        box-shadow:0 24px 52px rgba(0,29,68,.24),inset 0 1px 0 rgba(255,255,255,.12)!important;
        backdrop-filter:saturate(112%)!important;
      }

      .hero::before,.hero:before{
        opacity:1!important;
        z-index:1!important;
        background:
          linear-gradient(180deg,rgba(2,34,76,.02),rgba(0,28,67,.20)),
          radial-gradient(circle at 70% 15%,rgba(255,255,255,.11),transparent 24%)!important;
      }
      .hero::after,.hero:after{
        opacity:1!important;
        z-index:1!important;
        background:
          linear-gradient(180deg,transparent 42%,rgba(0,28,66,.08) 68%,rgba(0,18,48,.30) 100%)!important;
      }

      .hero-head{
        gap:16px!important;
        font-size:1.28rem!important;
      }
      .logo{
        width:72px!important;
        height:72px!important;
        border-radius:24px!important;
        background:linear-gradient(145deg,#23a9ff,#4a72f3)!important;
        box-shadow:0 14px 34px rgba(0,57,151,.28)!important;
      }
      .logo svg{width:30px!important;height:30px!important}

      .hero-main{
        grid-template-columns:minmax(0,1.55fr) minmax(350px,.65fr)!important;
        gap:36px!important;
        align-items:end!important;
      }
      .temperature{
        font-size:clamp(6rem,8.5vw,9rem)!important;
        font-weight:220!important;
        line-height:.82!important;
        letter-spacing:-.075em!important;
        text-shadow:0 3px 20px rgba(0,30,70,.22)!important;
      }
      .temperature small{font-size:1.45rem!important}
      .hero-label{
        margin-top:16px!important;
        font-size:1rem!important;
        opacity:.96!important;
        text-shadow:0 2px 8px rgba(0,28,65,.34)!important;
      }

      .hero-weather{
        right:190px!important;
        top:46px!important;
        padding:18px 22px!important;
        min-width:142px!important;
        border-radius:23px!important;
        background:linear-gradient(145deg,rgba(2,62,119,.72),rgba(1,45,95,.66))!important;
        border:1px solid rgba(255,255,255,.23)!important;
        backdrop-filter:blur(18px) saturate(138%)!important;
        box-shadow:0 18px 36px rgba(0,28,65,.22),inset 0 1px 0 rgba(255,255,255,.14)!important;
      }
      .hero-weather strong{font-size:1.35rem!important}
      .hero-weather small{font-size:.9rem!important}

      .smart-strip{
        grid-template-columns:repeat(4,minmax(0,1fr))!important;
        gap:14px!important;
        margin-top:22px!important;
        max-width:940px!important;
      }
      .smart-chip{
        min-height:92px!important;
        padding:17px 18px!important;
        border-radius:21px!important;
        background:linear-gradient(145deg,rgba(1,66,124,.62),rgba(0,46,96,.58))!important;
        border:1px solid rgba(255,255,255,.20)!important;
        backdrop-filter:blur(18px) saturate(135%)!important;
        box-shadow:0 15px 30px rgba(0,27,63,.16),inset 0 1px 0 rgba(255,255,255,.14)!important;
      }
      .smart-chip small{font-size:.72rem!important;opacity:.86!important}
      .smart-chip strong{font-size:1rem!important;margin-top:7px!important}

      .health{
        padding-bottom:8px!important;
        text-shadow:0 2px 9px rgba(0,25,59,.28)!important;
      }
      .score-ring{
        width:132px!important;
        height:132px!important;
        background:conic-gradient(#08a7ff var(--score,85%),rgba(255,255,255,.22) 0)!important;
        border:10px solid rgba(255,255,255,.88)!important;
        box-shadow:0 16px 34px rgba(0,29,68,.26),0 0 26px rgba(0,178,255,.20)!important;
      }
      .score-ring:after{
        inset:0!important;
        background:linear-gradient(145deg,rgba(0,109,193,.92),rgba(0,48,116,.90))!important;
      }
      .score-ring strong{font-size:2.55rem!important}
      .health-label{font-size:1.32rem!important;margin-top:14px!important}
      .stars{font-size:1.18rem!important;margin-top:8px!important}
      .health-advice{font-size:.88rem!important;line-height:1.45!important;max-width:410px!important;margin-left:auto!important}
      .hero-last{font-size:.78rem!important;margin-top:15px!important}
      .hero-last strong{font-size:.92rem!important}

      .section-title{
        color:#fff!important;
        margin:18px 10px 14px!important;
        font-size:.88rem!important;
        letter-spacing:.10em!important;
        text-shadow:0 2px 8px rgba(0,28,66,.38)!important;
      }

      .devices{
        gap:22px!important;
        margin:0 8px!important;
      }
      .device-card{
        min-height:410px!important;
        padding:26px!important;
        border-radius:28px!important;
        color:#fff!important;
        background:linear-gradient(155deg,rgba(0,62,116,.88),rgba(0,32,78,.92))!important;
        border:1px solid rgba(75,199,255,.34)!important;
        backdrop-filter:blur(20px) saturate(130%)!important;
        box-shadow:0 22px 46px rgba(0,23,59,.30),inset 0 1px 0 rgba(255,255,255,.11)!important;
      }
      .device-card h2{font-size:1.34rem!important}
      .device-card header>strong{font-size:2.45rem!important}
      .fresh{font-size:.76rem!important;color:#d6f4ff!important}
      .gauges{margin:18px 0!important;gap:26px!important}
      pool-gauge{filter:drop-shadow(0 8px 18px rgba(0,28,67,.24))!important}
      .linear i{height:8px!important;background:rgba(126,200,255,.18)!important}
      .linear b{background:linear-gradient(90deg,#28d9f5,#2489ff)!important}
      .chips>div,.last{
        background:rgba(255,255,255,.055)!important;
        border:1px solid rgba(255,255,255,.12)!important;
        backdrop-filter:blur(10px)!important;
      }

      .hero>.wave{opacity:.58!important}
      .wave-a{opacity:.58!important}
      .wave-b{opacity:.40!important}
      .wave-c{opacity:.24!important}
      .hero>.hero-bubble,.hero>.bubble{opacity:.54!important}
      .hero>.light-sweep{opacity:.20!important}

      /* Desktop composition like the mockup: cards float over the same resort image. */
      @media(min-width:1200px){
        .app{
          background-size:cover!important;
          background-position:center top!important;
        }
        .devices{
          transform:translateY(-6px)!important;
        }
      }

      @media(max-width:760px){
        .app{
          background-attachment:scroll!important;
          background-size:auto 100%!important;
          background-position:center top!important;
        }
        .hero{
          height:auto!important;
          min-height:0!important;
          max-height:none!important;
          padding:17px!important;
          border-radius:24px!important;
        }
        .logo{width:52px!important;height:52px!important;border-radius:18px!important}
        .logo svg{width:22px!important;height:22px!important}
        .temperature{font-size:clamp(3.6rem,16vw,4.9rem)!important}
        .hero-weather{position:static!important;min-width:0!important;padding:10px 12px!important}
        .smart-strip{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important;margin-top:14px!important}
        .smart-chip{min-height:68px!important;padding:10px!important;border-radius:15px!important}
        .smart-chip small{font-size:.64rem!important}
        .smart-chip strong{font-size:.82rem!important}
        .score-ring{width:88px!important;height:88px!important;border-width:7px!important}
        .score-ring strong{font-size:1.55rem!important}
        .device-card{padding:14px!important;border-radius:24px!important;min-height:0!important}
      }


      /* =========================================================
         Beta25.2 — Exact uploaded image as full dashboard background
         ========================================================= */
      .app{
        position:relative!important;
        isolation:isolate!important;
        min-height:100%!important;
        color:#fff!important;
        background:
          linear-gradient(180deg,rgba(0,20,52,.05),rgba(0,22,58,.22)),
          image-set(
            url("/local/ha-pool-dashboard/assets/pool-dashboard-background-beta25-2.webp?v=252") type("image/webp"),
            url("/local/ha-pool-dashboard/assets/pool-dashboard-background-beta25-2.png?v=252") type("image/png")
          ) center top / cover fixed no-repeat!important;
        background-color:#087daf!important;
      }

      .app::before{
        content:""!important;
        position:absolute!important;
        inset:0!important;
        z-index:-1!important;
        pointer-events:none!important;
        background:
          linear-gradient(180deg,
            rgba(0,18,48,.02) 0%,
            rgba(0,23,58,.10) 34%,
            rgba(0,22,58,.24) 68%,
            rgba(0,18,48,.42) 100%
          )!important;
      }

      /* Hero no longer owns a photo. It is only a transparent glass layer. */
      .hero{
        background:
          linear-gradient(90deg,
            rgba(0,31,72,.22),
            rgba(0,55,100,.05) 52%,
            rgba(0,28,68,.28)
          )!important;
        background-image:none!important;
        backdrop-filter:blur(2px) saturate(108%)!important;
        border:1px solid rgba(255,255,255,.16)!important;
        box-shadow:
          0 24px 52px rgba(0,29,68,.24),
          inset 0 1px 0 rgba(255,255,255,.12)!important;
      }

      .hero::before,.hero:before{
        background:
          radial-gradient(circle at 70% 15%,rgba(255,255,255,.10),transparent 24%),
          linear-gradient(180deg,rgba(0,24,58,.01),rgba(0,23,58,.14))!important;
      }

      .hero::after,.hero:after{
        background:
          linear-gradient(180deg,
            transparent 42%,
            rgba(0,27,64,.05) 68%,
            rgba(0,18,48,.22) 100%
          )!important;
      }

      /* Device cards float over the same exact global background. */
      .device-card{
        background:
          linear-gradient(155deg,
            rgba(0,57,111,.86),
            rgba(0,29,72,.92)
          )!important;
        backdrop-filter:blur(18px) saturate(128%)!important;
        border:1px solid rgba(78,201,255,.32)!important;
        box-shadow:
          0 22px 46px rgba(0,23,59,.30),
          inset 0 1px 0 rgba(255,255,255,.11)!important;
      }

      .smart-chip,.hero-weather{
        background:
          linear-gradient(145deg,
            rgba(3,66,123,.58),
            rgba(1,45,94,.54)
          )!important;
        backdrop-filter:blur(17px) saturate(132%)!important;
      }

      /* Keep effects as independent overlays. */
      .hero>.wave{opacity:.58!important}
      .wave-a{opacity:.58!important}
      .wave-b{opacity:.40!important}
      .wave-c{opacity:.24!important}
      .hero>.hero-bubble,.hero>.bubble{opacity:.52!important}
      .hero>.light-sweep{opacity:.18!important}

      @media(max-width:760px){
        .app{
          background-attachment:scroll!important;
          background-size:auto 100%!important;
          background-position:center top!important;
        }
      }


      /* =========================================================
         Beta26 — Compact desktop Hero
         ========================================================= */
      @media(min-width:1200px){
        .hero{
          min-height:420px!important;
          height:420px!important;
          max-height:420px!important;
          padding:24px 34px 22px!important;
          border-radius:30px!important;
        }

        .hero-head{
          gap:13px!important;
          margin-bottom:2px!important;
          font-size:1.14rem!important;
        }

        .logo{
          width:64px!important;
          height:64px!important;
          border-radius:21px!important;
        }
        .logo svg{
          width:27px!important;
          height:27px!important;
        }

        .hero-main{
          grid-template-columns:minmax(0,1.62fr) minmax(330px,.62fr)!important;
          gap:28px!important;
          align-items:end!important;
          margin-top:-2px!important;
        }

        .temperature{
          font-size:clamp(5.5rem,7.15vw,7.7rem)!important;
          line-height:.84!important;
          letter-spacing:-.072em!important;
        }
        .temperature small{
          font-size:1.22rem!important;
        }

        .hero-label{
          margin-top:10px!important;
          font-size:.92rem!important;
        }

        .hero-weather{
          top:30px!important;
          right:166px!important;
          min-width:128px!important;
          padding:14px 17px!important;
          border-radius:20px!important;
        }
        .hero-weather strong{
          font-size:1.16rem!important;
        }
        .hero-weather small{
          font-size:.82rem!important;
        }

        .smart-strip{
          gap:11px!important;
          margin-top:14px!important;
          max-width:860px!important;
        }
        .smart-chip{
          min-height:76px!important;
          padding:13px 15px!important;
          border-radius:18px!important;
        }
        .smart-chip small{
          font-size:.67rem!important;
        }
        .smart-chip strong{
          margin-top:5px!important;
          font-size:.91rem!important;
        }

        .health{
          padding-bottom:0!important;
          transform:translateY(-8px)!important;
        }

        .score-ring{
          width:116px!important;
          height:116px!important;
          border-width:9px!important;
        }
        .score-ring strong{
          font-size:2.18rem!important;
        }

        .health-label{
          margin-top:8px!important;
          font-size:1.16rem!important;
        }

        .stars{
          margin-top:4px!important;
          font-size:1.02rem!important;
        }

        .health-advice{
          margin-top:8px!important;
          max-width:390px!important;
          font-size:.80rem!important;
          line-height:1.36!important;
        }

        .hero-last{
          margin-top:8px!important;
          font-size:.72rem!important;
        }
        .hero-last strong{
          font-size:.83rem!important;
        }

        .section-title{
          margin-top:14px!important;
        }
      }

      /* Keep tablets comfortable without the oversized desktop Hero. */
      @media(min-width:761px) and (max-width:1199px){
        .hero{
          min-height:450px!important;
          height:450px!important;
          max-height:450px!important;
          padding:25px 28px 23px!important;
        }
        .temperature{
          font-size:clamp(5rem,9.6vw,6.9rem)!important;
        }
        .smart-chip{
          min-height:82px!important;
        }
      }


      /* =========================================================
         Beta27 — Sharp compact animated Hero
         ========================================================= */

      /* The exact global pool image remains untouched and sharp. */
      .app{
        background-image:
          linear-gradient(180deg,rgba(0,18,46,.025),rgba(0,20,50,.10)),
          image-set(
            url("/local/ha-pool-dashboard/assets/pool-dashboard-background-beta25-2.webp?v=27") type("image/webp"),
            url("/local/ha-pool-dashboard/assets/pool-dashboard-background-beta25-2.png?v=27") type("image/png")
          )!important;
        background-size:cover!important;
        background-position:center top!important;
        background-repeat:no-repeat!important;
        background-attachment:fixed!important;
      }

      /* No blur on the photo or Hero surface. */
      .hero{
        backdrop-filter:none!important;
        -webkit-backdrop-filter:none!important;
        background:linear-gradient(
          90deg,
          rgba(0,31,72,.14),
          rgba(0,55,100,.025) 52%,
          rgba(0,28,68,.18)
        )!important;
      }

      .hero::before,.hero:before{
        backdrop-filter:none!important;
        -webkit-backdrop-filter:none!important;
        background:
          radial-gradient(circle at 69% 14%,rgba(255,255,255,.09),transparent 24%),
          linear-gradient(180deg,rgba(0,22,54,.00),rgba(0,22,54,.08))!important;
      }

      .hero::after,.hero:after{
        background:
          linear-gradient(180deg,transparent 48%,rgba(0,27,64,.025) 72%,rgba(0,18,48,.12) 100%)!important;
      }

      @media(min-width:1200px){
        .hero{
          min-height:365px!important;
          height:365px!important;
          max-height:365px!important;
          padding:20px 30px 18px!important;
          border-radius:28px!important;
        }

        .hero-head{
          gap:11px!important;
          margin-bottom:0!important;
          font-size:1.06rem!important;
        }

        .logo{
          width:58px!important;
          height:58px!important;
          border-radius:19px!important;
        }
        .logo svg{
          width:24px!important;
          height:24px!important;
        }

        .hero-main{
          grid-template-columns:minmax(0,1.66fr) minmax(310px,.58fr)!important;
          gap:24px!important;
          margin-top:-4px!important;
          align-items:end!important;
        }

        .temperature{
          font-size:clamp(5rem,6.5vw,6.9rem)!important;
          line-height:.82!important;
          letter-spacing:-.07em!important;
        }
        .temperature small{
          font-size:1.08rem!important;
        }

        .hero-label{
          margin-top:7px!important;
          font-size:.86rem!important;
        }

        .hero-weather{
          top:22px!important;
          right:150px!important;
          min-width:118px!important;
          padding:12px 15px!important;
          border-radius:18px!important;
          backdrop-filter:none!important;
          -webkit-backdrop-filter:none!important;
          background:linear-gradient(145deg,rgba(2,54,109,.77),rgba(1,40,88,.72))!important;
        }
        .hero-weather strong{font-size:1.05rem!important}
        .hero-weather small{font-size:.76rem!important}

        .smart-strip{
          gap:9px!important;
          margin-top:11px!important;
          max-width:810px!important;
        }
        .smart-chip{
          min-height:66px!important;
          padding:10px 13px!important;
          border-radius:16px!important;
          backdrop-filter:none!important;
          -webkit-backdrop-filter:none!important;
          background:linear-gradient(145deg,rgba(3,60,116,.71),rgba(1,43,91,.67))!important;
        }
        .smart-chip small{
          font-size:.62rem!important;
        }
        .smart-chip strong{
          margin-top:4px!important;
          font-size:.84rem!important;
        }

        .health{
          transform:translateY(-10px)!important;
          padding-bottom:0!important;
        }

        .score-ring{
          width:104px!important;
          height:104px!important;
          border-width:8px!important;
        }
        .score-ring strong{
          font-size:1.95rem!important;
        }

        .health-label{
          margin-top:6px!important;
          font-size:1.07rem!important;
        }
        .stars{
          margin-top:2px!important;
          font-size:.94rem!important;
        }
        .health-advice{
          margin-top:6px!important;
          max-width:370px!important;
          font-size:.74rem!important;
          line-height:1.30!important;
        }
        .hero-last{
          margin-top:6px!important;
          font-size:.67rem!important;
        }
        .hero-last strong{
          font-size:.77rem!important;
        }

        .section-title{
          margin-top:10px!important;
        }
      }

      @media(min-width:761px) and (max-width:1199px){
        .hero{
          min-height:405px!important;
          height:405px!important;
          max-height:405px!important;
          padding:22px 25px 20px!important;
          backdrop-filter:none!important;
        }
        .temperature{
          font-size:clamp(4.7rem,8.8vw,6.2rem)!important;
        }
        .smart-chip{
          min-height:72px!important;
          backdrop-filter:none!important;
        }
      }

      /* Stronger, clearly visible water animations. */
      .hero>.wave{
        display:block!important;
        opacity:.88!important;
        animation-duration:8s!important;
        filter:
          drop-shadow(0 0 6px rgba(197,247,255,.48))
          drop-shadow(0 2px 5px rgba(0,48,94,.18))!important;
      }
      .wave-a{
        opacity:.84!important;
        animation:waveDriftA 8s ease-in-out infinite alternate!important;
      }
      .wave-b{
        opacity:.62!important;
        animation:waveDriftB 11s ease-in-out infinite alternate-reverse!important;
      }
      .wave-c{
        opacity:.43!important;
        animation:waveDriftC 14s ease-in-out infinite alternate!important;
      }

      .hero>.hero-bubble,.hero>.bubble{
        display:block!important;
        opacity:.76!important;
        transform:scale(.76)!important;
        animation:bubbleRise 9s linear infinite!important;
        box-shadow:
          inset 0 0 0 1px rgba(255,255,255,.52),
          inset 0 0 8px rgba(255,255,255,.24),
          0 0 9px rgba(205,247,255,.32)!important;
      }

      .hero>.b1{animation-delay:-1s!important}
      .hero>.b2{animation-delay:-4s!important}
      .hero>.b3{animation-delay:-7s!important}

      .hero>.light-sweep{
        display:block!important;
        opacity:.34!important;
        animation:poolShimmer 6.5s ease-in-out infinite!important;
        mix-blend-mode:screen!important;
      }

      @keyframes waveDriftA{
        from{transform:translate3d(-2.5%,0,0) scaleX(1.03)}
        to{transform:translate3d(2.5%,-4px,0) scaleX(1.08)}
      }
      @keyframes waveDriftB{
        from{transform:translate3d(3%,2px,0) scaleX(1.05)}
        to{transform:translate3d(-3%,-3px,0) scaleX(1.11)}
      }
      @keyframes waveDriftC{
        from{transform:translate3d(-1.5%,4px,0) scaleX(1.02)}
        to{transform:translate3d(2%,-2px,0) scaleX(1.07)}
      }
      @keyframes bubbleRise{
        0%{translate:0 48px;opacity:0}
        12%{opacity:.72}
        78%{opacity:.62}
        100%{translate:8px -150px;opacity:0}
      }
      @keyframes poolShimmer{
        0%,100%{transform:translateX(-18%) skewX(-12deg);opacity:.14}
        50%{transform:translateX(18%) skewX(-12deg);opacity:.38}
      }

      @media(prefers-reduced-motion:reduce){
        .hero>.wave,
        .hero>.hero-bubble,
        .hero>.bubble,
        .hero>.light-sweep{
          animation:none!important;
        }
      }

      @media(max-width:760px){
        .app{
          background-attachment:scroll!important;
        }
        .hero{
          backdrop-filter:none!important;
          -webkit-backdrop-filter:none!important;
        }
        .smart-chip,.hero-weather{
          backdrop-filter:none!important;
          -webkit-backdrop-filter:none!important;
        }
      }


      /* =========================================================
         Beta28 — Ultra compact Hero + icon smart cards + visible score
         ========================================================= */
      @media(min-width:1200px){
        .hero{
          min-height:330px!important;
          height:330px!important;
          max-height:330px!important;
          padding:17px 27px 15px!important;
          border-radius:26px!important;
        }

        .hero-head{
          gap:10px!important;
          font-size:1rem!important;
        }
        .logo{
          width:54px!important;
          height:54px!important;
          border-radius:18px!important;
        }
        .logo svg{
          width:23px!important;
          height:23px!important;
        }

        .hero-main{
          grid-template-columns:minmax(0,1.7fr) minmax(300px,.56fr)!important;
          gap:20px!important;
          margin-top:-6px!important;
        }

        .temperature{
          font-size:clamp(4.65rem,5.95vw,6.25rem)!important;
          line-height:.81!important;
        }
        .temperature small{
          font-size:1rem!important;
        }
        .hero-label{
          margin-top:5px!important;
          font-size:.81rem!important;
        }

        .hero-weather{
          top:16px!important;
          right:145px!important;
          min-width:112px!important;
          padding:10px 13px!important;
          border-radius:16px!important;
        }

        .smart-strip{
          gap:8px!important;
          margin-top:9px!important;
          max-width:840px!important;
        }
        .smart-chip{
          min-height:58px!important;
          padding:8px 11px!important;
          border-radius:15px!important;
        }

        .health{
          transform:translateY(-12px)!important;
        }
        .health-advice{
          max-width:360px!important;
          font-size:.71rem!important;
          line-height:1.25!important;
        }
        .hero-last{
          margin-top:4px!important;
        }

        .section-title{
          margin-top:7px!important;
        }
      }

      @media(min-width:761px) and (max-width:1199px){
        .hero{
          min-height:375px!important;
          height:375px!important;
          max-height:375px!important;
        }
      }

      /* Icon cards inspired by the validated mockup. */
      .smart-chip{
        display:flex!important;
        align-items:center!important;
        gap:10px!important;
        overflow:visible!important;
      }
      .smart-copy{
        min-width:0!important;
        display:block!important;
      }
      .smart-icon{
        flex:0 0 auto!important;
        width:36px!important;
        height:36px!important;
        display:grid!important;
        place-items:center!important;
        border-radius:12px!important;
        font-size:1.18rem!important;
        line-height:1!important;
        color:#26b8ff!important;
        background:linear-gradient(145deg,rgba(11,154,255,.23),rgba(6,85,178,.30))!important;
        border:1px solid rgba(69,194,255,.42)!important;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.16),
          0 6px 14px rgba(0,67,134,.18)!important;
      }
      .smart-icon-devices{
        font-size:1.38rem!important;
        font-weight:900!important;
      }
      .smart-chip small{
        display:block!important;
        opacity:.82!important;
      }
      .smart-chip strong{
        display:block!important;
      }

      /* High-contrast, always-visible 85/100 dial. */
      .score-ring{
        width:112px!important;
        height:112px!important;
        border:0!important;
        padding:8px!important;
        overflow:visible!important;
        background:
          conic-gradient(
            #19b9ff 0 var(--score,85%),
            rgba(255,255,255,.24) var(--score,85%) 100%
          )!important;
        box-shadow:
          0 0 0 4px rgba(255,255,255,.88),
          0 0 0 10px rgba(14,137,225,.25),
          0 15px 32px rgba(0,29,72,.30),
          0 0 25px rgba(20,184,255,.35)!important;
        filter:none!important;
      }
      .score-ring::after,.score-ring:after{
        inset:8px!important;
        background:
          radial-gradient(circle at 38% 28%,rgba(20,93,176,.98),rgba(1,37,89,.99) 70%)!important;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.14),
          inset 0 -10px 22px rgba(0,16,51,.28)!important;
      }
      .score-ring strong{
        color:#fff!important;
        font-size:2.05rem!important;
        font-weight:850!important;
        text-shadow:0 2px 8px rgba(0,18,48,.42)!important;
      }
      .score-ring small{
        color:#fff!important;
        font-size:.66rem!important;
        font-weight:800!important;
      }

      @media(max-width:760px){
        .smart-chip{
          gap:8px!important;
        }
        .smart-icon{
          width:32px!important;
          height:32px!important;
          border-radius:10px!important;
          font-size:1rem!important;
        }
        .score-ring{
          width:92px!important;
          height:92px!important;
          padding:7px!important;
        }
        .score-ring::after,.score-ring:after{
          inset:7px!important;
        }
      }


      /* =========================================================
         Beta29 — Final compact desktop composition
         ========================================================= */

      @media(min-width:1200px){
        .hero{
          min-height:288px!important;
          height:288px!important;
          max-height:288px!important;
          padding:14px 24px 13px!important;
          border-radius:25px!important;
        }

        .hero-head{
          gap:9px!important;
          margin-bottom:0!important;
          font-size:.94rem!important;
        }
        .logo{
          width:49px!important;
          height:49px!important;
          border-radius:16px!important;
        }
        .logo svg{
          width:21px!important;
          height:21px!important;
        }

        .hero-main{
          grid-template-columns:minmax(0,1.74fr) minmax(285px,.52fr)!important;
          gap:17px!important;
          margin-top:-7px!important;
          align-items:end!important;
        }

        /* Reduced and constrained to prevent title/temperature overlap. */
        .temperature{
          display:flex!important;
          align-items:flex-start!important;
          width:max-content!important;
          max-width:100%!important;
          white-space:nowrap!important;
          font-size:clamp(4.05rem,5.15vw,5.55rem)!important;
          line-height:.80!important;
          letter-spacing:-.068em!important;
          margin-top:4px!important;
        }
        .temperature small{
          flex:0 0 auto!important;
          margin-left:7px!important;
          margin-top:5px!important;
          font-size:.90rem!important;
          letter-spacing:0!important;
        }
        .hero-label{
          margin-top:4px!important;
          font-size:.75rem!important;
          line-height:1.15!important;
          opacity:.91!important;
        }

        /* Weather and score form a tighter right-side group. */
        .hero-weather{
          top:12px!important;
          right:126px!important;
          min-width:103px!important;
          padding:9px 11px!important;
          border-radius:15px!important;
        }
        .hero-weather strong{
          font-size:.94rem!important;
        }
        .hero-weather small{
          font-size:.68rem!important;
        }

        .smart-strip{
          gap:7px!important;
          margin-top:7px!important;
          max-width:790px!important;
        }
        .smart-chip{
          min-height:51px!important;
          padding:7px 9px!important;
          border-radius:14px!important;
          gap:8px!important;
        }
        .smart-chip small{
          font-size:.56rem!important;
          line-height:1.05!important;
        }
        .smart-chip strong{
          margin-top:3px!important;
          font-size:.76rem!important;
          line-height:1.08!important;
        }
        .smart-icon{
          width:34px!important;
          height:34px!important;
          border-radius:50%!important;
          font-size:1.08rem!important;
          background:
            radial-gradient(circle at 35% 28%,rgba(62,200,255,.42),rgba(3,87,181,.30) 58%,rgba(0,49,114,.42))!important;
          border:1px solid rgba(72,203,255,.56)!important;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,.22),
            0 0 12px rgba(18,174,255,.25),
            0 6px 13px rgba(0,52,114,.18)!important;
        }

        .health{
          transform:translateY(-15px)!important;
          padding-bottom:0!important;
        }
        .score-ring{
          width:100px!important;
          height:100px!important;
          padding:7px!important;
        }
        .score-ring::after,.score-ring:after{
          inset:7px!important;
        }
        .score-ring strong{
          font-size:1.86rem!important;
        }
        .health-label{
          margin-top:4px!important;
          font-size:.98rem!important;
        }
        .stars{
          margin-top:1px!important;
          font-size:.88rem!important;
        }
        .health-advice{
          margin-top:4px!important;
          max-width:340px!important;
          font-size:.66rem!important;
          line-height:1.21!important;
        }
        .hero-last{
          margin-top:4px!important;
          font-size:.61rem!important;
        }
        .hero-last strong{
          font-size:.70rem!important;
        }

        .section-title{
          margin-top:5px!important;
          margin-bottom:10px!important;
        }
      }

      @media(min-width:761px) and (max-width:1199px){
        .hero{
          min-height:350px!important;
          height:350px!important;
          max-height:350px!important;
          padding:18px 22px 16px!important;
        }
        .temperature{
          font-size:clamp(4.1rem,8vw,5.55rem)!important;
          white-space:nowrap!important;
        }
        .temperature small{
          margin-left:6px!important;
          font-size:.92rem!important;
        }
        .smart-chip{
          min-height:61px!important;
        }
      }

      /* More varied bubbles, still subtle and premium. */
      .hero>.hero-bubble,.hero>.bubble{
        opacity:.64!important;
        border:1px solid rgba(224,251,255,.55)!important;
        background:
          radial-gradient(circle at 31% 27%,rgba(255,255,255,.32),rgba(159,230,255,.09) 43%,rgba(0,89,155,.04) 70%)!important;
        box-shadow:
          inset 0 0 0 1px rgba(255,255,255,.18),
          inset 0 0 8px rgba(255,255,255,.16),
          0 0 8px rgba(192,243,255,.28)!important;
      }
      .hero>.b1{
        transform:scale(.54)!important;
        animation-duration:12s!important;
      }
      .hero>.b2{
        transform:scale(.82)!important;
        animation-duration:16s!important;
      }
      .hero>.b3{
        transform:scale(.66)!important;
        animation-duration:20s!important;
      }

      /* Two clearly perceptible but fine wave layers. */
      .hero>.wave{
        stroke-width:1.15!important;
        filter:
          drop-shadow(0 0 4px rgba(204,248,255,.31))
          drop-shadow(0 2px 4px rgba(0,43,87,.12))!important;
      }
      .wave-a{
        opacity:.38!important;
        animation-duration:16s!important;
      }
      .wave-b{
        opacity:.26!important;
        animation-duration:22s!important;
      }
      .wave-c{
        opacity:.14!important;
        animation-duration:28s!important;
      }

      .hero>.light-sweep{
        opacity:.25!important;
        animation-duration:8.5s!important;
      }

      @media(max-width:760px){
        .temperature{
          white-space:nowrap!important;
        }
        .temperature small{
          margin-left:4px!important;
        }
      }


      /* =========================================================
         Beta30 — Resort glass device cards
         ========================================================= */

      .hero-weather{
        display:none!important;
      }

      .smart-copy em{
        display:block!important;
        margin-top:3px!important;
        color:rgba(235,250,255,.96)!important;
        font-size:.67rem!important;
        line-height:1!important;
        font-style:normal!important;
        font-weight:800!important;
      }

      @media(min-width:1200px){
        .hero-main{
          grid-template-columns:minmax(0,1.74fr) minmax(292px,.50fr)!important;
        }
        .health{
          transform:translateY(-7px)!important;
          align-self:center!important;
        }
        .score-ring{
          width:106px!important;
          height:106px!important;
        }
      }

      /* Transparent device cards matching the four smart cards. */
      .device-card{
        position:relative!important;
        overflow:hidden!important;
        color:#fff!important;
        background:
          linear-gradient(
            150deg,
            rgba(2,67,122,.52),
            rgba(0,34,79,.62)
          )!important;
        border:1px solid rgba(63,205,255,.62)!important;
        backdrop-filter:blur(7px) saturate(130%)!important;
        -webkit-backdrop-filter:blur(7px) saturate(130%)!important;
        box-shadow:
          0 20px 42px rgba(0,22,57,.24),
          inset 0 1px 0 rgba(255,255,255,.18),
          inset 0 0 34px rgba(0,132,213,.08),
          0 0 16px rgba(0,153,230,.08)!important;
      }

      .device-card::before{
        content:""!important;
        position:absolute!important;
        inset:0!important;
        z-index:0!important;
        pointer-events:none!important;
        background:
          radial-gradient(circle at 76% 10%,rgba(94,224,255,.11),transparent 31%),
          linear-gradient(180deg,rgba(255,255,255,.025),rgba(0,18,48,.08))!important;
      }

      .device-card>*{
        position:relative!important;
        z-index:1!important;
      }

      .device-card h2,
      .device-card header>strong{
        text-shadow:0 2px 8px rgba(0,20,50,.38)!important;
      }

      .device-card .chips{
        gap:10px!important;
      }
      .device-card .chips>div{
        background:rgba(2,48,94,.32)!important;
        border:1px solid rgba(132,221,255,.23)!important;
        backdrop-filter:blur(5px)!important;
        -webkit-backdrop-filter:blur(5px)!important;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.08),
          0 7px 16px rgba(0,28,65,.10)!important;
      }

      /* Keep and polish the last-analysis row for every device. */
      .device-card .last{
        min-height:62px!important;
        padding:11px 13px!important;
        border-radius:16px!important;
        background:rgba(2,47,91,.34)!important;
        border:1px solid rgba(132,221,255,.22)!important;
        backdrop-filter:blur(5px)!important;
        -webkit-backdrop-filter:blur(5px)!important;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.08)!important;
      }
      .device-card .last small{
        opacity:.79!important;
      }
      .device-card .last strong{
        margin-top:2px!important;
        font-size:.91rem!important;
      }

      /* Existing per-device action button remains functional. */
      .device-card>button{
        min-height:49px!important;
        margin-top:10px!important;
        border:1px solid rgba(145,222,255,.38)!important;
        border-radius:15px!important;
        color:#fff!important;
        background:
          linear-gradient(90deg,#129dff,#3868ff)!important;
        box-shadow:
          0 10px 24px rgba(0,75,187,.27),
          inset 0 1px 0 rgba(255,255,255,.22)!important;
      }
      .device-card>button:hover{
        filter:brightness(1.07)!important;
        transform:translateY(-1px)!important;
      }

      .device-card .linear i{
        background:rgba(112,199,255,.20)!important;
      }

      @media(min-width:1200px){
        .devices{
          gap:18px!important;
        }
        .device-card{
          min-height:430px!important;
          padding:22px!important;
          border-radius:25px!important;
        }
      }

      @media(max-width:760px){
        .smart-copy em{
          font-size:.61rem!important;
        }
        .device-card{
          backdrop-filter:blur(5px) saturate(122%)!important;
          -webkit-backdrop-filter:blur(5px) saturate(122%)!important;
        }
      }


      /* =========================================================
         Beta31 — Desktop/tablet mockup structure
         ========================================================= */

      @media(min-width:761px){

        /* Real glass summary card in the top-right corner. */
        .hero-main{
          grid-template-columns:minmax(0,1fr) 292px!important;
          align-items:stretch!important;
          gap:20px!important;
        }

        .health{
          position:relative!important;
          align-self:stretch!important;
          justify-self:end!important;
          width:292px!important;
          min-width:292px!important;
          transform:none!important;
          display:flex!important;
          flex-direction:column!important;
          align-items:center!important;
          justify-content:center!important;
          padding:14px 16px 13px!important;
          border-radius:22px!important;
          overflow:hidden!important;
          background:
            linear-gradient(155deg,rgba(2,62,116,.58),rgba(0,31,75,.68))!important;
          border:1px solid rgba(69,207,255,.58)!important;
          backdrop-filter:blur(8px) saturate(128%)!important;
          -webkit-backdrop-filter:blur(8px) saturate(128%)!important;
          box-shadow:
            0 18px 38px rgba(0,23,58,.24),
            inset 0 1px 0 rgba(255,255,255,.17),
            inset 0 0 24px rgba(0,143,224,.08)!important;
        }

        .health::before{
          content:""!important;
          position:absolute!important;
          inset:0!important;
          z-index:0!important;
          pointer-events:none!important;
          background:
            radial-gradient(circle at 70% 10%,rgba(72,211,255,.10),transparent 34%),
            linear-gradient(180deg,rgba(255,255,255,.018),rgba(0,17,46,.08))!important;
        }

        .health>*{
          position:relative!important;
          z-index:1!important;
        }

        .score-ring{
          margin-top:0!important;
        }

        .health-label{
          margin-top:7px!important;
        }

        .health-advice{
          margin-top:6px!important;
          max-width:245px!important;
          text-align:center!important;
        }

        .hero-last{
          width:100%!important;
          margin-top:8px!important;
          padding-top:8px!important;
          text-align:center!important;
          border-top:1px solid rgba(255,255,255,.12)!important;
        }

        /* Rebuild each device card as a three-row desktop/tablet layout. */
        .device-card{
          display:grid!important;
          grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(185px,.92fr)!important;
          grid-template-areas:
            "header header header"
            "gauges gauges metric"
            "chips last action"!important;
          grid-template-rows:auto minmax(150px,1fr) auto!important;
          column-gap:16px!important;
          row-gap:12px!important;
          min-height:390px!important;
          padding:21px!important;
        }

        .device-card>header{
          grid-area:header!important;
          margin:0!important;
        }

        .device-card>.gauges{
          grid-area:gauges!important;
          display:grid!important;
          grid-template-columns:repeat(2,minmax(0,1fr))!important;
          align-items:center!important;
          gap:16px!important;
          margin:0!important;
          min-width:0!important;
        }

        .device-card>.linear{
          grid-area:metric!important;
          align-self:center!important;
          margin:0!important;
          min-width:0!important;
          padding:12px 0!important;
        }

        .device-card>.chips{
          grid-area:chips!important;
          display:grid!important;
          grid-template-columns:repeat(2,minmax(0,1fr))!important;
          align-self:stretch!important;
          gap:9px!important;
          margin:0!important;
          min-width:0!important;
        }

        .device-card>.chips>div{
          min-height:76px!important;
          padding:12px 13px!important;
          border-radius:16px!important;
        }

        .device-card>.last{
          grid-area:last!important;
          align-self:stretch!important;
          min-height:76px!important;
          margin:0!important;
        }

        .device-card>button{
          grid-area:action!important;
          align-self:stretch!important;
          min-height:76px!important;
          height:auto!important;
          margin:0!important;
          padding:12px 14px!important;
          border-radius:16px!important;
          white-space:normal!important;
          line-height:1.16!important;
        }

        /* When no analysis action exists, keep the last-analysis card aligned. */
        .device-card:not(:has(>button))>.last{
          grid-column:last / action!important;
        }

        .device-card>.anomaly{
          grid-column:1 / -1!important;
          margin:0!important;
        }
      }

      @media(min-width:761px) and (max-width:1199px){
        .hero-main{
          grid-template-columns:minmax(0,1fr) 250px!important;
        }

        .health{
          width:250px!important;
          min-width:250px!important;
          padding:12px!important;
        }

        .device-card{
          grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(160px,.82fr)!important;
          column-gap:12px!important;
          padding:17px!important;
          min-height:370px!important;
        }

        .device-card>.chips>div,
        .device-card>.last,
        .device-card>button{
          min-height:70px!important;
        }
      }

      /* Explicitly preserve the existing mobile flow. */
      @media(max-width:760px){
        .health{
          width:auto!important;
          min-width:0!important;
        }

        .device-card{
          display:block!important;
        }
      }


      /* =========================================================
         Beta32 — Final reference design
         ========================================================= */

      :host{
        font-family:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif!important;
      }

      @media(min-width:1200px){
        /* Enough room for the full score card: no clipping. */
        .hero{
          min-height:346px!important;
          height:346px!important;
          max-height:346px!important;
          padding:18px 26px 16px!important;
          overflow:visible!important;
        }

        .hero-main{
          grid-template-columns:minmax(0,1fr) 286px!important;
          gap:22px!important;
          align-items:stretch!important;
        }

        .temperature{
          font-size:clamp(4.2rem,5.35vw,5.8rem)!important;
          font-weight:220!important;
          line-height:.82!important;
        }

        .smart-strip{
          max-width:930px!important;
          gap:12px!important;
          margin-top:13px!important;
        }

        .smart-chip{
          min-height:78px!important;
          padding:11px 14px!important;
          border-radius:19px!important;
          gap:12px!important;
          background:linear-gradient(145deg,rgba(0,63,111,.58),rgba(0,34,75,.66))!important;
          border:1px solid rgba(71,211,255,.62)!important;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,.18),
            0 14px 28px rgba(0,25,61,.17),
            0 0 12px rgba(0,169,239,.08)!important;
        }

        .smart-icon{
          width:46px!important;
          height:46px!important;
          border-radius:50%!important;
        }

        .smart-icon svg{
          width:25px!important;
          height:25px!important;
          fill:#dff9ff!important;
          filter:drop-shadow(0 0 7px rgba(30,202,255,.85))!important;
        }

        .smart-chip small{
          font-size:.69rem!important;
          opacity:.88!important;
        }

        .smart-chip strong{
          margin-top:4px!important;
          font-size:1rem!important;
          font-weight:760!important;
        }

        .smart-copy em{
          margin-top:4px!important;
          font-size:.82rem!important;
        }

        /* Complete top-right score panel. */
        .health{
          width:286px!important;
          min-width:286px!important;
          height:100%!important;
          min-height:306px!important;
          padding:14px 17px 13px!important;
          border-radius:24px!important;
          overflow:visible!important;
          justify-content:flex-start!important;
          background:linear-gradient(155deg,rgba(0,57,105,.64),rgba(0,27,65,.76))!important;
          border:1px solid rgba(65,211,255,.68)!important;
          box-shadow:
            0 20px 40px rgba(0,20,52,.28),
            inset 0 1px 0 rgba(255,255,255,.19),
            0 0 17px rgba(0,180,255,.11)!important;
        }

        .score-ring{
          flex:0 0 auto!important;
          width:112px!important;
          height:112px!important;
          margin-top:0!important;
        }

        .health-label{
          margin-top:8px!important;
          font-size:1.12rem!important;
          font-weight:800!important;
        }

        .stars{
          margin-top:3px!important;
          font-size:1.05rem!important;
          letter-spacing:.10em!important;
        }

        .health-advice{
          margin-top:8px!important;
          max-width:245px!important;
          min-height:34px!important;
          font-size:.72rem!important;
          line-height:1.34!important;
        }

        .global-analysis{
          width:100%!important;
          min-height:42px!important;
          margin-top:10px!important;
          display:flex!important;
          align-items:center!important;
          justify-content:center!important;
          gap:8px!important;
          border:1px solid rgba(145,224,255,.40)!important;
          border-radius:13px!important;
          color:#fff!important;
          background:linear-gradient(90deg,#119cff,#3d68ff)!important;
          box-shadow:
            0 9px 22px rgba(0,73,183,.30),
            inset 0 1px 0 rgba(255,255,255,.22)!important;
          font:800 .75rem/1 Inter,ui-sans-serif,sans-serif!important;
          letter-spacing:.055em!important;
          text-transform:uppercase!important;
          cursor:pointer!important;
        }

        .global-analysis svg{
          width:17px!important;
          height:17px!important;
          fill:#fff!important;
        }

        .hero-last{
          display:flex!important;
          align-items:center!important;
          justify-content:center!important;
          gap:8px!important;
          margin-top:9px!important;
          padding-top:8px!important;
          font-size:.66rem!important;
          line-height:1.15!important;
        }

        .hero-last svg{
          flex:0 0 auto!important;
          width:17px!important;
          height:17px!important;
          fill:#dff7ff!important;
        }

        .hero-last span{
          display:block!important;
        }

        .hero-last strong{
          margin-top:3px!important;
          font-size:.77rem!important;
        }

        /* Device cards: exact three-column metric composition. */
        .device-card{
          min-height:414px!important;
          grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(185px,.90fr)!important;
          grid-template-rows:auto minmax(158px,1fr) 86px!important;
          column-gap:18px!important;
          row-gap:13px!important;
          padding:22px 24px!important;
          border-radius:25px!important;
          background:linear-gradient(150deg,rgba(0,62,111,.55),rgba(0,28,68,.68))!important;
          border:1px solid rgba(61,207,255,.63)!important;
        }

        .device-card>header{
          align-items:flex-start!important;
        }

        .device-card h2{
          font-size:1.28rem!important;
          font-weight:820!important;
        }

        .device-card header>strong{
          font-size:2.15rem!important;
          font-weight:260!important;
        }

        .device-card>.gauges{
          gap:20px!important;
        }

        .device-card>.linear{
          padding:18px 0 8px!important;
        }

        .device-card>.linear>div{
          align-items:flex-end!important;
        }

        .device-card>.linear span{
          font-size:.76rem!important;
        }

        .device-card>.linear strong{
          font-size:1.08rem!important;
        }

        .device-card>.chips>div,
        .device-card>.last{
          min-height:86px!important;
          border-radius:17px!important;
          background:rgba(1,43,84,.35)!important;
        }

        .device-card>button{
          min-height:86px!important;
          border-radius:17px!important;
          font-size:1rem!important;
          font-weight:820!important;
        }
      }

      @media(min-width:761px) and (max-width:1199px){
        .hero{
          min-height:390px!important;
          height:390px!important;
          max-height:390px!important;
          overflow:visible!important;
        }

        .hero-main{
          grid-template-columns:minmax(0,1fr) 246px!important;
        }

        .health{
          width:246px!important;
          min-width:246px!important;
          min-height:348px!important;
          overflow:visible!important;
        }

        .smart-icon{
          width:40px!important;
          height:40px!important;
        }

        .device-card{
          grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(150px,.80fr)!important;
          min-height:400px!important;
        }
      }

      @media(max-width:760px){
        .global-analysis{
          display:none!important;
        }
      }


      /* =========================================================
         Beta33 — Final desktop polish
         ========================================================= */

      @media(min-width:1200px){
        .hero{
          min-height:308px!important;
          height:308px!important;
          max-height:308px!important;
          padding:15px 24px 14px!important;
          border-radius:24px!important;
        }

        .hero-main{
          grid-template-columns:minmax(0,1fr) 276px!important;
          gap:20px!important;
        }

        .hero-head{
          gap:9px!important;
          font-size:.94rem!important;
        }

        .logo{
          width:47px!important;
          height:47px!important;
          border-radius:16px!important;
        }

        .logo svg{
          width:20px!important;
          height:20px!important;
        }

        .temperature{
          font-size:clamp(3.8rem,4.75vw,5.15rem)!important;
          line-height:.80!important;
          letter-spacing:-.066em!important;
          margin-top:3px!important;
        }

        .temperature small{
          margin-left:6px!important;
          margin-top:4px!important;
          font-size:.84rem!important;
        }

        .hero-label{
          margin-top:3px!important;
          font-size:.72rem!important;
        }

        .smart-strip{
          max-width:900px!important;
          gap:10px!important;
          margin-top:10px!important;
        }

        .smart-chip{
          min-height:68px!important;
          padding:9px 12px!important;
          border-radius:17px!important;
          gap:10px!important;
          background:linear-gradient(145deg,rgba(0,62,111,.66),rgba(0,34,75,.70))!important;
          border:1px solid rgba(73,211,255,.65)!important;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,.18),
            0 11px 24px rgba(0,24,59,.15),
            0 0 13px rgba(0,176,245,.09)!important;
        }

        .smart-icon{
          width:42px!important;
          height:42px!important;
        }

        .smart-icon svg{
          width:23px!important;
          height:23px!important;
        }

        .smart-chip small{
          font-size:.63rem!important;
        }

        .smart-chip strong{
          margin-top:3px!important;
          font-size:.95rem!important;
        }

        .smart-copy em{
          margin-top:3px!important;
          font-size:.76rem!important;
        }

        .health{
          width:276px!important;
          min-width:276px!important;
          min-height:274px!important;
          height:100%!important;
          padding:12px 15px 11px!important;
          border-radius:22px!important;
          background:linear-gradient(155deg,rgba(0,57,105,.69),rgba(0,27,65,.79))!important;
          border:1px solid rgba(70,212,255,.70)!important;
          box-shadow:
            0 18px 36px rgba(0,20,52,.27),
            inset 0 1px 0 rgba(255,255,255,.20),
            0 0 18px rgba(0,182,255,.12)!important;
        }

        .score-ring{
          width:118px!important;
          height:118px!important;
          padding:8px!important;
        }

        .score-ring::after,.score-ring:after{
          inset:8px!important;
        }

        .score-ring strong{
          font-size:2.12rem!important;
        }

        .health-label{
          margin-top:6px!important;
          font-size:1.15rem!important;
        }

        .stars{
          margin-top:2px!important;
          font-size:1.02rem!important;
          letter-spacing:.12em!important;
        }

        .health-advice{
          margin-top:6px!important;
          min-height:31px!important;
          max-width:235px!important;
          font-size:.69rem!important;
          line-height:1.29!important;
        }

        .global-analysis{
          min-height:38px!important;
          margin-top:8px!important;
          border-radius:12px!important;
          font-size:.70rem!important;
        }

        .hero-last{
          margin-top:7px!important;
          padding-top:7px!important;
          font-size:.62rem!important;
        }

        .hero-last strong{
          font-size:.72rem!important;
        }

        .device-card{
          min-height:388px!important;
          grid-template-rows:auto minmax(150px,1fr) 76px!important;
          column-gap:16px!important;
          row-gap:11px!important;
          padding:20px 22px!important;
          border-radius:24px!important;
          background:linear-gradient(150deg,rgba(0,62,111,.64),rgba(0,28,68,.72))!important;
          border:1px solid rgba(65,210,255,.66)!important;
          box-shadow:
            0 18px 38px rgba(0,22,57,.23),
            inset 0 1px 0 rgba(255,255,255,.18),
            inset 0 0 30px rgba(0,136,220,.08),
            0 0 14px rgba(0,164,238,.10)!important;
        }

        .device-card::after{
          content:""!important;
          position:absolute!important;
          inset:0 0 auto 0!important;
          height:1px!important;
          pointer-events:none!important;
          background:linear-gradient(90deg,transparent,rgba(175,239,255,.72),transparent)!important;
          opacity:.72!important;
        }

        .device-card h2{
          font-size:1.22rem!important;
        }

        .device-card header>strong{
          font-size:2rem!important;
        }

        .device-card>.gauges{
          gap:18px!important;
        }

        .device-card>.linear{
          padding:14px 0 6px!important;
        }

        .device-card>.chips>div,
        .device-card>.last{
          min-height:76px!important;
          padding:10px 12px!important;
        }

        .device-card>button{
          min-height:76px!important;
          font-size:.92rem!important;
        }
      }

      @media(min-width:761px) and (max-width:1199px){
        .hero{
          min-height:336px!important;
          height:336px!important;
          max-height:336px!important;
        }

        .hero-main{
          grid-template-columns:minmax(0,1fr) 238px!important;
        }

        .health{
          width:238px!important;
          min-width:238px!important;
          min-height:304px!important;
        }

        .temperature{
          font-size:clamp(3.9rem,7vw,5rem)!important;
        }

        .smart-chip{
          min-height:64px!important;
        }

        .device-card{
          min-height:380px!important;
        }
      }

      /* More organic bubble movement. */
      .hero>.b1{
        animation:
          bubbleRise 13s linear infinite,
          bubbleSwayA 5.8s ease-in-out infinite alternate!important;
      }

      .hero>.b2{
        animation:
          bubbleRise 17s linear infinite,
          bubbleSwayB 7.2s ease-in-out infinite alternate!important;
      }

      .hero>.b3{
        animation:
          bubbleRise 21s linear infinite,
          bubbleSwayA 8.4s ease-in-out infinite alternate-reverse!important;
      }

      @keyframes bubbleSwayA{
        from{margin-left:-5px}
        to{margin-left:8px}
      }

      @keyframes bubbleSwayB{
        from{margin-left:7px}
        to{margin-left:-9px}
      }


      /* =========================================================
         Beta34 — Locked desktop/tablet reference layout
         ========================================================= */

      @media(min-width:1200px){
        /* Hero uses a true two-column layout. The score panel never overlaps. */
        .hero{
          min-height:322px!important;
          height:322px!important;
          max-height:322px!important;
          padding:16px 24px 15px!important;
          overflow:hidden!important;
        }

        .hero-main{
          display:grid!important;
          grid-template-columns:minmax(0,1fr) 264px!important;
          gap:28px!important;
          align-items:stretch!important;
          width:100%!important;
          min-width:0!important;
        }

        .hero-left{
          min-width:0!important;
          overflow:visible!important;
        }

        .health{
          position:relative!important;
          inset:auto!important;
          width:264px!important;
          min-width:264px!important;
          max-width:264px!important;
          height:100%!important;
          min-height:286px!important;
          transform:none!important;
          align-self:stretch!important;
          justify-self:end!important;
          overflow:hidden!important;
          padding:12px 14px 11px!important;
          border-radius:22px!important;
          background:linear-gradient(155deg,rgba(0,54,103,.72),rgba(0,25,62,.82))!important;
          border:1px solid rgba(70,213,255,.72)!important;
          box-shadow:
            0 18px 38px rgba(0,20,52,.28),
            inset 0 1px 0 rgba(255,255,255,.20),
            inset 0 0 24px rgba(0,142,224,.08),
            0 0 16px rgba(0,180,255,.10)!important;
        }

        .temperature{
          font-size:clamp(3.55rem,4.35vw,4.8rem)!important;
          line-height:.79!important;
          font-weight:280!important;
          letter-spacing:-.062em!important;
        }

        .temperature small{
          font-size:.80rem!important;
          margin-left:5px!important;
          margin-top:3px!important;
        }

        .hero-label{
          font-size:.70rem!important;
          margin-top:3px!important;
          opacity:.90!important;
        }

        .smart-strip{
          max-width:900px!important;
          gap:11px!important;
          margin-top:11px!important;
        }

        .smart-chip{
          min-height:70px!important;
          padding:9px 12px!important;
          border-radius:21px!important;
          gap:11px!important;
          background:linear-gradient(145deg,rgba(0,62,111,.69),rgba(0,34,75,.73))!important;
          border:1px solid rgba(72,214,255,.68)!important;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,.19),
            inset 0 0 20px rgba(0,153,229,.06),
            0 12px 25px rgba(0,24,59,.15)!important;
        }

        .smart-icon{
          width:46px!important;
          height:46px!important;
          border-radius:50%!important;
        }

        .smart-icon svg{
          width:26px!important;
          height:26px!important;
        }

        .smart-chip small{
          font-size:.62rem!important;
          font-weight:430!important;
        }

        .smart-chip strong{
          font-size:.98rem!important;
          font-weight:740!important;
          margin-top:3px!important;
        }

        .smart-copy em{
          font-size:.76rem!important;
          font-weight:700!important;
        }

        .score-ring{
          width:116px!important;
          height:116px!important;
          flex:0 0 auto!important;
        }

        .score-ring strong{
          font-size:2.06rem!important;
        }

        .health-label{
          margin-top:6px!important;
          font-size:1.06rem!important;
          font-weight:760!important;
        }

        .stars{
          margin-top:2px!important;
          font-size:.98rem!important;
          letter-spacing:.11em!important;
        }

        .health-advice{
          margin-top:6px!important;
          max-width:226px!important;
          min-height:30px!important;
          font-size:.67rem!important;
          line-height:1.28!important;
        }

        .global-analysis{
          min-height:36px!important;
          margin-top:8px!important;
          border-radius:15px!important;
          font-size:.68rem!important;
          letter-spacing:.045em!important;
        }

        .global-analysis svg{
          width:15px!important;
          height:15px!important;
        }

        .hero-last{
          margin-top:7px!important;
          padding-top:7px!important;
          font-size:.60rem!important;
        }

        .hero-last strong{
          font-size:.70rem!important;
        }

        /* App section always starts below the full Hero. */
        .section-title{
          position:relative!important;
          z-index:2!important;
          clear:both!important;
          margin-top:14px!important;
        }

        .devices{
          position:relative!important;
          z-index:1!important;
          margin-top:0!important;
          gap:20px!important;
        }

        /* Device cards follow the reference proportions. */
        .device-card{
          min-height:404px!important;
          grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(190px,.92fr)!important;
          grid-template-rows:auto minmax(154px,1fr) 80px!important;
          column-gap:18px!important;
          row-gap:12px!important;
          padding:21px 23px!important;
          border-radius:25px!important;
          background:linear-gradient(150deg,rgba(0,60,109,.67),rgba(0,27,66,.75))!important;
          border:1px solid rgba(64,211,255,.68)!important;
          box-shadow:
            0 19px 39px rgba(0,22,57,.24),
            inset 0 1px 0 rgba(255,255,255,.19),
            inset 0 0 30px rgba(0,136,220,.08),
            0 0 15px rgba(0,164,238,.10)!important;
        }

        .device-card h2{
          font-size:1.22rem!important;
          font-weight:720!important;
        }

        .device-card header>strong{
          font-size:1.92rem!important;
          font-weight:280!important;
        }

        .device-card>.gauges{
          gap:20px!important;
        }

        .device-card .gauge{
          transform:scale(1.04)!important;
        }

        .device-card>.linear{
          align-self:center!important;
          padding:14px 0 8px!important;
          text-align:left!important;
        }

        .device-card>.chips>div,
        .device-card>.last{
          min-height:80px!important;
          padding:10px 12px!important;
          border-radius:17px!important;
        }

        .device-card>button{
          min-height:80px!important;
          border-radius:16px!important;
          font-size:.90rem!important;
          font-weight:760!important;
        }

        .device-card::after{
          opacity:.65!important;
        }
      }

      @media(min-width:761px) and (max-width:1199px){
        .hero{
          min-height:356px!important;
          height:356px!important;
          max-height:356px!important;
          padding:17px 20px 16px!important;
          overflow:hidden!important;
        }

        .hero-main{
          display:grid!important;
          grid-template-columns:minmax(0,1fr) 228px!important;
          gap:20px!important;
          align-items:stretch!important;
          width:100%!important;
        }

        .health{
          position:relative!important;
          inset:auto!important;
          width:228px!important;
          min-width:228px!important;
          max-width:228px!important;
          min-height:322px!important;
          height:100%!important;
          transform:none!important;
          align-self:stretch!important;
          overflow:hidden!important;
          padding:11px 12px!important;
        }

        .temperature{
          font-size:clamp(3.45rem,6.6vw,4.65rem)!important;
        }

        .smart-chip{
          min-height:66px!important;
        }

        .smart-icon{
          width:40px!important;
          height:40px!important;
        }

        .device-card{
          min-height:394px!important;
          grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(155px,.82fr)!important;
          grid-template-rows:auto minmax(148px,1fr) 76px!important;
          padding:18px!important;
        }

        .device-card>.chips>div,
        .device-card>.last,
        .device-card>button{
          min-height:76px!important;
        }
      }

      @media(max-width:760px){
        .hero{
          overflow:hidden!important;
        }
      }


      /* =========================================================
         Beta35 — Pixel-perfect locked reference
         ========================================================= */

      :host{
        font-family:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif!important;
      }

      @media(min-width:1200px){
        /* Full-height two-column Hero matching the reference image. */
        .hero{
          display:block!important;
          min-height:438px!important;
          height:438px!important;
          max-height:438px!important;
          padding:28px 34px 24px!important;
          overflow:hidden!important;
          border-radius:28px!important;
        }

        .hero-main{
          display:grid!important;
          grid-template-columns:minmax(0,1fr) 292px!important;
          grid-template-rows:1fr!important;
          gap:38px!important;
          width:100%!important;
          height:100%!important;
          min-height:0!important;
          align-items:stretch!important;
        }

        .hero-left{
          display:flex!important;
          flex-direction:column!important;
          min-width:0!important;
          min-height:0!important;
          padding:0!important;
        }

        .hero-head{
          position:relative!important;
          z-index:3!important;
          display:flex!important;
          align-items:center!important;
          gap:14px!important;
          margin:0 0 12px!important;
          font-size:1.24rem!important;
          font-weight:760!important;
        }

        .logo{
          width:68px!important;
          height:68px!important;
          border-radius:22px!important;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,.24),
            0 13px 28px rgba(0,60,190,.28)!important;
        }

        .logo svg{
          width:29px!important;
          height:29px!important;
        }

        .temperature{
          position:relative!important;
          z-index:3!important;
          width:max-content!important;
          max-width:100%!important;
          margin:0!important;
          white-space:nowrap!important;
          font-size:clamp(5.2rem,6.8vw,7.15rem)!important;
          font-weight:220!important;
          line-height:.80!important;
          letter-spacing:-.071em!important;
        }

        .temperature small{
          margin:5px 0 0 9px!important;
          font-size:1.05rem!important;
          font-weight:400!important;
          letter-spacing:0!important;
        }

        .hero-label{
          position:relative!important;
          z-index:3!important;
          margin-top:14px!important;
          font-size:.94rem!important;
          font-weight:430!important;
          line-height:1.2!important;
          opacity:.96!important;
        }

        .smart-strip{
          position:relative!important;
          z-index:3!important;
          display:grid!important;
          grid-template-columns:repeat(4,minmax(0,1fr))!important;
          gap:16px!important;
          width:100%!important;
          max-width:1060px!important;
          margin-top:auto!important;
          margin-bottom:4px!important;
        }

        .smart-chip{
          min-height:112px!important;
          padding:17px 18px!important;
          gap:15px!important;
          border-radius:23px!important;
          background:
            linear-gradient(145deg,rgba(0,60,108,.70),rgba(0,30,69,.76))!important;
          border:1px solid rgba(64,213,255,.73)!important;
          backdrop-filter:blur(8px) saturate(128%)!important;
          -webkit-backdrop-filter:blur(8px) saturate(128%)!important;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,.21),
            inset 0 0 22px rgba(0,160,234,.07),
            0 14px 30px rgba(0,22,57,.18),
            0 0 16px rgba(0,178,250,.11)!important;
        }

        .smart-icon{
          width:58px!important;
          height:58px!important;
          border-radius:50%!important;
          border:1px solid rgba(57,213,255,.78)!important;
          background:
            radial-gradient(circle at 35% 28%,rgba(59,205,255,.44),rgba(3,81,172,.35) 56%,rgba(0,34,89,.58))!important;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,.25),
            0 0 17px rgba(18,188,255,.48)!important;
        }

        .smart-icon svg{
          width:32px!important;
          height:32px!important;
          fill:#e8fbff!important;
          filter:drop-shadow(0 0 8px rgba(38,207,255,.92))!important;
        }

        .smart-chip small{
          font-size:.79rem!important;
          font-weight:430!important;
          opacity:.94!important;
        }

        .smart-chip strong{
          margin-top:7px!important;
          font-size:1.17rem!important;
          font-weight:790!important;
          line-height:1.08!important;
        }

        .smart-copy em{
          margin-top:6px!important;
          font-size:.98rem!important;
          font-weight:750!important;
        }

        /* Fully contained right-side summary card. */
        .health{
          position:relative!important;
          inset:auto!important;
          display:flex!important;
          flex-direction:column!important;
          align-items:center!important;
          justify-content:flex-start!important;
          width:292px!important;
          min-width:292px!important;
          max-width:292px!important;
          height:100%!important;
          min-height:0!important;
          padding:18px 18px 16px!important;
          transform:none!important;
          overflow:hidden!important;
          border-radius:25px!important;
          background:
            linear-gradient(155deg,rgba(0,53,101,.76),rgba(0,23,58,.86))!important;
          border:1px solid rgba(64,215,255,.76)!important;
          backdrop-filter:blur(9px) saturate(132%)!important;
          -webkit-backdrop-filter:blur(9px) saturate(132%)!important;
          box-shadow:
            0 20px 42px rgba(0,18,49,.31),
            inset 0 1px 0 rgba(255,255,255,.22),
            inset 0 0 28px rgba(0,145,225,.09),
            0 0 18px rgba(0,185,255,.13)!important;
        }

        .score-ring{
          flex:0 0 auto!important;
          width:152px!important;
          height:152px!important;
          margin:0!important;
          padding:10px!important;
          box-shadow:
            0 0 0 5px rgba(255,255,255,.92),
            0 0 0 11px rgba(18,159,236,.25),
            0 16px 34px rgba(0,20,52,.32),
            0 0 30px rgba(20,188,255,.44)!important;
        }

        .score-ring::after,.score-ring:after{
          inset:10px!important;
        }

        .score-ring strong{
          font-size:2.65rem!important;
          font-weight:830!important;
        }

        .score-ring small{
          font-size:.78rem!important;
        }

        .health-label{
          margin-top:13px!important;
          font-size:1.38rem!important;
          font-weight:820!important;
          line-height:1.1!important;
        }

        .stars{
          margin-top:7px!important;
          font-size:1.22rem!important;
          letter-spacing:.13em!important;
        }

        .health-advice{
          margin-top:12px!important;
          max-width:252px!important;
          min-height:52px!important;
          font-size:.79rem!important;
          line-height:1.42!important;
          text-align:center!important;
        }

        .global-analysis{
          width:100%!important;
          min-height:48px!important;
          margin-top:auto!important;
          border-radius:14px!important;
          font-size:.78rem!important;
          font-weight:820!important;
          letter-spacing:.052em!important;
        }

        .global-analysis svg{
          width:18px!important;
          height:18px!important;
        }

        .hero-last{
          width:100%!important;
          display:flex!important;
          align-items:center!important;
          justify-content:center!important;
          gap:9px!important;
          margin-top:12px!important;
          padding-top:11px!important;
          border-top:1px solid rgba(255,255,255,.13)!important;
          font-size:.70rem!important;
        }

        .hero-last svg{
          width:19px!important;
          height:19px!important;
        }

        .hero-last strong{
          margin-top:4px!important;
          font-size:.83rem!important;
        }

        .section-title{
          margin-top:17px!important;
          margin-bottom:12px!important;
          font-size:.94rem!important;
          letter-spacing:.07em!important;
        }

        /* Two identical device cards matching the reference. */
        .devices{
          grid-template-columns:repeat(2,minmax(0,1fr))!important;
          gap:22px!important;
          align-items:stretch!important;
        }

        .device-card{
          display:grid!important;
          grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(205px,.96fr)!important;
          grid-template-areas:
            "header header header"
            "gauges gauges metric"
            "chips chips analysis"!important;
          grid-template-rows:auto minmax(190px,1fr) 128px!important;
          column-gap:20px!important;
          row-gap:15px!important;
          min-height:520px!important;
          padding:25px 27px 24px!important;
          overflow:hidden!important;
          border-radius:27px!important;
          background:
            linear-gradient(150deg,rgba(0,59,108,.69),rgba(0,25,63,.79))!important;
          border:1px solid rgba(61,211,255,.73)!important;
          backdrop-filter:blur(8px) saturate(130%)!important;
          -webkit-backdrop-filter:blur(8px) saturate(130%)!important;
          box-shadow:
            0 21px 44px rgba(0,19,52,.28),
            inset 0 1px 0 rgba(255,255,255,.20),
            inset 0 0 34px rgba(0,136,220,.09),
            0 0 17px rgba(0,170,241,.12)!important;
        }

        .device-card>header{
          grid-area:header!important;
          margin:0!important;
          align-items:flex-start!important;
        }

        .device-card h2{
          font-size:1.48rem!important;
          font-weight:820!important;
          line-height:1.12!important;
        }

        .device-card header span{
          margin-top:8px!important;
          font-size:.77rem!important;
          letter-spacing:.12em!important;
        }

        .device-card .fresh{
          margin-top:11px!important;
          font-size:.77rem!important;
        }

        .device-card header>strong{
          font-size:2.55rem!important;
          font-weight:250!important;
          line-height:1!important;
        }

        .device-card header>strong small{
          font-size:.78rem!important;
        }

        .device-card>.gauges{
          grid-area:gauges!important;
          display:grid!important;
          grid-template-columns:repeat(2,minmax(0,1fr))!important;
          align-items:center!important;
          gap:27px!important;
          margin:0!important;
        }

        .device-card .gauge{
          transform:scale(1.16)!important;
        }

        .device-card>.linear{
          grid-area:metric!important;
          align-self:center!important;
          margin:0!important;
          padding:18px 0!important;
        }

        .device-card>.linear span{
          font-size:.82rem!important;
        }

        .device-card>.linear strong{
          font-size:1.30rem!important;
          font-weight:790!important;
        }

        .device-card>.linear i{
          height:9px!important;
          margin-top:15px!important;
        }

        .device-card>.chips{
          grid-area:chips!important;
          display:grid!important;
          grid-template-columns:repeat(2,minmax(0,1fr))!important;
          gap:13px!important;
          margin:0!important;
        }

        .device-card>.chips>div{
          min-height:128px!important;
          padding:20px 18px!important;
          border-radius:19px!important;
          background:rgba(1,41,81,.39)!important;
          border:1px solid rgba(134,222,255,.24)!important;
        }

        .device-card>.chips svg{
          width:25px!important;
          height:25px!important;
        }

        .device-card>.chips span{
          font-size:.84rem!important;
        }

        .device-card>.chips strong{
          margin-top:8px!important;
          font-size:1.15rem!important;
        }

        .analysis-box{
          grid-area:analysis!important;
          display:grid!important;
          grid-template-rows:1fr auto!important;
          gap:10px!important;
          min-width:0!important;
          min-height:128px!important;
          padding:14px!important;
          border-radius:19px!important;
          background:rgba(1,41,81,.39)!important;
          border:1px solid rgba(134,222,255,.24)!important;
          box-shadow:inset 0 1px 0 rgba(255,255,255,.08)!important;
        }

        .analysis-box .last{
          display:flex!important;
          align-items:center!important;
          gap:12px!important;
          min-height:0!important;
          margin:0!important;
          padding:0 3px!important;
          border:0!important;
          background:transparent!important;
          backdrop-filter:none!important;
          -webkit-backdrop-filter:none!important;
          box-shadow:none!important;
        }

        .analysis-box .last svg{
          width:23px!important;
          height:23px!important;
        }

        .analysis-box .last span{
          font-size:.78rem!important;
        }

        .analysis-box .last strong{
          margin-top:5px!important;
          font-size:.91rem!important;
          white-space:nowrap!important;
        }

        .analysis-box>button{
          display:flex!important;
          align-items:center!important;
          justify-content:center!important;
          gap:8px!important;
          width:100%!important;
          min-height:48px!important;
          margin:0!important;
          padding:10px 12px!important;
          border:1px solid rgba(145,224,255,.40)!important;
          border-radius:14px!important;
          color:#fff!important;
          background:linear-gradient(90deg,#119cff,#3d68ff)!important;
          box-shadow:
            0 10px 24px rgba(0,73,183,.30),
            inset 0 1px 0 rgba(255,255,255,.22)!important;
          font:800 .79rem/1.1 Inter,ui-sans-serif,sans-serif!important;
          letter-spacing:.025em!important;
          cursor:pointer!important;
        }

        .analysis-box>button svg{
          width:17px!important;
          height:17px!important;
          fill:#fff!important;
        }

        .device-card>.anomaly{
          grid-column:1 / -1!important;
        }
      }

      @media(min-width:761px) and (max-width:1199px){
        .hero{
          display:block!important;
          min-height:470px!important;
          height:470px!important;
          max-height:470px!important;
          padding:24px 26px 21px!important;
        }

        .hero-main{
          grid-template-columns:minmax(0,1fr) 250px!important;
          gap:25px!important;
          height:100%!important;
        }

        .health{
          width:250px!important;
          min-width:250px!important;
          max-width:250px!important;
          height:100%!important;
          padding:14px!important;
        }

        .score-ring{
          width:128px!important;
          height:128px!important;
        }

        .smart-strip{
          gap:10px!important;
        }

        .smart-chip{
          min-height:98px!important;
          padding:13px!important;
        }

        .smart-icon{
          width:48px!important;
          height:48px!important;
        }

        .device-card{
          grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(170px,.86fr)!important;
          grid-template-rows:auto minmax(170px,1fr) 116px!important;
          min-height:490px!important;
          padding:21px!important;
        }

        .device-card>.chips>div,
        .analysis-box{
          min-height:116px!important;
        }
      }

      @media(max-width:760px){
        .hero-left{
          display:block!important;
        }

        .analysis-box{
          display:block!important;
        }

        .analysis-box .last{
          margin-bottom:10px!important;
        }

        .analysis-box>button{
          width:100%!important;
        }
      }


      /* =========================================================
         Beta36 — Hero V2 isolated component
         ========================================================= */
      .hero-v2,
      .hero-v2 *{
        box-sizing:border-box!important;
      }

      .hero-v2{
        position:relative!important;
        isolation:isolate!important;
        width:100%!important;
        overflow:hidden!important;
        color:#fff!important;
        border:1px solid rgba(255,255,255,.16)!important;
        background:
          linear-gradient(90deg,rgba(0,27,66,.11),rgba(0,39,78,.025) 54%,rgba(0,20,55,.18))!important;
        box-shadow:
          0 24px 52px rgba(0,26,64,.19),
          inset 0 1px 0 rgba(255,255,255,.12)!important;
      }

      .hero-v2__effects{
        position:absolute!important;
        inset:0!important;
        z-index:0!important;
        pointer-events:none!important;
        overflow:hidden!important;
      }

      .hero-v2__grid{
        position:relative!important;
        z-index:2!important;
        display:grid!important;
        width:100%!important;
        height:100%!important;
        min-width:0!important;
      }

      .hero-v2__left{
        display:flex!important;
        flex-direction:column!important;
        min-width:0!important;
        min-height:0!important;
      }

      .hero-v2__brand{
        display:flex!important;
        align-items:center!important;
        color:#fff!important;
      }

      .hero-v2__logo{
        display:grid!important;
        place-items:center!important;
        flex:0 0 auto!important;
        color:#fff!important;
        background:linear-gradient(145deg,#62a9ff,#675cf1)!important;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.25),
          0 13px 28px rgba(0,60,190,.26)!important;
      }

      .hero-v2__logo svg,
      .hero-v2__metric-icon svg,
      .hero-v2__last svg{
        display:block!important;
        fill:currentColor!important;
      }

      .hero-v2__temperature{
        display:flex!important;
        align-items:flex-start!important;
        width:max-content!important;
        max-width:100%!important;
        white-space:nowrap!important;
        color:#fff!important;
        text-shadow:0 3px 15px rgba(0,25,55,.18)!important;
      }

      .hero-v2__temperature small{
        flex:0 0 auto!important;
        letter-spacing:0!important;
      }

      .hero-v2__subtitle{
        color:rgba(255,255,255,.96)!important;
        text-shadow:0 2px 8px rgba(0,25,55,.18)!important;
      }

      .hero-v2__metrics{
        display:grid!important;
        width:100%!important;
        min-width:0!important;
      }

      .hero-v2__metric{
        display:flex!important;
        align-items:center!important;
        min-width:0!important;
        color:#fff!important;
        background:linear-gradient(145deg,rgba(0,59,107,.70),rgba(0,29,68,.77))!important;
        border:1px solid rgba(61,215,255,.73)!important;
        backdrop-filter:blur(8px) saturate(128%)!important;
        -webkit-backdrop-filter:blur(8px) saturate(128%)!important;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.21),
          inset 0 0 22px rgba(0,160,234,.07),
          0 14px 30px rgba(0,22,57,.18),
          0 0 16px rgba(0,178,250,.11)!important;
      }

      .hero-v2__metric>span:last-child{
        display:block!important;
        min-width:0!important;
        max-width:100%!important;
      }

      .hero-v2__metric small,
      .hero-v2__metric strong,
      .hero-v2__metric em{
        max-width:100%!important;
        overflow-wrap:normal!important;
        word-break:normal!important;
        hyphens:none!important;
      }

      .hero-v2__metric-icon{
        display:grid!important;
        place-items:center!important;
        flex:0 0 auto!important;
        color:#eafcff!important;
        border-radius:50%!important;
        border:1px solid rgba(57,213,255,.79)!important;
        background:
          radial-gradient(circle at 35% 28%,rgba(59,205,255,.45),rgba(3,81,172,.36) 56%,rgba(0,34,89,.59))!important;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.25),
          0 0 17px rgba(18,188,255,.48)!important;
      }

      .hero-v2__metric-icon svg{
        filter:drop-shadow(0 0 8px rgba(38,207,255,.92))!important;
      }

      .hero-v2__metric small,
      .hero-v2__metric strong,
      .hero-v2__metric em{
        display:block!important;
      }

      .hero-v2__metric small{
        color:rgba(255,255,255,.90)!important;
      }

      .hero-v2__metric strong{
        color:#fff!important;
      }

      .hero-v2__metric em{
        color:#e9faff!important;
        font-style:normal!important;
      }

      .hero-v2__score{
        display:flex!important;
        flex-direction:column!important;
        align-items:center!important;
        justify-content:flex-start!important;
        min-width:0!important;
        height:100%!important;
        overflow:hidden!important;
        color:#fff!important;
        text-align:center!important;
        background:
          linear-gradient(155deg,rgba(0,52,100,.77),rgba(0,22,57,.87))!important;
        border:1px solid rgba(62,216,255,.77)!important;
        backdrop-filter:blur(9px) saturate(132%)!important;
        -webkit-backdrop-filter:blur(9px) saturate(132%)!important;
        box-shadow:
          0 20px 42px rgba(0,18,49,.31),
          inset 0 1px 0 rgba(255,255,255,.22),
          inset 0 0 28px rgba(0,145,225,.09),
          0 0 18px rgba(0,185,255,.13)!important;
      }

      .hero-v2__ring{
        display:grid!important;
        place-items:center!important;
        flex:0 0 auto!important;
        border-radius:50%!important;
        padding:10px!important;
        background:
          conic-gradient(#22c8ff 0 calc(var(--hero-score) * 1%),rgba(255,255,255,.27) calc(var(--hero-score) * 1%) 100%)!important;
        box-shadow:
          0 0 0 5px rgba(255,255,255,.92),
          0 0 0 11px rgba(18,159,236,.25),
          0 16px 34px rgba(0,20,52,.32),
          0 0 30px rgba(20,188,255,.44)!important;
      }

      .hero-v2__ring>div{
        display:flex!important;
        align-items:baseline!important;
        justify-content:center!important;
        width:100%!important;
        height:100%!important;
        border-radius:50%!important;
        color:#fff!important;
        background:
          radial-gradient(circle at 38% 28%,rgba(20,93,176,.99),rgba(1,35,86,.99) 70%)!important;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.14),
          inset 0 -12px 24px rgba(0,15,49,.31)!important;
      }

      .hero-v2__ring strong{
        font-weight:850!important;
      }

      .hero-v2__ring small{
        font-weight:800!important;
      }

      .hero-v2__score h2{
        margin:0!important;
        color:#fff!important;
      }

      .hero-v2__stars{
        color:#ffdc37!important;
        text-shadow:0 0 12px rgba(255,214,39,.25)!important;
      }

      .hero-v2__score p{
        margin:0!important;
        color:rgba(255,255,255,.94)!important;
      }

      .hero-v2__score .global-analysis{
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        width:100%!important;
        border:1px solid rgba(145,224,255,.42)!important;
        color:#fff!important;
        background:linear-gradient(90deg,#119cff,#3d68ff)!important;
        box-shadow:
          0 10px 24px rgba(0,73,183,.30),
          inset 0 1px 0 rgba(255,255,255,.22)!important;
        cursor:pointer!important;
      }

      .hero-v2__score .global-analysis svg{
        fill:#fff!important;
      }

      .hero-v2__last{
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        width:100%!important;
        border-top:1px solid rgba(255,255,255,.13)!important;
      }

      .hero-v2__last span,
      .hero-v2__last strong{
        display:block!important;
      }

      .hero-v2__mobile-summary{
        display:none!important;
      }

      .hero-v2__wave{
        position:absolute!important;
        left:-8%!important;
        width:116%!important;
        height:52px!important;
        border:1px solid rgba(207,248,255,.35)!important;
        border-color:rgba(207,248,255,.35) transparent transparent transparent!important;
        border-radius:50%!important;
        filter:drop-shadow(0 0 5px rgba(207,248,255,.27))!important;
      }

      .hero-v2__wave--1{
        bottom:28px!important;
        animation:heroV2Wave1 15s ease-in-out infinite alternate!important;
      }
      .hero-v2__wave--2{
        bottom:12px!important;
        opacity:.55!important;
        animation:heroV2Wave2 21s ease-in-out infinite alternate-reverse!important;
      }
      .hero-v2__wave--3{
        bottom:-4px!important;
        opacity:.30!important;
        animation:heroV2Wave1 28s ease-in-out infinite alternate!important;
      }

      .hero-v2__bubble{
        position:absolute!important;
        display:block!important;
        border-radius:50%!important;
        border:1px solid rgba(231,252,255,.55)!important;
        background:radial-gradient(circle at 30% 25%,rgba(255,255,255,.36),rgba(170,235,255,.09) 44%,rgba(0,91,157,.03) 70%)!important;
        box-shadow:
          inset 0 0 7px rgba(255,255,255,.17),
          0 0 9px rgba(192,243,255,.27)!important;
        animation:heroV2Bubble 14s linear infinite!important;
      }

      .hero-v2__bubble--1{left:14%;bottom:-20px;width:18px;height:18px;animation-duration:13s!important}
      .hero-v2__bubble--2{left:41%;bottom:-24px;width:11px;height:11px;animation-delay:-5s!important;animation-duration:17s!important}
      .hero-v2__bubble--3{left:68%;bottom:-26px;width:23px;height:23px;animation-delay:-9s!important;animation-duration:20s!important}
      .hero-v2__bubble--4{left:84%;bottom:-18px;width:14px;height:14px;animation-delay:-3s!important;animation-duration:15s!important}

      .hero-v2__shimmer{
        position:absolute!important;
        inset:-20% -25%!important;
        display:block!important;
        opacity:.19!important;
        mix-blend-mode:screen!important;
        background:linear-gradient(108deg,transparent 40%,rgba(255,255,255,.25) 49%,transparent 58%)!important;
        animation:heroV2Shimmer 8s ease-in-out infinite!important;
      }

      @keyframes heroV2Wave1{
        from{transform:translate3d(-2%,0,0) scaleX(1.02)}
        to{transform:translate3d(3%,-5px,0) scaleX(1.08)}
      }
      @keyframes heroV2Wave2{
        from{transform:translate3d(3%,2px,0) scaleX(1.06)}
        to{transform:translate3d(-3%,-4px,0) scaleX(1.11)}
      }
      @keyframes heroV2Bubble{
        0%{transform:translate3d(0,30px,0);opacity:0}
        12%{opacity:.65}
        75%{opacity:.55}
        100%{transform:translate3d(12px,-420px,0);opacity:0}
      }
      @keyframes heroV2Shimmer{
        0%,100%{transform:translateX(-16%) skewX(-10deg)}
        50%{transform:translateX(16%) skewX(-10deg)}
      }

      @media(min-width:1200px){
        .hero-v2{
          height:456px!important;
          min-height:456px!important;
          border-radius:30px!important;
          padding:30px 36px 27px!important;
        }

        .hero-v2__grid{
          grid-template-columns:minmax(0,1fr) 300px!important;
          gap:38px!important;
        }

        .hero-v2__brand{
          gap:16px!important;
          font-size:1.30rem!important;
        }

        .hero-v2__logo{
          width:70px!important;
          height:70px!important;
          border-radius:22px!important;
        }

        .hero-v2__logo svg{
          width:30px!important;
          height:30px!important;
        }

        .hero-v2__temperature{
          margin-top:13px!important;
          font-size:clamp(5.4rem,6.9vw,7.3rem)!important;
          font-weight:220!important;
          line-height:.80!important;
          letter-spacing:-.071em!important;
        }

        .hero-v2__temperature small{
          margin:7px 0 0 10px!important;
          font-size:1.08rem!important;
        }

        .hero-v2__subtitle{
          margin-top:16px!important;
          font-size:.96rem!important;
        }

        .hero-v2__metrics{
          grid-template-columns:repeat(4,minmax(0,1fr))!important;
          gap:12px!important;
          margin-top:auto!important;
        }

        .hero-v2__metric{
          min-height:108px!important;
          padding:14px 13px 14px 11px!important;
          gap:7px!important;
          border-radius:23px!important;
        }

        .hero-v2__metric-icon{
          width:42px!important;
          height:42px!important;
        }

        .hero-v2__metric-icon svg{
          width:23px!important;
          height:23px!important;
        }

        .hero-v2__metric small{
          font-size:.69rem!important;
          line-height:1.18!important;
        }

        .hero-v2__metric strong{
          margin-top:5px!important;
          font-size:.94rem!important;
          line-height:1.10!important;
          white-space:nowrap!important;
        }

        .hero-v2__metric em{
          margin-top:4px!important;
          font-size:.74rem!important;
          line-height:1.12!important;
          font-weight:700!important;
          white-space:nowrap!important;
        }

        /* Valeurs longues : conserver une vraie marge visuelle à droite */
        .hero-v2__confidence em{
          font-size:.66rem!important;
        }

        .hero-v2__weather strong{
          font-size:.87rem!important;
        }

        .hero-v2__weather em{
          font-size:.68rem!important;
        }

        .hero-v2__score{
          padding:18px 18px 16px!important;
          border-radius:25px!important;
        }

        .hero-v2__ring{
          width:156px!important;
          height:156px!important;
        }

        .hero-v2__ring strong{
          font-size:2.72rem!important;
        }

        .hero-v2__ring small{
          font-size:.80rem!important;
        }

        .hero-v2__score h2{
          margin-top:14px!important;
          font-size:1.40rem!important;
          line-height:1.08!important;
        }

        .hero-v2__stars{
          margin-top:8px!important;
          font-size:1.23rem!important;
          letter-spacing:.13em!important;
        }

        .hero-v2__score p{
          margin-top:13px!important;
          min-height:54px!important;
          font-size:.79rem!important;
          line-height:1.42!important;
        }

        .hero-v2__score .global-analysis{
          min-height:49px!important;
          margin-top:auto!important;
          gap:9px!important;
          border-radius:14px!important;
          font:820 .79rem/1 Inter,ui-sans-serif,sans-serif!important;
          letter-spacing:.05em!important;
          text-transform:uppercase!important;
        }

        .hero-v2__score .global-analysis svg{
          width:18px!important;
          height:18px!important;
        }

        .hero-v2__last{
          gap:9px!important;
          margin-top:12px!important;
          padding-top:11px!important;
          font-size:.70rem!important;
        }

        .hero-v2__last svg{
          width:19px!important;
          height:19px!important;
        }

        .hero-v2__last strong{
          margin-top:4px!important;
          font-size:.83rem!important;
        }
      }

      @media(min-width:761px) and (max-width:1199px){
        .hero-v2{
          height:480px!important;
          min-height:480px!important;
          padding:25px 27px 23px!important;
          border-radius:28px!important;
        }

        .hero-v2__grid{
          grid-template-columns:minmax(0,1fr) 250px!important;
          gap:25px!important;
        }

        .hero-v2__brand{
          gap:13px!important;
          font-size:1.12rem!important;
        }

        .hero-v2__logo{
          width:60px!important;
          height:60px!important;
          border-radius:20px!important;
        }

        .hero-v2__temperature{
          margin-top:12px!important;
          font-size:clamp(4.7rem,8vw,6.2rem)!important;
          line-height:.81!important;
        }

        .hero-v2__subtitle{
          margin-top:13px!important;
          font-size:.86rem!important;
        }

        .hero-v2__metrics{
          grid-template-columns:repeat(2,minmax(0,1fr))!important;
          gap:11px!important;
          margin-top:auto!important;
        }

        .hero-v2__metric{
          min-height:89px!important;
          padding:13px!important;
          gap:11px!important;
          border-radius:19px!important;
        }

        .hero-v2__metric-icon{
          width:46px!important;
          height:46px!important;
        }

        .hero-v2__metric-icon svg{
          width:25px!important;
          height:25px!important;
        }

        .hero-v2__metric small{font-size:.67rem!important}
        .hero-v2__metric strong{margin-top:4px!important;font-size:.95rem!important}
        .hero-v2__metric em{margin-top:4px!important;font-size:.77rem!important}

        .hero-v2__score{
          padding:14px!important;
          border-radius:22px!important;
        }

        .hero-v2__ring{
          width:128px!important;
          height:128px!important;
        }

        .hero-v2__ring strong{font-size:2.18rem!important}
        .hero-v2__score h2{margin-top:10px!important;font-size:1.12rem!important}
        .hero-v2__stars{margin-top:5px!important;font-size:1rem!important}
        .hero-v2__score p{margin-top:9px!important;font-size:.70rem!important;line-height:1.34!important}
        .hero-v2__score .global-analysis{min-height:42px!important;margin-top:auto!important;font-size:.68rem!important}
        .hero-v2__last{margin-top:9px!important;padding-top:8px!important;font-size:.62rem!important}
        .hero-v2__last strong{font-size:.72rem!important}
      }

      @media(max-width:760px){
        .hero-v2{
          min-height:500px!important;
          padding:20px 17px 18px!important;
          border-radius:25px!important;
        }

        .hero-v2__grid{
          display:block!important;
        }

        .hero-v2__brand{
          gap:11px!important;
          font-size:1rem!important;
        }

        .hero-v2__logo{
          width:52px!important;
          height:52px!important;
          border-radius:17px!important;
        }

        .hero-v2__logo svg{
          width:22px!important;
          height:22px!important;
        }

        .hero-v2__temperature{
          margin-top:14px!important;
          font-size:clamp(4.2rem,19vw,5.8rem)!important;
          line-height:.82!important;
        }

        .hero-v2__temperature small{
          margin:4px 0 0 6px!important;
          font-size:.84rem!important;
        }

        .hero-v2__subtitle{
          margin-top:10px!important;
          font-size:.76rem!important;
        }

        .hero-v2__metrics{
          grid-template-columns:repeat(2,minmax(0,1fr))!important;
          gap:9px!important;
          margin-top:18px!important;
        }

        .hero-v2__metric{
          min-height:75px!important;
          padding:10px!important;
          gap:8px!important;
          border-radius:16px!important;
        }

        .hero-v2__metric-icon{
          width:36px!important;
          height:36px!important;
        }

        .hero-v2__metric-icon svg{
          width:20px!important;
          height:20px!important;
        }

        .hero-v2__metric small{font-size:.58rem!important}
        .hero-v2__metric strong{margin-top:3px!important;font-size:.78rem!important}
        .hero-v2__metric em{margin-top:3px!important;font-size:.63rem!important}

        .hero-v2__score{
          display:none!important;
        }

        .hero-v2__mobile-summary{
          display:flex!important;
          justify-content:space-between!important;
          gap:10px!important;
          margin-top:12px!important;
          padding:10px 12px!important;
          border-radius:14px!important;
          color:#fff!important;
          background:rgba(0,39,80,.47)!important;
          border:1px solid rgba(116,218,255,.20)!important;
          font-size:.72rem!important;
          font-weight:750!important;
        }
      }

      @media(prefers-reduced-motion:reduce){
        .hero-v2__wave,
        .hero-v2__bubble,
        .hero-v2__shimmer{
          animation:none!important;
        }
      }


      /* =========================================================
         Beta37 — Unclipped score panel
         ========================================================= */

      @media(min-width:1200px){
        .hero-v2{
          height:492px!important;
          min-height:492px!important;
          max-height:492px!important;
          padding:28px 34px 26px!important;
        }

        .hero-v2__grid{
          grid-template-columns:minmax(0,1fr) 304px!important;
          gap:36px!important;
          height:100%!important;
          align-items:stretch!important;
        }

        .hero-v2__score{
          display:grid!important;
          grid-template-rows:146px auto auto minmax(54px,1fr) 48px 58px!important;
          align-items:center!important;
          justify-items:center!important;
          gap:0!important;
          width:304px!important;
          min-width:304px!important;
          max-width:304px!important;
          height:100%!important;
          min-height:0!important;
          max-height:none!important;
          padding:16px 18px 14px!important;
          overflow:hidden!important;
        }

        .hero-v2__ring{
          align-self:start!important;
          width:142px!important;
          height:142px!important;
          margin:0!important;
        }

        .hero-v2__ring strong{
          font-size:2.48rem!important;
        }

        .hero-v2__score h2{
          align-self:center!important;
          margin:6px 0 0!important;
          font-size:1.30rem!important;
          line-height:1.08!important;
        }

        .hero-v2__stars{
          align-self:center!important;
          margin:4px 0 0!important;
          font-size:1.10rem!important;
        }

        .hero-v2__score p{
          align-self:center!important;
          margin:7px 0 0!important;
          min-height:0!important;
          max-width:252px!important;
          font-size:.76rem!important;
          line-height:1.36!important;
        }

        .hero-v2__score .global-analysis{
          align-self:center!important;
          width:100%!important;
          min-height:44px!important;
          height:44px!important;
          margin:4px 0 0!important;
          border-radius:13px!important;
          font-size:.74rem!important;
        }

        .hero-v2__last{
          align-self:end!important;
          width:100%!important;
          min-height:52px!important;
          margin:6px 0 0!important;
          padding:8px 0 0!important;
          overflow:visible!important;
          font-size:.66rem!important;
          line-height:1.15!important;
        }

        .hero-v2__last strong{
          margin-top:3px!important;
          font-size:.78rem!important;
          white-space:nowrap!important;
        }

        .hero-v2__metrics{
          margin-top:auto!important;
        }
      }

      @media(min-width:761px) and (max-width:1199px){
        .hero-v2{
          height:520px!important;
          min-height:520px!important;
          max-height:520px!important;
        }

        .hero-v2__grid{
          grid-template-columns:minmax(0,1fr) 258px!important;
          height:100%!important;
        }

        .hero-v2__score{
          display:grid!important;
          grid-template-rows:126px auto auto minmax(52px,1fr) 42px 54px!important;
          align-items:center!important;
          justify-items:center!important;
          width:258px!important;
          min-width:258px!important;
          max-width:258px!important;
          height:100%!important;
          min-height:0!important;
          padding:14px!important;
          overflow:hidden!important;
        }

        .hero-v2__ring{
          width:122px!important;
          height:122px!important;
        }

        .hero-v2__score h2{
          margin:5px 0 0!important;
        }

        .hero-v2__score p{
          margin:6px 0 0!important;
          min-height:0!important;
        }

        .hero-v2__score .global-analysis{
          width:100%!important;
          height:40px!important;
          min-height:40px!important;
          margin:4px 0 0!important;
        }

        .hero-v2__last{
          min-height:49px!important;
          margin:5px 0 0!important;
          padding-top:7px!important;
          overflow:visible!important;
        }
      }


      /* =========================================================
         Beta38 — Centered score + compact device cards
         ========================================================= */

      /* Precise visual centering of the score inside the ring. */
      .hero-v2__ring>div{
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        gap:3px!important;
        padding:0!important;
        line-height:1!important;
      }

      .hero-v2__ring strong{
        display:block!important;
        margin:0!important;
        line-height:1!important;
        transform:translateY(1px)!important;
      }

      .hero-v2__ring small{
        display:block!important;
        align-self:center!important;
        margin:0!important;
        line-height:1!important;
        transform:translateY(8px)!important;
      }

      @media(min-width:1200px){
        /* Remove excessive vertical empty space from both device cards. */
        .device-card{
          min-height:418px!important;
          grid-template-rows:auto minmax(142px,1fr) 104px!important;
          padding:22px 25px 21px!important;
          row-gap:12px!important;
        }

        .device-card>.gauges{
          align-self:center!important;
          gap:22px!important;
        }

        .device-card .gauge{
          transform:scale(1.08)!important;
        }

        .device-card>.linear{
          padding:10px 0 4px!important;
        }

        .device-card>.chips>div{
          min-height:104px!important;
          padding:15px 16px!important;
        }

        .analysis-box{
          min-height:104px!important;
          padding:11px!important;
          gap:7px!important;
        }

        .analysis-box .last{
          gap:10px!important;
        }

        .analysis-box .last strong{
          margin-top:3px!important;
          font-size:.86rem!important;
        }

        .analysis-box>button{
          min-height:42px!important;
          padding:8px 10px!important;
          font-size:.75rem!important;
        }
      }

      @media(min-width:761px) and (max-width:1199px){
        .device-card{
          min-height:398px!important;
          grid-template-rows:auto minmax(136px,1fr) 98px!important;
          padding:19px!important;
          row-gap:10px!important;
        }

        .device-card .gauge{
          transform:scale(1.04)!important;
        }

        .device-card>.chips>div,
        .analysis-box{
          min-height:98px!important;
        }

        .analysis-box>button{
          min-height:40px!important;
        }
      }


      /* =========================================================
         Beta39 — Unified premium UI system
         ========================================================= */
      :host{
        --pool-space-1:4px;
        --pool-space-2:8px;
        --pool-space-3:12px;
        --pool-space-4:16px;
        --pool-space-5:20px;
        --pool-space-6:24px;
        --pool-radius-sm:14px;
        --pool-radius-md:19px;
        --pool-radius-lg:26px;
        --pool-glass-bg:linear-gradient(150deg,rgba(0,59,108,.66),rgba(0,25,63,.76));
        --pool-glass-soft:linear-gradient(150deg,rgba(239,249,255,.88),rgba(219,240,250,.78));
        --pool-glass-border:rgba(71,211,255,.62);
        --pool-glass-border-light:rgba(255,255,255,.54);
        --pool-shadow:0 18px 42px rgba(0,25,62,.20),inset 0 1px 0 rgba(255,255,255,.18);
        --pool-shadow-light:0 16px 36px rgba(1,48,82,.12),inset 0 1px 0 rgba(255,255,255,.70);
        --pool-cyan:#20c9ff;
        --pool-blue:#237dff;
        font-family:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif!important;
      }

      /* ---------------------------------------------------------
         DeviceCard V2 polish — desktop and tablet
         --------------------------------------------------------- */
      @media(min-width:761px){
        .devices{
          align-items:stretch!important;
          gap:20px!important;
        }

        .device-card{
          display:grid!important;
          grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(170px,.82fr)!important;
          grid-template-areas:
            "header header header"
            "gauges gauges metric"
            "chips chips analysis"!important;
          grid-template-rows:auto 132px 92px!important;
          min-height:0!important;
          height:auto!important;
          padding:18px 20px!important;
          row-gap:10px!important;
          column-gap:16px!important;
          border-radius:var(--pool-radius-lg)!important;
          background:var(--pool-glass-bg)!important;
          border:1px solid var(--pool-glass-border)!important;
          backdrop-filter:blur(8px) saturate(128%)!important;
          -webkit-backdrop-filter:blur(8px) saturate(128%)!important;
          box-shadow:var(--pool-shadow),0 0 14px rgba(0,172,241,.08)!important;
        }

        .device-card>header{
          grid-area:header!important;
          margin:0!important;
          min-height:54px!important;
          align-items:flex-start!important;
        }

        .device-card h2{
          margin:0!important;
          font-size:1.18rem!important;
          line-height:1.10!important;
          font-weight:760!important;
        }

        .device-card header span{
          margin-top:5px!important;
          font-size:.67rem!important;
          letter-spacing:.10em!important;
        }

        .device-card .fresh{
          margin-top:6px!important;
          font-size:.68rem!important;
        }

        .device-card header>strong{
          font-size:1.85rem!important;
          line-height:1!important;
          font-weight:280!important;
        }

        .device-card header>strong small{
          font-size:.68rem!important;
        }

        .device-card>.gauges{
          grid-area:gauges!important;
          display:grid!important;
          grid-template-columns:repeat(2,minmax(0,1fr))!important;
          align-items:center!important;
          justify-items:center!important;
          gap:14px!important;
          margin:-8px 0 0!important;
          min-height:0!important;
        }

        .device-card .gauge{
          transform:scale(.96)!important;
          transform-origin:center!important;
        }

        .device-card>.linear{
          grid-area:metric!important;
          align-self:center!important;
          margin:0!important;
          padding:4px 0 0!important;
        }

        .device-card>.linear>div{
          margin-bottom:4px!important;
          align-items:flex-end!important;
        }

        .device-card>.linear span{
          font-size:.69rem!important;
          line-height:1.05!important;
        }

        .device-card>.linear strong{
          font-size:1rem!important;
          line-height:1!important;
        }

        .device-card>.linear i{
          height:7px!important;
          margin-top:7px!important;
          border-radius:999px!important;
        }

        .device-card>.chips{
          grid-area:chips!important;
          display:grid!important;
          grid-template-columns:repeat(2,minmax(0,1fr))!important;
          gap:10px!important;
          margin:0!important;
        }

        .device-card>.chips>div{
          min-height:92px!important;
          padding:12px 14px!important;
          border-radius:var(--pool-radius-md)!important;
          background:rgba(1,42,82,.36)!important;
          border:1px solid rgba(132,222,255,.22)!important;
          box-shadow:inset 0 1px 0 rgba(255,255,255,.08)!important;
        }

        .device-card>.chips svg{
          width:21px!important;
          height:21px!important;
        }

        .device-card>.chips span{
          font-size:.72rem!important;
        }

        .device-card>.chips strong{
          margin-top:4px!important;
          font-size:.98rem!important;
        }

        .analysis-box{
          grid-area:analysis!important;
          display:grid!important;
          grid-template-rows:1fr 38px!important;
          gap:7px!important;
          min-height:92px!important;
          padding:10px!important;
          border-radius:var(--pool-radius-md)!important;
          background:rgba(1,42,82,.36)!important;
          border:1px solid rgba(132,222,255,.22)!important;
          box-shadow:inset 0 1px 0 rgba(255,255,255,.08)!important;
        }

        .analysis-box .last{
          display:flex!important;
          align-items:center!important;
          gap:9px!important;
          min-height:0!important;
          margin:0!important;
          padding:0 2px!important;
          border:0!important;
          background:transparent!important;
          box-shadow:none!important;
          backdrop-filter:none!important;
        }

        .analysis-box .last svg{
          width:19px!important;
          height:19px!important;
        }

        .analysis-box .last span{
          font-size:.67rem!important;
        }

        .analysis-box .last strong{
          margin-top:3px!important;
          font-size:.78rem!important;
          white-space:nowrap!important;
        }

        .analysis-box>button,
        .device-card>button{
          min-height:38px!important;
          height:38px!important;
          margin:0!important;
          padding:7px 10px!important;
          gap:7px!important;
          border:1px solid rgba(143,224,255,.38)!important;
          border-radius:13px!important;
          color:#fff!important;
          background:linear-gradient(90deg,#129eff,#3868ff)!important;
          box-shadow:0 8px 18px rgba(0,72,181,.24),inset 0 1px 0 rgba(255,255,255,.20)!important;
          font:780 .70rem/1 Inter,ui-sans-serif,sans-serif!important;
        }

        .analysis-box>button svg,
        .device-card>button svg{
          width:15px!important;
          height:15px!important;
        }
      }

      @media(min-width:1200px){
        .device-card{
          grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(185px,.86fr)!important;
          grid-template-rows:auto 138px 94px!important;
          padding:19px 22px!important;
        }
      }

      /* ---------------------------------------------------------
         Charts V2 — translucent premium cards
         --------------------------------------------------------- */
      .chart-card,
      .info-card,
      .summary-card,
      .score-details{
        border-radius:24px!important;
        border:1px solid var(--pool-glass-border-light)!important;
        background:var(--pool-glass-soft)!important;
        backdrop-filter:blur(16px) saturate(118%)!important;
        -webkit-backdrop-filter:blur(16px) saturate(118%)!important;
        box-shadow:var(--pool-shadow-light)!important;
      }

      .chart-card{
        padding:18px!important;
        overflow:hidden!important;
      }

      .chart-card::before,
      .summary-card::before,
      .info-card::before,
      .score-details::before{
        content:""!important;
        position:absolute!important;
        inset:0 0 auto 0!important;
        height:1px!important;
        pointer-events:none!important;
        background:linear-gradient(90deg,transparent,rgba(255,255,255,.86),transparent)!important;
      }

      .chart-card h3,
      .info-card h3,
      .summary-card h3,
      .score-details h3{
        letter-spacing:.01em!important;
        font-weight:760!important;
      }

      .spark-wrap{
        border-radius:16px!important;
        background:
          linear-gradient(180deg,rgba(255,255,255,.34),rgba(220,242,250,.20))!important;
        border:1px solid rgba(255,255,255,.46)!important;
      }

      .spark-grid{
        opacity:.28!important;
      }

      .chart-source,
      .pill,
      .setting-pill{
        border-radius:999px!important;
        border:1px solid rgba(52,161,207,.18)!important;
        background:rgba(255,255,255,.44)!important;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.62)!important;
      }

      /* ---------------------------------------------------------
         Summary V2
         --------------------------------------------------------- */
      .summary{
        gap:14px!important;
      }

      .summary-card{
        position:relative!important;
        min-height:132px!important;
        padding:18px!important;
        overflow:hidden!important;
      }

      .summary-icon,
      .score-icon{
        border-radius:15px!important;
        background:
          linear-gradient(145deg,rgba(35,177,255,.18),rgba(46,101,255,.12))!important;
        border:1px solid rgba(46,166,224,.18)!important;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.70),0 7px 18px rgba(23,111,161,.10)!important;
      }

      .summary-card strong{
        font-size:1.16rem!important;
        font-weight:780!important;
      }

      .summary-card small{
        color:rgba(25,53,73,.68)!important;
      }

      .summary-meter,
      .health-meter{
        height:8px!important;
        border-radius:999px!important;
        background:rgba(77,147,184,.14)!important;
        box-shadow:inset 0 1px 2px rgba(0,39,70,.08)!important;
      }

      .summary-meter i,
      .health-meter i{
        border-radius:inherit!important;
        box-shadow:0 0 10px rgba(31,171,240,.20)!important;
      }

      /* ---------------------------------------------------------
         Score details V2
         --------------------------------------------------------- */
      .score-details{
        position:relative!important;
        padding:18px!important;
        overflow:hidden!important;
      }

      .health-grid{
        gap:12px!important;
      }

      .health-grid>div{
        min-height:96px!important;
        padding:14px!important;
        border-radius:18px!important;
        background:rgba(255,255,255,.42)!important;
        border:1px solid rgba(255,255,255,.58)!important;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.76)!important;
      }

      .score-percent{
        font-weight:820!important;
        color:#0d6fae!important;
      }

      /* ---------------------------------------------------------
         Consistent buttons and interactions
         --------------------------------------------------------- */
      button,
      .advice-toggle{
        transition:transform .16s ease,filter .16s ease,box-shadow .16s ease!important;
      }

      button:hover,
      .advice-toggle:hover{
        transform:translateY(-1px)!important;
        filter:brightness(1.04)!important;
      }

      button:active,
      .advice-toggle:active{
        transform:translateY(0)!important;
      }

      @media(max-width:760px){
        .chart-card,
        .info-card,
        .summary-card,
        .score-details{
          border-radius:20px!important;
        }
      }


      /* =========================================================
         RC1 — Device Cards final proportions
         ========================================================= */
      @media(min-width:761px){
        .devices{
          gap:18px!important;
        }

        .device-card{
          grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(170px,.82fr)!important;
          grid-template-areas:
            "header header header"
            "gauges gauges metric"
            "chips chips analysis"!important;
          grid-template-rows:52px 118px 82px!important;
          height:318px!important;
          min-height:318px!important;
          max-height:318px!important;
          padding:16px 18px!important;
          row-gap:8px!important;
          column-gap:14px!important;
          overflow:hidden!important;
        }

        .device-card>header{
          min-height:52px!important;
          height:52px!important;
          margin:0!important;
        }

        .device-card h2{
          font-size:1.08rem!important;
          line-height:1.05!important;
        }

        .device-card header span{
          margin-top:4px!important;
          font-size:.62rem!important;
        }

        .device-card .fresh{
          margin-top:5px!important;
          font-size:.63rem!important;
        }

        .device-card header>strong{
          font-size:1.66rem!important;
          line-height:.98!important;
        }

        .device-card header>strong small{
          font-size:.61rem!important;
        }

        .device-card>.gauges{
          height:118px!important;
          min-height:118px!important;
          margin:-13px 0 0!important;
          gap:8px!important;
        }

        .device-card .gauge{
          transform:translateY(-3px) scale(.88)!important;
          transform-origin:center!important;
        }

        .device-card>.linear{
          align-self:center!important;
          transform:translateY(-7px)!important;
          padding:0!important;
        }

        .device-card>.linear>div{
          margin-bottom:2px!important;
        }

        .device-card>.linear span{
          font-size:.64rem!important;
        }

        .device-card>.linear strong{
          font-size:.92rem!important;
        }

        .device-card>.linear i{
          height:6px!important;
          margin-top:5px!important;
        }

        .device-card>.chips{
          height:82px!important;
          min-height:82px!important;
          gap:8px!important;
        }

        .device-card>.chips>div{
          min-height:82px!important;
          height:82px!important;
          padding:10px 12px!important;
          border-radius:16px!important;
        }

        .device-card>.chips svg{
          width:18px!important;
          height:18px!important;
        }

        .device-card>.chips span{
          font-size:.64rem!important;
        }

        .device-card>.chips strong{
          margin-top:3px!important;
          font-size:.89rem!important;
        }

        .analysis-box{
          min-height:82px!important;
          height:82px!important;
          grid-template-rows:1fr 34px!important;
          gap:5px!important;
          padding:8px!important;
          border-radius:16px!important;
        }

        .analysis-box .last{
          gap:7px!important;
          padding:0 1px!important;
        }

        .analysis-box .last svg{
          width:17px!important;
          height:17px!important;
        }

        .analysis-box .last span{
          font-size:.60rem!important;
        }

        .analysis-box .last strong{
          margin-top:2px!important;
          font-size:.69rem!important;
        }

        .analysis-box>button,
        .device-card>button{
          min-height:34px!important;
          height:34px!important;
          padding:5px 9px!important;
          border-radius:11px!important;
          font-size:.64rem!important;
          box-shadow:0 6px 14px rgba(0,72,181,.20),inset 0 1px 0 rgba(255,255,255,.18)!important;
        }

        .analysis-box>button svg,
        .device-card>button svg{
          width:14px!important;
          height:14px!important;
        }
      }

      @media(min-width:1200px){
        .device-card{
          grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(180px,.84fr)!important;
          grid-template-rows:54px 120px 84px!important;
          height:326px!important;
          min-height:326px!important;
          max-height:326px!important;
          padding:17px 20px!important;
        }

        .device-card>.chips,
        .device-card>.chips>div,
        .analysis-box{
          height:84px!important;
          min-height:84px!important;
        }
      }

      @media(min-width:761px) and (max-width:1050px){
        .device-card{
          grid-template-columns:minmax(0,1fr) minmax(150px,.82fr)!important;
          grid-template-areas:
            "header header"
            "gauges metric"
            "chips analysis"!important;
          height:332px!important;
          min-height:332px!important;
          max-height:332px!important;
        }

        .device-card>.gauges{
          grid-template-columns:repeat(2,minmax(96px,1fr))!important;
        }
      }


      /* =========================================================
         RC2 — Glass UI Kit
         ========================================================= */
      :host{
        --kit-radius-xl:26px;
        --kit-radius-lg:22px;
        --kit-radius-md:17px;
        --kit-radius-sm:13px;
        --kit-card-bg:linear-gradient(150deg,rgba(239,249,255,.82),rgba(211,233,246,.74));
        --kit-card-bg-soft:linear-gradient(155deg,rgba(255,255,255,.60),rgba(222,240,250,.52));
        --kit-card-border:rgba(255,255,255,.68);
        --kit-card-shadow:0 18px 38px rgba(4,38,70,.14),inset 0 1px 0 rgba(255,255,255,.76);
        --kit-card-shadow-soft:0 12px 28px rgba(4,38,70,.11),inset 0 1px 0 rgba(255,255,255,.68);
        --kit-text:#17324e;
        --kit-muted:#6b849b;
        --kit-line:rgba(68,120,157,.14);
      }

      /* Shared surface */
      .chart-card,
      .summary-card,
      .score-details,
      .info-card,
      .health-card,
      .weather-card,
      .advice-card,
      .history-card,
      .comparison-card,
      .preferences-card{
        position:relative!important;
        overflow:hidden!important;
        border:1px solid var(--kit-card-border)!important;
        background:var(--kit-card-bg)!important;
        box-shadow:var(--kit-card-shadow)!important;
        backdrop-filter:blur(18px) saturate(122%)!important;
        -webkit-backdrop-filter:blur(18px) saturate(122%)!important;
      }

      .chart-card::after,
      .summary-card::after,
      .score-details::after,
      .info-card::after,
      .health-card::after,
      .weather-card::after,
      .advice-card::after,
      .history-card::after,
      .comparison-card::after,
      .preferences-card::after{
        content:""!important;
        position:absolute!important;
        inset:0 0 auto 0!important;
        height:1px!important;
        background:linear-gradient(90deg,transparent,rgba(255,255,255,.94),transparent)!important;
        pointer-events:none!important;
      }

      /* Section headings */
      .section-title,
      .section-heading{
        margin:24px 0 12px!important;
        color:#fff!important;
        font-weight:850!important;
        letter-spacing:.055em!important;
        text-shadow:0 2px 10px rgba(0,29,60,.34)!important;
      }

      /* Analytics */
      .charts,
      .chart-grid{
        gap:16px!important;
      }

      .chart-card{
        min-height:244px!important;
        padding:17px 18px 15px!important;
        border-radius:var(--kit-radius-xl)!important;
      }

      .chart-card header{
        margin-bottom:10px!important;
      }

      .chart-card header span,
      .chart-card .label{
        color:var(--kit-muted)!important;
        font-size:.73rem!important;
      }

      .chart-card header strong,
      .chart-card .value{
        color:var(--kit-text)!important;
        font-size:1.42rem!important;
        line-height:1!important;
        font-weight:820!important;
      }

      .chart-card .delta{
        font-size:.76rem!important;
        font-weight:800!important;
      }

      .chart-source{
        min-height:18px!important;
        padding:3px 8px!important;
        color:#6689ad!important;
        background:rgba(255,255,255,.42)!important;
        border:1px solid rgba(255,255,255,.60)!important;
      }

      .spark-wrap{
        min-height:126px!important;
        margin-top:8px!important;
        padding:10px!important;
        border-radius:16px!important;
        background:
          linear-gradient(180deg,rgba(255,255,255,.25),rgba(189,224,239,.18))!important;
        border:1px solid rgba(255,255,255,.48)!important;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.68)!important;
      }

      .spark-wrap svg{
        overflow:visible!important;
      }

      .chart-footer,
      .spark-footer{
        margin-top:8px!important;
        color:#7b90a3!important;
        font-size:.65rem!important;
      }

      /* Summary */
      .summary{
        grid-template-columns:repeat(3,minmax(0,1fr))!important;
        gap:14px!important;
      }

      .summary-card{
        min-height:122px!important;
        padding:15px 17px!important;
        border-radius:var(--kit-radius-lg)!important;
      }

      .summary-card .summary-icon{
        width:34px!important;
        height:34px!important;
        border-radius:12px!important;
      }

      .summary-card span{
        color:var(--kit-muted)!important;
        font-size:.72rem!important;
      }

      .summary-card strong{
        color:var(--kit-text)!important;
        font-size:1.18rem!important;
        line-height:1.05!important;
      }

      .summary-card small{
        margin-top:4px!important;
        color:#7290a8!important;
        font-size:.67rem!important;
      }

      .summary-meter{
        height:7px!important;
        margin-top:auto!important;
      }

      /* Score detail */
      .score-details{
        padding:14px!important;
        border-radius:var(--kit-radius-xl)!important;
      }

      .health-grid{
        gap:10px!important;
      }

      .health-grid>div{
        min-height:112px!important;
        padding:14px 15px!important;
        border-radius:17px!important;
        background:var(--kit-card-bg-soft)!important;
        border:1px solid rgba(255,255,255,.66)!important;
        box-shadow:var(--kit-card-shadow-soft)!important;
      }

      .health-grid .score-icon{
        width:34px!important;
        height:34px!important;
        border-radius:12px!important;
      }

      .health-grid strong{
        color:#2c6da8!important;
        font-size:1.08rem!important;
        font-weight:850!important;
      }

      .health-grid small{
        color:#7a92a6!important;
        font-size:.64rem!important;
      }

      .health-grid b{
        margin-top:6px!important;
        color:var(--kit-text)!important;
        font-size:1.14rem!important;
      }

      .health-meter{
        height:7px!important;
        margin-top:auto!important;
      }

      /* General health */
      .health-cards,
      .general-health{
        gap:14px!important;
      }

      .health-card{
        min-height:104px!important;
        padding:15px 17px!important;
        border-radius:var(--kit-radius-lg)!important;
        color:#fff!important;
        background:linear-gradient(145deg,rgba(239,249,255,.25),rgba(202,228,243,.18))!important;
        border-color:rgba(255,255,255,.54)!important;
        box-shadow:0 16px 32px rgba(1,29,56,.16),inset 0 1px 0 rgba(255,255,255,.45)!important;
      }

      .health-card strong,
      .health-card span{
        color:#fff!important;
        text-shadow:0 2px 8px rgba(0,30,60,.22)!important;
      }

      .health-card .health-meter{
        background:rgba(255,255,255,.22)!important;
      }

      /* Useful information */
      .info-grid,
      .useful-grid{
        gap:16px!important;
        align-items:start!important;
      }

      .weather-card,
      .advice-card,
      .history-card,
      .comparison-card,
      .preferences-card,
      .info-card{
        border-radius:var(--kit-radius-lg)!important;
        padding:18px!important;
        color:var(--kit-text)!important;
      }

      .weather-card h3,
      .advice-card h3,
      .history-card h3,
      .comparison-card h3,
      .preferences-card h3,
      .info-card h3{
        margin:0 0 16px!important;
        color:var(--kit-text)!important;
        font-size:1rem!important;
        font-weight:850!important;
        letter-spacing:.01em!important;
      }

      .weather-main strong{
        color:var(--kit-text)!important;
        font-size:2rem!important;
      }

      .weather-main span,
      .weather-stats span,
      .history-card small,
      .comparison-card th,
      .comparison-card td,
      .preferences-card span{
        color:var(--kit-muted)!important;
      }

      .weather-stats>div,
      .setting-pill,
      .pill{
        border-radius:13px!important;
        background:rgba(194,220,238,.48)!important;
        border:1px solid rgba(255,255,255,.56)!important;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.62)!important;
      }

      .advice-card .advice-toggle,
      .preferences-card button{
        border-radius:12px!important;
        background:linear-gradient(90deg,rgba(237,246,255,.84),rgba(204,225,242,.80))!important;
        border:1px solid rgba(255,255,255,.66)!important;
        box-shadow:0 7px 16px rgba(8,53,88,.10),inset 0 1px 0 rgba(255,255,255,.72)!important;
      }

      .history-card li,
      .comparison-card tr{
        border-color:var(--kit-line)!important;
      }

      .comparison-card table{
        font-size:.72rem!important;
      }

      /* Responsive */
      @media(max-width:1050px){
        .summary{
          grid-template-columns:1fr!important;
        }

        .health-grid{
          grid-template-columns:repeat(2,minmax(0,1fr))!important;
        }
      }

      @media(max-width:760px){
        .chart-card,
        .summary-card,
        .score-details,
        .health-card,
        .weather-card,
        .advice-card,
        .history-card,
        .comparison-card,
        .preferences-card,
        .info-card{
          border-radius:18px!important;
        }

        .chart-card{
          min-height:226px!important;
          padding:15px!important;
        }

        .health-grid{
          grid-template-columns:1fr!important;
        }
      }


      /* =========================================================
         RC3 — Components V3
         ========================================================= */
      .v3-section{margin-top:24px}
      .v3-section__header{display:flex;align-items:center;gap:11px;margin:0 0 12px;padding:0 4px;color:#fff;text-shadow:0 2px 10px rgba(0,27,55,.32)}
      .v3-section__icon{display:grid;place-items:center;width:30px;height:30px;border-radius:10px;background:rgba(8,53,94,.38);border:1px solid rgba(255,255,255,.26);backdrop-filter:blur(8px)}
      .v3-section__header h2{margin:0;font-size:1rem;line-height:1.1;text-transform:uppercase;letter-spacing:.055em;font-weight:850}
      .v3-section__header p{margin:3px 0 0;font-size:.65rem;opacity:.72;letter-spacing:.02em}
      .v3-charts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
      .v3-charts .chart-card{min-height:238px!important;border-radius:24px!important;padding:18px!important;background:linear-gradient(150deg,rgba(244,251,255,.88),rgba(209,231,244,.78))!important;border:1px solid rgba(255,255,255,.78)!important;box-shadow:0 17px 38px rgba(0,33,65,.15),inset 0 1px 0 rgba(255,255,255,.86)!important}
      .v3-charts .spark-wrap{min-height:126px!important;border-radius:17px!important;background:linear-gradient(180deg,rgba(255,255,255,.34),rgba(168,217,235,.18))!important}
      .v3-summary,.v3-score-grid,.v3-health-grid{display:grid;gap:14px}
      .v3-summary{grid-template-columns:repeat(3,minmax(0,1fr))}
      .v3-summary-card,.v3-score-card,.v3-health-card,.v3-info-card{position:relative;overflow:hidden;background:linear-gradient(150deg,rgba(242,250,255,.84),rgba(205,229,243,.76));border:1px solid rgba(255,255,255,.72);box-shadow:0 15px 34px rgba(0,35,67,.14),inset 0 1px 0 rgba(255,255,255,.82);backdrop-filter:blur(17px) saturate(120%);-webkit-backdrop-filter:blur(17px) saturate(120%);color:#17324f}
      .v3-summary-card{min-height:116px;padding:16px 18px;border-radius:22px}
      .v3-summary-card__top{display:flex;align-items:center;justify-content:space-between;gap:12px}
      .v3-metric-icon{display:grid;place-items:center;min-width:38px;height:38px;padding:0 9px;border-radius:13px;background:linear-gradient(145deg,#4d9ff3,#526fe8);color:#fff;font-size:.72rem;font-weight:900;box-shadow:0 8px 18px rgba(41,105,200,.22)}
      .v3-status{font-size:.68rem;font-weight:800;color:#43845d}
      .v3-summary-card.warning .v3-status{color:#b97616}
      .v3-summary-card small{display:block;margin-top:11px;color:#6f879b;font-size:.7rem}
      .v3-summary-card>strong{display:block;margin-top:2px;font-size:1.55rem;line-height:1;color:#17324f}
      .v3-summary-card>strong em{font-size:.72rem;font-style:normal;color:#7890a5}
      .v3-progress{height:7px;margin-top:13px;border-radius:999px;background:rgba(52,99,137,.12);overflow:hidden;box-shadow:inset 0 1px 2px rgba(0,34,61,.08)}
      .v3-progress i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#64c48c,#5b9df2);box-shadow:0 0 10px rgba(66,168,222,.22)}
      .v3-summary-card.warning .v3-progress i{background:linear-gradient(90deg,#ffc24f,#ef902a)}
      .v3-score-grid{grid-template-columns:repeat(5,minmax(0,1fr));padding:14px;border-radius:26px;background:linear-gradient(150deg,rgba(232,244,251,.80),rgba(198,222,237,.70));border:1px solid rgba(255,255,255,.70);box-shadow:0 16px 38px rgba(0,34,65,.14),inset 0 1px 0 rgba(255,255,255,.80)}
      .v3-score-card{min-height:130px;padding:14px;border-radius:18px;background:linear-gradient(150deg,rgba(255,255,255,.68),rgba(233,242,248,.56))}
      .v3-score-card__head{display:flex;align-items:center;justify-content:space-between}
      .v3-score-card__head>span{display:grid;place-items:center;width:36px;height:36px;border-radius:12px;background:rgba(75,145,236,.12);border:1px solid rgba(80,151,234,.15)}
      .v3-score-card__head strong{color:#2b69a6;font-size:1.05rem}
      .v3-score-card h3{margin:12px 0 0;font-size:.76rem;color:#567086}
      .v3-score-card p{margin:4px 0 0;font-size:1.08rem;font-weight:800;color:#17324f}
      .v3-health-grid{grid-template-columns:repeat(3,minmax(0,1fr))}
      .v3-health-card{min-height:102px;padding:16px 18px;border-radius:20px;background:linear-gradient(145deg,rgba(236,247,254,.32),rgba(211,231,243,.22));color:#fff;border-color:rgba(255,255,255,.54)}
      .v3-health-card__head{display:flex;justify-content:space-between;align-items:center;gap:10px}
      .v3-health-card__head span,.v3-health-card__head strong{color:#fff;text-shadow:0 2px 8px rgba(0,30,57,.24)}
      .v3-health-card__head strong{font-size:1.08rem}
      .v3-health-card .v3-progress{background:rgba(255,255,255,.22)}
      .v3-health-card small{display:block;margin-top:8px;color:rgba(255,255,255,.78);font-size:.66rem}
      .v3-info-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;align-items:start}
      .v3-info-card{min-height:238px;padding:18px;border-radius:22px}
      .v3-info-card>header{display:flex;align-items:center;gap:9px;margin-bottom:17px}
      .v3-info-card>header>span{display:grid;place-items:center;width:32px;height:32px;border-radius:11px;background:rgba(60,131,218,.12);border:1px solid rgba(66,138,221,.15)}
      .v3-info-card h3{margin:0;font-size:.9rem;letter-spacing:.025em;text-transform:uppercase}
      .v3-weather__main{display:flex;align-items:center;gap:12px}
      .v3-weather__main>span{font-size:2.2rem}
      .v3-weather__main strong{display:block;font-size:1.8rem}
      .v3-weather__main small{display:block;margin-top:3px;color:#6c8499}
      .v3-weather__stats{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:16px}
      .v3-weather__stats>div{padding:10px;border-radius:13px;background:rgba(170,202,224,.34);border:1px solid rgba(255,255,255,.52)}
      .v3-weather__stats small{display:block;color:#758da1;font-size:.66rem}
      .v3-weather__stats strong{display:block;margin-top:5px;font-size:.88rem}
      .v3-advice__title{display:block;font-size:1.08rem}
      .v3-advice p{font-size:.8rem;line-height:1.5;color:#38526a}
      .v3-timeline{display:grid}
      .v3-timeline__row{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:10px;padding:11px 0;border-bottom:1px solid rgba(40,84,120,.12)}
      .v3-timeline__dot{width:9px;height:9px;border-radius:50%;background:#5fca8d;box-shadow:0 0 0 5px rgba(95,202,141,.12)}
      .v3-timeline__row strong{display:block;font-size:.78rem}
      .v3-timeline__row small{display:block;margin-top:3px;color:#7890a4;font-size:.68rem}
      .v3-timeline__row b{font-size:.62rem;color:#3c8b55}
      .v3-comparison__rows{display:grid;gap:9px}
      .v3-comparison__row{display:grid;grid-template-columns:1fr auto;gap:5px 10px;padding:8px 0;border-bottom:1px solid rgba(40,84,120,.11)}
      .v3-comparison__row strong{font-size:.76rem}
      .v3-comparison__row small{display:block;margin-top:2px;color:#7890a4;font-size:.65rem}
      .v3-comparison__row>span{font-size:.68rem;font-weight:850}
      .v3-comparison__row>span.good{color:#438557}.v3-comparison__row>span.warn{color:#b87516}
      .v3-comparison__row .v3-progress{grid-column:1/-1;height:5px;margin-top:2px}
      .v3-preferences{grid-column:1/span 1;min-height:150px}
      .v3-settings{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
      .v3-settings span{display:grid;place-items:center;min-height:38px;padding:6px 10px;border-radius:12px;background:rgba(255,255,255,.35);border:1px solid rgba(255,255,255,.62);font-size:.69rem;color:#5e7790}
      @media(max-width:1100px){.v3-charts,.v3-summary,.v3-health-grid{grid-template-columns:1fr}.v3-score-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.v3-score-card:last-child{grid-column:1/-1}.v3-info-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
      @media(max-width:760px){.v3-section{margin-top:18px}.v3-section__header p{display:none}.v3-charts,.v3-summary,.v3-health-grid,.v3-info-grid,.v3-score-grid{grid-template-columns:1fr}.v3-score-card:last-child,.v3-preferences{grid-column:auto}.v3-info-card{min-height:0}}


      /* =========================================================
         RC4 — Dark Glass Unification
         ========================================================= */
      :host{
        --v3-dark-bg:linear-gradient(150deg,rgba(13,58,103,.88),rgba(6,34,72,.92));
        --v3-dark-bg-soft:linear-gradient(150deg,rgba(20,72,119,.78),rgba(10,42,83,.86));
        --v3-dark-border:rgba(74,193,238,.42);
        --v3-dark-border-soft:rgba(255,255,255,.16);
        --v3-dark-shadow:0 18px 42px rgba(0,18,43,.26),inset 0 1px 0 rgba(255,255,255,.10);
        --v3-text:#f5fbff;
        --v3-muted:#b7ccdc;
      }

      .v3-charts .chart-card,
      .v3-summary-card,
      .v3-score-grid,
      .v3-score-card,
      .v3-health-card,
      .v3-info-card{
        color:var(--v3-text)!important;
        background:var(--v3-dark-bg)!important;
        border-color:var(--v3-dark-border)!important;
        box-shadow:var(--v3-dark-shadow)!important;
        backdrop-filter:blur(15px) saturate(128%)!important;
        -webkit-backdrop-filter:blur(15px) saturate(128%)!important;
      }

      .v3-score-grid{
        background:linear-gradient(150deg,rgba(8,43,85,.72),rgba(4,25,58,.80))!important;
        border-color:rgba(83,198,241,.36)!important;
      }

      .v3-score-card{
        background:var(--v3-dark-bg-soft)!important;
        border-color:var(--v3-dark-border-soft)!important;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.08)!important;
      }

      .v3-charts .spark-wrap{
        background:linear-gradient(180deg,rgba(23,79,125,.56),rgba(10,43,82,.54))!important;
        border-color:rgba(120,213,248,.24)!important;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.06)!important;
      }

      .v3-charts .chart-card header span,
      .v3-charts .chart-card .label,
      .v3-charts .chart-source,
      .v3-charts .chart-footer,
      .v3-charts .spark-footer,
      .v3-summary-card small,
      .v3-summary-card>strong em,
      .v3-score-card h3,
      .v3-health-card small,
      .v3-weather__main small,
      .v3-weather__stats small,
      .v3-advice p,
      .v3-timeline__row small,
      .v3-comparison__row small,
      .v3-settings span{
        color:var(--v3-muted)!important;
      }

      .v3-charts .chart-card header strong,
      .v3-charts .chart-card .value,
      .v3-summary-card>strong,
      .v3-score-card p,
      .v3-weather__main strong,
      .v3-info-card h3,
      .v3-timeline__row strong,
      .v3-comparison__row strong,
      .v3-advice__title{
        color:var(--v3-text)!important;
      }

      .v3-summary-card__top,
      .v3-score-card__head,
      .v3-health-card__head,
      .v3-info-card>header{
        color:var(--v3-text)!important;
      }

      .v3-metric-icon,
      .v3-info-card>header>span,
      .v3-score-card__head>span{
        color:#fff!important;
        background:linear-gradient(145deg,rgba(58,153,234,.78),rgba(68,93,218,.86))!important;
        border-color:rgba(129,218,255,.28)!important;
        box-shadow:0 8px 18px rgba(0,45,108,.24),inset 0 1px 0 rgba(255,255,255,.18)!important;
      }

      .v3-progress{
        background:rgba(140,187,220,.16)!important;
        box-shadow:inset 0 1px 2px rgba(0,0,0,.18)!important;
      }

      .v3-progress i{
        background:linear-gradient(90deg,#65d394,#55a7ff)!important;
        box-shadow:0 0 12px rgba(67,184,245,.32)!important;
      }

      .v3-summary-card.warning .v3-progress i{
        background:linear-gradient(90deg,#ffca57,#ff8f3d)!important;
      }

      .v3-weather__stats>div,
      .v3-settings span,
      .advice-actions>div{
        background:rgba(19,71,115,.46)!important;
        border-color:rgba(123,213,247,.16)!important;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.06)!important;
      }

      .v3-settings span{
        color:#d2e2ee!important;
      }

      .v3-timeline__row,
      .v3-comparison__row{
        border-color:rgba(165,211,238,.12)!important;
      }

      .advice-toggle{
        color:#fff!important;
        background:linear-gradient(90deg,#159bff,#5066f2)!important;
        border-color:rgba(150,223,255,.30)!important;
        box-shadow:0 8px 18px rgba(0,53,135,.22),inset 0 1px 0 rgba(255,255,255,.18)!important;
      }

      .chart-empty{
        color:#c8d9e6!important;
        background:rgba(20,66,106,.32)!important;
        border-color:rgba(132,210,242,.14)!important;
      }

      .v3-health-card{
        background:linear-gradient(145deg,rgba(22,79,125,.70),rgba(8,42,82,.82))!important;
      }

      .v3-health-card__head span,
      .v3-health-card__head strong{
        color:#fff!important;
      }

      .v3-summary-card::before,
      .v3-score-card::before,
      .v3-health-card::before,
      .v3-info-card::before,
      .v3-charts .chart-card::before{
        content:""!important;
        position:absolute!important;
        inset:0 0 auto 0!important;
        height:1px!important;
        background:linear-gradient(90deg,transparent,rgba(255,255,255,.20),transparent)!important;
        pointer-events:none!important;
      }


      /* =========================================================
         RC5 — Final Polish
         ========================================================= */
      .v3-section{margin-top:20px!important}
      .v3-section__header{margin-bottom:10px!important}
      .v3-section__header h2{font-size:1.08rem!important;letter-spacing:.045em!important}
      .v3-section__header p{font-size:.62rem!important;opacity:.68!important}

      /* Correct Hero weather state */
      .hero-v2__weather .hero-v2__metric-icon svg{width:30px!important;height:30px!important}
      .hero-v2__weather.weather-sunny .hero-v2__metric-icon{
        color:#fff8ba!important;
        box-shadow:0 0 0 1px rgba(135,222,255,.28),0 0 22px rgba(255,214,82,.32),inset 0 0 18px rgba(255,255,255,.12)!important;
      }
      .hero-v2__weather.weather-sunny .hero-v2__metric-icon svg{
        animation:v3-sun-spin 18s linear infinite!important;
        filter:drop-shadow(0 0 7px rgba(255,223,97,.62))!important;
      }
      .hero-v2__weather.weather-cloudy .hero-v2__metric-icon svg{
        animation:v3-cloud-drift 4s ease-in-out infinite alternate!important;
      }
      .hero-v2__weather.weather-rainy .hero-v2__metric-icon{
        color:#bde8ff!important;
      }
      @keyframes v3-sun-spin{to{transform:rotate(360deg)}}
      @keyframes v3-cloud-drift{to{transform:translateX(3px)}}

      /* Analytics 20–25% more compact */
      .v3-charts{gap:14px!important}
      .v3-charts .chart-card{
        min-height:190px!important;
        height:190px!important;
        padding:14px 16px!important;
        border-radius:21px!important;
      }
      .v3-charts .chart-card header{margin-bottom:6px!important}
      .v3-charts .chart-card header strong,
      .v3-charts .chart-card .value{font-size:1.22rem!important}
      .v3-charts .chart-source{min-height:16px!important;padding:2px 7px!important;font-size:.61rem!important}
      .v3-charts .spark-wrap{
        min-height:92px!important;
        height:92px!important;
        margin-top:6px!important;
        padding:7px!important;
        border-radius:14px!important;
      }
      .v3-charts .chart-footer,
      .v3-charts .spark-footer{margin-top:5px!important;font-size:.58rem!important}

      /* Current summary with mini circular gauges */
      .v3-summary{gap:12px!important}
      .v3-summary-card{
        display:grid!important;
        grid-template-columns:auto 1fr!important;
        grid-template-rows:auto auto auto!important;
        min-height:100px!important;
        padding:13px 15px!important;
        border-radius:19px!important;
      }
      .v3-summary-card__top{grid-column:1/-1!important}
      .v3-mini-ring{
        --v3-pct:0;
        position:relative!important;
        display:grid!important;
        place-items:center!important;
        width:42px!important;
        height:42px!important;
        border-radius:50%!important;
        background:
          radial-gradient(circle at center,rgba(11,46,88,.96) 55%,transparent 57%),
          conic-gradient(#65d69a calc(var(--v3-pct)*1%),rgba(142,181,211,.18) 0)!important;
        box-shadow:0 0 15px rgba(72,183,238,.18),inset 0 0 0 1px rgba(255,255,255,.10)!important;
      }
      .v3-summary-card.warning .v3-mini-ring{
        background:
          radial-gradient(circle at center,rgba(11,46,88,.96) 55%,transparent 57%),
          conic-gradient(#ffb84a calc(var(--v3-pct)*1%),rgba(142,181,211,.18) 0)!important;
      }
      .v3-mini-ring b{font-size:.65rem;color:#fff!important}
      .v3-summary-card small{grid-column:1!important;margin-top:7px!important;font-size:.63rem!important}
      .v3-summary-card>strong{grid-column:1!important;margin-top:1px!important;font-size:1.42rem!important}
      .v3-summary-card>.v3-progress{grid-column:1/-1!important;height:6px!important;margin-top:8px!important}
      .v3-status{max-width:62%;text-align:right!important;line-height:1.15!important}

      /* Score identity: horizontal, denser and unlike summary */
      .v3-score-grid{
        gap:9px!important;
        padding:10px!important;
        border-radius:22px!important;
      }
      .v3-score-card{
        min-height:82px!important;
        padding:11px 12px!important;
        border-radius:15px!important;
      }
      .v3-score-card__head{
        display:grid!important;
        grid-template-columns:34px 1fr auto!important;
        gap:9px!important;
      }
      .v3-score-card__head>span{width:32px!important;height:32px!important;border-radius:10px!important}
      .v3-score-card__head>div h3{margin:0!important;font-size:.69rem!important;color:var(--v3-muted)!important}
      .v3-score-card__head>div p{margin:2px 0 0!important;font-size:.82rem!important;color:#fff!important}
      .v3-score-card__head>strong{font-size:.92rem!important}
      .v3-score-card>.v3-progress{height:5px!important;margin-top:9px!important}

      /* General health — denser */
      .v3-health-grid{gap:12px!important}
      .v3-health-card{
        min-height:72px!important;
        padding:12px 15px!important;
        border-radius:17px!important;
      }
      .v3-health-card__head strong{font-size:.96rem!important}
      .v3-health-card .v3-progress{height:6px!important;margin-top:9px!important}
      .v3-health-card small{margin-top:5px!important;font-size:.60rem!important}

      /* Useful information alignment */
      .v3-info-grid{gap:14px!important}
      .v3-info-card{
        min-height:220px!important;
        padding:16px!important;
        border-radius:20px!important;
      }
      .v3-info-card>header{margin-bottom:14px!important}
      .v3-info-card>header>span{width:30px!important;height:30px!important}
      .v3-weather-icon svg{width:19px!important;height:19px!important}
      .v3-weather.weather-sunny .v3-weather-icon svg{
        animation:v3-sun-spin 18s linear infinite!important;
        filter:drop-shadow(0 0 5px rgba(255,222,92,.55))!important;
      }

      /* Preferences — iOS switches */
      .v3-preferences{min-height:0!important}
      .v3-settings{
        display:grid!important;
        grid-template-columns:1fr!important;
        gap:0!important;
      }
      .v3-setting{
        display:flex!important;
        align-items:center!important;
        justify-content:space-between!important;
        gap:14px!important;
        min-height:50px!important;
        padding:8px 2px!important;
        border-bottom:1px solid rgba(170,213,239,.12)!important;
      }
      .v3-setting:last-child{border-bottom:0!important}
      .v3-setting>span{display:block!important;min-height:0!important;padding:0!important;background:none!important;border:0!important;text-align:left!important}
      .v3-setting b{display:block!important;color:#f5fbff!important;font-size:.72rem!important}
      .v3-setting small{display:block!important;margin-top:3px!important;color:#9eb7ca!important;font-size:.58rem!important}
      .v3-setting em{
        min-width:38px!important;
        padding:6px 9px!important;
        border-radius:10px!important;
        color:#fff!important;
        background:rgba(45,105,162,.48)!important;
        border:1px solid rgba(126,209,242,.18)!important;
        font-style:normal!important;
        font-size:.72rem!important;
        text-align:center!important;
      }
      .v3-switch{
        position:relative!important;
        flex:0 0 auto!important;
        width:38px!important;
        height:22px!important;
        border-radius:999px!important;
        background:rgba(126,161,190,.28)!important;
        box-shadow:inset 0 1px 2px rgba(0,0,0,.22)!important;
      }
      .v3-switch::after{
        content:""!important;
        position:absolute!important;
        top:3px!important;
        left:3px!important;
        width:16px!important;
        height:16px!important;
        border-radius:50%!important;
        background:#f8fcff!important;
        box-shadow:0 2px 5px rgba(0,23,48,.36)!important;
      }
      .v3-switch.is-on{background:linear-gradient(90deg,#4dcf8d,#4c9cff)!important}
      .v3-switch.is-on::after{left:19px!important}

      @media(max-width:1100px){
        .v3-charts .chart-card{height:auto!important;min-height:185px!important}
      }
      @media(max-width:760px){
        .v3-charts .chart-card{height:auto!important;min-height:178px!important}
        .v3-charts .spark-wrap{height:88px!important;min-height:88px!important}
        .v3-summary-card{min-height:96px!important}
      }
      @media(prefers-reduced-motion:reduce){
        .hero-v2__weather .hero-v2__metric-icon svg,
        .v3-weather-icon svg{animation:none!important}
      }


      /* =========================================================
         RC6 — Interactive Preferences + chart/title fix
         ========================================================= */
      .v3-setting{width:100%!important;appearance:none!important;-webkit-appearance:none!important;color:inherit!important;font:inherit!important;text-align:left!important;cursor:pointer!important;background:transparent!important;border:0!important}
      .v3-setting:hover{background:rgba(73,144,207,.10)!important;transform:none!important;filter:none!important}
      .v3-setting:focus-visible{outline:2px solid rgba(100,205,255,.82)!important;outline-offset:3px!important;border-radius:12px!important}
      .v3-setting--static{cursor:default!important}.v3-setting--static:hover{background:transparent!important}
      .v3-switch{transition:background .18s ease!important}.v3-switch::after{transition:left .18s ease!important}
      .pref-no-animations *,.pref-no-animations *::before,.pref-no-animations *::after{animation:none!important;transition:none!important}
      .pref-advanced .device-card>.linear{opacity:1!important}.app:not(.pref-advanced) .device-card>.linear{opacity:.86!important}
      @media(max-width:760px){
        .pref-compact-mobile .v3-info-grid,.pref-compact-mobile .v3-summary,.pref-compact-mobile .v3-health-grid{gap:10px!important}
        .pref-compact-mobile .v3-info-card,.pref-compact-mobile .v3-summary-card,.pref-compact-mobile .v3-health-card{padding:13px!important}
      }
      .v3-section:first-of-type{padding-top:12px!important}
      .v3-section__header{position:relative!important;z-index:3!important;width:max-content!important;max-width:100%!important;padding:7px 14px 7px 8px!important;border-radius:14px!important;background:linear-gradient(90deg,rgba(4,37,76,.82),rgba(4,37,76,.48),transparent)!important;backdrop-filter:blur(9px)!important;-webkit-backdrop-filter:blur(9px)!important}
      .v3-section__header h2{color:#fff!important;text-shadow:0 2px 9px rgba(0,0,0,.60)!important}
      .v3-section__header p{color:#d5e6f2!important;text-shadow:0 1px 5px rgba(0,0,0,.46)!important}
      .v3-charts{padding-bottom:10px!important}
      .v3-charts .chart-card{overflow:hidden!important;height:214px!important;min-height:214px!important}
      .v3-charts .spark-wrap{height:108px!important;min-height:108px!important}
      .v3-charts .chart-footer,.v3-charts .spark-footer{position:relative!important;z-index:2!important;padding-bottom:2px!important}


      /* =========================================================
         RC7 — Reliable preferences + final chart spacing
         ========================================================= */

      /* Entire setting rows are interactive */
      .v3-preferences{
        position:relative!important;
        z-index:20!important;
        pointer-events:auto!important;
      }
      .v3-settings{
        position:relative!important;
        z-index:21!important;
        pointer-events:auto!important;
      }
      button.v3-setting{
        position:relative!important;
        z-index:22!important;
        width:100%!important;
        min-height:58px!important;
        padding:10px 5px!important;
        cursor:pointer!important;
        pointer-events:auto!important;
        touch-action:manipulation!important;
        user-select:none!important;
        border-radius:12px!important;
      }
      button.v3-setting *{
        pointer-events:none!important;
      }
      button.v3-setting:hover{
        background:rgba(73,148,211,.11)!important;
      }
      button.v3-setting:active{
        background:rgba(73,148,211,.19)!important;
      }
      button.v3-setting:focus-visible{
        outline:2px solid rgba(103,213,255,.88)!important;
        outline-offset:2px!important;
      }

      /* Larger, clearer switches */
      .v3-switch{
        width:46px!important;
        height:27px!important;
        flex:0 0 46px!important;
      }
      .v3-switch::after{
        top:3px!important;
        left:3px!important;
        width:21px!important;
        height:21px!important;
      }
      .v3-switch.is-on::after{
        left:22px!important;
      }
      button.v3-setting.is-active .v3-switch{
        box-shadow:0 0 16px rgba(76,207,143,.22),inset 0 1px 2px rgba(0,0,0,.18)!important;
      }

      /* Finished chart cards: actual inner bottom breathing room */
      .v3-charts{
        gap:16px!important;
        padding-bottom:18px!important;
      }
      .v3-charts .chart-card{
        display:grid!important;
        grid-template-rows:auto auto minmax(112px,1fr) 18px!important;
        height:232px!important;
        min-height:232px!important;
        padding:15px 17px 20px!important;
        overflow:hidden!important;
      }
      .v3-charts .spark-wrap{
        min-height:112px!important;
        height:auto!important;
        margin-top:7px!important;
        margin-bottom:9px!important;
      }
      .v3-charts .chart-footer,
      .v3-charts .spark-footer{
        min-height:18px!important;
        margin:0!important;
        padding:1px 3px 3px!important;
        align-self:end!important;
      }

      /* Section title readability */
      .v3-section__header{
        min-height:44px!important;
        padding:8px 16px 8px 9px!important;
        border:1px solid rgba(116,207,243,.16)!important;
        box-shadow:0 10px 24px rgba(0,22,50,.20),inset 0 1px 0 rgba(255,255,255,.07)!important;
      }
      .v3-section__header h2{
        font-size:1.12rem!important;
        letter-spacing:.05em!important;
      }

      /* Summary and health polish */
      .v3-summary-card{
        min-height:110px!important;
        padding:15px 18px!important;
      }
      .v3-mini-ring{
        width:49px!important;
        height:49px!important;
      }
      .v3-summary-card>strong{
        font-size:1.62rem!important;
      }
      .v3-status{
        padding:5px 9px!important;
        border-radius:999px!important;
        background:rgba(71,138,195,.15)!important;
      }
      .v3-summary-card.warning .v3-status{
        background:rgba(255,174,49,.12)!important;
      }
      .v3-health-card{
        min-height:80px!important;
        padding:14px 18px!important;
      }
      .v3-health-card .v3-progress{
        height:7px!important;
      }

      /* Useful cards: consistent premium depth */
      .v3-info-card{
        border-color:rgba(87,199,240,.36)!important;
        box-shadow:0 19px 42px rgba(0,19,47,.25),inset 0 1px 0 rgba(255,255,255,.09)!important;
      }
      .v3-info-card>header{
        padding-bottom:10px!important;
        border-bottom:1px solid rgba(158,214,241,.10)!important;
      }
      .v3-comparison__row>span.good,
      .v3-comparison__row>span.warn{
        padding:3px 7px!important;
        border-radius:999px!important;
      }
      .v3-comparison__row>span.good{
        background:rgba(87,201,127,.11)!important;
      }
      .v3-comparison__row>span.warn{
        background:rgba(255,173,45,.11)!important;
      }

      @media(max-width:1100px){
        .v3-charts .chart-card{
          height:auto!important;
          min-height:220px!important;
        }
      }
      @media(max-width:760px){
        .v3-charts{
          padding-bottom:14px!important;
        }
        .v3-charts .chart-card{
          min-height:210px!important;
          padding-bottom:18px!important;
        }
      }


      /* =========================================================
         RC8 — Functional controls and chart geometry
         ========================================================= */
      .spark-wrap,.spark{overflow:hidden!important}
      .spark{display:block!important;width:100%!important;height:100%!important}
      .spark .line{stroke-linecap:round!important;stroke-linejoin:round!important}

      /* Compact mode must be visible on desktop and mobile */
      .pref-compact-mobile .v3-section{margin-top:14px!important}
      .pref-compact-mobile .v3-section__header{min-height:38px!important;padding-top:6px!important;padding-bottom:6px!important}
      .pref-compact-mobile .v3-charts .chart-card{height:208px!important;min-height:208px!important}
      .pref-compact-mobile .v3-summary-card{min-height:96px!important;padding:12px 15px!important}
      .pref-compact-mobile .v3-score-card{min-height:72px!important;padding:9px 11px!important}
      .pref-compact-mobile .v3-health-card{min-height:68px!important;padding:11px 15px!important}
      .pref-compact-mobile .v3-info-card{min-height:198px!important;padding:14px!important}
      .pref-compact-mobile .v3-info-grid{gap:11px!important}

      /* Advanced mode controls technical content */
      .technical-metric{transition:opacity .18s ease,max-height .18s ease!important}
      .app:not(.pref-advanced) .device-card>.linear,
      .app:not(.pref-advanced) .device-card>.chips>div:nth-child(2),
      .app:not(.pref-advanced) .v3-comparison,
      .app:not(.pref-advanced) .v3-score-grid{
        display:none!important;
      }
      .app:not(.pref-advanced) .device-card{
        grid-template-columns:repeat(2,minmax(0,1fr)) minmax(170px,.82fr)!important;
        grid-template-areas:"header header header" "gauges gauges analysis" "chips chips analysis"!important;
      }
      .pref-advanced .device-card>.linear,
      .pref-advanced .device-card>.chips>div:nth-child(2),
      .pref-advanced .v3-comparison,
      .pref-advanced .v3-score-grid{
        display:grid!important;
      }

      [data-unit-toggle] em{
        min-width:48px!important;
        font-weight:800!important;
      }
      [data-unit-toggle]:active em{
        transform:scale(.95)!important;
      }


      /* =========================================================
         RC9 — Night weather and readable recommendations
         ========================================================= */

      /* Clear night uses a moon, never a sun or rain cloud */
      .hero-v2__weather.weather-night .hero-v2__metric-icon,
      .v3-weather.weather-night .v3-weather-icon{
        color:#e9f2ff!important;
        background:radial-gradient(circle at 38% 34%,rgba(164,204,255,.30),rgba(23,75,131,.64) 62%,rgba(7,35,75,.82))!important;
        box-shadow:0 0 0 1px rgba(142,205,255,.26),0 0 22px rgba(105,160,255,.24),inset 0 0 18px rgba(255,255,255,.08)!important;
      }
      .hero-v2__weather.weather-night .hero-v2__metric-icon svg,
      .v3-weather.weather-night .v3-weather-icon svg{
        animation:v3-moon-float 4.8s ease-in-out infinite alternate!important;
        filter:drop-shadow(0 0 7px rgba(184,215,255,.46))!important;
      }
      @keyframes v3-moon-float{
        from{transform:translateY(1px) rotate(-2deg)}
        to{transform:translateY(-2px) rotate(2deg)}
      }

      /* Evolutions header has no redundant low-contrast subtitle */
      .v3-section__header:has(+ .v3-charts){
        padding-top:10px!important;
        padding-bottom:10px!important;
      }
      .v3-section__header:has(+ .v3-charts) h2{
        line-height:1.15!important;
      }

      /* Recommendations are statuses, not disabled controls */
      .v3-advice .advice-actions{
        display:grid!important;
        gap:9px!important;
        margin:14px 0!important;
      }
      .v3-advice .advice-actions>div{
        display:grid!important;
        grid-template-columns:28px 1fr!important;
        align-items:center!important;
        gap:10px!important;
        min-height:44px!important;
        padding:9px 12px!important;
        border:1px solid rgba(132,207,240,.17)!important;
        background:linear-gradient(145deg,rgba(31,85,132,.60),rgba(17,57,101,.66))!important;
        opacity:1!important;
        color:#f4f9ff!important;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.06)!important;
      }
      .v3-advice .advice-actions>div b{
        display:grid!important;
        place-items:center!important;
        width:28px!important;
        height:28px!important;
        border-radius:9px!important;
        color:#fff!important;
        font-size:.78rem!important;
        background:rgba(89,159,222,.24)!important;
      }
      .v3-advice .advice-actions>div span{
        color:#e9f3fb!important;
        font-weight:680!important;
        line-height:1.3!important;
        opacity:1!important;
      }
      .v3-advice .advice-actions>div.is-good{
        border-color:rgba(91,211,143,.25)!important;
        background:linear-gradient(145deg,rgba(31,109,91,.52),rgba(17,66,78,.58))!important;
      }
      .v3-advice .advice-actions>div.is-good b{
        background:rgba(79,206,135,.30)!important;
        color:#caffdd!important;
      }
      .v3-advice .advice-actions>div.is-info{
        border-color:rgba(88,174,245,.25)!important;
      }
      .v3-advice .advice-actions>div.is-warning{
        border-color:rgba(255,180,69,.28)!important;
        background:linear-gradient(145deg,rgba(112,77,37,.54),rgba(76,54,41,.58))!important;
      }
      .v3-advice .advice-actions>div.is-warning b{
        background:rgba(255,173,55,.25)!important;
        color:#ffd99a!important;
      }

      @media(prefers-reduced-motion:reduce){
        .hero-v2__weather.weather-night .hero-v2__metric-icon svg,
        .v3-weather.weather-night .v3-weather-icon svg{
          animation:none!important;
        }
      }


      /* =========================================================
         RC10 — UI/UX publication polish
         ========================================================= */

      /* Evolutions cards: remove redundant unreadable source line */
      .v3-charts .chart-source{
        display:none!important;
      }
      .v3-charts .chart-card{
        grid-template-rows:auto minmax(116px,1fr) 18px!important;
      }
      .v3-charts .spark-wrap{
        margin-top:10px!important;
      }

      /* Advice legend */
      .v3-advice-legend{
        display:flex!important;
        flex-wrap:wrap!important;
        gap:6px 10px!important;
        margin:10px 0 4px!important;
        padding:0!important;
      }
      .v3-advice-legend span{
        display:inline-flex!important;
        align-items:center!important;
        gap:5px!important;
        padding:3px 7px!important;
        border-radius:999px!important;
        color:#cfe0ec!important;
        font-size:.58rem!important;
        font-weight:700!important;
        background:rgba(34,82,126,.34)!important;
        border:1px solid rgba(136,205,238,.12)!important;
      }
      .v3-advice-legend i{
        width:7px!important;
        height:7px!important;
        border-radius:50%!important;
      }
      .v3-advice-legend .is-good i{background:#68d397!important}
      .v3-advice-legend .is-info i{background:#62aef8!important}
      .v3-advice-legend .is-warning i{background:#ffb24b!important}
      .v3-advice-legend .is-critical i{background:#ff6b69!important}

      /* Advice rows become compact information badges */
      .v3-advice .advice-actions{
        gap:7px!important;
        margin:12px 0 14px!important;
      }
      .v3-advice .advice-actions>div{
        min-height:38px!important;
        grid-template-columns:25px 1fr!important;
        gap:9px!important;
        padding:7px 10px!important;
        border-radius:12px!important;
        background:rgba(25,69,112,.46)!important;
        box-shadow:none!important;
      }
      .v3-advice .advice-actions>div b{
        width:25px!important;
        height:25px!important;
        border-radius:8px!important;
        font-size:.70rem!important;
      }
      .v3-advice .advice-actions>div span{
        font-size:.72rem!important;
        line-height:1.35!important;
      }
      .v3-advice .advice-actions>div.is-critical{
        border-color:rgba(255,104,101,.34)!important;
        background:linear-gradient(145deg,rgba(117,49,55,.58),rgba(75,42,53,.62))!important;
      }
      .v3-advice .advice-actions>div.is-critical b{
        background:rgba(255,101,99,.28)!important;
        color:#ffd0cf!important;
      }
      .v3-advice .advice-actions>div.is-warning{
        border-color:rgba(255,181,70,.27)!important;
        background:linear-gradient(145deg,rgba(102,76,41,.48),rgba(67,52,43,.52))!important;
      }
      .v3-advice .advice-actions>div.is-info{
        border-color:rgba(92,174,245,.26)!important;
        background:linear-gradient(145deg,rgba(35,83,132,.50),rgba(24,59,105,.54))!important;
      }
      .v3-advice .advice-copy>p{
        color:#d7e5ef!important;
        font-size:.74rem!important;
        line-height:1.62!important;
        margin:10px 0!important;
      }

      /* Summary cards: stronger premium hierarchy */
      .v3-summary-card{
        min-height:116px!important;
        padding:16px 19px!important;
      }
      .v3-summary-card::after{
        content:""!important;
        position:absolute!important;
        width:116px!important;
        height:116px!important;
        left:-34px!important;
        top:-38px!important;
        border-radius:50%!important;
        background:radial-gradient(circle,rgba(83,163,232,.16),transparent 70%)!important;
        pointer-events:none!important;
      }
      .v3-summary-card--ph::after{background:radial-gradient(circle,rgba(255,181,73,.14),transparent 70%)!important}
      .v3-summary-card--orp::after{background:radial-gradient(circle,rgba(101,211,148,.16),transparent 70%)!important}
      .v3-summary-card--score::after{background:radial-gradient(circle,rgba(93,157,255,.18),transparent 70%)!important}
      .v3-mini-ring{
        width:54px!important;
        height:54px!important;
      }
      .v3-mini-ring b{
        font-size:.74rem!important;
      }
      .v3-summary-card>strong{
        font-size:1.72rem!important;
        letter-spacing:-.02em!important;
      }
      .v3-summary-card small{
        font-size:.66rem!important;
      }

      /* General health modernized */
      .v3-health-card{
        min-height:86px!important;
        padding:15px 19px!important;
      }
      .v3-health-card__head span{
        font-size:1.04rem!important;
      }
      .v3-health-card__head strong{
        font-size:1.18rem!important;
      }
      .v3-health-card .v3-progress{
        height:9px!important;
        margin-top:11px!important;
      }
      .v3-progress--health i{
        transform-origin:left center!important;
        animation:v3-health-fill .72s cubic-bezier(.22,.75,.2,1) both!important;
      }
      @keyframes v3-health-fill{
        from{transform:scaleX(0)}
        to{transform:scaleX(1)}
      }

      /* Device cards: final vertical tightening */
      .device-card{
        min-height:340px!important;
        padding-top:18px!important;
        padding-bottom:16px!important;
      }
      .device-card .gauges{
        margin-top:-4px!important;
      }
      .device-card .chips{
        margin-top:-4px!important;
      }

      @media(prefers-reduced-motion:reduce){
        .v3-progress--health i{
          animation:none!important;
        }
      }


      /* =========================================================
         RC11 — Chart clarity and contained tooltips
         ========================================================= */

      /* Useful, readable section-level synthesis label */
      .v3-section__header:has(+ .v3-charts) p{
        display:block!important;
        margin-top:4px!important;
        color:#d9e9f5!important;
        opacity:.92!important;
        font-size:.64rem!important;
        font-weight:650!important;
        letter-spacing:.015em!important;
        text-shadow:0 1px 5px rgba(0,0,0,.58)!important;
      }

      /* Latest-value marker: static and discreet */
      .v3-charts .end-halo{
        animation:none!important;
        opacity:.22!important;
        filter:none!important;
      }
      .v3-charts .end-dot{
        animation:none!important;
        opacity:.92!important;
        filter:drop-shadow(0 0 4px rgba(89,160,247,.55))!important;
      }

      /* Tooltip is measured and clamped by JavaScript inside the plot */
      .v3-charts .spark-wrap{
        position:relative!important;
        overflow:hidden!important;
      }
      .v3-charts .spark-tip{
        box-sizing:border-box!important;
        z-index:20!important;
        transform:none!important;
        width:max-content!important;
        max-width:calc(100% - 16px)!important;
        white-space:normal!important;
        overflow-wrap:anywhere!important;
        line-height:1.35!important;
        padding:8px 10px!important;
        border:1px solid rgba(119,207,246,.25)!important;
        background:rgba(4,38,78,.96)!important;
        box-shadow:0 10px 24px rgba(0,15,39,.36),inset 0 1px 0 rgba(255,255,255,.08)!important;
      }


      /* RC12 — per-device Bluetooth analysis status */
      .device-analysis-status{grid-area:status!important;display:grid!important;grid-template-columns:34px minmax(0,1fr) auto!important;grid-template-rows:auto 5px!important;align-items:center!important;gap:5px 10px!important;min-height:54px!important;padding:9px 12px!important;border-radius:15px!important;border:1px solid rgba(105,194,239,.18)!important;background:linear-gradient(145deg,rgba(16,57,105,.72),rgba(15,45,88,.76))!important}
      .device-analysis-status__icon{grid-row:1/3!important;display:grid!important;place-items:center!important;width:34px!important;height:34px!important;border-radius:11px!important;color:#d7eaff!important;background:rgba(76,145,207,.22)!important;font-weight:900!important}
      .device-analysis-status__copy small{display:block!important;color:#91aec3!important;font-size:.56rem!important}.device-analysis-status__copy strong{display:block!important;overflow:hidden!important;margin-top:2px!important;color:#f5fbff!important;font-size:.70rem!important;text-overflow:ellipsis!important;white-space:nowrap!important}
      .device-analysis-status__percent{color:#a8c2d5!important;font-size:.61rem!important;font-weight:800!important}.device-analysis-status__bar{grid-column:2/4!important;height:5px!important;overflow:hidden!important;border-radius:999px!important;background:rgba(111,159,193,.18)!important}
      .device-analysis-status__bar i{display:block!important;height:100%!important;border-radius:inherit!important;background:linear-gradient(90deg,#65d59a,#61a8ff)!important;transition:width .34s ease!important}
      .device-analysis-status.is-requested .device-analysis-status__icon,.device-analysis-status.is-connecting .device-analysis-status__icon,.device-analysis-status.is-analyzing .device-analysis-status__icon,.device-analysis-status.is-sync .device-analysis-status__icon{animation:v3-analysis-spin 1.25s linear infinite!important}
      .device-analysis-status.is-done{border-color:rgba(91,211,143,.28)!important}.device-analysis-status.is-error{border-color:rgba(255,102,101,.34)!important;background:rgba(91,37,52,.76)!important}
      @keyframes v3-analysis-spin{to{transform:rotate(360deg)}}
      .device-card{grid-template-areas:"header header header" "gauges gauges linear" "status status status" "chips chips analysis"!important;min-height:404px!important}
      .device-card .gauges{grid-area:gauges!important}.device-card>.linear{grid-area:linear!important}.device-card>.chips{grid-area:chips!important}.device-card>.analysis-box{grid-area:analysis!important}
      .app:not(.pref-advanced) .device-card{grid-template-areas:"header header header" "gauges gauges analysis" "status status analysis" "chips chips analysis"!important}
      @media(max-width:900px){.device-card{grid-template-areas:"header" "gauges" "linear" "status" "chips" "analysis"!important}.app:not(.pref-advanced) .device-card{grid-template-areas:"header" "gauges" "status" "chips" "analysis"!important}}
      @media(prefers-reduced-motion:reduce){.device-analysis-status__icon{animation:none!important}}


      /* =========================================================
         RC13 — Premium polish
         ========================================================= */

      .device-card,.chart-card,.v3-summary-card,.v3-score-card,.v3-health-card,.v3-info-card,.v3-preferences{
        border-color:rgba(98,194,238,.28)!important;
        box-shadow:0 18px 42px rgba(0,18,45,.24),inset 0 1px 0 rgba(255,255,255,.08),inset 0 -1px 0 rgba(0,0,0,.10)!important;
      }

      .device-card{
        min-height:374px!important;
        padding:16px 18px 14px!important;
        row-gap:10px!important;
      }
      .device-card .gauges{margin-top:-8px!important}
      .device-card>.linear{margin-top:-4px!important}
      .device-card>.chips{gap:10px!important}
      .device-card>.chips>div,.device-card>.analysis-box{min-height:70px!important;padding:10px 12px!important}
      .device-card button[data-i]{min-height:42px!important;padding:9px 12px!important;border-radius:13px!important}

      .device-analysis-status{
        min-height:60px!important;
        padding:9px 12px!important;
        grid-template-columns:36px minmax(0,1fr) auto!important;
        grid-template-rows:auto 4px!important;
        border-radius:14px!important;
        background:linear-gradient(145deg,rgba(20,67,116,.62),rgba(12,42,83,.68))!important;
      }
      .device-analysis-status__icon{
        width:36px!important;height:36px!important;border-radius:12px!important;
        box-shadow:0 0 18px rgba(78,156,229,.16)!important;
      }
      .device-analysis-status__copy strong{font-size:.72rem!important}
      .device-analysis-status__copy em{
        display:block!important;margin-top:2px!important;color:#91abc0!important;
        font-size:.54rem!important;font-style:normal!important;line-height:1.25!important;
      }
      .device-analysis-status__bar{height:4px!important}
      .device-analysis-status.is-analyzing{
        box-shadow:0 0 0 1px rgba(94,174,246,.15),0 0 24px rgba(72,142,220,.10)!important;
      }
      .device-analysis-status.is-sync .device-analysis-status__bar i{
        background:linear-gradient(90deg,#55c8ff,#7a8cff)!important;
      }

      .v3-charts .chart-card{
        min-height:238px!important;height:238px!important;padding:16px 18px 18px!important;
        background:linear-gradient(160deg,rgba(31,72,123,.92),rgba(18,48,91,.94))!important;
      }
      .v3-charts .spark-wrap{
        min-height:126px!important;border-radius:16px!important;
        background:linear-gradient(180deg,rgba(78,137,184,.11),rgba(22,64,107,.04))!important;
      }
      .v3-charts .spark .area{opacity:.24!important;filter:blur(.2px)!important}
      .v3-charts .spark .line{
        stroke-width:3.2!important;
        filter:drop-shadow(0 0 5px rgba(92,165,255,.55))!important;
      }
      .v3-charts .grid-line{opacity:.12!important}
      .v3-charts .ideal-band{opacity:.45!important}
      .v3-charts .end-dot{filter:drop-shadow(0 0 5px rgba(111,181,255,.65))!important}
      .app:not(.pref-no-animations) .v3-charts .spark .line{
        stroke-dasharray:760!important;stroke-dashoffset:760!important;
        animation:v3-chart-draw .95s cubic-bezier(.2,.75,.2,1) forwards!important;
      }
      @keyframes v3-chart-draw{to{stroke-dashoffset:0}}

      .v3-summary-card{min-height:122px!important;padding:17px 20px!important;overflow:hidden!important}
      .v3-summary-card .v3-mini-ring{
        width:58px!important;height:58px!important;
        filter:drop-shadow(0 0 10px rgba(90,163,229,.20))!important;
      }
      .v3-summary-card>strong{font-size:1.82rem!important}
      .v3-summary-card .v3-progress{height:8px!important}
      .v3-summary-card .v3-status{font-size:.66rem!important;font-weight:800!important}

      .v3-score-card{min-height:104px!important;padding:13px 15px!important}
      .v3-score-card .v3-score-icon{width:42px!important;height:42px!important}
      .v3-score-card strong{font-size:.86rem!important}
      .v3-score-card>span{font-size:1rem!important}
      .v3-score-card .v3-progress{height:7px!important}

      .v3-health-card{min-height:96px!important;padding:16px 20px!important}
      .v3-health-card__head span{font-size:1.08rem!important}
      .v3-health-card__head strong{font-size:1.28rem!important}
      .v3-health-card .v3-progress{height:9px!important}

      .v3-info-grid{align-items:start!important}
      .v3-info-card{min-height:242px!important;padding:16px 18px!important}
      .v3-info-card>header{min-height:40px!important}
      .v3-timeline{position:relative!important}
      .v3-timeline::before{
        content:""!important;position:absolute!important;left:11px!important;top:14px!important;bottom:14px!important;
        width:1px!important;background:linear-gradient(#6ed79d,#5f9cff)!important;opacity:.48!important;
      }
      .v3-timeline>div{position:relative!important;padding-left:30px!important}
      .v3-timeline>div::before{
        content:""!important;position:absolute!important;left:6px!important;top:15px!important;
        width:10px!important;height:10px!important;border-radius:50%!important;
        background:#70d99f!important;box-shadow:0 0 12px rgba(100,214,153,.45)!important;
      }

      .app:not(.pref-no-animations) .device-card,
      .app:not(.pref-no-animations) .chart-card,
      .app:not(.pref-no-animations) .v3-summary-card,
      .app:not(.pref-no-animations) .v3-score-card,
      .app:not(.pref-no-animations) .v3-health-card,
      .app:not(.pref-no-animations) .v3-info-card{
        animation:v3-card-rise .45s ease both!important;
      }
      @keyframes v3-card-rise{
        from{opacity:0;transform:translateY(8px)}
        to{opacity:1;transform:translateY(0)}
      }

      @media(max-width:1100px){
        .device-card{min-height:360px!important}
        .v3-charts .chart-card{height:auto!important;min-height:226px!important}
      }
      @media(max-width:760px){
        .device-card{min-height:unset!important}
      }


      /* =========================================================
         RC14 — final visual fixes
         ========================================================= */

      /* 1. Device cards: no clipping, compact but safe */
      .device-grid{
        align-items:stretch!important;
      }
      .device-card{
        min-height:430px!important;
        height:auto!important;
        overflow:visible!important;
        padding:18px 18px 18px!important;
        row-gap:11px!important;
      }
      .device-card .device-analysis-status{
        min-height:66px!important;
      }
      .device-card>.chips>div,
      .device-card>.analysis-box{
        min-height:82px!important;
      }
      .device-card>.analysis-box{
        padding-bottom:12px!important;
      }
      .device-card button[data-i]{
        min-height:44px!important;
        margin-top:5px!important;
      }

      /* Keep rounded bottom border visible */
      .device-card::after{
        content:""!important;
        position:absolute!important;
        left:16px!important;
        right:16px!important;
        bottom:0!important;
        height:1px!important;
        background:linear-gradient(90deg,transparent,rgba(127,213,247,.35),transparent)!important;
        pointer-events:none!important;
      }

      /* 2. Charts: restore high contrast and readability */
      .v3-charts .chart-card{
        min-height:252px!important;
        height:252px!important;
        padding:16px 18px 20px!important;
        background:
          linear-gradient(160deg,rgba(29,70,119,.88),rgba(14,43,84,.92))!important;
      }
      .v3-charts .spark-wrap{
        min-height:136px!important;
        overflow:hidden!important;
        border:1px solid rgba(109,194,235,.26)!important;
        background:
          linear-gradient(180deg,rgba(63,132,184,.13),rgba(16,54,95,.06))!important;
      }
      .v3-charts .spark{
        overflow:visible!important;
      }
      .v3-charts .spark .line{
        stroke:#67a9ff!important;
        stroke-width:3.8!important;
        opacity:1!important;
        filter:drop-shadow(0 0 4px rgba(89,162,255,.72))!important;
      }
      .v3-charts .spark .area{
        fill:rgba(86,157,236,.16)!important;
        opacity:1!important;
        filter:none!important;
      }
      .v3-charts .ideal-band{
        fill:rgba(86,199,169,.12)!important;
        opacity:1!important;
      }
      .v3-charts .grid-line{
        stroke:rgba(184,222,245,.11)!important;
        opacity:1!important;
      }
      .v3-charts .end-dot{
        fill:#8fc0ff!important;
        stroke:#eaf5ff!important;
        stroke-width:1.7!important;
        opacity:1!important;
        filter:drop-shadow(0 0 5px rgba(111,181,255,.8))!important;
      }
      .v3-charts .end-halo{
        fill:rgba(93,164,255,.18)!important;
        opacity:1!important;
      }
      .v3-charts .chart-meta,
      .v3-charts .chart-footer{
        color:#b9ccda!important;
        opacity:.96!important;
      }
      .v3-charts .chart-card h3,
      .v3-charts .chart-card strong{
        color:#f5fbff!important;
      }

      /* 3. Summary cards */
      .v3-summary-card{
        min-height:128px!important;
        padding:18px 20px!important;
      }
      .v3-summary-card .v3-mini-ring{
        width:62px!important;
        height:62px!important;
      }
      .v3-summary-card>strong{
        font-size:1.9rem!important;
      }
      .v3-summary-card .v3-status{
        padding:5px 9px!important;
        border-radius:999px!important;
      }

      /* 4. Score detail */
      .v3-score-card{
        min-height:112px!important;
        padding:15px 16px!important;
        row-gap:7px!important;
      }
      .v3-score-card .v3-score-icon{
        box-shadow:0 0 16px rgba(94,158,240,.18)!important;
      }
      .v3-score-card .v3-progress{
        margin-top:5px!important;
      }

      /* 5. General health */
      .v3-health-card{
        min-height:102px!important;
        padding:17px 20px!important;
      }
      .v3-health-card__head{
        align-items:center!important;
      }
      .v3-health-card__head strong{
        font-size:1.34rem!important;
      }
      .v3-health-card .v3-progress{
        height:10px!important;
        margin-top:12px!important;
      }

      /* 6. Information cards */
      .v3-info-card{
        min-height:252px!important;
        padding:17px 18px!important;
      }
      .v3-weather-grid>div{
        border-radius:13px!important;
        background:rgba(43,88,133,.30)!important;
        border:1px solid rgba(130,201,235,.11)!important;
      }
      .v3-advice .advice-actions>div{
        min-height:42px!important;
        padding:9px 11px!important;
      }
      .v3-advice .advice-actions>div span{
        color:#f1f7fb!important;
      }
      .v3-timeline::before{
        opacity:.62!important;
      }
      .v3-timeline>div{
        border-bottom:1px solid rgba(126,184,219,.10)!important;
      }
      .v3-comparison .compare-row{
        padding:10px 0!important;
      }
      .v3-comparison .compare-badge{
        transform:scale(.9)!important;
        transform-origin:right center!important;
      }

      /* 7. Preferences polish */
      .v3-preferences{
        box-shadow:0 18px 42px rgba(0,18,45,.22),inset 0 1px 0 rgba(255,255,255,.07)!important;
      }
      .v3-preferences .pref-row{
        min-height:72px!important;
      }

      /* Responsive safety */
      @media(max-width:1300px){
        .device-card{
          min-height:414px!important;
        }
      }
      @media(max-width:900px){
        .device-card{
          min-height:unset!important;
          overflow:hidden!important;
        }
        .v3-charts .chart-card{
          height:auto!important;
          min-height:238px!important;
        }
      }


      /* =========================================================
         RC15 — containment and chart visibility
         ========================================================= */

      /* Device cards: contain every child and preserve the bottom radius */
      .device-card{
        min-height:438px!important;
        overflow:hidden!important;
        box-sizing:border-box!important;
      }
      .device-card>*{
        min-width:0!important;
        box-sizing:border-box!important;
      }
      .device-card>.analysis-box{
        width:100%!important;
        max-width:100%!important;
        min-width:0!important;
        overflow:hidden!important;
        box-sizing:border-box!important;
        padding:10px!important;
      }
      .device-card>.analysis-box .last{
        min-width:0!important;
      }
      .device-card>.analysis-box .last span{
        min-width:0!important;
        overflow:hidden!important;
      }
      .device-card>.analysis-box .last strong{
        overflow:hidden!important;
        text-overflow:ellipsis!important;
        white-space:nowrap!important;
      }
      .device-card button[data-i]{
        display:flex!important;
        width:100%!important;
        min-width:0!important;
        max-width:100%!important;
        height:40px!important;
        min-height:40px!important;
        padding:8px 10px!important;
        margin:5px 0 0!important;
        box-sizing:border-box!important;
        overflow:hidden!important;
      }
      .device-card button[data-i] span{
        min-width:0!important;
        overflow:hidden!important;
        text-overflow:ellipsis!important;
        white-space:nowrap!important;
      }

      /* Charts: always display the line, no dash animation that can hide it */
      .v3-charts .spark .line{
        stroke:#79c7ff!important;
        stroke-width:4.4!important;
        stroke-linecap:round!important;
        stroke-linejoin:round!important;
        stroke-dasharray:none!important;
        stroke-dashoffset:0!important;
        opacity:1!important;
        animation:none!important;
        filter:
          drop-shadow(0 0 2px rgba(220,245,255,.95))
          drop-shadow(0 0 7px rgba(57,158,255,.88))!important;
      }
      .v3-charts .spark .area{
        fill:rgba(74,166,255,.09)!important;
        opacity:1!important;
      }
      .v3-charts .spark-wrap{
        background:
          linear-gradient(180deg,rgba(47,112,164,.08),rgba(10,38,77,.03))!important;
      }
      .v3-charts .ideal-band{
        fill:rgba(87,214,174,.09)!important;
      }
      .v3-charts .spark-grid line{
        stroke:rgba(186,226,250,.08)!important;
      }
      .v3-charts .end-halo{
        fill:rgba(94,183,255,.22)!important;
        opacity:1!important;
      }
      .v3-charts .end-dot{
        fill:#a9dcff!important;
        stroke:#ffffff!important;
        stroke-width:2!important;
        opacity:1!important;
      }

      /* Remove older draw animation regardless of preference */
      .app:not(.pref-no-animations) .v3-charts .spark .line,
      .pref-animations .v3-charts .spark .line,
      .pref-no-animations .v3-charts .spark .line{
        stroke-dasharray:none!important;
        stroke-dashoffset:0!important;
        animation:none!important;
      }

      /* Slightly stronger textual contrast */
      .v3-charts .chart-card header span,
      .v3-charts .chart-card footer span{
        color:#c4d8e7!important;
        opacity:1!important;
      }
      .v3-charts .chart-card header strong{
        color:#ffffff!important;
      }

      @media(max-width:1300px){
        .device-card{min-height:430px!important}
      }
      @media(max-width:900px){
        .device-card{min-height:unset!important}
      }


      /* =========================================================
         RC16 — final premium UI, background intentionally untouched
         ========================================================= */

      /* 1. Device cards: final button containment */
      .device-card{
        min-height:446px!important;
        overflow:hidden!important;
        position:relative!important;
      }
      .device-card>.chips{
        display:grid!important;
        grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(220px,.92fr)!important;
        gap:12px!important;
        width:100%!important;
        min-width:0!important;
        align-items:stretch!important;
      }
      .device-card>.chips>div,
      .device-card>.analysis-box{
        min-width:0!important;
        width:auto!important;
        max-width:100%!important;
        box-sizing:border-box!important;
        overflow:hidden!important;
      }
      .device-card>.analysis-box{
        display:flex!important;
        flex-direction:column!important;
        justify-content:space-between!important;
        padding:10px 12px 12px!important;
      }
      .device-card>.analysis-box .last{
        display:grid!important;
        grid-template-columns:auto minmax(0,1fr)!important;
        column-gap:10px!important;
        width:100%!important;
        min-width:0!important;
      }
      .device-card>.analysis-box .last>span{
        min-width:0!important;
        max-width:100%!important;
      }
      .device-card>.analysis-box .last strong{
        display:block!important;
        max-width:100%!important;
        overflow:hidden!important;
        text-overflow:ellipsis!important;
        white-space:nowrap!important;
      }
      .device-card button[data-i]{
        align-self:stretch!important;
        flex:0 0 38px!important;
        width:100%!important;
        min-width:0!important;
        max-width:100%!important;
        height:38px!important;
        min-height:38px!important;
        padding:7px 9px!important;
        margin:6px 0 0!important;
        border-radius:12px!important;
        box-sizing:border-box!important;
        overflow:hidden!important;
        transform:none!important;
      }
      .device-card button[data-i]>*{
        min-width:0!important;
        max-width:100%!important;
      }
      .device-card button[data-i] span{
        overflow:hidden!important;
        text-overflow:ellipsis!important;
        white-space:nowrap!important;
      }

      /* 2. Charts: elegant, readable, less neon */
      .v3-charts .spark .line{
        stroke:#72b5f4!important;
        stroke-width:3.15!important;
        stroke-linecap:round!important;
        stroke-linejoin:round!important;
        stroke-dasharray:none!important;
        stroke-dashoffset:0!important;
        opacity:1!important;
        animation:none!important;
        filter:drop-shadow(0 0 2.5px rgba(83,156,225,.42))!important;
      }
      .v3-charts .spark .area{
        fill:rgba(78,151,220,.16)!important;
        opacity:1!important;
      }
      .v3-charts .spark-wrap{
        background:
          linear-gradient(180deg,rgba(57,112,161,.11),rgba(13,42,78,.035))!important;
      }
      .v3-charts .ideal-band{
        fill:rgba(82,190,155,.11)!important;
        opacity:1!important;
      }
      .v3-charts .spark-grid line,
      .v3-charts .grid-line{
        stroke:rgba(187,220,240,.12)!important;
        opacity:1!important;
      }
      .v3-charts .end-dot{
        fill:#8fc5f6!important;
        stroke:#f3fbff!important;
        stroke-width:1.55!important;
        filter:drop-shadow(0 0 3px rgba(83,156,225,.48))!important;
      }
      .v3-charts .end-halo{
        fill:rgba(83,156,225,.13)!important;
        opacity:1!important;
      }

      /* 3. Current summary: denser without changing data logic */
      .v3-summary-card{
        min-height:136px!important;
        padding:17px 20px 15px!important;
        grid-template-rows:auto auto auto!important;
      }
      .v3-summary-card .v3-mini-ring{
        width:60px!important;
        height:60px!important;
      }
      .v3-summary-card>strong{
        font-size:1.92rem!important;
        line-height:1!important;
      }
      .v3-summary-card .v3-progress{
        height:7px!important;
        margin-top:10px!important;
      }
      .v3-summary-card::after{
        content:"Mesure consolidée · mise à jour automatique"!important;
        position:absolute!important;
        left:20px!important;
        bottom:13px!important;
        color:#8faabe!important;
        font-size:.54rem!important;
        font-weight:650!important;
        letter-spacing:.01em!important;
        pointer-events:none!important;
      }

      /* 4. Score detail: more depth and stronger hierarchy */
      .v3-score-card{
        min-height:116px!important;
        padding:14px 16px!important;
        background:
          linear-gradient(150deg,rgba(34,75,126,.88),rgba(20,50,92,.92))!important;
        border:1px solid rgba(117,190,230,.22)!important;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.06),
          0 8px 22px rgba(1,20,46,.13)!important;
      }
      .v3-score-card .v3-score-icon{
        width:44px!important;
        height:44px!important;
        border-radius:13px!important;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.16),
          0 0 14px rgba(93,157,239,.17)!important;
      }
      .v3-score-card strong{
        font-size:.9rem!important;
      }
      .v3-score-card>span{
        font-size:1.04rem!important;
        font-weight:850!important;
      }
      .v3-score-card .v3-progress{
        height:8px!important;
        margin-top:7px!important;
      }

      /* 5. Health: small clarity pass */
      .v3-health-card__head strong{
        font-size:1.42rem!important;
      }
      .v3-health-card .v3-progress{
        height:11px!important;
      }

      /* 6. Useful information: same visual language across all cards */
      .v3-info-grid{
        gap:16px!important;
      }
      .v3-info-card{
        min-height:268px!important;
        background:
          linear-gradient(155deg,rgba(31,70,118,.91),rgba(18,47,88,.94))!important;
        border:1px solid rgba(111,190,230,.23)!important;
      }
      .v3-info-card>header{
        min-height:44px!important;
        padding-bottom:10px!important;
        border-bottom:1px solid rgba(126,184,219,.10)!important;
      }
      .v3-info-card>header .icon,
      .v3-section-title .icon,
      .v3-score-icon,
      .v3-mini-ring{
        filter:drop-shadow(0 0 6px rgba(90,158,230,.18))!important;
      }
      .v3-weather-grid{
        gap:10px!important;
      }
      .v3-weather-grid>div{
        min-height:66px!important;
        padding:10px 11px!important;
      }
      .v3-advice .advice-actions{
        gap:9px!important;
      }
      .v3-advice .advice-actions>div{
        border-radius:13px!important;
        border-width:1px!important;
      }
      .v3-timeline>div{
        min-height:62px!important;
      }
      .v3-comparison .compare-row{
        min-height:72px!important;
      }
      .v3-comparison .compare-badge{
        transform:scale(.82)!important;
        opacity:.9!important;
      }
      .v3-comparison .v3-progress{
        height:7px!important;
      }

      /* 7. Icon normalization */
      .v3-info-card>header .icon,
      .v3-section-title .icon,
      .v3-score-card .v3-score-icon{
        display:grid!important;
        place-items:center!important;
        flex:0 0 auto!important;
      }

      @media(max-width:1500px){
        .device-card>.chips{
          grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(200px,.9fr)!important;
        }
      }
      @media(max-width:1100px){
        .device-card{
          min-height:430px!important;
        }
        .device-card>.chips{
          grid-template-columns:1fr 1fr!important;
        }
        .device-card>.analysis-box{
          grid-column:1/3!important;
        }
      }
      @media(max-width:760px){
        .device-card{
          min-height:unset!important;
        }
        .device-card>.chips{
          grid-template-columns:1fr!important;
        }
        .device-card>.analysis-box{
          grid-column:auto!important;
        }
      }


      /* =========================================================
         RC17 — final polish, no background or hero changes
         ========================================================= */

      /* 1. Device cards: definitive button containment + tighter rhythm */
      .device-card{
        min-height:420px!important;
        padding:16px 18px 16px!important;
        row-gap:8px!important;
      }
      .device-card .gauges{
        margin-top:-14px!important;
      }
      .device-card>.linear{
        margin-top:-8px!important;
      }
      .device-analysis-status{
        min-height:60px!important;
        padding:8px 11px!important;
      }
      .device-card>.chips{
        grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(210px,.9fr)!important;
        gap:10px!important;
      }
      .device-card>.chips>div,
      .device-card>.analysis-box{
        min-height:74px!important;
      }
      .device-card>.analysis-box{
        padding:9px 14px 11px!important;
      }
      .device-card button[data-i]{
        width:96%!important;
        max-width:96%!important;
        min-width:0!important;
        height:36px!important;
        min-height:36px!important;
        flex:0 0 36px!important;
        margin:6px auto 0!important;
        padding:6px 10px!important;
        border-radius:11px!important;
      }

      /* 2. Summary cards: denser, Apple-Health-like hierarchy */
      .v3-summary-card{
        min-height:142px!important;
        padding:17px 20px 16px!important;
      }
      .v3-summary-card .v3-mini-ring{
        width:58px!important;
        height:58px!important;
      }
      .v3-summary-card>strong{
        font-size:2rem!important;
        margin-top:2px!important;
      }
      .v3-summary-card .v3-status{
        top:16px!important;
        right:16px!important;
        font-size:.62rem!important;
        padding:5px 10px!important;
      }
      .v3-summary-card .v3-progress{
        height:8px!important;
        margin-top:14px!important;
      }
      .v3-summary-card::before{
        content:"Tendance stable"!important;
        position:absolute!important;
        left:20px!important;
        bottom:29px!important;
        color:#a7bed0!important;
        font-size:.56rem!important;
        font-weight:700!important;
      }
      .v3-summary-card::after{
        content:"Dernière mesure consolidée"!important;
        bottom:13px!important;
        color:#7f9bb1!important;
      }

      /* 3. Score cards: more depth without changing layout */
      .v3-score-card{
        min-height:122px!important;
        padding:16px 17px!important;
        background:
          radial-gradient(circle at 15% 10%,rgba(88,149,218,.12),transparent 38%),
          linear-gradient(155deg,rgba(34,75,126,.91),rgba(18,47,88,.95))!important;
        border-color:rgba(123,198,237,.27)!important;
      }
      .v3-score-card .v3-score-icon{
        width:47px!important;
        height:47px!important;
        border-radius:14px!important;
      }
      .v3-score-card strong{
        font-size:.94rem!important;
      }
      .v3-score-card>span{
        font-size:1.09rem!important;
      }
      .v3-score-card .v3-progress{
        height:9px!important;
      }

      /* 4. General health: stronger titles and icons */
      .v3-health-card{
        min-height:108px!important;
        padding:18px 20px!important;
      }
      .v3-health-card__head span{
        font-size:1.16rem!important;
      }
      .v3-health-card__head strong{
        font-size:1.48rem!important;
      }
      .v3-health-card .v3-progress{
        height:11px!important;
      }

      /* 5. Useful information: compact, balanced, premium */
      .v3-info-grid{
        grid-template-columns:1fr 1.05fr 1fr 1.15fr!important;
        gap:14px!important;
      }
      .v3-info-card{
        min-height:254px!important;
        padding:16px 17px!important;
      }
      .v3-info-card>header{
        min-height:42px!important;
        padding-bottom:9px!important;
      }
      .v3-info-card>header strong{
        font-size:.94rem!important;
      }

      /* Weather */
      .v3-weather-main{
        margin-top:13px!important;
      }
      .v3-weather-main strong{
        font-size:1.8rem!important;
      }
      .v3-weather-grid>div{
        min-height:62px!important;
        padding:9px 10px!important;
      }

      /* Advice */
      .v3-advice{
        gap:10px!important;
      }
      .v3-advice .advice-title{
        font-size:1rem!important;
      }
      .v3-advice .advice-actions{
        gap:8px!important;
      }
      .v3-advice .advice-actions>div{
        min-height:39px!important;
        padding:8px 10px!important;
      }
      .v3-advice button{
        min-height:38px!important;
        padding:8px 14px!important;
      }

      /* Timeline */
      .v3-timeline>div{
        min-height:58px!important;
        padding-top:9px!important;
        padding-bottom:9px!important;
      }
      .v3-timeline>div strong{
        font-size:.8rem!important;
      }

      /* Comparison */
      .v3-comparison .compare-row{
        min-height:66px!important;
        padding:8px 0!important;
      }
      .v3-comparison .compare-badge{
        transform:scale(.76)!important;
      }
      .v3-comparison .v3-progress{
        height:6px!important;
      }

      /* Icon consistency */
      .v3-info-card>header .icon,
      .v3-section-title .icon,
      .v3-score-card .v3-score-icon{
        border-radius:12px!important;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.13),
          0 0 12px rgba(91,157,230,.15)!important;
      }

      @media(max-width:1500px){
        .device-card>.chips{
          grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(190px,.88fr)!important;
        }
      }
      @media(max-width:1100px){
        .device-card{
          min-height:unset!important;
        }
        .device-card>.chips{
          grid-template-columns:1fr 1fr!important;
        }
        .device-card>.analysis-box{
          grid-column:1/3!important;
        }
        .v3-info-grid{
          grid-template-columns:1fr 1fr!important;
        }
      }
      @media(max-width:760px){
        .device-card>.chips{
          grid-template-columns:1fr!important;
        }
        .device-card>.analysis-box{
          grid-column:auto!important;
        }
        .v3-info-grid{
          grid-template-columns:1fr!important;
        }
      }


      /* RC18 — UX & polish; Hero, background, layout and charts unchanged */

      .device-analysis-status{
        position:relative!important;
        overflow:hidden!important;
        transition:border-color .25s ease,background .25s ease,box-shadow .25s ease!important;
      }
      .device-analysis-status[data-analysis-tone="success"]{
        background:linear-gradient(135deg,rgba(31,103,95,.22),rgba(25,58,101,.82))!important;
        border-color:rgba(116,220,168,.36)!important;
      }
      .device-analysis-status[data-analysis-tone="waiting"],
      .device-analysis-status[data-analysis-tone="idle"]{
        background:linear-gradient(135deg,rgba(42,93,141,.30),rgba(25,55,98,.84))!important;
        border-color:rgba(116,181,233,.28)!important;
      }
      .device-analysis-status[data-analysis-tone="connecting"],
      .device-analysis-status[data-analysis-tone="syncing"],
      .device-analysis-status[data-analysis-tone="running"]{
        background:linear-gradient(135deg,rgba(62,80,160,.34),rgba(24,53,97,.88))!important;
        border-color:rgba(122,153,255,.42)!important;
        box-shadow:inset 0 0 0 1px rgba(255,255,255,.03),0 0 22px rgba(85,132,255,.12)!important;
      }
      .device-analysis-status[data-analysis-tone="error"]{
        background:linear-gradient(135deg,rgba(132,48,65,.42),rgba(63,43,74,.90))!important;
        border-color:rgba(241,106,119,.45)!important;
      }
      .device-analysis-status[data-analysis-tone="offline"],
      .device-analysis-status[data-analysis-tone="unknown"]{
        background:linear-gradient(135deg,rgba(74,82,96,.42),rgba(29,47,75,.90))!important;
        border-color:rgba(164,180,199,.25)!important;
      }
      .device-analysis-status[data-analysis-tone="connecting"]::after,
      .device-analysis-status[data-analysis-tone="syncing"]::after,
      .device-analysis-status[data-analysis-tone="running"]::after{
        content:""!important;
        position:absolute!important;
        inset:0!important;
        background:linear-gradient(110deg,transparent 20%,rgba(255,255,255,.08) 45%,transparent 70%)!important;
        transform:translateX(-100%)!important;
        animation:rc18StatusSweep 2.3s infinite!important;
        pointer-events:none!important;
      }
      @keyframes rc18StatusSweep{to{transform:translateX(100%)}}

      .v3-summary-card{
        min-height:152px!important;
        padding:18px 20px 16px!important;
        display:grid!important;
        grid-template-columns:70px 1fr!important;
        grid-template-rows:auto auto 1fr auto!important;
        column-gap:16px!important;
        align-items:start!important;
      }
      .v3-summary-card .v3-mini-ring{
        grid-row:1/4!important;
        width:66px!important;
        height:66px!important;
        align-self:start!important;
      }
      .v3-summary-card>strong{
        grid-column:2!important;
        font-size:2.15rem!important;
        line-height:1!important;
        margin:0!important;
      }
      .v3-summary-card .v3-status{top:17px!important;right:17px!important}
      .v3-summary-card .v3-progress{grid-column:1/3!important;margin-top:8px!important}
      .v3-summary-card::before,.v3-summary-card::after{display:none!important}
      .rc18-summary-caption{
        grid-column:2!important;
        color:#9fb7cb!important;
        font-size:.62rem!important;
        font-weight:700!important;
        margin-top:6px!important;
      }

      .v3-score-card{
        position:relative!important;
        min-height:126px!important;
        overflow:hidden!important;
      }
      .v3-score-card::before{
        content:""!important;
        position:absolute!important;
        width:110px!important;
        height:110px!important;
        left:-26px!important;
        top:-32px!important;
        border-radius:50%!important;
        background:radial-gradient(circle,rgba(94,157,255,.20),transparent 70%)!important;
        pointer-events:none!important;
      }
      .rc18-score-badge{
        position:absolute!important;
        right:15px!important;
        top:45px!important;
        padding:4px 8px!important;
        border-radius:999px!important;
        background:rgba(100,160,225,.11)!important;
        border:1px solid rgba(140,195,244,.16)!important;
        color:#9fc6e6!important;
        font-size:.52rem!important;
        font-weight:800!important;
      }

      .v3-info-grid{gap:12px!important;align-items:stretch!important}
      .v3-info-card{
        border-radius:22px!important;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.04),0 10px 30px rgba(7,26,52,.16)!important;
      }
      .v3-info-card>header{border-bottom:1px solid rgba(134,184,229,.10)!important}
      .v3-info-card:nth-child(2){
        background:radial-gradient(circle at 12% 10%,rgba(255,167,78,.10),transparent 35%),linear-gradient(155deg,rgba(31,69,119,.94),rgba(19,47,88,.97))!important;
      }
      .v3-info-card:nth-child(3){
        background:radial-gradient(circle at 15% 12%,rgba(106,210,153,.08),transparent 38%),linear-gradient(155deg,rgba(30,67,115,.94),rgba(19,47,88,.97))!important;
      }
      .v3-info-card:nth-child(4){
        background:radial-gradient(circle at 88% 12%,rgba(88,155,255,.10),transparent 38%),linear-gradient(155deg,rgba(30,67,115,.94),rgba(19,47,88,.97))!important;
      }

      .rc18-preferences{
        padding:18px 20px 20px!important;
        border-radius:26px!important;
        background:radial-gradient(circle at 90% 10%,rgba(90,145,255,.11),transparent 34%),linear-gradient(155deg,rgba(31,69,119,.95),rgba(19,47,88,.98))!important;
      }
      .rc18-preferences>header{padding-bottom:14px!important;margin-bottom:8px!important}
      .rc18-preferences [class*="pref"],
      .rc18-preferences [class*="setting"]{
        min-height:72px!important;
        padding:12px 14px!important;
        border-radius:18px!important;
        background:linear-gradient(145deg,rgba(45,83,135,.66),rgba(25,54,96,.82))!important;
        border:1px solid rgba(129,185,235,.10)!important;
      }
      .rc18-preferences input[type="checkbox"]+*,
      .rc18-preferences [role="switch"]{
        filter:drop-shadow(0 0 8px rgba(100,205,170,.18))!important;
      }

      @media(max-width:760px){
        .v3-summary-card{grid-template-columns:58px 1fr!important;column-gap:12px!important}
        .v3-summary-card .v3-mini-ring{width:54px!important;height:54px!important}
      }



      /* RC19 — finition desktop + mobile, sans modification du fond */
      .smart-chip,.device-card,.chart-card,.v3-summary-card,.v3-score-card,.health-meter,.v3-info-card,.v3-preferences{
        backdrop-filter:blur(18px) saturate(118%)!important;
        -webkit-backdrop-filter:blur(18px) saturate(118%)!important;
      }
      .smart-chip{background:linear-gradient(145deg,rgba(12,55,102,.74),rgba(8,47,89,.60))!important}
      .device-card,.chart-card,.v3-summary-card,.v3-score-card,.health-meter,.v3-info-card,.v3-preferences{
        background:linear-gradient(150deg,rgba(23,61,111,.86),rgba(11,43,84,.78))!important;
        border-color:rgba(117,190,244,.30)!important;
      }
      .device-card{min-height:0!important;padding-bottom:18px!important}
      .device-card>.analysis-box{align-items:stretch!important;gap:10px!important}
      .device-card>.analysis-box>button{
        min-height:44px!important;height:44px!important;margin:0!important;padding:0 16px!important;
        border-radius:15px!important;box-shadow:0 10px 22px rgba(31,118,255,.24)!important;
      }
      .device-card>.chips>div,.device-card>.last{min-height:88px!important}
      .device-analysis-status{padding-top:14px!important;padding-bottom:14px!important}
      .chart-card{padding:16px 18px 15px!important}
      .spark{height:145px!important}
      .spark svg{filter:drop-shadow(0 0 6px rgba(126,199,255,.42))!important}
      .spark .line,.spark polyline{stroke-width:3.5!important;opacity:1!important}
      .spark .area{opacity:.24!important}
      .v3-summary-card{min-height:142px!important}
      .v3-summary-card .v3-mini-ring{width:72px!important;height:72px!important}
      .v3-summary-card .v3-status{font-size:.68rem!important;padding:6px 9px!important}
      .score-details>div{min-height:96px!important;padding:11px 12px 18px!important}
      .health-meter{min-height:94px!important;padding:14px 18px!important}
      .v3-info-card{min-height:0!important;padding:20px!important}
      .v3-info-card header{margin-bottom:14px!important}
      .v3-settings{gap:8px!important}
      .v3-setting{min-height:72px!important;padding:11px 12px!important}
      .v3-preferences{padding-bottom:18px!important}
      .analysis-box button:active,[data-analysis-all]:active,.advice-toggle:active{transform:scale(.98)!important}

      @media(max-width:760px){
        .app{padding:0!important;border-radius:0!important}
        .hero-v2{padding:28px 20px 24px!important;border-radius:32px!important}
        .hero-v2__grid{gap:18px!important}
        .hero-v2__metrics{gap:10px!important}
        .hero-v2__metric{min-height:78px!important;padding:12px!important;border-radius:20px!important}
        .hero-v2 [data-analysis-all]{min-height:54px!important;margin-top:12px!important;border-radius:18px!important}
        .devices{gap:18px!important}
        .device-card{padding:18px 16px 16px!important;border-radius:30px!important}
        .device-card header{margin-bottom:6px!important}
        .device-card>.gauges{margin:4px 0 8px!important}
        .device-card>.linear{margin:4px 0 10px!important}
        .device-analysis-status{min-height:106px!important;padding:13px 14px!important}
        .device-card>.chips{gap:10px!important}
        .device-card>.chips>div{min-height:100px!important;padding:14px 16px!important}
        .device-card>.analysis-box{gap:10px!important;margin-top:10px!important}
        .device-card>.analysis-box>.last{min-height:86px!important;padding:12px 16px!important}
        .device-card>.analysis-box>button{height:54px!important;min-height:54px!important;font-size:1rem!important;border-radius:18px!important}
        .v3-charts{gap:16px!important}
        .chart-card{padding:16px!important;border-radius:26px!important}
        .spark{height:180px!important}
        .v3-summary{gap:14px!important}
        .v3-summary-card{min-height:132px!important;padding:16px!important;grid-template-columns:66px 1fr!important}
        .v3-summary-card .v3-mini-ring{width:64px!important;height:64px!important}
        .v3-summary-card>strong{font-size:2rem!important}
        .score-details{gap:10px!important}
        .score-details>div{min-height:82px!important;padding:10px 12px 17px!important}
        .health-grid{gap:12px!important}
        .health-meter{min-height:86px!important;padding:13px 16px!important}
        .v3-info-grid{gap:14px!important}
        .v3-info-card{padding:18px!important;border-radius:26px!important}
        .v3-info-card h3{font-size:.95rem!important}
        .v3-weather__main{margin-top:4px!important}
        .v3-settings{gap:7px!important}
        .v3-setting{min-height:66px!important;padding:10px 11px!important}
        .v3-setting b{font-size:.88rem!important}
        .v3-setting small{font-size:.72rem!important}
        .v3-switch{transform:scale(.92)!important;transform-origin:right center!important}
      }
      @media(max-width:420px){
        .hero-v2{padding:24px 18px 22px!important}
        .hero-v2__metric{min-height:74px!important}
        .device-card{padding-left:14px!important;padding-right:14px!important}
        .spark{height:166px!important}
        .score-details>div{min-height:78px!important}
      }


      /* RC20 — final responsive tuning, desktop background unchanged */
      .hero-v2__mobile-analysis{display:none!important}
      @media(min-width:761px){
        /* Useful-information cards keep their own natural height. */
        .v3-info-grid{
          align-items:start!important;
          grid-auto-rows:auto!important;
        }
        .v3-info-card{
          align-self:start!important;
          height:auto!important;
          min-height:0!important;
        }
        .v3-weather{min-height:300px!important}
        .v3-advice{min-height:0!important}
        .v3-history{min-height:250px!important}
        .v3-comparison{min-height:0!important}
        .v3-preferences{min-height:0!important}

        /* The device action stays fully contained in its own panel. */
        .device-card>.analysis-box{
          box-sizing:border-box!important;
          overflow:hidden!important;
          padding-bottom:10px!important;
        }
        .device-card>.analysis-box>button{
          box-sizing:border-box!important;
          width:100%!important;
          max-width:100%!important;
          flex:0 0 42px!important;
          height:42px!important;
          min-height:42px!important;
        }
      }

      @media(max-width:760px){
        /* Mobile background uses a viewport layer so the landscape scene is not
           stretched over the full document height. Desktop remains untouched. */
        .app{
          background-image:none!important;
          background-color:#087daf!important;
          isolation:isolate!important;
        }
        .app::before{
          content:""!important;
          position:fixed!important;
          inset:0!important;
          z-index:-2!important;
          pointer-events:none!important;
          background-image:
            linear-gradient(180deg,rgba(0,30,67,.05),rgba(0,31,70,.22)),
            image-set(
              url("/local/ha-pool-dashboard/assets/pool-dashboard-background-beta25-2.webp?v=rc22") type("image/webp"),
              url("/local/ha-pool-dashboard/assets/pool-dashboard-background-beta25-2.png?v=rc22") type("image/png")
            )!important;
          background-size:auto 100vh!important;
          background-position:18% top!important;
          background-repeat:no-repeat!important;
          background-color:#087daf!important;
        }
        .app::after{
          content:""!important;
          position:fixed!important;
          inset:0!important;
          z-index:-1!important;
          pointer-events:none!important;
          background:linear-gradient(180deg,rgba(0,34,73,.02),rgba(0,30,68,.18) 58%,rgba(0,25,60,.28))!important;
        }

        /* More transparent glass on smartphone, with enough contrast for text. */
        .hero-v2__mobile-analysis{
          display:flex!important;
          align-items:center!important;
          justify-content:center!important;
          gap:10px!important;
          width:100%!important;
          min-height:54px!important;
          margin-top:12px!important;
          padding:0 16px!important;
          border-radius:18px!important;
          color:#fff!important;
          font-size:.94rem!important;
          font-weight:900!important;
          letter-spacing:.02em!important;
          background:linear-gradient(100deg,#28aff8,#5363ff)!important;
          border:1px solid rgba(255,255,255,.26)!important;
          box-shadow:0 12px 26px rgba(25,104,245,.28),inset 0 1px 0 rgba(255,255,255,.22)!important;
        }
        .hero-v2__mobile-analysis svg{width:22px!important;height:22px!important}
        .hero-v2{
          background:linear-gradient(155deg,rgba(16,75,128,.56),rgba(6,50,95,.42))!important;
          backdrop-filter:blur(6px) saturate(112%)!important;
          -webkit-backdrop-filter:blur(6px) saturate(112%)!important;
        }
        .smart-chip,.device-card,.chart-card,.v3-summary-card,.v3-score-card,.health-meter,.v3-info-card,.v3-preferences{
          background:linear-gradient(150deg,rgba(20,66,116,.72),rgba(7,42,82,.64))!important;
          backdrop-filter:blur(9px) saturate(112%)!important;
          -webkit-backdrop-filter:blur(9px) saturate(112%)!important;
          border-color:rgba(119,204,247,.34)!important;
          box-shadow:0 14px 30px rgba(0,20,49,.20),inset 0 1px 0 rgba(255,255,255,.08)!important;
        }

        /* Clearer compact-mode difference and shorter device cards. */
        .device-card{
          padding:16px 14px 15px!important;
          gap:10px!important;
        }
        .device-card header h2{font-size:1.42rem!important;line-height:1.12!important}
        .device-card header>strong{font-size:2.25rem!important}
        .device-card>.gauges{margin:0!important;gap:8px!important}
        .device-card>.gauges pool-gauge{max-width:148px!important;margin-inline:auto!important}
        .device-card>.linear{margin:0!important}
        .device-analysis-status{
          min-height:88px!important;
          padding:11px 12px!important;
        }
        .device-card>.chips{gap:9px!important}
        .device-card>.chips>div{
          min-height:84px!important;
          padding:12px 14px!important;
        }
        .device-card>.analysis-box{
          gap:9px!important;
          margin-top:2px!important;
          padding:0!important;
          overflow:hidden!important;
        }
        .device-card>.analysis-box>.last{
          min-height:72px!important;
          padding:11px 14px!important;
        }
        .device-card>.analysis-box>button{
          box-sizing:border-box!important;
          width:100%!important;
          max-width:100%!important;
          min-height:50px!important;
          height:50px!important;
          margin:0!important;
          border-radius:17px!important;
        }
        .app.pref-compact-mobile .device-card{padding:14px 12px 13px!important;gap:8px!important}
        .app.pref-compact-mobile .device-analysis-status{min-height:80px!important;padding:9px 11px!important}
        .app.pref-compact-mobile .device-card>.chips>div{min-height:76px!important;padding:10px 12px!important}
        .app.pref-compact-mobile .device-card>.analysis-box>.last{min-height:66px!important}
        .app.pref-compact-mobile .device-card>.analysis-box>button{height:48px!important;min-height:48px!important}

        /* Charts: stronger line, lighter fill, compact cards and readable tooltip. */
        .v3-charts{gap:13px!important;padding-bottom:8px!important}
        .chart-card{padding:15px 14px 14px!important;border-radius:24px!important}
        .spark{height:154px!important}
        .spark .line{stroke-width:4.4!important;filter:drop-shadow(0 0 5px rgba(128,208,255,.72))!important}
        .spark .area{opacity:.30!important}
        .spark-tip{font-size:.70rem!important;padding:7px 9px!important}
        .chart-source{display:none!important}

        /* Long page sections are denser without losing touch targets. */
        .v3-section{margin-top:15px!important}
        .v3-section__header{margin-bottom:10px!important}
        .v3-summary{gap:11px!important}
        .v3-summary-card{
          min-height:116px!important;
          padding:14px!important;
          grid-template-columns:58px 1fr!important;
          column-gap:11px!important;
        }
        .v3-summary-card .v3-mini-ring{width:56px!important;height:56px!important}
        .v3-summary-card>strong{font-size:1.82rem!important}
        .score-details{gap:9px!important}
        .score-details>div{min-height:74px!important;padding:10px 11px 15px!important}
        .health-grid{gap:10px!important}
        .health-meter{min-height:78px!important;padding:12px 14px!important}

        /* Information cards never inherit the height of the advice card. */
        .v3-info-grid{align-items:start!important;gap:12px!important}
        .v3-info-card{
          align-self:start!important;
          height:auto!important;
          min-height:0!important;
          padding:16px!important;
          border-radius:24px!important;
        }
        .v3-info-card>header{margin-bottom:12px!important;padding-bottom:11px!important}
        .v3-weather,.v3-history,.v3-comparison,.v3-preferences{min-height:0!important}
        .v3-advice .advice-copy:not(.open){max-height:82px!important}
        .v3-timeline>div{min-height:54px!important}
        .v3-comparison__row{min-height:62px!important}
        .v3-settings{gap:7px!important}
        .v3-setting{min-height:62px!important;padding:9px 10px!important}

        /* Avoid stale English integration states in the visual layer. */
        .device-analysis-status__copy strong{white-space:normal!important;line-height:1.2!important}
      }

      @media(max-width:420px){
        .app::before{background-position:16% top!important}
        .hero-v2{padding:22px 16px 20px!important}
        .hero-v2__metric{min-height:70px!important;padding:10px!important}
        .spark{height:146px!important}
        .v3-summary-card{min-height:110px!important}
      }

      /* =========================================================
         RC21 — regression fix: complete device cards and charts
         Desktop background and mobile layout intentionally unchanged.
         ========================================================= */
      @media(min-width:761px){
        /* Remove the legacy fixed 318/326 px ceiling that clipped the
           Bluetooth status, battery, last analysis and action button. */
        .devices{
          align-items:stretch!important;
          overflow:visible!important;
        }
        .device-card{
          height:auto!important;
          min-height:0!important;
          max-height:none!important;
          overflow:hidden!important;
          grid-template-areas:
            "header header header"
            "gauges gauges linear"
            "status status status"
            "chips chips analysis"
            "anomaly anomaly anomaly"!important;
          grid-template-rows:auto minmax(150px,auto) auto minmax(92px,auto) auto!important;
          grid-auto-rows:auto!important;
          align-content:start!important;
          padding-bottom:20px!important;
        }
        .device-card>header,
        .device-card>.gauges,
        .device-card>.linear,
        .device-card>.device-analysis-status,
        .device-card>.chips,
        .device-card>.analysis-box,
        .device-card>.anomaly{
          min-width:0!important;
          max-width:100%!important;
          box-sizing:border-box!important;
        }
        .device-card>.device-analysis-status{
          grid-area:status!important;
          width:100%!important;
          margin:0!important;
        }
        .device-card>.chips{
          grid-area:chips!important;
          align-self:stretch!important;
        }
        .device-card>.analysis-box{
          grid-area:analysis!important;
          align-self:stretch!important;
          height:auto!important;
          min-height:92px!important;
          overflow:hidden!important;
        }
        .device-card>.anomaly{
          grid-area:anomaly!important;
          position:static!important;
          margin:0!important;
        }
        /* Higher-specificity legacy compact/advanced rules must not reapply
           the clipped three-row geometry. */
        .app:not(.pref-advanced) .device-card{
          grid-template-areas:
            "header header header"
            "gauges gauges analysis"
            "status status analysis"
            "chips chips analysis"
            "anomaly anomaly anomaly"!important;
          grid-template-rows:auto minmax(150px,auto) auto minmax(92px,auto) auto!important;
          height:auto!important;
          min-height:0!important;
          max-height:none!important;
        }

        /* Restore the complete graph plot and footer. The former 214/238/252 px
           fixed heights were shorter than header + source + plot + footer. */
        .v3-charts{
          align-items:stretch!important;
          padding-bottom:18px!important;
          overflow:visible!important;
        }
        .v3-charts .chart-card,
        .app.pref-compact-mobile .v3-charts .chart-card{
          display:grid!important;
          grid-template-rows:auto auto minmax(158px,1fr) auto!important;
          row-gap:7px!important;
          height:auto!important;
          min-height:294px!important;
          max-height:none!important;
          padding:17px 18px 20px!important;
          overflow:hidden!important;
          box-sizing:border-box!important;
        }
        .v3-charts .chart-source{
          min-height:18px!important;
          margin:0!important;
          line-height:18px!important;
        }
        .v3-charts .spark-wrap{
          width:100%!important;
          height:164px!important;
          min-height:164px!important;
          margin:0!important;
          overflow:hidden!important;
          box-sizing:border-box!important;
        }
        .v3-charts .spark{
          display:block!important;
          width:100%!important;
          height:100%!important;
          min-height:164px!important;
          margin:0!important;
          overflow:visible!important;
        }
        .v3-charts .chart-card footer{
          position:relative!important;
          z-index:2!important;
          min-height:18px!important;
          margin:0!important;
          padding-top:2px!important;
          align-items:center!important;
          line-height:1.2!important;
        }
      }

      @media(min-width:1500px){
        .v3-charts .chart-card,
        .app.pref-compact-mobile .v3-charts .chart-card{min-height:306px!important}
        .v3-charts .spark-wrap,
        .v3-charts .spark{height:174px!important;min-height:174px!important}
      }

      @media(min-width:761px) and (max-width:1100px){
        .device-card{
          grid-template-areas:
            "header"
            "gauges"
            "linear"
            "status"
            "chips"
            "analysis"
            "anomaly"!important;
          grid-template-columns:minmax(0,1fr)!important;
          grid-template-rows:auto auto auto auto auto auto auto!important;
        }
        .device-card>.analysis-box{grid-column:auto!important}
        .v3-charts .chart-card,
        .app.pref-compact-mobile .v3-charts .chart-card{min-height:286px!important}
        .v3-charts .spark-wrap,
        .v3-charts .spark{height:156px!important;min-height:156px!important}
      }



      /* =========================================================
         RC22 — targeted desktop density + mobile glass refinement
         Hero, desktop background and the established palette are unchanged.
         ========================================================= */
      @media(min-width:761px){
        /* Device cards retain intrinsic height; only internal rhythm is reduced. */
        .devices{align-items:stretch!important;overflow:visible!important}
        .device-card,
        .app:not(.pref-advanced) .device-card{
          height:auto!important;
          min-height:0!important;
          max-height:none!important;
          row-gap:10px!important;
          padding:18px 19px!important;
          padding-bottom:18px!important;
          grid-template-rows:auto minmax(140px,auto) auto minmax(84px,auto) auto!important;
        }
        .device-card>.device-analysis-status{min-height:80px!important}
        .device-card>.analysis-box{min-height:84px!important}

        /* Charts stay in the requested 300–330 px range. The plot row absorbs
           all remaining space, so neither the SVG nor its footer is clipped. */
        .v3-charts{
          align-items:start!important;
          overflow:visible!important;
          padding-bottom:10px!important;
        }
        .v3-charts .chart-card,
        .app.pref-compact-mobile .v3-charts .chart-card{
          display:grid!important;
          grid-template-rows:auto auto minmax(0,1fr) auto!important;
          row-gap:6px!important;
          width:100%!important;
          height:clamp(300px,21vw,320px)!important;
          min-height:300px!important;
          max-height:320px!important;
          padding:16px 18px 16px!important;
          overflow:hidden!important;
          box-sizing:border-box!important;
        }
        .v3-charts .chart-source{
          min-height:16px!important;
          height:auto!important;
          margin:0!important;
          line-height:16px!important;
        }
        .v3-charts .spark-wrap{
          align-self:stretch!important;
          width:100%!important;
          height:auto!important;
          min-height:0!important;
          max-height:none!important;
          margin:0!important;
          padding:7px!important;
          overflow:hidden!important;
          box-sizing:border-box!important;
        }
        .v3-charts .spark{
          display:block!important;
          width:100%!important;
          height:100%!important;
          min-height:0!important;
          max-height:none!important;
          margin:0!important;
          overflow:visible!important;
        }
        .v3-charts .chart-card footer{
          min-height:16px!important;
          margin:0!important;
          padding-top:1px!important;
          line-height:1.15!important;
        }
        .v3-charts .chart-empty{
          height:auto!important;
          min-height:0!important;
          align-self:stretch!important;
        }

        /* The four useful-information cards share a compact baseline while
           preserving natural expansion for long advice content. */
        .v3-info-grid{
          align-items:start!important;
          grid-auto-rows:auto!important;
        }
        .v3-info-card:not(.v3-preferences){
          align-self:start!important;
          height:auto!important;
          min-height:276px!important;
          max-height:none!important;
        }
        .v3-weather,
        .v3-advice,
        .v3-history,
        .v3-comparison{
          min-height:276px!important;
        }
        .v3-preferences{
          height:auto!important;
          min-height:0!important;
        }
      }

      @media(min-width:1500px){
        .v3-charts .chart-card,
        .app.pref-compact-mobile .v3-charts .chart-card{
          height:320px!important;
          min-height:320px!important;
          max-height:320px!important;
        }
      }

      @media(min-width:761px) and (max-width:1100px){
        .v3-charts .chart-card,
        .app.pref-compact-mobile .v3-charts .chart-card{
          height:300px!important;
          min-height:300px!important;
          max-height:300px!important;
        }
      }

      @media(max-width:760px){
        /* Requested mobile glass opacity. */
        .device-card,
        .chart-card,
        .summary-card,
        .v3-summary-card,
        .score-details,
        .v3-score-grid,
        .health-card,
        .health-meter,
        .info-card,
        .v3-info-card,
        .preferences-card,
        .v3-preferences{
          background:linear-gradient(
            145deg,
            rgba(21,67,116,.76),
            rgba(8,42,83,.70)
          )!important;
          backdrop-filter:blur(14px) saturate(120%)!important;
          -webkit-backdrop-filter:blur(14px) saturate(120%)!important;
        }

        .device-status,
        .device-analysis-status,
        .device-footer-card,
        .device-card>.chips>div,
        .device-card>.analysis-box>.last,
        .score-detail-item,
        .score-details>div,
        .weather-detail,
        .v3-weather__stats>div{
          background:rgba(7,42,82,.72)!important;
        }

        /* Bluetooth/analysis status follows exactly the same vertical rhythm
           as battery, Bluetooth and last-analysis panels. */
        .device-card{row-gap:12px!important}
        .device-card>.device-analysis-status,
        .device-card>.chips,
        .device-card>.analysis-box{
          margin:0!important;
        }
        .device-card>.device-analysis-status{
          min-height:84px!important;
          padding:12px 14px!important;
        }
        .app.pref-compact-mobile .device-card{row-gap:10px!important}
        .app.pref-compact-mobile .device-card>.device-analysis-status{
          min-height:78px!important;
          padding:10px 12px!important;
        }
      }

      /* =========================================================
         RC23 — final targeted desktop and mobile density
         Hero, background, palette and established glass opacity unchanged.
         ========================================================= */
      @media(min-width:1101px){
        /* Remove the residual empty grid space without fixing card height. */
        .device-card,
        .app:not(.pref-advanced) .device-card{
          height:auto!important;
          min-height:0!important;
          max-height:none!important;
          grid-template-rows:auto minmax(112px,auto) auto minmax(74px,auto) auto!important;
          row-gap:8px!important;
          padding:16px 18px!important;
        }
        .device-card>.gauges{margin:-12px 0 -6px!important}
        .device-card>.device-analysis-status{
          min-height:68px!important;
          padding:10px 12px!important;
        }
        .device-card>.chips>div,
        .device-card>.analysis-box{
          min-height:74px!important;
        }

        /* A stable 310 px card leaves the complete remaining area to the SVG. */
        .v3-charts .chart-card,
        .app.pref-compact-mobile .v3-charts .chart-card{
          grid-template-rows:auto minmax(0,1fr) auto!important;
          height:310px!important;
          min-height:310px!important;
          max-height:310px!important;
        }
        .v3-charts .spark-wrap,
        .v3-charts .spark{
          width:100%!important;
          height:100%!important;
          min-height:0!important;
          max-height:none!important;
        }

        /* The four primary information cards share a 300 px baseline. */
        .v3-info-card:not(.v3-preferences){
          box-sizing:border-box!important;
          height:300px!important;
          min-height:300px!important;
          max-height:300px!important;
        }
        .v3-advice:has(.advice-copy.open){
          height:auto!important;
          min-height:300px!important;
          max-height:none!important;
        }
      }

      @media(min-width:761px) and (max-width:1100px){
        .device-card{
          row-gap:8px!important;
          padding:16px 18px!important;
        }
        .device-card>.device-analysis-status{min-height:68px!important}
        .device-card>.chips>div,
        .device-card>.analysis-box{min-height:74px!important}
        .v3-charts .chart-card,
        .app.pref-compact-mobile .v3-charts .chart-card{
          grid-template-rows:auto minmax(0,1fr) auto!important;
          height:292px!important;
          min-height:292px!important;
          max-height:292px!important;
        }
        .v3-charts .spark-wrap,
        .v3-charts .spark{
          width:100%!important;
          height:100%!important;
          min-height:0!important;
          max-height:none!important;
        }
        .v3-info-card:not(.v3-preferences){
          height:300px!important;
          min-height:300px!important;
          max-height:300px!important;
        }
        .v3-advice:has(.advice-copy.open){
          height:auto!important;
          min-height:300px!important;
          max-height:none!important;
        }
      }

      @media(max-width:760px){
        /* Long technical values, especially conductivity, remain contained. */
        .device-card>.linear{
          min-width:0!important;
          width:100%!important;
          max-width:100%!important;
          overflow:hidden!important;
        }
        .device-card>.linear>div{
          display:grid!important;
          grid-template-columns:minmax(0,1fr) minmax(0,60%)!important;
          align-items:end!important;
          gap:8px!important;
          min-width:0!important;
        }
        .device-card>.linear>div>span,
        .device-card>.linear>div>strong{min-width:0!important}
        .device-card>.linear>div>strong{
          width:auto!important;
          max-width:100%!important;
          font-size:clamp(.78rem,3.8vw,.98rem)!important;
          line-height:1.15!important;
          text-align:right!important;
          white-space:normal!important;
          overflow-wrap:anywhere!important;
        }

        /* Shorter chart cards retain a genuine 118 px plot viewport. */
        .v3-charts .chart-card,
        .app.pref-compact-mobile .v3-charts .chart-card{
          display:grid!important;
          grid-template-rows:auto minmax(118px,1fr) auto!important;
          row-gap:6px!important;
          height:214px!important;
          min-height:214px!important;
          max-height:214px!important;
          padding:14px!important;
          overflow:hidden!important;
        }
        .v3-charts .chart-source{display:none!important}
        .v3-charts .spark-wrap{
          width:100%!important;
          height:118px!important;
          min-height:118px!important;
          max-height:118px!important;
          margin:0!important;
        }
        .v3-charts .spark{
          width:100%!important;
          height:100%!important;
          min-height:0!important;
          max-height:none!important;
          margin:0!important;
        }
        .v3-charts .chart-card footer{
          min-height:16px!important;
          margin:0!important;
          padding-top:0!important;
        }

        /* Score and health retain every label and progress bar with less void. */
        .v3-score-grid{gap:9px!important;padding:10px!important}
        .v3-score-card{
          box-sizing:border-box!important;
          height:auto!important;
          min-height:145px!important;
          max-height:none!important;
          padding:14px 15px!important;
          align-content:start!important;
        }
        .v3-score-card>.v3-progress{margin-top:12px!important}
        .v3-health-card{
          min-height:92px!important;
          padding:14px 16px!important;
        }

        /* Keep the last action clear of browser navigation and safe areas. */
        .device-card{
          padding-bottom:calc(24px + env(safe-area-inset-bottom,0px))!important;
        }
        .device-card>.analysis-box>button{margin-bottom:8px!important}
      }

      @media(max-width:420px){
        .v3-charts .chart-card,
        .app.pref-compact-mobile .v3-charts .chart-card{
          grid-template-rows:auto minmax(110px,1fr) auto!important;
          height:204px!important;
          min-height:204px!important;
          max-height:204px!important;
        }
        .v3-charts .spark-wrap{
          height:110px!important;
          min-height:110px!important;
          max-height:110px!important;
        }
        .v3-score-card{min-height:140px!important}
        .v3-health-card{min-height:88px!important}
        .device-card>.linear>div>strong{
          font-size:clamp(.72rem,3.7vw,.90rem)!important;
        }
      }

      /* =========================================================
         RC24 — verified pool treatment profile and dosage assistant
         ========================================================= */
      .rc24-treatment-section{scroll-margin-top:20px!important}
      .rc24-treatment-grid{
        display:grid!important;
        grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;
        gap:16px!important;
        align-items:start!important;
      }
      .rc24-treatment-section .v3-info-card{
        box-sizing:border-box!important;
        width:100%!important;
        height:auto!important;
        min-height:0!important;
        max-height:none!important;
        padding:18px!important;
        overflow:visible!important;
      }
      .rc24-treatment-section .v3-info-card>header{
        display:flex!important;
        align-items:center!important;
        gap:10px!important;
        margin-bottom:16px!important;
      }
      .rc24-treatment-section .v3-info-card>header h3{flex:1!important}
      .rc24-verified,.rc24-confidence{
        flex:0 0 auto!important;
        padding:5px 9px!important;
        border-radius:999px!important;
        color:#bfeaff!important;
        background:rgba(61,147,207,.18)!important;
        border:1px solid rgba(104,205,244,.22)!important;
        font-size:.62rem!important;
        line-height:1!important;
      }
      .rc24-confidence.is-high{color:#a8efc5!important;background:rgba(68,188,119,.14)!important;border-color:rgba(101,226,153,.24)!important}
      .rc24-confidence.is-medium{color:#ffe09d!important;background:rgba(224,157,54,.14)!important;border-color:rgba(255,188,76,.24)!important}
      .rc24-confidence.is-pending{color:#c6d9ea!important}
      .rc24-form-grid{
        display:grid!important;
        grid-template-columns:repeat(2,minmax(0,1fr))!important;
        gap:12px!important;
      }
      .rc24-form-grid label{display:grid!important;gap:6px!important;min-width:0!important}
      .rc24-form-grid label>span{color:#a9c3d6!important;font-size:.67rem!important;font-weight:750!important}
      .rc24-form-grid .rc24-wide{grid-column:1/-1!important}
      .rc24-form-grid input,.rc24-form-grid select{
        appearance:none!important;
        -webkit-appearance:none!important;
        width:100%!important;
        min-width:0!important;
        height:42px!important;
        padding:0 11px!important;
        border-radius:12px!important;
        border:1px solid rgba(108,202,239,.22)!important;
        outline:none!important;
        color:#f6fbff!important;
        background:rgba(5,39,78,.48)!important;
        font:inherit!important;
        font-size:.78rem!important;
        font-weight:700!important;
      }
      .rc24-form-grid select{
        padding-right:31px!important;
        background-image:linear-gradient(45deg,transparent 50%,#9ad9f3 50%),linear-gradient(135deg,#9ad9f3 50%,transparent 50%)!important;
        background-position:calc(100% - 17px) 18px,calc(100% - 12px) 18px!important;
        background-size:5px 5px,5px 5px!important;
        background-repeat:no-repeat!important;
      }
      .rc24-form-grid input:focus,.rc24-form-grid select:focus{border-color:rgba(103,216,255,.76)!important;box-shadow:0 0 0 3px rgba(67,174,226,.13)!important}
      .rc24-input-unit{position:relative!important;min-width:0!important}
      .rc24-input-unit input{padding-right:51px!important}
      .rc24-input-unit em{
        position:absolute!important;
        right:10px!important;
        top:50%!important;
        transform:translateY(-50%)!important;
        color:#9fc9df!important;
        font-size:.68rem!important;
        font-style:normal!important;
        pointer-events:none!important;
      }
      .rc24-products{
        margin-top:14px!important;
        padding:0 12px 12px!important;
        border-radius:14px!important;
        border:1px solid rgba(102,196,235,.17)!important;
        background:rgba(4,34,70,.28)!important;
      }
      .rc24-products summary{
        padding:12px 0!important;
        color:#d9effa!important;
        cursor:pointer!important;
        font-size:.72rem!important;
        font-weight:800!important;
      }
      .rc24-products>small{display:block!important;margin-top:10px!important;color:#90aec2!important;font-size:.61rem!important;line-height:1.4!important}
      .rc24-profile-note{
        margin:13px 0 0!important;
        padding:10px 12px!important;
        border-radius:12px!important;
        color:#b9d5e5!important;
        background:rgba(65,142,195,.10)!important;
        border:1px solid rgba(102,191,231,.13)!important;
        font-size:.65rem!important;
        line-height:1.45!important;
      }
      .rc24-dose-summary{
        display:grid!important;
        gap:4px!important;
        margin-bottom:13px!important;
        padding:13px 14px!important;
        border-radius:14px!important;
        background:linear-gradient(135deg,rgba(49,145,216,.20),rgba(75,201,158,.12))!important;
        border:1px solid rgba(112,213,241,.19)!important;
      }
      .rc24-dose-summary strong{color:#f4fbff!important;font-size:.94rem!important}
      .rc24-dose-summary small{color:#a9c7da!important;font-size:.64rem!important}
      .rc24-advice-rows{display:grid!important;gap:8px!important}
      .rc24-advice-row{
        display:grid!important;
        grid-template-columns:38px minmax(0,1fr)!important;
        align-items:start!important;
        gap:10px!important;
        padding:11px 12px!important;
        border-radius:13px!important;
        border:1px solid rgba(111,195,232,.14)!important;
        background:rgba(4,34,70,.31)!important;
      }
      .rc24-advice-row>i{
        display:grid!important;
        place-items:center!important;
        width:36px!important;
        height:36px!important;
        border-radius:11px!important;
        color:#c5eaff!important;
        background:rgba(69,150,213,.20)!important;
        font-size:.68rem!important;
        font-style:normal!important;
        font-weight:900!important;
      }
      .rc24-advice-row b{display:block!important;color:#f3faff!important;font-size:.75rem!important;line-height:1.25!important}
      .rc24-advice-row small{display:block!important;margin-top:4px!important;color:#a4bfd1!important;font-size:.64rem!important;line-height:1.42!important}
      .rc24-advice-row.is-good{border-color:rgba(94,218,148,.20)!important;background:rgba(44,150,91,.10)!important}
      .rc24-advice-row.is-good>i{color:#b5f3cf!important;background:rgba(68,191,119,.19)!important}
      .rc24-advice-row.is-warning{border-color:rgba(255,184,72,.22)!important;background:rgba(187,119,28,.11)!important}
      .rc24-advice-row.is-warning>i{color:#ffe2a8!important;background:rgba(226,153,47,.19)!important}
      .rc24-advice-row.is-critical,.rc24-advice-row.is-blocked{border-color:rgba(255,105,103,.25)!important;background:rgba(181,57,65,.12)!important}
      .rc24-advice-row.is-critical>i,.rc24-advice-row.is-blocked>i{color:#ffd0d0!important;background:rgba(218,75,82,.19)!important}
      .rc24-actions{display:flex!important;flex-wrap:wrap!important;gap:8px!important;margin-top:13px!important}
      .rc24-action{
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        gap:7px!important;
        min-height:40px!important;
        padding:9px 13px!important;
        border:1px solid rgba(107,210,244,.28)!important;
        border-radius:12px!important;
        color:#fff!important;
        background:linear-gradient(135deg,#238fda,#4e75ef)!important;
        box-shadow:0 9px 20px rgba(20,85,161,.18)!important;
        cursor:pointer!important;
        font:inherit!important;
        font-size:.69rem!important;
        font-weight:850!important;
      }
      .rc24-action.is-critical{background:linear-gradient(135deg,#d45d58,#e48647)!important;border-color:rgba(255,185,118,.30)!important}
      .rc24-action:focus-visible{outline:2px solid #9fe6ff!important;outline-offset:2px!important}
      .rc24-no-action{color:#91adbf!important;font-size:.65rem!important}
      .rc24-history{
        display:flex!important;
        align-items:center!important;
        justify-content:space-between!important;
        gap:12px!important;
        margin-top:13px!important;
        padding-top:11px!important;
        border-top:1px solid rgba(150,207,235,.13)!important;
      }
      .rc24-history span{min-width:0!important}
      .rc24-history b,.rc24-history small{display:block!important}
      .rc24-history b{color:#dceef7!important;font-size:.66rem!important}
      .rc24-history small{margin-top:3px!important;color:#91afc2!important;font-size:.61rem!important;overflow-wrap:anywhere!important}
      .rc24-history button{
        flex:0 0 auto!important;
        padding:6px 9px!important;
        border-radius:9px!important;
        border:1px solid rgba(154,208,235,.18)!important;
        color:#c7dce8!important;
        background:rgba(7,42,82,.46)!important;
        cursor:pointer!important;
        font:inherit!important;
        font-size:.61rem!important;
      }
      .rc24-smart-dose{
        display:grid!important;
        gap:3px!important;
        margin-top:10px!important;
        padding:10px 11px!important;
        border-radius:12px!important;
        background:rgba(52,145,205,.12)!important;
        border:1px solid rgba(102,199,236,.16)!important;
      }
      .rc24-smart-dose b{color:#eaf8ff!important;font-size:.69rem!important}
      .rc24-smart-dose small{color:#a1bed0!important;font-size:.60rem!important}
      .rc24-smart-dose button{
        justify-self:start!important;
        margin-top:5px!important;
        padding:6px 9px!important;
        border-radius:9px!important;
        border:1px solid rgba(111,207,244,.22)!important;
        color:#dff6ff!important;
        background:rgba(42,129,190,.26)!important;
        cursor:pointer!important;
        font:inherit!important;
        font-size:.62rem!important;
        font-weight:800!important;
      }
      @media(max-width:1100px){.rc24-treatment-grid{grid-template-columns:1fr!important}}
      @media(max-width:760px){
        .rc24-treatment-grid{gap:12px!important}
        .rc24-treatment-section .v3-info-card{padding:15px!important;border-radius:23px!important}
        .rc24-form-grid{grid-template-columns:1fr!important;gap:10px!important}
        .rc24-form-grid .rc24-wide{grid-column:auto!important}
        .rc24-form-grid input,.rc24-form-grid select{height:46px!important;font-size:.82rem!important}
        .rc24-advice-row{grid-template-columns:36px minmax(0,1fr)!important;padding:11px!important}
        .rc24-actions{display:grid!important;grid-template-columns:1fr!important}
        .rc24-action{width:100%!important;min-height:46px!important}
      }

      /* RC26 — vigilances météo, filtration raisonnée et carnet d’entretien */
      .rc26-weather-banner{position:relative;z-index:25;display:grid;grid-template-columns:auto minmax(0,1fr) auto auto;align-items:center;gap:12px;margin:0 0 14px;padding:12px 16px;border:1px solid rgba(255,255,255,.38);border-radius:18px;color:#fff;box-shadow:0 14px 30px rgba(10,40,80,.22)}
      .rc26-weather-banner.is-yellow{color:#392d00;background:linear-gradient(135deg,#ffe174,#f7bc35)}
      .rc26-weather-banner.is-orange{background:linear-gradient(135deg,#f59c32,#e76824)}
      .rc26-weather-banner.is-red{background:linear-gradient(135deg,#e34848,#a81732)}
      .rc26-weather-banner.is-sticky{position:sticky;top:6px}
      .rc26-weather-banner__level{padding:7px 10px;border-radius:10px;background:rgba(0,0,0,.17);font-weight:900;text-transform:uppercase;letter-spacing:.04em}
      .rc26-weather-banner>span:nth-child(2){display:flex;flex-direction:column;gap:2px}.rc26-weather-banner small{opacity:.8}
      .rc26-weather-banner button,.rc26-weather-banner a{width:auto!important;min-height:38px!important;margin:0!important;padding:8px 12px!important;border:1px solid rgba(255,255,255,.34)!important;border-radius:11px!important;color:inherit!important;background:rgba(0,0,0,.16)!important;box-shadow:none!important;font:inherit!important;font-size:.72rem!important;font-weight:850!important;text-decoration:none!important;white-space:nowrap}
      .rc26-weather-banner button:before{display:none!important}
      .rc26-weather-alert{margin-top:14px;padding-top:12px;border-top:1px solid rgba(140,198,242,.18)}
      .rc26-weather-alert summary,.rc26-maintenance-details summary,.rc26-action-log summary{display:flex;align-items:center;justify-content:space-between;gap:10px;cursor:pointer;font-weight:850;list-style:none}.rc26-weather-alert summary::-webkit-details-marker,.rc26-maintenance-details summary::-webkit-details-marker,.rc26-action-log summary::-webkit-details-marker{display:none}
      .rc26-weather-alert summary b{padding:5px 8px;border-radius:999px;background:rgba(43,127,202,.16);font-size:.68rem}.rc26-weather-alert.is-yellow summary b{color:#806000;background:rgba(251,196,55,.22)}.rc26-weather-alert.is-orange summary b{color:#b74d13;background:rgba(244,126,40,.18)}.rc26-weather-alert.is-red summary b{color:#c0263b;background:rgba(225,62,73,.16)}
      .rc26-weather-alert__body{display:grid;gap:9px;padding-top:12px}.rc26-weather-alert__body p{display:grid;gap:3px;margin:0;font-size:.75rem;line-height:1.42}.rc26-weather-alert__body small{font-size:.65rem;opacity:.66}.rc26-weather-alert__body a{color:#a9dcff;font-size:.7rem;font-weight:850;text-decoration:none}
      .rc26-alert-chips{display:flex;flex-wrap:wrap;gap:6px}.rc26-alert-chips span{padding:5px 8px;border-radius:999px;background:rgba(59,140,210,.16);font-size:.66rem;font-weight:850}
      #rc26-weather-card{scroll-margin-top:86px;transition:box-shadow .3s ease,transform .3s ease}#rc26-weather-card.rc26-weather-highlight{box-shadow:0 0 0 3px rgba(255,191,64,.9),0 18px 45px rgba(255,158,46,.28)!important;transform:translateY(-2px)}
      .rc26-alert-setting{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(125px,44%)!important;align-items:center!important;cursor:default!important}.rc26-alert-setting select{color-scheme:dark;width:100%;height:38px;border:1px solid rgba(126,191,240,.25);border-radius:11px;padding:0 8px;color:#eaf8ff;background:rgba(8,56,105,.48);font:inherit;font-size:.68rem;font-weight:750}.rc26-alert-setting option{color:#eefaff;background:#123966}
      .rc26-maintenance-details,.rc26-action-log{margin-top:12px;padding:12px;border:1px solid rgba(111,207,244,.18);border-radius:15px;background:rgba(7,44,92,.18)}.rc26-maintenance-details[open] summary,.rc26-action-log[open] summary{margin-bottom:10px}.rc26-maintenance-details summary,.rc26-action-log summary{font-size:.74rem}.rc26-action-log ol{display:grid;gap:7px;margin:0;padding:0;list-style:none}.rc26-action-log li{display:grid;grid-template-columns:105px minmax(0,1fr);gap:8px;font-size:.68rem}.rc26-action-log time{opacity:.64}.rc26-action-log span{font-weight:750}
      @media(max-width:760px){
        .rc26-weather-banner{grid-template-columns:1fr auto;gap:7px;padding:11px 12px;border-radius:15px}.rc26-weather-banner__level{justify-self:start}.rc26-weather-banner>span:nth-child(2){grid-column:1/-1;grid-row:2}.rc26-weather-banner button,.rc26-weather-banner a{font-size:.62rem!important;padding:7px 8px!important}.rc26-weather-banner button{grid-column:1}.rc26-weather-banner a{grid-column:2}.rc26-alert-setting{grid-template-columns:1fr!important;gap:8px!important}.rc26-alert-setting select{height:42px}.rc26-action-log li{grid-template-columns:86px minmax(0,1fr)}
      }

      /* RC26.1 — useful-information cards expand when vigilance details open. */
      @media(min-width:761px){
        .v3-info-grid{align-items:start!important;grid-auto-rows:auto!important}
        .v3-info-card:not(.v3-preferences){
          align-self:start!important;
          height:auto!important;
          min-height:300px!important;
          max-height:none!important;
        }
      }

      /* RC26.2 — persistent treatment form, reset control and stable action history. */
      .rc24-history{
        width:100%!important;
        min-width:0!important;
        flex-wrap:nowrap!important;
      }
      .rc24-history>span{
        flex:1 1 auto!important;
        width:auto!important;
        min-width:0!important;
      }
      .rc24-history small{
        overflow-wrap:break-word!important;
        word-break:normal!important;
      }
      .rc24-history>button{
        flex:0 0 auto!important;
        width:auto!important;
        min-width:max-content!important;
        min-height:32px!important;
        margin:0!important;
        align-self:center!important;
      }
      .rc26-profile-tools{
        display:flex!important;
        align-items:center!important;
        justify-content:space-between!important;
        gap:12px!important;
        margin-top:12px!important;
      }
      .rc26-profile-tools small{
        color:#91afc2!important;
        font-size:.62rem!important;
        line-height:1.4!important;
      }
      .rc26-profile-tools button{
        flex:0 0 auto!important;
        width:auto!important;
        min-height:36px!important;
        margin:0!important;
        padding:7px 11px!important;
        border:1px solid rgba(255,151,151,.26)!important;
        border-radius:10px!important;
        color:#ffd4d4!important;
        background:rgba(145,48,63,.20)!important;
        box-shadow:none!important;
        font:inherit!important;
        font-size:.63rem!important;
        font-weight:800!important;
      }
      .rc26-profile-tools button:before{display:none!important}
      @media(max-width:760px){
        .rc26-profile-tools{align-items:stretch!important;flex-direction:column!important}
        .rc26-profile-tools button{width:100%!important;min-height:42px!important}
      }

      /* RC27 — action centre, permanent scheduler, equipment controls and camera. */
      .rc27-operations{scroll-margin-top:18px!important}
      .rc27-operations>.v3-section__header{grid-template-columns:auto minmax(0,1fr) auto!important}
      .rc27-backend{align-self:center;padding:6px 10px;border-radius:999px;font-size:.66rem;white-space:nowrap}
      .rc27-backend.is-ready{color:#baf3ce;background:rgba(49,167,101,.18);border:1px solid rgba(91,222,145,.24)}
      .rc27-backend.is-offline{color:#ffe09d;background:rgba(201,133,35,.18);border:1px solid rgba(255,191,72,.24)}
      .rc27-backend.is-satellite{color:#c8e7ff;background:rgba(59,126,190,.20);border:1px solid rgba(108,202,239,.26)}.rc30-coordination{display:grid;gap:12px;margin:14px 0;padding:14px;border:1px solid rgba(111,207,244,.22);border-radius:16px;background:linear-gradient(135deg,rgba(14,67,119,.72),rgba(16,86,133,.42))}.rc30-coordination.is-satellite{border-color:rgba(135,185,232,.26);background:linear-gradient(135deg,rgba(23,58,102,.76),rgba(26,71,113,.50))}.rc30-coordination__head{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:12px;align-items:center}.rc30-coordination__head>span{font-size:1.45rem}.rc30-coordination__head>div{display:grid;gap:2px}.rc30-coordination__head small{font-size:.58rem;opacity:.72}.rc30-coordination__head b{font-size:.78rem}.rc30-coordination__head em{font-style:normal;font-size:.62rem;opacity:.78;line-height:1.4}.rc30-coordination__head strong{font-size:.55rem;letter-spacing:.08em;padding:6px 9px;border-radius:999px;color:#baf3ce;background:rgba(49,167,101,.18);border:1px solid rgba(91,222,145,.24)}.rc30-coordination.is-satellite .rc30-coordination__head strong{color:#c8e7ff;background:rgba(59,126,190,.20);border-color:rgba(108,202,239,.26)}.rc30-coordination p,.rc30-satellite-note{margin:0;padding:9px 10px;border-radius:10px;background:rgba(8,43,80,.28);color:#b9d3e5;font-size:.61rem;line-height:1.45}.is-satellite-locked{opacity:.88}.is-satellite-locked input:disabled,.is-satellite-locked button:disabled{cursor:not-allowed;opacity:.56}.rc27-control-buttons button:disabled,.rc27-boost button:disabled,.rc282-extension button:disabled{cursor:not-allowed!important;opacity:.48!important;filter:saturate(.6)}@media(max-width:760px){.rc30-coordination__head{grid-template-columns:auto minmax(0,1fr)}.rc30-coordination__head strong{grid-column:2;justify-self:start}}
      .rc27-today-title{margin:0 0 9px;color:#eaf8ff;font-size:.76rem;text-transform:uppercase;letter-spacing:.025em}
      .rc27-today{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-bottom:14px}
      .rc27-today article{display:grid;grid-template-columns:42px minmax(0,1fr) auto;align-items:center;gap:11px;min-height:92px;padding:13px 14px;border:1px solid rgba(107,196,236,.18);border-radius:18px;background:rgba(9,53,100,.53);box-shadow:0 12px 28px rgba(10,49,93,.13)}
      .rc27-today article>i{display:grid;place-items:center;width:40px;height:40px;border-radius:13px;color:#d9f4ff;background:rgba(70,154,214,.22);font-style:normal;font-weight:900}
      .rc27-today article>span{display:grid;gap:2px;min-width:0}.rc27-today small{color:#8faec3;font-size:.59rem;text-transform:uppercase;letter-spacing:.04em}.rc27-today b{color:#f3fbff;font-size:.76rem}.rc27-today em{color:#a9c4d5;font-size:.62rem;font-style:normal;line-height:1.4}
      .rc27-today article.is-critical{border-color:rgba(255,112,105,.27);background:rgba(137,47,58,.30)}.rc27-today article.is-warning{border-color:rgba(255,187,71,.25)}.rc27-today article.is-good{border-color:rgba(86,219,144,.23)}
      .rc27-today button,.rc27-maintenance-grid button,.rc27-log-tools button,.rc27-test-notify{width:auto!important;min-height:34px!important;margin:0!important;padding:7px 10px!important;border:1px solid rgba(119,209,244,.22)!important;border-radius:10px!important;color:#e6f7ff!important;background:rgba(38,125,190,.27)!important;box-shadow:none!important;font:inherit!important;font-size:.62rem!important;font-weight:850!important}.rc27-today button:before,.rc27-maintenance-grid button:before,.rc27-log-tools button:before,.rc27-test-notify:before{display:none!important}
      .rc27-control-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;align-items:start}
      .rc27-camera{grid-column:auto;align-self:start}
      .rc27-control-grid>.v3-info-card{box-sizing:border-box!important;width:100%!important;height:auto!important;min-height:300px!important;max-height:none!important;padding:17px!important;overflow:hidden!important}
      .rc27-control-grid>.v3-info-card>header{display:flex;align-items:center;gap:10px;margin-bottom:14px}.rc27-control-grid>.v3-info-card>header>span{display:grid;place-items:center;width:36px;height:36px;border-radius:12px;background:linear-gradient(135deg,rgba(71,151,223,.55),rgba(83,104,225,.72))}.rc27-control-grid>.v3-info-card>header h3{flex:1}.rc27-control-grid>.v3-info-card>header b{padding:5px 8px;border-radius:999px;color:#b7d4e6;background:rgba(47,122,186,.18);font-size:.62rem}.rc27-control-grid>.is-on>header b{color:#adf0c8;background:rgba(52,174,104,.17)}
      .rc27-equipment-main{display:grid;gap:5px;padding:13px;border-radius:14px;background:rgba(8,47,91,.35);border:1px solid rgba(113,196,233,.13)}.rc27-equipment-main strong{font-size:1.45rem;color:#f5fbff}.rc27-equipment-main>em{color:#b8d7e8;font-size:.62rem;font-style:normal;font-weight:750}.rc27-equipment-main small{min-height:34px;color:#9eb9ca;font-size:.65rem;line-height:1.4}
      .rc27-control-buttons{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:12px}.rc27-control-buttons button{width:100%!important;min-height:44px!important;margin:0!important;border:1px solid rgba(104,216,246,.28)!important;border-radius:13px!important;color:#fff!important;background:linear-gradient(135deg,#2497df,#5274ee)!important;box-shadow:0 8px 18px rgba(19,88,162,.18)!important;font:inherit!important;font-size:.69rem!important;font-weight:850!important}.rc27-control-buttons button.is-stop{background:rgba(82,70,95,.36)!important;border-color:rgba(255,158,158,.22)!important;color:#ffd5d5!important}.rc27-control-buttons button:before{display:none!important}
      .rc27-boost{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:12px}.rc27-boost>span{margin-right:auto;color:#9fbaca;font-size:.63rem;font-weight:750}.rc27-boost button{width:auto!important;min-width:40px!important;min-height:32px!important;margin:0!important;padding:5px 8px!important;border:1px solid rgba(110,203,239,.19)!important;border-radius:9px!important;color:#d9f3ff!important;background:rgba(42,125,189,.22)!important;box-shadow:none!important;font:inherit!important;font-size:.61rem!important;font-weight:800!important}.rc27-boost button:before{display:none!important}
      .rc27-schedule-balance{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}.rc27-schedule-balance>span{display:grid;gap:2px;padding:9px;border-radius:11px;background:rgba(8,44,85,.30);color:#91adbf;font-size:.58rem}.rc27-schedule-balance b{color:#eaf8ff;font-size:.76rem}.rc27-schedule-balance>em{grid-column:1/-1;color:#a9efc5;font-size:.62rem;font-style:normal}.rc27-schedule-balance>em.is-short{color:#ffd28a}
      .rc27-light-timer{display:flex;justify-content:space-between;gap:10px;margin-top:14px;padding-top:12px;border-top:1px solid rgba(137,200,231,.14);color:#96b2c4;font-size:.64rem}.rc27-light-timer b{color:#e7f6ff}
      .rc27-camera-view{position:relative!important;display:block!important;width:100%!important;min-height:220px!important;margin:0!important;padding:0!important;overflow:hidden!important;border:1px solid rgba(115,203,238,.21)!important;border-radius:16px!important;background:rgba(5,37,77,.40)!important;box-shadow:none!important}.rc27-camera-view:before{display:none!important}.rc27-camera-view img{display:block;width:100%;height:220px;object-fit:cover}.rc27-camera-view span{position:absolute;left:10px;bottom:10px;padding:6px 9px;border-radius:9px;color:#fff;background:rgba(3,29,62,.72);font-size:.62rem;font-weight:850}.rc27-camera-empty{display:grid;place-items:center;align-content:center;gap:10px;min-height:220px;padding:20px;border:1px dashed rgba(127,198,230,.22);border-radius:16px;color:#9db8c8;text-align:center}.rc27-camera-empty>span{font-size:2rem}.rc27-camera-empty p{max-width:250px;font-size:.68rem;line-height:1.45}.rc27-camera-view,.rc27-camera-empty{height:auto!important;min-height:0!important;aspect-ratio:16/9!important}.rc27-camera-view img{width:100%!important;height:100%!important;aspect-ratio:16/9!important;object-fit:cover!important}
      .rc27-insights{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:14px}.rc27-insights article{display:grid;grid-template-columns:38px minmax(0,1fr);gap:10px;align-items:center;padding:13px;border-radius:16px;border:1px solid rgba(107,196,236,.16);background:rgba(8,48,94,.45)}.rc27-insights article>span{display:grid;place-items:center;width:36px;height:36px;border-radius:11px;background:rgba(58,143,207,.18)}.rc27-insights article>div{display:grid;gap:2px}.rc27-insights small{color:#8faec2;font-size:.58rem;text-transform:uppercase}.rc27-insights b{color:#edf9ff;font-size:.73rem}.rc27-insights em{color:#9fbbcc;font-size:.61rem;font-style:normal;line-height:1.35}
      .rc27-settings,.rc27-maintenance{margin-top:14px;padding:13px 15px;border:1px solid rgba(109,201,238,.18);border-radius:17px;background:rgba(6,42,84,.33)}.rc27-settings>summary,.rc27-maintenance>summary{cursor:pointer;color:#e7f6ff;font-size:.74rem;font-weight:850;list-style:none}.rc27-settings>summary::-webkit-details-marker,.rc27-maintenance>summary::-webkit-details-marker{display:none}.rc27-settings[open]>summary,.rc27-maintenance[open]>summary{margin-bottom:15px}.rc27-settings>p{margin:13px 0 0;color:#91afc2;font-size:.62rem;line-height:1.5}
      .rc27-schedule-editor{padding:14px;border-radius:15px;background:rgba(5,35,73,.34);border:1px solid rgba(103,190,229,.13)}.rc27-schedule-editor+.rc27-schedule-editor{margin-top:12px}.rc27-schedule-editor h4{margin:0 0 12px;color:#eefaff;font-size:.78rem}
      .rc30-pac-config{margin-top:12px;border-color:rgba(102,207,241,.24);background:linear-gradient(135deg,rgba(10,53,101,.50),rgba(18,68,116,.35))}.rc30-pac-config h5{margin:16px 0 0;color:#cdeeff;font-size:.66rem;text-transform:uppercase;letter-spacing:.04em}.rc30-pac-config-note{margin:0;color:#9fbed0;font-size:.63rem;line-height:1.5}.rc30-pac-gauge{--pac-accent:#50d890;display:grid;place-items:center;gap:8px;margin:10px auto 12px}.rc30-pac-gauge--off{--pac-accent:#8193aa}.rc30-pac-gauge--cooling{--pac-accent:#54b9ff}.rc30-pac-gauge--fault{--pac-accent:#ff6b72}.rc30-pac-gauge--idle{--pac-accent:#65c7de}.rc30-pac-gauge__ring{width:min(230px,76%);aspect-ratio:1;border-radius:50%;display:grid;place-items:center;background:conic-gradient(from 220deg,var(--pac-accent) 0 var(--pac-progress),rgba(233,246,255,.12) var(--pac-progress) 77.8%,transparent 77.8% 100%);position:relative;filter:drop-shadow(0 10px 24px rgba(0,0,0,.14));touch-action:none;cursor:grab;user-select:none;outline:none}.rc30-pac-gauge__ring:focus-visible{box-shadow:0 0 0 3px rgba(96,190,255,.34)}.rc30-pac-gauge__ring.is-dragging{cursor:grabbing}.rc30-pac-gauge__ring:after{content:"";position:absolute;inset:14px;border-radius:50%;background:linear-gradient(145deg,rgba(22,67,118,.96),rgba(16,54,100,.92));border:1px solid rgba(159,221,247,.12)}.rc30-pac-gauge__center{position:relative;z-index:2;display:grid;place-items:center;text-align:center;gap:3px;padding:18px;pointer-events:none}.rc30-pac-gauge__center small{font-size:.58rem;text-transform:uppercase;letter-spacing:.08em;color:#a8c7dc}.rc30-pac-gauge__center strong{font-size:1.8rem;line-height:1;color:#f2fbff}.rc30-pac-gauge__center span{font-size:.63rem;color:#c2deed}.rc30-pac-gauge__knob{position:absolute;z-index:4;width:22px;height:22px;border-radius:50%;transform:translate(-50%,-50%);background:#35308f;border:4px solid rgba(255,255,255,.72);box-shadow:0 4px 12px rgba(0,0,0,.28);pointer-events:none}.rc30-pac-gauge__limit{position:absolute;z-index:3;bottom:11%;font-size:.55rem;font-weight:800;color:#8faec2;pointer-events:none}.rc30-pac-gauge__limit--min{left:12%}.rc30-pac-gauge__limit--max{right:12%}.rc30-pac-gauge__confirm{display:grid!important;place-items:center!important;width:52px!important;height:40px!important;min-width:52px!important;min-height:40px!important;margin:0!important;padding:0!important;border:1px solid rgba(113,142,255,.38)!important;border-radius:14px!important;background:linear-gradient(135deg,#39339c,#2e2a85)!important;color:white!important;box-shadow:0 8px 18px rgba(15,18,76,.24)!important;font:inherit!important;cursor:pointer!important}.rc30-pac-gauge__confirm:hover{transform:translateY(-1px);filter:brightness(1.06)}.rc30-pac-gauge__confirm:active{transform:translateY(0)}.rc30-pac-gauge__confirm[hidden]{display:none!important}.rc30-pac-gauge__confirm b{font-size:1.5rem;line-height:1}.rc30-pac-mode-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px}.rc30-pac-mode-grid>label{display:grid;gap:5px}.rc30-pac-mode-grid>label>span{font-size:.58rem;color:#9bb9cd}.rc30-pac-mode-grid select{width:100%;min-height:44px}.rc30-pac-mode-grid .rc30-choice-picker{width:100%}@media(max-width:760px){.rc30-pac-gauge__ring{width:min(220px,78%)}.rc30-pac-mode-grid{grid-template-columns:1fr}}
      .rc27-config-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:12px}.rc27-config-grid label{display:grid;gap:6px;min-width:0}.rc27-config-grid label>span{color:#9fbccd;font-size:.62rem;font-weight:750}.rc27-config-grid select,.rc27-config-grid input[type=number],.rc27-config-grid input[type=text]{appearance:none;width:100%;min-width:0;height:42px;padding:0 10px;border:1px solid rgba(108,202,239,.20);border-radius:11px;color:#f5fbff;background:#123966;font:inherit;font-size:.67rem;font-weight:700}.rc27-config-grid select{color-scheme:dark;background-color:#123966!important}.rc27-config-grid option{color:#eefaff;background:#123966}.rc27-config-grid option:checked{color:#fff;background:#1b5f91}.rc27-config-grid .rc27-check{display:flex;align-items:center;grid-template-columns:auto 1fr}.rc27-config-grid .rc27-check input{width:20px;height:20px}.rc27-test-notify{align-self:end!important;height:42px!important}
      .rc30-entity-field{display:grid;gap:6px;min-width:0;position:relative}.rc30-entity-field>span{color:#9fbccd;font-size:.62rem;font-weight:750}.rc30-entity-picker{position:relative;min-width:0;z-index:1}.rc30-entity-picker.is-open{z-index:80}.rc30-entity-picker__trigger{appearance:none;width:100%;min-width:0;min-height:46px;padding:7px 11px;border:1px solid rgba(108,202,239,.22);border-radius:12px;color:#f5fbff;background:linear-gradient(180deg,rgba(25,70,118,.98),rgba(16,54,98,.98));font:inherit;text-align:left;display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:10px;cursor:pointer;box-shadow:inset 0 1px 0 rgba(255,255,255,.04);transition:border-color .16s ease,box-shadow .16s ease,transform .16s ease}.rc30-entity-picker__trigger:hover,.rc30-entity-picker.is-open .rc30-entity-picker__trigger{border-color:rgba(113,211,250,.55);box-shadow:0 0 0 3px rgba(68,173,230,.10),inset 0 1px 0 rgba(255,255,255,.05)}.rc30-entity-picker__trigger>span{display:grid;gap:2px;min-width:0}.rc30-entity-picker__trigger b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:.69rem}.rc30-entity-picker__trigger small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#8fb7d0;font-size:.56rem;font-weight:650}.rc30-entity-picker__trigger i{font-style:normal;color:#9fd9f5;font-size:.92rem;transition:transform .16s ease}.rc30-entity-picker.is-open .rc30-entity-picker__trigger i{transform:rotate(180deg)}.rc30-entity-picker__panel{display:none;position:absolute;left:0;right:0;top:calc(100% + 6px);z-index:100;padding:8px;border:1px solid rgba(118,211,247,.28);border-radius:14px;background:linear-gradient(180deg,rgba(10,46,87,.995),rgba(8,36,73,.995));box-shadow:0 18px 48px rgba(0,18,47,.48);backdrop-filter:blur(16px)}.rc30-entity-picker.is-open .rc30-entity-picker__panel{display:block}.rc30-entity-picker__search{height:40px;display:grid;grid-template-columns:auto minmax(0,1fr);align-items:center;gap:7px;padding:0 10px;margin-bottom:7px;border:1px solid rgba(111,207,244,.2);border-radius:10px;background:rgba(16,61,106,.78);color:#8eccec}.rc30-entity-picker__search input{appearance:none!important;width:100%!important;height:38px!important;padding:0!important;border:0!important;outline:0!important;background:transparent!important;color:#f3fbff!important;font:inherit!important;font-size:.66rem!important;font-weight:700!important}.rc30-entity-picker__search input::placeholder{color:#7fa6bf}.rc30-entity-picker__options{display:grid;gap:3px;max-height:310px;overflow:auto;overscroll-behavior:contain;padding-right:2px;scrollbar-width:thin;scrollbar-color:#356e9c transparent}.rc30-entity-picker__option{appearance:none;width:100%;min-width:0;padding:8px 9px;border:1px solid transparent;border-radius:9px;background:transparent;color:#eaf8ff;font:inherit;text-align:left;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:9px;align-items:center;cursor:pointer}.rc30-entity-picker__option:hover,.rc30-entity-picker__option:focus-visible{outline:none;background:rgba(48,124,184,.30);border-color:rgba(111,207,244,.16)}.rc30-entity-picker__option.is-selected{background:linear-gradient(90deg,rgba(53,134,198,.42),rgba(35,102,161,.24));border-color:rgba(111,207,244,.26)}.rc30-entity-picker__option>span{display:grid;gap:2px;min-width:0}.rc30-entity-picker__option b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:.64rem}.rc30-entity-picker__option small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#8fb4cb;font-size:.54rem}.rc30-entity-picker__option em{font-style:normal;text-transform:uppercase;letter-spacing:.04em;color:#7fc9ef;background:rgba(30,101,157,.30);border-radius:999px;padding:4px 6px;font-size:.48rem;font-weight:850}.rc30-entity-picker__option[hidden]{display:none!important}.rc30-entity-picker__clear b{color:#bfd9ea}.rc30-entity-picker__empty{margin:8px 2px 2px;color:#91afc2;font-size:.6rem;text-align:center}.rc30-entity-picker__empty[hidden]{display:none!important}@media(max-width:760px){.rc30-entity-picker__panel{position:fixed;left:12px;right:12px;top:18vh;max-height:64vh}.rc30-entity-picker__options{max-height:48vh}}
      .rc30-native-select{position:absolute!important;inline-size:1px!important;block-size:1px!important;opacity:0!important;pointer-events:none!important;overflow:hidden!important;clip-path:inset(50%)!important}.rc30-choice-picker{position:relative;min-width:0;z-index:2}.rc30-choice-picker.is-open{z-index:90}.rc30-choice-picker__trigger{appearance:none;width:100%;min-width:0;height:42px;padding:0 11px;border:1px solid rgba(108,202,239,.22);border-radius:11px;color:#f5fbff;background:linear-gradient(180deg,rgba(25,70,118,.98),rgba(16,54,98,.98));font:inherit;font-size:.67rem;font-weight:780;text-align:left;display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:9px;cursor:pointer;box-shadow:inset 0 1px 0 rgba(255,255,255,.04);transition:border-color .16s ease,box-shadow .16s ease}.rc30-choice-picker__trigger span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.rc30-choice-picker__trigger i{font-style:normal;color:#9fd9f5;font-size:.88rem;transition:transform .16s ease}.rc30-choice-picker.is-open .rc30-choice-picker__trigger{border-color:rgba(113,211,250,.56);box-shadow:0 0 0 3px rgba(68,173,230,.10),inset 0 1px 0 rgba(255,255,255,.05)}.rc30-choice-picker.is-open .rc30-choice-picker__trigger i{transform:rotate(180deg)}.rc30-choice-picker__trigger:disabled,.rc30-choice-picker.is-disabled .rc30-choice-picker__trigger{cursor:not-allowed;opacity:.55}.rc30-choice-picker__panel{display:none;position:absolute;left:0;right:0;top:calc(100% + 5px);z-index:110;padding:6px;max-height:260px;overflow:auto;overscroll-behavior:contain;border:1px solid rgba(118,211,247,.28);border-radius:12px;background:linear-gradient(180deg,rgba(10,46,87,.995),rgba(8,36,73,.995));box-shadow:0 18px 48px rgba(0,18,47,.48);backdrop-filter:blur(16px);scrollbar-width:thin;scrollbar-color:#356e9c transparent}.rc30-choice-picker.is-open .rc30-choice-picker__panel{display:grid;gap:3px}.rc30-choice-picker__option{appearance:none;width:100%;min-width:0;padding:9px 10px;border:1px solid transparent;border-radius:9px;background:transparent;color:#eaf8ff;font:inherit;font-size:.64rem;font-weight:720;text-align:left;display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:8px;cursor:pointer}.rc30-choice-picker__option:hover,.rc30-choice-picker__option:focus-visible{outline:none;background:rgba(48,124,184,.30);border-color:rgba(111,207,244,.16)}.rc30-choice-picker__option.is-selected{background:linear-gradient(90deg,rgba(53,134,198,.42),rgba(35,102,161,.24));border-color:rgba(111,207,244,.26);color:#fff}.rc30-choice-picker__option b{color:#7fe0ba;font-size:.72rem}@media(max-width:760px){.rc30-choice-picker__panel{position:fixed;left:12px;right:12px;top:22vh;max-height:55vh}}
      .rc27-weekdays{display:flex;gap:6px;flex-wrap:wrap;margin-top:12px}.rc27-weekdays button{width:auto!important;min-width:42px!important;min-height:34px!important;margin:0!important;padding:6px 8px!important;border:1px solid rgba(109,197,234,.17)!important;border-radius:9px!important;color:#9cb8ca!important;background:rgba(10,51,95,.38)!important;box-shadow:none!important;font:inherit!important;font-size:.60rem!important;font-weight:800!important}.rc27-weekdays button.is-active{color:#e9fbff!important;background:rgba(46,145,210,.38)!important;border-color:rgba(103,211,245,.35)!important}.rc27-weekdays button:before{display:none!important}
      .rc30-seasonal-profile{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(250px,.75fr);gap:12px;margin:14px 0;padding:14px;border:1px solid rgba(111,207,244,.22);border-radius:16px;background:linear-gradient(135deg,rgba(14,67,119,.72),rgba(16,86,133,.42))}.rc30-seasonal-profile.is-adaptive{border-color:rgba(111,244,196,.28);box-shadow:inset 0 0 0 1px rgba(111,244,196,.06)}.rc30-seasonal-profile.is-suspended{border-color:rgba(255,204,102,.30);box-shadow:inset 0 0 0 1px rgba(255,204,102,.06)}.rc30-seasonal-profile__main,.rc30-adaptive-status{display:flex;gap:12px;align-items:flex-start}.rc30-seasonal-profile__main>span,.rc30-adaptive-status>span{font-size:1.55rem}.rc30-seasonal-profile__main>div,.rc30-adaptive-status>div{display:grid;gap:3px}.rc30-seasonal-profile small,.rc30-seasonal-profile label>span{font-size:.62rem;opacity:.7}.rc30-seasonal-profile b{font-size:.82rem}.rc30-seasonal-profile em{font-size:.67rem;line-height:1.4;opacity:.8}.rc30-seasonal-profile label{display:grid;gap:5px}.rc30-seasonal-profile select{color-scheme:dark;height:40px;border:1px solid rgba(111,207,244,.22);border-radius:11px;padding:0 10px;color:#eefaff;background:#123966;font:inherit;font-size:.69rem;font-weight:800}.rc30-seasonal-profile select option{color:#eefaff;background:#123966}.rc30-adaptive-status,.rc30-adaptive-proposal{padding:10px 11px;border:1px solid rgba(111,207,244,.14);border-radius:12px;background:rgba(4,42,87,.24)}.rc30-adaptive-proposal{display:grid;gap:3px}.rc30-adaptive-proposal>b{font-size:.8rem}.rc30-adaptive-actions{grid-column:1/-1;display:flex;flex-wrap:wrap;gap:8px}.rc30-adaptive-actions button{min-height:36px;border:1px solid rgba(111,207,244,.24);border-radius:10px;padding:0 12px;color:#eefaff;background:rgba(16,57,102,.72);font:inherit;font-size:.66rem;font-weight:800;cursor:pointer}.rc30-adaptive-actions button.is-primary{background:linear-gradient(135deg,#3d8ed7,#6577ed);border-color:rgba(255,255,255,.18)}.rc30-seasonal-profile p{grid-column:1/-1;margin:0;padding-top:10px;border-top:1px solid rgba(111,207,244,.14);font-size:.65rem;line-height:1.4;opacity:.76}@media(max-width:760px){.rc30-seasonal-profile{grid-template-columns:1fr}.rc30-seasonal-profile p,.rc30-adaptive-actions{grid-column:1}}
      .rc27-periods{display:grid;gap:8px;margin-top:12px}.rc27-period{display:grid;grid-template-columns:minmax(90px,1fr) minmax(100px,.7fr) auto minmax(100px,.7fr);align-items:center;gap:8px;padding:9px 10px;border-radius:11px;background:rgba(7,42,82,.38);opacity:.58}.rc27-period.is-enabled{opacity:1}.rc27-period>label{display:flex;align-items:center;gap:7px;color:#bcd4e2;font-size:.63rem;font-weight:750}.rc27-period input[type=checkbox]{width:18px;height:18px}.rc27-period input[type=time]{min-width:0;height:36px;padding:0 8px;border:1px solid rgba(103,195,232,.18);border-radius:9px;color:#eefaff;background:#123966;color-scheme:dark;font:inherit;font-size:.65rem}.rc27-period>b{color:#87a8bd}
      .rc27-maintenance-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.rc27-maintenance-grid article{display:grid;grid-template-columns:36px minmax(0,1fr) auto;align-items:center;gap:9px;padding:11px;border-radius:13px;background:rgba(7,42,82,.34);border:1px solid rgba(103,192,230,.13)}.rc27-maintenance-grid article.is-due{border-color:rgba(255,182,67,.24);background:rgba(142,91,25,.16)}.rc27-maintenance-grid article>span{font-size:1.15rem}.rc27-maintenance-grid article>div{display:grid;gap:2px}.rc27-maintenance-grid b{color:#eaf8ff;font-size:.68rem}.rc27-maintenance-grid small,.rc27-maintenance-grid em{color:#91adbf;font-size:.58rem;font-style:normal}.rc27-maintenance-grid article.is-due em{color:#ffd28b}
      .rc27-log-tools{display:flex;justify-content:flex-end;gap:8px;margin-top:12px}.rc27-log-tools .is-danger{color:#ffd2d2!important;border-color:rgba(255,145,145,.22)!important;background:rgba(137,47,59,.20)!important}.rc27-control-log{display:grid;gap:7px;margin:12px 0 0;padding:0;list-style:none}.rc27-control-log li{display:grid;grid-template-columns:135px minmax(0,1fr);gap:10px;padding-top:7px;border-top:1px solid rgba(120,190,224,.10);color:#a7c1d1;font-size:.62rem}.rc27-control-log time{opacity:.7}.rc27-control-log span{font-weight:700}
      @media(max-width:1180px){.rc27-control-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.rc27-camera{grid-column:auto}}
      @media(max-width:900px){.rc27-today,.rc27-insights{grid-template-columns:1fr}.rc27-control-grid{grid-template-columns:1fr}.rc27-camera{grid-column:auto}.rc27-maintenance-grid{grid-template-columns:1fr}}
      @media(max-width:760px){.rc27-operations>.v3-section__header{grid-template-columns:auto minmax(0,1fr)!important}.rc27-backend{grid-column:2;justify-self:start;margin-top:4px}.rc27-today article{grid-template-columns:38px minmax(0,1fr);min-height:88px;padding:12px}.rc27-today article>i{width:36px;height:36px}.rc27-today button{grid-column:2;width:100%!important;margin-top:5px!important}.rc27-control-grid>.v3-info-card{min-height:0!important;padding:15px!important}.rc27-camera-view,.rc27-camera-empty{height:auto;min-height:0;aspect-ratio:16/9}.rc27-camera-view img{height:100%;min-height:0}.rc27-config-grid{grid-template-columns:1fr}.rc27-period{grid-template-columns:1fr 1fr auto 1fr}.rc27-period>label{grid-column:1/-1}.rc27-log-tools{display:grid}.rc27-log-tools button{width:100%!important}.rc27-control-log li{grid-template-columns:1fr;gap:3px}}

      /* RC27.1 — collapsible dashboard sections with desktop/mobile memory. */
      .rc271-collapse-toolbar{display:flex;justify-content:flex-end;align-items:center;gap:7px;margin:14px 2px 4px}.rc271-collapse-toolbar>span{margin-right:auto;color:#d3e8f4;font-size:.62rem;font-weight:750;text-shadow:0 1px 5px rgba(0,24,54,.52)}
      .rc271-collapse-toolbar button{width:auto!important;min-height:34px!important;margin:0!important;padding:7px 11px!important;border:1px solid rgba(112,202,239,.21)!important;border-radius:10px!important;color:#e5f6ff!important;background:rgba(7,52,101,.56)!important;box-shadow:none!important;backdrop-filter:blur(8px)!important;-webkit-backdrop-filter:blur(8px)!important;font:inherit!important;font-size:.61rem!important;font-weight:820!important}.rc271-collapse-toolbar button:before{display:none!important}
      .rc271-collapsible>.v3-section__header,.rc271-devices-section>.section-title{cursor:pointer!important;user-select:none!important;-webkit-user-select:none!important}
      .rc271-collapsible>.v3-section__header:focus-visible,.rc271-devices-section>.section-title:focus-visible{outline:2px solid rgba(112,221,255,.82)!important;outline-offset:3px!important}
      .rc271-chevron{display:grid!important;place-items:center!important;flex:0 0 30px!important;width:30px!important;height:30px!important;margin-left:auto!important;border:1px solid rgba(116,203,239,.22)!important;border-radius:10px!important;color:#e7f8ff!important;background:rgba(38,119,183,.25)!important;font-size:1.1rem!important;font-weight:900!important;line-height:1!important;text-shadow:none!important;transition:transform .2s ease,background .2s ease!important}
      .rc271-collapsible.is-collapsed>.v3-section__header,.rc271-devices-section.is-collapsed>.section-title{margin-bottom:0!important}
      .v3-section.rc271-collapsible.is-collapsed>:not(.v3-section__header),.rc271-devices-section.is-collapsed>.devices{display:none!important}
      .rc271-devices-section{margin-top:18px}.rc271-devices-section>.section-title{display:flex!important;align-items:center!important;width:max-content!important;max-width:100%!important;gap:8px!important}.rc271-devices-section>.section-title>b{font:inherit!important}.rc271-devices-section>.devices{margin-top:10px!important}
      .rc271-collapsible.is-collapsed>.v3-section__header .rc271-chevron,.rc271-devices-section.is-collapsed>.section-title .rc271-chevron{background:rgba(29,102,165,.36)!important}
      @media(max-width:760px){.rc271-collapse-toolbar{display:grid;grid-template-columns:1fr 1fr;margin-top:11px}.rc271-collapse-toolbar>span{grid-column:1/-1}.rc271-collapse-toolbar button{width:100%!important}.rc271-chevron{flex-basis:28px!important;width:28px!important;height:28px!important}.rc27-operations>.v3-section__header .rc271-chevron{grid-column:3;grid-row:1}.rc27-operations.is-collapsed>.v3-section__header .rc27-backend{display:none!important}}
      @media print{.rc271-collapse-toolbar{display:none!important}.v3-section.rc271-collapsible.is-collapsed>:not(.v3-section__header),.rc271-devices-section.is-collapsed>.devices{display:grid!important}}

      /* RC28 — measurement sources, filtration performance and harmonised devices. */
      .rc281-confidence-detail{display:block;margin-top:5px;color:#91adbf;font-size:.55rem;font-style:normal;line-height:1.35}
      .rc281-comparison-empty{display:grid;gap:7px;align-content:start;min-height:96px;padding:15px;border:1px solid rgba(126,195,226,.14);border-radius:14px;background:rgba(8,43,82,.30)}.rc281-comparison-empty b{color:#e8f7ff;font-size:.72rem}.rc281-comparison-empty span{color:#b8d0df;font-size:.62rem}.rc281-comparison-empty small{color:#819caf;font-size:.56rem}.v3-comparison.is-suspended{align-self:start;min-height:0!important}.v3-comparison__row>span{display:grid;justify-items:end;gap:2px}.v3-comparison__row>span small{font-size:.48rem;font-weight:700;white-space:nowrap}.v3-comparison__row.is-acceptable>span{color:#a9d9ff!important}.v3-comparison__row.is-critical>span{color:#ff9f91!important}.rc281-comparison-note{margin:10px 0 0;color:#86a7ba;font-size:.52rem;line-height:1.35}
      .rc281-pump-performance{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:12px;padding:10px;border:1px solid rgba(94,193,228,.16);border-radius:13px;background:rgba(7,44,84,.30)}.rc281-pump-performance span{display:grid;gap:2px}.rc281-pump-performance small{color:#86a7ba;font-size:.50rem}.rc281-pump-performance b{color:#e8f8ff;font-size:.68rem}.rc281-pump-performance em{grid-column:1/-1;color:#7fa2b7;font-size:.49rem;font-style:normal}.rc24-action.is-manual{border-color:rgba(255,191,89,.32)!important;background:linear-gradient(135deg,rgba(56,132,209,.88),rgba(99,108,235,.88))!important}.device-card button[data-i][disabled]{opacity:.62!important;cursor:progress!important;filter:saturate(.65)}
      .rc28-filtration-section{margin-top:18px}.rc28-filter-live{justify-self:end;padding:7px 10px;border:1px solid rgba(114,198,232,.18);border-radius:999px;color:#9bb8ca;background:rgba(7,45,87,.36);font-size:.61rem;font-weight:800}.rc28-filter-live.is-running{color:#b8ffe4;border-color:rgba(83,224,172,.28);background:rgba(25,130,99,.22)}
      .rc28-filtration-card{padding:16px;border:1px solid rgba(112,201,238,.17);border-radius:19px;background:linear-gradient(145deg,rgba(8,52,100,.58),rgba(5,36,76,.44));box-shadow:0 18px 40px rgba(0,27,65,.14)}.rc28-filtration-kpis{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px}.rc28-filtration-kpis article{display:grid;gap:4px;min-width:0;padding:13px;border:1px solid rgba(112,198,234,.14);border-radius:15px;background:rgba(8,44,84,.44)}.rc28-filtration-kpis article>span{font-size:1.1rem}.rc28-filtration-kpis small{color:#91afc2;font-size:.58rem;text-transform:uppercase;letter-spacing:.04em}.rc28-filtration-kpis strong{color:#eefaff;font-size:1rem}.rc28-filtration-kpis em{color:#8eacbf;font-size:.58rem;font-style:normal;line-height:1.35}.rc28-filtration-progress{margin-top:12px;padding:12px 13px;border-radius:14px;background:rgba(7,42,80,.40)}.rc28-filtration-progress>div{display:flex;justify-content:space-between;color:#e7f7ff;font-size:.68rem}.rc28-filtration-progress>i{display:block;height:8px;margin-top:9px;overflow:hidden;border-radius:999px;background:rgba(126,188,218,.14)}.rc28-filtration-progress>i>b{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#2d94ed,#33d3bf)}.rc28-filtration-progress>small{display:block;margin-top:8px;color:#89a9bd;font-size:.57rem}.rc28-filtration-progress.is-reached>div b{color:#9ff2d1}
      .rc28-devices-section{margin-top:18px}.rc28-devices-section>.devices{margin-top:12px}.rc28-section-count{justify-self:end;padding:7px 10px;border-radius:999px;border:1px solid rgba(112,201,238,.18);background:rgba(8,48,92,.38);color:#d8eef9;font-size:.60rem;font-weight:850;white-space:nowrap}.rc28-devices-section>.v3-section__header{grid-template-columns:auto minmax(0,1fr) auto auto!important}
      .rc28-device-toggle{display:flex!important;align-items:center!important;gap:7px!important;width:auto!important;min-width:92px!important;min-height:34px!important;margin:0!important;padding:6px 9px!important;border:1px solid rgba(128,183,211,.20)!important;border-radius:999px!important;color:#9db8c9!important;background:rgba(7,40,78,.44)!important;box-shadow:none!important;font:inherit!important;font-size:.60rem!important;font-weight:850!important}.rc28-device-toggle:before{display:none!important}.rc28-device-toggle i{position:relative;display:block;width:28px;height:16px;border-radius:999px;background:rgba(123,157,178,.36)}.rc28-device-toggle i:after{content:"";position:absolute;top:2px;left:2px;width:12px;height:12px;border-radius:50%;background:#d6e5ed;transition:transform .2s ease}.rc28-device-toggle.is-on{color:#bff7e1!important;border-color:rgba(71,218,165,.28)!important;background:rgba(20,117,90,.22)!important}.rc28-device-toggle.is-on i{background:rgba(61,208,155,.54)}.rc28-device-toggle.is-on i:after{transform:translateX(12px);background:#effff8}.device-card.is-disabled{opacity:.58;filter:saturate(.42)}.device-card.is-disabled:hover{opacity:.76}.device-card.is-disabled .gauges,.device-card.is-disabled .linear,.device-card.is-disabled .chips{pointer-events:none}.rc28-disabled-note{color:#b9cbd5!important;border-color:rgba(151,177,192,.15)!important;background:rgba(65,79,91,.15)!important}
      .device-analysis-status.is-disabled{border-color:rgba(148,175,190,.16)!important;background:rgba(62,78,90,.17)!important}.device-analysis-status.is-offline{border-color:rgba(255,188,93,.20)!important;background:rgba(128,84,25,.14)!important}
      .rc28-field-hint{display:block;margin-top:5px;color:#86a8bd!important;font-size:.55rem!important;line-height:1.25}.rc28-filter-state{display:grid;grid-template-columns:34px minmax(0,1fr);gap:9px;align-items:center;margin-top:12px;padding:11px 12px;border:1px solid rgba(110,199,235,.15);border-radius:13px;background:rgba(7,44,84,.32)}.rc28-filter-state>span{font-size:1rem}.rc28-filter-state>div{display:grid;gap:2px}.rc28-filter-state b{color:#e8f8ff;font-size:.68rem}.rc28-filter-state small{color:#91adbf!important;font-size:.59rem!important}.rc28-filter-state.is-warning{border-color:rgba(255,170,69,.26);background:rgba(135,78,17,.17)}.rc28-filter-state.is-good{border-color:rgba(73,219,166,.20);background:rgba(23,116,91,.16)}
      @media(max-width:1180px){.rc28-filtration-kpis{grid-template-columns:repeat(3,minmax(0,1fr))}}
      @media(max-width:760px){.rc281-pump-performance{grid-template-columns:1fr 1fr}.rc281-pump-performance span:last-of-type{grid-column:1/-1}.rc28-filtration-section>.v3-section__header,.rc28-devices-section>.v3-section__header{grid-template-columns:auto minmax(0,1fr) auto!important}.rc28-filter-live,.rc28-section-count{grid-column:2;justify-self:start;margin-top:4px}.rc28-filtration-kpis{grid-template-columns:1fr 1fr}.rc28-filtration-kpis article:last-child{grid-column:1/-1}.device-card>header{grid-template-columns:minmax(0,1fr) auto!important}.rc28-device-toggle{grid-column:1/-1;justify-self:stretch!important;justify-content:space-between!important;width:100%!important}.rc28-devices-section.is-collapsed>.v3-section__header .rc28-section-count,.rc28-filtration-section.is-collapsed>.v3-section__header .rc28-filter-live{display:none}}

      /* RC28.3 — daily extension approval and compact mobile source toggle. */
      .rc282-extension{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:10px;padding:11px 12px;border:1px solid rgba(93,194,232,.18);border-radius:13px;background:rgba(8,46,87,.34)}.rc282-extension>div{display:grid;gap:3px;min-width:0}.rc282-extension b{color:#eaf9ff;font-size:.66rem}.rc282-extension small{color:#91afc1;font-size:.54rem;line-height:1.4}.rc282-extension>span{display:flex;gap:7px;flex-wrap:wrap;justify-content:flex-end}.rc282-extension button{min-height:34px;padding:7px 10px;border:1px solid rgba(84,205,235,.26);border-radius:10px;color:#effcff;background:linear-gradient(135deg,rgba(43,142,227,.92),rgba(89,106,235,.90));font:inherit;font-size:.55rem;font-weight:850;cursor:pointer}.rc282-extension button.is-secondary{background:rgba(30,68,113,.48);border-color:rgba(151,187,209,.19)}.rc282-extension.is-approved{border-color:rgba(70,221,166,.25);background:rgba(22,116,90,.17)}.rc282-extension.is-ignored{border-color:rgba(255,183,89,.23);background:rgba(122,79,23,.15)}
      @media(max-width:760px){.device-card>header{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;grid-template-areas:"identity temperature" "identity toggle"!important;align-items:start!important;column-gap:12px!important;row-gap:8px!important}.device-card>header>div{grid-area:identity!important;min-width:0!important}.device-card>header>strong{grid-area:temperature!important;justify-self:end!important;align-self:start!important;min-width:0!important}.rc28-device-toggle{grid-area:toggle!important;grid-column:auto!important;grid-row:auto!important;justify-self:end!important;align-self:start!important;justify-content:center!important;width:auto!important;max-width:150px!important;min-width:0!important;min-height:42px!important;margin:0!important;padding:7px 10px!important;white-space:nowrap!important}.rc28-device-toggle span{white-space:nowrap!important}.rc282-extension{display:grid;gap:10px}.rc282-extension>span{justify-content:stretch}.rc282-extension>span button{flex:1}.rc282-extension>button{justify-self:start}}
      @media(max-width:420px){.rc28-device-toggle{padding:7px 8px!important;font-size:.54rem!important}.rc28-device-toggle i{width:26px;height:15px}.rc282-extension>span{display:grid;grid-template-columns:1fr 1fr;width:100%}}

      /* FIX14.3 — Assistant Expert : explication en lecture seule, sans commande métier. */
      .rc30-assistant-expert-trigger{margin-left:auto!important;width:auto!important;min-height:30px!important;padding:5px 9px!important;border:1px solid rgba(126,205,239,.22)!important;border-radius:10px!important;background:rgba(25,89,145,.24)!important;color:#dff5ff!important;box-shadow:none!important;font:inherit!important;font-size:.55rem!important;font-weight:850!important;white-space:nowrap!important;cursor:pointer!important}.rc30-assistant-expert-trigger:before{display:none!important}.rc30-assistant-expert-trigger:hover{border-color:rgba(126,205,239,.46)!important;background:rgba(37,112,174,.34)!important}
      .rc30-expert-modal[hidden]{display:none!important}.rc30-expert-modal{position:fixed;inset:0;z-index:10000;display:grid;place-items:center;padding:22px;color:#eefaff}.rc30-expert-modal__backdrop{position:absolute;inset:0;background:rgba(0,18,43,.70);backdrop-filter:blur(7px);-webkit-backdrop-filter:blur(7px)}.rc30-expert-modal__panel{position:relative;z-index:1;width:min(980px,calc(100vw - 44px));max-height:min(88vh,900px);overflow:auto;overscroll-behavior:contain;padding:20px;border:1px solid rgba(127,215,246,.28);border-radius:24px;background:linear-gradient(145deg,rgba(12,52,99,.985),rgba(8,35,73,.985));box-shadow:0 30px 90px rgba(0,15,45,.55),inset 0 1px 0 rgba(255,255,255,.05);scrollbar-width:thin;scrollbar-color:#3f79a7 transparent}.rc30-expert-modal__header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding-bottom:14px;border-bottom:1px solid rgba(128,205,238,.15)}.rc30-expert-modal__header>div{display:flex;align-items:center;gap:11px}.rc30-expert-modal__header>div>span{display:grid;place-items:center;width:42px;height:42px;border-radius:14px;background:linear-gradient(135deg,rgba(70,152,223,.58),rgba(102,100,232,.72));font-size:1.25rem}.rc30-expert-modal h2{margin:0;color:#f4fbff;font-size:1.12rem}.rc30-expert-modal__header p{margin:3px 0 0;color:#9fbed1;font-size:.64rem}.rc30-expert-modal__header>button{width:36px!important;height:36px!important;min-width:36px!important;min-height:36px!important;margin:0!important;padding:0!important;border:1px solid rgba(144,196,221,.18)!important;border-radius:11px!important;background:rgba(27,72,113,.42)!important;color:#d9edf8!important;box-shadow:none!important;font:inherit!important;font-size:1.2rem!important;cursor:pointer!important}.rc30-expert-modal__header>button:before{display:none!important}
      .rc30-expert-modal__status{display:grid;grid-template-columns:38px minmax(0,1fr);gap:10px;align-items:center;margin-top:14px;padding:12px 13px;border:1px solid rgba(109,202,239,.16);border-radius:15px;background:rgba(16,67,112,.34)}.rc30-expert-modal__status>span{font-size:1.35rem}.rc30-expert-modal__status>div{display:grid;gap:2px}.rc30-expert-modal__status small,.rc30-expert-modal dt{color:#88abc0;font-size:.55rem}.rc30-expert-modal__status b{color:#effaff;font-size:.75rem}.rc30-expert-modal__status em{color:#a7c5d6;font-size:.59rem;font-style:normal}
      .rc30-expert-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:11px;margin-top:12px}.rc30-expert-grid article{min-width:0;padding:13px;border:1px solid rgba(107,194,231,.14);border-radius:16px;background:rgba(7,43,83,.42)}.rc30-expert-grid h3{margin:0 0 10px;color:#edf9ff;font-size:.72rem}.rc30-expert-grid dl{display:grid;gap:6px;margin:0}.rc30-expert-grid dl>div{display:flex;justify-content:space-between;gap:10px;padding-bottom:5px;border-bottom:1px solid rgba(126,190,218,.08)}.rc30-expert-grid dd{margin:0;color:#e6f7ff;font-size:.61rem;font-weight:800;text-align:right;overflow-wrap:anywhere}.rc30-expert-grid article>p{margin:9px 0 0;color:#a1bdce;font-size:.59rem;line-height:1.48}.rc30-expert-grid article>small{display:block;margin-top:8px;color:#82aac0;font-size:.54rem}.rc30-expert-conclusion{display:grid;grid-template-columns:38px minmax(0,1fr);gap:10px;align-items:start;margin-top:12px;padding:13px;border:1px solid rgba(75,218,167,.22);border-radius:16px;background:rgba(20,116,89,.16)}.rc30-expert-conclusion>span{display:grid;place-items:center;width:34px;height:34px;border-radius:11px;background:rgba(49,187,136,.24);color:#baffdf;font-weight:900}.rc30-expert-conclusion small{color:#8fbaa8;font-size:.54rem;text-transform:uppercase;letter-spacing:.04em}.rc30-expert-conclusion p{margin:4px 0 0;color:#dcf7ea;font-size:.65rem;line-height:1.5}.rc30-gemini{margin-top:12px;padding:13px;border:1px solid rgba(164,132,255,.28);border-radius:16px;background:linear-gradient(135deg,rgba(86,64,170,.18),rgba(21,94,141,.16))}.rc30-gemini header{display:flex;align-items:center;justify-content:space-between;gap:10px}.rc30-gemini header>div{display:flex;align-items:center;gap:9px}.rc30-gemini header span{display:grid;place-items:center;width:31px;height:31px;border-radius:10px;background:rgba(137,104,242,.22)}.rc30-gemini header div div{display:grid;gap:2px}.rc30-gemini header b{color:#f0ebff;font-size:.69rem}.rc30-gemini header small,.rc30-gemini__notice{color:#9eacc5;font-size:.53rem}.rc30-gemini__message,.rc30-gemini__answer{margin:9px 0 0;color:#c8d8e8;font-size:.61rem;line-height:1.5}.rc30-gemini__answer{color:#ecf4ff}.rc30-gemini__notice{display:block;margin-top:7px;line-height:1.4}.rc30-gemini>button{width:auto!important;min-height:34px!important;margin:10px 0 0!important;padding:7px 12px!important;border:1px solid rgba(174,148,255,.28)!important;border-radius:10px!important;background:linear-gradient(135deg,#6658d8,#3d84d5)!important;color:#fff!important;box-shadow:none!important;font:inherit!important;font-size:.59rem!important;font-weight:850!important;cursor:pointer!important}.rc30-gemini>button:disabled{opacity:.55;cursor:wait!important}.rc30-gemini>button:before{display:none!important}.rc30-expert-modal footer{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:13px;padding-top:12px;border-top:1px solid rgba(128,196,226,.12)}.rc30-expert-modal footer small{color:#86a8bc;font-size:.54rem}.rc30-expert-modal footer button{width:auto!important;min-height:34px!important;margin:0!important;padding:7px 13px!important;border:1px solid rgba(111,207,244,.25)!important;border-radius:10px!important;background:linear-gradient(135deg,#338bd1,#6276ec)!important;color:#fff!important;box-shadow:none!important;font:inherit!important;font-size:.60rem!important;font-weight:850!important;cursor:pointer!important}.rc30-expert-modal footer button:before{display:none!important}
      @media(max-width:900px){.rc30-expert-grid{grid-template-columns:1fr 1fr}}@media(max-width:760px){.rc30-assistant-expert-trigger{font-size:0!important;min-width:34px!important;width:34px!important;padding:0!important}.rc30-assistant-expert-trigger:first-letter{font-size:.8rem}.rc30-expert-modal{padding:10px}.rc30-expert-modal__panel{width:calc(100vw - 20px);max-height:92vh;padding:14px;border-radius:19px}.rc30-expert-grid{grid-template-columns:1fr}.rc30-expert-modal footer{align-items:stretch;flex-direction:column}.rc30-expert-modal footer button{width:100%!important}}

      /* RC25 — AXTON pH powder/liquid profiles and unit-safe action log */

    </style>${coquilleHtml}`;
    this.shadowRoot.querySelectorAll("pool-gauge").forEach(e=>e.data=JSON.parse(decodeURIComponent(e.dataset.p)));
    this.rc30EnhanceChoiceSelects();
    this.shadowRoot.querySelectorAll("button[data-i]").forEach(b=>b.addEventListener("click",()=>{const index=Number(b.dataset.i);this.analyze(this.config.devices[index],index)}));
    this.shadowRoot.querySelectorAll("[data-device-toggle]").forEach(button=>button.addEventListener("click",event=>{event.stopPropagation();this.toggleMeasurementDevice(Number(button.dataset.deviceToggle))}));
    this.shadowRoot.querySelectorAll("[data-analysis-all]").forEach(button=>button.addEventListener("click",()=>this.analyzeAll()));
    this.shadowRoot.querySelectorAll(".advice-toggle").forEach(button=>{
      button.addEventListener("click",()=>{
        const copy=button.previousElementSibling;
        const open=copy.classList.toggle("open");
        button.textContent=open?"Voir moins":"Voir plus";
      });
    });
    this.shadowRoot.querySelectorAll("[data-assistant-expert-open]").forEach(button=>button.addEventListener("click",()=>this.rc30OpenAssistantExpert(button)));
    const assistantExpertModal=this.shadowRoot.querySelector?.("[data-assistant-expert-modal]");
    if(assistantExpertModal){
      assistantExpertModal.querySelectorAll("[data-assistant-expert-close]").forEach(control=>control.addEventListener("click",()=>this.rc30CloseAssistantExpert()));
      assistantExpertModal.addEventListener("keydown",event=>{if(event.key==="Escape"){event.preventDefault();this.rc30CloseAssistantExpert()}});
      assistantExpertModal.querySelectorAll("[data-gemini-generate]").forEach(control=>control.addEventListener("click",()=>this.rc30GenerateGemini()));
    }
    // FIX14.3.1 : un rafraîchissement HA ne doit plus refermer l'Assistant Expert.
    this.rc30ApplyAssistantExpertState({focus:Boolean(this._rc30ExpertOpen)});
    const preferencesPanel=this.shadowRoot.querySelector?.(".v3-preferences");
    if(preferencesPanel){
      preferencesPanel.addEventListener("click",event=>{
        const unitControl=event.target.closest?.("[data-unit-toggle]");
        if(unitControl){
          event.preventDefault();
          event.stopPropagation();
          this._preferences={...this._preferences,temperature_unit:this._preferences.temperature_unit==="F"?"C":"F"};
          writePoolPreferences(this._preferences);
          this.render();
          return;
        }
        const control=event.target.closest?.("[data-pref]");
        if(!control)return;
        event.preventDefault();
        event.stopPropagation();
        const key=control.dataset.pref;
        if(!Object.prototype.hasOwnProperty.call(this._preferences,key))return;
        this._preferences={...this._preferences,[key]:!this._preferences[key]};
        writePoolPreferences(this._preferences);
        control.setAttribute("aria-pressed",String(this._preferences[key]));
        this.render();
      });
    }
    this.shadowRoot.querySelectorAll("[data-weather-alert-entity]").forEach(select=>select.addEventListener("change",()=>{
      this._preferences={...this._preferences,weather_alert_entity:select.value||"auto"};
      writePoolPreferences(this._preferences);
      this.render();
    }));
    this.shadowRoot.querySelectorAll("[data-weather-alert-focus]").forEach(control=>control.addEventListener("click",()=>{
      if(this.rc271IsCollapsed("information")){this.rc271SetCollapsed("information",false);this.render()}
      const card=this.shadowRoot.querySelector("#rc26-weather-card");
      const details=card?.querySelector("[data-weather-alert-details]");
      if(details)details.open=true;
      card?.scrollIntoView({behavior:this._preferences.animations?"smooth":"auto",block:"center"});
      card?.classList.add("rc26-weather-highlight");
      setTimeout(()=>card?.classList.remove("rc26-weather-highlight"),1800);
    }));
    this.bindRc271CollapseControls();
    this.bindTreatmentControls();
    this.bindRc27Controls();
    this.shadowRoot.querySelectorAll(".spark-hit").forEach(hit=>{
      const tip=hit.nextElementSibling;
      const points=JSON.parse(decodeURIComponent(hit.dataset.points));
      const show=event=>{
        if(!points.length)return;
        const rect=hit.getBoundingClientRect();
        const ratio=Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width));
        const index=Math.min(points.length-1,Math.round(ratio*(points.length-1)));
        const point=points[index];
        const date=new Date(point.timestamp);
        const sourceText=(point.sources||[]).map(source=>`${source.name}: ${source.value.toFixed(hit.dataset.metric==="orp"?0:2)} ${hit.dataset.unit}`).join(" · ");
        tip.textContent=`${date.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})} · Moyenne: ${point.value.toFixed(hit.dataset.metric==="orp"?0:2)} ${hit.dataset.unit}${sourceText?" · "+sourceText:""}`;
        tip.classList.add("show");
        tip.style.visibility="hidden";
        tip.style.left="0px";
        tip.style.top="0px";
        tip.style.transform="none";
        const tipWidth=Math.min(tip.offsetWidth||220,Math.max(120,rect.width-16));
        const tipHeight=tip.offsetHeight||38;
        const desiredX=ratio*rect.width;
        const left=Math.max(8,Math.min(rect.width-tipWidth-8,desiredX-tipWidth/2));
        const pointerY=Math.max(0,Math.min(rect.height,event.clientY-rect.top));
        const above=pointerY-tipHeight-14;
        const top=above>=8?above:Math.min(rect.height-tipHeight-8,pointerY+14);
        tip.style.maxWidth=`${Math.max(120,rect.width-16)}px`;
        tip.style.left=`${left}px`;
        tip.style.top=`${Math.max(8,top)}px`;
        tip.style.visibility="visible";
        if(this._tipTimer)clearTimeout(this._tipTimer);
        if(window.matchMedia?.("(max-width: 760px)").matches){
          this._tipTimer=setTimeout(()=>tip.classList.remove("show"),1800);
        }
      };
      hit.addEventListener("mousemove",show);
      hit.addEventListener("mouseleave",()=>tip.classList.remove("show"));
      hit.addEventListener("touchmove",event=>{if(event.touches[0])show(event.touches[0])},{passive:true});
    });
  }
}
if(!customElements.get("pool-dashboard-card"))customElements.define("pool-dashboard-card",PoolDashboardCard);
window.customCards=window.customCards||[];
window.customCards.push({type:"pool-dashboard-card",name:"HA Pool Dashboard",description:"Application piscine premium",preview:true});
console.info("%c HA POOL DASHBOARD %c v"+VERSION,"background:#1388ef;color:white;font-weight:bold","background:#222;color:white");
