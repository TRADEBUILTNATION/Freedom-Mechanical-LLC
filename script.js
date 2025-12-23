(() => {
  const yearEl = document.getElementById("legal-year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

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
      <p class="splash-sub">Loading the next step.</p>
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
            <span class="review-title">Contact</span>
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
            <span class="review-title">System</span>
            <button class="review-edit" type="button" data-edit-step="system">Edit</button>
          </div>
          <dl class="review-list">
            <div class="review-row"><dt>System type</dt><dd>${escapeHtml(systemType)}</dd></div>
            <div class="review-row"><dt>Equipment</dt><dd>${escapeHtml(systemEquipmentType)}</dd></div>
          </dl>
        </section>

        <section class="review-section" aria-label="Service information">
          <div class="review-head">
            <span class="review-title">Service</span>
            <button class="review-edit" type="button" data-edit-step="service">Edit</button>
          </div>
          <dl class="review-list">
            <div class="review-row"><dt>Type</dt><dd>${escapeHtml(serviceType)}</dd></div>
          </dl>
        </section>

        <section class="review-section" aria-label="Address information">
          <div class="review-head">
            <span class="review-title">Address</span>
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
        <button class="cta" type="submit">Confirm &amp; Continue</button>
      </div>
    </form>
  `;

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
                  <option value="Boiler" ${systemEquipmentType === "Boiler" ? "selected" : ""}>Boiler</option>
                  <option value="Heat Pump" ${systemEquipmentType === "Heat Pump" ? "selected" : ""}>Heat Pump</option>
                  <option value="Radiant" ${systemEquipmentType === "Radiant" ? "selected" : ""}>Radiant / In-floor</option>
                  <option value="Other" ${systemEquipmentType === "Other" ? "selected" : ""}>Other / Not sure</option>
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
                  <option value="Central A/C" ${systemEquipmentType === "Central A/C" ? "selected" : ""}>Central A/C</option>
                  <option value="Ductless Mini-Split" ${systemEquipmentType === "Ductless Mini-Split" ? "selected" : ""}>
                    Ductless Mini-Split
                  </option>
                  <option value="Heat Pump" ${systemEquipmentType === "Heat Pump" ? "selected" : ""}>Heat Pump</option>
                  <option value="Window / Portable Unit" ${systemEquipmentType === "Window / Portable Unit" ? "selected" : ""}>
                    Window / Portable Unit
                  </option>
                  <option value="Other" ${systemEquipmentType === "Other" ? "selected" : ""}>Other / Not sure</option>
                </select>
              </span>
            </span>
          </label>
        </div>
      </fieldset>

      <p class="form-error" data-form-error hidden></p>

      <div class="modal-actions">
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

  const showDetailStep = (key) => {
    const content = MODAL_CONTENT[key] || MODAL_CONTENT.schedule;
    modalBody.innerHTML = content.body;
  };

  const openModal = (key) => {
    currentModalKey = key in MODAL_CONTENT ? key : "schedule";
    const content = MODAL_CONTENT[currentModalKey] || MODAL_CONTENT.schedule;
    lastFocusedEl = document.activeElement instanceof HTMLElement ? document.activeElement : null;

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
    if (!leadForm && !systemForm && !serviceForm && !addrForm && !reviewForm) return;
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
      }, 2850);
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
      }, 2850);
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
      }, 2850);
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
      }, 2850);
      return;
    }

    if (reviewForm) {
      showSplashStep();
      window.clearTimeout(splashTimer);
      window.clearTimeout(splashTimer2);
      splashTimer = window.setTimeout(() => {
        if (!isModalOpen()) return;

        // Extra splash before final details.
        modalBody.innerHTML = `
          <div class="modal-splash" role="status" aria-live="polite">
            <div class="splash-stage" aria-hidden="true">
              <i class="fa-solid fa-fire-flame-curved splash-ico splash-ico-flame" aria-hidden="true"></i>
              <i class="fa-regular fa-snowflake splash-ico splash-ico-snow" aria-hidden="true"></i>
              <i class="fa-solid fa-fan splash-ico splash-ico-vent" aria-hidden="true"></i>
              <i class="fa-solid fa-wind splash-ico splash-ico-air" aria-hidden="true"></i>
            </div>
            <p class="splash-title"><strong>Almost done…</strong></p>
            <p class="splash-sub">Loading final details.</p>
          </div>
        `;

        splashTimer2 = window.setTimeout(() => {
          if (!isModalOpen()) return;
          showDetailStep(currentModalKey);
          requestAnimationFrame(() => {
            const focusable = getFocusable(modalOverlay);
            focusable[0]?.focus?.();
          });
        }, 1600);
      }, 2850);
    }
  });

})();


