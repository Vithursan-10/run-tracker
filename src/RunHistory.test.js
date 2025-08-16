import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RunHistory from './RunHistory';
import * as api from './api';

// Mock the API module and axios
jest.mock('./api', () => ({
  getRuns: jest.fn()
}));
jest.mock('axios', () => ({
  delete: jest.fn()
}));

// Mock the react-icons
jest.mock('react-icons/lu', () => ({
  LuTimer: () => <span>⏱️</span>,
  LuMountain: () => <span>⛰️</span>,
}));

jest.mock('react-icons/gi', () => ({
  GiRunningShoe: () => <span>👟</span>,
}));

jest.mock('react-icons/fa6', () => ({
  FaBuildingColumns: () => <span>🏛️</span>,
}));

const mockGetRuns = api.getRuns;
const mockAxiosDelete = require('axios').delete;

describe('RunHistory Component', () => {
  const mockRuns = [
    {
      id: 1,
      date: '2024-01-15T10:30:00.000Z',
      minutes: 25,
      seconds: 30,
      distance: 5.2,
      pace: 4.9
    },
    {
      id: 2,
      date: '2024-01-10T08:15:00.000Z',
      minutes: 32,
      seconds: 45,
      distance: 6.8,
      pace: 4.8
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 1. Component Rendering
  test('renders component title and run data correctly', async () => {
    mockGetRuns.mockResolvedValue(mockRuns);
    
    render(<RunHistory />);
    
    // Check title
    expect(screen.getByText(/Past/)).toBeInTheDocument();
    expect(screen.getByText(/Runs/)).toBeInTheDocument();
    
    // Check run data is displayed - using text content that includes the numbers
    await waitFor(() => {
      expect(screen.getByText(/5\.20/)).toBeInTheDocument();
    });
    
    // Use getAllByText for elements that appear multiple times
    expect(screen.getAllByText(/km/)).toHaveLength(2);
    expect(screen.getByText(/4\.90/)).toBeInTheDocument();
    expect(screen.getByText(/6\.80/)).toBeInTheDocument();
    expect(screen.getByText(/4\.80/)).toBeInTheDocument();
  });

  test('renders empty state when no runs available', async () => {
    mockGetRuns.mockResolvedValue([]);
    
    render(<RunHistory />);
    
    await waitFor(() => {
      expect(mockGetRuns).toHaveBeenCalledTimes(1);
    });
    
    expect(screen.queryByText(/km/)).not.toBeInTheDocument();
  });

  // 2. Data Fetching
  test('calls getRuns API on component mount', async () => {
    mockGetRuns.mockResolvedValue(mockRuns);
    
    render(<RunHistory />);
    
    expect(mockGetRuns).toHaveBeenCalledTimes(1);
    
    await waitFor(() => {
      expect(screen.getByText(/5\.20/)).toBeInTheDocument();
    });
  });

  test('handles API fetch error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockGetRuns.mockRejectedValue(new Error('API Error'));
    
    render(<RunHistory />);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load runs', expect.any(Error));
    });
    
    consoleSpy.mockRestore();
  });

  // 3. Delete Functionality
  test('successfully deletes run when delete button clicked', async () => {
    mockGetRuns.mockResolvedValue(mockRuns);
    mockAxiosDelete.mockResolvedValue({});
    
    render(<RunHistory />);
    
    await waitFor(() => {
      expect(screen.getByText(/5\.20/)).toBeInTheDocument();
    });
    
    // Verify both runs are initially present
    expect(screen.getAllByLabelText('Delete run')).toHaveLength(2);
    
    const deleteButtons = screen.getAllByLabelText('Delete run');
    fireEvent.click(deleteButtons[0]);
    
    await waitFor(() => {
      expect(mockAxiosDelete).toHaveBeenCalledWith('http://localhost:8080/api/runs/1');
    });
    
    // After successful delete, there should be only one delete button left
    await waitFor(() => {
      expect(screen.getAllByLabelText('Delete run')).toHaveLength(1);
    });
    
    // First run should be gone, second should remain
    expect(screen.queryByText(/5\.20/)).not.toBeInTheDocument();
    expect(screen.getByText(/6\.80/)).toBeInTheDocument();
  });

  test('handles delete error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockGetRuns.mockResolvedValue(mockRuns);
    mockAxiosDelete.mockRejectedValue(new Error('Delete failed'));
    
    render(<RunHistory />);
    
    await waitFor(() => {
      expect(screen.getByText(/5\.20/)).toBeInTheDocument();
    });
    
    const deleteButtons = screen.getAllByLabelText('Delete run');
    fireEvent.click(deleteButtons[0]);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to delete run:', expect.any(Error));
    });
    
    // Run should still be visible since delete failed
    expect(screen.getByText(/5\.20/)).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });
});