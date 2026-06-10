"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Check, X, Eye, Search, DollarSign, Clock } from "lucide-react";

export default function ManagerDashboard() {
  const [approvals, setApprovals] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [companyCurrency, setCompanyCurrency] = useState("USD"); // 🟢 default

  // ✅ Get token safely after client mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);

  // ✅ Fetch manager company info
  useEffect(() => {
    if (!token) return;

    const fetchCompanyCurrency = async () => {
      try {
        const res = await axios.get("http://localhost:3010/api/v1/manager/company", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCompanyCurrency(res.data.data.currency || "USD");
      } catch (err) {
        console.error("Error fetching company currency:", err);
      }
    };

    fetchCompanyCurrency();
  }, [token]);

  // ✅ Fetch pending expenses once token is loaded
  useEffect(() => {
    if (!token) return;

    const fetchExpenses = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:3010/api/v1/manager/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = response.data.data;
        const formatted = data.map((item) => ({
          id: item._id,
          subject: item.description || "No subject",
          owner: item.employee?.name || "Unknown",
          category: item.category,
          status: item.status,
          amount: item.convertedAmount || item.amount,
          currency: item.currency,
          date: item.date?.split("T")[0],
          description: item.remarks || item.description,
        }));

        setApprovals(formatted);
      } catch (error) {
        console.error("Error fetching manager expenses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [token]);

  const handleAction = async (id, action) => {
    try {
      await axios.post(
        "http://localhost:3010/api/v1/manager/action",
        { expenseId: id, action },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setApprovals((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: action } : item
        )
      );
      setSelectedRequest(null);
    } catch (error) {
      console.error(`Error updating expense (${action}):`, error);
      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  const handleApprove = (id) => handleAction(id, "Approved");
  const handleReject = (id) => handleAction(id, "Rejected");

  // ✅ Format amount based on company currency
  // const formatAmount = (amount) => {
  //   return new Intl.NumberFormat("en-US", {
  //     style: "currency",
  //     currency: companyCurrency || "USD",
  //   }).format(amount / 100);
  // };
const formatAmount = (amount, currency) => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat("en-IN", { // use en-IN or en-US depending on preference
    style: "currency",
    currency: currency || companyCurrency || "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
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
    pending: approvals.filter((a) => a.status === "Processing" || a.status === "Pending").length,
    approved: approvals.filter((a) => a.status === "Approved").length,
    rejected: approvals.filter((a) => a.status === "Rejected").length,
    total: approvals.reduce(
      (sum, a) =>
        sum + (a.status === "Processing" || a.status === "Pending" ? a.amount : 0),
      0
    ),
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-slate-600">
        Loading manager expenses...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Manager Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">
              Review and approve employee expense requests
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Pending", value: stats.pending, color: "amber", icon: Clock },
            { label: "Approved", value: stats.approved, color: "green", icon: Check },
            { label: "Rejected", value: stats.rejected, color: "red", icon: X },
            {
              label: `Total Pending (${companyCurrency})`, // 🟢 Dynamic label
              value: formatAmount(stats.total),
              color: "blue",
              icon: DollarSign,
            },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
                    <p className={`text-3xl font-bold text-${stat.color}-600`}>
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                </div>
              </div>
            );
          })}
           </div>

        {/* Search + Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by subject, owner, or category..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Expenses Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Subject</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Owner</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Date</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Amount</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Status</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApprovals.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-800">{item.subject}</td>
                    <td className="px-6 py-4 text-slate-700">{item.owner}</td>
                    <td className="px-6 py-4">{item.category}</td>
                    <td className="px-6 py-4 text-slate-600">{item.date}</td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-800">
                      {formatAmount(item.amount, item.companyCurrency)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          item.status === "Approved"
                            ? "bg-green-100 text-green-700"
                            : item.status === "Rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                        }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {item.status === "Processing" || item.status === "Pending" ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleApprove(item.id)}
                            className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(item.id)}
                            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-sm">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredApprovals.length === 0 && (
            <div className="text-center py-12 text-slate-500">No expense requests found</div>
          )}
        </div>
      </div>
    </div>
  );
}
