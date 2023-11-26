require('dotenv').config(); 

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const https = require('https');


let tokenExpirationTime = null;

const cert = fs.readFileSync(
  path.resolve(__dirname, `../../certs/homologacao-522327-louvorharmonia-dev.p12`)
);

const agent = new https.Agent({
  pfx: cert,
  passphrase: ''
});

const authenticate = ({ clientID, clientSecret }) => {
  const credentials = Buffer.from(
    `${clientID}:${clientSecret}`
  ).toString('base64');

  return axios({
    method: 'POST',
    url: `${process.env.GN_ENDPOINT}/oauth/token`,
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


const reAuthenticationApi = async (clientID, clientSecret) => {
  let reAuthenticationCredentials = {clientID, clientSecret}
  const authResponse = await authenticate(reAuthenticationCredentials);
  const accessToken = authResponse.data.access_token;
  tokenExpirationTime = Date.now() + 3600 * 1000;

  return axios.create({
    baseURL: process.env.GN_ENDPOINT,
    httpsAgent: agent,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });
}

const GNRequest = async (credentials) => {
  const authResponse = await authenticate(credentials);
  const accessToken = authResponse.data.access_token;
  tokenExpirationTime = Date.now() + 3600 * 1000;
  return axios.create({
    baseURL: process.env.GN_ENDPOINT,
    httpsAgent: agent,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });
}

const checkTokenExpiration = async (req, res) => {
  let dateTime = Date.now();
  let expiration = tokenExpirationTime - 300000;
  if (dateTime > expiration) { 
    console.log('gerando novo token');
    await reAuthenticationApi(process.env.GN_CLIENT_ID, process.env.GN_CLIENT_SECRET);
  }
};

module.exports = {
  GNRequest: GNRequest,
  checkTokenExpiration: checkTokenExpiration,
};