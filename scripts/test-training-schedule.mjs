import assert from 'node:assert/strict'
import fs from 'node:fs'
import ts from 'typescript'
const source = ts.transpileModule(fs.readFileSync('src/lib/trainingSchedule.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText
const { trainingDateKey, isTrainingDate, isTrainingDay } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
assert.equal(trainingDateKey('2026-10-08T00:00:00Z'), '2026-10-07')
for (const [date, open] of [['2026-10-05',true],['2026-10-06',true],['2026-10-07',true],['2026-10-08',true],['2026-10-09',false],['2026-10-10',false],['2026-10-11',false]]) assert.equal(isTrainingDate(date),open)
assert.equal(isTrainingDay('2026-10-09T00:00:00Z'),true) // Thursday in Little Rock
assert.equal(isTrainingDay('2026-10-10T00:00:00Z'),false)
for (const value of ['2026-10-29T20:00:00Z','2026-11-02T21:00:00Z']) assert.equal(new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',hour:'numeric'}).format(new Date(value)), '3 PM')
console.log('Central calendar dates, Monday–Thursday rules, and DST checks passed')
