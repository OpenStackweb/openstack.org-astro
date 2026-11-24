/** Public branding metadata is owned by Software admin, never Tina. */
export async function loadMascotGallery(fetcher = fetch) {
  try {
    const response = await fetcher('https://software.openstack.org/api/public/mascot-gallery/', {
      signal: AbortSignal.timeout(8000),
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error(`Mascot service returned ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data.mascots)) throw new Error('Invalid mascot gallery');
    return {
      available: true,
      mascots: data.mascots.map((mascot) => ({
        project: String(mascot.project),
        name: String(mascot.name),
        downloads: (mascot.downloads || [])
          .filter((item) => {
            try {
              const url = new URL(item.url);
              return url.protocol === 'https:' && !url.username && !url.password;
            } catch {
              return false;
            }
          })
          .map((item) => ({ label: String(item.label), url: item.url })),
      })),
    };
  } catch (error) {
    console.error(
      'Mascot gallery unavailable:',
      error instanceof Error ? error.message : 'Invalid response',
    );
    return { available: false, mascots: [] };
  }
}
