const e1 = "https://script.google.com/macros/s/AKfycby5KP-5FjBVHF_NES_VERVvhlvqBeKE8r52sASi3Rpg9ZSEQNJ4OGTIZE-10QHxzuse/exec";
const e2 = "https://script.google.com/macros/s/AKfycbxmtq2y_FErE2igE9i-_4QzYzKpAlGexccN3uy19EGpskUsqgg6aM3J2HT0-FSUGRv2/exec";

// 🔧 Send all values as JSON in text/plain
export function sendLeadsRequest(formData) {
  const endpoint1 = e1;

  console.log("Sending leads request with data:", formData);

  try {
    const blob = new Blob([JSON.stringify(formData)], { type: 'text/plain' });
    navigator.sendBeacon(endpoint1, blob);
    console.log("Leads request sent.");
  } catch (err) {
    console.error("Error sending leads request:", err);
  }
}

export function sendNotesRequest(email, note) {
  const endpoint2 = e2;

  const payload = { email, note };

  console.log("Sending notes request with data:", payload);

  try {
    const blob = new Blob([JSON.stringify(payload)], { type: 'text/plain' });
    navigator.sendBeacon(endpoint2, blob);
    console.log("Notes request sent.");
  } catch (err) {
    console.error("Error sending notes request:", err);
  }
}
