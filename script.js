// === INSTAGRAM ===
const igEl = document.getElementById("field-instagram");
igEl.addEventListener("input", () => {
  const cursor = igEl.selectionStart;
  const clean = igEl.value.replace(/[^a-zA-Z0-9._]/g, "").slice(0, 30);
  if (igEl.value !== clean) {
    igEl.value = clean;
    igEl.setSelectionRange(cursor, cursor);
  }
});

// === PHONE ===
const phoneEl = document.getElementById("field-phone");

const iti = window.intlTelInput(phoneEl, {
  initialCountry: "br",
  countryOrder: ["br"],
  dropdownContainer: document.body,
  separateDialCode: true,
  formatAsYouType: true,
  loadUtils: () => import("https://cdn.jsdelivr.net/npm/intl-tel-input@27.1.3/dist/js/utils.js"),
});

phoneEl.addEventListener("countrychange", function () {
  this.value = "";
});

// === MODAL ===
const modal = document.getElementById("lead-modal");
const modalForm = document.getElementById("lead-form");
const modalSuccess = document.getElementById("modal-success");
const formError = document.getElementById("form-error");

function openModal() {
  modal.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.classList.remove("open");
  document.body.style.overflow = "";
  setTimeout(() => {
    modalForm.style.display = "";
    modalSuccess.style.display = "none";
    formError.style.display = "none";
    modalForm.reset();
    const btn = modalForm.querySelector(".modal-submit");
    btn.disabled = false;
    btn.textContent = "Enviar e começar";
  }, 300);
}

document.querySelectorAll(".form-link").forEach((a) => {
  a.addEventListener("click", (e) => {
    e.preventDefault();
    openModal();
  });
});

document.getElementById("modal-close").addEventListener("click", closeModal);
document.getElementById("modal-success-close").addEventListener("click", closeModal);
modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

// === FORM SUBMIT ===
function getUtmParams() {
  const p = new URLSearchParams(window.location.search);
  const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  const out = {};
  keys.forEach((k) => { if (p.has(k)) out[k] = p.get(k); });
  return out;
}

modalForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  formError.style.display = "none";

  const btn = modalForm.querySelector(".modal-submit");
  btn.disabled = true;
  btn.textContent = "Enviando...";

  await iti.promise;

  if (!iti.isValidNumber()) {
    formError.textContent = "Número de telefone inválido. Verifique o DDI e DDD.";
    formError.style.display = "block";
    btn.disabled = false;
    btn.textContent = "Enviar e começar";
    return;
  }

  const payload = {
    name: document.getElementById("field-name").value.trim(),
    phone: iti.getNumber(),
    instagram: document.getElementById("field-instagram").value.trim().replace(/^@+/, ""),
    ...getUtmParams(),
  };

  try {
    const res = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("server error");

    if (typeof fbq === "function") fbq("track", "Lead");

    modalForm.style.display = "none";
    modalSuccess.style.display = "flex";
  } catch {
    formError.style.display = "block";
    btn.disabled = false;
    btn.textContent = "Enviar e começar";
  }
});

// === FAQ ===
document.querySelectorAll(".faq-q").forEach((btn) => {
  btn.addEventListener("click", () => {
    const item = btn.closest(".faq-item");
    const isOpen = item.classList.contains("open");
    document.querySelectorAll(".faq-item").forEach((i) => i.classList.remove("open"));
    if (!isOpen) item.classList.add("open");
  });
});

// === SCROLL ANIMATION ===
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        observer.unobserve(e.target);
      }
    });
  },
  { threshold: 0.1 }
);
document.querySelectorAll(".fade-up").forEach((el) => observer.observe(el));
