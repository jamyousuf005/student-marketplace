export interface ApplicationAcceptedEmailParams {
  studentName: string
  taskTitle: string
  companyName: string
}

export interface ContractGeneratedEmailParams {
  recipientName: string
  taskTitle: string
  contractUrl: string
}

export function getApplicationAcceptedEmailHtml({ studentName, taskTitle, companyName }: ApplicationAcceptedEmailParams): string {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2>Congratulations ${studentName}!</h2>
      <p>Your application for <strong>${taskTitle}</strong> has been accepted by <strong>${companyName}</strong>!</p>
      <p>Please log into your marketplace dashboard to review and sign the project contract.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/contracts" style="background: #2563eb; color: #fff; padding: 10px 15px; text-decoration: none; border-radius: 5px;">View Contract</a></p>
      <br/>
      <p>Best regards,<br/>The Student Marketplace Team</p>
    </div>
  `
}

export function getContractGeneratedEmailHtml({ recipientName, taskTitle, contractUrl }: ContractGeneratedEmailParams): string {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2>Hello ${recipientName},</h2>
      <p>A new assignment contract has been generated for <strong>${taskTitle}</strong>.</p>
      <p>You can review and sign the contract online at any time.</p>
      <p><a href="${contractUrl}" style="background: #16a34a; color: #fff; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Review Contract Document</a></p>
      <br/>
      <p>Best regards,<br/>The Student Marketplace Team</p>
    </div>
  `
}
