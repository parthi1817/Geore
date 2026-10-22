const API_BASE = "http://localhost:8000";

/**
 * Send images + query to the GEORE backend for analysis.
 *
 * @param {FormData} formData  — must contain: image1, query; optionally image2, has_sar
 * @returns {Promise<object>}  — the JSON response from POST /analyze
 */
export async function analyzeImages(formData) {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    body: formData,
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok || (data && data.error)) {
    const errorMsg = data?.error || (data?.detail) || `Analysis failed (${res.status})`;
    throw new Error(errorMsg);
  }

  return data;
}
