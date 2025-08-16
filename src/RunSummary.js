import { LuTimer } from "react-icons/lu";
import { LuMountain } from "react-icons/lu";
import { GiRunningShoe } from "react-icons/gi";


function RunSummary( {time, distance, pace} ) {


const styles = {
  summaryContainer: {
    backgroundColor: "#f0f4f8",
    padding: "1rem",
    borderRadius: "10px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    marginTop: "1rem",
    fontSize: "1.2rem"
  }
};

return (
<div style={styles.summaryContainer}>
    <h2>🏁 Run Summary</h2>
    <p><strong><LuMountain/></strong> {distance.toFixed(2)}km</p>
    <p><strong><LuTimer/></strong> {String(time.minutes).padStart(2, '0')}:{String(time.seconds).padStart(2, '0')}</p>
    <p><strong><GiRunningShoe/></strong> {pace.toFixed(2)}/km</p>
  </div>

);


}

export default RunSummary;







