const chatContainer = document.getElementById("chat-container");
const viewerSelect = document.getElementById("viewer");

// safety check
if (!chatContainer || !viewerSelect) {
  console.error("Missing HTML elements");
}

// viewer
let VIEWER = viewerSelect ? viewerSelect.value : "Mehul";

let allMessages = [];
let currentIndex = 0;
const CHUNK_SIZE = 200;

// file types
const imageExt = [".jpg", ".jpeg", ".png", ".webp"];
const videoExt = [".mp4", ".webm", ".ogg"];
const docExt = [".pdf", ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx", ".zip"];

// viewer change
if (viewerSelect) {
  viewerSelect.addEventListener("change", () => {
    VIEWER = viewerSelect.value;
    resetChat();
  });
}

// detect file type
function getFileType(message) {
  const lower = message.toLowerCase();

  if (imageExt.some(ext => lower.endsWith(ext))) return "image";
  if (videoExt.some(ext => lower.endsWith(ext))) return "video";
  if (docExt.some(ext => lower.endsWith(ext))) return "doc";

  return "text";
}

// 🔥 LOAD CHAT (SINGLE FILE ONLY)
fetch("chats/chat.txt")
  .then(res => {
    console.log("Fetch status:", res.status);
    return res.text();
  })
  .then(data => {

    if (!data) {
      console.error("Empty chat file");
      return;
    }

    // 🔥 FIX MERGED MESSAGES
    data = data.replace(
      /(\d{2}\/\d{2}\/\d{4}, \d{1,2}:\d{2} - )/g,
      "\n$1"
    );

    allMessages = parseChat(data);

    console.log("TOTAL MESSAGES:", allMessages.length);

    if (allMessages.length === 0) {
      console.error("Parsing failed");
      return;
    }

    resetChat();
  })
  .catch(err => {
    console.error("Fetch error:", err);
  });

// 🔥 FLEXIBLE PARSER
function parseChat(data) {
  const lines = data.split("\n");

  const regex = /^(.+?), (.+?) - (.*?): (.*)$/;

  return lines
    .map(line => {
      const match = line.match(regex);
      if (!match) return null;

      return {
        time: match[2],
        sender: match[3],
        message: match[4].trim()
      };
    })
    .filter(Boolean);
}

// reset
function resetChat() {
  chatContainer.innerHTML = "";
  currentIndex = allMessages.length;
  loadInitialMessages();
}

// load latest
function loadInitialMessages() {
  const start = Math.max(0, currentIndex - CHUNK_SIZE);
  const slice = allMessages.slice(start, currentIndex);

  slice.forEach(msg => {
    createMessage(msg.sender, msg.message, msg.time, false);
  });

  currentIndex = start;

  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// scroll up load
chatContainer.addEventListener("scroll", () => {
  if (chatContainer.scrollTop <= 10) { // FIXED
    loadOlderMessages();
  }
});

function loadOlderMessages() {
  if (currentIndex <= 0) return;

  const prevHeight = chatContainer.scrollHeight;

  const start = Math.max(0, currentIndex - CHUNK_SIZE);
  const slice = allMessages.slice(start, currentIndex);

  slice.reverse().forEach(msg => {
    createMessage(msg.sender, msg.message, msg.time, true);
  });

  currentIndex = start;

  chatContainer.scrollTop = chatContainer.scrollHeight - prevHeight;
}

// create message
function createMessage(sender, message, time, prepend) {
  const msgDiv = document.createElement("div");

  const isViewer = sender === VIEWER;

  msgDiv.className = "message " + (isViewer ? "me" : "other");

  const fileType = getFileType(message);
  const filePath = "media/" + message;

  if (fileType === "image") {
    const img = document.createElement("img");
    img.src = filePath;
    msgDiv.appendChild(img);
  }

  else if (fileType === "video") {
    const video = document.createElement("video");
    video.src = filePath;
    video.controls = true;
    video.style.maxWidth = "100%";
    msgDiv.appendChild(video);
  }

  else if (fileType === "doc") {
    const link = document.createElement("a");
    link.href = filePath;
    link.innerText = "📄 " + message;
    link.target = "_blank";
    msgDiv.appendChild(link);
  }

  else {
    msgDiv.textContent = message; // safer than innerHTML
  }

  const timeDiv = document.createElement("div");
  timeDiv.className = "time";
  timeDiv.innerText = time;

  msgDiv.appendChild(timeDiv);

  if (prepend) {
    chatContainer.prepend(msgDiv);
  } else {
    chatContainer.appendChild(msgDiv);
  }
}
