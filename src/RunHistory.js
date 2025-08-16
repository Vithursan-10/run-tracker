import React, { useEffect, useState } from 'react';
import { getRuns } from './api';
import { LuTimer } from "react-icons/lu";
import { LuMountain } from "react-icons/lu";
import { GiRunningShoe } from "react-icons/gi";
import { FaBuildingColumns } from "react-icons/fa6";
import axios from 'axios';

function RunHistory() {
  const [runs, setRuns] = useState([]);

  const styles = {
  summaryContainer: {
    backgroundColor: "#f0f4f8",
    padding: "1rem",
    borderRadius: "10px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    marginTop: "1rem",
    fontSize: "1.2rem",
    position: 'relative'
  }
};


  
  
  
  useEffect(() => {
    async function fetchRuns() {
      try {
        const data = await getRuns();
        setRuns(data);
      } catch (err) {
        console.error("Failed to load runs", err);
      }
    }

    fetchRuns();
  }, []);

 const deleteRun = async (id) => {
  console.log('Deleting run with ID:', id); 
  try {
    await axios.delete(`http://localhost:8080/api/runs/${id}`);
    setRuns((prevRuns) => prevRuns.filter((run) => run.id !== id));
  } catch (error) {
    console.error('Failed to delete run:', error);
  }
};

  return (
    <div style = {{display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem'}} >
      <h1>Past<FaBuildingColumns/>Runs</h1>
     <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
  {runs.map(run => (
    <li key={run.id}>
      <div style={styles.summaryContainer}>
        <button
          onClick={() => deleteRun(run.id)}
          style={{
            position: 'absolute',
            top: '0.5rem',
            right: '0.5rem',
            background: 'transparent',
            border: 'none',
            fontSize: '1.2rem',
            color: 'red',
            cursor: 'pointer',
          }}
          aria-label="Delete run"
        >
          ✕
        </button>
        <p>{new Date(run.date).toLocaleString()}</p>
        <p><LuTimer /> {run.minutes}:{run.seconds.toString().padStart(2, '0')}  <LuMountain /> {run.distance.toFixed(2)}km <GiRunningShoe /> {run.pace.toFixed(2)} /km</p>
      </div>
    </li>
  ))}
</ul>
    </div>
  );
}

export default RunHistory;
