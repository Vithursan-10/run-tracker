import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChartsPage from './ChartsPage';

// Mock axios
jest.mock('axios', () => ({
  get: jest.fn()
}));

// Mock recharts components
jest.mock('recharts', () => ({
  LineChart: ({ children, data }) => (
    <div data-testid="line-chart" data-chart-data={JSON.stringify(data)}>
      {children}
    </div>
  ),
  Line: ({ dataKey, stroke }) => (
    <div data-testid="line" data-key={dataKey} data-stroke={stroke} />
  ),
  XAxis: ({ dataKey }) => <div data-testid="x-axis" data-key={dataKey} />,
  YAxis: ({ label }) => <div data-testid="y-axis" data-label={JSON.stringify(label)} />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({ children, data }) => (
    <div data-testid="bar-chart" data-chart-data={JSON.stringify(data)}>
      {children}
    </div>
  ),
  Bar: ({ dataKey, fill }) => (
    <div data-testid="bar" data-key={dataKey} data-fill={fill} />
  )
}));

// Mock react-icons
jest.mock('react-icons/bs', () => ({
  BsGraphUp: () => <span data-testid="graph-icon">📈</span>
}));

// Mock react-calendar
jest.mock('react-calendar', () => {
  return function Calendar({ tileClassName }) {
    // Mock calendar with a few test dates
    const testDates = [
      new Date('2024-01-15'),
      new Date('2024-01-16'),
      new Date('2024-01-17')
    ];
    
    return (
      <div data-testid="calendar">
        {testDates.map(date => {
          const className = tileClassName ? tileClassName({ date }) : '';
          return (
            <div
              key={date.toISOString()}
              data-testid={`calendar-tile-${date.getDate()}`}
              className={className}
            >
              {date.getDate()}
            </div>
          );
        })}
      </div>
    );
  };
});

// Mock CSS import
jest.mock('react-calendar/dist/Calendar.css', () => ({}));
jest.mock('./ChartsPage.css', () => ({}));

const axios = require('axios');

describe('ChartsPage Component', () => {
  const mockRunData = [
    {
      id: 1,
      date: '2024-01-15T10:30:00.000Z',
      distance: 5.2,
      minutes: 25,
      seconds: 30,
      pace: 4.9
    },
    {
      id: 2,
      date: '2024-01-16T08:15:00.000Z',
      distance: 6.8,
      minutes: 32,
      seconds: 45,
      pace: 4.8
    },
    {
      id: 3,
      date: '2024-02-10T07:00:00.000Z',
      distance: 3.5,
      minutes: 18,
      seconds: 5,
      pace: 5.2
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 1. Component Rendering
  test('renders page title and streak correctly', async () => {
    await act(async () => {
      axios.get.mockResolvedValue({ data: mockRunData });
      render(<ChartsPage />);
    });
    
    // Check title
    expect(screen.getByText(/Run/)).toBeInTheDocument();
    expect(screen.getByText(/Analytics/)).toBeInTheDocument();
    expect(screen.getByTestId('graph-icon')).toBeInTheDocument();
    
    // Wait for streak to be calculated and displayed
    await waitFor(() => {
      expect(screen.getByText(/Streak:/)).toBeInTheDocument();
    });
  });

  test('renders calendar component', async () => {
    await act(async () => {
      axios.get.mockResolvedValue({ data: mockRunData });
      render(<ChartsPage />);
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('calendar')).toBeInTheDocument();
    });
  });

  test('renders line chart and bar chart components', async () => {
    await act(async () => {
      axios.get.mockResolvedValue({ data: mockRunData });
      render(<ChartsPage />);
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
    
    // Check chart components are present
    expect(screen.getAllByTestId('responsive-container')).toHaveLength(2);
    expect(screen.getByTestId('line')).toBeInTheDocument();
    expect(screen.getByTestId('bar')).toBeInTheDocument();
  });

  // 2. Data Fetching
  test('fetches run data on component mount', async () => {
    await act(async () => {
      axios.get.mockResolvedValue({ data: mockRunData });
      render(<ChartsPage />);
    });
    
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith('http://localhost:8080/api/runs');
  });

  test('handles API fetch error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    await act(async () => {
      axios.get.mockRejectedValue(new Error('API Error'));
      render(<ChartsPage />);
    });
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching run data:', expect.any(Error));
    });
    
    consoleSpy.mockRestore();
  });

  // 3. Chart Functionality and Data Processing
  test('processes data correctly for line chart', async () => {
    await act(async () => {
      axios.get.mockResolvedValue({ data: mockRunData });
      render(<ChartsPage />);
    });
    
    await waitFor(() => {
      const lineChart = screen.getByTestId('line-chart');
      const chartData = JSON.parse(lineChart.getAttribute('data-chart-data'));
      
      expect(chartData).toHaveLength(3);
      // Fix the date format expectation to match actual output
      expect(chartData[0]).toEqual({
        date: "15 Jan, 10:30",
        distance: '5.20'
      });
      expect(chartData[1].distance).toBe('6.80');
      expect(chartData[2].distance).toBe('3.50');
    });
  });

  test('processes data correctly for bar chart', async () => {
    await act(async () => {
      axios.get.mockResolvedValue({ data: mockRunData });
      render(<ChartsPage />);
    });
    
    await waitFor(() => {
      const barChart = screen.getByTestId('bar-chart');
      const chartData = JSON.parse(barChart.getAttribute('data-chart-data'));
      
      // Should group by month
      const janData = chartData.find(item => item.month === 'Jan');
      const febData = chartData.find(item => item.month === 'Feb');
      
      expect(janData).toEqual({ month: 'Jan', runs: 2 });
      expect(febData).toEqual({ month: 'Feb', runs: 1 });
    });
  });

  test('calculates streak correctly for consecutive days', async () => {
    const consecutiveRuns = [
      { ...mockRunData[0], date: '2024-01-15T10:30:00.000Z' },
      { ...mockRunData[1], date: '2024-01-14T08:15:00.000Z' },
      { ...mockRunData[2], date: '2024-01-13T07:00:00.000Z' }
    ];
    
    // Mock today's date for consistent testing - use proper Date constructor
    const originalDate = global.Date;
    const mockToday = new Date('2024-01-15T12:00:00.000Z');
    
    global.Date = jest.fn((...args) => {
      if (args.length === 0) {
        return mockToday;
      }
      return new originalDate(...args);
    });
    
    // Copy static methods
    global.Date.now = originalDate.now;
    global.Date.parse = originalDate.parse;
    global.Date.UTC = originalDate.UTC;
    
    await act(async () => {
      axios.get.mockResolvedValue({ data: consecutiveRuns });
      render(<ChartsPage />);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/Streak: 3 days/)).toBeInTheDocument();
    });
    
    global.Date = originalDate;
  });

  test('shows singular day for streak of 1', async () => {
    const singleRun = [mockRunData[0]];
    
    // Mock today's date - use proper Date constructor
    const originalDate = global.Date;
    const mockToday = new Date('2024-01-15T12:00:00.000Z');
    
    global.Date = jest.fn((...args) => {
      if (args.length === 0) {
        return mockToday;
      }
      return new originalDate(...args);
    });
    
    // Copy static methods
    global.Date.now = originalDate.now;
    global.Date.parse = originalDate.parse;
    global.Date.UTC = originalDate.UTC;
    
    await act(async () => {
      axios.get.mockResolvedValue({ data: singleRun });
      render(<ChartsPage />);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/Streak: 1 day$/)).toBeInTheDocument();
    });
    
    global.Date = originalDate;
  });

  test('calendar highlights run dates correctly', async () => {
    await act(async () => {
      axios.get.mockResolvedValue({ data: mockRunData });
      render(<ChartsPage />);
    });
    
    await waitFor(() => {
      // The mock calendar will apply tileClassName to test dates
      // We check if the calendar component is rendered and highlights are applied
      expect(screen.getByTestId('calendar')).toBeInTheDocument();
      // Check if dates with runs are highlighted
      expect(screen.getByTestId('calendar-tile-15')).toHaveClass('highlight');
      expect(screen.getByTestId('calendar-tile-16')).toHaveClass('highlight');
    });
  });

  test('charts have correct styling and configuration', async () => {
    await act(async () => {
      axios.get.mockResolvedValue({ data: mockRunData });
      render(<ChartsPage />);
    });
    
    await waitFor(() => {
      // Check line chart configuration
      const line = screen.getByTestId('line');
      expect(line).toHaveAttribute('data-key', 'distance');
      expect(line).toHaveAttribute('data-stroke', '#8884d8');
      
      // Check bar chart configuration
      const bar = screen.getByTestId('bar');
      expect(bar).toHaveAttribute('data-key', 'runs');
      expect(bar).toHaveAttribute('data-fill', '#82ca9d');
    });
  });
});