import type { Media, MediaList, MediaListOptions, MediaUploadOptions, Client } from 'tinacms';

/** Same-origin adapter: credentials remain in the Worker, never in the editor. */
export class R2MediaStore {
  accept = 'image/png,image/jpeg,image/webp,application/pdf';
  maxSize = 10 * 1024 * 1024;
  searchable = true;
  extensionFilterable = true;
  constructor(private client: Client) {}
  async request<T>(url: string, init?: RequestInit): Promise<T> {
    const response = await this.client.authProvider.fetchWithToken(url, init);
    const data = await response.json() as T & { error?: string };
    if (!response.ok) throw new Error(data.error || 'Media request failed. Please try again.');
    return data;
  }
  async list(options: MediaListOptions = {}) {
    const params = new URLSearchParams({ search: options.search || '', offset: String(options.offset || 0), ext: (options.ext || []).join(',') });
    return this.request<MediaList>(`/api/cms/media?${params}`);
  }
  async persist(files: MediaUploadOptions[]): Promise<Media[]> {
    const uploaded: Media[] = [];
    for (const { file } of files) {
      const body = new FormData(); body.append('file', file);
      uploaded.push(await this.request<Media>('/api/cms/media', { method: 'POST', body }));
    }
    return uploaded;
  }
  async delete(): Promise<void> {
    throw new Error('Proof assets are immutable. Select or upload a replacement; deletion is disabled to preserve existing pages.');
  }
}
