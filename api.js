const e1 = "https://script.google.com/macros/s/AKfycbxK_hUuipYJ31kqGq65DFdCF28BcW_nzI9tAni1e9EPLIZM1x_Y2PwAOWaX6ktTczTl/exec";
const e2 = "https://script.google.com/macros/s/AKfycbwbMidl8oVE9gFTiufK-ONdgxQlAV5KVpS8qtI_YTJFzKaZU_urBeWzVAj7vybgeJkm/exec";

export async function sendLeadsRequest(formData){
  const endpoint1 = e1;
  const urlEncodedData = new URLSearchParams(formData).toString();
  try{
    await fetch(endpoint1,{
      method:'POST',
      headers:{ 'Content-Type':'application/x-www-form-urlencoded' },
      body: urlEncodedData
    });
  }catch(err){ console.error("Error sending leads request:", err); }
}

export async function sendNotesRequest(email, note){
  const endpoint2 = e2;
  const urlEncodedData = new URLSearchParams({ email, note }).toString();
  try{
    await fetch(endpoint2,{
      method:'POST',
      headers:{ 'Content-Type':'application/x-www-form-urlencoded' },
      body: urlEncodedData
    });
  }catch(err){ console.error("Error sending notes request:", err); }
}
