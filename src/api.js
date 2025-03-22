// api.js
const API_URL = "http://localhost:8000"; // Adjust if your backend runs on a different port

export const generateScript = async (data) => {
  const response = await fetch(`${API_URL}/generate-script`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to generate script");
  }

  return response.json();
};

export const getJobStatus = async (jobId) => {
  const response = await fetch(`${API_URL}/job/${jobId}`);
  
  if (!response.ok) {
    throw new Error("Failed to get job status");
  }
  
  return response.json();
};