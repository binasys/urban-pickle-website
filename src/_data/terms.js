// Loads terms.yaml (the file non-developers edit), checks it, and exposes
// the active campaigns for the Terms & Conditions page.
// Templates use it as `terms`, e.g. {{ terms.activeCampaigns }}.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import * as yaml from "js-yaml";

const FILE = "src/_data/terms.yaml";
const path = fileURLToPath(new URL("./terms.yaml", import.meta.url));

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

function checkSections(sections, label) {
  if (!Array.isArray(sections) || sections.length === 0) {
    fail(`${label} must list at least one section.`);
  }
  sections.forEach((section, i) => {
    const where = `${label}[${i + 1}]`;
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
  });
}

function validate(data) {
  if (!data || typeof data !== "object") fail("the file is empty.");
  requireText(data.updated, '"updated"');
  if (!data.generic || typeof data.generic !== "object") {
    fail('"generic" must be a block with "intro" and "sections".');
  }
  requireText(data.generic.intro, '"generic.intro"');
  checkSections(data.generic.sections, '"generic.sections"');

  if (!Array.isArray(data.campaigns)) {
    fail('"campaigns" must be a list. Use "campaigns: []" when no campaigns are running.');
  }
  const ids = new Set();
  data.campaigns.forEach((campaign, i) => {
    const where = `campaigns[${i + 1}]`;
    if (!campaign || typeof campaign !== "object") fail(`${where} must be a block.`);
    requireText(campaign.id, `${where} "id"`);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(campaign.id)) {
      fail(
        `${where} "id" must use lowercase letters, numbers and single hyphens, e.g. "year-end-league".`,
      );
    }
    if (ids.has(campaign.id)) {
      fail(`${where} "id" "${campaign.id}" is already used. Give each campaign a unique id.`);
    }
    ids.add(campaign.id);
    requireText(campaign.name, `${where} "name"`);
    requireText(campaign.period, `${where} "period"`);
    requireText(campaign.summary, `${where} "summary"`);
    if (typeof campaign.active !== "boolean") {
      fail(`${where} (${campaign.name}) "active" must be true or false.`);
    }
    checkSections(campaign.sections, `${where}.sections`);
  });
}

export default function () {
  const data = load();
  validate(data);
  const activeCampaigns = data.campaigns.filter((campaign) => campaign.active);
  return {
    ...data,
    activeCampaigns,
    hasActiveCampaigns: activeCampaigns.length > 0,
  };
}
