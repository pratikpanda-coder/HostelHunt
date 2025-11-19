// Hostel Hunt - script.js
// Handles LocalStorage 'database', forms, and UI interactions across pages

// LocalStorage keys
const LS_USERS = 'hh_users';
const LS_HOSTELS = 'hh_hostels';
const LS_BOOKINGS = 'hh_bookings';
const LS_CURRENT = 'hh_current_user';
const LS_SELECTED_HOSTEL = 'hh_selected_hostel';

// Utility helpers
function getData(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch (e) {
    return [];
  }
}
function setData(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}
function saveUserSession(user) {
  localStorage.setItem(LS_CURRENT, JSON.stringify(user));
}
function getUserSession() {
  try { return JSON.parse(localStorage.getItem(LS_CURRENT)); } catch(e){ return null; }
}

// Seed initial data if not present
function seedInitialData() {
  const users = getData(LS_USERS);
  const hostels = getData(LS_HOSTELS);
  if (users.length === 0) {
    users.push({ id: Date.now()+1, name: 'Alice', email: 'alice@example.com', password: 'pass123', role: 'user' });
    users.push({ id: Date.now()+2, name: 'Owner One', email: 'owner@example.com', password: 'owner123', role: 'owner' });
    users.push({ id: Date.now()+3, name: 'Admin', email: 'admin@example.com', password: 'admin123', role: 'admin' });
    setData(LS_USERS, users);
  }
  if (hostels.length === 0) {
    hostels.push({ id: 'h1', name: 'Sunrise Hostel', location: 'Bhubaneswar', price: 3000, type: 'Single/Double', ownerEmail: 'owner@example.com', description: 'Clean rooms, fast wifi' });
    hostels.push({ id: 'h2', name: 'Campus Stay', location: 'Cuttack', price: 2500, type: 'Single', ownerEmail: 'owner@example.com', description: 'Near colleges, affordable' });
    setData(LS_HOSTELS, hostels);
  }
  // bookings start empty
  if (!localStorage.getItem(LS_BOOKINGS)) setData(LS_BOOKINGS, []);
}

// ========== SIGNUP & LOGIN ===========
function signupUser(){
  const name = document.getElementById('signupName')?.value?.trim();
  const email = document.getElementById('signupEmail')?.value?.trim().toLowerCase();
  const password = document.getElementById('signupPassword')?.value;
  const role = document.getElementById('signupRole')?.value?.trim().toLowerCase() || 'user';

  if (!name || !email || !password) { alert('Please fill all fields'); return; }

  const users = getData(LS_USERS);
  if (users.find(u => u.email === email)) { alert('Email already registered'); return; }

  const newUser = { id: Date.now(), name, email, password, role };
  users.push(newUser);
  setData(LS_USERS, users);
  saveUserSession({ name, email, role });
  alert('Account created — logged in as ' + email);
  window.open('index.html', '_blank');
}

function loginUser(){
  const email = document.getElementById('loginEmail')?.value?.trim().toLowerCase();
  const password = document.getElementById('loginPassword')?.value;
  if (!email || !password) { alert('Enter email and password'); return; }

  const users = getData(LS_USERS);
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) { alert('Invalid login'); return; }
  saveUserSession({ name: user.name, email: user.email, role: user.role });
  alert('Welcome back, ' + user.name);
  // redirect based on role
  if (user.role === 'owner') window.open('owner.html', '_blank');
  else if (user.role === 'admin') window.open('admin.html', '_blank');
  else window.open('index.html', '_blank');
}

function logout(){
  localStorage.removeItem(LS_CURRENT);
  alert('Logged out');
  window.open('index.html', '_blank');
}

// ========== SEARCH & RENDER HOSTELS ===========
function searchHostels(){
  const location = document.getElementById('locationInput')?.value?.trim().toLowerCase() || '';
  const maxPrice = Number(document.getElementById('maxPriceInput')?.value || 0);
  const resultsDiv = document.getElementById('results');
  if (!resultsDiv) return;

  const hostels = getData(LS_HOSTELS);
  let filtered = hostels.filter(h => h.name || h.location);
  if (location) filtered = filtered.filter(h => (h.location||'').toLowerCase().includes(location) || (h.name||'').toLowerCase().includes(location));
  if (maxPrice > 0) filtered = filtered.filter(h => Number(h.price) <= maxPrice);

  resultsDiv.innerHTML = '';
  if (filtered.length === 0) { resultsDiv.innerHTML = '<p class="no-results">No hostels found</p>'; return; }

  filtered.forEach(h => {
    const card = document.createElement('div');
    card.className = 'hostel-card fade-in';
    card.innerHTML = `
      <h3>${h.name}</h3>
      <p><strong>Location:</strong> ${h.location}</p>
      <p><strong>Price:</strong> ₹${h.price} / month</p>
      <p><strong>Type:</strong> ${h.type}</p>
      <p>${h.description || ''}</p>
      <div class="card-actions">
        <button class="btn" onclick="selectHostelAndBook('${h.id}')">Book Now</button>
        <button class="btn" onclick="openOwner('${h.ownerEmail}')">View Owner</button>
      </div>
    `;
    resultsDiv.appendChild(card);
  });
}

function selectHostelAndBook(hostelId){
  const hostels = getData(LS_HOSTELS);
  const hostel = hostels.find(h => h.id === hostelId);
  if (!hostel) { alert('Hostel not found'); return; }
  localStorage.setItem(LS_SELECTED_HOSTEL, JSON.stringify(hostel));
  // open booking page in new tab
  window.open('booking.html', '_blank');
}

function openOwner(email){
  alert('Owner email: ' + email + '\nYou can contact them or login as owner.');
}

// Render all hostels on index load
function renderAllHostelsOnIndex(){
  const resultsDiv = document.getElementById('results');
  if (!resultsDiv) return;
  const hostels = getData(LS_HOSTELS);
  resultsDiv.innerHTML = '';
  hostels.forEach(h => {
    const card = document.createElement('div');
    card.className = 'hostel-card fade-in';
    card.innerHTML = `
      <h3>${h.name}</h3>
      <p><strong>Location:</strong> ${h.location}</p>
      <p><strong>Price:</strong> ₹${h.price} / month</p>
      <p>${h.description || ''}</p>
      <div class="card-actions">
        <button class="btn" onclick="selectHostelAndBook('${h.id}')">Book Now</button>
      </div>
    `;
    resultsDiv.appendChild(card);
  });
}

// ========== OWNER FUNCTIONS ===========
function addHostel(){
  const name = document.getElementById('hostelName')?.value?.trim();
  const location = document.getElementById('hostelLocation')?.value?.trim();
  const rooms = Number(document.getElementById('hostelRooms')?.value || 0);
  const type = document.getElementById('hostelType')?.value?.trim();
  const desc = document.getElementById('hostelDesc')?.value?.trim();

  if (!name || !location) { alert('Please enter name and location'); return; }

  const current = getUserSession();
  const ownerEmail = current?.email || 'owner@example.com';

  const hostels = getData(LS_HOSTELS);
  const id = 'h' + Date.now();
  const newHostel = { id, name, location, price: rooms>0? Math.round(2000 + rooms*50): 2500, type, ownerEmail, description: desc };
  hostels.push(newHostel);
  setData(LS_HOSTELS, hostels);
  alert('Hostel added');
  // refresh owner table if present
  renderOwnerHostels();
}

function renderOwnerHostels(){
  const table = document.getElementById('ownerHostelTable');
  if (!table) return;
  const tbody = table.querySelector('tbody');
  tbody.innerHTML = '';
  const current = getUserSession();
  const hostels = getData(LS_HOSTELS);
  const my = current ? hostels.filter(h=>h.ownerEmail===current.email) : hostels;
  my.forEach(h => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${h.name}</td><td>${h.location}</td><td>${h.price}</td><td>${h.type}</td><td>${h.description}</td>`;
    tbody.appendChild(tr);
  });
}

// ========== BOOKING ===========
function bookRoom(){
  const name = document.getElementById('bookName')?.value?.trim();
  const email = document.getElementById('bookEmail')?.value?.trim();
  const hostelNameInput = document.getElementById('bookHostel')?.value?.trim();
  const roomType = document.getElementById('bookRoomType')?.value?.trim();
  const from = document.getElementById('bookDateFrom')?.value;
  const to = document.getElementById('bookDateTo')?.value;

  // preferred: if user arrived from search, prefill hostel
  const selected = JSON.parse(localStorage.getItem(LS_SELECTED_HOSTEL) || 'null');
  const hostelName = selected?.name || hostelNameInput;
  if (!name || !email || !hostelName) { alert('Please fill required fields'); return; }

  const bookings = getData(LS_BOOKINGS);
  const id = 'b' + Date.now();
  const booking = { id, userName: name, userEmail: email, hostelName, roomType, from, to, created: new Date().toISOString() };
  bookings.push(booking);
  setData(LS_BOOKINGS, bookings);

  // clear selected hostel
  localStorage.removeItem(LS_SELECTED_HOSTEL);

  const msgDiv = document.getElementById('bookingMessage');
  if (msgDiv) msgDiv.textContent = 'Booking confirmed! ID: ' + id;
  alert('Booking confirmed! ID: ' + id);
}

// ========== ADMIN TABLES ===========
function renderAdminTables(){
  const userTable = document.getElementById('userTable');
  const hostelTable = document.getElementById('hostelTable');
  if (!userTable || !hostelTable) return;

  const users = getData(LS_USERS);
  const hostels = getData(LS_HOSTELS);

  const ubody = userTable.querySelector('tbody');
  ubody.innerHTML = '';
  users.forEach(u => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${u.name}</td><td>${u.email}</td><td><button class='delete-btn' onclick="deleteUser('${u.email}')">Delete</button></td>`;
    ubody.appendChild(tr);
  });

  const hbody = hostelTable.querySelector('tbody');
  hbody.innerHTML = '';
  hostels.forEach(h => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${h.name}</td><td>${h.location}</td><td>₹${h.price}</td><td><button class='delete-btn' onclick="deleteHostel('${h.id}')">Delete</button></td>`;
    hbody.appendChild(tr);
  });
}

function deleteUser(email){
  if (!confirm('Delete user ' + email + '?')) return;
  let users = getData(LS_USERS);
  users = users.filter(u => u.email !== email);
  setData(LS_USERS, users);
  renderAdminTables();
}
function deleteHostel(id){
  if (!confirm('Delete hostel?')) return;
  let hostels = getData(LS_HOSTELS);
  hostels = hostels.filter(h => h.id !== id);
  setData(LS_HOSTELS, hostels);
  renderAdminTables();
}

// ========== Page Init ==========
function initPage(){
  seedInitialData();
  // render depending on page
  renderAllHostelsOnIndex();
  renderOwnerHostels();
  renderAdminTables();

  // if booking page, prefill selected hostel
  const selected = JSON.parse(localStorage.getItem(LS_SELECTED_HOSTEL) || 'null');
  if (selected && document.getElementById('bookingHostelName')) {
    document.getElementById('bookingHostelName').textContent = selected.name;
    document.getElementById('bookHostel') && (document.getElementById('bookHostel').value = selected.name);
  }
}

// run init on DOM ready
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initPage);
else initPage();

// expose functions to window for inline handlers
window.signupUser = signupUser;
window.loginUser = loginUser;
window.searchHostels = searchHostels;
window.selectHostelAndBook = selectHostelAndBook;
window.addHostel = addHostel;
window.renderOwnerHostels = renderOwnerHostels;
window.bookRoom = bookRoom;
window.renderAdminTables = renderAdminTables;
window.deleteUser = deleteUser;
window.deleteHostel = deleteHostel;
window.logout = logout;