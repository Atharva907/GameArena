const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

export const otpEmail = (otp) => `
  <div style="background:#f8fafc;padding:32px;font-family:Arial,Helvetica,sans-serif;color:#111827;">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:28px;text-align:center;">
      <h1 style="margin:0 0 12px;font-size:24px;">GameArena Login Verification</h1>
      <p style="margin:0 0 20px;color:#4b5563;">Use this one-time password to complete login.</p>
      <div style="font-size:36px;font-weight:700;letter-spacing:8px;color:#7c3aed;">${escapeHtml(otp)}</div>
      <p style="margin:20px 0 0;color:#6b7280;font-size:13px;">This OTP expires in 10 minutes. Do not share it with anyone.</p>
    </div>
  </div>
`;

export const emailVerificationLink = (link) => `
  <div style="background:#f8fafc;padding:32px;font-family:Arial,Helvetica,sans-serif;color:#111827;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:28px;text-align:center;">
      <h1 style="margin:0 0 12px;font-size:24px;">Verify Your GameArena Email</h1>
      <p style="margin:0 0 24px;color:#4b5563;">Confirm your email address to activate your account.</p>
      <a href="${escapeHtml(link)}" style="display:inline-block;background:#7c3aed;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:999px;font-weight:700;">Verify Email</a>
      <p style="margin:24px 0 0;color:#6b7280;font-size:13px;">If the button does not work, open this link: ${escapeHtml(link)}</p>
    </div>
  </div>
`;
