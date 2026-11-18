// ============================================================
// ⚠️  VULNERABLE ROUTE — INTENTIONAL XSS FOR LOCAL SECURITY TESTING
// ⚠️  DO NOT DEPLOY TO PRODUCTION. FOR EDUCATIONAL USE ONLY.
// ============================================================
//
// This route renders an HTML search page that reflects the `q`
// query parameter directly into the response WITHOUT any
// sanitization or escaping, creating a classic Reflected XSS
// vulnerability.
//
// Test payload:
//   /api/search-page?q=<script>alert(document.domain)</script>
//
// To remove this vulnerability, delete this entire file.
// ============================================================

import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // ── VULNERABLE LINE ──────────────────────────────────────
  // The query parameter is read and used as-is, with NO
  // escaping, encoding, or sanitization whatsoever.
  const q = searchParams.get('q') || '';
  // ─────────────────────────────────────────────────────────

  // Return raw HTML with the user input injected directly.
  // No Content-Security-Policy header is set.
  const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pencarian – Demo XSS</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      background: #f8fafc;
      color: #1e293b;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .banner {
      width: 100%;
      background: #dc2626;
      color: white;
      text-align: center;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    .container {
      max-width: 720px;
      width: 100%;
      padding: 48px 24px;
    }
    h1 {
      font-size: 1.75rem;
      font-weight: 700;
      margin-bottom: 24px;
      color: #0f172a;
    }
    form {
      display: flex;
      gap: 8px;
      margin-bottom: 32px;
    }
    input[type="text"] {
      flex: 1;
      padding: 10px 16px;
      border: 2px solid #e2e8f0;
      border-radius: 10px;
      font-size: 15px;
      outline: none;
      transition: border-color 0.2s;
    }
    input[type="text"]:focus {
      border-color: #1E6F3D;
    }
    button {
      padding: 10px 24px;
      background: #1E6F3D;
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    button:hover { background: #165c32; }
    .result-box {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }
    .result-box p {
      font-size: 15px;
      line-height: 1.6;
    }
    .result-label {
      font-weight: 600;
      color: #64748b;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    .vuln-note {
      margin-top: 40px;
      padding: 16px 20px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 10px;
      font-size: 13px;
      color: #991b1b;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="banner">⚠️ HALAMAN INI SENGAJA RENTAN XSS — HANYA UNTUK TESTING LOKAL ⚠️</div>
  <div class="container">
    <h1>🔍 Pencarian</h1>

    <form method="GET" action="/api/search-page">
      <input type="text" name="q" value="${q.replace(/"/g, '&quot;')}" placeholder="Ketik kata kunci...">
      <button type="submit">Cari</button>
    </form>

    ${q ? `
    <div class="result-box">
      <p class="result-label">Hasil pencarian untuk:</p>
      <!-- ═══════════════════════════════════════════════════ -->
      <!-- CELAH XSS: variabel q ditulis langsung tanpa       -->
      <!-- escaping apapun. Tag <script> atau event handler    -->
      <!-- akan dieksekusi oleh browser.                       -->
      <!-- ═══════════════════════════════════════════════════ -->
      <p>${q}</p>
    </div>
    ` : `
    <div class="result-box">
      <p style="color:#94a3b8;">Masukkan kata kunci untuk memulai pencarian.</p>
    </div>
    `}

    <div class="vuln-note">
      <strong>⚠️ Catatan Keamanan:</strong> Halaman ini mengandung celah
      <em>Reflected Cross-Site Scripting (XSS)</em> yang disengaja.
      Parameter <code>q</code> ditulis langsung ke HTML tanpa sanitasi.
      <strong>Jangan gunakan di lingkungan produksi.</strong>
    </div>
  </div>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // Matikan XSS filter bawaan browser
      'X-XSS-Protection': '0',
      // Sengaja TIDAK menyertakan Content-Security-Policy
      // agar inline script bisa dieksekusi untuk demo XSS.
    },
  });
}
