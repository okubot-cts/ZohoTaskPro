const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  
  if (parsedUrl.pathname === '/callback') {
    const { code, state, error } = parsedUrl.query;
    
    if (error) {
      res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <html>
          <body>
            <h1>認証エラー</h1>
            <p>エラー: ${error}</p>
            <script>setTimeout(() => window.close(), 3000);</script>
          </body>
        </html>
      `);
      return;
    }
    
    if (code) {
      // 認証コードをメインアプリに転送
      const redirectUrl = `http://localhost:3001/auth/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state || '')}`;
      
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <html>
          <body>
            <h1>認証成功</h1>
            <p>認証が完了しました。メインアプリケーションに戻ります...</p>
            <script>
              setTimeout(() => {
                window.opener.location.href = '${redirectUrl}';
                window.close();
              }, 2000);
            </script>
          </body>
        </html>
      `);
    } else {
      res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <html>
          <body>
            <h1>認証失敗</h1>
            <p>認証コードが見つかりません</p>
            <script>setTimeout(() => window.close(), 3000);</script>
          </body>
        </html>
      `);
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`認証コールバックサーバーが http://localhost:${PORT} で起動しました`);
  console.log('Zoho認証のリダイレクト先: http://localhost:8080/callback');
});

process.on('SIGTERM', () => {
  console.log('認証サーバーを停止しています...');
  server.close();
});

process.on('SIGINT', () => {
  console.log('認証サーバーを停止しています...');
  server.close();
  process.exit(0);
});