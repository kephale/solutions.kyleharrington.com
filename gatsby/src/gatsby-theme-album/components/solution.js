import React from "react";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import { Link } from "gatsby";
import { useStaticQuery, graphql } from "gatsby";
import fs from "fs";
import yaml from "js-yaml";
import path from "path";

const getTitle = (solution) => {
  return solution.title ? solution.title : solution.name;
};

const getCover = (solution) => {
  if (solution.covers.length > 0) {
    return (
      <div className="solution-cover">
        <GatsbyImage
          image={getImage(solution.covers[0].img)}
          alt={solution.covers[0].description}
        />
      </div>
    );
  } else {
    return "";
  }
};

const getTags = (solution) => {
  if (solution.solution_tags && solution.solution_tags.length > 0) {
    return (
      <>
        <div className="meta-name">Tags</div>
        <div className="meta-value tags">
          {solution.solution_tags.map((tag) => (
            <React.Fragment key={tag.name}>
              <span className="tag">{tag.name}</span>
            </React.Fragment>
          ))}
        </div>
        <div className="break"></div>
      </>
    );
  } else {
    return "";
  }
};

const getDocumentations = (solution, solutionPath) => {
  if (solution.documentation && solution.documentation.length > 0) {
    return (
      <div className="documentations">
        {solution.documentation.map((doc) => {
          if (doc.content) {
            const documentationFile = path.join(solutionPath, doc.documentation);
            let documentationHtml = "";
            if (fs.existsSync(documentationFile)) {
              const content = fs.readFileSync(documentationFile, "utf8");
              documentationHtml = content; // You might want to parse Markdown or YAML here if needed
            }
            return (
              <React.Fragment key={doc.content.documentation_id}>
                <div
                  className="documentation"
                  dangerouslySetInnerHTML={{ __html: documentationHtml }}
                />
              </React.Fragment>
            );
          } else {
            return "";
          }
        })}
      </div>
    );
  } else {
    return "";
  }
};

const getCitation = (solution) => {
  if (solution.solution_citations && solution.solution_citations.length > 0) {
    return (
      <>
        <div className="meta-name">Citation</div>
        <div className="meta-value">
          {solution.solution_citations.map((citation) => (
            <React.Fragment key={citation.text}>
              <div>
                {citation.doi && (
                  <span className="citation-doi">{citation.doi}</span>
                )}
                {citation.text}
                {citation.url && (
                  <a className="citation-url" href={citation.url}>
                    {citation.url}
                  </a>
                )}
              </div>
            </React.Fragment>
          ))}
        </div>
        <div className="break"></div>
      </>
    );
  } else {
    return "";
  }
};

const getAuthors = (solution) => {
  if (solution.solution_authors && solution.solution_authors.length > 0) {
    return (
      <>
        <div className="meta-name">Solution written by</div>
        <div className="meta-value">
          {solution.solution_authors.map((author) => (
            <React.Fragment key={author.name}>
              <div>{author.name}</div>
            </React.Fragment>
          ))}
        </div>
        <div className="break"></div>
      </>
    );
  } else {
    return "";
  }
};

const getDOI = (solution) => {
  if (solution.doi) {
    return (
      <>
        <div className="meta-name">Solution DOI</div>
        <div className="meta-value">
          <div>
            {solution.doi && <span className="citation-doi">{solution.doi}</span>}
          </div>
        </div>
        <div className="break"></div>
      </>
    );
  } else {
    return "";
  }
};

const getLicense = (solution) => {
  if (solution.license) {
    return (
      <>
        <div className="meta-name">License of solution</div>
        <div className="meta-value">{solution.license}</div>
      </>
    );
  } else {
    return "";
  }
};

const getSolutionDetails = (solutionPath) => {
  const solutionYamlPath = path.join(solutionPath, "solution.yml");
  if (fs.existsSync(solutionYamlPath)) {
    const solutionYaml = fs.readFileSync(solutionYamlPath, "utf8");
    return yaml.load(solutionYaml);
  }
  return {};
};

const Solution = ({ pageContext }) => {
  const { solution, site, catalog_meta, solutionPath } = pageContext;

  // Retrieve additional solution details
  const solutionDetails = getSolutionDetails(solutionPath);

  const guideUrl =
    "https://album.solutions/guide?catalog_url=" +
    encodeURI(site.siteMetadata.catalog_url) +
    "&catalog_name=" +
    catalog_meta.name +
    "&group=" +
    solution.group +
    "&name=" +
    solution.name +
    "&version=" +
    solution.version +
    (solution.doi ? "&doi=" + encodeURI(solution.doi) : "");

  return (
    <>
      <div className="flex">
        <div>
          <Link to={"/" + solution.group}>{solution.group}</Link> /{" "}
          <Link to={"/" + solution.group + "/" + solution.name}>
            {solution.name}
          </Link>{" "}
          / {solution.version}
          <h1>{getTitle(solution)}</h1>
        </div>
        {getCover(solution)}
      </div>
      <div>{solution.description}</div>
      <div className="meta-box">
        {getTags(solution)}
        {getCitation(solution)}
        {getAuthors(solution)}
        {getDOI(solution)}
        {getLicense(solution)}
      </div>

      {solution.solution_custom &&
      solution.solution_custom.length > 0 ? (
        <>
          <h2>Custom keys</h2>
          <div className="meta-box">
            {solution.solution_custom.map((custom) => (
              <React.Fragment key={custom.custom_key}>
                <div className="meta-name">{custom.custom_key}</div>
                <div className="meta-value">{custom.custom_value}</div>
                <div className="break"></div>
              </React.Fragment>
            ))}
          </div>
        </>
      ) : (
        ""
      )}

      <h2>Arguments</h2>

      {solution.solution_arguments &&
      solution.solution_arguments.length > 0 ? (
        <div className="meta-box">
          {solution.solution_arguments.map((arg) => (
            <React.Fragment key={arg.name}>
              <div className="meta-name">--{arg.name}</div>
              <div className="meta-value">
                {arg.description} (default value: {arg.default_value})
              </div>
              <div className="break"></div>
            </React.Fragment>
          ))}
        </div>
      ) : (
        "No arguments"
      )}

      <h2>Usage instructions</h2>
      Please follow{" "}
      <a href={guideUrl}>this link</a> for details on how to install and run
      this solution.

      {getDocumentations(solution, solutionPath)}
    </>
  );
};

export default Solution;
