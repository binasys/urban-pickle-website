// Loads business.yaml (the file non-developers edit), checks it, and adds
// values worked out from it (links, "from" prices, booking hours).
// Templates use it as `business`, e.g. {{ business.phone }}.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import * as yaml from "js-yaml";

const FILE = "src/_data/business.yaml";
const path = fileURLToPath(new URL("./business.yaml", import.meta.url));

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

function get(obj, key) {
  return key.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

function requireText(data, key) {
  const v = get(data, key);
  if (typeof v !== "string" || v.trim() === "") fail(`"${key}" is missing or empty.`);
}

function requireNumber(data, key, { min = 0, max = Infinity } = {}) {
  const v = get(data, key);
  if (typeof v !== "number" || Number.isNaN(v)) {
    fail(
      `"${key}" must be a plain number (for example 50, not "RM50"). Found: ${JSON.stringify(v)}`,
    );
  }
  if (v < min || v > max) fail(`"${key}" must be between ${min} and ${max}. Found: ${v}`);
}

function validate(d) {
  if (!d || typeof d !== "object") fail("the file is empty.");
  [
    "name",
    "legalName",
    "description",
    "logo.wordmark",
    "logo.mark",
    "logo.favicon",
    "phone",
    "instagram",
    "bookingUrl",
    "address.street",
    "address.area",
    "address.city",
    "address.cityShort",
    "parking.name",
    "parking.link",
    "hours.label",
    "hours.days",
    "currency",
  ].forEach((k) => requireText(d, k));
  if (!/^\d{8,15}$/.test(String(d.whatsapp ?? ""))) {
    fail(`"whatsapp" must be digits only with country code, e.g. "60126002178".`);
  }
  requireNumber(d, "logo.wordmarkWidth", { min: 1 });
  requireNumber(d, "logo.wordmarkHeight", { min: 1 });
  requireNumber(d, "map.latitude", { min: -90, max: 90 });
  requireNumber(d, "map.longitude", { min: -180, max: 180 });
  requireNumber(d, "parking.price");
  requireNumber(d, "hours.openHour", { min: 0, max: 23 });
  requireNumber(d, "hours.closeHour", { min: 1, max: 24 });
  if (d.hours.closeHour <= d.hours.openHour)
    fail(`"hours.closeHour" must be after "hours.openHour".`);
  requireNumber(d, "extras.paddle");
  requireNumber(d, "extras.ball");
  requireNumber(d, "extras.maxPaddles", { min: 0, max: 20 });

  if (!Array.isArray(d.courtRates) || d.courtRates.length === 0) {
    fail(`"courtRates" must list at least one price row.`);
  }
  d.courtRates.forEach((r, i) => {
    const p = `courtRates[${i + 1}]`;
    requireText({ r }, "r.days");
    requireText({ r }, "r.times");
    if (!["weekday", "weekend"].includes(r.dayType)) {
      fail(`${p} (${r.days} ${r.times}): "dayType" must be weekday or weekend.`);
    }
    ["fromHour", "toHour"].forEach((k) => requireNumber({ r }, `r.${k}`, { min: 0, max: 24 }));
    ["covered", "open", "machine"].forEach((k) => {
      if (typeof r[k] !== "number") {
        fail(
          `${p} (${r.days} ${r.times}): "${k}" must be a plain number. Found: ${JSON.stringify(r[k])}`,
        );
      }
    });
  });

  // The booking calculator needs a price for every bookable hour.
  for (const dayType of ["weekday", "weekend"]) {
    for (let h = d.hours.openHour; h < d.hours.closeHour; h++) {
      if (!d.courtRates.some((r) => r.dayType === dayType && r.fromHour <= h && h < r.toHour)) {
        fail(`no ${dayType} price covers ${h}:00. Check "fromHour"/"toHour" in courtRates.`);
      }
    }
  }
}

export default function () {
  const d = load();
  validate(d);
  const { latitude: lat, longitude: lng } = d.map;
  const min = (k) => Math.min(...d.courtRates.map((r) => r[k]));
  return {
    ...d,
    phoneHref: "tel:" + d.phone.replace(/[^\d+]/g, ""),
    whatsappUrl: `https://wa.me/${d.whatsapp}`,
    mapsDirectionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
    wazeUrl: `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`,
    mapEmbedUrl: `https://www.google.com/maps?q=${lat},${lng}&z=16&output=embed`,
    addressLine: `${d.address.street}, ${d.address.area}, ${d.address.city}`,
    hoursLine: `${d.hours.label}, ${d.hours.days}`,
    // Covered weekday price at opening time: the booking page's default estimate.
    openingCoveredRate: d.courtRates.find(
      (r) =>
        r.dayType === "weekday" && r.fromHour <= d.hours.openHour && d.hours.openHour < r.toHour,
    ).covered,
    fromPrice: { covered: min("covered"), open: min("open"), machine: min("machine") },
    bookingStartHours: Array.from(
      { length: d.hours.closeHour - d.hours.openHour },
      (_, i) => d.hours.openHour + i,
    ),
    // Handed to the booking calculator in site.js.
    pricingForScript: {
      currency: d.currency,
      closeHour: d.hours.closeHour,
      rates: d.courtRates.map(({ dayType, fromHour, toHour, covered, open, machine }) => ({
        dayType,
        fromHour,
        toHour,
        covered,
        open,
        machine,
      })),
      paddle: d.extras.paddle,
      ball: d.extras.ball,
    },
  };
}
