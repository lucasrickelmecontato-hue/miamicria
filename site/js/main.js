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
      <div class="product-price">
        R$ ${produto.preco.toFixed(2).replace('.', ',')}
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

// do mais barato pro mais caro, sempre
function ordenarPorPreco(produtos){
  return [...produtos].sort((a, b) => a.preco - b.preco);
}

/* ---------- Grid da home ---------- */

const grid = document.getElementById('productGrid');

if (grid) {
  ordenarPorPreco(PRODUTOS).forEach((produto) => grid.appendChild(criarCardProduto(produto)));
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
  document.getElementById('produtoPreco').textContent = `R$ ${produto.preco.toFixed(2).replace('.', ',')}`;

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
  ordenarPorPreco(PRODUTOS.filter(p => p.id !== produto.id)).forEach(p => outrosGrid.appendChild(criarCardProduto(p)));
}

/* ---------- Confirmação do pedido (pedido.html) ---------- */

const pedidoCard = document.getElementById('pedidoCard');

if (pedidoCard) {
  const params = new URLSearchParams(window.location.search);
  const paymentId = params.get('payment_id') || params.get('collection_id');

  const STATUS_PEDIDO = {
    approved: { titulo: 'Pedido aprovado!', classe: 'pedido-aprovado', texto: 'Seu pagamento foi confirmado. Já estamos preparando seu pedido.' },
    pending: { titulo: 'Pagamento pendente', classe: 'pedido-pendente', texto: 'Assim que o pagamento for confirmado, seu pedido entra em preparação.' },
    in_process: { titulo: 'Pagamento em análise', classe: 'pedido-pendente', texto: 'Seu pagamento está sendo analisado, pode levar algumas horas.' },
    rejected: { titulo: 'Pagamento não aprovado', classe: 'pedido-recusado', texto: 'Seu pagamento não foi aprovado. Você pode tentar novamente.' },
  };

  const formatarData = (iso) => {
    if (!iso) return '-';
    return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const renderizarSemPedido = () => {
    pedidoCard.innerHTML = `
      <h1 class="pedido-titulo">Nenhum pedido encontrado</h1>
      <p class="pedido-texto">Não achamos nenhum pedido nesse link. Se você acabou de comprar, confere seu WhatsApp ou fala com a gente.</p>
      <a href="index.html#camisetas" class="btn btn-primary btn-block">Voltar pra loja</a>
    `;
  };

  const renderizarErro = () => {
    pedidoCard.innerHTML = `
      <h1 class="pedido-titulo">Não conseguimos carregar seu pedido</h1>
      <p class="pedido-texto">Pode ser algo temporário. Se o problema continuar, chama a gente no WhatsApp que resolvemos.</p>
      <a href="contato.html" class="btn btn-primary btn-block">Falar no WhatsApp</a>
    `;
  };

  const renderizarPedido = (dados) => {
    const info = STATUS_PEDIDO[dados.status] || { titulo: 'Status do pedido', classe: '', texto: '' };
    const parcelasTexto = dados.parcelas > 1 ? ` em ${dados.parcelas}x` : '';

    pedidoCard.innerHTML = `
      <div class="pedido-status ${info.classe}">${info.titulo}</div>
      <p class="pedido-texto">${info.texto}</p>

      <div class="pedido-detalhes">
        <div class="pedido-linha">
          <span>Produtos</span>
          <span>${dados.produtos || '-'}</span>
        </div>
        <div class="pedido-linha">
          <span>Tamanho</span>
          <span>${dados.tamanhos || '-'}</span>
        </div>
        <div class="pedido-linha">
          <span>Forma de pagamento</span>
          <span>${dados.metodo}${parcelasTexto}</span>
        </div>
        <div class="pedido-linha">
          <span>Data e hora</span>
          <span>${formatarData(dados.data)}</span>
        </div>
        <div class="pedido-linha pedido-linha-total">
          <span>Valor pago</span>
          <span>R$ ${Number(dados.valor).toFixed(2).replace('.', ',')}</span>
        </div>
      </div>

      <a href="index.html#camisetas" class="btn btn-ghost btn-block">Continuar comprando</a>
    `;
  };

  if (!paymentId) {
    renderizarSemPedido();
  } else {
    fetch(`https://miamicria.netlify.app/.netlify/functions/get-payment-status?payment_id=${encodeURIComponent(paymentId)}`)
      .then((r) => { if (!r.ok) throw new Error('erro ao buscar pedido'); return r.json(); })
      .then(renderizarPedido)
      .catch(renderizarErro);
  }
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
  const checkoutBtn = document.getElementById('checkoutBtn');

  checkoutBtn.disabled = carrinho.length === 0;

  if (carrinho.length === 0){
    container.innerHTML = '<p class="cart-empty">Seu carrinho tá vazio por enquanto.</p>';
    subtotalEl.textContent = formatarPreco(0);
    freteEl.textContent = '—';
    totalEl.textContent = formatarPreco(0);
    resetarFormularioEndereco();
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

/* ---------- Checkout (Mercado Pago) ---------- */

const checkoutBtn = document.getElementById('checkoutBtn');
const cartEndereco = document.getElementById('cartEndereco');
let enderecoAberto = false;

function resetarFormularioEndereco(){
  enderecoAberto = false;
  cartEndereco.hidden = true;
  checkoutBtn.textContent = 'Finalizar compra';
  cartEndereco.querySelectorAll('input').forEach(input => { input.value = ''; });
}

function coletarEndereco(){
  return {
    nome: document.getElementById('entNome').value.trim(),
    telefone: document.getElementById('entTelefone').value.trim(),
    cep: document.getElementById('entCep').value.trim(),
    numero: document.getElementById('entNumero').value.trim(),
    rua: document.getElementById('entRua').value.trim(),
    complemento: document.getElementById('entComplemento').value.trim(),
    bairro: document.getElementById('entBairro').value.trim(),
    cidade: document.getElementById('entCidade').value.trim(),
    estado: document.getElementById('entEstado').value.trim(),
  };
}

checkoutBtn.addEventListener('click', async () => {
  if (carrinho.length === 0) return;

  if (!enderecoAberto) {
    enderecoAberto = true;
    cartEndereco.hidden = false;
    checkoutBtn.textContent = 'Confirmar e pagar';
    document.getElementById('entNome').focus();
    return;
  }

  const endereco = coletarEndereco();
  const camposObrigatorios = ['nome', 'telefone', 'cep', 'numero', 'rua', 'bairro', 'cidade', 'estado'];
  const faltando = camposObrigatorios.some((campo) => !endereco[campo]);
  if (faltando) {
    mostrarToast('Preenche todos os campos de endereço pra continuar');
    return;
  }

  const textoOriginal = checkoutBtn.textContent;
  checkoutBtn.disabled = true;
  checkoutBtn.textContent = 'Gerando pagamento...';

  try {
    // o site fica no GitHub Pages e a funcao de checkout fica no Netlify -
    // dominios diferentes, por isso a URL completa em vez de caminho relativo
    const resposta = await fetch('https://miamicria.netlify.app/.netlify/functions/create-preference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itens: carrinho, endereco }),
    });
    const dados = await resposta.json();

    if (!resposta.ok || !dados.init_point) throw new Error('sem init_point');

    window.location.href = dados.init_point;
  } catch (err) {
    mostrarToast('Não deu pra abrir o pagamento agora. Tenta de novo em instantes.');
    checkoutBtn.disabled = false;
    checkoutBtn.textContent = textoOriginal;
  }
});

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
  resetarFormularioEndereco();
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
