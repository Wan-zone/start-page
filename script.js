const SEARCH_ENGINES = {
  google: "https://www.google.com/search?q=",
  bing: "https://www.bing.com/search?q=",
  baidu: "https://www.baidu.com/s?wd=",
};

const FALLBACK_QUOTES = [
  { text: "先做关键事，再看噪音。", source: "默认提醒" },
  { text: "开始比完美更重要。", source: "默认提醒" },
  { text: "把复杂问题拆成今天能动的一步。", source: "默认提醒" },
];

const GALLERY_IMAGES = [
  {
    src: "./assets/gallery/hero-reference.png",
    alt: "Start page gallery reference",
    caption: "图库实验图 1：完整显示原图，观察整体气质。",
  },
  {
    src: "./assets/gallery/fee6b42c07076c5227b9963004734fbe.jpg",
    alt: "Start page gallery alternate reference",
    caption: "图库实验图 2：切换不同图片，继续比较风格和排版适配。",
  },
];

const engineForms = document.querySelectorAll(".engine-form");
const clock = document.getElementById("clock");
const dateText = document.getElementById("dateText");
const primaryQuoteText = document.getElementById("primaryQuoteText");
const primaryQuoteSource = document.getElementById("primaryQuoteSource");
const refreshQuotesButton = document.getElementById("refreshQuotesButton");
const galleryImage = document.getElementById("galleryImage");
const galleryCaption = document.getElementById("galleryCaption");
const nextImageButton = document.getElementById("nextImageButton");
let quotePools = null;
let currentImageIndex = 0;

function updateClock() {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const weekday = now.toLocaleDateString("zh-CN", { weekday: "long" });
  const fullDate = now.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  clock.textContent = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  dateText.textContent = `${fullDate} · ${weekday}`;
}

function handleSearch(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const engine = form.dataset.engine;
  const input = form.querySelector('input[name="q"]');
  const query = input.value.trim();
  if (!query) {
    input.focus();
    return;
  }

  const url = `${SEARCH_ENGINES[engine]}${encodeURIComponent(query)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

function pickRandomQuote(pool) {
  if (!Array.isArray(pool) || pool.length === 0) {
    return null;
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

function renderQuotes() {
  const pool = quotePools || FALLBACK_QUOTES;
  const primary = pickRandomQuote(pool);

  if (primary) {
    primaryQuoteText.textContent = primary.text;
    primaryQuoteSource.textContent = primary.source;
  }
}

async function loadQuotePools() {
  try {
    const response = await fetch("./quotes.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to load quotes: ${response.status}`);
    }

    const quotes = await response.json();
    if (!Array.isArray(quotes) || quotes.length === 0) {
      throw new Error("Quotes data is empty");
    }
    quotePools = quotes;
  } catch (error) {
    quotePools = FALLBACK_QUOTES;
  }

  renderQuotes();
}

function renderGalleryImage(index) {
  const image = GALLERY_IMAGES[index];
  if (!image) {
    return;
  }

  galleryImage.src = image.src;
  galleryImage.alt = image.alt;
  galleryCaption.textContent = image.caption;
}

function showNextImage() {
  currentImageIndex = (currentImageIndex + 1) % GALLERY_IMAGES.length;
  renderGalleryImage(currentImageIndex);
}

updateClock();
loadQuotePools();
renderGalleryImage(currentImageIndex);
setInterval(updateClock, 1000);
engineForms.forEach((form) => {
  form.addEventListener("submit", handleSearch);
});
refreshQuotesButton.addEventListener("click", renderQuotes);
nextImageButton.addEventListener("click", showNextImage);
