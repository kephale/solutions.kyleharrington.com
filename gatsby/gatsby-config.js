const fs = require('fs');
const path = require('path');

const catalogDir = path.resolve(__dirname, 'catalogs'); // Should be './gatsby/catalogs'
const dbFiles = fs.readdirSync(catalogDir).filter(file => file.endsWith('.db'));

module.exports = {
  pathPrefix: `/`,
  siteMetadata: {
    title: 'Kyle Harringtons Meta Catalog',
    subtitle: 'Aggregated solutions from multiple catalogs',
    catalog_url: 'https://github.com/kephale/solutions.kyleharrington.com',
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
