import "dotenv/config";
import mongoose from "mongoose";
import { ApprovalRule } from "../models/approvalRule.model.js";
import { Company } from "../models/company.model.js";
import { Expense } from "../models/expense.model.js";
import { User } from "../models/user.model.js";

const DEMO_DOMAIN = "xpensa.demo";
const DEMO_COMPANY = "Xpensa Demo Workspace";
const PASSWORD = "Demo@12345";

const categories = ["Food", "Travel", "Office", "Accommodation", "Software", "Training", "Other"];

const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

const money = (amount, rate = 1) => Number((amount * rate).toFixed(2));

const connect = async () => {
  if (!process.env.MONGODB_URL) {
    throw new Error("MONGODB_URL is missing in Server/.env");
  }
  await mongoose.connect(process.env.MONGODB_URL);
};

const userDoc = ({ name, email, role, companyId, managerId = null, isManagerApprover = false }) => ({
  name,
  email,
  password: PASSWORD,
  role,
  companyId,
  managerId,
  tempPassword: false,
  isActive: true,
  isManagerApprover,
});

const step = ({ approver, type = "Approver", sequence, required = false, status = "Pending", comment, actedAt }) => ({
  approverId: approver._id,
  approverName: approver.name,
  approverRole: approver.role,
  type,
  sequence,
  required,
  status,
  comment,
  actedAt,
});

const history = ({ action, actor, comment, fromStatus, toStatus, createdAt }) => ({
  action,
  actorId: actor?._id,
  actorName: actor?.name || "System",
  actorRole: actor?.role || "System",
  comment,
  fromStatus,
  toStatus,
  createdAt,
});

const createExpense = ({ employee, manager, approvers, admin, description, category, date, amount, currency = "INR", rate = 1, status, paidBy, remarks }) => {
  const submittedAt = status === "Draft" ? undefined : date;
  const [financeHead, opsLead] = approvers;
  let approvalSteps = [];
  let approvalHistory = [];
  let currentApproverId = null;
  const convertedAmount = money(amount, rate);

  if (status !== "Draft") {
    approvalHistory.push(
      history({
        action: "Submitted",
        actor: employee,
        comment: "Submitted from demo seed data.",
        fromStatus: "Draft",
        toStatus: "Waiting approval",
        createdAt: submittedAt,
      })
    );
  }

  if (status === "Approved") {
    approvalSteps = [
      step({ approver: manager, type: "Manager", sequence: 1, required: true, status: "Approved", comment: "Looks valid.", actedAt: daysAgo(5) }),
      step({ approver: financeHead, sequence: 2, required: true, status: "Approved", comment: "Budget approved.", actedAt: daysAgo(4) }),
      step({ approver: opsLead, sequence: 3, status: "Skipped", comment: "Approval threshold already met.", actedAt: daysAgo(4) }),
    ];
    approvalHistory.push(
      history({ action: "Approved", actor: manager, comment: "Manager approved.", fromStatus: "Waiting approval", toStatus: "Waiting approval", createdAt: daysAgo(5) }),
      history({ action: "Approved", actor: financeHead, comment: "Final approval.", fromStatus: "Waiting approval", toStatus: "Approved", createdAt: daysAgo(4) })
    );
  }

  if (status === "Rejected") {
    approvalSteps = [
      step({ approver: manager, type: "Manager", sequence: 1, required: true, status: "Approved", comment: "Forwarding to finance.", actedAt: daysAgo(8) }),
      step({ approver: financeHead, sequence: 2, required: true, status: "Rejected", comment: "Receipt mismatch.", actedAt: daysAgo(7) }),
      step({ approver: opsLead, sequence: 3, status: "Skipped" }),
    ];
    approvalHistory.push(
      history({ action: "Approved", actor: manager, comment: "Manager approved for review.", fromStatus: "Waiting approval", toStatus: "Waiting approval", createdAt: daysAgo(8) }),
      history({ action: "Rejected", actor: financeHead, comment: "Receipt mismatch.", fromStatus: "Waiting approval", toStatus: "Rejected", createdAt: daysAgo(7) })
    );
  }

  if (status === "Waiting approval") {
    const managerApproved = amount < 12000;
    approvalSteps = [
      step({
        approver: manager,
        type: "Manager",
        sequence: 1,
        required: true,
        status: managerApproved ? "Approved" : "Pending",
        comment: managerApproved ? "Manager approved. Waiting for finance." : undefined,
        actedAt: managerApproved ? daysAgo(1) : undefined,
      }),
      step({ approver: financeHead, sequence: 2, required: true, status: managerApproved ? "Pending" : "Pending" }),
      step({ approver: opsLead, sequence: 3, status: "Pending" }),
    ];
    currentApproverId = managerApproved ? financeHead._id : manager._id;
    if (managerApproved) {
      approvalHistory.push(
        history({ action: "Approved", actor: manager, comment: "Manager approved. Waiting for finance.", fromStatus: "Waiting approval", toStatus: "Waiting approval", createdAt: daysAgo(1) })
      );
    }
  }

  return {
    employeeId: employee._id,
    companyId: employee.companyId,
    description,
    date,
    amount,
    currency,
    convertedAmount,
    convertedCurrency: "INR",
    conversionRate: rate,
    conversionDate: date,
    category,
    remarks,
    status,
    paidBy: paidBy || employee.name,
    managerId: manager._id,
    currentApproverId,
    submittedAt,
    receipt: {
      filename: `${description.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`,
      originalName: "demo-receipt.pdf",
      path: "uploads/demo-receipt.pdf",
      mimeType: "application/pdf",
      size: 128000,
    },
    ocr: {
      rawText: `${description}\n${amount} ${currency}\n${category}`,
      extracted: { amount, date, description, category, vendor: paidBy || "Demo Vendor" },
      processedAt: daysAgo(2),
    },
    approvalSteps,
    approvalHistory,
  };
};

const run = async () => {
  await connect();

  const demoEmails = new RegExp(`@${DEMO_DOMAIN.replace(".", "\\.")}$`);
  const oldUsers = await User.find({ email: demoEmails }).select("_id");
  const oldCompanies = await Company.find({ name: DEMO_COMPANY }).select("_id");
  const oldCompanyIds = oldCompanies.map((company) => company._id);

  await Expense.deleteMany({
    $or: [{ companyId: { $in: oldCompanyIds } }, { employeeId: { $in: oldUsers.map((user) => user._id) } }],
  });
  await ApprovalRule.deleteMany({ companyId: { $in: oldCompanyIds } });
  await User.deleteMany({ email: demoEmails });
  await Company.deleteMany({ _id: { $in: oldCompanyIds } });

  const company = await Company.create({
    name: DEMO_COMPANY,
    country: "India",
    currency: "INR",
    settings: { expenseCategories: categories },
  });

  const admin = await User.create(userDoc({ name: "Aarav Admin", email: `admin@${DEMO_DOMAIN}`, role: "Admin", companyId: company._id }));
  company.createdBy = admin._id;
  await company.save();

  const managers = await User.create([
    userDoc({ name: "Maya Finance", email: `maya.manager@${DEMO_DOMAIN}`, role: "Manager", companyId: company._id, isManagerApprover: true }),
    userDoc({ name: "Rohan Operations", email: `rohan.manager@${DEMO_DOMAIN}`, role: "Manager", companyId: company._id, isManagerApprover: true }),
    userDoc({ name: "Nisha People", email: `nisha.manager@${DEMO_DOMAIN}`, role: "Manager", companyId: company._id, isManagerApprover: true }),
  ]);

  const [maya, rohan, nisha] = managers;
  const employees = await User.create([
    userDoc({ name: "Isha Sharma", email: `isha.employee@${DEMO_DOMAIN}`, role: "Employee", companyId: company._id, managerId: maya._id }),
    userDoc({ name: "Kabir Mehta", email: `kabir.employee@${DEMO_DOMAIN}`, role: "Employee", companyId: company._id, managerId: maya._id }),
    userDoc({ name: "Tara Singh", email: `tara.employee@${DEMO_DOMAIN}`, role: "Employee", companyId: company._id, managerId: rohan._id }),
    userDoc({ name: "Arjun Rao", email: `arjun.employee@${DEMO_DOMAIN}`, role: "Employee", companyId: company._id, managerId: rohan._id }),
    userDoc({ name: "Meera Patel", email: `meera.employee@${DEMO_DOMAIN}`, role: "Employee", companyId: company._id, managerId: nisha._id }),
    userDoc({ name: "Devika Nair", email: `devika.employee@${DEMO_DOMAIN}`, role: "Employee", companyId: company._id, managerId: nisha._id }),
  ]);

  await ApprovalRule.create({
    companyId: company._id,
    managerFirst: true,
    ruleType: "hybrid",
    minimumPercentage: 67,
    specificApproverId: maya._id,
    approvers: [
      { userId: maya._id, sequence: 1, required: true },
      { userId: rohan._id, sequence: 2, required: false },
      { userId: nisha._id, sequence: 3, required: false },
    ],
    isActive: true,
  });

  const [isha, kabir, tara, arjun, meera, devika] = employees;
  const expenses = [
    createExpense({ employee: isha, manager: maya, approvers: [maya, rohan], admin, description: "Client dinner at Blue Table", category: "Food", date: daysAgo(4), amount: 4850, status: "Approved", paidBy: "Blue Table Bistro", remarks: "Dinner after product demo." }),
    createExpense({ employee: kabir, manager: maya, approvers: [maya, rohan], admin, description: "AWS monthly workspace tools", category: "Software", date: daysAgo(9), amount: 14600, status: "Approved", paidBy: "Amazon Web Services", remarks: "Cloud tools for analytics project." }),
    createExpense({ employee: tara, manager: rohan, approvers: [maya, nisha], admin, description: "Mumbai client travel", category: "Travel", date: daysAgo(16), amount: 27800, status: "Approved", paidBy: "Indigo", remarks: "Round trip and local cabs." }),
    createExpense({ employee: arjun, manager: rohan, approvers: [maya, nisha], admin, description: "Conference hotel stay", category: "Accommodation", date: daysAgo(23), amount: 18900, status: "Approved", paidBy: "Grand Orion Hotel" }),
    createExpense({ employee: meera, manager: nisha, approvers: [maya, rohan], admin, description: "Team onboarding lunch", category: "Food", date: daysAgo(12), amount: 7600, status: "Approved", paidBy: "FreshFork Cafe" }),
    createExpense({ employee: devika, manager: nisha, approvers: [maya, rohan], admin, description: "Design workshop tickets", category: "Training", date: daysAgo(29), amount: 22000, status: "Approved", paidBy: "UX India Summit" }),
    createExpense({ employee: isha, manager: maya, approvers: [maya, rohan], admin, description: "Airport lounge upgrade", category: "Travel", date: daysAgo(7), amount: 6200, status: "Rejected", paidBy: "Airport Lounge", remarks: "Policy does not cover personal upgrades." }),
    createExpense({ employee: tara, manager: rohan, approvers: [maya, nisha], admin, description: "Duplicate taxi claim", category: "Travel", date: daysAgo(11), amount: 2100, status: "Rejected", paidBy: "City Cab", remarks: "Same trip already reimbursed." }),
    createExpense({ employee: kabir, manager: maya, approvers: [maya, rohan], admin, description: "Laptop stand and keyboard", category: "Office", date: daysAgo(2), amount: 9200, status: "Waiting approval", paidBy: "OfficeKart", remarks: "Ergonomic equipment." }),
    createExpense({ employee: arjun, manager: rohan, approvers: [maya, nisha], admin, description: "Annual SaaS renewal", category: "Software", date: daysAgo(1), amount: 42500, status: "Waiting approval", paidBy: "Linear", remarks: "Engineering project tracking renewal." }),
    createExpense({ employee: meera, manager: nisha, approvers: [maya, rohan], admin, description: "Hiring event booth", category: "Other", date: daysAgo(3), amount: 31500, status: "Waiting approval", paidBy: "Talent Expo", remarks: "Employer branding booth." }),
    createExpense({ employee: devika, manager: nisha, approvers: [maya, rohan], admin, description: "Figma education plan", category: "Software", date: daysAgo(5), amount: 399, currency: "USD", rate: 83.2, status: "Waiting approval", paidBy: "Figma", remarks: "Product design team workspace." }),
    createExpense({ employee: isha, manager: maya, approvers: [maya, rohan], admin, description: "Draft team snacks", category: "Food", date: daysAgo(0), amount: 1800, status: "Draft", paidBy: "QuickMart", remarks: "Not submitted yet." }),
    createExpense({ employee: tara, manager: rohan, approvers: [maya, nisha], admin, description: "Draft cab receipt", category: "Travel", date: daysAgo(0), amount: 950, status: "Draft", paidBy: "City Cab" }),
  ];

  await Expense.insertMany(expenses);

  console.log("Demo data seeded successfully.");
  console.table([
    { role: "Admin", email: `admin@${DEMO_DOMAIN}`, password: PASSWORD },
    { role: "Manager", email: `maya.manager@${DEMO_DOMAIN}`, password: PASSWORD },
    { role: "Manager", email: `rohan.manager@${DEMO_DOMAIN}`, password: PASSWORD },
    { role: "Manager", email: `nisha.manager@${DEMO_DOMAIN}`, password: PASSWORD },
    { role: "Employee", email: `isha.employee@${DEMO_DOMAIN}`, password: PASSWORD },
    { role: "Employee", email: `kabir.employee@${DEMO_DOMAIN}`, password: PASSWORD },
  ]);
  console.log(`Company: ${DEMO_COMPANY}`);
  console.log(`Users: ${1 + managers.length + employees.length}`);
  console.log(`Expenses: ${expenses.length}`);
};

run()
  .catch((error) => {
    console.error("Demo seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
