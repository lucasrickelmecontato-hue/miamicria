// Recebe o aviso do Mercado Pago quando um pagamento muda de status.
// Quando for aprovado, busca os dados de verdade na API deles (nunca confia
// no que vem no corpo da notificacao) e grava o pedido no Airtable.

const AIRTABLE_BASE_ID = 'appzmmKdcXbKAv32N';
const AIRTABLE_TABLE = 'Table 1';

function extrairIdPagamento(event) {
  if (event.body) {
    try {
      const body = JSON.parse(event.body);
      if (body.type === 'payment' && body.data && body.data.id) return String(body.data.id);
    } catch (err) {
      // corpo nao era JSON valido, tenta pela querystring abaixo
    }
  }
  const params = event.queryStringParameters || {};
  return params['data.id'] || params.id || null;
}

exports.handler = async (event) => {
  // o Mercado Pago so precisa de um 200 rapido - qualquer coisa que nao seja
  // um pagamento aprovado valido a gente so ignora sem dar erro, pra ele nao
  // ficar reenviando a notificacao
  const responderOk = () => ({ statusCode: 200, body: 'ok' });

  const paymentId = extrairIdPagamento(event);
  if (!paymentId) return responderOk();

  try {
    const respPagamento = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
    });

    if (!respPagamento.ok) return responderOk();

    const pagamento = await respPagamento.json();
    if (pagamento.status !== 'approved') return responderOk();

    // o Mercado Pago pode mandar a mesma notificacao mais de uma vez - checa
    // se esse pagamento ja foi gravado antes de criar um registro novo
    const filtro = encodeURIComponent(`{ID Pagamento} = "${paymentId}"`);
    const respBusca = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE)}?filterByFormula=${filtro}`,
      { headers: { Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}` } }
    );

    if (respBusca.ok) {
      const busca = await respBusca.json();
      if (busca.records && busca.records.length > 0) return responderOk();
    }

    const metadata = pagamento.metadata || {};
    const endereco = metadata.endereco_completo || {};

    const registro = {
      fields: {
        'ID Pagamento': paymentId,
        Nome: endereco.nome || '',
        Telefone: endereco.telefone || '',
        Produto: metadata.produtos_resumo || '',
        Tamanho: metadata.tamanhos_resumo || '',
        CEP: endereco.cep || '',
        Endereco: endereco.rua || '',
        Numero: endereco.numero || '',
        Complemento: endereco.complemento || '',
        Bairro: endereco.bairro || '',
        Cidade: endereco.cidade || '',
        Estado: endereco.estado || '',
        Valor: metadata.valor_total || pagamento.transaction_amount || 0,
        Data: new Date().toISOString().slice(0, 10),
        Status: 'Pendente',
      },
    };

    const respAirtable = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`,
        },
        body: JSON.stringify(registro),
      }
    );

    if (!respAirtable.ok) {
      const erroAirtable = await respAirtable.json().catch(() => ({}));
      console.error('Airtable recusou o registro:', erroAirtable);
    }

    return responderOk();
  } catch (err) {
    console.error('Erro no webhook de pagamento:', err);
    return responderOk();
  }
};
