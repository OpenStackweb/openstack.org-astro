import test from 'node:test';
import assert from 'node:assert/strict';
import { paperDownloadFor, paperDownloadAssetFor } from '../../src/lib/server/paper-downloads.mjs';
import revisions from '../../src/lib/content/paper-pdf-revisions.json' with { type: 'json' };
import media from '../../src/lib/content/media.json' with { type: 'json' };

test('PDF corrections preserve paper identities, translation routing and registered assets', () => {
  const path = '/use-cases/containers/leveraging-containers-and-openstack/';
  assert.equal(paperDownloadFor(path), '3045-en-us');
  assert.equal(paperDownloadAssetFor(path), revisions['3045-en-us'].path);
  assert.equal(paperDownloadAssetFor(path, 'ja_JP'), '/assets/research-pdfs/3045-ja-jp.pdf');
  assert.equal(paperDownloadAssetFor(path, 'unknown'), revisions['3045-en-us'].path);
  assert.equal(paperDownloadAssetFor('/not-a-paper/'), null);
  assert.ok(media['assets/research-pdfs/3045-en-us.pdf'], 'old asset remains available');
  for (const revision of Object.values(revisions)) {
    assert.match(
      revision.path,
      /^\/assets\/research-pdfs\/\d+-[a-z]{2}-[a-z]{2}-[a-f0-9]{12}\.pdf$/,
    );
    const asset = media[revision.path.slice(1)];
    assert.equal(asset.sha256, revision.sha256);
    assert.equal(asset.contentType, 'application/pdf');
    assert.equal(asset.disposition, 'inline');
  }
});
