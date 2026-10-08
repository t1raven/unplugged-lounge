import type { MenuFactory } from '../types';
import { HomeIcon } from '@sanity/icons/Home';
import { CogIcon } from '@sanity/icons/Cog';
import { UsersIcon } from '@sanity/icons/Users';
export const createHomeMenu: MenuFactory = (S) => {
  return S.listItem()
    .id('home')
    .title('홈')
    .icon(HomeIcon)
    .child(S.document().schemaType('home').documentId('home').title('홈'));
};
export const createSettingsMenu: MenuFactory = (S) => {
  return S.listItem()
    .id('site-settings')
    .title('사이트 설정')
    .icon(CogIcon)
    .child(S.document().schemaType('siteSettings').documentId('siteSettings').title('사이트 설정'));
};
export const createStudioUsersMenu: MenuFactory = (S) => {
  return S.documentTypeListItem('studioUser').title('관리자 계정').icon(UsersIcon);
};
