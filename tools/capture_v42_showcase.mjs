#!/usr/bin/env node
/**
 * Capture the real Pool Cockpit 4.2 Demo frontend in a headless browser.
 * Uses simulated Home Assistant state only; no accounts, devices or URLs.
 * Screenshots are from the actual release JS, not design mockups.
 */
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, mkdir, stat } from "node:fs/promises";
import { join, extname, resolve } from "node:path";

const root = resolve(".");
const screenshots = join(root, "docs/images/v4.2.0");
const bundle = join(root, "release/v4.2.0/pool-cockpit.js");
const server = createServer(async (req, res) => {
  const path = new URL(req.url, "http://localhost").pathname;
  if (path === "/") {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(`<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <style>
        :root{--primary-color:#05afd4;--primary-text-color:#effaff;--secondary-text-color:#bbd6e9;--card-background-color:#17324e}
        html,body{margin:0;min-width:1050px;min-height:850px;background:#f5f9fc;color:#163550;font-family:Arial,Helvetica,sans-serif}
        #app{width:100%;margin:0 auto}
      </style><script src="/pool-cockpit.js" defer></script></head>
      <body><main id="app"></main></body></html>`);
    return;
  }
  const p = path === "/pool-cockpit.js" ? bundle :
    path.startsWith("/local/ha-pool-dashboard/assets/")
      ? join(root,"release/v4-rc8-2/assets",path.slice("/local/ha-pool-dashboard/assets/".length))
      : null;
  if (!p || !p.startsWith(root)) {res.writeHead(404);res.end("Not found");return;}
  try {
    const bytes = await readFile(p);
    res.setHeader("Content-Type", extname(p)===".js"?"application/javascript":extname(p)===".webp"?"image/webp":"image/png");
    res.end(bytes);
  } catch {res.writeHead(404);res.end("Not found");}
});
await mkdir(screenshots,{recursive:true});
await new Promise(r => server.listen(0,"127.0.0.1",r));
const addr = server.address();
const browser = await chromium.launch({headless:true,args:["--no-sandbox"]});
try {
  const page = await browser.newPage({viewport:{width:1540,height:900},deviceScaleFactor:1});
  const errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${addr.port}/`,{waitUntil:"load"});
  await page.waitForFunction(()=>Boolean(customElements.get("pool-cockpit-card")),{timeout:30000});
  await page.evaluate(()=>{
    const c=document.createElement("pool-cockpit-card");
    document.getElementById("app").appendChild(c);
    c.setConfig({type:"custom:pool-cockpit-card",language:"fr",title:"Piscine de démonstration",
      visual_theme:"ocean",devices:[],initial_mode:"demo"});
  });
  const active = "#app";
  const ready=()=>document.querySelector("pool-cockpit-card")?.shadowRoot
     ?.querySelector("pool-dashboard-v4-test-card")?.shadowRoot
     ?.querySelector(".pool-cockpit-v4 .v4-navigation__item");
  await page.waitForFunction(ready,{timeout:40000});
  await page.waitForTimeout(2200);
  const labels=[["overview","overview"],["advice","advice"],["measurements","measurements"],
    ["equipment","equipment"],["planning","planning"],["history","history"]];
  for(const [tab,file] of labels) {
    const clicked = await page.evaluate(tab => {
      const host=document.querySelector("pool-cockpit-card");
      const core=host?.shadowRoot?.querySelector("pool-dashboard-v4-test-card");
      const root=core?.shadowRoot;
      const button=root?.querySelector(`.v4-navigation__item[data-v4-view="${tab}"]`);
      if(!button)return false;
      button.click();
      return true;
    },tab);
    if(!clicked)throw new Error("Cannot find V4 tab "+tab);
    await page.waitForTimeout(850);
    const path=join(screenshots,`${file}.webp`);
    await page.screenshot({path,type:"jpeg",quality:80}).catch(async()=>{
      // Playwright supports png and jpeg; write optimised WebP via sharp separately.
      await page.screenshot({path:path.replace(/\.webp$/,".png"),type:"png"});
    });
    // The previous call should not be treated as a WebP: use png directly.
    await page.screenshot({path:join(screenshots,`${file}.png`),type:"png",fullPage:false});
    console.log("Captured",tab,join(screenshots,`${file}.png`));
  }
  if(errors.length)console.log("Non-blocking frontend warnings:", errors.slice(0,8));
} finally {
  await browser.close();
  server.close();
}
