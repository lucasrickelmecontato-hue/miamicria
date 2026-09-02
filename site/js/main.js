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


/* ---------- Card de produto (usado na home e na lista "outros produtos") ---------- */

function criarCardProduto(produto){
  const card = document.createElement('article');
  card.className = 'product-card';
  card.dataset.produto = produto.nome;

  const imagens = produto.imagens || ['img/mockup-1.png'];
  const imagensHtml = imagens.map((src, i) => `<img class="product-mockup${i === 0 ? ' is-active' : ''}" src="${src}" alt="" aria-hidden="true">`).join('');

  card.innerHTML = `
    <div class="product-media has-gallery" style="background:${produto.gradiente}">
      ${produto.tag ? `<span class="product-tag">${produto.tag}</span>` : ''}
      ${imagensHtml}
      <button type="button" class="product-expand" aria-label="Ver produto">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"></path><path d="M9 21H3v-6"></path><path d="M21 3l-7 7"></path><path d="M3 21l7-7"></path></svg>
      </button>
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

  // o box inteiro leva pro produto, menos os controles de tamanho/carrinho
  const irParaProduto = () => { window.location.href = `produto.html?id=${produto.id}`; };
  card.style.cursor = 'pointer';
  card.addEventListener('click', (e) => {
    if (e.target.closest('.size-row') || e.target.closest('.add-btn')) return;
    irParaProduto();
  });

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

  return card;
}

/* ---------- Grid da home ---------- */

const grid = document.getElementById('productGrid');

if (grid) {
  PRODUTOS.forEach((produto) => grid.appendChild(criarCardProduto(produto)));
}

/* ---------- Página de produto (produto.html) ---------- */

const produtoDetalhe = document.getElementById('produtoDetalhe');

if (produtoDetalhe) {
  const idProduto = new URLSearchParams(window.location.search).get('id');
  const produto = PRODUTOS.find(p => p.id === idProduto) || PRODUTOS[0];

  document.title = `${produto.nome} — Miami Cria`;

  let midiaAtual = 0;
  const midias = produto.midias || (produto.imagens || ['img/mockup-1.png']).map(src => ({ tipo: 'img', src }));

  const stage = document.getElementById('produtoStage');
  const thumbs = document.getElementById('produtoThumbs');

  function renderMidiaAtual(){
    stage.querySelectorAll('img, video').forEach(el => {
      el.classList.remove('is-active');
      if (el.tagName === 'VIDEO') el.pause();
    });
    const el = stage.children[midiaAtual];
    el.classList.add('is-active');
    if (el.tagName === 'VIDEO') el.play().catch(() => {});

    thumbs.querySelectorAll('.produto-thumb').forEach((thumb, i) => thumb.classList.toggle('is-active', i === midiaAtual));
  }

  stage.innerHTML = midias.map((midia) => {
    let estilo = '';
    if (midia.crop) {
      const posicao = midia.crop.position ? `object-position:${midia.crop.position};` : '';
      estilo = ` style="transform:scale(${midia.crop.scale});transform-origin:${midia.crop.origin};${posicao}"`;
    }
    return midia.tipo === 'video'
      ? `<video src="${midia.src}" muted loop playsinline preload="auto"${estilo}></video>`
      : `<img src="${midia.src}" alt=""${estilo}>`;
  }).join('');

  stage.querySelectorAll('video').forEach((video, i) => {
    const inicio = midias[i].inicio;
    if (inicio) video.addEventListener('loadedmetadata', () => { video.currentTime = inicio; }, { once: true });
  });

  thumbs.innerHTML = midias.map((midia, i) => `
    <button type="button" class="produto-thumb" data-index="${i}" aria-label="Ver mídia ${i + 1}">
      ${midia.tipo === 'video'
        ? `<video src="${midia.src}" muted playsinline preload="metadata"></video><span class="produto-thumb-play">▶</span>`
        : `<img src="${midia.src}" alt="">`}
    </button>
  `).join('');
  thumbs.querySelectorAll('.produto-thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      midiaAtual = Number(thumb.dataset.index);
      renderMidiaAtual();
    });
  });

  const voltarMidia = () => {
    midiaAtual = (midiaAtual - 1 + midias.length) % midias.length;
    renderMidiaAtual();
  };
  const avancarMidia = () => {
    midiaAtual = (midiaAtual + 1) % midias.length;
    renderMidiaAtual();
  };

  document.getElementById('produtoPrev').addEventListener('click', voltarMidia);
  document.getElementById('produtoNext').addEventListener('click', avancarMidia);

  // no celular os botões de seta somem (vira arrastar/swipe pra trocar de foto)
  const stageWrap = document.querySelector('.produto-stage-wrap');
  let arrastoX = null;
  stageWrap.addEventListener('pointerdown', (e) => { arrastoX = e.clientX; });
  stageWrap.addEventListener('pointerup', (e) => {
    if (arrastoX === null) return;
    const delta = e.clientX - arrastoX;
    arrastoX = null;
    if (Math.abs(delta) < 40) return;
    if (delta < 0) avancarMidia();
    else voltarMidia();
  });
  stageWrap.addEventListener('pointercancel', () => { arrastoX = null; });

  renderMidiaAtual();

  document.getElementById('produtoNome').textContent = produto.nome;
  document.getElementById('produtoDesc').textContent = produto.desc;
  document.getElementById('produtoPreco').innerHTML = `R$ ${produto.preco.toFixed(2).replace('.', ',')} <small>Preço de referência</small>`;

  const sizeRow = document.getElementById('produtoTamanhos');
  sizeRow.innerHTML = TAMANHOS.map(t => `<button type="button" class="size-btn" data-size="${t}">${t}</button>`).join('');

  const sizeBtns = sizeRow.querySelectorAll('.size-btn');
  const addBtn = document.getElementById('produtoAddBtn');
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

  // quantidade
  let quantidade = 1;
  const qtdValor = document.getElementById('produtoQtdValor');
  document.getElementById('produtoQtdMenos').addEventListener('click', () => {
    quantidade = Math.max(1, quantidade - 1);
    qtdValor.textContent = quantidade;
  });
  document.getElementById('produtoQtdMais').addEventListener('click', () => {
    quantidade = Math.min(10, quantidade + 1);
    qtdValor.textContent = quantidade;
  });

  addBtn.addEventListener('click', () => {
    if (!tamanhoSelecionado) return;
    for (let i = 0; i < quantidade; i++) {
      adicionarAoCarrinho({ nome: produto.nome, tamanho: tamanhoSelecionado, preco: produto.preco });
    }
    mostrarToast(`${produto.nome} (${tamanhoSelecionado}) adicionado ao carrinho`);
  });

  const outrosGrid = document.getElementById('outrosProdutosGrid');
  PRODUTOS.filter(p => p.id !== produto.id).forEach(p => outrosGrid.appendChild(criarCardProduto(p)));
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

const FRETE_FIXO = 19.90;

function formatarPreco(valor){
  return `R$ ${valor.toFixed(2).replace('.', ',')}`;
}

function renderCarrinho(){
  const container = document.getElementById('cartItems');
  const subtotalEl = document.getElementById('cartSubtotal');
  const freteEl = document.getElementById('cartFrete');
  const totalEl = document.getElementById('cartTotal');

  if (carrinho.length === 0){
    container.innerHTML = '<p class="cart-empty">Seu carrinho tá vazio por enquanto.</p>';
    subtotalEl.textContent = formatarPreco(0);
    freteEl.textContent = '—';
    totalEl.textContent = formatarPreco(0);
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

  const subtotal = carrinho.reduce((acc, item) => acc + item.preco, 0);
  subtotalEl.textContent = formatarPreco(subtotal);
  freteEl.textContent = formatarPreco(FRETE_FIXO);
  totalEl.textContent = formatarPreco(subtotal + FRETE_FIXO);
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
