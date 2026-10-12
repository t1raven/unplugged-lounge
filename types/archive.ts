import type { Category } from './category';
import type { Performance } from './performance';

export interface Archive {
  _id: string;
  title?: string;
  description?: string;
  label?: string;
  category?: Category | null;
  performance?: Performance | null;
  imageUrl: string;
}
