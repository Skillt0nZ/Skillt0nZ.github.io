document.addEventListener("DOMContentLoaded", () => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) =>
    Array.from(root.querySelectorAll(selector));

  const prefersReducedMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Footer year
  $$("#year").forEach((node) => {
    node.textContent = new Date().getFullYear();
  });

  // Sound effects
  let soundEnabled = false;
  let audioContext = null;
  let masterGain = null;

  const soundButton = $("#sound-toggle");

  function ensureAudio() {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return false;

    if (!audioContext) {
      audioContext = new AudioContextClass();
      masterGain = audioContext.createGain();
      masterGain.gain.value = 0.22;
      masterGain.connect(audioContext.destination);
    }

    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    return true;
  }

  function tone({
    frequency = 440,
    endFrequency = frequency,
    duration = 0.07,
    type = "square",
    volume = 0.14,
    delay = 0,
    filter = 5000
  } = {}) {
    if (!soundEnabled || !ensureAudio()) return;

    const start = audioContext.currentTime + delay;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const lowpass = audioContext.createBiquadFilter();

    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(20, frequency), start);
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(20, endFrequency),
      start + duration
    );

    lowpass.type = "lowpass";
    lowpass.frequency.setValueAtTime(filter, start);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(
      Math.max(0.0002, volume),
      start + 0.008
    );
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      start + duration
    );

    osc.connect(lowpass);
    lowpass.connect(gain);
    gain.connect(masterGain);

    osc.start(start);
    osc.stop(start + duration + 0.02);
  }

  function clickSound() {
    tone({
      frequency: 760,
      endFrequency: 430,
      duration: 0.035,
      volume: 0.045,
      filter: 2600
    });
  }

  function revSound() {
    if (!soundEnabled || !ensureAudio()) return;

    tone({
      frequency: 58,
      endFrequency: 145,
      duration: 0.72,
      type: "sawtooth",
      volume: 0.23,
      filter: 900
    });

    tone({
      frequency: 116,
      endFrequency: 290,
      duration: 0.58,
      type: "sawtooth",
      volume: 0.11,
      delay: 0.035,
      filter: 1450
    });

    tone({
      frequency: 760,
      endFrequency: 190,
      duration: 0.16,
      type: "square",
      volume: 0.045,
      delay: 0.05,
      filter: 1800
    });

    window.setTimeout(() => {
      tone({
        frequency: 160,
        endFrequency: 45,
        duration: 0.2,
        type: "sawtooth",
        volume: 0.09,
        filter: 700
      });
    }, 160);
  }

  function setSound(value) {
    soundEnabled = value;
    document.body.classList.toggle("sfx-enabled", value);

    if (soundButton) {
      soundButton.setAttribute("aria-pressed", String(value));
      soundButton.setAttribute(
        "aria-label",
        value ? "Disable sound effects" : "Enable sound effects"
      );
      soundButton.title = value
        ? "Sound effects on"
        : "Sound effects off";

      const label = $("span", soundButton);
      if (label) label.textContent = value ? "ON" : "OFF";
    }

    if (value) {
      ensureAudio();
      tone({
        frequency: 620,
        endFrequency: 880,
        duration: 0.08,
        type: "sine",
        volume: 0.08
      });
    }
  }

  if (soundButton) {
    soundButton.addEventListener("click", () => {
      setSound(!soundEnabled);
    });
  }

  // Mobile navigation
  const menuButton = $(".menu-toggle");
  const nav = $(".nav-links");

  if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
      const open = nav.classList.toggle("open");

      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.setAttribute(
        "aria-label",
        open ? "Close navigation" : "Open navigation"
      );

      const sign = $("span", menuButton);
      if (sign) sign.textContent = open ? "×" : "＋";

      clickSound();
    });

    $$("a", nav).forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Open navigation");

        const sign = $("span", menuButton);
        if (sign) sign.textContent = "＋";
      });
    });
  }

  // Theme toggle
  const themeButton = $("#theme-toggle");
  let theme = "light";

  try {
    theme = localStorage.getItem("skillton-theme") || "light";
  } catch (_) {}

  function setTheme(value) {
    theme = value;
    document.body.classList.toggle("dark-theme", value === "dark");

    if (themeButton) {
      themeButton.textContent = value === "dark" ? "☾" : "☼";
      themeButton.setAttribute(
        "aria-label",
        value === "dark"
          ? "Switch to light theme"
          : "Switch to dark theme"
      );
      themeButton.title = themeButton.getAttribute("aria-label");
    }
  }

  setTheme(theme);

  if (themeButton) {
    themeButton.addEventListener("click", () => {
      const next = theme === "dark" ? "light" : "dark";
      setTheme(next);

      try {
        localStorage.setItem("skillton-theme", next);
      } catch (_) {}

      clickSound();
    });
  }

  // Homepage engine button
  const revButton = $("#rev-button");

  if (revButton) {
    let revCount = 0;

    revButton.addEventListener("click", () => {
      revCount++;

      const hero = $(".home-hero");
      const message = $("#rev-message");

      if (hero) {
        hero.classList.remove("engine-on");
        void hero.offsetWidth;
        hero.classList.add("engine-on");

        window.setTimeout(() => {
          hero.classList.remove("engine-on");
        }, 1000);
      }

      if (message) {
        const lines = [
          "ENGINE ON. PROBABLY A BAD IDEA.",
          "BRRRR— OKAY, THAT WAS LOUD.",
          "DEVIL CONTRACT? DECLINED. AGAIN.",
          "ENGINE OVERHEATED. TAKE A BREATH."
        ];

        message.textContent = lines[(revCount - 1) % lines.length];
      }

      revSound();
      clickSound();
    });
  }

  // Chainsaw Man feature
  const cordButton = $("#pull-cord");

  if (cordButton) {
    let pulls = 0;

    cordButton.addEventListener("click", () => {
      pulls++;

      const feature = $("#chainsaw-feature");
      const status = $("#chainsaw-status");

      if (feature) {
        feature.classList.remove("revving");
        void feature.offsetWidth;
        feature.classList.add("revving");

        window.setTimeout(() => {
          feature.classList.remove("revving");
        }, 1100);
      }

      if (status) {
        const lines = [
          "ENGINE STATUS: DENJI MODE",
          "POWERRRR— ENGINE IS ALIVE",
          "POCHITA APPROVES. PROBABLY.",
          "DEVIL HUNT MODE: ACTIVATED"
        ];

        status.textContent = lines[(pulls - 1) % lines.length];
      }

      revSound();

      if (feature) {
        feature.classList.add("sfx-flash");

        window.setTimeout(() => {
          feature.classList.remove("sfx-flash");
        }, 260);
      }
    });
  }

  // Anime search, filters and collection
  const search = $("#anime-search");
  const cards = $$(".anime-card[data-title]");

  // One Piece: episode 82 on October 24, 2026.
  // Automatically adds two episodes per calendar day.
  const onePieceCard = cards.find(
    (card) => card.dataset.title === "One Piece"
  );

  function updateOnePieceProgress() {
    if (!onePieceCard) return;

    const now = new Date();

    const today = Date.UTC(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const startDate = Date.UTC(2026, 9, 24);

    const daysPassed = Math.max(
      0,
      Math.floor((today - startDate) / 86400000)
    );

    const episode = 82 + daysPassed * 2;

    const progressLabel = $(
      "[data-one-piece-progress]",
      onePieceCard
    );

    if (progressLabel) {
      progressLabel.textContent =
        `1999 · EPISODE ${episode} · + 2 MOVIES`;
    }

    onePieceCard.dataset.description =
      "Luffy and his crew sail across the seas in search of the legendary treasure. "
  }

  updateOnePieceProgress();

  const filterButtons = $$(".filter-btn");
  const noResults = $("#no-results");
  const resultCount = $("#result-count");

  let selectedGenre = "all";

  function filterAnime() {
    const term = (search?.value || "").trim().toLowerCase();
    let visible = 0;

    cards.forEach((card) => {
      const title = (card.dataset.title || "").toLowerCase();

      const genres = (card.dataset.genre || "")
        .toLowerCase()
        .split(/\s+/);

      const matches =
        title.includes(term) &&
        (selectedGenre === "all" || genres.includes(selectedGenre));

      card.hidden = !matches;

      if (matches) visible++;
    });

    if (noResults) noResults.hidden = visible !== 0;

    if (resultCount) {
      resultCount.textContent =
        `${String(visible).padStart(2, "0")} FILE${visible === 1 ? "" : "S"} FOUND`;
    }
  }

  if (search) {
    search.addEventListener("input", filterAnime);
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectedGenre = button.dataset.filter || "all";

      filterButtons.forEach((other) => {
        const active = other === button;

        other.classList.toggle("active", active);
        other.setAttribute("aria-pressed", String(active));
      });

      filterAnime();
      clickSound();
    });
  });

  // Modal helpers
  function openModal(modal) {
    if (!modal) return;

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");

    const closeButton = $(".modal-close", modal);
    if (closeButton) closeButton.focus();

    clickSound();
  }

  function closeModal(modal) {
    if (!modal) return;

    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");

    if (!$(".modal.open")) {
      document.body.classList.remove("modal-open");
    }

    clickSound();
  }

  $$("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", () => {
      closeModal(button.closest(".modal"));
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      $$(".modal.open").forEach(closeModal);
    }
  });

  // Anime details popup
  const animeModal = $("#anime-modal");

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      if (!animeModal) return;

      const image = $("#modal-image");
      const title = $("#modal-title");
      const description = $("#modal-description");
      const meta = $("#modal-meta");

      if (image) {
        image.src = card.dataset.image || "";
        image.alt = `${card.dataset.title || "Anime"} poster`;
      }

      if (title) {
        title.textContent = card.dataset.title || "ANIME FILE";
      }

      if (description) {
        description.textContent =
          card.dataset.description || "No description added yet.";
      }

      if (meta) {
        meta.textContent =
          `${card.dataset.year || "YEAR UNKNOWN"} / ` +
          (card.dataset.genre || "uncategorized")
            .replace(/\b\w/g, (c) => c.toUpperCase())
            .replaceAll(" ", " · ");
      }

      openModal(animeModal);
    });
  });

  // Random anime picker
  const randomButton = $("#random-pick");

  if (randomButton) {
    randomButton.addEventListener("click", () => {
      const available = cards.filter((card) => !card.hidden);

      if (!available.length) {
        if (search) search.value = "";

        const allButton = filterButtons.find(
          (button) => button.dataset.filter === "all"
        );

        if (allButton) allButton.click();
        return;
      }

      const chosen =
        available[Math.floor(Math.random() * available.length)];

      chosen.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "center"
      });

      chosen.classList.remove("picked");
      void chosen.offsetWidth;
      chosen.classList.add("picked");

      window.setTimeout(() => {
        chosen.classList.remove("picked");
      }, 1400);

      chosen.click();
    });
  }

  // 3D poster tilt
  if (
    !prefersReducedMotion &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches
  ) {
    const tiltItems = $$(
      ".poster-frame, .chainsaw-feature-poster, .anime-card, .photo-card"
    );

    tiltItems.forEach((item) => {
      item.addEventListener("pointermove", (event) => {
        const rect = item.getBoundingClientRect();

        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;

        const max =
          item.classList.contains("poster-frame") ||
          item.classList.contains("chainsaw-feature-poster")
            ? 7
            : 4;

        item.style.transform =
          `perspective(900px) rotateX(${(0.5 - y) * max}deg) ` +
          `rotateY(${(x - 0.5) * max}deg) translateY(-2px)`;
      });

      item.addEventListener("pointerleave", () => {
        item.style.transform = "";
      });
    });
  }

  // Photo gallery
  const photoCards = $$(".photo-card[data-photo]");
  const photoModal = $("#photo-modal");

  photoCards.forEach((card) => {
    const img = $("img", card);

    if (img) {
      const markLoaded = () => card.classList.add("has-image");

      if (img.complete && img.naturalWidth > 0) {
        markLoaded();
      }

      img.addEventListener("load", markLoaded);

      img.addEventListener("error", () => {
        card.classList.remove("has-image");
        img.hidden = true;
      });
    }

    card.addEventListener("click", () => {
      if (!photoModal || !card.classList.contains("has-image")) return;

      const source = card.dataset.photo || "";
      const sourceImage = $("img", card);
      const modalImage = $("#photo-modal-image");
      const caption = $("#photo-modal-caption");

      if (modalImage) {
        modalImage.src = source;
        modalImage.alt =
          sourceImage?.alt || card.dataset.caption || "Expanded photo";
      }

      if (caption) {
        caption.textContent = (
          card.dataset.caption || "PHOTO"
        ).toUpperCase();
      }

      openModal(photoModal);
    });
  });

  // Missing posters show a clean placeholder
  $$(".anime-card img").forEach((img) => {
    img.addEventListener("error", () => {
      img.style.visibility = "hidden";

      const wrap = img.closest(".poster-wrap");

      if (wrap) {
        wrap.style.background =
          "repeating-linear-gradient(135deg, var(--paper-2) 0 12px, var(--line) 12px 13px)";
        wrap.setAttribute("aria-label", "Poster image not found");
      }
    });
  });

  // Click feedback
  document.addEventListener(
    "click",
    (event) => {
      const target = event.target.closest("a, button");

      if (
        !target ||
        target.id === "sound-toggle" ||
        target.id === "pull-cord" ||
        target.id === "rev-button" ||
        target.id === "theme-toggle"
      ) {
        return;
      }

      if (target.closest(".nav-links") && target.tagName === "A") {
        return;
      }

      clickSound();
    },
    true
  );

  filterAnime();
});