import { NextResponse } from 'next/server';
import { prisma } from '@/backend/config/db';
import { hashPassword, encryptSession } from '@/backend/utils/auth';

export async function POST(request: Request) {
  try {
    const { email, name, password } = await request.json();

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Email, nama, dan password wajib diisi' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Format email tidak valid' },
        { status: 400 }
      );
    }

    // Check if email already registered (username matches email case-insensitively)
    const existingUser = await prisma.user.findFirst({
      where: { username: { equals: email, mode: 'insensitive' } },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar. Silakan login.' },
        { status: 400 }
      );
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        id: Date.now().toString(),
        username: email.toLowerCase(),
        name,
        role: 'user',
        passwordHash: hashPassword(password),
      },
    });

    // Create session (valid for 24h)
    const exp = Date.now() + 24 * 60 * 60 * 1000;
    const sessionToken = encryptSession({
      id: newUser.id,
      username: newUser.username,
      role: newUser.role as 'superadmin' | 'admin' | 'user',
      exp,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        name: newUser.name,
        role: newUser.role,
      },
    });

    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(exp),
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error during registration:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
