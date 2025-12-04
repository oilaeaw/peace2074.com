export default defineEventHandler(() => {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>About Us - Peace 2074</title>
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
          <h1>About Us</h1>
          <p>This is the about page for Peace 2074.</p>
          <p>Powered by Deno and Nitro.</p>
        </main>
      </body>
    </html>
  `
})
