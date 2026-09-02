import nodemailer from "nodemailer";

export interface OtpEmailData {
  email: string;
  otp: string;
  type: "email-verification" | "sign-in" | "forget-password";
}

const host = process.env.SMTP_HOST;
const port = Number.parseInt(process.env.SMTP_PORT || "587", 10);
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.EMAIL_FROM || "Nodebase <no-reply@nodebase.app>";

const smtpConfigured = Boolean(host && user && pass);

let transport: nodemailer.Transporter | null = null;

if (smtpConfigured && host && user && pass) {
  transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

const emailSubject = "Your Nodebase verification code";

const emailText = (otp: string) =>
  [
    "Hello,",
    "",
    `Your Nodebase verification code is: ${otp}`,
    "It expires in 5 minutes. If you didn't request this code, you can safely ignore this email.",
    "",
    "The Nodebase Team",
  ].join("\n");

const emailHtml = (otp: string) => `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="420" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
            <tr>
              <td style="padding:28px 32px;background:#18181b;">
                <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:-0.02em;">Nodebase</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 12px;font-size:18px;color:#18181b;">Verify your email</h1>
                <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#52525b;">
                  Your verification code is:
                </p>
                <p style="margin:0 0 24px;font-size:32px;font-weight:800;letter-spacing:12px;text-align:center;color:#18181b;background:#fafafa;border:1px solid #e4e4e7;border-radius:8px;padding:16px 0;">
                  ${otp}
                </p>
                <p style="margin:0;font-size:13px;line-height:1.6;color:#71717a;">
                  This code expires in 5 minutes. If you didn't request it, you can safely ignore this email.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background:#fafafa;border-top:1px solid #f4f4f5;">
                <p style="margin:0;font-size:12px;color:#a1a1aa;">The Nodebase Team</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

export const sendOtpEmail = async ({ email, otp }: OtpEmailData) => {
  if (!transport) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "SMTP is not configured (set SMTP_HOST, SMTP_USER, SMTP_PASS)",
      );
    }
    console.log(`[email] dev fallback — OTP for ${email}: ${otp}`);
    return;
  }

  await transport.sendMail({
    from,
    to: email,
    subject: emailSubject,
    text: emailText(otp),
    html: emailHtml(otp),
  });
};
