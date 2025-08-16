import React, { useEffect, useState } from 'react';
import axios from 'axios'; 
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { BsGraphUp } from "react-icons/bs";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './ChartsPage.css';

function ChartsPage() {
  const [runData, setRunData] = useState([]);
  const [barData, setBarData] = useState([]);
  const [runDates, setRunDates] = useState([]);
  const [streak, setStreak] = useState(0);

  function calculateStreak(runDateTimestamps) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // normalize to midnight
    
    let streak = 0;
    const todayTime = today.getTime();
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(todayTime - (i * 24 * 60 * 60 * 1000));
      
      if (runDateTimestamps.includes(checkDate.getTime())) {
        streak++;
      } else {
        if (i !== 0) break; // Allow for today to not have a run yet
      }
    }
    return streak;
  }

  useEffect(() => {
    axios.get('http://localhost:8080/api/runs')
      .then(response => {
        const data = response.data.map(run => ({
          date: new Date(run.date).toLocaleString([], {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
          }),
          distance: run.distance.toFixed(2)
        }));
        setRunData(data);
      
        const runCounts = {};
        response.data.forEach(run => {
          const month = new Date(run.date).toLocaleString('default', { month: 'short' });
          runCounts[month] = (runCounts[month] || 0) + 1;
        });

        // Convert to array for the chart
        const formattedData = Object.keys(runCounts).map(month => ({
          month,
          runs: runCounts[month],
        }));

        // Sort by calendar month order
        const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        formattedData.sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month));

        setBarData(formattedData);

        const dates = [...new Set(
          response.data.map(run => {
            const d = new Date(run.date);
            d.setHours(0, 0, 0, 0); // normalize time to midnight
            return d.getTime();     // use timestamp for comparison
          })
        )];
        
        setRunDates(dates);
        setStreak(calculateStreak(dates));
      })
      .catch(error => {
        console.error('Error fetching run data:', error);
      });
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ textAlign: 'center' }}>Run<BsGraphUp/>Analytics</h1>

      <h2 style={{ textAlign: 'center' }}>🏃‍♂️Streak: {streak} day{streak === 1 ? '' : 's'}</h2>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'center',   
        marginTop: '2rem',
        padding: '1rem',
        borderRadius: '1rem',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        backgroundColor: 'white',
        maxWidth: '400px',
        marginLeft: 'auto',
        marginRight: 'auto' 
      }}>
        <Calendar 
          tileClassName={({ date }) => {
            const normalized = new Date(date);
            normalized.setHours(0, 0, 0, 0); 
            return runDates.includes(normalized.getTime()) ? 'highlight' : null;
          }}
        />
      </div>

      <div style={{ 
        padding: '1rem',
        borderRadius: '1rem',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        backgroundColor: 'white',
        maxWidth: '700px',
        marginLeft: 'auto',
        marginRight: 'auto',
        marginTop: '1rem' 
      }}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={runData}>
            <XAxis dataKey="date" />
            <YAxis label={{ value: 'Distance(km)', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Line type="monotone" dataKey="distance" stroke="#8884d8" strokeWidth={2} dot={true} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div style={{ 
        padding: '1rem',
        borderRadius: '1rem',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        backgroundColor: 'white',
        maxWidth: '700px',
        marginLeft: 'auto',
        marginRight: 'auto',
        marginTop: '1rem'
      }}>
        <ResponsiveContainer width="100%" height={300}>   
          <BarChart data={barData}>
            <XAxis dataKey="month" />
            <YAxis label={{ value: 'Runs', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Bar dataKey="runs" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ChartsPage;