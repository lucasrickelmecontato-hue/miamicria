// Gera a preferencia de pagamento (Checkout Pro) pro carrinho recebido.
const FRETE_FIXO = 19.90;
const SITE_URL = 'https://miamicria.com.br';
const FUNCTIONS_URL = 'https://miamicria.netlify.app/.netlify/functions';

// o site vive no GitHub Pages (miamicria.com.br) e essa funcao vive no
// Netlify (miamicria.netlify.app) - dominios diferentes, entao precisa
// liberar CORS pro navegador aceitar a resposta
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': SITE_URL,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS_HEADERS, body: 'Method Not Allowed' };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (err) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ erro: 'JSON inválido' }) };
  }

  const itensCarrinho = Array.isArray(payload.itens) ? payload.itens : [];
  if (itensCarrinho.length === 0) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ erro: 'Carrinho vazio' }) };
  }

  // preco/nome vêm do cliente só pra exibição - nunca confiamos no valor pra
  // cobrança sem validar o formato básico aqui
  const itemInvalido = itensCarrinho.some((item) => !item.nome || !Number.isFinite(Number(item.preco)) || Number(item.preco) <= 0);
  if (itemInvalido) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ erro: 'Item inválido no carrinho' }) };
  }

  const endereco = payload.endereco || {};
  const camposEndereco = ['nome', 'telefone', 'cep', 'numero', 'rua', 'bairro', 'cidade', 'estado'];
  const enderecoIncompleto = camposEndereco.some((campo) => !endereco[campo]);
  if (enderecoIncompleto) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ erro: 'Endereço incompleto' }) };
  }

  const telefoneNumeros = String(endereco.telefone).replace(/\D/g, '');

  const items = itensCarrinho.map((item) => ({
    title: `${item.nome} - Tam. ${item.tamanho || '-'}`,
    quantity: 1,
    unit_price: Math.round(Number(item.preco) * 100) / 100,
    currency_id: 'BRL',
  }));

  const valorTotal = items.reduce((acc, item) => acc + item.unit_price, 0) + FRETE_FIXO;
  const produtosResumo = itensCarrinho.map((item) => item.nome).join(', ');
  const tamanhosResumo = itensCarrinho.map((item) => item.tamanho || '-').join(', ');

  items.push({
    title: 'Frete',
    quantity: 1,
    unit_price: FRETE_FIXO,
    currency_id: 'BRL',
  });

  const preferencia = {
    items,
    payer: {
      name: endereco.nome,
      phone: {
        area_code: telefoneNumeros.slice(0, 2),
        number: telefoneNumeros.slice(2),
      },
      address: {
        zip_code: endereco.cep,
        street_name: endereco.rua,
        street_number: endereco.numero,
      },
    },
    // guardado aqui pra recuperar o pedido completo quando o pagamento for
    // confirmado (o webhook busca isso de volta pra escrever no Airtable)
    metadata: {
      endereco_completo: endereco,
      produtos_resumo: produtosResumo,
      tamanhos_resumo: tamanhosResumo,
      valor_total: valorTotal,
    },
    back_urls: {
      success: `${SITE_URL}/pedido.html`,
      failure: `${SITE_URL}/pedido.html`,
      pending: `${SITE_URL}/pedido.html`,
    },
    auto_return: 'approved',
    notification_url: `${FUNCTIONS_URL}/payment-webhook`,
    payment_methods: {
      excluded_payment_types: [{ id: 'ticket' }],
      installments: 3,
      default_installments: 1,
    },
  };

  try {
    const resposta = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(preferencia),
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      console.error('Mercado Pago recusou a preferência:', dados);
      return { statusCode: 502, headers: CORS_HEADERS, body: JSON.stringify({ erro: 'Não foi possível gerar o pagamento' }) };
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ init_point: dados.init_point }),
    };
  } catch (err) {
    console.error('Erro ao chamar o Mercado Pago:', err);
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ erro: 'Erro interno' }) };
  }
};
