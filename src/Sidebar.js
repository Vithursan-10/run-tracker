import React from 'react';
import { Link } from 'react-router-dom';
import { FaBuildingColumns } from "react-icons/fa6";
import { FaHome } from "react-icons/fa";
import { BsGraphUp } from "react-icons/bs";

function Sidebar({ isOpen, onClose }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: isOpen ? 0 : '-200px',
        width: '100px',
        height: '100%',
        backgroundColor: '#f5f5f5',
        padding: '2rem 0',
        boxShadow: '2px 0 5px rgba(0,0,0,0.3)',
        transition: 'left 0.3s ease-in-out',
        zIndex: 1000,
      }}
    >
      
        <ul style={{
        listStyle: 'none',
        padding: 0,
        marginTop: '5rem',
        display: 'flex',
        flexDirection: 'column',
        marginLeft: '2rem',
        gap: '2rem',
        fontSize: '2rem',
      }}>
        <li>
          <Link to="/" onClick={onClose} style={{ textDecoration: 'none' }}><FaHome /> </Link>
        </li>
        <li>
          <Link to="/history" onClick={onClose}style={{ textDecoration: 'none' }}> <FaBuildingColumns/> </Link>
        </li>
        <li>
          <Link to="/analytics" onClick={onClose}style={{ textDecoration: 'none' }}> <BsGraphUp /> </Link>
        </li>
      </ul>
      
      
    </div>
  );
}

export default Sidebar;
