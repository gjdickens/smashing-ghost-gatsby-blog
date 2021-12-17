const config = require(`./src/utils/siteConfig`);
const generateRSSFeed = require(`./src/utils/generate-feed`);

module.exports = {
  siteMetadata: {
    title: `Gatsby Starter Blog`,
    author: {
      name: `Kyle Mathews`,
      summary: `who lives and works in San Francisco building useful things.`,
    },
    description: `A starter blog demonstrating what Gatsby can do.`,
    siteUrl: `https://brave-archimedes-9fb2cc.netlify.app/`,
    social: {
      twitter: `kylemathews`,
    },
  },
  plugins: [
    `gatsby-plugin-image`,
    `gatsby-plugin-catch-links`,
    {
      resolve: `gatsby-source-ghost`,
      options: {
        apiUrl: `http://localhost:2368`,
        contentApiKey: `cf4ccbfdb5412d30e9d2772a80`,
      }
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 630,
            },
          },
          {
            resolve: `gatsby-remark-responsive-iframe`,
            options: {
              wrapperStyle: `margin-bottom: 1.0725rem`,
            },
          },
          `gatsby-remark-prismjs`,
          `gatsby-remark-copy-linked-files`,
          `gatsby-remark-smartypants`,
        ],
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    // {
    //   resolve: `gatsby-plugin-google-analytics`,
    //   options: {
    //     trackingId: `ADD YOUR TRACKING ID HERE`,
    //   },
    // },
    {
        resolve: `gatsby-plugin-feed`,
        options: {
            query: `
            {
                allGhostSettings {
                    edges {
                        node {
                            title
                            description
                        }
                    }
                }
            }
          `,
            feeds: [
                generateRSSFeed(config),
            ],
        },
    },
    {
      resolve: `gatsby-plugin-advanced-sitemap`,
      options: {
          query: `
            {
                allGhostPost {
                    edges {
                        node {
                            id
                            slug
                            updated_at
                            created_at
                            feature_image
                        }
                    }
                }
                allGhostPage(filter: {tags: {elemMatch: {slug: {regex: "/^((?!hash-).)*$/"}}}}) {
                    edges {
                        node {
                            id
                            slug
                            updated_at
                            created_at
                            feature_image
                        }
                    }
                }
                allGhostTag(filter: {slug: {regex: "/^((?!hash-).)*$/"}}) {
                    edges {
                        node {
                            id
                            slug
                            feature_image
                        }
                    }
                }
                allGhostAuthor {
                    edges {
                        node {
                            id
                            slug
                            profile_image
                        }
                    }
                }
            }`,
            mapping: {
                allGhostPost: {
                    sitemap: `posts`,
                },
                allGhostTag: {
                    sitemap: `tags`,
                },
                allGhostAuthor: {
                    sitemap: `authors`,
                },
                allGhostPage: {
                    sitemap: `pages`,
                },
            },
            exclude: [
                `/dev-404-page`,
                `/404`,
                `/404.html`,
                `/offline-plugin-app-shell-fallback`
            ],
            createLinkInHead: true,
            addUncaughtPages: true,
        },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Gatsby Starter Blog`,
        short_name: `GatsbyJS`,
        start_url: `/`,
        background_color: `#ffffff`,
        // This will impact how browsers show your PWA/website
        // https://css-tricks.com/meta-theme-color-and-trickery/
        // theme_color: `#663399`,
        display: `minimal-ui`,
        icon: `src/images/gatsby-icon.png`, // This path is relative to the root of the site.
      },
    },
    `gatsby-plugin-react-helmet`,
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
  ],
}
