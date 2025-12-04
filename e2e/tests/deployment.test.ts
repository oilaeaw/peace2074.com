import { assertEquals, assertStringIncludes } from "@std/assert";

const BASE_URL = Deno.args.find(arg => arg.startsWith('--base-url='))?.split('=')[1] || 'http://localhost:3000';

async function fetchWithTimeout(url: string, timeout = 5000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { signal: controller.signal });
    return response;
  } catch (error) {
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

Deno.test("Deployment verification - All endpoints accessible", async () => {
  console.log(`🚀 Running deployment verification tests against: ${BASE_URL}`);
  
  const endpoints = [
    { path: "", name: "Homepage" },
    { path: "/api", name: "API Status" },
    { path: "/api/health", name: "Health Check" }
  ];
  
  for (const endpoint of endpoints) {
    console.log(`🔍 Testing ${endpoint.name}: ${BASE_URL}${endpoint.path}`);
    
    const response = await fetchWithTimeout(`${BASE_URL}${endpoint.path}`);
    assertEquals(response.status, 200, `${endpoint.name} should be accessible`);
    await response.text(); // Consume the body to prevent resource leaks
    console.log(`✅ ${endpoint.name} - OK (${response.status})`);
  }
  
  console.log("🎉 All deployment verification tests passed!");
});

Deno.test("Technology stack verification", async () => {
  console.log(`🔧 Verifying technology stack`);
  
  // Check homepage mentions the right tech
  const homeResponse = await fetchWithTimeout(BASE_URL);
  const homeHtml = await homeResponse.text();
  
  assertStringIncludes(homeHtml, "Powered by Deno and Nitro", "Should use Nitro + Deno");
  
  console.log("✅ Technology stack verified correctly");
});

Deno.test("No legacy framework conflicts", async () => {
  console.log(`🧹 Checking for legacy framework conflicts`);
  
  // Check that responses don't contain Nuxt-specific headers or content
  const response = await fetchWithTimeout(BASE_URL);
  const headers = Object.fromEntries(response.headers.entries());
  const html = await response.text(); // Consume body
  
  // Should not have Nuxt-specific headers
  assertEquals(headers["x-nuxt-version"], undefined, "Should not have Nuxt version header");
  
  // Should not contain Nuxt-specific content
  assertEquals(html.includes("__NUXT__"), false, "Should not contain Nuxt hydration data");
  assertEquals(html.includes("nuxt"), false, "Should not contain nuxt references");
  
  console.log("✅ No legacy framework conflicts detected");
});
