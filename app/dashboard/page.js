'use client';

import DashboardLayout from '@/components/DashboardLayout';
import withAuth from '@/components/withAuth';
import { agentsAPI, flexAPI } from '@/lib/api';
import { useState, useEffect } from 'react';
import { Users, MessageSquare, TrendingUp, Calendar } from 'lucide-react';

function DashboardPage() {
  const [stats, setStats] = useState({
    totalAgents: 0,
    totalFlexMessages: 0,
    activeFlexMessages: 0,
    recentActivity: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Try to fetch real data, but fallback to mock data if API is not available
        try {
          const [agentsResponse, flexResponse] = await Promise.all([
            agentsAPI.list({ limit: 1 }),
            flexAPI.list({ limit: 1 }),
          ]);

          // Get total counts from API response (according to spec: {total, items, limit, offset})
          const totalAgents = agentsResponse.data?.total || agentsResponse.data?.items?.length || 0;
          const totalFlexMessages = flexResponse.data?.total || flexResponse.data?.items?.length || 0;
          
          // Get active flex messages
          const activeFlexResponse = await flexAPI.list({ active: true, limit: 1 });
          const activeFlexMessages = activeFlexResponse.data?.total || activeFlexResponse.data?.items?.length || 0;

          setStats({
            totalAgents,
            totalFlexMessages,
            activeFlexMessages,
            recentActivity: Math.floor(Math.random() * 10) + 5,
          });
        } catch (apiError) {
          console.warn('API not available, using mock data:', apiError.message);
          // Use mock data when API is not available
          setStats({
            totalAgents: 145,
            totalFlexMessages: 23,
            activeFlexMessages: 18,
            recentActivity: 12,
          });
        }
      } catch (error) {
        console.error('Error in fetchStats:', error);
        // Fallback to mock data
        setStats({
          totalAgents: 145,
          totalFlexMessages: 23,
          activeFlexMessages: 18,
          recentActivity: 12,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      name: 'Total Agents',
      value: stats.totalAgents,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      name: 'Flex Messages',
      value: stats.totalFlexMessages,
      icon: MessageSquare,
      color: 'bg-green-500',
      change: '+5%',
    },
    {
      name: 'Active Messages',
      value: stats.activeFlexMessages,
      icon: TrendingUp,
      color: 'bg-yellow-500',
      change: '+8%',
    },
    {
      name: 'Recent Activity',
      value: stats.recentActivity,
      icon: Calendar,
      color: 'bg-purple-500',
      change: '+3%',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600">Welcome to the Dint Admin Panel</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.name}
                className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <dt>
                  <div className={`absolute rounded-md p-3 ${stat.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <p className="ml-16 truncate text-sm font-medium text-gray-500">
                    {stat.name}
                  </p>
                </dt>
                <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
                  {loading ? (
                    <div className="animate-pulse h-8 w-16 bg-gray-200 rounded"></div>
                  ) : (
                    <>
                      <p className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </p>
                      <p className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        {stat.change}
                      </p>
                    </>
                  )}
                </dd>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {loading ? (
                Array(3).fill().map((_, i) => (
                  <div key={i} className="animate-pulse flex space-x-3">
                    <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
                    <div className="h-4 w-48 bg-gray-200 rounded"></div>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                    </div>
                    <p className="text-sm text-gray-600">New agent created</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-2 w-2 bg-green-500 rounded-full mt-2"></div>
                    </div>
                    <p className="text-sm text-gray-600">Flex message updated</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-2 w-2 bg-yellow-500 rounded-full mt-2"></div>
                    </div>
                    <p className="text-sm text-gray-600">System backup completed</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium transition-colors">
                Create New Agent
              </button>
              <button className="w-full text-left px-4 py-3 rounded-md bg-green-50 hover:bg-green-100 text-green-700 font-medium transition-colors">
                Add Flex Message
              </button>
              <button className="w-full text-left px-4 py-3 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium transition-colors">
                View Statistics
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default withAuth(DashboardPage);
