import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
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
})
