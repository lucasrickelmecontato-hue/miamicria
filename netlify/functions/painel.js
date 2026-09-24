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
    <p class="ajuda">No celular, o botão abre a galeria ou a câmera. A foto é reduzida automaticamente e enviada pro site na hora.</p>

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
};

let editandoId = null; // null = criando produto novo
let enviosEmAndamento = 0;

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

function configurarEnvioDeFoto(numero, lado) {
  const inputArquivo = document.getElementById('arqImg' + numero);
  const botao = document.querySelector('label[for="arqImg' + numero + '"]');
  const campoCaminho = campos['img' + numero];
  const msg = document.getElementById('msgImg' + numero);

  campoCaminho.addEventListener('change', function () {
    atualizarPreview(numero, campoCaminho.value.trim());
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
      atualizarPreview(numero, foto.dataUrl);
      mostrarMsg(msg, 'Enviando foto...', '');
      const idProduto = editandoId || campos.id.value.trim().toLowerCase();
      const resposta = await chamarFuncao('enviar_foto', {
        id: idProduto,
        lado: lado,
        tipo: foto.tipo,
        base64: foto.dataUrl,
      });
      campoCaminho.value = resposta.caminho;
      mostrarMsg(msg, 'Foto enviada ✓ (clique em Salvar produto pra aplicar)', 'sucesso');
    } catch (err) {
      atualizarPreview(numero, campoCaminho.value.trim());
      mostrarMsg(msg, err.message, 'erro');
    } finally {
      enviosEmAndamento--;
      botao.classList.remove('ocupado');
      if (enviosEmAndamento === 0) document.getElementById('btnSalvar').disabled = false;
    }
  });
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
          <div class="produto-item-nome">\${p.nome}</div>
          <div class="produto-item-preco">R$ \${Number(p.preco).toFixed(2).replace('.', ',')}</div>
          <div class="produto-item-id">\${p.id}</div>
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
    renderizarLista(produtos);
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
  };

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
