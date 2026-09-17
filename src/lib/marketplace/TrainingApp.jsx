import { courseDate } from './dates.mjs';
import detailContent from '../content/marketplace-details.json';
import { useProviderOrder } from './useProviderOrder';
import React, { useEffect, useMemo, useState } from 'react';
import {
  trainingCourses,
  matchesTraining,
  readTrainingFilters,
  trainingHash,
  trainingSchedules,
} from './training.mjs';

export default function TrainingApp({ records, fetchedAt }) {
  const snapshotSeconds = Date.parse(fetchedAt) / 1000;
  const labels = detailContent.courses;
  const sourceCourses = useMemo(() => trainingCourses(records), [records]);
  const courses = useProviderOrder(sourceCourses);
  const [filters, setFilters] = useState({ company: '', city: '', level: '' });
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const restore = () => {
      setFilters(readTrainingFilters(window.location.hash));
      setReady(true);
    };
    restore();
    window.addEventListener('hashchange', restore);
    return () => window.removeEventListener('hashchange', restore);
  }, []);
  useEffect(() => {
    if (ready)
      window.history.replaceState(
        window.history.state,
        '',
        window.location.pathname + window.location.search + trainingHash(filters),
      );
  }, [ready, filters]);
  const unique = (values) => [...new Set(values.filter(Boolean))].sort();
  const fields = [
    {
      key: 'company',
      label: 'Training provider',
      values: unique(courses.map((course) => course.provider)),
    },
    {
      key: 'city',
      label: 'Location',
      values: ['Virtual Courses', ...unique(courses.flatMap((course) => course.locations))],
    },
    { key: 'level', label: 'Level', values: unique(courses.map((course) => course.level)) },
  ];
  const matching = courses.filter((course) => matchesTraining(course, filters));
  return (
    <div className="marketplace-training">
      <form
        className="marketplace-filters"
        role="search"
        aria-label="Find training courses"
        onSubmit={(event) => event.preventDefault()}
      >
        {fields.map((field) => (
          <label key={field.key}>
            {field.label}
            <select
              aria-label={field.label}
              value={filters[field.key]}
              onChange={(event) => setFilters({ ...filters, [field.key]: event.target.value })}
            >
              <option value="">All {field.label.toLowerCase()}s</option>
              {filters[field.key] && !field.values.includes(filters[field.key]) && (
                <option>{filters[field.key]}</option>
              )}
              {field.values.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
        ))}
        <button type="button" onClick={() => setFilters({ company: '', city: '', level: '' })}>
          Clear filters
        </button>
      </form>
      <p role="status" aria-live="polite">
        {matching.length} {matching.length === 1 ? 'course' : 'courses'}
      </p>
      <div className="marketplace-course-results">
        {matching.map((course) => (
          <article key={course.key}>
            <p>
              {course.provider}
              {course.coaPartner ? ' · COA Training Partner' : ''}
            </p>
            <h2>
              <a href={course.href}>{course.name}</a>
            </h2>
            {course.level && <p>{course.level} level</p>}
            <p>
              {course.online
                ? 'Online training'
                : course.locations.join(' · ') || 'Contact provider for locations'}
            </p>
            {course.schedules.length ? (
              <ul className="marketplace-course-dates" aria-label={labels.caption}>
                {trainingSchedules(course, filters.city).map((schedule, index) => (
                  <li key={`${schedule.location}-${schedule.start}-${schedule.end}-${index}`}>
                    <span>{schedule.location || labels.unknownLocation}</span>
                    <br />
                    {courseDate(schedule.start)} – {courseDate(schedule.end)} (UTC)
                    <br />
                    <small>
                      {schedule.end && schedule.end < snapshotSeconds
                        ? labels.past
                        : labels.availability}
                    </small>
                  </li>
                ))}
              </ul>
            ) : (
              <p>{course.online ? labels.online : labels.noDates}</p>
            )}
            <a href={course.href}>Course details and published schedule →</a>
          </article>
        ))}
      </div>
      {!matching.length && (
        <p>No courses match these filters. Try another selection or clear the filters.</p>
      )}
    </div>
  );
}
