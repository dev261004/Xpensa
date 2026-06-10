const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const baseTemplate = ({ title, preview, body }) => {
  const safeTitle = escapeHtml(title);
  return `
  <!doctype html>
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <title>${safeTitle}</title>
    </head>
    <body style="margin:0;background:#f3f6fb;font-family:Arial,Helvetica,sans-serif;color:#172033;">
      <span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">${escapeHtml(preview)}</span>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f6fb;padding:24px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #dfe7f3;border-radius:12px;overflow:hidden;">
              <tr>
                <td style="background:#0f766e;padding:24px 28px;color:#ffffff;">
                  <div style="font-size:22px;font-weight:700;letter-spacing:.2px;">Xpensa</div>
                  <div style="font-size:13px;opacity:.9;margin-top:4px;">Expense approvals without the paperwork</div>
                </td>
              </tr>
              <tr>
                <td style="padding:28px;">
                  <h1 style="font-size:22px;line-height:1.3;margin:0 0 16px;color:#111827;">${safeTitle}</h1>
                  ${body}
                </td>
              </tr>
              <tr>
                <td style="padding:18px 28px;background:#f8fafc;color:#64748b;font-size:12px;">
                  This message was sent by Xpensa. Please do not share temporary credentials or approval links.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
};

const paragraph = (text) =>
  `<p style="font-size:15px;line-height:1.7;margin:0 0 16px;color:#334155;">${escapeHtml(text)}</p>`;

const pill = (label, value) =>
  `<tr><td style="padding:10px 0;color:#64748b;font-size:13px;">${escapeHtml(label)}</td><td style="padding:10px 0;text-align:right;color:#111827;font-weight:700;">${escapeHtml(value)}</td></tr>`;

const detailsTable = (rows) =>
  `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;margin:18px 0;">${rows.join("")}</table>`;

export const templates = {
  credentials: ({ name, email, password }) => ({
    subject: "Your Xpensa account is ready",
    text: `Hello ${name},\n\nYour Xpensa account has been created.\nEmail: ${email}\nTemporary password: ${password}\n\nPlease sign in and change your password.`,
    html: baseTemplate({
      title: "Your Xpensa account is ready",
      preview: "Your temporary credentials are inside.",
      body:
        paragraph(`Hello ${name}, your Xpensa account has been created.`) +
        detailsTable([pill("Email", email), pill("Temporary password", password)]) +
        paragraph("Please sign in and change this password immediately."),
    }),
  }),
  temporaryPassword: ({ name, password }) => ({
    subject: "Your Xpensa temporary password",
    text: `Hello ${name},\n\nYour temporary password is: ${password}\nPlease sign in and reset it immediately.`,
    html: baseTemplate({
      title: "Temporary password generated",
      preview: "Use this password once, then update it.",
      body:
        paragraph(`Hello ${name}, we generated a temporary password for your account.`) +
        detailsTable([pill("Temporary password", password)]) +
        paragraph("Use it once and set a new password from the reset screen."),
    }),
  }),
  expenseSubmitted: ({ employeeName, description, amount }) => ({
    subject: "Expense submitted for approval",
    text: `${employeeName} submitted ${description} (${amount}) for approval.`,
    html: baseTemplate({
      title: "Expense submitted",
      preview: `${employeeName} submitted an expense.`,
      body: paragraph(`${employeeName} submitted an expense for approval.`) + detailsTable([pill("Expense", description), pill("Amount", amount)]),
    }),
  }),
  approvalAssigned: ({ approverName, employeeName, description, amount }) => ({
    subject: "Expense approval assigned to you",
    text: `Hello ${approverName},\n\n${employeeName} has an expense waiting for your review: ${description} (${amount}).`,
    html: baseTemplate({
      title: "Approval needed",
      preview: "An expense is waiting for your review.",
      body:
        paragraph(`Hello ${approverName}, ${employeeName} has an expense waiting for your review.`) +
        detailsTable([pill("Expense", description), pill("Amount", amount)]),
    }),
  }),
  expenseOutcome: ({ employeeName, description, status, comment }) => ({
    subject: `Expense ${status.toLowerCase()}`,
    text: `Hello ${employeeName},\n\nYour expense "${description}" was ${status.toLowerCase()}.\n${comment || ""}`,
    html: baseTemplate({
      title: `Expense ${status.toLowerCase()}`,
      preview: `Your expense was ${status.toLowerCase()}.`,
      body:
        paragraph(`Hello ${employeeName}, your expense has been ${status.toLowerCase()}.`) +
        detailsTable([pill("Expense", description), pill("Status", status), pill("Comment", comment || "-")]),
    }),
  }),
  adminOverride: ({ employeeName, description, status, comment }) => ({
    subject: `Expense override: ${status}`,
    text: `An admin override set ${employeeName}'s expense "${description}" to ${status}. ${comment}`,
    html: baseTemplate({
      title: "Admin override applied",
      preview: `Expense was manually set to ${status}.`,
      body:
        paragraph(`An admin override updated ${employeeName}'s expense.`) +
        detailsTable([pill("Expense", description), pill("Final status", status), pill("Reason", comment)]),
    }),
  }),
};
