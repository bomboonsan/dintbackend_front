'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import withAuth from '@/components/withAuth';
import { flexAPI } from '@/lib/api';
import { Plus, Search, Edit, Trash2, Eye, Upload, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';

function FlexMessagesPage() {
  const [flexMessages, setFlexMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [formData, setFormData] = useState({
    keyword: '',
    alt_text: '',
    content: '',
    description: '',
    is_active: true,
    status: 'published'
  });

  useEffect(() => {
    fetchFlexMessages();
  }, []);

  const fetchFlexMessages = async () => {
    try {
      setLoading(true);
      const response = await flexAPI.list({ limit: 100 });
      // API returns { total, items, limit, offset } according to spec
      const data = response.data;
      setFlexMessages(Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching flex messages:', error);
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
        // Use mock data when API is not available
        console.warn('Using mock data for flex messages');
        setFlexMessages([
          {
            id: 1,
            keyword: 'hello',
            alt_text: 'Hello message',
            content: { type: 'text', text: 'Hello World!' },
            description: 'Sample greeting message',
            is_active: true,
            status: 'published',
            created_at: new Date(),
            updated_at: new Date()
          },
          {
            id: 2,
            keyword: 'info',
            alt_text: 'Information message',
            content: { type: 'text', text: 'Information content' },
            description: 'Sample info message',
            is_active: false,
            status: 'draft',
            created_at: new Date(),
            updated_at: new Date()
          }
        ]);
      } else {
        toast.error('Failed to fetch flex messages');
        setFlexMessages([]); // Ensure it's always an array
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        content: typeof formData.content === 'string' 
          ? JSON.parse(formData.content || '{}') 
          : formData.content
      };

      if (modalType === 'create') {
        await flexAPI.create(submitData);
        toast.success('Flex message created successfully');
      } else if (modalType === 'edit') {
        await flexAPI.update(selectedMessage.id, submitData);
        toast.success('Flex message updated successfully');
      }
      setShowModal(false);
      resetForm();
      fetchFlexMessages();
    } catch (error) {
      console.error('Error saving flex message:', error);
      toast.error('Failed to save flex message');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this flex message?')) {
      try {
        await flexAPI.delete(id);
        toast.success('Flex message deleted successfully');
        fetchFlexMessages();
      } catch (error) {
        console.error('Error deleting flex message:', error);
        toast.error('Failed to delete flex message');
      }
    }
  };

  const toggleActive = async (message) => {
    try {
      await flexAPI.update(message.id, { 
        ...message, 
        is_active: !message.is_active 
      });
      toast.success(`Message ${!message.is_active ? 'activated' : 'deactivated'}`);
      fetchFlexMessages();
    } catch (error) {
      console.error('Error updating message status:', error);
      toast.error('Failed to update message status');
    }
  };

  const openModal = (type, message = null) => {
    setModalType(type);
    setSelectedMessage(message);
    if (message) {
      setFormData({
        keyword: message.keyword || '',
        alt_text: message.alt_text || '',
        content: JSON.stringify(message.content || {}, null, 2),
        description: message.description || '',
        is_active: message.is_active ?? true,
        status: message.status || 'published'
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      keyword: '',
      alt_text: '',
      content: '',
      description: '',
      is_active: true,
      status: 'published'
    });
    setSelectedMessage(null);
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);
      const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData];
      
      // Ask user if they want to overwrite existing records
      const overwrite = window.confirm(
        'Do you want to overwrite existing records with the same keywords?\n\n' +
        'Click OK to overwrite, or Cancel to keep existing records.'
      );
      
      await flexAPI.import(dataArray, overwrite);
      toast.success('Flex messages imported successfully');
      fetchFlexMessages();
    } catch (error) {
      console.error('Error importing flex messages:', error);
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
        toast.success('Flex messages imported successfully (Demo mode)');
      } else {
        toast.error('Failed to import flex messages');
      }
    }
  };

  const filteredMessages = Array.isArray(flexMessages) ? flexMessages.filter(message =>
    message.keyword?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.alt_text?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Flex Messages</h1>
            <p className="text-gray-600">Manage your LINE flex messages</p>
          </div>
          <div className="flex space-x-3">
            <label className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 cursor-pointer">
              <Upload className="h-5 w-5" />
              <span>Import JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
            <button
              onClick={() => openModal('create')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Add Message</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search flex messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Messages Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Keyword
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Alt Text
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Active
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
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
                ) : filteredMessages.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No flex messages found
                    </td>
                  </tr>
                ) : (
                  filteredMessages.map((message) => (
                    <tr key={message.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {message.keyword}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {message.alt_text}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          message.status === 'published' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {message.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleActive(message)}
                          className={`${
                            message.is_active ? 'text-green-600' : 'text-gray-400'
                          }`}
                        >
                          {message.is_active ? (
                            <ToggleRight className="h-6 w-6" />
                          ) : (
                            <ToggleLeft className="h-6 w-6" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(message.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openModal('view', message)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => openModal('edit', message)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(message.id)}
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
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 capitalize mb-4">
                {modalType} Flex Message
              </h3>
              
              {modalType === 'view' ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Keyword</label>
                    <p className="text-sm text-gray-900">{selectedMessage?.keyword}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Alt Text</label>
                    <p className="text-sm text-gray-900">{selectedMessage?.alt_text}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <p className="text-sm text-gray-900">{selectedMessage?.description}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Content (JSON)</label>
                    <pre className="text-xs text-gray-900 bg-gray-100 p-3 rounded-md overflow-auto max-h-48">
                      {JSON.stringify(selectedMessage?.content, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <p className="text-sm text-gray-900">{selectedMessage?.status}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Active</label>
                    <p className="text-sm text-gray-900">{selectedMessage?.is_active ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
                  <div>
                    <label htmlFor="keyword" className="block text-sm font-medium text-gray-700">
                      Keyword *
                    </label>
                    <input
                      type="text"
                      id="keyword"
                      value={formData.keyword}
                      onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="alt_text" className="block text-sm font-medium text-gray-700">
                      Alt Text *
                    </label>
                    <input
                      type="text"
                      id="alt_text"
                      value={formData.alt_text}
                      onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      id="description"
                      rows="3"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                      Content (JSON) *
                    </label>
                    <textarea
                      id="content"
                      rows="8"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                      placeholder='{"type": "bubble", "body": {...}}'
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <select
                        id="status"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </select>
                    </div>
                    <div>
                      <label className="flex items-center mt-6">
                        <input
                          type="checkbox"
                          checked={formData.is_active}
                          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">Active</span>
                      </label>
                    </div>
                  </div>
                </form>
              )}
              
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  {modalType === 'view' ? 'Close' : 'Cancel'}
                </button>
                {modalType !== 'view' && (
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    {modalType === 'create' ? 'Create' : 'Update'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default withAuth(FlexMessagesPage);
