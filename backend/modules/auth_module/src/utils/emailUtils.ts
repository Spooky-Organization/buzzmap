import { Resend } from "resend";
import { getEnv } from "./envValidation";

/**
 * Get Resend configuration from validated environment variables
 */
function getResendConfig() {
  return {
    apiKey: getEnv('RESEND_API_KEY'),
    fromEmail: getEnv('RESEND_FROM_EMAIL'),
    fromName: getEnv('RESEND_FROM_NAME'),
  };
}

/**
 * Send an email using Resend
 * @param to - Recipient email address
 * @param subject - Email subject
 * @param html - HTML content
 * @param text - Plain text content (optional)
 */
export async function sendEmail({
  to,
  subject,
  html,
  text = "",
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<void> {
  const config = getResendConfig();
  const resend = new Resend(config.apiKey);

  await resend.emails.send({
    from: `${config.fromName} <${config.fromEmail}>`,
    to,
    subject,
    html,
    text,
  });
}

/**
 * Generate email verification template
 */
export function getVerificationEmailTemplate({
  to,
  token,
  appUrl = getEnv('APP_URL'),
}: {
  to: string;
  token: string;
  appUrl?: string;
}) {
  const verifyUrl = `${appUrl}/verify-email?token=${token}`;
  return {
    to,
    subject: "Verify your email address",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
          }
          
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
          }
          
          .header h1 {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 10px;
          }
          
          .header p {
            font-size: 16px;
            opacity: 0.9;
          }
          
          .content {
            padding: 40px 30px;
          }
          
          .welcome-text {
            font-size: 18px;
            color: #2d3748;
            margin-bottom: 20px;
            text-align: center;
          }
          
          .description {
            font-size: 16px;
            color: #4a5568;
            margin-bottom: 30px;
            text-align: center;
            line-height: 1.7;
          }
          
          .button-container {
            text-align: center;
            margin: 30px 0;
          }
          
          .verify-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          }
          
          .verify-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
          }
          
          .link-text {
            font-size: 14px;
            color: #718096;
            margin-top: 20px;
            text-align: center;
          }
          
          .link-text a {
            color: #667eea;
            text-decoration: none;
            word-break: break-all;
          }
          
          .footer {
            background-color: #f7fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
          }
          
          .footer p {
            font-size: 14px;
            color: #718096;
            margin-bottom: 10px;
          }
          
          .footer .disclaimer {
            font-size: 12px;
            color: #a0aec0;
            margin-top: 15px;
          }
          
          @media (max-width: 600px) {
            .container {
              margin: 10px;
              border-radius: 4px;
            }
            
            .header {
              padding: 30px 20px;
            }
            
            .header h1 {
              font-size: 24px;
            }
            
            .content {
              padding: 30px 20px;
            }
            
            .verify-button {
              padding: 14px 28px;
              font-size: 15px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Auth System</h1>
            <p>Complete your registration</p>
          </div>
          
          <div class="content">
            <p class="welcome-text">Thank you for registering with us!</p>
            <p class="description">
              To complete your registration and start using your account, please verify your email address by clicking the button below.
            </p>
            
            <div class="button-container">
              <a href="${verifyUrl}" class="verify-button">Verify Email Address</a>
            </div>
            
            <p class="link-text">
              If the button doesn't work, you can copy and paste this link into your browser:<br>
              <a href="${verifyUrl}">${verifyUrl}</a>
            </p>
          </div>
          
          <div class="footer">
            <p>This email was sent to ${to}</p>
            <p>If you didn't create an account, you can safely ignore this email.</p>
            <p class="disclaimer">
              This is an automated message, please do not reply to this email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Thank you for registering with Auth System!

To complete your registration, please verify your email address by visiting this link:
${verifyUrl}

If you didn't create an account, you can safely ignore this email.

This is an automated message, please do not reply to this email.`,
  };
}

/**
 * Generate password reset email template
 */
export function getPasswordResetEmailTemplate({
  to,
  token,
  appUrl = getEnv('APP_URL'),
}: {
  to: string;
  token: string;
  appUrl?: string;
}) {
  const resetUrl = `${appUrl}/reset-password?token=${token}`;
  return {
    to,
    subject: "Reset your password",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
          }
          
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          
          .header {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
          }
          
          .header h1 {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 10px;
          }
          
          .header p {
            font-size: 16px;
            opacity: 0.9;
          }
          
          .content {
            padding: 40px 30px;
          }
          
          .title {
            font-size: 20px;
            color: #2d3748;
            margin-bottom: 20px;
            text-align: center;
            font-weight: 600;
          }
          
          .description {
            font-size: 16px;
            color: #4a5568;
            margin-bottom: 30px;
            text-align: center;
            line-height: 1.7;
          }
          
          .button-container {
            text-align: center;
            margin: 30px 0;
          }
          
          .reset-button {
            display: inline-block;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(240, 147, 251, 0.4);
          }
          
          .reset-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(240, 147, 251, 0.6);
          }
          
          .link-text {
            font-size: 14px;
            color: #718096;
            margin-top: 20px;
            text-align: center;
          }
          
          .link-text a {
            color: #f093fb;
            text-decoration: none;
            word-break: break-all;
          }
          
          .warning {
            background-color: #fff5f5;
            border: 1px solid #fed7d7;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
          }
          
          .warning p {
            font-size: 14px;
            color: #c53030;
            margin: 0;
          }
          
          .footer {
            background-color: #f7fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
          }
          
          .footer p {
            font-size: 14px;
            color: #718096;
            margin-bottom: 10px;
          }
          
          .footer .disclaimer {
            font-size: 12px;
            color: #a0aec0;
            margin-top: 15px;
          }
          
          @media (max-width: 600px) {
            .container {
              margin: 10px;
              border-radius: 4px;
            }
            
            .header {
              padding: 30px 20px;
            }
            
            .header h1 {
              font-size: 24px;
            }
            
            .content {
              padding: 30px 20px;
            }
            
            .reset-button {
              padding: 14px 28px;
              font-size: 15px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
            <p>Secure your account</p>
          </div>
          
          <div class="content">
            <h2 class="title">Reset Your Password</h2>
            <p class="description">
              We received a request to reset your password. Click the button below to create a new password for your account.
            </p>
            
            <div class="warning">
              <p>⚠️ This link will expire in 1 hour for security reasons.</p>
            </div>
            
            <div class="button-container">
              <a href="${resetUrl}" class="reset-button">Reset Password</a>
            </div>
            
            <p class="link-text">
              If the button doesn't work, you can copy and paste this link into your browser:<br>
              <a href="${resetUrl}">${resetUrl}</a>
            </p>
          </div>
          
          <div class="footer">
            <p>This email was sent to ${to}</p>
            <p>If you didn't request a password reset, you can safely ignore this email.</p>
            <p class="disclaimer">
              This is an automated message, please do not reply to this email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Password Reset Request

We received a request to reset your password for your Auth System account.

To reset your password, please visit this link:
${resetUrl}

⚠️ This link will expire in 1 hour for security reasons.

If you didn't request a password reset, you can safely ignore this email.

This is an automated message, please do not reply to this email.`,
  };
}
