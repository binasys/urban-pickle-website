// Loads help.yaml (the file non-developers edit), checks it, and exposes
// the FAQ and policy content for the Help page.
// Templates use it as `help`, e.g. {{ help.general }}.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import * as yaml from "js-yaml";
import businessData from "./business.js";

const FILE = "src/_data/help.yaml";
const path = fileURLToPath(new URL("./help.yaml", import.meta.url));
const TOKEN = /\{\{\s*business\.([\w.]+)(\s*\|\s*escape)?\s*\}\}/g;

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

function get(obj, key) {
  return key.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function resolveTokens(text, business, label) {
  return text.replace(TOKEN, (match, key, filter) => {
    const value = get(business, key);
    if (value == null) {
      fail(`${label} refers to "business.${key}", which does not exist in business.yaml.`);
    }
    const string = String(value);
    return filter ? escapeHtml(string) : string;
  });
}

function checkFaqs(faqs, business) {
  if (!Array.isArray(faqs) || faqs.length === 0) {
    fail('"faqs" must list at least one question.');
  }
  faqs.forEach((faq, i) => {
    const where = `faqs[${i + 1}]`;
    if (!faq || typeof faq !== "object") {
      fail(`${where} must be a block with "question" and "answer".`);
    }
    requireText(faq.question, `${where} "question"`);
    requireText(faq.answer, `${where} "answer"`);
    faq.question = resolveTokens(faq.question, business, `${where} "question"`);
    faq.answer = resolveTokens(faq.answer, business, `${where} "answer"`);
  });
}

function validate(data, business) {
  if (!data || typeof data !== "object") fail("the file is empty.");
  checkFaqs(data.general, business);
  checkFaqs(data.bookings, business);
  checkFaqs(data.cancellations, business);
}

export default function () {
  const data = load();
  validate(data, businessData());
  // FAQPage structured data for Google, built from the same questions shown on the page.
  const plain = (html) =>
    html
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]+>/g, "")
      .replace(/↗/g, "")
      .replace(/\s+/g, " ")
      .trim();
  const all = [...data.general, ...data.bookings, ...data.cancellations];
  data.structuredDataJson = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: all.map((faq) => ({
      "@type": "Question",
      name: plain(faq.question),
      acceptedAnswer: { "@type": "Answer", text: plain(faq.answer) },
    })),
  }).replace(/</g, "\\u003c");
  return data;
}
