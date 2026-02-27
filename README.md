# Tianbook

A minimal personal blog built with vanilla HTML, CSS, and JavaScript.

## Features

- Clean, responsive design
- No frameworks or build tools required
- Blog posts with tags and detail pages
- Mobile-friendly layout

## Structure

```
tianbook/
├── index.html      # Home page
├── blog.html       # All posts
├── about.html      # About page
├── post.html       # Individual post view
├── css/
│   └── style.css   # Styles
└── js/
    ├── posts.js    # Blog post data
    └── app.js      # Rendering logic
```

## Adding a New Post

Edit `js/posts.js` and add a new object to the `posts` array:

```js
{
  id: "my-new-post",
  title: "My New Post",
  date: "2026-03-01",
  tags: ["tag1", "tag2"],
  excerpt: "A short summary of the post.",
  body: `<p>Full HTML content of the post.</p>`
}
```

## Running Locally

Open `index.html` in your browser, or use any static file server:

```bash
npx serve .
```

## License

MIT
