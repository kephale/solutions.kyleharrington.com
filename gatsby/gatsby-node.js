const fs = require("fs");
const path = require("path");

exports.sourceNodes = ({ actions }) => {
  actions.createTypes(`
    type SqliteSolution implements Node {
      id: ID!
      name: String!
      album_api_version: String!
      doi: String
      license: String
      solution_id: Int
      solution_authors: [SqliteSolutionAuthor] @link(by: "solution_id", from: "solution_id")
      solution_custom: [SqliteSolutionCustom] @link(by: "solution_id", from: "solution_id")
      solution_arguments: [SqliteSolutionArgument] @link(by: "solution_id", from: "solution_id")
      solution_tags: [SqliteSolutionTag] @link(by: "solution_id", from: "solution_id")
      solution_citations: [SqliteSolutionCitation] @link(by: "solution_id", from: "solution_id")
      documentation: [SqliteDocumentation] @link(by: "solution_id", from: "solution_id")
      covers: [SqliteCover] @link(by: "solution_id", from: "solution_id")
    }
    type SqliteSolutionAuthor implements Node {
      id: ID!
      solution_id: Int!
      author_id: Int!
    }
    type SqliteSolutionCustom implements Node {
      id: ID!
      solution_id: Int!
      custom_id: Int!
    }
    type SqliteAuthor implements Node {
      id: ID!
      name: String!
      author_id: Int
    }
    type SqliteCustom implements Node {
      id: ID!
      custom_id: Int!
      custom_key: String!
      custom_value: String
    }
    type SqliteCover implements Node {
      id: ID!
      description: String
      source: String
      img: File
      cover_id: Int
      solution_id: Int
      solution: SqliteSolution
    }
    type SqliteTag implements Node {
      id: ID!
      tag_id: Int!
      name: String
    }
    type SqliteCitation implements Node {
      id: ID!
      citation_id: Int!
      text: String!
      doi: String
      url: String
    }
    type SqliteSolutionArgument implements Node {
      id: ID!
      argument_id: Int
      solution_id: Int
    }
    type SqliteArgument implements Node {
      id: ID!
      name: String!
      description: String
      default_value: String
      argument_id: Int
    }
    type SqliteDocumentation implements Node {
      id: ID!
      documentation_id: Int
      solution_id: Int
      documentation: String!
      content: File
      solution: SqliteSolution
    }
    type SqliteSolutionTag implements Node {
      id: ID!
      tag_id: Int
      solution_id: Int
    }
    type SqliteSolutionCitation implements Node {
      id: ID!
      citation_id: Int
      solution_id: Int
    }
  `);
};

const getSolutionPath = (group, name) => {
  return path.join(__dirname, 'solutions', group, name);
};

exports.createPages = async ({ actions, graphql, reporter }) => {
  const result = await graphql(`
    query {
      catalog: allSqliteSolution {
        nodes {
          name
          title
          description
          license
          album_api_version
          group
          version
          doi
          covers {
            solution {
              group
              name
              version
            }
            img {
              childImageSharp {
                gatsbyImageData(layout: FULL_WIDTH)
              }
            }
            source
            description
          }
          solution_authors {
            author_id
          }
          solution_custom {
            custom_id
          }
          solution_tags {
            tag_id
          }
          solution_arguments {
            argument_id
          }
          solution_citations {
            citation_id
          }
          documentation {
            documentation_id
            documentation
            content {
              childMarkdownRemark {
                html
              }
            }
          }
        }
      }
    }
  `);

  if (result.errors) {
    reporter.panic("error loading catalogs", result.errors);
    return;
  }

  const solutions = result.data.catalog.nodes;

  solutions.forEach((solution) => {
    const solutionPath = getSolutionPath(solution.group, solution.name);
    if (fs.existsSync(solutionPath)) {
      actions.createPage({
        path: `/solution/${solution.group}/${solution.name}/${solution.version}`,
        component: require.resolve("./src/templates/solution.js"),
        context: {
          solution,
          solutionPath, // Pass the path to the solution's files
        },
      });
    } else {
      reporter.warn(`Solution path not found: ${solutionPath}`);
    }
  });
};

exports.onPostBuild = function() {
  fs.renameSync(path.join('public'), path.join('..', 'public'));
};
