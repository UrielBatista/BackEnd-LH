require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const prisma = new PrismaClient();

// const Pessoa = require('./src/models/PersonModel');

const GerNet = require('./services/gerencianet');
const PaymentsTypes = require('./services/paymentsType');

var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
const { response, request } = require('express');
var app = express();
var router = express.Router();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use('/api', router);

router.use((request,response,next)=>{
   next();
})

const reqGNAlready = GerNet.GNRequest({
  clientID: process.env.GN_CLIENT_ID,
  clientSecret: process.env.GN_CLIENT_SECRET
});

//GET Busca todas as pessoa cadastradas no banco de dados
router.route('/pessoas').get( async (request,response)=>{
   const pessoas = await prisma.pessoas.findMany();
   return response.json(pessoas);
})


//POST Cria a pessoa de fato no banco de dados
router.route('/inscricao/pessoa').post(async (request, response) => {
    const createPerssoasSchema = z.object({
      Nome: z.string(),
      Email: z.string(),
      Telefone: z.string(),
      Instrumento: z.string(),
      Descricao: z.string(),
    })

    const {Nome, Email, Telefone, Instrumento, Descricao} = createPerssoasSchema.parse(request.body);

    // Cria uma nova pessoa usando o modelo Pessoa
    await prisma.pessoas.create({
      data: {
        Nome,
        Email,
        Telefone,
        Instrumento,
        Descricao,
      }
    });
    
    return response.status(201);
})

//POST Faz o processo de geração de pagamento com o valor específico
router.route('/inscricao/pagamento/:tipo').post( async (request,response) => {
    await GerNet.checkTokenExpiration()
    const reqGN = await reqGNAlready;

    let tipoPacote = request.params.tipo;
    let dataCob = await PaymentsTypes.generatePaymentOfType(tipoPacote);

    const cobResponse = await reqGN.post('/v2/cob', dataCob);
    const qrcodeResponse = await reqGN.get(`/v2/loc/${cobResponse.data.loc.id}/qrcode`);

    response.json(qrcodeResponse.data);
})

//GET Verifica se a pessoa pagou ou não via PIX
router.route('/verificacao/pessoa/:id').get( async (request,response)=>{
  try{
    await GerNet.checkTokenExpiration()
    const reqGN = await reqGNAlready;
    const requestPersonPayed = await reqGN.get(`/v2/cob/${request.params.id}`)
    response.json(requestPersonPayed.data);
  } catch(response){
    console.log(response.response.data);
  }
})


var port = process.env.PORT || 8090;
app.listen(port);
console.log('Api rodando em: http://localhost:'+port);



