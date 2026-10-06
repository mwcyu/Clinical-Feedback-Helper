
// Run with: node --env-file=.env test-webhook.js
const url = process.env.VITE_N8N_WEBHOOK_URL;
if (!url) {
  console.error("VITE_N8N_WEBHOOK_URL is not set (run with --env-file=.env)");
  process.exit(1);
}

async function test() {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ test: true })
    });
    console.log("Status:", res.status);
    console.log("Text:", await res.text());
  } catch (e) {
    console.error("Error:", e.message);
  }
}

test();
