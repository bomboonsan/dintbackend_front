'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import withAuth from '@/components/withAuth';
import { agentsAPI } from '@/lib/api';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create', 'edit', 'view'
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [formData, setFormData] = useState({ agent_code: '' });

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await agentsAPI.list({ limit: 100 });
      // API returns { total, items, limit, offset } according to spec
      const data = response.data;
      setAgents(Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching agents:', error);
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
        // Use mock data when API is not available
        console.warn('Using mock data for agents');
        setAgents([
          { id: 1, agent_code: 'AGENT001', created_at: new Date(), updated_at: new Date() },
          { id: 2, agent_code: 'AGENT002', created_at: new Date(), updated_at: new Date() },
          { id: 3, agent_code: 'AGENT003', created_at: new Date(), updated_at: new Date() },
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
                      {Array(5).fill().map((_, j) => (
                        <td key={j} className="px-6 py-4 whitespace-nowrap">
                          <div className="animate-pulse h-4 bg-gray-200 rounded"></div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredAgents.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      No agents found
                    </td>
                  </tr>
                ) : (
                  filteredAgents.map((agent) => (
                    <tr key={agent.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {agent.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {agent.agent_code}
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
                  ))
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
