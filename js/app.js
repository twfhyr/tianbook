function renderPostCard(post) {
  const tags = post.tags.map(t => `<span class="post-tag">${t}</span>`).join("");
  return `
    <div class="post-card">
      <h3><a href="post.html?id=${post.id}">${post.title}</a></h3>
      <div class="post-meta">${post.date} ${tags}</div>
      <p class="post-excerpt">${post.excerpt}</p>
    </div>
  `;
}

function getPostIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function renderBody(body) {
  // If body starts with an HTML tag, treat as HTML; otherwise render as Markdown
  if (/^\s*<[a-z]/.test(body)) return body;
  return typeof marked !== "undefined" ? marked.parse(body) : body;
}

function loadPosts() {
  const raw = `https://raw.githubusercontent.com/twfhyr/tianbook/main/data/posts.json?v=${Date.now()}`;
  return fetch(raw)
    .then(res => res.json())
    .catch(() => fetch("data/posts.json").then(res => res.json()))
    .catch(() => []);
}

loadPosts().then(posts => {
  // Home page — recent posts
  const recentContainer = document.getElementById("recent-posts");
  if (recentContainer) {
    const recent = posts.slice(0, 5);
    recentContainer.innerHTML = recent.map(renderPostCard).join("");
  }

  // Blog page — all posts
  const allContainer = document.getElementById("all-posts");
  if (allContainer) {
    allContainer.innerHTML = posts.map(renderPostCard).join("");
  }

  // Post detail page
  const postContent = document.getElementById("post-content");
  if (postContent) {
    const id = getPostIdFromURL();
    const post = posts.find(p => p.id === id);
    if (post) {
      const tags = post.tags.map(t => `<span class="post-tag">${t}</span>`).join("");
      document.title = `${post.title} - Tianbook`;
      postContent.innerHTML = `
        <h1>${post.title}</h1>
        <div class="post-meta">${post.date} ${tags}</div>
        <div class="post-body">${renderBody(post.body)}</div>
      `;
    } else {
      postContent.innerHTML = "<h1>Post not found</h1><p>Sorry, that post doesn't exist.</p>";
    }
  }
});
