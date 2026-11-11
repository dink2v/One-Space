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
 rows=result[0];categories=result[1];statuses=result[2];priorities=result[3];renderLiveProjects();
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
 n.innerHTML='<section class="project-detail-shell" role="dialog" aria-modal="true" aria-labelledby="projectDetailTitle"><header class="project-detail-head"><div><div class="eyebrow">PROJECT WORKSPACE</div><h2 id="projectDetailTitle">Project detail</h2><p id="projectDetailDescription"></p></div><button type="button" class="project-detail-close" aria-label="Tutup">×</button></header><nav class="project-detail-tabs" aria-label="Project sections"><button class="selected" data-detail-tab="overview">Overview</button><button data-detail-tab="resources">Resources</button><button data-detail-tab="documents">Documentation</button><button data-detail-tab="notes">Notes</button><button data-detail-tab="tasks">Tasks</button><button data-detail-tab="timeline">Timeline</button><button data-detail-tab="attachments">Attachments</button></nav><div class="project-detail-body" id="projectDetailBody"></div></section>';
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
 var copy={documents:["Documentation","Dokumentasi internal, tautan dokumen, dan riwayat versi."],notes:["Notes","Catatan, ide, dan informasi penting project."],tasks:["Tasks","Daftar pekerjaan, checklist, dan progres pelaksanaan."],timeline:["Timeline","Riwayat perubahan dan aktivitas project."],attachments:["Attachments","File dan lampiran yang berkaitan dengan project."]}[tab];
 body.innerHTML='<div class="detail-coming-soon"><span>✳</span><h3>'+copy[0]+'</h3><p>'+copy[1]+'</p><small>Bagian ini akan dihubungkan ke database pada tahap berikutnya.</small></div>';
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