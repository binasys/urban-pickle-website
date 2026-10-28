// Eleventy build: src/ (templates + assets) -> dist/ (plain static HTML/CSS/JS).
export default function (eleventyConfig) {
  // Assets are served exactly as written; no bundling or fingerprinting.
  eleventyConfig.addPassthroughCopy("src/assets");
  // GitHub Pages: skip Jekyll processing. Add "src/CNAME" here too once the custom domain is live.
  eleventyConfig.addPassthroughCopy("src/.nojekyll");

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
