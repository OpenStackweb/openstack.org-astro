// Adapted from marketplace-site/src/components/shared/ServiceBox/index.jsx
// OpenStackweb/marketplace-site @ 17df1c13 (MIT). Astro owns the layout; no Gatsby/MUI runtime.
import React from 'react';
import styles from './ServiceBox.module.css';
export default function ServiceBox({ service }) {
  return (
    <article
      className={styles.serviceBox}
      id={`service-${service.id}`}
      style={{ borderLeftColor: service.company.color, display: 'flex', flexWrap: 'wrap' }}
    >
      <div>
        {service.company.logo && (
          <a href={service.href} className={styles.logoArea}>
            <img
              loading="lazy"
              alt={`${service.company.name || service.name} logo`}
              src={service.company.logo}
            />
          </a>
        )}
      </div>
      <div>
        <a className={styles.serviceName} href={service.href}>
          {service.name}
        </a>
        <div
          className={`${styles.overview} provider-prose`}
          dangerouslySetInnerHTML={{ __html: service.descriptionHtml }}
        />
        {service.tested && (
          <div className={styles.testedListing}>
            <img src="/images/marketplace-openstack-powered.png" alt="OpenStack Powered" />
            <span className={styles.testedListingDescription}>OpenStack Powered</span>
          </div>
        )}
        {service.href && (
          <a
            className={styles.detailsButton}
            style={{ backgroundColor: '#005580' }}
            href={service.href}
          >
            <span>Details</span>
            <span aria-hidden="true">→</span>
          </a>
        )}
      </div>
    </article>
  );
}
