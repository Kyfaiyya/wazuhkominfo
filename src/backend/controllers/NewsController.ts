import { prisma, backupToRedis } from '@/backend/config/db';
import { downloadImage, downloadImagesFromHtml } from '@/backend/utils/image-downloader';

function slugify(text: string) {
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export class NewsController {
  static async getById(id: string) {
    return await prisma.news.findFirst({ where: { id } });
  }

  static async getBySlug(slug: string) {
    const allNews = await prisma.news.findMany();
    return allNews.find((n) => slugify(n.title) === slug) || null;
  }

  static async getFiltered(params: {
    category?: string | null;
    search?: string | null;
    status?: string | null;
    limit?: number | null;
    offset?: number | null;
  }) {
    const { category, search, status, limit, offset } = params;
    const whereClause: any = {};

    if (status) {
      whereClause.status = status;
    }

    if (category) {
      whereClause.category = { equals: category, mode: 'insensitive' };
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const filteredNews = await prisma.news.findMany({ where: whereClause });

    if (limit !== null || offset !== null) {
      const parsedLimit = limit ?? 10;
      const parsedOffset = offset ?? 0;
      const data = filteredNews.slice(parsedOffset, parsedOffset + parsedLimit);
      return {
        data,
        total: filteredNews.length,
        hasMore: parsedOffset + parsedLimit < filteredNews.length
      };
    }

    return filteredNews;
  }

  static async create(
    userId: string,
    username: string,
    data: {
      title: string;
      excerpt?: string;
      content: string;
      category?: string;
      image?: string;
      author?: string;
      status?: string;
      tags?: string;
    }
  ) {
    const { title, excerpt, content, category, image, author, status, tags } = data;

    // Look up user's display name for default author
    const currentUser = await prisma.user.findFirst({ where: { id: userId } });
    const defaultAuthor = currentUser?.name || username;

    const dateOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const dateStr = new Date().toLocaleDateString('id-ID', dateOptions);

    const localImage = image ? await downloadImage(image) : '/uploads/banner-kominfo.jpg';
    const localContent = content ? await downloadImagesFromHtml(content) : content;

    const newArticle = await prisma.news.create({
      data: {
        id: Date.now().toString(),
        title,
        excerpt: excerpt || content.substring(0, 150) + '...',
        content: localContent,
        category: category || 'BERITA TERKINI',
        image: localImage,
        author: author || defaultAuthor,
        date: dateStr,
        status: status || 'published',
        tags: tags || '',
        updatedAt: '',
      },
    });

    backupToRedis();
    return newArticle;
  }

  static async update(
    data: {
      id: string;
      title: string;
      excerpt?: string;
      content: string;
      category?: string;
      image?: string;
      author?: string;
      status?: string;
      tags?: string;
    }
  ) {
    const { id, title, excerpt, content, category, image, author, status, tags } = data;

    const existing = await prisma.news.findFirst({ where: { id } });
    if (!existing) return null;

    const localImage = image ? await downloadImage(image) : existing.image;
    const localContent = content ? await downloadImagesFromHtml(content) : content;

    const updatedAtStr = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const updatedArticle = await prisma.news.update({
      where: { id },
      data: {
        title,
        excerpt: excerpt || content.substring(0, 150) + '...',
        content: localContent,
        category: category || existing.category,
        image: localImage,
        author: author || existing.author,
        status: status || existing.status,
        tags: tags !== undefined ? tags : existing.tags,
        updatedAt: updatedAtStr,
      },
    });

    backupToRedis();
    return updatedArticle;
  }

  static async delete(id: string) {
    const existing = await prisma.news.findFirst({ where: { id } });
    if (!existing) return false;

    await prisma.news.delete({ where: { id } });
    backupToRedis();
    return true;
  }
}
