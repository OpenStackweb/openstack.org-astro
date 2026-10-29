import React, { useMemo } from 'react';
import { courseDate } from './dates.mjs';
import { useProviderOrder } from './useProviderOrder';
import { useHashFilters } from './useHashFilters';
import {
  trainingCourses,
  currentTrainingCourses,
  matchesTraining,
  readTrainingFilters,
  trainingHash,
  trainingSchedules,
} from './training.mjs';

export default function TrainingApp({ records, fetchedAt }) {
  const [filters, setFilters] = useHashFilters(readTrainingFilters, trainingHash);
  const courses = useMemo(
    () => currentTrainingCourses(trainingCourses(records), fetchedAt),
    [records, fetchedAt],
  );
  const providers = useProviderOrder(records);
  const matching = courses.filter((course) => matchesTraining(course, filters));
  const choices = {
    company: [...new Set(courses.map((c) => c.provider))].sort(),
    city: [
      ...new Set(
        courses.flatMap((c) => (c.online ? ['Virtual Courses', ...c.locations] : c.locations)),
      ),
    ].sort(),
    level: [
      'Beginner',
      'Intermediate',
      'Advanced',
      ...new Set(
        courses
          .map((c) => c.level)
          .filter((level) => level && !['Beginner', 'Intermediate', 'Advanced'].includes(level)),
      ),
    ],
  };
  return (
    <div className="marketplace-training">
      <div className="marketplace-filters" role="search" aria-label="Filter training courses">
        {Object.entries({ company: 'Company', city: 'Location', level: 'Level' }).map(
          ([key, label]) => (
            <label key={key}>
              {label}
              <select
                value={filters[key]}
                onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
              >
                <option value="">
                  All {label.toLowerCase() === 'company' ? 'companies' : label.toLowerCase() + 's'}
                </option>
                {choices[key].map((choice) => (
                  <option key={choice}>{choice}</option>
                ))}
              </select>
            </label>
          ),
        )}
        <button type="button" onClick={() => setFilters(readTrainingFilters(''))}>
          Clear filters
        </button>
      </div>
      <p className="marketplace-result-count" role="status" aria-live="polite">
        {matching.length} {matching.length === 1 ? 'course' : 'courses'} available
      </p>
      <div className="marketplace-training-results">
        {providers.map((provider) => {
          const available = matching.filter((course) => course.key.startsWith(`${provider.id}-`));
          if (!available.length) return null;
          return (
            <article
              key={provider.id}
              className="training-provider"
              style={{ borderLeftColor: provider.company.color }}
            >
              <div className="training-provider-intro">
                <a className="training-provider-brand" href={provider.href}>
                  {provider.company.logo && (
                    <img src={provider.company.logo} alt="" loading="lazy" />
                  )}
                  <h2>{provider.company.name || provider.name}</h2>
                </a>
                <div
                  className="provider-prose"
                  dangerouslySetInnerHTML={{ __html: provider.descriptionHtml }}
                />
              </div>
              <div className="marketplace-schedule">
                <table>
                  <caption className="sr-only">
                    Courses from {provider.company.name || provider.name}
                  </caption>
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Level</th>
                      <th>Next location / date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {available.slice(0, 3).map((course) => {
                      const next = trainingSchedules(course, filters.city)[0];
                      return (
                        <tr key={course.key}>
                          <td>
                            <a href={course.href}>{course.name}</a>
                          </td>
                          <td>{course.level}</td>
                          <td>
                            {next ? (
                              <>
                                {next.location}
                                <br />
                                {courseDate(next.start)} – {courseDate(next.end)} (UTC)
                              </>
                            ) : (
                              'Ongoing / Online'
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="training-provider-actions">
                <a className="marketplace-details-link" href={provider.href}>
                  {available.length > 3 ? `View all ${available.length} courses` : 'Course details'}{' '}
                  →
                </a>
                {provider.company.coaPartner && (
                  <span className="training-partner">COA Training Partner</span>
                )}
              </div>
            </article>
          );
        })}
      </div>
      {!matching.length && (
        <p>No current courses match these filters. Try another company, location or level.</p>
      )}
    </div>
  );
}
