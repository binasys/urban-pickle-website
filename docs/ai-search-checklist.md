# Getting Urban Pickle into AI and local search

AI assistants (ChatGPT, Perplexity, Gemini, Google AI Overviews, Siri) answer "pickleball courts in
KL" mostly from **search indexes (Google, Bing)**, **map listings (Google, Apple, Bing)** and **what
other websites and reviewers say**. The website is already set up for this (see the end of this
document). Most of the remaining work happens off the site.

The golden rule: use **exactly the same name, address, phone and hours everywhere**:

- Name: Urban Pickle
- Address: Lot 140, Jalan 2/68F, off Jalan Tun Razak, 50400 Kuala Lumpur
- Phone: +60 12-600 2178
- Hours: 7am – midnight, every day
- Website: https://urbanpickle.com.my

If any of these change, update `src/_data/business.yaml` and every listing below.

## 1. Do once (about half a day)

- [ ] **Google Business Profile** (business.google.com)
  - [ ] Claim and verify the listing.
  - [ ] Primary category: "Pickleball court" (or "Sports complex" if unavailable). Add "Sports club"
        as a secondary category.
  - [ ] Name, address, phone and hours exactly as above. Website: `https://urbanpickle.com.my`.
  - [ ] Booking link: the Courtsite URL.
  - [ ] Description: one plain factual paragraph, e.g. "10 pickleball courts (6 covered, 4
        open-air) off Jalan Tun Razak, KL. Paddle rental, ball machine, coaching, showers and Haven
        Club Cafe. Open 7am–midnight daily."
  - [ ] Attributes: covered courts, showers, wheelchair access (if true), pet-friendly, parking.
  - [ ] Upload 15+ real photos: courts day and night, covered area, café, entrance, parking.
- [ ] **Google Search Console** (search.google.com/search-console): add `urbanpickle.com.my`,
      submit `https://urbanpickle.com.my/sitemap.xml`.
- [ ] **Bing Webmaster Tools** (bing.com/webmasters): import from Search Console, submit the
      sitemap. ChatGPT search relies heavily on Bing.
- [ ] **Bing Places** (bingplaces.com): import from Google Business Profile.
- [ ] **Apple Business Connect** (businessconnect.apple.com): claim the place card (Apple Maps and
      Siri).
- [ ] **Waze**: check the pin and name are correct.
- [ ] **Instagram bio**: "Pickleball courts · off Jalan Tun Razak, KL · 7am–midnight" plus the
      website link.

## 2. Directories and listings

Check or create a listing on each. Same details everywhere.

- [ ] Courtsite (already listed; check the description and photos)
- [ ] Pickleheads (pickleheads.com) court finder
- [ ] Places2Play (places2play.org)
- [ ] Facebook page (with address, hours and website)
- [ ] TripAdvisor (Things to do → Sports)
- [ ] Foursquare
- [ ] Malaysian pickleball association / community club listings

## 3. Ongoing (monthly)

- [ ] **Reviews**: ask happy players for Google reviews, e.g. with a QR code at the counter or a
      WhatsApp message after a session. Reviews that mention specifics ("covered courts", "good
      for beginners", "near KLCC") help most. Reply to every review.
- [ ] **Google Business Profile posts**: one post a week (open play, events, new gear, holiday
      hours).
- [ ] **Press and blog mentions**: pitch "best pickleball courts in KL" and "things to do in KL"
      writers: TimeOut KL, SAYS, Lifestyle Asia, The Smart Local, KL food and lifestyle bloggers.
      AI tools cite these round-up articles often.
- [ ] **Communities**: be helpful (not spammy) in pickleball Facebook groups and Reddit
      (r/malaysia, r/kualalumpur) when people ask where to play.
- [ ] **Check how AI sees you**: ask ChatGPT, Perplexity and Gemini "pickleball courts in KL",
      "covered pickleball court Kuala Lumpur" and "where to play pickleball near KLCC". Note whether
      Urban Pickle appears and whether the facts are right. Fix the source listing if not.

## What the website already does

- `robots.txt` allows all crawlers, including AI search crawlers.
- `llms.txt` gives AI tools a plain summary of key facts, generated from `business.yaml`.
- Structured data: business details, address, hours, prices and amenities on the homepage; FAQs on
  the Help page; breadcrumbs on other pages.
- Plain factual intro lines on the Courts and Pricing pages.
- IndexNow: every deploy pings Bing/IndexNow so changes are picked up quickly (key file in `src/`,
  step in `.github/workflows/deploy.yml`).
- Sitemap at `/sitemap.xml`.
