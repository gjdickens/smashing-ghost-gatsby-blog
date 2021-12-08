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
          allGhostAuthor(sort: { order: ASC, fields: name }) {
              edges {
                  node {
                      slug
                      url
                      postCount
                  }
              }
          }
          allGhostPage(sort: { order: ASC, fields: published_at }) {
              edges {
                  node {
                      slug
                      url
                      html
                      tags {
                          slug
                      }
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
    const authors = result.data.allGhostAuthor.edges
    const pages = result.data.allGhostPage.edges
    const posts = result.data.allGhostPost.edges
    // Load templates
    const indexTemplate = path.resolve(`./src/templates/index.js`)
    const tagsTemplate = path.resolve(`./src/templates/tag.js`)
    const authorTemplate = path.resolve(`./src/templates/author.js`)
    const pageTemplate = path.resolve(`./src/templates/page.js`)
    const postTemplate = path.resolve(`./src/templates/post.js`)

    let dynamicContent = {};

    // Create external pages and parse internal pages for data
    pages.forEach(({ node }) => {
      // This part here defines, that our pages will use
      // a `/:slug/` permalink.
      node.url = `/${node.slug}/`

      let external = true;
      let internalTagName;
      //check if page includes tag with hash
      if (node.tags.length > 0) {
        const internalTags = node.tags.filter((tag) => tag.slug.includes('hash-'));
        // if so, mark as internal and set internalTagName to be the same as the tag without the hash
        if (internalTags.length > 0) {
          external = false;
          internalTagName = internalTags[0].slug.split('hash-')[1];
        }
      }
      //if page is external, create page
      if (external) {
        createPage({
            path: node.url,
            component: pageTemplate,
            context: {
                // Data passed to context is available
                // in page queries as GraphQL variables.
                slug: node.slug,
            },
        })
      }
      //if page is not external, parse page for data and add to dynamicContent
      else {
        dynamicContent[internalTagName] = node.html;
      }

    })

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

    // Create author pages
    authors.forEach(({ node }) => {
        const totalPosts = node.postCount !== null ? node.postCount : 0

        // This part here defines, that our author pages will use
        // a `/author/:slug/` permalink.
        const url = `/author/${node.slug}`

        const items = Array.from({length: totalPosts})

        // Create pagination
        paginate({
            createPage,
            items: items,
            itemsPerPage: postsPerPage,
            component: authorTemplate,
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

    // Create Index page with pagination
    paginate({
        createPage,
        context: {
          dynamicContent: dynamicContent
        },
        items: posts,
        itemsPerPage: 4,
        component: indexTemplate,
        pathPrefix: ({ pageNumber }) => {
            if (pageNumber === 0) {
                return `/`
            } else {
                return `/page`
            }
        },
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
