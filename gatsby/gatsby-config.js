const fs = require('fs');
const path = require('path');

const catalogDir = path.resolve(__dirname, 'catalogs'); // Should be './gatsby/catalogs'
const dbFiles = fs.readdirSync(catalogDir).filter(file => file.endsWith('.db'));

module.exports = {
  pathPrefix: `/catalogs/default`,
  siteMetadata: {
    title: 'Meta Catalog',
    subtitle: 'Aggregated solutions from multiple catalogs',
    catalog_url: 'https://your-site-url',
    menuLinks: [
      {
        name: 'Catalog',
        link: '/catalog'
      },
      {
        name: 'About',
        link: '/about'
      },
    ],
  },
  plugins: [
    ...dbFiles.map(dbFile => ({
      resolve: `gatsby-source-sqlite`,
      options: {
        dbName: path.basename(dbFile, '.db'),
        dbPath: path.join(catalogDir, dbFile),
      },
    })),
    {
      resolve: `gatsby-theme-album`,
      options: {},
    },
  ],
};
