/*import { type SchemaTypeDefinition } from 'sanity'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [],
}*/

import { home } from './home';
import { performance } from './performance';
import { artist } from './artist';
import { place } from './place';
import { menuCategory } from './menuCategory';
import { menuItem } from './menuItem';
import { galleryCategory } from './galleryCategory';
import { galleryItem } from './galleryItem';
import { goodsCategory } from './goodsCategory';
import { goodsItem } from './goodsItem';
import { purchaseOrder } from './purchaseOrder';
import { studioUser } from './studioUser';
import { siteSettings } from './siteSettings';
import { equipment } from './equipment';

export const schemaTypes = [
  home,
  performance,
  place,
  artist,
  menuCategory,
  menuItem,
  galleryCategory,
  galleryItem,
  goodsCategory,
  goodsItem,
  purchaseOrder,
  studioUser,
  siteSettings,
  equipment,
];
