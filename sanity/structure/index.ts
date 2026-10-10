import type { StructureResolver } from 'sanity/structure';
import { getStudioRole } from '../studioAccess';
import { roleConfig, type MenuKey } from './roleConfig';
import { API_VERSION, type MenuFactory } from './types';
import {
  createPerformanceMenu,
  createPlaceMenu,
  createArtistMenu,
  createEquipmentMenu,
} from './menus/performance';
import { createCafeCategoryMenu, createCafeMenu } from './menus/cafe';
import { createGalleryCategoryMenu, createGalleryMenu } from './menus/gallery';
import { createGoodsCategoryMenu, createGoodsMenu } from './menus/goods';
import { createOrdersMenu } from './menus/orders';
import { createHomeMenu, createSettingsMenu, createStudioUsersMenu } from './menus/settings';

const menuFactories: Record<MenuKey, MenuFactory> = {
  home: createHomeMenu,
  performance: createPerformanceMenu,
  place: createPlaceMenu,
  artist: createArtistMenu,
  cafeCategory: createCafeCategoryMenu,
  cafe: createCafeMenu,
  galleryCategory: createGalleryCategoryMenu,
  gallery: createGalleryMenu,
  goodsCategory: createGoodsCategoryMenu,
  goods: createGoodsMenu,
  orders: createOrdersMenu,
  equipment: createEquipmentMenu,
  settings: createSettingsMenu,
  studioUsers: createStudioUsersMenu,
};

export const structure: StructureResolver = async (S, context) => {
  const client = context.getClient({ apiVersion: API_VERSION });
  const role = await getStudioRole(client, context.currentUser);
  // Unknown values from stored studioUser documents also receive no menus.
  const config = Object.prototype.hasOwnProperty.call(roleConfig, role)
    ? roleConfig[role]
    : roleConfig.none;

  return S.list()
    .id(config.id)
    .title(config.title)
    .items(
      config.menus.map((key) => (key === 'divider' ? S.divider() : menuFactories[key](S, context))),
    );
};
