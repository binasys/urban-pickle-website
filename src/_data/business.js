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
    "siteUrl",
    "description",
    "logo.wordmark",
    "logo.mark",
    "logo.favicon",
    "phone",
    "email",
    "instagram",
    "bookingUrl",
    "whatsappCommunityUrl",
    "address.unit",
    "address.street",
    "address.area",
    "address.postcode",
    "address.state",
    "address.city",
    "address.cityShort",
    "parking.name",
    "parking.link",
    "hours.label",
    "hours.days",
    "currency",
  ].forEach((k) => requireText(d, k));
  if (!/^https?:\/\/[^/]+/.test(d.siteUrl)) {
    fail(`"siteUrl" must be a full http(s) URL, e.g. "https://urbanpickle.com.my".`);
  }
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
  requireNumber(d, "courts.total", { min: 1 });
  requireNumber(d, "courts.openAir");
  requireNumber(d, "courts.covered");
  if (d.courts.openAir + d.courts.covered !== d.courts.total) {
    fail(`"courts.openAir" plus "courts.covered" must equal "courts.total".`);
  }
  requireNumber(d, "extras.paddle");
  requireNumber(d, "extras.ball");
  requireNumber(d, "extras.ballPack");
  requireNumber(d, "extras.ballMachine");
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
    ["covered", "open"].forEach((k) => {
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
  const siteUrl = d.siteUrl.replace(/\/+$/, "");
  const { latitude: lat, longitude: lng } = d.map;
  const min = (k) => Math.min(...d.courtRates.map((r) => r[k]));
  const max = (k) => Math.max(...d.courtRates.map((r) => r[k]));
  const padHour = (h) => String(h).padStart(2, "0") + ":00";
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: `${siteUrl}/`,
        name: d.name,
        alternateName: [`${d.name} KL`, `${d.name} ${d.address.city}`],
        publisher: { "@id": `${siteUrl}/#organization` },
      },
      {
        "@type": "SportsActivityLocation",
        "@id": `${siteUrl}/#organization`,
        name: d.name,
        legalName: d.legalName,
        description: d.description,
        url: `${siteUrl}/`,
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/assets/icons/icon-192.png`,
          width: 192,
          height: 192,
        },
        image: `${siteUrl}/assets/images/courts.webp`,
        telephone: d.phone,
        email: d.email,
        sport: "Pickleball",
        hasMap: `https://www.google.com/maps?q=${lat},${lng}`,
        areaServed: { "@type": "City", name: d.address.city },
        amenityFeature: [
          `${d.courts.covered} covered pickleball courts`,
          `${d.courts.openAir} open-air pickleball courts`,
          "Ball machine hire",
          "Paddle rental",
          "Coaching",
          "Changing rooms and showers",
          "Cafe (Haven Club Cafe)",
          "Parking",
          "AED on site",
          "Pet-friendly",
        ].map((name) => ({ "@type": "LocationFeatureSpecification", name, value: true })),
        priceRange: `${d.currency}${min("open")}–${d.currency}${max("covered")}`,
        address: {
          "@type": "PostalAddress",
          streetAddress: `${d.address.unit}, off ${d.address.street}, ${d.address.area}`,
          addressLocality: d.address.city,
          postalCode: String(d.address.postcode),
          addressRegion: d.address.state,
          addressCountry: "MY",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: lat,
          longitude: lng,
        },
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ],
            opens: padHour(d.hours.openHour),
            closes: d.hours.closeHour === 24 ? "23:59" : padHour(d.hours.closeHour),
          },
        ],
        sameAs: [d.instagram, d.bookingUrl],
      },
    ],
  };
  return {
    ...d,
    siteUrl,
    structuredDataJson: JSON.stringify(structuredData),
    phoneHref: "tel:" + d.phone.replace(/[^\d+]/g, ""),
    emailHref: "mailto:" + d.email,
    whatsappUrl: `https://wa.me/${d.whatsapp}`,
    mapsDirectionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
    wazeUrl: `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`,
    mapEmbedUrl: `https://www.google.com/maps?q=${lat},${lng}&z=16&output=embed`,
    addressLine: `${d.address.unit}, off ${d.address.street}, ${d.address.postcode} ${d.address.city}`,
    hoursLine: `${d.hours.label}, ${d.hours.days}`,
    // Covered weekday price at opening time: the booking page's default estimate.
    openingCoveredRate: d.courtRates.find(
      (r) =>
        r.dayType === "weekday" && r.fromHour <= d.hours.openHour && d.hours.openHour < r.toHour,
    ).covered,
    fromPrice: { covered: min("covered"), open: min("open") },
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
      })),
      paddle: d.extras.paddle,
      ball: d.extras.ball,
      ballPack: d.extras.ballPack,
      ballMachine: d.extras.ballMachine,
    },
  };
}
