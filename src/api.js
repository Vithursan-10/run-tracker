const API_BASE = "http://localhost:8080/api/runs";

export async function saveRun(runData) {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(runData),
  });
  if (!res.ok) throw new Error("Failed to save run");
  return await res.json();
}

export async function getRuns() {
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error("Failed to fetch runs");
  return await res.json();
}