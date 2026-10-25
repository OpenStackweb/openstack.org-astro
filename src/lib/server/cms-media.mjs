export const uploadPrefix = 'cms-proof/';
export const maxUpload = 10 * 1024 * 1024;
export function fileType(bytes) {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return ['jpg', 'image/jpeg'];
  if ([137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v))
    return ['png', 'image/png'];
  const ascii = new TextDecoder().decode(bytes.slice(0, 12));
  if (ascii.startsWith('RIFF') && ascii.slice(8) === 'WEBP') return ['webp', 'image/webp'];
  if (ascii.startsWith('%PDF-')) return ['pdf', 'application/pdf'];
  return null;
}
export const proofMediaKey = (path) => /^cms-proof\/[a-f0-9]{64}\.(png|jpg|webp|pdf)$/.test(path);
export function mediaItem(src, filename) {
  // Tina uses separate keys for list, grid and detail views. These currently
  // reuse the protected original; generated/resized previews are a later step.
  return {
    type: 'file',
    id: src,
    src,
    filename,
    directory: '',
    thumbnails: /\.pdf$/i.test(src)
      ? undefined
      : { '75x75': src, '400x400': src, '1000x1000': src },
  };
}
