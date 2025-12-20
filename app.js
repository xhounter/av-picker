// =======================
// 共用工具
// =======================
function getList() {
  return JSON.parse(localStorage.getItem("avList") || "[]");
}

function saveListToStorage(list) {
  localStorage.setItem("avList", JSON.stringify(list));
}

// =======================
// 儲存片單
// =======================
function saveList() {
  const text = document.getElementById("input").value.trim();
  if (!text) {
    document.getElementById("status").innerText = "❌ 尚未輸入片單";
    return;
  }

  const list = text
    .split("\n")
    .map(line => {
      const [id, actor, tag, note] = line.split("|");
      return {
        id: id?.trim(),
        actor: actor?.trim() || "",
        tag: tag?.trim() || "",
        note: note?.trim() || ""
      };
    })
    .filter(v => v.id);

  saveListToStorage(list);
  document.getElementById("status").innerText =
    `✅ 已儲存 ${list.length} 部影片`;
}

// =======================
// 抽籤 + 記錄歷史（只記一次）
// =======================
let lastPickId = null;

function draw() {
  const list = getList();
  if (!list.length) {
    document.getElementById("result").innerText = "❌ 尚未有片單";
    return;
  }

  const pick = list[Math.floor(Math.random() * list.length)];
  lastPickId = pick.id;

  const url = `https://jable.tv/videos/${pick.id}/`;

  document.getElementById("result").innerHTML = `
    <strong>${pick.id}</strong><br>
    女優：${pick.actor || "—"}<br>
    標籤：${pick.tag || "—"}<br>
    備註：${pick.note || "—"}<br>
    <a href="${url}" target="_blank">▶ 開啟影片</a>
  `;

  addHistory(pick);
}

// =======================
// 手動補女優（不會影響抽籤）
// =======================
function saveActor() {
  const name = document.getElementById("manualActor").value.trim();
  if (!name) {
    alert("❌ 請輸入女優名字");
    return;
  }
  if (!lastPickId) {
    alert("❌ 尚未抽籤");
    return;
  }

  const list = getList();
  const target = list.find(v => v.id === lastPickId);
  if (!target) {
    alert("❌ 找不到影片");
    return;
  }

  target.actor = name;
  saveListToStorage(list);

  alert(`✅ 已補上女優：${name}`);
  document.getElementById("manualActor").value = "";

  // 只更新顯示，不再抽一次
  drawResultOnly(target);
}

function drawResultOnly(pick) {
  const url = `https://jable.tv/videos/${pick.id}/`;
  document.getElementById("result").innerHTML = `
    <strong>${pick.id}</strong><br>
    女優：${pick.actor || "—"}<br>
    標籤：${pick.tag || "—"}<br>
    備註：${pick.note || "—"}<br>
    <a href="${url}" target="_blank">▶ 開啟影片</a>
  `;
}

// =======================
// 女優搜尋（只顯示在 actorResult）
// =======================
function listByActor() {
  const keyword = document.getElementById("actorFilter").value.trim();
  if (!keyword) {
    alert("請輸入女優名字");
    return;
  }

  const list = getList().filter(v =>
    v.actor && v.actor.includes(keyword)
  );

  const html = list.length
    ? list
        .map(v => {
          const url = `https://jable.tv/videos/${v.id}/`;
          return `• <a href="${url}" target="_blank">${v.id}</a>｜${v.actor}`;
        })
        .join("<br>")
    : "⚠️ 找不到影片";

  document.getElementById("actorResult").innerHTML = html;
  addSearchHistory(keyword, list.length);

}

// =======================
// 匯出 / 匯入
// =======================
function exportList() {
  document.getElementById("backup").value =
    localStorage.getItem("avList") || "";
  alert("✅ 已匯出");
}

function importList() {
  const text = document.getElementById("backup").value.trim();
  if (!text) return;
  localStorage.setItem("avList", text);
  alert("✅ 匯入完成");
}

// =======================
// 觀看歷史（只以「日」為單位）
// =======================
function addHistory(pick) {
  const history = JSON.parse(localStorage.getItem("watchHistory") || "[]");

  const today = new Date().toISOString().slice(0, 10);

  history.unshift({
    id: pick.id,
    actor: pick.actor || "",
    date: today
  });

  localStorage.setItem("watchHistory", JSON.stringify(history));
  renderHistory();
}

function renderHistory(filterDate = "") {
  const history = JSON.parse(localStorage.getItem("watchHistory") || "[]");
  const map = {};

  history.forEach(h => {
    if (filterDate && h.date !== filterDate) return;
    if (!map[h.date]) map[h.date] = [];
    map[h.date].push(h);
  });

  const html = Object.keys(map)
    .sort((a, b) => b.localeCompare(a))
    .map(date => `
      <details>
        <summary>${date}（${map[date].length} 部）</summary>
        ${map[date]
          .map(v => `• <a href="https://jable.tv/videos/${v.id}/" target="_blank">${v.id}</a>${v.actor ? "｜" + v.actor : ""}`)
          .join("<br>")}
      </details>
    `)
    .join("");

  document.getElementById("historyList").innerHTML =
    html || "（沒有紀錄）";
}

function filterHistory() {
  const date = document.getElementById("historyDate").value;
  renderHistory(date);
}

function clearHistory() {
  if (!confirm("確定清空？")) return;
  localStorage.removeItem("watchHistory");
  renderHistory();
}

// 初始顯示
renderHistory();

// =======================
// 搜尋紀錄（女優搜尋）
// =======================
function addSearchHistory(keyword, count) {
  const history = JSON.parse(localStorage.getItem("searchHistory") || "[]");
  const today = new Date().toISOString().slice(0, 10);

  history.unshift({
    keyword,
    count,
    date: today
  });

  localStorage.setItem("searchHistory", JSON.stringify(history));
  renderSearchHistory();
}

function renderSearchHistory(filterDate = "") {
  const history = JSON.parse(localStorage.getItem("searchHistory") || "[]");
  const map = {};

  history.forEach(h => {
    if (filterDate && h.date !== filterDate) return;
    if (!map[h.date]) map[h.date] = [];
    map[h.date].push(h);
  });

  const html = Object.keys(map).map(date => `
    <details>
      <summary>${date}（${map[date].length} 次搜尋）</summary>
      ${map[date]
        .map(v => `🔍 ${v.keyword}（${v.count} 部）`)
        .join("<br>")}
    </details>
  `).join("");

  document.getElementById("searchHistoryList").innerHTML =
    html || "（沒有搜尋紀錄）";
}

function filterSearchHistory() {
  const date = document.getElementById("searchHistoryDate").value;
  renderSearchHistory(date);
}

function clearSearchHistory() {
  if (!confirm("確定清空搜尋紀錄？")) return;
  localStorage.removeItem("searchHistory");
  renderSearchHistory();
}

