import { createServer } from 'node:http';
const controls = `<div><button id="replace-faq">Replace FAQ element</button><button id="replace-faq-content">Replace FAQ content</button></div><script>
document.getElementById('replace-faq').addEventListener('click',()=>{const faq=document.querySelector('archive-faq');faq.replaceWith(faq.cloneNode(true));});
document.getElementById('replace-faq-content').addEventListener('click',()=>{const faq=document.querySelector('archive-faq');const clone=faq.cloneNode(true);faq.replaceChildren(...clone.childNodes);});
</script>`;
createServer(async (req, res) => {
  try {
    if (req.method !== 'GET') {
      res.writeHead(405).end();
      return;
    }
    const fixture = req.url === '/__faq-lifecycle/';
    const path = fixture ? '/summit/shanghai-2019/faq/' : req.url;
    const upstream = await fetch('http://127.0.0.1:4407' + path);
    const headers = {
      'content-type': upstream.headers.get('content-type') || 'application/octet-stream',
      'cache-control': 'no-store',
    };
    res.writeHead(upstream.status, headers);
    if (fixture) res.end((await upstream.text()).replace('</body>', controls + '</body>'));
    else res.end(Buffer.from(await upstream.arrayBuffer()));
  } catch {
    res.writeHead(500).end('Local fixture error');
  }
}).listen(4408, '127.0.0.1', () => console.log('Local FAQ replacement fixture on 4408'));
