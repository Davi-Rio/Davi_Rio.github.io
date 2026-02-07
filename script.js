const reveals = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  },
  { threshold: 0.15 }
);

reveals.forEach(el => observer.observe(el));


const heroVisual = document.querySelector('.hero-visual');

if (heroVisual) {
  let latestScrollY = 0;

  window.addEventListener('scroll', () => {
    if (window.innerWidth < 900) {
      heroVisual.style.transform = 'translateY(0)';
      return;
    }
    latestScrollY = window.scrollY;
  });

  heroVisual.addEventListener('mousemove', e => {
    if (window.innerWidth < 900) return;

    const rect = heroVisual.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = -(y - centerY) / 25;
    const rotateY = (x - centerX) / 25;

    heroVisual.style.transform = `
      translateY(${latestScrollY * 0.25}px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
    `;
  });

  heroVisual.addEventListener('mouseleave', () => {
    heroVisual.style.transform = `
      translateY(${latestScrollY * 0.25}px)
      rotateX(0deg)
      rotateY(0deg)
    `;
  });
}

const modalOverlay = document.getElementById('projectModal');
const modalTitle = modalOverlay.querySelector('.modal-title');
const modalImage = modalOverlay.querySelector('.modal-image img');
const modalDescription = modalOverlay.querySelector('.modal-description');
const modalClose = modalOverlay.querySelector('.modal-close');

const miniDashboard = document.querySelector('.mini-dashboard');
const architectureDiagram = document.getElementById('architectureDiagram');
const backendDiagram = document.getElementById('backendDiagram');

const projectData = {
  industrial: {
    title: 'Plataforma de Automação Industrial',
    description:
      'Arquitetura baseada em frontend web, APIs em Node/NestJS e comunicação com equipamentos embarcados via MQTT.'
  },
  cloud: {
    title: 'Backend de APIs em Cloud',
    description:
      'APIs escaláveis com autenticação, logs, banco PostgreSQL e deploy em cloud.'
  },
  dashboard: {
    title: 'Dashboards Web',
    description:
      'Dashboards interativos focados em visualização de dados e relatórios analíticos.'
  }
};

function resetModalContent() {
  modalImage.style.display = 'none';
  architectureDiagram.style.display = 'none';
  backendDiagram.style.display = 'none';
  miniDashboard.style.display = 'none';
  stopAllArchitectureLoops();
}

document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('click', () => {
    const key = card.dataset.project;
    const data = projectData[key];
    if (!data) return;

    modalTitle.textContent = data.title;
    modalDescription.textContent = data.description;

    resetModalContent();

    if (key === 'industrial') {
      architectureDiagram.style.display = 'block';
      setTimeout(startArchitectureLoop, 200);
    } 
    else if (key === 'cloud') {
      backendDiagram.style.display = 'block';
      setTimeout(startBackendLoop, 200);
    } 
    else if (key === 'dashboard') {
      miniDashboard.style.display = 'block';
      updateDashboard(30);
    }

    modalOverlay.classList.add('active');
  });
});

modalClose.addEventListener('click', () => {
  modalOverlay.classList.remove('active');
  stopAllArchitectureLoops();
});

modalOverlay.addEventListener('click', e => {
  if (e.target === modalOverlay) {
    modalOverlay.classList.remove('active');
    stopAllArchitectureLoops();
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    modalOverlay.classList.remove('active');
    stopAllArchitectureLoops();
  }
});

const canvas = document.getElementById('dashboardChart');
const ctx = canvas.getContext('2d');
const tooltip = document.getElementById('chartTooltip');

const kpiSales = document.getElementById('kpiSales');
const kpiUsers = document.getElementById('kpiUsers');
const kpiGrowth = document.getElementById('kpiGrowth');

const dashboardData = {
  7: {
    sales: 42000,
    users: 320,
    growth: 12,
    labels: ['Dia 1','Dia 2','Dia 3','Dia 4','Dia 5','Dia 6','Dia 7'],
    points: [
      { sales: 4200, users: 45 },
      { sales: 5200, users: 52 },
      { sales: 6800, users: 61 },
      { sales: 6100, users: 58 },
      { sales: 8200, users: 73 },
      { sales: 9100, users: 81 },
      { sales: 10400, users: 92 }
    ]
  },
  30: {
    sales: 82000,
    users: 1240,
    growth: 18,
    labels: ['S1','S2','S3','S4','S5','S6','S7','S8','S9','S10'],
    points: [
      { sales: 6200, users: 90 },
      { sales: 6800, users: 102 },
      { sales: 7200, users: 110 },
      { sales: 7600, users: 118 },
      { sales: 8100, users: 126 },
      { sales: 8600, users: 134 },
      { sales: 9100, users: 142 },
      { sales: 9600, users: 150 },
      { sales: 10100, users: 158 },
      { sales: 10800, users: 170 }
    ]
  },
  90: {
    sales: 210000,
    users: 3800,
    growth: 32,
    labels: ['M1','M2','M3','M4','M5','M6','M7','M8','M9','M10','M11','M12'],
    points: [
      { sales: 12000, users: 260 },
      { sales: 13500, users: 280 },
      { sales: 14800, users: 300 },
      { sales: 16200, users: 320 },
      { sales: 17500, users: 340 },
      { sales: 18900, users: 360 },
      { sales: 20400, users: 390 },
      { sales: 21800, users: 420 },
      { sales: 23200, users: 450 },
      { sales: 24800, users: 480 },
      { sales: 26500, users: 520 },
      { sales: 28500, users: 560 }
    ]
  }
};

let chartPoints = [];
let currentLabels = [];

function drawChart(points) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const padding = 30;
  const max = Math.max(...points.map(p => p.sales));
  const stepX = (canvas.width - padding * 2) / (points.length - 1);

  chartPoints = [];

  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;

  for (let i = 0; i <= 4; i++) {
    const y = padding + ((canvas.height - padding * 2) / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(canvas.width - padding, y);
    ctx.stroke();
  }

  ctx.strokeStyle = '#58a6ff';
  ctx.lineWidth = 2;
  ctx.beginPath();

  points.forEach((p, i) => {
    const x = padding + stepX * i;
    const y =
      canvas.height -
      padding -
      (p.sales / max) * (canvas.height - padding * 2);

    chartPoints.push({
      x,
      y,
      label: currentLabels[i],
      sales: p.sales,
      users: p.users
    });

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();

  chartPoints.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#58a6ff';
    ctx.fill();
  });
}

canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  let found = null;

  chartPoints.forEach(p => {
    const dx = mx - p.x;
    const dy = my - p.y;
    if (Math.sqrt(dx * dx + dy * dy) < 7) found = p;
  });

  drawChart(chartPoints.map(p => ({ sales: p.sales, users: p.users })));

  if (found) {
    ctx.beginPath();
    ctx.arc(found.x, found.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#9ecbff';
    ctx.fill();

    tooltip.style.left = `${mx + 10}px`;
    tooltip.style.top = `${my - -70}px`;
    tooltip.innerHTML = `
      <strong>${found.label}</strong><br>
      Vendas: R$ ${found.sales.toLocaleString()}<br>
      Usuários: ${found.users}
    `;
    tooltip.style.opacity = '1';
  } else {
    tooltip.style.opacity = '0';
  }
});

canvas.addEventListener('mouseleave', () => {
  tooltip.style.opacity = '0';
});

function updateDashboard(period) {
  const data = dashboardData[period];
  currentLabels = data.labels;

  kpiSales.textContent = `R$ ${data.sales.toLocaleString()}`;
  kpiUsers.textContent = data.users.toLocaleString();
  kpiGrowth.textContent = `+${data.growth}%`;

  drawChart(data.points);
}

document.querySelectorAll('.dashboard-filters button').forEach(btn => {
  btn.addEventListener('click', () => {
    document
      .querySelectorAll('.dashboard-filters button')
      .forEach(b => b.classList.remove('active'));

    btn.classList.add('active');
    updateDashboard(btn.dataset.period);
  });
});


const architectureStages = [
  [ { from: 'frontend', to: 'api' } ],
  [
    { from: 'api', to: 'db' },
    { from: 'api', to: 'mqtt' }
  ],
  [ { from: 'mqtt', to: 'embedded' } ]
];

const archMessages = {
  frontend: 'Usuário interage com a aplicação Angular.',
  api: 'API processa a requisição, valida e autentica.',
  db: 'Dados são persistidos no PostgreSQL.',
  mqtt: 'Mensagens são publicadas via MQTT.',
  embedded: 'Equipamentos embarcados executam ações.'
};

let architectureLoopRunning = false;

function clearArchitectureState() {
  document.querySelectorAll('.arch-node').forEach(n => n.classList.remove('active-node'));
  document.querySelectorAll('.flow').forEach(f => f.classList.remove('active-flow'));
}

function pulseLink(from, to) {
  const fromNode = document.querySelector(`[data-node="${from}"]`);
  const toNode = document.querySelector(`[data-node="${to}"]`);
  if (!fromNode || !toNode) return;

  fromNode.classList.add('active-node');
  toNode.classList.add('active-node');

  document.querySelectorAll('.flow').forEach(flow => {
    if (flow.dataset.from === from && flow.dataset.to === to) {
      flow.classList.add('active-flow');
    }
  });
}

const archTooltip = document.getElementById('archTooltip');

function showArchTooltip(nodeKey) {
  const node = document.querySelector(`[data-node="${nodeKey}"]`);
  if (!node || !archTooltip) return;

  archTooltip.innerHTML = `
    <div class="tooltip-title">${nodeKey.toUpperCase()}</div>
    <div class="tooltip-text">${archMessages[nodeKey]}</div>
  `;

  const nodeRect = node.getBoundingClientRect();
  const modalRect = document.querySelector('.project-modal').getBoundingClientRect();

  let left =
    nodeRect.left - modalRect.left + nodeRect.width / 2 - archTooltip.offsetWidth / 2 - 35;

  let top =
    nodeRect.top - modalRect.top - archTooltip.offsetHeight - 12 - 35;

  left = Math.max(16, Math.min(left, modalRect.width - archTooltip.offsetWidth - 16));

  archTooltip.style.left = `${left}px`;
  archTooltip.style.top = `${top}px`;
  archTooltip.style.opacity = '1';
}

function hideArchTooltip() {
  if (!archTooltip) return;
  archTooltip.style.opacity = '0';
  archTooltip.innerHTML = '';
}

async function runArchitectureOnce() {
  for (const stage of architectureStages) {
    clearArchitectureState();
    stage.forEach(link => pulseLink(link.from, link.to));
    showArchTooltip(stage[0].from);
    await new Promise(r => setTimeout(r, 1800));
  }
  hideArchTooltip();
  clearArchitectureState();
}

async function startArchitectureLoop() {
  if (architectureLoopRunning) return;
  architectureLoopRunning = true;

  while (architectureLoopRunning) {
    await runArchitectureOnce();
    await new Promise(r => setTimeout(r, 5000));
  }
}

const backendStages = [
  [ { from: 'auth', to: 'api' } ],
  [
    { from: 'api', to: 'db' },
    { from: 'api', to: 'deploy' }
  ],
  [ { from: 'db', to: 'logs' } ]
];

const backendMessages = {
  auth: 'Autenticação e validação de segurança.',
  api: 'Processamento da requisição nas APIs.',
  db: 'Persistência e leitura no PostgreSQL.',
  deploy: 'Aplicação executando em ambiente cloud.',
  logs: 'Coleta de métricas e monitoramento.'
};

let backendLoopRunning = false;

function clearBackendState() {
  document.querySelectorAll('#backendDiagram .arch-node').forEach(n => n.classList.remove('active-node'));
  document.querySelectorAll('#backendDiagram .flow').forEach(f => f.classList.remove('active-flow'));
}

function pulseBackendLink(from, to) {
  const fromNode = document.querySelector(`#backendDiagram [data-node="${from}"]`);
  const toNode = document.querySelector(`#backendDiagram [data-node="${to}"]`);
  if (!fromNode || !toNode) return;

  fromNode.classList.add('active-node');
  toNode.classList.add('active-node');

  document.querySelectorAll('#backendDiagram .flow').forEach(flow => {
    if (flow.dataset.from === from && flow.dataset.to === to) {
      flow.classList.add('active-flow');
    }
  });
}

const backendTooltip = document.getElementById('backendArchTooltip');

function showBackendTooltip(nodeKey) {
  const tooltip = document.getElementById('backendArchTooltip');
  const node = document.querySelector(
    `#backendDiagram [data-node="${nodeKey}"]`
  );
  if (!node || !tooltip) return;

  tooltip.innerHTML = `
    <div class="tooltip-title">${nodeKey.toUpperCase()}</div>
    <div class="tooltip-text">${backendMessages[nodeKey]}</div>
  `;

  tooltip.style.opacity = '0';
  tooltip.style.left = '0px';
  tooltip.style.top = '0px';
  tooltip.style.transform = 'none';

  const nodeRect = node.getBoundingClientRect();
  const parentRect = backendDiagram.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();

  const OFFSET_X = 0;
  const OFFSET_Y = 0;

  let left =
    nodeRect.left -
    parentRect.left +
    nodeRect.width / 2 -
    tooltipRect.width / 2 +
    OFFSET_X;

  let top =
    nodeRect.top -
    parentRect.top -
    tooltipRect.height -
    12 +
    OFFSET_Y;

  const MIN_LEFT = 16;
  const MAX_LEFT = parentRect.width - tooltipRect.width - 16;

  left = Math.max(MIN_LEFT, Math.min(left, MAX_LEFT));

  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
  tooltip.style.opacity = '1';
}


function hideBackendTooltip() {
  if (!backendTooltip) return;
  backendTooltip.style.opacity = '0';
  backendTooltip.innerHTML = '';
}

async function runBackendOnce() {
  for (const stage of backendStages) {
    clearBackendState();
    stage.forEach(link => pulseBackendLink(link.from, link.to));
    showBackendTooltip(stage[0].from);
    await new Promise(r => setTimeout(r, 1800));
  }
  hideBackendTooltip();
  clearBackendState();
}

async function startBackendLoop() {
  if (backendLoopRunning) return;
  backendLoopRunning = true;

  while (backendLoopRunning) {
    await runBackendOnce();
    await new Promise(r => setTimeout(r, 5000));
  }
}

function stopAllArchitectureLoops() {
  architectureLoopRunning = false;
  backendLoopRunning = false;

  clearArchitectureState();
  clearBackendState();

  hideArchTooltip();
  hideBackendTooltip();
}

const timelineCards = document.querySelectorAll('.timeline-card');
const nextButtons = document.querySelectorAll('.timeline-next');
const prevButtons = document.querySelectorAll('.timeline-prev');

let currentTimelineIndex = 0;
let autoPlayInterval = null;
const AUTO_PLAY_DELAY = 10000; 

function showTimelineCard(index) {
  timelineCards.forEach((card, i) => {
    card.classList.toggle('active', i === index);
  });
}

function nextTimelineCard() {
  currentTimelineIndex =
    (currentTimelineIndex + 1) % timelineCards.length;
  showTimelineCard(currentTimelineIndex);
}

function prevTimelineCard() {
  currentTimelineIndex =
    (currentTimelineIndex - 1 + timelineCards.length) %
    timelineCards.length;
  showTimelineCard(currentTimelineIndex);
}

function startAutoPlay() {
  stopAutoPlay();
  autoPlayInterval = setInterval(nextTimelineCard, AUTO_PLAY_DELAY);
}

function stopAutoPlay() {
  if (autoPlayInterval) {
    clearInterval(autoPlayInterval);
    autoPlayInterval = null;
  }
}

nextButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    nextTimelineCard();
    startAutoPlay();
  });
});

prevButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    prevTimelineCard();
    startAutoPlay(); 
  });
});

showTimelineCard(currentTimelineIndex);
startAutoPlay();