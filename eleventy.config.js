// Eleventy build: src/ (templates + assets) -> dist/ (plain static HTML/CSS/JS).
export default function (eleventyConfig) {
  // Assets are served exactly as written; no bundling or fingerprinting.
  eleventyConfig.addPassthroughCopy("src/assets");

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
