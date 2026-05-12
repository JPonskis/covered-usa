import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';

const baseBlogDir = path.join(process.cwd(), 'content/blog');

function getPostsDirectory(locale?: string): string {
  if (locale && locale !== 'en') {
    return path.join(baseBlogDir, locale);
  }
  return baseBlogDir;
}

export type CTATarget = 'screener' | 'analyzer';

export interface PostFrontmatter {
  title: string;
  description: string;
  date: string;
  slug: string;
  keywords: string[];
  image?: string;
  lastUpdated?: string;
  target?: CTATarget;
}

export interface Post extends PostFrontmatter {
  content: string;
  readingTime: string;
}

export interface PostPreview extends PostFrontmatter {
  readingTime: string;
}

export function getAllPosts(locale?: string): PostPreview[] {
  const postsDirectory = getPostsDirectory(locale);
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const posts = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const filePath = path.join(postsDirectory, fileName);
      // Skip directories
      if (fs.statSync(filePath).isDirectory()) return null;
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContents);
      const stats = readingTime(content);

      return {
        title: data.title,
        description: data.description,
        date: data.date,
        slug: data.slug,
        keywords: data.keywords || [],
        image: data.image,
        lastUpdated: data.lastUpdated || undefined,
        target: (data.target === 'analyzer' ? 'analyzer' : 'screener') as CTATarget,
        readingTime: stats.text,
      } as PostPreview;
    })
    .filter((p): p is PostPreview => p !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return posts;
}

export function getPostBySlug(slug: string, locale?: string): Post | null {
  const postsDirectory = getPostsDirectory(locale);
  if (!fs.existsSync(postsDirectory)) {
    return null;
  }

  const fileNames = fs.readdirSync(postsDirectory);

  for (const fileName of fileNames) {
    if (!fileName.endsWith('.md')) continue;

    const filePath = path.join(postsDirectory, fileName);
    if (fs.statSync(filePath).isDirectory()) continue;
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);

    if (data.slug === slug) {
      const stats = readingTime(content);

      return {
        title: data.title,
        description: data.description,
        date: data.date,
        slug: data.slug,
        keywords: data.keywords || [],
        image: data.image,
        lastUpdated: data.lastUpdated || undefined,
        target: (data.target === 'analyzer' ? 'analyzer' : 'screener') as CTATarget,
        content,
        readingTime: stats.text,
      } as Post;
    }
  }

  return null;
}

export function getAllPostSlugs(locale?: string): string[] {
  const postsDirectory = getPostsDirectory(locale);
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);

  return fileNames
    .filter((fileName) => {
      if (!fileName.endsWith('.md')) return false;
      const filePath = path.join(postsDirectory, fileName);
      return !fs.statSync(filePath).isDirectory();
    })
    .map((fileName) => {
      const filePath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(fileContents);
      return data.slug;
    });
}

export function getRelatedPosts(slug: string, limit: number = 3, locale?: string): PostPreview[] {
  const allPosts = getAllPosts(locale);
  const currentPost = allPosts.find((p) => p.slug === slug);
  if (!currentPost) return [];

  const programs = ['medicaid', 'medicare', 'aca', 'chip'];

  const currentProgram = programs.find((p) => slug.includes(p)) || '';

  const scored = allPosts
    .filter((p) => p.slug !== slug)
    .map((p) => {
      let score = 0;
      const postProgram = programs.find((pr) => p.slug.includes(pr)) || '';

      // Same program: +3
      if (currentProgram && postProgram === currentProgram) score += 3;
      // Shared keywords: +1 per match
      if (currentPost.keywords && p.keywords) {
        const shared = currentPost.keywords.filter((kw) =>
          p.keywords.some((pk) => pk.toLowerCase() === kw.toLowerCase())
        );
        score += shared.length;
      }

      return { post: p, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  // If no scored matches, return newest posts
  if (scored.length === 0) {
    return allPosts.filter((p) => p.slug !== slug).slice(0, limit);
  }

  return scored.map((item) => item.post);
}

export function formatDate(dateString: string, locale?: string): string {
  const date = new Date(dateString);
  const loc = locale === 'es' ? 'es-US' : 'en-US';
  return date.toLocaleDateString(loc, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
