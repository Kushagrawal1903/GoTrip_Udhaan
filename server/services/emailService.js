const nodemailer = require('nodemailer');

/**
 * Create reusable transporter for sending emails.
 * Falls back gracefully if SMTP not configured.
 */
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

module.exports = { sendInviteEmail };
