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
                'Backend/Python/basic/inside',
                'Backend/Python/basic/mutable',
                'Backend/Python/basic/copy',
                'Backend/Python/basic/gil',
                'Backend/Python/basic/decorator',
                'Backend/Python/basic/generator',
                'Backend/Python/basic/args-kwargs',
                'Backend/Python/basic/memory-manage',
              ],
            },
          ],
        },
      ],
    }
  ],
};

export default sidebars;
