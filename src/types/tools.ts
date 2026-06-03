export type TagType = 'free' | 'openSource' | 'selfHosted' | 'paid';

export type ToolItem = {
  icon: string;
  title: string;
  description: string;
  tags: TagType[];
  href: string;
};

export type ToolSection = {
  icon: string;
  label: string;
  order: number;
  tools: ToolItem[];
};
