import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    
    define: {
      'process.env.API_URL': JSON.stringify(env.VITE_API_URL),
    },
    
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      },
      //hmr: process.env.DISABLE_HMR !== 'true',
      proxy: {
      "/api": {
        target: "https://performance-fast-api.vercel.app",
        changeOrigin: true,
       },
      },
    },
  };
});