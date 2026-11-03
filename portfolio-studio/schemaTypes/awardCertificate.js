export default {
  name: 'awardCertificate',
  title: 'Award / Certificate',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title (e.g. project name "Young Multi")',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'category',
      title: 'Category (SOTD / SOTM / OTHER)',
      type: 'string',
      options: {
        list: [
          { title: 'Site Of The Day (SOTD)', value: 'sotd' },
          { title: 'Site Of The Month (SOTM)', value: 'sotm' },
          { title: 'Other', value: 'other' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
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
      name: 'certificateImage',
      title: 'Certificate Image (For HTML modal)',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'date',
      title: 'Date Obtained',
      type: 'date',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'url',
      title: 'Link (URL to award page)',
      type: 'url',
    },
  ],
};
