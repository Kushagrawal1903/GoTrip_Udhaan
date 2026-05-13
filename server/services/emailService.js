const nodemailer = require('nodemailer');
const { Resend } = require('resend');

// ─── Resend Client (lazy singleton) ─────────────────────────
let resendClient = null;

function getResendClient() {
    if (!resendClient) {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            console.warn('RESEND_API_KEY not configured — Resend emails will be skipped.');
            return null;
        }
        resendClient = new Resend(apiKey);
    }
    return resendClient;
}

// ─── Nodemailer Transporter (for SMTP-based emails) ────────
function createTransporter() {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
        return null;
    }

    return nodemailer.createTransport({
        host,
        port: parseInt(port) || 587,
        secure: parseInt(port) === 465,
        auth: { user, pass },
    });
}

// ─── WELCOME EMAIL (via Resend) ─────────────────────────────

/**
 * Send a beautiful welcome email to a new user via Resend.
 * @param {Object} user - The newly created user
 * @param {string} user.name  - User's display name
 * @param {string} user.email - User's email address
 */
async function sendWelcomeEmail(user) {
    const resend = getResendClient();
    if (!resend) return;

    const { name, email } = user || {};

    if (!email) {
        console.warn('sendWelcomeEmail: No email provided — skipping.');
        return;
    }

    const displayName = name || 'Traveler';
    const clientUrl = process.env.CLIENT_URL || 'https://mygotrip.vercel.app';
    const fromAddress = process.env.EMAIL_FROM || 'GoTrip <onboarding@resend.dev>';

    const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Welcome to GoTrip</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f4f8;padding:40px 16px;">
<tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

  <!-- Header gradient -->
  <tr>
    <td style="background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 40%,#0d7377 100%);padding:48px 40px 36px;text-align:center;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr><td align="center" style="padding-bottom:16px;">
          <span style="font-size:40px;">✈️</span>
        </td></tr>
        <tr><td align="center">
          <h1 style="margin:0;font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Welcome to GoTrip</h1>
        </td></tr>
        <tr><td align="center" style="padding-top:8px;">
          <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.75);font-weight:400;">Your AI-powered travel companion</p>
        </td></tr>
      </table>
    </td>
  </tr>

  <!-- Body -->
  <tr>
    <td style="padding:36px 40px 20px;">
      <h2 style="margin:0 0 20px;font-size:22px;font-weight:700;color:#1a1a2e;">Hi ${displayName} 👋</h2>

      <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.7;">
        Welcome aboard! We're thrilled to have you join <strong>GoTrip</strong> — your personal AI travel planner that makes trip planning effortless and exciting.
      </p>

      <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.7;">
        Here's what you can do:
      </p>

      <!-- Feature cards -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <tr><td style="padding:14px 16px;background:#f8fafc;border-radius:10px;margin-bottom:8px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="36" valign="top" style="font-size:20px;padding-right:12px;">🤖</td>
              <td>
                <strong style="font-size:14px;color:#1e293b;">AI-Powered Itineraries</strong>
                <p style="margin:4px 0 0;font-size:13px;color:#64748b;line-height:1.5;">Get personalized day-by-day travel plans crafted by AI in seconds.</p>
              </td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="height:8px;"></td></tr>
        <tr><td style="padding:14px 16px;background:#f8fafc;border-radius:10px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="36" valign="top" style="font-size:20px;padding-right:12px;">🏨</td>
              <td>
                <strong style="font-size:14px;color:#1e293b;">Hotel Recommendations</strong>
                <p style="margin:4px 0 0;font-size:13px;color:#64748b;line-height:1.5;">Discover curated stays that match your style and budget.</p>
              </td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="height:8px;"></td></tr>
        <tr><td style="padding:14px 16px;background:#f8fafc;border-radius:10px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="36" valign="top" style="font-size:20px;padding-right:12px;">💰</td>
              <td>
                <strong style="font-size:14px;color:#1e293b;">Smart Budget Planning</strong>
                <p style="margin:4px 0 0;font-size:13px;color:#64748b;line-height:1.5;">Plan trips that fit your wallet — from budget to luxury.</p>
              </td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="height:8px;"></td></tr>
        <tr><td style="padding:14px 16px;background:#f8fafc;border-radius:10px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="36" valign="top" style="font-size:20px;padding-right:12px;">🗺️</td>
              <td>
                <strong style="font-size:14px;color:#1e293b;">Seamless Trip Planning</strong>
                <p style="margin:4px 0 0;font-size:13px;color:#64748b;line-height:1.5;">Everything you need in one place — plan, pack, share, and go.</p>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>

      <!-- CTA Button -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr><td align="center" style="padding:8px 0 16px;">
          <a href="${clientUrl}" target="_blank" style="display:inline-block;background:linear-gradient(135deg,#0d9488 0%,#0f766e 100%);color:#ffffff;text-decoration:none;padding:16px 44px;border-radius:12px;font-size:16px;font-weight:700;letter-spacing:0.3px;box-shadow:0 4px 14px rgba(13,148,136,0.35);">
            Plan Your First Trip →
          </a>
        </td></tr>
      </table>
    </td>
  </tr>

  <!-- Divider -->
  <tr><td style="padding:0 40px;">
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:0;" />
  </td></tr>

  <!-- Footer -->
  <tr>
    <td style="padding:24px 40px 32px;text-align:center;">
      <p style="margin:0 0 8px;font-size:13px;color:#94a3b8;">
        Explore smarter travel with GoTrip 🌍
      </p>
      <p style="margin:0;font-size:12px;color:#cbd5e1;">
        You received this email because you signed up for GoTrip.<br/>
        &copy; ${new Date().getFullYear()} GoTrip. All rights reserved.
      </p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`;

    const textBody = `Hi ${displayName} 👋\n\nWelcome to GoTrip — your AI-powered travel companion!\n\nHere's what you can do:\n• AI-powered personalized itineraries\n• Curated hotel recommendations\n• Smart budget planning\n• Seamless trip planning\n\nStart planning your first trip: ${clientUrl}\n\nExplore smarter travel with GoTrip 🌍\n\n© ${new Date().getFullYear()} GoTrip. All rights reserved.`;

    try {
        await resend.emails.send({
            from: fromAddress,
            to: email,
            subject: `Welcome to GoTrip, ${displayName}! ✈️`,
            html: htmlBody,
            text: textBody,
        });
        console.log(`✅ Welcome email sent to: ${email}`);
    } catch (error) {
        console.error(`❌ Failed to send welcome email to ${email}:`, error.message);
        // Never throw — email failure must not break the auth flow
    }
}

// ─── INVITE EMAIL (via Nodemailer / SMTP) ───────────────────

/**
 * Send a collaboration invite email
 * @param {Object} params - Email parameters
 */
async function sendInviteEmail({ ownerName, recipientEmail, destination, duration, travelStyle, inviteUrl }) {
    const transporter = createTransporter();
    if (!transporter) {
        // SMTP not configured — skip silently
        return;
    }

    const fromEmail = process.env.FROM_EMAIL || `GoTrip Pro <${process.env.SMTP_USER}>`;
    const styleLabel = travelStyle ? travelStyle.charAt(0).toUpperCase() + travelStyle.slice(1) : '';

    const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #f4f4f5; }
            .container { max-width: 520px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
            .header { background: linear-gradient(135deg, #1e3a5f 0%, #0d7377 100%); padding: 32px 28px; text-align: center; color: #fff; }
            .header h1 { font-size: 24px; margin: 0 0 6px; font-weight: 700; }
            .header p { font-size: 14px; opacity: 0.85; margin: 0; }
            .body { padding: 28px; }
            .body p { font-size: 14px; color: #374151; line-height: 1.6; margin-bottom: 16px; }
            .trip-card { background: #f8f9fa; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
            .trip-card h3 { margin: 0 0 8px; font-size: 18px; color: #1a1a2e; }
            .trip-meta { font-size: 13px; color: #6b7280; }
            .cta-btn { display: inline-block; background: #0d9488; color: #fff !important; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-weight: 700; font-size: 15px; }
            .footer { padding: 20px 28px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>GoTrip Pro</h1>
                <p>You've been invited to plan a trip!</p>
            </div>
            <div class="body">
                <p><strong>${ownerName}</strong> has invited you to collaborate on a trip plan:</p>
                <div class="trip-card">
                    <h3>📍 ${destination}</h3>
                    <p class="trip-meta">${duration} days · ${styleLabel} style</p>
                </div>
                <p style="text-align: center;">
                    <a href="${inviteUrl}" class="cta-btn">View Trip →</a>
                </p>
                <p style="font-size: 12px; color: #9ca3af;">
                    If the button doesn't work, copy this link: ${inviteUrl}
                </p>
            </div>
            <div class="footer">
                GoTrip Pro — AI Smart Travel Planner
            </div>
        </div>
    </body>
    </html>`;

    const textBody = `${ownerName} invited you to plan a trip to ${destination} on GoTrip Pro!\n\n${duration} days · ${styleLabel} style\n\nView the trip: ${inviteUrl}\n\n— GoTrip Pro`;

    await transporter.sendMail({
        from: fromEmail,
        to: recipientEmail,
        subject: `${ownerName} invited you to plan a trip to ${destination} on GoTrip Pro`,
        html: htmlBody,
        text: textBody,
    });
}

module.exports = { sendWelcomeEmail, sendInviteEmail };
