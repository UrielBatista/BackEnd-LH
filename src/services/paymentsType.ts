const generatePaymentOfType = async (typeCode: string) => {
    let dataCob = null;

    switch (typeCode) {
        case '1':
            dataCob = {
                calendario: {
                    expiracao: 3600
                },
                valor: {
                    original: '0.01'
                },
                    chave: process.env.KEY_PIX_HASH,
                    solicitacaoPagador: 'Cobrança dos serviços prestados.'
            };
        break;

        case '2':
            dataCob = {
                calendario: {
                    expiracao: 3600
                },
                valor: {
                    original: '0.02'
                },
                    chave: process.env.KEY_PIX_HASH,
                    solicitacaoPagador: 'Cobrança dos serviços prestados.'
            };
        break;

        case '3':
            dataCob = {
                calendario: {
                    expiracao: 3600
                },
                valor: {
                    original: '0.03'
                },
                    chave: process.env.KEY_PIX_HASH,
                    solicitacaoPagador: 'Cobrança dos serviços prestados.'
            };
        break;

        default:
            break;
    }

  return dataCob;
  }


export = {
    generatePaymentOfType: generatePaymentOfType,
  };