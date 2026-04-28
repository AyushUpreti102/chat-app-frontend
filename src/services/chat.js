import axios from "../api";

/* ================= MESSAGES ================= */

// Get messages by conversationId
export async function getMessages(conversationId) {
  const res = await axios.get(`/chat/messages/${conversationId}`);
  return res.data;
}

/* ================= READ ================= */

// Mark messages as read
export async function markAsRead(conversationId) {
  const res = await axios.post("/chat/read", {
    conversationId,
  });
  return res.data;
}

/* ================= FILE UPLOAD ================= */

// Upload single file
export async function uploadFile(file, onProgress) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await axios.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total,
        );
        onProgress(percent);
      }
    },
  });

  return res.data; // { url }
}

// Upload multiple files (parallel)
export async function uploadMultipleFiles(files, onProgress) {
  const uploadPromises = files.map((file, index) => {
    const formData = new FormData();

    // ✅ FIXED
    formData.append("file", file.raw);

    return axios.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );

          onProgress(index, percent);
        }
      },
    });
  });

  const results = await Promise.all(uploadPromises);

  return results.map((res) => res.data);
}
