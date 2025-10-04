"use client";
import { useState } from "react";
import {
  Check,
  X,
  Eye,
  Search,
  Filter,
  DollarSign,
  Clock,
  User,
} from "lucide-react";

export default function ManagerDashboard() {
  const [approvals, setApprovals] = useState([
    {
      id: 1,
      subject: "Team Lunch - Q4 Planning",
      owner: "Sarah",
      category: "Food",
      status: "Pending",
      amount: 49896,
      currency: "SGD",
      date: "2024-10-01",
      description: "Team lunch during quarterly planning session",
    },
    {
      id: 2,
      subject: "Client Dinner - ABC Corp",
      owner: "Michael",
      category: "Entertainment",
      status: "Pending",
      amount: 85000,
      currency: "SGD",
      date: "2024-10-02",
      description: "Business dinner with ABC Corp executives",
    },
    {
      id: 3,
      subject: "Office Supplies",
      owner: "Emma",
      category: "Supplies",
      status: "Pending",
      amount: 12500,
      currency: "SGD",
      date: "2024-10-03",
      description: "Monthly office supplies restock",
    },
    {
      id: 4,
      subject: "Conference Travel",
      owner: "James",
      category: "Travel",
      status: "Pending",
      amount: 125000,
      currency: "SGD",
      date: "2024-10-03",
      description: "Tech conference in Singapore",
    },
  ]);

  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);

  const handleApprove = (id) => {
    setApprovals(
      approvals.map((item) =>
        item.id === id ? { ...item, status: "Approved" } : item
      )
    );
    setSelectedRequest(null);
  };

  const handleReject = (id) => {
    setApprovals(
      approvals.map((item) =>
        item.id === id ? { ...item, status: "Rejected" } : item
      )
    );
    setSelectedRequest(null);
  };

  const formatAmount = (amount, currency) => {
    return new Intl.NumberFormat("en-SG", {
      style: "currency",
      currency: currency || "SGD",
    }).format(amount / 100);
  };

  const filteredApprovals = approvals.filter((item) => {
    const matchesFilter =
      filter === "all" || item.status.toLowerCase() === filter;
    const matchesSearch =
      item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    pending: approvals.filter((a) => a.status === "Pending").length,
    approved: approvals.filter((a) => a.status === "Approved").length,
    rejected: approvals.filter((a) => a.status === "Rejected").length,
    total: approvals.reduce(
      (sum, a) => sum + (a.status === "Pending" ? a.amount : 0),
      0
    ),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Manager Dashboard
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Review and approve expense requests
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-slate-500">Manager</p>
                <p className="text-sm font-semibold text-slate-700">
                  John Anderson
                </p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                JA
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Pending</p>
                <p className="text-3xl font-bold text-amber-600">
                  {stats.pending}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Approved</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.approved}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Check className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Rejected</p>
                <p className="text-3xl font-bold text-red-600">
                  {stats.rejected}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <X className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Total Pending</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatAmount(stats.total, "SGD")}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by subject, owner, or category..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2.5 rounded-lg font-medium transition-colors ${
                  filter === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}>
                All
              </button>
              <button
                onClick={() => setFilter("pending")}
                className={`px-4 py-2.5 rounded-lg font-medium transition-colors ${
                  filter === "pending"
                    ? "bg-amber-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}>
                Pending
              </button>
              <button
                onClick={() => setFilter("approved")}
                className={`px-4 py-2.5 rounded-lg font-medium transition-colors ${
                  filter === "approved"
                    ? "bg-green-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}>
                Approved
              </button>
              <button
                onClick={() => setFilter("rejected")}
                className={`px-4 py-2.5 rounded-lg font-medium transition-colors ${
                  filter === "rejected"
                    ? "bg-red-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}>
                Rejected
              </button>
            </div>
          </div>
        </div>

        {/* Approvals Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                    Subject
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                    Owner
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                    Category
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                    Date
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700">
                    Amount
                  </th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-slate-700">
                    Status
                  </th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-slate-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredApprovals.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800">
                        {item.subject}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        {item.description}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {item.owner.charAt(0)}
                        </div>
                        <span className="text-slate-700">{item.owner}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">
                      {item.date}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-slate-800">
                        {formatAmount(item.amount, item.currency)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          item.status === "Approved"
                            ? "bg-green-100 text-green-700"
                            : item.status === "Rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                        }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {item.status === "Pending" ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleApprove(item.id)}
                            className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                            title="Approve">
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(item.id)}
                            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            title="Reject">
                            <X className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSelectedRequest(item)}
                            className="p-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                            title="View Details">
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => setSelectedRequest(item)}
                            className="p-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                            title="View Details">
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredApprovals.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500">No expense requests found</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800">
                Expense Details
              </h2>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-600">
                  Subject
                </label>
                <p className="text-slate-800 mt-1">{selectedRequest.subject}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600">
                  Description
                </label>
                <p className="text-slate-800 mt-1">
                  {selectedRequest.description}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-600">
                    Owner
                  </label>
                  <p className="text-slate-800 mt-1">{selectedRequest.owner}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-600">
                    Category
                  </label>
                  <p className="text-slate-800 mt-1">
                    {selectedRequest.category}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-600">
                    Date
                  </label>
                  <p className="text-slate-800 mt-1">{selectedRequest.date}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-600">
                    Amount
                  </label>
                  <p className="text-slate-800 mt-1 font-semibold">
                    {formatAmount(
                      selectedRequest.amount,
                      selectedRequest.currency
                    )}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600">
                  Status
                </label>
                <p className="mt-1">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                      selectedRequest.status === "Approved"
                        ? "bg-green-100 text-green-700"
                        : selectedRequest.status === "Rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                    }`}>
                    {selectedRequest.status}
                  </span>
                </p>
              </div>
            </div>

            {selectedRequest.status === "Pending" && (
              <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200">
                <button
                  onClick={() => handleApprove(selectedRequest.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors">
                  <Check className="w-5 h-5" />
                  Approve
                </button>
                <button
                  onClick={() => handleReject(selectedRequest.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors">
                  <X className="w-5 h-5" />
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
