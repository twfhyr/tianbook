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
      <div class="post-body">${post.body}</div>
    `;
  } else {
    postContent.innerHTML = "<h1>Post not found</h1><p>Sorry, that post doesn't exist.</p>";
  }
}
