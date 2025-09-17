import api from './api';

export interface ArticleListItem {
  id: number;
  slug: string;
  title: string;
  summary?: string;
  category?: string;
  tags?: string[];
  createdAt?: string;
}

export interface ArticleDetail extends ArticleListItem {
  content: string;
  references: any[];
  version?: number;
  updatedAt?: string;
}

export interface PaginatedArticles {
  items: ArticleListItem[];
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
}

interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  tag?: string;
}

const getArticles = async (params: ListParams = {}): Promise<PaginatedArticles> => {
  const { data } = await api.get('/articles', { params });
  return data.data;
};

const getArticleBySlug = async (slug: string): Promise<ArticleDetail> => {
  const { data } = await api.get(`/articles/${slug}`);
  return data.data;
};

export const articleService = {
  getArticles,
  getArticleBySlug,
};

export default articleService;