// Gera a preferencia de pagamento (Checkout Pro) pro carrinho recebido.
const FRETE_FIXO = 19.90;
const SITE_URL = 'https://miamicria.com.br';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ erro: 'JSON inválido' }) };
  }

  const itensCarrinho = Array.isArray(payload.itens) ? payload.itens : [];
  if (itensCarrinho.length === 0) {
    return { statusCode: 400, body: JSON.stringify({ erro: 'Carrinho vazio' }) };
  }

  // preco/nome vêm do cliente só pra exibição - nunca confiamos no valor pra
  // cobrança sem validar o formato básico aqui
  const itemInvalido = itensCarrinho.some((item) => !item.nome || !Number.isFinite(Number(item.preco)) || Number(item.preco) <= 0);
  if (itemInvalido) {
    return { statusCode: 400, body: JSON.stringify({ erro: 'Item inválido no carrinho' }) };
  }

  const items = itensCarrinho.map((item) => ({
    title: `${item.nome} - Tam. ${item.tamanho || '-'}`,
    quantity: 1,
    unit_price: Math.round(Number(item.preco) * 100) / 100,
    currency_id: 'BRL',
  }));

  items.push({
    title: 'Frete',
    quantity: 1,
    unit_price: FRETE_FIXO,
    currency_id: 'BRL',
  });

  const preferencia = {
    items,
    back_urls: {
      success: `${SITE_URL}/?pedido=aprovado`,
      failure: `${SITE_URL}/?pedido=recusado`,
      pending: `${SITE_URL}/?pedido=pendente`,
    },
    auto_return: 'approved',
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
      return { statusCode: 502, body: JSON.stringify({ erro: 'Não foi possível gerar o pagamento' }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ init_point: dados.init_point }),
    };
  } catch (err) {
    console.error('Erro ao chamar o Mercado Pago:', err);
    return { statusCode: 500, body: JSON.stringify({ erro: 'Erro interno' }) };
  }
};
