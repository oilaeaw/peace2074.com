export default defineEventHandler(() => {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>Peace 2074 - Home</title>
        <link rel="icon" href="/favicon.ico" type="image/x-icon">
      </head>
      <body>
        <header>
          <nav>
            <strong>Navigation:</strong>
            <a href="/">Home</a> |
            <a href="/about">About Us</a> |
            <a href="/contact">Contact Us</a>
          </nav>
        </header>
        <main>
          <h1>Welcome to Peace 2074</h1>
          <p>This is the main page. You should see navigation links above.</p>
          <p>Powered by Deno and Nitro.</p>
        </main>
      </body>
    </html>
  `
})
