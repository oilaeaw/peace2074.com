#!/usr/bin/env node

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface DeepSeekPayload {
  model: string;
  messages: ChatMessage[];
  temperature: number;
}

interface DeepSeekResponse {
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

const DEEPSEEK_API_KEY: string =
  process.env.DEEPSEEK_API_KEY || "sk-c9500709d5d6483689e12cd77f735222";
const DEEPSEEK_BASE_URL: string =
  process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";

console.log("🧪 Testing DeepSeek Integration...\n");
console.log(`API Key: ${DEEPSEEK_API_KEY.substring(0, 15)}...`);
console.log(`Base URL: ${DEEPSEEK_BASE_URL}\n`);

const payload: DeepSeekPayload = {
  model: "deepseek-chat",
  messages: [{ role: "user", content: "Say hello in Arabic (one word)" }],
  temperature: 0.7,
};

try {
  const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ Error ${response.status}:`, errorText);
    process.exit(1);
  }

  const data = (await response.json()) as DeepSeekResponse;
  const message = data.choices?.[0]?.message?.content;

  console.log("✅ DeepSeek Response:");
  console.log(`   ${message}`);
  console.log("\n📊 Usage:", data.usage);
  console.log("\n✨ DeepSeek integration is working!\n");
} catch (error) {
  console.error("❌ Test failed:", (error as Error).message);
  process.exit(1);
}
