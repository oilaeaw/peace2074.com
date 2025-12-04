import { assertEquals, assertStringIncludes } from "@std/assert";

const BASE_URL = Deno.args.find(arg => arg.startsWith('--base-url='))?.split('=')[1] || 'http://localhost:3000';

async function fetchWithTimeout(url: string, timeout = 5000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
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
    
    try {
      const response = await fetchWithTimeout(`${BASE_URL}${endpoint.path}`);
      assertEquals(response.status, 200, `${endpoint.name} should be accessible`);
      console.log(`✅ ${endpoint.name} - OK (${response.status})`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ ${endpoint.name} - FAILED:`, errorMessage);
      throw error;
    }
  }
  
  console.log("🎉 All deployment verification tests passed!");
});

Deno.test("Technology stack verification", async () => {
  console.log(`🔧 Verifying technology stack`);
  
  // Check homepage mentions the right tech
  const homeResponse = await fetchWithTimeout(BASE_URL);
  const homeHtml = await homeResponse.text();
  
  assertStringIncludes(homeHtml, "Nitro + Deno", "Should use Nitro + Deno");
  assertStringIncludes(homeHtml, "No Vercel", "Should confirm no Vercel");
  
  // Check API reports correct server
  const apiResponse = await fetchWithTimeout(`${BASE_URL}/api`);
  const apiData = await apiResponse.json();
  
  assertEquals(apiData.server, "Nitro + Deno", "API should report Nitro + Deno");
  assertEquals(apiData.deployment, "Netlify Ready", "Should be Netlify ready");
  
  console.log("✅ Technology stack verified correctly");
});

Deno.test("No legacy framework conflicts", async () => {
  console.log(`🧹 Checking for legacy framework conflicts`);
  
  // Check that responses don't contain Nuxt-specific headers or content
  const response = await fetchWithTimeout(BASE_URL);
  const headers = Object.fromEntries(response.headers.entries());
  
  // Should not have Nuxt-specific headers
  assertEquals(headers["x-nuxt-version"], undefined, "Should not have Nuxt version header");
  assertEquals(headers["x-powered-by"]?.includes("Nuxt"), undefined, "Should not be powered by Nuxt");
  
  const html = await response.text();
  
  // Should not contain Nuxt-specific content
  assertEquals(html.includes("__NUXT__"), false, "Should not contain Nuxt hydration data");
  assertEquals(html.includes("nuxt"), false, "Should not contain nuxt references");
  
  console.log("✅ No legacy framework conflicts detected");
});