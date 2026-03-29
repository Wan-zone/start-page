const STORE_DATA_PATH = "./data/stories.jsonc";

const FALLBACK_STORE_DATA = {
  ui: {
    documentTitle: "小故事 | Wan Start Page",
    metaDescription: "小故事页 for Wan Start Page.",
    header: {
      eyebrow: "STORE",
      title: "小故事",
      copy: "这里统一承接首页的小故事入口。"
    },
    links: {
      backToHome: "返回主页",
      backToGames: "返回游戏页"
    },
    shelf: {
      eyebrow: "SHELF",
      title: "故事列表",
      shuffle: "换一批"
    },
    reader: {
      eyebrow: "READER",
      loadingTitle: "加载中",
      loadingSummary: "正在读取故事摘要。"
    }
  },
  config: {
    batchSize: 2
  },
  stories: []
};

const storeMetaDescription = document.getElementById("storeMetaDescription");
const storeHeaderEyebrow = document.getElementById("storeHeaderEyebrow");
const storeHeaderTitle = document.getElementById("storeHeaderTitle");
const storeHeaderCopy = document.getElementById("storeHeaderCopy");
const storeBackHomeLink = document.getElementById("storeBackHomeLink");
const storeShelfEyebrow = document.getElementById("storeShelfEyebrow");
const storeShelfTitle = document.getElementById("storeShelfTitle");
const storeReaderEyebrow = document.getElementById("storeReaderEyebrow");
const shuffleStoriesButton = document.getElementById("shuffleStoriesButton");
const storyList = document.getElementById("storyList");
const storyTitle = document.getElementById("storyTitle");
const storySummary = document.getElementById("storySummary");
const storyContent = document.getElementById("storyContent");

let storeData = FALLBACK_STORE_DATA;
let stories = [];
let visibleStories = [];
let currentStoryIndex = 0;

function parseJsonc(rawText) {
  const withoutBlockComments = rawText.replace(/\/\*[\s\S]*?\*\//g, "");
  const withoutLineComments = withoutBlockComments.replace(/^\s*\/\/.*$/gm, "");
  return JSON.parse(withoutLineComments);
}

function applyStoreUi() {
  const ui = storeData.ui;
  document.title = ui.documentTitle || "";
  storeMetaDescription.setAttribute("content", ui.metaDescription || "");
  storeHeaderEyebrow.textContent = ui.header?.eyebrow || "";
  storeHeaderTitle.textContent = ui.header?.title || "";
  storeHeaderCopy.textContent = ui.header?.copy || "";
  storeBackHomeLink.textContent = ui.links?.backToHome || "";
  storeShelfEyebrow.textContent = ui.shelf?.eyebrow || "";
  storeShelfTitle.textContent = ui.shelf?.title || "";
  shuffleStoriesButton.textContent = ui.shelf?.shuffle || "";
  storeReaderEyebrow.textContent = ui.reader?.eyebrow || "";
  storyTitle.textContent = ui.reader?.loadingTitle || "";
  storySummary.textContent = ui.reader?.loadingSummary || "";
}

function renderStory(index) {
  const safeIndex = Math.max(0, Math.min(index, visibleStories.length - 1));
  currentStoryIndex = safeIndex;
  const story = visibleStories[safeIndex];
  if (!story) return;

  storyTitle.textContent = story.title;
  storySummary.textContent = story.summary;
  storyContent.innerHTML = story.content.map((paragraph) => `<p>${paragraph}</p>`).join("");

  const items = storyList.querySelectorAll(".story-item");
  items.forEach((item, itemIndex) => {
    item.classList.toggle("is-active", itemIndex === safeIndex);
  });
}

function renderStoryList() {
  storyList.innerHTML = visibleStories
    .map(
      (story, index) => `
        <button class="story-item${index === currentStoryIndex ? " is-active" : ""}" type="button" data-index="${index}">
          <span class="story-item-title">${story.title}</span>
          <span class="story-item-summary">${story.summary}</span>
        </button>
      `
    )
    .join("");

  storyList.querySelectorAll(".story-item").forEach((item) => {
    item.addEventListener("click", () => {
      renderStory(Number(item.dataset.index));
    });
  });
}

function pickStoryBatch() {
  const batchSize = Math.max(1, Number(storeData.config?.batchSize) || 2);
  const pool = [...stories].sort(() => 0.5 - Math.random());
  visibleStories = pool.slice(0, batchSize);
  currentStoryIndex = 0;
  renderStoryList();
  renderStory(0);
}

async function loadStories() {
  try {
    const response = await fetch(STORE_DATA_PATH, { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Failed to load stories");
    }
    const rawText = await response.text();
    const data = parseJsonc(rawText);
    if (data && typeof data === "object") {
      storeData = {
        ...FALLBACK_STORE_DATA,
        ...data,
        ui: {
          ...FALLBACK_STORE_DATA.ui,
          ...(data.ui || {}),
          header: {
            ...FALLBACK_STORE_DATA.ui.header,
            ...(data.ui?.header || {})
          },
          links: {
            ...FALLBACK_STORE_DATA.ui.links,
            ...(data.ui?.links || {})
          },
          shelf: {
            ...FALLBACK_STORE_DATA.ui.shelf,
            ...(data.ui?.shelf || {})
          },
          reader: {
            ...FALLBACK_STORE_DATA.ui.reader,
            ...(data.ui?.reader || {})
          }
        },
        config: {
          ...FALLBACK_STORE_DATA.config,
          ...(data.config || {})
        }
      };
      if (Array.isArray(data.stories) && data.stories.length > 0) {
        stories = data.stories.filter(
          (story) =>
            story &&
            typeof story.title === "string" &&
            typeof story.summary === "string" &&
            Array.isArray(story.content)
        );
      }
    }
  } catch (error) {
    storeData = FALLBACK_STORE_DATA;
    stories = [];
  }

  applyStoreUi();
  pickStoryBatch();
}

shuffleStoriesButton.addEventListener("click", pickStoryBatch);

loadStories();
