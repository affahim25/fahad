// js/ui.js
// Reusable UI helpers: toast, tab switching, record rendering

// ── Toast ────────────────────────────────────────────────────
let toastTimer = null;

/**
 * Show a toast notification.
 * @param {string} message
 * @param {'success'|'error'} type
 */
export function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = `toast ${type}`;

  clearTimeout(toastTimer);
  // force reflow so animation replays
  void toast.offsetWidth;

  requestAnimationFrame(() => toast.classList.add("show"));
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3500);
}

// ── Tab switching ─────────────────────────────────────────────
/**
 * Switch the active tab.
 * @param {string} tabId - "register" | "history"
 * @param {Function} [onHistory] - callback when history tab is opened
 */
export function switchTab(tabId, onHistory) {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === tabId);
  });
  document.querySelectorAll(".section").forEach((sec) => {
    sec.classList.toggle("active", sec.id === `tab-${tabId}`);
  });
  if (tabId === "history" && typeof onHistory === "function") onHistory();
}

// ── Button loading state ──────────────────────────────────────
export function setButtonLoading(btnEl, loading) {
  btnEl.disabled = loading;
  btnEl.classList.toggle("loading", loading);
}

// ── Photo preview ─────────────────────────────────────────────
export function setPhotoPreview(type, url) {
  const preview = document.getElementById(`${type}-preview`);
  preview.innerHTML = `<img src="${url}" alt="${type} ছবি">`;
}

export function resetPhotoPreview(type) {
  const preview = document.getElementById(`${type}-preview`);
  preview.innerHTML = `
    <div class="photo-placeholder-icon">👤</div>
    <div class="photo-placeholder-text">ছবি আপলোড করুন</div>`;

  const progress = document.getElementById(`${type}-progress`);
  const bar      = document.getElementById(`${type}-bar`);
  progress.classList.remove("active");
  bar.style.width = "0%";
  document.getElementById(`${type}-file`).value = "";
}

// ── Record rendering ──────────────────────────────────────────
export function renderRecords(records) {
  const list = document.getElementById("record-list");

  if (!records.length) {
    list.innerHTML = `
      <div class="no-records">
        <span class="no-records-icon">📂</span>
        কোনো রেকর্ড পাওয়া যায়নি
      </div>`;
    return;
  }

  list.innerHTML = records
    .map((r) => {
      const date = r.createdAt
        ? new Date(r.createdAt).toLocaleDateString("bn-BD")
        : "";

      const groomPhoto = r.groomImage
        ? `<img class="record-photo" src="${r.groomImage}" alt="জামাই">`
        : `<div class="record-photo-placeholder">👤</div>`;

      const bridePhoto = r.brideImage
        ? `<img class="record-photo" src="${r.brideImage}" alt="বউ">`
        : `<div class="record-photo-placeholder">👤</div>`;

      const meta = [
        r.groomNid  ? `<span>🪪 ${r.groomNid}</span>`       : "",
        r.denmahr   ? `<span>💰 ${r.denmahr}</span>`        : "",
        r.pageNumber? `<span>📄 পেইজ: ${r.pageNumber}</span>` : "",
        date        ? `<span>🗓 ${date}</span>`              : "",
      ]
        .filter(Boolean)
        .join("");

      const badge = r.pageNumber
        ? `<div class="record-badge">পেইজ ${r.pageNumber}</div>`
        : "";

      return `
        <div class="record-card">
          <div class="record-photos">${groomPhoto}${bridePhoto}</div>
          <div class="record-info">
            <div class="record-names">
              ${r.groomName}<span>❤</span>${r.brideName}
            </div>
            <div class="record-meta">${meta}</div>
          </div>
          ${badge}
        </div>`;
    })
    .join("");
}

export function showLoadingRecords() {
  document.getElementById("record-list").innerHTML =
    '<div class="loading-records">⏳ লোড হচ্ছে...</div>';
}

export function showErrorRecords(msg) {
  document.getElementById("record-list").innerHTML = `
    <div class="no-records">
      <span class="no-records-icon">⚠️</span>
      লোড ব্যর্থ: ${msg}
    </div>`;
}
