'use client';

import { useId } from 'react';
import { useCurrentUser, useWorkspace } from 'sanity';
import { Avatar, Box, Button, Flex, Stack, Text } from '@sanity/ui';

import { Menu, MenuButton, MenuDivider, MenuItem } from '@sanity/ui/menu';

import { LeaveIcon } from '@sanity/icons/Leave';
import { DesktopIcon } from '@sanity/icons/Desktop';
import { SunIcon } from '@sanity/icons/Sun';
import { MoonIcon } from '@sanity/icons/Moon';
import { CheckmarkIcon } from '@sanity/icons/Checkmark';

import { useStudioTheme } from '@/sanity/components/providers/StudioThemeProvider';

export default function CustomUserMenu() {
  const user = useCurrentUser();
  const menuId = useId();

  const { scheme, setScheme } = useStudioTheme();
  const { auth } = useWorkspace();

  const handleLogout = async () => {
    if (!auth || typeof auth.logout !== 'function') {
      console.error('로그아웃을 사용할 수 없는 인증 상태입니다.');
      return;
    }

    try {
      // 로그아웃 실행 (세션 및 쿠키 폐기)
      await auth.logout();
      // 로그아웃 후 안전하게 새로고침 처리하여 초기 로그인 화면으로 이동
      window.location.reload();
    } catch (error) {
      console.error('로그아웃 중 오류가 발생했습니다:', error);
    }
  };

  return (
    <MenuButton
      id={menuId}
      button={
        <Button mode="bleed" padding={2} aria-label="사용자 메뉴">
          <Avatar size={1} src={user?.profileImage} initials={user?.name?.charAt(0) || '?'} />
        </Button>
      }
      menu={
        <Menu padding={1} style={{ minWidth: 240 }}>
          {/* Profile */}
          <Box padding={3}>
            <Flex align="center" gap={3}>
              <Avatar size={2} src={user?.profileImage} initials={user?.name?.charAt(0) || '?'} />

              <Stack gap={2}>
                <Text size={1} weight="semibold">
                  {user?.name || '사용자'}
                </Text>

                <Text size={1} muted>
                  {user?.email || ''}
                </Text>
              </Stack>
            </Flex>
          </Box>

          <MenuDivider />

          <MenuItem
            icon={DesktopIcon}
            text="시스템"
            iconRight={scheme === 'system' ? CheckmarkIcon : undefined}
            selected={scheme === 'system'}
            onClick={() => setScheme('system')}
          />

          <MenuItem
            icon={MoonIcon}
            text="다크"
            iconRight={scheme === 'dark' ? CheckmarkIcon : undefined}
            selected={scheme === 'dark'}
            onClick={() => setScheme('dark')}
          />

          <MenuItem
            icon={SunIcon}
            text="라이트"
            iconRight={scheme === 'light' ? CheckmarkIcon : undefined}
            selected={scheme === 'light'}
            onClick={() => setScheme('light')}
          />

          {/* Logout */}
          <MenuDivider />

          <MenuItem icon={LeaveIcon} text="로그아웃" padding={3} onClick={handleLogout} />
        </Menu>
      }
    />
  );
}
