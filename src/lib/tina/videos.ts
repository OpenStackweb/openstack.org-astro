import { requestWithMetadata } from '@tinacms/astro';
import { videos } from '../../../tina/schema/videos';
import content from '../content/videos.json';
import { document } from './document';
export function loadVideos() {
  const entry = document(videos, 'videos', content);
  return requestWithMetadata({
    query: `query VideosEditor { ${entry.selection} }`,
    variables: {},
    data: { videos: entry.data },
  });
}
