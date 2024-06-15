const fs = require("fs");
const semver = require("semver");
const path = require('path');

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

const getTags = function(tagsAsString) {
  tags = [];
  tagsAsString.forEach(tagObject => {
    var tag = tagObject.fieldValue.toLowerCase();
    if (tags.indexOf(tag) < 0) tags.push(tag);
  });
  return tags;
};

const { createFileNode } = require(`gatsby-source-filesystem/create-file-node`);
const { createRemoteFileNode } = require(`gatsby-source-filesystem`);

const getImageUrl = (solution, cover) => {
  if (typeof solution !== 'undefined') {
    return `${solution.group}/${solution.name}/${cover.source}`;
  } else {
    return `src/images/placeholder.png`;
  }
};

const getDocumentationUrl = (solution, documentation) => {
  return `${solution.group}/${solution.name}/${documentation.documentation}`;
};

exports.createResolvers = ({ createResolvers }) => {
  createResolvers({
    SqliteCover: {
      img: {
        type: "File",
        resolve: (source, args, context) => {
          const solution = context.nodeModel.getNodeById({ id: source["solution___NODE"] });
          const fileName = getImageUrl(solution, source);
          return context.nodeModel.runQuery({
            query: {
              filter: {
                relativePath: {
                  eq: fileName
                }
              }
            },
            type: "File",
            firstOnly: true,
          });
        }
      }
    },
    SqliteDocumentation: {
      content: {
        type: "File",
        resolve: (doc, args, context) => {
          const solution = context.nodeModel.getNodeById({ id: doc["solution___NODE"] });
          const fileName = getDocumentationUrl(solution, doc);
          return context.nodeModel.runQuery({
            query: {
              filter: {
                relativePath: {
                  eq: fileName
                }
              }
            },
            type: "File",
            firstOnly: true,
          });
        }
      }
    },
  });
};

exports.createSchemaCustomization = ({ actions, schema }) => {
  const { createTypes } = actions;
  const typeDefs = [
    schema.buildObjectType({
      name: "SqliteArgument",
      fields: {
        default_value: {
          type: "String",
          resolve(source, args, context, info) {
            const value = source[info.fieldName];
            if (value == null) {
              return "PARAMETER_VALUE";
            }
            return value;
          },
        },
      },
    }),
  ];
  createTypes(typeDefs);
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
      tags: allSqliteTag {
        nodes {
          name
          tag_id
        }
      }
      authors: allSqliteAuthor {
        nodes {
          name
          author_id
        }
      }
      custom: allSqliteCustom {
        nodes {
          custom_key
          custom_value
          custom_id
        }
      }
      citations: allSqliteCitation {
        nodes {
          text
          doi
          url
          citation_id
        }
      }
      arguments: allSqliteArgument {
        nodes {
          name
          description
          default_value
          argument_id
        }
      }
      pages: allMarkdownRemark(filter: { fileAbsolutePath: { regex: "//pages//" } }, sort: { order: DESC, fields: [frontmatter___permalink] }) {
        nodes {
          html
          frontmatter {
            permalink
            title
          }
        }
      }
      site: site {
        siteMetadata {
          title
          subtitle
          catalog_url
          menuLinks {
            name
            link
          }
        }
      }
      catalogMeta: file(base: { eq: "album_catalog_index.json" }) {
        absolutePath
      }
    }
  `);

  if (result.errors) {
    reporter.panic("error loading catalogs", result.errors);
    return;
  }

  actions.createPage({
    path: "/",
    component: require.resolve("./src/templates/home.js"),
    context: {
      site: result.data.site,
    }
  });

  const filterNewestVersions = (solutions, tags, authors, custom, citations, arguments, catalog_meta_path) => {
    var res = [];
    var groups = new Map();
    const catalogMeta = JSON.parse(fs.readFileSync(catalog_meta_path, "utf-8"));
    solutions.forEach(solution => {
      var found = false;
      res.forEach((s, index) => {
        if (s.group === solution.group) {
          if (s.name === solution.name) {
            if (semver.lt(s.version, solution.version)) {
              res[index] = solution;
            }
            found = true;
          }
        }
      });
      if (!found) res.push(solution);
      if (!groups.has(solution.group)) {
        var newGroup = solution.group;
        const path = "/" + newGroup;
        actions.createPage({
          path: path,
          component: require.resolve("./src/templates/group.js"),
          context: {
            name: newGroup,
            site: result.data.site
          },
        });
        groups.set(newGroup, new Map());
      }
      if (!groups.get(solution.group).has(solution.name)) {
        var newName = solution.name;
        const path = "/" + solution.group + "/" + newName;
        actions.createPage({
          path: path,
          component: require.resolve("./src/templates/name.js"),
          context: {
            group: solution.group,
            name: newName,
            site: result.data.site
          },
        });
        groups.get(solution.group).set(newName, new Map());
      }
      var newVersion = solution.version;
      var solutionTags = [];
      var solutionAuthors = [];
      var solutionCustom = [];
      var solutionArguments = [];
      var solutionCitations = [];
      for (const solutionTag in solution.solution_tags) {
        for (const id in tags) {
          tag = tags[id];
          if (tag.tag_id == solutionTag) {
            solutionTags.push(tag);
          }
        }
      }
      for (const solutionAuthor in solution.solution_authors) {
        for (const id in authors) {
          author = authors[id];
          if (author.author_id == solution.solution_authors[solutionAuthor].author_id) {
            solutionAuthors.push(author);
          }
        }
      }
      for (const solutionCustomKey in solution.solution_custom) {
        for (const id in custom) {
          custom_key = custom[id];
          if (custom_key.custom_id == solution.solution_custom[solutionCustomKey].custom_id) {
            solutionCustom.push(custom_key);
          }
        }
      }
      for (const solutionArgument in solution.solution_arguments) {
        for (const id in arguments) {
          argument = arguments[id];
          if (argument.argument_id == solution.solution_arguments[solutionArgument].argument_id) {
            solutionArguments.push(argument);
          }
        }
      }
      for (const solutionCitation in solution.solution_citations) {
        for (const id in citations) {
          citation = citations[id];
          if (citation.citation_id == solution.solution_citations[solutionCitation].citation_id) {
            solutionCitations.push(citation);
          }
        }
      }
      solution.solution_citations = solutionCitations;
      solution.solution_tags = solutionTags;
      solution.solution_authors = solutionAuthors;
      solution.solution_custom = solutionCustom;
      solution.solution_arguments = solutionArguments;
      const path = "/" + solution.group + "/" + solution.name + "/" + newVersion;
      actions.createPage({
        path: path,
        component: require.resolve("./src/templates/version.js"),
        context: {
          solution: solution,
          site: result.data.site,
          catalog_meta: catalogMeta
        },
      });
    });
    return res;
  };

  actions.createPage({
    path: "/catalog",
    component: require.resolve("./src/templates/catalog.js"),
    context: {
      solutions: filterNewestVersions(result.data.catalog.nodes, result.data.tags.nodes, result.data.authors.nodes,
        result.data.custom.nodes, result.data.citations.nodes, result.data.arguments.nodes, result.data.catalogMeta.absolutePath),
      tags: result.data.tags.nodes,
      site: result.data.site,
    },
  });

  const pages = result.data.pages.nodes;
  pages.forEach(page => {
    const permalink = page.frontmatter.permalink;
    actions.createPage({
      path: permalink,
      component: require.resolve("./src/templates/page.js"),
      context: {
        site: result.data.site,
      },
    });
  });
};

exports.onPostBuild = function() {
  fs.renameSync(path.join('public'), path.join('..', 'public'));
};
