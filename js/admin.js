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
const editorTitle = document.getElementById("editor-title");
const postTitle = document.getElementById("post-title");
const postTags = document.getElementById("post-tags");
const postDate = document.getElementById("post-date");
const postExcerpt = document.getElementById("post-excerpt");
const postBody = document.getElementById("post-body");
const previewBtn = document.getElementById("preview-btn");
const publishBtn = document.getElementById("publish-btn");
const deleteBtn = document.getElementById("delete-btn");
const cancelEditBtn = document.getElementById("cancel-edit-btn");
const newPostBtn = document.getElementById("new-post-btn");
const publishStatus = document.getElementById("publish-status");
const previewCard = document.getElementById("preview-card");
const previewContent = document.getElementById("preview-content");
const postsList = document.getElementById("posts-list");

let ghToken = "";
let editingPostId = null; // null = new post, string = editing existing

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

    loadPostsList();
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
  resetEditor();
});

// --- Posts List ---

async function loadPostsList() {
  postsList.innerHTML = '<p class="text-muted">Loading posts...</p>';

  try {
    const fileRes = await ghFetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`
    );

    if (!fileRes.ok) {
      postsList.innerHTML = '<p class="text-muted">No posts yet.</p>';
      return;
    }

    const fileData = await fileRes.json();
    const decoded = decodeURIComponent(escape(atob(fileData.content)));
    const posts = JSON.parse(decoded);

    if (posts.length === 0) {
      postsList.innerHTML = '<p class="text-muted">No posts yet.</p>';
      return;
    }

    postsList.innerHTML = posts
      .map(
        (post) => `
        <div class="post-item" data-id="${post.id}">
          <div class="post-item-info">
            <div class="post-item-title">${post.title}</div>
            <div class="post-item-meta">${post.date} · ${post.tags.join(", ")}</div>
          </div>
          <span class="post-item-edit">Edit</span>
        </div>
      `
      )
      .join("");

    // Attach click handlers
    postsList.querySelectorAll(".post-item").forEach((item) => {
      item.addEventListener("click", () => {
        const id = item.getAttribute("data-id");
        const post = posts.find((p) => p.id === id);
        if (post) startEditing(post);
      });
    });
  } catch (err) {
    postsList.innerHTML = '<p class="text-muted">Failed to load posts.</p>';
  }
}

function startEditing(post) {
  editingPostId = post.id;
  editorTitle.textContent = "Edit Post";
  postTitle.value = post.title;
  postTags.value = post.tags.join(", ");
  postDate.value = post.date;
  postExcerpt.value = post.excerpt;
  postBody.value = post.body;
  publishBtn.textContent = "Update";
  deleteBtn.style.display = "inline-block";
  cancelEditBtn.style.display = "inline-block";
  previewCard.style.display = "none";
  previewBtn.textContent = "Preview";
  setStatus("", "");
}

function resetEditor() {
  editingPostId = null;
  editorTitle.textContent = "New Post";
  postTitle.value = "";
  postTags.value = "";
  postDate.value = new Date().toISOString().split("T")[0];
  postExcerpt.value = "";
  postBody.value = "";
  publishBtn.textContent = "Publish";
  deleteBtn.style.display = "none";
  cancelEditBtn.style.display = "none";
  previewCard.style.display = "none";
  previewBtn.textContent = "Preview";
  setStatus("", "");
}

newPostBtn.addEventListener("click", () => {
  resetEditor();
});

cancelEditBtn.addEventListener("click", () => {
  resetEditor();
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
    const raw = postBody.value || "*Nothing to preview.*";
    previewContent.innerHTML = typeof marked !== "undefined" ? marked.parse(raw) : raw;
    previewCard.style.display = "block";
    previewBtn.textContent = "Hide Preview";
  } else {
    previewCard.style.display = "none";
    previewBtn.textContent = "Preview";
  }
});

// --- Publish / Update ---

function generateId(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

publishBtn.addEventListener("click", async () => {
  const title = postTitle.value.trim();
  const body = postBody.value.trim();
  if (!title || !body) {
    setStatus("Title and body are required.", "error");
    return;
  }

  const isEditing = editingPostId !== null;
  publishBtn.disabled = true;
  publishBtn.textContent = isEditing ? "Updating..." : "Publishing...";
  setStatus("Fetching current posts...", "");

  try {
    const fileRes = await ghFetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`
    );

    let posts = [];
    let sha = null;

    if (fileRes.ok) {
      const fileData = await fileRes.json();
      sha = fileData.sha;
      const decoded = decodeURIComponent(escape(atob(fileData.content)));
      posts = JSON.parse(decoded);
    }

    const postData = {
      id: isEditing ? editingPostId : generateId(title),
      title: title,
      date: postDate.value,
      tags: postTags.value
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      excerpt: postExcerpt.value.trim() || title,
      body: body,
    };

    if (isEditing) {
      const idx = posts.findIndex((p) => p.id === editingPostId);
      if (idx !== -1) {
        posts[idx] = postData;
      } else {
        posts.unshift(postData);
      }
    } else {
      posts.unshift(postData);
    }

    setStatus(isEditing ? "Updating on GitHub..." : "Publishing to GitHub...", "");

    const content = btoa(unescape(encodeURIComponent(JSON.stringify(posts, null, 2))));
    const commitMsg = isEditing ? `Update post: ${title}` : `Add post: ${title}`;

    const putBody = {
      message: commitMsg,
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

    setStatus(
      isEditing
        ? "Updated successfully!"
        : "Published successfully! Your post is now live.",
      "success"
    );

    resetEditor();
    loadPostsList();
  } catch (err) {
    setStatus("Error: " + err.message, "error");
  } finally {
    publishBtn.disabled = false;
    publishBtn.textContent = editingPostId !== null ? "Update" : "Publish";
  }
});

// --- Delete ---

deleteBtn.addEventListener("click", async () => {
  if (!editingPostId) return;
  if (!confirm("Are you sure you want to delete this post?")) return;

  deleteBtn.disabled = true;
  deleteBtn.textContent = "Deleting...";
  setStatus("Deleting post...", "");

  try {
    const fileRes = await ghFetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`
    );

    if (!fileRes.ok) throw new Error("Failed to fetch posts");

    const fileData = await fileRes.json();
    const sha = fileData.sha;
    const decoded = decodeURIComponent(escape(atob(fileData.content)));
    let posts = JSON.parse(decoded);

    const title = posts.find((p) => p.id === editingPostId)?.title || editingPostId;
    posts = posts.filter((p) => p.id !== editingPostId);

    const content = btoa(unescape(encodeURIComponent(JSON.stringify(posts, null, 2))));

    const putRes = await ghFetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`,
      {
        method: "PUT",
        body: JSON.stringify({
          message: `Delete post: ${title}`,
          content: content,
          sha: sha,
        }),
      }
    );

    if (!putRes.ok) {
      const err = await putRes.json();
      throw new Error(err.message || "Failed to delete");
    }

    setStatus("Post deleted.", "success");
    resetEditor();
    loadPostsList();
  } catch (err) {
    setStatus("Error: " + err.message, "error");
  } finally {
    deleteBtn.disabled = false;
    deleteBtn.textContent = "Delete";
  }
});

function setStatus(msg, type) {
  publishStatus.textContent = msg;
  publishStatus.className = "status-msg" + (type ? " " + type : "");
}
