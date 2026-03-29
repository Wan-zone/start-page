const SEARCH_ENGINES = {
  google: "https://www.google.com/search?q=",
  bing: "https://www.bing.com/search?q=",
  baidu: "https://www.baidu.com/s?wd=",
};

const THEME_STORAGE_KEY = "wan-start-page-theme";

const QUICK_LINKS = [
  {
    title: "GitHub",
    description: "仓库、变更与协作入口。",
    href: "https://github.com/",
    domain: "Code",
    icon: "github",
  },
  {
    title: "ChatGPT",
    description: "写作、整理与代码辅助。",
    href: "https://chatgpt.com/",
    domain: "Assist",
    icon: "spark",
  },
  {
    title: "Gemini",
    description: "补充检索与多模型参考。",
    href: "https://gemini.google.com/",
    domain: "Search",
    icon: "gemini",
  },
  {
    title: "Claude",
    description: "补充长文本整理与代码讨论。",
    href: "https://claude.ai/",
    domain: "Assist",
    icon: "spark",
  },
  {
    title: "Google Drive",
    description: "快速查看与整理常用文件。",
    href: "https://drive.google.com/",
    domain: "Files",
    icon: "drive",
  },
  {
    title: "Notion",
    description: "记录项目笔记和零散资料。",
    href: "https://www.notion.so/",
    domain: "Notes",
    icon: "note",
  },
  {
    title: "X",
    description: "快速看动态和技术消息流。",
    href: "https://x.com/",
    domain: "Feed",
    icon: "x",
  },
  {
    title: "Bilibili",
    description: "教程、收藏夹和轻量放松。",
    href: "https://www.bilibili.com/",
    domain: "Media",
    icon: "play",
  },
  {
    title: "DeepSeek",
    description: "补充问答和轻量检索入口。",
    href: "https://chat.deepseek.com/",
    domain: "AI",
    icon: "spark",
  },
];

const FALLBACK_QUOTES = [
  { text: "先做关键事，再看噪音。", source: "默认提醒" },
  { text: "开始比完美更重要。", source: "默认提醒" },
  { text: "把复杂问题拆成今天能动的一步。", source: "默认提醒" },
];

const FOCUS_POOLS = {
  morning: [
    {
      title: "上午适合先处理最需要清醒度的任务。",
      meta: "把最难的一项放在前面，其他事情往后退。",
    },
    {
      title: "先把真正需要深度思考的部分推进一段。",
      meta: "不要一醒来就被消息和碎任务拉走。",
    },
    {
      title: "给主线工作一整段连续时间。",
      meta: "清醒时段优先留给最关键的判断和输出。",
    },
  ],
  afternoon: [
    {
      title: "把注意力留给真正需要收口的事情。",
      meta: "减少切换，把执行阶段留得更完整。",
    },
    {
      title: "下午更适合推进、整理和完成。",
      meta: "别把节奏切太碎，先收掉已开的任务。",
    },
    {
      title: "优先做能让今天明显前进的一步。",
      meta: "不是开新坑，而是把已有事情推到更靠前的位置。",
    },
  ],
  evening: [
    {
      title: "给总结和回收留一点空间。",
      meta: "把今天沉淀下来，明天会更顺。",
    },
    {
      title: "晚上更适合整理，而不是继续铺开。",
      meta: "收束任务、补记录、留出明天的起点。",
    },
    {
      title: "把今天的结论写下来，比继续发散更值。",
      meta: "留一个清楚的尾声，明天会更容易接上。",
    },
  ],
};

const FALLBACK_GALLERY_IMAGES = [
  {
    src: "./assets/gallery/hero-reference.jpg",
    alt: "Gallery preview one",
    caption: "完整显示原图，先看比例、留白和整体气质。",
  },
  {
    src: "./assets/gallery/fee6b42c07076c5227b9963004734fbe.jpg",
    alt: "Gallery preview two",
    caption: "切换另一张图，观察不同照片在卡片系统里的稳定性。",
  },
];

const body = document.body;
const themeSwitch = document.querySelector(".theme-switch");
const themeHighlight = themeSwitch.querySelector(".segment-highlight");
const themeDarkButton = document.getElementById("themeDarkButton");
const themeLightButton = document.getElementById("themeLightButton");
const railIndicator = document.getElementById("railIndicator");
const railDots = document.querySelectorAll(".rail-dot");
const greetingTitle = document.getElementById("greetingTitle");
const timeCard = document.getElementById("timeCard");
const focusTitle = document.getElementById("focusTitle");
const focusMeta = document.getElementById("focusMeta");
const focusCard = document.getElementById("focusCard");
const clockText = document.getElementById("clockText");
const dateText = document.getElementById("dateText");
const quoteCard = document.getElementById("quoteCard");
const quoteText = document.getElementById("quoteText");
const quoteSource = document.getElementById("quoteSource");
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const quickLinksGrid = document.getElementById("quickLinksGrid");
const engineSwitch = document.querySelector(".engine-switch");
const engineHighlight = engineSwitch.querySelector(".segment-highlight");
const enginePills = document.querySelectorAll(".engine-pill");
const galleryFrame = document.getElementById("galleryFrame");
const galleryPrevButton = document.getElementById("galleryPrevButton");
const galleryZoomButton = document.getElementById("galleryZoomButton");
const galleryImage = document.getElementById("galleryImage");
const galleryCaption = document.getElementById("galleryCaption");
const galleryLightbox = document.getElementById("galleryLightbox");
const galleryLightboxImage = document.getElementById("galleryLightboxImage");
const galleryLightboxCaption = document.getElementById("galleryLightboxCaption");
const galleryLightboxClose = document.getElementById("galleryLightboxClose");
const mascotWidget = document.getElementById("mascotWidget");
const mascotButton = document.getElementById("mascotButton");
const mascotBubble = document.getElementById("mascotBubble");
const sectionTargets = Array.from(railDots)
  .map((button) => document.getElementById(button.dataset.target))
  .filter(Boolean);

let activeEngine = "google";
let quotePool = FALLBACK_QUOTES;
let galleryImages = FALLBACK_GALLERY_IMAGES;
let currentImageIndex = 0;
let detailedClockEnabled = false;
let currentFocusPeriod = "";
let themeSegmentControl;
let engineSegmentControl;
let pageDragState = null;
let mascotReactionTimer = 0;
let mascotTalkingTimer = 0;

const MASCOT_LINES = [
  "先搜索，再动手。",
  "今天也别切太碎。",
  "推进一点就是前进。",
  "先把主线做完。",
  "我在右下角陪你。",
  "点我会有反应。",
];

const LINK_ICONS = {
  github: `
    <svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M9 18c-4 1.5-4-2-6-2" />
      <path d="M15 22v-3.5c0-1 .3-1.8.9-2.4C12.7 15.7 9 14.5 9 9.5a5 5 0 0 1 1.3-3.4A4.6 4.6 0 0 1 10.4 3S11.6 2.6 14 4.2A8.2 8.2 0 0 1 20 6a5 5 0 0 1 1.3 3.5c0 5-3.7 6.2-6.9 6.6.6.6.9 1.4.9 2.4V22" />
    </svg>
  `,
  spark: `
    <svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3z" />
      <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z" />
    </svg>
  `,
  gemini: `
    <svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 3c.8 4.2 4.1 7.5 8.3 8.3C16.1 12.1 12.8 15.4 12 19.6c-.8-4.2-4.1-7.5-8.3-8.3C7.9 10.5 11.2 7.2 12 3z" />
    </svg>
  `,
  mail: `
    <svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="M4.5 7l7.5 6 7.5-6" />
    </svg>
  `,
  calendar: `
    <svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="4" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </svg>
  `,
  play: `
    <svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="4" />
      <path d="M11 10l4 2-4 2v-4z" />
    </svg>
  `,
  drive: `
    <svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M9 4h6l6 10-3 6H6l-3-6L9 4z" />
      <path d="M9 4l6 10M6 20l6-10M3 14h18" />
    </svg>
  `,
  note: `
    <svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M7 3h8l4 4v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      <path d="M15 3v5h5M9 13h6M9 17h4" />
    </svg>
  `,
  x: `
    <svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M5 4l14 16M19 4L5 20" />
    </svg>
  `,
};

function setTheme(theme) {
  const nextTheme = theme === "light" ? "light" : "dark";
  body.dataset.theme = nextTheme;

  themeDarkButton.classList.toggle("is-active", nextTheme === "dark");
  themeLightButton.classList.toggle("is-active", nextTheme === "light");
  themeDarkButton.setAttribute("aria-pressed", String(nextTheme === "dark"));
  themeLightButton.setAttribute("aria-pressed", String(nextTheme === "light"));

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  } catch (error) {
    // Ignore storage failures and keep the UI usable.
  }

  if (themeSegmentControl) {
    const targetButton = nextTheme === "dark" ? themeDarkButton : themeLightButton;
    themeSegmentControl.snapTo(targetButton);
  }
}

function getTimePeriod(hour) {
  if (hour < 11) {
    return "morning";
  }
  if (hour < 18) {
    return "afternoon";
  }
  return "evening";
}

function refreshFocus(forcePeriod) {
  const period = forcePeriod || currentFocusPeriod || "morning";
  const pool = FOCUS_POOLS[period] || FOCUS_POOLS.morning;
  const item = pool[Math.floor(Math.random() * pool.length)];
  focusTitle.textContent = item.title;
  focusMeta.textContent = item.meta;
}

function toDisplayImageSrc(src) {
  return encodeURI(src);
}

function randomFrom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function initializeTheme() {
  try {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
      return;
    }
  } catch (error) {
    // Ignore storage failures and use the default dark theme.
  }

  setTheme("dark");
}

function updateClock() {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const second = now.getSeconds();
  const timePeriod = getTimePeriod(hour);

  if (detailedClockEnabled) {
    clockText.textContent = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:${String(second).padStart(2, "0")}`;
  } else {
    clockText.textContent = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  }

  dateText.textContent = now.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  // Time-sensitive copy keeps the page feeling like a living system widget.
  if (timePeriod === "morning") {
    greetingTitle.textContent = "早上好，准备进入今天的重点。";
  } else if (timePeriod === "afternoon") {
    greetingTitle.textContent = "下午好，保持节奏，不要切得太碎。";
  } else {
    greetingTitle.textContent = "晚上好，适合整理、复盘和温和收束。";
  }

  if (currentFocusPeriod !== timePeriod) {
    currentFocusPeriod = timePeriod;
    refreshFocus(timePeriod);
  }
}

function renderQuickLinks() {
  const cards = QUICK_LINKS.map(
    (item) => `
      <a class="link-card glass-card" href="${item.href}" target="_blank" rel="noreferrer">
        <div class="link-top">
          <span class="link-icon">${LINK_ICONS[item.icon] ?? ""}</span>
        </div>
        <div class="link-copy">
          <h3 class="link-title">${item.title}</h3>
          <p class="link-description">${item.description}</p>
        </div>
        <span class="link-domain">${new URL(item.href).hostname.replace(/^www\./, "")}</span>
      </a>
    `
  ).join("");

  quickLinksGrid.innerHTML = cards;
}

function pickRandomQuote() {
  return quotePool[Math.floor(Math.random() * quotePool.length)];
}

function renderQuote() {
  const item = pickRandomQuote();
  quoteText.textContent = item.text;
  quoteSource.textContent = item.source;
}

async function loadQuotes() {
  try {
    const response = await fetch("./data/quotes.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Failed to load quotes");
    }
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      quotePool = data;
    }
  } catch (error) {
    quotePool = FALLBACK_QUOTES;
  }

  renderQuote();
}

function renderGalleryImage() {
  if (galleryImages.length === 0) {
    return;
  }

  const item = galleryImages[currentImageIndex % galleryImages.length];
  galleryImage.src = toDisplayImageSrc(item.src);
  galleryImage.alt = item.alt;
  galleryCaption.textContent = item.caption;
}

function showNextImage() {
  if (galleryImages.length === 0) {
    return;
  }

  currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
  renderGalleryImage();
}

function showPreviousImage() {
  if (galleryImages.length === 0) {
    return;
  }

  currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
  renderGalleryImage();
}

function openGalleryLightbox() {
  if (galleryImages.length === 0) {
    return;
  }

  const item = galleryImages[currentImageIndex % galleryImages.length];
  galleryLightboxImage.src = toDisplayImageSrc(item.src);
  galleryLightboxImage.alt = item.alt;
  galleryLightboxCaption.textContent = item.caption;
  galleryLightbox.classList.add("is-open");
  galleryLightbox.setAttribute("aria-hidden", "false");
}

function closeGalleryLightbox() {
  galleryLightbox.classList.remove("is-open");
  galleryLightbox.setAttribute("aria-hidden", "true");
}

function handleGalleryImageError() {
  if (galleryImages.length <= 1) {
    galleryCaption.textContent = "图片加载失败，请检查 gallery.json 和图片文件名。";
    return;
  }

  currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
  renderGalleryImage();
}

function reactMascot() {
  if (!mascotWidget || !mascotBubble) {
    return;
  }

  mascotBubble.textContent = randomFrom(MASCOT_LINES);
  mascotWidget.classList.remove("is-reacting");
  void mascotWidget.offsetWidth;
  mascotWidget.classList.add("is-talking", "is-reacting");
  window.clearTimeout(mascotReactionTimer);
  window.clearTimeout(mascotTalkingTimer);
  mascotReactionTimer = window.setTimeout(() => {
    mascotWidget.classList.remove("is-reacting");
  }, 520);
  mascotTalkingTimer = window.setTimeout(() => {
    mascotWidget.classList.remove("is-talking");
  }, 2200);
}

function moveMascotEyes(event) {
  if (!mascotButton) {
    return;
  }

  const rect = mascotButton.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const offsetX = Math.max(-5, Math.min(5, (event.clientX - centerX) / 36));
  const offsetY = Math.max(-3, Math.min(3, (event.clientY - centerY) / 42));
  const rotate = Math.max(-3.5, Math.min(3.5, (event.clientX - centerX) / 60));

  mascotButton.style.setProperty("--mascot-shift-x", `${offsetX}px`);
  mascotButton.style.setProperty("--mascot-shift-y", `${offsetY}px`);
  mascotButton.style.setProperty("--mascot-rotate", `${rotate}deg`);
}

async function loadGalleryManifest() {
  try {
    const response = await fetch("./data/gallery.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Failed to load gallery manifest");
    }

    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      galleryImages = data.map((item, index) => {
        if (typeof item === "string") {
          const filename = item.split("/").pop() || `image-${index + 1}`;
          return {
            src: `./assets/gallery/${item}`,
            alt: filename,
            caption: filename,
          };
        }

        const src = item.src.startsWith("./") ? item.src : `./assets/gallery/${item.src}`;
        return {
          src,
          alt: item.alt || `gallery-image-${index + 1}`,
          caption: item.caption || item.alt || "图库图片",
        };
      });
    }
  } catch (error) {
    galleryImages = FALLBACK_GALLERY_IMAGES;
  }

  currentImageIndex = currentImageIndex % galleryImages.length;
  renderGalleryImage();
}

function handleInteractiveKeydown(event, action) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    action();
  }
}

function setActiveEngine(engine) {
  activeEngine = engine;
  enginePills.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.engine === engine);
  });

  if (engineSegmentControl) {
    const targetButton = Array.from(enginePills).find((button) => button.dataset.engine === engine);
    if (targetButton) {
      engineSegmentControl.snapTo(targetButton);
    }
  }
}

function handleSearch(event) {
  event.preventDefault();
  const query = searchInput.value.trim();
  if (!query) {
    searchInput.focus();
    return;
  }

  const url = `${SEARCH_ENGINES[activeEngine]}${encodeURIComponent(query)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

function createRipple(event) {
  const host = event.currentTarget;
  const nearestHost = event.target.closest(".ripple-host");

  if (nearestHost && nearestHost !== host) {
    return;
  }

  const rect = host.getBoundingClientRect();
  const ripple = document.createElement("span");

  ripple.className = "ripple-wave";
  ripple.style.left = `${event.clientX - rect.left}px`;
  ripple.style.top = `${event.clientY - rect.top}px`;

  host.appendChild(ripple);
  ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
}

function initializeRipples() {
  const rippleTargets = document.querySelectorAll(
    ".glass-card, .theme-button, .engine-pill, .primary-button, .subtle-button, .game-entry, .interactive-panel, .rail-dot, .gallery-zoom-button"
  );

  rippleTargets.forEach((element) => {
    element.classList.add("ripple-host");
    element.addEventListener("pointerdown", createRipple);
  });
}

function shouldAllowTextSelection(target) {
  return Boolean(target.closest("input, textarea, [contenteditable='true']"));
}

function preventPageTextSelection(event) {
  if (!shouldAllowTextSelection(event.target)) {
    event.preventDefault();
  }
}

function shouldSkipPageDrag(target) {
  return Boolean(
    target.closest(
      "input, textarea, [contenteditable='true'], button, a, .theme-switch, .engine-switch, .section-rail, .interactive-panel, .link-card, .game-entry, canvas"
    )
  );
}

function beginPageDrag(event) {
  if (!event.isPrimary || shouldSkipPageDrag(event.target)) {
    return;
  }

  pageDragState = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    scrollLeft: window.scrollX,
    scrollTop: window.scrollY,
    moved: false,
  };

  body.classList.add("is-dragging-page");
}

function movePageDrag(event) {
  if (!pageDragState || event.pointerId !== pageDragState.pointerId) {
    return;
  }

  const deltaX = event.clientX - pageDragState.startX;
  const deltaY = event.clientY - pageDragState.startY;

  if (!pageDragState.moved && (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3)) {
    pageDragState.moved = true;
  }

  if (!pageDragState.moved) {
    return;
  }

  event.preventDefault();
  window.scrollTo(pageDragState.scrollLeft - deltaX, pageDragState.scrollTop - deltaY);
}

function endPageDrag(event) {
  if (!pageDragState || event.pointerId !== pageDragState.pointerId) {
    return;
  }

  pageDragState = null;
  body.classList.remove("is-dragging-page");
}

function moveRailIndicator(targetButton, animate = true) {
  if (!railIndicator || !targetButton) {
    return;
  }

  railIndicator.style.transition = animate ? "" : "none";
  railIndicator.classList.add("is-traveling");
  railIndicator.style.left = `${targetButton.offsetLeft}px`;
  railIndicator.style.top = `${targetButton.offsetTop}px`;

  if (!animate) {
    railIndicator.classList.remove("is-traveling");
    requestAnimationFrame(() => {
      railIndicator.style.transition = "";
    });
    return;
  }

  window.clearTimeout(moveRailIndicator.resetTimer);
  moveRailIndicator.resetTimer = window.setTimeout(() => {
    railIndicator.classList.remove("is-traveling");
  }, 240);
}

function setActiveRail(targetId) {
  let activeButton = null;

  railDots.forEach((button) => {
    const shouldActivate = button.dataset.target === targetId;
    button.classList.toggle("is-active", shouldActivate);
    if (shouldActivate) {
      activeButton = button;
    }
  });

  if (activeButton) {
    moveRailIndicator(activeButton);
  }
}

function updateActiveRailOnScroll() {
  if (sectionTargets.length === 0) {
    return;
  }

  const anchorLine = window.innerHeight * 0.32;
  let currentSection = sectionTargets[0];

  sectionTargets.forEach((section) => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= anchorLine) {
      currentSection = section;
    }
  });

  setActiveRail(currentSection.id);
}

function scrollToSection(sectionId) {
  const target = document.getElementById(sectionId);
  if (!target) {
    return;
  }

  target.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function positionSegmentHighlight(container, highlight, target, animate = true) {
  if (!container || !highlight || !target) {
    return;
  }

  const containerRect = container.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const insetLeft = parseFloat(window.getComputedStyle(highlight).left) || 0;
  const offset = targetRect.left - containerRect.left - insetLeft;

  highlight.style.transition = animate ? "" : "none";
  highlight.style.width = `${targetRect.width}px`;
  highlight.style.transformOrigin = "center center";
  highlight.style.left = `${insetLeft + offset}px`;
  highlight.style.transform = "scaleX(1) scaleY(1)";

  if (!animate) {
    requestAnimationFrame(() => {
      highlight.style.transition = "";
    });
  }
}

function createSegmentControl(container, highlight, buttons, onSelect) {
  if (!container || !highlight || buttons.length === 0) {
    return null;
  }

  let isDragging = false;
  let activePointerId = null;
  let currentTarget = buttons.find((button) => button.classList.contains("is-active")) ?? buttons[0];
  let dragOffsetX = 0;

  function getNearestButton(clientX) {
    let nearest = buttons[0];
    let bestDistance = Number.POSITIVE_INFINITY;

    buttons.forEach((button) => {
      const rect = button.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      const distance = Math.abs(clientX - center);
      if (distance < bestDistance) {
        bestDistance = distance;
        nearest = button;
      }
    });

    return nearest;
  }

  function getButtonBounds(button) {
    const containerRect = container.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    const insetLeft = parseFloat(window.getComputedStyle(highlight).left) || 0;
    return {
      left: buttonRect.left - containerRect.left,
      minLeft: buttonRect.left - containerRect.left - insetLeft,
      width: buttonRect.width,
      insetLeft,
    };
  }

  function syncCurrentButton(animate = true) {
    positionSegmentHighlight(container, highlight, currentTarget, animate);
  }

  function selectButton(button) {
    currentTarget = button;
    onSelect(button);
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      selectButton(button);
    });
  });

  container.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary) {
      return;
    }

    const targetButton = event.target.closest("button");
    if (!targetButton || !buttons.includes(targetButton)) {
      return;
    }

    event.preventDefault();
    isDragging = true;
    activePointerId = event.pointerId;
    currentTarget = targetButton;
    const bounds = getButtonBounds(targetButton);
    dragOffsetX = event.clientX - (container.getBoundingClientRect().left + bounds.left + bounds.width / 2);
    container.setPointerCapture(event.pointerId);
    positionSegmentHighlight(container, highlight, targetButton, false);
  });

  container.addEventListener("pointermove", (event) => {
    if (!isDragging || event.pointerId !== activePointerId) {
      return;
    }

    event.preventDefault();
    const containerRect = container.getBoundingClientRect();
    const firstBounds = getButtonBounds(buttons[0]);
    const lastBounds = getButtonBounds(buttons[buttons.length - 1]);
    const width = currentTarget.getBoundingClientRect().width;
    const minLeft = firstBounds.left;
    const maxLeft = lastBounds.left;
    const rawLeft = event.clientX - containerRect.left - dragOffsetX - width / 2;
    const clampedLeft = Math.max(minLeft, Math.min(maxLeft, rawLeft));
    const overshoot = rawLeft < minLeft ? minLeft - rawLeft : rawLeft > maxLeft ? rawLeft - maxLeft : 0;
    const stretch = overshoot > 0 ? Math.max(0.78, 1 - overshoot / 95) : 1;
    const squash = overshoot > 0 ? Math.min(1.25, 1 + overshoot / 80) : 1;

    highlight.style.transition = "none";
    highlight.style.left = `${clampedLeft}px`;
    highlight.style.transformOrigin = rawLeft < minLeft ? "left center" : rawLeft > maxLeft ? "right center" : "center center";
    highlight.style.transform = `scaleX(${stretch}) scaleY(${squash})`;
  });

  function finishDrag(event) {
    if (!isDragging || event.pointerId !== activePointerId) {
      return;
    }

    event.preventDefault();
    isDragging = false;
    activePointerId = null;
    if (container.hasPointerCapture(event.pointerId)) {
      container.releasePointerCapture(event.pointerId);
    }
    const nearest = getNearestButton(event.clientX);
    currentTarget = nearest;
    selectButton(currentTarget);
  }

  container.addEventListener("pointerup", finishDrag);
  container.addEventListener("pointercancel", finishDrag);

  return {
    snapTo(button, animate = true) {
      currentTarget = button;
      positionSegmentHighlight(container, highlight, button, animate);
    },
    refresh() {
      syncCurrentButton(false);
    },
  };
}

initializeTheme();
renderQuickLinks();
updateClock();
loadQuotes();
loadGalleryManifest();
initializeRipples();

themeSegmentControl = createSegmentControl(
  themeSwitch,
  themeHighlight,
  [themeDarkButton, themeLightButton],
  (button) => setTheme(button === themeLightButton ? "light" : "dark")
);

engineSegmentControl = createSegmentControl(
  engineSwitch,
  engineHighlight,
  Array.from(enginePills),
  (button) => setActiveEngine(button.dataset.engine)
);

themeSegmentControl?.refresh();
engineSegmentControl?.refresh();
setInterval(updateClock, 250);
railDots.forEach((button) => {
  button.addEventListener("click", () => scrollToSection(button.dataset.target));
});
searchForm.addEventListener("submit", handleSearch);
quoteCard.addEventListener("click", renderQuote);
quoteCard.addEventListener("keydown", (event) => handleInteractiveKeydown(event, renderQuote));
timeCard.addEventListener("click", () => {
  detailedClockEnabled = !detailedClockEnabled;
  updateClock();
});
timeCard.addEventListener("keydown", (event) =>
  handleInteractiveKeydown(event, () => {
    detailedClockEnabled = !detailedClockEnabled;
    updateClock();
  })
);
focusCard.addEventListener("click", () => refreshFocus());
focusCard.addEventListener("keydown", (event) => handleInteractiveKeydown(event, () => refreshFocus()));
galleryFrame.addEventListener("click", showNextImage);
galleryFrame.addEventListener("keydown", (event) => handleInteractiveKeydown(event, showNextImage));
galleryPrevButton.addEventListener("click", (event) => {
  event.stopPropagation();
  showPreviousImage();
});
galleryImage.addEventListener("error", handleGalleryImageError);
galleryLightboxImage.addEventListener("error", closeGalleryLightbox);
galleryZoomButton.addEventListener("click", (event) => {
  event.stopPropagation();
  openGalleryLightbox();
});
galleryLightboxClose.addEventListener("click", closeGalleryLightbox);
galleryLightbox.addEventListener("click", (event) => {
  if (event.target === galleryLightbox) {
    closeGalleryLightbox();
  }
});
mascotButton?.addEventListener("click", reactMascot);

window.addEventListener("load", () => {
  body.classList.add("is-ready");
  updateActiveRailOnScroll();
  const initialRail = document.querySelector(".rail-dot.is-active");
  if (initialRail) {
    moveRailIndicator(initialRail, false);
  }
});

window.addEventListener("scroll", updateActiveRailOnScroll, { passive: true });
window.addEventListener("resize", () => {
  themeSegmentControl?.refresh();
  engineSegmentControl?.refresh();
  const activeRail = document.querySelector(".rail-dot.is-active");
  if (activeRail) {
    moveRailIndicator(activeRail, false);
  }
});
document.addEventListener("pointerdown", beginPageDrag);
document.addEventListener("pointermove", movePageDrag, { passive: false });
document.addEventListener("pointerup", endPageDrag);
document.addEventListener("pointercancel", endPageDrag);
window.addEventListener("pointermove", moveMascotEyes, { passive: true });
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && galleryLightbox.classList.contains("is-open")) {
    closeGalleryLightbox();
  }
});
document.addEventListener("selectstart", preventPageTextSelection);
document.addEventListener("dblclick", preventPageTextSelection);
