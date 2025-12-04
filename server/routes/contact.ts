export default defineEventHandler(() => {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>Contact Us - Peace 2074</title>
        <link rel="icon" href="/favicon.ico" type="image/x-icon">
      </head>
      <body>
        <header>
          <nav>
            <a href="/">Home</a> |
            <a href="/about">About</a> |
            <a href="/contact">Contact</a>
          </nav>
        </header>
        <main>
          <h1>Contact Us</h1>
          <p>This is the contact page for Peace 2074.</p>
          <p>Powered by Deno and Nitro.</p>
        </main>
      </body>
    </html>
  `
})
