import { store, savePerkaraToStorage } from '../state/store.js';
import { escText } from '../utils/formatters.js';
import { showToast, showToastConfirm } from './ui.js';

export async function initUserAccounts(): Promise<void> {
  try {
    const res = await fetch('/api/auth/users');
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        store.userAccounts = json.data;
        localStorage.setItem('userAccounts', JSON.stringify(store.userAccounts));
      }
    }
  } catch (err) {
    // offline fallback
  }
  store.userAccounts = JSON.parse(localStorage.getItem('userAccounts') || '[]');
  
  let hasAdminSimple = store.userAccounts.some(u => u.email.toLowerCase() === "admin");
  if (!hasAdminSimple) {
    store.userAccounts.push({
      nama: "Admin System",
      email: "admin",
      pass: "admin",
      role: "Admin"
    });
    localStorage.setItem('userAccounts', JSON.stringify(store.userAccounts));
  }
}

export function checkLoginSession() {
  let session = JSON.parse(localStorage.getItem('currentUserSession') || 'null');
  
  if (!session) {
    let overlay = document.getElementById('authOverlay');
    if (overlay) overlay.style.display = 'flex';
    return;
  }

  store.currentUser = session;
  let overlay = document.getElementById('authOverlay');
  if (overlay) overlay.style.display = 'none';
  applyUserProfile();
}

export function switchAuthTab(tab) {
  let btnLogin = document.getElementById('authTabLoginBtn');
  let btnReg = document.getElementById('authTabRegisterBtn');

  if (tab === 'login') {
    if(btnLogin) btnLogin.classList.add('active');
    if(btnReg) btnReg.classList.remove('active');
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
  } else {
    if(btnLogin) btnLogin.classList.remove('active');
    if(btnReg) btnReg.classList.add('active');
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
  }
}

export async function handleLoginSubmit(e: any): Promise<void> {
  e.preventDefault();
  const emailInput = document.getElementById('login_email') as HTMLInputElement;
  const passInput = document.getElementById('login_password') as HTMLInputElement;
  const email = emailInput ? emailInput.value.trim() : '';
  const pass = passInput ? passInput.value.trim() : '';

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, pass })
    });
    const json = await res.json();
    if (res.ok && json.success && json.user) {
      store.currentUser = json.user;
      localStorage.setItem('currentUserSession', JSON.stringify(json.user));
      const overlay = document.getElementById('authOverlay');
      if (overlay) overlay.style.display = 'none';
      applyUserProfile();
      if ((window as any).renderPerkaraTable) (window as any).renderPerkaraTable();
      if ((window as any).updateDashboardStats) (window as any).updateDashboardStats();
      showToast("LOGIN BERHASIL", "Selamat datang, " + json.user.nama + " (" + json.user.role + ")", "success");
      return;
    }
  } catch (err) {
    console.warn('[Auth] Server offline, mencoba login lokal:', err);
  }

  const user = store.userAccounts.find(u => u.email.toLowerCase() === email.toLowerCase() && u.pass.toLowerCase() === pass.toLowerCase());

  if (user) {
    store.currentUser = user;
    localStorage.setItem('currentUserSession', JSON.stringify(user));
    const overlay = document.getElementById('authOverlay');
    if (overlay) overlay.style.display = 'none';
    applyUserProfile();
    if ((window as any).renderPerkaraTable) (window as any).renderPerkaraTable();
    if ((window as any).updateDashboardStats) (window as any).updateDashboardStats();
    showToast("LOGIN BERHASIL", "Selamat datang, " + user.nama + " (" + user.role + ")", "success");
  } else {
    showToast("LOGIN GAGAL", "Email/Username atau kata sandi tidak cocok!", "danger");
  }
}

export function handleRegisterSubmit(e) {
  e.preventDefault();
  let nama = document.getElementById('reg_nama').value.trim();
  let email = document.getElementById('reg_email').value.trim().toLowerCase();
  let role = document.getElementById('reg_role').value;
  let pass = document.getElementById('reg_password').value.trim().toLowerCase();

  if (store.userAccounts.some(u => u.email.toLowerCase() === email)) {
    showToast("REGISTRASI GAGAL", "Email/Username sudah terdaftar!", "warning");
    return;
  }

  let newUser = { nama, email, pass, role };
  store.userAccounts.push(newUser);
  localStorage.setItem('userAccounts', JSON.stringify(store.userAccounts));

  showToast("REGISTRASI BERHASIL", "Silakan login menggunakan akun baru Anda.", "success");
  switchAuthTab('login');
  document.getElementById('login_email').value = email;
  document.getElementById('login_password').value = '';
}

export function applyUserProfile() {
  if (!store.currentUser) return;

  document.getElementById('dropdownUserName').textContent = store.currentUser.nama;
  document.getElementById('dropdownUserEmail').textContent = store.currentUser.email;
  document.getElementById('dropdownUserRole').textContent = store.currentUser.role;
  document.getElementById('sidebarAvatarText').textContent = store.currentUser.nama.charAt(0).toUpperCase();

  document.getElementById('setting_userName').value = store.currentUser.nama;
  document.getElementById('setting_userEmail').value = store.currentUser.email;
  document.getElementById('setting_userRole').value = store.currentUser.role;

  document.getElementById('statRoleDisplay').textContent = store.currentUser.role;

  let btnAddNew = document.getElementById('btnAddNewPerkara');
  if (btnAddNew) {
    if (store.currentUser.role === 'Penyidik / Ketua Tim Peneliti') {
      btnAddNew.style.display = 'none';
    } else {
      btnAddNew.style.display = 'inline-flex';
    }
  }

  let tabNavUsers = document.getElementById('tabNavUsers');
  if (tabNavUsers) {
    if (store.currentUser.role === 'Admin') {
      tabNavUsers.style.display = 'flex';
      renderRegisteredUsersTable();
    } else {
      tabNavUsers.style.display = 'none';
    }
  }

  populateDisposisiUserDropdown();

  if (typeof window.checkDisposisiAccessByRole === 'function') {
    window.checkDisposisiAccessByRole();
  }
  if (typeof window.renderDisposisiTable === 'function') {
    window.renderDisposisiTable();
  }
}

export function renderRegisteredUsersTable() {
  let tbody = document.getElementById('registeredUsersTableBody');
  if(!tbody) return;

  tbody.innerHTML = store.userAccounts.map((u, i) => {
    let isPasswordShown = (store.visiblePasswordIndex === i);
    let passDisplay = isPasswordShown ? `<span class="password-preview-box">${escText(u.pass)}</span>` : `••••••••`;
    let eyeIcon = isPasswordShown ? `<i class="fi fi-rr-eye-crossed"></i>` : `<i class="fi fi-rr-eye"></i>`;

    return `
      <tr>
        <td><b>${i + 1}</b></td>
        <td><b>${escText(u.nama)}</b></td>
        <td>${escText(u.email)}</td>
        <td>
          <div style="display:flex; align-items:center; gap:6px;">
            ${passDisplay}
            <button type="button" class="btn secondary" style="padding:2px 6px; font-size:10px;" onclick="togglePasswordPreview(${i})">${eyeIcon}</button>
          </div>
        </td>
        <td><span class="role-badge-pill">${escText(u.role)}</span></td>
        <td style="text-align:center;">
          <div style="display:flex; gap:4px; justify-content:center;">
            <button type="button" class="btn danger" style="padding:2px 6px; font-size:10px;" onclick="deleteUserAccount(${i})">
              <i class="fi fi-rr-trash"></i> Hapus
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

export function togglePasswordPreview(index) {
  store.visiblePasswordIndex = (store.visiblePasswordIndex === index) ? -1 : index;
  renderRegisteredUsersTable();
}

export function deleteUserAccount(index) {
  let user = store.userAccounts[index];
  if (!user) return;

  if (store.currentUser && store.currentUser.email.toLowerCase() === user.email.toLowerCase()) {
    showToast("TIDAK DAPAT MENGHAPUS", "Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif!", "warning");
    return;
  }

  showToastConfirm(
    "KONFIRMASI HAPUS AKUN",
    `Apakah Anda yakin ingin menghapus akun user "${user.nama}" (${user.email})?`,
    () => {
      store.userAccounts.splice(index, 1);
      localStorage.setItem('userAccounts', JSON.stringify(store.userAccounts));
      renderRegisteredUsersTable();
      populateDisposisiUserDropdown();
      showToast("AKUN TERHAPUS", "Akun pengguna telah berhasil dihapus dari sistem.", "danger");
    }
  );
}

export function populateDisposisiUserDropdown() {
  let select = document.getElementById('val_disposisi_user');
  if (!select) return;

  let penyidikList = store.userAccounts.filter(u => u.role === 'Penyidik / Ketua Tim Peneliti');
  select.innerHTML = `<option value="-">- Pilih Penyidik -</option>` + penyidikList.map(u => `<option value="${escText(u.nama)}">${escText(u.nama)}</option>`).join('');
}

export function toggleDropdown(event) {
  event.stopPropagation();
  let menu = document.getElementById('userDropdownMenu');
  if(menu) menu.classList.toggle('show');
}

export function toggleUserDropdown(event) {
  event.stopPropagation();
  let menu = document.getElementById('userDropdownMenu');
  if(menu) menu.classList.toggle('show');
}

export function openProfileSettingTab() {
  let menu = document.getElementById('userDropdownMenu');
  if(menu) menu.classList.remove('show');

  const navButtons = document.querySelectorAll('.nav-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  navButtons.forEach(btn => btn.classList.remove('active'));
  tabPanes.forEach(tab => tab.classList.remove('active'));

  let setBtn = document.querySelector('.nav-btn[data-target="pengaturan"]');
  if(setBtn) setBtn.classList.add('active');
  let setTab = document.getElementById('pengaturan');
  if(setTab) setTab.classList.add('active');
}

export function handleLogout() {
  let menu = document.getElementById('userDropdownMenu');
  if(menu) menu.classList.remove('show');
  
  showToastConfirm("KONFIRMASI LOGOUT", "Apakah Anda yakin ingin keluar dari aplikasi AP3?", () => {
    localStorage.removeItem('currentUserSession');
    store.currentUser = null;
    showToast("LOGOUT BERHASIL", "Anda telah keluar dari aplikasi.", "info");
    setTimeout(() => {
      document.getElementById('authOverlay').style.display = 'flex';
    }, 500);
  });
}
