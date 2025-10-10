export default () => ({
  port: process.env.PORT,
  host: process.env.HOST,

  docs: {
    enabled: process.env.DOCS_ENABLED === 'true' || false,
    path: process.env.DOCS_PATH || 'docs',
  },
});
