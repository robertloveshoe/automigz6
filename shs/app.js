const CARS = window.AMZ.cars;

const LOCATIONS = window.AMZ.locations;
const DELIVERY_REGIONS = window.AMZ.deliveryRegions;
const AREA_INFO = {};
Object.values(DELIVERY_REGIONS).forEach(list => list.forEach(a => AREA_INFO[a.n] = a));
const peso = n => "\u20B1" + n.toLocaleString();

document.addEventListener("error", e => {
  const img = e.target;
  if (!img || img.tagName !== "IMG") return;
  if (img.matches(".logo-img, .hero-img")) return;
  if (/placeholder\.svg$/.test(img.src)) return;
  img.src = "images/placeholder.svg";
}, true);

let currentUser = window.AMZ.user;
const store = {
  get session(){ return currentUser ? currentUser.email : null; },
  get remembered(){ try { return JSON.parse(localStorage.getItem("amz_remembered")) || null; } catch(e){ return null; } },
  set remembered(v){ v ? localStorage.setItem("amz_remembered", JSON.stringify(v)) : localStorage.removeItem("amz_remembered"); },
};
const esc = v => String(v == null ? "" : v).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));

async function api(action, data){
  try {
    const opts = data === undefined
      ? { credentials:"same-origin" }
      : { method:"POST", credentials:"same-origin",
          headers:{ "Content-Type":"application/json", "X-CSRF-Token": window.AMZ.csrf },
          body: JSON.stringify(data) };
    const res = await fetch("api.php?action=" + action, opts);
    const json = await res.json().catch(() => ({ ok:false, error:"Unexpected server response." }));
    if (res.status === 401 && currentUser){
      currentUser = null; updateUserUI(); pendingAction = null;
      showPane("login"); location.hash = "#/auth";
    }
    return json;
  } catch(e){
    return { ok:false, error:"Cannot reach the server. Is PHP running?" };
  }
}

let currentType = "all";
let searchTerm  = "";
let selectedCar = null;
let chosenColor = null;
let detailsOpenId = null;
let discoverList = CARS.slice();
let discoverIdx = Math.max(0, discoverList.findIndex(c => /land\s*cruiser/i.test(c.name)));
let pendingAction = null;

const routes = ["home","browse","auth","rent","congrats","bookings","services","about","contact"];
function router(){
  let hash = location.hash.replace("#/","") || "home";
  if (!routes.includes(hash)) hash = "home";
  if (hash === "rent" && !selectedCar) hash = "browse";
  if (hash === "bookings" && !store.session){ pendingAction = null; showPane("login"); location.hash = "#/auth"; return; }
  showView(hash);
}
function showView(name){
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  const el = document.getElementById("view-" + name);
  if (el) el.classList.add("active");
  window.scrollTo(0,0);
  document.querySelectorAll(".nav-links a").forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#/" + name));
  if (name === "about"){ const s = document.getElementById("statCars"); if (s) s.textContent = CARS.length; }
  if (name === "browse") renderCars();
  if (name === "browse" || name === "home") refreshStock();
  if (name === "bookings") renderBookings();
}
window.addEventListener("hashchange", router);

function requireAuth(action, carId){
  if (store.session){ action(carId); return; }
  pendingAction = { action, carId };
  document.getElementById("gateMsg").classList.add("show");
  showPane("login");
  location.hash = "#/auth";
}
window.requireAuth = requireAuth;

function stockOf(car){ return car.stock || { total:10, left:10, next:null }; }
function fmtDay(d){ return new Date(d + "T00:00:00").toLocaleDateString("en-PH", { month:"short", day:"numeric", year:"numeric" }); }
function stockHtml(car){
  const s = stockOf(car);
  if (s.left < 1) return `<div class="stock out"><b>Out of stock</b> — wait for availability.${s.next ? `<span>Expected available: ${esc(fmtDay(s.next))}</span>` : ""}</div>`;
  return `<div class="stock ${s.left <= 3 ? "low" : "ok"}">${s.left <= 3 ? "Only " : ""}${s.left} of ${s.total} available</div>`;
}
async function refreshStock(){
  const r = await api("stock");
  if (!r.ok) return;
  r.stock.forEach(s => { const c = CARS.find(x => x.id === s.id); if (c) c.stock = { total:s.total, left:s.left, next:s.next }; });
  renderCars(); renderHomeCars();
  if (detailsOpenId) openDetails(detailsOpenId);
}
window.refreshStock = refreshStock;

function colorOf(car){ return carColor[car.id] || car.colors[0]; }
function carPhoto(car, color){
  if (color && color.img) return color.img;
  if (!carColor[car.id] || /placeholder/i.test(car.img)) return car.img;
  return recolorCache[car.id + "|" + color.n] || car.img;
}

function swatchesHtml(car, selected){
  return `<div class="color-row"><span>Color:</span>` + car.colors.map((c,i) =>
    `<div class="swatch${(selected && selected.n===c.n)?" selected":""}" style="background:${c.h}" title="${c.n}" onclick="pickColor(${car.id},${i},event)"></div>`
  ).join("") + `<span class="color-name">${selected ? selected.n : car.colors[0].n}</span></div>`;
}
const carColor = {};
function pickColor(carId, idx, ev){
  if (ev) ev.stopPropagation();
  carColor[carId] = CARS.find(c => c.id === carId).colors[idx];
  renderCars();
  renderHomeCars();
  if (detailsOpenId === carId) openDetails(carId);
  queueRecolor(carId);
}
window.pickColor = pickColor;

const recolorCache = {};
const recolorBusy = {};
function queueRecolor(carId){
  const car = CARS.find(c => c.id === carId), col = carColor[carId];
  if (!car || !col || col.img || /placeholder/i.test(car.img)) return;
  const key = carId + "|" + col.n;
  if (key in recolorCache || recolorBusy[key]) return;
  recolorBusy[key] = true;
  recolorImage(car.img, col.h).then(url => {
    delete recolorBusy[key];
    recolorCache[key] = url;
    if (url && carColor[carId] && carColor[carId].n === col.n){
      renderCars(); renderHomeCars();
      if (detailsOpenId === carId) openDetails(carId);
    }
  });
}
function rgb2hsl(r, g, b){
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, l = (mx + mn) / 2;
  let h = 0, s = 0;
  if (d){
    s = d / (1 - Math.abs(2 * l - 1));
    h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h *= 60; if (h < 0) h += 360;
  }
  return [h, s, l];
}
function hsl2rgb(h, s, l){
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}
function recolorImage(src, hex){
  return new Promise(resolve => {
    const im = new Image();
    im.onerror = () => resolve(null);
    im.onload = () => {
      try {
        const W = Math.min(640, im.naturalWidth), H = Math.round(im.naturalHeight * W / im.naturalWidth);
        const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
        const ctx = cv.getContext("2d"); ctx.drawImage(im, 0, 0, W, H);
        const frame = ctx.getImageData(0, 0, W, H), d = frame.data;
        if ([0, (W - 1) * 4, (H - 1) * W * 4, ((H - 1) * W + W - 1) * 4].every(i => d[i + 3] > 250)) return resolve(null);

        const bins = new Array(36).fill(0); let opaque = 0;
        for (let i = 0; i < d.length; i += 4){
          if (d[i + 3] < 200) continue; opaque++;
          const [h, s, l] = rgb2hsl(d[i], d[i + 1], d[i + 2]);
          if (s > .3 && l > .15 && l < .85) bins[Math.floor(h / 10) % 36]++;
        }
        let peak = 0, peakSum = 0;
        for (let b = 0; b < 36; b++){
          const sum = bins[(b + 35) % 36] + bins[b] + bins[(b + 1) % 36];
          if (sum > peakSum){ peakSum = sum; peak = b; }
        }
        const colored = peakSum > opaque * .04, H0 = peak * 10 + 5;
        const hueDist = (a, b) => { const x = Math.abs(a - b) % 360; return x > 180 ? 360 - x : x; };
        const isBody = (h, s, l) => colored ? (s > .25 && l > .08 && hueDist(h, H0) < 28) : (s < .18 && l > .22 && l < .98);

        let sumL = 0, n = 0;
        for (let i = 0; i < d.length; i += 4){
          if (d[i + 3] < 200) continue;
          const [h, s, l] = rgb2hsl(d[i], d[i + 1], d[i + 2]);
          if (isBody(h, s, l)){ sumL += l; n++; }
        }
        if (n < opaque * .02) return resolve(null);
        const avgL = sumL / n;

        const [th, ts, tl] = rgb2hsl(parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16));
        for (let i = 0; i < d.length; i += 4){
          if (d[i + 3] < 10) continue;
          const [h, s, l] = rgb2hsl(d[i], d[i + 1], d[i + 2]);
          if (!isBody(h, s, l)) continue;
          const nl = Math.min(.98, Math.max(.02, tl + (l - avgL) * 1.2));
          const [r, g, b] = hsl2rgb(th, ts, nl);
          d[i] = r; d[i + 1] = g; d[i + 2] = b;
        }
        ctx.putImageData(frame, 0, 0);
        resolve(cv.toDataURL("image/png"));
      } catch (e){ resolve(null); }
    };
    im.src = src;
  });
}

function carCardMarkup(c){
  return `
    <article class="car-card">
      <div class="car-photo"><img class="car-img" src="${carPhoto(c, colorOf(c))}" alt="${c.name}"></div>
      <div class="car-card-body">
        <div class="car-price">${peso(c.price)}<span> / day</span></div>
        <h3 class="car-name">${c.name}</h3>
        <div class="car-meta"><span>${c.type}</span><span>${c.trans}</span></div>
        ${stockHtml(c)}
        ${swatchesHtml(c, carColor[c.id])}
        <div class="car-actions">
          <button class="btn btn-light" onclick="openDetails(${c.id})">View details</button>
          ${stockOf(c).left < 1 ? `<button class="btn-rentnow" disabled>Out of stock</button>` : `<button class="btn-rentnow" onclick="requireAuth(startRent, ${c.id})">Rent now</button>`}
        </div>
      </div>
    </article>`;
}

function renderCars(){
  const grid = document.getElementById("carGrid");
  const list = CARS.filter(c => {
    const typeOk = currentType === "all" || c.type === currentType;
    const term = searchTerm.toLowerCase();
    return typeOk && (!term || c.name.toLowerCase().includes(term));
  });
  grid.innerHTML = list.length ? list.map(carCardMarkup).join("")
    : `<div class="no-results">No cars found. Try another search.</div>`;
}

function renderHomeCars(){
  const grid = document.getElementById("homeCarGrid");
  if (!grid) return;
  const featured = [CARS.find(c => c.id === 1), CARS.find(c => c.id === 2), CARS.find(c => c.id === 4)].filter(Boolean);
  grid.innerHTML = featured.map(carCardMarkup).join("");
}

function openDetails(id){
  const c = CARS.find(x => x.id === id);
  const sel = carColor[c.id] || c.colors[0];
  document.getElementById("detailsCard").innerHTML = `
    <button class="modal-close" onclick="closeDetails()">✕</button>
    <img class="car-img" src="${carPhoto(c, sel)}" alt="${c.name} in ${sel.n}">
    <div class="car-price">${peso(c.price)}/Day</div>
    <div class="car-name" style="font-size:17px">${c.name}</div>
    <div class="spec-list">
      <div><span>Type</span><span>${c.type}</span></div>
      <div><span>Transmission</span><span>${c.trans}</span></div>
      <div><span>Details</span><span>${c.info}</span></div>
    </div>
    ${stockHtml(c)}
    ${swatchesHtml(c, sel)}
    ${stockOf(c).left < 1 ? `<button class="btn btn-red btn-block" style="margin-top:6px" disabled>Out of stock</button>` : `<button class="btn btn-red btn-block" style="margin-top:6px" onclick="closeDetails();requireAuth(startRent, ${c.id})">Rent This Car</button>`}`;
  document.getElementById("detailsModal").classList.add("show");
  detailsOpenId = id;
}
function closeDetails(){ detailsOpenId = null; document.getElementById("detailsModal").classList.remove("show"); }
window.openDetails = openDetails;
window.closeDetails = closeDetails;
document.getElementById("detailsModal").addEventListener("click", e => {
  if (e.target.id === "detailsModal") closeDetails();
});

function startRent(id){
  selectedCar = CARS.find(x => x.id === id);
  const left = stockOf(selectedCar).left;
  if (left < 1){ toast(selectedCar.name + " is out of stock. Please wait for availability."); selectedCar = null; return; }
  chosenColor = carColor[id] || selectedCar.colors[0];
  const q = document.getElementById("rQty");
  q.max = Math.min(10, left);
  if ((parseInt(q.value) || 1) > left) q.value = left;
  renderRentInfo();
  const user = currentUser;
  if (user){
    document.getElementById("rName").value  = user.first + " " + user.last;
    document.getElementById("rEmail").value = user.email;
    document.getElementById("rPhone").value = user.mobile;
  }
  updateRentMini();
  location.hash = "#/rent";
}
window.startRent = startRent;

function renderRentInfo(){
  const car = selectedCar; if (!car) return;
  document.getElementById("rentCarInfo").innerHTML = `<span>${esc(car.name)} · ${esc(chosenColor.n)} — ${peso(car.price)}/Day</span>`;
}

(function initLocations(){
  const sel = document.getElementById("rLocation");
  sel.innerHTML = LOCATIONS.map(l => `<option>${l}</option>`).join("");
})();

(function initAreas(){
  const sel = document.getElementById("rArea");
  sel.innerHTML = `<option value="">Select province / area…</option>` + Object.entries(DELIVERY_REGIONS).map(([region, list]) =>
    `<optgroup label="${esc(region)}">` + list.map(a => `<option value="${esc(a.n)}">${esc(a.n)} — ${peso(a.fee)}</option>`).join("") + `</optgroup>`).join("");
  sel.addEventListener("change", updateRentMini);
})();

document.querySelectorAll('input[name="handover"]').forEach(r => r.addEventListener("change", () => {
  const mode = document.querySelector('input[name="handover"]:checked').value;
  const row = document.getElementById("addressRow");
  row.style.display = mode === "deliver" ? "grid" : "none";
  updateRentMini();
}));
document.getElementById("rLocation").addEventListener("change", updateRentMini);

function calcRent(){
  const pD = document.getElementById("rPickDate").value, rD = document.getElementById("rRetDate").value;
  const mode = document.querySelector('input[name="handover"]:checked').value;
  const qty  = Math.max(1, parseInt(document.getElementById("rQty").value) || 1);
  const days = (pD && rD) ? Math.max(1, Math.round((new Date(rD) - new Date(pD)) / 86400000)) : 0;
  const base = days * qty * (selectedCar ? selectedCar.price : 0);
  const area = document.getElementById("rArea").value;
  const info = AREA_INFO[area];
  const fee  = mode === "deliver" && info ? info.fee : 0;
  return { days, qty, base, fee, total: base + fee, mode, area, km: info ? info.km : 0 };
}
function updateRentMini(){
  if (!selectedCar) return;
  const c = calcRent();
  const box = document.getElementById("rentMini");
  box.classList.add("show");
  box.innerHTML = `
    <div class="line"><span>${selectedCar.name} (${chosenColor.n})</span><span>${peso(selectedCar.price)}/day × ${c.qty} vehicle(s) × ${c.days || "…"} day(s)</span></div>
    <div class="line"><span>${c.mode === "deliver" ? "🚚 Delivery fee" + (c.area ? " (" + esc(c.area) + ", ~" + c.km + " km)" : "") : "📍 Pick-up (free)"}</span><span>${c.mode === "deliver" ? (c.area ? peso(c.fee) : "Choose your area") : "FREE"}</span></div>
    <div class="line grand"><span>Estimated Total</span><span>${c.days ? peso(c.total) : "—"}</span></div>`;
}
["rPickDate","rRetDate"].forEach(id => document.getElementById(id).addEventListener("change", updateRentMini));
document.getElementById("rQty").addEventListener("input", updateRentMini);

document.getElementById("rentForm").addEventListener("submit", e => {
  e.preventDefault();
  const err = document.getElementById("rentError");
  const pD = document.getElementById("rPickDate").value, rD = document.getElementById("rRetDate").value;
  const mode = document.querySelector('input[name="handover"]:checked').value;
  const address = document.getElementById("rAddress").value.trim();
  if (!pD || !rD){ err.textContent = "Please fill in all fields."; return; }
  if (new Date(rD) < new Date(pD)){ err.textContent = "Return date must be after pick-up date."; return; }
  if (mode === "deliver" && !document.getElementById("rArea").value){ err.textContent = "Delivery is inside Luzon only. Please choose your province / area."; return; }
  if (mode === "deliver" && !address){ err.textContent = "Please enter your delivery address."; return; }
  const left = stockOf(selectedCar).left;
  if (calcRent().qty > left){ err.textContent = "Only " + left + " unit(s) of " + selectedCar.name + " left."; return; }
  err.textContent = "";
  openVerify();
});

function openVerify(){
  const c = calcRent();
  const loc = document.getElementById("rLocation").value;
  const address = document.getElementById("rAddress").value.trim();
  const name = document.getElementById("rName").value.trim();
  const where = esc(c.mode === "deliver" ? "🚚 Deliver to: " + address + ", " + c.area : "📍 Pick-up: " + loc);
  document.getElementById("verifyCard").innerHTML = `
    <button class="modal-close" onclick="closeVerify()">✕</button>
    <div class="verify-title">✅ Verify Your Booking</div>
    <div class="verify-sub">Please confirm your rental details before submitting.</div>
    <div class="verify-list">
      <div><span>Renter</span><span>${esc(name)}</span></div>
      <div><span>Vehicle</span><span>${esc(selectedCar.name)}</span></div>
      <div><span>Color</span><span>${chosenColor.n}</span></div>
      <div><span>Quantity</span><span>${c.qty} vehicle(s)</span></div>
      <div><span>Rental Period</span><span>${document.getElementById("rPickDate").value} → ${document.getElementById("rRetDate").value} (${c.days} day(s))</span></div>
      <div><span>Handover</span><span>${where}</span></div>
      <div><span>Rate</span><span>${peso(selectedCar.price)}/day × ${c.qty} × ${c.days}</span></div>
      <div><span>${c.mode === "deliver" ? "Delivery fee (~" + c.km + " km)" : "Pick-up fee"}</span><span>${c.mode === "deliver" ? peso(c.fee) : "FREE"}</span></div>
    </div>
    <div class="verify-total"><span>Total Payment</span><span>${peso(c.total)}</span></div>
    <div class="verify-actions">
      <button class="btn btn-dark" onclick="closeVerify()">Cancel</button>
      <button class="btn btn-red" onclick="confirmBooking()">✔ Confirm Booking</button>
    </div>`;
  document.getElementById("verifyModal").classList.add("show");
}
function closeVerify(){ document.getElementById("verifyModal").classList.remove("show"); }
window.closeVerify = closeVerify;

let bookingBusy = false;
async function confirmBooking(){
  if (bookingBusy) return;
  bookingBusy = true;
  const c = calcRent();
  const address = document.getElementById("rAddress").value.trim();
  const res = await api("book", {
    carId:    selectedCar.id,
    color:    chosenColor.n,
    qty:      c.qty,
    pickDate: document.getElementById("rPickDate").value,
    retDate:  document.getElementById("rRetDate").value,
    mode:     c.mode,
    location: document.getElementById("rLocation").value,
    address:  address,
    area:     c.area,
    name:     document.getElementById("rName").value.trim(),
    phone:    document.getElementById("rPhone").value.trim(),
  });
  bookingBusy = false;
  closeVerify();
  refreshStock();
  if (!res.ok){ document.getElementById("rentError").textContent = res.error || "Could not save your booking."; return; }
  document.getElementById("rentError").textContent = "";
  const b = res.booking;
  document.getElementById("congratsDetail").innerHTML =
    `${b.qty} × ${esc(b.car)} (${esc(b.color.n)}) · ${b.days} day(s) · ${b.mode === "deliver" ? "Delivered to " + esc(b.address) : "Pick-up: " + esc(b.location)} · Total: <b>${peso(b.total)}</b>`;
  location.hash = "#/congrats";
}
window.confirmBooking = confirmBooking;
document.getElementById("verifyModal").addEventListener("click", e => {
  if (e.target.id === "verifyModal") closeVerify();
});

const bookingKey = b => b.id;
let bookingsCache = [];

function normalizeBooking(b){
  const qty   = b.qty   || 1;
  const days  = b.days  || 1;
  const price = b.price || 0;
  const base  = (b.base != null) ? b.base : price * qty * days;
  const fee   = (b.fee  != null) ? b.fee  : 0;
  const total = (b.total != null) ? b.total : base + fee;
  return { qty, days, price, base, fee, total, color: b.color || { n:"—", h:"#bbbbbb" },
           cancelled: b.status === "cancelled" };
}

async function renderBookings(){
  const listEl = document.getElementById("bookingsList");
  listEl.innerHTML = `<div class="empty-msg">Loading your bookings…</div>`;
  try {
    const res = await api("bookings");
    if (!res.ok) throw new Error(res.error || "load failed");
    const mine = bookingsCache = res.bookings;
    const user = currentUser;
    if (!mine.length){
      listEl.innerHTML = `<div class="empty-msg">No bookings yet. <a href="#/browse">Rent your first car →</a></div>`;
      document.getElementById("summaryRows").innerHTML = "";
      document.getElementById("summaryTotal").innerHTML = "<span>Grand Total</span><span>" + peso(0) + "</span>";
      return;
    }
    const sorted = mine.slice().sort((a,b) => (b.date || "").localeCompare(a.date || ""));
    listEl.innerHTML = sorted.map(b => {
      const n = normalizeBooking(b);
      const renter = b.renter || (user ? user.first + " " + user.last : "—");
      const where = esc(b.mode === "deliver"
        ? "🚚 Deliver to: " + (b.address || "—")
        : "📍 Pick-up: " + (b.location || "Automigz Office — Cabanatuan City"));
      const booked = b.date ? new Date(b.date).toLocaleString() : "—";
      const key = Number(bookingKey(b));
      return `
      <div class="booking-item${n.cancelled ? " is-cancelled" : ""}">
        <div class="booking-head">
          <img src="${esc(b.img || "images/fortuner.png")}" alt="${esc(b.car)}">
          <div class="booking-info">
            <div class="b-name"><span class="color-dot" style="background:${esc(n.color.h)}"></span>${n.qty} × ${esc(b.car)}
              <span class="status-badge ${n.cancelled ? "status-cancelled" : "status-active"}">${n.cancelled ? "Cancelled" : "Active"}</span></div>
            <div class="b-meta">${b.pickDate || "—"} → ${b.retDate || "—"} · ${n.days} day(s)</div>
          </div>
        </div>
        <div class="booking-detail">
          <div class="line"><span>Renter</span><span>${esc(renter)}</span></div>
          <div class="line"><span>Vehicle</span><span>${esc(b.car)}</span></div>
          <div class="line"><span>Color</span><span>${esc(n.color.n)}</span></div>
          <div class="line"><span>Quantity</span><span>${n.qty} vehicle(s)</span></div>
          <div class="line"><span>Rental period</span><span>${b.pickDate || "—"} → ${b.retDate || "—"} (${n.days} day(s))</span></div>
          <div class="line"><span>Handover</span><span>${where}</span></div>
          <div class="line"><span>Rate</span><span>${peso(n.price)}/day × ${n.qty} × ${n.days} = ${peso(n.base)}</span></div>
          <div class="line"><span>${b.mode === "deliver" ? "Delivery fee" : "Pick-up fee"}</span><span>${n.fee ? peso(n.fee) : "FREE"}</span></div>
          <div class="line"><span>Booked on</span><span>${booked}</span></div>
        </div>
        <div class="booking-foot">
          <div class="booking-total">${peso(n.total)}</div>
          ${n.cancelled
            ? `<span class="cancelled-note">This booking was cancelled</span>`
            : `<button class="btn btn-cancel" onclick="askCancel(${key})">✕ Cancel Booking</button>`}
        </div>
      </div>`;
    }).join("");

    const active = mine.filter(b => b.status !== "cancelled");
    const cancelledCount = mine.length - active.length;
    const norm = active.map(normalizeBooking);
    const sumBase  = norm.reduce((s,n) => s + n.base, 0);
    const sumFee   = norm.reduce((s,n) => s + n.fee, 0);
    const sumAll   = norm.reduce((s,n) => s + n.total, 0);
    const daysAll  = norm.reduce((s,n) => s + n.days, 0);
    const unitsAll = norm.reduce((s,n) => s + n.qty, 0);
    document.getElementById("summaryRows").innerHTML = `
      <div class="line"><span>Active bookings</span><span>${active.length} booking(s) · ${unitsAll} vehicle(s) · ${daysAll} day(s)</span></div>
      <div class="line"><span>Rental costs</span><span>${peso(sumBase)}</span></div>
      <div class="line"><span>Delivery fees</span><span>${peso(sumFee)}</span></div>
      ${cancelledCount ? `<div class="line muted"><span>Cancelled (not charged)</span><span>${cancelledCount} booking(s)</span></div>` : ""}`;
    document.getElementById("summaryTotal").innerHTML = `<span>Grand Total Payment</span><span>${peso(sumAll)}</span>`;
  } catch(e){
    console.error(e);
    listEl.innerHTML = `<div class="empty-msg">Sorry, your saved bookings could not be loaded.</div>`;
  }
}

function askCancel(key){
  const b = bookingsCache.find(x => Number(bookingKey(x)) === Number(key));
  if (!b) return;
  const n = normalizeBooking(b);
  document.getElementById("verifyCard").innerHTML = `
    <button class="modal-close" onclick="closeVerify()">✕</button>
    <div class="verify-title">Cancel this booking?</div>
    <div class="verify-sub">This will cancel your reservation and remove it from your total payment.</div>
    <div class="verify-list">
      <div><span>Vehicle</span><span>${n.qty} × ${esc(b.car)} (${esc(n.color.n)})</span></div>
      <div><span>Rental period</span><span>${esc(b.pickDate || "—")} → ${esc(b.retDate || "—")}</span></div>
    </div>
    <div class="verify-total"><span>Amount</span><span>${peso(n.total)}</span></div>
    <div class="verify-actions">
      <button class="btn btn-dark" onclick="closeVerify()">Keep Booking</button>
      <button class="btn btn-red" onclick="confirmCancel(${Number(key)})">Yes, Cancel It</button>
    </div>`;
  document.getElementById("verifyModal").classList.add("show");
}
async function confirmCancel(key){
  const res = await api("cancel", { id: Number(key) });
  closeVerify();
  if (!res.ok){ toast(res.error || "Could not cancel the booking."); }
  else toast("Booking cancelled.");
  renderBookings();
  refreshStock();
}
window.askCancel = askCancel;
window.confirmCancel = confirmCancel;

const OUR_EMAIL = "automigz@gmail.com";
function copyEmail(e){
  e.preventDefault();
  const show = () => toast("📧 Our email: " + OUR_EMAIL + " (copied!)");
  if (navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(OUR_EMAIL).then(show).catch(show);
  } else show();
}
window.copyEmail = copyEmail;

function bindPhoneValidation(inputId, errId){
  const input = document.getElementById(inputId);
  const err = document.getElementById(errId);
  input.addEventListener("input", () => {
    const cleaned = input.value.replace(/[^0-9+\s-]/g, "");
    if (input.value !== cleaned){
      input.value = cleaned;
      err.textContent = "Invalid input: numbers only.";
    } else {
      err.textContent = "";
    }
  });
}
bindPhoneValidation("suMobile", "signupError");
bindPhoneValidation("rPhone", "rentError");

document.querySelectorAll(".tab").forEach(t => t.addEventListener("click", () => {
  document.querySelectorAll(".tab").forEach(x => x.classList.remove("active"));
  t.classList.add("active");
  currentType = t.dataset.type;
  renderCars();
}));
document.getElementById("searchBtn").addEventListener("click", () => {
  searchTerm = document.getElementById("searchInput").value.trim();
  renderCars();
});
document.getElementById("searchInput").addEventListener("input", e => {
  searchTerm = e.target.value.trim();
  renderCars();
});

function renderDiscover(){
  const car = discoverList[discoverIdx];
  if (!car) return;
  document.getElementById("discoverImg").src = car.landing || car.img;
  document.getElementById("discoverImg").alt = car.name;
  document.getElementById("discoverType").textContent = car.type;
  document.getElementById("discoverName").textContent = car.name;
  document.getElementById("discoverPrice").textContent = `${peso(car.price)} / day`;
}
document.getElementById("prevCar").addEventListener("click", () => {
  discoverIdx = (discoverIdx - 1 + discoverList.length) % discoverList.length; renderDiscover();
});
document.getElementById("nextCar").addEventListener("click", () => {
  discoverIdx = (discoverIdx + 1) % discoverList.length; renderDiscover();
});

function probeImage(src){
  return new Promise(res => { const i = new Image(); i.onload = () => res(true); i.onerror = () => res(false); i.src = src; });
}
async function initDiscover(){
  const ok = await Promise.all(CARS.map(c => { const s = c.landing || c.img; return /placeholder/i.test(s) ? false : probeImage(s); }));
  const withPhotos = CARS.filter((c, i) => ok[i]);
  if (!withPhotos.length) return;
  discoverList = withPhotos;
  const lc = discoverList.findIndex(c => /land\s*cruiser/i.test(c.name));
  discoverIdx = lc >= 0 ? lc : 0;
  renderDiscover();
}

function showPane(which){
  document.getElementById("loginPane").style.display  = which === "login" ? "block" : "none";
  document.getElementById("signupPane").style.display = which === "signup" ? "block" : "none";
  if (which === "login" && !pendingAction) document.getElementById("gateMsg").classList.remove("show");
}
document.querySelectorAll(".password-toggle").forEach(toggle => {
  const input = document.getElementById(toggle.dataset.passwordTarget);
  toggle.addEventListener("click", () => {
    const showPassword = input.type === "password";
    input.type = showPassword ? "text" : "password";
    toggle.textContent = showPassword ? "Hide" : "Show";
    toggle.setAttribute("aria-label", `${showPassword ? "Hide" : "Show"} password`);
    toggle.setAttribute("aria-pressed", String(showPassword));
  });
});
document.getElementById("toSignup").addEventListener("click", e => { e.preventDefault(); showPane("signup"); });
document.getElementById("toLogin").addEventListener("click",  e => { e.preventDefault(); showPane("login"); });

const signupPassword = document.getElementById("suPass");
const passwordRuleTests = {
  length: value => value.length >= 8,
  lowercase: value => /[a-z]/.test(value),
  uppercase: value => /[A-Z]/.test(value),
  numberOrSymbol: value => /[0-9]|[^A-Za-z0-9\s]/.test(value)
};
function updatePasswordRequirements(){
  document.querySelectorAll(".password-rule").forEach(rule => {
    const met = passwordRuleTests[rule.dataset.passwordRule](signupPassword.value);
    rule.classList.toggle("met", met);
    rule.querySelector(".password-rule-icon").textContent = met ? "✓" : "○";
  });
}
function passwordRequirementsMet(value){
  return Object.values(passwordRuleTests).every(test => test(value));
}
signupPassword.addEventListener("input", updatePasswordRequirements);
updatePasswordRequirements();

document.getElementById("signupForm").addEventListener("submit", async e => {
  e.preventDefault();
  const err = document.getElementById("signupError");
  const first  = document.getElementById("suFirst").value.trim();
  const last   = document.getElementById("suLast").value.trim();
  const mobile = document.getElementById("suMobile").value.trim();
  const email  = document.getElementById("suEmail").value.trim().toLowerCase();
  const pass   = document.getElementById("suPass").value;
  if (!first || !last || !mobile || !email || !pass){ err.textContent = "Please fill in all required fields."; return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ err.textContent = "Please enter a valid email address."; return; }
  if (!passwordRequirementsMet(pass)){ err.textContent = "Please meet all password requirements shown above."; return; }
  const res = await api("signup", { first, last, mobile, email, pass });
  if (!res.ok){ err.textContent = res.error || "Could not create account."; return; }
  err.textContent = "";
  document.getElementById("signupForm").reset();
  toast("Account created! Please log in.");
  showPane("login");
});

(function initRemembered(){
  const r = store.remembered;
  if (r && r.email){
    document.getElementById("loginEmail").value = r.email;
    document.getElementById("rememberMe").checked = true;
  }
})();

document.getElementById("loginForm").addEventListener("submit", async e => {
  e.preventDefault();
  const err = document.getElementById("loginError");
  const id   = document.getElementById("loginEmail").value.trim();
  const pass = document.getElementById("loginPass").value;
  const remember = document.getElementById("rememberMe").checked;
  const res = await api("login", { id, pass, remember });
  if (!res.ok){ err.textContent = res.error || "Invalid email/username or password."; return; }
  err.textContent = "";
  currentUser = res.user;
  store.remembered = remember ? { email: res.user.email } : null;
  document.getElementById("loginPass").value = "";
  if (res.user.admin){ location.href = "admin.php"; return; }
  updateUserUI();
  document.getElementById("gateMsg").classList.remove("show");
  toast("Welcome back, " + res.user.first + "!");
  const p = pendingAction; pendingAction = null;
  if (p) p.action(p.carId);
  else location.hash = "#/browse";
});

document.getElementById("forgotUser").addEventListener("click", e => { e.preventDefault(); toast("Use the email you signed up with to log in."); });
document.getElementById("forgotPass").addEventListener("click", e => { e.preventDefault(); toast("Contact automigz@gmail.com to reset your password."); });

async function logout(){
  await api("logout", {});
  currentUser = null;
  pendingAction = null;
  updateUserUI();
  toast("Logged out. See you soon!");
  location.hash = "#/home";
}
document.getElementById("logoutLink").addEventListener("click", e => { e.preventDefault(); logout(); });
document.getElementById("sideLogout").addEventListener("click",  e => { e.preventDefault(); logout(); closeSidebar(); });

const USER_ICON = '<svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true"><circle cx="12" cy="12" r="10.2" fill="none" stroke="currentColor" stroke-width="1.9"/><circle cx="12" cy="9.6" r="3.3" fill="currentColor"/><path d="M5.7 18.6c.9-3.1 3.4-4.5 6.3-4.5s5.4 1.4 6.3 4.5c-1.6 1.6-3.8 2.6-6.3 2.6s-4.7-1-6.3-2.6z" fill="currentColor"/></svg>';
function updateUserUI(){
  const adminLink = document.getElementById("adminLink");
  if (adminLink) adminLink.style.display = (currentUser && currentUser.admin) ? "block" : "none";
  const btn = document.getElementById("userBtn");
  if (store.session){
    const user = currentUser;
    btn.innerHTML = `<span class="avatar-letter">${esc((user ? user.first[0] : "U").toUpperCase())}</span>`;
  } else btn.innerHTML = USER_ICON;
}
const userDropdown = document.getElementById("userDropdown");
document.getElementById("userBtn").addEventListener("click", e => {
  e.stopPropagation();
  if (!store.session){ pendingAction = null; showPane("login"); location.hash = "#/auth"; return; }
  userDropdown.classList.toggle("show");
});
document.addEventListener("click", () => userDropdown.classList.remove("show"));

document.querySelectorAll("[data-goto]").forEach(a => a.addEventListener("click", e => {
  e.preventDefault();
  closeSidebar();
  if (!store.session){ pendingAction = null; showPane("login"); location.hash = "#/auth"; return; }
  location.hash = "#/" + a.dataset.goto;
}));

const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("sidebarOverlay");
function closeSidebar(){ sidebar.classList.remove("show"); overlay.classList.remove("show"); }
document.getElementById("menuBtn").addEventListener("click", () => {
  sidebar.classList.add("show"); overlay.classList.add("show");
});
document.getElementById("sideClose").addEventListener("click", closeSidebar);
overlay.addEventListener("click", closeSidebar);
sidebar.querySelectorAll("a").forEach(a => a.addEventListener("click", closeSidebar));

function scrollToContact(){
  location.hash = "#/home";
  setTimeout(() => {
    const el = document.getElementById("homeContact");
    if (el) el.scrollIntoView({ behavior:"smooth" });
  }, 100);
}
window.scrollToContact = scrollToContact;

let toastTimer;
function toast(msg){
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2800);
}

function renderHomeProof(){
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set("proofCars", CARS.length);
  set("proofPoints", LOCATIONS.length);
  set("proofPointsLabel", LOCATIONS.length === 1 ? "pick-up point" : "convenient pick-up points");
  if (CARS.length) set("proofFrom", peso(Math.min(...CARS.map(c => c.price))));
}

updateUserUI();
renderHomeProof();
renderDiscover();
initDiscover();
renderHomeCars();
router();
