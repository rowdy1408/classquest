import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  normalizeStudentLoginIdentifier,
  normalizeUsername,
  scopedStudentUsername,
  studentAuthEmail,
  studentLoginAliasId,
} from '../src/utils/identity.js';
import { DEFAULT_STUDENT_PASSWORD } from '../src/constants/studentAuth.js';
import { validateTestSchedule } from '../src/utils/classValidation.js';
import { buildMeetingDates, orderQuestNodes } from '../src/utils/questSchedule.js';
import { skillTrees, tierRequiredLevels } from '../src/data/skillTreeData.js';
import { armorTiers, getArmorTier, getCharacterSkinCandidates, MAX_CHARACTER_LEVEL, normalizeSkinRole } from '../src/utils/characterSkins.js';
import { parseClassWorkbook } from '../src/utils/classImport.js';
import { applyStudentXpChange, normalizeStudentProgress } from '../src/utils/studentProgress.js';
import { submissionStoragePath } from '../src/utils/submissionStorage.js';

test('student authentication accepts normalized email or username aliases', async () => {
  assert.equal(normalizeUsername('Bảo Nguyễn 01'), 'bao-nguyen-01');
  assert.equal(studentAuthEmail('Bao-01'), 'bao-01@classquest.local');
  assert.equal(normalizeStudentLoginIdentifier(' Alex@Example.COM '), 'alex@example.com');
  assert.equal(normalizeStudentLoginIdentifier(' Bảo Nguyễn 01 '), 'bao-nguyen-01');
  assert.equal(await studentLoginAliasId('Alex@Example.com'), await studentLoginAliasId('alex@example.com'));
  assert.equal((await studentLoginAliasId('student1')).length, 64);
  assert.throws(() => studentAuthEmail('   '));
});

test('all newly provisioned student accounts use the configured default password', () => {
  assert.equal(DEFAULT_STUDENT_PASSWORD, '123456789');
});

test('submission images use owner and student scoped storage paths', () => {
  assert.equal(
    submissionStoragePath('teacher-1', 'student-9', 'quest/01', 'photo 1'),
    'mhpSubmissions/teacher-1/student-9/quest-01/photo-1.jpg',
  );
});

test('overflow XP levels up and carries only the remainder forward', () => {
  assert.deepEqual(
    normalizeStudentProgress({ level: 8, xp: 810, xpToNext: 800 }),
    { level: 9, xp: 10, xpToNext: 900 },
  );
  assert.deepEqual(
    applyStudentXpChange({ level: 8, xp: 790, xpToNext: 800 }, 25),
    { level: 9, xp: 15, xpToNext: 900 },
  );
  assert.deepEqual(
    normalizeStudentProgress({ level: 8, xp: 1700, xpToNext: 800 }),
    { level: 10, xp: 0, xpToNext: 1000 },
  );
  assert.deepEqual(
    applyStudentXpChange({ level: 8, xp: 10, xpToNext: 800 }, -50),
    { level: 8, xp: 0, xpToNext: 800 },
  );
  assert.deepEqual(
    normalizeStudentProgress({ level: 40, xp: 1200, xpToNext: 1000 }),
    { level: 40, xp: 1000, xpToNext: 1000 },
  );
});

test('student usernames can be scoped safely to separate teacher workspaces', () => {
  const firstTeacher = scopedStudentUsername('student1', 'teacher-ABC12345');
  const secondTeacher = scopedStudentUsername('student1', 'teacher-XYZ98765');
  assert.notEqual(firstTeacher, secondTeacher);
  assert.match(firstTeacher, /^student1-[a-z0-9]+$/);
  assert.ok(firstTeacher.length <= 40);
  assert.notEqual(scopedStudentUsername('student1', 'teacher-ABC12345', 2), firstTeacher);
});

test('Firestore rules allow verified Google teachers without an invite collection', async () => {
  const rules = await readFile(new URL('../firebase/firestore.rules', import.meta.url), 'utf8');
  assert.doesNotMatch(rules, /mhpTeacherInvites/);
  assert.match(rules, /sign_in_provider == 'google.com'/);
  assert.match(rules, /match \/mhpClasses\/\{ownerId\}/);
  assert.match(rules, /match \/mhpStudentLoginAliases\/\{aliasId\}/);
  assert.match(rules, /allow get: if true/);
  assert.match(rules, /allow list: if false/);
  assert.match(rules, /mustChangePassword/);
  assert.match(rules, /studentPasswordChanged\(studentUid\)/);
  assert.match(rules, /'active', 'mustChangePassword'/);
});

test('Storage rules scope evidence images and block students before password change', async () => {
  const rules = await readFile(new URL('../firebase/storage.rules', import.meta.url), 'utf8');
  assert.match(rules, /mhpSubmissions\/\{ownerId\}\/\{studentUid\}/);
  assert.match(rules, /mustChangePassword == false/);
  assert.match(rules, /request\.resource\.size <= 5 \* 1024 \* 1024/);
  assert.match(rules, /request\.resource\.contentType\.matches\('image\/\.\*'\)/);
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

test('student avatars resolve all custom class, gender, and armour paths', () => {
  assert.equal(normalizeSkinRole('Chiến Binh'), 'warrior');
  assert.equal(normalizeSkinRole('Pháp Sư'), 'mage');
  assert.equal(normalizeSkinRole('', 3), 'cleric');
  assert.equal(normalizeSkinRole('', 6), 'bard');

  const roles = ['warrior', 'mage', 'cleric', 'explorer', 'guardian', 'bard'];
  const genders = ['male', 'female'];
  const levels = [1, 10, 20, 30, 40];

  for (const role of roles) {
    for (const gender of genders) {
      for (const level of levels) {
        const tier = getArmorTier(level).key;
        const expectedStem = tier === 'base'
          ? (gender === 'female' ? `${role}-female` : role)
          : `${role}-${tier}${gender === 'female' ? '-female' : ''}`;
        const [firstCandidate] = getCharacterSkinCandidates({ role, gender, level });
        assert.ok(firstCandidate.endsWith(`/assets/skins/${role}/${expectedStem}.webp`));
      }
    }
  }
});

test('the downloadable Excel template passes the production parser', async () => {
  const bytes = await readFile(new URL('../public/ClassQuest_Import_Template.xlsx', import.meta.url));
  const result = await parseClassWorkbook(new Blob([bytes]));
  assert.deepEqual(result.errors, []);
  assert.equal(result.sessions.length, 8);
  assert.equal(result.tests.length, 2);
  assert.equal(result.students.length, 3);
});
