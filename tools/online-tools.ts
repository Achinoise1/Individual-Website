import type { ToolSection } from '../src/types/tools';

const section: ToolSection = {
  icon: '🌐',
  label: '在线工具',
  order: 2,
  tools: [
    {
      icon: '✏️',
      title: 'Excalidraw',
      description: '极简风格的在线白板和画图工具，支持协作，适合架构图、流程图绘制。',
      tags: ['free', 'openSource'],
      href: 'https://excalidraw.com/',
    },
    {
      icon: '🎨',
      title: 'Carbon',
      description: '将代码片段生成精美的截图图片，适合分享和社交媒体发布。',
      tags: ['free', 'openSource'],
      href: 'https://carbon.now.sh/',
    },
    {
      icon: '🔍',
      title: 'Regex101',
      description: '在线正则表达式调试工具，支持多种语言，并提供详细的匹配解释。',
      tags: ['free'],
      href: 'https://regex101.com/',
    },
    {
      icon: '🗜️',
      title: 'Squoosh',
      description: 'Google 出品的在线图片压缩工具，支持 WebP、AVIF 等现代格式转换。',
      tags: ['free', 'openSource'],
      href: 'https://squoosh.app/',
    },
    {
      icon: '📦',
      title: 'JSON Crack',
      description: '将 JSON / YAML / XML 数据可视化为交互式图表，便于理解复杂结构。',
      tags: ['free', 'openSource'],
      href: 'https://jsoncrack.com/',
    },
    {
      icon: '🌐',
      title: 'transform.tools',
      description: '各种格式互转工具集合：JSON ↔ TypeScript、SVG → JSX、CSS → JS-in-CSS 等。',
      tags: ['free', 'openSource'],
      href: 'https://transform.tools/',
    },
  ],
};

export default section;
