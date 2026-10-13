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

function caminhoMidiaValido(src) {
  return typeof src === 'string' && /^(\/|https:\/\/)[^"<>\s]+$/.test(src);
}

// cores escolhidas no painel (ex: Preta, Off-white) - mesmo formato que
// main.js já lê: [{ nome, swatch, midias: [{ tipo, src, crop?, inicio? }] }].
// Mantém crop/inicio de mídias que já existiam (ex: vídeos do collab Igor).
// Cor sem nenhuma foto é descartada; lista vazia vira undefined (some do JSON).
function limparCores(cores) {
  if (!Array.isArray(cores)) return undefined;
  const limpas = cores
    .map((cor) => {
      const nome = typeof cor.nome === 'string' ? cor.nome.trim().slice(0, 30) : '';
      const swatch = typeof cor.swatch === 'string' && /^#[0-9a-fA-F]{6}$/.test(cor.swatch) ? cor.swatch : '#888888';
      const midias = (Array.isArray(cor.midias) ? cor.midias : [])
        .filter((m) => m && (m.tipo === 'img' || m.tipo === 'video') && caminhoMidiaValido(m.src))
        .map((m) => ({
          tipo: m.tipo,
          src: m.src,
          ...(m.crop && typeof m.crop === 'object' ? { crop: m.crop } : {}),
          ...(Number.isFinite(m.inicio) ? { inicio: m.inicio } : {}),
        }));
      return { nome, swatch, midias };
    })
    .filter((cor) => cor.nome && cor.midias.length);
  return limpas.length ? limpas : undefined;
}

// gera a página estática de /produto/<id>/ a partir do template produto.html -
// só troca título/descrição e vira os caminhos relativos em absolutos, que é
// exatamente a diferença que existe hoje entre produto.html e as páginas geradas
function gerarPaginaProduto(templateHtml, produto) {
  let html = templateHtml
    .replace('<title>Produto — Miami Cria</title>', `<title>${produto.nome} — Miami Cria</title>`)
    .replace(
      /<meta name="description" content="[^"]*">/,
      `<meta name="description" content="${produto.nome}: ${produto.desc || ''}. ${produto.tipo === 'objeto' ? 'Produto' : 'Camiseta oversized'} Miami Cria.">`
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
      const cor = slugValido(payload.cor) ? `-${payload.cor}` : '';
      const lado = payload.lado === 'costas' ? 'costas' : 'frente';
      const nomeArquivo = `${prefixo}${cor}-${lado}-${Date.now()}.${extensao}`;
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

    // ordem da vitrine definida no painel: recebe a lista de ids na ordem em
    // que devem aparecer e grava "ordem" (1, 2, 3...) em cada produto. O
    // "destaque" antigo sai, porque agora quem manda é a ordem do painel
    if (payload.acao === 'ordenar') {
      const ids = Array.isArray(payload.ids) ? payload.ids : [];
      const mesmosIds = ids.length === produtos.length && new Set(ids).size === ids.length && produtos.every((p) => ids.includes(p.id));
      if (!mesmosIds) {
        return { statusCode: 409, headers: CORS_HEADERS, body: JSON.stringify({ erro: 'A lista de produtos mudou enquanto você organizava. Recarregue a página e tente de novo.' }) };
      }
      const ordenados = produtos.map((p) => {
        const { destaque, ...resto } = p;
        return { ...resto, ordem: ids.indexOf(p.id) + 1 };
      });
      await escreverArquivo(CAMINHO_PRODUTOS, gerarArquivoProdutos(ordenados), arquivoProdutos.sha, 'admin: organiza ordem da vitrine');
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

      // drop (coleção): 1 = os produtos de sempre, sem etiqueta; 2+ ganha a
      // etiqueta "Drop N" no card. Só grava a partir do 2 pra não sujar o JSON
      const dropEnviado = Math.round(Number(enviado.drop));
      const drop = 'drop' in enviado
        ? (dropEnviado >= 2 && dropEnviado <= 99 ? dropEnviado : undefined)
        : ehNovo ? undefined : produtos[indiceExistente].drop;

      // objeto (caneca, boneco, chaveiro) não tem tamanho de roupa - vira
      // tamanhos: ['Único'], que main.js já sabe ler (produto.tamanhos || TAMANHOS)
      // e usa pra esconder seletor de tamanho e tabela de medidas. Aceita o
      // formato antigo (tamanhoUnico) e o produto inteiro vindo do botão
      // "Marcar esgotado" (que manda tipo/tamanhos de volta como estavam)
      const ehObjeto =
        enviado.tipo === 'objeto' ||
        !!enviado.tamanhoUnico ||
        (enviado.tipo === undefined && Array.isArray(enviado.tamanhos) && enviado.tamanhos.length === 1);
      const tamanhos = ehObjeto ? ['Único'] : undefined;
      const tipo = ehObjeto ? 'objeto' : undefined;

      // cores: se o painel mandou o campo, ele manda (lista vazia = sem cores);
      // se não mandou, mantém o que o produto já tinha
      const cores = 'cores' in enviado ? limparCores(enviado.cores) : ehNovo ? undefined : produtos[indiceExistente].cores;
      // com cores, "imagens" vira as fotos da primeira cor (fallback pra quem lê só imagens)
      const imagensDasCores = cores ? cores[0].midias.filter((m) => m.tipo === 'img').map((m) => m.src) : null;
      const imagensEnviadas = (enviado.imagens || []).filter(caminhoMidiaValido);

      const produtoFinal = ehNovo
        ? {
            id,
            nome: enviado.nome,
            desc: enviado.desc || '',
            preco,
            tag: enviado.tag || '',
            gradiente: enviado.gradiente || 'linear-gradient(160deg, #5a2a8f, #ff2d95)',
            imagens: imagensDasCores && imagensDasCores.length ? imagensDasCores : imagensEnviadas,
            esgotado: !!enviado.esgotado,
            tipo,
            tamanhos,
            cores,
            drop,
          }
        : {
            ...produtos[indiceExistente],
            nome: enviado.nome,
            desc: enviado.desc,
            preco,
            tag: enviado.tag,
            imagens: imagensDasCores && imagensDasCores.length
              ? imagensDasCores
              : imagensEnviadas.length ? imagensEnviadas : produtos[indiceExistente].imagens,
            esgotado: !!enviado.esgotado,
            tipo,
            tamanhos,
            cores,
            drop,
          };

      // se a vitrine já foi organizada no painel, produto novo entra em
      // primeiro lugar (é lançamento) e os outros descem uma posição
      const vitrineOrganizada = produtos.some((p) => Number.isFinite(p.ordem));
      if (ehNovo && vitrineOrganizada) {
        produtos.forEach((p) => { if (Number.isFinite(p.ordem)) p.ordem += 1; });
        produtoFinal.ordem = 1;
      }

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
