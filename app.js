let currentPickId = null;

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
      const [id, actor = "", tag = ""] = line.split("||");
      return { id: id.trim(), actor: actor.trim(), tag: tag.trim() };
    })
    .filter(item => item.id);

  localStorage.setItem("avList", JSON.stringify(list));
  document.getElementById("status").innerText =
    `✅ 已儲存 ${list.length} 部影片`;
}

// =======================
// 抽籤
// =======================
function draw() {
  const raw = localStorage.getItem("avList");
  if (!raw) {
    document.getElementById("result").innerText = "❌ 尚未有片單";
    return;
  }

  const list = JSON.parse(raw);
  if (list.length === 0) {
    document.getElementById("result").innerText = "❌ 片單是空的";
    return;
  }

  const pick = list[Math.floor(Math.random() * list.length)];
  currentPickId = pick.id;

  const url = `https://jable.tv/videos/${pick.id}/`;

  document.getElementById("result").innerHTML = `
    <strong>${pick.id}</strong><br>
    女優：${pick.actor || "（尚未填寫）"}<br>
    <a href="${url}" target="_blank">▶ 開啟影片頁</a>
    <hr>
    <input id="actorInput" placeholder="輸入女優名字">
    <button onclick="saveActor()">💾 儲存女優</button>
  `;
}

// =======================
// 儲存女優（抽到後）
// =======================
function saveActor() {
  const actor = document.getElementById("actorInput").value.trim();
  if (!actor || !currentPickId) return;

  const list = JSON.parse(localStorage.getItem("avList"));

  const item = list.find(v => v.id === currentPickId);
  if (item) {
    item.actor = actor;
    localStorage.setItem("avList", JSON.stringify(list));
    alert("✅ 女優已儲存");
  }
}

// =======================
// 依女優列出影片
// =======================
function listByActor() {
  const keyword = document.getElementById("actorFilter").value.trim();
  if (!keyword) return;

  const list = JSON.parse(localStorage.getItem("avList")) || [];

  const filtered = list.filter(
    v => v.actor && v.actor.includes(keyword)
  );

  if (filtered.length === 0) {
    document.getElementById("listResult").innerText =
      "⚠️ 找不到符合的影片";
    return;
  }

  document.getElementById("listResult").innerHTML =
    filtered
      .map(v =>
        `<div>
          ${v.id}　
          <a href="https://jable.tv/videos/${v.id}/" target="_blank">▶</a>
        </div>`
      )
      .join("");
}
