export async function sendInterviewMessage(message: string, sessionId: string, role?: string) {
  const res = await fetch("/api/interview/message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, sessionId, role })
  });

  if (!res.ok) throw new Error("API error");

  return res.json();
}

export async function fetchPreviousChat(sessionId: string, role?: string) {
  const res = await fetch("/api/interview/message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "", sessionId, role })
  });

  if (!res.ok) throw new Error("Failed to fetch previous chat");

  return res.json();
}
