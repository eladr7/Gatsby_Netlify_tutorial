const path = require(`path`)
const { createFilePath } = require(`gatsby-source-filesystem`)

exports.onCreateNode = ({ node, getNode, actions }) => {
    const { createNodeField } = actions
    if (node.internal.type === `MarkdownRemark`) {
        const slug = createFilePath({ node, getNode, basePath: `pages` })
        createNodeField({
            node,
            name: `slug`,
            value: slug,
        })
    }
}

const createLocalMdPages = async (graphql, createPage) => {
    const result = await graphql(`
    query {
      allMarkdownRemark {
        edges {
          node {
            fields {
              slug
            }
          }
        }
      }
    }
  `)

    result.data.allMarkdownRemark.edges.forEach(({ node }) => {
        createPage({
            path: node.fields.slug,
            component: path.resolve(`./src/templates/blog-post.js`),
            context: {
                // Data passed to context is available
                // in page queries as GraphQL variables.
                slug: node.fields.slug,
            },
        })
    })
}

const createWpPages = (graphql, createPage) => {
    return graphql(`
    {
      allWordpressPost(sort: { fields: [date] }) {
        edges {
          node {
            title
            excerpt
            content
            slug
          }
        }
      }
    }
  `).then(result => {
        result.data.allWordpressPost.edges.forEach(({ node }) => {
            createPage({
                path: node.slug,
                component: path.resolve(`./src/templates/wp-blog-post.js`),
                context: {
                    // This is the $slug variable
                    // passed to blog-post.js
                    slug: node.slug,
                },
            })
        })
    })
}

exports.createPages = async ({ graphql, actions }) => {
    const { createPage } = actions

      // 404
  createPage({
    path: '/404',
    component: path.resolve('./src/templates/not-found-template.js')
  })

  
    createLocalMdPages(graphql, createPage)
    createWpPages(graphql, createPage)
}

// Implement the Gatsby API “onCreatePage”. This is
// called after every page is created.
exports.onCreatePage = async ({ page, actions }) => {
    const { createPage } = actions

    // page.matchPath is a special key that's used for matching pages
    // only on the client.
    if (page.path.match(/^\/app/)) {
        page.matchPath = "/app/*"

        // Update the page.
        createPage(page)
    }
}