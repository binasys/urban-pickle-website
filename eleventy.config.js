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
  // Business info (prices, phone, hours…) lives in this YAML file, loaded by src/_data/business.js.
  eleventyConfig.addWatchTarget("src/_data/business.yaml");

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
