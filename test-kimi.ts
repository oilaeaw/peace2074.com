#!/usr/bin/env node

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface KimiPayload {
  model: string;
  messages: ChatMessage[];
  temperature: number;
}

interface KimiResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    prompt_tokens_details: { cached_tokens: number };
    prompt_cache_hit_tokens: number;
    prompt_cache_miss_tokens: number;
  };
}

const KIMI_API_KEY: string =
  process.env.KIMI_API_KEY || "sk-your-test-key";
const KIMI_BASE_URL: string =
  process.env.KIMI_BASE_URL || "https://example.com/api"; // Set via env var

console.log("🧪 Testing Kimi Integration...\n");
console.log(`API Key: ${KIMI_API_KEY.substring(0, 15)}...`);
console.log(`Base URL: ${KIMI_BASE_URL}\n`);

const payload: KimiPayload = {
  model: "kimi-chat",
  messages: [{ role: "user", content: "Say hello in Arabic (one word)" }],
  temperature: 0.7,
};

try {
  const response = await fetch(`${KIMI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${KIMI_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ Error ${response.status}:`, errorText);
    process.exit(1);
  }

  const data = (await response.json()) as KimiResponse;
  const message = data.choices?.[0]?.message?.content;

  console.log("✅ Kimi Response:");
  console.log(`   ${message}`);
  console.log("\n📊 Usage:", data.usage);
  console.log("\n✨ Kimi integration is working!\n");
} catch (error) {
  console.error("❌ Test failed:", (error as Error).message);
  process.exit(1);
}
