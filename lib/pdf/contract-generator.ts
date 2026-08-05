export interface ContractData {
  contractId: string
  taskTitle: string
  taskDescription: string
  budget: number
  category: string
  enterpriseName: string
  studentName: string
  createdDate: string
}

export function generateContractHtml(data: ContractData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Contract #${data.contractId}</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 40px; color: #1a1a1a; line-height: 1.6; }
    .header { border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
    .title { font-size: 24px; font-weight: bold; color: #1e293b; margin: 0; }
    .subtitle { font-size: 14px; color: #64748b; margin-top: 5px; }
    .section { margin-bottom: 25px; }
    .section-title { font-size: 16px; font-weight: bold; color: #2563eb; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .card { background: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0; }
    .label { font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600; }
    .value { font-size: 15px; font-weight: 500; color: #0f172a; margin-top: 4px; }
    .terms { font-size: 13px; color: #334155; }
    .signatures { display: flex; justify-content: space-between; margin-top: 50px; pt-20; }
    .sig-box { width: 45%; border-top: 1px dashed #94a3b8; padding-top: 10px; text-align: center; }
    .footer { font-size: 11px; color: #94a3b8; text-align: center; margin-top: 50px; }
  </style>
</head>
<body>
  <div class="header">
    <h1 class="title">OFFICIAL ASSIGNMENT CONTRACT</h1>
    <div class="subtitle">Enterprise Student Marketplace • Contract ID: ${data.contractId}</div>
  </div>

  <div class="section grid">
    <div class="card">
      <div class="label">Hiring Enterprise</div>
      <div class="value">${data.enterpriseName}</div>
    </div>
    <div class="card">
      <div class="label">Selected Student</div>
      <div class="value">${data.studentName}</div>
    </div>
  </div>

  <div class="section card">
    <div class="label">Project Details</div>
    <div class="value" style="font-size: 18px; color: #2563eb; margin-bottom: 8px;">${data.taskTitle}</div>
    <div class="label">Category</div>
    <div class="value" style="margin-bottom: 8px;">${data.category}</div>
    <div class="label">Description</div>
    <div class="value" style="font-weight: normal; margin-bottom: 8px;">${data.taskDescription}</div>
    <div class="label">Agreed Compensation</div>
    <div class="value" style="font-size: 18px; color: #16a34a;">$${data.budget.toLocaleString()} USD</div>
  </div>

  <div class="section">
    <div class="section-title">Terms & Conditions</div>
    <div class="terms">
      <ol>
        <li><strong>Scope of Work:</strong> The Student agrees to perform tasks described in the project specification to professional standard.</li>
        <li><strong>Payment Schedule:</strong> Funds shall be disbursed upon verified completion and sign-off by the Enterprise.</li>
        <li><strong>Confidentiality:</strong> Both parties agree to protect proprietary materials and intellectual property shared during execution.</li>
        <li><strong>Governing Terms:</strong> This contract is governed by standard marketplace digital terms and dispute policies.</li>
      </ol>
    </div>
  </div>

  <div class="signatures">
    <div class="sig-box">
      <p>Enterprise Authorized Signature</p>
      <p style="font-size: 12px; color: #64748b;">${data.enterpriseName}</p>
    </div>
    <div class="sig-box">
      <p>Student Signature</p>
      <p style="font-size: 12px; color: #64748b;">${data.studentName}</p>
    </div>
  </div>

  <div class="footer">
    Generated on ${data.createdDate} • Enterprise Student Marketplace System
  </div>
</body>
</html>
`
}
