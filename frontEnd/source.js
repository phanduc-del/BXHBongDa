const p1 = document.getElementById("p1");
const p2 = document.getElementById("p2");

const API_URL = "http://localhost:5001/api";
// const API_URL = "https://bxhbongda.onrender.com";

let navigating = false;
let awardHistory =
 JSON.parse(localStorage.getItem("FCM_AWARDS")) || [];
let seasons = JSON.parse(localStorage.getItem("FCM_SEASONS")) || [];
let current = +localStorage.getItem("FCM_CURRENT") || 0;


async function loadSeasonsFromDB(){
 try{
  const res = await fetch(`${API_URL}/seasons`);
  const data = await res.json();

  if(data.length){
   seasons = data;
   current = 0;
  }else{
   newSeason(true);
  }

  renderAll();
 }catch(err){
  console.log("Không load được DB → dùng local", err);
  renderAll();
 }
}

loadSeasonsFromDB();

    function toggleTheme(){
 document.body.classList.toggle("light");
 localStorage.setItem("theme",
  document.body.classList.contains("light")?"light":"dark");
}

// auto load theme
if(localStorage.getItem("theme")==="light"){
 document.body.classList.add("light");
}
const clubThemeColors = {
 "Phan Đức": ["#22c55e", "#ffffff", "#14532d"],
 "Lâm Hùng": ["#3b82f6", "#ffffff", "#1e3a8a"],
 "Khánh Huy": ["#facc15", "#ffffff", "#92400e"],
 "Trung Kiên": ["#ef4444", "#ffffff", "#7f1d1d"]
};

const clubColors = {
 "Phan Đức":"#22c55e",
 "Lâm Hùng":"#3b82f6",
 "Khánh Huy":"#facc15",
 "Trung Kiên":"#ef4444"
};

const avatars={
 "Phan Đức":"md-a57ff7df167245d9bdeba8d2f997815f99.jpg",
 "Lâm Hùng":"il_1588xN.4238041533_k8li.jpg",
 "Khánh Huy":"Real-Madrid-Logo-3.png",
 "Trung Kiên":"OIP.webp"
};

async function newSeason(init=false){
 const season = {
  name:"Season "+(seasons.length+1),
  players:Object.keys(avatars).map(n=>({
   name:n,
   manual:{ w:0,d:0,l:0,gf:0,ga:0 },
   auto:{ mp:0,w:0,d:0,l:0,gf:0,ga:0 },
   mp:0,w:0,d:0,l:0,
   gf:0,ga:0,pts:0
  })),
  matches:[]
 };

 seasons.push(season);
 current = seasons.length - 1;

 recalcSeason(season);
 await save();

 if(!init) renderAll();
}
function getTotalGoalsAllSeasons() {
  const totalGoals = {};

  seasons.forEach(season => {
    season.players.forEach(player => {
      if (!totalGoals[player.name]) {
        totalGoals[player.name] = 0;
      }
      totalGoals[player.name] += player.gf;
    });
  });

  return Object.keys(totalGoals).map(name => ({
    name,
    gf: totalGoals[name]
  }));
}


if(seasons.length===0) newSeason(true);
 
function renderAll(){
 renderSeasonSelect();
 loadProfilePlayerSelect();
 render();
}

function renderSeasonSelect(){
 seasonSelect.innerHTML=seasons.map((s,i)=>
  `<option value="${i}">${s.name}</option>`).join("");
 seasonSelect.value=current;
}

seasonSelect.onchange=()=>{
 current=+seasonSelect.value;
 save();render();
};

function render(){
 const s=seasons[current];

 players.innerHTML=s.players.map(p=>`
 <div class="club" onclick="showClubProfile('${p.name}')">
  <img src="${avatars[p.name]}">
  <div>${p.name}</div>
 </div>`).join("");

 [p1,p2].forEach(sel=>{
  sel.innerHTML=s.players.map(p=>`<option>${p.name}</option>`).join("");
 });

//  [allH2H1,allH2H2].forEach(sel=>{
//   sel.innerHTML=seasons[0].players.map(p=>`<option>${p.name}</option>`).join("");
//  });
table.innerHTML=[...s.players]
.sort((a,b)=>b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga))
.map((p,i)=>{
 let cls="";
 if(i<4) cls="top4";
 if(i>=s.players.length-2) cls="relegation";

return `
<tr class="${cls}">
 <td class="rank">${i+1}</td>

 <td>
  <div class="club">
   <img src="${avatars[p.name]}">
   ${p.name}
  </div>
 </td>

 <td>${p.mp}</td>

 <td contenteditable
    onfocus="if(this.innerText.trim()==='0') this.innerText=''"
    onkeydown="cellEnter(event)"
    onblur="editStat('${p.name}','w',this.innerText)">
 ${p.w}
</td>


 <td contenteditable
    onfocus="if(this.innerText.trim()==='0') this.innerText=''"
     onkeydown="cellEnter(event)"
     onblur="editStat('${p.name}','d',this.innerText)">
  ${p.d}
 </td>

 <td contenteditable
 onfocus="if(this.innerText.trim()==='0') this.innerText=''"
     onkeydown="cellEnter(event)"
     onblur="editStat('${p.name}','l',this.innerText)">
  ${p.l}
 </td>

 <td contenteditable
 onfocus="if(this.innerText.trim()==='0') this.innerText=''"
 onkeydown="cellEnter(event)"
 onblur="editStat('${p.name}','gf',this.innerText)">
 ${p.gf}
</td>
 <td contenteditable
 onfocus="if(this.innerText.trim()==='0') this.innerText=''"
 onkeydown="cellEnter(event)"
 onblur="editStat('${p.name}','ga',this.innerText)">
 ${p.ga}
</td>
 <td>${p.gf - p.ga}</td>
 <td class="points">${p.pts}</td>
</tr>

`;


}).join("");

 renderChart(getTotalGoalsAllSeasons());
  afterRender();
}

function addMatch(){
 const s=seasons[current];
 const a=s.players.find(p=>p.name===p1.value);
 const b=s.players.find(p=>p.name===p2.value);
 const gA=+g1.value;
 const gB=+g2.value;
 if(isNaN(gA) || isNaN(gB)) return alert("Nhập bàn thắng hợp lệ");
 if(a===b) return alert("Không thể đá với chính mình");

 s.matches.push({
  a:a.name,b:b.name,
  ga:gA,gb:gB
 });

 recalcSeason(s);
 save();render();
}


let chart;
function renderChart(players){
 if(chart) chart.destroy();

 chart = new Chart(goalChart,{
  type:"bar",
  data:{
   labels: players.map(p => p.name),
   datasets:[{
     label: "Tổng bàn thắng (tất cả mùa)",
     data: players.map(p => p.gf)
   }]
  }
 });
}

/* ===== ADD: FORM CHART BY SEASON ===== */

let formChart;

// load danh sách người chơi
function loadFormPlayerSelect(){
 const sel=document.getElementById("formPlayerSelect");
 sel.innerHTML=Object.keys(avatars)
  .map(n=>`<option value="${n}">${n}</option>`)
  .join("");
}

// vẽ biểu đồ phong độ
function showFormChart(){
 const name=document.getElementById("formPlayerSelect").value;

 const labels=[];
 const points=[];

 seasons.forEach(s=>{
  const p=s.players.find(x=>x.name===name);
  if(p){
   labels.push(s.name);
   points.push(p.pts);
  }
 });

 if(formChart) formChart.destroy();

 formChart=new Chart(document.getElementById("formChart"),{
  type:"line",
  data:{
   labels,
   datasets:[{
    label:`Phong độ ${name}`,
    data:points,
    tension:0.3,
    fill:true,
    borderWidth:3,
    pointRadius:5
   }]
  },
  options:{
   plugins:{
    legend:{display:true},
    tooltip:{enabled:true}
   },
   scales:{
    y:{
     beginAtZero:true,
     ticks:{stepSize:1}
    }
   }
  }
 });
}

// hook render an toàn

function afterRender(){
 loadFormPlayerSelect();
 loadPlayerHistorySelect();
 loadProfilePlayerSelect();
 calcGlobalTitles();
}


/* ===== ADD: PLAYER SEASON HISTORY ===== */

// đổ danh sách người chơi
function loadPlayerHistorySelect(){
 const sel=document.getElementById("playerHistorySelect");
 sel.innerHTML=Object.keys(avatars)
  .map(n=>`<option value="${n}">${n}</option>`)
  .join("");
}

// hiển thị thống kê từng mùa
function showPlayerSeasonHistory(){
 const name=document.getElementById("playerHistorySelect").value;
 let html="";

 seasons.forEach(s=>{
  const p=s.players.find(x=>x.name===name);
  if(!p) return;

  const sorted=[...s.players]
   .sort((a,b)=>b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga));
  const rank=sorted.findIndex(x=>x.name===name)+1;

  html+=`
  <div class="season-item" onclick="this.classList.toggle('active')">
   <div class="season-head">
    <span>🏆 ${s.name}</span>
    <span>#${rank} | ${p.pts}đ</span>
   </div>

   <div class="season-detail">
    Trận: ${p.mp} |
    Thắng: ${p.w} |
    Hòa: ${p.d} |
    Thua: ${p.l}<br>
    ⚽ BT: ${p.gf} |
    🧤 BB: ${p.ga} |
    HS: ${p.gf-p.ga}
   </div>
  </div>
  `;
 });

 document.getElementById("playerSeasonHistory").innerHTML=
  html || "Chưa có dữ liệu";
}

// tự load khi render

function calcH2H(matches,A,B,el,king){
 let s={m:0,Aw:0,Bw:0,d:0,Ag:0,Bg:0};
 matches.forEach(m=>{
  if((m.a===A&&m.b===B)||(m.a===B&&m.b===A)){
   s.m++;
   let ga=m.a===A?m.ga:m.gb;
   let gb=m.a===A?m.gb:m.ga;
   s.Ag+=ga;s.Bg+=gb;
   if(ga>gb)s.Aw++;
   else if(gb>ga)s.Bw++;
   else s.d++;
  }
 });
 let crown=king
 ?(s.Aw>s.Bw?`👑 ${A}`:s.Bw>s.Aw?`👑 ${B}`:"🤝 Cân bằng")
 :"";
 el.innerHTML=`
 <b>${A} vs ${B}</b><br>
 Trận: ${s.m}<br>
 Thắng: ${A} ${s.Aw} – ${B} ${s.Bw}<br>
 Hòa: ${s.d}<br>
 Bàn: ${s.Ag} – ${s.Bg}<br>
 <span style="color:var(--gold)">${crown}</span>
 `;
}

function showH2H(){
 calcH2H(seasons[current].matches,h2h1.value,h2h2.value,h2hResult,false);
}

function showAllTimeH2H(){
 let all=[];
 seasons.forEach(s=>all.push(...s.matches));
 calcH2H(all,allH2H1.value,allH2H2.value,allH2HResult,true);
}

function showAllTimeSummary(){
 let stats={};
 seasons.forEach(s=>s.matches.forEach(m=>{
  let k=[m.a,m.b].sort().join(" vs ");
  if(!stats[k]) stats[k]={A:m.a,B:m.b,m:0,Aw:0,Bw:0,d:0,Ag:0,Bg:0};
  let x=stats[k];
  x.m++;x.Ag+=m.ga;x.Bg+=m.gb;
  if(m.ga>m.gb)x.Aw++;
  else if(m.ga<m.gb)x.Bw++;
  else x.d++;
 }));
 allH2HResult.innerHTML=
 Object.values(stats).map(s=>{
  let k=s.Aw>s.Bw?`👑 ${s.A}`:s.Bw>s.Aw?`👑 ${s.B}`:"🤝";
  return`
  <div style="border-bottom:1px solid var(--line);padding:10px 0">
   <b>${s.A} vs ${s.B}</b><br>
   Trận: ${s.m} | Bàn: ${s.Ag}-${s.Bg}<br>
   ${k}
  </div>`;
 }).join("")||"Chưa có dữ liệu";
}

function showPlayer(name){
 const p=seasons[current].players.find(x=>x.name===name);
 modalName.innerText=name;
 modalStats.innerHTML=`
 Số trận: ${p.mp}<br>
 Thắng: ${p.w}<br>
 Hòa: ${p.d}<br>
 Thua: ${p.l}<br>
 Bàn thắng: ${p.gf}<br>
 Bàn thua: ${p.ga}
 `;
 playerModal.style.display="flex";
}

function deleteSeason(){
 if(!confirm("Xóa mùa này?"))return;
 seasons.splice(current,1);
 if(current>=seasons.length) current=seasons.length-1;
 if(seasons.length===0){newSeason(true);current=0;}
 seasons.forEach((s,i)=>s.name="Season "+(i+1));
 save();renderAll();
}

/* ===== ADD: EXPORT PDF ===== */
function exportTablePDF(){
 const { jsPDF } = window.jspdf;
 const doc=new jsPDF();
 doc.text("FC Mobile Pro League - BẢNG XẾP HẠNG",14,16);
 let y=28;
 [...document.querySelectorAll("#table tr")].forEach(r=>{
  doc.text(r.innerText.replace(/\t/g," | "),14,y);
  y+=7;
 });
 doc.save("BXH_FC_Mobile.pdf");
}

/* ===== ADD: GLOBAL TITLES ===== */
function calcGlobalTitles(){
 let stats={};
 seasons.forEach(s=>{
  let sorted=[...s.players]
   .sort((a,b)=>b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga));
  sorted.forEach((p,i)=>{
   if(!stats[p.name])
    stats[p.name]={cup:0,s2:0,s3:0,last:0,gf:0,ga:0};
   stats[p.name].gf+=p.gf;
   stats[p.name].ga+=p.ga;
   if(i===0)stats[p.name].cup++;
   if(i===1)stats[p.name].s2++;
   if(i===2)stats[p.name].s3++;
   if(i===sorted.length-1)stats[p.name].last++;
  });
 });
 let arr=Object.entries(stats);
 if(arr.length===0)return;
 const max=k=>arr.sort((a,b)=>b[1][k]-a[1][k])[0];
 let cupList = arr
 .map(([name,v])=>`- ${name}: ${v.cup} 🏆`)
 .join("<br>");
 globalTitles.innerHTML=`
 👑 Vua phá lưới: ${arr.sort((a,b)=>b[1].gf-a[1].gf)[0][0]}<br>
 🏆 Top danh hiệu: ${max("cup")[0]} (${max("cup")[1].cup})<br>
 🥈 Vua về nhì: ${max("s2")[0]}<br>
 🥉 Vua về ba: ${max("s3")[0]}<br>
 💀 Vua bét bảng: ${max("last")[0]}<br>
 🧤 Thủng lưới ít nhất: ${arr.sort((a,b)=>a[1].ga-b[1].ga)[0][0]}<br>
 🕳️ Thủng lưới nhiều nhất: ${arr.sort((a,b)=>b[1].ga-a[1].ga)[0][0]}
 <hr style="border:1px dashed var(--line);margin:8px 0">
 <b>📊 Số lần vô địch toàn giải:</b><br>
 ${cupList}
`;

}
function getAllTimeStats(name){
 let total={
  mp:0,w:0,d:0,l:0,
  gf:0,ga:0,pts:0
 };

 seasons.forEach(s=>{
  const p=s.players.find(x=>x.name===name);
  if(!p) return;

  total.mp+=p.mp;
  total.w+=p.w;
  total.d+=p.d;
  total.l+=p.l;
  total.gf+=p.gf;
  total.ga+=p.ga;
  total.pts+=p.pts;
 });

 let coef = total.mp
  ? ((total.gf-total.ga)*0.4 + (total.pts/total.mp)*2)
  : 0;

 return {
  ...total,
  gd: total.gf-total.ga,
  coef: coef.toFixed(2)
 };
}

/* ===== ADD: AUTO HOOK ===== */

function exportPDF(){
 html2canvas(tableCard).then(c=>{
  const pdf=new jspdf.jsPDF();
  pdf.addImage(
   c.toDataURL("image/png"),
   "PNG",
   10,10,
   190,
   (c.height*190)/c.width
  );
  pdf.save("bang-xep-hang.pdf");
 });
}

function showClubProfile(name){
 let total={
  seasons:0,cup:0,second:0,last:0,
  gf:0,ga:0,pts:0
 };

 seasons.forEach(s=>{
  const p=s.players.find(x=>x.name===name);
  if(!p) return;

  total.seasons++;
  total.gf+=p.gf;
  total.ga+=p.ga;
  total.pts+=p.pts;

  const sorted=[...s.players]
   .sort((a,b)=>b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga));
  const rank=sorted.findIndex(x=>x.name===name);

  if(rank===0) total.cup++;
  if(rank===1) total.second++;
  if(rank===sorted.length-1) total.last++;
 });

 clubName.innerHTML=`
 <img src="${avatars[name]}" style="width:36px;border-radius:50%;vertical-align:middle">
 ${name}
 
 `;

const st = getAllTimeStats(name);

clubInfo.innerHTML=`
 <b>📊 Thành tích toàn giải</b><br>
 🏆 Vô địch: ${total.cup}<br>
 🥈 Về nhì: ${total.second}<br>
 💀 Bét bảng: ${total.last}<br>

 <hr style="border:1px solid var(--line)">

 ⚽ Tổng bàn thắng: ${st.gf}<br>
 🧤 Tổng bàn thua: ${st.ga}<br>
 📊 Hiệu số: ${st.gd}<br>
 🎯 Tổng điểm: ${st.pts}<br>
 📅 Số mùa tham gia: ${total.seasons}<br>

 <hr style="border:1px dashed var(--line)">

 ⭐ <b>HỆ SỐ TOÀN GIẢI:</b>
 <span style="
  font-size:18px;
  font-weight:900;
  color:#22c55e
 ">
  ${st.coef}
 </span>
`;
let title =
 st.coef>=3 ? "🔥 Huyền thoại" :
 st.coef>=2 ? "⭐ Trụ cột" :
 "📈 Tiềm năng";

clubInfo.innerHTML += `
 <div style="
  margin-top:10px;
  font-weight:700;
  color:var(--gold)
 ">
  ${title}
 </div>
`;


 clubModal.style.display="flex";
}
const logoModal = document.getElementById("logoModal");
const logoModalImg = document.getElementById("logoModalImg");

const zoomModal = document.getElementById("zoomModal");
const zoomImg   = document.getElementById("zoomImg");

function openZoom(src){
 zoomImg.src = src;
 zoomModal.style.display = "flex";
}

zoomModal.onclick = e=>{
 if(e.target === zoomModal)
  zoomModal.style.display = "none";
};

document.addEventListener("keydown",e=>{
 if(e.key==="Escape")
  zoomModal.style.display="none";
});
async function save(){
 localStorage.setItem("FCM_SEASONS", JSON.stringify(seasons));
 localStorage.setItem("FCM_CURRENT", current);

 const season = seasons[current];

 try {
  if(season._id){
   // ✅ UPDATE
   await fetch(`${API_URL}/seasons/${seasons[current]._id}`, {
   method: "PUT",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify(seasons[current])
});

  } else {
   // ✅ CREATE
   const res = await fetch(`${API_URL}/seasons`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(season)
   });

   const saved = await res.json();
   seasons[current]._id = saved._id;
  }
 } catch (err) {
  console.error("❌ Lỗi lưu DB:", err);
 }
}


function editStat(playerName, key, value){
 const s = seasons[current];
 const p = s.players.find(x => x.name === playerName);
 if(!p) return;

 let v = Math.max(0, Number(value));
 if(!Number.isFinite(v)) v = 0;

 if(key === "gf" || key === "ga"){
 p.manual[key] = v;
}else{
 p.manual[key] = v;
}
recalcPlayer(p);

 save();
 if(!navigating) render();
 // ✅ BẮT BUỘC
}





function recalcSeason(s){
 s.players.forEach(p=>{
  p.auto={mp:0,w:0,d:0,l:0,gf:0,ga:0};
 });

 s.matches.forEach(m=>{
  const A=s.players.find(p=>p.name===m.a);
  const B=s.players.find(p=>p.name===m.b);

  A.auto.mp++; B.auto.mp++;
  A.auto.gf+=m.ga; A.auto.ga+=m.gb;
  B.auto.gf+=m.gb; B.auto.ga+=m.ga;

  if(m.ga>m.gb){A.auto.w++;B.auto.l++}
  else if(m.ga<m.gb){B.auto.w++;A.auto.l++}
  else{A.auto.d++;B.auto.d++}
 });

 s.players.forEach(p=>recalcPlayer(p));
}

function recalcPlayer(p){
 const mw = Number(p.manual.w)||0;
 const md = Number(p.manual.d)||0;
 const ml = Number(p.manual.l)||0;

 p.w = mw + p.auto.w;
 p.d = md + p.auto.d;
 p.l = ml + p.auto.l;

 p.mp = p.w + p.d + p.l;

 // quy ước: mỗi thắng manual = 1 bàn
const manualGF = Number(p.manual.gf)||0;
const manualGA = Number(p.manual.ga)||0;
 p.gf = manualGF + p.auto.gf;
 p.ga = manualGA + p.auto.ga;

 p.pts = p.w * 3 + p.d;
}


function cellEnter(e){
 navigating = true;

 const td = e.target;
 const tr = td.parentElement;
 const cells = [...tr.querySelectorAll("[contenteditable]")];
 const colIndex = cells.indexOf(td);

 // TAB → qua ô
 if(e.key === "Tab"){
  e.preventDefault();
  td.blur();

  setTimeout(()=>{
   let nextCol = e.shiftKey ? colIndex - 1 : colIndex + 1;
   if(cells[nextCol]) cells[nextCol].focus();
   navigating = false;
  },0);
 }

 // ENTER → tính NGAY
 if(e.key === "Enter"){
  e.preventDefault();
  navigating = false; // ✅ mở render TRƯỚC
  td.blur();          // ✅ gọi editStat → recalc → render
 }
}
renderAll();
function getChampionCount(name){
 let count = 0;

 seasons.forEach(s=>{
  const sorted=[...s.players]
   .sort((a,b)=>b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga));
  if(sorted[0].name === name) count++;
 });

 return count;
}

function endSeason(){
 const s = seasons[current];

 const sorted=[...s.players]
  .sort((a,b)=>b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga));

 const champ = sorted[0];
 const name  = champ.name;

 championLogo.src = avatars[name];
 championName.innerText = `🏆 ${name} vô địch ${s.name}`;
 const cups = getChampionCount(name);

championTitle.innerText =
 cups >= 2
 ? "👑 CHÚC MỪNG NHÀ VÔ ĐỊCH FC MOBILE VN"
 : "🏆 FCM CHAMPIONS";


 endSeasonOverlay.style.display="flex";

 startFireworks(name);

 // ⛔ KHÔNG play nhạc ở đây
}

function closeEndSeason(){
 endSeasonOverlay.style.display="none";
 stopFireworks();
 stopChampionMusic();
}

let fwCtx, fwAnim;

let confettiPieces = [];
function loadProfilePlayerSelect(){
 const sel = document.getElementById("profilePlayerSelect");
 sel.innerHTML = Object.keys(avatars)
  .map(n => `<option value="${n}">${n}</option>`)
  .join("");
}

function openPlayerProfile(){
 const name = document.getElementById("profilePlayerSelect").value;
 showClubProfile(name);
}

function startFireworks(champName){
 const canvas = document.getElementById("fireworks");
 canvas.width = innerWidth;
 canvas.height = innerHeight;
 fwCtx = canvas.getContext("2d");

 const colors =
  clubThemeColors[champName] ||
  ["#facc15","#ffffff","#ca8a04"];

 confettiPieces = [];

 for(let i=0;i<260;i++){
  const isText = i % 6 === 0;
  confettiPieces.push({
   x: Math.random()*canvas.width,
   y: Math.random()*-canvas.height,
   w: isText ? 90 : Math.random()*8+4,
   h: isText ? 22 : Math.random()*12+6,
   speed: Math.random()*2+1,
   rotate: Math.random()*360,
   rotateSpeed: Math.random()*3-1.5,
   color: colors[Math.floor(Math.random()*colors.length)],
   text: isText
  });
 }

 function fall(){
  fwCtx.clearRect(0,0,canvas.width,canvas.height);

  let beat = 0;
  if(analyser){
   analyser.getByteFrequencyData(dataArray);
   beat = dataArray.reduce((a,b)=>a+b,0) / dataArray.length;
  }


  confettiPieces.forEach(p=>{
   fwCtx.save();
   fwCtx.translate(p.x,p.y);
   fwCtx.rotate(p.rotate*Math.PI/180);
   fwCtx.fillStyle = p.color;

   if(p.text){
    fwCtx.font = "bold 18px Inter, Arial";
    fwCtx.textAlign="center";
    fwCtx.fillText("CHAMPION",0,6);
   }else{
    fwCtx.fillRect(-p.w/2,-p.h/2,p.w,p.h);
   }

   fwCtx.restore();

   // 🎶 ĐỒNG BỘ NHẠC
   p.y += p.speed + beat/60;
   p.rotate += p.rotateSpeed + beat/120;

   if(p.y > canvas.height + 40){
    p.y = -30;
    p.x = Math.random()*canvas.width;
   }
  });

  fwAnim = requestAnimationFrame(fall);
 }
 fall();
}

function stopChampionMusic(){
 document.getElementById("championMusic").pause();
}

function stopFireworks(){
 cancelAnimationFrame(fwAnim);
 fwCtx.clearRect(0,0,fireworks.width,fireworks.height);
}

let audioCtx, analyser, dataArray;

function playChampionMusic(){
 const music = document.getElementById("championMusic");
 music.currentTime = 0;
 music.volume = 0.9;
 music.play().catch(()=>{});
}




const endSeasonOverlay = document.getElementById("endSeasonOverlay");
const championLogo  = document.getElementById("championLogo");
const championName  = document.getElementById("championName");
const championTitle = document.getElementById("championTitle");

 function startCeremony(){
 playChampionMusic();
 startFireworks();
 window.addEventListener("DOMContentLoaded", () => {
 loadProfilePlayerSelect();
});

}
