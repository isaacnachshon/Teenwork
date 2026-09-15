const {test} = require("node:test");
const assert = require("node:assert/strict");
const law = require("../lib/youthLaw");

test("youth bands and wage floors follow the 04/2026 table", () => {
  assert.equal(law.youthBand(13), "under16");
  assert.equal(law.youthBand(15), "under16");
  assert.equal(law.youthBand(16), "age16");
  assert.equal(law.youthBand(17), "age17");
  assert.equal(law.youthBand(18), "adult");
  assert.equal(law.minWageForMinAge(14), 26.07);
  assert.equal(law.minWageForMinAge(15), 26.07);
  assert.equal(law.minWageForMinAge(16), 27.94);
  assert.equal(law.minWageForMinAge(17), 30.92);
  assert.equal(law.minWageForAge(17), 30.92);
  assert.equal(law.minWageForAge(18), law.ADULT_MIN_WAGE.hourly);
  assert.equal(law.TERMS_VERSION, "2");
});

test("validateJob flags every youth-law violation and accepts a compliant job", () => {
  const codes = (j) => law.validateJob(j).map((i) => i.code);
  assert.deepEqual(codes({salary: 28, minAge: 16, startTime: "09:00", endTime: "15:00", days: ["ראשון"]}), []);
  assert.deepEqual(codes({salary: 20, minAge: 14, startTime: "09:00", endTime: "14:00", days: ["ראשון"]}), ["SALARY_BELOW_FLOOR"]);
  assert.ok(codes({salary: 30, minAge: 16, startTime: "09:00", endTime: "18:00", days: []}).includes("SHIFT_TOO_LONG"));
  assert.ok(codes({salary: 30, minAge: 14, startTime: "14:00", endTime: "21:00", days: []}).includes("NIGHT_UNDER16"));
  assert.ok(codes({salary: 31, minAge: 16, startTime: "16:00", endTime: "23:00", days: []}).includes("NIGHT_16_18"));
  assert.ok(codes({salary: 31, minAge: 17, startTime: "18:00", endTime: "12:00", days: []}).includes("START_AFTER_END"));
  assert.ok(codes({salary: 31, minAge: 17, startTime: "09:00", endTime: "12:00", days: ["שבת"]}).includes("SATURDAY"));
  assert.ok(codes({salary: 31, minAge: 13, startTime: "09:00", endTime: "12:00", days: []}).includes("MIN_AGE_INVALID"));
});

test("vacation window and age eligibility", () => {
  assert.equal(law.isVacationNow(new Date(2026, 6, 15)), true);
  assert.equal(law.isVacationNow(new Date(2026, 2, 1)), false);
  assert.equal(law.isVacationNow(new Date(2026, 2, 1), {vacationActive: true}), true);
  assert.equal(law.eligibilityForAge(13).ok, false);
  assert.equal(law.eligibilityForAge(14, new Date(2026, 2, 1)).ok, false);
  assert.equal(law.eligibilityForAge(14, new Date(2026, 7, 1)).ok, true);
  assert.equal(law.eligibilityForAge(15).ok, true);
  assert.ok(law.eligibilityForAge(15).note);
  assert.equal(law.eligibilityForAge(17).ok, true);
  assert.equal(law.eligibilityForAge(19).ok, false);
});

test("evaluateJobForTeen compares against the teen's own wage floor", () => {
  const job = {salary: 27, minAge: 14, startTime: "09:00", endTime: "14:00", days: ["ראשון"]};
  const fifteen = law.evaluateJobForTeen(job, 15, new Date(2026, 2, 1));
  assert.equal(fifteen.wage, "ok");
  assert.equal(fifteen.ageOk, true);
  const seventeen = law.evaluateJobForTeen(job, 17, new Date(2026, 2, 1));
  assert.equal(seventeen.wage, "below");
  assert.equal(seventeen.wageFloor, 30.92);
  const fourteenInMarch = law.evaluateJobForTeen(job, 14, new Date(2026, 2, 1));
  assert.equal(fourteenInMarch.ageOk, false);
  const tooYoungForJob = law.evaluateJobForTeen({...job, minAge: 16}, 15, new Date(2026, 2, 1));
  assert.equal(tooYoungForJob.ageOk, false);
});
