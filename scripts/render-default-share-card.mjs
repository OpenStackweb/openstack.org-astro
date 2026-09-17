import sharp from 'sharp';
import { readFileSync } from 'node:fs';

// Code-owned brand card. Keep the approved logo intact and avoid enlarging the
// legacy 200px JPEG. Run from the repository root when the brand changes.
const logo = readFileSync('public/images/openstack-logo.svg').toString('base64');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="#ffffff"/>
<rect width="20" height="630" fill="#ed1944"/>
<image href="data:image/svg+xml;base64,${logo}" x="90" y="100" width="540" height="140"/>
<g fill="#004b76" font-family="Arial, sans-serif" font-size="54" font-weight="700">
<text x="90" y="345">Open source. Open community.</text>
</g>
<rect x="90" y="410" width="96" height="6" fill="#ed1944"/>
<text x="90" y="510" fill="#425968" font-family="Arial, sans-serif" font-size="32">openstack.org</text>
</svg>`;
await sharp(Buffer.from(svg)).png().toFile('public/images/social/openstack.png');
