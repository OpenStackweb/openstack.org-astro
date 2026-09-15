import sharp from 'sharp';
import { readFileSync } from 'node:fs';
// A repository-owned graphic, separate from the legacy reader background.
const logo = readFileSync('public/images/openstack-logo.svg').toString('base64');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="#ffffff"/>
<rect width="20" height="630" fill="#ed1944"/>
<image href="data:image/svg+xml;base64,${logo}" x="80" y="60" width="270" height="70"/>
<text x="80" y="208" fill="#647787" font-family="Arial, sans-serif" font-size="24" letter-spacing="3">OPENSTACK WHITE PAPER</text>
<g fill="#004b76" font-family="Arial, sans-serif" font-weight="700" font-size="66">
<text x="80" y="310">Migrating from VMware</text>
<text x="80" y="395">to OpenStack</text>
</g>
<rect x="80" y="452" width="96" height="6" fill="#ed1944"/>
<text x="80" y="530" fill="#425968" font-family="Arial, sans-serif" font-size="28">openstack.org</text>
</svg>`;
await sharp(Buffer.from(svg)).png().toFile('public/images/social/vmware-white-paper.png');
