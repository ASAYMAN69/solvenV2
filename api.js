const e1 = "https://script.google.com/macros/s/AKfycbxKJgXxYSKo0WHRRenBKNBe73TFD3lUPUw3jvnwUuvS9NuUK2bsB5jzwngLU36EfoLQ/exec";
const e2 = "https://script.google.com/macros/s/AKfycbyd4u4KpnGY58A4qIsLvZFnpATVziHqHyM9wIapyKcVhi9uNMxOAAam4MuM8_wdU16-/exec";

// 🔧 Map of characters → placeholders
const charToPlaceholderMap = {
  " ": "{-SPACE-}",
  "\u00A0": "{-NBSP-}",
  "\n": "{-NL-}",
  "\r": "{-CR-}",
  "\t": "{-TAB-}",
  ",": "{-COMMA-}",
  ".": "{-DOT-}",
  "/": "{-SLASH-}",
  "\\": "{-BACKSLASH-}",
  ":": "{-COLON-}",
  ";": "{-SEMI-}",
  "|": "{-PIPE-}",
  "*": "{-STAR-}",
  "+": "{-PLUS-}",
  "-": "{-MINUS-}",
  "_": "{-UNDERSCORE-}",
  "=": "{-EQUAL-}",
  "?": "{-QUESTION-}",
  "#": "{-HASH-}",
  "&": "{-AMP-}",
  "%": "{-PERCENT-}",
  "$": "{-DOLLAR-}",
  "@": "{-AT-}",
  "^": "{-CARET-}",
  "~": "{-TILDE-}",
  "`": "{-BACKTICK-}",
  "(": "{-LPAREN-}",
  ")": "{-RPAREN-}",
  "[": "{-LBRACKET-}",
  "]": "{-RBRACKET-}",
  "{": "{-LBRACE-}",
  "}": "{-RBRACE-}",
  "\"": "{-QUOTE-}",
  "'": "{-APOST-}",
  "…": "{-ELLIPSIS-}",
  "–": "{-EN_DASH-}",
  "—": "{-EM_DASH-}"
};

// 🔧 Encode a string: replace all special characters with placeholders
function encodePlaceholders(str) {
  if (typeof str !== 'string') return str;
  const regex = new RegExp(Object.keys(charToPlaceholderMap).map(c => c.replace(/[-\/\\^$*+?.()|[\\\]{}]/g, '\\$&')).join('|'), 'g');
  return str.replace(regex, (match) => charToPlaceholderMap[match]);
}

// 🔧 Encode all values in an object
function encodeFormData(formData) {
  const encoded = {};
  for (const key in formData) {
    if (formData.hasOwnProperty(key)) {
      encoded[key] = encodePlaceholders(formData[key]);
    }
  }
  return encoded;
}

export async function sendLeadsRequest(formData) {
  const endpoint1 = e1;
  const encodedData = encodeFormData(formData);

  console.log("Sending leads request with encoded data:", encodedData);

  try {
    const response = await fetch(endpoint1, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams(encodedData).toString()
    });
    
    const result = await response.json();
    console.log("Leads request response:", result);
    return result;
  } catch (err) {
    console.error("Error sending leads request:", err);
    return null;
  }
}

export async function sendNotesRequest(email, note) {
  const endpoint2 = e2;

  const encodedEmail = encodePlaceholders(email);
  const encodedNote = encodePlaceholders(note);

  console.log("Sending notes request with encoded email:", encodedEmail, "encoded note:", encodedNote);

  try {
    const response = await fetch(endpoint2, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({ name: encodedEmail, note: encodedNote }).toString()
    });
    
    const result = await response.json();
    console.log("Notes request response:", result);
    return result;
  } catch (err) {
    console.error("Error sending notes request:", err);
    return null;
  }
}