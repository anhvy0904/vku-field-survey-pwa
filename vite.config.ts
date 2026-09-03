import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [
      react(),
      {
        name: 'vercel-api-proxy',
        configureServer(server) {
          server.middlewares.use('/api/surveys', async (req, res) => {
            if (req.method === 'POST') {
              let body = '';
              req.on('data', chunk => { body += chunk.toString(); });
              req.on('end', async () => {
                try {
                  if (!process.env.GOOGLE_APPS_SCRIPT_URL) {
                    process.env.GOOGLE_APPS_SCRIPT_URL = env.GOOGLE_APPS_SCRIPT_URL;
                  }
                  
                  const handlerModule = await server.ssrLoadModule('/api/surveys.ts');
                  
                  const mockReq = {
                    method: req.method,
                    body: body ? JSON.parse(body) : {},
                    headers: req.headers
                  };
  
                  const mockRes = {
                    setHeader: (k: string, v: string) => res.setHeader(k, v),
                    status: (code: number) => {
                      res.statusCode = code;
                      return mockRes;
                    },
                    json: (data: any) => {
                      res.setHeader('Content-Type', 'application/json');
                      res.end(JSON.stringify(data));
                    },
                    end: () => res.end()
                  };
  
                  await handlerModule.default(mockReq, mockRes);
                } catch (e: any) {
                  console.error('[API Proxy Error]', e);
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: e.message }));
                }
              });
            } else {
              res.statusCode = 405;
              res.end('Method Not Allowed');
            }
          });
        }
      },
      {
        name: 'inject-sw-assets',
        enforce: 'post',
        async writeBundle(options, bundle) {
          const assets = Object.keys(bundle).filter(name => 
            name.startsWith('assets/') && (name.endsWith('.js') || name.endsWith('.css'))
          ).map(name => `/${name}`);
  
          const fs = await import('node:fs');
          const path = await import('node:path');
          const swPath = path.resolve(options.dir || 'dist', 'sw.js');
          
          if (fs.existsSync(swPath)) {
            let swContent = fs.readFileSync(swPath, 'utf-8');
            swContent = swContent.replace(
              '/* INJECT_ASSETS_HERE */',
              assets.map(a => `'${a}'`).join(',\n  ')
            );
            fs.writeFileSync(swPath, swContent);
          }
        }
      }
    ],
  };
})
