const adminLoginForm = document.getElementById('adminLoginForm');
const adminLoginPanel = document.getElementById('adminLoginPanel');
const adminDashboard = document.getElementById('adminDashboard');
const adminLoginMessage = document.getElementById('loginMessage');

adminLoginForm.addEventListener('submit', event => {
  event.preventDefault();
  adminLoginMessage.textContent = '';
  adminLoginMessage.classList.remove('admin-error');

  const password = String(new FormData(adminLoginForm).get('password'));
  if (password !== 'Digitaldream') {
    adminLoginMessage.textContent = 'Code incorrect.';
    adminLoginMessage.classList.add('admin-error');
    return;
  }

  adminLoginForm.reset();
  adminLoginPanel.hidden = true;
  adminDashboard.hidden = false;
  document.getElementById('dashboardMessage').textContent = 'Code accepté. Chargement de Firebase…';
  document.dispatchEvent(new Event('admin:authorized'));
});