import { assertEquals, assertStringIncludes } from "@std/assert";

// Configuration
const BASE_URL = Deno.args.find(arg => arg.startsWith('--base-url='))?.split('=')[1] || 'http://localhost:3000';

// Helper function to fetch with timeout
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

Deno.test("Homepage loads successfully", async () => {
  console.log(`🧪 Testing homepage at: ${BASE_URL}`);
  
  const response = await fetchWithTimeout(BASE_URL);
  assertEquals(response.status, 200, "Homepage should return 200 status");
  
  const html = await response.text();
  assertStringIncludes(html, "Peace 2074", "Page should contain site title");
  assertStringIncludes(html, "Powered by Deno and Nitro", "Page should mention tech stack");
  
  console.log("✅ Homepage test passed");
});

Deno.test("API endpoint responds correctly", async () => {
  console.log(`🧪 Testing API at: ${BASE_URL}/api`);
  
  const response = await fetchWithTimeout(`${BASE_URL}/api`);
  assertEquals(response.status, 200, "API should return 200 status");
  
  const data = await response.json();
  assertEquals(data.message, "Hello from the API!", "API should return correct message");
  
  console.log("✅ API test passed");
});

Deno.test("Health check endpoint works", async () => {
  console.log(`🧪 Testing health check at: ${BASE_URL}/api/health`);
  
  const response = await fetchWithTimeout(`${BASE_URL}/api/health`);
  assertEquals(response.status, 200, "Health endpoint should return 200 status");
  
  const data = await response.json();
  assertEquals(data.status, "ok", "Health check should report healthy");
  assertStringIncludes(data.timestamp, new Date().getFullYear().toString(), "Should have valid timestamp");
  
  console.log("✅ Health check test passed");
});

Deno.test("Content-Type headers are correct", async () => {
  console.log(`🧪 Testing content types`);
  
  // Test homepage HTML
  const htmlResponse = await fetchWithTimeout(BASE_URL);
  await htmlResponse.text(); // Consume body
  assertStringIncludes(
    htmlResponse.headers.get("content-type") || "",
    "text/html",
    "Homepage should return HTML content type"
  );
  
  // Test API JSON
  const apiResponse = await fetchWithTimeout(`${BASE_URL}/api`);
  await apiResponse.json(); // Consume body
  assertStringIncludes(
    apiResponse.headers.get("content-type") || "",
    "application/json",
    "API should return JSON content type"
  );
  
  console.log("✅ Content-Type tests passed");
});

Deno.test("Response times are acceptable", async () => {
  console.log(`🧪 Testing response times`);
  
  // Test homepage response time
  const startHome = Date.now();
  const homeRes = await fetchWithTimeout(BASE_URL);
  await homeRes.text();
  const homeTime = Date.now() - startHome;
  
  // Test API response time
  const startApi = Date.now();
  const apiRes = await fetchWithTimeout(`${BASE_URL}/api`);
  await apiRes.json();
  const apiTime = Date.now() - startApi;
  
  console.log(`📊 Homepage response time: ${homeTime}ms`);
  console.log(`📊 API response time: ${apiTime}ms`);
  
  // Response times should be under 5 seconds (generous for serverless cold starts)
  assertEquals(homeTime < 5000, true, `Homepage response time (${homeTime}ms) should be under 5 seconds`);
  assertEquals(apiTime < 5000, true, `API response time (${apiTime}ms) should be under 5 seconds`);
  
  console.log("✅ Response time tests passed");
});
