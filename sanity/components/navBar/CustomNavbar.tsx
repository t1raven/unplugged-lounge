'use client';

import { useEffect, useState } from 'react';
import { ToolLink, useClient, useCurrentUser, useTools, type NavbarProps } from 'sanity';
import { useRouter } from 'sanity/router';
import { Box, Button, Card, Flex, useRootTheme } from '@sanity/ui';
import { LaunchIcon } from '@sanity/icons/Launch';
import { getStudioRole, isSuperAdmin, type StudioRole } from '@/sanity/studioAccess';
import { API_VERSION } from '@/sanity/structure/types';
import CustomUserMenu from './CustomUserMenu';

import Image from 'next/image';
import loageImageWh from '@/public/images/common/site-logo-wh.png';
import loageImageBk from '@/public/images/common/site-logo-bk.png';

import './CustomNavbar.scss';

const GOOGLE_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/1BMhi_A9kOipxknTtjxOsvhzsbPD8ySNdOEZNOwe6L-4/edit';

export default function CustomNavbar(props: NavbarProps) {
  const client = useClient({ apiVersion: API_VERSION });
  const user = useCurrentUser();
  const [resolvedRole, setResolvedRole] = useState<{
    user: typeof user;
    client: typeof client;
    role: StudioRole;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    getStudioRole(client, user).then(
      (role) => {
        if (!cancelled) setResolvedRole({ user: user, client, role });
      },
      (error: unknown) => {
        if (!cancelled) {
          console.error('Studio 권한 조회 실패:', error);
          setResolvedRole({ user: user, client, role: 'none' });
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, [client, user]);

  const [siteUrl, setSiteUrl] = useState('');

  useEffect(() => {
    let active = true;

    client
      .fetch<string | undefined>(
        `*[_type == "siteSettings" && _id == "siteSettings"][0].general.siteUrl`,
      )
      .then((url) => {
        if (active) setSiteUrl(url ?? '');
      })
      .catch(console.error);

    return () => {
      active = false;
    };
  }, [client]);

  const role =
    resolvedRole?.user === user && resolvedRole?.client === client ? resolvedRole.role : 'none';
  const ADMIN_ROLES = new Set(['superAdmin', 'goodsManager']);
  const isAdmin = ADMIN_ROLES.has(role?.toString() ?? '');

  const tools = useTools();
  const { state } = useRouter();

  const displayTools = tools.filter((tool) => ['structure', 'media'].includes(tool.name));

  const { scheme } = useRootTheme();

  return (
    <Box className="custom-navbar">
      {/* Sanity 기본 Navbar */}
      {isSuperAdmin(role) && props.renderDefault(props)}

      <Card borderBottom padding={[4, 3]}>
        <Flex align="center" justify="space-between" className="custom-navbar__inner">
          {/* Left */}
          <Flex align="center" className="custom-navbar__left">
            <a
              href="/structure"
              className="custom-navbar__logo"
              aria-label="Unplugged Lounge CMS 홈"
            >
              <Image
                src={scheme === 'dark' ? loageImageWh : loageImageBk}
                alt="UNPLUGGED LOUNGE"
                className="custom-navbar__logo-image"
              />
              <span className="custom-navbar__logo-text">CMS</span>
            </a>
          </Flex>

          {
            /* !isSuperAdmin(role) */ false && (
              <Flex align="center" gap={4} className="custom-navbar__center">
                {displayTools.map((tool) => {
                  const isActive =
                    state.tool === tool.name || (!state.tool && tool.name === 'structure');

                  return (
                    <Button
                      key={tool.name}
                      as={ToolLink}
                      name={tool.name}
                      mode={isActive ? 'ghost' : 'bleed'}
                      fontSize={1}
                      padding={3}
                      className={'custom-navbar__menu-button'}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {tool.name === 'structure' ? '콘텐츠 관리' : '미디어'}
                    </Button>
                  );
                })}
              </Flex>
            )
          }

          {/* Right */}
          <Flex align="center" gap={2} className="custom-navbar__right">
            {isAdmin && GOOGLE_SHEET_URL && (
              <Button
                as="a"
                href={GOOGLE_SHEET_URL}
                target="_blank"
                rel="noopener noreferrer"
                text="주문내역 (Google Sheets)"
                iconRight={LaunchIcon}
                mode="bleed"
                fontSize={1}
                padding={3}
                className="custom-navbar__action"
              />
            )}
            {siteUrl && (
              <Button
                as="a"
                href={siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                text="사이트 보기"
                iconRight={LaunchIcon}
                mode="bleed"
                fontSize={1}
                padding={3}
                className="custom-navbar__action site_url"
              />
            )}

            {/* User */}
            {!isSuperAdmin(role) && <CustomUserMenu />}
          </Flex>
        </Flex>
      </Card>
    </Box>
  );
}
