import nodemailer from "nodemailer";

const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const getEmailTemplate = (title: string, message: string, buttonText: string, buttonLink: string) => {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
    </head>
    <body style="background-color: #fafafa; margin: 0; padding: 40px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 8px; overflow: hidden;">
        
        <tr>
          <td style="padding: 40px; text-align: center; border-bottom: 1px solid #e4e4e7; background-color: #ffffff;">
            
            <table border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto;">
              <tr>
                <td valign="middle" style="padding-right: 16px;">
                  <img src="${domain}/icon.png" alt="Larik AI Logo" width="40" height="40" style="display: block; border-radius: 10px; background-color: #fafafa; border: 1px solid #e4e4e7; padding: 6px;" />
                </td>
                <td valign="middle">
                  <h1 style="color: #10b981; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.5px;">Larik AI</h1>
                </td>
              </tr>
            </table>
            
            <p style="color: #71717a; margin: 12px 0 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Enterprise ML Architecture</p>
            
          </td>
        </tr>

        <tr>
          <td style="padding: 40px; background-color: #ffffff;">
            <h2 style="color: #18181b; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">${title}</h2>
            <p style="color: #52525b; line-height: 1.6; margin: 0 0 30px 0; font-size: 15px;">
              ${message}
            </p>
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td align="center">
                  <a href="${buttonLink}" style="background-color: #10b981; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block; text-transform: uppercase; letter-spacing: 1px;">
                    ${buttonText}
                  </a>
                </td>
              </tr>
            </table>
            <p style="color: #a1a1aa; line-height: 1.5; margin: 30px 0 0 0; font-size: 13px; text-align: center;">
              Tautan ini hanya berlaku selama 1 jam. Jika Anda tidak merasa melakukan permintaan ini, silakan abaikan email ini.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding: 20px; background-color: #fafafa; text-align: center; border-top: 1px solid #e4e4e7;">
            <p style="color: #a1a1aa; margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">
              &copy; ${new Date().getFullYear()} Larik AI. Seluruh hak cipta dilindungi.
            </p>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${domain}/verify-email?token=${token}`;

  const html = getEmailTemplate(
    "Verifikasi Akses Ruang Kerja",
    "Terima kasih telah bergabung dengan Larik AI. Untuk menjaga keamanan arsitektur data, kami mewajibkan verifikasi alamat email. Silakan klik tombol di bawah ini untuk mengaktifkan akun Anda dan mulai mendeploy model.",
    "Verifikasi Email Sekarang",
    confirmLink
  );

  await transporter.sendMail({
    from: `"Larik AI Security" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Aktivasi Akun Larik AI Anda",
    html,
  });
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${domain}/reset-password?token=${token}`;

  const html = getEmailTemplate(
    "Pemulihan Kata Sandi",
    "Sistem kami menerima permintaan untuk mengatur ulang kata sandi akun Larik AI Anda. Untuk melanjutkan proses pemulihan akses, silakan gunakan tautan otorisasi di bawah ini.",
    "Atur Ulang Kata Sandi",
    resetLink
  );

  await transporter.sendMail({
    from: `"Larik AI Security" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Instruksi Pemulihan Kata Sandi Larik AI",
    html,
  });
};

export const sendInvoiceEmail = async (email: string, transactionId: string, amount: number, planName: string) => {
  const date = new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' });

  const html = `
  <!DOCTYPE html>
  <html>
    <body style="background-color: #fafafa; margin: 0; padding: 40px; font-family: 'Segoe UI', sans-serif;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        <tr>
          <td style="padding: 40px; border-bottom: 2px solid #f4f4f5;">
            <table width="100%">
              <tr>
                <td>
                  <h1 style="color: #10b981; margin: 0; font-size: 20px; font-weight: 900;">LARIK AI</h1>
                  <p style="color: #71717a; margin: 4px 0 0 0; font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">Official Tax Invoice</p>
                </td>
                <td align="right">
                  <div style="background-color: #ecfdf5; color: #059669; padding: 6px 12px; border-radius: 99px; font-size: 10px; font-weight: 800; text-transform: uppercase; display: inline-block;">Paid</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 40px;">
            <p style="color: #71717a; font-size: 12px; margin: 0 0 24px 0;">Terima kasih atas pembayaran Anda. Berikut adalah detail transaksi untuk lisensi Enterprise Anda.</p>
            
            <table width="100%" style="border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 1px solid #e4e4e7;">
                  <th align="left" style="padding: 12px 0; font-size: 10px; font-weight: 800; color: #a1a1aa; text-transform: uppercase;">Description</th>
                  <th align="right" style="padding: 12px 0; font-size: 10px; font-weight: 800; color: #a1a1aa; text-transform: uppercase;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="padding: 20px 0; font-size: 14px; font-weight: 600; color: #18181b;">Larik AI Subscription - ${planName}</td>
                  <td align="right" style="padding: 20px 0; font-size: 14px; font-weight: 700; color: #18181b;">Rp ${amount.toLocaleString()}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr style="border-top: 2px solid #f4f4f5;">
                  <td style="padding: 20px 0; font-size: 14px; font-weight: 800; color: #18181b;">Total Paid</td>
                  <td align="right" style="padding: 20px 0; font-size: 18px; font-weight: 900; color: #10b981;">Rp ${amount.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>

            <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #f4f4f5;">
              <p style="color: #a1a1aa; font-size: 10px; margin: 0;">Transaction ID: <span style="color: #18181b; font-weight: 600;">${transactionId}</span></p>
              <p style="color: #a1a1aa; font-size: 10px; margin: 4px 0 0 0;">Date: <span style="color: #18181b; font-weight: 600;">${date}</span></p>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding: 24px; background-color: #fafafa; text-align: center;">
            <p style="color: #d4d4d8; font-size: 9px; margin: 0; text-transform: uppercase; letter-spacing: 1px;">&copy; 2026 Larik AI. Digital Receipt generated automatically.</p>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;

  await transporter.sendMail({
    from: `"Larik AI Billing" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Invoice Pembayaran Larik AI - ${transactionId}`,
    html,
  });
};