import { NextResponse } from 'next/server';
import { prisma } from '@/backend/config/db';
import { encryptSession } from '@/backend/utils/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state') || '/'; // The original article path to redirect back to

    if (!code) {
      console.error('No authorization code provided by Google');
      return NextResponse.redirect(new URL(`/?error=no_authorization_code`, request.url));
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    
    // Resolve dynamic app URL matching the request origin to avoid redirect URI mismatches
    const url = new URL(request.url);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${url.protocol}//${url.host}`;
    const redirectUri = `${appUrl}/api/auth/callback/google`;

    if (!clientId || !clientSecret) {
      console.error('Missing Google OAuth environment configurations');
      return NextResponse.redirect(new URL(`${state}?error=google_oauth_config_missing`, request.url));
    }

    // Exchange authorization code for token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errData = await tokenResponse.json();
      console.error('Failed to exchange Google OAuth code:', errData);
      return NextResponse.redirect(new URL(`${state}?error=token_exchange_failed`, request.url));
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Get user info profile info
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!profileResponse.ok) {
      console.error('Failed to fetch user profile info from Google');
      return NextResponse.redirect(new URL(`${state}?error=profile_fetch_failed`, request.url));
    }

    const profileData = await profileResponse.json();
    const { email, name } = profileData;

    if (!email) {
      console.error('No email address provided by Google profile API');
      return NextResponse.redirect(new URL(`${state}?error=no_email_provided`, request.url));
    }

    // Check if user already exists
    let user = await prisma.user.findFirst({
      where: { username: { equals: email, mode: 'insensitive' } },
    });

    if (!user) {
      // Auto-register user with role: 'user'
      user = await prisma.user.create({
        data: {
          id: Date.now().toString(),
          username: email.toLowerCase(),
          name: name || email.split('@')[0],
          role: 'user',
          passwordHash: '', // Empty password hash signifies an OAuth account
        },
      });
    }

    // Generate cookies session valid for 24 hours
    const exp = Date.now() + 24 * 60 * 60 * 1000;
    const sessionToken = encryptSession({
      id: user.id,
      username: user.username,
      role: user.role as 'superadmin' | 'admin' | 'user',
      exp,
    });

    // Create redirect response returning back to the article page
    const response = NextResponse.redirect(new URL(state, request.url));

    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(exp),
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Google OAuth Callback Server Error:', error);
    return NextResponse.redirect(new URL('/?error=google_callback_server_error', request.url));
  }
}
