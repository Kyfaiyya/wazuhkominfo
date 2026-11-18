import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/backend/config/db';
import { decryptSession, hashPassword } from '@/backend/utils/auth';

async function checkSuperadminAuth() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  if (!sessionCookie) return null;

  const payload = decryptSession(sessionCookie.value);
  if (!payload || payload.role !== 'superadmin') {
    return null;
  }
  return payload;
}

export async function GET() {
  try {
    const auth = await checkSuperadminAuth();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const users = await prisma.user.findMany();
    // Exclude passwordHash before returning
    const safeUsers = users.map(({ passwordHash, ...user }) => user);

    return NextResponse.json(safeUsers);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await checkSuperadminAuth();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { username, name, role, password } = await request.json();

    if (!username || !name || !role || !password) {
      return NextResponse.json({ error: 'Semua bidang wajib diisi' }, { status: 400 });
    }

    if (role !== 'admin' && role !== 'superadmin' && role !== 'user') {
      return NextResponse.json({ error: 'Role tidak valid' }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({
      where: { username: { equals: username, mode: 'insensitive' } },
    });

    if (existing) {
      return NextResponse.json({ error: 'Username sudah digunakan' }, { status: 400 });
    }

    const newUser = await prisma.user.create({
      data: {
        id: Date.now().toString(),
        username: username.trim(),
        name: name.trim(),
        role,
        passwordHash: hashPassword(password),
      },
    });

    const { passwordHash, ...safeUser } = newUser;
    return NextResponse.json({ success: true, user: safeUser });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await checkSuperadminAuth();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID user wajib diberikan' }, { status: 400 });
    }

    // A superadmin cannot delete themselves to prevent locking out the system
    if (id === auth.id) {
      return NextResponse.json({ error: 'Anda tidak dapat menghapus akun Anda sendiri' }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// 4. PUT: Superadmin updates an existing user
export async function PUT(request: Request) {
  try {
    const auth = await checkSuperadminAuth();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id, username, name, role, password } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID user wajib dilampirkan' }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    // A superadmin cannot change their own role to prevent lockout
    if (id === auth.id && role && role !== 'superadmin') {
      return NextResponse.json({ error: 'Anda tidak dapat menurunkan tingkatan role Anda sendiri' }, { status: 400 });
    }

    if (role && role !== 'admin' && role !== 'superadmin' && role !== 'user') {
      return NextResponse.json({ error: 'Role tidak valid' }, { status: 400 });
    }

    // Check username uniqueness if changing
    if (username) {
      const duplicate = await prisma.user.findFirst({
        where: {
          username: { equals: username, mode: 'insensitive' },
          NOT: { id },
        },
      });
      if (duplicate) {
        return NextResponse.json({ error: 'Username sudah digunakan oleh akun lain' }, { status: 400 });
      }
    }

    const updateData: any = {};
    if (username) updateData.username = username.trim();
    if (name) updateData.name = name.trim();
    if (role) updateData.role = role;
    if (password && password.trim() !== '') {
      updateData.passwordHash = hashPassword(password);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    const { passwordHash, ...safeUser } = updatedUser;
    return NextResponse.json({ success: true, user: safeUser });
  } catch (error) {
    console.error('API users PUT error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
