document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- Vídeos da capa: alternam em loop com fade suave no corte ---------- */
/* (só roda em páginas que têm a capa, ex: index.html) */

if (document.getElementById('heroVideo1')) {
  const heroVideos = [document.getElementById('heroVideo1'), document.getElementById('heroVideo2'), document.getElementById('heroVideo3'), document.getElementById('heroVideo4')];
  let heroVideoAtual = 0;

  // vídeo 1 pula a abertura e já entra na hora que a mão encosta na camisa
  const HERO_VIDEO_START = { 0: 1.6 };

  heroVideos.forEach(v => { v.muted = true; });

  /* Vídeos verticais dedicados pro celular (evita cortar quem tá na cena) */
  const heroVideoMobileQuery = window.matchMedia('(max-width: 860px)');
  let heroVideoModoMobile = null;

  const aplicarFonteHeroVideo = (video) => {
    const mobile = heroVideoMobileQuery.matches;
    const fonte = mobile ? video.dataset.mobile : video.dataset.desktop;
    if (video.dataset.fonteAtual === fonte) return;
    video.dataset.fonteAtual = fonte;
    video.src = fonte;
    video.load();
  };

  const iniciarNoPontoCerto = (video, indice) => {
    const inicio = HERO_VIDEO_START[indice] || 0;
    if (!inicio) return;
    const aplicar = () => { video.currentTime = inicio; };
    if (video.readyState >= 1) aplicar();
    else video.addEventListener('loadedmetadata', aplicar, { once: true });
  };

  const sincronizarFontesHeroVideo = () => {
    const mobile = heroVideoMobileQuery.matches;
    if (mobile === heroVideoModoMobile) return;
    heroVideoModoMobile = mobile;

    heroVideos.forEach((v, i) => {
      const estavaAtivo = v.classList.contains('is-active');
      aplicarFonteHeroVideo(v);
      if (estavaAtivo) {
        iniciarNoPontoCerto(v, i);
        v.play().catch(() => {});
      }
    });
  };

  const trocarHeroVideo = () => {
    const anterior = heroVideos[heroVideoAtual];
    heroVideoAtual = (heroVideoAtual + 1) % heroVideos.length;
    const proximo = heroVideos[heroVideoAtual];

    proximo.currentTime = HERO_VIDEO_START[heroVideoAtual] || 0;
    proximo.play().catch(() => {});
    proximo.classList.add('is-active');
    anterior.classList.remove('is-active');

    setTimeout(() => {
      if (anterior !== heroVideos[heroVideoAtual]) anterior.pause();
    }, 900);
  };

  heroVideos.forEach(v => v.addEventListener('ended', trocarHeroVideo));

  sincronizarFontesHeroVideo();
  iniciarNoPontoCerto(heroVideos[0], 0);
  const heroVideoPromise = heroVideos[0].play();
  if (heroVideoPromise) heroVideoPromise.catch(() => {});

  heroVideoMobileQuery.addEventListener('change', sincronizarFontesHeroVideo);
}

/* ---------- Header: opacidade 0 no topo, aparece ao rolar ---------- */
/* (só em páginas com capa de vídeo; nas outras o header já nasce visível) */

const siteHeader = document.getElementById('siteHeader');

if (document.querySelector('.hero')) {
  let headerFadeDistance = window.innerHeight * 0.55;

  const atualizarOpacidadeHeader = () => {
    const scrollY = window.scrollY || window.pageYOffset;
    const opacidade = Math.min(scrollY / headerFadeDistance, 1);
    siteHeader.style.opacity = opacidade;
    siteHeader.style.pointerEvents = opacidade < 0.05 ? 'none' : 'auto';
  };

  window.addEventListener('scroll', atualizarOpacidadeHeader, { passive: true });
  window.addEventListener('resize', () => {
    headerFadeDistance = window.innerHeight * 0.55;
    atualizarOpacidadeHeader();
  });
  atualizarOpacidadeHeader();
} else {
  siteHeader.style.opacity = 1;
}

/* ---------- Product data ---------- */

const PRODUTOS = [
  {
    nome: 'Oversized Sunset Grid',
    desc: 'Estampa gradiente pôr do sol com grid neon',
    preco: 129.90,
    tag: 'Novo',
    gradiente: 'linear-gradient(160deg, #ff2d95, #ff8a3d)'
  },
  {
    nome: 'Oversized Neon Skyline',
    desc: 'Silhueta de skyline com contorno turquesa',
    preco: 129.90,
    tag: 'Novo',
    gradiente: 'linear-gradient(160deg, #2dd9c7, #5a2a8f)'
  },
  {
    nome: 'Oversized Vice Palms',
    desc: 'Palmeiras em contraluz sobre fundo quente',
    preco: 119.90,
    tag: '',
    gradiente: 'linear-gradient(160deg, #ff8a3d, #5a2a8f)'
  },
  {
    nome: 'Oversized Midnight Drive',
    desc: 'Tom escuro com detalhe magenta neon',
    preco: 139.90,
    tag: 'Edição limitada',
    gradiente: 'linear-gradient(160deg, #1a0b2e, #ff2d95)'
  },
  {
    nome: 'Oversized Coastal Heat',
    desc: 'Amarelo dourado com respingo rosa',
    preco: 119.90,
    tag: '',
    gradiente: 'linear-gradient(160deg, #ffc35c, #ff2d95)'
  },
  {
    nome: 'Oversized Retro Wave',
    desc: 'Roxo profundo com onda turquesa',
    preco: 129.90,
    tag: 'Novo',
    gradiente: 'linear-gradient(160deg, #5a2a8f, #2dd9c7)'
  }
];

const TAMANHOS = ['P', 'M', 'G'];

const grid = document.getElementById('productGrid');

if (grid) {
  PRODUTOS.forEach((produto) => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.dataset.produto = produto.nome;

    card.innerHTML = `
      <div class="product-media" style="background:${produto.gradiente}">
        ${produto.tag ? `<span class="product-tag">${produto.tag}</span>` : ''}
        <img class="product-mockup" src="img/mockup-1.png" alt="" aria-hidden="true">
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
