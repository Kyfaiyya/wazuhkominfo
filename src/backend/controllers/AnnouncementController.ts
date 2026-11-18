import { prisma, backupToRedis } from '@/backend/config/db';

export class AnnouncementController {
  static async get(id?: string | null) {
    if (id) {
      const announcement = await prisma.announcement.findUnique({
        where: { id },
      });
      return announcement;
    }
    return await prisma.announcement.findMany();
  }

  static async create(data: { title: string; type?: string; urgent?: boolean; desc: string }) {
    const { title, type, urgent, desc } = data;
    const dateOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const dateStr = new Date().toLocaleDateString('id-ID', dateOptions);

    const newAnnouncement = await prisma.announcement.create({
      data: {
        id: Date.now().toString(),
        title,
        type: type || 'Pengumuman',
        urgent: !!urgent,
        desc,
        date: dateStr,
      },
    });

    backupToRedis();
    return newAnnouncement;
  }

  static async update(id: string, data: { title: string; type?: string; urgent?: boolean; desc: string }) {
    const { title, type, urgent, desc } = data;
    const existing = await prisma.announcement.findFirst({ where: { id } });
    if (!existing) return null;

    const updated = await prisma.announcement.update({
      where: { id },
      data: {
        title,
        type: type || existing.type,
        urgent: !!urgent,
        desc,
      },
    });

    backupToRedis();
    return updated;
  }

  static async delete(id: string) {
    const existing = await prisma.announcement.findFirst({ where: { id } });
    if (!existing) return false;

    await prisma.announcement.delete({ where: { id } });
    backupToRedis();
    return true;
  }
}
