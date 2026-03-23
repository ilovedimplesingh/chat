const chatContainer = document.getElementById("chat-container");

// CHANGE YOUR NAME HERE
const MY_NAME = "Mehul";

fetch("chats/chat.txt")
  .then(res => res.text())
  .then(data => {
    const lines = data.split("\n");

    const regex = /^(\d{2}\/\d{2}\/\d{4}), (\d{1,2}:\d{2}) - (.*?): (.*)$/;

    lines.forEach(line => {
      const match = line.match(regex);

      if (match) {
        const date = match[1];
        const time = match[2];
        const sender = match[3];
        let message = match[4];

        createMessage(sender, message, time);
      }
    });
  });

function createMessage(sender, message, time) {
  const msgDiv = document.createElement("div");

  msgDiv.classList.add("message");
  msgDiv.classList.add(sender === MY_NAME ? "me" : "other");

  // 📸 Detect image
  if (message.includes(".jpg") || message.includes(".png")) {
    const img = document.createElement("img");
    img.src = "media/" + message.trim();
    msgDiv.appendChild(img);
  } else {
    msgDiv.innerHTML = message;
  }

  const timeDiv = document.createElement("div");
  timeDiv.className = "time";
  timeDiv.innerText = time;

  msgDiv.appendChild(timeDiv);

  chatContainer.appendChild(msgDiv);
}
