import { courseDate } from './dates.mjs';
import detailContent from '../content/marketplace-details.json';
import { useProviderOrder } from './useProviderOrder';
import React, { useMemo } from 'react';
import { trainingCourses, trainingSchedules } from './training.mjs';
export default function TrainingApp({ records, fetchedAt }) {
  const snapshotSeconds = Date.parse(fetchedAt) / 1000;
  const labels = detailContent.courses;
  const sourceCourses = useMemo(() => trainingCourses(records), [records]);
  const matching = useProviderOrder(sourceCourses);
  return (
    <div className="marketplace-training">
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
                {trainingSchedules(course, '').map((schedule, index) => (
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
        <p>No courses are currently available.</p>
      )}
    </div>
  );
}
