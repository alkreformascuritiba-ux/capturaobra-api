const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3333;
const API_KEY = process.env.ANTHROPIC_API_KEY || '';

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

async function callClaude(system, messages, hasPdf) {
  const https = require('https');

  const body = JSON.stringify({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system,
    messages,
  });

  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
    'anthropic-version': '2023-06-01',
    'Content-Length': Buffer.byteLength(body),
  };
  if (hasPdf) headers['anthropic-beta'] = 'pdfs-2024-09-25';

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers,
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) return reject(new Error(json.error.message));
          const text = (json.content || []).map(b => b.text || '').join('');
          resolve(text);
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'ok', service: 'CAPTURAOBRA Orçamentista IA' }));
  }

  if (req.method === 'POST' && req.url === '/api/chat') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        if (!API_KEY) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'ANTHROPIC_API_KEY não configurada.' }));
        }

        const { system, messages, pdf, pdfName } = JSON.parse(body);

        // Se vier PDF, injeta como document block na última mensagem do usuário
        let processedMessages = messages;
        if (pdf) {
          processedMessages = messages.map((msg, idx) => {
            if (idx === messages.length - 1 && msg.role === 'user') {
              const textContent = typeof msg.content === 'string' ? msg.content : '';
              return {
                role: 'user',
                content: [
                  {
                    type: 'document',
                    source: {
                      type: 'base64',
                      media_type: 'application/pdf',
                      data: pdf,
                    },
                    title: pdfName || 'projeto.pdf',
                  },
                  {
                    type: 'text',
                    text: textContent || 'Analise este projeto e gere um orçamento detalhado.',
                  },
                ],
              };
            }
            return msg;
          });
        }

        const content = await callClaude(system, processedMessages, !!pdf);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ content }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Static files (uso local)
  const filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url.replace(/^\//, ''));
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end('Not found');
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log('');
  console.log('  CAPTURAOBRA — Orçamentista IA');
  console.log(`  Servidor: http://localhost:${PORT}`);
  console.log('');
  if (!API_KEY) {
    console.log('  ATENÇÃO: ANTHROPIC_API_KEY não encontrada!');
  } else {
    console.log('  Chave da API OK — IAOTA!');
  }
  console.log('');
});
