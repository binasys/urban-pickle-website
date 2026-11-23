// Loads privacy.yaml (the file non-developers edit), checks it, and exposes
// the privacy content for the Privacy page.
// Templates use it as `privacy`, e.g. {{ privacy.sections }}.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import * as yaml from "js-yaml";

const FILE = "src/_data/privacy.yaml";
const path = fileURLToPath(new URL("./privacy.yaml", import.meta.url));

function fail(message) {
  throw new Error(`\n\n  ${FILE}: ${message}\n`);
}

function load() {
  try {
    return yaml.load(readFileSync(path, "utf8"));
  } catch (err) {
    if (err.mark) {
      fail(
        `line ${err.mark.line + 1} has a formatting problem (${err.reason}). ` +
          "Check the spaces at the start of the line and quote values containing ':' or '#'.",
      );
    }
    throw err;
  }
}

function isText(value) {
  return typeof value === "string" && value.trim() !== "";
}

function requireText(value, label) {
  if (!isText(value)) fail(`${label} is missing or empty.`);
}

function checkSections(sections) {
  if (!Array.isArray(sections) || sections.length === 0) {
    fail('"sections" must list at least one section.');
  }
  sections.forEach((section, i) => {
    const where = `sections[${i + 1}]`;
    if (!section || typeof section !== "object") {
      fail(`${where} must be a block with a "heading".`);
    }
    requireText(section.heading, `${where} "heading"`);
    if (!Array.isArray(section.paragraphs) || section.paragraphs.length === 0) {
      fail(`${where} (${section.heading}) must have at least one paragraph.`);
    }
    section.paragraphs.forEach((text, j) => requireText(text, `${where} paragraph ${j + 1}`));
    if (section.items != null) {
      if (!Array.isArray(section.items)) fail(`${where} "items" must be a list.`);
      section.items.forEach((item, j) => requireText(item, `${where} item ${j + 1}`));
    }
    if (section.notes != null) {
      if (!Array.isArray(section.notes)) fail(`${where} "notes" must be a list.`);
      section.notes.forEach((note, j) => requireText(note, `${where} note ${j + 1}`));
    }
  });
}

function validate(data) {
  if (!data || typeof data !== "object") fail("the file is empty.");
  requireText(data.updated, '"updated"');
  requireText(data.intro, '"intro"');
  checkSections(data.sections);
}

export default function () {
  const data = load();
  validate(data);
  return data;
}
