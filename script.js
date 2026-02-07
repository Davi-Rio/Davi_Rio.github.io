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
const architectureDiagram = document.getElementById('architectureDiagram');

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

const projectData = {
  industrial: {
    title: 'Plataforma de Automação Industrial',
    image: 'Arquitetura_Front.png',
    description:
      'Arquitetura baseada em frontend web, APIs em Node/NestJS e comunicação com equipamentos embarcados via MQTT.'
  },
  cloud: {
    title: 'Backend de APIs em Cloud',
    image: 'Arquitetura_back.png',
    description:
      'APIs escaláveis com autenticação, logs, banco PostgreSQL e deploy em cloud.'
  },
  dashboard: {
    title: 'Dashboards Web',
    image: '',
    description:
      'Dashboards interativos focados em visualização de dados e relatórios analíticos.'
  }
};

document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('click', () => {
    const key = card.dataset.project;
    const data = projectData[key];
    if (!data) return;
    modalTitle.textContent = data.title;
    modalDescription.textContent = data.description;
    modalImage.style.display = 'none';
    miniDashboard.style.display = 'none';
    const architectureDiagram = document.getElementById('architectureDiagram');
    
    if (architectureDiagram) {
      architectureDiagram.style.display = 'none';
    }

    if (key === 'industrial') {
      if (architectureDiagram) {
        architectureDiagram.style.display = 'block';
        architectureLoopRunning = false;
        setTimeout(() => {
          startArchitectureLoop();
        }, 200);
      }
    }
    else if (key === 'dashboard') {
      miniDashboard.style.display = 'block';
      updateDashboard(30);
    }
    else {
      modalImage.style.display = 'block';
      modalImage.src = data.image;
    }

    modalOverlay.classList.add('active');
  });
});

modalClose.addEventListener('click', () => {
  modalOverlay.classList.remove('active');
  architectureLoopRunning = false;
  clearArchitectureState();
});


modalOverlay.addEventListener('click', e => {
  if (e.target === modalOverlay) {
    modalOverlay.classList.remove('active');
    architectureLoopRunning = false;
    clearArchitectureState();
  }
});


document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    modalOverlay.classList.remove('active');
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

    const modalRect = modalOverlay.getBoundingClientRect();
    const OFFSET_X = 10;   
    const OFFSET_Y = -60;   

    tooltip.style.left = `${mx + OFFSET_X}px`;
    tooltip.style.top = `${my - OFFSET_Y}px`;


    tooltip.innerHTML = `
      <strong>${found.label}</strong><br>
      Vendas: R$ ${found.sales.toLocaleString()}<br>
      Usuários: ${found.users}
    `;
    tooltip.style.opacity = '1';
    tooltip.style.transform = 'translateY(0)';
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


function clearArchitectureState() {
  document
    .querySelectorAll('.arch-node')
    .forEach(n => n.classList.remove('active-node'));

  document
    .querySelectorAll('.flow')
    .forEach(f => f.classList.remove('active-flow'));
}

function pulseLink(from, to) {
  const fromNode = document.querySelector(`[data-node="${from}"]`);
  const toNode   = document.querySelector(`[data-node="${to}"]`);

  if (!fromNode || !toNode) return;

  fromNode.classList.add('active-node');
  toNode.classList.add('active-node');

  document.querySelectorAll('.flow').forEach(flow => {
    if (
      flow.dataset.from === from &&
      flow.dataset.to === to
    ) {
      flow.classList.add('active-flow');
    }
  });
}

async function runArchitectureOnce() {
  clearArchitectureState();

  for (const stage of architectureStages) {
    clearArchitectureState();

    stage.forEach(link => {
      pulseLink(link.from, link.to);
    });

    await new Promise(res => setTimeout(res, 900));
  }

  clearArchitectureState();
}

let architectureLoopRunning = false;

async function startArchitectureLoop() {
  if (architectureLoopRunning) return;
  architectureLoopRunning = true;

  while (architectureLoopRunning) {
    await runArchitectureOnce();
    await new Promise(res => setTimeout(res, 5000));
  }
}

document.querySelectorAll('.arch-node').forEach(node => {
  node.addEventListener('click', () => {
    architectureLoopRunning = false; 
    setTimeout(() => {
      startArchitectureLoop();    
    }, 100);
  });
});

const archTooltip = document.getElementById('archTooltip');
const ARCH_STEP_DURATION = 5500;
const ARCH_LOOP_DELAY    = 5000;

const archMessages = {
  frontend: 'Usuário interage com a aplicação Angular.',
  api: 'API processa a requisição, valida e autentica.',
  db: 'Dados são persistidos no PostgreSQL.',
  mqtt: 'Mensagens são publicadas via MQTT.',
  embedded: 'Equipamentos embarcados executam ações.'
};

function showArchTooltip(nodeKey) {
  const node = document.querySelector(`[data-node="${nodeKey}"]`);
  if (!node) return;

  const rect = node.getBoundingClientRect();
  const parentRect = architectureDiagram.getBoundingClientRect();

  archTooltip.innerHTML = `<strong>${nodeKey.toUpperCase()}</strong><br>${archMessages[nodeKey]}`;
  archTooltip.style.left = `${rect.left - parentRect.left + rect.width / 2}px`;
  archTooltip.style.top  = `${rect.top - parentRect.top - 12}px`;
  archTooltip.style.opacity = '1';
  archTooltip.style.transform = 'translateY(0)';
}

function hideArchTooltip() {
  archTooltip.style.opacity = '0';
}

async function playArchitectureFlowLoop() {
  if (architectureLoopRunning) return;
  architectureLoopRunning = true;

  while (architectureLoopRunning) {
    for (const stage of architectureStages) {
      clearArchitectureState();

      stage.forEach(link => {
        pulseLink(link.from, link.to);
        showArchTooltip(link.from);
      });

      await new Promise(r => setTimeout(r, ARCH_STEP_DURATION));
    }

    hideArchTooltip();
    clearArchitectureState();

    await new Promise(r => setTimeout(r, ARCH_LOOP_DELAY));
  }
}
