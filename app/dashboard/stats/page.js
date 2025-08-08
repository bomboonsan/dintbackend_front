'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import withAuth from '@/components/withAuth';
import { agentsAPI } from '@/lib/api';
import { Calendar, TrendingUp, Users, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

function StatsPage() {
  const [stats, setStats] = useState({
    summary: null,
    chartData: []
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('daily');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    // Set default date range (last 7 days)
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);
    
    setFromDate(lastWeek.toISOString().split('T')[0]);
    setToDate(today.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (fromDate && toDate) {
      fetchStats();
    }
  }, [fromDate, toDate, dateRange]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const params = {
        from: fromDate ? new Date(fromDate).toISOString() : undefined,
        to: toDate ? new Date(toDate).toISOString() : undefined,
      };
      
      // Remove undefined values
      Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);
      
      const [summaryResponse, timeseriesResponse] = await Promise.all([
        agentsAPI.getStats(params),
        agentsAPI.getTimeseries({ 
          ...params, 
          interval: dateRange === 'daily' ? 'day' : 'month' 
        })
      ]);
      
      const summary = summaryResponse.data;
      const timeseries = timeseriesResponse.data;
      
      setStats({
        summary,
        chartData: timeseries?.items || []
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
        console.warn('Using mock data for stats');
        // Use existing mock data
        setStats({
          summary: mockData.summary,
          chartData: mockData.chartData
        });
      } else {
        toast.error('Failed to fetch statistics');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString();
  };

  const mockData = {
    summary: {
      total: 145,
      unique_agent_codes: 89,
      first_at: '2024-01-01T00:00:00Z',
      last_at: new Date().toISOString()
    },
    chartData: [
      { date: '2024-08-01', count: 15 },
      { date: '2024-08-02', count: 23 },
      { date: '2024-08-03', count: 18 },
      { date: '2024-08-04', count: 31 },
      { date: '2024-08-05', count: 28 },
      { date: '2024-08-06', count: 19 },
      { date: '2024-08-07', count: 25 },
    ]
  };

  const statCards = [
    {
      name: 'Total Agents',
      value: stats.summary?.total || mockData.summary.total,
      change: '+12%',
      changeType: 'increase',
      icon: Users,
    },
    {
      name: 'Unique Codes',
      value: stats.summary?.unique_agent_codes || mockData.summary.unique_agent_codes,
      change: '+8%',
      changeType: 'increase',
      icon: Activity,
    },
    {
      name: 'Today Activity',
      value: stats.chartData?.[stats.chartData.length - 1]?.count || mockData.chartData[mockData.chartData.length - 1]?.count,
      change: '+5%',
      changeType: 'increase',
      icon: TrendingUp,
    },
    {
      name: 'Days Active',
      value: stats.chartData?.length || mockData.chartData.length,
      change: 'Current period',
      changeType: 'neutral',
      icon: Calendar,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Statistics</h1>
            <p className="text-gray-600">Analytics and insights for your agents</p>
          </div>
        </div>

        {/* Date Range Controls */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Group By
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <button
                onClick={fetchStats}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.name}
                className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow-sm border border-gray-200"
              >
                <dt>
                  <div className="absolute rounded-md bg-blue-500 p-3">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <p className="ml-16 truncate text-sm font-medium text-gray-500">
                    {stat.name}
                  </p>
                </dt>
                <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
                  <p className="text-2xl font-semibold text-gray-900">
                    {loading ? (
                      <div className="animate-pulse h-8 w-16 bg-gray-200 rounded"></div>
                    ) : (
                      stat.value
                    )}
                  </p>
                  <p
                    className={`ml-2 flex items-baseline text-sm font-semibold ${
                      stat.changeType === 'increase'
                        ? 'text-green-600'
                        : stat.changeType === 'decrease' 
                        ? 'text-red-600'
                        : 'text-gray-600'
                    }`}
                  >
                    {stat.change}
                  </p>
                </dd>
              </div>
            );
          })}
        </div>

        {/* Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Agent Activity Over Time</h3>
            <div className="text-sm text-gray-500">
              {formatDate(fromDate)} - {formatDate(toDate)}
            </div>
          </div>
          
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-2">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="grid grid-cols-7 gap-2">
                  {Array(7).fill().map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Simple Bar Chart */}
              <div className="flex items-end space-x-2 h-64">
                {(stats.chartData || mockData.chartData).map((item, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-blue-500 rounded-t"
                      style={{
                        height: `${(item.count / Math.max(...(stats.chartData || mockData.chartData).map(d => d.count))) * 200}px`,
                        minHeight: '20px'
                      }}
                    />
                    <div className="text-xs text-gray-500 mt-2 transform rotate-45 origin-left">
                      {formatDate(item.date)}
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {item.count}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Legend */}
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                  Agent Activities
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Detailed Statistics</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agent Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Growth
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  Array(5).fill().map((_, i) => (
                    <tr key={i}>
                      {Array(4).fill().map((_, j) => (
                        <td key={j} className="px-6 py-4 whitespace-nowrap">
                          <div className="animate-pulse h-4 bg-gray-200 rounded"></div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  (stats.chartData || mockData.chartData).map((item, index) => {
                    const chartData = stats.chartData || mockData.chartData;
                    const prevCount = index > 0 ? chartData[index - 1].count : item.count;
                    const growth = item.count - prevCount;
                    const growthPercentage = prevCount > 0 ? ((growth / prevCount) * 100).toFixed(1) : '0';
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatDate(item.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={`${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {growth >= 0 ? '+' : ''}{growth}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={`${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {growth >= 0 ? '+' : ''}{growthPercentage}%
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default withAuth(StatsPage);
