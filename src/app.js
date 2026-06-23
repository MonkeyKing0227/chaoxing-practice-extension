const STORE_KEY = "studyPracticeState";
const DEFAULT_META = {
  course: "马克思主义基本原理",
  semester: "2026春",
  source: "学习通题库"
};

const sampleQuestions = [
  {
    id: "sample_1",
    type: "single",
    question: "下列哪一项属于操作系统？",
    options: ["Microsoft Word", "Windows", "Photoshop", "PowerPoint"],
    answer: ["Windows"],
    analysis: "Windows 是操作系统，其他选项是应用软件。",
    tags: ["计算机基础"]
  },
  {
    id: "sample_2",
    type: "multiple",
    question: "以下属于输入设备的是？",
    options: ["键盘", "显示器", "鼠标", "打印机"],
    answer: ["键盘", "鼠标"],
    analysis: "键盘和鼠标用于输入信息；显示器和打印机主要用于输出。",
    tags: ["计算机基础"]
  },
  {
    id: "sample_3",
    type: "judge",
    question: "HTTP 是一种应用层协议。",
    options: ["正确", "错误"],
    answer: ["正确"],
    analysis: "HTTP 工作在应用层，常用于网页数据传输。",
    tags: ["网络"]
  },
  {
    id: "sample_4",
    type: "blank",
    question: "马克思主义哲学认为，事物发展的根本原因在于事物的____。",
    options: [],
    answer: ["内部矛盾"],
    analysis: "内因是事物变化发展的根据。",
    tags: ["哲学"]
  }
];

const state = {
  questions: [],
  recalls: [],
  metadata: { ...DEFAULT_META },
  progress: {},
  mode: "all",
  filter: null,
  currentId: null,
  checked: false
};

const els = {
  bankSummary: document.querySelector("#bankSummary"),
  resetProgressBtn: document.querySelector("#resetProgressBtn"),
  emptyState: document.querySelector("#emptyState"),
  practiceView: document.querySelector("#practiceView"),
  courseInput: document.querySelector("#courseInput"),
  semesterInput: document.querySelector("#semesterInput"),
  importText: document.querySelector("#importText"),
  appendText: document.querySelector("#appendText"),
  recallText: document.querySelector("#recallText"),
  examTypeInput: document.querySelector("#examTypeInput"),
  confidenceInput: document.querySelector("#confidenceInput"),
  importBtn: document.querySelector("#importBtn"),
  appendBtn: document.querySelector("#appendBtn"),
  importRecallBtn: document.querySelector("#importRecallBtn"),
  extractPageBtn: document.querySelector("#extractPageBtn"),
  extractAppendBtn: document.querySelector("#extractAppendBtn"),
  exportDocBtn: document.querySelector("#exportDocBtn"),
  exportTopBtn: document.querySelector("#exportTopBtn"),
  exportAnalysisBtn: document.querySelector("#exportAnalysisBtn"),
  practiceTopBtn: document.querySelector("#practiceTopBtn"),
  clearBankBtn: document.querySelector("#clearBankBtn"),
  loadSampleBtn: document.querySelector("#loadSampleBtn"),
  saveCurrentBtn: document.querySelector("#saveCurrentBtn"),
  saveAndNextBtn: document.querySelector("#saveAndNextBtn"),
  autoCountInput: document.querySelector("#autoCountInput"),
  autoCollectBtn: document.querySelector("#autoCollectBtn"),
  stopAutoCollectBtn: document.querySelector("#stopAutoCollectBtn"),
  captureStatus: document.querySelector("#captureStatus"),
  modeButtons: [...document.querySelectorAll(".mode-button")],
  questionCounter: document.querySelector("#questionCounter"),
  questionType: document.querySelector("#questionType"),
  jumpInput: document.querySelector("#jumpInput"),
  jumpBtn: document.querySelector("#jumpBtn"),
  filterNotice: document.querySelector("#filterNotice"),
  filterText: document.querySelector("#filterText"),
  clearFilterBtn: document.querySelector("#clearFilterBtn"),
  questionText: document.querySelector("#questionText"),
  questionTags: document.querySelector("#questionTags"),
  optionsList: document.querySelector("#optionsList"),
  textAnswer: document.querySelector("#textAnswer"),
  resultPanel: document.querySelector("#resultPanel"),
  resultTitle: document.querySelector("#resultTitle"),
  answerText: document.querySelector("#answerText"),
  analysisText: document.querySelector("#analysisText"),
  analysisStats: document.querySelector("#analysisStats"),
  typeAnalysis: document.querySelector("#typeAnalysis"),
  tagAnalysis: document.querySelector("#tagAnalysis"),
  keywordAnalysis: document.querySelector("#keywordAnalysis"),
  topQuestionAnalysis: document.querySelector("#topQuestionAnalysis"),
  favoriteBtn: document.querySelector("#favoriteBtn"),
  checkBtn: document.querySelector("#checkBtn"),
  nextBtn: document.querySelector("#nextBtn")
};

init();

async function init() {
  const saved = await loadState();
  state.questions = saved.questions || [];
  state.recalls = saved.recalls || [];
  state.metadata = { ...DEFAULT_META, ...(saved.metadata || {}) };
  state.progress = saved.progress || {};
  state.mode = saved.mode || "all";
  state.filter = saved.filter || null;
  state.currentId = saved.currentId || null;
  els.courseInput.value = state.metadata.course;
  els.semesterInput.value = state.metadata.semester;

  bindEvents();
  render();
}

function bindEvents() {
  els.importBtn.addEventListener("click", () => importQuestions(els.importText.value, false));
  els.appendBtn.addEventListener("click", () => importQuestions(els.appendText.value, true));
  els.importRecallBtn.addEventListener("click", importRecalls);
  els.extractPageBtn.addEventListener("click", () => extractCurrentPageText(els.importText));
  els.extractAppendBtn.addEventListener("click", () => extractCurrentPageText(els.appendText));
  els.exportDocBtn.addEventListener("click", exportQuestionBankDocument);
  els.exportTopBtn.addEventListener("click", exportTopQuestionsDocument);
  els.exportAnalysisBtn.addEventListener("click", exportAnalysisDocument);
  els.practiceTopBtn.addEventListener("click", practiceTopQuestions);
  els.courseInput.addEventListener("change", syncMetadata);
  els.semesterInput.addEventListener("change", syncMetadata);
  els.saveCurrentBtn.addEventListener("click", saveCurrentQuestionFromPage);
  els.saveAndNextBtn.addEventListener("click", saveCurrentQuestionAndGoNext);
  els.autoCollectBtn.addEventListener("click", startAutoCollect);
  els.stopAutoCollectBtn.addEventListener("click", stopAutoCollect);
  els.loadSampleBtn.addEventListener("click", () => {
    state.questions = normalizeQuestions(sampleQuestions);
    state.currentId = state.questions[0]?.id || null;
    state.checked = false;
    persistAndRender();
  });
  els.clearBankBtn.addEventListener("click", () => {
    if (!confirm("确定清空题库？学习记录和回忆题也会一起清空。")) return;
    state.questions = [];
    state.recalls = [];
    state.progress = {};
    state.currentId = null;
    state.checked = false;
    persistAndRender();
  });
  els.resetProgressBtn.addEventListener("click", () => {
    if (!confirm("确定重置做题记录？题库会保留。")) return;
    state.progress = {};
    state.checked = false;
    persistAndRender();
  });
  els.modeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.mode = button.dataset.mode;
      state.currentId = getQuestionPool()[0]?.id || null;
      state.checked = false;
      persistAndRender();
    });
  });
  els.favoriteBtn.addEventListener("click", toggleFavorite);
  els.jumpBtn.addEventListener("click", jumpToInputIndex);
  els.jumpInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") jumpToInputIndex();
  });
  els.clearFilterBtn.addEventListener("click", clearActiveFilter);
  els.checkBtn.addEventListener("click", checkAnswer);
  els.nextBtn.addEventListener("click", () => {
    state.currentId = pickNextQuestion(state.currentId)?.id || null;
    state.checked = false;
    persistAndRender();
  });
  els.optionsList.addEventListener("change", () => {
    [...els.optionsList.querySelectorAll(".option-row")].forEach((row) => {
      row.classList.toggle("is-selected", row.querySelector("input").checked);
    });
  });
}

function syncMetadata() {
  state.metadata = currentMetadata();
  saveState();
}

function currentMetadata() {
  return {
    course: els.courseInput.value.trim() || DEFAULT_META.course,
    semester: els.semesterInput.value.trim() || DEFAULT_META.semester,
    source: DEFAULT_META.source
  };
}

const autoCollect = {
  running: false,
  stopped: false
};

async function extractCurrentPageText(target) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error("no active tab");
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => document.body?.innerText || ""
    });
    target.value = formatExtractedText(result?.result || "");
    if (!target.value) alert("当前页面没有读取到可见文本。");
  } catch {
    alert("读取当前页失败。可以直接复制题库文本后粘贴导入。");
  }
}

async function saveCurrentQuestionFromPage() {
  try {
    const added = await collectCurrentQuestionWithRetry();
    setCaptureStatus(added ? `已保存 ${added} 道题。` : "这道题已经在题库里了。");
  } catch (error) {
    alert(`保存当前题失败：${error.message || "没有识别到当前题"}`);
  }
}

async function saveCurrentQuestionAndGoNext() {
  try {
    await collectCurrentQuestionWithRetry();
    const moved = await clickNextQuestion();
    setCaptureStatus(moved ? "已保存，并跳到下一题。" : "已保存，但没有找到“下一题”按钮。");
  } catch (error) {
    alert(`保存并跳转失败：${error.message || "没有识别到当前题"}`);
  }
}

function setCaptureStatus(message) {
  els.captureStatus.textContent = message;
}

async function startAutoCollect() {
  if (autoCollect.running) return;

  const limit = clampNumber(Number(els.autoCountInput.value), 1, 500, 50);
  autoCollect.running = true;
  autoCollect.stopped = false;
  setAutoCollectUi(true);

  let addedTotal = 0;
  let visited = 0;

  try {
    for (let i = 0; i < limit; i += 1) {
      if (autoCollect.stopped) break;

      const added = await collectCurrentQuestionWithRetry();
      addedTotal += added;
      visited += 1;
      setCaptureStatus(`连续采集中：已处理 ${visited}/${limit} 题，新增 ${addedTotal} 题。`);

      if (autoCollect.stopped) break;
      const currentQuestion = await getCurrentPageQuestionText();
      const moved = await clickNextQuestion();
      if (!moved) {
        setCaptureStatus(`已停止：没有找到下一题。已处理 ${visited} 题，新增 ${addedTotal} 题。`);
        return;
      }

      await waitForQuestionReady(currentQuestion);
      await sleep(650);
    }

    const reason = autoCollect.stopped ? "已停止" : "已完成";
    setCaptureStatus(`${reason}：已处理 ${visited} 题，新增 ${addedTotal} 题。`);
  } catch (error) {
    setCaptureStatus(`连续采集已暂停：${error.message || "没有识别到当前题"}。已处理 ${visited} 题，新增 ${addedTotal} 题。`);
  } finally {
    autoCollect.running = false;
    autoCollect.stopped = false;
    setAutoCollectUi(false);
  }
}

function stopAutoCollect() {
  autoCollect.stopped = true;
  setCaptureStatus("正在停止，等当前题处理完。");
}

function setAutoCollectUi(running) {
  els.autoCollectBtn.disabled = running;
  els.saveCurrentBtn.disabled = running;
  els.saveAndNextBtn.disabled = running;
  els.autoCountInput.disabled = running;
  els.stopAutoCollectBtn.classList.toggle("is-hidden", !running);
}

function clampNumber(value, min, max, fallback) {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(value)));
}

async function getCurrentPageQuestionText() {
  const text = await readCurrentPageText();
  return normalizeQuestions(parseChaoxingText(text))[0]?.question || "";
}

async function waitForQuestionReady(startQuestion) {
  const deadline = Date.now() + 6000;

  while (Date.now() < deadline) {
    await sleep(300);
    const question = await getCurrentPageQuestionText();
    if (question && question !== startQuestion) return true;
  }

  const currentQuestion = await getCurrentPageQuestionText();
  return Boolean(currentQuestion);
}

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function exportQuestionBankDocument() {
  if (!state.questions.length) {
    alert("题库还是空的，先保存或导入一些题目。");
    return;
  }

  const html = buildQuestionBankDocument(state.questions);
  const blob = new Blob(["\ufeff", html], { type: "application/msword;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `题库_${formatDateForFile(new Date())}.doc`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function exportAnalysisDocument() {
  if (!state.questions.length) {
    alert("题库还是空的，先保存或导入一些题目。");
    return;
  }

  const data = analyzeQuestionBank();
  const html = buildAnalysisDocument(data);
  const blob = new Blob(["\ufeff", html], { type: "application/msword;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `题库分析_${formatDateForFile(new Date())}.doc`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function exportTopQuestionsDocument() {
  if (!state.questions.length) {
    alert("题库还是空的，先保存或导入一些题目。");
    return;
  }

  const entries = buildFrequencyEntries().slice(0, 100);
  const html = buildTopQuestionsDocument(entries);
  const blob = new Blob(["\ufeff", html], { type: "application/msword;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `高频题Top100_${formatDateForFile(new Date())}.doc`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function practiceTopQuestions() {
  const topIds = buildFrequencyEntries().slice(0, 100).map((entry) => entry.question.id);
  if (!topIds.length) {
    alert("题库还是空的，先保存或导入一些题目。");
    return;
  }

  state.mode = "all";
  state.filter = {
    kind: "高频题",
    label: "Top100",
    type: "top",
    ids: topIds
  };
  state.currentId = topIds[0] || null;
  state.checked = false;
  persistAndRender();
}

function buildQuestionBankDocument(questions) {
  const analysis = analyzeQuestionBank();
  const metadata = state.metadata || DEFAULT_META;
  const summary = questions.reduce((result, question) => {
    const label = typeLabel(question.type);
    result[label] = (result[label] || 0) + 1;
    return result;
  }, {});
  const summaryText = Object.entries(summary)
    .map(([label, count]) => `${escapeHtml(label)}：${count} 题`)
    .join("；");

  const questionItems = questions.map((question, index) => {
    const tags = [...new Set([typeLabel(question.type), ...(question.tags || [])])]
      .map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`)
      .join("");
    const options = question.options.length
      ? `<ol class="options">${question.options.map((option) => `<li>${escapeHtml(option)}</li>`).join("")}</ol>`
      : `<p class="blank-line">作答区：____________________________</p>`;
    const answer = question.answer.length ? question.answer.join("、") : "________________";
    const analysis = question.analysis || "________________";

    return `
      <section class="question">
        <h2>${index + 1}. ${escapeHtml(question.question)}</h2>
        <div class="tags">${tags}</div>
        <p><strong>课程：</strong>${escapeHtml(question.course || metadata.course)}；<strong>学期：</strong>${escapeHtml(question.semester || metadata.semester)}；<strong>来源：</strong>${escapeHtml(question.source || metadata.source)}</p>
        ${options}
        <p><strong>答案：</strong>${escapeHtml(answer)}</p>
        <p><strong>解析：</strong>${escapeHtml(analysis)}</p>
      </section>
    `;
  }).join("");

  return `
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8">
    <title>题库导出</title>
    <style>
      body { font-family: "Microsoft YaHei", "SimSun", sans-serif; color: #1f2622; line-height: 1.6; }
      h1 { font-size: 24px; margin: 0 0 8px; }
      h2 { font-size: 16px; margin: 0 0 8px; }
      .meta { color: #59645d; margin: 0 0 18px; }
      .question { border-top: 1px solid #d9ded8; padding: 14px 0; page-break-inside: avoid; }
      .tags { margin: 6px 0 10px; }
      .tag { display: inline-block; border: 1px solid #9bc8bd; color: #174b40; padding: 2px 8px; margin: 0 6px 6px 0; border-radius: 12px; font-size: 12px; }
      .options { margin: 8px 0 10px 22px; padding: 0; }
      .options li { margin: 3px 0; }
      .blank-line { margin: 10px 0; }
      table { width: 100%; border-collapse: collapse; margin: 8px 0 16px; }
      th, td { border: 1px solid #d9ded8; padding: 7px 9px; text-align: left; }
      th { background: #e4f2ee; }
      .analysis-summary { margin: 18px 0 24px; page-break-inside: avoid; }
    </style>
  </head>
  <body>
    <h1>${escapeHtml(metadata.course)} ${escapeHtml(metadata.semester)} 题库导出</h1>
    <p class="meta">共 ${questions.length} 题；${summaryText || "暂无分类"}；导出时间：${escapeHtml(new Date().toLocaleString("zh-CN"))}</p>
    ${buildAnalysisSummarySection(analysis)}
    ${questionItems}
  </body>
</html>`;
}

function buildAnalysisSummarySection(data) {
  const rows = (entries, emptyLabel = "暂无数据") => {
    if (!entries.length) {
      return `<tr><td colspan="3">${escapeHtml(emptyLabel)}</td></tr>`;
    }

    return entries.slice(0, 10).map((entry) => `
      <tr>
        <td>${escapeHtml(entry.label)}</td>
        <td>${entry.count}</td>
        <td>${entry.percent}%</td>
      </tr>
    `).join("");
  };
  const inlineList = (entries) => {
    if (!entries.length) return "暂无数据";
    return entries.slice(0, 12).map((entry) => `${entry.label}（${entry.count}）`).join("、");
  };

  return `
    <section class="analysis-summary">
      <h2>题库分析摘要</h2>
      <p>答案覆盖：${data.answered} / ${data.total} 题，${data.answerRate}%</p>
      <p>回忆题：${data.recallCount} 条；已练习：${data.attempted} 题；错题：${data.wrong} 题；收藏：${data.favorite} 题</p>
      <p><strong>主要知识点：</strong>${escapeHtml(inlineList(data.tagEntries))}</p>
      <p><strong>高频关键词：</strong>${escapeHtml(inlineList(data.keywordEntries))}</p>
      <h2>题型分布</h2>
      <table>
        <thead><tr><th>题型</th><th>数量</th><th>占比</th></tr></thead>
        <tbody>${rows(data.typeEntries)}</tbody>
      </table>
      <h2>知识点 / 标签 Top 10</h2>
      <table>
        <thead><tr><th>名称</th><th>数量</th><th>占比</th></tr></thead>
        <tbody>${rows(data.tagEntries)}</tbody>
      </table>
      <h2>高频关键词 Top 10</h2>
      <table>
        <thead><tr><th>关键词</th><th>出现次数</th><th>参考占比</th></tr></thead>
        <tbody>${rows(data.keywordEntries)}</tbody>
      </table>
    </section>
  `;
}

function buildTopQuestionsDocument(entries) {
  const metadata = state.metadata || DEFAULT_META;
  const items = entries.map((entry, index) => {
    const question = entry.question;
    const options = question.options.length
      ? `<ol>${question.options.map((option) => `<li>${escapeHtml(option)}</li>`).join("")}</ol>`
      : `<p>作答区：____________________________</p>`;
    return `
      <section class="question">
        <h2>${index + 1}. ${escapeHtml(question.question)}</h2>
        <p><strong>等级：</strong>${escapeHtml(entry.level)}；<strong>考频分：</strong>${entry.score}；<strong>完全重复：</strong>${entry.exactCount}；<strong>相似：</strong>${entry.similarCount}；<strong>同知识点：</strong>${entry.topicCount}</p>
        <p><strong>知识点：</strong>${escapeHtml([...entry.tags, ...entry.terms].join("、") || "暂无")}</p>
        ${options}
        <p><strong>答案：</strong>${escapeHtml(question.answer.length ? question.answer.join("、") : "________________")}</p>
        <p><strong>解析：</strong>${escapeHtml(question.analysis || "________________")}</p>
      </section>
    `;
  }).join("");

  return `
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8">
    <title>高频题 Top100</title>
    <style>
      body { font-family: "Microsoft YaHei", "SimSun", sans-serif; color: #1f2622; line-height: 1.6; }
      h1 { font-size: 24px; margin: 0 0 8px; }
      h2 { font-size: 16px; margin: 0 0 8px; }
      .meta { color: #59645d; margin: 0 0 18px; }
      .question { border-top: 1px solid #d9ded8; padding: 14px 0; page-break-inside: avoid; }
      ol { margin: 8px 0 10px 22px; padding: 0; }
      li { margin: 3px 0; }
    </style>
  </head>
  <body>
    <h1>${escapeHtml(metadata.course)} ${escapeHtml(metadata.semester)} 高频题 Top100</h1>
    <p class="meta">基于题库 ${state.questions.length} 题、回忆题 ${state.recalls.length} 条生成；导出时间：${escapeHtml(new Date().toLocaleString("zh-CN"))}</p>
    ${items}
  </body>
</html>`;
}

function formatDateForFile(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}_${pad(date.getHours())}${pad(date.getMinutes())}`;
}

function todayString() {
  const date = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function buildAnalysisDocument(data) {
  const section = (title, entries) => `
    <h2>${escapeHtml(title)}</h2>
    <table>
      <thead><tr><th>名称</th><th>数量</th><th>占比</th></tr></thead>
      <tbody>
        ${entries.map((entry) => `
          <tr>
            <td>${escapeHtml(entry.label)}</td>
            <td>${entry.count}</td>
            <td>${entry.percent}%</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;

  return `
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8">
    <title>题库分析</title>
    <style>
      body { font-family: "Microsoft YaHei", "SimSun", sans-serif; color: #1f2622; line-height: 1.6; }
      h1 { font-size: 24px; margin: 0 0 8px; }
      h2 { font-size: 18px; margin: 22px 0 8px; }
      p { margin: 4px 0; }
      table { width: 100%; border-collapse: collapse; margin: 8px 0 16px; }
      th, td { border: 1px solid #d9ded8; padding: 7px 9px; text-align: left; }
      th { background: #e4f2ee; }
    </style>
  </head>
  <body>
    <h1>题库分析</h1>
    <p>总题量：${data.total} 题</p>
    <p>回忆题：${data.recallCount} 条</p>
    <p>答案覆盖：${data.answered} 题，${data.answerRate}%</p>
    <p>已练习：${data.attempted} 题；错题：${data.wrong} 题；收藏：${data.favorite} 题</p>
    <p>导出时间：${escapeHtml(new Date().toLocaleString("zh-CN"))}</p>
    ${section("题型分布", data.typeEntries)}
    ${section("知识点 / 标签", data.tagEntries)}
    ${section("高频关键词", data.keywordEntries)}
    ${section("高频题 Top 20", data.frequencyEntries.slice(0, 20).map((entry) => ({
      label: entry.question.question,
      count: entry.score,
      percent: entry.exactCount
    })))}
  </body>
</html>`;
}

async function collectCurrentQuestion() {
  const text = await readCurrentPageText();
  const parsed = normalizeQuestions(parseChaoxingText(text));
  if (!parsed.length) {
    throw new Error("没有识别到当前题");
  }

  const before = state.questions.length;
  state.questions = mergeQuestions(state.questions, parsed);
  const added = state.questions.length - before;
  if (!state.currentId && state.questions[0]) state.currentId = state.questions[0].id;
  state.checked = false;
  await persistAndRender();
  return added;
}

async function collectCurrentQuestionWithRetry() {
  const deadline = Date.now() + 8000;
  let lastError = null;

  while (Date.now() < deadline) {
    try {
      return await collectCurrentQuestion();
    } catch (error) {
      lastError = error;
      await sleep(350);
    }
  }

  throw lastError || new Error("等待题目加载超时");
}

async function readCurrentPageText() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) throw new Error("no active tab");
  const [result] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => document.body?.innerText || ""
  });
  return result?.result || "";
}

async function clickNextQuestion() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) throw new Error("no active tab");
  const [result] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const visible = (element) => {
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.display !== "none"
          && style.visibility !== "hidden"
          && rect.width > 0
          && rect.height > 0;
      };
      const candidates = [...document.querySelectorAll("button, a, input[type='button'], input[type='submit'], [role='button']")];
      const next = candidates.find((element) => {
        const text = (element.innerText || element.value || element.getAttribute("aria-label") || "").trim();
        return visible(element)
          && !element.disabled
          && element.getAttribute("aria-disabled") !== "true"
          && /^下一题$|下一题/.test(text);
      });
      if (!next) return false;
      next.click();
      return true;
    }
  });
  return Boolean(result?.result);
}

function formatExtractedText(rawText) {
  const text = rawText.trim();
  if (!text) return "";

  const questions = normalizeQuestions(parseChaoxingText(text));
  if (questions.length) {
    return JSON.stringify(questions, null, 2);
  }

  return text;
}

async function importQuestions(input, append) {
  state.metadata = currentMetadata();
  const parsed = normalizeQuestions(parseQuestions(input));
  if (!parsed.length) {
    alert("没有识别到题目。可以先试试示例，或按 README 里的格式整理一下。");
    return;
  }

  const merged = append ? mergeQuestions(state.questions, parsed) : parsed;
  state.questions = merged;
  state.currentId = merged[0]?.id || null;
  state.checked = false;
  els.importText.value = "";
  els.appendText.value = "";
  await persistAndRender();
}

async function importRecalls() {
  state.metadata = currentMetadata();
  const parsed = parseRecalls(els.recallText.value);
  if (!parsed.length) {
    alert("没有识别到回忆题。可以只写题干关键词、选项、答案或考点，每题之间空一行。");
    return;
  }

  const before = state.recalls.length;
  state.recalls = mergeRecalls(state.recalls, parsed);
  const added = state.recalls.length - before;
  els.recallText.value = "";
  await persistAndRender();
  setCaptureStatus(added ? `已导入 ${added} 条回忆题。` : "这些回忆题已经导入过了。");
}

function parseRecalls(input) {
  const text = input.trim();
  if (!text) return [];

  try {
    const data = JSON.parse(text);
    const items = Array.isArray(data) ? data : Array.isArray(data.recalls) ? data.recalls : [data];
    return normalizeRecalls(items);
  } catch {
    const blocks = text.split(/\n\s*\n+/).map((block) => block.trim()).filter(Boolean);
    return normalizeRecalls(blocks.map((block, index) => parseRecallBlock(block, index)));
  }
}

function parseRecallBlock(block, index) {
  const lines = block.split(/\n/).map((line) => line.trim()).filter(Boolean);
  const answerLine = lines.find((line) => isAnswerLine(line));
  const tagLine = lines.find((line) => /^(考点|知识点|标签)[:：]/.test(line));
  const optionLines = [];
  const questionLines = [];

  lines.forEach((line) => {
    if (line === answerLine || line === tagLine) return;
    if (isInlineOption(line)) {
      optionLines.push(line.replace(/^([A-Ha-h])[.、．)]\s*/, (_, letter) => `${letter.toUpperCase()}.`));
      return;
    }
    questionLines.push(line.replace(/^\d+[.、．)]\s*/, ""));
  });

  return {
    id: `recall_${Date.now()}_${index}`,
    question: questionLines.join("\n"),
    options: optionLines,
    answer: answerLine ? stripAnswerPrefix(answerLine) : "",
    tags: tagLine ? tagLine.replace(/^[^:：]+[:：]\s*/, "").split(/[、,，;；\s]+/).filter(Boolean) : [],
    examType: els.examTypeInput.value.trim() || "期末",
    confidence: els.confidenceInput.value || "中",
    contributor: "匿名"
  };
}

function normalizeRecalls(items) {
  const metadata = currentMetadata();
  return items.map((item, index) => {
    const answer = Array.isArray(item.answer) ? item.answer.join("、") : String(item.answer || "").trim();
    const tags = Array.isArray(item.tags) ? item.tags.map(String) : String(item.tags || "").split(/[、,，;；\s]+/).filter(Boolean);
    const question = cleanQuestionText(item.question || item.keyword || item.keywords || item.point || item.content || "");
    const options = Array.isArray(item.options) ? item.options.map(String) : [];
    return {
      id: item.id || `recall_${Date.now()}_${index}`,
      course: item.course || metadata.course,
      semester: item.semester || metadata.semester,
      examType: item.examType || els.examTypeInput.value.trim() || "期末",
      source: item.source || "学生回忆",
      confidence: item.confidence || els.confidenceInput.value || "中",
      question,
      options,
      answer,
      tags,
      contributor: item.contributor || "匿名",
      createdAt: item.createdAt || todayString()
    };
  }).filter((item) => item.question || item.answer || item.tags.length || item.options.length);
}

function mergeRecalls(existing, incoming) {
  const known = new Set(existing.map((item) => recallFingerprint(item)));
  const uniqueIncoming = incoming.filter((item) => {
    const key = recallFingerprint(item);
    if (known.has(key)) return false;
    known.add(key);
    return true;
  });
  return [...existing, ...uniqueIncoming];
}

function recallFingerprint(item) {
  return `${item.course}|${item.semester}|${normalizeComparableText(item.question || item.tags.join(" "))}`.toLowerCase();
}

function parseQuestions(input) {
  const text = input.trim();
  if (!text) return [];

  try {
    const data = JSON.parse(text);
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.questions)) return data.questions;
    if (data.question) return [data];
    return [];
  } catch {
    return parsePlainText(text);
  }
}

function parsePlainText(text) {
  const chaoxingQuestions = parseChaoxingText(text);
  if (chaoxingQuestions.length) return chaoxingQuestions;

  const blocks = text
    .split(/\n\s*\n+/)
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks.map((block, index) => {
    const lines = block.split(/\n/).map((line) => line.trim()).filter(Boolean);
    const answerLine = lines.find((line) => /^(答案|正确答案|参考答案)[:：]/.test(line));
    const analysisLine = lines.find((line) => /^(解析|说明)[:：]/.test(line));
    const questionLines = lines.filter((line) => line !== answerLine && line !== analysisLine);
    const options = [];
    const stems = [];

    for (let i = 0; i < questionLines.length; i += 1) {
      const line = questionLines[i];
      const inlineOptionMatch = line.match(/^([A-Ha-h])[.、．)]\s*(.+)$/);
      const splitOptionMatch = line.match(/^([A-Ha-h])$/);
      if (inlineOptionMatch) {
        options.push(formatOption(inlineOptionMatch[1], inlineOptionMatch[2]));
      } else if (splitOptionMatch && questionLines[i + 1]) {
        options.push(formatOption(splitOptionMatch[1], questionLines[i + 1]));
        i += 1;
      } else {
        stems.push(line.replace(/^\d+[.、．)]\s*/, ""));
      }
    }

    const rawAnswer = answerLine ? stripAnswerPrefix(answerLine) : "";
    const answer = resolveAnswer(rawAnswer, options);
    const type = inferType(answer, options);

    return {
      id: `text_${Date.now()}_${index}`,
      type,
      question: stems.join("\n"),
      options,
      answer,
      analysis: analysisLine ? analysisLine.replace(/^[^:：]+[:：]\s*/, "") : "",
      tags: []
    };
  }).filter((item) => item.question && (item.answer.length || item.options.length));
}

function parseChaoxingText(text) {
  const lines = trimChaoxingVisibleText(text).split(/\n/).map((line) => line.trim()).filter(Boolean);
  const questions = [];

  for (let i = 0; i < lines.length; i += 1) {
    const start = lines[i].match(/^(\d+)\.\s*\((单选题|多选题|判断题|填空题|简答题|主观题)\)\s*(.*)$/);
    if (!start) continue;

    const questionNo = start[1];
    const type = chaoxingType(start[2]);
    const stems = [];
    const options = [];
    let rawAnswer = "";
    let analysis = "";

    if (start[3]) stems.push(start[3]);
    i += 1;

    while (i < lines.length && !isOptionLetter(lines[i]) && !isInlineOption(lines[i]) && !isQuestionBoundary(lines[i])) {
      if (isAnswerLine(lines[i])) {
        rawAnswer = stripAnswerPrefix(lines[i]);
      } else if (isAnalysisLine(lines[i])) {
        analysis = stripAnalysisPrefix(lines[i]);
      } else if (!isChaoxingNoise(lines[i])) {
        stems.push(lines[i].replace(/^\d+[.、．)]\s*/, ""));
      }
      i += 1;
    }

    while (i < lines.length && !isQuestionBoundary(lines[i])) {
      if (isAnswerLine(lines[i])) {
        rawAnswer = stripAnswerPrefix(lines[i]);
        i += 1;
        continue;
      }

      if (isAnalysisLine(lines[i])) {
        analysis = stripAnalysisPrefix(lines[i]);
        i += 1;
        continue;
      }

      const inlineOption = lines[i].match(/^([A-Ha-h])[.、．)]\s*(.+)$/);
      if (inlineOption) {
        options.push(formatOption(inlineOption[1], inlineOption[2]));
        i += 1;
        continue;
      }

      if (isOptionLetter(lines[i]) && lines[i + 1] && !isQuestionBoundary(lines[i + 1])) {
        options.push(formatOption(lines[i], lines[i + 1]));
        i += 2;
        continue;
      }

      i += 1;
    }

    if (type === "judge" && options.length === 0) {
      options.push("A.对", "B.错");
    }

    const answer = resolveAnswer(rawAnswer, options);

    if (stems.length && (options.length || isTextType(type))) {
      questions.push({
        id: `chaoxing_${Date.now()}_${questionNo}`,
        type,
        question: cleanQuestionText(stems.join("\n")),
        options,
        answer,
        analysis,
        tags: ["学习通导入", "整卷预览", typeLabel(type)]
      });
    }

    if (i < lines.length && /^(\d+)\.\s*\((单选题|多选题|判断题|填空题|简答题|主观题)\)/.test(lines[i])) {
      i -= 1;
    }
  }

  return questions;
}

function trimChaoxingVisibleText(text) {
  const lines = text.split(/\n/).map((line) => line.trim()).filter(Boolean);
  const questionStartPattern = /^(\d+)\.\s*\((单选题|多选题|判断题|填空题|简答题|主观题)\)/;
  const startIndex = lines.findIndex((line) => questionStartPattern.test(line));
  if (startIndex === -1) return text;

  const questionCount = lines.filter((line) => questionStartPattern.test(line)).length;
  if (questionCount > 1) {
    return lines.slice(startIndex).join("\n");
  }

  const endIndex = lines.findIndex((line, index) => {
    return index > startIndex && /^下一题$|^上一题$|^当前题目/.test(line);
  });

  return lines.slice(startIndex, endIndex === -1 ? undefined : endIndex).join("\n");
}

function chaoxingType(label) {
  if (label === "多选题") return "multiple";
  if (label === "判断题") return "judge";
  if (label === "填空题") return "blank";
  if (label === "简答题" || label === "主观题") return "text";
  return "single";
}

function formatOption(letter, text) {
  return `${letter.toUpperCase()}.${String(text).trim().replace(/^[A-Ha-h][.、．)]\s*/, "")}`;
}

function isAnswerLine(line) {
  return /^(答案|正确答案|参考答案|标准答案|本题答案|正确选项)[:：]/.test(line);
}

function stripAnswerPrefix(line) {
  return line.replace(/^(答案|正确答案|参考答案|标准答案|本题答案|正确选项)[:：]\s*/, "").trim();
}

function isAnalysisLine(line) {
  return /^(解析|答案解析|试题解析|说明)[:：]/.test(line);
}

function stripAnalysisPrefix(line) {
  return line.replace(/^(解析|答案解析|试题解析|说明)[:：]\s*/, "").trim();
}

function cleanQuestionText(value) {
  return String(value)
    .split(/\n/)
    .map((line) => line.trim())
    .filter((line) => line && !/^收藏$/.test(line))
    .join("\n")
    .trim();
}

function isOptionLetter(line) {
  return /^[A-Ha-h]$/.test(line);
}

function isInlineOption(line) {
  return /^[A-Ha-h][.、．)]\s*.+$/.test(line);
}

function isQuestionBoundary(line) {
  return /^(\d+)\.\s*\((单选题|多选题|判断题|填空题|简答题|主观题)\)/.test(line)
    || /^下一题$|^上一题$|^当前题目/.test(line)
    || /^[一二三四五六七八九十]、\s*(单选题|多选题|判断题|填空题|简答题|主观题)/.test(line);
}

function isChaoxingNoise(line) {
  return /^整卷预览$|^考试$|^姓名[:：]/.test(line)
    || /^学号[:：]|^题量[:：]|^考试时间[:：]/.test(line)
    || /^已作答$|^未作答$/.test(line)
    || /^收藏$/.test(line)
    || /^[\u4e00-\u9fa5]{2,}\d{8,}$/.test(line)
    || /^\d+'\s*\d+''$/.test(line);
}

function resolveAnswer(rawAnswer, options) {
  if (!rawAnswer) return [];
  const value = String(rawAnswer).trim();

  if (/^[A-Ha-h\s,，、;；|]+$/.test(value) && options.length) {
    const letters = value.match(/[A-Ha-h]/g);
    return [...new Set(letters.map((letter) => options[letter.toUpperCase().charCodeAt(0) - 65]).filter(Boolean))];
  }

  return value
    .split(/[|,，、;；]/)
    .map((item) => item.trim())
    .map((item) => normalizeAnswerItem(item, options))
    .filter(Boolean);
}

function normalizeAnswerItem(item, options) {
  if (!options.length) return item;

  const letterOption = item.match(/^([A-Ha-h])(?:[.、．)]\s*)?(.+)?$/);
  if (letterOption) {
    const option = options[letterOption[1].toUpperCase().charCodeAt(0) - 65];
    if (option) return option;
  }

  const directMatch = options.find((option) => option === item);
  if (directMatch) return directMatch;

  const textMatch = options.find((option) => {
    return option.replace(/^[A-Ha-h][.、．)]\s*/, "").trim() === item;
  });
  return textMatch || item;
}

function inferType(answer, options) {
  if (options.length === 2 && options.some((item) => /^(正确|错误|对|错|true|false)$/i.test(item))) {
    return "judge";
  }
  if (answer.length > 1) return "multiple";
  if (options.length) return "single";
  return "blank";
}

function normalizeQuestions(questions) {
  return questions.map((question, index) => {
    const metadata = state.metadata || DEFAULT_META;
    const options = Array.isArray(question.options) ? question.options.map(String) : [];
    const answerInput = Array.isArray(question.answer) ? question.answer.map(String) : [String(question.answer || "")].filter(Boolean);
    const answer = answerInput.flatMap((item) => resolveAnswer(item, options));
    const type = normalizeType(question.type) || inferType(answer, options);
    const tags = Array.isArray(question.tags) ? question.tags.map(String) : [];
    const typeTag = typeLabel(type);
    return {
      id: question.id || `q_${Date.now()}_${index}`,
      type,
      course: question.course || metadata.course,
      semester: question.semester || metadata.semester,
      source: question.source || metadata.source || DEFAULT_META.source,
      question: cleanQuestionText(question.question || ""),
      options,
      answer,
      analysis: String(question.analysis || ""),
      tags: [...new Set([typeTag, ...tags])],
      createdAt: question.createdAt || todayString()
    };
  }).filter((question) => question.question && (question.answer.length || question.options.length || isTextType(question.type)));
}

function mergeQuestions(existing, incoming) {
  const known = new Set(existing.map((question) => fingerprint(question)));
  const uniqueIncoming = incoming.filter((question) => {
    const key = fingerprint(question);
    if (known.has(key)) return false;
    known.add(key);
    return true;
  });
  return [...existing, ...uniqueIncoming];
}

function fingerprint(question) {
  return `${question.type}|${question.question}`.toLowerCase();
}

function render() {
  syncModeButtons();
  renderAnalysis();
  const pool = getQuestionPool();
  const current = getCurrentQuestion(pool);
  const total = state.questions.length;
  const done = Object.values(state.progress).filter((item) => item.attempts > 0).length;
  const wrong = Object.values(state.progress).filter((item) => item.wrong > 0).length;

  els.bankSummary.textContent = total
    ? `${total} 题 · 当前 ${pool.length} 题 · 已练 ${done} 题 · 错题 ${wrong} 题`
    : "未导入题库";
  els.emptyState.classList.toggle("is-hidden", total > 0);
  els.practiceView.classList.toggle("is-hidden", total === 0);

  if (!total) return;
  if (!current) {
    renderNoQuestion(pool);
    return;
  }
  renderQuestion(current, pool);
  renderActiveFilter(pool);
}

function renderAnalysis() {
  const data = analyzeQuestionBank();
  els.analysisStats.innerHTML = "";
  els.typeAnalysis.innerHTML = "";
  els.tagAnalysis.innerHTML = "";
  els.keywordAnalysis.innerHTML = "";
  els.topQuestionAnalysis.innerHTML = "";

  [
    ["总题量", `${data.total}`],
    ["回忆题", `${data.recallCount}`],
    ["答案覆盖", `${data.answerRate}%`],
    ["已练习", `${data.attempted}`],
    ["错题", `${data.wrong}`]
  ].forEach(([label, value]) => {
    const item = document.createElement("div");
    item.className = "stat-card";
    item.innerHTML = `<span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong>`;
    els.analysisStats.append(item);
  });

  renderBarList(els.typeAnalysis, data.typeEntries);
  renderBarList(els.tagAnalysis, data.tagEntries);
  renderKeywordList(els.keywordAnalysis, data.keywordEntries);
  renderTopQuestionList(els.topQuestionAnalysis, data.frequencyEntries.slice(0, 10));
}

function renderBarList(container, entries) {
  if (!entries.length) {
    container.innerHTML = `<p class="muted-line">暂无数据</p>`;
    return;
  }

  entries.forEach((entry) => {
    const row = document.createElement("button");
    row.className = "bar-row";
    row.type = "button";
    row.innerHTML = `
      <div class="bar-label">
        <span>${escapeHtml(entry.label)}</span>
        <strong>${entry.count} · ${entry.percent}%</strong>
      </div>
      <div class="bar-track"><span style="width: ${entry.percent}%"></span></div>
    `;
    row.addEventListener("click", () => applyTopicFilter(entry.label, "知识点"));
    container.append(row);
  });
}

function renderKeywordList(container, entries) {
  if (!entries.length) {
    container.innerHTML = `<p class="muted-line">暂无数据</p>`;
    return;
  }

  entries.forEach((entry) => {
    const item = document.createElement("button");
    item.className = "keyword-chip";
    item.type = "button";
    item.textContent = `${entry.label} ${entry.count}`;
    item.addEventListener("click", () => applyTopicFilter(entry.label, "关键词"));
    container.append(item);
  });
}

function renderTopQuestionList(container, entries) {
  if (!entries.length) {
    container.innerHTML = `<p class="muted-line">暂无数据</p>`;
    return;
  }

  entries.forEach((entry, index) => {
    const item = document.createElement("button");
    item.className = "top-question";
    item.type = "button";
    item.innerHTML = `
      <strong>${index + 1}. ${escapeHtml(entry.question.question)}</strong>
      <span>考频分 ${entry.score} · 重复 ${entry.exactCount} · 相似 ${entry.similarCount} · 同知识点 ${entry.topicCount}</span>
      <small>${escapeHtml([...entry.tags, ...entry.terms].join("、") || "暂无知识点")}</small>
    `;
    item.addEventListener("click", () => jumpToQuestion(entry.question.id));
    container.append(item);
  });
}

function analyzeQuestionBank() {
  const total = state.questions.length;
  const progressItems = Object.values(state.progress);
  const answered = state.questions.filter((question) => question.answer.length > 0).length;
  const attempted = progressItems.filter((item) => item.attempts > 0).length;
  const wrong = progressItems.filter((item) => item.wrong > 0).length;
  const favorite = progressItems.filter((item) => item.favorite).length;

  const typeCounts = countBy(state.questions, (question) => typeLabel(question.type));
  const tagCounts = countTags(state.questions);
  const keywordCounts = countKeywords(state.questions);
  const frequencyEntries = buildFrequencyEntries();

  return {
    total,
    recallCount: state.recalls.length,
    answered,
    answerRate: total ? Math.round((answered / total) * 100) : 0,
    attempted,
    wrong,
    favorite,
    typeEntries: toAnalysisEntries(typeCounts, total),
    tagEntries: toAnalysisEntries(tagCounts, Math.max(1, state.questions.length)).slice(0, 12),
    keywordEntries: toAnalysisEntries(keywordCounts, Math.max(1, state.questions.length)).slice(0, 18),
    frequencyEntries
  };
}

function countBy(items, getKey) {
  return items.reduce((result, item) => {
    const key = getKey(item);
    if (!key) return result;
    result[key] = (result[key] || 0) + 1;
    return result;
  }, {});
}

function countTags(questions) {
  const ignored = new Set(["学习通导入", "整卷预览", "单选题", "多选题", "判断题", "填空题", "主观题", "题目"]);
  const counts = {};

  questions.forEach((question) => {
    (question.tags || []).forEach((tag) => {
      if (!tag || ignored.has(tag)) return;
      counts[tag] = (counts[tag] || 0) + 1;
    });
  });

  return Object.keys(counts).length ? counts : countKeywords(questions);
}

function countKeywords(questions) {
  const counts = {};
  const terms = getKnowledgeTerms();

  questions.forEach((question) => {
    const text = `${question.question} ${question.options.join(" ")}`;
    terms.forEach((term) => {
      const matches = text.match(new RegExp(term, "g"));
      if (matches) counts[term] = (counts[term] || 0) + matches.length;
    });
  });

  if (Object.keys(counts).length) return counts;

  questions.forEach((question) => {
    extractFallbackKeywords(`${question.question} ${question.options.join(" ")}`).forEach((term) => {
      counts[term] = (counts[term] || 0) + 1;
    });
  });

  return counts;
}

function getKnowledgeTerms() {
  return [
    "马克思主义", "唯物主义", "唯心主义", "辩证法", "实践", "认识", "真理", "价值",
    "矛盾", "生产力", "生产关系", "经济基础", "上层建筑", "资本主义", "社会主义",
    "共产主义", "剩余价值", "劳动力", "商品", "货币", "垄断", "人民群众", "社会存在",
    "社会意识", "人工智能", "科学技术", "国家", "自由", "规律", "意识", "物质",
    "历史唯物主义", "辩证唯物主义", "世界观", "方法论", "绝对真理", "相对真理",
    "感性认识", "理性认识", "社会形态", "社会基本矛盾", "阶级斗争", "无产阶级",
    "资产阶级", "经济危机", "价值规律", "使用价值", "交换价值", "劳动二重性",
    "抽象劳动", "具体劳动", "资本积累", "国家垄断资本主义", "金融资本", "平均利润",
    "共产主义社会", "社会主义社会", "群众路线", "主要矛盾", "矛盾特殊性",
    "矛盾普遍性", "质变", "量变", "否定之否定", "辩证否定", "客观规律",
    "主观能动性", "物质生产方式", "生产资料所有制", "人的本质", "人的自由发展"
  ];
}

function extractFallbackKeywords(text) {
  const stopwords = new Set(["下列", "以下", "一个", "一种", "说明", "认为", "属于", "的是", "不是", "可以", "这个", "这些"]);
  return [...String(text).matchAll(/[\u4e00-\u9fa5]{2,}/g)]
    .flatMap((match) => {
      const value = match[0];
      const terms = [];
      for (let i = 0; i < value.length - 1; i += 2) {
        terms.push(value.slice(i, i + 2));
      }
      return terms;
    })
    .filter((term) => term.length >= 2 && !stopwords.has(term));
}

function toAnalysisEntries(counts, total) {
  return Object.entries(counts)
    .map(([label, count]) => ({
      label,
      count,
      percent: total ? Math.round((count / total) * 100) : 0
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "zh-CN"));
}

function buildFrequencyEntries() {
  const tagCounts = countTags(state.questions);
  const keywordCounts = countKeywords(state.questions);

  return state.questions.map((question) => {
    const questionText = frequencyText(question);
    const questionKey = normalizeComparableText(questionText);
    const questionTerms = extractKnowledgeTerms(questionText);
    const questionTags = (question.tags || []).filter((tag) => !ignoredAnalysisTags().has(tag));

    const duplicateQuestions = state.questions.filter((item) => item.id !== question.id
      && normalizeComparableText(frequencyText(item)) === questionKey).length;
    const exactRecalls = state.recalls.filter((recall) => normalizeComparableText(frequencyText(recall)) === questionKey).length;
    const similarRecalls = state.recalls.filter((recall) => {
      const recallKey = normalizeComparableText(frequencyText(recall));
      return recallKey && recallKey !== questionKey && isSimilarText(questionText, frequencyText(recall));
    }).length;
    const topicRecalls = state.recalls.filter((recall) => sharesTopic(question, recall, questionTerms, questionTags)).length;
    const recentWeight = state.recalls
      .filter((recall) => recallMatchesQuestion(question, recall, questionTerms, questionTags))
      .reduce((score, recall) => score + recallConfidenceWeight(recall), 0);
    const knowledgeHotness = Math.max(
      ...questionTags.map((tag) => tagCounts[tag] || 0),
      ...questionTerms.map((term) => keywordCounts[term] || 0),
      0
    );
    const keywordHotness = questionTerms.reduce((sum, term) => sum + (keywordCounts[term] || 0), 0);

    const exactCount = 1 + duplicateQuestions + exactRecalls;
    const score = exactCount * 40
      + Math.min(knowledgeHotness, 20) * 30
      + Math.min(keywordHotness, 30) * 20
      + Math.min(recentWeight, 10) * 10
      + similarRecalls * 25
      + topicRecalls * 12;

    return {
      question,
      score,
      exactCount,
      similarCount: similarRecalls,
      topicCount: topicRecalls,
      terms: questionTerms,
      tags: questionTags,
      level: score >= 180 ? "必背题" : score >= 100 ? "高频题" : score >= 50 ? "普通题" : "潜在题"
    };
  }).sort((a, b) => b.score - a.score || b.exactCount - a.exactCount);
}

function ignoredAnalysisTags() {
  return new Set(["学习通导入", "整卷预览", "单选题", "多选题", "判断题", "填空题", "主观题", "题目"]);
}

function frequencyText(item) {
  return `${item.question || ""} ${(item.options || []).join(" ")} ${(item.tags || []).join(" ")}`;
}

function normalizeComparableText(value) {
  return String(value)
    .replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, "")
    .toLowerCase();
}

function extractKnowledgeTerms(text) {
  return getKnowledgeTerms().filter((term) => String(text).includes(term));
}

function isSimilarText(left, right) {
  const leftTerms = new Set(extractComparableTokens(left));
  const rightTerms = new Set(extractComparableTokens(right));
  if (!leftTerms.size || !rightTerms.size) return false;
  const overlap = [...leftTerms].filter((term) => rightTerms.has(term)).length;
  const ratio = overlap / Math.min(leftTerms.size, rightTerms.size);
  return overlap >= 2 && ratio >= 0.35;
}

function extractComparableTokens(text) {
  const known = extractKnowledgeTerms(text);
  if (known.length) return known;
  return extractFallbackKeywords(text).slice(0, 12);
}

function sharesTopic(question, recall, questionTerms, questionTags) {
  const recallTags = recall.tags || [];
  const recallTerms = extractKnowledgeTerms(frequencyText(recall));
  return questionTags.some((tag) => recallTags.includes(tag))
    || questionTerms.some((term) => recallTerms.includes(term));
}

function recallMatchesQuestion(question, recall, questionTerms, questionTags) {
  const questionText = frequencyText(question);
  const recallText = frequencyText(recall);
  return normalizeComparableText(questionText) === normalizeComparableText(recallText)
    || isSimilarText(questionText, recallText)
    || sharesTopic(question, recall, questionTerms, questionTags);
}

function recallConfidenceWeight(recall) {
  const confidence = { 高: 3, 中: 2, 低: 1 }[recall.confidence] || 1;
  const sameSemester = recall.semester === state.metadata.semester ? 2 : 0;
  return confidence + sameSemester;
}

function jumpToQuestion(questionId) {
  state.mode = "all";
  state.filter = null;
  state.currentId = questionId;
  state.checked = false;
  persistAndRender();
}

function jumpToInputIndex() {
  const pool = getQuestionPool();
  if (!pool.length) return;
  const index = clampNumber(Number(els.jumpInput.value), 1, pool.length, 1) - 1;
  state.currentId = pool[index].id;
  state.checked = false;
  persistAndRender();
}

function applyTopicFilter(label, kind) {
  state.filter = { label, kind };
  const pool = getQuestionPool();
  state.currentId = pool[0]?.id || null;
  state.checked = false;
  persistAndRender();
}

function clearActiveFilter() {
  state.filter = null;
  const pool = getQuestionPool();
  state.currentId = pool[0]?.id || null;
  state.checked = false;
  persistAndRender();
}

function renderActiveFilter(pool) {
  const active = Boolean(state.filter);
  els.filterNotice.classList.toggle("is-hidden", !active);
  if (!active) return;
  const label = state.filter.type === "top"
    ? `${state.filter.kind}：${state.filter.label}`
    : `${state.filter.kind}：${state.filter.label}`;
  els.filterText.textContent = `${label} · ${pool.length} 题`;
}

function questionMatchesFilter(question, filter) {
  if (filter.type === "top") {
    return Array.isArray(filter.ids) && filter.ids.includes(question.id);
  }
  const label = filter.label;
  const text = `${question.question} ${(question.options || []).join(" ")} ${(question.tags || []).join(" ")}`;
  return (question.tags || []).includes(label) || text.includes(label);
}

function syncModeButtons() {
  els.modeButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.mode === state.mode);
  });
}

function getQuestionPool() {
  let pool = state.questions;
  if (state.mode === "wrong") {
    pool = pool.filter((question) => (state.progress[question.id]?.wrong || 0) > 0);
  }
  if (state.mode === "favorite") {
    pool = pool.filter((question) => state.progress[question.id]?.favorite);
  }
  if (state.filter) {
    pool = pool.filter((question) => questionMatchesFilter(question, state.filter));
  }
  return pool;
}

function getCurrentQuestion(pool) {
  if (!pool.length) return null;
  return pool.find((question) => question.id === state.currentId) || pool[0];
}

function renderNoQuestion() {
  els.questionCounter.textContent = "0 / 0";
  els.jumpInput.value = "1";
  els.jumpInput.max = "1";
  els.questionType.textContent = "暂无题目";
  els.questionText.textContent = state.filter ? "当前筛选下没有题目。" : state.mode === "wrong" ? "现在还没有错题。" : "现在还没有收藏题。";
  els.optionsList.innerHTML = "";
  renderActiveFilter([]);
  els.textAnswer.classList.add("is-hidden");
  els.resultPanel.classList.add("is-hidden");
  els.checkBtn.classList.add("is-hidden");
  els.nextBtn.classList.add("is-hidden");
  els.favoriteBtn.classList.add("is-hidden");
}

function renderQuestion(question, pool) {
  const index = pool.findIndex((item) => item.id === question.id) + 1;
  const progress = state.progress[question.id] || {};
  els.questionCounter.textContent = `${index} / ${pool.length}`;
  els.jumpInput.value = String(index);
  els.jumpInput.max = String(pool.length);
  els.questionType.textContent = typeLabel(question.type);
  els.questionText.textContent = question.question;
  renderTags(question);
  els.favoriteBtn.textContent = progress.favorite ? "取消收藏" : "收藏";
  els.checkBtn.textContent = question.answer.length ? "判题" : "记录作答";
  els.favoriteBtn.classList.remove("is-hidden");
  els.checkBtn.classList.toggle("is-hidden", state.checked);
  els.nextBtn.classList.remove("is-hidden");
  els.resultPanel.classList.toggle("is-hidden", !state.checked);

  renderAnswerArea(question);

  if (state.checked) {
    const hasAnswer = question.answer.length > 0;
    const isCorrect = Boolean(progress.lastCorrect);
    els.resultPanel.classList.toggle("is-wrong", hasAnswer && !isCorrect);
    els.resultTitle.textContent = hasAnswer ? (isCorrect ? "回答正确" : "再看一眼") : "已记录";
    els.answerText.textContent = hasAnswer ? `答案：${question.answer.join("、")}` : "这道题还没有导入答案。";
    els.analysisText.textContent = question.analysis ? `解析：${question.analysis}` : "解析：暂无";
  }
}

function renderAnswerArea(question) {
  els.optionsList.innerHTML = "";
  els.textAnswer.value = "";
  const isText = isTextType(question.type) || question.options.length === 0;
  els.textAnswer.classList.toggle("is-hidden", !isText);
  els.optionsList.classList.toggle("is-hidden", isText);

  if (isText) return;

  const inputType = question.type === "multiple" ? "checkbox" : "radio";
  question.options.forEach((option, index) => {
    const id = `option_${index}`;
    const label = document.createElement("label");
    label.className = "option-row";
    label.innerHTML = `
      <input id="${id}" name="answer" type="${inputType}" value="${escapeHtml(option)}">
      <span>${escapeHtml(option)}</span>
    `;
    els.optionsList.append(label);
  });
}

function checkAnswer() {
  const current = getCurrentQuestion(getQuestionPool());
  if (!current) return;

  const selected = readUserAnswer(current);
  if (!selected.length) {
    alert("先选一个答案再判题。");
    return;
  }

  const hasAnswer = current.answer.length > 0;
  const correct = hasAnswer ? sameAnswer(selected, current.answer) : null;
  const item = state.progress[current.id] || { attempts: 0, correct: 0, wrong: 0, favorite: false };
  item.attempts += 1;
  item.correct += correct === true ? 1 : 0;
  item.wrong += correct === false ? 1 : 0;
  item.lastCorrect = correct;
  state.progress[current.id] = item;
  state.checked = true;
  persistAndRender();
}

function readUserAnswer(question) {
  if (isTextType(question.type) || question.options.length === 0) {
    return [els.textAnswer.value.trim()].filter(Boolean);
  }
  return [...els.optionsList.querySelectorAll("input:checked")].map((input) => input.value);
}

function renderTags(question) {
  const tags = [...new Set([typeLabel(question.type), ...(question.tags || [])])];
  els.questionTags.innerHTML = "";
  tags.forEach((tag) => {
    const item = document.createElement("span");
    item.className = "tag";
    item.textContent = tag;
    els.questionTags.append(item);
  });
}

function isTextType(type) {
  return type === "text" || type === "blank";
}

function sameAnswer(userAnswer, correctAnswer) {
  const clean = (items) => items.map((item) => item.trim().toLowerCase()).sort();
  return JSON.stringify(clean(userAnswer)) === JSON.stringify(clean(correctAnswer));
}

function toggleFavorite() {
  const current = getCurrentQuestion(getQuestionPool());
  if (!current) return;
  const item = state.progress[current.id] || { attempts: 0, correct: 0, wrong: 0, favorite: false };
  item.favorite = !item.favorite;
  state.progress[current.id] = item;
  persistAndRender();
}

function pickNextQuestion(currentId) {
  const pool = getQuestionPool();
  if (!pool.length) return null;
  if (!currentId) return pool[Math.floor(Math.random() * pool.length)];
  const candidates = pool.filter((question) => question.id !== currentId);
  return candidates.length ? candidates[Math.floor(Math.random() * candidates.length)] : pool[0];
}

function typeLabel(type) {
  return {
    single: "单选题",
    multiple: "多选题",
    judge: "判断题",
    blank: "填空题",
    text: "主观题"
  }[type] || "题目";
}

function normalizeType(type) {
  return {
    single: "single",
    multiple: "multiple",
    judge: "judge",
    blank: "blank",
    text: "text",
    "单选题": "single",
    "多选题": "multiple",
    "判断题": "judge",
    "填空题": "blank",
    "简答题": "text",
    "主观题": "text"
  }[type] || "";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function persistAndRender() {
  await saveState();
  render();
}

function loadState() {
  return new Promise((resolve) => {
    chrome.storage.local.get(STORE_KEY, (data) => resolve(data[STORE_KEY] || {}));
  });
}

function saveState() {
  return new Promise((resolve) => {
    chrome.storage.local.set({
      [STORE_KEY]: {
        questions: state.questions,
        recalls: state.recalls,
        metadata: state.metadata,
        progress: state.progress,
        mode: state.mode,
        filter: state.filter,
        currentId: state.currentId
      }
    }, resolve);
  });
}
