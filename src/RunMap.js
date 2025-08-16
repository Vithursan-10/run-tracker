import React from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import {useEffect} from 'react';
import { FaLocationDot } from "react-icons/fa6";
import { FaFlagCheckered } from "react-icons/fa";
import ReactDOMServer from 'react-dom/server';
import L from 'leaflet';

function RunMap({positions}) {

const defaultPosition = [51.505, -0.09];

const centerPosition = positions.length > 0 ? [positions[positions.length - 1].lat, positions[positions.length - 1].lng]
    : defaultPosition;

const iconHTML = ReactDOMServer.renderToString(<FaLocationDot color="red" size={24} />);
const secondHTML = ReactDOMServer.renderToString(<FaFlagCheckered color="black" size={24} />);


const customIcon = L.divIcon({
  html: iconHTML,
  className: '', // prevent Leaflet default styles
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const secondIcon = L.divIcon({
  html: secondHTML,
  className: '', // prevent Leaflet default styles
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});


//Recenters map to user's location
function RecenterMap({position}) {

const Map = useMap();
useEffect( () => {

if (position) {
 Map.setView(position, Map.getZoom());
    }
  }, [position]);
  return null;
}

return (

<MapContainer center={centerPosition} zoom={13} style={{ height: '300px', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
    
    <RecenterMap position={positions[positions.length - 1]} />


     {/* Draw the route polyline if there are positions */}
      {positions.length > 1 && (
        <Polyline
          positions={positions.map(pos => [pos.lat, pos.lng])}
          color="blue"
        />
      )}
    
      {/* Marker for starting position */}
      {positions.length > 0 && (
        <Marker position={[positions[0].lat, positions[0].lng]} icon={customIcon} >
        <Popup>Start</Popup>
        </Marker>
      )}

        {/* Marker for current position */}
      {positions.length > 0 && (
        <Marker position={[positions[positions.length - 1].lat, positions[positions.length - 1].lng]} icon={secondIcon}>
           <Popup>Current Location</Popup>
        </Marker>
      )}
    </MapContainer>




);

}

export default RunMap;