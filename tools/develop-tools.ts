import type { ToolSection } from '../src/types/tools';

const section: ToolSection = {
  icon: '🔧',
  label: '开发工具',
  order: 2,
  tools: [
    {
      icon: '🐳',
      title: 'Docker Compose',
      description: '多容器编排工具，是本地微服务开发的关键组件。',
      tags: ['free', 'openSource'],
      href: 'https://docs.docker.com/compose/',
    },
    {
      icon: '📜',
      title: 'Swagger / OpenAPI',
      description: 'API 文档与接口规范工具，实现前后端契约化开发。',
      tags: ['free', 'openSource'],
      href: 'https://swagger.io/',
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
