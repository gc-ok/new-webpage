const navItems = [
  { href: "", label: "Home", match: "/" },
  { href: "about/", label: "About", match: "/about/" },
  {
    href: "services/",
    label: "Services",
    match: "/services/",
    children: [
      { href: "services/custom-software/", label: "Custom Software", match: "/services/custom-software/" },
      { href: "services/custom-analysis/", label: "Data Analysis", match: "/services/custom-analysis/" },
      { href: "services/teacher-coverage/", label: "Teacher Coverage", match: "/services/teacher-coverage/" },
      { href: "services/at-risk-analysis/", label: "At-Risk Analysis", match: "/services/at-risk-analysis/" }
    ]
  },
  { href: "ai-training/", label: "AI Training", match: "/ai-training/" },
  { href: "contact/", label: "Contact", match: "/contact/" }
];

const calendlyUrl = "https://calendly.com/gcastillo-gceducationanalytics/30min?hide_event_type_details=1&hide_gdpr_banner=1";
let calendlyAssetsPromise = null;

function normalizePath(pathname) {
  if (!pathname) return "/";
  let normalized = pathname.replace(/index\.html$/, "");
  if (!normalized.endsWith("/")) normalized += "/";
  return normalized;
}

function renderHeader(root, currentPath) {
  const navHtml = navItems
    .map((item) => {
      const itemPath = item.match === "/" ? "/" : item.match;
      const childActive = item.children?.some((child) => currentPath.includes(child.match)) || false;
      const active =
        itemPath === "/"
          ? currentPath === "/"
          : currentPath.includes(itemPath) || childActive;

      if (!item.children?.length) {
        return `<a class="site-nav__link${active ? ' is-active' : ""}" href="${root}${item.href}"${active ? ' aria-current="page"' : ""}>${item.label}</a>`;
      }

      const submenuId = `submenu-${item.label.toLowerCase().replace(/\s+/g, "-")}`;
      const childHtml = item.children
        .map((child) => {
          const childIsActive = currentPath.includes(child.match);
          return `<a class="site-nav__submenu-link${childIsActive ? ' is-active' : ""}" href="${root}${child.href}"${childIsActive ? ' aria-current="page"' : ""}>${child.label}</a>`;
        })
        .join("");

      return `
        <div class="site-nav__item site-nav__item--has-submenu${active ? ' is-active' : ""}">
          <a class="site-nav__link${active ? ' is-active' : ""}" href="${root}${item.href}"${active ? ' aria-current="page"' : ""}>${item.label}</a>
          <button class="site-nav__submenu-toggle" type="button" aria-expanded="false" aria-controls="${submenuId}" aria-label="Toggle ${item.label} submenu">
            <span aria-hidden="true">v</span>
          </button>
          <div id="${submenuId}" class="site-nav__submenu">
            ${childHtml}
          </div>
        </div>
      `;
    })
    .join("");

  return `
    <div class="site-header__inner">
      <a class="brand" href="${root}">
        <img class="brand__logo" src="${root}assets/images/gceducationlogo.png" alt="GC Education Analytics logo">
        <div class="brand__text">
          <span class="brand__name">GC Education Analytics LLC</span>
          <span class="brand__sub">Custom software, data analytics, and AI training</span>
        </div>
      </a>
      <div class="site-header__right">
        <nav id="primary-navigation" class="site-nav" aria-label="Primary navigation">
          ${navHtml}
        </nav>
        <button class="theme-toggle" type="button" data-theme-toggle aria-label="Switch color theme">
          <span class="theme-toggle__icon" aria-hidden="true"></span>
          <span class="theme-toggle__text">Dark</span>
        </button>
        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-navigation" aria-label="Toggle navigation">
          <span>Menu</span>
        </button>
      </div>
    </div>
  `;
}

function renderFooter(root) {
  return `
    <div class="footer__inner">
      <div class="footer__panel">
        <div class="footer__top">
          <div>
            <div class="footer__eyebrow">GC Education Analytics LLC</div>
            <h3>Custom software, data analytics, and AI training.</h3>
            <p>Practical systems for schools that want less friction, clearer data, and tools built around the way staff actually work.</p>
          </div>
          <div class="footer__contact">
            <a href="mailto:gcastillo@gceducationanalytics.com">gcastillo@gceducationanalytics.com</a>
            <a href="${calendlyUrl}" data-calendly-popup>Book a consultation</a>
          </div>
        </div>
        <div class="footer__meta">
          <div class="footer__nav">
            <a href="${root}about/">About</a>
            <a href="${root}services/">Services</a>
            <a href="${root}ai-training/">AI Training</a>
            <a href="${root}examples/">Examples</a>
            <a href="${root}privacy/">Privacy</a>
            <a href="${root}terms/">Terms</a>
          </div>
          <div>
            <span>GC Education Analytics LLC</span>
            <span> &middot; </span>
            <span><a href="mailto:gcastillo@gceducationanalytics.com">gcastillo@gceducationanalytics.com</a></span>
            <span> &middot; </span>
            <span>&copy; <span data-year></span></span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderBackgroundLayer(root) {
  return `
    <img class="bg-motion__image" src="${root}assets/svg/background.svg" alt="" role="presentation" aria-hidden="true" width="1084" height="322" decoding="sync" fetchpriority="high">
    <div class="bg-motion__wash"></div>
  `;
}

function renderDock() {
  return `
    <div class="site-dock__inner">
      <div class="site-dock__copy">
        <div class="site-dock__eyebrow">Calendly</div>
        <div class="site-dock__title">Free consultation</div>
        <div class="site-dock__meta">30-minute intro call</div>
      </div>
      <div class="site-dock__actions">
        <a class="button site-dock__button" href="${calendlyUrl}" data-calendly-popup>Book now</a>
      </div>
    </div>
  `;
}

function setupDockBehavior(dockMount) {
  if (!dockMount) return;

  const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!supportsHover) {
    dockMount.classList.remove("is-compact");
    return;
  }

  const compactDelay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 3800;
  let compactTimer = null;

  const clearCompactTimer = () => {
    if (compactTimer !== null) {
      window.clearTimeout(compactTimer);
      compactTimer = null;
    }
  };

  const expandDock = () => {
    clearCompactTimer();
    dockMount.classList.remove("is-compact");
  };

  const compactDock = () => {
    dockMount.classList.add("is-compact");
    compactTimer = null;
  };

  const scheduleCompactDock = () => {
    clearCompactTimer();
    compactTimer = window.setTimeout(compactDock, compactDelay);
  };

  dockMount.addEventListener("mouseenter", expandDock);
  dockMount.addEventListener("mouseleave", scheduleCompactDock);
  dockMount.addEventListener("focusin", expandDock);
  dockMount.addEventListener("focusout", (event) => {
    if (!dockMount.contains(event.relatedTarget)) {
      scheduleCompactDock();
    }
  });

  scheduleCompactDock();
}

function loadCalendlyAssets() {
  if (calendlyAssetsPromise) return calendlyAssetsPromise;

  calendlyAssetsPromise = new Promise((resolve, reject) => {
    if (!document.querySelector('link[data-calendly-css]')) {
      const stylesheet = document.createElement("link");
      stylesheet.rel = "stylesheet";
      stylesheet.href = "https://assets.calendly.com/assets/external/widget.css";
      stylesheet.dataset.calendlyCss = "true";
      document.head.appendChild(stylesheet);
    }

    if (window.Calendly) {
      resolve(window.Calendly);
      return;
    }

    const existingScript = document.querySelector('script[data-calendly-js], script[src*="assets.calendly.com/assets/external/widget.js"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(window.Calendly), { once: true });
      existingScript.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    script.dataset.calendlyJs = "true";
    script.addEventListener("load", () => resolve(window.Calendly), { once: true });
    script.addEventListener("error", reject, { once: true });
    document.head.appendChild(script);
  });

  calendlyAssetsPromise.catch(() => {
    calendlyAssetsPromise = null;
  });

  return calendlyAssetsPromise;
}

async function openCalendlyPopup(url) {
  const Calendly = await loadCalendlyAssets();
  if (!Calendly || typeof Calendly.initPopupWidget !== "function") {
    throw new Error("Calendly popup widget is unavailable.");
  }
  Calendly.initPopupWidget({ url });
}

function getPreferredTheme() {
  let storedTheme = null;
  try {
    storedTheme = localStorage.getItem("gcea-theme");
  } catch (error) {
    storedTheme = null;
  }
  if (storedTheme === "dark" || storedTheme === "light") return storedTheme;
  return "dark";
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.body.dataset.theme = theme;
  try {
    localStorage.setItem("gcea-theme", theme);
  } catch (error) {
    // Local file previews can block storage; the visual theme should still switch.
  }

  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    button.setAttribute("aria-label", `Switch to ${nextTheme} mode`);
    const text = button.querySelector(".theme-toggle__text");
    if (text) text.textContent = theme === "dark" ? "Light" : "Dark";
  });
}

function syncPrimaryNavigation(currentPath) {
  document.querySelectorAll(".site-nav a").forEach((link, index) => {
    const href = link.getAttribute("href");
    if (!href) return;

    const resolvedPath = normalizePath(new URL(href, window.location.href).pathname);
    const active =
      index === 0
        ? resolvedPath === currentPath
        : currentPath.includes(resolvedPath);

    link.classList.toggle("is-active", active);
    if (active) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const root = body.dataset.root || "";
  const currentPath = normalizePath(window.location.pathname);

  applyTheme(getPreferredTheme());

  const headerMount = document.getElementById("site-header");
  let bgMount = document.getElementById("bg-motion");
  if (!bgMount) {
    bgMount = document.createElement("div");
    bgMount.id = "bg-motion";
    document.body.prepend(bgMount);
  }
  bgMount.className = "bg-motion";
  bgMount.innerHTML = renderBackgroundLayer(root);

  if (headerMount) {
    headerMount.className = "site-header";
    headerMount.innerHTML = renderHeader(root, currentPath);
  }

  const footerMount = document.getElementById("site-footer");
  if (footerMount) {
    footerMount.className = "footer";
    footerMount.innerHTML = renderFooter(root);
  }

  const dockMount = document.getElementById("site-dock");
  if (dockMount) {
    dockMount.className = "site-dock";
    dockMount.innerHTML = renderDock();
    setupDockBehavior(dockMount);
  }

  syncPrimaryNavigation(currentPath);

  loadCalendlyAssets().catch(() => {});

  document.addEventListener("click", (event) => {
    const calendlyLink = event.target.closest("[data-calendly-popup]");
    if (!calendlyLink) return;

    event.preventDefault();
    const url = calendlyLink.getAttribute("href") || calendlyUrl;
    openCalendlyPopup(url).catch(() => {
      window.location.href = url;
    });
  });

  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const themeToggle = document.querySelector("[data-theme-toggle]");
  applyTheme(document.documentElement.dataset.theme || getPreferredTheme());

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const currentTheme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
      applyTheme(currentTheme === "dark" ? "light" : "dark");
    });
  }

  if (header && toggle) {
    toggle.addEventListener("click", () => {
      const open = header.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    let isTicking = false;
    let scrolledState = null;
    const syncHeaderState = () => {
      const nextState = window.scrollY > 12;
      if (nextState !== scrolledState) {
        header.classList.toggle("is-scrolled", nextState);
        scrolledState = nextState;
      }
      isTicking = false;
    };
    syncHeaderState();
    window.addEventListener(
      "scroll",
      () => {
        if (!isTicking) {
          window.requestAnimationFrame(syncHeaderState);
          isTicking = true;
        }
      },
      { passive: true }
    );
  }

  document.querySelectorAll(".site-nav__submenu-toggle").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const parent = button.closest(".site-nav__item--has-submenu");
      if (!parent) return;
      document.querySelectorAll(".site-nav__item--has-submenu.is-open").forEach((item) => {
        if (item === parent) return;
        item.classList.remove("is-open");
        item.querySelector(".site-nav__submenu-toggle")?.setAttribute("aria-expanded", "false");
      });
      const open = parent.classList.toggle("is-open");
      button.setAttribute("aria-expanded", String(open));
    });
  });

  document.addEventListener("click", (event) => {
    if (event.target.closest(".site-nav__item--has-submenu")) return;
    document.querySelectorAll(".site-nav__item--has-submenu.is-open").forEach((item) => {
      item.classList.remove("is-open");
      item.querySelector(".site-nav__submenu-toggle")?.setAttribute("aria-expanded", "false");
    });
  });

  document.querySelectorAll("[data-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });

  document.querySelectorAll("form[data-dynamic-next]").forEach((form) => {
    const siteRoot = new URL(root || ".", window.location.href);
    const thankYouUrl = new URL("thank-you/", siteRoot).href;
    const nextInput = form.querySelector('input[name="_next"]');
    if (nextInput) nextInput.value = thankYouUrl;
  });

  const revealTargets = document.querySelectorAll(
    ".hero__content, .panel, .section__header, .chapter-band, .product-showcase__copy, .browser-frame, .mini-browser, .card, .metric, .outcome-card, .comparison-card, .deliverable, .gallery-card, .quote-card, .process__step, .cta-band, .legal-card"
  );

  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && "IntersectionObserver" in window) {
    revealTargets.forEach((node, index) => {
      node.classList.add("reveal");
      node.style.setProperty("--reveal-delay", `${(index % 4) * 35}ms`);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -12% 0px"
      }
    );

    revealTargets.forEach((node) => observer.observe(node));
  } else {
    revealTargets.forEach((node) => node.classList.add("is-visible"));
  }
});
