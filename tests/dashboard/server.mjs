import { build } from 'esbuild';
import { createServer } from 'node:http';
import path from 'node:path';
import {existsSync,readFileSync} from 'node:fs';
const result = await build({
  stdin: { contents: `import React from 'react'; import {createRoot} from 'react-dom/client'; import DashboardLayout from '@/layouts/DashboardLayout'; createRoot(document.getElementById('root')).render(<DashboardLayout role={new URLSearchParams(location.search).get('role') || 'employer'} userName="עסק בדיקה" onLogout={()=>{}}/>);`, resolveDir: process.cwd(), loader: 'tsx' },
  bundle: true, write: false, format: 'esm', define: {'process.env.NODE_ENV':'"test"'},
  plugins: [{name:'test-boundaries', setup(b) {
    b.onResolve({filter:/^@\/firebase(?:\/.*)?$/},()=>({path:path.resolve('tests/dashboard/store.ts')}));
    b.onResolve({filter:/^firebase\/firestore$/},()=>({path:path.resolve('tests/dashboard/store.ts')}));
    b.onResolve({filter:/^@\/services\/ReputationService$/},()=>({path:path.resolve('tests/dashboard/reputation.ts')}));
    b.onResolve({filter:/^@\/utils\/geocode$/},()=>({path:'geocode',namespace:'stub'}));
    b.onResolve({filter:/^@\/(pages\/dashboard\/(OverviewPage|UsersPage|ChatPage|ProfileTab|SettingsPage|AIAssistantPage)|pages\/profile\/EmployerProfilePage|components\/(JobMap|RightsInfoModal))$/},()=>({path:'empty',namespace:'stub'}));
    b.onLoad({filter:/.*/,namespace:'stub'},a=>({contents:a.path==='geocode'?'export async function geocodeLocation(){return null}':'export default function Empty(){return null}',loader:'js'}));
    b.onResolve({filter:/^@\//},a=>{const base=path.resolve('src',a.path.slice(2));return {path:[base+'.tsx',base+'.ts',path.join(base,'index.ts')].find(existsSync)}});
  }}],
  // The fallback alias resolver below is handled by tsconfig paths for .ts imports.
  tsconfig: 'tsconfig.json',
});
createServer((req,res)=>{
 if(req.url==='/dashboard.css'){res.setHeader('Content-Type','text/css');res.end(readFileSync('public/dashboard.css'));return;}
 res.setHeader('Content-Type',req.url.startsWith('/app.js')?'text/javascript':'text/html; charset=utf-8');
 res.end(req.url.startsWith('/app.js')?result.outputFiles[0].text:`<!doctype html><html lang="he" dir="rtl"><meta charset="utf-8"><title>TeenWork הדגמה מקומית</title><script src="https://cdn.tailwindcss.com"></script><link href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;600;700;800&display=swap" rel="stylesheet"><link href="/dashboard.css" rel="stylesheet"><body><div style="background:#fff3cd;padding:10px;text-align:center;font-family:Arial">הדגמה מקומית · נתוני דוגמה בלבד · <a href="/?role=employer">תצוגת עסק</a> | <a href="/?role=teen">תצוגת עובד</a></div><div id="root"></div><script type="module" src="/app.js"></script></body></html>`);
}).listen(4174,'127.0.0.1');
