import { defineNitroConfig } from "nitropack";

const DEFAULT_PORT = 3000;

export default defineNitroConfig({
    compatibilityDate: "2024-10-01",
    srcDir: "server",
    devServer: {
        port: DEFAULT_PORT,
        host: "0.0.0.0",
        // Enforce the chosen port; if 3000 is busy, Nitro will error instead of auto-picking another port.
        strictPort: true,
    },
    runtimeConfig: {
        // Secrets are automatically read from corresponding
        // environment variables e.g. NITRO_DEEPSEEK_API_KEY
        deepseekApiKey: "",
        deepseekBaseUrl: "z     ",
        contactFrom: "",
        contactTo: "",
        netlifyWebhookSecret: "",
        slackWebhookUrl: "",
    },
    // No SSR renderer needed; pure API
});
