import { eventHandler } from "h3"

// Learn more: https://nitro.build/guide/routing
export default eventHandler((event) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Peace2074.com - Islamic Platform</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 40px; }
        .api-list { background: #f5f5f5; padding: 20px; border-radius: 8px; }
        .endpoint { margin: 10px 0; }
        .method { color: #007bff; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🕌 Peace2074.com</h1>
        <p>Islamic Platform API - Built with Nitro & Deno</p>
      </div>
      
      <div class="api-list">
        <h2>📡 Available API Endpoints</h2>
        <div class="endpoint"><span class="method">GET</span> <a href="/api">/api</a> - API Status</div>
        <div class="endpoint"><span class="method">GET</span> <a href="/api/health">/api/health</a> - Health Check</div>
        <div class="endpoint"><span class="method">POST</span> /api/auth/register - User Registration</div>
        <div class="endpoint"><span class="method">POST</span> /api/auth/login - User Login</div>
      </div>
      
      <div style="margin-top: 40px; text-align: center;">
        <p>🚀 <strong>Status:</strong> Running on Deno + Nitro</p>
        <p>📖 Learn more from <a href="https://nitro.build/guide" target="_blank">Nitro Documentation</a></p>
      </div>
    </body>
    </html>
  `;
});
