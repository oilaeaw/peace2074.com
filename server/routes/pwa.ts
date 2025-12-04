import { defineEventHandler, setHeader } from 'h3'

export default defineEventHandler((event) => {
    setHeader(event, 'Content-Type', 'application/manifest+json')
    return {
        "name": "Peace 2074",
        "short_name": "Peace 2074",
        "description": "Islamic Platform",
        "start_url": "/",
        "display": "standalone",
        "background_color": "#000000",
        "theme_color": "#1a237e",
        "icons": [
            {
                "src": "/android-chrome-192x192.png",
                "sizes": "192x192",
                "type": "image/png"
            },
            {
                "src": "/android-chrome-512x512.png",
                "sizes": "512x512",
                "type": "image/png"
            },
            {
                "src": "/maskable-icon.png",
                "sizes": "512x512",
                "type": "image/png",
                "purpose": "maskable"
            }
        ]
    }
})
