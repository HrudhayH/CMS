let sgMail = null;

/**
 * Lazy-initialize SendGrid
 */
function getSendGrid() {
  if (!sgMail) {
    sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }
  return sgMail;
}

/**
 * Build a clean, modern OTP email template
 */
function buildOtpEmailHtml(otp, ttlMinutes) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Password Reset OTP</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f6f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,0.08);overflow:hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">Password Reset</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">CMS Portal</p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding:36px 40px 24px;">
              <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">
                We received a request to reset your password. Use the verification code below to proceed:
              </p>
              
              <!-- OTP Box -->
              <div style="text-align:center;margin:28px 0;">
                <div style="display:inline-block;background:#f0f5ff;border:2px dashed #2563eb;border-radius:10px;padding:18px 40px;">
                  <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#1d4ed8;font-family:'Courier New',monospace;">${otp}</span>
                </div>
              </div>
              
              <!-- Expiry -->
              <p style="margin:0 0 20px;text-align:center;color:#6b7280;font-size:13px;">
                This code expires in <strong style="color:#374151;">${ttlMinutes} minutes</strong>.
              </p>
              
              <!-- Security Warning -->
              <div style="background:#fef3c7;border-left:4px solid #f59e0b;border-radius:6px;padding:14px 16px;margin:20px 0 0;">
                <p style="margin:0;color:#92400e;font-size:13px;line-height:1.5;">
                  <strong>⚠ Security Notice:</strong> If you did not request this password reset, please ignore this email. Do not share this code with anyone.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px 28px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;line-height:1.6;">
                This is an automated message from CMS Portal.<br />
                Please do not reply to this email.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Send OTP email via SendGrid
 */
async function sendOtpEmail(toEmail, otp) {
  const sg = getSendGrid();
  const ttlMinutes = parseInt(process.env.OTP_TTL_MIN, 10) || 5;

  const msg = {
    to: toEmail,
    from: process.env.EMAIL_FROM,
    subject: 'Password Reset OTP — CMS Portal',
    html: buildOtpEmailHtml(otp, ttlMinutes)
  };

  await sg.send(msg);
}

module.exports = { sendOtpEmail };
