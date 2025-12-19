// =======================
// 儲存片單
// =======================
function saveList() {
  const text = document.getElementById("input").value.trim();
  if (!text) {
    document.getElementById("status").innerText = "❌ 尚未輸入片單";
    return;
  }

  const list = text.split("\n").map(line => {
    const [id, actor, tag] = line.split("|");
    return {
      id: id?.trim(),
      actor: actor?.trim() || "",
      tag: tag?.trim() || ""
    };
  }).filter(item => item.id);

  localStorage.setItem("avList", JSON.stringify(list));
  document.getElementById("status").innerText = `✅ 已儲存 ${list.length} 部影片`;
}

// =======================
// 抽籤
// =======================
let lastPickId = null;

function draw() {
  const raw = localStorage.getItem("avList");
  if (!raw) {
    document.getElementById("result").innerText = "❌ 尚未有片單";
    return;
  }

  const list = JSON.parse(raw);
  const pick = list[Math.floor(Math.random() * list.length)];
  lastPickId = pick.id;

  const url = `https://jable.tv/videos/${pick.id}/`;

  document.getElementById("result").innerHTML = `
    <strong>${pick.id}</strong><br>
    女優：${pick.actor || "—"}<br>
    分類：${pick.tag || "—"}<br>
    <a href="${url}" target="_blank">▶ 開啟影片</a><br><br>
    <button onclick="fetchActor()">🔧 補女優（電腦）</button>
  `;
}

// =======================
// 補女優（電腦用）
// =======================
async function fetchActor() {
  if (!lastPickId) return alert("❌ 尚未抽籤");

  const url = `https://jable.tv/videos/${lastPickId}/`;

  try {
    const res = await fetch(url);
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, "text/html");

    // ⚠️ 這裡是關鍵：抓女優名稱
    const actorEl = doc.querySelector('a[href^="/actors/"]');
    const actorName = actorEl ? actorEl.textContent.trim() : "";

    if (!actorName) {
      alert("⚠️ 找不到女優（可能是版面改了）");
      return;
    }

    // 寫回 localStorage
    const list = JSON.parse(localStorage.getItem("avList"));
    const target = list.find(v => v.id === lastPickId);
    if (target) {
      target.actor = actorName;
      localStorage.setItem("avList", JSON.stringify(list));
      alert(`✅ 已補上女優：${actorName}`);
    }

  } catch (e) {
    alert("❌ 抓取失敗（請用電腦 Chrome）");
  }
}

// =======================
// 依女優列出
// =======================
function listByActor() {
  const keyword = document.getElementById("actorFilter").value.trim();
  const raw = localStorage.getItem("avList");
  if (!raw || !keyword) return;

  const list = JSON.parse(raw).filter(v =>
    v.actor && v.actor.includes(keyword)
  );

  document.getElementById("result").innerHTML =
    list.length
      ? list.map(v => `• ${v.id}｜${v.actor}`).join("<br>")
      : "⚠️ 找不到影片";
}

// =======================
// 匯出 / 匯入
// =======================
function exportList() {
  const raw = localStorage.getItem("avList");
  if (!raw) return;
  document.getElementById("backup").value = raw;
  alert("✅ 已匯出");
}

function importList() {
  const text = document.getElementById("backup").value.trim();
  if (!text) return;
  localStorage.setItem("avList", text);
  alert("✅ 匯入完成");
}
