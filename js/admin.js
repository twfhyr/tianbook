// Admin Panel — GitHub-powered blog publishing
const REPO_OWNER = "twfhyr";
const REPO_NAME = "tianbook";
const FILE_PATH = "data/posts.json";

// DOM elements
const loginSection = document.getElementById("login-section");
const editorSection = document.getElementById("editor-section");
const tokenInput = document.getElementById("gh-token");
const loginBtn = document.getElementById("login-btn");
const loginError = document.getElementById("login-error");
const logoutBtn = document.getElementById("logout-btn");
const userAvatar = document.getElementById("user-avatar");
const userName = document.getElementById("user-name");
const postTitle = document.getElementById("post-title");
const postTags = document.getElementById("post-tags");
const postDate = document.getElementById("post-date");
const postExcerpt = document.getElementById("post-excerpt");
const postBody = document.getElementById("post-body");
const previewBtn = document.getElementById("preview-btn");
const publishBtn = document.getElementById("publish-btn");
const publishStatus = document.getElementById("publish-status");
const previewCard = document.getElementById("preview-card");
const previewContent = document.getElementById("preview-content");

let ghToken = "";

// Set default date to today
postDate.value = new Date().toISOString().split("T")[0];

// --- Auth ---

async function ghFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `token ${ghToken}`,
      Accept: "application/vnd.github.v3+json",
      ...options.headers,
    },
  });
  return res;
}

loginBtn.addEventListener("click", async () => {
  const token = tokenInput.value.trim();
  if (!token) {
    loginError.textContent = "Please enter a token.";
    return;
  }

  loginBtn.disabled = true;
  loginBtn.textContent = "Connecting...";
  loginError.textContent = "";

  try {
    ghToken = token;
    const res = await ghFetch("https://api.github.com/user");
    if (!res.ok) throw new Error("Invalid token");

    const user = await res.json();
    if (user.login.toLowerCase() !== REPO_OWNER.toLowerCase()) {
      throw new Error(`Access denied. Only ${REPO_OWNER} can publish.`);
    }

    userAvatar.src = user.avatar_url;
    userName.textContent = user.login;
    loginSection.style.display = "none";
    editorSection.style.display = "block";
  } catch (err) {
    ghToken = "";
    loginError.textContent = err.message;
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = "Connect to GitHub";
  }
});

logoutBtn.addEventListener("click", () => {
  ghToken = "";
  tokenInput.value = "";
  editorSection.style.display = "none";
  loginSection.style.display = "block";
});

// --- Toolbar ---

document.querySelectorAll(".toolbar button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const wrap = btn.getAttribute("data-wrap");
    const wrapEnd = btn.getAttribute("data-wrap-end");
    const insert = btn.getAttribute("data-insert");

    const start = postBody.selectionStart;
    const end = postBody.selectionEnd;
    const text = postBody.value;

    if (wrap && wrapEnd) {
      const selected = text.substring(start, end);
      postBody.value = text.substring(0, start) + wrap + selected + wrapEnd + text.substring(end);
      postBody.selectionStart = start + wrap.length;
      postBody.selectionEnd = start + wrap.length + selected.length;
    } else if (insert) {
      postBody.value = text.substring(0, start) + insert + text.substring(end);
      postBody.selectionStart = postBody.selectionEnd = start + insert.length;
    }

    postBody.focus();
  });
});

// --- Preview ---

previewBtn.addEventListener("click", () => {
  if (previewCard.style.display === "none") {
    previewContent.innerHTML = postBody.value || "<p><em>Nothing to preview.</em></p>";
    previewCard.style.display = "block";
    previewBtn.textContent = "Hide Preview";
  } else {
    previewCard.style.display = "none";
    previewBtn.textContent = "Preview";
  }
});

// --- Publish ---

function generateId(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

publishBtn.addEventListener("click", async () => {
  // Validate
  const title = postTitle.value.trim();
  const body = postBody.value.trim();
  if (!title || !body) {
    setStatus("Title and body are required.", "error");
    return;
  }

  publishBtn.disabled = true;
  publishBtn.textContent = "Publishing...";
  setStatus("Fetching current posts...", "");

  try {
    // 1. Get current posts.json from the repo
    const fileRes = await ghFetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`
    );

    let posts = [];
    let sha = null;

    if (fileRes.ok) {
      const fileData = await fileRes.json();
      sha = fileData.sha;
      const decoded = atob(fileData.content);
      posts = JSON.parse(decoded);
    }

    // 2. Build new post
    const newPost = {
      id: generateId(title),
      title: title,
      date: postDate.value,
      tags: postTags.value
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      excerpt: postExcerpt.value.trim() || title,
      body: body,
    };

    // Add to beginning
    posts.unshift(newPost);

    // 3. Push updated file to GitHub
    setStatus("Publishing to GitHub...", "");

    const content = btoa(unescape(encodeURIComponent(JSON.stringify(posts, null, 2))));

    const putBody = {
      message: `Add post: ${title}`,
      content: content,
    };
    if (sha) putBody.sha = sha;

    const putRes = await ghFetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`,
      {
        method: "PUT",
        body: JSON.stringify(putBody),
      }
    );

    if (!putRes.ok) {
      const err = await putRes.json();
      throw new Error(err.message || "Failed to publish");
    }

    setStatus("Published successfully! Your post is now live.", "success");

    // Reset form
    postTitle.value = "";
    postTags.value = "";
    postExcerpt.value = "";
    postBody.value = "";
    postDate.value = new Date().toISOString().split("T")[0];
    previewCard.style.display = "none";
    previewBtn.textContent = "Preview";
  } catch (err) {
    setStatus("Error: " + err.message, "error");
  } finally {
    publishBtn.disabled = false;
    publishBtn.textContent = "Publish";
  }
});

function setStatus(msg, type) {
  publishStatus.textContent = msg;
  publishStatus.className = "status-msg" + (type ? " " + type : "");
}
