/* Leaflet is vendored locally; only map tiles are requested externally. */
if (window.L) {
 const position=[41.822322,-8.436533];
 const map=L.map('map',{scrollWheelZoom:false}).setView(position,17);
 L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
  maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a>'
 }).addTo(map);
 const icon=L.divIcon({className:'capiarcos-pin',iconSize:[30,42],iconAnchor:[15,42],popupAnchor:[0,-38],html:'<svg xmlns="http://www.w3.org/2000/svg" width="30" height="42" viewBox="0 0 30 42" aria-hidden="true"><path fill="#682725" stroke="#fff" stroke-width="1.5" d="M15 1C7.3 1 1 7.3 1 15c0 10 14 26 14 26s14-16 14-26C29 7.3 22.7 1 15 1Z"/><circle cx="15" cy="15" r="5" fill="#fff"/></svg>'});
 L.marker(position,{icon,title:'Capiarcos',alt:'Localização da Capiarcos'}).addTo(map).bindPopup('Capiarcos — Zona Industrial de Mogueiras, Tabaçô');
 document.querySelector('.map-fallback')?.remove();
}
