import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { normalizeUsername, studentAuthEmail } from '../src/utils/identity.js';
import { validateTestSchedule } from '../src/utils/classValidation.js';
import { buildMeetingDates, orderQuestNodes } from '../src/utils/questSchedule.js';
import { skillTrees, tierRequiredLevels } from '../src/data/skillTreeData.js';
import { armorTiers, getArmorTier, MAX_CHARACTER_LEVEL } from '../src/utils/characterSkins.js';
import { parseClassWorkbook } from '../src/utils/classImport.js';

test('student authentication always derives from username', () => {
  assert.equal(normalizeUsername('Bảo Nguyễn 01'), 'bao-nguyen-01');
  assert.equal(studentAuthEmail('Bao-01'), 'bao-01@classquest.local');
  assert.throws(() => studentAuthEmail('   '));
});

test('meeting dates preserve an exact imported lesson schedule', () => {
  const exact = ['2026-08-17', '2026-08-19', '2026-08-24'];
  assert.deepEqual(buildMeetingDates('2026-08-17', 3, [], exact), exact);
});

test('lesson and boss nodes remain separate and sort by date', () => {
  const ordered = orderQuestNodes([
    { id: 'l2', type: 'lesson', order: 2, date: '2026-08-19' },
    { id: 'boss', type: 'miniboss', order: 0, date: '2026-08-18' },
    { id: 'l1', type: 'lesson', order: 1, date: '2026-08-17' },
  ]);
  assert.deepEqual(ordered.map((node) => node.id), ['l1', 'boss', 'l2']);
  assert.equal(ordered.filter((node) => node.type === 'lesson').length, 2);
});

test('test schedule rejects duplicate finals, out-of-course dates, and incorrect order', () => {
  const errors = validateTestSchedule({
    lessonDates: ['2026-08-17', '2026-09-30'],
    tests: [
      { title: 'Progress', type: 'progress', date: '2026-09-25' },
      { title: 'Final 1', type: 'final', date: '2026-09-20' },
      { title: 'Final 2', type: 'final', date: '2026-10-02' },
    ],
  });
  assert.ok(errors.length >= 3);
});

test('every character class has exactly nine daily skills through level 40', () => {
  const expectedLevels = Object.values(tierRequiredLevels);
  assert.deepEqual(expectedLevels, [1, 5, 10, 15, 20, 25, 30, 35, 40]);
  Object.values(skillTrees).forEach((skills) => {
    assert.equal(skills.length, 9);
    assert.deepEqual(skills.map((skill) => skill.requiredLevel), expectedLevels);
    assert.ok(skills.every((skill) => skill.usesPerDay === 1));
  });
});

test('armour upgrades every ten levels and caps at 40', () => {
  assert.equal(MAX_CHARACTER_LEVEL, 40);
  assert.equal(armorTiers.length, 5);
  assert.equal(getArmorTier(1).key, 'base');
  assert.equal(getArmorTier(10).key, 'bronze');
  assert.equal(getArmorTier(20).key, 'gold');
  assert.equal(getArmorTier(30).key, 'crystal');
  assert.equal(getArmorTier(40).key, 'divine');
});

test('the downloadable Excel template passes the production parser', async () => {
  const bytes = await readFile(new URL('../public/ClassQuest_Import_Template.xlsx', import.meta.url));
  const result = await parseClassWorkbook(new Blob([bytes]));
  assert.deepEqual(result.errors, []);
  assert.equal(result.sessions.length, 8);
  assert.equal(result.tests.length, 2);
  assert.equal(result.students.length, 3);
});
