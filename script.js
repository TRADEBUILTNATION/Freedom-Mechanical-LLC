(() => {
  const yearEl = document.getElementById("legal-year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // ---- Booking email (free + no backend) ----
  // This site is static (no server), so we submit the completed booking details to FormSubmit,
  // which forwards the submission to your email address.
  //
  // 1) Replace the email below with YOUR business email.
  // 2) Run through one booking — FormSubmit will send you a confirmation email; click "Confirm".
  // 3) After that, every completed booking will be emailed automatically.
  const BOOKING_EMAIL_TO = "freedommechanicalcompany@gmail.com";
  const BOOKING_EMAIL_SUBJECT = "New Online Booking";

  // Favicon: browsers render favicons in a square. If we "contain" a very wide logo, it looks tiny.
  // To make it *appear bigger* while still using the same source image, generate a square crop.
  // (The browser still controls actual display size in the tab.)
  const setSquareFaviconFromLogo = (src) => {
    const iconLink =
      document.getElementById("site-favicon") ||
      document.querySelector('link[rel="icon"]');
    const shortcutLink =
      document.getElementById("site-favicon-shortcut") ||
      document.querySelector('link[rel="shortcut icon"]');

    if (!iconLink && !shortcutLink) return;

    const img = new Image();
    img.decoding = "async";
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Use a larger canvas so the downscaled favicon stays crisp on HiDPI displays.
      const size = 128;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, size, size);

      // Crop a square from the top-left of the image and scale it into the favicon square.
      // Add a bit of padding so it doesn't feel "too big" in the browser tab UI.
      const cropSize = Math.min(img.width, img.height);
      const sx = 0;
      const sy = 0;
      const pad = Math.round(size * 0.11); // ~11% padding on each side
      const target = size - pad * 2;
      ctx.drawImage(img, sx, sy, cropSize, cropSize, pad, pad, target, target);

      const dataUrl = canvas.toDataURL("image/png");
      if (iconLink) iconLink.setAttribute("href", dataUrl);
      if (shortcutLink) shortcutLink.setAttribute("href", dataUrl);
    };
    img.onerror = () => {
      // Keep the static PNG fallback from <head> if anything fails.
    };

    // Cache-bust so changes show up immediately.
    img.src = `${src}${src.includes("?") ? "&" : "?"}v=4`;
  };

  setSquareFaviconFromLogo("./Assets/Flag%20Icon.png");

  const body = document.body;
  const header = document.querySelector(".site-header");
  const nav = document.getElementById("site-nav");
  const toggle = document.querySelector(".nav-toggle");
  const backdrop = document.querySelector(".nav-backdrop");
  const modalOverlay = document.getElementById("modal");
  const modalTitle = document.getElementById("modal-title");
  const modalBody = document.getElementById("modal-desc");

  if (!header || !nav || !toggle || !backdrop) return;

  const isModalOpen = () => body.dataset.modalOpen === "true";
  const isNavOpen = () => body.dataset.navOpen === "true";
  const updateScrollLock = () => {
    const shouldLock = isNavOpen() || isModalOpen();
    body.style.overflow = shouldLock ? "hidden" : "";
  };

  const setOpen = (isOpen) => {
    body.dataset.navOpen = isOpen ? "true" : "false";
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    toggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    backdrop.hidden = !isOpen;
    updateScrollLock();
  };

  const close = () => setOpen(false);
  const open = () => setOpen(true);
  const toggleOpen = () => (isNavOpen() ? close() : open());

  toggle.addEventListener("click", toggleOpen);
  backdrop.addEventListener("click", close);

  // Close the menu when a nav link is clicked (especially on mobile).
  nav.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    close();
  });

  // Close on Escape.
  window.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    // Prefer closing the modal first (if open), then the nav.
    if (isModalOpen()) return;
    close();
  });

  // Elevate header on scroll for a premium feel.
  const updateElevated = () => {
    const elevated = window.scrollY > 8;
    header.dataset.elevates = elevated ? "true" : "false";
  };
  updateElevated();
  window.addEventListener("scroll", updateElevated, { passive: true });

  // Ensure menu closes when resizing from mobile to desktop.
  const mq = window.matchMedia("(max-width: 860px)");
  mq.addEventListener?.("change", (e) => {
    if (!e.matches) close();
  });

  // Keep the browser tab title in the format: "(Page) | Freedom Mechanical LLC".
  const baseTitle = "Freedom Mechanical LLC";
  const navLinks = Array.from(nav.querySelectorAll("a.nav-link"));
  const pageTitleFromHash = (hash) => {
    const id = (hash || "")
      .replace(/^#/, "")
      .trim()
      .toLowerCase();

    const map = {
      "": "Home",
      home: "Home",
      services: "Services",
      shop: "Shop",
      contact: "Contact",
      schedule: "Schedule",
    };

    if (map[id]) return map[id];
    // Fallback: turn "some-page" into "Some Page"
    return id
      ? id
          .split(/[-_]+/g)
          .filter(Boolean)
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
      : "Home";
  };

  const updateTitle = () => {
    const page = pageTitleFromHash(window.location.hash);
    document.title = `${page} | ${baseTitle}`;
  };

  const updateActiveNav = () => {
    const currentHash = window.location.hash || "#home";
    for (const link of navLinks) {
      const href = link.getAttribute("href") || "";
      if (href === currentHash) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    }
  };

  // Set the active state on click immediately for snappy UI.
  nav.addEventListener("click", (e) => {
    const link = e.target.closest("a.nav-link");
    if (!link) return;
    const href = link.getAttribute("href");
    if (!href || !href.startsWith("#")) return;
    // Update immediately for snappy UI (also covers same-hash clicks).
    const page = pageTitleFromHash(href);
    document.title = `${page} | ${baseTitle}`;
    for (const a of navLinks) {
      const aHref = a.getAttribute("href") || "";
      if (aHref === href) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    }
  });

  updateTitle();
  updateActiveNav();
  window.addEventListener("hashchange", updateTitle, { passive: true });
  window.addEventListener("hashchange", updateActiveNav, { passive: true });

  // ---- Modal (Schedule + Online Service) ----
  if (!modalOverlay || !modalTitle || !modalBody) return;

  const MODAL_CONTENT = {
    schedule: {
      title: "Schedule Online",
      body: `
        <p><strong>Schedule service without leaving this page.</strong></p>
        <p>If you already have a booking link (Calendly, Housecall Pro, etc.), we can embed it here.</p>
        <div class="modal-actions">
          <a class="cta" href="tel:+15864804864">Call (586) 480-4864</a>
          <a class="ghost" href="#contact">Request a callback</a>
        </div>
      `,
    },
    "online-service": {
      title: "Online Service",
      body: `
        <p><strong>Start an online service request.</strong></p>
        <p>Tell us what’s going on and we’ll get you taken care of.</p>
        <div class="modal-actions">
          <a class="cta" href="#contact">Open service request</a>
          <a class="ghost" href="tel:+15864804864">Call now</a>
        </div>
      `,
    },
  };

  let lastFocusedEl = null;
  let closeTimer = null;
  let splashTimer = null;
  let splashTimer2 = null;
  let currentModalKey = "schedule";
  let lead = { name: "", phone: "", email: "" };
  let systemType = "";
  let systemEquipmentType = "";
  let serviceType = "";
  let address = { street: "", city: "", state: "", zip: "" };
  let returnToReview = false;
  let editMode = null; // "lead" | "system" | "service" | "address" | null
  let additional = { details: "", photos: [] }; // photos are optional; details required
  let schedule = { date: "", startMin: null, endMin: null }; // 4-hour block
  let bookingEmailSent = false;

  // Splash timing
  const SPLASH_MS = 1850; // 1s faster than before (2850ms)
  // Keep the "final details" splash aligned so all icons get equal time too.
  const FINAL_SPLASH_MS = SPLASH_MS;

  const captureLeadDraft = (form) => {
    if (!form) return;
    lead = {
      name: (form.querySelector("#lead-name")?.value || lead.name || "").trim(),
      phone: (form.querySelector("#lead-phone")?.value || lead.phone || "").trim(),
      email: (form.querySelector("#lead-email")?.value || lead.email || "").trim(),
    };
  };

  const captureSystemDraft = (form) => {
    if (!form) return;
    const selected = form.querySelector('input[name="systemType"]:checked');
    if (selected) systemType = String(selected.value || systemType || "").trim();
    const heatSel = form.querySelector("#equip-heat");
    const coolSel = form.querySelector("#equip-cool");
    const activeSel = systemType === "Heating System" ? heatSel : coolSel;
    const equip = (activeSel?.value || "").trim();
    if (equip) systemEquipmentType = equip;
  };

  const captureServiceDraft = (form) => {
    if (!form) return;
    const selected = form.querySelector('input[name="serviceType"]:checked');
    if (selected) serviceType = String(selected.value || serviceType || "").trim();
  };

  const captureAddressDraft = (form) => {
    if (!form) return;
    address = {
      street: (form.querySelector("#addr-street")?.value || address.street || "").trim(),
      city: (form.querySelector("#addr-city")?.value || address.city || "").trim(),
      state: (form.querySelector("#addr-state")?.value || address.state || "").trim(),
      zip: (form.querySelector("#addr-zip")?.value || address.zip || "").trim(),
    };
  };

  const getFocusable = (root) =>
    Array.from(
      root.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => el.getClientRects().length > 0);

  const trapTabKey = (e) => {
    if (e.key !== "Tab") return;
    const focusable = getFocusable(modalOverlay);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (e.shiftKey) {
      if (active === first || active === modalOverlay) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (active === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  const setInvalid = (el, invalid) => {
    if (!el) return;
    if (invalid) el.setAttribute("aria-invalid", "true");
    else el.removeAttribute("aria-invalid");
  };

  const escapeHtml = (value) =>
    String(value).replace(/[&<>"']/g, (ch) => {
      const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
      return map[ch] || ch;
    });

  const formatBytes = (bytes) => {
    const n = Number(bytes || 0);
    if (!Number.isFinite(n) || n <= 0) return "0 KB";
    const units = ["B", "KB", "MB", "GB"];
    const idx = Math.min(units.length - 1, Math.floor(Math.log(n) / Math.log(1024)));
    const val = n / 1024 ** idx;
    return `${val >= 10 || idx === 0 ? Math.round(val) : val.toFixed(1)} ${units[idx]}`;
  };

  const pad2 = (n) => String(n).padStart(2, "0");

  const formatTime = (mins) => {
    const m = Number(mins);
    if (!Number.isFinite(m)) return "";
    const h24 = Math.floor(m / 60);
    const mm = m % 60;
    const ampm = h24 >= 12 ? "PM" : "AM";
    const h12 = ((h24 + 11) % 12) + 1;
    return `${h12}:${pad2(mm)} ${ampm}`;
  };

  const yyyyMmDd = (d) => {
    const y = d.getFullYear();
    const m = pad2(d.getMonth() + 1);
    const day = pad2(d.getDate());
    return `${y}-${m}-${day}`;
  };

  const formatDateLong = (dateStr) => {
    try {
      const d = new Date(`${dateStr}T00:00:00`);
      return d.toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr || "";
    }
  };

  const buildBookingSummary = () => {
    const dateText = schedule.date ? formatDateLong(schedule.date) : "";
    const timeText =
      schedule.startMin != null && schedule.endMin != null
        ? `${formatTime(schedule.startMin)} – ${formatTime(schedule.endMin)}`
        : "";

    const photoList =
      additional.photos?.length > 0
        ? additional.photos
            .map((f) => `${f.name} (${formatBytes(f.size)})`)
            .join("\n")
        : "None";

    return [
      "New online booking request",
      "",
      "CONTACT",
      `Name: ${lead.name}`,
      `Phone: ${lead.phone}`,
      `Email: ${lead.email}`,
      "",
      "ADDRESS",
      `Street: ${address.street}`,
      `City: ${address.city}`,
      `State: ${address.state}`,
      `ZIP: ${address.zip}`,
      "",
      "SERVICE",
      `Service type: ${serviceType}`,
      `System type: ${systemType}`,
      `Equipment: ${systemEquipmentType}`,
      "",
      "DETAILS",
      additional.details || "(none)",
      "",
      "PHOTOS (names only)",
      photoList,
      "",
      "SCHEDULE",
      `${dateText}${dateText && timeText ? " • " : ""}${timeText}`,
    ].join("\n");
  };

  let bookingEmailStatus = { state: "idle", message: "" }; // idle | skipped | sending | sent | failed
  const updateBookingEmailStatusUI = () => {
    const el = modalOverlay?.querySelector?.("[data-booking-email-status]");
    if (!el) return;

    const to = (BOOKING_EMAIL_TO || "").trim();
    const base = to ? `Email notification: ${to}` : "Email notification";

    if (bookingEmailStatus.state === "sending") {
      el.textContent = `${base} (sending…)`;
      return;
    }
    if (bookingEmailStatus.state === "sent") {
      el.textContent = `${base} (sent)`;
      return;
    }
    if (bookingEmailStatus.state === "skipped") {
      el.textContent = `${base} (not sent — ${bookingEmailStatus.message || "not configured"})`;
      return;
    }
    if (bookingEmailStatus.state === "failed") {
      el.textContent = `${base} (failed — ${bookingEmailStatus.message || "blocked"})`;
      return;
    }

    el.textContent = `${base} (pending)`;
  };

  const ensureBookingEmailForm = () => {
    const existing = document.getElementById("booking-email-form");
    if (existing) return existing;

    // Hidden iframe prevents navigation away from the page.
    const iframe = document.createElement("iframe");
    iframe.name = "booking-email-target";
    iframe.title = "booking-email-target";
    iframe.hidden = true;
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    const form = document.createElement("form");
    form.id = "booking-email-form";
    form.method = "POST";
    form.target = iframe.name;

    // We'll set form.action dynamically right before submitting (so the email address can be changed).

    // Human-friendly fields (these appear in the email).
    const fields = [
      ["customer_name", ""],
      ["customer_phone", ""],
      ["customer_email", ""],
      ["service_type", ""],
      ["system_type", ""],
      ["equipment_type", ""],
      ["address_street", ""],
      ["address_city", ""],
      ["address_state", ""],
      ["address_zip", ""],
      ["schedule_date", ""],
      ["schedule_time_window", ""],
      ["details", ""],
      ["photos", ""],
      ["summary", ""],

      // FormSubmit controls
      ["_subject", BOOKING_EMAIL_SUBJECT],
      ["_captcha", "false"],
      // Honeypot (bots fill this; humans won't)
      ["_honey", ""],
    ];

    for (const [name, value] of fields) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      form.appendChild(input);
    }

    document.body.appendChild(form);
    return form;
  };

  const setHidden = (form, name, value) => {
    let input = form.querySelector(`input[name="${CSS.escape(name)}"]`);
    if (!input) {
      input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      form.appendChild(input);
    }
    input.value = String(value ?? "");
  };

  const sendBookingEmail = async () => {
    const to = (BOOKING_EMAIL_TO || "").trim();

    if (!to || to.includes("YOUR_EMAIL_HERE")) {
      bookingEmailStatus = { state: "skipped", message: "not configured" };
      updateBookingEmailStatusUI();
      return { ok: false, skipped: true };
    }
    if (bookingEmailSent) return { ok: true, skipped: true };

    bookingEmailStatus = { state: "sending", message: "" };
    updateBookingEmailStatusUI();

    const dateText = schedule.date ? formatDateLong(schedule.date) : "";
    const timeText =
      schedule.startMin != null && schedule.endMin != null
        ? `${formatTime(schedule.startMin)} – ${formatTime(schedule.endMin)}`
        : "";

    const photosText =
      additional.photos?.length > 0
        ? additional.photos.map((f) => `${f.name} (${formatBytes(f.size)})`).join(", ")
        : "None";

    const payload = {
      customer_name: lead.name,
      customer_phone: lead.phone,
      customer_email: lead.email,
      service_type: serviceType,
      system_type: systemType,
      equipment_type: systemEquipmentType,
      address_street: address.street,
      address_city: address.city,
      address_state: address.state,
      address_zip: address.zip,
      schedule_date: dateText,
      schedule_time_window: timeText,
      details: additional.details,
      photos: photosText,
      summary: buildBookingSummary(),
      _subject: BOOKING_EMAIL_SUBJECT,
      _captcha: "false",
      _honey: "",
    };

    // Prefer FormSubmit AJAX endpoint so we can detect success/failure.
    // If CORS or a blocker prevents fetch, fall back to a hidden form POST.
    try {
      const body = new URLSearchParams();
      for (const [k, v] of Object.entries(payload)) body.set(k, String(v ?? ""));

      const res = await fetch(`https://formsubmit.co/ajax/${to}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `HTTP ${res.status}`);
      }

      bookingEmailSent = true;
      bookingEmailStatus = { state: "sent", message: "" };
      updateBookingEmailStatusUI();
      return { ok: true };
    } catch (err) {
      // Fallback: hidden form submission.
      try {
        const form = ensureBookingEmailForm();
        form.action = `https://formsubmit.co/${to}`;

        for (const [k, v] of Object.entries(payload)) setHidden(form, k, v);
        form.submit();

        bookingEmailSent = true;
        bookingEmailStatus = {
          state: "sent",
          message:
            "If this is your first time, check your inbox/spam for a FormSubmit confirmation email and click Confirm.",
        };
        updateBookingEmailStatusUI();
        return { ok: true, fallback: true };
      } catch {
        bookingEmailStatus = {
          state: "failed",
          message:
            "Check spam for FormSubmit activation, and disable ad/tracker blockers for this page.",
        };
        updateBookingEmailStatusUI();
        console.error("Booking email send failed:", err);
        return { ok: false };
      }
    }
  };

  const businessHoursForDate = (dateStr) => {
    // dateStr is YYYY-MM-DD
    const d = new Date(`${dateStr}T00:00:00`);
    const day = d.getDay(); // 0 Sun .. 6 Sat

    // Sunday closed
    if (day === 0) return null;

    // Saturday: 9:00am - 2:00pm
    if (day === 6) return { open: 9 * 60, close: 14 * 60 };

    // Mon-Fri: 8:30am - 6:00pm
    return { open: 8 * 60 + 30, close: 18 * 60 };
  };

  const generateFourHourBlocks = (hours) => {
    const blocks = [];
    const duration = 4 * 60;
    const step = 30; // 30-minute increments
    const lastStart = hours.close - duration;
    for (let start = hours.open; start <= lastStart; start += step) {
      blocks.push({ start, end: start + duration });
    }
    return blocks;
  };

  const leadStepHtml = () => `
    <form class="modal-form" data-lead-form>
      <p class="modal-lede">
        <strong>Please follow the steps and provide your information accurately.</strong>
      </p>

      <div class="field">
        <label class="label" for="lead-name">
          First &amp; Last Name <span class="req" aria-hidden="true">*</span
          ><span class="sr-only"> (required)</span>
        </label>
        <input
          class="input"
          id="lead-name"
          name="name"
          type="text"
          autocomplete="name"
          required
          value="${escapeHtml(lead.name)}"
          placeholder="John Smith"
        />
      </div>

      <div class="field">
        <label class="label" for="lead-phone">
          Phone Number <span class="req" aria-hidden="true">*</span
          ><span class="sr-only"> (required)</span>
        </label>
        <input
          class="input"
          id="lead-phone"
          name="phone"
          type="tel"
          autocomplete="tel"
          required
          value="${escapeHtml(lead.phone)}"
          placeholder="(586) 480-4864"
        />
      </div>

      <div class="field">
        <label class="label" for="lead-email">
          Email Address <span class="req" aria-hidden="true">*</span
          ><span class="sr-only"> (required)</span>
        </label>
        <input
          class="input"
          id="lead-email"
          name="email"
          type="email"
          autocomplete="email"
          required
          value="${escapeHtml(lead.email)}"
          placeholder="you@example.com"
        />
      </div>

      <p class="form-error" data-form-error hidden></p>

      <div class="modal-actions">
        <button class="cta" type="submit">${returnToReview && editMode === "lead" ? "Save" : "Next"}</button>
      </div>
    </form>
  `;

  const splashStepHtml = () => `
    <div class="modal-splash" role="status" aria-live="polite">
      <div class="splash-stage" aria-hidden="true">
        <i class="fa-solid fa-fire-flame-curved splash-ico splash-ico-flame" aria-hidden="true"></i>
        <i class="fa-regular fa-snowflake splash-ico splash-ico-snow" aria-hidden="true"></i>
        <i class="fa-solid fa-fan splash-ico splash-ico-vent" aria-hidden="true"></i>
        <i class="fa-solid fa-wind splash-ico splash-ico-air" aria-hidden="true"></i>
      </div>
      <p class="splash-title"><strong>One moment…</strong></p>
      <p class="splash-sub">Information saved. Loading the next step.</p>
    </div>
  `;

  const splashStepHtmlCustom = ({ title, sub }) => `
    <div class="modal-splash" role="status" aria-live="polite">
      <div class="splash-stage" aria-hidden="true">
        <i class="fa-solid fa-fire-flame-curved splash-ico splash-ico-flame" aria-hidden="true"></i>
        <i class="fa-regular fa-snowflake splash-ico splash-ico-snow" aria-hidden="true"></i>
        <i class="fa-solid fa-fan splash-ico splash-ico-vent" aria-hidden="true"></i>
        <i class="fa-solid fa-wind splash-ico splash-ico-air" aria-hidden="true"></i>
      </div>
      <p class="splash-title"><strong>${escapeHtml(title)}</strong></p>
      <p class="splash-sub">${escapeHtml(sub)}</p>
    </div>
  `;

  const addressStepHtml = () => `
    <form class="modal-form" data-address-form>
      <p class="modal-lede">
        <strong>Please enter your service address.</strong>
      </p>

      <div class="field">
        <label class="label" for="addr-street">
          Street Address <span class="req" aria-hidden="true">*</span
          ><span class="sr-only"> (required)</span>
        </label>
        <input
          class="input"
          id="addr-street"
          name="street"
          type="text"
          autocomplete="street-address"
          required
          value="${escapeHtml(address.street)}"
          placeholder="123 Main St"
        />
      </div>

      <div class="field">
        <label class="label" for="addr-city">
          City <span class="req" aria-hidden="true">*</span><span class="sr-only"> (required)</span>
        </label>
        <input
          class="input"
          id="addr-city"
          name="city"
          type="text"
          autocomplete="address-level2"
          required
          value="${escapeHtml(address.city)}"
          placeholder="Sterling Heights"
        />
      </div>

      <div class="field">
        <label class="label" for="addr-state">
          State <span class="req" aria-hidden="true">*</span><span class="sr-only"> (required)</span>
        </label>
        <input
          class="input"
          id="addr-state"
          name="state"
          type="text"
          autocomplete="address-level1"
          inputmode="text"
          required
          value="${escapeHtml(address.state)}"
          placeholder="MI"
        />
      </div>

      <div class="field">
        <label class="label" for="addr-zip">
          ZIP Code <span class="req" aria-hidden="true">*</span><span class="sr-only"> (required)</span>
        </label>
        <input
          class="input"
          id="addr-zip"
          name="zip"
          type="text"
          autocomplete="postal-code"
          inputmode="numeric"
          required
          value="${escapeHtml(address.zip)}"
          placeholder="480xx"
        />
      </div>

      <p class="form-error" data-form-error hidden></p>

      <div class="modal-actions">
        <button class="ghost" type="button" data-step-back>
          ${returnToReview && editMode === "address" ? "Cancel" : "Back"}
        </button>
        <button class="cta" type="submit">${returnToReview && editMode === "address" ? "Save" : "Next"}</button>
      </div>
    </form>
  `;

  const reviewStepHtml = () => `
    <form class="modal-form" data-review-form>
      <p class="modal-lede">
        <strong>Review your information before continuing.</strong>
      </p>

      <div class="review">
        <section class="review-section" aria-label="Contact information">
          <div class="review-head">
            <span class="review-title-wrap">
              <span class="review-ico" aria-hidden="true"><i class="fa-solid fa-user"></i></span>
              <span class="review-title">Contact</span>
            </span>
            <button class="review-edit" type="button" data-edit-step="lead">Edit</button>
          </div>
          <dl class="review-list">
            <div class="review-row"><dt>Name</dt><dd>${escapeHtml(lead.name)}</dd></div>
            <div class="review-row"><dt>Phone</dt><dd>${escapeHtml(lead.phone)}</dd></div>
            <div class="review-row"><dt>Email</dt><dd>${escapeHtml(lead.email)}</dd></div>
          </dl>
        </section>

        <section class="review-section" aria-label="System information">
          <div class="review-head">
            <span class="review-title-wrap">
              <span class="review-ico" aria-hidden="true"><i class="fa-solid fa-temperature-half"></i></span>
              <span class="review-title">System</span>
            </span>
            <button class="review-edit" type="button" data-edit-step="system">Edit</button>
          </div>
          <dl class="review-list">
            <div class="review-row"><dt>System type</dt><dd>${escapeHtml(systemType)}</dd></div>
            <div class="review-row"><dt>Equipment</dt><dd>${escapeHtml(systemEquipmentType)}</dd></div>
          </dl>
        </section>

        <section class="review-section" aria-label="Service information">
          <div class="review-head">
            <span class="review-title-wrap">
              <span class="review-ico" aria-hidden="true"><i class="fa-solid fa-screwdriver-wrench"></i></span>
              <span class="review-title">Service</span>
            </span>
            <button class="review-edit" type="button" data-edit-step="service">Edit</button>
          </div>
          <dl class="review-list">
            <div class="review-row"><dt>Type</dt><dd>${escapeHtml(serviceType)}</dd></div>
          </dl>
        </section>

        <section class="review-section" aria-label="Address information">
          <div class="review-head">
            <span class="review-title-wrap">
              <span class="review-ico" aria-hidden="true"><i class="fa-solid fa-location-dot"></i></span>
              <span class="review-title">Address</span>
            </span>
            <button class="review-edit" type="button" data-edit-step="address">Edit</button>
          </div>
          <dl class="review-list">
            <div class="review-row"><dt>Street</dt><dd>${escapeHtml(address.street)}</dd></div>
            <div class="review-row"><dt>City</dt><dd>${escapeHtml(address.city)}</dd></div>
            <div class="review-row"><dt>State</dt><dd>${escapeHtml(address.state)}</dd></div>
            <div class="review-row"><dt>ZIP</dt><dd>${escapeHtml(address.zip)}</dd></div>
          </dl>
        </section>
      </div>

      <div class="modal-actions">
        <button class="ghost" type="button" data-step-back>Back</button>
        <button class="cta" type="submit">Next</button>
      </div>
    </form>
  `;

  const additionalDetailsStepHtml = () => `
    <form class="modal-form" data-additional-form>
      <p class="modal-lede">
        <strong>Additional System Information</strong>
      </p>

      <div class="field">
        <label class="label" for="add-details">
          Describe what you are experiencing with your system
          <span class="req" aria-hidden="true">*</span><span class="sr-only"> (required)</span>
        </label>
        <textarea
          class="input input-textarea"
          id="add-details"
          name="details"
          rows="4"
          required
          placeholder="Enter your system’s symptoms here…"
        >${escapeHtml(additional.details)}</textarea>
        <div class="hint">
          <div class="hint-title">Examples:</div>
          <ul class="hint-list">
            <li><strong>Heating:</strong> “My furnace flame goes out as soon as the burners light.”</li>
            <li>
              <strong>Cooling:</strong> “My system is blowing warm air out of the vents and the outdoor unit fan isn’t
              spinning.”
            </li>
          </ul>
        </div>
      </div>

      <div class="divider" role="separator" aria-hidden="true"></div>

      <div class="field">
        <label class="label" for="add-photos">Photos (recommended)</label>
        <input class="input" id="add-photos" name="photos" type="file" accept="image/*" multiple />
        <p class="hint">
          Recommended: equipment model #, thermostat display, error code, and the equipment and work area.
        </p>
        <div class="photo-list" id="add-photo-list" aria-live="polite"></div>
      </div>

      <p class="form-error" data-form-error hidden></p>

      <div class="modal-actions">
        <button class="ghost" type="button" data-step-back>Back</button>
        <button class="cta" type="submit">Confirm &amp; Continue</button>
      </div>
    </form>
  `;

  const scheduleStepHtml = () => {
    const today = new Date();
    const min = yyyyMmDd(today);
    const max = yyyyMmDd(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30));

    return `
      <form class="modal-form" data-schedule-form>
        <p class="modal-lede">
          <strong>Schedule your appointment</strong>
        </p>

        <div class="field">
          <label class="label" for="sched-date">
            Click to select a date <span class="req" aria-hidden="true">*</span><span class="sr-only"> (required)</span>
          </label>
          <input
            class="input"
            id="sched-date"
            name="date"
            type="date"
            required
            min="${min}"
            max="${max}"
            value="${escapeHtml(schedule.date)}"
          />
          <p class="hint">
            Hours: Mon–Fri 8:30 AM–6:00 PM, Sat 9:00 AM–2:00 PM, Sun closed.
          </p>
        </div>

        <div class="field" id="sched-slots-field" ${schedule.date ? "" : "hidden"}>
          <div class="label">
            Choose a 4‑hour time block <span class="req" aria-hidden="true">*</span>
            <span class="sr-only"> (required)</span>
          </div>
          <div class="slots" id="sched-slots" role="listbox" aria-label="Available time blocks"></div>
          <p class="form-error" data-form-error hidden></p>
        </div>

        <div class="modal-actions">
          <button class="ghost" type="button" data-step-back>Back</button>
          <button class="cta" type="submit">Confirm &amp; Continue</button>
        </div>
      </form>
    `;
  };

  const scheduleConfirmationStepHtml = () => {
    const dateText = schedule.date ? formatDateLong(schedule.date) : "";
    const timeText =
      schedule.startMin != null && schedule.endMin != null
        ? `${formatTime(schedule.startMin)} – ${formatTime(schedule.endMin)}`
        : "";

    return `
      <form class="modal-form" data-schedule-confirm-form>
        <p class="modal-lede">
          <span class="confirm-icon" aria-hidden="true"><i class="fa-solid fa-circle-check"></i></span>
          <strong class="confirm-title">Appointment scheduled</strong>
        </p>

        <div class="notice">
          <p class="notice-title"><strong>Appointment Details:</strong></p>
          <p class="notice-line">
            ${escapeHtml(dateText)}${dateText && timeText ? " • " : ""}${escapeHtml(timeText)}
          </p>
          <p class="notice-sub" style="margin-top:-4px; margin-bottom:10px;">
            Your time window has been reserved.
          </p>
          <p class="notice-sub">
            We’ll do our best to arrive within the selected 4-hour window. If demand requires, a member of our team may
            contact you to adjust the scheduled time.
          </p>
          <p class="notice-sub" style="margin-top:10px;">
            <strong>Next:</strong> We’ll review your request and reach out to confirm.
          </p>
          <p class="notice-sub" style="margin-top:10px;" data-booking-email-status>
            Email notification: pending
          </p>
          <p class="notice-sub" style="margin-top:6px;">
            If you don’t receive an email, check spam/junk for a one-time FormSubmit confirmation message.
          </p>
        </div>

        <div class="modal-actions">
          <button class="ghost" type="button" data-step-back>Back</button>
          <button class="cta" type="button" data-modal-close>Finish</button>
        </div>
      </form>
    `;
  };

  const systemTypeStepHtml = () => `
    <form class="modal-form" data-system-form>
      <p class="modal-lede">
        <strong>Select your system type.</strong>
      </p>

      <fieldset class="service-fieldset choice-group" id="system-group" aria-label="System type">
        <legend class="sr-only">System type</legend>

        <div class="service-list" role="radiogroup" aria-label="System type options">
          <label class="service-choice">
            <input
              type="radio"
              name="systemType"
              value="Heating System"
              ${systemType === "Heating System" ? "checked" : ""}
              required
            />
            <span class="service-card">
              <span class="service-icon service-icon-heat" aria-hidden="true">
                <i class="fa-solid fa-fire-flame-curved"></i>
              </span>
              <span class="service-meta">
                <span class="service-title">Heating System</span>
              </span>
              <span class="service-check" aria-hidden="true">
                <i class="fa-solid fa-circle-check"></i>
              </span>

              <span class="service-details" aria-hidden="false">
                <span class="detail-label">
                  Equipment type <span class="req" aria-hidden="true">*</span>
                </span>
                <select
                  class="input"
                  id="equip-heat"
                  name="equipmentTypeHeating"
                  ${systemType === "Heating System" ? "" : "disabled"}
                >
                  <option value="" ${systemType === "Heating System" && !systemEquipmentType ? "selected" : ""}>
                    Select equipment
                  </option>
                  <option value="Furnace" ${systemEquipmentType === "Furnace" ? "selected" : ""}>Furnace</option>
                  <option value="Heat Pump" ${systemEquipmentType === "Heat Pump" ? "selected" : ""}>Heat Pump</option>
                  <option value="Water Heater" ${systemEquipmentType === "Water Heater" ? "selected" : ""}>
                    Water Heater
                  </option>
                  <option
                    value="Tankless Water Heater"
                    ${systemEquipmentType === "Tankless Water Heater" ? "selected" : ""}
                  >
                    Tankless Water Heater
                  </option>
                </select>
              </span>
            </span>
          </label>

          <label class="service-choice">
            <input
              type="radio"
              name="systemType"
              value="Cooling System"
              ${systemType === "Cooling System" ? "checked" : ""}
              required
            />
            <span class="service-card">
              <span class="service-icon service-icon-cool" aria-hidden="true">
                <i class="fa-regular fa-snowflake"></i>
              </span>
              <span class="service-meta">
                <span class="service-title">Cooling System</span>
              </span>
              <span class="service-check" aria-hidden="true">
                <i class="fa-solid fa-circle-check"></i>
              </span>

              <span class="service-details" aria-hidden="false">
                <span class="detail-label">
                  Equipment type <span class="req" aria-hidden="true">*</span>
                </span>
                <select
                  class="input"
                  id="equip-cool"
                  name="equipmentTypeCooling"
                  ${systemType === "Cooling System" ? "" : "disabled"}
                >
                  <option value="" ${systemType === "Cooling System" && !systemEquipmentType ? "selected" : ""}>
                    Select equipment
                  </option>
                  <option
                    value="Central Air Conditioning"
                    ${systemEquipmentType === "Central Air Conditioning" ? "selected" : ""}
                  >
                    Central Air Conditioning
                  </option>
                  <option value="Ductless Mini-Split" ${systemEquipmentType === "Ductless Mini-Split" ? "selected" : ""}>
                    Ductless Mini-Split
                  </option>
                  <option value="Ducted Mini-Split" ${systemEquipmentType === "Ducted Mini-Split" ? "selected" : ""}>
                    Ducted Mini-Split
                  </option>
                  <option value="Heat Pump" ${systemEquipmentType === "Heat Pump" ? "selected" : ""}>Heat Pump</option>
                </select>
              </span>
            </span>
          </label>
        </div>
      </fieldset>

      <p class="form-error" data-form-error hidden></p>

      <div class="modal-actions">
        <button class="ghost" type="button" data-step-back>
          ${returnToReview && editMode === "system" ? "Cancel" : "Back"}
        </button>
        <button class="cta" type="submit">${returnToReview && editMode === "system" ? "Save" : "Next"}</button>
      </div>
    </form>
  `;

  const serviceTypeStepHtml = () => `
    <form class="modal-form" data-service-form>
      <p class="modal-lede">
        <strong>What type of service do you need?</strong>
      </p>

      <fieldset class="service-fieldset choice-group" id="service-group" aria-label="Service type">
        <legend class="sr-only">Service type</legend>

        <div class="service-list" role="radiogroup" aria-label="Service type options">
          <label class="service-choice">
            <input
              type="radio"
              name="serviceType"
              value="Repair"
              ${serviceType === "Repair" ? "checked" : ""}
              required
            />
            <span class="service-card">
              <span class="service-icon" aria-hidden="true">
                <i class="fa-solid fa-screwdriver-wrench"></i>
              </span>
              <span class="service-meta">
                <span class="service-title">Repair</span>
                <span class="service-sub">Something isn’t working correctly.</span>
              </span>
              <span class="service-check" aria-hidden="true">
                <i class="fa-solid fa-circle-check"></i>
              </span>
            </span>
          </label>

          <label class="service-choice">
            <input
              type="radio"
              name="serviceType"
              value="Maintenance"
              ${serviceType === "Maintenance" ? "checked" : ""}
              required
            />
            <span class="service-card">
              <span class="service-icon" aria-hidden="true">
                <i class="fa-solid fa-calendar-check"></i>
              </span>
              <span class="service-meta">
                <span class="service-title">Maintenance</span>
                <span class="service-sub">Tune-up, inspection, and seasonal service.</span>
              </span>
              <span class="service-check" aria-hidden="true">
                <i class="fa-solid fa-circle-check"></i>
              </span>
            </span>
          </label>

          <label class="service-choice">
            <input
              type="radio"
              name="serviceType"
              value="Installation"
              ${serviceType === "Installation" ? "checked" : ""}
              required
            />
            <span class="service-card">
              <span class="service-icon" aria-hidden="true">
                <i class="fa-solid fa-toolbox"></i>
              </span>
              <span class="service-meta">
                <span class="service-title">Installation</span>
                <span class="service-sub">New system or replacement estimate.</span>
              </span>
              <span class="service-check" aria-hidden="true">
                <i class="fa-solid fa-circle-check"></i>
              </span>
            </span>
          </label>
        </div>
      </fieldset>

      <p class="form-error" data-form-error hidden></p>

      <div class="modal-actions">
        <button class="ghost" type="button" data-step-back>
          ${returnToReview && editMode === "service" ? "Cancel" : "Back"}
        </button>
        <button class="cta" type="submit">${returnToReview && editMode === "service" ? "Save" : "Next"}</button>
      </div>
    </form>
  `;

  const showLeadStep = () => {
    modalBody.innerHTML = leadStepHtml();
  };

  const showSplashStep = () => {
    modalBody.innerHTML = splashStepHtml();
  };

  const showSystemTypeStep = () => {
    modalBody.innerHTML = systemTypeStepHtml();
  };

  const showAddressStep = () => {
    modalBody.innerHTML = addressStepHtml();
  };

  const showServiceTypeStep = () => {
    modalBody.innerHTML = serviceTypeStepHtml();
  };

  const showReviewStep = () => {
    returnToReview = false;
    editMode = null;
    modalBody.innerHTML = reviewStepHtml();
  };

  const showAdditionalDetailsStep = () => {
    modalBody.innerHTML = additionalDetailsStepHtml();
    // Populate photo list immediately (in case user comes back here)
    const list = modalOverlay.querySelector("#add-photo-list");
    if (list) {
      list.innerHTML =
        additional.photos?.length > 0
          ? additional.photos
              .map((f) => `<div class="photo-item">${escapeHtml(f.name)} <span class="muted">(${escapeHtml(formatBytes(f.size))})</span></div>`)
              .join("")
          : `<div class="photo-item muted">No photos selected</div>`;
    }
  };

  const showScheduleStep = () => {
    modalBody.innerHTML = scheduleStepHtml();
    // If a date is already selected, render slots.
    const dateEl = modalOverlay.querySelector("#sched-date");
    if (dateEl?.value) {
      renderScheduleSlots(dateEl.value);
    }
    // Auto-open the native date picker when supported.
    requestAnimationFrame(() => {
      try {
        dateEl?.focus?.();
        dateEl?.showPicker?.();
      } catch {
        // ignore
      }
    });
  };

  const showScheduleConfirmationStep = () => {
    modalTitle.textContent = "Thank you for scheduling an appointment with Freedom Mechanical LLC";
    modalBody.innerHTML = scheduleConfirmationStepHtml();
    updateBookingEmailStatusUI();
  };

  const renderScheduleSlots = (dateStr) => {
    const field = modalOverlay.querySelector("#sched-slots-field");
    const slotsEl = modalOverlay.querySelector("#sched-slots");
    const errorEl = modalOverlay.querySelector('[data-schedule-form] [data-form-error]');
    if (!field || !slotsEl) return;

    const hours = businessHoursForDate(dateStr);
    field.hidden = false;

    if (!hours) {
      schedule.startMin = null;
      schedule.endMin = null;
      slotsEl.innerHTML = `<div class="slots-empty">Sunday is closed. Please choose another day.</div>`;
      errorEl && (errorEl.hidden = true);
      return;
    }

    const blocks = generateFourHourBlocks(hours);
    if (blocks.length === 0) {
      schedule.startMin = null;
      schedule.endMin = null;
      slotsEl.innerHTML = `<div class="slots-empty">No 4-hour blocks available for this day.</div>`;
      errorEl && (errorEl.hidden = true);
      return;
    }

    slotsEl.innerHTML = blocks
      .map((b) => {
        const selected = schedule.startMin === b.start && schedule.endMin === b.end;
        const label = `${formatTime(b.start)} – ${formatTime(b.end)}`;
        return `
          <button
            class="slot ${selected ? "is-selected" : ""}"
            type="button"
            role="option"
            aria-selected="${selected ? "true" : "false"}"
            data-slot-start="${b.start}"
            data-slot-end="${b.end}"
          >
            ${escapeHtml(label)}
          </button>
        `;
      })
      .join("");

    errorEl && (errorEl.hidden = true);
  };

  const showDetailStep = (key) => {
    const content = MODAL_CONTENT[key] || MODAL_CONTENT.schedule;
    modalBody.innerHTML = content.body;
  };

  const openModal = (key) => {
    currentModalKey = key in MODAL_CONTENT ? key : "schedule";
    const content = MODAL_CONTENT[currentModalKey] || MODAL_CONTENT.schedule;
    lastFocusedEl = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    bookingEmailSent = false;
    bookingEmailStatus = { state: "idle", message: "" };

    modalTitle.textContent = "Schedule an Appointment Online!";
    showLeadStep();

    // If the mobile menu is open, close it before showing the modal.
    close();

    modalOverlay.hidden = false;
    body.dataset.modalOpen = "true";
    updateScrollLock();
    // Ensure opening animation runs.
    requestAnimationFrame(() => {
      modalOverlay.dataset.open = "true";
      const firstInput = modalOverlay.querySelector("input");
      firstInput?.focus?.();
    });

    modalOverlay.addEventListener("keydown", trapTabKey);
  };

  function closeModal() {
    body.dataset.modalOpen = "false";
    modalOverlay.dataset.open = "false";
    updateScrollLock();

    modalOverlay.removeEventListener("keydown", trapTabKey);

    window.clearTimeout(closeTimer);
    window.clearTimeout(splashTimer);
    window.clearTimeout(splashTimer2);
    // Match CSS transition duration (260ms), but add tiny buffer.
    closeTimer = window.setTimeout(() => {
      modalOverlay.hidden = true;
      if (lastFocusedEl) lastFocusedEl.focus?.();
      lastFocusedEl = null;
    }, 280);
  }

  // Open modal from any trigger without changing the page/hash.
  document.addEventListener("click", (e) => {
    const trigger = e.target.closest?.("[data-modal-trigger]");
    if (!trigger) return;
    e.preventDefault();
    openModal(trigger.dataset.modalTrigger);
  });

  // Close behaviors (X button + click outside).
  modalOverlay.addEventListener("click", (e) => {
    const closeBtn = e.target.closest?.("[data-modal-close]");
    if (closeBtn) return closeModal();

    const backBtn = e.target.closest?.("[data-step-back]");
    if (backBtn) {
      const form = backBtn.closest("form");

      // If user is editing from Review, "Cancel/Back" returns to Review without saving.
      if (returnToReview && editMode) {
        showReviewStep();
        requestAnimationFrame(() => modalOverlay.querySelector("[data-review-form] button.cta")?.focus?.());
        return;
      }

      if (form?.hasAttribute("data-review-form")) {
        showAddressStep();
        requestAnimationFrame(() => modalOverlay.querySelector("#addr-street")?.focus?.());
        return;
      }

      if (form?.hasAttribute("data-additional-form")) {
        showReviewStep();
        requestAnimationFrame(() => modalOverlay.querySelector("[data-review-form] button.cta")?.focus?.());
        return;
      }

      if (form?.hasAttribute("data-schedule-form")) {
        showAdditionalDetailsStep();
        requestAnimationFrame(() => modalOverlay.querySelector("#add-details")?.focus?.());
        return;
      }

      if (form?.hasAttribute("data-schedule-confirm-form")) {
        showScheduleStep();
        requestAnimationFrame(() => modalOverlay.querySelector("#sched-date")?.focus?.());
        return;
      }

      if (form?.hasAttribute("data-address-form")) {
        captureAddressDraft(form);
        showServiceTypeStep();
        requestAnimationFrame(() => modalOverlay.querySelector('input[name="serviceType"]')?.focus?.());
        return;
      }

      if (form?.hasAttribute("data-service-form")) {
        captureServiceDraft(form);
        showSystemTypeStep();
        requestAnimationFrame(() => modalOverlay.querySelector('input[name="systemType"]')?.focus?.());
        return;
      }

      if (form?.hasAttribute("data-system-form")) {
        captureSystemDraft(form);
        showLeadStep();
        requestAnimationFrame(() => modalOverlay.querySelector("#lead-name")?.focus?.());
        return;
      }

      return;
    }

    const edit = e.target.closest?.("[data-edit-step]");
    if (!edit) return;
    const step = edit.dataset.editStep;

    if (step === "lead") {
      returnToReview = true;
      editMode = "lead";
      showLeadStep();
      requestAnimationFrame(() => modalOverlay.querySelector("#lead-name")?.focus?.());
      return;
    }
    if (step === "system") {
      returnToReview = true;
      editMode = "system";
      showSystemTypeStep();
      requestAnimationFrame(() => modalOverlay.querySelector('input[name="systemType"]')?.focus?.());
      return;
    }
    if (step === "service") {
      returnToReview = true;
      editMode = "service";
      showServiceTypeStep();
      requestAnimationFrame(() => modalOverlay.querySelector('input[name="serviceType"]')?.focus?.());
      return;
    }
    if (step === "address") {
      returnToReview = true;
      editMode = "address";
      showAddressStep();
      requestAnimationFrame(() => modalOverlay.querySelector("#addr-street")?.focus?.());
    }
  });

  // Additional details: capture photo selection
  modalOverlay.addEventListener("change", (e) => {
    const fileInput = e.target?.closest?.("#add-photos");
    if (!fileInput) return;
    const files = Array.from(fileInput.files || []).filter((f) => (f.type || "").startsWith("image/"));
    additional.photos = files;

    const list = modalOverlay.querySelector("#add-photo-list");
    if (!list) return;
    list.innerHTML =
      files.length > 0
        ? files
            .map((f) => `<div class="photo-item">${escapeHtml(f.name)} <span class="muted">(${escapeHtml(formatBytes(f.size))})</span></div>`)
            .join("")
        : `<div class="photo-item muted">No photos selected</div>`;
  });

  // Schedule: date change -> render slots; slot click -> select block
  modalOverlay.addEventListener("change", (e) => {
    const dateEl = e.target?.closest?.("#sched-date");
    if (!dateEl) return;
    schedule.date = String(dateEl.value || "").trim();
    schedule.startMin = null;
    schedule.endMin = null;
    renderScheduleSlots(schedule.date);
  });

  // Auto-open date picker on click/focus when supported.
  modalOverlay.addEventListener("click", (e) => {
    const dateEl = e.target?.closest?.("#sched-date");
    if (!dateEl) return;
    try {
      dateEl.showPicker?.();
    } catch {
      // ignore
    }
  });

  modalOverlay.addEventListener("click", (e) => {
    const slotBtn = e.target.closest?.("[data-slot-start]");
    if (!slotBtn) return;
    const start = Number(slotBtn.dataset.slotStart);
    const end = Number(slotBtn.dataset.slotEnd);
    if (!Number.isFinite(start) || !Number.isFinite(end)) return;
    schedule.startMin = start;
    schedule.endMin = end;
    // re-render to update selected state
    if (schedule.date) renderScheduleSlots(schedule.date);
  });

  // System type: enable the relevant equipment dropdown when selected.
  modalOverlay.addEventListener("change", (e) => {
    const systemRadio = e.target?.closest?.('input[name="systemType"]');
    if (!systemRadio) return;

    systemType = String(systemRadio.value || "").trim();
    systemEquipmentType = "";

    const heatSel = modalOverlay.querySelector("#equip-heat");
    const coolSel = modalOverlay.querySelector("#equip-cool");
    if (heatSel) heatSel.disabled = systemType !== "Heating System";
    if (coolSel) coolSel.disabled = systemType !== "Cooling System";

    if (heatSel) setInvalid(heatSel, false);
    if (coolSel) setInvalid(coolSel, false);
    const grp = modalOverlay.querySelector("#system-group");
    setInvalid(grp, false);

    // Focus the dropdown for fast completion.
    requestAnimationFrame(() => {
      const activeSel = systemType === "Heating System" ? heatSel : coolSel;
      activeSel?.focus?.();
    });
  });

  // Step flow submits
  modalOverlay.addEventListener("submit", (e) => {
    const leadForm = e.target.closest?.("[data-lead-form]");
    const systemForm = e.target.closest?.("[data-system-form]");
    const serviceForm = e.target.closest?.("[data-service-form]");
    const addrForm = e.target.closest?.("[data-address-form]");
    const reviewForm = e.target.closest?.("[data-review-form]");
    const additionalForm = e.target.closest?.("[data-additional-form]");
    const scheduleForm = e.target.closest?.("[data-schedule-form]");
    if (
      !leadForm &&
      !systemForm &&
      !serviceForm &&
      !addrForm &&
      !reviewForm &&
      !additionalForm &&
      !scheduleForm
    )
      return;
    e.preventDefault();

    const runValidation = ({ fields, fieldLabels, errorEl }) => {
      const missing = [];
      for (const { key, el } of fields) {
        const value = (el?.value || "").trim();
        if (!value) missing.push(fieldLabels[key]);
        setInvalid(el, !value);
      }
      if (missing.length) {
        if (errorEl) {
          errorEl.textContent = `Please complete: ${missing.join(", ")}.`;
          errorEl.hidden = false;
        }
        const firstMissing = fields.find(({ el }) => el?.getAttribute("aria-invalid") === "true")?.el;
        firstMissing?.focus?.();
        return { ok: false };
      }
      if (errorEl) errorEl.hidden = true;
      return { ok: true };
    };

    if (leadForm) {
      const nameEl = leadForm.querySelector("#lead-name");
      const phoneEl = leadForm.querySelector("#lead-phone");
      const emailEl = leadForm.querySelector("#lead-email");
      const errorEl = leadForm.querySelector("[data-form-error]");

      const res = runValidation({
        fields: [
          { key: "name", el: nameEl },
          { key: "phone", el: phoneEl },
          { key: "email", el: emailEl },
        ],
        fieldLabels: { name: "name", phone: "phone number", email: "email address" },
        errorEl,
      });
      if (!res.ok) return;

      const name = (nameEl?.value || "").trim();
      const phone = (phoneEl?.value || "").trim();
      const email = (emailEl?.value || "").trim();
      lead = { name, phone, email };

      // Basic email sanity check; browser also validates via type="email".
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (errorEl) {
          errorEl.textContent = "Please enter a valid email address.";
          errorEl.hidden = false;
        }
        setInvalid(emailEl, true);
        emailEl?.focus?.();
        return;
      }

      if (returnToReview && editMode === "lead") {
        // Save and return to Review immediately.
        showReviewStep();
        requestAnimationFrame(() => modalOverlay.querySelector("[data-review-form] button.cta")?.focus?.());
        return;
      }

      // Splash, then system type step.
      showSplashStep();
      window.clearTimeout(splashTimer);
      splashTimer = window.setTimeout(() => {
        if (!isModalOpen()) return;
        showSystemTypeStep();
        requestAnimationFrame(() => {
          const firstChoice = modalOverlay.querySelector('input[name="systemType"]');
          firstChoice?.focus?.();
        });
      }, SPLASH_MS);
      return;
    }

    if (systemForm) {
      const errorEl = systemForm.querySelector("[data-form-error]");
      const groupEl = systemForm.querySelector("#system-group");
      const selected = systemForm.querySelector('input[name="systemType"]:checked');
      const heatSel = systemForm.querySelector("#equip-heat");
      const coolSel = systemForm.querySelector("#equip-cool");

      if (!selected) {
        if (errorEl) {
          errorEl.textContent = "Please select one option to continue.";
          errorEl.hidden = false;
        }
        setInvalid(groupEl, true);
        groupEl?.scrollIntoView?.({ block: "nearest" });
        return;
      }

      if (errorEl) errorEl.hidden = true;
      setInvalid(groupEl, false);
      systemType = String(selected.value || "").trim();

      const activeSel = systemType === "Heating System" ? heatSel : coolSel;
      const equip = (activeSel?.value || "").trim();
      setInvalid(heatSel, false);
      setInvalid(coolSel, false);

      if (!equip) {
        if (errorEl) {
          errorEl.textContent = "Please select your equipment type to continue.";
          errorEl.hidden = false;
        }
        setInvalid(activeSel, true);
        activeSel?.focus?.();
        return;
      }

      systemEquipmentType = equip;

      if (returnToReview && editMode === "system") {
        showReviewStep();
        requestAnimationFrame(() => modalOverlay.querySelector("[data-review-form] button.cta")?.focus?.());
        return;
      }

      // Splash, then service type step.
      showSplashStep();
      window.clearTimeout(splashTimer);
      splashTimer = window.setTimeout(() => {
        if (!isModalOpen()) return;
        showServiceTypeStep();
        requestAnimationFrame(() => {
          const firstChoice = modalOverlay.querySelector('input[name="serviceType"]');
          firstChoice?.focus?.();
        });
      }, SPLASH_MS);
      return;
    }

    if (serviceForm) {
      const errorEl = serviceForm.querySelector("[data-form-error]");
      const groupEl = serviceForm.querySelector("#service-group");
      const selected = serviceForm.querySelector('input[name="serviceType"]:checked');

      if (!selected) {
        if (errorEl) {
          errorEl.textContent = "Please select one option to continue.";
          errorEl.hidden = false;
        }
        setInvalid(groupEl, true);
        groupEl?.scrollIntoView?.({ block: "nearest" });
        return;
      }

      if (errorEl) errorEl.hidden = true;
      setInvalid(groupEl, false);
      serviceType = String(selected.value || "").trim();

      if (returnToReview && editMode === "service") {
        showReviewStep();
        requestAnimationFrame(() => modalOverlay.querySelector("[data-review-form] button.cta")?.focus?.());
        return;
      }

      // Splash, then address step.
      showSplashStep();
      window.clearTimeout(splashTimer);
      splashTimer = window.setTimeout(() => {
        if (!isModalOpen()) return;
        showAddressStep();
        requestAnimationFrame(() => {
          modalOverlay.querySelector("#addr-street")?.focus?.();
        });
      }, SPLASH_MS);
      return;
    }

    if (addrForm) {
      const streetEl = addrForm.querySelector("#addr-street");
      const cityEl = addrForm.querySelector("#addr-city");
      const stateEl = addrForm.querySelector("#addr-state");
      const zipEl = addrForm.querySelector("#addr-zip");
      const errorEl = addrForm.querySelector("[data-form-error]");

      const res = runValidation({
        fields: [
          { key: "street", el: streetEl },
          { key: "city", el: cityEl },
          { key: "state", el: stateEl },
          { key: "zip", el: zipEl },
        ],
        fieldLabels: { street: "street address", city: "city", state: "state", zip: "ZIP code" },
        errorEl,
      });
      if (!res.ok) return;

      address = {
        street: (streetEl?.value || "").trim(),
        city: (cityEl?.value || "").trim(),
        state: (stateEl?.value || "").trim(),
        zip: (zipEl?.value || "").trim(),
      };

      if (returnToReview && editMode === "address") {
        showReviewStep();
        requestAnimationFrame(() => modalOverlay.querySelector("[data-review-form] button.cta")?.focus?.());
        return;
      }

      // Splash, then review step.
      showSplashStep();
      window.clearTimeout(splashTimer);
      splashTimer = window.setTimeout(() => {
        if (!isModalOpen()) return;
        showReviewStep();
        requestAnimationFrame(() => {
          const focusable = getFocusable(modalOverlay);
          focusable[0]?.focus?.();
        });
      }, SPLASH_MS);
      return;
    }

    if (reviewForm) {
      // Go to additional details page (details required, photos recommended)
      showAdditionalDetailsStep();
      requestAnimationFrame(() => modalOverlay.querySelector("#add-details")?.focus?.());
      return;
    }

    if (additionalForm) {
      const detailsEl = additionalForm.querySelector("#add-details");
      const errorEl = additionalForm.querySelector("[data-form-error]");
      const details = (detailsEl?.value || "").trim();
      additional.details = details;

      setInvalid(detailsEl, !details);
      if (!details) {
        if (errorEl) {
          errorEl.textContent = "Please describe the symptoms to continue.";
          errorEl.hidden = false;
        }
        detailsEl?.focus?.();
        return;
      }
      if (errorEl) errorEl.hidden = true;

      // Splash, then schedule step (required)
      modalBody.innerHTML = splashStepHtmlCustom({
        title: "Saving your information…",
        sub: "Information saved. Loading scheduling options.",
      });
      window.clearTimeout(splashTimer);
      splashTimer = window.setTimeout(() => {
        if (!isModalOpen()) return;
        showScheduleStep();
      }, SPLASH_MS);
      return;
    }

    if (scheduleForm) {
      const dateEl = scheduleForm.querySelector("#sched-date");
      const errorEl = scheduleForm.querySelector("[data-form-error]");

      schedule.date = String(dateEl?.value || "").trim();
      const hours = schedule.date ? businessHoursForDate(schedule.date) : null;

      if (!schedule.date) {
        setInvalid(dateEl, true);
        dateEl?.focus?.();
        return;
      }
      setInvalid(dateEl, false);

      if (!hours) {
        if (errorEl) {
          errorEl.textContent = "Sunday is closed. Please choose another day.";
          errorEl.hidden = false;
        }
        return;
      }

      if (schedule.startMin == null || schedule.endMin == null) {
        if (errorEl) {
          errorEl.textContent = "Please select a 4-hour time block to continue.";
          errorEl.hidden = false;
        }
        return;
      }

      if (errorEl) errorEl.hidden = true;

      // Send the full booking details to your email (no backend).
      // Fire-and-forget: the confirmation screen shows sent/failed status.
      sendBookingEmail().finally(() => updateBookingEmailStatusUI());

      // Show scheduling splash, then a confirmation screen.
      modalBody.innerHTML = splashStepHtmlCustom({
        title: "Scheduling your appointment…",
        sub: "Information saved. Loading final details.",
      });
      window.clearTimeout(splashTimer);
      window.clearTimeout(splashTimer2);
      splashTimer = window.setTimeout(() => {
        if (!isModalOpen()) return;
        showScheduleConfirmationStep();
        requestAnimationFrame(() => {
          modalOverlay.querySelector("[data-schedule-confirm-form] [data-modal-close]")?.focus?.();
        });
      }, SPLASH_MS);
      return;
    }
  });

})();


