import 'leaflet/dist/leaflet.css';
const root = document.querySelector('[data-locations]');
if (root) {
 const locations = JSON.parse(root.dataset.locations);
 const failed = () => { root.querySelector('[data-map-error]').hidden = false; };
 try {
  const L = await import('leaflet');
  const mapElement = root.querySelector('.map');
  const map = L.map(mapElement, { scrollWheelZoom:false });
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom:19, referrerPolicy:'origin', attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }).on('tileerror', failed).addTo(map);
  const icon = L.divIcon({className:'archive-map-marker',html:'<span aria-hidden="true">●</span>',iconSize:[24,24],iconAnchor:[12,12]});
  for (const location of locations) {
   const popup = document.createElement('div');const title = document.createElement('strong');title.textContent=location.name;const address=document.createElement('p');address.textContent=location.address;popup.append(title,address);
   const marker = L.marker([location.lat,location.lng], {icon,title:location.name,alt:location.name}).bindPopup(popup).addTo(map);
   const button = [...root.querySelectorAll('[data-location]')].find(item => item.dataset.location === String(location.id));
   button.hidden=false;button.addEventListener('click',()=>{map.setView([location.lat,location.lng],15);marker.openPopup();mapElement.scrollIntoView({behavior:'smooth',block:'center'});});
  }
  map.fitBounds(locations.map(location=>[location.lat,location.lng]),{padding:[30,30],maxZoom:14});
 } catch { failed(); }
}
