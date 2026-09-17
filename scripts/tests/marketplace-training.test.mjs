import test from 'node:test';
import assert from 'node:assert/strict';
import {
  trainingCourses,
  matchesTraining,
  readTrainingFilters,
  trainingHash,
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
