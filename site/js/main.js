document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- Vídeos da capa: alternam em loop com fade suave no corte ---------- */
/* (só roda em páginas que têm a capa, ex: index.html) */

if (document.getElementById('heroVideo1')) {
  const video1El = document.getElementById('heroVideo1');
  const isMobileHero = window.matchMedia('(max-width: 860px)').matches;

  // no celular a capa começa pelo vídeo 2, com o vídeo 1 (iphone) em segundo
  // lugar no rodízio. No desktop a ordem normal (vídeo 1 primeiro) continua.
  const heroVideos = isMobileHero
    ? [document.getElementById('heroVideo2'), video1El, document.getElementById('heroVideo3'), document.getElementById('heroVideo4')]
    : [video1El, document.getElementById('heroVideo2'), document.getElementById('heroVideo3'), document.getElementById('heroVideo4')];

  const video1Index = heroVideos.indexOf(video1El);

  if (isMobileHero) {
    video1El.classList.remove('is-active');
    video1El.pause();
    video1El.removeAttribute('autoplay');
    heroVideos[0].classList.add('is-active');
    heroVideos[0].preload = 'auto';
    heroVideos[0].load();
  }

  let heroVideoAtual = 0;

  // vídeo 1 pula a abertura e já entra na hora que a mão encosta na camisa
  const HERO_VIDEO_START = { [video1Index]: 1.6 };

  heroVideos.forEach(v => { v.muted = true; });

  // A troca entre vídeo vertical (celular) e horizontal (desktop) é feita pelo
  // próprio navegador via <source media="">, no HTML — nada de trocar o src por JS.
  // Isso evita o load()+play() concorrendo (causa clássica de vídeo travado no
  // primeiro frame, principalmente no Safari/iOS) e deixa o autoplay nativo cuidar
  // do vídeo 1 sozinho.

  const iniciarNoPontoCerto = (video, indice) => {
    const inicio = HERO_VIDEO_START[indice] || 0;
    if (!inicio) return;
    const aplicar = () => { video.currentTime = inicio; };
    if (video.readyState >= 1) aplicar();
    else video.addEventListener('loadedmetadata', aplicar, { once: true });
  };

  // rede de segurança: se por algum motivo o autoplay nativo não pegar, tenta de
  // novo em vários eventos de carregamento + um fallback por tempo
  const tocarQuandoPronto = (video, indice) => {
    let tocou = false;
    const tentar = () => {
      if (tocou || !video.paused) return;
      iniciarNoPontoCerto(video, indice);
      const promessa = video.play();
      if (promessa) promessa.then(() => { tocou = true; }).catch(() => {});
    };
    ['loadeddata', 'canplay', 'canplaythrough'].forEach(evento => {
      video.addEventListener(evento, tentar, { once: true });
    });
    if (video.readyState >= 2) tentar();
    setTimeout(tentar, 3000);
  };

  // só o vídeo ativo e o próximo da fila carregam de cada vez — os outros dois
  // ficam com preload="none" até chegar a vez deles. Com os 4 carregando juntos
  // (preload="auto" em todos) o celular disputava banda/decodificação entre eles
  // e isso travava a reprodução.
  const prepararProximoVideo = (indiceAtual) => {
    const proximo = heroVideos[(indiceAtual + 1) % heroVideos.length];
    if (proximo.preload !== 'auto') {
      proximo.preload = 'auto';
      proximo.load();
    }
  };

  const trocarHeroVideo = () => {
    const anterior = heroVideos[heroVideoAtual];
    heroVideoAtual = (heroVideoAtual + 1) % heroVideos.length;
    const proximo = heroVideos[heroVideoAtual];

    proximo.currentTime = HERO_VIDEO_START[heroVideoAtual] || 0;
    proximo.play().catch(() => {});
    proximo.classList.add('is-active');
    anterior.classList.remove('is-active');
    prepararProximoVideo(heroVideoAtual);

    setTimeout(() => {
      if (anterior !== heroVideos[heroVideoAtual]) anterior.pause();
    }, 900);
  };

  heroVideos.forEach(v => v.addEventListener('ended', trocarHeroVideo));

  iniciarNoPontoCerto(heroVideos[0], 0);
  tocarQuandoPronto(heroVideos[0], 0);
  prepararProximoVideo(0);
}


/* ---------- Product data ---------- */

const PRODUTOS = [
  {
    nome: 'Oversized Sunset Grid',
    desc: 'Estampa gradiente pôr do sol com grid neon',
    preco: 69.90,
    tag: 'Novo',
    gradiente: 'linear-gradient(160deg, #ff2d95, #ff8a3d)',
    imagens: ['img/produto-1-frente.png', 'img/produto-1-costas.png'],
    midias: [
      { tipo: 'img', src: 'img/produto-1-frente.png' },
      { tipo: 'img', src: 'img/produto-1-costas.png' },
      { tipo: 'video', src: 'video/produto-1-frente.mp4', inicio: 0.6 },
      { tipo: 'video', src: 'video/produto-1-costas.mp4' }
    ]
  },
  {
    nome: 'Oversized Neon Skyline',
    desc: 'Silhueta de skyline com contorno turquesa',
    preco: 69.90,
    tag: 'Novo',
    gradiente: 'linear-gradient(160deg, #2dd9c7, #5a2a8f)',
    imagens: ['img/produto-2-frente.png', 'img/produto-2-costas.jpg'],
    midias: [
      { tipo: 'img', src: 'img/produto-2-frente.png' },
      { tipo: 'img', src: 'img/produto-2-costas.jpg' },
      { tipo: 'video', src: 'video/produto-2-frente.mp4', inicio: 0.6 },
      { tipo: 'video', src: 'video/produto-2-costas.mp4' }
    ]
  },
  {
    nome: 'Oversized Vice Palms',
    desc: 'Palmeiras em contraluz sobre fundo quente',
    preco: 69.90,
    tag: '',
    gradiente: 'linear-gradient(160deg, #ff8a3d, #5a2a8f)',
    imagens: ['img/produto-3-frente.jpg', 'img/produto-3-costas.jpg'],
    midias: [
      { tipo: 'img', src: 'img/produto-3-frente.jpg' },
      { tipo: 'img', src: 'img/produto-3-costas.jpg' },
      { tipo: 'video', src: 'video/produto-3-frente.mp4' },
      { tipo: 'video', src: 'video/produto-3-costas.mp4' }
    ]
  },
  {
    nome: 'Oversized Midnight Drive',
    desc: 'Tom escuro com detalhe magenta neon',
    preco: 69.90,
    tag: 'Novo',
    gradiente: 'linear-gradient(160deg, #1a0b2e, #ff2d95)',
    imagens: ['img/produto-4-frente.png', 'img/produto-4-costas.png'],
    midias: [
      { tipo: 'img', src: 'img/produto-4-frente.png' },
      { tipo: 'img', src: 'img/produto-4-costas.png' },
      { tipo: 'video', src: 'video/produto-4-frente.mp4' },
      { tipo: 'video', src: 'video/produto-4-costas.mp4' }
    ]
  },
];

const TAMANHOS = ['P', 'M', 'G'];

/* ---------- Galeria de mídias do produto (frente/costas, foto/vídeo) ---------- */

const galleryModal = document.getElementById('galleryModal');
const galleryOverlay = document.getElementById('galleryOverlay');
const galleryStage = document.getElementById('galleryStage');
const galleryDots = document.getElementById('galleryDots');
const galleryClose = document.getElementById('galleryClose');
const galleryPrev = document.getElementById('galleryPrev');
const galleryNext = document.getElementById('galleryNext');

let galeriaMidias = [];
let galeriaIndice = 0;
let galeriaElementos = [];

// monta todos os elementos (fotos e vídeos) de uma vez só, escondidos, assim que a
// galeria abre — os vídeos já começam a baixar em segundo plano com preload="auto",
// então quando o usuário navega até eles não tem trava esperando carregar
function montarGaleriaElementos(midias){
  return midias.map((midia) => {
    if (midia.tipo === 'video') {
      const video = document.createElement('video');
      video.src = midia.src;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = 'auto';
      if (midia.inicio) {
        video.addEventListener('loadedmetadata', () => { video.currentTime = midia.inicio; }, { once: true });
      }
      return video;
    }
    const img = document.createElement('img');
    img.src = midia.src;
    img.alt = '';
    return img;
  });
}

function renderGaleriaAtual(){
  galeriaElementos.forEach((el, i) => {
    const ativo = i === galeriaIndice;
    el.classList.toggle('is-active', ativo);
    if (el.tagName === 'VIDEO') {
      if (ativo) el.play().catch(() => {});
      else el.pause();
    }
  });

  galleryDots.innerHTML = galeriaMidias.map((_, i) =>
    `<button type="button" class="gallery-dot${i === galeriaIndice ? ' is-active' : ''}" data-index="${i}" aria-label="Ver mídia ${i + 1}"></button>`
  ).join('');

  galleryDots.querySelectorAll('.gallery-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      galeriaIndice = Number(dot.dataset.index);
      renderGaleriaAtual();
    });
  });
}

function abrirGaleria(midias, nomeProduto){
  galeriaMidias = midias;
  galeriaIndice = 0;
  galleryStage.innerHTML = '';
  galeriaElementos = montarGaleriaElementos(midias);
  galeriaElementos.forEach(el => galleryStage.appendChild(el));
  renderGaleriaAtual();
  galleryModal.classList.add('open');
  galleryOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function fecharGaleria(){
  galleryModal.classList.remove('open');
  galleryOverlay.classList.remove('open');
  galeriaElementos.forEach(el => { if (el.tagName === 'VIDEO') el.pause(); });
  galleryStage.innerHTML = '';
  galeriaElementos = [];
  document.body.style.overflow = '';
}

function galeriaAnterior(){
  galeriaIndice = (galeriaIndice - 1 + galeriaMidias.length) % galeriaMidias.length;
  renderGaleriaAtual();
}

function galeriaProxima(){
  galeriaIndice = (galeriaIndice + 1) % galeriaMidias.length;
  renderGaleriaAtual();
}

if (galleryModal) {
  galleryClose.addEventListener('click', fecharGaleria);
  galleryOverlay.addEventListener('click', fecharGaleria);
  galleryPrev.addEventListener('click', galeriaAnterior);
  galleryNext.addEventListener('click', galeriaProxima);

  document.addEventListener('keydown', (e) => {
    if (!galleryModal.classList.contains('open')) return;
    if (e.key === 'Escape') fecharGaleria();
    if (e.key === 'ArrowLeft') galeriaAnterior();
    if (e.key === 'ArrowRight') galeriaProxima();
  });
}

const grid = document.getElementById('productGrid');

if (grid) {
  PRODUTOS.forEach((produto) => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.dataset.produto = produto.nome;

    const imagens = produto.imagens || ['img/mockup-1.png'];
    const imagensHtml = imagens.map((src, i) => `<img class="product-mockup${i === 0 ? ' is-active' : ''}" src="${src}" alt="" aria-hidden="true">`).join('');
    const temGaleria = Array.isArray(produto.midias) && produto.midias.length > 0;

    card.innerHTML = `
      <div class="product-media${temGaleria ? ' has-gallery' : ''}" style="background:${produto.gradiente}">
        ${produto.tag ? `<span class="product-tag">${produto.tag}</span>` : ''}
        ${imagensHtml}
        ${temGaleria ? `<button type="button" class="product-expand" aria-label="Ver fotos e vídeos do produto">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"></path><path d="M9 21H3v-6"></path><path d="M21 3l-7 7"></path><path d="M3 21l7-7"></path></svg>
        </button>` : ''}
      </div>
      <div class="product-info">
        <div class="product-name">${produto.nome}</div>
        <div class="product-desc">${produto.desc}</div>
        <div class="product-price">
          R$ ${produto.preco.toFixed(2).replace('.', ',')}
          <small>Preço de referência</small>
        </div>
        <div class="size-row" role="group" aria-label="Selecionar tamanho">
          ${TAMANHOS.map(t => `<button type="button" class="size-btn" data-size="${t}">${t}</button>`).join('')}
        </div>
        <button type="button" class="add-btn" disabled>Selecione um tamanho</button>
      </div>
    `;

    if (imagens.length > 1) {
      const fotos = card.querySelectorAll('.product-mockup');
      let fotoAtual = 0;
      setInterval(() => {
        fotos[fotoAtual].classList.remove('is-active');
        fotoAtual = (fotoAtual + 1) % fotos.length;
        fotos[fotoAtual].classList.add('is-active');
      }, 2600);
    }

    if (temGaleria) {
      const abrirGaleriaDoCard = () => abrirGaleria(produto.midias, produto.nome);
      card.querySelector('.product-media').addEventListener('click', abrirGaleriaDoCard);
    }

    const sizeBtns = card.querySelectorAll('.size-btn');
    const addBtn = card.querySelector('.add-btn');
    let tamanhoSelecionado = null;

    sizeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        sizeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        tamanhoSelecionado = btn.dataset.size;
        addBtn.disabled = false;
        addBtn.textContent = 'Adicionar ao carrinho';
      });
    });

    addBtn.addEventListener('click', () => {
      if (!tamanhoSelecionado) return;
      adicionarAoCarrinho({
        nome: produto.nome,
        tamanho: tamanhoSelecionado,
        preco: produto.preco
      });
      mostrarToast(`${produto.nome} (${tamanhoSelecionado}) adicionado ao carrinho`);
    });

    grid.appendChild(card);
  });
}

/* ---------- Carrinho ---------- */

let carrinho = [];

function adicionarAoCarrinho(item){
  carrinho.push(item);
  renderCarrinho();
  atualizarContador();
}

function removerDoCarrinho(index){
  carrinho.splice(index, 1);
  renderCarrinho();
  atualizarContador();
}

function atualizarContador(){
  document.getElementById('cartCount').textContent = carrinho.length;
}

function renderCarrinho(){
  const container = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');

  if (carrinho.length === 0){
    container.innerHTML = '<p class="cart-empty">Seu carrinho tá vazio por enquanto.</p>';
    totalEl.textContent = 'R$ 0,00';
    return;
  }

  container.innerHTML = carrinho.map((item, i) => `
    <div class="cart-item">
      <div>
        <div class="cart-item-name">${item.nome}</div>
        <div class="cart-item-meta">Tamanho ${item.tamanho} · R$ ${item.preco.toFixed(2).replace('.', ',')}</div>
      </div>
      <button class="cart-item-remove" data-index="${i}" aria-label="Remover">&times;</button>
    </div>
  `).join('');

  container.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', () => removerDoCarrinho(Number(btn.dataset.index)));
  });

  const total = carrinho.reduce((acc, item) => acc + item.preco, 0);
  totalEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

/* ---------- Cart drawer toggle ---------- */

const cartBtn = document.getElementById('cartBtn');
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const cartClose = document.getElementById('cartClose');

function abrirCarrinho(){
  cartDrawer.classList.add('open');
  cartOverlay.classList.add('open');
}

function fecharCarrinho(){
  cartDrawer.classList.remove('open');
  cartOverlay.classList.remove('open');
}

cartBtn.addEventListener('click', abrirCarrinho);
cartClose.addEventListener('click', fecharCarrinho);
cartOverlay.addEventListener('click', fecharCarrinho);

/* ---------- Mobile nav ---------- */

const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');

menuToggle.addEventListener('click', () => {
  mainNav.classList.toggle('open');
});

mainNav.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => mainNav.classList.remove('open'));
});

/* ---------- Toast ---------- */

let toastTimer;
function mostrarToast(mensagem){
  const toast = document.getElementById('toast');
  toast.textContent = mensagem;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}
