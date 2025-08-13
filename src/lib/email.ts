import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'

// Lazy load nodemailer to avoid import issues
let transporter: any = null

async function getTransporter() {
  if (!transporter && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const nodemailer = await import('nodemailer')
    transporter = nodemailer.default.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }
  return transporter
}

// Generate verification token
export function generateVerificationToken(): string {
  return randomBytes(32).toString('hex')
}

// Email templates
const emailTemplates = {
  verification: (name: string, verificationUrl: string) => ({
    subject: 'Verify your email address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to Analytics Dashboard!</h2>
        <p>Hi ${name || 'there'},</p>
        <p>Thanks for signing up! Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">
          This email was sent from Analytics Dashboard. 
          Please do not reply to this email.
        </p>
      </div>
    `,
    text: `
Welcome to Analytics Dashboard!

Hi ${name || 'there'},

Thanks for signing up! Please verify your email address by clicking the link below:

${verificationUrl}

This link will expire in 24 hours.

If you didn't create an account, you can safely ignore this email.

Best regards,
Analytics Dashboard Team
    `.trim()
  }),
  
  passwordReset: (name: string, resetUrl: string) => ({
    subject: 'Reset your password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hi ${name || 'there'},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #666; word-break: break-all;">${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">
          This email was sent from Analytics Dashboard. 
          Please do not reply to this email.
        </p>
      </div>
    `,
    text: `
Password Reset Request

Hi ${name || 'there'},

We received a request to reset your password. Click the link below to create a new password:

${resetUrl}

This link will expire in 1 hour.

If you didn't request a password reset, you can safely ignore this email.

Best regards,
Analytics Dashboard Team
    `.trim()
  })
}

// Send verification email
export async function sendVerificationEmail(
  email: string,
  name: string | null,
  userId: string
): Promise<void> {
  try {
    // Generate verification token
    const token = generateVerificationToken()
    const expires = new Date()
    expires.setHours(expires.getHours() + 24) // 24 hour expiry
    
    // Store token in database
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    })
    
    // Generate verification URL
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const verificationUrl = `${baseUrl}/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`
    
    // Get email content
    const { subject, html, text } = emailTemplates.verification(name || '', verificationUrl)
    
    // Send email
    const mailer = await getTransporter()
    if (!mailer) {
      throw new Error('Email service not configured')
    }
    
    await mailer.sendMail({
      from: process.env.SMTP_FROM || '"Analytics Dashboard" <noreply@analytics.com>',
      to: email,
      subject,
      html,
      text,
    })
    
    console.log(`✅ Verification email sent to ${email}`)
  } catch (error) {
    console.error('❌ Failed to send verification email:', error)
    throw new Error('Failed to send verification email')
  }
}

// Send password reset email
export async function sendPasswordResetEmail(
  email: string,
  name: string | null
): Promise<void> {
  try {
    // Generate reset token
    const token = generateVerificationToken()
    const expires = new Date()
    expires.setHours(expires.getHours() + 1) // 1 hour expiry
    
    // Store token in database
    await prisma.verificationToken.create({
      data: {
        identifier: `reset_${email}`, // Prefix to differentiate from email verification
        token,
        expires,
      },
    })
    
    // Generate reset URL
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const resetUrl = `${baseUrl}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`
    
    // Get email content
    const { subject, html, text } = emailTemplates.passwordReset(name || '', resetUrl)
    
    // Send email
    const mailer = await getTransporter()
    if (!mailer) {
      throw new Error('Email service not configured')
    }
    
    await mailer.sendMail({
      from: process.env.SMTP_FROM || '"Analytics Dashboard" <noreply@analytics.com>',
      to: email,
      subject,
      html,
      text,
    })
    
    console.log(`✅ Password reset email sent to ${email}`)
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error)
    throw new Error('Failed to send password reset email')
  }
}

// Verify email token
export async function verifyEmailToken(
  token: string,
  email: string
): Promise<boolean> {
  try {
    // Find the token
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        token,
        identifier: email,
        expires: {
          gt: new Date(),
        },
      },
    })
    
    if (!verificationToken) {
      return false
    }
    
    // Update user's email verification status
    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    })
    
    // Delete the used token
    await prisma.verificationToken.delete({
      where: {
        token,
      },
    })
    
    return true
  } catch (error) {
    console.error('❌ Failed to verify email token:', error)
    return false
  }
}

// Check if email service is configured
export function isEmailServiceConfigured(): boolean {
  return !!(process.env.SMTP_USER && process.env.SMTP_PASS)
}