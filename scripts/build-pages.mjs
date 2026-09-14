import fs from 'node:fs';
import path from 'node:path';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
const root=process.cwd(),temp=path.join(root,'.pages-src');fs.mkdirSync(temp,{recursive:true});
for(const [input,output]of [['app/experience.tsx','experience.tsx'],['app/qr-pass.tsx','qr-pass.tsx'],['app/staff/page.tsx','staff.tsx']]){
let source=fs.readFileSync(input,'utf8');
source="import {apiFetch} from './api';\n"+source.replaceAll('fetch(', 'apiFetch(');
source=source.replaceAll('src="/', 'src="/Benz2026/').replaceAll('?"/', '?"/Benz2026/').replaceAll(':"/', ':"/Benz2026/').replaceAll("?'/", "?'/Benz2026/").replaceAll(":'/", ":'/Benz2026/");
source=source.replaceAll('href="/staff"','href="/Benz2026/?staff=1"').replaceAll('href="/"','href="/Benz2026/"');
source=source.replace("window.location.origin+'/staff#ticket='", "window.location.origin+'/Benz2026/?staff=1#ticket='");
source=source.replace("url.pathname!=='/staff'", "url.pathname!=='/Benz2026/'||url.searchParams.get('staff')!=='1'");
source=source.replace("history.replaceState(null,'','/staff')", "history.replaceState(null,'','/Benz2026/?staff=1')");
fs.writeFileSync(path.join(temp,output),source);
}
fs.copyFileSync('pages-api.ts',path.join(temp,'api.ts'));
fs.writeFileSync(path.join(temp,'main.tsx'),'import React from "react";import {createRoot} from "react-dom/client";import Experience from "./experience";import Staff from "./staff";import "../app/globals.css";createRoot(document.getElementById("root")!).render(new URLSearchParams(location.search).has("staff")?<Staff/>:<Experience/>);');
fs.writeFileSync(path.join(temp,'index.html'),'<!doctype html><html lang="zh-Hant"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Mercedes-Benz｜華山探索體驗</title></head><body><div id="root"></div><script type="module" src="./main.tsx"></script></body></html>');
await build({configFile:false,root:temp,base:'/Benz2026/',publicDir:path.join(root,'public'),plugins:[react(),{name:'pages-assets',transform(code,id){if(id.endsWith('globals.css'))return code.replaceAll("url('/","url('/Benz2026/");}}],resolve:{alias:{'@':root}},build:{outDir:path.join(root,'docs'),emptyOutDir:true}});fs.writeFileSync('docs/.nojekyll','');
