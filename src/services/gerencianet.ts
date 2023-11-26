import axios from "axios";
import dotenv from 'dotenv';

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Agent } from 'https';

dotenv.config();

let tokenExpirationTime: any;

const cert = readFileSync(
    resolve(__dirname, `../../certs/${process.env.GN_CERT_PROD}`)
);

const agent = new Agent({
    pfx: cert,
    passphrase: ''
});


const authenticate = ({ clientID, clientSecret }: any) => {
    const credentials = Buffer.from(
      `${clientID}:${clientSecret}`
    ).toString('base64');
  
    return axios({
      method: 'POST',
      url: `${process.env.GN_ENDPOINT_PROD}/oauth/token`,
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json'
      },
      httpsAgent: agent,
      data: {
        grant_type: 'client_credentials'
      }
    });
};


const reAuthenticationApi = async (clientID: any, clientSecret: any) => {
    let reAuthenticationCredentials = {clientID, clientSecret}
    const authResponse = await authenticate(reAuthenticationCredentials);
    const accessToken = authResponse.data.access_token;
    tokenExpirationTime = Date.now() + 3600 * 1000;
  
    return axios.create({
      baseURL: process.env.GN_ENDPOINT_PROD,
      httpsAgent: agent,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
  }


  const GNRequest = async (credentials: any) => {
    const authResponse = await authenticate(credentials);
    const accessToken = authResponse.data.access_token;
    tokenExpirationTime = Date.now() + 3600 * 1000;
    return axios.create({
      baseURL: process.env.GN_ENDPOINT_PROD,
      httpsAgent: agent,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
  }

  const checkTokenExpiration = async () => {
    let dateTime = Date.now();
    let expiration = tokenExpirationTime - 300000;
    if (dateTime > expiration) { 
      console.log('gerando novo token');
      await reAuthenticationApi(process.env.GN_CLIENT_ID_PROD, process.env.GN_CLIENT_SECRET_PROD);
    }
  };

  export = {
    GNRequest: GNRequest,
    checkTokenExpiration: checkTokenExpiration,
  };