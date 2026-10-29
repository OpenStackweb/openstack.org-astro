import React, { useMemo, useState, useEffect } from 'react';
import {
  APIProvider,
  Map,
  useMap,
  InfoWindow,
  useApiLoadingStatus,
  APILoadingStatus,
} from '@vis.gl/react-google-maps';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
function MapAvailability({ children }) {
  const status = useApiLoadingStatus();
  if ([APILoadingStatus.AUTH_FAILURE, APILoadingStatus.FAILED].includes(status))
    return (
      <p role="status">
        The map is unavailable for this preview. All providers remain available below.
      </p>
    );
  return children;
}
function ClusteredLocations({ points, onSelect }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const markers = points.map((point) => {
      const marker = new google.maps.Marker({
        position: { lat: point.lat, lng: point.lng },
        title: `${point.record.name} — ${point.city || point.country}${point.record.tested ? ' — OpenStack Powered' : ''}`,
        ...(point.record.tested
          ? {
              icon: {
                url: '/images/marketplace/openstack-powered.png',
                scaledSize: new google.maps.Size(48, 32),
              },
            }
          : {}),
      });
      marker.addListener('click', () => onSelect(point));
      return marker;
    });
    const clusterer = new MarkerClusterer({ map, markers });
    return () => {
      clusterer.clearMarkers();
      clusterer.setMap(null);
      markers.forEach((marker) => {
        google.maps.event.clearInstanceListeners(marker);
        marker.setMap(null);
      });
    };
  }, [map, points, onSelect]);
  return null;
}

export default function ProviderMap({ records, apiKey, detail = false }) {
  const [selected, setSelected] = useState(null);
  const [failed, setFailed] = useState(false);
  const points = useMemo(
    () =>
      records
        .flatMap((record) =>
          record.locations.map((p, i) => ({ ...p, id: `${record.id}-${i}`, record })),
        )
        .filter(
          (p) =>
            Number.isFinite(p.lat) &&
            Number.isFinite(p.lng) &&
            Math.abs(p.lat) <= 90 &&
            Math.abs(p.lng) <= 180,
        ),
    [records],
  );
  useEffect(() => setSelected(null), [records]);
  if (!points.length) return null;
  if (!apiKey)
    return (
      <p role="status">
        Map configuration is pending. All providers remain available in the list below.
      </p>
    );
  if (failed) return <p role="status">The map is unavailable. Browse the provider list below.</p>;
  return (
    <APIProvider apiKey={apiKey} onError={() => setFailed(true)}>
      <MapAvailability>
        <section aria-label="Provider locations" className="marketplace-map">
          <Map
            defaultCenter={{ lat: 20, lng: 0 }}
            defaultZoom={2}
            defaultBounds={
              detail
                ? {
                    north: Math.max(...points.map((p) => p.lat)),
                    south: Math.min(...points.map((p) => p.lat)),
                    east: Math.max(...points.map((p) => p.lng)),
                    west: Math.min(...points.map((p) => p.lng)),
                    padding: 40,
                  }
                : undefined
            }
            maxZoom={detail ? 10 : undefined}
            gestureHandling="cooperative"
            disableDefaultUI={false}
          >
            <ClusteredLocations points={points} onSelect={setSelected} />
            {selected && (
              <InfoWindow
                position={{ lat: selected.lat, lng: selected.lng }}
                onCloseClick={() => setSelected(null)}
              >
                <strong>{selected.record.name}</strong>
                {selected.record.tested && (
                  <p>
                    <img
                      src="/images/marketplace/openstack-powered.png"
                      width="120"
                      alt="OpenStack Powered"
                    />
                  </p>
                )}
                <p>{[selected.city, selected.country].filter(Boolean).join(', ')}</p>
                {selected.region && <p>Region: {selected.region}</p>}
                {selected.endpoint && (
                  <p>
                    <a href={selected.endpoint}>API endpoint</a>
                  </p>
                )}
                {!!selected.availabilityZones?.length && (
                  <p>Availability zones: {selected.availabilityZones.join(', ')}</p>
                )}
                {!detail && <a href={selected.record.href}>View provider details</a>}
              </InfoWindow>
            )}
          </Map>
        </section>
      </MapAvailability>
    </APIProvider>
  );
}
