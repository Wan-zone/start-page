const SEARCH_ENGINES = {
  google: "https://www.google.com/search?q=",
  bing: "https://www.bing.com/search?q=",
  baidu: "https://www.baidu.com/s?wd=",
};

const THEME_STORAGE_KEY = "wan-start-page-theme";
const APP_MODE_STORAGE_KEY = "wan-start-page-mode";
const API_BASE_STORAGE_KEY = "wan-start-page-api-base";
const AUTH_TOKEN_STORAGE_KEY = "wan-start-page-auth-token";
const AUTH_USER_STORAGE_KEY = "wan-start-page-auth-user";
const AUTH_GUEST_STORAGE_KEY = "wan-start-page-auth-guest";
const DEBUG_LOG_STORAGE_KEY = "wan-start-page-debug-log";
const USER_SETTINGS_STORAGE_KEY = "wan-start-page-user-settings";
const DEFAULT_API_BASE = "";

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
const settingsAvatarButton = document.getElementById("settingsAvatarButton");
const settingsAvatarInitials = document.getElementById("settingsAvatarInitials");
const modeSwitch = document.querySelector(".mode-switch");
const modeHighlight = modeSwitch?.querySelector(".segment-highlight");
const userModeButton = document.getElementById("userModeButton");
const developerModeButton = document.getElementById("developerModeButton");
const themeSwitch = document.querySelector(".theme-switch");
const themeHighlight = themeSwitch?.querySelector(".segment-highlight");
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
const storyCard = document.getElementById("storyCard");
const searchPanel = document.getElementById("searchSection");
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const quickLinksGrid = document.getElementById("quickLinksGrid");
const engineSwitch = document.querySelector(".engine-switch");
const engineHighlight = engineSwitch.querySelector(".segment-highlight");
const enginePills = document.querySelectorAll(".engine-pill");
const apiBaseInput = document.getElementById("apiBaseInput");
const apiSaveButton = document.getElementById("apiSaveButton");
const apiHealthButton = document.getElementById("apiHealthButton");
const apiModalButton = document.getElementById("apiModalButton");
const apiStatusText = document.getElementById("apiStatusText");
const apiResultModal = document.getElementById("apiResultModal");
const apiResultBackdrop = document.getElementById("apiResultBackdrop");
const apiResultTitle = document.getElementById("apiResultTitle");
const apiResultBody = document.getElementById("apiResultBody");
const apiResultCopy = document.getElementById("apiResultCopy");
const apiResultClose = document.getElementById("apiResultClose");
const apiTestCard = document.getElementById("apiTestCard");
const authStatusMeta = document.getElementById("authStatusMeta");
const authUsernameInput = document.getElementById("authUsernameInput");
const authPasswordInput = document.getElementById("authPasswordInput");
const authRegisterButton = document.getElementById("authRegisterButton");
const authLoginButton = document.getElementById("authLoginButton");
const authGuestButton = document.getElementById("authGuestButton");
const authLogoutButton = document.getElementById("authLogoutButton");
const authResultText = document.getElementById("authResultText");
const authGateModal = document.getElementById("authGateModal");
const authGateResultText = document.getElementById("authGateResultText");
const authGateDebug = document.getElementById("authGateDebug");
const authGateDebugBody = document.getElementById("authGateDebugBody");
const authGateDebugCopy = document.getElementById("authGateDebugCopy");
const debugLogCard = document.getElementById("debugLogCard");
const debugLogList = document.getElementById("debugLogList");
const debugLogClearButton = document.getElementById("debugLogClearButton");
const debugLogCopyButton = document.getElementById("debugLogCopyButton");
const galleryFrame = document.getElementById("galleryFrame");
const galleryPrevButton = document.getElementById("galleryPrevButton");
const galleryZoomButton = document.getElementById("galleryZoomButton");
const galleryUploadInput = document.getElementById("galleryUploadInput");
const galleryUploadButton = document.getElementById("galleryUploadButton");
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
let galleryImages = FALLBACK_GALLERY_IMAGES;
let currentImageIndex = 0;
let detailedClockEnabled = false;
let currentFocusPeriod = "";
let themeSegmentControl;
let modeSegmentControl;
let engineSegmentControl;
let pageDragState = null;
let mascotReactionTimer = 0;
let mascotTalkingTimer = 0;
let searchInputFeedbackTimer = 0;
let previousSearchValue = "";
let pendingSearchFeedbackType = "typing";
let mascotLines = [];
let currentAuthToken = "";
let currentAuthUser = null;
let debugLogEntries = [];
let currentUserSettings = {
  preferred_name: "",
  email: "",
  signature: "",
};
let currentAuthDebugText = "";

function normalizeApiBase(value) {
  return value.trim().replace(/\/+$/, "");
}

function getDefaultApiBase() {
  const { protocol, hostname } = window.location;

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return `${protocol}//${hostname}:8000`;
  }

  if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return `${protocol}//${hostname}:8000`;
  }

  return DEFAULT_API_BASE;
}

function getStoredApiBase() {
  try {
    const storedValue = window.localStorage.getItem(API_BASE_STORAGE_KEY) || "";
    const normalizedValue = normalizeApiBase(storedValue);

    // 旧的云后端地址不再作为默认值沿用，改回当前主机自托管后端。
    if (normalizedValue.includes(".onrender.com")) {
      return getDefaultApiBase();
    }

    return normalizedValue || getDefaultApiBase();
  } catch (error) {
    return getDefaultApiBase();
  }
}

function saveApiBase(value) {
  try {
    window.localStorage.setItem(API_BASE_STORAGE_KEY, value);
  } catch (error) {
    // Ignore storage failures and keep the UI usable.
  }
}

function getStoredAuthToken() {
  try {
    return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) || "";
  } catch (error) {
    return "";
  }
}

function saveAuthToken(value) {
  try {
    if (value) {
      window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, value);
    } else {
      window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    }
  } catch (error) {
    // Ignore storage failures.
  }
}

function getStoredAuthUser() {
  try {
    const rawValue = window.localStorage.getItem(AUTH_USER_STORAGE_KEY);
    return rawValue ? JSON.parse(rawValue) : null;
  } catch (error) {
    return null;
  }
}

function saveAuthUser(user) {
  try {
    if (user) {
      window.localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    }
  } catch (error) {
    // Ignore storage failures.
  }
}

function getStoredGuestMode() {
  try {
    return window.localStorage.getItem(AUTH_GUEST_STORAGE_KEY) === "1";
  } catch (error) {
    return false;
  }
}

function saveGuestMode(enabled) {
  try {
    if (enabled) {
      window.localStorage.setItem(AUTH_GUEST_STORAGE_KEY, "1");
    } else {
      window.localStorage.removeItem(AUTH_GUEST_STORAGE_KEY);
    }
  } catch (error) {
    // Ignore storage failures.
  }
}

function getStoredUserSettings() {
  try {
    const rawValue = window.localStorage.getItem(USER_SETTINGS_STORAGE_KEY);
    if (!rawValue) {
      return {
        preferred_name: "",
        email: "",
        signature: "",
      };
    }

    const parsed = JSON.parse(rawValue);
    return {
      preferred_name: typeof parsed.preferred_name === "string" ? parsed.preferred_name : "",
      email: typeof parsed.email === "string" ? parsed.email : "",
      signature: typeof parsed.signature === "string" ? parsed.signature : "",
    };
  } catch (error) {
    return {
      preferred_name: "",
      email: "",
      signature: "",
    };
  }
}

function loadDebugLogs() {
  try {
    const rawValue = window.localStorage.getItem(DEBUG_LOG_STORAGE_KEY);
    debugLogEntries = rawValue ? JSON.parse(rawValue) : [];
  } catch (error) {
    debugLogEntries = [];
  }
}

function persistDebugLogs() {
  try {
    window.localStorage.setItem(DEBUG_LOG_STORAGE_KEY, JSON.stringify(debugLogEntries.slice(0, 60)));
  } catch (error) {
    // Ignore storage failures.
  }
}

function renderDebugLogs() {
  if (!debugLogList) {
    return;
  }

  if (!Array.isArray(debugLogEntries) || debugLogEntries.length === 0) {
    debugLogList.innerHTML = '<p class="debug-log-empty">开发者模式下的操作记录会显示在这里。</p>';
    return;
  }

  debugLogList.innerHTML = debugLogEntries
    .slice()
    .reverse()
    .map((entry) => {
      const detailText =
        typeof entry.detail === "string"
          ? entry.detail
          : JSON.stringify(entry.detail, null, 2);

      return `
        <article class="debug-log-item">
          <div class="debug-log-head">
            <strong>${entry.title}</strong>
            <span>${entry.time}</span>
          </div>
          <pre class="debug-log-detail">${detailText}</pre>
        </article>
      `;
    })
    .join("");
}

function setAuthGateLocked(locked) {
  body.dataset.authLocked = locked ? "true" : "false";

  if (!authGateModal) {
    return;
  }

  authGateModal.classList.toggle("is-open", locked);
  authGateModal.setAttribute("aria-hidden", String(!locked));
}

function openAuthGate(message = "") {
  setAuthGateLocked(true);
  if (message && authGateResultText) {
    authGateResultText.textContent = message;
  }
  currentAuthDebugText = "";
  if (authGateDebug) {
    authGateDebug.hidden = true;
  }
  if (authGateDebugBody) {
    authGateDebugBody.textContent = "";
  }
}

function closeAuthGate(message = "") {
  setAuthGateLocked(false);
  if (message && authGateResultText) {
    authGateResultText.textContent = message;
  }
  currentAuthDebugText = "";
  if (authGateDebug) {
    authGateDebug.hidden = true;
  }
  if (authGateDebugBody) {
    authGateDebugBody.textContent = "";
  }
}

function getAvatarLabelSource() {
  const preferredName = currentUserSettings.preferred_name.trim();
  if (preferredName) {
    return preferredName;
  }

  if (currentAuthUser?.is_guest) {
    return "游客";
  }

  if (currentAuthUser?.username) {
    return currentAuthUser.username;
  }

  return "访客";
}

function computeAvatarInitials(source) {
  const compact = source.replace(/\s+/g, "");
  if (!compact) {
    return "SP";
  }

  const ascii = compact.replace(/[^A-Za-z0-9]/g, "");
  if (ascii.length >= 2) {
    return ascii.slice(0, 2).toUpperCase();
  }

  return compact.slice(0, 2).toUpperCase();
}

function renderSettingsSummary() {
  const displaySource = getAvatarLabelSource();

  if (settingsAvatarInitials) {
    settingsAvatarInitials.textContent = computeAvatarInitials(displaySource);
  }
}

function addDebugLog(title, detail) {
  const timestamp = new Date().toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  debugLogEntries.push({
    title,
    detail,
    time: timestamp,
  });

  if (debugLogEntries.length > 60) {
    debugLogEntries = debugLogEntries.slice(-60);
  }

  persistDebugLogs();
  renderDebugLogs();
}

function clearDebugLogs() {
  debugLogEntries = [];
  persistDebugLogs();
  renderDebugLogs();
}

async function copyDebugLogs() {
  const text = debugLogEntries
    .slice()
    .reverse()
    .map((entry) => `[${entry.time}] ${entry.title}\n${typeof entry.detail === "string" ? entry.detail : JSON.stringify(entry.detail, null, 2)}`)
    .join("\n\n");

  if (!text.trim()) {
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    addDebugLog("调试记录复制", "已复制当前开发者模式日志。");
  } catch (error) {
    addDebugLog("调试记录复制失败", error instanceof Error ? error.message : "unknown error");
  }
}

function getApiBaseForRequest() {
  return normalizeApiBase(apiBaseInput?.value || getStoredApiBase() || "");
}

function getAuthHeaders() {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Debug-Mode": body.dataset.appMode === "developer" ? "1" : "0",
  };

  if (currentAuthToken) {
    headers.Authorization = `Bearer ${currentAuthToken}`;
  }

  return headers;
}

async function apiJsonRequest(path, options = {}) {
  const apiBase = getApiBaseForRequest();

  if (!apiBase) {
    throw new Error("请先填写或确认后端地址。");
  }

  const requestUrl = `${apiBase}${path}`;

  const response = await fetch(requestUrl, {
    method: options.method || "GET",
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const rawText = await response.text();
  let data = {};

  try {
    data = rawText ? JSON.parse(rawText) : {};
  } catch (error) {
    data = { raw: rawText };
  }

  if (!response.ok) {
    const errorMessage =
      (data && (data.detail || data.message)) ||
      `HTTP ${response.status}`;
    const requestError = new Error(errorMessage);
    requestError.status = response.status;
    requestError.data = data;
    requestError.requestUrl = requestUrl;
    requestError.requestPath = path;
    throw requestError;
  }

  return data;
}

async function apiUploadRequest(path, fieldName, file, extraFields = {}) {
  const apiBase = getApiBaseForRequest();

  if (!apiBase) {
    throw new Error("请先填写或确认后端地址。");
  }

  const requestUrl = `${apiBase}${path}`;

  const formData = new FormData();
  formData.append(fieldName, file);
  Object.keys(extraFields).forEach((key) => {
    formData.append(key, extraFields[key]);
  });

  const headers = {
    Accept: "application/json",
    "X-Debug-Mode": body.dataset.appMode === "developer" ? "1" : "0",
  };

  if (currentAuthToken) {
    headers.Authorization = `Bearer ${currentAuthToken}`;
  }

  const response = await fetch(requestUrl, {
    method: "POST",
    headers,
    body: formData,
  });

  const rawText = await response.text();
  let data = {};

  try {
    data = rawText ? JSON.parse(rawText) : {};
  } catch (error) {
    data = { raw: rawText };
  }

  if (!response.ok) {
    const errorMessage =
      (data && (data.detail || data.message)) ||
      `HTTP ${response.status}`;
    const requestError = new Error(errorMessage);
    requestError.status = response.status;
    requestError.data = data;
    requestError.requestUrl = requestUrl;
    requestError.requestPath = path;
    throw requestError;
  }

  return data;
}

async function testApiHealth() {
  const apiBase = normalizeApiBase(apiBaseInput?.value || "");

  if (!apiBase) {
    apiStatusText.textContent = "请先填写或确认后端地址。";
    return;
  }

  apiStatusText.textContent = "正在测试 /health ...";

  try {
    const response = await fetch(`${apiBase}/health`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      apiStatusText.textContent = `连通失败：HTTP ${response.status}`;
      return;
    }

    const data = await response.json();
    apiStatusText.textContent = `连通成功：${JSON.stringify(data)}`;
    addDebugLog("后端健康检查成功", data);
  } catch (error) {
    apiStatusText.textContent = `请求失败：${error instanceof Error ? error.message : "unknown error"}`;
    addDebugLog("后端健康检查失败", error instanceof Error ? error.message : "unknown error");
  }
}

function openApiResultModal(title, body) {
  apiResultTitle.textContent = title;
  apiResultBody.textContent = body;
  apiResultModal.classList.add("is-open");
  apiResultModal.setAttribute("aria-hidden", "false");
}

function closeApiResultModal() {
  apiResultModal.classList.remove("is-open");
  apiResultModal.setAttribute("aria-hidden", "true");
}

async function copyApiDebugText() {
  const debugText = apiResultBody?.textContent || "";

  if (!debugText.trim()) {
    return;
  }

  try {
    await navigator.clipboard.writeText(debugText);
    apiStatusText.textContent = "调试信息已复制到剪贴板。";
  } catch (error) {
    apiStatusText.textContent = "复制失败，请手动选中调试文本复制。";
  }
}

async function copyAuthDebugText() {
  if (!currentAuthDebugText) {
    return;
  }

  try {
    await navigator.clipboard.writeText(currentAuthDebugText);
    authGateResultText && (authGateResultText.textContent = "认证调试信息已复制。");
  } catch (error) {
    authGateResultText && (authGateResultText.textContent = "复制认证调试信息失败。");
    addDebugLog("认证调试复制失败", error instanceof Error ? error.message : "unknown error");
  }
}

function showAuthDebug(title, payload) {
  const lines = [
    title,
    `页面地址: ${window.location.href}`,
    `页面来源: ${window.location.origin}`,
    `后端地址: ${getApiBaseForRequest() || "(empty)"}`,
  ];

  if (payload?.request_url) {
    lines.push(`请求地址: ${payload.request_url}`);
  }
  if (payload?.status) {
    lines.push(`HTTP 状态: ${payload.status}`);
  }
  if (payload?.message) {
    lines.push(`错误信息: ${payload.message}`);
  }
  if (payload?.response) {
    lines.push("");
    lines.push("返回内容:");
    try {
      lines.push(JSON.stringify(payload.response, null, 2));
    } catch (error) {
      lines.push(String(payload.response));
    }
  }

  currentAuthDebugText = lines.join("\n");
  if (authGateDebugBody) {
    authGateDebugBody.textContent = currentAuthDebugText;
  }
  if (authGateDebug) {
    authGateDebug.hidden = false;
  }
}

function buildApiDebugText({
  apiBase,
  requestUrl,
  response,
  data,
  error,
}) {
  const lines = [
    `页面地址: ${window.location.href}`,
    `页面来源: ${window.location.origin}`,
    `页面协议: ${window.location.protocol}`,
    `后端地址: ${apiBase || "(empty)"}`,
    `请求地址: ${requestUrl || "(empty)"}`,
    `浏览器在线状态: ${navigator.onLine ? "online" : "offline"}`,
    `安全上下文: ${window.isSecureContext ? "yes" : "no"}`,
  ];

  if (response) {
    lines.push(`HTTP 状态: ${response.status} ${response.statusText}`);
    lines.push(`响应类型: ${response.type || "unknown"}`);
    lines.push(`最终地址: ${response.url || requestUrl}`);
  }

  if (data !== undefined) {
    lines.push("");
    lines.push("返回 JSON:");
    lines.push(JSON.stringify(data, null, 2));
  }

  if (error) {
    lines.push("");
    lines.push(`错误信息: ${error instanceof Error ? error.message : String(error)}`);
  }

  const isHttpsPage = window.location.protocol === "https:";
  const isHttpApi = /^http:\/\//i.test(apiBase || "");

  if (isHttpsPage && isHttpApi) {
    lines.push("");
    lines.push("可能原因:");
    lines.push("- 当前页面是 HTTPS，但后端地址是 HTTP，浏览器会拦截混合内容请求。");
    lines.push("- 解决方式：后端也改成 HTTPS，或当前页面先用 HTTP 测试。");
  } else if (error) {
    lines.push("");
    lines.push("可能原因:");
    lines.push("- 后端进程未启动，或 8000 端口未监听。");
    lines.push("- 浏览器访问的主机和后端实际监听主机不一致。");
    lines.push("- CORS 未放行当前页面来源。");
    lines.push("- 服务器防火墙 / 反向代理未放通请求。");
  }

  return lines.join("\n");
}

async function testApiHealthWithModal() {
  const apiBase = normalizeApiBase(apiBaseInput?.value || "");
  const requestUrl = `${apiBase}/health`;

  if (!apiBase) {
    openApiResultModal("连接失败", "请先填写或确认后端地址。");
    return;
  }

  openApiResultModal("正在测试", buildApiDebugText({
    apiBase,
    requestUrl,
  }));

  try {
    const response = await fetch(requestUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      let responseText = "";
      try {
        responseText = await response.text();
      } catch (readError) {
        responseText = "";
      }

      openApiResultModal("连接失败", buildApiDebugText({
        apiBase,
        requestUrl,
        response,
        error: responseText || `HTTP ${response.status}`,
      }));
      addDebugLog("后端弹窗测试失败", responseText || `HTTP ${response.status}`);
      return;
    }

    const data = await response.json();
    openApiResultModal("连接成功", buildApiDebugText({
      apiBase,
      requestUrl,
      response,
      data,
    }));
    addDebugLog("后端弹窗测试成功", data);
  } catch (error) {
    openApiResultModal("请求失败", buildApiDebugText({
      apiBase,
      requestUrl,
      error,
    }));
    addDebugLog("后端弹窗测试异常", error instanceof Error ? error.message : "unknown error");
  }
}

const FALLBACK_MASCOT_LINES = [
  "请对社恐角色温柔一点。",
  "低气压加载中……",
  "当前状态：想躲起来。",
  "别看我，我会死机。",
  "今天能正常呼吸就算成功。",
  "我没有消失，我只是在角落待机。",
  "请不要突然和我说话，我会重启。",
  "表情管理失败中。",
  "正在尝试成为不那么奇怪的人。",
  "小小地努力一下，应该可以吧。",
  "今天也努力活得不那么显眼……",
  "只要没人注意到我，今天就是胜利。",
  "虽然很想逃跑，但还是再坚持一下吧。",
  "社交什么的，果然还是太难了。",
  "要是能用吉他说话就好了。",
  "表面平静，内心已经大地震了。",
  "我这种人，真的也能站上舞台吗？",
  "只要不出错，就已经很了不起了。",
  "明明还没开始，怎么就已经紧张了。",
  "大家都好耀眼……我先躲一下。",
  "如果能被稍微认可一点就好了。",
  "脑子里排练了一百遍，开口还是失败。",
  "今天的我，姑且算是有在努力。",
  "不想被看见，又有点想被看见。",
  "等一下，我先紧张完这一轮。",
  "只会弹吉他的人，能不能也算厉害？",
  "要是能自然地和别人说话就好了。",
  "没关系，至少音乐不会嫌弃我。",
  "虽然很废，但还没有彻底放弃。",
  "存在感低一点，也是一种生存方式。",
  "又开始胡思乱想了，停不下来。",
  "只要还有一首歌的时间，就还能撑住。",
  "今天也是努力不变成背景板的一天。",
  "想逃，但是又想再试一次。",
  "被夸一下的话，我会记很久。",
  "就算很不起眼，也想发出一点声音。",
  "虽然害怕，但还是有想做到的事。",
  "安静待着的时候，其实也在拼命。",
  "我可能不擅长说话，但我想认真弹下去。",
  "再给我一点时间，我应该可以的。",
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

  themeDarkButton?.classList.toggle("is-active", nextTheme === "dark");
  themeLightButton?.classList.toggle("is-active", nextTheme === "light");
  themeDarkButton?.setAttribute("aria-pressed", String(nextTheme === "dark"));
  themeLightButton?.setAttribute("aria-pressed", String(nextTheme === "light"));

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

function setAppMode(mode) {
  const nextMode = mode === "developer" ? "developer" : "user";
  body.dataset.appMode = nextMode;

  userModeButton?.classList.toggle("is-active", nextMode === "user");
  developerModeButton?.classList.toggle("is-active", nextMode === "developer");
  userModeButton?.setAttribute("aria-pressed", String(nextMode === "user"));
  developerModeButton?.setAttribute("aria-pressed", String(nextMode === "developer"));

  if (apiTestCard) {
    apiTestCard.setAttribute("aria-hidden", String(nextMode !== "developer"));
  }
  if (debugLogCard) {
    debugLogCard.setAttribute("aria-hidden", String(nextMode !== "developer"));
  }

  try {
    window.localStorage.setItem(APP_MODE_STORAGE_KEY, nextMode);
  } catch (error) {
    // Ignore storage failures and keep the UI usable.
  }

  if (modeSegmentControl) {
    const targetButton = nextMode === "developer" ? developerModeButton : userModeButton;
    modeSegmentControl.snapTo(targetButton);
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

function initializeAppMode() {
  try {
    const savedMode = window.localStorage.getItem(APP_MODE_STORAGE_KEY);
    if (savedMode === "developer" || savedMode === "user") {
      setAppMode(savedMode);
      return;
    }
  } catch (error) {
    // Ignore storage failures and use the default user mode.
  }

  setAppMode("user");
}

function initializeApiPanel() {
  const storedApiBase = getStoredApiBase();

  if (apiBaseInput) {
    apiBaseInput.value = storedApiBase;
  }

  if (storedApiBase) {
    apiStatusText.textContent = `当前 API：${storedApiBase}`;
  }

  apiSaveButton?.addEventListener("click", () => {
    const apiBase = normalizeApiBase(apiBaseInput?.value || "");
    saveApiBase(apiBase);
    apiStatusText.textContent = apiBase ? `已保存 API 地址：${apiBase}` : "已清空 API 地址。";
    addDebugLog("保存后端地址", apiBase || "已清空");
  });

  apiHealthButton?.addEventListener("click", testApiHealth);
  apiModalButton?.addEventListener("click", testApiHealthWithModal);
  apiResultCopy?.addEventListener("click", copyApiDebugText);
  apiResultClose?.addEventListener("click", closeApiResultModal);
  apiResultBackdrop?.addEventListener("click", closeApiResultModal);
  authGateDebugCopy?.addEventListener("click", copyAuthDebugText);
}

function renderAuthState() {
  if (currentAuthUser?.is_guest) {
    authStatusMeta && (authStatusMeta.textContent = "当前以游客身份进入，页面已解锁。");
    authResultText && (authResultText.textContent = "游客模式可直接浏览页面，但不会调用需要账户身份的接口。");
  } else if (currentAuthUser) {
    authStatusMeta && (authStatusMeta.textContent = `当前用户：${currentAuthUser.username}`);
    authResultText && (authResultText.textContent = "已登录，可以直接使用需要身份的后端接口。");
  } else {
    authStatusMeta && (authStatusMeta.textContent = "必须先通过前端认证弹窗，才能使用整个页面。");
    authResultText && (authResultText.textContent = "等待认证。");
  }

  renderSettingsSummary();
}

async function registerUser() {
  const username = authUsernameInput?.value.trim() || "";
  const password = authPasswordInput?.value || "";

  if (authGateResultText) {
    authGateResultText.textContent = "正在注册...";
  }
  addDebugLog("尝试注册", { username });

  try {
    const data = await apiJsonRequest("/api/auth/register", {
      method: "POST",
      body: {
        username,
        password,
      },
    });

    currentAuthUser = data.user || null;
    saveAuthUser(currentAuthUser);
    saveGuestMode(false);
    renderAuthState();
    loadGalleryManifest();
    authResultText && (authResultText.textContent = data.message || "注册成功。");
    if (authGateResultText) {
      authGateResultText.textContent = data.message || "注册成功。";
    }
    closeAuthGate(data.message || "注册成功，页面已解锁。");
    addDebugLog("注册成功", data.debug || data);
  } catch (error) {
    authResultText && (authResultText.textContent = error.message || "注册失败。");
    if (authGateResultText) {
      authGateResultText.textContent = error.message || "注册失败。";
    }
    const payload = {
      message: error.message || "unknown error",
      status: error.status || null,
      request_url: error.requestUrl || null,
      response: error.data || null,
    };
    showAuthDebug("注册失败", payload);
    addDebugLog("注册失败", payload);
  }
}

async function loginUser() {
  const username = authUsernameInput?.value.trim() || "";
  const password = authPasswordInput?.value || "";

  if (authGateResultText) {
    authGateResultText.textContent = "正在登录...";
  }
  addDebugLog("尝试登录", { username });

  try {
    const data = await apiJsonRequest("/api/auth/login", {
      method: "POST",
      body: {
        username,
        password,
      },
    });

    currentAuthToken = data.token || "";
    currentAuthUser = data.user || null;
    saveAuthToken(currentAuthToken);
    saveAuthUser(currentAuthUser);
    saveGuestMode(false);
    renderAuthState();
    loadGalleryManifest();
    authResultText && (authResultText.textContent = data.message || "登录成功。");
    if (authGateResultText) {
      authGateResultText.textContent = data.message || "登录成功。";
    }
    closeAuthGate(data.message || "登录成功，页面已解锁。");
    addDebugLog("登录成功", data.debug || data);
  } catch (error) {
    authResultText && (authResultText.textContent = error.message || "登录失败。");
    if (authGateResultText) {
      authGateResultText.textContent = error.message || "登录失败。";
    }
    const payload = {
      message: error.message || "unknown error",
      status: error.status || null,
      request_url: error.requestUrl || null,
      response: error.data || null,
    };
    showAuthDebug("登录失败", payload);
    addDebugLog("登录失败", payload);
  }
}

function enterGuestMode() {
  currentAuthToken = "";
  currentAuthUser = {
    username: "guest",
    is_guest: true,
  };
  saveAuthToken("");
  saveAuthUser(currentAuthUser);
  saveGuestMode(true);
  renderAuthState();
  loadGalleryManifest();
  authResultText && (authResultText.textContent = "已以游客身份进入。");
  if (authGateResultText) {
    authGateResultText.textContent = "已以游客身份进入。";
  }
  closeAuthGate("游客模式已启用。");
  addDebugLog("游客进入", "用户选择游客模式解锁页面。");
}

async function logoutUser() {
  if (currentAuthUser?.is_guest) {
    currentAuthUser = null;
    saveGuestMode(false);
    saveAuthToken("");
    saveAuthUser(null);
    renderAuthState();
    loadGalleryManifest();
    authResultText && (authResultText.textContent = "已退出游客模式。");
    openAuthGate("已退出游客模式，请重新登录、注册或继续以游客身份进入。");
    addDebugLog("退出游客模式", "已重新锁定页面。");
    return;
  }

  if (!currentAuthToken) {
    currentAuthUser = null;
    saveGuestMode(false);
    saveAuthUser(null);
    renderAuthState();
    loadGalleryManifest();
    authResultText && (authResultText.textContent = "当前没有登录会话。");
    openAuthGate("当前没有登录会话，请先完成认证。");
    addDebugLog("退出登录", "当前没有登录令牌。");
    return;
  }

  authResultText && (authResultText.textContent = "正在退出...");
  addDebugLog("尝试退出登录", currentAuthUser || "unknown user");

  try {
    const data = await apiJsonRequest("/api/auth/logout", {
      method: "POST",
    });

    currentAuthToken = "";
    currentAuthUser = null;
    saveAuthToken("");
    saveGuestMode(false);
    saveAuthUser(null);
    renderAuthState();
    loadGalleryManifest();
    authResultText && (authResultText.textContent = data.message || "已退出登录。");
    openAuthGate("已退出登录，请重新认证。");
    addDebugLog("退出成功", data.debug || data);
  } catch (error) {
    authResultText && (authResultText.textContent = error.message || "退出失败。");
    addDebugLog("退出失败", error.data || error.message || "unknown error");
  }
}

async function restoreAuthSession() {
  currentAuthToken = getStoredAuthToken();
  currentAuthUser = getStoredAuthUser();
  renderAuthState();

  if (currentAuthUser?.is_guest || getStoredGuestMode()) {
    currentAuthToken = "";
    currentAuthUser = {
      username: "guest",
      is_guest: true,
    };
    saveAuthToken("");
    saveAuthUser(currentAuthUser);
    saveGuestMode(true);
    renderAuthState();
    loadGalleryManifest();
    closeAuthGate("游客模式已恢复。");
    addDebugLog("恢复游客会话", "已从浏览器本地恢复游客模式。");
    return;
  }

  if (!currentAuthToken) {
    openAuthGate("请选择登录、注册或游客进入。");
    return;
  }

  try {
    const data = await apiJsonRequest("/api/auth/me");
    currentAuthUser = data.user || null;
    saveAuthUser(currentAuthUser);
    renderAuthState();
    loadGalleryManifest();
    closeAuthGate("已恢复登录会话。");
    addDebugLog("恢复登录会话", data.debug || data);
  } catch (error) {
    currentAuthToken = "";
    currentAuthUser = null;
    saveAuthToken("");
    saveGuestMode(false);
    saveAuthUser(null);
    renderAuthState();
    loadGalleryManifest();
    openAuthGate("登录状态已失效，请重新登录、注册或游客进入。");
    addDebugLog("恢复登录失败", error.data || error.message || "unknown error");
  }
}

function initializeAuthPanel() {
  settingsAvatarButton?.addEventListener("click", (event) => {
    if (currentAuthUser?.username || currentAuthUser?.is_guest) {
      return;
    }

    event.preventDefault();
    openAuthGate("请选择登录、注册或游客进入。");
    addDebugLog("打开认证弹窗", currentAuthUser || "anonymous");
  });
  authRegisterButton?.addEventListener("click", registerUser);
  authLoginButton?.addEventListener("click", loginUser);
  authGuestButton?.addEventListener("click", enterGuestMode);
  authLogoutButton?.addEventListener("click", logoutUser);
}

function initializeUserSettings() {
  currentUserSettings = getStoredUserSettings();
  renderSettingsSummary();
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

function openStoriesPage() {
  window.location.href = "./store/index.html";
}

async function loadMascotQuotes() {
  try {
    const response = await fetch("./data/mascot_quotes.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Failed to load mascot quotes");
    }
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      mascotLines = data.filter((item) => typeof item === "string" && item.trim().length > 0);
      return;
    }
  } catch (error) {
    // Fall through to the local fallback pool.
  }

  mascotLines = FALLBACK_MASCOT_LINES;
}

function renderGalleryImage() {
  if (galleryImages.length === 0) {
    galleryImage.removeAttribute("src");
    galleryImage.alt = "当前没有图库图片";
    galleryCaption.textContent = currentAuthUser?.username
      ? "当前图库为空，先上传一张图片。"
      : "请先登录正式账号，再管理自己的图库。";
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
    galleryCaption.textContent = "图片加载失败，请检查当前用户图库文件和后端接口。";
    return;
  }

  currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
  renderGalleryImage();
}

function reactMascot() {
  if (!mascotWidget || !mascotBubble) {
    return;
  }

  mascotBubble.textContent = randomFrom(mascotLines.length > 0 ? mascotLines : FALLBACK_MASCOT_LINES);
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
  if (!currentAuthToken || !currentAuthUser || currentAuthUser.is_guest) {
    galleryImages = [];
    currentImageIndex = 0;
    renderGalleryImage();
    return;
  }

  try {
    const data = await apiJsonRequest("/api/gallery", { method: "GET" });
    const items = Array.isArray(data.items) ? data.items : [];
    galleryImages = items.map((item, index) => ({
      src: item.file_url_with_token || `${item.file_url}?token=${encodeURIComponent(currentAuthToken)}`,
      alt: item.original_name || `gallery-image-${index + 1}`,
      caption: item.caption || item.original_name || "用户图库图片",
    }));
  } catch (error) {
    galleryImages = [];
    galleryCaption.textContent = error.message || "读取图库失败。";
  }

  currentImageIndex = galleryImages.length > 0 ? currentImageIndex % galleryImages.length : 0;
  renderGalleryImage();
}

async function uploadGalleryImage() {
  if (!currentAuthToken || !currentAuthUser || currentAuthUser.is_guest) {
    galleryCaption.textContent = "请先登录正式账号，再上传图片到个人图库。";
    return;
  }

  const file = galleryUploadInput?.files?.[0];
  if (!file) {
    galleryCaption.textContent = "请先选择一张图片。";
    return;
  }

  galleryCaption.textContent = "正在上传图片...";
  try {
    const data = await apiUploadRequest("/api/gallery/upload", "image", file, {
      caption: file.name,
    });
    addDebugLog("上传图库图片", data.item || file.name);
    galleryUploadInput.value = "";
    await loadGalleryManifest();
  } catch (error) {
    galleryCaption.textContent = error.message || "上传图片失败。";
    addDebugLog("上传图库图片失败", error.data || error.message || "unknown error");
  }
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

function triggerSearchInputFeedback() {
  searchPanel.classList.remove("is-typing");
  searchPanel.classList.remove("is-deleting");
  searchPanel.classList.remove("is-strong-typing");
  void searchPanel.offsetWidth;
  const currentValue = searchInput.value;
  const isDeleting = currentValue.length < previousSearchValue.length;
  const feedbackType =
    pendingSearchFeedbackType === "strong"
      ? "is-strong-typing"
      : isDeleting
        ? "is-deleting"
        : "is-typing";

  searchPanel.classList.add(feedbackType);
  previousSearchValue = currentValue;
  pendingSearchFeedbackType = "typing";
  window.clearTimeout(searchInputFeedbackTimer);
  searchInputFeedbackTimer = window.setTimeout(() => {
    searchPanel.classList.remove("is-typing");
    searchPanel.classList.remove("is-deleting");
    searchPanel.classList.remove("is-strong-typing");
  }, feedbackType === "is-strong-typing" ? 250 : isDeleting ? 230 : 190);
}

function markStrongSearchFeedback(event) {
  if (event.key === " " || event.code === "Space" || event.key === "Enter") {
    pendingSearchFeedbackType = "strong";
  }
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
      "input, textarea, [contenteditable='true'], button, a, .mode-switch, .theme-switch, .engine-switch, .section-rail, .interactive-panel, .link-card, .game-entry, canvas, .settings-avatar-button"
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
  const styles = window.getComputedStyle(container);
  const insetLeft = parseFloat(styles.paddingLeft) || 0;
  const offset = targetRect.left - containerRect.left;

  highlight.style.transition = animate ? "" : "none";
  highlight.style.width = `${targetRect.width}px`;
  highlight.style.transformOrigin = "center center";
  highlight.style.left = `${offset}px`;
  highlight.style.transform = "scaleX(1) scaleY(1)";

  if (!animate) {
    requestAnimationFrame(() => {
      highlight.style.transition = "";
    });
  }
}

function createSegmentControl(container, highlight, buttons, onSelect) {
  buttons = buttons.filter(Boolean);
  if (!container || !highlight || buttons.length === 0) {
    return null;
  }

  let isDragging = false;
  let activePointerId = null;
  let currentTarget = buttons.find((button) => button.classList.contains("is-active")) ?? buttons[0];
  let dragOffsetX = 0;
  let pressStartedOn = null;
  let pointerDownX = 0;
  let hasMovedDuringPress = false;

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
    return {
      left: buttonRect.left - containerRect.left,
      width: buttonRect.width,
    };
  }

  function syncCurrentButton(animate = true) {
    positionSegmentHighlight(container, highlight, currentTarget, animate);
  }

  function selectButton(button) {
    currentTarget = button;
    onSelect(button);
  }

  function setPressedState(pressed) {
    container.classList.toggle("is-pressing", pressed);
    highlight.classList.toggle("is-pressed", pressed);
  }

  function triggerTravelState() {
    highlight.classList.remove("is-traveling");
    void highlight.offsetWidth;
    highlight.classList.add("is-traveling");
    window.clearTimeout(triggerTravelState.resetTimer);
    triggerTravelState.resetTimer = window.setTimeout(() => {
      highlight.classList.remove("is-traveling");
    }, 320);
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      if (!isDragging && button !== currentTarget) {
        triggerTravelState();
      }
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
    pressStartedOn = targetButton;
    pointerDownX = event.clientX;
    hasMovedDuringPress = false;
    setPressedState(true);
    const bounds = getButtonBounds(currentTarget);
    dragOffsetX = event.clientX - (container.getBoundingClientRect().left + bounds.left + bounds.width / 2);
    container.setPointerCapture(event.pointerId);
  });

  container.addEventListener("pointermove", (event) => {
    if (!isDragging || event.pointerId !== activePointerId) {
      return;
    }

    event.preventDefault();
    if (Math.abs(event.clientX - pointerDownX) > 4) {
      hasMovedDuringPress = true;
    }
    const containerRect = container.getBoundingClientRect();
    const firstBounds = getButtonBounds(buttons[0]);
    const lastBounds = getButtonBounds(buttons[buttons.length - 1]);
    const width = currentTarget.getBoundingClientRect().width;
    const minLeft = firstBounds.left;
    const maxLeft = lastBounds.left;
    const rawLeft = event.clientX - containerRect.left - dragOffsetX - width / 2;
    const clampedLeft = Math.max(minLeft, Math.min(maxLeft, rawLeft));
    const pressScaleX = 1.08;
    const pressScaleY = 1.08;

    highlight.style.transition = "none";
    highlight.style.left = `${clampedLeft}px`;
    highlight.style.transformOrigin = rawLeft < minLeft ? "left center" : rawLeft > maxLeft ? "right center" : "center center";
    highlight.style.transform = `scaleX(${pressScaleX}) scaleY(${pressScaleY})`;
  });

  function finishDrag(event) {
    if (!isDragging || event.pointerId !== activePointerId) {
      return;
    }

    event.preventDefault();
    isDragging = false;
    activePointerId = null;
    setPressedState(false);
    if (container.hasPointerCapture(event.pointerId)) {
      container.releasePointerCapture(event.pointerId);
    }
    const nearest = hasMovedDuringPress ? getNearestButton(event.clientX) : pressStartedOn;
    const shouldTravel = nearest && nearest !== currentTarget;
    if (shouldTravel && !hasMovedDuringPress) {
      triggerTravelState();
    }
    currentTarget = nearest ?? currentTarget;
    selectButton(currentTarget);
    pressStartedOn = null;
    hasMovedDuringPress = false;
  }

  container.addEventListener("pointerup", finishDrag);
  container.addEventListener("pointercancel", (event) => {
    setPressedState(false);
    pressStartedOn = null;
    hasMovedDuringPress = false;
    finishDrag(event);
  });

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
initializeAppMode();
initializeApiPanel();
loadDebugLogs();
renderDebugLogs();
initializeAuthPanel();
initializeUserSettings();
renderQuickLinks();
updateClock();
loadMascotQuotes();
loadGalleryManifest();
initializeRipples();
restoreAuthSession();

modeSegmentControl = createSegmentControl(
  modeSwitch,
  modeHighlight,
  [userModeButton, developerModeButton],
  (button) => setAppMode(button === developerModeButton ? "developer" : "user")
);

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

modeSegmentControl?.refresh();
themeSegmentControl?.refresh();
engineSegmentControl?.refresh();
setInterval(updateClock, 250);
railDots.forEach((button) => {
  button.addEventListener("click", () => scrollToSection(button.dataset.target));
});
searchForm.addEventListener("submit", handleSearch);
debugLogClearButton?.addEventListener("click", clearDebugLogs);
debugLogCopyButton?.addEventListener("click", copyDebugLogs);
searchInput.addEventListener("keydown", markStrongSearchFeedback);
searchInput.addEventListener("input", triggerSearchInputFeedback);
storyCard.addEventListener("click", openStoriesPage);
storyCard.addEventListener("keydown", (event) => handleInteractiveKeydown(event, openStoriesPage));
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
galleryUploadButton?.addEventListener("click", () => {
  galleryUploadInput?.click();
});
galleryUploadInput?.addEventListener("change", uploadGalleryImage);
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
