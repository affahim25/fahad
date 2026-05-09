// js/app.js
// Main application entry point — wires together Firebase, Cloudinary, and UI

import { db, ref, push, get } from "./firebase.js";
import { uploadImage }         from "./cloudinary.js";
import {
  showToast,
  switchTab,
  setButtonLoading,
  setPhotoPreview,
  resetPhotoPreview,
  renderRecords,
  showLoadingRecords,
  showErrorRecords,
} from "./ui.js";

// ── State ─────────────────────────────────────────────────────
const state = {
  groomImageUrl: null,
  brideImageUrl: null,
  allRecords:    [],
};

// ── DOM ready ─────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  bindTabButtons();
  bindPhotoUploads();
  bindSubmit();
  bindSearch();
});

// ── Tab navigation ────────────────────────────────────────────
function bindTabButtons() {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      switchTab(btn.dataset.tab, loadRecords);
    });
  });
}

// ── Photo upload ──────────────────────────────────────────────
function bindPhotoUploads() {
  // Clicking the preview box triggers the hidden file input
  document.querySelectorAll(".photo-preview").forEach((preview) => {
    preview.addEventListener("click", () => {
      document.getElementById(preview.dataset.target).click();
    });
  });

  // File-input change handler
  document.querySelectorAll('input[type="file"]').forEach((input) => {
    input.addEventListener("change", () => handleImageSelect(input));
  });
}

async function handleImageSelect(input) {
  const file = input.files[0];
  const type = input.dataset.type; // "groom" | "bride"
  if (!file) return;

  const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
  if (file.size > MAX_SIZE) {
    showToast("ছবির সাইজ ১০MB এর কম হতে হবে", "error");
    return;
  }

  try {
    const url = await uploadImage(file, type);
    setPhotoPreview(type, url);
    if (type === "groom") state.groomImageUrl = url;
    else                  state.brideImageUrl = url;
  } catch (err) {
    showToast("ছবি আপলোড ব্যর্থ: " + err.message, "error");
  }
}

// ── Form submit ───────────────────────────────────────────────
function bindSubmit() {
  document.getElementById("submit-btn").addEventListener("click", submitForm);
}

async function submitForm() {
  const groomName = document.getElementById("groom-name").value.trim();
  const brideName = document.getElementById("bride-name").value.trim();

  if (!groomName || !brideName) {
    showToast("জামাই ও বউয়ের নাম লিখতে হবে", "error");
    return;
  }

  const record = {
    groomName,
    brideName,
    groomNid:   document.getElementById("groom-nid").value.trim(),
    brideNid:   document.getElementById("bride-nid").value.trim(),
    denmahr:    document.getElementById("denmahr").value.trim(),
    pageNumber: document.getElementById("page-number").value.trim(),
    groomImage: state.groomImageUrl || null,
    brideImage: state.brideImageUrl || null,
    createdAt:  new Date().toISOString(),
    timestamp:  Date.now(),
  };

  const btn = document.getElementById("submit-btn");
  setButtonLoading(btn, true);

  try {
    await push(ref(db, "nikah-records"), record);
    showToast("✓ সফলভাবে সেভ হয়েছে!", "success");
    resetForm();
  } catch (err) {
    showToast("সেভ ব্যর্থ হয়েছে: " + err.message, "error");
  } finally {
    setButtonLoading(btn, false);
  }
}

function resetForm() {
  ["groom-name", "bride-name", "groom-nid", "bride-nid", "denmahr", "page-number"]
    .forEach((id) => { document.getElementById(id).value = ""; });

  resetPhotoPreview("groom");
  resetPhotoPreview("bride");
  state.groomImageUrl = null;
  state.brideImageUrl = null;
}

// ── History / records ─────────────────────────────────────────
async function loadRecords() {
  showLoadingRecords();
  try {
    const snapshot = await get(ref(db, "nikah-records"));
    if (!snapshot.exists()) { state.allRecords = []; renderRecords([]); return; }

    state.allRecords = Object.entries(snapshot.val())
      .map(([id, rec]) => ({ id, ...rec }))
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    renderRecords(state.allRecords);
  } catch (err) {
    showErrorRecords(err.message);
  }
}

// ── Search ────────────────────────────────────────────────────
function bindSearch() {
  document.getElementById("search-input").addEventListener("input", filterRecords);
}

function filterRecords() {
  const q = document.getElementById("search-input").value.toLowerCase().trim();
  if (!q) { renderRecords(state.allRecords); return; }

  const filtered = state.allRecords.filter((r) =>
    [r.groomName, r.brideName, r.groomNid, r.brideNid, r.pageNumber]
      .some((v) => (v || "").toLowerCase().includes(q))
  );
  renderRecords(filtered);
}
