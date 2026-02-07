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
    titleKey: 'modal.industrial.title',
    descKey: 'modal.industrial.desc'
  },
  cloud: {
    titleKey: 'modal.cloud.title',
    descKey: 'modal.cloud.desc'
  },
  dashboard: {
    titleKey: 'modal.dashboard.title',
    descKey: 'modal.dashboard.desc'
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

    modalTitle.textContent = t(data.titleKey);
    modalDescription.textContent = t(data.descKey);


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

  [ { from: 'api', to: 'db' } ],

  [ { from: 'api', to: 'mqtt' } ],

  [ { from: 'mqtt', to: 'embedded' } ]
];

let architectureLoopRunning = false;

function clearArchitectureState() {
  architectureDiagram
    .querySelectorAll('.arch-node')
    .forEach(n => n.classList.remove('active-node'));

  architectureDiagram
    .querySelectorAll('.flow')
    .forEach(f => f.classList.remove('active-flow'));
}

const architectureLineMap = {
  'frontend-api': 0,
  'api-db': 1,
  'api-mqtt': 2,
  'mqtt-embedded': 3
};

function pulseLink(from, to) {
  const fromNode = architectureDiagram.querySelector(
    `[data-node="${from}"]`
  );
  const toNode = architectureDiagram.querySelector(
    `[data-node="${to}"]`
  );
  if (!fromNode || !toNode) return;

  fromNode.classList.add('active-node');
  toNode.classList.add('active-node');

  const key = `${from}-${to}`;
  const index = architectureLineMap[key];
  if (index === undefined) return;

  const flows = architectureDiagram.querySelectorAll('.flow');
  flows[index]?.classList.add('active-flow');
}


const archTooltip = document.getElementById('archTooltip');

function showArchTooltip(nodeKey) {
  const node = document.querySelector(`[data-node="${nodeKey}"]`);
  if (!node || !archTooltip) return;

  archTooltip.innerHTML = `
    <div class="tooltip-title">${nodeKey.toUpperCase()}</div>
    <div class="tooltip-text">${t(`arch.msg.${nodeKey}`)}</div>
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

    stage.forEach(link =>
      pulseLink(link.from, link.to)
    );

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

  [ { from: 'api', to: 'db' } ],

  [ { from: 'api', to: 'deploy' } ],

  [ { from: 'db', to: 'logs' } ]
];


const backendLineMap = {
  'auth-api': 0,
  'api-db': 1,
  'api-deploy': 2,
  'api-logs': 3
};

function getArchMessage(nodeKey) {
  return t(`arch.msg.${nodeKey}`);
}

function getBackendMessage(nodeKey) {
  return t(`backend.msg.${nodeKey}`);
}


let backendLoopRunning = false;

function clearBackendState() {
  backendDiagram
    .querySelectorAll('.arch-node')
    .forEach(n => n.classList.remove('active-node'));

  backendDiagram
    .querySelectorAll('.flow')
    .forEach(f => f.classList.remove('active-flow'));
}

function pulseBackendLink(from, to) {
  const fromNode = backendDiagram.querySelector(
    `[data-node="${from}"]`
  );
  const toNode = backendDiagram.querySelector(
    `[data-node="${to}"]`
  );
  if (!fromNode || !toNode) return;

  fromNode.classList.add('active-node');
  toNode.classList.add('active-node');

  const key = `${from}-${to}`;
  const index = backendLineMap[key];
  if (index === undefined) return;

  const flows = backendDiagram.querySelectorAll('.flow');
  flows[index]?.classList.add('active-flow');
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
    <div class="tooltip-text">${t(`backend.msg.${nodeKey}`)}</div>
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

    stage.forEach(link =>
      pulseBackendLink(link.from, link.to)
    );

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

const scrollArrow = document.querySelector('.scroll-arrow');
const heroSection = document.querySelector('.hero');

if (scrollArrow && heroSection) {
  scrollArrow.addEventListener('click', () => {
    const nextSection = heroSection.nextElementSibling;
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  });
}

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    document.body.classList.add('scrolled');
  }
});

const translations = {
  pt: {
    "hero.badge": "Desenvolvedor & Estudante De Engenharia Automação",
    "hero.subtitle": "Estudante de Engenharia de Controle e Automação",
    "hero.stack": "Full Stack · Cloud · Sistemas Integrados",
    "scroll.more": "Role para ver mais",

    "about.title": "Sobre mim",
    "about.p1":
      "Sou estudante de Engenharia de Controle e Automação e desenvolvedor com foco em construir sistemas que funcionam de ponta a ponta.",
    "about.p2":
      "Atuo no desenvolvimento de soluções completas, envolvendo frontend, backend e cloud computing, além da integração com equipamentos embarcados e automação industrial.",
    "about.p3":
      "Tenho interesse em arquitetura de software, integração de sistemas e escalabilidade, sempre buscando escrever código claro, organizado e fácil de evoluir.",

    "cards.frontend.title": "Frontend",
    "cards.frontend.desc": "UI · UX · Performance",

    "cards.backend.title": "Backend",
    "cards.backend.desc": "APIs · Regras · Segurança",

    "cards.fullstack.title": "Full Stack",
    "cards.fullstack.desc": "Frontend · Backend · Cloud",

    "cards.integration.title": "Integração",
    "cards.integration.desc": "Web · APIs · Embarcados",

    "cards.architecture.title": "Arquitetura",
    "cards.architecture.desc": "Sistemas escaláveis",

    "cards.quality.title": "Qualidade",
    "cards.quality.desc": "Código limpo e confiável",

    "cards.communication.title": "Comunicação",
    "cards.communication.desc": "Clareza técnica",

    "cards.learning.title": "Aprendizado",
    "cards.learning.desc": "Evolução constante",

    "tech.title": "Tecnologias",
    "lang.title": "Linguagens",
    "projects.title": "Soluções Desenvolvidas",
    "contact.title": "Contato",

    "career.title": "Experiência Profissional",

    "career.step.start": "Início de Carreira",
    "career.step.extension": "Primeiro Projeto de Extensão",
    "career.step.industry": "Experiência Industrial",
    "career.step.iot": "Engenharia & IoT",
    "career.step.current": "Atuação Profissional",

    "career.uepe.role": "Engenharia de Controle e Automação",
    "career.uepe.desc":
      "Formação acadêmica com foco em sistemas de controle, automação industrial, programação e integração entre software e hardware, criando a base técnica para atuação em sistemas complexos.",

    "career.informa.role": "Projeto de Extensão Acadêmica · 2019 – 2020",
    "career.informa.desc":
      "Primeiro contato prático com desenvolvimento de software, atuando na criação de aplicações mobile interativas. Experiência com frontend e backend em ambiente acadêmico, consolidando fundamentos de programação e lógica de sistemas.",

    "career.usiman.role": "Estágio Industrial · Jan/2023 – Dez/2024",
    "career.usiman.desc":
      "Atuação em projetos de retrofit industrial, com apoio à projeção e adequação de peças técnicas, além de suporte à manutenção de máquinas e equipamentos industriais em ambiente produtivo.",

    "career.capricche.role": "Estágio em Projetos e Engenharia · Jan/2025 – Jun/2025",
    "career.capricche.desc":
      "Apoio ao desenvolvimento de projetos de engenharia, com participação em soluções IoT aplicadas a processos produtivos, análise técnica e suporte à melhoria contínua da qualidade de produtos.",

    "career.tron.role": "Analista de Sistemas de Automação · Jul/2025 – Atual",
    "career.tron.desc":
    "Desenvolvimento e manutenção de sistemas de automação integrados a software, criação de APIs e serviços backend com Node.js e NestJS, integração entre sistemas industriais, aplicações web e plataformas em nuvem, além de deploy e operação de serviços em Google Cloud Platform.",
    "projects.industrial.title": "Plataforma de Automação Industrial",
    "projects.industrial.desc": "Sistema web integrado a equipamentos embarcados.",

    "projects.cloud.title": "Backend de APIs em Cloud",
    "projects.cloud.desc": "APIs escaláveis com autenticação e logs.",

    "projects.dashboard.title": "Dashboards Web",
    "projects.dashboard.desc": "Visualização de dados e relatórios analíticos.",

    "contact.title": "Contato",
    "contact.email": "Email",
    "contact.phone": "Celular",

    "footer.name": "Davi Rio",
    "modal.node.frontend": "Frontend Web",
    "modal.node.api": "APIs",
    "modal.node.mqtt": "Mensageria",
    "modal.node.database": "Banco de Dados",
    "modal.node.embedded": "Equipamentos",
    "modal.node.embedded.sub": "Embarcados",

    "modal.node.auth": "Autenticação",
    "modal.node.scalableApis": "APIs Escaláveis",
    "modal.node.deploy": "Deploy na Cloud",
    "modal.node.logs": "Logs & Monitoramento",

    "dashboard.sales": "Vendas",
    "dashboard.users": "Usuários",
    "dashboard.growth": "Crescimento",

    "dashboard.days7": "7 dias",
    "dashboard.days30": "30 dias",
    "dashboard.days90": "90 dias",
    "arch.msg.frontend": "Usuário interage com a aplicação Angular.",
    "arch.msg.api": "API processa a requisição, valida e autentica.",
    "arch.msg.db": "Dados são persistidos no PostgreSQL.",
    "arch.msg.mqtt": "Mensagens são publicadas via MQTT.",
    "arch.msg.embedded": "Equipamentos embarcados executam ações.",

    "backend.msg.auth": "Autenticação e validação de segurança.",
    "backend.msg.api": "Processamento da requisição nas APIs.",
    "backend.msg.db": "Persistência e leitura no PostgreSQL.",
    "backend.msg.deploy": "Aplicação executando em ambiente cloud.",
    "backend.msg.logs": "Coleta de métricas e monitoramento.",

    "modal.industrial.title": "Plataforma de Automação Industrial",
    "modal.industrial.desc":
    "Arquitetura baseada em frontend web, APIs em Node/NestJS e comunicação com equipamentos embarcados via MQTT.",

    "modal.cloud.title": "Backend de APIs em Cloud",
    "modal.cloud.desc":
    "APIs escaláveis com autenticação, logs, banco PostgreSQL e deploy em cloud.",

    "modal.dashboard.title": "Dashboards Web",
    "modal.dashboard.desc":
    "Dashboards interativos focados em visualização de dados e relatórios analíticos."

  },

  en: {
    "hero.badge": "Developer & Automation Engineering Student",
    "hero.subtitle": "Control and Automation Engineering Student",
    "hero.stack": "Full Stack · Cloud · Integrated Systems",
    "scroll.more": "Scroll to see more",

    "about.title": "About me",
    "about.p1":
    "I am a Control and Automation Engineering student and a developer focused on building end-to-end systems.",
    "about.p2":
    "I work on complete solutions involving frontend, backend and cloud computing, as well as integration with embedded systems and industrial automation.",
    "about.p3":
    "I am interested in software architecture, system integration and scalability, always aiming to write clean, organized and maintainable code.",

    "cards.frontend.title": "Frontend",
    "cards.frontend.desc": "UI · UX · Performance",

    "cards.backend.title": "Backend",
    "cards.backend.desc": "APIs · Rules · Security",

    "cards.fullstack.title": "Full Stack",
    "cards.fullstack.desc": "Frontend · Backend · Cloud",

    "cards.integration.title": "Integration",
    "cards.integration.desc": "Web · APIs · Embedded Systems",

    "cards.architecture.title": "Architecture",
    "cards.architecture.desc": "Scalable systems",

    "cards.quality.title": "Quality",
    "cards.quality.desc": "Clean and reliable code",

    "cards.communication.title": "Communication",
    "cards.communication.desc": "Technical clarity",

    "cards.learning.title": "Learning",
    "cards.learning.desc": "Continuous improvement",

    "tech.title": "Technologies",
    "lang.title": "Languages",
    "projects.title": "Developed Solutions",
    "contact.title": "Contact",

    "career.title": "Professional Experience",

    "career.step.start": "Career Start",
    "career.step.extension": "First Extension Project",
    "career.step.industry": "Industrial Experience",
    "career.step.iot": "Engineering & IoT",
    "career.step.current": "Professional Role",

    "career.uepe.role": "Control and Automation Engineering",
    "career.uepe.desc":
    "Academic education focused on control systems, industrial automation, programming, and software-hardware integration, building a strong technical foundation for complex systems.",

    "career.informa.role": "Academic Extension Project · 2019 – 2020",
    "career.informa.desc":
    "First practical experience with software development, working on interactive mobile applications. Experience with frontend and backend in an academic environment, strengthening programming and system logic fundamentals.",

    "career.usiman.role": "Industrial Internship · Jan/2023 – Dec/2024",
    "career.usiman.desc":
    "Worked on industrial retrofit projects, supporting technical design and adaptation of components, as well as maintenance of industrial machines and equipment in a production environment.",

    "career.capricche.role": "Engineering & Projects Internship · Jan/2025 – Jun/2025",
    "career.capricche.desc":
    "Supported engineering projects with participation in IoT solutions applied to production processes, technical analysis, and continuous product quality improvement.",

    "career.tron.role": "Automation Systems Analyst · Jul/2025 – Present",
    "career.tron.desc":
    "Development and maintenance of automation systems integrated with software, creation of backend APIs and services using Node.js and NestJS, integration between industrial systems, web applications, and cloud platforms, including deployment and operation on Google Cloud Platform.",
    "projects.title": "Developed Solutions",

    "projects.industrial.title": "Industrial Automation Platform",
    "projects.industrial.desc": "Web system integrated with embedded equipment.",

    "projects.cloud.title": "Cloud API Backend",
    "projects.cloud.desc": "Scalable APIs with authentication and logging.",

    "projects.dashboard.title": "Web Dashboards",
    "projects.dashboard.desc": "Data visualization and analytical reports.",

    "contact.title": "Contact",
    "contact.email": "Email",
    "contact.phone": "Phone",

    "footer.name": "Davi Rio",

    "modal.node.frontend": "Web Frontend",
    "modal.node.api": "APIs",
    "modal.node.mqtt": "Messaging",
    "modal.node.database": "Database",
    "modal.node.embedded": "Equipment",
    "modal.node.embedded.sub": "Embedded Systems",

    "modal.node.auth": "Authentication",
    "modal.node.scalableApis": "Scalable APIs",
    "modal.node.deploy": "Cloud Deploy",
    "modal.node.logs": "Logs & Monitoring",

    "dashboard.sales": "Sales",
    "dashboard.users": "Users",
    "dashboard.growth": "Growth",

    "dashboard.days7": "7 days",
    "dashboard.days30": "30 days",
    "dashboard.days90": "90 days",
    "arch.msg.frontend": "User interacts with the Angular application.",
    "arch.msg.api": "API processes the request, validates and authenticates.",
    "arch.msg.db": "Data is persisted in PostgreSQL.",
    "arch.msg.mqtt": "Messages are published via MQTT.",
    "arch.msg.embedded": "Embedded equipment executes actions.",

    "backend.msg.auth": "Authentication and security validation.",
    "backend.msg.api": "API request processing.",
    "backend.msg.db": "PostgreSQL data persistence and reads.",
    "backend.msg.deploy": "Application running in cloud environment.",
    "backend.msg.logs": "Metrics collection and monitoring.",

    "modal.industrial.title": "Industrial Automation Platform",
    "modal.industrial.desc":
    "Architecture based on web frontend, Node/NestJS APIs and communication with embedded equipment via MQTT.",

    "modal.cloud.title": "Cloud API Backend",
    "modal.cloud.desc":
    "Scalable APIs with authentication, logs, PostgreSQL database and cloud deployment.",

    "modal.dashboard.title": "Web Dashboards",
    "modal.dashboard.desc":
    "Interactive dashboards focused on data visualization and analytical reports."


  },
};  

function t(key) {
  const lang = document.documentElement.lang.startsWith("pt")
    ? "pt"
    : "en";
  return translations[lang]?.[key] ?? key;
}


function setLanguage(lang) {
  const elements = document.querySelectorAll("[data-i18n]");

  elements.forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (translations[lang] && translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });

  document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
  localStorage.setItem("portfolioLang", lang);

  document
    .querySelectorAll(".lang-switch button")
    .forEach(btn => btn.classList.remove("active"));

  document
    .querySelector(`.lang-switch button[data-lang="${lang}"]`)
    ?.classList.add("active");
}

document.addEventListener("DOMContentLoaded", () => {
  const savedLang = localStorage.getItem("portfolioLang") || "pt";
  setLanguage(savedLang);

  document.querySelectorAll(".lang-switch button").forEach(btn => {
    btn.addEventListener("click", () => {
      const lang = btn.getAttribute("data-lang");
      setLanguage(lang);
    });
  });
});
