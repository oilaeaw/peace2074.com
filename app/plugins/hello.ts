import hello from 'hellojs'

export default defineNuxtPlugin((_nuxtApp) => {
  return hello.init({
    providers: {
      google: {
        client_id: 'YOUR_GOOGLE_CLIENT_ID',
        scope: '    email',
      },
      github: {
        client_id: 'YOUR_GITHUB_CLIENT_ID',
        scope: 'user:email',
      },
    },
    redirect_uri: 'http://localhost:3000/auth/callback',
    response_type: 'token',
    popup: true,
    debug: true,
  })
  return {
    provide: {
      hello,
    },
  }
})
