'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import withAuth from '@/components/withAuth';
import { agentsAPI } from '@/lib/api';
import { Plus, Search, Edit, Trash2, Eye, TrendingUp, Users, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create', 'edit', 'view'
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [formData, setFormData] = useState({ agent_code: '' });

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff88', '#ff0088'];

  // Count frequency of each agent_code
  const getAgentCodeFrequency = () => {
    const frequency = {};
    agents.forEach(agent => {
      if (agent.agent_code) {
        frequency[agent.agent_code] = (frequency[agent.agent_code] || 0) + 1;
      }
    });
    return frequency;
  };

  // Get top 10 agents by frequency
  const getTopAgentsByFrequency = () => {
    const frequency = getAgentCodeFrequency();
    return Object.entries(frequency)
      .map(([agent_code, count]) => ({ agent_code, frequency: count }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);
  };

  // Get data for pie chart
  const getPieChartData = () => {
    const topAgents = getTopAgentsByFrequency();
    return topAgents.map((agent, index) => ({
      name: agent.agent_code,
      value: agent.frequency,
      color: COLORS[index % COLORS.length]
    }));
  };

  // Get total frequency count
  const getTotalFrequency = () => {
    return Object.values(getAgentCodeFrequency()).reduce((sum, count) => sum + count, 0);
  };

  // Get unique agent codes count
  const getUniqueAgentCodes = () => {
    return Object.keys(getAgentCodeFrequency()).length;
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await agentsAPI.list({ limit: 500 });
      // API returns { total, items, limit, offset } according to spec
      const data = response.data;
      setAgents(Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching agents:', error);
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
        // Use mock data when API is not available
        console.warn('Using mock data for agents');
        setAgents([
          { id: 1, agent_code: '742', created_at: new Date(), updated_at: new Date() },
          { id: 2, agent_code: '742', created_at: new Date(), updated_at: new Date() },
          { id: 3, agent_code: '742', created_at: new Date(), updated_at: new Date() },
          { id: 4, agent_code: '742', created_at: new Date(), updated_at: new Date() },
          { id: 5, agent_code: '742', created_at: new Date(), updated_at: new Date() },
          { id: 6, agent_code: 'AGENT001', created_at: new Date(), updated_at: new Date() },
          { id: 7, agent_code: 'AGENT002', created_at: new Date(), updated_at: new Date() },
          { id: 8, agent_code: 'AGENT002', created_at: new Date(), updated_at: new Date() },
          { id: 9, agent_code: 'AGENT003', created_at: new Date(), updated_at: new Date() },
          { id: 10, agent_code: '999', created_at: new Date(), updated_at: new Date() },
          { id: 11, agent_code: '999', created_at: new Date(), updated_at: new Date() },
          { id: 12, agent_code: '999', created_at: new Date(), updated_at: new Date() },
        ]);
      } else {
        toast.error('Failed to fetch agents');
        setAgents([]); // Ensure it's always an array
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'create') {
        await agentsAPI.create(formData);
        toast.success('Agent created successfully');
      } else if (modalType === 'edit') {
        await agentsAPI.update(selectedAgent.id, formData);
        toast.success('Agent updated successfully');
      }
      setShowModal(false);
      setFormData({ agent_code: '' });
      setSelectedAgent(null);
      fetchAgents();
    } catch (error) {
      console.error('Error saving agent:', error);
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
        toast.success(`Agent ${modalType === 'create' ? 'created' : 'updated'} successfully (Demo mode)`);
        setShowModal(false);
        setFormData({ agent_code: '' });
        setSelectedAgent(null);
        // In demo mode, add to local state
        if (modalType === 'create') {
          const newAgent = {
            id: Date.now(),
            agent_code: formData.agent_code,
            created_at: new Date(),
            updated_at: new Date()
          };
          setAgents(prev => [...prev, newAgent]);
        }
      } else {
        toast.error('Failed to save agent');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this agent?')) {
      try {
        await agentsAPI.delete(id);
        toast.success('Agent deleted successfully');
        fetchAgents();
      } catch (error) {
        console.error('Error deleting agent:', error);
        if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
          toast.success('Agent deleted successfully (Demo mode)');
          // In demo mode, remove from local state
          setAgents(prev => prev.filter(agent => agent.id !== id));
        } else {
          toast.error('Failed to delete agent');
        }
      }
    }
  };

  const openModal = (type, agent = null) => {
    setModalType(type);
    setSelectedAgent(agent);
    setFormData(agent ? { agent_code: agent.agent_code } : { agent_code: '' });
    setShowModal(true);
  };

  const filteredAgents = Array.isArray(agents) ? agents.filter(agent =>
    agent.agent_code?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Agents Management</h1>
            <p className="text-gray-600">Manage your agents and their information</p>
          </div>
          <button
            onClick={() => openModal('create')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add Agent</span>
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    จำนวนผู้ให้คะแนน
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {agents.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Award className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    จำนวนผู้แทนที่ได้รับคะแนน
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {getUniqueAgentCodes()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Pie Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">การกระจายความถี่ของรหัสตัวแทน</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getPieChartData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({name, value, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getPieChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Frequency']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top 10 List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">อันดับ 10 รหัสตัวแทนที่มีความถี่สูงสุด</h3>
            <div className="space-y-3">
              {getTopAgentsByFrequency().map((agent, index) => (
                <div key={agent.agent_code} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold`}
                         style={{backgroundColor: COLORS[index % COLORS.length]}}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{agent.agent_code}</p>
                      <p className="text-xs text-gray-500">Agent Code</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{agent.frequency}</p>
                    <p className="text-xs text-gray-500">occurrences</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search agents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Agents Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agent Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Frequency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  Array(5).fill().map((_, i) => (
                    <tr key={i}>
                      {Array(6).fill().map((_, j) => (
                        <td key={j} className="px-6 py-4 whitespace-nowrap">
                          <div className="animate-pulse h-4 bg-gray-200 rounded"></div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredAgents.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No agents found
                    </td>
                  </tr>
                ) : (
                  filteredAgents.map((agent) => {
                    const frequency = getAgentCodeFrequency();
                    const agentFrequency = frequency[agent.agent_code] || 0;
                    return (
                      <tr key={agent.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {agent.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {agent.agent_code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {agentFrequency}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(agent.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(agent.updated_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openModal('view', agent)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => openModal('edit', agent)}
                              className="text-green-600 hover:text-green-900"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(agent.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 capitalize mb-4">
                {modalType} Agent
              </h3>
              
              {modalType === 'view' ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ID</label>
                    <p className="text-sm text-gray-900">{selectedAgent?.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Agent Code</label>
                    <p className="text-sm text-gray-900">{selectedAgent?.agent_code}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Frequency</label>
                    <p className="text-sm font-semibold text-blue-600">
                      {getAgentCodeFrequency()[selectedAgent?.agent_code] || 0}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Created At</label>
                    <p className="text-sm text-gray-900">{new Date(selectedAgent?.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Updated At</label>
                    <p className="text-sm text-gray-900">{new Date(selectedAgent?.updated_at).toLocaleString()}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="agent_code" className="block text-sm font-medium text-gray-700">
                      Agent Code
                    </label>
                    <input
                      type="text"
                      id="agent_code"
                      value={formData.agent_code}
                      onChange={(e) => setFormData({ ...formData, agent_code: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                    >
                      {modalType === 'create' ? 'Create' : 'Update'}
                    </button>
                  </div>
                </form>
              )}
              
              {modalType === 'view' && (
                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default withAuth(AgentsPage);
