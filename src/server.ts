import express, {request, response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors'
import dotenv from 'dotenv'
import { PrismaClient } from "@prisma/client"
import { z } from 'zod'

import GerNet from './services/gerencianet';
import PaymentsTypes from './services/paymentsType';

dotenv.config()
const app = express()
const router = express.Router();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use('/api', router);

router.use((request,response,next)=>{
    next();
 })

const prisma = new PrismaClient()


const reqGNAlready = GerNet.GNRequest({
    clientID: process.env.GN_CLIENT_ID_PROD,
    clientSecret: process.env.GN_CLIENT_SECRET_PROD
});


router.route('/pessoas').get( async (request,response)=>{
    const pessoas = await prisma.pessoas.findMany();
    return response.json(pessoas);
 })

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
    
    return response.json(request.body);
})

router.route('/inscricao/pagamento/:tipo').post( async (request,response) => {
    await GerNet.checkTokenExpiration()
    const reqGN = await reqGNAlready;

    let tipoPacote = request.params.tipo;
    let dataCob = await PaymentsTypes.generatePaymentOfType(tipoPacote);

    const cobResponse = await reqGN.post('/v2/cob', dataCob);
    const qrcodeResponse = await reqGN.get(`/v2/loc/${cobResponse.data.loc.id}/qrcode`);

    response.json(qrcodeResponse.data);
})

router.route('/verificacao/pessoa/:id').get( async (request,response)=>{
    try{
      await GerNet.checkTokenExpiration()
      const reqGN = await reqGNAlready;
      const requestPersonPayed = await reqGN.get(`/v2/cob/${request.params.id}`)
      response.json(requestPersonPayed.data);
    } catch(response){
      console.log('error in get id');
    }
  })

  var port = process.env.PORT || 8090;
  app.listen(port);
  console.log('Api rodando em: http://localhost:'+port);