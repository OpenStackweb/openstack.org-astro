import event0 from '../content/archive-events/san-francisco-2012.json' with { type: 'json' };
import event1 from '../content/archive-events/openstack-summit-hong-kong-2013.json' with { type: 'json' };
import event2 from '../content/archive-events/openstack-summit-atlanta-2014.json' with { type: 'json' };
import event3 from '../content/archive-events/openstack-paris-summit-2014.json' with { type: 'json' };
import event4 from '../content/archive-events/vancouver-2015.json' with { type: 'json' };
import event5 from '../content/archive-events/san-diego-2012.json' with { type: 'json' };
import event6 from '../content/archive-events/portland-2013.json' with { type: 'json' };
import landings from '../content/archive-event-landings.json' with { type: 'json' };
const records = [event0, event1, event2, event3, event4, event5, event6];
const shared = records.map(({ eventId, ...record }) => ({ id: eventId, ...record }));
export default {
  events: shared.map((event) => ({
    ...landings.events.find((row) => row.id === event.id),
    ...event,
  })),
};
