// Serve a pagina do painel de produtos direto por essa funcao, em vez de um
// arquivo estatico dentro de site/ - assim ela nunca fica publicada no
// dominio da loja (miamicria.com.br via GitHub Pages), so existe no dominio
// do Netlify, num caminho que nao esta linkado em nenhum lugar do site
// publico (ver netlify.toml pro atalho /painel -> essa funcao).
//
// Ainda assim exige a senha (ADMIN_SENHA) pra qualquer acao de escrita -
// ver netlify/functions/admin-produtos.js, que e quem de fato valida e
// grava as mudancas no repositorio.

const HTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title>Painel de produtos — Miami Cria</title>
<link rel="icon" href="/img/logo.png">
<style>
  :root{
    --bg: #150a24;
    --card: #1e0f36;
    --border: rgba(255,255,255,0.1);
    --white: #fdf6ff;
    --teal: #2dd9c7;
    --magenta: #ff2d95;
    --muted: rgba(255,255,255,0.55);
  }
  *{box-sizing:border-box; margin:0; padding:0;}
  body{
    background: var(--bg);
    color: var(--white);
    font-family: 'Inter', system-ui, sans-serif;
    padding: 20px 16px 60px;
    line-height: 1.4;
  }
  h1{font-size: 22px; margin-bottom: 4px;}
  p.subtitulo{color: var(--muted); font-size: 13px; margin-bottom: 24px;}
  .card{
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 18px;
    margin-bottom: 20px;
  }
  label{display:block; font-size: 12px; color: var(--muted); margin: 12px 0 4px; text-transform: uppercase; letter-spacing: 0.04em;}
  input[type="text"], input[type="password"], input[type="number"], textarea{
    width: 100%;
    background: rgba(255,255,255,0.05);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 11px 12px;
    color: var(--white);
    font-size: 15px;
    font-family: inherit;
  }
  textarea{resize: vertical; min-height: 60px;}
  .checkbox-row{display:flex; align-items:center; gap: 8px; margin-top: 14px;}
  .checkbox-row input{width: 18px; height: 18px;}
  .checkbox-row label{margin:0; text-transform: none; font-size: 14px; color: var(--white);}
  button{
    font-family: inherit;
    font-size: 15px;
    font-weight: 600;
    border-radius: 999px;
    padding: 12px 20px;
    border: 1px solid var(--teal);
    background: transparent;
    color: var(--white);
    cursor: pointer;
    width: 100%;
    margin-top: 16px;
  }
  button:hover{background: rgba(45,217,199,0.15);}
  button.btn-perigo{border-color: var(--magenta);}
  button.btn-perigo:hover{background: rgba(255,45,149,0.15);}
  button:disabled{opacity: 0.5; cursor: not-allowed;}
  .produto-item{
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 14px;
    margin-bottom: 10px;
  }
  .produto-item-topo{display:flex; justify-content:space-between; align-items:flex-start; gap: 8px;}
  .produto-item-nome{font-weight: 700; font-size: 15px;}
  .produto-item-preco{color: var(--teal); font-size: 13px;}
  .produto-item-id{color: var(--muted); font-size: 11px;}
  .produto-item-acoes{display:flex; flex-wrap: wrap; gap: 8px; margin-top: 12px;}
  .produto-item-acoes button{flex: 1 1 100px; margin-top:0; padding: 9px 4px; font-size: 13px;}
  .tag-esgotado{
    background: rgba(255,45,149,0.2);
    color: var(--magenta);
    font-size: 11px;
    text-transform: uppercase;
    padding: 3px 8px;
    border-radius: 999px;
    white-space: nowrap;
  }
  .msg{font-size: 13px; margin-top: 10px; min-height: 18px;}
  .msg.erro{color: var(--magenta);}
  .msg.sucesso{color: var(--teal);}
  #areaLogada{display:none;}
  .ajuda{font-size: 12px; color: var(--muted); margin-top: 6px;}
  .foto-bloco{display:flex; gap: 12px; align-items:flex-start;}
  .foto-preview{
    width: 84px; height: 84px; flex: 0 0 84px;
    object-fit: cover; border-radius: 10px;
    border: 1px dashed var(--border);
    background: rgba(255,255,255,0.04);
  }
  .foto-preview:not([src]), .foto-preview[src=""]{visibility: hidden;}
  .foto-controles{flex: 1; min-width: 0;}
  .btn-foto{
    display:block; text-align:center;
    margin: 0 0 8px; padding: 11px 12px;
    border: 1px solid var(--teal); border-radius: 999px;
    color: var(--white); font-size: 14px; font-weight: 600;
    text-transform: none; letter-spacing: 0; cursor: pointer;
  }
  .btn-foto:hover{background: rgba(45,217,199,0.15);}
  .btn-foto.ocupado{opacity: 0.5; pointer-events: none;}
  .arq-escondido{position:absolute; width:1px; height:1px; opacity:0; pointer-events:none;}
  .foto-controles input[type="text"]{font-size: 13px; padding: 9px 10px;}
  .foto-controles .msg{margin-top: 4px;}
  .tipo-opcoes{display:flex; gap: 8px;}
  .tipo-opcao{
    flex: 1; display:flex; align-items:center; justify-content:center; gap: 6px;
    border: 1px solid var(--border); border-radius: 10px; padding: 12px 8px;
    margin: 0; font-size: 14px; color: var(--white); text-transform: none; letter-spacing: 0;
    cursor: pointer; text-align: center;
  }
  .tipo-opcao input{position:absolute; opacity:0; pointer-events:none;}
  .tipo-opcao:has(input:checked){border-color: var(--teal); background: rgba(45,217,199,0.12);}
  .cores-presets{display:flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;}
  .chip-cor{
    width: auto; margin: 0; padding: 8px 14px; font-size: 13px;
    display:inline-flex; align-items:center; gap: 8px;
    border-color: var(--border);
  }
  .chip-cor.ativo{border-color: var(--teal); background: rgba(45,217,199,0.15);}
  .chip-bolinha{width: 14px; height: 14px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.4); flex: 0 0 14px;}
  .cor-item{border: 1px solid var(--border); border-radius: 10px; padding: 12px; margin-top: 12px;}
  .cor-item-topo{display:flex; gap: 8px; align-items:center; margin-bottom: 10px;}
  .cor-item-topo input[type="color"]{width: 42px; height: 42px; flex: 0 0 42px; border: 1px solid var(--border); border-radius: 8px; background: transparent; padding: 2px; cursor: pointer;}
  .cor-item-topo input[type="text"]{flex: 1; min-width: 0;}
  .cor-item-topo .cor-remover{width: auto; margin: 0; padding: 10px 14px; border-color: var(--magenta); font-size: 13px;}
  .cor-item .foto-bloco + .foto-bloco{margin-top: 10px;}
  select{
    width: 100%; background: rgba(255,255,255,0.05); border: 1px solid var(--border);
    border-radius: 8px; padding: 11px 12px; color: var(--white); font-size: 15px; font-family: inherit;
  }
  select option{background: var(--card);}
  .badge-drop{
    display:inline-block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
    padding: 2px 8px; border-radius: 999px; color: #fff;
    background: linear-gradient(135deg, var(--magenta), #ff8a3d); vertical-align: middle;
  }
  .ordem-item{
    display:flex; align-items:center; gap: 10px;
    border: 1px solid var(--border); border-radius: 10px; padding: 8px; margin-bottom: 6px;
    background: var(--card);
  }
  .ordem-item.movido{border-color: var(--teal);}
  .ordem-pos{width: 22px; text-align:center; color: var(--muted); font-size: 13px; flex: 0 0 22px;}
  .ordem-item img{width: 44px; height: 44px; object-fit: cover; border-radius: 6px; flex: 0 0 44px; background: rgba(255,255,255,0.05);}
  .ordem-nome{flex: 1; min-width: 0; font-size: 13px; font-weight: 600; overflow-wrap: anywhere;}
  .ordem-setas{display:flex; gap: 6px; flex: 0 0 auto;}
  .ordem-setas button{width: 40px; height: 40px; margin: 0; padding: 0; font-size: 16px; border-color: var(--border);}
  .botoes-ordem{display:flex; flex-wrap: wrap; gap: 8px; margin: 10px 0;}
  .botoes-ordem button{flex: 1 1 140px; margin: 0; padding: 10px 8px; font-size: 13px;}
  .cor-item .lado-titulo{font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 4px;}
</style>
</head>
<body>

<h1>Painel de produtos</h1>
<p class="subtitulo">Adicionar, editar, marcar como esgotado ou remover produtos do site.</p>

<div class="card" id="areaLogin">
  <label for="campoSenha">Senha</label>
  <input type="password" id="campoSenha" placeholder="Senha do painel" autocomplete="current-password">
  <button id="btnEntrar">Entrar</button>
  <p class="msg" id="msgLogin"></p>
</div>

<div id="areaLogada">

  <div class="card">
    <h2 style="font-size:16px; margin-bottom:8px;">Produtos no site</h2>
    <div id="listaProdutos"></div>
    <p class="msg" id="msgLista"></p>
  </div>

  <div class="card">
    <h2 style="font-size:16px; margin-bottom:4px;">Ordem no site</h2>
    <p class="ajuda" style="margin-top:0;">Use as setas pra escolher a ordem em que as camisetas aparecem no site (o primeiro da lista é o primeiro da vitrine). Depois clique em Salvar ordem. Produto novo entra automaticamente em primeiro lugar.</p>
    <div class="botoes-ordem">
      <button type="button" id="btnOrdemDrop">Drop mais novo primeiro</button>
      <button type="button" id="btnOrdemDesfazer" style="border-color: var(--border);">Desfazer mudanças</button>
    </div>
    <div id="listaOrdem"></div>
    <button type="button" id="btnSalvarOrdem" disabled>Salvar ordem</button>
    <p class="msg" id="msgOrdem"></p>
  </div>

  <div class="card">
    <h2 style="font-size:16px; margin-bottom:8px;" id="tituloForm">Novo produto</h2>

    <label for="fId">Id (usado na URL, ex: vice-sunset)</label>
    <input type="text" id="fId" placeholder="minha-camiseta">
    <p class="ajuda">Só letras minúsculas, números e hífen. Não pode ser mudado depois de criado.</p>

    <label for="fNome">Nome</label>
    <input type="text" id="fNome" placeholder="Ex: Vice Sunset">

    <label for="fDesc">Descrição curta</label>
    <textarea id="fDesc" placeholder="Ex: Estampa GTA VI com paleta de pôr do sol"></textarea>

    <label for="fPreco">Preço (R$)</label>
    <input type="number" id="fPreco" step="0.01" placeholder="79.90">

    <label for="fTag">Tag (opcional, ex: Novo, Collab)</label>
    <input type="text" id="fTag" placeholder="Novo">

    <label>Tipo de produto</label>
    <div class="tipo-opcoes">
      <label class="tipo-opcao"><input type="radio" name="fTipo" value="camiseta" checked>👕 Camiseta (P, M, G...)</label>
      <label class="tipo-opcao"><input type="radio" name="fTipo" value="objeto">🧸 Objeto (sem tamanho)</label>
    </div>
    <p class="ajuda">Objeto = caneca, boneco, chaveiro... No site ele aparece sem escolha de tamanho e sem tabela de medidas.</p>

    <label for="fDrop">Drop (coleção)</label>
    <select id="fDrop">
      <option value="1">Drop 1 (produtos que já estavam no site)</option>
      <option value="2">Drop 2</option>
      <option value="3">Drop 3</option>
      <option value="4">Drop 4</option>
      <option value="5">Drop 5</option>
    </select>
    <p class="ajuda">A partir do Drop 2, o produto ganha a etiqueta "DROP 2" na foto do site, pra mostrar que é lançamento.</p>

    <label>Cores</label>
    <p class="ajuda" style="margin-top:0;">Toque nas cores que esse produto tem - cada cor ganha as próprias fotos, e no site o cliente escolhe entre elas. Se não marcar nenhuma, o produto fica com uma cor só (fotos logo abaixo).</p>
    <div class="cores-presets" id="coresPresets">
      <button type="button" class="chip-cor" data-nome="Preta" data-swatch="#0d0616"><span class="chip-bolinha" style="background:#0d0616"></span>Preta</button>
      <button type="button" class="chip-cor" data-nome="Off-white" data-swatch="#ece6d6"><span class="chip-bolinha" style="background:#ece6d6"></span>Off-white</button>
      <button type="button" class="chip-cor" data-nome="Branca" data-swatch="#ffffff"><span class="chip-bolinha" style="background:#ffffff"></span>Branca</button>
      <button type="button" class="chip-cor" id="btnOutraCor">+ Outra cor</button>
    </div>
    <div id="listaCores"></div>

    <div id="blocoImagensSimples">
    <label>Imagem frente</label>
    <div class="foto-bloco">
      <img class="foto-preview" id="prevImg1" alt="">
      <div class="foto-controles">
        <label class="btn-foto" for="arqImg1">📷 Escolher foto do aparelho</label>
        <input type="file" id="arqImg1" accept="image/*" class="arq-escondido">
        <input type="text" id="fImg1" placeholder="ou cole um caminho, ex: /img/produto-x-frente.png">
        <p class="msg" id="msgImg1"></p>
      </div>
    </div>

    <label>Imagem costas</label>
    <div class="foto-bloco">
      <img class="foto-preview" id="prevImg2" alt="">
      <div class="foto-controles">
        <label class="btn-foto" for="arqImg2">📷 Escolher foto do aparelho</label>
        <input type="file" id="arqImg2" accept="image/*" class="arq-escondido">
        <input type="text" id="fImg2" placeholder="ou cole um caminho, ex: /img/produto-x-costas.png">
        <p class="msg" id="msgImg2"></p>
      </div>
    </div>
    </div>
    <p class="ajuda">No celular, o botão de foto abre a galeria ou a câmera. A foto é reduzida automaticamente e enviada pro site na hora.</p>

    <div class="checkbox-row">
      <input type="checkbox" id="fEsgotado">
      <label for="fEsgotado">Marcar como esgotado</label>
    </div>

    <button id="btnSalvar">Salvar produto</button>
    <button id="btnCancelarEdicao" style="display:none; border-color: var(--border);">Cancelar edição</button>
    <p class="msg" id="msgForm"></p>
  </div>

</div>

<script>
// Painel de produtos - fala com a função netlify/functions/admin-produtos.js,
// que valida a senha e grava direto no repositório do GitHub.

const FUNCAO_URL = '/.netlify/functions/admin-produtos';
const CHAVE_SESSAO = 'miamicriaAdminSenha';

const areaLogin = document.getElementById('areaLogin');
const areaLogada = document.getElementById('areaLogada');
const msgLogin = document.getElementById('msgLogin');
const msgLista = document.getElementById('msgLista');
const msgForm = document.getElementById('msgForm');
const listaProdutos = document.getElementById('listaProdutos');
const tituloForm = document.getElementById('tituloForm');
const btnCancelarEdicao = document.getElementById('btnCancelarEdicao');

const campos = {
  id: document.getElementById('fId'),
  nome: document.getElementById('fNome'),
  desc: document.getElementById('fDesc'),
  preco: document.getElementById('fPreco'),
  tag: document.getElementById('fTag'),
  img1: document.getElementById('fImg1'),
  img2: document.getElementById('fImg2'),
  esgotado: document.getElementById('fEsgotado'),
  drop: document.getElementById('fDrop'),
};

let produtosAtuais = []; // última lista vinda do servidor

let editandoId = null; // null = criando produto novo
let enviosEmAndamento = 0;

// cores do produto sendo editado: { nome, swatch, frente, costas, midiasOriginais }
// midiasOriginais guarda o que a cor já tinha no site (ex: vídeos), pra não perder
let coresForm = [];
let contadorCor = 0;

function lerTipo() {
  const marcado = document.querySelector('input[name="fTipo"]:checked');
  return marcado ? marcado.value : 'camiseta';
}

function definirTipo(tipo) {
  document.querySelectorAll('input[name="fTipo"]').forEach(function (r) { r.checked = r.value === tipo; });
}

function escaparAttr(texto) {
  return String(texto == null ? '' : texto).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function slugDaCor(nome) {
  return String(nome || '').normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// ---------- fotos vindas do aparelho ----------
// reduz a foto no próprio aparelho (lado maior até 1600px, JPEG) antes de
// enviar - foto de celular costuma ter 3-8MB, depois disso fica ~200-500KB
const LADO_MAX_FOTO = 1600;

function carregarImagemLocal(arquivo) {
  return new Promise(function (resolve, reject) {
    const url = URL.createObjectURL(arquivo);
    const img = new Image();
    img.onload = function () { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('Não consegui abrir essa foto. Tente outra (JPG ou PNG).')); };
    img.src = url;
  });
}

async function comprimirFoto(arquivo) {
  const img = await carregarImagemLocal(arquivo);
  const escala = Math.min(1, LADO_MAX_FOTO / Math.max(img.naturalWidth, img.naturalHeight));
  const largura = Math.round(img.naturalWidth * escala);
  const altura = Math.round(img.naturalHeight * escala);
  const canvas = document.createElement('canvas');
  canvas.width = largura;
  canvas.height = altura;
  const ctx = canvas.getContext('2d');
  // PNG com fundo transparente mantém PNG; o resto vira JPEG (bem mais leve)
  const manterPng = arquivo.type === 'image/png';
  if (!manterPng) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, largura, altura);
  }
  ctx.drawImage(img, 0, 0, largura, altura);
  const tipo = manterPng ? 'image/png' : 'image/jpeg';
  const dataUrl = canvas.toDataURL(tipo, 0.85);
  return { tipo: tipo, dataUrl: dataUrl };
}

function atualizarPreview(numero, src) {
  const prev = document.getElementById('prevImg' + numero);
  if (src) prev.src = src; else prev.removeAttribute('src');
}

function atualizarPreviewsPelosCampos() {
  atualizarPreview(1, campos.img1.value.trim());
  atualizarPreview(2, campos.img2.value.trim());
}

// liga um bloco de foto (botão de arquivo + campo de caminho + preview) ao
// upload - usado nas fotos simples do produto e nas fotos de cada cor
function ligarEnvioDeFoto(opcoes) {
  const inputArquivo = opcoes.inputArquivo;
  const botao = opcoes.botao;
  const campoCaminho = opcoes.campoCaminho;
  const msg = opcoes.msg;
  const mostrarPreview = function (src) {
    if (src) opcoes.preview.src = src; else opcoes.preview.removeAttribute('src');
  };

  campoCaminho.addEventListener('change', function () {
    mostrarPreview(campoCaminho.value.trim());
    if (opcoes.aoMudar) opcoes.aoMudar(campoCaminho.value.trim());
  });

  inputArquivo.addEventListener('change', async function () {
    const arquivo = inputArquivo.files && inputArquivo.files[0];
    inputArquivo.value = '';
    if (!arquivo) return;

    enviosEmAndamento++;
    document.getElementById('btnSalvar').disabled = true;
    botao.classList.add('ocupado');
    mostrarMsg(msg, 'Preparando foto...', '');
    try {
      const foto = await comprimirFoto(arquivo);
      mostrarPreview(foto.dataUrl);
      mostrarMsg(msg, 'Enviando foto...', '');
      const idProduto = editandoId || campos.id.value.trim().toLowerCase();
      const resposta = await chamarFuncao('enviar_foto', {
        id: idProduto,
        cor: opcoes.cor ? opcoes.cor() : '',
        lado: opcoes.lado,
        tipo: foto.tipo,
        base64: foto.dataUrl,
      });
      campoCaminho.value = resposta.caminho;
      if (opcoes.aoMudar) opcoes.aoMudar(resposta.caminho);
      mostrarMsg(msg, 'Foto enviada ✓ (clique em Salvar produto pra aplicar)', 'sucesso');
    } catch (err) {
      mostrarPreview(campoCaminho.value.trim());
      mostrarMsg(msg, err.message, 'erro');
    } finally {
      enviosEmAndamento--;
      botao.classList.remove('ocupado');
      if (enviosEmAndamento === 0) document.getElementById('btnSalvar').disabled = false;
    }
  });
}

function configurarEnvioDeFoto(numero, lado) {
  ligarEnvioDeFoto({
    inputArquivo: document.getElementById('arqImg' + numero),
    botao: document.querySelector('label[for="arqImg' + numero + '"]'),
    campoCaminho: campos['img' + numero],
    preview: document.getElementById('prevImg' + numero),
    msg: document.getElementById('msgImg' + numero),
    lado: lado,
  });
}

// ---------- drop e ordem da vitrine ----------

function dropMaisNovo() {
  return produtosAtuais.reduce(function (maior, p) { return Math.max(maior, p.drop || 1); }, 1);
}

// mesma regra do site (ordenarPorPreco em site/js/main.js): se já tem
// "ordem", ela manda; senão, destaque fixo + resto do mais barato pro mais caro
function ordemDoSite(produtos) {
  if (produtos.some(function (p) { return Number.isFinite(p.ordem); })) {
    const posicao = function (p) { return Number.isFinite(p.ordem) ? p.ordem : Infinity; };
    return produtos.slice().sort(function (a, b) { return posicao(a) - posicao(b) || a.preco - b.preco; });
  }
  const fixados = produtos.filter(function (p) { return p.destaque; }).sort(function (a, b) { return a.destaque - b.destaque; });
  const resultado = produtos.filter(function (p) { return !p.destaque; }).sort(function (a, b) { return a.preco - b.preco; });
  fixados.forEach(function (p) {
    resultado.splice(Math.min(Math.max(p.destaque - 1, 0), resultado.length), 0, p);
  });
  return resultado;
}

let ordemAtual = [];
let ordemSalva = [];

function fotoDoProduto(p) {
  if (p.cores && p.cores.length) {
    const img = (p.cores[0].midias || []).find(function (m) { return m.tipo === 'img'; });
    if (img) return img.src;
  }
  return (p.imagens && p.imagens[0]) || '';
}

function renderizarOrdem() {
  const lista = document.getElementById('listaOrdem');
  lista.innerHTML = ordemAtual.map(function (id, i) {
    const p = produtosAtuais.find(function (x) { return x.id === id; });
    const foto = fotoDoProduto(p);
    return '<div class="ordem-item' + (ordemSalva[i] !== id ? ' movido' : '') + '">' +
      '<span class="ordem-pos">' + (i + 1) + '</span>' +
      (foto ? '<img src="' + escaparAttr(foto) + '" alt="">' : '<img alt="">') +
      '<span class="ordem-nome">' + escaparAttr(p.nome) + (p.drop > 1 ? ' <span class="badge-drop">Drop ' + p.drop + '</span>' : '') + '</span>' +
      '<span class="ordem-setas">' +
        '<button type="button" data-mover="-1" data-i="' + i + '" aria-label="Subir"' + (i === 0 ? ' disabled' : '') + '>↑</button>' +
        '<button type="button" data-mover="1" data-i="' + i + '" aria-label="Descer"' + (i === ordemAtual.length - 1 ? ' disabled' : '') + '>↓</button>' +
      '</span>' +
    '</div>';
  }).join('');
  const mudou = ordemAtual.join() !== ordemSalva.join();
  document.getElementById('btnSalvarOrdem').disabled = !mudou;
  document.getElementById('btnOrdemDesfazer').disabled = !mudou;
}

document.getElementById('listaOrdem').addEventListener('click', function (e) {
  const botao = e.target.closest('button[data-mover]');
  if (!botao) return;
  const i = Number(botao.dataset.i);
  const j = i + Number(botao.dataset.mover);
  if (j < 0 || j >= ordemAtual.length) return;
  const temp = ordemAtual[i];
  ordemAtual[i] = ordemAtual[j];
  ordemAtual[j] = temp;
  renderizarOrdem();
  mostrarMsg(document.getElementById('msgOrdem'), '', '');
});

// joga os drops mais novos pro topo, mantendo a ordem atual dentro de cada drop
document.getElementById('btnOrdemDrop').addEventListener('click', function () {
  const dropDe = function (id) {
    const p = produtosAtuais.find(function (x) { return x.id === id; });
    return (p && p.drop) || 1;
  };
  ordemAtual = ordemAtual
    .map(function (id, i) { return { id: id, i: i }; })
    .sort(function (a, b) { return dropDe(b.id) - dropDe(a.id) || a.i - b.i; })
    .map(function (x) { return x.id; });
  renderizarOrdem();
});

document.getElementById('btnOrdemDesfazer').addEventListener('click', function () {
  ordemAtual = ordemSalva.slice();
  renderizarOrdem();
});

document.getElementById('btnSalvarOrdem').addEventListener('click', async function () {
  const btn = document.getElementById('btnSalvarOrdem');
  const msg = document.getElementById('msgOrdem');
  btn.disabled = true;
  mostrarMsg(msg, 'Salvando ordem...', '');
  try {
    await chamarFuncao('ordenar', { ids: ordemAtual });
    await carregarLista();
    mostrarMsg(msg, 'Ordem salva. O site atualiza em 1-2 minutos.', 'sucesso');
  } catch (err) {
    mostrarMsg(msg, err.message, 'erro');
    btn.disabled = false;
  }
});

// ---------- cores ----------

function htmlBlocoFotoCor(uid, lado, titulo, src) {
  const idArq = 'arqCor' + uid + lado;
  return '<div class="lado-titulo">' + titulo + '</div>' +
    '<div class="foto-bloco" data-lado="' + lado + '">' +
      '<img class="foto-preview"' + (src ? ' src="' + escaparAttr(src) + '"' : '') + ' alt="">' +
      '<div class="foto-controles">' +
        '<label class="btn-foto" for="' + idArq + '">📷 Escolher foto do aparelho</label>' +
        '<input type="file" id="' + idArq + '" accept="image/*" class="arq-escondido">' +
        '<input type="text" class="caminho-foto" value="' + escaparAttr(src) + '" placeholder="ou cole um caminho, ex: /img/produto-preta-' + lado + '.png">' +
        '<p class="msg"></p>' +
      '</div>' +
    '</div>';
}

function renderizarCores() {
  const lista = document.getElementById('listaCores');
  lista.innerHTML = '';
  coresForm.forEach(function (cor) {
    const item = document.createElement('div');
    item.className = 'cor-item';
    item.innerHTML =
      '<div class="cor-item-topo">' +
        '<input type="color" class="cor-swatch" value="' + escaparAttr(cor.swatch) + '" aria-label="Cor da bolinha">' +
        '<input type="text" class="cor-nome" value="' + escaparAttr(cor.nome) + '" placeholder="Nome da cor (ex: Azul)">' +
        '<button type="button" class="cor-remover">Remover</button>' +
      '</div>' +
      htmlBlocoFotoCor(cor.uid, 'frente', 'Foto frente', cor.frente) +
      htmlBlocoFotoCor(cor.uid, 'costas', 'Foto costas', cor.costas);

    item.querySelector('.cor-swatch').addEventListener('input', function (e) { cor.swatch = e.target.value; });
    item.querySelector('.cor-nome').addEventListener('input', function (e) {
      cor.nome = e.target.value;
      atualizarChipsCores();
    });
    item.querySelector('.cor-remover').addEventListener('click', function () {
      if ((cor.frente || cor.costas) && !confirm('Remover a cor "' + (cor.nome || 'sem nome') + '" e as fotos dela desse produto?')) return;
      coresForm = coresForm.filter(function (c) { return c !== cor; });
      renderizarCores();
    });

    item.querySelectorAll('.foto-bloco').forEach(function (bloco) {
      const lado = bloco.dataset.lado;
      ligarEnvioDeFoto({
        inputArquivo: bloco.querySelector('input[type="file"]'),
        botao: bloco.querySelector('.btn-foto'),
        campoCaminho: bloco.querySelector('.caminho-foto'),
        preview: bloco.querySelector('.foto-preview'),
        msg: bloco.querySelector('.msg'),
        lado: lado,
        cor: function () { return slugDaCor(cor.nome); },
        aoMudar: function (caminho) { cor[lado] = caminho; },
      });
    });

    lista.appendChild(item);
  });
  atualizarChipsCores();
  // com cores marcadas, as fotos são as de cada cor - esconde as fotos "simples"
  document.getElementById('blocoImagensSimples').style.display = coresForm.length ? 'none' : '';
}

function atualizarChipsCores() {
  document.querySelectorAll('#coresPresets .chip-cor[data-nome]').forEach(function (chip) {
    const ativo = coresForm.some(function (c) { return c.nome.trim().toLowerCase() === chip.dataset.nome.toLowerCase(); });
    chip.classList.toggle('ativo', ativo);
  });
}

function adicionarCor(nome, swatch) {
  contadorCor++;
  coresForm.push({ uid: contadorCor, nome: nome, swatch: swatch, frente: '', costas: '', midiasOriginais: [] });
  renderizarCores();
}

document.querySelectorAll('#coresPresets .chip-cor[data-nome]').forEach(function (chip) {
  chip.addEventListener('click', function () {
    const existente = coresForm.find(function (c) { return c.nome.trim().toLowerCase() === chip.dataset.nome.toLowerCase(); });
    if (existente) {
      if ((existente.frente || existente.costas) && !confirm('Remover a cor "' + existente.nome + '" e as fotos dela desse produto?')) return;
      coresForm = coresForm.filter(function (c) { return c !== existente; });
      renderizarCores();
    } else {
      adicionarCor(chip.dataset.nome, chip.dataset.swatch);
    }
  });
});

document.getElementById('btnOutraCor').addEventListener('click', function () {
  adicionarCor('', '#888888');
  const nomes = document.querySelectorAll('#listaCores .cor-nome');
  if (nomes.length) nomes[nomes.length - 1].focus();
});

function coresDoProduto(produto) {
  return (produto.cores || []).map(function (cor) {
    contadorCor++;
    const imgs = (cor.midias || []).filter(function (m) { return m.tipo === 'img'; });
    return {
      uid: contadorCor,
      nome: cor.nome || '',
      swatch: /^#[0-9a-fA-F]{6}$/.test(cor.swatch || '') ? cor.swatch : '#888888',
      frente: imgs[0] ? imgs[0].src : '',
      costas: imgs[1] ? imgs[1].src : '',
      midiasOriginais: cor.midias || [],
    };
  });
}

// devolve as mídias da cor no formato do site: troca as 2 primeiras fotos
// pelas do formulário e mantém o resto (vídeos, fotos extras) como estava
function montarMidiasCor(cor) {
  const midias = cor.midiasOriginais.map(function (m) { return Object.assign({}, m); });
  const indicesImg = [];
  midias.forEach(function (m, i) { if (m.tipo === 'img' && indicesImg.length < 2) indicesImg.push(i); });
  const remover = [];
  [cor.frente, cor.costas].forEach(function (src, k) {
    const indice = indicesImg[k];
    if (indice === undefined) {
      if (src) midias.push({ tipo: 'img', src: src });
    } else if (!src) {
      remover.push(indice);
    } else if (midias[indice].src !== src) {
      midias[indice].src = src;
      delete midias[indice].crop; // recorte era da foto antiga
    }
  });
  return midias.filter(function (m, i) { return remover.indexOf(i) === -1; });
}

function mostrarMsg(el, texto, tipo) {
  el.textContent = texto || '';
  el.className = \`msg \${tipo || ''}\`;
}

async function chamarFuncao(acao, dadosExtra) {
  const senha = sessionStorage.getItem(CHAVE_SESSAO);
  const resp = await fetch(FUNCAO_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ senha, acao, ...dadosExtra }),
  });
  const dados = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(dados.erro || 'Erro na requisição');
  return dados;
}

function limparForm() {
  editandoId = null;
  campos.id.disabled = false;
  campos.id.value = '';
  campos.nome.value = '';
  campos.desc.value = '';
  campos.preco.value = '';
  campos.tag.value = '';
  campos.img1.value = '';
  campos.img2.value = '';
  campos.esgotado.checked = false;
  campos.drop.value = String(dropMaisNovo());
  definirTipo('camiseta');
  coresForm = [];
  renderizarCores();
  atualizarPreviewsPelosCampos();
  mostrarMsg(document.getElementById('msgImg1'), '', '');
  mostrarMsg(document.getElementById('msgImg2'), '', '');
  tituloForm.textContent = 'Novo produto';
  btnCancelarEdicao.style.display = 'none';
}

function preencherFormParaEdicao(produto) {
  editandoId = produto.id;
  campos.id.value = produto.id;
  campos.id.disabled = true;
  campos.nome.value = produto.nome || '';
  campos.desc.value = produto.desc || '';
  campos.preco.value = produto.preco || '';
  campos.tag.value = produto.tag || '';
  campos.img1.value = (produto.imagens && produto.imagens[0]) || '';
  campos.img2.value = (produto.imagens && produto.imagens[1]) || '';
  campos.esgotado.checked = !!produto.esgotado;
  campos.drop.value = String(produto.drop || 1);
  definirTipo(produto.tipo === 'objeto' || (produto.tamanhos && produto.tamanhos.length === 1) ? 'objeto' : 'camiseta');
  coresForm = coresDoProduto(produto);
  renderizarCores();
  atualizarPreviewsPelosCampos();
  tituloForm.textContent = \`Editando: \${produto.nome}\`;
  btnCancelarEdicao.style.display = 'block';
  window.scrollTo({ top: document.getElementById('tituloForm').offsetTop - 20, behavior: 'smooth' });
}

function renderizarLista(produtos) {
  listaProdutos.innerHTML = produtos
    .map(
      (p) => \`
    <div class="produto-item" data-id="\${p.id}">
      <div class="produto-item-topo">
        <div>
          <div class="produto-item-nome">\${p.nome} \${p.drop > 1 ? '<span class="badge-drop">Drop ' + p.drop + '</span>' : ''}</div>
          <div class="produto-item-preco">R$ \${Number(p.preco).toFixed(2).replace('.', ',')}</div>
          <div class="produto-item-id">\${p.id}\${p.tipo === 'objeto' || (p.tamanhos && p.tamanhos.length === 1) ? ' · Objeto' : ''}\${p.cores && p.cores.length ? ' · ' + p.cores.map((c) => c.nome).join(' / ') : ''}</div>
        </div>
        \${p.esgotado ? '<span class="tag-esgotado">Esgotado</span>' : ''}
      </div>
      <div class="produto-item-acoes">
        <button type="button" class="btn-editar">Editar</button>
        <button type="button" class="btn-esgotar">\${p.esgotado ? 'Marcar disponível' : 'Marcar esgotado'}</button>
        <button type="button" class="btn-perigo btn-excluir">Excluir</button>
      </div>
    </div>
  \`
    )
    .join('');

  listaProdutos.querySelectorAll('.produto-item').forEach((item) => {
    const produto = produtos.find((p) => p.id === item.dataset.id);

    item.querySelector('.btn-editar').addEventListener('click', () => preencherFormParaEdicao(produto));

    item.querySelector('.btn-esgotar').addEventListener('click', async (e) => {
      e.target.disabled = true;
      try {
        await chamarFuncao('salvar', { produto: { ...produto, esgotado: !produto.esgotado } });
        mostrarMsg(msgLista, \`"\${produto.nome}" atualizado.\`, 'sucesso');
        await carregarLista();
      } catch (err) {
        mostrarMsg(msgLista, err.message, 'erro');
        e.target.disabled = false;
      }
    });

    item.querySelector('.btn-excluir').addEventListener('click', async (e) => {
      if (!confirm(\`Excluir "\${produto.nome}" do site? Essa ação não pode ser desfeita.\`)) return;
      e.target.disabled = true;
      try {
        await chamarFuncao('excluir', { id: produto.id });
        mostrarMsg(msgLista, \`"\${produto.nome}" removido. O site atualiza em 1-2 minutos.\`, 'sucesso');
        await carregarLista();
      } catch (err) {
        mostrarMsg(msgLista, err.message, 'erro');
        e.target.disabled = false;
      }
    });
  });
}

async function carregarLista() {
  mostrarMsg(msgLista, 'Carregando...', '');
  try {
    const { produtos } = await chamarFuncao('listar', {});
    produtosAtuais = produtos;
    renderizarLista(produtos);
    ordemAtual = ordemDoSite(produtos).map(function (p) { return p.id; });
    ordemSalva = ordemAtual.slice();
    renderizarOrdem();
    if (!editandoId) campos.drop.value = String(dropMaisNovo());
    mostrarMsg(msgLista, '', '');
  } catch (err) {
    mostrarMsg(msgLista, err.message, 'erro');
  }
}

async function entrar(senha) {
  sessionStorage.setItem(CHAVE_SESSAO, senha);
  try {
    await chamarFuncao('listar', {});
    areaLogin.style.display = 'none';
    areaLogada.style.display = 'block';
    await carregarLista();
  } catch (err) {
    sessionStorage.removeItem(CHAVE_SESSAO);
    mostrarMsg(msgLogin, err.message, 'erro');
  }
}

document.getElementById('btnEntrar').addEventListener('click', () => {
  const senha = document.getElementById('campoSenha').value;
  if (!senha) return;
  entrar(senha);
});

document.getElementById('campoSenha').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('btnEntrar').click();
});

btnCancelarEdicao.addEventListener('click', limparForm);

configurarEnvioDeFoto(1, 'frente');
configurarEnvioDeFoto(2, 'costas');

document.getElementById('btnSalvar').addEventListener('click', async () => {
  const produto = {
    id: editandoId || campos.id.value.trim().toLowerCase(),
    nome: campos.nome.value.trim(),
    desc: campos.desc.value.trim(),
    preco: Number(campos.preco.value),
    tag: campos.tag.value.trim(),
    imagens: [campos.img1.value.trim(), campos.img2.value.trim()].filter(Boolean),
    esgotado: campos.esgotado.checked,
    drop: Number(campos.drop.value),
    tipo: lerTipo(),
    cores: coresForm.map(function (cor) {
      return { nome: cor.nome.trim(), swatch: cor.swatch, midias: montarMidiasCor(cor) };
    }),
  };

  const corSemNome = produto.cores.find(function (c) { return !c.nome; });
  const corSemFoto = produto.cores.find(function (c) { return !c.midias.length; });
  if (corSemNome || corSemFoto) {
    mostrarMsg(msgForm, corSemNome ? 'Dê um nome pra cada cor.' : 'A cor "' + corSemFoto.nome + '" está sem foto - envie ao menos uma foto ou remova a cor.', 'erro');
    return;
  }
  if (produto.cores.length) produto.imagens = [];

  const btn = document.getElementById('btnSalvar');
  btn.disabled = true;
  mostrarMsg(msgForm, 'Salvando...', '');
  try {
    await chamarFuncao('salvar', { produto });
    mostrarMsg(msgForm, 'Produto salvo. O site atualiza em 1-2 minutos.', 'sucesso');
    limparForm();
    await carregarLista();
  } catch (err) {
    mostrarMsg(msgForm, err.message, 'erro');
  } finally {
    btn.disabled = false;
  }
});

// se já tiver senha guardada nessa aba, tenta entrar direto sem pedir de novo
const senhaGuardada = sessionStorage.getItem(CHAVE_SESSAO);
if (senhaGuardada) entrar(senhaGuardada);

</script>
</body>
</html>
`;

exports.handler = async () => ({
  statusCode: 200,
  headers: { 'Content-Type': 'text/html; charset=utf-8' },
  body: HTML,
});
