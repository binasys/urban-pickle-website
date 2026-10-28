(() => {
  const closeMenu = () => {
    document.getElementById("mobile-nav").hidden = true;
    document.getElementById("menu-toggle").setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  };
  document.getElementById("menu-toggle").addEventListener("click", () => {
    const open = document.getElementById("mobile-nav").hidden;
    document.getElementById("mobile-nav").hidden = !open;
    document.getElementById("menu-toggle").setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("menu-open", open);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
  document.getElementById("year").textContent = new Date().getFullYear();
  if (document.body.dataset.page === "book") {
    // Prices come from src/_data/business.yaml, injected by the page layout.
    const PRICING = window.__UP_PRICING__;
    const money = (n) => PRICING.currency + " " + Number(n).toFixed(0);
    function bookingData() {
      const type = document.getElementById("court-type").value,
        day = document.getElementById("day-type").value,
        start = Number(document.getElementById("start-hour").value),
        duration = Number(document.getElementById("duration").value),
        paddles = Number(document.getElementById("paddles").value);
      let courtTotal = 0;
      for (let h = start; h < start + duration; h++) {
        const rate = PRICING.rates.find(
          (r) => r.dayType === day && r.fromHour <= h && h < r.toHour,
        );
        courtTotal += rate ? rate[type] : 0;
      }
      return {
        type,
        day,
        start,
        duration,
        paddles,
        courtTotal,
        total: courtTotal + paddles * PRICING.paddle,
        valid: start + duration <= PRICING.closeHour,
      };
    }
    function updateBooking() {
      const b = bookingData();
      document.getElementById("order-details").innerHTML =
        `<div class="summary-row"><span>Court</span><span>${{ covered: "Covered", open: "Open", machine: "Covered + ball machine" }[b.type]}</span></div><div class="summary-row"><span>Day</span><span>${b.day === "weekend" ? "Weekend / public holiday" : "Monday–Friday"}</span></div><div class="summary-row"><span>Start / duration</span><span>${b.start}:00 · ${b.duration} hr</span></div><div class="summary-row"><span>Court hire</span><span>${b.valid ? money(b.courtTotal) : "Outside opening hours"}</span></div><div class="summary-row"><span>Paddles at counter</span><span>${b.paddles ? money(b.paddles * PRICING.paddle) : "Own equipment"}</span></div>`;
      document.getElementById("order-total").textContent = b.valid ? money(b.total) : "—";
      document.getElementById("order-note").textContent = b.valid
        ? ""
        : "Sessions end at midnight. Choose a shorter duration.";
    }
    ["court-type", "day-type", "start-hour", "duration", "paddles"].forEach((id) =>
      document.getElementById(id).addEventListener("change", updateBooking),
    );
    updateBooking();
  }
})();
