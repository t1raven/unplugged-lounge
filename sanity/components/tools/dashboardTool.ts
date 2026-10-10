import { DashboardIcon } from '@sanity/icons/Dashboard';
import type { Tool } from 'sanity';

import Dashboard from '@/sanity/components/dashboard/Dashboard';

export const dashboardTool: Tool = {
  name: 'dashboard',
  title: 'Dashboard',
  icon: DashboardIcon,
  component: Dashboard,
};
