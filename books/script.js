const BOOKS_DATA_PATH = "./data/books.jsonc";
const THEME_STORAGE_KEY = "wan-start-page-theme";
const BOOK_LOCATION_STORAGE_KEY = "wan-start-page-book-locations";
const BOOKMARK_STORAGE_KEY = "wan-start-page-bookmarks";

const FALLBACK_BOOKS_DATA = {
  ui: {
    header: {
      eyebrow: "BOOKS",
      title: "书库",
      copy: "先展示当前书目，再进入单本阅读页。",
    },
    library: {
      eyebrow: "LIBRARY",
      title: "全部书目",
    },
    preview: {
      eyebrow: "PREVIEW",
      title: "选择一本书",
      summary: "点击左侧书目，先进入该书的阅读页。",
    },
    actions: {
      backHome: "返回主页",
      openReader: "进入阅读页",
    },
  },
  config: {
    defaultBookId: "",
  },
  books: [],
};

const booksHeaderEyebrow = document.getElementById("booksHeaderEyebrow");
const booksHeaderTitle = document.getElementById("booksHeaderTitle");
const booksHeaderCopy = document.getElementById("booksHeaderCopy");
const booksBackHomeLink = document.getElementById("booksBackHomeLink");
const booksLibraryEyebrow = document.getElementById("booksLibraryEyebrow");
const booksLibraryTitle = document.getElementById("booksLibraryTitle");
const booksPreviewEyebrow = document.getElementById("booksPreviewEyebrow");
const booksList = document.getElementById("booksList");
const booksTitle = document.getElementById("booksTitle");
const booksSummary = document.getElementById("booksSummary");
const booksMeta = document.getElementById("booksMeta");
const booksContent = document.getElementById("booksContent");
const booksReaderLink = document.getElementById("booksReaderLink");
const bookPreviewModal = document.getElementById("bookPreviewModal");
const bookPreviewBackdrop = document.getElementById("bookPreviewBackdrop");
const bookPreviewClose = document.getElementById("bookPreviewClose");

const readerInfoEyebrow = document.getElementById("readerInfoEyebrow");
const readerBookTitle = document.getElementById("readerBookTitle");
const readerBookSummary = document.getElementById("readerBookSummary");
const readerBookMeta = document.getElementById("readerBookMeta");
const readerBookBody = document.getElementById("readerBookBody");
const readerBackLibraryLink = document.getElementById("readerBackLibraryLink");
const readerBackHomeLink = document.getElementById("readerBackHomeLink");
const readerViewport = document.getElementById("readerViewport");
const readerStatus = document.getElementById("readerStatus");
const readerShell = document.getElementById("readerShell");
const readerPrevHotspot = document.getElementById("readerPrevHotspot");
const readerNextHotspot = document.getElementById("readerNextHotspot");
const readerBookmarkHint = document.getElementById("readerBookmarkHint");
const readerAddBookmarkButton = document.getElementById("readerAddBookmarkButton");
const readerRemoveBookmarkButton = document.getElementById("readerRemoveBookmarkButton");
const readerUndoButton = document.getElementById("readerUndoButton");
const readerBookmarksEyebrow = document.getElementById("readerBookmarksEyebrow");
const readerBookmarksTitle = document.getElementById("readerBookmarksTitle");
const readerBookmarksList = document.getElementById("readerBookmarksList");

let booksUi = FALLBACK_BOOKS_DATA.ui;
let booksConfig = FALLBACK_BOOKS_DATA.config;
let books = FALLBACK_BOOKS_DATA.books;
let activeBookId = "";
let currentBookRendition = null;
let currentEpubBook = null;
let currentReaderBookId = "";
let currentLocationCfi = "";
let currentLocationProgress = "";
let suppressReaderTapUntil = 0;
let readerUndoStack = [];

function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

function applyPageTheme() {
  document.body.dataset.theme = getStoredTheme();
}

function getSavedBookLocations() {
  try {
    const raw = localStorage.getItem(BOOK_LOCATION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function getSavedBookLocation(bookId) {
  const locations = getSavedBookLocations();
  return typeof locations[bookId] === "string" ? locations[bookId] : "";
}

function setSavedBookLocation(bookId, location) {
  if (!bookId || !location) {
    return;
  }

  try {
    const locations = getSavedBookLocations();
    locations[bookId] = location;
    localStorage.setItem(BOOK_LOCATION_STORAGE_KEY, JSON.stringify(locations));
  } catch {
    // Ignore storage failures and keep reading.
  }
}

function getSavedBookmarks() {
  try {
    const raw = localStorage.getItem(BOOKMARK_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function getBookBookmarks(bookId) {
  const allBookmarks = getSavedBookmarks();
  return Array.isArray(allBookmarks[bookId]) ? allBookmarks[bookId] : [];
}

function setBookBookmarks(bookId, bookmarks) {
  try {
    const allBookmarks = getSavedBookmarks();
    allBookmarks[bookId] = bookmarks;
    localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(allBookmarks));
  } catch {
    // Ignore storage failures and keep reading.
  }
}

function buildBookmarkLabel(index, progressText) {
  if (progressText) {
    return `书签 ${index + 1} · ${progressText}`;
  }
  return `书签 ${index + 1}`;
}

function pushUndoLocation(cfi) {
  if (!cfi) {
    return;
  }

  if (readerUndoStack[readerUndoStack.length - 1] === cfi) {
    return;
  }

  readerUndoStack.push(cfi);
  if (readerUndoStack.length > 20) {
    readerUndoStack.shift();
  }
}

function renderBookmarks(bookId) {
  if (!readerBookmarksList) {
    return;
  }

  const bookmarks = getBookBookmarks(bookId);
  if (readerBookmarksEyebrow) {
    readerBookmarksEyebrow.textContent = booksUi.reader?.bookmarksEyebrow || "BOOKMARKS";
  }
  if (readerBookmarksTitle) {
    readerBookmarksTitle.textContent = booksUi.reader?.bookmarksTitle || "已保存书签";
  }

  if (bookmarks.length === 0) {
    readerBookmarksList.innerHTML = `<p class="reader-bookmark-meta">${escapeHtml(booksUi.reader?.bookmarksEmpty || "当前还没有保存的书签。")}</p>`;
    return;
  }

  readerBookmarksList.innerHTML = bookmarks
    .map((bookmark, index) => {
      const label = bookmark.label || buildBookmarkLabel(index, bookmark.progress);
      return `
        <button class="reader-bookmark-item" type="button" data-bookmark-cfi="${escapeHtml(bookmark.cfi)}">
          <span class="reader-bookmark-label">${escapeHtml(label)}</span>
          <span class="reader-bookmark-meta">${escapeHtml(bookmark.progress || "")}</span>
        </button>
      `;
    })
    .join("");

  readerBookmarksList.querySelectorAll(".reader-bookmark-item").forEach((button) => {
    button.addEventListener("click", () => {
      const cfi = button.dataset.bookmarkCfi;
      if (cfi && currentBookRendition) {
        pushUndoLocation(currentLocationCfi);
        currentBookRendition.display(cfi);
      }
    });
  });
}

function getCurrentBookmarkIndex(bookId, cfi) {
  if (!bookId || !cfi) {
    return -1;
  }

  return getBookBookmarks(bookId).findIndex((bookmark) => bookmark.cfi === cfi);
}

function addCurrentBookmark() {
  if (!currentReaderBookId || !currentLocationCfi) {
    return;
  }

  const bookmarks = getBookBookmarks(currentReaderBookId);
  if (getCurrentBookmarkIndex(currentReaderBookId, currentLocationCfi) !== -1) {
    if (readerStatus) {
      readerStatus.textContent = booksUi.reader?.bookmarkExists || "当前位置已经在书签里了。";
    }
    return;
  }

  const nextBookmark = {
    cfi: currentLocationCfi,
    progress: currentLocationProgress,
    label: buildBookmarkLabel(bookmarks.length, currentLocationProgress),
  };
  bookmarks.push(nextBookmark);
  setBookBookmarks(currentReaderBookId, bookmarks);
  renderBookmarks(currentReaderBookId);
  if (readerStatus) {
    readerStatus.textContent = booksUi.reader?.bookmarkAdded || "已保存当前书签。";
  }
}

function removeCurrentBookmark() {
  if (!currentReaderBookId || !currentLocationCfi) {
    return;
  }

  const bookmarks = getBookBookmarks(currentReaderBookId);
  const currentIndex = getCurrentBookmarkIndex(currentReaderBookId, currentLocationCfi);
  if (currentIndex === -1) {
    if (readerStatus) {
      readerStatus.textContent = booksUi.reader?.bookmarkMissing || "当前位置还没有书签。";
    }
    return;
  }

  bookmarks.splice(currentIndex, 1);
  setBookBookmarks(currentReaderBookId, bookmarks);
  renderBookmarks(currentReaderBookId);
  if (readerStatus) {
    readerStatus.textContent = booksUi.reader?.bookmarkRemoved || "已删除当前书签。";
  }
}

function undoLastLocation() {
  const previousLocation = readerUndoStack.pop();
  if (!previousLocation || !currentBookRendition) {
    if (readerStatus) {
      readerStatus.textContent = booksUi.reader?.undoMissing || "当前还没有可返回的位置。";
    }
    return;
  }

  currentBookRendition.display(previousLocation);
  if (readerStatus) {
    readerStatus.textContent = booksUi.reader?.undoReady || "已返回上一步位置。";
  }
}

function getReaderThemeStyles() {
  const theme = document.body.dataset.theme === "light" ? "light" : "dark";

  if (theme === "light") {
    return {
      body: {
        "font-family": "\"Georgia\", \"PingFang SC\", \"Noto Serif SC\", serif",
        "font-size": "18px",
        "line-height": "1.9",
        color: "#1d2430",
        background: "#fbfaf7",
        margin: "0",
        padding: "28px 32px",
      },
      a: {
        color: "#2c4a74",
      },
      p: {
        margin: "0 0 1.2em",
      },
      img: {
        "max-width": "100%",
        height: "auto",
      },
    };
  }

  return {
    body: {
      "font-family": "\"Georgia\", \"PingFang SC\", \"Noto Serif SC\", serif",
      "font-size": "18px",
      "line-height": "1.9",
      color: "#f4f6fb",
      background: "#0f131a",
      margin: "0",
      padding: "28px 32px",
    },
    a: {
      color: "#b8d6ff",
    },
    p: {
      margin: "0 0 1.2em",
    },
    img: {
      "max-width": "100%",
      height: "auto",
    },
  };
}

function parseJsonc(raw) {
  return JSON.parse(
    raw
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "")
  );
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getBookById(bookId) {
  return books.find((book) => book.id === bookId) || null;
}

function applyBooksUi() {
  if (booksHeaderEyebrow) booksHeaderEyebrow.textContent = booksUi.header?.eyebrow || "BOOKS";
  if (booksHeaderTitle) booksHeaderTitle.textContent = booksUi.header?.title || "书库";
  if (booksHeaderCopy) booksHeaderCopy.textContent = booksUi.header?.copy || "";
  if (booksBackHomeLink) booksBackHomeLink.textContent = booksUi.actions?.backHome || "返回主页";
  if (booksLibraryEyebrow) booksLibraryEyebrow.textContent = booksUi.library?.eyebrow || "LIBRARY";
  if (booksLibraryTitle) booksLibraryTitle.textContent = booksUi.library?.title || "全部书目";
  if (booksPreviewEyebrow) booksPreviewEyebrow.textContent = booksUi.preview?.eyebrow || "PREVIEW";

  if (readerInfoEyebrow) readerInfoEyebrow.textContent = booksUi.reader?.infoEyebrow || "BOOK INFO";
  if (readerBackLibraryLink) readerBackLibraryLink.textContent = booksUi.actions?.backLibrary || "返回书库";
  if (readerBackHomeLink) readerBackHomeLink.textContent = booksUi.actions?.backHome || "返回主页";
  if (readerAddBookmarkButton) readerAddBookmarkButton.textContent = booksUi.actions?.addBookmark || "添加书签";
  if (readerRemoveBookmarkButton) readerRemoveBookmarkButton.textContent = booksUi.actions?.removeBookmark || "删除当前书签";
  if (readerUndoButton) readerUndoButton.textContent = booksUi.actions?.undoStep || "返回上一步";
  if (readerBookmarkHint) readerBookmarkHint.textContent = booksUi.reader?.bookmarkHint || "使用下面的按钮保存或删除书签，点书签可直接跳转，误触后可用“返回上一步”回到刚才的位置。";
}

function renderBookMeta(target, book) {
  if (!target || !book) {
    return;
  }

  const tags = Array.isArray(book.tags) ? book.tags : [];
  const meta = [
    book.author ? `作者：${book.author}` : "",
    book.status ? `状态：${book.status}` : "",
    ...tags.map((tag) => `标签：${tag}`),
  ].filter(Boolean);

  target.innerHTML = meta
    .map((item) => `<span class="book-meta-chip">${escapeHtml(item)}</span>`)
    .join("");
}

function renderBookPreview(book) {
  if (!book || !booksTitle || !booksSummary || !booksContent) {
    return;
  }

  activeBookId = book.id;
  booksTitle.textContent = book.title || booksUi.preview?.title || "选择一本书";
  booksSummary.textContent = book.summary || booksUi.preview?.summary || "";
  renderBookMeta(booksMeta, book);

  booksContent.innerHTML = `
    <p>${escapeHtml(book.entryNote || "当前先进入单本阅读页，后面再继续补章节和正文。")}</p>
    <p>${escapeHtml(book.filename || "")}</p>
  `;

  if (booksReaderLink) {
    booksReaderLink.textContent = booksUi.actions?.openReader || "进入阅读页";
    booksReaderLink.href = `./reader.html?book=${encodeURIComponent(book.id)}`;
  }

  booksList?.querySelectorAll(".book-item").forEach((item) => {
    item.classList.toggle("is-active", item.dataset.bookId === book.id);
  });
}

function openBookPreview(book) {
  if (!bookPreviewModal || !book) {
    return;
  }

  renderBookPreview(book);
  bookPreviewModal.classList.add("is-open");
  bookPreviewModal.setAttribute("aria-hidden", "false");
}

function closeBookPreview() {
  if (!bookPreviewModal) {
    return;
  }

  bookPreviewModal.classList.remove("is-open");
  bookPreviewModal.setAttribute("aria-hidden", "true");
}

function renderBooksList() {
  if (!booksList) {
    return;
  }

  booksList.innerHTML = books
    .map((book) => {
      const tags = Array.isArray(book.tags) ? book.tags : [];
      return `
        <button class="book-item" type="button" data-book-id="${escapeHtml(book.id)}" aria-label="选择书籍 ${escapeHtml(book.title)}">
          <div class="book-item-top">
            <div>
              <strong class="book-item-title">${escapeHtml(book.title)}</strong>
              <p class="book-item-author">${escapeHtml(book.author || "未知作者")}</p>
            </div>
            <span class="book-item-status">${escapeHtml(book.status || "已入库")}</span>
          </div>
          <p class="book-item-summary">${escapeHtml(book.summary || "")}</p>
          <div class="book-item-tags">
            ${tags.map((tag) => `<span class="book-item-tag">${escapeHtml(tag)}</span>`).join("")}
          </div>
        </button>
      `;
    })
    .join("");

  booksList.querySelectorAll(".book-item").forEach((button) => {
    button.addEventListener("click", () => {
      const book = getBookById(button.dataset.bookId);
      if (book) {
        openBookPreview(book);
      }
    });
  });
}

function renderReaderPage() {
  if (!readerBookTitle || !readerBookSummary || !readerBookBody) {
    return;
  }

  const query = new URLSearchParams(window.location.search);
  const requestedBookId = query.get("book") || booksConfig.defaultBookId || books[0]?.id || "";
  const book = getBookById(requestedBookId) || books[0] || null;
  const savedLocation = book ? getSavedBookLocation(book.id) : "";
  currentReaderBookId = book?.id || "";
  readerUndoStack = [];

  if (!book) {
    readerBookTitle.textContent = booksUi.preview?.title || "选择一本书";
    readerBookSummary.textContent = booksUi.reader?.libraryEmpty || "当前书库为空，请先补书目。";
    readerBookBody.innerHTML = "<p>先在 books/data/books.jsonc 里继续添加书目。</p>";
    if (readerStatus) {
      readerStatus.textContent = booksUi.reader?.libraryEmpty || "当前书库为空，请先补书目。";
    }
    renderBookmarks("");
    return;
  }

  readerBookTitle.textContent = book.title || "未命名书籍";
  readerBookSummary.textContent = book.summary || "当前阅读页先只显示书籍信息。";
  renderBookMeta(readerBookMeta, book);
  readerBookBody.innerHTML = "";
  renderBookmarks(book.id);

  if (!book.filename) {
    if (readerStatus) {
      readerStatus.textContent = booksUi.reader?.missingFile || "当前书籍缺少 epub 文件名配置。";
    }
    return;
  }

  if (typeof window.ePub !== "function") {
    if (readerStatus) {
      readerStatus.textContent = booksUi.reader?.engineMissing || "阅读引擎没有加载成功，当前无法在线打开 epub。";
    }
    return;
  }

  if (!readerViewport) {
    return;
  }

  currentBookRendition?.destroy?.();
  currentBookRendition = null;
  currentEpubBook?.destroy?.();
  currentEpubBook = null;
  readerViewport.innerHTML = "";

  if (readerStatus) {
    readerStatus.textContent = booksUi.reader?.loading || "正在载入书籍…";
  }

  const epubUrl = new URL(`./data/${book.filename}`, window.location.href);

  fetch(epubUrl.href, { cache: "no-store" })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.arrayBuffer();
    })
    .then((buffer) => {
      const bookInstance = window.ePub(buffer);
      currentEpubBook = bookInstance;
      currentBookRendition = bookInstance.renderTo("readerViewport", {
        width: "100%",
        height: `${readerViewport.clientHeight || 720}px`,
        flow: "paginated",
        spread: "auto",
        allowScriptedContent: false,
      });
      currentBookRendition.themes.default(getReaderThemeStyles());
      currentBookRendition.on("relocated", (location) => {
        const cfi = location?.start?.cfi;
        if (cfi) {
          currentLocationCfi = cfi;
          setSavedBookLocation(book.id, cfi);
        }
        if (currentEpubBook?.locations && cfi) {
          const percentage = currentEpubBook.locations.percentageFromCfi(cfi);
          currentLocationProgress = Number.isFinite(percentage)
            ? `${Math.round(percentage * 100)}%`
            : "";
        }
      });
      return bookInstance.opened.then(() =>
        currentBookRendition.display(savedLocation || undefined)
      );
    })
    .then(() => {
      if (readerStatus) {
        readerStatus.textContent = booksUi.reader?.ready || "已进入在线阅读。";
      }
    })
    .catch((error) => {
      console.error("Failed to load epub:", error);
      if (readerStatus) {
        readerStatus.textContent = `${booksUi.reader?.missingBook || "没有找到对应书籍。"} ${error?.message || ""}`.trim();
      }
    });
}

async function loadBooks() {
  try {
    const response = await fetch(BOOKS_DATA_PATH, { cache: "no-store" });
    const raw = await response.text();
    const data = parseJsonc(raw);
    booksUi = data.ui || FALLBACK_BOOKS_DATA.ui;
    booksConfig = data.config || FALLBACK_BOOKS_DATA.config;
    books = Array.isArray(data.books) ? data.books : [];
  } catch (error) {
    booksUi = FALLBACK_BOOKS_DATA.ui;
    booksConfig = FALLBACK_BOOKS_DATA.config;
    books = FALLBACK_BOOKS_DATA.books;
  }

  applyBooksUi();

  if (booksList) {
    renderBooksList();
    if (booksTitle && booksSummary && booksContent && books.length === 0) {
      booksTitle.textContent = booksUi.preview?.title || "选择一本书";
      booksSummary.textContent = booksUi.preview?.summary || "当前还没有书目。";
      booksContent.innerHTML = "<p>先把书目整理进 books/data/books.jsonc。</p>";
    }
  }

  renderReaderPage();
}

bookPreviewClose?.addEventListener("click", closeBookPreview);
bookPreviewBackdrop?.addEventListener("click", closeBookPreview);

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeBookPreview();
    return;
  }

  if (!currentBookRendition) {
    return;
  }

  if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
    event.preventDefault();
    if (event.key === "ArrowLeft") {
      pushUndoLocation(currentLocationCfi);
      currentBookRendition.prev();
    }
  }

  if (event.key === "ArrowRight" || event.key === "ArrowDown") {
    event.preventDefault();
    if (event.key === "ArrowRight") {
      pushUndoLocation(currentLocationCfi);
      currentBookRendition.next();
    }
  }
});

readerPrevHotspot?.addEventListener("click", () => {
  if (Date.now() < suppressReaderTapUntil) {
    return;
  }
  pushUndoLocation(currentLocationCfi);
  currentBookRendition?.prev();
});

readerNextHotspot?.addEventListener("click", () => {
  if (Date.now() < suppressReaderTapUntil) {
    return;
  }
  pushUndoLocation(currentLocationCfi);
  currentBookRendition?.next();
});

readerAddBookmarkButton?.addEventListener("click", () => {
  addCurrentBookmark();
});

readerRemoveBookmarkButton?.addEventListener("click", () => {
  removeCurrentBookmark();
});

readerUndoButton?.addEventListener("click", () => {
  undoLastLocation();
});

applyPageTheme();
loadBooks();
