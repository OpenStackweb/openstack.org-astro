import essex from '../content/software-archives/essex.json' with { type: 'json' };
import folsom from '../content/software-archives/folsom.json' with { type: 'json' };
import grizzly from '../content/software-archives/grizzly.json' with { type: 'json' };
import havana from '../content/software-archives/havana.json' with { type: 'json' };
import icehouse from '../content/software-archives/icehouse.json' with { type: 'json' };
import juno from '../content/software-archives/juno.json' with { type: 'json' };
import kilo from '../content/software-archives/kilo.json' with { type: 'json' };
import { renderEditorialBody } from './editorial.mjs';

const records = [essex, folsom, grizzly, havana, icehouse, juno, kilo];
export const historicalReleasePaths = records.map(record => record.path);
export function historicalReleaseFor(path) {
  const canonical = path.endsWith('/') ? path : `${path}/`;
  const record = records.find(record => record.path === canonical);
  return record ? { ...record, html: renderEditorialBody(record.body, record.path) } : null;
}
