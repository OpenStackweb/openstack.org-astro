export function trainingCourses(records) {
  return records.flatMap((provider) =>
    provider.courses.map((course) => ({
      ...course,
      provider: provider.company.name || provider.name,
      coaPartner: provider.company.coaPartner,
      href: `${provider.href}#course_${course.id}`,
      key: `${provider.id}-${course.id}`,
    })),
  );
}
export function matchesTraining(course, filters) {
  const same = (a, b) => a.toLocaleLowerCase() === b.toLocaleLowerCase();
  return (
    (!filters.company || same(course.provider, filters.company)) &&
    (!filters.level || same(course.level, filters.level)) &&
    (!filters.city ||
      (same(filters.city, 'Virtual Courses')
        ? course.online
        : course.locations.some((location) => same(location, filters.city))))
  );
}
export function readTrainingFilters(hash) {
  const values = new URLSearchParams(hash.replace(/^#/, ''));
  return Object.fromEntries(
    ['company', 'city', 'level'].map((key) => [key, values.get(key)?.trim() || '']),
  );
}
export function trainingHash(filters) {
  const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => value));
  return params.size ? `#${params}` : '';
}

// Filter the displayed sessions as well as the course cards. Virtual courses may
// have scheduled sessions; selecting Virtual Courses must not hide those dates.
export function trainingSchedules(course, city) {
  if (!city || city.toLocaleLowerCase() === 'virtual courses') return course.schedules;
  return course.schedules.filter(
    (schedule) => schedule.location.toLocaleLowerCase() === city.toLocaleLowerCase(),
  );
}
