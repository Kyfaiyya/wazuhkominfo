import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Sends an email notification to the user containing their approved API Key.
 */
export async function sendApiKeyEmail(to: string, userName: string, apiKey: string) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('[SMTP] Email sending skipped: SMTP_USER or SMTP_PASS environment variables are not configured.');
    return false;
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || `"Diskominfo PPU" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Kredensial API Berita Kabupaten Penajam Paser Utara',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1a202c;">
        <div style="text-align: center; border-bottom: 2px solid #edf2f7; padding-bottom: 20px; margin-bottom: 20px;">
          <h2 style="color: #1e6f3d; margin: 0; font-size: 22px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">Diskominfo PPU</h2>
          <p style="color: #718096; margin: 5px 0 0 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">Layanan Data & API Berita</p>
        </div>

        <p style="font-size: 15px; line-height: 1.6; margin: 0 0 15px 0;">Halo <strong>${userName}</strong>,</p>
        
        <p style="font-size: 14px; line-height: 1.6; color: #4a5568; margin: 0 0 20px 0;">
          Permohonan akses integrasi data berita resmi Kabupaten Penajam Paser Utara Anda telah <strong>disetujui</strong> oleh pihak Administrator Diskominfo PPU.
        </p>
        
        <div style="background-color: #f7fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; text-align: center; margin: 25px 0; border-left: 5px solid #1e6f3d;">
          <p style="margin: 0 0 8px 0; font-size: 12px; color: #718096; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">API Key Akses Anda:</p>
          <code style="display: block; font-family: 'Courier New', Courier, monospace; font-size: 17px; font-weight: 800; color: #2d3748; background-color: #edf2f7; padding: 12px 15px; border-radius: 8px; word-break: break-all; border: 1px solid #cbd5e0;">${apiKey}</code>
        </div>

        <div style="background-color: #fffaf0; border: 1px solid #feebc8; border-radius: 10px; padding: 15px; margin-bottom: 25px;">
          <h4 style="margin: 0 0 5px 0; color: #dd6b20; font-size: 13px; font-weight: 700;">⚠️ Peringatan Keamanan</h4>
          <p style="margin: 0; font-size: 12px; color: #7b341e; line-height: 1.5;">
            Jangan membagikan token API Key Anda kepada pihak lain atau memasukkannya ke dalam repositori kode publik (seperti GitHub publik). Selalu simpan di variabel lingkungan (.env).
          </p>
        </div>

        <p style="font-size: 14px; line-height: 1.6; margin: 0 0 25px 0;">
          Untuk mempelajari cara mengintegrasikan data berita ke aplikasi Anda, silakan pelajari dokumentasi teknis di:
        </p>

        <div style="text-align: center; margin-bottom: 30px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pendaftaran-api" 
             style="display: inline-block; background-color: #1e6f3d; color: #ffffff; font-weight: 700; font-size: 14px; text-decoration: none; padding: 12px 30px; border-radius: 10px; transition: background-color 0.2s;">
            Buka Dokumentasi API
          </a>
        </div>

        <hr style="border: 0; border-top: 1px solid #edf2f7; margin: 25px 0;" />
        <p style="font-size: 11px; color: #a0aec0; text-align: center; line-height: 1.5; margin: 0;">
          Email ini dikirim secara otomatis oleh Dinas Komunikasi dan Informatika (Diskominfo) Kabupaten Penajam Paser Utara. Jangan membalas email ini secara langsung.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[SMTP] Email successfully sent to ${to}:`, info.messageId);
    return true;
  } catch (error: any) {
    console.error(`[SMTP Failed] Failed to send email to ${to}:`, error.message);
    return false;
  }
}
