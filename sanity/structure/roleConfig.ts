import type { StudioRole } from '../studioAccess';

export type MenuKey =
  | 'home'
  | 'performance'
  | 'place'
  | 'artist'
  | 'cafeCategory'
  | 'cafe'
  | 'galleryCategory'
  | 'gallery'
  | 'goodsCategory'
  | 'goods'
  | 'orders'
  | 'externalGoodsOrders'
  | 'settings'
  | 'studioUsers'
  | 'equipment';

type RoleConfig = {
  id: string;
  title: string;
  menus: readonly (MenuKey | 'divider')[];
};

export const roleConfig: Record<StudioRole, RoleConfig> = {
  superAdmin: {
    id: 'root',
    title: '관리',
    menus: [
      'home',
      'divider',
      'performance',
      'place',
      'equipment',
      'artist',
      'divider',
      'cafeCategory',
      'cafe',
      'divider',
      'galleryCategory',
      'gallery',
      'divider',
      'goodsCategory',
      'goods',
      'orders',
      'externalGoodsOrders',
      'divider',
      'settings',
      'studioUsers',
    ],
  },
  performanceManager: {
    id: 'performance-root',
    title: '공연 관리',
    menus: ['performance', 'place', 'artist'],
  },
  galleryManager: {
    id: 'gallery-root',
    title: '아카이브 관리',
    menus: ['galleryCategory', 'gallery'],
  },
  cafeManager: {
    id: 'cafe-root',
    title: '카페 관리',
    menus: ['cafeCategory', 'cafe'],
  },
  goodsManager: {
    id: 'goods-root',
    title: '굿즈 관리',
    menus: ['goodsCategory', 'goods', 'orders', 'externalGoodsOrders'],
  },
  none: { id: 'no-access', title: '관리', menus: [] },
};
