import React, { useState } from 'react';
import { projectLinks, projectVideo, capabilityGroups } from './detail-links.mjs';
import { relatedComponent, safeSoftwareLink } from './catalog.mjs';
import { componentHref } from './components';

export default function ComponentDetails({
  component,
  catalog,
  release,
  labels,
  descriptionHtml,
  backHref,
}) {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const links = projectLinks(component, release?.slug);
  const video = projectVideo(component.youtube_id);
  const publicLinks = (items) =>
    items
      .filter((item) => safeSoftwareLink(item?.url))
      .map((item, index) => (
        <a key={index} href={safeSoftwareLink(item.url)}>
          {item.label || item.url}
        </a>
      ));
  return (
    <article className="software-detail">
      <a href={backHref}>← {labels.backLinkText}</a>
      <div className="software-detail-intro">
        {safeSoftwareLink(component.mascot?.file?.public_url) && (
          <img
            className="software-mascot"
            src={safeSoftwareLink(component.mascot.file.public_url)}
            alt={`${component.code_name} mascot`}
          />
        )}
        <div>
          <h1>{component.code_name}</h1>
          <h2>{component.name}</h2>
        </div>
      </div>
      <div className="software-links">
        {publicLinks([
          component.docs_link,
          component.download_link,
          links.source && { url: links.source, label: labels.latestSourceCodeRelease },
          component.has_installation_guide && {
            url: links.installation,
            label: labels.installationGuide,
          },
        ])}
      </div>
      {component.since && (
        <p>
          {labels.firstAppearance} ‘{component.since}’
        </p>
      )}
      <section>
        <h3>{labels.aboutThisProject.title}</h3>
        <div className="software-prose" dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
      </section>
      {component.links?.length > 0 && (
        <section>
          <h3>{labels.aboutThisProject.relatedLinks}</h3>
          <div className="software-links">{publicLinks(component.links)}</div>
        </section>
      )}
      {[
        [labels.dependsOn, component.dependencies],
        [labels.seeAlso, component.related_components],
      ].map(([label, items]) =>
        items?.length ? (
          <section key={label}>
            <h3>{label}</h3>
            <div className="software-related-list">
              {items.map((item, index) => {
                const full = relatedComponent(catalog, item);
                return full ? (
                  <a className="software-related" key={index} href={componentHref(full)}>
                    {safeSoftwareLink(full.mascot?.file?.public_url) && (
                      <img
                        src={safeSoftwareLink(full.mascot.file.public_url)}
                        alt=""
                        loading="lazy"
                      />
                    )}
                    {item.code_name}
                  </a>
                ) : (
                  <span key={index}>{item.code_name}</span>
                );
              })}
            </div>
          </section>
        ) : null,
      )}
      {links.project && (
        <section>
          <h3>{labels.developmentTeam}</h3>
          <a href={links.project}>{component.project_team || component.code_name}</a>
        </section>
      )}
      {component.support_teams?.length > 0 && (
        <section>
          <h3>{labels.supportingTeams}</h3>
          <div className="software-links">
            {component.support_teams.map((item, index) => {
              const full = relatedComponent(catalog, item) || item;
              const target = projectLinks(full, release?.slug).project;
              return target ? (
                <a key={index} href={target}>
                  {item.code_name}
                </a>
              ) : (
                <span key={index}>{item.code_name}</span>
              );
            })}
          </div>
        </section>
      )}
      {video && (
        <section>
          <h3>{component.video_title || `${component.code_name} project update`}</h3>
          <p>{component.video_description}</p>
          {videoLoaded ? (
            <>
              <iframe
                className="software-video"
                src={video}
                title={component.video_title || `${component.code_name} project update`}
                allowFullScreen
              />
              <button onClick={() => setVideoLoaded(false)}>{labels.closeVideo}</button>
            </>
          ) : (
            <div className="software-video-prompt">
              <p>{labels.videoPrivacy}</p>
              <button onClick={() => setVideoLoaded(true)}>{labels.loadVideo}</button>
            </div>
          )}
        </section>
      )}
      {component.capability_tags?.length > 0 && (
        <section>
          <h3>{labels.capabilities}</h3>
          {capabilityGroups(component.capability_tags).map((group) => (
            <div key={group.name}>
              <h4>{group.name}</h4>
              <dl>
                {group.items.map((tag, index) => (
                  <React.Fragment key={index}>
                    <dt>
                      <a href={`${backHref}#${encodeURIComponent(tag.name)}`}>{tag.name}</a>
                    </dt>
                    {tag.description && <dd>{tag.description}</dd>}
                  </React.Fragment>
                ))}
              </dl>
            </div>
          ))}
        </section>
      )}
      {safeSoftwareLink(labels.proposeChangesToThisPage?.url) && (
        <p className="software-propose">
          <a href={safeSoftwareLink(labels.proposeChangesToThisPage.url)}>
            {labels.proposeChangesToThisPage.label}
          </a>
        </p>
      )}
    </article>
  );
}
