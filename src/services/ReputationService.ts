import { httpsCallable } from 'firebase/functions';
import { functions } from '@/firebase';
export interface RelatedProfile {name:string;bio:string;skills:string[];availability:string[];city:string;role:string}
export interface Ranking {id:string;name:string;role:string;average:number;count:number}
export const ReputationService = {
  async profile(userId:string) { return (await httpsCallable<{userId:string},RelatedProfile>(functions,'getRelatedProfile')({userId})).data; },
  async rate(applicationId:string,score:number) { await httpsCallable(functions,'submitRating')({applicationId,score}); },
  async rankings() { return (await httpsCallable<void,Ranking[]>(functions,'getRankings')()).data; },
};
