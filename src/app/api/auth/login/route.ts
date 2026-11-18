import { NextResponse } from 'next/server';
import { prisma } from '@/backend/config/db';
import { hashPassword, encryptSession } from '@/backend/utils/auth';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username dan password wajib diisi' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: { username: { equals: username, mode: 'insensitive' } },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Username atau password salah' },
        { status: 401 }
      );
    }

    const calculatedHash = hashPassword(password);
    if (calculatedHash !== user.passwordHash) {
      return NextResponse.json(
        { error: 'Username atau password salah' },
        { status: 401 }
      );
    }

    // Session valid for 24 hours
    const exp = Date.now() + 24 * 60 * 60 * 1000;
    const sessionToken = encryptSession({
      id: user.id,
      username: user.username,
      role: user.role as 'superadmin' | 'admin' | 'user',
      exp,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    });

    // Set cookie
    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(exp),
      path: '/',
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
