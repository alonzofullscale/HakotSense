const STORAGE_KEY = 'skilltrail-mvp-v1';

const seed = {
  progress: 68,
  hours: 26.5,
  weekHours: 4.5,
  streak: 8,
  validations: 7,
  activities: [
    { icon: '↗', title: 'Completed “Images & containers”', meta: 'Docker · 45 min · Today' },
    { icon: '✓', title: 'Priya validated your Git fundamentals', meta: 'Peer validation · Yesterday' },
    { icon: '+', title: 'Logged a CI workflow practice', meta: 'GitHub Actions · 1h 15m · Oct 10' }
  ],
  reviews: [
    { id: 1, name: 'Maya Chen', initials: 'MC', skill: 'Docker · Working level', context: 'Built and explained a multi-stage container setup for the Atlas API.', time: 'Due today', color: 'blue' },
    { id: 2, name: 'Jon Bell', initials: 'JB', skill: 'GitHub Actions · Foundation', context: 'Created CI checks for tests, linting, and pull requests.', time: 'Due in 2 days', color: 'coral' }
  ],
  sentReviews: [
    { name: 'Sam Rivera', skill: 'Docker · Working level', status: 'Awaiting response' },
    { name: 'Nia Okafor', skill: 'CI/CD · Foundation', status: 'In review' }
  ]
};

let state = loadState();
let reviewFilter = 'received';

function loadState() {
  try { return { ...structuredClone(seed), ...JSON.parse(localStorage.getItem(STORAGE_KEY)) }; }
  catch { return structuredClone(seed); }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  renderAll();
}

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

function setProgress(selector, value) {
  const element = $(selector);
  if (element) element.style.width = `${value}%`;
}

function renderMetrics() {
  $('#hours-stat').textContent = state.hours.toFixed(1);
  $('#week-hours').textContent = state.weekHours.toFixed(1);
  $('#streak-stat').innerHTML = `${state.streak} <small>days</small>`;
  $('#validation-stat').textContent = state.validations;
  $('#journey-progress-label').textContent = `${state.progress}%`;
  $('#sidebar-progress-label').textContent = `${state.progress}% complete`;
  $('#path-progress-label').textContent = `${state.progress}%`;
  setProgress('#journey-progress', state.progress);
  setProgress('#sidebar-progress', state.progress);
  setProgress('#path-progress', state.progress);
  $('#week-ring').style.background = `conic-gradient(var(--green) 0 ${Math.min(100, state.weekHours / 6 * 100)}%, #dcded5 ${Math.min(100, state.weekHours / 6 * 100)}%)`;
}

function renderActivity() {
  $('#activity-list').innerHTML = state.activities.slice(0, 3).map(item => `
    <div class="activity-item"><span class="activity-dot">${item.icon}</span><div><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.meta)}</small></div></div>
  `).join('');
}

function renderDashboardReviews() {
  $('#review-count').textContent = state.reviews.length;
  $('#received-count').textContent = state.reviews.length;
  $('#dashboard-reviews').innerHTML = state.reviews.length ? state.reviews.slice(0, 2).map(review => `
    <div class="review-person"><span class="person-avatar ${review.color === 'coral' ? 'coral' : ''}">${review.initials}</span><div><strong>${escapeHtml(review.name)}</strong><small>${escapeHtml(review.skill)} · ${escapeHtml(review.time)}</small></div><button class="review-action" data-open-review="${review.id}">Review</button></div>
  `).join('') : '<p class="hero-copy">You’re all caught up. Nice work.</p>';
}

function renderMilestones() {
  const stages = [
    ['01', 'Container essentials', 'Images, containers, ports, and logs', 'done'],
    ['02', 'Build with Dockerfiles', 'Layers, caching, and safe defaults', state.progress >= 50 ? 'done' : ''],
    ['03', 'Compose an app stack', 'Connect an API, database, and storage', state.progress >= 80 ? 'done' : 'current'],
    ['04', 'Build a CI pipeline', 'Test every pull request automatically', state.progress >= 80 ? 'current' : ''],
    ['05', 'Publish and deploy', 'Ship a versioned image to staging', ''],
    ['06', 'Prove the skill', 'Capstone project and peer validation', '']
  ];
  $('#milestone-list').innerHTML = stages.map(([n, title, sub, status]) => `
    <article class="milestone ${status}"><span class="milestone-number">${status === 'done' ? '✓' : n}</span><div><strong>${title}</strong><small>${sub}</small></div><span class="milestone-state">${status === 'done' ? 'Complete' : status === 'current' ? 'Current' : 'Upcoming'}</span></article>
  `).join('');
}

function renderSkills() {
  const skills = [
    ['DK', 'Docker', 'Infrastructure', state.progress >= 80 ? 'Working' : 'Foundation', '3 projects', ['MC','PR','+1']],
    ['CI', 'CI/CD', 'Delivery', 'Foundation', '2 projects', ['NO']],
    ['GA', 'GitHub Actions', 'Automation', 'Foundation', '2 workflows', ['JB','PR']],
    ['GT', 'Git', 'Engineering fundamentals', 'Working', '8 projects', ['PR','AK','+2']],
    ['LX', 'Linux CLI', 'Engineering fundamentals', 'Foundation', '12 sessions', ['AK']]
  ];
  $('#skill-table').innerHTML = skills.map(skill => `
    <article class="skill-row"><div class="skill-name"><span class="skill-badge">${skill[0]}</span><div><strong>${skill[1]}</strong><small>${skill[2]}</small></div></div><span class="level-badge">${skill[3]}</span><div class="skill-evidence"><strong>${skill[4]}</strong><div class="validation-stack">${skill[5].map(v => `<span>${v}</span>`).join('')}</div></div><button class="skill-menu" aria-label="More options for ${skill[1]}">···</button></article>
  `).join('');
}

function renderReviewWorkspace() {
  const workspace = $('#review-workspace');
  if (reviewFilter === 'received') {
    workspace.innerHTML = state.reviews.length ? state.reviews.map(review => `
      <article class="review-card"><div class="review-owner"><span class="person-avatar ${review.color === 'coral' ? 'coral' : ''}">${review.initials}</span><div><strong>${escapeHtml(review.name)}</strong><small>${escapeHtml(review.skill)} · ${escapeHtml(review.time)}</small></div></div><p class="review-context">${escapeHtml(review.context)}</p><div class="review-card-actions"><button class="button button-quiet" data-decline="${review.id}">Decline</button><button class="button button-primary" data-approve="${review.id}">Validate</button></div></article>
    `).join('') : '<article class="panel"><h2>Inbox clear</h2><p class="hero-copy">No peer reviews are waiting for you.</p></article>';
  } else if (reviewFilter === 'sent') {
    workspace.innerHTML = state.sentReviews.map(review => `<article class="review-card"><div class="review-owner"><span class="person-avatar">${initials(review.name)}</span><div><strong>${escapeHtml(review.name)}</strong><small>${escapeHtml(review.skill)}</small></div></div><p class="review-context">Evidence submitted. Your peer can validate the level or send actionable feedback.</p><span class="level-badge">${review.status}</span></article>`).join('');
  } else {
    workspace.innerHTML = `<article class="panel"><h2>${state.validations} skills validated</h2><p class="hero-copy">Each validation remains connected to the evidence and reviewer who approved it.</p></article>`;
  }
}

function renderAll() {
  renderMetrics();
  renderActivity();
  renderDashboardReviews();
  renderMilestones();
  renderSkills();
  renderReviewWorkspace();
}

function switchView(name) {
  $$('.view').forEach(view => view.classList.toggle('active', view.id === `${name}-view`));
  $$('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.view === name));
  $('#crumb-label').textContent = $(`#${name}-view`).dataset.title;
  $('#sidebar').classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2600);
}

function openReview(id) {
  switchView('reviews');
  setTimeout(() => document.querySelector(`[data-approve="${id}"]`)?.focus(), 250);
}

function resolveReview(id, approved) {
  const review = state.reviews.find(item => item.id === id);
  state.reviews = state.reviews.filter(item => item.id !== id);
  if (approved) state.validations += 1;
  saveState();
  showToast(approved ? `${review?.name || 'Skill'} validated — thank you.` : 'Review declined with no profile changes.');
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' })[char]);
}

function initials(name) {
  return name.split(/\s+/).map(part => part[0]).slice(0,2).join('').toUpperCase();
}

$$('.nav-item').forEach(button => button.addEventListener('click', () => switchView(button.dataset.view)));
$$('[data-view-link]').forEach(button => button.addEventListener('click', () => switchView(button.dataset.viewLink)));
$('#menu-button').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
$('#log-button').addEventListener('click', () => $('#learning-modal').showModal());
['#quick-review-button', '#request-review-button'].forEach(selector => $(selector).addEventListener('click', () => $('#review-modal').showModal()));

$('#continue-button').addEventListener('click', () => {
  state.progress = Math.min(100, state.progress + 8);
  state.weekHours = Math.min(10, state.weekHours + .5);
  state.hours += .5;
  state.activities.unshift({ icon: '↗', title: 'Advanced “Containerize your first app”', meta: 'Docker · 30 min · Just now' });
  saveState();
  showToast(state.progress === 100 ? 'Path complete — ready for peer validation!' : 'Progress saved. Keep going!');
});

$('#learning-form').addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const minutes = Number(data.get('minutes'));
  state.hours += minutes / 60;
  state.weekHours += minutes / 60;
  state.progress = Math.min(100, state.progress + Math.max(1, Math.round(minutes / 15)));
  state.activities.unshift({ icon: '+', title: data.get('topic'), meta: `${data.get('skill')} · ${minutes} min · Just now` });
  saveState();
  event.currentTarget.reset();
  $('#learning-modal').close();
  showToast('Learning session added to your trail.');
});

$('#review-form').addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  state.sentReviews.unshift({ name: data.get('peer'), skill: String(data.get('skill')).split(' · ')[0], status: 'Awaiting response' });
  saveState();
  event.currentTarget.reset();
  $('#review-modal').close();
  showToast('Review request added to your sent queue.');
});

$('.review-tabs').addEventListener('click', event => {
  const button = event.target.closest('[data-review-filter]');
  if (!button) return;
  reviewFilter = button.dataset.reviewFilter;
  $$('.review-tabs button').forEach(item => item.classList.toggle('active', item === button));
  renderReviewWorkspace();
});

document.addEventListener('click', event => {
  const openButton = event.target.closest('[data-open-review]');
  const approveButton = event.target.closest('[data-approve]');
  const declineButton = event.target.closest('[data-decline]');
  if (openButton) openReview(Number(openButton.dataset.openReview));
  if (approveButton) resolveReview(Number(approveButton.dataset.approve), true);
  if (declineButton) resolveReview(Number(declineButton.dataset.decline), false);
});

$('#reset-button').addEventListener('click', () => {
  if (!confirm('Reset SkillTrail to the original demo data?')) return;
  localStorage.removeItem(STORAGE_KEY);
  state = structuredClone(seed);
  renderAll();
  showToast('Demo data reset.');
});

['#new-path-button', '#add-skill-button'].forEach(selector => $(selector).addEventListener('click', () => showToast('The guided creation flow is planned for the next iteration.')));
$$('.explore-action').forEach(button => button.addEventListener('click', () => { button.textContent = 'Added ✓'; button.disabled = true; showToast('Path added to your learning plan.'); }));

renderAll();
