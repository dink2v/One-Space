const navItems = document.querySelectorAll(".nav-item[data-page]");
const pageTitle = document.getElementById("pageTitle");
const pageCrumb = document.getElementById("pageCrumb");
const pageSubtitle = document.getElementById("pageSubtitle");
const toast = document.getElementById("toast");
let toastTimer;

const pageCopy = {
  overview: ["Good afternoon", "Overview", "Satu ruang untuk semua project. Everything, connected."],
  projects: ["My Projects", "My Projects", "All your projects, neatly organized in one place."],
  calendar: ["Calendar", "Calendar", "Keep track of deadlines, tasks, and important dates."],
  tasks: ["Tasks", "Tasks", "Turn your plans into small, actionable steps."],
  resources: ["Resources", "Resources", "All important links and tools, always within reach."],
  notes: ["Notes", "Notes", "Capture ideas before they get away."],
  documents: ["Documentation", "Documentation", "Keep project knowledge clear and easy to find."],
  analytics: ["Analytics", "Analytics", "A clearer view of your progress and productivity."],
  settings: ["Settings", "Settings", "Make your workspace feel right for the way you work."]
};

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    navItems.forEach((nav) => nav.classList.remove("active"));
    item.classList.add("active");
    const copy = pageCopy[item.dataset.page];
    if (copy) {
      pageTitle.textContent = copy[0];
      pageCrumb.textContent = copy[1];
      pageSubtitle.textContent = copy[2];
    }
    document.getElementById("sidebar").classList.remove("open");
    if (item.dataset.page !== "overview") showToast(copy[1] + " — UI preview");
  });
});

document.querySelectorAll("[data-goto]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.goto;
    const nav = document.querySelector('.nav-item[data-page="' + target + '"]');
    if (nav) nav.click();
  });
});

document.getElementById("menuToggle").addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("open");
});

document.getElementById("addProject").addEventListener("click", () => {
  showToast("Form tambah project akan disiapkan pada tahap berikutnya.");
});

document.querySelectorAll(".project-card").forEach((card) => {
  card.addEventListener("click", (event) => {
    if (event.target.closest(".more-button")) {
      event.stopPropagation();
      showToast("Menu project — UI preview");
      return;
    }
    showToast("Detail " + card.dataset.name + " — UI preview");
  });
});

document.querySelectorAll(".task-check").forEach((check) => {
  check.setAttribute("role", "checkbox");
  check.setAttribute("tabindex", "0");
  check.setAttribute("aria-checked", check.classList.contains("checked") ? "true" : "false");
  const toggle = () => {
    check.classList.toggle("checked");
    check.textContent = check.classList.contains("checked") ? "✓" : "";
    check.setAttribute("aria-checked", check.classList.contains("checked") ? "true" : "false");
  };
  check.addEventListener("click", toggle);
  check.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggle();
    }
  });
});

document.querySelectorAll(".month-arrows button").forEach((button) => {
  button.addEventListener("click", () => showToast("Navigasi kalender akan aktif pada tahap berikutnya."));
});
