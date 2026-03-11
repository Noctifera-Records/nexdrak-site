const { spawn } = require('child_process');
const http = require('http');

console.log('Starting wrangler...');
const wrangler = spawn('npx', ['wrangler', 'pages', 'dev', '.open-next/assets', '--compatibility-date=2024-11-18', '--compatibility-flags=nodejs_compat', '--port=8789'], { shell: true });

wrangler.stdout.on('data', (data) => {
  const str = data.toString();
  console.log('[wrangler] ' + str.trim());
  if (str.includes('Ready on')) {
    console.log('Wrangler is ready, fetching...');
    setTimeout(() => {
        http.get('http://localhost:8789/', (res) => {
            console.log('Status:', res.statusCode);
            let body = '';
            res.on('data', d => body += d);
            res.on('end', () => {
                console.log('Response:', body.substring(0, 200));
                wrangler.kill();
                process.exit(0);
            });
        }).on('error', (e) => {
            console.error('Fetch error:', e);
            wrangler.kill();
            process.exit(1);
        });
    }, 2000);
  }
});

wrangler.stderr.on('data', (data) => {
  console.error('[wrangler err] ' + data.toString().trim());
});
