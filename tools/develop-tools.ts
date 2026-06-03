import type { ToolSection } from '../src/types/tools';

const section: ToolSection = {
  icon: '🔧',
  label: '开发工具',
  order: 1,
  tools: [
    {
      icon: '💻',
      title: 'VS Code',
      description: '功能强大的开源代码编辑器，拥有丰富的插件生态，适合几乎所有编程语言。',
      tags: ['free', 'openSource'],
      href: 'https://code.visualstudio.com/',
    },
    {
      icon: '🐳',
      title: 'Docker',
      description: '容器化平台，让应用的打包、分发和部署变得标准化、可重复。',
      tags: ['free', 'openSource'],
      href: 'https://www.docker.com/',
    },
    {
      icon: '🌿',
      title: 'Git',
      description: '行业标准的分布式版本控制系统，开发者必备。',
      tags: ['free', 'openSource'],
      href: 'https://git-scm.com/',
    },
    {
      icon: '🦀',
      title: 'Neovim',
      description: '极度可定制的终端编辑器，以 Lua 驱动插件，深受终端爱好者喜爱。',
      tags: ['free', 'openSource'],
      href: 'https://neovim.io/',
    },
    {
      icon: '🐍',
      title: 'uv',
      description: '超快的 Python 包与项目管理器，用 Rust 编写，替代 pip/venv 工作流。',
      tags: ['free', 'openSource'],
      href: 'https://github.com/astral-sh/uv',
    },
    {
      icon: '🔭',
      title: 'GitHub Copilot',
      description: 'AI 编程助手，支持代码补全、对话式编程，大幅提升开发效率。',
      tags: ['paid'],
      href: 'https://github.com/features/copilot',
    },
  ],
};

export default section;
