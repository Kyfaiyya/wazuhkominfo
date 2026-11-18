import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const redirectTo = searchParams.get('redirect') || '/';

  const clientId = process.env.GOOGLE_CLIENT_ID;
  
  // Dynamically resolve application URL from request headers to prevent port mismatches
  const url = new URL(request.url);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${url.protocol}//${url.host}`;
  const redirectUri = `${appUrl}/api/auth/callback/google`;

  if (!clientId) {
    // Return a descriptive guidelines setup page instead of throwing error
    return new NextResponse(
      `<html>
        <head>
          <title>Google OAuth Configuration Missing</title>
          <style>
            body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #F8F9FA; margin: 0; }
            .card { background: white; padding: 2.5rem; border-radius: 1.5rem; box-shadow: 0 4px 25px rgba(0,0,0,0.06); border: 1px solid #E9ECEF; max-w: 520px; }
            h1 { color: #C62828; font-size: 1.6rem; margin-top: 0; display: flex; align-items: center; gap: 8px; }
            p { color: #495057; font-size: 0.95rem; line-height: 1.6; }
            pre { background: #F1F3F5; padding: 1rem; border-radius: 0.75rem; font-family: monospace; font-size: 0.85rem; border: 1px solid #E2E8F0; overflow-x: auto; color: #1A202C; }
            code { color: #C53030; font-weight: bold; }
            .button { display: inline-block; background: #1E6F3D; color: white; padding: 0.75rem 1.5rem; border-radius: 0.75rem; text-decoration: none; font-weight: bold; font-size: 0.85rem; margin-top: 1rem; transition: background 0.2s; }
            .button:hover { background: #154c2a; }
            ol { padding-left: 1.25rem; font-size: 0.9rem; color: #495057; line-height: 1.6; }
            li { margin-bottom: 0.5rem; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Google OAuth Belum Dikonfigurasi</h1>
            <p>Untuk mengaktifkan fitur masuk menggunakan akun Google, Anda harus menambahkan variabel berikut ke file <code>.env.local</code> Anda:</p>
            <pre>GOOGLE_CLIENT_ID=masukkan_client_id_anda\nGOOGLE_CLIENT_SECRET=masukkan_client_secret_anda\nNEXT_PUBLIC_APP_URL=${appUrl}</pre>
            
            <p><strong>Langkah Konfigurasi:</strong></p>
            <ol>
              <li>Buka <strong>Google Cloud Console</strong> dan buat project baru.</li>
              <li>Arahkan ke <strong>APIs & Services &gt; Credentials</strong> dan buat <strong>OAuth client ID</strong>.</li>
              <li>Pilih jenis aplikasi <strong>Web application</strong>.</li>
              <li>Tambahkan <strong>Authorized Redirect URI</strong> berikut:<br/>
                <code>${redirectUri}</code>
              </li>
              <li>Salin Client ID dan Client Secret ke dalam file <code>.env.local</code>.</li>
            </ol>
            
            <a href="${redirectTo}" class="button">Kembali ke Artikel</a>
          </div>
        </body>
      </html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }

  // Google OAuth Authorization URL
  // prompt=select_account forces Google Account Chooser
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + 
    `client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=email%20profile` +
    `&state=${encodeURIComponent(redirectTo)}` +
    `&prompt=select_account`;

  return NextResponse.redirect(googleAuthUrl);
}
