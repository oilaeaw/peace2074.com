import { defineEventHandler } from 'h3'

export default defineEventHandler(() => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Peace2074.com - Islamic Platform</title>
      <link rel="manifest" href="/pwa">
      <script>
        if ('serviceWorker' in navigator) {
          window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').then(registration => {
              console.log('ServiceWorker registration successful with scope: ', registration.scope);
            }, err => {
              console.log('ServiceWorker registration failed: ', err);
            });
          });
        }
      </script>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 800px; 
          margin: 50px auto; 
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          min-height: 100vh;
        }
        .container {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          padding: 40px;
          border-radius: 20px;
          text-align: center;
        }
        h1 { font-size: 2.5em; margin-bottom: 20px; }
        .subtitle { font-size: 1.2em; opacity: 0.9; margin-bottom: 40px; }
        .status { 
          background: rgba(0, 255, 0, 0.2); 
          padding: 15px; 
          border-radius: 10px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🕌 Peace2074.com</h1>
        <p class="subtitle">Fresh Nitro + Deno Islamic Platform</p>
        
        <div class="status">
          <h2>✅ Server Status: Running</h2>
          <p>🚀 <strong>Powered by:</strong> Nitro + Deno</p>
          <p>🌟 <strong>No Vercel:</strong> Pure clean setup</p>
          <p>📅 <strong>Started:</strong> ${new Date().toLocaleString()}</p>
        </div>
        
        <p>Ready to build amazing Islamic features! 🌙</p>
      </div>
    </body>
    </html>
  `
})
