(function(){
"use strict";
var URL_BASE="https://mflpyylhzggjwxxplzcz.supabase.co", KEY="sb_publishable_N9fofa5IF4T9ccaPnHhnZg_mvzm2nLu";
var headers={apikey:KEY,Authorization:"Bearer "+KEY}, rows=[],categories=[],statuses=[],priorities=[],editingId=null;
var $=function(s,r){return (r||document).querySelector(s)};
var esc=function(v){return String(v==null?"":v).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})};
var label=function(a,id){var x=a.find(function(v){return v.id===id});return x?x.name:"—"};
var dateLabel=function(v){return v?new Date(v+"T00:00:00").toLocaleDateString("id-ID",{day:"2-digit",month:"short",year:"numeric"}):"Belum ditentukan"};
async function readTable(t,q){var r=await fetch(URL_BASE+"/rest/v1/"+t+"?"+q,{headers:headers,cache:"no-store"});if(!r.ok)throw Error("Gagal membaca "+t+" ("+r.status+")");return r.json()}
async function loadData(){
 var result=await Promise.all([readTable("projects","select=*&deleted_at=is.null&archived_at=is.null&order=updated_at.desc"),readTable("project_categories","select=id,name,color&order=sort_order.asc"),readTable("project_statuses","select=id,name,color&order=sort_order.asc"),readTable("project_priorities","select=id,name,color&order=sort_order.asc")]);
 rows=result[0];categories=result[1];statuses=result[2];priorities=result[3];renderLiveProjects();if(typeof renderDashboardLive==="function")renderDashboardLive();var analyticsRoot=$("#projecthubAnalyticsRoot");if(analyticsRoot&&typeof analyticsMarkup==="function")analyticsRoot.innerHTML=analyticsMarkup();
}
function toneFor(c){return {"Website":"violet","Mobile App":"blue","Desktop App":"violet","School Project":"orange","Design":"pink"}[c]||"blue"}
function card(p){
 var c=label(categories,p.category_id),s=label(statuses,p.status_id),pr=label(priorities,p.priority_id),n=Math.max(0,Math.min(100,Number(p.progress)||0));
 return '<article class="project-card project-card-expanded live-project-card" data-id="'+esc(p.id)+'" data-name="'+esc(p.name)+'" data-category="'+esc(c)+'" data-status="'+esc(s)+'"><div class="project-card-top"><div class="project-symbol symbol-'+toneFor(c)+'">'+esc(p.icon||"✳")+'</div><button class="live-edit-button" data-edit-project="'+esc(p.id)+'" type="button">Edit</button></div><div class="project-meta"><span class="category-pill">'+esc(c)+'</span><span class="status-pill '+(s==="Completed"?"completed":s==="Planning"?"planning":"progress")+'">● '+esc(s)+'</span></div><h3>'+esc(p.name)+'</h3><p>'+esc(p.description||"Belum ada deskripsi project.")+'</p><div class="project-progress"><div class="progress-label"><span>Progress</span><strong>'+n+'%</strong></div><div class="progress-track"><span style="width:'+n+'%"></span></div></div><div class="project-card-foot"><span>◷ '+esc(dateLabel(p.deadline))+'</span><span class="mini-avatar">'+esc(pr)+'</span></div></article>';
}
function renderLiveProjects(){
 var area=$("#allProjects");if(area)area.innerHTML=rows.length?rows.map(card).join(""):'<div class="empty-project-state"><strong>Belum ada project</strong><p>Tambahkan project pertama untuk mulai mengisi workspace.</p></div>';
 var dash=$("#projectGrid");if(dash)dash.innerHTML=rows.slice(0,4).map(card).join("")||'<div class="empty-project-state"><strong>Workspace masih kosong</strong><p>Project yang kamu tambahkan akan muncul di sini.</p></div>';
 var metrics=document.querySelector(".page-metrics");
 if(metrics&&$("#allProjects")){var ip=rows.filter(function(x){return label(statuses,x.status_id)==="In Progress"}).length,done=rows.filter(function(x){return label(statuses,x.status_id)==="Completed"}).length;metrics.innerHTML='<div><strong>'+rows.length+'</strong><span>Total projects</span></div><div><strong>'+ip+'</strong><span>In progress</span></div><div><strong>'+done+'</strong><span>Completed</span></div><div><strong>'+rows.filter(function(x){return !!x.deadline}).length+'</strong><span>With deadline</span></div>'}
 var sf=$("#statusFilter"),cf=$("#categoryFilter");if(sf)sf.innerHTML='<option value="">All statuses</option>'+statuses.map(function(x){return '<option>'+esc(x.name)+'</option>'}).join("");if(cf)cf.innerHTML='<option value="">All categories</option>'+categories.map(function(x){return '<option>'+esc(x.name)+'</option>'}).join("");
}
function options(a,selected){return '<option value="">Pilih…</option>'+a.map(function(x){return '<option value="'+esc(x.id)+'" '+(x.id===selected?"selected":"")+'>'+esc(x.name)+'</option>'}).join("")}
function ensureDialog(){
 if($("#projectEditor"))return;
 var n=document.createElement("div");n.id="projectEditor";n.className="project-editor-overlay";
 n.innerHTML='<section class="project-editor" role="dialog" aria-modal="true" aria-labelledby="projectEditorTitle"><button type="button" class="project-editor-close" aria-label="Tutup">×</button><div class="eyebrow">PROJECTHUB · PROJECT</div><h2 id="projectEditorTitle">New project</h2><p class="project-editor-subtitle">Simpan informasi utama project di satu tempat.</p><form id="projectEditorForm"><label>Nama project <input name="name" maxlength="120" required placeholder="Contoh: Website Portfolio"></label><label>Deskripsi <textarea name="description" rows="3" maxlength="1500" placeholder="Ceritakan tujuan project…"></textarea></label><div class="project-editor-grid"><label>Kategori <select name="category_id"></select></label><label>Status <select name="status_id"></select></label><label>Prioritas <select name="priority_id"></select></label><label>Progress (%) <input name="progress" type="number" min="0" max="100" value="0"></label><label>Tanggal mulai <input name="start_date" type="date"></label><label>Deadline <input name="deadline" type="date"></label></div><p class="project-editor-error" id="projectEditorError" role="alert"></p><div class="project-editor-actions"><button type="button" class="secondary-button" data-cancel-project>Batal</button><button type="submit" class="primary-button" id="projectSaveButton">Simpan project</button></div></form></section>';
 document.body.appendChild(n);var close=function(){n.classList.remove("open")};
 $(".project-editor-close",n).addEventListener("click",close);$("[data-cancel-project]",n).addEventListener("click",close);n.addEventListener("click",function(e){if(e.target===n)close()});$("#projectEditorForm",n).addEventListener("submit",saveProject);
}
function openEditor(id){
 ensureDialog();editingId=id||null;var f=$("#projectEditorForm"),p=rows.find(function(x){return x.id===editingId});f.reset();
 f.elements.category_id.innerHTML=options(categories,p&&p.category_id);f.elements.status_id.innerHTML=options(statuses,p&&p.status_id);f.elements.priority_id.innerHTML=options(priorities,p&&p.priority_id);
 f.elements.name.value=p?p.name:"";f.elements.description.value=p?p.description||"":"";f.elements.progress.value=p?p.progress:0;f.elements.start_date.value=p?p.start_date||"":"";f.elements.deadline.value=p?p.deadline||"":"";
 $("#projectEditorTitle").textContent=p?"Edit project":"New project";$("#projectSaveButton").textContent=p?"Simpan perubahan":"Simpan project";$("#projectEditorError").textContent="";$("#projectEditor").classList.add("open");f.elements.name.focus();
}
async function saveProject(e){
 e.preventDefault();var f=e.currentTarget,b=$("#projectSaveButton"),err=$("#projectEditorError"),d=new FormData(f),name=String(d.get("name")||"").trim();if(!name){err.textContent="Nama project wajib diisi.";return}
 var payload={name:name,description:String(d.get("description")||"").trim(),category_id:d.get("category_id")||null,status_id:d.get("status_id")||null,priority_id:d.get("priority_id")||null,progress:Math.max(0,Math.min(100,Number(d.get("progress"))||0)),start_date:d.get("start_date")||null,deadline:d.get("deadline")||null,icon:editingId?(rows.find(function(x){return x.id===editingId})||{}).icon||"✳":"✳"};
 b.disabled=true;b.textContent="Menyimpan…";err.textContent="";
 try{if(editingId)await window.projecthubWrite("update","projects",payload,{id:editingId});else await window.projecthubWrite("insert","projects",payload);$("#projectEditor").classList.remove("open");await loadData();if(window.showToast)window.showToast(editingId?"Project berhasil diperbarui.":"Project berhasil ditambahkan.");}
 catch(x){err.textContent=x.message||"Project gagal disimpan."}
 finally{b.disabled=false;b.textContent=editingId?"Simpan perubahan":"Simpan project"}
}
function init(){
 window.showToast=window.showToast||function(m){var t=$("#toast");if(t){t.textContent=m;t.classList.add("show");setTimeout(function(){t.classList.remove("show")},2300)}};
 document.addEventListener("click",function(e){
  var edit=e.target.closest("[data-edit-project]");if(edit){e.preventDefault();e.stopImmediatePropagation();openEditor(edit.dataset.editProject);return}
  var add=e.target.closest("#addProject,#pageAction");if(add&&(add.id==="addProject"||$("#allProjects"))){e.preventDefault();e.stopImmediatePropagation();openEditor();return}
  var project=e.target.closest(".live-project-card");if(project&&!e.target.closest("button")){e.preventDefault();e.stopImmediatePropagation();openProjectDetail(project.dataset.id)}
 },true);
 document.addEventListener("click",function(e){if(e.target.closest('.nav-item[data-page="projects"],[data-goto="projects"],.nav-item[data-page="overview"],[data-goto="overview"]'))setTimeout(renderLiveProjects,100)});
 watchSettingsPanel();
 loadData().catch(function(e){console.warn("PROJECTHUB read:",e)});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();

function taxonomyMarkup(){
 var groups=[["Kategori","project_categories",categories],["Status","project_statuses",statuses],["Prioritas","project_priorities",priorities]];
 return '<section class="taxonomy-manager"><div class="taxonomy-heading"><div><h3>Pengaturan project</h3><p>Kelola kategori, status, dan prioritas dari satu tempat.</p></div></div><div class="taxonomy-grid">'+groups.map(function(g){return '<section class="taxonomy-card" data-taxonomy-table="'+g[1]+'"><h4>'+g[0]+'</h4><form class="taxonomy-add"><input name="name" maxlength="40" placeholder="Nama '+g[0].toLowerCase()+'" required><input name="color" type="color" value="#64748b" aria-label="Warna"><button class="secondary-button" type="submit">＋ Tambah</button></form><div class="taxonomy-items">'+g[2].map(function(x){return '<div class="taxonomy-item" data-taxonomy-id="'+esc(x.id)+'"><span class="taxonomy-color" style="background:'+esc(x.color||"#64748b")+'"></span><span>'+esc(x.name)+'</span><button type="button" data-taxonomy-edit aria-label="Ubah '+esc(x.name)+'">Ubah</button><button type="button" data-taxonomy-delete aria-label="Hapus '+esc(x.name)+'">×</button></div>'}).join("")+'</div></section>'}).join("")+'</div><p class="taxonomy-footnote">Item yang masih dipakai project tidak bisa dihapus. Mengubah nama atau warna tidak mengubah project yang sudah menggunakannya.</p></section>';
}
function attachTaxonomyManager(panel){
 if(!panel||!panel.querySelector("[data-open-join]")||panel.querySelector(".taxonomy-manager"))return;
 panel.insertAdjacentHTML("beforeend",taxonomyMarkup());
 panel.querySelectorAll(".taxonomy-card").forEach(function(card){
  card.querySelector(".taxonomy-add").addEventListener("submit",async function(e){
   e.preventDefault();var form=e.currentTarget,d=new FormData(form),name=String(d.get("name")||"").trim(),table=card.dataset.taxonomyTable;
   if(!name)return;
   var source=table==="project_categories"?categories:table==="project_statuses"?statuses:priorities;
   if(source.some(function(x){return x.name.toLowerCase()===name.toLowerCase()})){window.showToast("Nama sudah digunakan.");return}
   var payload={name:name,color:d.get("color")||"#64748b",is_system:false,sort_order:source.reduce(function(m,x){return Math.max(m,Number(x.sort_order)||0)},0)+1};
   try{await window.projecthubWrite("insert",table,payload);await loadData();var fresh=$("#settingsPanel");if(fresh)attachTaxonomyManager(fresh);window.showToast("Item berhasil ditambahkan.");}
   catch(err){window.showToast(err.message||"Gagal menambahkan item.")}
  });
 });
 panel.querySelectorAll("[data-taxonomy-edit]").forEach(function(btn){
  btn.addEventListener("click",async function(){
   var item=btn.closest("[data-taxonomy-id]"),card=btn.closest(".taxonomy-card"),table=card.dataset.taxonomyTable;
   var source=table==="project_categories"?categories:table==="project_statuses"?statuses:priorities;
   var record=source.find(function(x){return x.id===item.dataset.taxonomyId});if(!record)return;
   var name=window.prompt("Ubah nama:",record.name);if(name===null)return;name=name.trim();if(!name)return;
   var color=window.prompt("Warna HEX (contoh #64748b):",record.color||"#64748b");if(color===null)return;
   if(!/^#[0-9a-fA-F]{6}$/.test(color)){window.showToast("Format warna tidak valid.");return}
   try{await window.projecthubWrite("update",table,{name:name,color:color},{id:record.id});await loadData();attachTaxonomyManager($("#settingsPanel"));window.showToast("Item berhasil diperbarui.");}
   catch(err){window.showToast(err.message||"Gagal memperbarui item.")}
  });
 });
 panel.querySelectorAll("[data-taxonomy-delete]").forEach(function(btn){
  btn.addEventListener("click",async function(){
   var item=btn.closest("[data-taxonomy-id]"),card=btn.closest(".taxonomy-card"),table=card.dataset.taxonomyTable;
   var source=table==="project_categories"?categories:table==="project_statuses"?statuses:priorities;
   var record=source.find(function(x){return x.id===item.dataset.taxonomyId});if(!record)return;
   if(!window.confirm('Hapus "'+record.name+'"?'))return;
   try{
    var check=await fetch(URL_BASE+"/rest/v1/projects?select=id&"+(table==="project_categories"?"category_id":table==="project_statuses"?"status_id":"priority_id")+"=eq."+encodeURIComponent(record.id)+"&deleted_at=is.null&limit=1",{headers:headers,cache:"no-store"});
    if(!check.ok)throw Error("Tidak bisa memeriksa penggunaan item.");
    if((await check.json()).length){window.showToast("Tidak bisa dihapus karena masih digunakan project.");return}
    await window.projecthubWrite("delete",table,null,{id:record.id});await loadData();attachTaxonomyManager($("#settingsPanel"));window.showToast("Item berhasil dihapus.");
   }catch(err){window.showToast(err.message||"Gagal menghapus item.")}
  });
 });
}
function watchSettingsPanel(){
 var root=document.body;
 new MutationObserver(function(){var panel=$("#settingsPanel");if(panel)attachTaxonomyManager(panel)}).observe(root,{childList:true,subtree:true});
 var panel=$("#settingsPanel");if(panel)attachTaxonomyManager(panel);
}


var activeProject=null,detailResources=[];
function ensureDetailDialog(){
 if($("#projectDetailDialog"))return;
 var n=document.createElement("div");n.id="projectDetailDialog";n.className="project-detail-overlay";
 n.innerHTML='<section class="project-detail-shell" role="dialog" aria-modal="true" aria-labelledby="projectDetailTitle"><header class="project-detail-head"><div><div class="eyebrow">PROJECT WORKSPACE</div><h2 id="projectDetailTitle">Project detail</h2><p id="projectDetailDescription"></p></div><button type="button" class="project-detail-close" aria-label="Tutup">×</button></header><nav class="project-detail-tabs" aria-label="Project sections"><button class="selected" data-detail-tab="overview">Overview</button><button data-detail-tab="resources">Resources</button><button data-detail-tab="documents">Documentation</button><button data-detail-tab="notes">Notes</button><button data-detail-tab="tasks">Tasks</button><button data-detail-tab="milestones">Milestones</button><button data-detail-tab="timeline">Timeline</button><button data-detail-tab="attachments">Attachments</button></nav><div class="project-detail-body" id="projectDetailBody"></div></section>';
 document.body.appendChild(n);n.querySelector(".project-detail-close").addEventListener("click",function(){n.classList.remove("open")});
 n.querySelectorAll("[data-detail-tab]").forEach(function(b){b.addEventListener("click",function(){n.querySelectorAll("[data-detail-tab]").forEach(function(x){x.classList.toggle("selected",x===b)});renderDetailTab(b.dataset.detailTab)})});
 n.addEventListener("click",function(e){if(e.target===n)n.classList.remove("open")});
}
async function openProjectDetail(id){
 activeProject=rows.find(function(x){return x.id===id});if(!activeProject)return;
 ensureDetailDialog();$("#projectDetailTitle").textContent=activeProject.name;$("#projectDetailDescription").textContent=activeProject.description||"Belum ada deskripsi project.";
 $("#projectDetailDialog").classList.add("open");
 $("#projectDetailDialog").querySelectorAll("[data-detail-tab]").forEach(function(b){b.classList.toggle("selected",b.dataset.detailTab==="overview")});
 renderDetailTab("overview");
}
function detailOverview(){
 var p=activeProject,c=label(categories,p.category_id),s=label(statuses,p.status_id),pr=label(priorities,p.priority_id),progress=Math.max(0,Math.min(100,Number(p.progress)||0));
 return '<div class="detail-overview-grid"><article class="detail-summary-card"><span class="detail-kicker">PROJECT PROGRESS</span><strong class="detail-progress-value">'+progress+'%</strong><div class="progress-track"><span style="width:'+progress+'%"></span></div><p>Progress project saat ini</p></article><article class="detail-info-card"><span class="detail-kicker">INFORMASI PROJECT</span><dl><div><dt>Kategori</dt><dd>'+esc(c)+'</dd></div><div><dt>Status</dt><dd>'+esc(s)+'</dd></div><div><dt>Prioritas</dt><dd>'+esc(pr)+'</dd></div><div><dt>Tanggal mulai</dt><dd>'+esc(dateLabel(p.start_date))+'</dd></div><div><dt>Deadline</dt><dd>'+esc(dateLabel(p.deadline))+'</dd></div></dl></article></div><section class="detail-description-card"><h3>Deskripsi</h3><p>'+esc(p.description||"Belum ada deskripsi untuk project ini.")+'</p><button type="button" class="secondary-button" data-detail-edit>Ubah informasi project</button></section>';
}
async function loadDetailResources(){
 var r=await fetch(URL_BASE+"/rest/v1/project_resources?select=*&project_id=eq."+encodeURIComponent(activeProject.id)+"&order=sort_order.asc,created_at.desc",{headers:headers,cache:"no-store"});
 if(!r.ok)throw Error("Gagal memuat resources.");detailResources=await r.json();
}
function resourcesMarkup(){
 return '<div class="detail-section-heading"><div><h3>Resources</h3><p>Link, repository, website, database, dan referensi project.</p></div><button class="primary-button" data-add-resource>＋ Tambah resource</button></div><div class="detail-resource-list">'+(detailResources.length?detailResources.map(function(x){return '<article class="detail-resource-row"><span class="detail-resource-icon">'+esc(x.icon||"↗")+'</span><div><strong>'+esc(x.name)+'</strong><small>'+esc(x.resource_type||"other")+(x.group_name?" · "+esc(x.group_name):"")+'</small><p>'+esc(x.description||"")+'</p></div><div class="detail-resource-actions">'+(x.url?'<a href="'+esc(x.url)+'" target="_blank" rel="noopener noreferrer">Buka ↗</a>':"")+'<button type="button" data-delete-resource="'+esc(x.id)+'">Hapus</button></div></article>'}).join(""):'<div class="detail-empty-state"><strong>Belum ada resource</strong><p>Tambahkan link penting agar semua referensi project tersimpan di sini.</p></div>')+'</div><form class="detail-resource-form" id="detailResourceForm" hidden><h4>Resource baru</h4><div class="detail-form-grid"><label>Nama resource<input name="name" required maxlength="120" placeholder="GitHub repository"></label><label>URL<input name="url" type="url" placeholder="https://..."></label><label>Jenis<select name="resource_type"><option value="source_code">Repository / Source code</option><option value="website">Website / Demo</option><option value="hosting">Hosting / Server</option><option value="database">Database</option><option value="design">UI / UX</option><option value="api_docs">API / Documentation</option><option value="cloud_storage">Cloud storage</option><option value="other">Lainnya</option></select></label><label>Grup<input name="group_name" maxlength="60" placeholder="Development"></label></div><label class="detail-full-label">Deskripsi<textarea name="description" rows="2" maxlength="500"></textarea></label><div class="detail-form-actions"><button type="button" class="secondary-button" data-cancel-resource>Batal</button><button type="submit" class="primary-button">Simpan resource</button></div><p class="detail-form-error" id="detailResourceError"></p></form>';
}
async function renderDetailTab(tab){
 var body=$("#projectDetailBody");if(!body||!activeProject)return;
 if(tab==="overview"){body.innerHTML=detailOverview();var edit=body.querySelector("[data-detail-edit]");edit.addEventListener("click",function(){$("#projectDetailDialog").classList.remove("open");openEditor(activeProject.id)});return}
 if(tab==="resources"){
  body.innerHTML='<div class="detail-loading">Memuat resources…</div>';
  try{await loadDetailResources();body.innerHTML=resourcesMarkup();bindResourceForm(body)}catch(e){body.innerHTML='<div class="detail-empty-state">'+esc(e.message)+'</div>'}return;
 }
 if(tab==="documents"||tab==="notes"){await renderContentManager(tab);return}
 if(tab==="tasks"){await renderTasksManager();return}
 if(tab==="milestones"){await renderMilestonesManager();return}
 if(tab==="timeline"){await renderTimelineManager();return}
 if(tab==="attachments"){await renderAttachmentsManager();return}
 var copy={}[tab];
 body.innerHTML='<div class="detail-coming-soon"><span>✳</span><h3>'+copy[0]+'</h3><p>'+copy[1]+'</p><small>Bagian ini akan dihubungkan ke database pada tahap berikutnya.</small></div>';
}




var milestoneItems=[],milestoneEditingId=null;
function milestoneMarkup(){
 return '<div class="detail-section-heading"><div><h3>Milestones</h3><p>Titik pencapaian penting project.</p></div><button class="primary-button" data-ms-add>＋ Tambah milestone</button></div><div class="milestone-list">'+(milestoneItems.length?milestoneItems.map(function(m){return '<article class="milestone-card"><div class="milestone-card-top"><div><span class="milestone-status '+esc(m.status)+'">'+esc(({upcoming:"Akan datang",in_progress:"Berjalan",blocked:"Terhambat",completed:"Selesai"})[m.status]||m.status)+'</span><h4>'+esc(m.title)+'</h4></div><time>'+esc(m.due_at?contentDate(m.due_at):"Tanpa tanggal")+'</time></div><p>'+esc(m.description||"")+'</p><div class="milestone-progress"><div><span>Progress</span><strong>'+Number(m.progress||0)+'%</strong></div><div class="progress-track"><span style="width:'+Number(m.progress||0)+'%"></span></div></div><div class="milestone-actions"><button data-ms-edit="'+esc(m.id)+'">Edit</button><button class="danger-text" data-ms-del="'+esc(m.id)+'">Hapus</button></div></article>'}).join(""):'<div class="detail-empty-state"><strong>Belum ada milestone</strong><p>Tambahkan target pencapaian penting project ini.</p></div>')+'</div><form class="milestone-editor-form" data-ms-form hidden><div class="content-editor-heading"><h4 data-ms-heading>Tambah milestone</h4><button type="button" data-ms-cancel>×</button></div><label>Nama milestone<input name="title" required maxlength="150"></label><label>Deskripsi<textarea name="description" rows="3" maxlength="2000"></textarea></label><div class="content-editor-grid"><label>Target tanggal<input name="due_at" type="date"></label><label>Status<select name="status"><option value="upcoming">Akan datang</option><option value="in_progress">Berjalan</option><option value="blocked">Terhambat</option><option value="completed">Selesai</option></select></label><label>Progress (%)<input name="progress" type="number" min="0" max="100" value="0"></label><label>Prasyarat<select name="depends_on"><option value="">Tidak ada</option>'+milestoneItems.map(function(m){return '<option value="'+esc(m.id)+'">'+esc(m.title)+'</option>'}).join("")+'</select></label></div><p class="content-editor-error" role="alert"></p><div class="detail-form-actions"><button type="button" class="secondary-button" data-ms-cancel>Batal</button><button type="submit" class="primary-button">Simpan milestone</button></div></form>';
}
async function renderMilestonesManager(){
 var body=$("#projectDetailBody");body.innerHTML='<div class="detail-loading">Memuat milestones…</div>';
 try{milestoneItems=await readTable("milestones","select=*&project_id=eq."+encodeURIComponent(activeProject.id)+"&order=due_at.asc.nullslast");body.innerHTML=milestoneMarkup();bindMilestones(body)}
 catch(e){body.innerHTML='<div class="detail-empty-state">'+esc(e.message||"Gagal memuat milestones.")+'</div>'}
}
function bindMilestones(body){
 var f=$("[data-ms-form]",body);
 function edit(id){var m=milestoneItems.find(function(x){return x.id===id});milestoneEditingId=id||null;f.reset();f.hidden=false;f.elements.title.value=m?m.title:"";f.elements.description.value=m?m.description||"":"";
 f.elements.due_at.value=m&&m.due_at?new Date(m.due_at).toISOString().slice(0,10):"";f.elements.status.value=m?m.status:"upcoming";f.elements.progress.value=m?m.progress:0;f.elements.depends_on.value=m?m.depends_on||"":"";
 $("[data-ms-heading]",f).textContent=m?"Edit milestone":"Tambah milestone";f.querySelector(".content-editor-error").textContent="";f.scrollIntoView({behavior:"smooth",block:"nearest"})}
 function close(){milestoneEditingId=null;f.reset();f.hidden=true}
 $("[data-ms-add]",body).addEventListener("click",function(){edit(null)});
 body.querySelectorAll("[data-ms-edit]").forEach(function(b){b.addEventListener("click",function(){edit(b.dataset.msEdit)})});
 body.querySelectorAll("[data-ms-cancel]").forEach(function(b){b.addEventListener("click",close)});
 body.querySelectorAll("[data-ms-del]").forEach(function(b){b.addEventListener("click",async function(){if(!confirm("Hapus milestone ini?"))return;try{await window.projecthubWrite("delete","milestones",null,{id:b.dataset.msDel});await renderMilestonesManager();window.showToast("Milestone dihapus.")}catch(e){window.showToast(e.message)}})});
 f.addEventListener("submit",async function(e){e.preventDefault();var d=new FormData(f),status=d.get("status"),dep=d.get("depends_on")||null,err=f.querySelector(".content-editor-error");
 if(dep===milestoneEditingId){err.textContent="Milestone tidak bisa bergantung pada dirinya sendiri.";return}
 var payload={title:String(d.get("title")||"").trim(),description:String(d.get("description")||"").trim(),due_at:d.get("due_at")?new Date(d.get("due_at")+"T12:00:00").toISOString():null,status:status,progress:status==="completed"?100:Math.max(0,Math.min(100,Number(d.get("progress"))||0)),depends_on:dep};
 var b=f.querySelector('[type="submit"]');b.disabled=true;err.textContent="";
 try{if(milestoneEditingId)await window.projecthubWrite("update","milestones",payload,{id:milestoneEditingId});else{payload.project_id=activeProject.id;await window.projecthubWrite("insert","milestones",payload)}await renderMilestonesManager();window.showToast("Milestone tersimpan.")}
 catch(x){err.textContent=x.message||"Gagal menyimpan milestone."}finally{b.disabled=false}
 });
}
var calRows=[],calProjects=[],calView="month",calCursor=new Date(),calSelected=new Date(),calProject="",calType="";
function isoDay(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function dateOf(v){var d=new Date(v);return isNaN(d)?null:d}
function buildCalendarRows(ps,ts,ms,es){
 var a=[];ps.forEach(function(p){if(p.deadline)a.push({id:"p"+p.id,type:"deadline",title:p.name+" · Deadline",date:p.deadline,project_id:p.id,project:p.name,color:"#e59a3a"})});
 ts.forEach(function(t){if(t.due_at){var p=ps.find(function(x){return x.id===t.project_id});a.push({id:"t"+t.id,type:"task",title:t.title,date:isoDay(dateOf(t.due_at)),project_id:t.project_id,project:p?p.name:"Project",color:"#6477db"})}});
 ms.forEach(function(m){if(m.due_at){var p=ps.find(function(x){return x.id===m.project_id});a.push({id:"m"+m.id,type:"milestone",title:m.title,date:isoDay(dateOf(m.due_at)),project_id:m.project_id,project:p?p.name:"Project",color:"#16a37a"})}});
 es.forEach(function(e){var p=ps.find(function(x){return x.id===e.project_id});a.push({id:"e"+e.id,type:"event",title:e.title,date:isoDay(dateOf(e.start_at)),project_id:e.project_id,project:p?p.name:"Umum",color:e.color||"#8b6bd6",time:dateOf(e.start_at)})});
 return a;
}
function calendarMarkup(){
 var y=calCursor.getFullYear(),m=calCursor.getMonth(),start=new Date(calSelected),count=42;
 if(calView==="month"){start=new Date(y,m,1);start.setDate(1-((start.getDay()+6)%7))}
 if(calView==="week"){start.setDate(start.getDate()-((start.getDay()+6)%7));count=7}
 if(calView==="day")count=1;
 var cells=calView==="month"?["Sen","Sel","Rab","Kam","Jum","Sab","Min"].map(function(x){return '<div class="hub-cal-weekday">'+x+'</div>'}).join(""):"";
 for(var i=0;i<count;i++){var d=new Date(start);d.setDate(start.getDate()+i);var iso=isoDay(d),list=calRows.filter(function(x){return x.date===iso&&(!calProject||x.project_id===calProject)&&(!calType||x.type===calType)});
 cells+='<button class="hub-cal-cell '+(calView==="month"&&d.getMonth()!==m?"outside":"")+' '+(iso===isoDay(calSelected)?"selected":"")+'" data-cal-date="'+iso+'"><span class="hub-cal-day">'+d.getDate()+'</span>'+list.slice(0,calView==="day"?20:2).map(function(x){return '<span class="hub-cal-event" title="'+esc(x.title)+'"><i style="background:'+x.color+'"></i>'+esc(x.title)+'</span>'}).join("")+(list.length>2&&calView==="month"?'<small>+'+(list.length-2)+' lainnya</small>':"")+'</button>'}
 var title=calView==="month"?calCursor.toLocaleDateString("id-ID",{month:"long",year:"numeric"}):calView==="week"?"Minggu "+start.toLocaleDateString("id-ID",{day:"numeric",month:"short"})+" – "+new Date(start.getFullYear(),start.getMonth(),start.getDate()+6).toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"}):calSelected.toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
 var agenda=calRows.filter(function(x){return x.date===isoDay(calSelected)&&(!calProject||x.project_id===calProject)&&(!calType||x.type===calType)}).sort(function(a,b){return (a.time||new Date(a.date)).getTime()-(b.time||new Date(b.date)).getTime()});
 return '<div class="hub-calendar-toolbar"><div class="hub-calendar-views"><button data-cal-view="month" class="'+(calView==="month"?"active":"")+'">Bulan</button><button data-cal-view="week" class="'+(calView==="week"?"active":"")+'">Minggu</button><button data-cal-view="day" class="'+(calView==="day"?"active":"")+'">Hari</button></div><div class="hub-calendar-nav"><button data-cal-move="-1">‹</button><strong>'+esc(title)+'</strong><button data-cal-move="1">›</button><button data-cal-today>Hari ini</button></div><button class="primary-button" data-cal-add>＋ Event</button></div><div class="hub-calendar-filters"><select data-cal-project><option value="">Semua project</option>'+calProjects.map(function(p){return '<option value="'+esc(p.id)+'" '+(p.id===calProject?"selected":"")+'>'+esc(p.name)+'</option>'}).join("")+'</select><select data-cal-type><option value="">Semua jenis</option><option value="deadline" '+(calType==="deadline"?"selected":"")+'>Deadline project</option><option value="task" '+(calType==="task"?"selected":"")+'>Task</option><option value="milestone" '+(calType==="milestone"?"selected":"")+'>Milestone</option><option value="event" '+(calType==="event"?"selected":"")+'>Event</option></select><input type="search" data-cal-search placeholder="Cari jadwal…"></div><div class="hub-calendar-grid '+(calView==="month"?"month":"")+'">'+cells+'</div><section class="hub-calendar-agenda"><div class="hub-calendar-agenda-head"><div><h3>Agenda tanggal terpilih</h3><p>'+esc(calSelected.toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long",year:"numeric"}))+'</p></div><span>'+agenda.length+' jadwal</span></div><div class="hub-calendar-event-list">'+(agenda.length?agenda.map(function(x){return '<article class="hub-calendar-event-row"><i style="background:'+x.color+'"></i><div><strong>'+esc(x.title)+'</strong><small>'+esc(({deadline:"Deadline project",task:"Task",milestone:"Milestone",event:"Event"})[x.type])+' · '+esc(x.project)+(x.time?" · "+x.time.toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"}):"")+'</small></div>'+(x.type==="event"?'<button data-cal-delete="'+esc(x.id.slice(1))+'">Hapus</button>':x.type==="task"||x.type==="milestone"?'<button data-cal-open="'+esc(x.project_id)+'" data-cal-tab="'+(x.type==="task"?"tasks":"milestones")+'">Buka</button>':"")+'</article>'}).join(""):'<div class="detail-empty-state">Tidak ada jadwal pada tanggal ini.</div>')+'</div></section><form class="hub-calendar-event-form" data-cal-form hidden><div class="content-editor-heading"><h3>Tambah event</h3><button type="button" data-cal-cancel>×</button></div><div class="content-editor-grid"><label>Nama event<input name="title" required maxlength="160"></label><label>Project<select name="project_id"><option value="">Event umum</option>'+calProjects.map(function(p){return '<option value="'+esc(p.id)+'">'+esc(p.name)+'</option>'}).join("")+'</select></label><label>Mulai<input name="start_at" type="datetime-local" required value="'+isoDay(calSelected)+'T09:00"></label><label>Selesai<input name="end_at" type="datetime-local"></label><label>Jenis<input name="event_type" value="event" maxlength="40"></label><label>Lokasi<input name="location" maxlength="200"></label></div><label>Deskripsi<textarea name="description" rows="3"></textarea></label><p class="content-editor-error" role="alert"></p><div class="detail-form-actions"><button type="button" class="secondary-button" data-cal-cancel>Batal</button><button type="submit" class="primary-button">Simpan event</button></div></form>';
}
async function renderCalendarPage(){
 var root=$("#projecthubCalendarRoot");if(!root)return;root.innerHTML='<div class="detail-loading">Memuat kalender…</div>';
 try{var r=await Promise.all([readTable("projects","select=id,name,deadline,archived_at,deleted_at"),readTable("tasks","select=id,project_id,title,due_at"),readTable("milestones","select=id,project_id,title,due_at"),readTable("calendar_events","select=*")]);
 calProjects=r[0].filter(function(p){return !p.deleted_at&&!p.archived_at});calRows=buildCalendarRows(calProjects,r[1],r[2],r[3]);root.innerHTML=calendarMarkup();bindCalendar(root)}
 catch(e){root.innerHTML='<div class="detail-empty-state">'+esc(e.message||"Gagal memuat kalender.")+'</div>'}
}
function bindCalendar(root){
 root.querySelectorAll("[data-cal-view]").forEach(function(b){b.addEventListener("click",function(){calView=b.dataset.calView;root.innerHTML=calendarMarkup();bindCalendar(root)})});
 root.querySelectorAll("[data-cal-move]").forEach(function(b){b.addEventListener("click",function(){var n=Number(b.dataset.calMove);if(calView==="month")calCursor.setMonth(calCursor.getMonth()+n);else calSelected.setDate(calSelected.getDate()+n*(calView==="week"?7:1));if(calView!=="day")calCursor=new Date(calSelected.getFullYear(),calSelected.getMonth(),1);root.innerHTML=calendarMarkup();bindCalendar(root)})});
 $("[data-cal-today]",root).addEventListener("click",function(){calSelected=new Date();calCursor=new Date();root.innerHTML=calendarMarkup();bindCalendar(root)});
 root.querySelectorAll("[data-cal-date]").forEach(function(b){b.addEventListener("click",function(){calSelected=new Date(b.dataset.calDate+"T12:00:00");calCursor=new Date(calSelected.getFullYear(),calSelected.getMonth(),1);root.innerHTML=calendarMarkup();bindCalendar(root)})});
 $("[data-cal-project]",root).addEventListener("change",function(e){calProject=e.target.value;root.innerHTML=calendarMarkup();bindCalendar(root)});
 $("[data-cal-type]",root).addEventListener("change",function(e){calType=e.target.value;root.innerHTML=calendarMarkup();bindCalendar(root)});
 $("[data-cal-search]",root).addEventListener("input",function(e){var q=e.target.value.toLowerCase();root.querySelectorAll(".hub-calendar-event-row").forEach(function(x){x.hidden=!x.textContent.toLowerCase().includes(q)})});
 $("[data-cal-add]",root).addEventListener("click",function(){$("[data-cal-form]",root).hidden=false});
 root.querySelectorAll("[data-cal-cancel]").forEach(function(b){b.addEventListener("click",function(){$("[data-cal-form]",root).hidden=true})});
 var form=$("[data-cal-form]",root);form.addEventListener("submit",async function(e){e.preventDefault();var d=new FormData(form),start=d.get("start_at"),end=d.get("end_at"),err=form.querySelector(".content-editor-error");
 if(end&&new Date(end)<new Date(start)){err.textContent="Waktu selesai tidak boleh sebelum waktu mulai.";return}
 var payload={title:String(d.get("title")||"").trim(),project_id:d.get("project_id")||null,description:String(d.get("description")||"").trim(),event_type:String(d.get("event_type")||"event").trim()||"event",start_at:new Date(start).toISOString(),end_at:end?new Date(end).toISOString():null,location:String(d.get("location")||"").trim()||null,all_day:false};
 var b=form.querySelector('[type="submit"]');b.disabled=true;err.textContent="";
 try{await window.projecthubWrite("insert","calendar_events",payload);calSelected=new Date(start);await renderCalendarPage();window.showToast("Event tersimpan.")}
 catch(x){err.textContent=x.message||"Gagal menyimpan event."}finally{b.disabled=false}
 });
 root.querySelectorAll("[data-cal-delete]").forEach(function(b){b.addEventListener("click",async function(){if(!confirm("Hapus event ini?"))return;try{await window.projecthubWrite("delete","calendar_events",null,{id:b.dataset.calDelete});await renderCalendarPage();window.showToast("Event dihapus.")}catch(e){window.showToast(e.message)}})});
 root.querySelectorAll("[data-cal-open]").forEach(function(b){b.addEventListener("click",function(){openProjectDetail(b.dataset.calOpen);setTimeout(function(){var t=$('[data-detail-tab="'+b.dataset.calTab+'"]');if(t)t.click()},80)})});
}
function observeCalendarPage(){
 var root=document.querySelector(".content-wrap");if(!root)return;
 new MutationObserver(function(){var title=$("#pageTitle");if(title&&title.textContent.trim()==="Calendar"&&!$("#projecthubCalendarRoot")){
 var old=root.querySelector(".calendar-toolbar"),grid=root.querySelector(".full-calendar");if(old)old.remove();if(grid)grid.remove();
 var anchor=root.querySelector(".page-section-heading");if(anchor)anchor.insertAdjacentHTML("afterend",'<div id="projecthubCalendarRoot"></div>');
 var action=$("#pageAction");if(action)action.style.display="none";renderCalendarPage();
 }else if(title&&title.textContent.trim()!=="Calendar"){var action=$("#pageAction");if(action)action.style.display=""}}).observe(root,{childList:true,subtree:true});
}
observeCalendarPage();

var timelineItems=[],attachmentItems=[];
function timelineMarkup(){
 var list=timelineItems;
 return '<div class="detail-section-heading"><div><h3>Timeline</h3><p>Riwayat otomatis perubahan dan aktivitas project.</p></div><span class="timeline-total">'+list.length+' aktivitas</span></div><div class="timeline-toolbar"><input type="search" data-timeline-search placeholder="Cari aktivitas…"><select data-timeline-filter><option value="">Semua aktivitas</option><option value="project">Project</option><option value="task">Task</option><option value="note">Notes</option><option value="document">Documentation</option><option value="resource">Resources</option><option value="attachment">Attachments</option><option value="milestone">Milestones</option><option value="calendar_event">Calendar</option></select></div><div class="timeline-feed">'+(list.length?list.map(function(x){return '<article class="timeline-entry" data-entity="'+esc(x.entity_type)+'"><span class="timeline-dot"></span><div class="timeline-entry-main"><div class="timeline-entry-top"><strong>'+esc(x.summary)+'</strong><time>'+esc(contentDate(x.created_at))+'</time></div><p>'+esc(x.action==="insert"?"Item ditambahkan":x.action==="update"?"Item diperbarui":x.action==="delete"?"Item dihapus":x.action)+'</p></div></article>'}).join(""):'<div class="detail-empty-state"><strong>Belum ada aktivitas</strong><p>Perubahan project akan tercatat otomatis di sini.</p></div>')+'</div>';
}
async function renderTimelineManager(){
 var body=$("#projectDetailBody");body.innerHTML='<div class="detail-loading">Memuat timeline…</div>';
 try{timelineItems=await readTable("activity_log","select=*&project_id=eq."+encodeURIComponent(activeProject.id)+"&order=created_at.desc&limit=250");body.innerHTML=timelineMarkup();bindTimeline(body)}
 catch(e){body.innerHTML='<div class="detail-empty-state">'+esc(e.message||"Gagal memuat timeline.")+'</div>'}
}
function bindTimeline(body){
 var search=$("[data-timeline-search]",body),filter=$("[data-timeline-filter]",body);
 function apply(){var q=search.value.trim().toLowerCase(),kind=filter.value;body.querySelectorAll(".timeline-entry").forEach(function(el){el.hidden=!(el.textContent.toLowerCase().includes(q)&&(!kind||el.dataset.entity===kind))})}
 search.addEventListener("input",apply);filter.addEventListener("change",apply);
}
function attachmentPublicUrl(path){return URL_BASE+"/storage/v1/object/public/projecthub-files/"+path.split("/").map(encodeURIComponent).join("/")}
function fileSize(n){if(n<1024)return n+" B";if(n<1048576)return (n/1024).toFixed(1)+" KB";return (n/1048576).toFixed(1)+" MB"}
function attachmentMarkup(){
 return '<div class="detail-section-heading"><div><h3>Attachments</h3><p>File project tersimpan di Supabase Storage.</p></div><button class="primary-button" type="button" data-attachment-add>＋ Upload file</button></div><div class="attachment-toolbar"><input type="search" data-attachment-search placeholder="Cari nama file atau folder…"><span>'+attachmentItems.length+' file</span></div><div class="attachment-upload-panel" data-attachment-panel hidden><form data-attachment-form><label>Pilih file<input type="file" name="file" required accept="image/*,.pdf,.txt,.zip,.docx,.xlsx,.pptx"></label><div class="content-editor-grid"><label>Folder<input name="folder" maxlength="100" placeholder="Contoh: Design / Final"></label><label>Deskripsi<input name="description" maxlength="2000" placeholder="Keterangan file"></label></div><small>Maksimal 50 MB per file. File yang diunggah dapat dilihat publik sesuai pengaturan workspace.</small><p class="content-editor-error" data-attachment-error role="alert"></p><div class="detail-form-actions"><button type="button" class="secondary-button" data-attachment-cancel>Batal</button><button type="submit" class="primary-button">Upload</button></div></form></div><div class="attachment-list">'+(attachmentItems.length?attachmentItems.map(function(x){var ext=(x.file_name.split(".").pop()||"FILE").toUpperCase().slice(0,5);return '<article class="attachment-card" data-attachment-id="'+esc(x.id)+'"><div class="attachment-file-icon">'+esc(ext)+'</div><div class="attachment-file-info"><strong>'+esc(x.file_name)+'</strong><span>'+esc(x.folder||"Tanpa folder")+' · '+fileSize(Number(x.file_size)||0)+' · '+esc(contentDate(x.created_at))+'</span>'+(x.description?'<p>'+esc(x.description)+'</p>':"")+'</div><div class="attachment-file-actions"><a href="'+esc(attachmentPublicUrl(x.storage_path))+'?download='+encodeURIComponent(x.file_name)+'" target="_blank" rel="noopener">Unduh</a><button type="button" data-attachment-delete="'+esc(x.id)+'">Hapus</button></div></article>'}).join(""):'<div class="detail-empty-state"><strong>Belum ada lampiran</strong><p>Upload file project pertama untuk mulai mengumpulkan aset.</p></div>')+'</div>';
}
async function renderAttachmentsManager(){
 var body=$("#projectDetailBody");body.innerHTML='<div class="detail-loading">Memuat lampiran…</div>';
 try{attachmentItems=await readTable("attachments","select=*&project_id=eq."+encodeURIComponent(activeProject.id)+"&order=created_at.desc");body.innerHTML=attachmentMarkup();bindAttachments(body)}
 catch(e){body.innerHTML='<div class="detail-empty-state">'+esc(e.message||"Gagal memuat lampiran.")+'</div>'}
}
function bindAttachments(body){
 var panel=$("[data-attachment-panel]",body),form=$("[data-attachment-form]",body);
 $("[data-attachment-add]",body).addEventListener("click",function(){panel.hidden=false});
 $("[data-attachment-cancel]",body).addEventListener("click",function(){form.reset();panel.hidden=true;form.querySelector("[data-attachment-error]").textContent=""});
 $("[data-attachment-search]",body).addEventListener("input",function(e){var q=e.target.value.toLowerCase().trim();body.querySelectorAll(".attachment-card").forEach(function(card){var item=attachmentItems.find(function(x){return x.id===card.dataset.attachmentId});card.hidden=![item.file_name,item.folder,item.description].join(" ").toLowerCase().includes(q)})});
 form.addEventListener("submit",async function(e){
  e.preventDefault();var file=form.elements.file.files[0],error=form.querySelector("[data-attachment-error]");if(!file)return;
  var allowed=/\.(pdf|txt|zip|docx|xlsx|pptx)$/i.test(file.name)||file.type.startsWith("image/");
  if(!allowed){error.textContent="Format file belum didukung.";return}
  if(file.size>50*1024*1024){error.textContent="Ukuran maksimal file adalah 50 MB.";return}
  var token=typeof getJoinToken==="function"?getJoinToken():localStorage.getItem("projecthub_join_token_v1");
  if(!token){error.textContent="Perangkat ini belum Join. Gabung dulu melalui Settings.";return}
  var btn=form.querySelector('[type="submit"]');btn.disabled=true;btn.textContent="Mengunggah…";error.textContent="";
  try{
   var data=new FormData();data.append("token",token);data.append("project_id",activeProject.id);data.append("file",file);data.append("folder",String(form.elements.folder.value||""));data.append("description",String(form.elements.description.value||""));
   var response=await fetch(URL_BASE+"/functions/v1/projecthub-write",{method:"POST",body:data,cache:"no-store"});
   var result=await response.json().catch(function(){return {}});if(!response.ok||!result.ok)throw Error(result.error||"Upload gagal.");
   await renderAttachmentsManager();window.showToast("File berhasil diunggah.");
  }catch(err){error.textContent=err.message||"Upload gagal."}
  finally{btn.disabled=false;btn.textContent="Upload"}
 });
 body.querySelectorAll("[data-attachment-delete]").forEach(function(b){b.addEventListener("click",async function(){
  if(!confirm("Hapus file ini secara permanen dari Storage?"))return;
  var token=typeof getJoinToken==="function"?getJoinToken():localStorage.getItem("projecthub_join_token_v1");
  try{var response=await fetch(URL_BASE+"/functions/v1/projecthub-write",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token:token,action:"delete_attachment",attachment_id:b.dataset.attachmentDelete})});var result=await response.json().catch(function(){return {}});if(!response.ok||!result.ok)throw Error(result.error||"Gagal menghapus file.");await renderAttachmentsManager();window.showToast("File dihapus.")}
  catch(e){window.showToast(e.message||"Gagal menghapus file.")}
 })});
}

var taskItems=[],taskView="board",taskEditingId=null,taskActiveDetail=null,taskChecklist=[],taskComments=[],taskCalendarCursor=new Date(new Date().getFullYear(),new Date().getMonth(),1);
var TASK_STATUSES=["To Do","In Progress","Review","Done","Cancelled"],TASK_PRIORITIES=["Urgent","High","Medium","Low"];
function taskWhen(v){return v?new Date(v).toLocaleString("id-ID",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}):"Tanpa tanggal"}
function taskDateInput(v){if(!v)return "";var d=new Date(v);return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16)}
function taskMarkup(){
 var count=TASK_STATUSES.reduce(function(a,s){a[s]=taskItems.filter(function(t){return t.status===s}).length;return a},{});
 return '<div class="detail-section-heading"><div><h3>Tasks</h3><p>Atur pekerjaan, tenggat, checklist, dan catatan tugas project ini.</p></div><button class="primary-button" data-task-add>＋ Tambah task</button></div><div class="task-work-toolbar"><div class="task-view-switch"><button type="button" data-task-view="board" class="'+(taskView==="board"?"active":"")+'">Board</button><button type="button" data-task-view="list" class="'+(taskView==="list"?"active":"")+'">List</button><button type="button" data-task-view="calendar" class="'+(taskView==="calendar"?"active":"")+'">Calendar</button></div><input type="search" data-task-search placeholder="Cari task…"></div><div class="task-work-summary">'+TASK_STATUSES.map(function(s){return '<div><strong>'+count[s]+'</strong><span>'+s+'</span></div>'}).join("")+'</div><div class="task-work-content" data-task-content></div><form class="task-editor-form" id="taskEditorForm" hidden><div class="content-editor-heading"><h4 data-task-editor-title>Tambah task</h4><button type="button" class="content-editor-close" data-task-cancel aria-label="Tutup">×</button></div><label>Judul task<input name="title" maxlength="180" required placeholder="Apa yang perlu dikerjakan?"></label><label>Deskripsi<textarea name="description" rows="3" maxlength="3000" placeholder="Detail pekerjaan…"></textarea></label><div class="content-editor-grid"><label>Status<select name="status">'+TASK_STATUSES.map(function(s){return '<option>'+s+'</option>'}).join("")+'</select></label><label>Prioritas<select name="priority"><option value="">Tanpa prioritas</option>'+TASK_PRIORITIES.map(function(s){return '<option>'+s+'</option>'}).join("")+'</select></label><label>Mulai<input type="datetime-local" name="start_at"></label><label>Deadline<input type="datetime-local" name="due_at"></label></div><p class="content-editor-error" role="alert"></p><div class="detail-form-actions"><button type="button" class="secondary-button" data-task-cancel>Batal</button><button type="submit" class="primary-button">Simpan task</button></div></form><section class="task-expanded-detail" data-task-expanded hidden></section>';
}
function taskCard(t){
 var late=t.due_at&&new Date(t.due_at)<new Date()&&t.status!=="Done"&&t.status!=="Cancelled";
 return '<article class="task-work-card" data-task-id="'+esc(t.id)+'"><div class="task-card-top"><span class="task-status-label status-'+t.status.toLowerCase().replace(/[^a-z]+/g,"-")+'">'+esc(t.status)+'</span><span class="task-priority-label">'+esc(t.priority||"Normal")+'</span></div><h4>'+esc(t.title)+'</h4><p>'+esc(t.description||"")+'</p><div class="task-card-meta"><span class="'+(late?"task-overdue":"")+'">◷ '+esc(taskWhen(t.due_at))+'</span><button type="button" data-task-open="'+esc(t.id)+'">Detail / checklist</button></div><div class="task-card-actions"><button type="button" data-task-edit="'+esc(t.id)+'">Edit</button><button type="button" data-task-delete="'+esc(t.id)+'">Hapus</button></div></article>';
}
function paintTasks(body){
 var target=$("[data-task-content]",body),q=($("[data-task-search]",body).value||"").trim().toLowerCase(),items=taskItems.filter(function(t){return [t.title,t.description,t.status,t.priority].join(" ").toLowerCase().includes(q)});
 if(taskView==="board")target.innerHTML='<div class="task-board">'+TASK_STATUSES.map(function(s){var a=items.filter(function(t){return t.status===s});return '<section class="task-board-column"><header><strong>'+s+'</strong><span>'+a.length+'</span></header><div class="task-board-cards">'+(a.map(taskCard).join("")||'<p class="task-board-empty">Belum ada task</p>')+'</div></section>'}).join("")+'</div>';
 else if(taskView==="calendar"){
  var yy=taskCalendarCursor.getFullYear(),mm=taskCalendarCursor.getMonth(),first=new Date(yy,mm,1),offset=(first.getDay()+6)%7,total=Math.ceil((offset+new Date(yy,mm+1,0).getDate())/7)*7;
  var weekdays=["Sen","Sel","Rab","Kam","Jum","Sab","Min"];
  var cells=Array.from({length:total},function(_,i){var day=i-offset+1,date=new Date(yy,mm,day),same=date.getMonth()===mm,key=date.getFullYear()+"-"+String(date.getMonth()+1).padStart(2,"0")+"-"+String(date.getDate()).padStart(2,"0"),dayTasks=items.filter(function(t){return t.due_at&&new Date(t.due_at).getFullYear()===date.getFullYear()&&new Date(t.due_at).getMonth()===date.getMonth()&&new Date(t.due_at).getDate()===date.getDate()});return '<div class="task-calendar-cell '+(same?"":"muted")+'"><span>'+date.getDate()+'</span>'+(dayTasks.map(function(t){return '<button type="button" data-task-open="'+esc(t.id)+'" title="'+esc(t.title)+'">'+esc(t.title)+'</button>'}).join(""))+'</div>'}).join("");
  target.innerHTML='<div class="task-calendar-heading"><button type="button" data-task-month="-1">‹</button><strong>'+esc(taskCalendarCursor.toLocaleDateString("id-ID",{month:"long",year:"numeric"}))+'</strong><button type="button" data-task-month="1">›</button></div><div class="task-month-grid">'+weekdays.map(function(d){return '<div class="task-calendar-weekday">'+d+'</div>'}).join("")+cells+'</div>';
 }else target.innerHTML='<div class="task-list-view">'+(items.length?items.sort(function(a,b){return new Date(a.due_at||"9999-12-31")-new Date(b.due_at||"9999-12-31")}).map(taskCard).join(""):'<div class="detail-empty-state"><strong>Belum ada task</strong><p>Tambahkan task pertama untuk project ini.</p></div>')+'</div>';
 target.querySelectorAll("[data-task-month]").forEach(function(b){b.addEventListener("click",function(){taskCalendarCursor.setMonth(taskCalendarCursor.getMonth()+Number(b.dataset.taskMonth));paintTasks(body)})});
 bindTaskCards(body);
}
async function renderTasksManager(){
 var body=$("#projectDetailBody");body.innerHTML='<div class="detail-loading">Memuat tasks…</div>';
 try{taskItems=await readTable("tasks","select=*&project_id=eq."+encodeURIComponent(activeProject.id)+"&order=sort_order.asc,created_at.desc");body.innerHTML=taskMarkup();bindTaskManager(body);paintTasks(body)}
 catch(e){body.innerHTML='<div class="detail-empty-state">'+esc(e.message||"Gagal memuat tasks.")+'</div>'}
}
function bindTaskManager(body){
 var form=$("#taskEditorForm",body),detail=$("[data-task-expanded]",body);
 function closeEditor(){taskEditingId=null;form.reset();form.hidden=true;form.querySelector(".content-editor-error").textContent=""}
 function openEditor(id){
  var t=taskItems.find(function(x){return x.id===id});taskEditingId=id||null;form.reset();form.hidden=false;
  form.elements.title.value=t?t.title:"";form.elements.description.value=t?t.description||"":"";
  form.elements.status.value=t?t.status:"To Do";form.elements.priority.value=t?t.priority||"":"";
  form.elements.start_at.value=t?taskDateInput(t.start_at):"";form.elements.due_at.value=t?taskDateInput(t.due_at):"";
  $("[data-task-editor-title]",form).textContent=(t?"Edit ":"Tambah ")+"task";form.querySelector(".content-editor-error").textContent="";
  form.scrollIntoView({behavior:"smooth",block:"nearest"});form.elements.title.focus();
 }
 $("[data-task-add]",body).addEventListener("click",function(){openEditor(null)});
 body.querySelectorAll("[data-task-cancel]").forEach(function(b){b.addEventListener("click",closeEditor)});
 body.querySelectorAll("[data-task-view]").forEach(function(b){b.addEventListener("click",function(){taskView=b.dataset.taskView;body.querySelectorAll("[data-task-view]").forEach(function(x){x.classList.toggle("active",x===b)});paintTasks(body)})});
 $("[data-task-search]",body).addEventListener("input",function(){paintTasks(body)});
 body.querySelectorAll("[data-task-month]").forEach(function(b){b.addEventListener("click",function(){taskCalendarCursor.setMonth(taskCalendarCursor.getMonth()+Number(b.dataset.taskMonth));paintTasks(body)})});
 form.addEventListener("submit",async function(e){
  e.preventDefault();var d=new FormData(form),title=String(d.get("title")||"").trim(),err=form.querySelector(".content-editor-error");
  if(!title){err.textContent="Judul task wajib diisi.";return}
  var start=d.get("start_at"),due=d.get("due_at");
  if(start&&due&&new Date(due)<new Date(start)){err.textContent="Deadline tidak boleh lebih awal dari waktu mulai.";return}
  var status=String(d.get("status")),payload={title:title,description:String(d.get("description")||"").trim(),status:status,priority:d.get("priority")||null,start_at:start?new Date(start).toISOString():null,due_at:due?new Date(due).toISOString():null,completed_at:status==="Done"?(taskItems.find(function(t){return t.id===taskEditingId})||{}).completed_at||new Date().toISOString():null};
  var btn=form.querySelector('[type="submit"]');btn.disabled=true;err.textContent="";
  try{if(taskEditingId)await window.projecthubWrite("update","tasks",payload,{id:taskEditingId});else{payload.project_id=activeProject.id;payload.sort_order=taskItems.length;await window.projecthubWrite("insert","tasks",payload)}await renderTasksManager();window.showToast("Task tersimpan.")}
  catch(x){err.textContent=x.message||"Gagal menyimpan task."}
  finally{btn.disabled=false}
 });
}
function bindTaskCards(body){
 body.querySelectorAll("[data-task-edit]").forEach(function(b){b.addEventListener("click",function(){var t=taskItems.find(function(x){return x.id===b.dataset.taskEdit});if(!t)return;var f=$("#taskEditorForm",body);f.hidden=false;f.elements.title.value=t.title;f.elements.description.value=t.description||"";f.elements.status.value=t.status;f.elements.priority.value=t.priority||"";f.elements.start_at.value=taskDateInput(t.start_at);f.elements.due_at.value=taskDateInput(t.due_at);taskEditingId=t.id;$("[data-task-editor-title]",f).textContent="Edit task";f.scrollIntoView({behavior:"smooth",block:"nearest"})})});
 body.querySelectorAll("[data-task-delete]").forEach(function(b){b.addEventListener("click",async function(){if(!confirm("Hapus task ini beserta checklist dan komentarnya?"))return;var id=b.closest("[data-task-id]").dataset.taskId;try{var [cl,cm]=await Promise.all([readTable("task_checklist_items","select=id&task_id=eq."+id),readTable("task_comments","select=id&task_id=eq."+id)]);for(var x of cl)await window.projecthubWrite("delete","task_checklist_items",null,{id:x.id});for(var y of cm)await window.projecthubWrite("delete","task_comments",null,{id:y.id});await window.projecthubWrite("delete","tasks",null,{id:id});await renderTasksManager();window.showToast("Task dihapus.")}catch(e){window.showToast(e.message||"Gagal menghapus task.")}})});
 body.querySelectorAll("[data-task-open]").forEach(function(b){b.addEventListener("click",function(){openTaskDetail(b.dataset.taskOpen,body)})});
}
async function openTaskDetail(id,body){
 taskActiveDetail=id;var t=taskItems.find(function(x){return x.id===id});if(!t)return;var box=$("[data-task-expanded]",body);box.hidden=false;box.innerHTML='<div class="detail-loading">Memuat checklist dan komentar…</div>';
 try{
  var r=await Promise.all([readTable("task_checklist_items","select=*&task_id=eq."+id+"&order=sort_order.asc"),readTable("task_comments","select=*&task_id=eq."+id+"&order=created_at.asc")]);taskChecklist=r[0];taskComments=r[1];
  box.innerHTML='<div class="task-expanded-head"><div><span class="detail-kicker">TASK DETAIL</span><h4>'+esc(t.title)+'</h4></div><button type="button" data-task-detail-close>×</button></div><div class="task-expanded-columns"><section><h5>Checklist ('+taskChecklist.filter(function(x){return x.is_completed}).length+'/'+taskChecklist.length+')</h5><div class="task-checklist">'+(taskChecklist.map(function(x){return '<label><input type="checkbox" data-check-id="'+esc(x.id)+'" '+(x.is_completed?"checked":"")+'><span>'+esc(x.title)+'</span><button type="button" data-check-delete="'+esc(x.id)+'" aria-label="Hapus checklist">×</button></label>'}).join("")||'<p class="task-board-empty">Belum ada checklist.</p>')+'</div><form data-check-add class="task-inline-form"><input name="title" required maxlength="180" placeholder="Tambah item checklist"><button class="primary-button">Tambah</button></form></section><section><h5>Komentar ('+taskComments.length+')</h5><div class="task-comments">'+(taskComments.map(function(x){return '<p>'+esc(x.content)+'<small>'+esc(taskWhen(x.created_at))+'</small></p>'}).join("")||'<p class="task-board-empty">Belum ada komentar.</p>')+'</div><form data-comment-add class="task-inline-form"><textarea name="content" required maxlength="2000" rows="2" placeholder="Tulis komentar…"></textarea><button class="primary-button">Kirim</button></form></section></div>';
  $("[data-task-detail-close]",box).addEventListener("click",function(){box.hidden=true;taskActiveDetail=null});
  box.querySelectorAll("[data-check-id]").forEach(function(input){input.addEventListener("change",async function(){try{await window.projecthubWrite("update","task_checklist_items",{is_completed:input.checked},{id:input.dataset.checkId});await openTaskDetail(id,body)}catch(e){input.checked=!input.checked;window.showToast(e.message)}})});
  box.querySelectorAll("[data-check-delete]").forEach(function(b){b.addEventListener("click",async function(){try{await window.projecthubWrite("delete","task_checklist_items",null,{id:b.dataset.checkDelete});await openTaskDetail(id,body)}catch(e){window.showToast(e.message)}})});
  $("[data-check-add]",box).addEventListener("submit",async function(e){e.preventDefault();var title=e.currentTarget.elements.title.value.trim();if(!title)return;try{await window.projecthubWrite("insert","task_checklist_items",{task_id:id,title:title,sort_order:taskChecklist.length});await openTaskDetail(id,body)}catch(x){window.showToast(x.message||"Gagal menambah checklist.")}});
  $("[data-comment-add]",box).addEventListener("submit",async function(e){e.preventDefault();var content=e.currentTarget.elements.content.value.trim();if(!content)return;try{await window.projecthubWrite("insert","task_comments",{task_id:id,content:content});await openTaskDetail(id,body)}catch(x){window.showToast(x.message||"Gagal mengirim komentar.")}});
  box.scrollIntoView({behavior:"smooth",block:"nearest"});
 }catch(e){box.innerHTML='<div class="detail-empty-state">'+esc(e.message||"Gagal memuat detail task.")+'</div>'}
}

var contentItems=[],contentTab="documents",editingContentId=null;
function contentDate(v){return v?new Date(v).toLocaleString("id-ID",{dateStyle:"medium",timeStyle:"short"}):"—"}
function contentMarkup(tab){
 var docs=tab==="documents",title=docs?"Documentation":"Notes",desc=docs?"Simpan dokumentasi project, panduan, dan tautan referensi.":"Simpan ide dan catatan penting, lalu pin catatan yang sering dibuka.";
 var visible=contentItems.filter(function(x){return !x.is_archived});
 visible.sort(function(a,b){if(!docs&&!!a.is_pinned!==!!b.is_pinned)return a.is_pinned?-1:1;return new Date(b.updated_at||b.created_at)-new Date(a.updated_at||a.created_at)});
 return '<div class="detail-section-heading"><div><h3>'+title+'</h3><p>'+desc+'</p></div><button class="primary-button" data-content-add>＋ '+(docs?"Dokumentasi":"Catatan")+'</button></div><div class="content-toolbar"><input type="search" data-content-search placeholder="Cari '+(docs?"dokumentasi":"catatan")+'…" aria-label="Cari '+title+'"><span>'+visible.length+' item</span></div><div class="content-item-list">'+(visible.length?visible.map(function(x){
 var tags=docs?[x.category,x.folder].filter(Boolean):[x.folder].concat(x.tags||[]).filter(Boolean);
 return '<article class="content-item-card" data-content-id="'+esc(x.id)+'"><div class="content-item-top"><div><span class="content-item-kind">'+(docs?"DOKUMENTASI":"CATATAN")+'</span>'+( !docs&&x.is_pinned?'<span class="content-pin-label">PINNED</span>':"")+'</div><span class="content-item-date">'+esc(contentDate(x.updated_at||x.created_at))+'</span></div><h4>'+esc(x.title)+'</h4><div class="content-item-tags">'+tags.map(function(t){return '<span>'+esc(t)+'</span>'}).join("")+'</div><p class="content-item-preview">'+esc((x.content||"").slice(0,260))+'</p>'+(docs&&x.external_url?'<a class="content-external-link" href="'+esc(x.external_url)+'" target="_blank" rel="noopener noreferrer">Buka tautan eksternal ↗</a>':"")+'<div class="content-item-actions"><button type="button" data-content-edit="'+esc(x.id)+'">Edit</button>'+(!docs?'<button type="button" data-content-pin="'+esc(x.id)+'">'+(x.is_pinned?"Lepas pin":"Pin")+'</button>':"")+'<button type="button" data-content-archive="'+esc(x.id)+'">Arsipkan</button><button type="button" class="danger-text" data-content-delete="'+esc(x.id)+'">Hapus</button></div></article>';
 }).join(""):'<div class="detail-empty-state"><strong>Belum ada '+(docs?"dokumentasi":"catatan")+'</strong><p>Klik tombol tambah untuk membuat yang pertama.</p></div>')+'</div><form class="content-editor-form" id="contentEditorForm" hidden><div class="content-editor-heading"><h4 data-content-editor-title>Tambah '+title+'</h4><button type="button" class="content-editor-close" data-content-cancel aria-label="Tutup">×</button></div><label>Judul<input name="title" maxlength="160" required placeholder="Masukkan judul…"></label><div class="content-editor-grid"><label>Folder<input name="folder" maxlength="80" placeholder="Contoh: Planning"></label>'+(docs?'<label>Kategori<input name="category" maxlength="60" placeholder="Contoh: Technical"></label><label class="content-editor-wide">Tautan eksternal<input name="external_url" type="url" placeholder="https://…"></label>':'<label>Tags<input name="tags" maxlength="240" placeholder="ide, referensi, penting"><small>Pisahkan tag dengan koma.</small></label>')+'</div><label>Isi '+(docs?"dokumentasi":"catatan")+'<textarea name="content" rows="10" maxlength="30000" placeholder="Tulis isi di sini…" required></textarea></label><p class="content-editor-error" role="alert"></p><div class="detail-form-actions"><button type="button" class="secondary-button" data-content-cancel>Batal</button><button type="submit" class="primary-button">Simpan</button></div></form>';
}
async function renderContentManager(tab){
 contentTab=tab;var body=$("#projectDetailBody");body.innerHTML='<div class="detail-loading">Memuat '+(tab==="documents"?"dokumentasi":"catatan")+'…</div>';
 try{
  var table=tab==="documents"?"documents":"notes";
  contentItems=await readTable(table,"select=*&project_id=eq."+encodeURIComponent(activeProject.id)+"&order=updated_at.desc");
  body.innerHTML=contentMarkup(tab);bindContentManager(body,tab);
 }catch(e){body.innerHTML='<div class="detail-empty-state">'+esc(e.message||"Gagal memuat data.")+'</div>'}
}
function bindContentManager(body,tab){
 var docs=tab==="documents",table=docs?"documents":"notes",form=$("#contentEditorForm",body);
 function resetEditor(){editingContentId=null;form.reset();form.hidden=true;form.querySelector(".content-editor-error").textContent=""}
 function openContentEditor(id){
  var item=contentItems.find(function(x){return x.id===id});editingContentId=id||null;form.reset();form.hidden=false;
  form.elements.title.value=item?item.title:"";form.elements.folder.value=item&&item.folder||"";
  form.elements.content.value=item?item.content||"":"";
  if(docs){form.elements.category.value=item&&item.category||"";form.elements.external_url.value=item&&item.external_url||""}
  else form.elements.tags.value=item?(item.tags||[]).join(", "):"";
  $("[data-content-editor-title]",form).textContent=(item?"Edit ":"Tambah ")+(docs?"dokumentasi":"catatan");
  form.querySelector(".content-editor-error").textContent="";form.scrollIntoView({behavior:"smooth",block:"nearest"});form.elements.title.focus();
 }
 $("[data-content-add]",body).addEventListener("click",function(){openContentEditor(null)});
 body.querySelectorAll("[data-content-cancel]").forEach(function(b){b.addEventListener("click",resetEditor)});
 $("[data-content-search]",body).addEventListener("input",function(e){
  var q=e.target.value.trim().toLocaleLowerCase("id-ID");
  body.querySelectorAll(".content-item-card").forEach(function(card){var item=contentItems.find(function(x){return x.id===card.dataset.contentId});var hay=[item.title,item.content,item.folder,item.category,(item.tags||[]).join(" ")].join(" ").toLocaleLowerCase("id-ID");card.hidden=!hay.includes(q)});
 });
 body.querySelectorAll("[data-content-edit]").forEach(function(b){b.addEventListener("click",function(){openContentEditor(b.dataset.contentEdit)})});
 body.querySelectorAll("[data-content-delete]").forEach(function(b){b.addEventListener("click",async function(){
  if(!window.confirm("Hapus item ini secara permanen?"))return;
  try{await window.projecthubWrite("delete",table,null,{id:b.dataset.contentDelete});await renderContentManager(tab);window.showToast("Item berhasil dihapus.")}
  catch(e){window.showToast(e.message||"Gagal menghapus item.")}
 })});
 body.querySelectorAll("[data-content-archive]").forEach(function(b){b.addEventListener("click",async function(){
  if(!window.confirm("Arsipkan item ini? Item tetap tersimpan dan bisa dipulihkan nanti."))return;
  try{await window.projecthubWrite("update",table,{is_archived:true},{id:b.dataset.contentArchive});await renderContentManager(tab);window.showToast("Item diarsipkan.")}
  catch(e){window.showToast(e.message||"Gagal mengarsipkan item.")}
 })});
 if(!docs)body.querySelectorAll("[data-content-pin]").forEach(function(b){b.addEventListener("click",async function(){
  var item=contentItems.find(function(x){return x.id===b.dataset.contentPin});if(!item)return;
  try{await window.projecthubWrite("update",table,{is_pinned:!item.is_pinned},{id:item.id});await renderContentManager(tab);window.showToast(item.is_pinned?"Pin dilepas.":"Catatan dipin.")}
  catch(e){window.showToast(e.message||"Gagal mengubah pin.")}
 })});
 form.addEventListener("submit",async function(e){
  e.preventDefault();var d=new FormData(form),title=String(d.get("title")||"").trim(),content=String(d.get("content")||"").trim(),error=form.querySelector(".content-editor-error");
  if(!title||!content){error.textContent="Judul dan isi wajib diisi.";return}
  var payload={title:title,content:content,folder:String(d.get("folder")||"").trim()||null};
  if(docs){
   var url=String(d.get("external_url")||"").trim();
   if(url&&!/^https?:\/\//i.test(url)){error.textContent="Tautan harus diawali http:// atau https://";return}
   payload.category=String(d.get("category")||"").trim()||null;payload.external_url=url||null;
   if(editingContentId){var current=contentItems.find(function(x){return x.id===editingContentId});payload.version=(Number(current&&current.version)||1)+1}
  }else payload.tags=String(d.get("tags")||"").split(",").map(function(x){return x.trim()}).filter(Boolean).slice(0,10);
  var submit=form.querySelector('[type="submit"]');submit.disabled=true;submit.textContent="Menyimpan…";error.textContent="";
  try{
   if(editingContentId)await window.projecthubWrite("update",table,payload,{id:editingContentId});
   else{payload.project_id=activeProject.id;await window.projecthubWrite("insert",table,payload)}
   await renderContentManager(tab);window.showToast(docs?"Dokumentasi tersimpan.":"Catatan tersimpan.");
  }catch(err){error.textContent=err.message||"Gagal menyimpan."}
  finally{submit.disabled=false;submit.textContent="Simpan"}
 });
}

function bindResourceForm(body){
 var form=$("#detailResourceForm",body),add=$("[data-add-resource]",body);
 add.addEventListener("click",function(){form.hidden=false;form.elements.name.focus()});
 $("[data-cancel-resource]",form).addEventListener("click",function(){form.reset();form.hidden=true});
 form.addEventListener("submit",async function(e){
  e.preventDefault();var d=new FormData(form),name=String(d.get("name")||"").trim(),url=String(d.get("url")||"").trim();
  if(url&&!/^https?:\/\//i.test(url)){ $("#detailResourceError").textContent="URL harus diawali http:// atau https://";return}
  var payload={project_id:activeProject.id,name:name,url:url||null,resource_type:d.get("resource_type")||"other",group_name:String(d.get("group_name")||"").trim()||null,description:String(d.get("description")||"").trim(),icon:"↗",sort_order:detailResources.length};
  var submit=form.querySelector('[type="submit"]');submit.disabled=true;submit.textContent="Menyimpan…";
  try{await window.projecthubWrite("insert","project_resources",payload);await renderDetailTab("resources");window.showToast("Resource berhasil ditambahkan.")}
  catch(err){$("#detailResourceError").textContent=err.message||"Gagal menyimpan resource."}
  finally{submit.disabled=false;submit.textContent="Simpan resource"}
 });
 body.querySelectorAll("[data-delete-resource]").forEach(function(btn){btn.addEventListener("click",async function(){if(!window.confirm("Hapus resource ini?"))return;try{await window.projecthubWrite("delete","project_resources",null,{id:btn.dataset.deleteResource});await renderDetailTab("resources");window.showToast("Resource dihapus.")}catch(e){window.showToast(e.message||"Gagal menghapus resource.")}})});
}

})();

/* Live dashboard and analytics */
var dashboardTasks=[],dashboardActivities=[];
function localISODate(date){var d=date||new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)}
function isTaskDone(t){var s=String(t.status||"").toLowerCase().replace(/[ _-]/g,"");return ["done","completed","complete"].includes(s)||!!t.completed_at}
function prettyDateTime(v){if(!v)return "Tanpa tanggal";var d=new Date(v);if(isNaN(d))return dateLabel(String(v).slice(0,10));return d.toLocaleString("id-ID",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"})}
function taskProjectName(t){var p=rows.find(function(x){return x.id===t.project_id});return p?p.name:"Tanpa project"}
function dashboardStat(labelText,value,sub,icon,tone){return '<article class="stat-card"><div class="stat-top"><span>'+labelText+'</span><span class="stat-icon '+tone+'">'+icon+'</span></div><div class="stat-value">'+value+'</div><div class="stat-foot"><span>'+sub+'</span></div></article>'}
function renderDashboardLive(){
 var stats=$(".stats-grid");if(!stats)return;
 var today=localISODate(),weekEnd=new Date();weekEnd.setDate(weekEnd.getDate()+7);var week=localISODate(weekEnd);
 var active=rows.filter(function(p){return label(statuses,p.status_id)!=="Completed"}).length;
 var done=dashboardTasks.filter(isTaskDone).length,openTasks=dashboardTasks.filter(function(t){return !isTaskDone(t)});
 var dueSoon=rows.filter(function(p){return p.deadline&&p.deadline>=today&&p.deadline<=week}).length+openTasks.filter(function(t){var d=String(t.due_at||"").slice(0,10);return d&&d>=today&&d<=week}).length;
 var avg=rows.length?Math.round(rows.reduce(function(n,p){return n+Math.max(0,Math.min(100,Number(p.progress)||0))},0)/rows.length):0;
 stats.innerHTML=dashboardStat("Total projects",rows.length,"Seluruh project aktif","◫","purple")+dashboardStat("In progress",active,"Project belum selesai","◷","blue")+dashboardStat("Tasks completed",done,done+" dari "+dashboardTasks.length+" tugas","✓","green")+dashboardStat("Upcoming deadlines",dueSoon,"Dalam 7 hari ke depan","◷","orange");
 var taskList=$(".task-list");
 if(taskList){
  var upcoming=openTasks.filter(function(t){return t.due_at}).sort(function(a,b){return new Date(a.due_at)-new Date(b.due_at)}).slice(0,5);
  taskList.innerHTML=upcoming.length?upcoming.map(function(t){var due=String(t.due_at).slice(0,10),overdue=due<today;return '<div class="task-row"><span class="task-check"></span><div class="task-info"><strong>'+esc(t.title||"Untitled task")+'</strong><small>'+esc(taskProjectName(t))+' <i>·</i> '+esc(dateLabel(due))+'</small></div><span class="priority '+esc(String(t.priority||"medium").toLowerCase())+'">'+esc(t.priority||"Medium")+(overdue?' · Terlambat':'')+'</span></div>'}).join(""):'<div class="dashboard-empty">Belum ada tugas mendatang.</div>';
 }
 var activity=$(".activity-list");
 if(activity){
  activity.innerHTML=dashboardActivities.length?dashboardActivities.slice(0,5).map(function(a){var p=rows.find(function(x){return x.id===a.project_id});var title=a.summary||a.description||a.action||"Aktivitas diperbarui";return '<div class="activity-item"><span class="activity-avatar violet">✳</span><div><strong>'+esc(p?p.name:(a.entity_type||"Workspace"))+'</strong><p>'+esc(title)+'</p><small>'+esc(prettyDateTime(a.created_at))+'</small></div></div>'}).join(""):'<div class="dashboard-empty">Belum ada aktivitas tercatat.</div>';
 }
 var progress=$(".dashboard-progress-average");if(progress)progress.textContent=avg+"%";
}
async function loadDashboardData(){
 try{
  var results=await Promise.all([readTable("tasks","select=id,title,status,priority,due_at,project_id,completed_at&order=due_at.asc"),readTable("activity_log","select=*&order=created_at.desc&limit=8")]);
  dashboardTasks=results[0]||[];dashboardActivities=results[1]||[];
  renderDashboardLive();
 }catch(e){console.warn("Dashboard data:",e);var a=$(".activity-list");if(a)a.innerHTML='<div class="dashboard-empty">Aktivitas belum dapat dimuat.</div>'}
}
function analyticsMarkup(){
 var total=rows.length,avg=total?Math.round(rows.reduce(function(n,p){return n+Math.max(0,Math.min(100,Number(p.progress)||0))},0)/total):0;
 var done=dashboardTasks.filter(isTaskDone).length,open=dashboardTasks.length-done,rate=dashboardTasks.length?Math.round(done/dashboardTasks.length*100):0;
 var statusCounts=statuses.map(function(s){return {name:s.name,count:rows.filter(function(p){return p.status_id===s.id}).length,color:s.color||"#64748b"}}).filter(function(x){return x.count>0});
 var maxStatus=Math.max(1,...statusCounts.map(function(x){return x.count}));
 var projectBars=rows.slice().sort(function(a,b){return (Number(b.progress)||0)-(Number(a.progress)||0)}).map(function(p){var n=Math.max(0,Math.min(100,Number(p.progress)||0));return '<div class="analytics-project-row"><div class="analytics-project-label"><strong>'+esc(p.name)+'</strong><span>'+n+'%</span></div><div class="progress-track"><span style="width:'+n+'%"></span></div><small>'+esc(label(categories,p.category_id))+' · '+esc(label(statuses,p.status_id))+'</small></div>'}).join("");
 var statusBars=statusCounts.map(function(x){return '<div class="analytics-status-row"><div><span><i style="background:'+esc(x.color)+'"></i>'+esc(x.name)+'</span><strong>'+x.count+'</strong></div><div class="analytics-status-track"><span style="width:'+(x.count/maxStatus*100)+'%;background:'+esc(x.color)+'"></span></div></div>'}).join("");
 return '<div class="analytics-live-metrics">'+
 '<article><span>Total projects</span><strong>'+total+'</strong><small>Project aktif di workspace</small></article>'+
 '<article><span>Average progress</span><strong>'+avg+'%</strong><small>Rata-rata progres semua project</small></article>'+
 '<article><span>Tasks completed</span><strong>'+done+' / '+dashboardTasks.length+'</strong><small>'+rate+'% tingkat penyelesaian</small></article>'+
 '<article><span>Open tasks</span><strong>'+open+'</strong><small>Tugas yang belum selesai</small></article></div>'+
 '<div class="analytics-live-grid"><section class="panel analytics-live-panel"><header><div><h3>Progress per project</h3><p>Diurutkan dari progres tertinggi</p></div></header>'+
 (projectBars||'<div class="dashboard-empty">Belum ada data project.</div>')+'</section>'+
 '<section class="panel analytics-live-panel"><header><div><h3>Status project</h3><p>Distribusi status saat ini</p></div></header>'+
 (statusBars||'<div class="dashboard-empty">Belum ada data status.</div>')+'</section></div>'+
 '<section class="panel analytics-live-panel analytics-task-summary"><header><div><h3>Ringkasan tugas</h3><p>Perbandingan tugas selesai dan belum selesai</p></div></header><div class="analytics-task-track"><span style="width:'+rate+'%"></span></div><div class="analytics-task-legend"><span><i class="done"></i>Selesai <strong>'+done+'</strong></span><span><i class="open"></i>Belum selesai <strong>'+open+'</strong></span></div></section>';
}
async function loadAnalyticsData(root){
 root.innerHTML='<div class="analytics-loading">Memuat ringkasan dari database…</div>';
 try{
  if(!dashboardTasks.length){var t=await readTable("tasks","select=id,title,status,priority,due_at,project_id,completed_at&order=due_at.asc");dashboardTasks=t||[]}
  root.innerHTML=analyticsMarkup();
 }catch(e){root.innerHTML='<div class="dashboard-empty">Analytics gagal dimuat: '+esc(e.message)+'</div>'}
}
function observeDashboardAnalytics(){
 var wrap=$(".content-wrap");if(!wrap)return;
 var refresh=function(){
  var title=$("#pageTitle"),name=title?title.textContent.trim():"";
  if(name.indexOf("Good afternoon")===0||name==="Overview"){
   var stats=$(".stats-grid");if(stats&&!stats.dataset.liveBound){stats.dataset.liveBound="1";loadDashboardData()}
  }
  if(name==="Analytics"){
   var old=$(".analytics-grid"),metrics=$(".page-metrics"),root=$("#projecthubAnalyticsRoot");
   if(old&&!root){root=document.createElement("div");root.id="projecthubAnalyticsRoot";old.replaceWith(root);if(metrics)metrics.remove();loadAnalyticsData(root)}
  }
 };
 new MutationObserver(refresh).observe(wrap,{childList:true,subtree:true,characterData:true});
 refresh();
 document.addEventListener("click",function(e){if(e.target.closest('.nav-item[data-page="overview"],[data-goto="overview"]'))setTimeout(function(){var s=$(".stats-grid");if(s){delete s.dataset.liveBound;loadDashboardData()}},120)});
}
observeDashboardAnalytics();
