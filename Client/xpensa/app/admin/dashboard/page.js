"use client";
import React, { useState } from 'react';
import { Users, FileText, Settings, Menu, X, Plus, Trash2, Edit2, Send, Check, ChevronDown } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [users, setUsers] = useState([
    { id: 1, name: 'marc', role: 'Manager', manager: '-', email: 'marc@gmail.com' },
    { id: 2, name: 'sarah', role: 'Manager', manager: '-', email: 'sarah@email.com' },
    { id: 3, name: 'Employee 1', role: 'Employee', manager: 'sarah', email: 'emp1@email.com' }
  ]);
  
  const [approvalRules, setApprovalRules] = useState([
    {
      id: 1,
      user: 'marc',
      manager: 'sarah',
      description: 'Approval rule for miscellaneous expenses',
      approvers: [
        { name: 'John', required: true },
        { name: 'Michael', required: false },
        { name: 'Andrew', required: false }
      ],
      sequenced: false,
      minApprovalPercentage: 60
    }
  ]);

  const [showUserModal, setShowUserModal] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const handleAddUser = (userData) => {
    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? { ...userData, id: editingUser.id } : u));
      setEditingUser(null);
    } else {
      setUsers([...users, { ...userData, id: Date.now() }]);
    }
    setShowUserModal(false);
  };

  const handleDeleteUser = (id) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const handleSendPassword = (user) => {
    alert(`Password reset email sent to ${user.email}`);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-gradient-to-b from-indigo-600 to-indigo-800 text-white transition-all duration-300 overflow-hidden`}>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-8">Admin Panel</h1>
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center space-x-3 w-full p-3 rounded-lg transition-colors ${
                activeTab === 'users' ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              <Users size={20} />
              <span>User Management</span>
            </button>
            <button
              onClick={() => setActiveTab('approvals')}
              className={`flex items-center space-x-3 w-full p-3 rounded-lg transition-colors ${
                activeTab === 'approvals' ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              <FileText size={20} />
              <span>Approval Rules</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center space-x-3 w-full p-3 rounded-lg transition-colors ${
                activeTab === 'settings' ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              <Settings size={20} />
              <span>Settings</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <h2 className="text-2xl font-semibold text-gray-800">
                {activeTab === 'users' ? 'User Management' : activeTab === 'approvals' ? 'Approval Rules' : 'Settings'}
              </h2>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-gray-600">Manage system users and their permissions</p>
                <button
                  onClick={() => {
                    setEditingUser(null);
                    setShowUserModal(true);
                  }}
                  className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  <Plus size={20} />
                  <span>New User</span>
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">User</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Role</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Manager</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-900">{user.name}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                            user.role === 'Manager' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{user.manager}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleSendPassword(user)}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Send Password"
                            >
                              <Send size={18} />
                            </button>
                            <button
                              onClick={() => {
                                setEditingUser(user);
                                setShowUserModal(true);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'approvals' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-gray-600">Configure approval workflows and requirements</p>
                <button
                  onClick={() => setShowRuleModal(true)}
                  className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  <Plus size={20} />
                  <span>New Approval Rule</span>
                </button>
              </div>

              <div className="space-y-4">
                {approvalRules.map((rule) => (
                  <div key={rule.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <span className="text-sm font-medium text-gray-500">User:</span>
                          <span className="text-lg font-semibold text-gray-900">{rule.user}</span>
                        </div>
                        <div className="flex items-center space-x-4 mb-3">
                          <span className="text-sm font-medium text-gray-500">Manager:</span>
                          <span className="text-gray-900">{rule.manager}</span>
                        </div>
                        <p className="text-gray-600 text-sm mb-4">{rule.description}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit2 size={18} />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">Approvers</h4>
                        <label className="flex items-center space-x-2 text-sm text-gray-600">
                          <input
                            type="checkbox"
                            checked={rule.sequenced}
                            className="rounded border-gray-300"
                            readOnly
                          />
                          <span>Sequential Approval</span>
                        </label>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        {rule.approvers.map((approver, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <span className="flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full font-semibold text-sm">
                                {idx + 1}
                              </span>
                              <span className="font-medium text-gray-900">{approver.name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              {approver.required && (
                                <span className="flex items-center space-x-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                                  <Check size={14} />
                                  <span>Required</span>
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center space-x-3 bg-blue-50 p-4 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Minimum Approval Percentage:</span>
                        <span className="text-lg font-bold text-indigo-600">{rule.minApprovalPercentage}%</span>
                      </div>

                      <p className="text-xs text-gray-500 mt-3 italic">
                        {rule.sequenced 
                          ? "Approvers must approve in the order listed above. If one rejects, subsequent approvals are not requested."
                          : "All approvers receive the request simultaneously. Request is approved when minimum percentage is reached."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Settings</h3>
              <p className="text-gray-600">Configuration options coming soon...</p>
            </div>
          )}
        </main>
      </div>

      {/* User Modal */}
      {showUserModal && (
        <UserModal
          user={editingUser}
          managers={users.filter(u => u.role === 'Manager')}
          onClose={() => {
            setShowUserModal(false);
            setEditingUser(null);
          }}
          onSave={handleAddUser}
        />
      )}
    </div>
  );
};

const UserModal = ({ user, managers, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    role: user?.role || 'Employee',
    manager: user?.manager || '',
    email: user?.email || ''
  });

  const handleSubmit = () => {
    if (formData.name && formData.email) {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            {user ? 'Edit User' : 'New User'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="Employee">Employee</option>
              <option value="Manager">Manager</option>
            </select>
          </div>
          
          {formData.role === 'Employee' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Manager</label>
              <select
                value={formData.manager}
                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select Manager</option>
                {managers.map((m) => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {user ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;