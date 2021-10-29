const path = require(`path`);
const url = require(`url`);
const cheerio = require('cheerio');

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
        }
    `)
    // Check for any errors
    if (result.errors) {
        throw new Error(result.errors)
    }
    // Extract query results
    const posts = result.data.allGhostPost.edges
    // Load templates
    const postTemplate = path.resolve(`./src/templates/blog-post.js`)

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
