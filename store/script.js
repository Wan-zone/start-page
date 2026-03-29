const FALLBACK_STORIES = [
  {
    title: "默认故事",
    summary: "如果 JSON 没加载出来，会先显示这条默认内容。",
    content: [
      "这里是默认故事内容。",
      "你后面可以直接修改 store/data/stories.json。"
    ],
  },
];

const storyList = document.getElementById("storyList");
const storyTitle = document.getElementById("storyTitle");
const storySummary = document.getElementById("storySummary");
const storyContent = document.getElementById("storyContent");

let stories = FALLBACK_STORIES;
let currentStoryIndex = 0;

function renderStory(index) {
  const safeIndex = Math.max(0, Math.min(index, stories.length - 1));
  currentStoryIndex = safeIndex;
  const story = stories[safeIndex];

  storyTitle.textContent = story.title;
  storySummary.textContent = story.summary;
  storyContent.innerHTML = story.content.map((paragraph) => `<p>${paragraph}</p>`).join("");

  const items = storyList.querySelectorAll(".story-item");
  items.forEach((item, itemIndex) => {
    item.classList.toggle("is-active", itemIndex === safeIndex);
  });
}

function renderStoryList() {
  storyList.innerHTML = stories
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

async function loadStories() {
  try {
    const response = await fetch("./data/stories.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Failed to load stories");
    }
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      stories = data.filter(
        (story) =>
          story &&
          typeof story.title === "string" &&
          typeof story.summary === "string" &&
          Array.isArray(story.content)
      );
    }
  } catch (error) {
    stories = FALLBACK_STORIES;
  }

  renderStoryList();
  renderStory(0);
}

loadStories();
