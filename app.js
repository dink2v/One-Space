const navItems = document.querySelectorAll(".nav-item[data-page]");
const contentWrap = document.querySelector(".content-wrap");
const pageTitle = document.getElementById("pageTitle");
const pageCrumb = document.getElementById("pageCrumb");
const pageSubtitle = document.getElementById("pageSubtitle");
const toast = document.getElementById("toast");
const originalOverview = contentWrap.innerHTML;
let toastTimer;
let currentPage = "overview";

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

const projects = [
  {name:"ProjectHub",category:"Website",status:"In Progress",priority:"High",progress:68,deadline:"Nov 28, 2026",icon:"✳",tone:"violet",description:"One space to organize every project, resource, and idea."},
  {name:"ChatApp",category:"Mobile App",status:"In Progress",priority:"Medium",progress:42,deadline:"Dec 05, 2026",icon:"▣",tone:"blue",description:"A simple and modern real-time messaging experience."},
  {name:"SMK 3 Batu Website",category:"School Project",status:"Planning",priority:"High",progress:15,deadline:"Dec 12, 2026",icon:"⌘",tone:"orange",description:"WordPress website setup, content workflow, and backup."},
  {name:"Digital Yearbook",category:"Design",status:"Completed",priority:"Low",progress:100,deadline:"Completed Nov 08",icon:"▧",tone:"pink",description:"A digital collection of stories, memories, and moments."},
  {name:"Digital Magazine",category:"Design",status:"On Hold",priority:"Medium",progress:30,deadline:"Dec 18, 2026",icon:"▤",tone:"pink",description:"A modern editorial publication for digital readers."},
  {name:"Media Development",category:"Website",status:"In Progress",priority:"Medium",progress:56,deadline:"Jan 08, 2027",icon:"◈",tone:"blue",description:"Creative media production and publishing workspace."}
];

const tasks = [
  ["Finalize dashboard UI","ProjectHub","Today","High","In Progress"],
  ["Review chat room layout","ChatApp","Nov 13","Medium","To Do"],
  ["Prepare WordPress files","SMK 3 Batu Website","Nov 14","Low","Done"],
  ["Create resource directory","ProjectHub","Nov 15","Medium","To Do"],
  ["Test authentication flow","ChatApp","Nov 18","High","In Progress"],
  ["Draft article workflow","SMK 3 Batu Website","Nov 20","Medium","To Do"]
];

const resources = [
  ["GitHub Repository","github.com","Source code","↗","ProjectHub"],
  ["Live Preview","projecthub.pages.dev","Website","◉","ProjectHub"],
  ["Firebase Console","console.firebase.google.com","Database","◈","ChatApp"],
  ["WordPress Admin","smkn3batu.sch.id/wp-admin","Website","▣","SMK 3 Batu Website"]
];

const notes = [
  ["ProjectHub — Product direction","Public read access, management access through a shared join code. Keep the experience simple and fast.","ProjectHub","Updated today"],
  ["ChatApp — UI references","Modern blue header, clean chat bubbles, modern input bar, tidy spacing, and subtle animations.","ChatApp","Updated yesterday"],
  ["WordPress checklist","Install WordPress, configure roles, create article workflow, install backup plugin, and test restore.","SMK 3 Batu Website","Nov 09"]
];

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}
function projectCard(p) {
  return `<article class="project-card project-card-expanded" data-name="${p.name}" data-category="${p.category}" data-status="${p.status}">
    <div class="project-card-top"><div class="project-symbol symbol-${p.tone}">${p.icon}</div><button class="more-button" aria-label="More options">···</button></div>
    <div class="project-meta"><span class="category-pill">${p.category}</span><span class="status-pill ${p.status==="Completed"?"completed":p.status==="Planning"?"planning":"progress"}">● ${p.status}</span></div>
    <h3>${p.name}</h3><p>${p.description}</p>
    <div class="project-progress"><div class="progress-label"><span>Progress</span><strong>${p.progress}%</strong></div><div class="progress-track"><span style="width:${p.progress}%"></span></div></div>
    <div class="project-card-foot"><span>◷ ${p.deadline}</span><span class="mini-avatar">D</span></div>
  </article>`;
}
function toolbar(searchPlaceholder, filters = "") {
  return `<div class="page-toolbar"><label class="search-box"><span>⌕</span><input id="pageSearch" type="search" placeholder="${searchPlaceholder}"></label>${filters}<button class="filter-button" id="sortButton">↕ Sort</button></div>`;
}
function renderPage(page) {
  if (page === "overview") { contentWrap.innerHTML = originalOverview; bindOverview(); return; }
  const heading = `<div class="section-heading page-section-heading"><div><h2>${pageCopy[page][1]}</h2><p>${pageCopy[page][2]}</p></div></div>`;
  let body = "";
  if (page === "projects") {
    body = `
      <div class="page-metrics"><div><strong>08</strong><span>Total projects</span></div><div><strong>04</strong><span>In progress</span></div><div><strong>02</strong><span>Completed</span></div><div><strong>03</strong><span>Due this month</span></div></div>
      ${toolbar("Search projects...",'<select id="statusFilter"><option value="">All statuses</option><option>Planning</option><option>In Progress</option><option>On Hold</option><option>Completed</option></select><select id="categoryFilter"><option value="">All categories</option><option>Website</option><option>Mobile App</option><option>School Project</option><option>Design</option></select>')}
      <div class="project-grid project-grid-page" id="allProjects">${projects.map(projectCard).join("")}</div>`;
  } else if (page === "tasks") {
    body = `
      <div class="page-metrics"><div><strong>12</strong><span>All tasks</span></div><div><strong>04</strong><span>In progress</span></div><div><strong>06</strong><span>To do</span></div><div><strong>02</strong><span>Completed</span></div></div>
      ${toolbar("Search tasks...",'<select id="taskStatus"><option value="">All status</option><option>To Do</option><option>In Progress</option><option>Done</option></select>')}
      <div class="panel table-panel"><div class="table-head"><span>Task</span><span>Project</span><span>Due date</span><span>Priority</span><span>Status</span></div><div id="taskRows">${tasks.map(taskRow).join("")}</div></div>`;
  } else if (page === "resources") {
    body = `
      ${toolbar("Search resources...",'<select id="resourceType"><option value="">All types</option><option>Source code</option><option>Website</option><option>Database</option></select>')}
      <div class="resource-grid" id="resourceGrid">${resources.map(resourceCard).join("")}</div>`;
  } else if (page === "notes") {
    body = `
      ${toolbar("Search notes...",'<select><option>All projects</option><option>ProjectHub</option><option>ChatApp</option></select>')}
      <div class="note-grid" id="noteGrid">${notes.map(noteCard).join("")}</div>`;
  } else if (page === "documents") {
    body = `
      <div class="folder-grid"><article class="folder-card"><span class="folder-icon">▰</span><div><strong>ProjectHub</strong><small>4 documents · Updated today</small></div><b>→</b></article><article class="folder-card"><span class="folder-icon blue-folder">▰</span><div><strong>ChatApp</strong><small>6 documents · Updated yesterday</small></div><b>→</b></article><article class="folder-card"><span class="folder-icon orange-folder">▰</span><div><strong>SMK 3 Batu Website</strong><small>3 documents · Nov 09</small></div><b>→</b></article></div>
      ${toolbar("Search documentation...")}
      <div class="panel document-list"><div class="document-row"><span class="file-icon">DOC</span><div><strong>Project requirements</strong><small>ProjectHub · Updated today</small></div><span>2.4 KB</span><b>···</b></div><div class="document-row"><span class="file-icon blue-file">MD</span><div><strong>Technical notes</strong><small>ChatApp · Updated yesterday</small></div><span>1.8 KB</span><b>···</b></div><div class="document-row"><span class="file-icon orange-file">PDF</span><div><strong>WordPress implementation plan</strong><small>SMK 3 Batu Website · Nov 09</small></div><span>840 KB</span><b>···</b></div></div>`;
  } else if (page === "calendar") {
    body = `
      <div class="calendar-toolbar"><div class="calendar-switch"><button class="selected">Month</button><button>Week</button><button>Day</button></div><div class="calendar-current"><button>‹</button><strong>November 2026</strong><button>›</button></div><button class="filter-button">Today</button></div>
      <div class="panel full-calendar"><div class="full-calendar-grid calendar-weekdays">${["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map(d=>`<span>${d}</span>`).join("")}</div><div class="full-calendar-grid calendar-month-cells">${Array.from({length:35},(_,i)=>{const d=i-5;const n=d<1?26+d:d>30?d-30:d;const muted=d<1||d>30;const event=d===13?"ProjectHub · UI review":d===18?"ChatApp · Testing":d===28?"ProjectHub · Deadline":"";return `<div class="calendar-cell ${muted?"muted-cell":""} ${d===11?"selected-day":""}"><span>${n}</span>${event?`<small>${event}</small>`:""}</div>`;}).join("")}</div></div>`;
  } else if (page === "analytics") {
    body = `
      <div class="page-metrics"><div><strong>08</strong><span>Total projects</span></div><div><strong>68%</strong><span>Average progress</span></div><div><strong>24</strong><span>Tasks completed</span></div><div><strong>03</strong><span>Upcoming deadlines</span></div></div>
      <div class="analytics-grid"><section class="panel analytics-panel"><div class="panel-heading"><div><h3>Project progress</h3><p>Current completion across projects</p></div><span class="soft-chip">This month</span></div>${projects.slice(0,5).map(p=>`<div class="bar-row"><div><span>${p.name}</span><strong>${p.progress}%</strong></div><div class="progress-track"><span style="width:${p.progress}%"></span></div></div>`).join("")}</section><section class="panel analytics-panel"><div class="panel-heading"><div><h3>Project status</h3><p>Workspace distribution</p></div></div><div class="donut-wrap"><div class="donut"><strong>08<small>Projects</small></strong></div><div class="legend"><span>● In progress <b>4</b></span><span>● Planning <b>2</b></span><span>● Completed <b>2</b></span></div></div></section></div>`;
  } else if (page === "settings") {
    body = `
      <div class="settings-layout">
        <nav class="settings-nav" aria-label="Settings sections">
          <button class="selected" data-settings-tab="general">General</button>
          <button data-settings-tab="appearance">Appearance</button>
          <button data-settings-tab="workspace">Workspace</button>
          <button data-settings-tab="notifications">Notifications</button>
          <button data-settings-tab="calendar">Calendar</button>
          <button data-settings-tab="accessibility">Accessibility</button>
        </nav>
        <div class="panel settings-panel" id="settingsPanel" aria-live="polite">
          <div class="settings-title"><h2>Umum</h2><p>Atur bahasa, format tanggal, waktu, dan zona waktu di satu tempat.</p></div>
          <div class="setting-row"><div><strong>Bahasa</strong><small>Bahasa yang digunakan di seluruh PROJECTHUB.</small></div><span class="setting-value">Bahasa Indonesia</span></div>
          <div class="setting-row"><div><strong>Format tanggal</strong><small>Pilih cara tanggal ditampilkan.</small></div><select><option>DD/MM/YYYY</option><option>DD MMM YYYY</option><option>YYYY-MM-DD</option></select></div>
          <div class="setting-row"><div><strong>Format waktu</strong><small>Gunakan format 24 atau 12 jam.</small></div><select><option>24 jam</option><option>12 jam</option></select></div>
          <div class="setting-row"><div><strong>Zona waktu</strong><small>Zona waktu untuk deadline dan kalender.</small></div><select><option>Asia/Jakarta (WIB)</option><option>Asia/Makassar (WITA)</option><option>Asia/Jayapura (WIT)</option><option>Otomatis dari perangkat</option></select></div>
        </div>
      </div>`;
  }
  contentWrap.innerHTML = `<section class="welcome-row"><div><div class="eyebrow"><span class="eyebrow-line"></span> PROJECTHUB WORKSPACE</div><h1 id="pageTitle">${pageCopy[page][0]}</h1><p class="subheading" id="pageSubtitle">${pageCopy[page][2]}</p></div><button class="primary-button" id="pageAction"><span>＋</span> ${page==="tasks"?"New task":page==="notes"?"New note":page==="resources"?"Add resource":page==="documents"?"New document":page==="calendar"?"New event":"New project"}</button></section>${heading}${body}<footer class="page-footer"><span>© 2026 PROJECTHUB</span><span>One Space. <i>·</i> Satu ruang untuk semua project.</span></footer>`;
  bindPage(page);
}
function taskRow(t) {
  return `<div class="table-row" data-search="${t.join(" ").toLowerCase()}"><div class="task-table-name"><span class="task-check ${t[4]==="Done"?"checked":""}">${t[4]==="Done"?"✓":""}</span><strong>${t[0]}</strong></div><span>${t[1]}</span><span>${t[2]}</span><span class="priority ${t[3].toLowerCase()}">${t[3]}</span><span class="table-status">${t[4]}</span></div>`;
}
function resourceCard(r) {
  return `<article class="resource-card" data-search="${r.join(" ").toLowerCase()}" data-type="${r[2]}"><div class="resource-card-icon">${r[3]}</div><div class="resource-card-content"><strong>${r[0]}</strong><span>${r[1]}</span><small>${r[4]} · ${r[2]}</small></div><button class="more-button">···</button></article>`;
}
function noteCard(n) {
  return `<article class="note-card" data-search="${n.join(" ").toLowerCase()}"><div class="note-card-top"><span>▤ ${n[2]}</span><button class="more-button">···</button></div><h3>${n[0]}</h3><p>${n[1]}</p><small>${n[3]}</small></article>`;
}
function bindPage(page) {
  const search = document.getElementById("pageSearch");
  if (search) search.addEventListener("input", () => {
    const q = search.value.toLowerCase();
    document.querySelectorAll("#allProjects .project-card, #taskRows .table-row, #resourceGrid .resource-card, #noteGrid .note-card, .document-row").forEach(el => {
      el.hidden = !el.textContent.toLowerCase().includes(q);
    });
  });
  ["statusFilter","categoryFilter","taskStatus","resourceType"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("change", applyFilters);
  });
  document.querySelectorAll(".project-card").forEach(card => card.addEventListener("click", e => {
    if (!e.target.closest(".more-button")) showToast("Detail " + card.dataset.name + " — UI preview");
    else showToast("Menu project — UI preview");
  }));
  document.querySelectorAll(".more-button").forEach(btn => btn.addEventListener("click", () => showToast("More options — UI preview")));
  const action = document.getElementById("pageAction");
  if (action) action.addEventListener("click", () => showToast("Form " + action.textContent.trim() + " akan dibuat pada tahap fungsi."));
  const sort = document.getElementById("sortButton");
  if (sort) sort.addEventListener("click", () => showToast("Sort options — UI preview"));
  if (page === "settings") bindSettings();
  if (page === "calendar") document.querySelectorAll(".calendar-switch button").forEach(btn => btn.addEventListener("click", () => {
    document.querySelectorAll(".calendar-switch button").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
  }));
}

const settingsContent = {
  general: {title:"Umum",desc:"Bahasa, format tanggal, waktu, dan zona waktu.",html:`
    <div class="setting-row"><div><strong>Bahasa</strong><small>Bahasa yang digunakan di seluruh PROJECTHUB.</small></div><span class="setting-value">Bahasa Indonesia</span></div>
    <div class="setting-row"><div><strong>Format tanggal</strong><small>Pilih cara tanggal ditampilkan.</small></div><select><option>DD/MM/YYYY</option><option>DD MMM YYYY</option><option>YYYY-MM-DD</option></select></div>
    <div class="setting-row"><div><strong>Format waktu</strong><small>Gunakan format 24 atau 12 jam.</small></div><select><option>24 jam</option><option>12 jam</option></select></div>
    <div class="setting-row"><div><strong>Zona waktu</strong><small>Zona waktu untuk deadline dan kalender.</small></div><select><option>Asia/Jakarta (WIB)</option><option>Asia/Makassar (WITA)</option><option>Asia/Jayapura (WIT)</option><option>Otomatis dari perangkat</option></select></div>`},
  appearance: {title:"Tampilan",desc:"Semua pengaturan visual dikumpulkan di sini.",html:`
    <div class="setting-row"><div><strong>Tema</strong><small>Pilih tampilan workspace.</small></div><select id="themeSelect"><option value="light">Terang</option><option value="dark">Gelap</option><option value="system">Ikuti perangkat</option></select></div>
    <div class="setting-row"><div><strong>Warna aksen</strong><small>Warna tombol dan elemen pilihan.</small></div><div class="color-options"><button class="color-choice chosen" data-color="#5268e8" aria-label="Biru"></button><button class="color-choice mint" data-color="#269d83" aria-label="Hijau"></button><button class="color-choice rose" data-color="#d76d91" aria-label="Merah muda"></button><button class="color-choice amber" data-color="#d99a43" aria-label="Oranye"></button></div></div>
    <div class="setting-row"><div><strong>Ukuran teks</strong><small>Atur ukuran teks di seluruh workspace.</small></div><select><option>Normal</option><option>Besar</option><option>Sangat besar</option></select></div>
    <div class="setting-row"><div><strong>Mode ringkas</strong><small>Kurangi jarak antar elemen agar lebih padat.</small></div><label class="toggle"><input type="checkbox" id="compactToggle"><span></span></label></div>
    <div class="setting-row"><div><strong>Sidebar</strong><small>Tentukan tampilan menu samping.</small></div><select><option>Normal</option><option>Ringkas</option></select></div>`},
  workspace: {title:"Workspace",desc:"Identitas dan aturan akses ruang kerja bersama.",html:`
    <div class="setting-row"><div><strong>Nama workspace</strong><small>Nama ruang kerja utama.</small></div><input class="setting-input" value="PROJECTHUB — One Space"></div>
    <div class="setting-row"><div><strong>Visibilitas konten</strong><small>Semua orang dapat melihat project dan isinya.</small></div><span class="soft-chip public-chip">Public View</span></div>
    <div class="setting-row"><div><strong>Akses pengelolaan</strong><small>Gabung sekali untuk mengaktifkan pengelolaan di browser/perangkat ini.</small></div><button class="secondary-button" data-open-join>Join sekarang</button></div>
    <div class="setting-row setting-note"><div><strong>Status perangkat</strong><small id="joinStatusText">Memeriksa status akses perangkat ini…</small></div><span class="soft-chip" id="joinStatusChip">Memeriksa</span></div>
    <p class="settings-footnote">Konten dapat dilihat publik. Hanya perangkat yang sudah Join yang dapat mengelola project dan isinya.</p>`},
  notifications: {title:"Notifikasi",desc:"Gabungkan semua pemberitahuan dan pengaturan gangguan.",html:`
    <div class="setting-row"><div><strong>Notifikasi dalam aplikasi</strong><small>Tampilkan aktivitas project di pusat notifikasi.</small></div><label class="toggle"><input type="checkbox" checked><span></span></label></div>
    <div class="setting-row"><div><strong>Notifikasi browser</strong><small>Izinkan pemberitahuan dari browser.</small></div><label class="toggle"><input type="checkbox"><span></span></label></div>
    <div class="setting-row"><div><strong>Suara notifikasi</strong><small>Pilih suara untuk pemberitahuan baru.</small></div><select><option>Default</option><option> lembut</option><option>Tanpa suara</option></select></div>
    <div class="setting-row"><div><strong>Badge jumlah belum dibaca</strong><small>Tampilkan jumlah notifikasi yang belum dibaca.</small></div><label class="toggle"><input type="checkbox" checked><span></span></label></div>
    <div class="setting-row"><div><strong>Jangan ganggu</strong><small>Jeda notifikasi sementara atau sesuai jadwal.</small></div><label class="toggle"><input type="checkbox"><span></span></label></div>
    <div class="setting-row"><div><strong>Ringkasan aktivitas</strong><small>Gabungkan aktivitas agar notifikasi tidak menumpuk.</small></div><select><option>Langsung</option><option>Harian</option><option>Mingguan</option></select></div>`},
  calendar: {title:"Kalender",desc:"Preferensi kalender dan integrasi eksternal dalam satu tempat.",html:`
    <div class="setting-row"><div><strong>Google Calendar</strong><small>Hubungkan kalender eksternal untuk sinkronisasi dua arah.</small></div><button class="secondary-button" data-preview-action="Integrasi Google Calendar">Hubungkan</button></div>
    <div class="setting-row"><div><strong>Sinkronisasi otomatis</strong><small>Perbarui event saat ada perubahan.</small></div><label class="toggle"><input type="checkbox" checked><span></span></label></div>
    <div class="setting-row"><div><strong>Awal minggu</strong><small>Hari pertama pada tampilan kalender.</small></div><select><option>Senin</option><option>Minggu</option></select></div>
    <div class="setting-row"><div><strong>Hari kerja</strong><small>Hari yang dihitung sebagai hari kerja.</small></div><select><option>Senin–Jumat</option><option>Senin–Sabtu</option><option>Setiap hari</option></select></div>
    <div class="setting-row"><div><strong>Jika terjadi konflik sinkronisasi</strong><small>Jaga kedua perubahan agar tidak ada data yang hilang.</small></div><select><option>Pertahankan keduanya dan beri peringatan</option><option>Minta konfirmasi</option></select></div>
    <p class="settings-footnote">Integrasi dan sinkronisasi belum aktif pada prototype ini.</p>`},
  accessibility: {title:"Aksesibilitas",desc:"Pengaturan kenyamanan membaca dan navigasi.",html:`
    <div class="setting-row"><div><strong>Kontras tampilan</strong><small>Tingkatkan kontras teks dan elemen antarmuka.</small></div><select><option>Standar</option><option>Tinggi</option></select></div>
    <div class="setting-row"><div><strong>Ukuran teks</strong><small>Sesuaikan ukuran teks agar lebih mudah dibaca.</small></div><select><option>Normal</option><option>Besar</option><option>Sangat besar</option></select></div>
    <div class="setting-row"><div><strong>Navigasi keyboard</strong><small>Gunakan Tab, Enter, dan tombol panah untuk navigasi.</small></div><label class="toggle"><input type="checkbox" checked><span></span></label></div>
    <div class="setting-row"><div><strong>Pintasan keyboard</strong><small>Tampilkan panduan pintasan untuk tindakan umum.</small></div><button class="secondary-button" data-preview-action="Panduan pintasan keyboard">Lihat panduan</button></div>
    <div class="setting-row"><div><strong>Animasi antarmuka</strong><small>Animasi ringan tetap aktif untuk menjaga respons visual.</small></div><span class="soft-chip">Aktif</span></div>`}
};
function bindSettings() {
  const panel = document.getElementById("settingsPanel");
  const tabs = document.querySelectorAll("[data-settings-tab]");
  function showTab(key) {
    const item = settingsContent[key] || settingsContent.general;
    tabs.forEach(tab => tab.classList.toggle("selected", tab.dataset.settingsTab === key));
    panel.innerHTML = `<div class="settings-title"><h2>${item.title}</h2><p>${item.desc}</p></div>${item.html}`;
    const theme = document.getElementById("themeSelect");
    if (theme) theme.addEventListener("change", () => {
      document.documentElement.dataset.theme = theme.value === "system" ? "light" : theme.value;
      showToast("Tema diperbarui untuk pratinjau.");
    });
    document.getElementById("compactToggle")?.addEventListener("change", e => document.body.classList.toggle("compact-mode", e.target.checked));
    panel.querySelectorAll(".color-choice").forEach(btn => btn.addEventListener("click", () => {
      document.documentElement.style.setProperty("--blue", btn.dataset.color);
      panel.querySelectorAll(".color-choice").forEach(b => b.classList.remove("chosen"));
      btn.classList.add("chosen");
      showToast("Warna aksen diubah untuk pratinjau.");
    }));
    panel.querySelectorAll("[data-preview-action]").forEach(btn => btn.addEventListener("click", () => showToast(btn.dataset.previewAction + " akan tersedia setelah integrasi diaktifkan.")));
    bindJoinAccess(panel);
    panel.querySelectorAll("select:not(#themeSelect), input[type='checkbox'], .setting-input").forEach(control => {
      control.addEventListener("change", () => showToast("Pilihan diperbarui untuk pratinjau."));
    });
  }
  tabs.forEach(tab => tab.addEventListener("click", () => showTab(tab.dataset.settingsTab)));
  showTab("general");
}

function applyFilters() {
  const status = document.getElementById("statusFilter")?.value || "";
  const category = document.getElementById("categoryFilter")?.value || "";
  const taskStatus = document.getElementById("taskStatus")?.value || "";
  const resourceType = document.getElementById("resourceType")?.value || "";
  document.querySelectorAll("#allProjects .project-card").forEach(card => card.hidden = !!((status && card.dataset.status !== status) || (category && card.dataset.category !== category)));
  document.querySelectorAll("#taskRows .table-row").forEach((row,i) => row.hidden = !!(taskStatus && tasks[i][4] !== taskStatus));
  document.querySelectorAll("#resourceGrid .resource-card").forEach(card => card.hidden = !!(resourceType && card.dataset.type !== resourceType));
}
function bindOverview() {
  document.querySelectorAll("[data-goto]").forEach(button => button.addEventListener("click", () => {
    const target = button.dataset.goto;
    document.querySelector('.nav-item[data-page="' + target + '"]')?.click();
  }));
  document.querySelectorAll(".project-card").forEach(card => card.addEventListener("click", event => {
    if (event.target.closest(".more-button")) { event.stopPropagation(); showToast("Menu project — UI preview"); }
    else showToast("Detail " + card.dataset.name + " — UI preview");
  }));
  document.querySelectorAll(".task-check").forEach(check => {
    check.setAttribute("role","checkbox"); check.setAttribute("tabindex","0");
    const toggle = () => { check.classList.toggle("checked"); check.textContent = check.classList.contains("checked") ? "✓" : ""; };
    check.addEventListener("click",toggle);
    check.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();toggle();}});
  });
  document.querySelectorAll(".month-arrows button").forEach(button => button.addEventListener("click", () => showToast("Calendar month navigation — UI preview")));
  document.getElementById("addProject")?.addEventListener("click", () => showToast("Form tambah project akan dibuat pada tahap fungsi."));
}
function navigate(page) {
  currentPage = page;
  navItems.forEach(item => item.classList.toggle("active", item.dataset.page === page));
  const copy = pageCopy[page];
  pageCrumb.textContent = copy[1];
  if (page === "overview") {
    contentWrap.innerHTML = originalOverview;
    document.getElementById("pageTitle").textContent = copy[0];
    document.getElementById("pageSubtitle").textContent = copy[2];
    bindOverview();
  } else renderPage(page);
  document.getElementById("sidebar").classList.remove("open");
}
navItems.forEach(item => item.addEventListener("click", () => navigate(item.dataset.page)));
document.getElementById("menuToggle").addEventListener("click", () => document.getElementById("sidebar").classList.toggle("open"));
document.querySelector(".brand").addEventListener("click", e => { e.preventDefault(); navigate("overview"); });
bindOverview();


const PROJECTHUB_ACCESS_URL = "https://mflpyylhzggjwxxplzcz.supabase.co/functions/v1/projecthub-access";
const PROJECTHUB_ACCESS_STORAGE_KEY = "projecthub_join_token_v1";

function getJoinToken() {
  try { return localStorage.getItem(PROJECTHUB_ACCESS_STORAGE_KEY) || ""; } catch { return ""; }
}
function setJoinToken(token) {
  try { localStorage.setItem(PROJECTHUB_ACCESS_STORAGE_KEY, token); return true; } catch { return false; }
}
function clearJoinToken() {
  try { localStorage.removeItem(PROJECTHUB_ACCESS_STORAGE_KEY); } catch {}
}
async function accessRequest(payload) {
  const res = await fetch(PROJECTHUB_ACCESS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify(payload)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Layanan akses tidak tersedia.");
  return data;
}
async function checkJoinStatus() {
  const token = getJoinToken();
  if (!token) return false;
  try {
    const result = await accessRequest({ action: "validate", token });
    if (!result.authorized) clearJoinToken();
    return result.authorized === true;
  } catch {
    return false;
  }
}
function updateJoinStatus(authorized) {
  const chip = document.getElementById("joinStatusChip");
  const text = document.getElementById("joinStatusText");
  const button = document.querySelector("[data-open-join]");
  if (chip) {
    chip.textContent = authorized ? "Akses aktif" : "Belum Join";
    chip.classList.toggle("public-chip", authorized);
  }
  if (text) text.textContent = authorized
    ? "Perangkat ini sudah memiliki akses pengelolaan. Akses tersimpan meskipun browser ditutup."
    : "Belum ada akses pengelolaan pada perangkat ini.";
  if (button) button.textContent = authorized ? "Kelola akses" : "Join sekarang";
}
function ensureJoinDialog() {
  if (document.getElementById("joinAccessDialog")) return;
  const dialog = document.createElement("div");
  dialog.id = "joinAccessDialog";
  dialog.className = "join-dialog";
  dialog.innerHTML = `
    <section class="join-dialog-card" role="dialog" aria-modal="true" aria-labelledby="joinDialogTitle">
      <button type="button" class="join-dialog-close" aria-label="Tutup">×</button>
      <div class="join-dialog-icon">⌑</div>
      <p class="eyebrow">PROJECTHUB ACCESS</p>
      <h2 id="joinDialogTitle">Join workspace</h2>
      <p class="join-dialog-copy">Masukkan kode akses bersama untuk mengaktifkan pengelolaan di perangkat ini.</p>
      <form id="joinAccessForm">
        <label for="joinAccessCode">Kode akses</label>
        <input id="joinAccessCode" type="password" autocomplete="current-password" maxlength="200" placeholder="Masukkan kode akses" required>
        <p class="join-dialog-error" id="joinAccessError" role="alert"></p>
        <button class="primary-button join-submit" type="submit">Join workspace</button>
      </form>
      <p class="join-dialog-foot">Akses tersimpan di browser ini sampai kamu keluar atau menghapus data browser.</p>
    </section>`;
  dialog.addEventListener("click", e => { if (e.target === dialog) dialog.classList.remove("open"); });
  dialog.querySelector(".join-dialog-close").addEventListener("click", () => dialog.classList.remove("open"));
  dialog.querySelector("#joinAccessForm").addEventListener("submit", async e => {
    e.preventDefault();
    const input = dialog.querySelector("#joinAccessCode");
    const error = dialog.querySelector("#joinAccessError");
    const submit = dialog.querySelector(".join-submit");
    const code = input.value;
    error.textContent = "";
    submit.disabled = true;
    submit.textContent = "Memeriksa…";
    try {
      const result = await accessRequest({ action: "join", code });
      if (!result.ok || !result.token) throw new Error(result.error || "Kode akses tidak valid.");
      if (!setJoinToken(result.token)) throw new Error("Browser tidak mengizinkan penyimpanan akses. Periksa pengaturan browser.");
      input.value = "";
      dialog.classList.remove("open");
      updateJoinStatus(true);
      showToast("Berhasil Join. Akses perangkat ini aktif.");
    } catch (err) {
      error.textContent = err.message || "Gagal menghubungkan akses.";
    } finally {
      submit.disabled = false;
      submit.textContent = "Join workspace";
    }
  });
  document.body.appendChild(dialog);
}
function bindJoinAccess(panel) {
  ensureJoinDialog();
  panel.querySelector("[data-open-join]")?.addEventListener("click", async () => {
    const authorized = await checkJoinStatus();
    updateJoinStatus(authorized);
    if (authorized) {
      const confirmed = window.confirm("Akhiri akses pengelolaan pada perangkat ini?");
      if (confirmed) {
        clearJoinToken();
        updateJoinStatus(false);
        showToast("Akses perangkat ini telah dinonaktifkan.");
      }
      return;
    }
    const dialog = document.getElementById("joinAccessDialog");
    dialog.classList.add("open");
    dialog.querySelector("#joinAccessCode").focus();
  });
  checkJoinStatus().then(updateJoinStatus);
}

initJoinAccess();
