
import './MainPage.css';
import React, { useState, useEffect, useRef } from 'react';
import RunSummary from './RunSummary';
import 'leaflet/dist/leaflet.css'; 
import RunMap from './RunMap';
import { saveRun } from './api';
import {FaPlay, FaStop} from 'react-icons/fa';
import { GiSpeaker, GiSpeakerOff } from "react-icons/gi";
import { LuTimer } from "react-icons/lu";
import { LuMountain } from "react-icons/lu";
import { GiRunningShoe } from "react-icons/gi";
import { FaRunning } from "react-icons/fa";
import { TbTargetArrow } from "react-icons/tb";

  //Haversine distance between two points
 
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

function getDistanceInKm(lat1, lng1, lat2, lng2) {
  const R = 6371; // Radius of the Earth in kilometers

  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function MainPage({ pastRuns, setPastRuns }) {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState({ minutes: 0, seconds: 0 });    
  const [positions, setPositions] = useState([]);
  const [distance, setDistance] = useState(0);
  const [targetPace, setTargetPace] = useState(null);
  const [audio, setAudio] = useState(false);
  const watchIdRef = useRef(null);
  const intervalRef = useRef(null);

 
  
  //Sample data to quickly test features 
  useEffect(() => {
    if (positions.length === 0) {
      setPositions([
        { lat: 51.5, lng: -0.1 },
        { lat: 51.501, lng: -0.101 },
        { lat: 51.502, lng: -0.102 }
      ]);
    }
  }, []); 

useEffect(() => {

 if (positions.length < 2) {
return; }

let total = 0;

for (let i =1; i < positions.length; i++)
{
let prev = positions[i-1];
let curr = positions[i];
let dist = getDistanceInKm(prev.lat, prev.lng, curr.lat, curr.lng);
total += dist;
}

setDistance(total);

}, [positions]);

const speakPace = () => {

if (!window.speechSynthesis) return;

  let message = `Your current pace is ${pace.toFixed(2)} minutes per kilometer.`;

   if (targetPace != null) {
    if (pace > targetPace) {
      message += " You are slower than your target pace.";
    } else {
      message += " You are faster than your target pace.";
    }
  }

  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = "en-US";
  utterance.rate = 1;

  window.speechSynthesis.speak(utterance);

};

useEffect(() => {

if (isRunning === true && time.seconds === 0 && (time.minutes > 0) && audio)
{
//audio function
speakPace();
}
  

}, [time, isRunning, audio]);

  
const startRun = () => {

setIsRunning(true);
 
//Start timer

  intervalRef.current = setInterval(() => {
    setTime(({ minutes, seconds }) => {
      if (seconds < 59) {
        return { minutes, seconds: seconds + 1 };
      } else {
        return { minutes: minutes + 1, seconds: 0 };
      }
    });
  }, 1000);




 //Start geolocation tracking

 if (navigator.geolocation) {
watchIdRef.current = navigator.geolocation.watchPosition( 
(pos) => {
const {latitude, longitude} = pos.coords;
setPositions(prev => [...prev, {lat: latitude, lng: longitude}]);

}, 
(err) => console.error(err),
{ enableHighAccuracy: true}
);
} 
else{
 alert("Geolocation not supported");
}
 };

const stopRun = () => {
setIsRunning(false);
clearInterval(intervalRef.current);
if (watchIdRef.current != null) {
navigator.geolocation.clearWatch(watchIdRef.current);
}

};

const pace = distance > 0 ? (time.minutes + time.seconds / 60) / distance : 0;


const saveRunToHistory = async () => {

const newRun = {
time,
distance,
pace,
minutes: time.minutes,
seconds: time.seconds,
targetPace,
date: new Date().toISOString()
};

  try {
    await saveRun(newRun);
    console.log("Run saved to backend");
  } catch (error) {
    console.error("Error saving run:", error);
  }


};

 
const resetRun = () => {
stopRun();
saveRunToHistory();
setTime({ minutes: 0, seconds: 0 });
setDistance(0);
setPositions([]);
};

const toggleRun = () => {
if (isRunning) {
stopRun();
}

else {
startRun();
}


};


  return (
 <div style = {{display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem'}}>
<h1> Run<FaRunning />Trackr</h1>




<div 
style ={{
width: '100%',
maxWidth: '340px',
margin: '0 auto', 
}}>

<div style={{ width: '100%', maxWidth: '600px', height: '300px', borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem', overflow: 'hidden'}}>
  <RunMap positions={positions} />
</div>


<div
  style={{
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: 'auto auto',
    gap: 0,
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: '1rem',
  }}
>
<div style={{  border: '1px solid #ccc', padding: '0.5rem', gridColumn: 'span 2' }}>
    <h1> {distance.toFixed(2)}km  </h1>
    <p1> Distance <LuMountain/> </p1>
  </div>

  <div style={{ border: '1px solid #ccc', padding: '0.5rem' }}>
  <h1 style={{ color: targetPace == null ? "black" : pace > targetPace ? "red" : "green" }}> {pace.toFixed(2)}/km </h1>
  <p1> Pace <GiRunningShoe/> </p1> 
  </div>
  <div style={{ border: '1px solid #ccc', padding: '0.5rem' }}>
    <h1>{time.minutes}:{time.seconds.toString().padStart(2, '0')} </h1>
    <p1> Time <LuTimer/> </p1>
    </div>

  <div style={{ border: "1px solid #ccc", padding: "0.5rem", gridColumn: 'span 2',  borderBottomLeftRadius: '1rem', 
    borderBottomRightRadius: '1rem' }}>
  
<div style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
  <h1>
  <input
    type="number"
    step="0.1"
    value={targetPace ?? ""}
    onChange={(e) => setTargetPace(parseFloat(e.target.value))}
    style={{
      width: "110px",
    fontSize: "3rem",
    fontWeight: "bold",
    backgroundColor: "transparent",   
    color: "inherit",                
    outline: "none",   
    border: "none",
    }}
  />
  </h1>
</div>
<p1>Target Pace <TbTargetArrow />  </p1>
</div>
    
</div>

</div>

<div style={{ paddingBottom: '4rem'}}>
  {!isRunning && distance > 0 && (
    <RunSummary time={time} distance={distance} pace={pace} />
  )}
</div>


{/* To test if postions are being tracked */}
{/* 
{positions.map((pos, i) => (
        <p key={i}>
          {i + 1}: Lat {pos.lat.toFixed(5)}, Lng {pos.lng.toFixed(5)}
        </p>
      ))} 
  */}



<div style={{
  position: 'fixed',
  bottom: '1rem',
  left: 0,
  right: 0,
  display: 'flex',
  justifyContent: 'center',
  gap: '1rem',
  padding: '0.5rem',
  background: 'rgba(255, 255, 255, 0.9)', // Optional slight background
  borderTop: '1px solid #ccc',
}}>
<button
  onClick={toggleRun}
  style={{
    backgroundColor: isRunning ? '#dc3545' : '#28a745',
    color: 'white',
    fontSize: '1rem',
    padding: '0.6rem 1.2rem',
    border: 'none',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  }}
>
  {isRunning ? <FaStop /> : <FaPlay />}
  
</button>
<button onClick = {resetRun}
  style={{
    backgroundColor:  '#dc3545',
    color: 'white',
    fontSize: '1rem',
    padding: '0.6rem 1.2rem',
    border: 'none',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  }}
>Finish</button>
<button onClick = {() => setAudio(prev => !prev)}
  style={{
    color: 'white',
    fontSize: '1rem',
    padding: '0.6rem 1.2rem',
    border: 'none',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  }}> {audio ? <GiSpeakerOff/> : <GiSpeaker />}  </button>
{isRunning && (
  <span
    style={{
      display: 'inline-block',
      width: 10,
      height: 10,
      borderRadius: '50%',
      backgroundColor: 'red',
      marginLeft: 5,
      marginTop: 15,
      animation: 'blink 1s infinite',
    }}
  />
)}
</div>

 </div> 

  );




}

export default MainPage;
