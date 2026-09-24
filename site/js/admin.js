// Painel de produtos - fala com a função netlify/functions/admin-produtos.js,
// que valida a senha e grava direto no repositório do GitHub.

const FUNCAO_URL = 'https://miamicria.netlify.app/.netlify/functions/admin-produtos';
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

function mostrarMsg(el, texto, tipo) {
  el.textContent = texto || '';
  el.className = `msg ${tipo || ''}`;
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
  tituloForm.textContent = `Editando: ${produto.nome}`;
  btnCancelarEdicao.style.display = 'block';
  window.scrollTo({ top: document.getElementById('tituloForm').offsetTop - 20, behavior: 'smooth' });
}

function renderizarLista(produtos) {
  listaProdutos.innerHTML = produtos
    .map(
      (p) => `
    <div class="produto-item" data-id="${p.id}">
      <div class="produto-item-topo">
        <div>
          <div class="produto-item-nome">${p.nome}</div>
          <div class="produto-item-preco">R$ ${Number(p.preco).toFixed(2).replace('.', ',')}</div>
          <div class="produto-item-id">${p.id}</div>
        </div>
        ${p.esgotado ? '<span class="tag-esgotado">Esgotado</span>' : ''}
      </div>
      <div class="produto-item-acoes">
        <button type="button" class="btn-editar">Editar</button>
        <button type="button" class="btn-esgotar">${p.esgotado ? 'Marcar disponível' : 'Marcar esgotado'}</button>
        <button type="button" class="btn-perigo btn-excluir">Excluir</button>
      </div>
    </div>
  `
    )
    .join('');

  listaProdutos.querySelectorAll('.produto-item').forEach((item) => {
    const produto = produtos.find((p) => p.id === item.dataset.id);

    item.querySelector('.btn-editar').addEventListener('click', () => preencherFormParaEdicao(produto));

    item.querySelector('.btn-esgotar').addEventListener('click', async (e) => {
      e.target.disabled = true;
      try {
        await chamarFuncao('salvar', { produto: { ...produto, esgotado: !produto.esgotado } });
        mostrarMsg(msgLista, `"${produto.nome}" atualizado.`, 'sucesso');
        await carregarLista();
      } catch (err) {
        mostrarMsg(msgLista, err.message, 'erro');
        e.target.disabled = false;
      }
    });

    item.querySelector('.btn-excluir').addEventListener('click', async (e) => {
      if (!confirm(`Excluir "${produto.nome}" do site? Essa ação não pode ser desfeita.`)) return;
      e.target.disabled = true;
      try {
        await chamarFuncao('excluir', { id: produto.id });
        mostrarMsg(msgLista, `"${produto.nome}" removido. O site atualiza em 1-2 minutos.`, 'sucesso');
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
