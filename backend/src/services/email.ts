import nodemailer from 'nodemailer'
import { EmailOptions } from '@/types'
import config, { isDevelopment } from '@/utils/config'

export class EmailService {
  private static transporter: nodemailer.Transporter | null = null

  /**
   * Initialize email transporter
   */
  private static async getTransporter(): Promise<nodemailer.Transporter> {
    if (!this.transporter) {
      if (isDevelopment) {
        // Use Ethereal for development testing
        const testAccount = await nodemailer.createTestAccount()
        
        this.transporter = nodemailer.createTransporter({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        })
      } else {
        // Use configured SMTP for production
        this.transporter = nodemailer.createTransporter({
          host: config.SMTP_HOST,
          port: config.SMTP_PORT,
          secure: config.SMTP_PORT === 465,
          auth: {
            user: config.SMTP_USER,
            pass: config.SMTP_PASS,
          },
        })
      }

      // Verify connection
      try {
        await this.transporter.verify()
        console.log('✅ Email service connected successfully')
      } catch (error) {
        console.error('❌ Email service connection failed:', error)
      }
    }

    return this.transporter
  }

  /**
   * Send email
   */
  static async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const transporter = await this.getTransporter()
      
      const mailOptions = {
        from: `${config.FROM_NAME} <${config.FROM_EMAIL}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      }

      const info = await transporter.sendMail(mailOptions)
      
      if (isDevelopment) {
        console.log('📧 Email sent:', nodemailer.getTestMessageUrl(info))
      } else {
        console.log('📧 Email sent successfully to:', options.to)
      }
    } catch (error) {
      console.error('❌ Failed to send email:', error)
      throw new Error('Failed to send email')
    }
  }

  /**
   * Send welcome email
   */
  static async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const html = this.getWelcomeEmailTemplate(name)
    
    await this.sendEmail({
      to: email,
      subject: 'Welcome to Public Blog! 🎉',
      text: `Welcome to Public Blog, ${name}! We're excited to have you join our community.`,
      html,
    })
  }

  /**
   * Send email verification
   */
  static async sendVerificationEmail(email: string, name: string, verificationUrl: string): Promise<void> {
    const html = this.getVerificationEmailTemplate(name, verificationUrl)
    
    await this.sendEmail({
      to: email,
      subject: 'Verify your email address',
      text: `Hi ${name}, please verify your email address by clicking this link: ${verificationUrl}`,
      html,
    })
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(email: string, name: string, resetUrl: string): Promise<void> {
    const html = this.getPasswordResetEmailTemplate(name, resetUrl)
    
    await this.sendEmail({
      to: email,
      subject: 'Reset your password',
      text: `Hi ${name}, you requested a password reset. Click this link to reset your password: ${resetUrl}`,
      html,
    })
  }

  /**
   * Send password change notification
   */
  static async sendPasswordChangeNotification(email: string, name: string): Promise<void> {
    const html = this.getPasswordChangeNotificationTemplate(name)
    
    await this.sendEmail({
      to: email,
      subject: 'Password Changed Successfully',
      text: `Hi ${name}, your password has been changed successfully.`,
      html,
    })
  }

  /**
   * Send new comment notification
   */
  static async sendCommentNotification(
    email: string, 
    authorName: string, 
    postTitle: string, 
    commenterName: string, 
    commentContent: string,
    postUrl: string
  ): Promise<void> {
    const html = this.getCommentNotificationTemplate(
      authorName, 
      postTitle, 
      commenterName, 
      commentContent,
      postUrl
    )
    
    await this.sendEmail({
      to: email,
      subject: `New comment on "${postTitle}"`,
      text: `Hi ${authorName}, ${commenterName} commented on your post "${postTitle}": ${commentContent}`,
      html,
    })
  }

  /**
   * Email templates
   */
  private static getWelcomeEmailTemplate(name: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Welcome to Public Blog</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0;">Welcome to Public Blog! 🎉</h1>
            </div>
            <div style="margin-bottom: 30px;">
              <p>Hi ${name},</p>
              <p>Welcome to Public Blog! We're thrilled to have you join our community of writers and readers.</p>
              <p>Here's what you can do now:</p>
              <ul>
                <li>📝 Start writing your first blog post</li>
                <li>👥 Connect with other writers in the community</li>
                <li>📚 Discover amazing content from fellow bloggers</li>
                <li>💬 Engage with posts through comments and likes</li>
              </ul>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${config.FRONTEND_URL}" style="background-color: #2563eb; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">Explore Public Blog</a>
              </div>
              <p>If you have any questions or need help getting started, don't hesitate to reach out to our support team.</p>
              <p>Happy blogging!</p>
              <p>The Public Blog Team</p>
            </div>
            <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #666; font-size: 12px;">
              <p>© 2024 Public Blog. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }

  private static getVerificationEmailTemplate(name: string, verificationUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Verify Your Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0;">Verify Your Email Address 📧</h1>
            </div>
            <div style="margin-bottom: 30px;">
              <p>Hi ${name},</p>
              <p>Thank you for signing up for Public Blog! Please verify your email address to complete your registration.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" style="background-color: #16a34a; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify Email Address</a>
              </div>
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="background-color: #f8f9fa; padding: 10px; border-radius: 4px; word-break: break-all; font-family: monospace; font-size: 12px;">${verificationUrl}</p>
              <p>This verification link will expire in 24 hours for security reasons.</p>
              <p>If you didn't create an account with Public Blog, you can safely ignore this email.</p>
              <p>Best regards,<br>The Public Blog Team</p>
            </div>
            <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #666; font-size: 12px;">
              <p>© 2024 Public Blog. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }

  private static getPasswordResetEmailTemplate(name: string, resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Reset Your Password</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #dc2626; margin: 0;">Reset Your Password 🔐</h1>
            </div>
            <div style="margin-bottom: 30px;">
              <p>Hi ${name},</p>
              <p>We received a request to reset your password for your Public Blog account. If you made this request, click the button below to reset your password:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background-color: #dc2626; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
              </div>
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="background-color: #f8f9fa; padding: 10px; border-radius: 4px; word-break: break-all; font-family: monospace; font-size: 12px;">${resetUrl}</p>
              <p><strong>Important:</strong> This password reset link will expire in 1 hour for security reasons.</p>
              <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
              <p>For your account security, please:</p>
              <ul>
                <li>Choose a strong, unique password</li>
                <li>Don't share your password with anyone</li>
                <li>Use a password manager if possible</li>
              </ul>
              <p>Best regards,<br>The Public Blog Team</p>
            </div>
            <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #666; font-size: 12px;">
              <p>© 2024 Public Blog. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }

  private static getPasswordChangeNotificationTemplate(name: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Password Changed</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #16a34a; margin: 0;">Password Changed Successfully ✅</h1>
            </div>
            <div style="margin-bottom: 30px;">
              <p>Hi ${name},</p>
              <p>This is a confirmation that your password for your Public Blog account has been changed successfully.</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
              <p>If you made this change, no further action is required.</p>
              <p>If you did NOT change your password, please contact our support team immediately and consider the following steps:</p>
              <ul>
                <li>Change your password immediately</li>
                <li>Review your account for any unauthorized activity</li>
                <li>Check your other accounts that might use the same password</li>
              </ul>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${config.FRONTEND_URL}/support" style="background-color: #dc2626; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">Contact Support</a>
              </div>
              <p>Best regards,<br>The Public Blog Team</p>
            </div>
            <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #666; font-size: 12px;">
              <p>© 2024 Public Blog. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }

  private static getCommentNotificationTemplate(
    authorName: string,
    postTitle: string,
    commenterName: string,
    commentContent: string,
    postUrl: string
  ): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>New Comment</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0;">New Comment on Your Post 💬</h1>
            </div>
            <div style="margin-bottom: 30px;">
              <p>Hi ${authorName},</p>
              <p><strong>${commenterName}</strong> just commented on your post "<strong>${postTitle}</strong>":</p>
              <div style="background-color: #f8f9fa; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; font-style: italic;">"${commentContent}"</p>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${postUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">View Comment</a>
              </div>
              <p>You can reply to this comment directly on your post page.</p>
              <p>Keep the conversation going!</p>
              <p>The Public Blog Team</p>
            </div>
            <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #666; font-size: 12px;">
              <p>© 2024 Public Blog. All rights reserved.</p>
              <p>You can manage your email preferences in your account settings.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }
}