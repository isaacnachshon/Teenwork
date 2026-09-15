export const auth = {currentUser:{uid:'owner',displayName:'בדיקה'}};
export const db = {};
const dob = (years:number) => { const d=new Date(); d.setFullYear(d.getFullYear()-years); d.setDate(d.getDate()-30); return d.toISOString().slice(0,10); };
export const store:any = {
  users:{
    // 'owner' doubles as the employer (?role=employer) and as the logged-in teen (?role=teen) in this harness.
    owner:{name:'עסק בדיקה',companyName:'עסק בדיקה',birthDate:dob(17),parentalConsentStatus:'approved',termsVersion:'2',idNumber:'',address:''},
    teen:{name:'מועמד בדיקה',age:16,birthDate:dob(16),parentalConsentStatus:'approved',termsVersion:'2'},
  },
  jobs:{
    first:{title:'משרה לדוגמה',company:'עסק בדיקה',employerId:'owner',description:'תיאור',type:'מלצרות',location:'תל אביב',salary:45,minAge:16,startTime:'09:00',endTime:'15:00',days:['ראשון'],skills:[],applicantsCount:1,youthLawAck:true,status:'open'},
    illegal:{title:'משרה לא חוקית',company:'עסק אחר',employerId:'other',description:'שכר נמוך ולילה',type:'מלצרות',location:'חיפה',salary:20,minAge:16,startTime:'16:00',endTime:'23:30',days:['ראשון'],skills:[],applicantsCount:0,youthLawAck:true,status:'open'},
  },
  applications:{a:{jobId:'first',employerId:'owner',applicantId:'teen',status:'new',jobTitle:'משרה לדוגמה',teenAge:16,consentVerified:true}},
  notifications:{},
};
(window as any).testStore=store;
export const collection=(_:any,name:string)=>({name});
export const doc=(_:any,name:string,id:string)=>({name,id});
export const where=(field:string,op:string,value:any)=>({field,value});
export const orderBy=()=>({});
export const query=(ref:any,...filters:any[])=>({...ref,filters});
const snap=(id:string,data:any)=>({id,exists:()=>!!data,data:()=>data});
export async function getDoc(ref:any){return snap(ref.id,store[ref.name]?.[ref.id])}
export async function getDocs(ref:any){const docs=Object.entries(store[ref.name]||{}).filter(([_,d]:any)=>(ref.filters||[]).every((f:any)=>!f.field||d[f.field]===f.value)).map(([id,d])=>snap(id,d));return {docs,size:docs.length}}
export async function addDoc(ref:any,data:any){if((window as any).failSave)throw Error('test failure');const id='added';store[ref.name][id]=data;return {id}}
export async function setDoc(ref:any,data:any){store[ref.name][ref.id]={...(store[ref.name][ref.id]||{}),...data}}
export async function updateDoc(ref:any,data:any){if((window as any).failSave)throw Error('test failure');Object.assign(store[ref.name][ref.id],data)}
export async function deleteDoc(ref:any){delete store[ref.name][ref.id]}
export const serverTimestamp=()=>({seconds:1});
export const onSnapshot=(ref:any,callback:any)=>{getDocs(ref).then(callback);return ()=>{}};
export const arrayUnion=(...v:any[])=>v;
export const arrayRemove=(...v:any[])=>v;
export class Timestamp {}
