// Busca o status e os detalhes de um pagamento pra mostrar na pagina de
// confirmacao do pedido (pedido.html). So devolve o que e seguro exibir pro
// proprio cliente que fez a compra - nunca o access token nem dado de outros.

const SITE_URL = 'https://miamicria.com.br';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': SITE_URL,
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const NOMES_METODO = {
  pix: 'Pix',
  credit_card: 'Cartão de crédito',
  debit_card: 'Cartão de débito',
  ticket: 'Boleto',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  const params = event.queryStringParameters || {};
  const paymentId = params.payment_id || params.collection_id;

  if (!paymentId) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ erro: 'payment_id ausente' }) };
  }

  try {
    const resposta = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
    });

    if (!resposta.ok) {
      return { statusCode: 404, headers: CORS_HEADERS, body: JSON.stringify({ erro: 'Pedido não encontrado' }) };
    }

    const pagamento = await resposta.json();
    const metadata = pagamento.metadata || {};

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        status: pagamento.status,
        metodo: NOMES_METODO[pagamento.payment_type_id] || pagamento.payment_type_id || '-',
        parcelas: pagamento.installments || 1,
        valor: pagamento.transaction_amount,
        produtos: metadata.produtos_resumo || '',
        tamanhos: metadata.tamanhos_resumo || '',
        data: pagamento.date_approved || pagamento.date_created,
      }),
    };
  } catch (err) {
    console.error('Erro ao buscar status do pagamento:', err);
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ erro: 'Erro interno' }) };
  }
};
