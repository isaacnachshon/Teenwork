import {youthBand} from "./youthLaw";
import {ageFromBirthDate} from "./applications";

export interface AgeFields {
  age: number | null;
  youthBand: string | null;
  ageVerified: boolean;
}

/** Derived, display-only age fields. Rules compute age live from birthDate; these keep admin UI accurate. */
export function computeAgeFields(data: {birthDate?: string}, now: Date): AgeFields {
  const age = ageFromBirthDate(data.birthDate, now);
  return {
    age,
    youthBand: age === null ? null : youthBand(age),
    ageVerified: age !== null && age >= 14 && age <= 18,
  };
}

/** Returns the subset of fields that differ from the stored document (empty object = nothing to write). */
export function ageFieldsDiff(stored: Record<string, unknown>, computed: AgeFields): Partial<AgeFields> {
  const diff: Partial<AgeFields> = {};
  (Object.keys(computed) as (keyof AgeFields)[]).forEach((k) => {
    const v = computed[k];
    const cur = stored[k];
    if (v === null && (cur === undefined || cur === null)) return;
    if (cur !== v) (diff as Record<string, unknown>)[k] = v;
  });
  return diff;
}
