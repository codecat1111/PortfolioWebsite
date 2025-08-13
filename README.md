# Modern Portfolio & Blog Template

A modern, responsive portfolio website with an integrated blog system, built using vanilla JavaScript and CSS. Features a clean design, dark mode support, and markdown-based blog content management.

## 🚀 Features

### Portfolio

- Responsive design that works on all devices
- Dark/Light mode toggle
- Smooth scrolling navigation
- Dynamic skill bars animation
- Project showcase with filtering
- Contact form integration
- Resume download option
- Social media integration
- Animated hero section with video background

### Blog System

- Markdown support for blog posts
- Code syntax highlighting with Prism.js
- Category and tag filtering
- Reading time estimation
- Copy code functionality
- Table of contents generation
- Social sharing options
- Previous/Next post navigation
- Responsive images
- Search functionality

## 🛠️ Technology Stack

- HTML5
- CSS3 (with CSS Grid and Flexbox)
- Vanilla JavaScript
- JSON for blog content
- Markdown parsing
- Prism.js for code highlighting

## 📁 Project Structure

```
simple-portfolio-template/
├── index.html              # Main portfolio page
├── blog/                   # Blog system
│   ├── blog-post.js       # Blog post rendering logic
│   ├── blog.css           # Blog styling
│   ├── blog.js            # Blog listing functionality
│   ├── index.html         # Blog listing page
│   ├── post.html          # Individual post template
│   └── posts.json         # Blog content database
├── css/
│   ├── main.css           # Main styling
│   ├── media.css          # Responsive design
│   └── reset.css          # CSS reset
├── js/
│   ├── form.js           # Contact form handling
│   ├── main.js           # Main functionality
│   └── skillbar.js       # Skill bars animation
└── resume/               # Resume files
```

## 🚦 Getting Started

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/portfolio-template.git
```

2. **Local Development**

- Open `index.html` in your browser, or
- Use a local server (recommended):

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve
```

3. **Adding Blog Posts**

- Add new entries to `blog/posts.json`
- Follow the Markdown formatting guidelines
- Include necessary metadata (title, date, tags, etc.)

## 📝 Blog Post Format

```json
{
  "id": "post-slug",
  "title": "Post Title",
  "excerpt": "Brief description",
  "content": "Markdown content",
  "category": "Category",
  "tags": ["tag1", "tag2"],
  "date": "YYYY-MM-DD",
  "image": "image-url"
}
```

### Markdown Support

- Headers (h1-h4)
- Lists (ordered and unordered)
- Code blocks with syntax highlighting
- Blockquotes
- Bold and italic text
- Links and images
- Line breaks

## 🎨 Customization

### Colors

Edit `css/main.css` to change the color scheme:

```css
:root {
  --primary-color: #your-color;
  --secondary-color: #your-color;
  /* Add other custom colors */
}
```

### Content

1. Update `index.html` with your information
2. Modify project showcases in the portfolio section
3. Update social media links
4. Add your resume to the resume folder

## 📄 License

This project is licensed under the MIT License

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

---

Made with ❤️ by Justin Wilson
