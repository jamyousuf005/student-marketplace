import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASSWORD || '',
  },
})

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.log(`[Email Service Simulation] To: ${to} | Subject: ${subject}`)
    return { success: true, simulated: true }
  }

  try {
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'Student Marketplace'}" <${process.env.SMTP_FROM_EMAIL || 'noreply@marketplace.com'}>`,
      to,
      subject,
      html,
    })

    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Failed to send email:', error)
    return { success: false, error }
  }
}
