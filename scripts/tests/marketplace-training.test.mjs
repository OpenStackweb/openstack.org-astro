import test from 'node:test';
import assert from 'node:assert/strict';
import {
  trainingCourses,
  matchesTraining,
  readTrainingFilters,
  trainingHash,
  trainingSchedules,
} from '../../src/lib/marketplace/training.mjs';
const records = [
  {
    id: 1,
    href: '/marketplace/training/provider/course/',
    company: { name: 'Provider', coaPartner: true },
    courses: [
      { id: 1, name: 'Basics', level: 'Beginner', online: true, locations: [] },
      {
        id: 2,
        name: 'Advanced',
        level: 'Advanced',
        online: false,
        locations: ['Boston, United States'],
      },
    ],
  },
];
test('training filters apply to the same course and preserve detail anchors', () => {
  const courses = trainingCourses(records);
  assert.equal(courses[0].href, '/marketplace/training/provider/course/#course_1');
  assert.equal(courses[0].coaPartner, true);
  assert.deepEqual(
    courses
      .filter((c) =>
        matchesTraining(c, { company: 'provider', city: 'Virtual Courses', level: 'beginner' }),
      )
      .map((c) => c.id),
    [1],
  );
  assert.deepEqual(
    courses.filter((c) =>
      matchesTraining(c, { company: 'Provider', city: 'Boston, United States', level: 'Beginner' }),
    ),
    [],
  );
});
test('legacy training links round trip with escaped city and provider labels', () => {
  const filters = readTrainingFilters(
    '#company=Example+%26+Co&city=Boston%2C+United+States&level=Advanced',
  );
  assert.equal(filters.company, 'Example & Co');
  assert.deepEqual(readTrainingFilters(trainingHash(filters)), filters);
  assert.equal(trainingHash(readTrainingFilters('')), '');
});

test('schedule rows follow the chosen city without hiding virtual course dates', () => {
  const course = {
    schedules: [
      { location: 'Boston, MA, United States', start: 1, end: 2 },
      { location: 'Beijing, China', start: 3, end: 4 },
    ],
  };
  assert.deepEqual(trainingSchedules(course, 'beijing, china'), [course.schedules[1]]);
  assert.deepEqual(trainingSchedules(course, ''), course.schedules);
  assert.deepEqual(trainingSchedules(course, 'Virtual Courses'), course.schedules);
  assert.deepEqual(trainingSchedules(course, 'Unknown'), []);
});

test('current directory omits expired classroom sessions but keeps undated online courses', async () => {
  const { currentTrainingCourses } = await import('../../src/lib/marketplace/training.mjs');
  const courses = [
    { id: 1, online: false, schedules: [{ start: 100, end: 200 }] },
    { id: 2, online: true, schedules: [] },
    { id: 3, online: false, schedules: [] },
    { id: 4, online: true, schedules: [{ start: 100, end: 200 }] },
    {
      id: 5,
      online: false,
      schedules: [
        { start: 1893456000, end: 1893542400 },
        { start: 100, end: 200 },
      ],
    },
  ];
  const result = currentTrainingCourses(courses, '2026-10-29T12:00:00Z');
  assert.deepEqual(
    result.map((c) => c.id),
    [2, 5],
  );
  assert.equal(result[1].schedules.length, 1);
  assert.equal(courses[4].schedules.length, 2, 'historical record remains intact');
});
