module.exports = {
  pathPrefix: `/`,
  siteMetadata: {
    title: 'solutions.kyleharrington.com',
    subtitle: 'sharing favourite solutions across tools and domains',
    catalog_url: 'https://solutions.kyleharrington.com',
    menuLinks:[
      {
         name:'Catalog',
         link:'/catalog'
      },
      {
         name:'About',
         link:'/about'
      },
    ]
  },
  plugins: [{ resolve: `gatsby-theme-album`, options: {} }, `gatsby-plugin-theme-ui`],
}
