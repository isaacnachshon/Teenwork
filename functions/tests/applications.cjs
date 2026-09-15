const {test} = require("node:test");
const assert = require("node:assert/strict");
const {buildApplicationStamp, buildParentApplicationEmail, ageFromBirthDate} = require("../lib/applications");
const {computeAgeFields, ageFieldsDiff} = require("../lib/users");

const now = new Date(Date.UTC(2026, 8, 14));

test("ageFromBirthDate counts full years and rejects bad input", () => {
  assert.equal(ageFromBirthDate("2009-09-14", now), 17);
  assert.equal(ageFromBirthDate("2009-09-15", now), 16);
  assert.equal(ageFromBirthDate("", now), null);
  assert.equal(ageFromBirthDate("14/09/2009", now), null);
});

test("buildApplicationStamp records age, consent and job compliance", () => {
  const teen = {birthDate: "2009-09-14", parentalConsentStatus: "approved"};
  const good = {salary: 31, minAge: 16, startTime: "09:00", endTime: "15:00", days: ["ראשון"]};
  const s = buildApplicationStamp(teen, good, now);
  assert.equal(s.teenAge, 17);
  assert.equal(s.teenYouthBand, "age17");
  assert.equal(s.consentVerified, true);
  assert.deepEqual(s.complianceIssues, []);

  const bad = {salary: 20, startTime: "16:00", endTime: "23:00", days: ["שבת"]};
  const b = buildApplicationStamp({birthDate: "2011-01-01", parentalConsentStatus: "pending"}, bad, now);
  assert.equal(b.consentVerified, false);
  assert.ok(b.complianceIssues.includes("SALARY_BELOW_FLOOR"));
  assert.ok(b.complianceIssues.includes("NIGHT_16_18"));
  assert.ok(b.complianceIssues.includes("SATURDAY"));
});

test("parent email contains the job facts and the rights link", () => {
  const teen = {name: "דנה", birthDate: "2009-09-14", parentName: "רות", parentEmail: "p@example.com"};
  const job = {title: "מלצרות", company: "קפה", location: "חיפה", salary: 28, startTime: "09:00", endTime: "15:00", days: ["ראשון", "שני"]};
  const mail = buildParentApplicationEmail(teen, job, "https://teensworks.com", now);
  assert.ok(mail.subject.includes("דנה"));
  for (const part of ["מלצרות", "קפה", "חיפה", "28", "09:00–15:00", "ראשון, שני", "?rights=1", "30.92", "נמוך מהמינימום"]) {
    assert.ok(mail.html.includes(part), "missing " + part);
  }
  assert.ok(!mail.html.includes("<script"));
});

test("computeAgeFields / ageFieldsDiff only write when something changed", () => {
  const computed = computeAgeFields({birthDate: "2009-09-14"}, now);
  assert.deepEqual(computed, {age: 17, youthBand: "age17", ageVerified: true});
  assert.deepEqual(ageFieldsDiff({age: 17, youthBand: "age17", ageVerified: true}, computed), {});
  assert.deepEqual(ageFieldsDiff({age: 16, youthBand: "age16", ageVerified: true}, computed), {age: 17, youthBand: "age17"});
  const none = computeAgeFields({birthDate: ""}, now);
  assert.deepEqual(none, {age: null, youthBand: null, ageVerified: false});
  assert.deepEqual(ageFieldsDiff({}, none), {ageVerified: false});
  assert.deepEqual(ageFieldsDiff({ageVerified: false}, none), {});
});
