export default {
  name: 'studioItem',
  title: 'Studio Monitor Content',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'device',
      title: 'Device (Where should it be displayed?)',
      type: 'string',
      options: {
        list: [
          { title: 'Phone (Vertical: TikTok, IG, YT Shorts)', value: 'phone' },
          { title: 'TV (Horizontal video: long YT, films)', value: 'tv' },
          { title: 'Monitor (Text/Posts: LinkedIn, X, Blogs, Codrops)', value: 'monitor' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'platform',
      title: 'Platform',
      type: 'string',
      options: {
        list: [
          { title: 'YouTube', value: 'youtube' },
          { title: 'TikTok', value: 'tiktok' },
          { title: 'Instagram', value: 'instagram' },
          { title: 'X (Twitter)', value: 'x' },
          { title: 'LinkedIn', value: 'linkedin' },
          { title: 'Codrops / Forum', value: 'codrops' },
          { title: 'Blog / Article', value: 'blog' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'url',
      title: 'URL',
      type: 'url',
    },
    {
      name: 'seoTitle',
      title: 'SEO Title (Optional: long name for Google)',
      type: 'string',
      description: 'If filled, Google will use this name instead of the short Title.',
    },
    {
      name: 'seoDescription',
      title: 'SEO Description (Optional: long invisible description for Google)',
      type: 'text',
      description: 'Invisible on the page, but ideal for SEO keyword context.',
    },
    {
      name: 'frontTexture',
      title: 'Front Texture (Unpainted)',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'paintedFrontTexture',
      title: 'Painted Front Texture',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'date',
      title: 'Date',
      type: 'date',
      validation: (Rule) => Rule.required(),
    },
    // Optional statistics depending on platform
    {
      name: 'views',
      title: 'Views (e.g. "1.2K")',
      type: 'string',
      hidden: ({ document }) => document?.platform === 'blog',
    },
    {
      name: 'likes',
      title: 'Likes (e.g. "1.2K")',
      type: 'string',
      hidden: ({ document }) => document?.platform !== 'tiktok',
    },
    {
      name: 'duration',
      title: 'Duration (e.g. "15:32")',
      type: 'string',
      hidden: ({ document }) => document?.platform !== 'youtube',
    },
    {
      name: 'readTime',
      title: 'Read Time (e.g. "5 min")',
      type: 'string',
      hidden: ({ document }) => document?.platform !== 'blog',
    },
  ],
};
