import React,{useEffect,useState} from 'react';
import {ReputationService,Ranking} from '@/services/ReputationService';
export default function RankingsPage(){
 const [rows,setRows]=useState<Ranking[]>([]),[error,setError]=useState(''),[loading,setLoading]=useState(true);
 const load=()=>{setLoading(true);setError('');ReputationService.rankings().then(setRows).catch(()=>setError('לא ניתן לטעון דירוגים.')).finally(()=>setLoading(false));};
 useEffect(load,[]);
 return <section className="p-6"><h1>דירוגי עובדים ומעסיקים</h1><p>דירוגים הדדיים לאחר סיום העסקה. המיון לפי ממוצע ובשוויון לפי מספר דירוגים.</p>
 {loading && <p role="status">טוען דירוגים...</p>}{error && <p role="alert">{error}<button onClick={load}>נסה שוב</button></p>}
 {!loading && !error && ['employer','teen'].map(role=><section key={role}><h2>{role==='employer'?'מעסיקים שדורגו על ידי עובדים':'עובדים שדורגו על ידי מעסיקים'}</h2>
 {rows.filter(r=>r.role===role).length===0 && <p>אין דירוגים עדיין.</p>}
 <ol>{rows.filter(r=>r.role===role).map(r=><li key={r.id}>{r.name} — {r.average.toFixed(1)} מתוך 5 · {r.count} דירוגים</li>)}</ol></section>)}
 </section>;
}
