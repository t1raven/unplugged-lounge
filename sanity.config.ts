'use client';

import { visionTool } from '@sanity/vision';
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { structure } from '@/sanity/structure';

import { media } from 'sanity-plugin-media';

import { dashboardTool } from '@/sanity/components/tools/dashboardTool';

import { dataset, projectId } from '@/sanity/env';
import { schemaTypes } from '@/sanity/schemaTypes';

import { StudioCountProvider } from '@/sanity/components/providers/StudioCountProvider';
import { default as CustomNavbar } from '@/sanity/components/navBar/CustomNavbar';

import {
  DeletePerformanceAndGalleryAction,
  PublishPerformanceAndSyncGalleryAction,
} from './sanity/actions/performancePosterSync';

import { koKRLocale } from '@sanity/locale-ko-kr';

const singletonTypes = new Set(['siteSettings', 'home', 'equipment']);

export default defineConfig({
  //basePath: '/studio',
  title: 'UNPLUGGED LOUNGE',

  projectId,
  dataset,

  plugins: [
    structureTool({
      title: 'Content',
      structure,
    }),

    media(),

    koKRLocale(),

    // localhost에서만 Vision 표시
    ...(process.env.NODE_ENV === 'development' ? [visionTool()] : []),
  ],

  tools: (prev) => [dashboardTool, ...prev.filter((tool) => tool.name !== 'dashboard')],

  schema: {
    types: schemaTypes,

    templates: (templates) => templates.filter(({ schemaType }) => !singletonTypes.has(schemaType)),
  },

  /*studio: {
    components: {
      navbar: () => null, 
    },
  },*/

  studio: {
    components: {
      navbar: CustomNavbar,
      layout: (props) =>
        StudioCountProvider({
          children: props.renderDefault(props),
        }),
    },
  },

  document: {
    /* newDocumentOptions: (prev, { creationContext }) => {
      if (creationContext.type === 'global') {
        // Hide the creation of "settings" documents if the context is global
        return [];
      }
      return prev;
    }, */

    actions: (previousActions, context) => {
      if (context.schemaType !== 'performance') return previousActions;

      return previousActions.map((action) => {
        if (action.action === 'publish') return PublishPerformanceAndSyncGalleryAction;
        if (action.action === 'delete') return DeletePerformanceAndGalleryAction;
        return action;
      });
    },
  },
});
