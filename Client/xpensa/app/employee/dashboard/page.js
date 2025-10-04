// "use client";
// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import {
//   Upload,
//   Plus,
//   Clock,
//   CheckCircle,
//   XCircle,
//   DollarSign,
//   Calendar,
//   FileText,
// } from "lucide-react";

// export default function EmployeeExpenseDashboard() {
//   const [activeTab, setActiveTab] = useState("all");
//   const [showNewExpense, setShowNewExpense] = useState(false);
//   const [expenses, setExpenses] = useState([]);
//   const [newExpense, setNewExpense] = useState({
//     description: "",
//     date: "",
//     category: "Food",
//     amount: "",
//     currency: "rs",
//     remarks: "",
//   });

//   // Fetch employee expenses from backend
//   useEffect(() => {
//     const fetchExpenses = async () => {
//       try {
//         const res = await axios.get("http://localhost:3010/api/v1/expenses/", {
//           withCredentials: true,
//         });
//         setExpenses(res.data.data);
//       } catch (err) {
//         console.error("Error fetching expenses:", err);
//       }
//     };
//     fetchExpenses();
//   }, []);

//   // Create new expense
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await axios.post("http://localhost:3010/api/v1/expenses/", newExpense, {
//         withCredentials: true,
//       });

//       setExpenses([res.data.data, ...expenses]);
//       setNewExpense({
//         description: "",
//         date: "",
//         category: "Food",
//         amount: "",
//         currency: "rs",
//         remarks: "",
//       });
//       setShowNewExpense(false);
//     } catch (err) {
//       console.error("Error creating expense:", err);
//     }
//   };

//   // Submit for approval
// const submitForApproval = (_id) => {
//   setExpenses(expenses.map(exp =>
//     exp._id === _id ? { ...exp, status: "Waiting approval", submittedDate: new Date().toISOString().split("T")[0] } : exp
//   ));
// };

// const approveExpense = (_id) => {
//   setExpenses(expenses.map(exp =>
//     exp._id === _id ? { ...exp, status: "Approved", approvedDate: new Date().toLocaleString(), approver: "Sarah" } : exp
//   ));
// };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "Draft":
//         return "bg-gray-100 text-gray-700";
//       case "Waiting approval":
//         return "bg-yellow-100 text-yellow-700";
//       case "Approved":
//         return "bg-green-100 text-green-700";
//       case "Rejected":
//         return "bg-red-100 text-red-700";
//       default:
//         return "bg-gray-100 text-gray-700";
//     }
//   };

//   const getStatusIcon = (status) => {
//     switch (status) {
//       case "Draft":
//         return <FileText className="w-4 h-4" />;
//       case "Waiting approval":
//         return <Clock className="w-4 h-4" />;
//       case "Approved":
//         return <CheckCircle className="w-4 h-4" />;
//       case "Rejected":
//         return <XCircle className="w-4 h-4" />;
//       default:
//         return <FileText className="w-4 h-4" />;
//     }
//   };

//   const filteredExpenses = expenses.filter((exp) => {
//     if (activeTab === "all") return true;
//     return exp.status.toLowerCase().replace(" ", "-") === activeTab;
//   });

//   const totalAmount = filteredExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
//       {/* Header */}
//       <div className="bg-white shadow-sm border-b border-slate-200">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
//           <div>
//             <h1 className="text-3xl font-bold text-slate-900">Expense Dashboard</h1>
//             <p className="text-slate-600 mt-1">Manage and track your expenses</p>
//           </div>
//           <button
//             onClick={() => setShowNewExpense(true)}
//             className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md"
//           >
//             <Plus className="w-5 h-5" /> New Expense
//           </button>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-slate-600 text-sm font-medium">Total Expenses</p>
//               <p className="text-2xl font-bold text-slate-900 mt-1">{expenses.length}</p>
//             </div>
//             <div className="bg-blue-100 p-3 rounded-lg">
//               <FileText className="w-6 h-6 text-blue-600" />
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-slate-600 text-sm font-medium">Pending</p>
//               <p className="text-2xl font-bold text-yellow-600 mt-1">
//                 {expenses.filter((e) => e.status === "Waiting approval").length}
//               </p>
//             </div>
//             <div className="bg-yellow-100 p-3 rounded-lg">
//               <Clock className="w-6 h-6 text-yellow-600" />
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-slate-600 text-sm font-medium">Approved</p>
//               <p className="text-2xl font-bold text-green-600 mt-1">
//                 {expenses.filter((e) => e.status === "Approved").length}
//               </p>
//             </div>
//             <div className="bg-green-100 p-3 rounded-lg">
//               <CheckCircle className="w-6 h-6 text-green-600" />
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-slate-600 text-sm font-medium">Total Amount</p>
//               <p className="text-2xl font-bold text-slate-900 mt-1">
//                 {totalAmount.toLocaleString()} rs
//               </p>
//             </div>
//             <div className="bg-purple-100 p-3 rounded-lg">
//               <DollarSign className="w-6 h-6 text-purple-600" />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Tabs and Expense List */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8">
//           <div className="flex border-b border-slate-200 overflow-x-auto">
//             {[
//               { key: "all", label: "All Expenses" },
//               { key: "draft", label: "Draft" },
//               { key: "waiting-approval", label: "Waiting Approval" },
//               { key: "approved", label: "Approved" },
//             ].map((tab) => (
//               <button
//                 key={tab.key}
//                 onClick={() => setActiveTab(tab.key)}
//                 className={`px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors ${
//                   activeTab === tab.key
//                     ? "text-blue-600 border-b-2 border-blue-600"
//                     : "text-slate-600 hover:text-slate-900"
//                 }`}
//               >
//                 {tab.label}
//               </button>
//             ))}
//           </div>

//           <div className="divide-y divide-slate-200">
//             {filteredExpenses.length === 0 ? (
//               <div className="p-12 text-center">
//                 <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
//                 <p className="text-slate-600 text-lg">No expenses found</p>
//                 <p className="text-slate-500 text-sm mt-1">
//                   Create a new expense to get started
//                 </p>
//               </div>
//             ) : (
//               filteredExpenses.map((expense) => (
//                 <div key={expense._id} className="p-6 hover:bg-slate-50 transition-colors">
//                   <div className="flex items-start justify-between">
//                     <div className="flex-1">
//                       <div className="flex items-center gap-3 mb-2">
//                         <h3 className="text-lg font-semibold text-slate-900">{expense.description}</h3>
//                         <span
//                           className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
//                             expense.status
//                           )}`}
//                         >
//                           {getStatusIcon(expense.status)}
//                           {expense.status}
//                         </span>
//                       </div>

//                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
//                         <div>
//                           <p className="text-xs text-slate-500 font-medium mb-1">Date</p>
//                           <p className="text-sm text-slate-900 flex items-center gap-1">
//                             <Calendar className="w-4 h-4" /> {expense.date}
//                           </p>
//                         </div>
//                         <div>
//                           <p className="text-xs text-slate-500 font-medium mb-1">Category</p>
//                           <p className="text-sm text-slate-900">{expense.category}</p>
//                         </div>
//                         <div>
//                           <p className="text-xs text-slate-500 font-medium mb-1">Paid By</p>
//                           <p className="text-sm text-slate-900">{expense.paidBy}</p>
//                         </div>
//                         <div>
//                           <p className="text-xs text-slate-500 font-medium mb-1">Amount</p>
//                           <p className="text-sm font-semibold text-slate-900">
//                             {Number(expense.amount).toLocaleString()} {expense.currency}
//                           </p>
//                         </div>
//                       </div>

//                       {expense.remarks && (
//                         <div className="mt-3">
//                           <p className="text-xs text-slate-500 font-medium mb-1">Remarks</p>
//                           <p className="text-sm text-slate-700">{expense.remarks}</p>
//                         </div>
//                       )}

//                       {expense.approvedDate && (
//                         <div className="mt-3 text-xs text-slate-600">
//                           Approved by {expense.approver} on {expense.approvedDate}
//                         </div>
//                       )}
//                     </div>

//                     <div className="ml-4 flex gap-2">
//                       {expense.status === "Draft" && (
//                         <button
//                           onClick={() => submitForApproval(expense._id)}
//                           className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
//                         >
//                           Submit
//                         </button>
//                       )}
//                       {expense.status === "Waiting approval" && (
//                         <button
//                           onClick={() => approveExpense(expense._id)}
//                           className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
//                         >
//                           Approve
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       </div>

//       {/* New Expense Modal */}
//       {showNewExpense && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//             <div className="p-6 border-b border-slate-200">
//               <h2 className="text-2xl font-bold text-slate-900">Create New Expense</h2>
//               <p className="text-slate-600 mt-1">Fill in the details for your expense</p>
//             </div>

//             <form onSubmit={handleSubmit} className="p-6 space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="md:col-span-2">
//                   <label className="block text-sm font-medium text-slate-700 mb-2">Description *</label>
//                   <input
//                     type="text"
//                     required
//                     value={newExpense.description}
//                     onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
//                     className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
//                     placeholder="e.g., Restaurant bill"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-2">Expense Date *</label>
//                   <input
//                     type="date"
//                     required
//                     value={newExpense.date}
//                     onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
//                     className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-2">Category *</label>
//                   <select
//                     value={newExpense.category}
//                     onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
//                     className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
//                   >
//                     <option value="Food">Food</option>
//                     <option value="Travel">Travel</option>
//                     <option value="Office">Office</option>
//                     <option value="Entertainment">Entertainment</option>
//                     <option value="Other">Other</option>
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-2">Amount *</label>
//                   <input
//                     type="number"
//                     required
//                     step="0.01"
//                     value={newExpense.amount}
//                     onChange={(e) =>
//                       setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) })
//                     }
//                     className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
//                     placeholder="0.00"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-2">Currency *</label>
//                   <select
//                     value={newExpense.currency}
//                     onChange={(e) => setNewExpense({ ...newExpense, currency: e.target.value })}
//                     className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
//                   >
//                     <option value="rs">rs (Rupees)</option>
//                     <option value="usd">USD</option>
//                     <option value="eur">EUR</option>
//                     <option value="gbp">GBP</option>
//                   </select>
//                 </div>

//                 <div className="md:col-span-2">
//                   <label className="block text-sm font-medium text-slate-700 mb-2">Remarks</label>
//                   <textarea
//                     value={newExpense.remarks}
//                     onChange={(e) => setNewExpense({ ...newExpense, remarks: e.target.value })}
//                     rows="3"
//                     className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
//                     placeholder="Add any additional notes..."
//                   />
//                 </div>

//                 <div className="md:col-span-2 p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
//                   <Upload className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
//                   <div>
//                     <p className="text-sm font-medium text-blue-900">Upload Receipt</p>
//                     <p className="text-xs text-blue-700 mt-1">
//                       You can upload a receipt from your computer or take a photo using OCR
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex gap-3 pt-4 border-t border-slate-200">
//                 <button
//                   type="button"
//                   onClick={() => setShowNewExpense(false)}
//                   className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
//                 >
//                   Create Expense
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";
import React, { useState } from "react";
import {
  Upload,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Calendar,
  FileText,
} from "lucide-react";

export default function EmployeeExpenseDashboard() {
  // You can later use actual logged-in user info
  const currentUser = "Sarah"; // 👈 Example: logged-in employee name

  const [activeTab, setActiveTab] = useState("all");
  const [showNewExpense, setShowNewExpense] = useState(false);
  const [expenses, setExpenses] = useState([
    {
      id: 1,
      description: "Restaurant bill",
      date: "2025-10-04",
      category: "Food",
      paidBy: "dev",
      amount: 600,
      currency: "rs",
      status: "Draft",
      remarks: "None",
      submittedDate: null,
      approvedDate: null,
      approver: null,
    },
    {
      id: 2,
      description: "Client meeting dinner",
      date: "2025-10-01",
      category: "Food",
      paidBy: "pradeep",
      amount: 335,
      currency: "rs",
      status: "Waiting approval",
      remarks: "Business dinner with client",
      submittedDate: "2025-10-02",
      approvedDate: null,
      approver: "Sarah",
    },
    {
      id: 3,
      description: "Office supplies",
      date: "2025-09-28",
      category: "Office",
      paidBy: "Sarah",
      amount: 500,
      currency: "rs",
      status: "Approved",
      remarks: "Stationery and printer ink",
      submittedDate: "2025-09-29",
      approvedDate: "2025-10-04 12:44",
      approver: "Manager",
    },
  ]);

  const [newExpense, setNewExpense] = useState({
    description: "",
    date: "",
    category: "Food",
    paidBy: currentUser,
    amount: "",
    currency: "rs",
    remarks: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const expense = {
      id: expenses.length + 1,
      ...newExpense,
      amount: parseFloat(newExpense.amount),
      status: "Draft",
      submittedDate: null,
      approvedDate: null,
      approver: null,
    };
    setExpenses([expense, ...expenses]);
    setNewExpense({
      description: "",
      date: "",
      category: "Food",
      paidBy: currentUser,
      amount: "",
      currency: "rs",
      remarks: "",
    });
    setShowNewExpense(false);
  };

  const submitForApproval = (id) => {
    setExpenses(
      expenses.map((exp) =>
        exp.id === id && exp.paidBy === currentUser
          ? {
              ...exp,
              status: "Waiting approval",
              submittedDate: new Date().toISOString().split("T")[0],
            }
          : exp
      )
    );
  };

  // 👇 Removed approveExpense (employees can't approve)

  const getStatusColor = (status) => {
    switch (status) {
      case "Draft":
        return "bg-gray-100 text-gray-700";
      case "Waiting approval":
        return "bg-yellow-100 text-yellow-700";
      case "Approved":
        return "bg-green-100 text-green-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Draft":
        return <FileText className="w-4 h-4" />;
      case "Waiting approval":
        return <Clock className="w-4 h-4" />;
      case "Approved":
        return <CheckCircle className="w-4 h-4" />;
      case "Rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const filteredExpenses = expenses.filter((exp) => {
    if (activeTab === "all") return true;
    return exp.status.toLowerCase().replace(" ", "-") === activeTab;
  });

  const totalAmount = filteredExpenses.reduce(
    (sum, exp) => sum + exp.amount,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Employee Expense Dashboard
            </h1>
            <p className="text-slate-600 mt-1">
              Submit and track your expenses
            </p>
          </div>
          <button
            onClick={() => setShowNewExpense(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md">
            <Plus className="w-5 h-5" />
            New Expense
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <p className="text-slate-600 text-sm font-medium">Total Expenses</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {expenses.length}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <p className="text-slate-600 text-sm font-medium">Pending</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">
              {expenses.filter((e) => e.status === "Waiting approval").length}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <p className="text-slate-600 text-sm font-medium">Approved</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {expenses.filter((e) => e.status === "Approved").length}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <p className="text-slate-600 text-sm font-medium">Total Amount</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {totalAmount.toLocaleString()} rs
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8">
          <div className="flex border-b border-slate-200 overflow-x-auto">
            {[
              { key: "all", label: "All Expenses" },
              { key: "draft", label: "Draft" },
              { key: "waiting-approval", label: "Waiting Approval" },
              { key: "approved", label: "Approved" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.key
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-slate-600 hover:text-slate-900"
                }`}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Expense List */}
          <div className="divide-y divide-slate-200">
            {filteredExpenses.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 text-lg">No expenses found</p>
                <p className="text-slate-500 text-sm mt-1">
                  Create a new expense to get started
                </p>
              </div>
            ) : (
              filteredExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {expense.description}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            expense.status
                          )}`}>
                          {getStatusIcon(expense.status)}
                          {expense.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-slate-500 font-medium mb-1">
                            Date
                          </p>
                          <p className="text-sm text-slate-900 flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {expense.date}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium mb-1">
                            Category
                          </p>
                          <p className="text-sm text-slate-900">
                            {expense.category}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium mb-1">
                            Paid By
                          </p>
                          <p className="text-sm text-slate-900">
                            {expense.paidBy}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium mb-1">
                            Amount
                          </p>
                          <p className="text-sm font-semibold text-slate-900">
                            {expense.amount.toLocaleString()} {expense.currency}
                          </p>
                        </div>
                      </div>

                      {expense.remarks && (
                        <div className="mt-3">
                          <p className="text-xs text-slate-500 font-medium mb-1">
                            Remarks
                          </p>
                          <p className="text-sm text-slate-700">
                            {expense.remarks}
                          </p>
                        </div>
                      )}

                      {expense.approvedDate && (
                        <div className="mt-3 text-xs text-slate-600">
                          Approved by {expense.approver} on{" "}
                          {expense.approvedDate}
                        </div>
                      )}
                    </div>

                    {/* Only allow "Submit" for employee's own Draft expenses */}
                    <div className="ml-4 flex gap-2">
                      {expense.status === "Draft" &&
                        expense.paidBy === currentUser && (
                          <button
                            onClick={() => submitForApproval(expense.id)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                            Submit
                          </button>
                        )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* New Expense Modal */}
      {showNewExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900">
                Create New Expense
              </h2>
              <p className="text-slate-600 mt-1">
                Fill in the details for your expense
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description *
                </label>
                <input
                  type="text"
                  required
                  value={newExpense.description}
                  onChange={(e) =>
                    setNewExpense({
                      ...newExpense,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="e.g., Restaurant bill"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={newExpense.date}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, date: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category *
                </label>
                <select
                  value={newExpense.category}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, category: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                  <option value="Food">Food</option>
                  <option value="Travel">Travel</option>
                  <option value="Office">Office</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Amount *
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={newExpense.amount}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, amount: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="0.00"
                />
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Remarks
                </label>
                <textarea
                  rows="3"
                  value={newExpense.remarks}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, remarks: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                  placeholder="Add any notes..."
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNewExpense(false)}
                  className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                  Create Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
