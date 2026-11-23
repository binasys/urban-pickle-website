import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { transform } from "lightningcss";

// Eleventy build: src/ (templates + assets) -> dist/ (plain static HTML/CSS/JS).
export default function (eleventyConfig) {
  // Assets are served exactly as written; no bundling or fingerprinting.
  eleventyConfig.addPassthroughCopy("src/assets");
  // GitHub Pages: skip Jekyll processing.
  eleventyConfig.addPassthroughCopy("src/.nojekyll");
  // Custom domain.
  eleventyConfig.addPassthroughCopy("src/CNAME");
  // Root favicon for Google Search and browsers requesting /favicon.ico.
  eleventyConfig.addPassthroughCopy("src/favicon.ico");
  // IndexNow key file (lets Bing/ChatGPT search know when pages change; see deploy.yml).
  eleventyConfig.addPassthroughCopy("src/42518ffbf9294b8190bcf519e5adcbd4.txt");
  // Business info (prices, phone, hours…) lives in this YAML file, loaded by src/_data/business.js.
  eleventyConfig.addWatchTarget("src/_data/business.yaml");

  // Nav label for a page id (used for breadcrumb structured data), with a fallback.
  eleventyConfig.addFilter(
    "navLabel",
    (id, nav, fallback) => nav.find((item) => item.id === id)?.label ?? fallback,
  );

  // Minify the copied stylesheet in dist/ after each build. src/ stays readable.
  // (During `npm start` passthrough files are served from src/, so this is a no-op there.)
  eleventyConfig.on("eleventy.after", ({ dir }) => {
    const file = `${dir.output}/assets/css/site.css`;
    if (!existsSync(file)) return;
    const { code } = transform({ filename: file, code: readFileSync(file), minify: true });
    writeFileSync(file, code);
  });

  return {
    dir: {
      input: "src",
      output: "dist",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["html", "njk"],
    htmlTemplateEngine: "njk",
  };
}
