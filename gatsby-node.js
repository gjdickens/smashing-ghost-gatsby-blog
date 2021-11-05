const path = require(`path`);
const url = require(`url`);
const cheerio = require('cheerio');
const { paginate } = require(`gatsby-awesome-pagination`);
const { postsPerPage } = require(`./src/utils/siteConfig`);

exports.createPages = async ({ graphql, actions }) => {
    const { createPage } = actions
    const result = await graphql(`
      {
          allGhostPost(sort: { order: ASC, fields: published_at }) {
              edges {
                  node {
                      slug
                  }
              }
          }
          allGhostTag(sort: { order: ASC, fields: name }) {
              edges {
                  node {
                      slug
                      url
                      postCount
                  }
              }
          }
      }
    `)
    // Check for any errors
    if (result.errors) {
        throw new Error(result.errors)
    }
    // Extract query results
    const tags = result.data.allGhostTag.edges
    const posts = result.data.allGhostPost.edges
    // Load templates
    const tagsTemplate = path.resolve(`./src/templates/tag.js`)
    const postTemplate = path.resolve(`./src/templates/blog-post.js`)

    // Create tag pages
    tags.forEach(({ node }) => {
        const totalPosts = node.postCount !== null ? node.postCount : 0

        // This part here defines, that our tag pages will use
        // a `/tag/:slug/` permalink.
        const url = `/tag/${node.slug}`

        const items = Array.from({length: totalPosts})

        // Create pagination
        paginate({
            createPage,
            items: items,
            itemsPerPage: postsPerPage,
            component: tagsTemplate,
            pathPrefix: ({ pageNumber }) => (pageNumber === 0) ? url : `${url}/page`,
            context: {
                slug: node.slug
            }
        })
    })

    // Create post pages
    posts.forEach(({ node }) => {
        // This part here defines, that our posts will use
        // a `/:slug/` permalink.
        node.url = `/${node.slug}/`
        createPage({
            path: node.url,
            component: postTemplate,
            context: {
                // Data passed to context is available
                // in page queries as GraphQL variables.
                slug: node.slug,
            },
        })
    })
}

exports.onCreateNode = async ({ node, getNodesByType }) => {
  if (node.internal.owner !== `gatsby-source-ghost`) {
    return
  }
  if (node.internal.type === 'GhostPage' || node.internal.type === 'GhostPost') {
    const settings = getNodesByType(`GhostSettings`);
    const siteUrl = url.parse(settings[0].url);

    const $ = cheerio.load(node.html);
    const links = $('a');
    links.attr('href', function(i, href){
      if (href) {
        const hrefUrl = url.parse(href);
        if (hrefUrl.protocol === siteUrl.protocol && hrefUrl.host === siteUrl.host) {
          return hrefUrl.path
        }

        return href;
      }

    });
    node.html = $.html();
  }
}
