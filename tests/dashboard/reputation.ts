import {store} from './store';
export const ReputationService={
 async profile(id:string){return {...store.users[id],city:'',bio:'',skills:[],availability:[]}},
 async rate(applicationId:string,score:number){(window as any).rating={applicationId,score}},
 async rankings(){return [{id:'owner',name:'עסק בדיקה',role:'employer',average:4.5,count:2},{id:'teen',name:'מועמד בדיקה',role:'teen',average:5,count:1}]},
};
