import type { ToolSection } from '../src/types/tools';

const section: ToolSection = {
  icon: '🖥️',
  label: '自建服务',
  order: 0,
  tools: [
    {
      icon: '📸',
      title: 'Screenshot-Export',
      description: '自建的截图导出工具，支持多种视频导入格式，导出为高质量图片，完全掌控数据和隐私。',
      tags: ['selfHosted', 'openSource'],
      href: '/tools/screenshot-export', // 替换为你的实际地址
    },
    {
      icon: '📁',
      title: 'Gitea',
      description: '轻量级的自建 Git 服务，私有代码托管，完全掌控数据。',
      tags: ['selfHosted', 'openSource'],
      href: '#', // 替换为你的实际地址
    },
    {
      icon: '☁️',
      title: 'Nextcloud',
      description: '私有云存储与协作平台，文件同步、日历、笔记，数据存于自己服务器。',
      tags: ['selfHosted', 'openSource'],
      href: '#', // 替换为你的实际地址
    },
    {
      icon: '📊',
      title: 'Grafana',
      description: '数据可视化与监控仪表盘，配合 Prometheus 对服务器进行实时监控。',
      tags: ['selfHosted', 'openSource'],
      href: '#', // 替换为你的实际地址
    },
  ],
};

export default section;
