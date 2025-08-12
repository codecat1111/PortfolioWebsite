"use strict";
import form from "./form.js";
import skillbar from "./skillbar.js";

document.addEventListener("DOMContentLoaded", () => {
  AOS.init({
    once: true,
  });
  form();
  skillbar();

  const nav = document.querySelector("#nav");
  const navBtn = document.querySelector("#nav-btn");
  const navBtnImg = document.querySelector("#nav-btn-img");

  //Hamburger menu
  navBtn.onclick = () => {
    if (nav.classList.toggle("open")) {
      navBtnImg.src = "img/icons/close.svg";
    } else {
      navBtnImg.src = "img/icons/open.svg";
    }
  };

  window.addEventListener("scroll", function () {
    const header = document.querySelector("#header");
    const hero = document.querySelector("#home");
    const goToTop = document.querySelector("#goToTop");

    if (header && hero && goToTop) {
      let triggerHeight = hero.offsetHeight - 170;

      if (window.scrollY > triggerHeight) {
        header.classList.add("header-sticky");
        goToTop.classList.add("reveal");
      } else {
        header.classList.remove("header-sticky");
        goToTop.classList.remove("reveal");
      }
    }
  });

  // Improve section navigation with null checks
  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll("header nav a");

  window.onscroll = () => {
    sections.forEach((sec) => {
      if (!sec) return;

      let top = window.scrollY;
      let offset = sec.offsetTop - 170;
      let height = sec.offsetHeight;
      let id = sec.getAttribute("id");

      if (top >= offset && top < offset + height && id) {
        navLinks.forEach((link) => {
          link.classList.remove("active");
          const targetLink = document.querySelector(`header nav a[href*="${id}"]`);
          if (targetLink) {
            targetLink.classList.add("active");
          }
        });
      }
    });
  };
});

// Function to load latest blog posts
async function loadLatestPosts() {
    try {
        const response = await fetch('blog/posts.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Sort posts by date in descending order (newest first)
        const sortedPosts = data.posts.sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });
        
        // Get only the first 3 posts after sorting
        const latestPosts = sortedPosts.slice(0, 3);
        
        const latestPostsContainer = document.getElementById('latestPosts');
        if (!latestPostsContainer) return;

        latestPostsContainer.innerHTML = ''; // Clear any existing content

        latestPosts.forEach((post, index) => {
            const postCard = createPostCard(post, index);
            latestPostsContainer.appendChild(postCard);
        });

        // Initialize AOS for new elements
        AOS.refresh();

    } catch (error) {
        console.error('Error loading latest posts:', error);
        if (latestPostsContainer) {
            latestPostsContainer.innerHTML = `
                <div class="error-message" style="grid-column: 1 / -1; text-align: center;">
                    <p>Unable to load latest blog posts.</p>
                </div>
            `;
        }
    }
}

// Function to create a post card
function createPostCard(post, index) {
    const card = document.createElement('div');
    card.className = 'project__content';
    card.setAttribute('data-aos', 'fade-up');
    card.setAttribute('data-aos-duration', '1000');
    card.setAttribute('data-aos-delay', (index * 100).toString());
    
    // Format date
    const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Calculate read time
    const wordsPerMinute = 200;
    const wordCount = post.content.split(' ').length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    
    card.innerHTML = `
        ${post.image ? `<img src="${post.image}" alt="${post.title}" class="blog-card-image">` : '<div class="blog-card-image" style="background: linear-gradient(135deg, var(--gray-color-2), var(--gray-color));"></div>'}
        <div class="blog-card-content">
            <div class="blog-card-meta">
                <span class="blog-card-category">${post.category}</span>
                <span class="blog-card-date">${formattedDate}</span>
            </div>
            <h3 class="blog-card-title">${post.title}</h3>
            <p class="blog-card-excerpt">${post.excerpt}</p>
            <div class="blog-card-footer">
                <span class="blog-card-read-time">${readTime} min read</span>
                <a href="blog/post.html?id=${post.id}" class="blog-card-link">
                    Read More <i class="ri-arrow-right-line"></i>
                </a>
            </div>
        </div>
    `;

    // Add click handler to entire card
    card.addEventListener('click', (e) => {
        // Don't navigate if clicking on the direct link
        if (e.target.closest('.project__link')) return;
        window.location.href = `blog/post.html?id=${post.id}`;
    });

    return card;
}

// Call the function when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    loadLatestPosts();
});