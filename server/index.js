require('dotenv').config({ path: __dirname + '/.env' });
console.log('dotenv loaded from:', __dirname + '/.env');
const express = require('express');
const axios = require('axios');
const fs = require('fs');

const clientId = process.env.ZOHO_CLIENT_ID;
const redirectUri = process.env.ZOHO_REDIRECT_URI;
const SCOPE = 'ZohoCRM.modules.ALL';

console.log('CLIENT_ID:', clientId);
console.log('REDIRECT_URI:', redirectUri);

console.log('==== .env file content ====');
console.log(fs.readFileSync(__dirname + '/.env', 'utf-8'));
console.log('==========================');

const app = express();

// 認証開始エンドポイント
app.get('/auth/zoho', (req, res) => {
  const authUrl = `https://accounts.zoho.com/oauth/v2/auth?scope=${SCOPE}&client_id=${clientId}&response_type=code&access_type=offline&redirect_uri=${encodeURIComponent(redirectUri)}&prompt=consent`;
  res.redirect(authUrl);
});

// 認証コールバックエンドポイント
app.get('/auth/zoho/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send('認可コードがありません');

  try {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: process.env.ZOHO_CLIENT_SECRET,
      redirect_uri: redirectUri,
      code,
    });

    const response = await axios.post('https://accounts.zoho.com/oauth/v2/token', params);
    res.json(response.data);
  } catch (e) {
    console.error('Token exchange error:', e.response?.data || e.message);
    res.status(500).send('トークン取得失敗: ' + e.message);
  }
});

app.listen(4000, () => {
  console.log('Zoho認証サーバー起動: http://localhost:4000');
}); 