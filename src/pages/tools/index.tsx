import type { ReactNode } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import type { ToolItem, ToolSection } from '@site/src/types/tools';
import styles from './index.module.css';

const tagLabels: Record<string, string> = {
  free: '免费',
  openSource: '开源',
  selfHosted: '自建',
  paid: '付费',
};

const tagClassMap: Record<string, string> = {
  free: styles.tagFree,
  openSource: styles.tagOpenSource,
  selfHosted: styles.tagSelfHosted,
  paid: styles.tagPaid,
};

function loadSections(): ToolSection[] {
  const ctx = require.context('../../../tools', false, /\.ts$/);
  const sections = ctx.keys().map((key) => {
    const mod = ctx(key) as { default: ToolSection };
    return mod.default;
  });
  return sections.sort((a, b) => a.order - b.order);
}

function ToolCard({ icon, title, description, tags, href }: ToolItem) {
  return (
    <div className={styles.card}>
      <div className={styles.cardIcon}>{icon}</div>
      <div className={styles.cardTitle}>{title}</div>
      <p className={styles.cardDescription}>{description}</p>
      <div className={styles.cardFooter}>
        <div className={styles.tags}>
          {tags.map((tag) => (
            <span key={tag} className={clsx(styles.tag, tagClassMap[tag])}>
              {tagLabels[tag]}
            </span>
          ))}
        </div>
        <Link
          className={clsx('button button--outline button--sm', styles.linkButton)}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
        >
          访问 →
        </Link>
      </div>
    </div>
  );
}

function ToolSectionBlock({ icon, label, tools }: ToolSection) {
  return (
    <section className={styles.section}>
      <Heading as="h2" className={styles.sectionHeader}>
        <span className={styles.sectionIcon}>{icon}</span>
        {label}
      </Heading>
      <div className={styles.grid}>
        {tools.map((tool) => (
          <ToolCard key={tool.title} {...tool} />
        ))}
      </div>
    </section>
  );
}

export default function ToolsPage(): ReactNode {
  const sections = loadSections();

  return (
    <Layout title="工具箱" description="我日常使用的开发工具、在线工具与自建服务">
      <div className={styles.heroSection}>
        <Heading as="h1" className={styles.heroTitle}>
          🧰 工具箱
        </Heading>
        <p className={styles.heroSubtitle}>收录我日常使用的开发工具、实用在线工具与自建服务</p>
      </div>

      <div className={clsx('container', styles.toolsPage)}>
        {sections.map((section) => (
          <ToolSectionBlock key={section.label} {...section} />
        ))}
      </div>
    </Layout>
  );
}

