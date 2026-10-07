// Painel do dono pra adicionar, editar, marcar como esgotado ou remover
// produtos do site. Em vez de banco de dados, essa função grava direto no
// GitHub (site/js/produtos.js + a página estática de cada produto) - o push
// no repo dispara o deploy automático do GitHub Pages (.github/workflows/deploy-pages.yml).
//
// Variáveis de ambiente exigidas no Netlify:
//   ADMIN_SENHA    - senha do painel (só o dono sabe)
//   GITHUB_TOKEN   - personal access token com permissão de escrita no repo
//   GITHUB_REPO    - "usuario/repositorio", ex: "lucasrickelmecontato-hue/miamicria"
//   GITHUB_BRANCH  - opcional, default "main"

const GITHUB_API = 'https://api.github.com';
const CAMINHO_PRODUTOS = 'site/js/produtos.js';
const CAMINHO_TEMPLATE = 'site/produto.html';

// o painel (netlify/functions/painel.js) e essa função vivem no mesmo domínio
// do Netlify - é uma chamada same-origin, então isso aqui é só precaução
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://miamicria.netlify.app',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function headersGithub() {
  return {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'miamicria-admin',
  };
}

function branch() {
  return process.env.GITHUB_BRANCH || 'main';
}

async function lerArquivo(caminho) {
  const resp = await fetch(`${GITHUB_API}/repos/${process.env.GITHUB_REPO}/contents/${caminho}?ref=${branch()}`, {
    headers: headersGithub(),
  });
  if (resp.status === 404) return null;
  if (!resp.ok) throw new Error(`Falha ao ler ${caminho} (${resp.status})`);
  const dados = await resp.json();
  return { conteudo: Buffer.from(dados.content, 'base64').toString('utf-8'), sha: dados.sha };
}

async function escreverArquivo(caminho, conteudo, sha, mensagem) {
  const resp = await fetch(`${GITHUB_API}/repos/${process.env.GITHUB_REPO}/contents/${caminho}`, {
    method: 'PUT',
    headers: { ...headersGithub(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: mensagem,
      content: Buffer.from(conteudo, 'utf-8').toString('base64'),
      branch: branch(),
      ...(sha ? { sha } : {}),
    }),
  });
  if (!resp.ok) {
    const erro = await resp.json().catch(() => ({}));
    throw new Error(erro.message || `Falha ao gravar ${caminho}`);
  }
}

// igual escreverArquivo, mas recebe o conteúdo já em base64 (usado pras fotos)
async function escreverArquivoBinario(caminho, conteudoBase64, mensagem) {
  const resp = await fetch(`${GITHUB_API}/repos/${process.env.GITHUB_REPO}/contents/${caminho}`, {
    method: 'PUT',
    headers: { ...headersGithub(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: mensagem, content: conteudoBase64, branch: branch() }),
  });
  if (!resp.ok) {
    const erro = await resp.json().catch(() => ({}));
    throw new Error(erro.message || `Falha ao gravar ${caminho}`);
  }
}

// limite do Netlify pro corpo da requisição é ~6MB; o painel já comprime a
// foto no aparelho antes de mandar, então isso aqui é só uma trava de segurança
const TAMANHO_MAX_FOTO_BASE64 = 4.5 * 1024 * 1024;
const EXTENSOES_FOTO = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

async function apagarArquivo(caminho, sha, mensagem) {
  const resp = await fetch(`${GITHUB_API}/repos/${process.env.GITHUB_REPO}/contents/${caminho}`, {
    method: 'DELETE',
    headers: { ...headersGithub(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: mensagem, sha, branch: branch() }),
  });
  if (!resp.ok) {
    const erro = await resp.json().catch(() => ({}));
    throw new Error(erro.message || `Falha ao apagar ${caminho}`);
  }
}

// produtos.js guarda a lista como um literal JSON dentro de "const PRODUTOS = [...]",
// então dá pra extrair e regravar com JSON.parse/stringify sem precisar de eval
function extrairProdutos(conteudoJs) {
  const match = conteudoJs.match(/const PRODUTOS = (\[[\s\S]*?\]);\s*$/m);
  if (!match) throw new Error('Não encontrei a lista PRODUTOS no arquivo');
  return JSON.parse(match[1]);
}

function gerarArquivoProdutos(produtos) {
  return `/* ---------- Dados dos produtos (usado na home e na página de cada produto) ---------- */\n\nconst TAMANHOS = ['P', 'M', 'G', 'GG', 'XG'];\n\nconst PRODUTOS = ${JSON.stringify(produtos, null, 2)};\n`;
}

function slugValido(id) {
  return typeof id === 'string' && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(id);
}

// gera a página estática de /produto/<id>/ a partir do template produto.html -
// só troca título/descrição e vira os caminhos relativos em absolutos, que é
// exatamente a diferença que existe hoje entre produto.html e as páginas geradas
function gerarPaginaProduto(templateHtml, produto) {
  let html = templateHtml
    .replace('<title>Produto — Miami Cria</title>', `<title>${produto.nome} — Miami Cria</title>`)
    .replace(
      /<meta name="description" content="[^"]*">/,
      `<meta name="description" content="${produto.nome}: ${produto.desc || ''}. Camiseta oversized Miami Cria.">`
    );
  html = html.replace(/(href|src)="(?!https?:|\/|#|mailto:|tel:)([^"]*)"/g, '$1="/$2"');
  return html;
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: CORS_HEADERS, body: 'Method Not Allowed' };

  if (!process.env.ADMIN_SENHA || !process.env.GITHUB_TOKEN || !process.env.GITHUB_REPO) {
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ erro: 'Painel não configurado (faltam variáveis de ambiente no Netlify)' }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (err) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ erro: 'JSON inválido' }) };
  }

  if (payload.senha !== process.env.ADMIN_SENHA) {
    return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ erro: 'Senha incorreta' }) };
  }

  // upload de foto vinda do aparelho (galeria/câmera) - grava em site/img/
  // e devolve o caminho pra ser usado no campo de imagem do produto
  if (payload.acao === 'enviar_foto') {
    try {
      const extensao = EXTENSOES_FOTO[payload.tipo];
      const base64 = typeof payload.base64 === 'string' ? payload.base64.replace(/^data:[^,]*,/, '') : '';
      if (!extensao) {
        return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ erro: 'Formato de foto não suportado (use JPG, PNG ou WEBP)' }) };
      }
      if (!base64 || base64.length > TAMANHO_MAX_FOTO_BASE64 || !/^[A-Za-z0-9+/=]+$/.test(base64)) {
        return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ erro: 'Foto inválida ou grande demais' }) };
      }
      const prefixo = slugValido(payload.id) ? payload.id : 'produto';
      const lado = payload.lado === 'costas' ? 'costas' : 'frente';
      const nomeArquivo = `${prefixo}-${lado}-${Date.now()}.${extensao}`;
      await escreverArquivoBinario(`site/img/${nomeArquivo}`, base64, `admin: envia foto ${nomeArquivo}`);
      return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ ok: true, caminho: `/img/${nomeArquivo}` }) };
    } catch (err) {
      console.error('Erro ao enviar foto:', err);
      return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ erro: err.message || 'Erro ao enviar foto' }) };
    }
  }

  try {
    const arquivoProdutos = await lerArquivo(CAMINHO_PRODUTOS);
    if (!arquivoProdutos) throw new Error('produtos.js não encontrado no repositório');
    const produtos = extrairProdutos(arquivoProdutos.conteudo);

    if (payload.acao === 'listar') {
      return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ produtos }) };
    }

    if (payload.acao === 'excluir') {
      const id = payload.id;
      const restantes = produtos.filter((p) => p.id !== id);
      if (restantes.length === produtos.length) {
        return { statusCode: 404, headers: CORS_HEADERS, body: JSON.stringify({ erro: 'Produto não encontrado' }) };
      }

      await escreverArquivo(CAMINHO_PRODUTOS, gerarArquivoProdutos(restantes), arquivoProdutos.sha, `admin: remove produto ${id}`);

      const paginaProduto = await lerArquivo(`site/produto/${id}/index.html`);
      if (paginaProduto) {
        await apagarArquivo(`site/produto/${id}/index.html`, paginaProduto.sha, `admin: remove página do produto ${id}`);
      }

      return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ ok: true }) };
    }

    if (payload.acao === 'salvar') {
      const enviado = payload.produto || {};
      const id = enviado.id;
      const preco = Number(enviado.preco);

      if (!slugValido(id)) {
        return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ erro: 'Id inválido - use só letras minúsculas, números e hífen' }) };
      }
      if (!enviado.nome || !Number.isFinite(preco) || preco <= 0) {
        return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ erro: 'Nome ou preço inválido' }) };
      }

      const indiceExistente = produtos.findIndex((p) => p.id === id);
      const ehNovo = indiceExistente === -1;

      const produtoFinal = ehNovo
        ? {
            id,
            nome: enviado.nome,
            desc: enviado.desc || '',
            preco,
            tag: enviado.tag || '',
            gradiente: enviado.gradiente || 'linear-gradient(160deg, #5a2a8f, #ff2d95)',
            imagens: (enviado.imagens || []).filter(Boolean),
            esgotado: !!enviado.esgotado,
          }
        : {
            ...produtos[indiceExistente],
            nome: enviado.nome,
            desc: enviado.desc,
            preco,
            tag: enviado.tag,
            imagens: enviado.imagens && enviado.imagens.length ? enviado.imagens.filter(Boolean) : produtos[indiceExistente].imagens,
            esgotado: !!enviado.esgotado,
          };

      const novaLista = ehNovo
        ? [...produtos, produtoFinal]
        : produtos.map((p, i) => (i === indiceExistente ? produtoFinal : p));

      await escreverArquivo(
        CAMINHO_PRODUTOS,
        gerarArquivoProdutos(novaLista),
        arquivoProdutos.sha,
        `admin: ${ehNovo ? 'adiciona' : 'atualiza'} produto ${id}`
      );

      if (ehNovo) {
        const template = await lerArquivo(CAMINHO_TEMPLATE);
        if (!template) throw new Error('template produto.html não encontrado no repositório');
        const paginaHtml = gerarPaginaProduto(template.conteudo, produtoFinal);
        await escreverArquivo(`site/produto/${id}/index.html`, paginaHtml, null, `admin: cria página do produto ${id}`);
      }

      return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ ok: true, produto: produtoFinal }) };
    }

    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ erro: 'Ação desconhecida' }) };
  } catch (err) {
    console.error('Erro no admin de produtos:', err);
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ erro: err.message || 'Erro interno' }) };
  }
};
