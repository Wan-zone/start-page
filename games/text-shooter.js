const initialTextShooterState = () => ({
  turn: 1,
  arousal: 0,
  endurance: 100,
  technique: 2,
  wave: 1,
  score: 0,
  finished: false,
});

const TEXT_SHOOTER_RECORD_KEY = "wan-start-page-text-shooter-best-score";
const TEXT_SHOOTER_CONTENT_PATH = "./data/text-shooter-content.jsonc";

const FALLBACK_TEXT_SHOOTER_CONTENT = {
  ui: {
    documentTitle: "",
    metaDescription: "",
    page: {
      eyebrow: "",
      title: "",
      copy: ""
    },
    links: {
      backToGames: "",
      backToHome: ""
    },
    record: {
      label: "",
      newRecordPrefix: ""
    },
    status: {
      eyebrow: "",
      title: "",
      restart: "",
      labels: {
        turn: "",
        arousal: "",
        endurance: "",
        technique: "",
        wave: "",
        score: ""
      }
    },
    objective: {
      eyebrow: ""
    },
    battle: {
      eyebrow: "",
      title: ""
    },
    log: {
      eyebrow: "",
      title: ""
    },
    modal: {
      eyebrow: "",
      defaultTitle: "",
      defaultText: "",
      restart: "",
      back: ""
    }
  },
  system: {
    recordDefault: "0",
    fallbackActionTitle: "",
    fallbackActionLine: "",
    fallbackActionEffect: "",
    fallbackPressure: "",
    recordBadgePrefix: "",
    techniqueEmptyDetail: ""
  },
  opening: {
    startNarrative: "",
    startLog: {
      title: "",
      content: ""
    },
    objective: {
      title: "",
      meta: ""
    }
  },
  actions: {
    manual: {},
    fantasy: {},
    items: {},
    reserved: {}
  },
  pressure: {
    drop: ["快感爆棚，持久度狂掉。"],
    boost: ["敏感点突然被刺激，爽感直接拉满。"],
    steady: ["快感继续堆积。"]
  },
  endings: {
    success: {
      climax: { title: "高潮喷射！", text: "这一局结束了。" },
      long: { title: "持久高潮", text: "你撑到了最后。" }
    },
    failure: {
      flat: { title: "爽感掉空", text: "这一局没能把状态继续顶上去。" },
      soft: { title: "提前软掉", text: "鸡巴还没射就先软了。" }
    }
  }
};

const textShooter = {
  state: initialTextShooterState(),
  objectiveTitle: document.getElementById("objectiveTitle"),
  objectiveMeta: document.getElementById("objectiveMeta"),
  narrativeBox: document.getElementById("narrativeBox"),
  logList: document.getElementById("textShooterLog"),
  restartButton: document.getElementById("textShooterRestart"),
  flashLayer: document.getElementById("finishFlashLayer"),
  climaxJetLayer: document.getElementById("climaxJetLayer"),
  finishModal: document.getElementById("finishModal"),
  finishModalBadge: document.getElementById("finishModalBadge"),
  finishModalTitle: document.getElementById("finishModalTitle"),
  finishModalText: document.getElementById("finishModalText"),
  finishModalRestart: document.getElementById("finishModalRestart"),
  finishModalEyebrow: document.getElementById("finishModalEyebrow"),
  finishModalBackLink: document.getElementById("finishModalBackLink"),
  actionButtons: Array.from(document.querySelectorAll(".action-button")),
  values: {
    turn: document.getElementById("turnValue"),
    hp: document.getElementById("hpValue"),
    shield: document.getElementById("shieldValue"),
    ammo: document.getElementById("ammoValue"),
    wave: document.getElementById("waveValue"),
    score: document.getElementById("scoreValue"),
    record: document.getElementById("recordValue"),
  },
  ui: {
    pageTitleNode: document.getElementById("pageTitleNode"),
    pageDescriptionMeta: document.getElementById("pageDescriptionMeta"),
    pageEyebrow: document.getElementById("pageEyebrow"),
    pageHeading: document.getElementById("pageHeading"),
    pageCopy: document.getElementById("pageCopy"),
    backToGamesLink: document.getElementById("backToGamesLink"),
    backToHomeLink: document.getElementById("backToHomeLink"),
    recordLabel: document.getElementById("recordLabel"),
    statusEyebrow: document.getElementById("statusEyebrow"),
    statusHeading: document.getElementById("statusHeading"),
    turnLabel: document.getElementById("turnLabel"),
    arousalLabel: document.getElementById("arousalLabel"),
    enduranceLabel: document.getElementById("enduranceLabel"),
    techniqueLabel: document.getElementById("techniqueLabel"),
    waveLabel: document.getElementById("waveLabel"),
    scoreLabel: document.getElementById("scoreLabel"),
    objectiveEyebrow: document.getElementById("objectiveEyebrow"),
    battleEyebrow: document.getElementById("battleEyebrow"),
    battleHeading: document.getElementById("battleHeading"),
    logEyebrow: document.getElementById("logEyebrow"),
    logHeading: document.getElementById("logHeading")
  },
  bestScore: 0,
};

let textShooterContent = FALLBACK_TEXT_SHOOTER_CONTENT;

function randomFrom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function getRandomActions(count = 4) {
  const flattened = flattenActionContent();
  const keys = Object.keys(flattened);
  const shuffled = keys.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map((key) => ({ key }));
}

function flattenActionContent() {
  const actionGroups = textShooterContent.actions || {};
  return {
    ...(actionGroups.manual || {}),
    ...(actionGroups.fantasy || {}),
    ...(actionGroups.items || {}),
    ...(actionGroups.reserved || {})
  };
}

function getActionContent(key) {
  const fallbackTitle = textShooterContent.system?.fallbackActionTitle || key;
  const content = flattenActionContent()[key];
  return {
    title: content?.title || fallbackTitle,
    lines: Array.isArray(content?.lines) && content.lines.length > 0 ? content.lines : [textShooterContent.system?.fallbackActionLine || ""],
    effect: content?.effect || textShooterContent.system?.fallbackActionEffect || ""
  };
}

function parseEffectRange(valueText) {
  const normalized = valueText.trim().replace(/\s+/g, "");
  const rangeMatch = normalized.match(/^([+-]?\d+)~([+-]?\d+)$/);
  if (rangeMatch) {
    const start = Number(rangeMatch[1]);
    const end = Number(rangeMatch[2]);
    const min = Math.min(start, end);
    const max = Math.max(start, end);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  const singleMatch = normalized.match(/^([+-]?\d+)$/);
  if (singleMatch) {
    return Number(singleMatch[1]);
  }
  return 0;
}

function applyActionEffect(state, key) {
  const actionContent = getActionContent(key);
  const next = { ...state };
  const chunks = actionContent.effect
    .split(/[，,]/)
    .map((part) => part.trim())
    .filter(Boolean);

  chunks.forEach((chunk) => {
    const [label, rawValue] = chunk.split(/\s+/);
    if (!label || !rawValue) return;
    const delta = parseEffectRange(rawValue);
    if (label === "兴奋值") next.arousal += delta;
    if (label === "持久度") next.endurance += delta;
    if (label === "手法") next.technique += delta;
    if (label === "快感") next.score += delta;
    if (label === "阶段") next.wave += delta;
  });

  next.arousal = Math.max(0, next.arousal);
  next.endurance = Math.max(0, Math.min(100, next.endurance));
  next.technique = Math.max(0, Math.min(6, next.technique));
  next.wave = Math.max(1, next.wave);

  if (next.technique <= 0 && actionContent.effect.includes("手法 -")) {
    next.endurance = Math.max(0, next.endurance - 10);
  }

  return {
    state: next,
    detail: randomFrom(actionContent.lines),
  };
}

function getEndingContent(key) {
  const successEndings = textShooterContent.endings?.success || {};
  const failureEndings = textShooterContent.endings?.failure || {};
  const fallbackSuccess = FALLBACK_TEXT_SHOOTER_CONTENT.endings.success;
  const fallbackFailure = FALLBACK_TEXT_SHOOTER_CONTENT.endings.failure;
  return (
    successEndings[key] ||
    failureEndings[key] ||
    fallbackSuccess[key] ||
    fallbackFailure[key]
  );
}

function getPressureText(key) {
  const source = textShooterContent.pressure?.[key];
  if (Array.isArray(source) && source.length > 0) {
    return randomFrom(source);
  }
  const fallback = FALLBACK_TEXT_SHOOTER_CONTENT.pressure[key];
  return Array.isArray(fallback) && fallback.length > 0 ? randomFrom(fallback) : (textShooterContent.system?.fallbackPressure || "");
}

function applyTextShooterUi() {
  const ui = textShooterContent.ui || {};
  const uiNodes = textShooter.ui;

  document.title = ui.documentTitle || "";
  if (uiNodes.pageDescriptionMeta) {
    uiNodes.pageDescriptionMeta.setAttribute("content", ui.metaDescription || "");
  }

  uiNodes.pageEyebrow.textContent = ui.page?.eyebrow || "";
  uiNodes.pageHeading.textContent = ui.page?.title || "";
  uiNodes.pageCopy.textContent = ui.page?.copy || "";

  textShooter.finishModalEyebrow.textContent = ui.modal?.eyebrow || "";
  textShooter.finishModalRestart.textContent = ui.modal?.restart || "";
  textShooter.finishModalBackLink.textContent = ui.modal?.back || "";
  textShooter.finishModalTitle.textContent = ui.modal?.defaultTitle || "";
  textShooter.finishModalText.textContent = ui.modal?.defaultText || "";

  uiNodes.backToGamesLink.textContent = ui.links?.backToGames || "";
  uiNodes.backToHomeLink.textContent = ui.links?.backToHome || "";
  uiNodes.recordLabel.textContent = ui.record?.label || "";

  uiNodes.statusEyebrow.textContent = ui.status?.eyebrow || "";
  uiNodes.statusHeading.textContent = ui.status?.title || "";
  textShooter.restartButton.textContent = ui.status?.restart || "";
  uiNodes.turnLabel.textContent = ui.status?.labels?.turn || "";
  uiNodes.arousalLabel.textContent = ui.status?.labels?.arousal || "";
  uiNodes.enduranceLabel.textContent = ui.status?.labels?.endurance || "";
  uiNodes.techniqueLabel.textContent = ui.status?.labels?.technique || "";
  uiNodes.waveLabel.textContent = ui.status?.labels?.wave || "";
  uiNodes.scoreLabel.textContent = ui.status?.labels?.score || "";

  uiNodes.objectiveEyebrow.textContent = ui.objective?.eyebrow || "";
  uiNodes.battleEyebrow.textContent = ui.battle?.eyebrow || "";
  uiNodes.battleHeading.textContent = ui.battle?.title || "";
  uiNodes.logEyebrow.textContent = ui.log?.eyebrow || "";
  uiNodes.logHeading.textContent = ui.log?.title || "";
}

function updateActionButtons(actions) {
  textShooter.actionButtons.forEach((btn, i) => {
    if (actions[i]) {
      const actionContent = getActionContent(actions[i].key);
      btn.textContent = actionContent.title;
      btn.dataset.action = actions[i].key;
    }
  });
}

function appendLog(title, content) {
  const entry = document.createElement("div");
  entry.className = "log-item";
  entry.innerHTML = `<strong>${title}</strong><p>${content}</p>`;
  textShooter.logList.prepend(entry);
}

function updateTextShooterView() {
  const s = textShooter.state;
  textShooter.values.turn.textContent = String(s.turn);
  textShooter.values.hp.textContent = String(Math.max(0, s.arousal));
  textShooter.values.shield.textContent = String(Math.max(0, s.endurance));
  textShooter.values.ammo.textContent = String(Math.max(0, s.technique));
  textShooter.values.wave.textContent = String(s.wave);
  textShooter.values.score.textContent = String(s.score);
  textShooter.values.record.textContent = String(textShooter.bestScore);
}

function loadBestScore() {
  const raw = window.localStorage.getItem(TEXT_SHOOTER_RECORD_KEY);
  const parsed = Number(raw);
  textShooter.bestScore = Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function syncBestScore() {
  if (textShooter.state.score <= textShooter.bestScore) {
    return false;
  }
  textShooter.bestScore = textShooter.state.score;
  window.localStorage.setItem(TEXT_SHOOTER_RECORD_KEY, String(textShooter.bestScore));
  return true;
}

function setTextShooterFinished(message, subMessage) {
  textShooter.state.finished = true;
  textShooter.objectiveTitle.textContent = message;
  textShooter.objectiveMeta.textContent = subMessage;
  textShooter.actionButtons.forEach(btn => btn.classList.add("is-disabled"));
  const isNewRecord = syncBestScore();
  updateTextShooterView();
  showFinishModal(message, subMessage, isNewRecord);
}

function triggerFinishFlash() {
  const { flashLayer } = textShooter;
  if (!flashLayer) return;
  flashLayer.classList.remove("is-flashing");
  void flashLayer.offsetWidth;
  flashLayer.classList.add("is-flashing");
}

function triggerClimaxJet() {
  const { climaxJetLayer } = textShooter;
  if (!climaxJetLayer) return;
  climaxJetLayer.classList.remove("is-active");
  void climaxJetLayer.offsetWidth;
  climaxJetLayer.classList.add("is-active");
  window.setTimeout(() => {
    climaxJetLayer.classList.remove("is-active");
  }, 1000);
}

function showFinishModal(title, text, isNewRecord = false) {
  const { finishModal, finishModalBadge, finishModalTitle, finishModalText } = textShooter;
  if (!finishModal || !finishModalTitle || !finishModalText || !finishModalBadge) return;
  finishModalTitle.textContent = title;
  finishModalText.textContent = text;
  finishModalBadge.hidden = !isNewRecord;
  if (isNewRecord) {
    finishModalBadge.textContent = `${textShooterContent.ui?.record?.newRecordPrefix || ""}${textShooter.bestScore}`;
  }
  window.setTimeout(() => {
    finishModal.classList.add("is-visible");
    finishModal.setAttribute("aria-hidden", "false");
  }, 180);
}

function hideFinishModal() {
  const { finishModal, finishModalBadge } = textShooter;
  if (!finishModal || !finishModalBadge) return;
  finishModal.classList.remove("is-visible");
  finishModal.setAttribute("aria-hidden", "true");
  finishModalBadge.hidden = true;
}

function maybeApplyEnemyPressure(state) {
  const next = { ...state };
  const pressure = Math.random();
  if (pressure < 0.32) {
    next.endurance = Math.max(0, next.endurance - 18);
    return { state: next, text: getPressureText("drop") };
  }
  if (pressure > 0.82) {
    next.arousal += 11;
    next.score += 18;
    return { state: next, text: getPressureText("boost") };
  }
  return { state: next, text: getPressureText("steady") };
}

function runTextTurn(actionKey) {
  if (textShooter.state.finished) return;
  const actionContent = getActionContent(actionKey);
  if (!flattenActionContent()[actionKey]) return;

  const firstPass = applyActionEffect(textShooter.state, actionKey);
  const secondPass = maybeApplyEnemyPressure(firstPass.state);

  const nextState = {
    ...secondPass.state,
    turn: secondPass.state.turn + 1,
  };

  textShooter.state = nextState;
  textShooter.narrativeBox.textContent = `${firstPass.detail} ${secondPass.text} (${actionContent.effect})`;
  appendLog(`第 ${nextState.turn - 1} 回合 · ${actionContent.title}`, textShooter.narrativeBox.textContent);

  if (nextState.arousal >= 100) {
    triggerFinishFlash();
    const ending = getEndingContent("climax");
    setTextShooterFinished(ending.title, ending.text);
    return;
  }
  if (nextState.turn > 5 && nextState.arousal <= 0) {
    updateTextShooterView();
    const ending = getEndingContent("flat");
    setTextShooterFinished(ending.title, ending.text);
    return;
  }
  if (nextState.endurance <= 0) {
    const ending = getEndingContent("soft");
    setTextShooterFinished(ending.title, ending.text);
    return;
  }
  if (nextState.turn > 10) {
    const ending = getEndingContent("long");
    triggerClimaxJet();
    setTextShooterFinished(ending.title, ending.text);
    return;
  }

  updateTextShooterView();
  const newActions = getRandomActions(4);
  updateActionButtons(newActions);
}

function resetTextShooter() {
  textShooter.state = initialTextShooterState();
  hideFinishModal();
  textShooter.climaxJetLayer?.classList.remove("is-active");
  textShooter.narrativeBox.textContent = textShooterContent.opening?.startNarrative || FALLBACK_TEXT_SHOOTER_CONTENT.opening.startNarrative;
  textShooter.objectiveTitle.textContent = textShooterContent.opening?.objective?.title || FALLBACK_TEXT_SHOOTER_CONTENT.opening.objective.title;
  textShooter.objectiveMeta.textContent = textShooterContent.opening?.objective?.meta || FALLBACK_TEXT_SHOOTER_CONTENT.opening.objective.meta;
  textShooter.logList.innerHTML = "";
  textShooter.actionButtons.forEach(btn => btn.classList.remove("is-disabled"));
  updateTextShooterView();
  appendLog(
    textShooterContent.opening?.startLog?.title || FALLBACK_TEXT_SHOOTER_CONTENT.opening.startLog.title,
    textShooterContent.opening?.startLog?.content || FALLBACK_TEXT_SHOOTER_CONTENT.opening.startLog.content
  );
  const initialActions = getRandomActions(4);
  updateActionButtons(initialActions);
}

function parseJsonc(rawText) {
  const withoutBlockComments = rawText.replace(/\/\*[\s\S]*?\*\//g, "");
  const withoutLineComments = withoutBlockComments.replace(/^\s*\/\/.*$/gm, "");
  return JSON.parse(withoutLineComments);
}

async function loadTextShooterContent() {
  try {
    const response = await fetch(TEXT_SHOOTER_CONTENT_PATH, { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Failed to load text shooter content");
    }
    const rawText = await response.text();
    const data = parseJsonc(rawText);
    if (data && typeof data === "object") {
      textShooterContent = {
        ...FALLBACK_TEXT_SHOOTER_CONTENT,
        ...data,
        ui: {
          ...FALLBACK_TEXT_SHOOTER_CONTENT.ui,
          ...(data.ui || {}),
          page: {
            ...FALLBACK_TEXT_SHOOTER_CONTENT.ui.page,
            ...(data.ui?.page || {})
          },
          links: {
            ...FALLBACK_TEXT_SHOOTER_CONTENT.ui.links,
            ...(data.ui?.links || {})
          },
          record: {
            ...FALLBACK_TEXT_SHOOTER_CONTENT.ui.record,
            ...(data.ui?.record || {})
          },
          status: {
            ...FALLBACK_TEXT_SHOOTER_CONTENT.ui.status,
            ...(data.ui?.status || {}),
            labels: {
              ...FALLBACK_TEXT_SHOOTER_CONTENT.ui.status.labels,
              ...(data.ui?.status?.labels || {})
            }
          },
          objective: {
            ...FALLBACK_TEXT_SHOOTER_CONTENT.ui.objective,
            ...(data.ui?.objective || {})
          },
          battle: {
            ...FALLBACK_TEXT_SHOOTER_CONTENT.ui.battle,
            ...(data.ui?.battle || {})
          },
          log: {
            ...FALLBACK_TEXT_SHOOTER_CONTENT.ui.log,
            ...(data.ui?.log || {})
          },
          modal: {
            ...FALLBACK_TEXT_SHOOTER_CONTENT.ui.modal,
            ...(data.ui?.modal || {})
          }
        },
        system: {
          ...FALLBACK_TEXT_SHOOTER_CONTENT.system,
          ...(data.system || {})
        },
        opening: {
          ...FALLBACK_TEXT_SHOOTER_CONTENT.opening,
          ...(data.opening || {}),
          startLog: {
            ...FALLBACK_TEXT_SHOOTER_CONTENT.opening.startLog,
            ...(data.opening?.startLog || {})
          },
          objective: {
            ...FALLBACK_TEXT_SHOOTER_CONTENT.opening.objective,
            ...(data.opening?.objective || {})
          }
        },
        actions: {
          ...FALLBACK_TEXT_SHOOTER_CONTENT.actions,
          ...(data.actions || {})
        },
        pressure: {
          ...FALLBACK_TEXT_SHOOTER_CONTENT.pressure,
          ...(data.pressure || {})
        },
        endings: {
          ...FALLBACK_TEXT_SHOOTER_CONTENT.endings,
          ...(data.endings || {}),
          success: {
            ...FALLBACK_TEXT_SHOOTER_CONTENT.endings.success,
            ...(data.endings?.success || {})
          },
          failure: {
            ...FALLBACK_TEXT_SHOOTER_CONTENT.endings.failure,
            ...(data.endings?.failure || {})
          }
        }
      };
    }
  } catch (error) {
    textShooterContent = FALLBACK_TEXT_SHOOTER_CONTENT;
  }
  applyTextShooterUi();
}

textShooter.actionButtons.forEach(button => {
  button.addEventListener("click", () => runTextTurn(button.dataset.action));
});

textShooter.restartButton.addEventListener("click", resetTextShooter);
textShooter.finishModalRestart.addEventListener("click", resetTextShooter);
loadBestScore();
loadTextShooterContent().finally(resetTextShooter);
