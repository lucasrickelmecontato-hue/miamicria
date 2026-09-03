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

    const metadata = pagamento.metadata || {};
    const endereco = metadata.endereco_completo || {};

    // o Mercado Pago pode mandar a mesma notificacao mais de uma vez, as vezes
    // quase simultaneamente - usar "checa se existe, depois cria" como duas
    // chamadas separadas deixa uma brecha de tempo onde duas notificacoes
    // concorrentes passam pela checagem antes de qualquer uma delas gravar,
    // e as duas criam linha. O upsert do Airtable resolve o "existe ou nao"
    // e a gravacao numa unica chamada atomica do lado deles, fechando essa
    // brecha - por isso nao seta o Status aqui (ver abaixo)
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
      },
    };

    const respAirtable = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE)}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`,
        },
        body: JSON.stringify({
          performUpsert: { fieldsToMergeOn: ['ID Pagamento'] },
          records: [registro],
        }),
      }
    );

    if (!respAirtable.ok) {
      const erroAirtable = await respAirtable.json().catch(() => ({}));
      console.error('Airtable recusou o registro:', erroAirtable);
      return responderOk();
    }

    const resultado = await respAirtable.json();
    const idNovoRegistro = (resultado.createdRecords || [])[0];

    // so seta Status = Pendente quando o registro acabou de ser criado - se
    // for uma notificacao duplicada batendo num pedido que ja existe, isso
    // evita apagar um Status que a pessoa ja tenha mudado pra Enviado
    if (idNovoRegistro) {
      await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE)}/${idNovoRegistro}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`,
          },
          body: JSON.stringify({ fields: { Status: 'Pendente' } }),
        }
      ).catch((err) => console.error('Erro ao setar Status inicial:', err));
    }

    return responderOk();
  } catch (err) {
    console.error('Erro no webhook de pagamento:', err);
    return responderOk();
  }
};
