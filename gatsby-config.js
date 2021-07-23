module.exports = {
  siteMetadata: {
    title: 'My solutions',
    subtitle: 'Exemplary album catalog.',
    menuLinks:[
      {
         name:'home',
         link:'/'
      },
      {
         name:'Catalog',
         link:'/catalog'
      },
      {
         name:'About',
         link:'/about'
      },
      {
         name:'Docs',
         link:'/docs'
      }
    ]
  },
  plugins: [{ resolve: `gatsby-theme-album`, options: {} }],
}
