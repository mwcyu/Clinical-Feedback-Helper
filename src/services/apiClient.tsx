import { getSessionId } from "../utils/session";
import { Standard } from "../types";

import { supabase } from "../lib/supabase";

export async function sendMessageToAI(
  promptType: "standard1" | "standard2" | "standard3" | "standard4" | "",
  userMessage?: string,
  standardData?: Standard
): Promise<string> {
  const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;
  const sessionId = getSessionId();

  const payload: any = {
    sessionId,
    chatInput: (userMessage ?? "") + promptType,
  };

  // If standard data is provided, include it in the payload
  if (standardData) {
    payload.standard = {
      id: standardData.id,
      title: standardData.title,
      subtitle: standardData.subtitle,
      prompt: standardData.prompt,
    };
  }

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Webhook error: ${res.status} ${text}`);
  }

  // ✅ n8n should return JSON like: { "reply": "Hello!" }
  const data = await res.json().catch(() => ({}));

  console.log("n8n response:", data);



  const reply = data.output ?? "✅ Message sent to n8n workflow!";

  return reply;
}

async function testSupabase() {
  const { data, error } = await supabase
    .from("session_store")
    .select("*")
    .eq("sessionId", "testing31")
    .single();

  if (error) {
    console.error("❌ Supabase error:", error);
  } else {
    console.log("✅ Connected to Supabase! Sample data:", data);
  }
}

testSupabase();
