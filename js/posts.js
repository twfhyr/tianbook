const posts = [
  {
    id: "hello-world",
    title: "Hello World — My First Post",
    date: "2026-02-27",
    tags: ["personal"],
    excerpt: "Welcome to Tianbook! This is my very first blog post where I introduce myself and share what this blog will be about.",
    body: `
      <p>Welcome to <strong>Tianbook</strong>! I'm excited to finally launch my personal blog.</p>
      <p>This space will be my digital notebook — a place to write about technology, share things I've learned, and document projects I'm working on.</p>
      <h2>Why start a blog?</h2>
      <p>Writing helps me think more clearly. By putting my thoughts into words, I can organize ideas, reflect on what I've learned, and hopefully help others along the way.</p>
      <h2>What to expect</h2>
      <ul>
        <li>Tech tutorials and guides</li>
        <li>Project write-ups</li>
        <li>Thoughts on software development</li>
        <li>Occasional personal reflections</li>
      </ul>
      <p>Thanks for stopping by. Stay tuned for more posts!</p>
    `
  },
  {
    id: "building-tianbook",
    title: "How I Built This Blog",
    date: "2026-02-27",
    tags: ["tech", "web"],
    excerpt: "A look at the tech choices and design decisions behind Tianbook — a lightweight, no-framework personal blog.",
    body: `
      <p>I wanted my blog to be fast, simple, and easy to maintain. No heavy frameworks, no build steps — just clean HTML, CSS, and JavaScript.</p>
      <h2>Design Principles</h2>
      <ul>
        <li><strong>Minimalism</strong> — Content comes first. No clutter.</li>
        <li><strong>Performance</strong> — Zero dependencies means instant loads.</li>
        <li><strong>Simplicity</strong> — Easy to understand, easy to modify.</li>
      </ul>
      <h2>The Stack</h2>
      <p>The entire site is built with vanilla HTML, CSS, and JS. Blog posts are stored as JavaScript objects, which keeps things straightforward while still allowing dynamic rendering.</p>
      <blockquote>The best tool is the simplest one that gets the job done.</blockquote>
      <h2>What's Next</h2>
      <p>I plan to add more posts regularly and possibly introduce features like dark mode and a search function in the future. For now, I'm happy with this clean foundation.</p>
    `
  }
];
