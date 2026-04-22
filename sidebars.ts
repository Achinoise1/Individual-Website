import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    {
      type: 'category',
      label: '后端',
      items: [
        {
          type: 'category',
          label: 'Python',
          items: [
            {
              type: 'category',
              label: '基础',
              items: [
                'Backend/Python/basic/data-container',
                'Backend/Python/basic/inside-struct',
                'Backend/Python/basic/mutable',
                'Backend/Python/basic/copy',
                'Backend/Python/basic/gil',
                'Backend/Python/basic/syntactic-sugar',
                'Backend/Python/basic/magic-methods',
                'Backend/Python/basic/decorator',
                'Backend/Python/basic/generator',
                'Backend/Python/basic/args-kwargs',
                'Backend/Python/basic/memory-manage',
              ],
            },
            {
              type: 'category',
              label: 'Django 框架',
              items: [
                'Backend/Python/framework/Django/django-intro',
                'Backend/Python/framework/Django/data-models',
                'Backend/Python/framework/Django/core-components',
                'Backend/Python/framework/Django/setup-database',
              ],
            },
            {
              type: 'category',
              label: 'Flask 框架',
              items: [
                'Backend/Python/framework/Flask/quickstart',
                'Backend/Python/framework/Flask/core-components',
                'Backend/Python/framework/Flask/context',
              ],
            },
            {
              type: 'category',
              label: 'FastAPI 框架',
              items: [
                'Backend/Python/framework/FastAPI/quickstart',
                'Backend/Python/framework/FastAPI/core-components',
                'Backend/Python/framework/FastAPI/depend-inject',
                'Backend/Python/framework/FastAPI/Pydantic',
                'Backend/Python/framework/FastAPI/query-parse',
                'Backend/Python/framework/FastAPI/routing',
              ],
            },
          ],
        },
      ],
    }
  ],
};

export default sidebars;
