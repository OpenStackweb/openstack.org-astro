// Adapted from software-site 5cfab8d: OpenstackComponents, ServiceGroup,
// ServiceRow and utils/arrays. Gatsby URL and MUI presentation dependencies
// are replaced by host paths and scoped HTML/CSS; grouping/order are retained.
import React, { memo } from 'react';
const sortByOrder = ({ order: a = 0 }, { order: b = 0 }) => a - b;
const sortCategoryByOrder = ({ category: a }, { category: b }) => sortByOrder(a, b);
export const componentHref = (service) => '/software' + service.href;
export const ServiceRow = memo(({ service, mascot }) =>
  service ? (
    <a href={componentHref(service)} className="software-service-row">
      <span className="software-code">
        {mascot?.file?.public_url && <img src={mascot.file.public_url} alt="" loading="lazy" />}
        {service.code_name}
      </span>
      <span>{service.name}</span>
    </a>
  ) : null
);
const ServiceGroup = memo(({ id, title, description, groups }) => (
  <section id={id}>
    <h2>{title}</h2>
    {description && <p>{description}</p>}
    {groups.map(({ list, ...group }) => (
      <section className="software-group" key={group.id}>
        <h3>{group.name}</h3>
        {list.map((service) => (
          <ServiceRow key={service.id} service={service} mascot={service.mascot} />
        ))}
        {!list.length && <p>No matching OpenStack components.</p>}
      </section>
    ))}
  </section>
));
export function OpenstackComponents({ id, groups, title, description }) {
  const groupsBag = [...groups].sort(sortCategoryByOrder);
  return (
    <ServiceGroup
      id={id}
      title={title}
      description={description}
      groups={groupsBag.map(({ category, components = [] }) => ({
        ...category,
        list: [...components].sort(sortByOrder),
      }))}
    />
  );
}
