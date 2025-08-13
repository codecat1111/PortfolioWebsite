/**
 * Blog Post JavaScript
 * Handles individual blog post loading and functionality
 * Author: Justin Wilson John
 */

"use strict";

// Global variables
let currentPost = null;
let allPosts = [];

// DOM Elements
const loadingState = document.getElementById('loadingState');
const postNotFound = document.getElementById('postNotFound');
const blogPost = document.getElementById('blogPost');
const copyNotification = document.getElementById('copyNotification');

/**
 * Initialize the blog post page when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize AOS (Animate On Scroll)
    AOS.init({
        once: true,
        duration: 1000,
        offset: 100
    });

    // Initialize navigation
    initializeNavigation();

    // Get post ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (!postId) {
        showPostNotFound();
        return;
    }

    // Load and display the post
    await loadPost(postId);
});

/**
 * Initialize navigation functionality
 */
function initializeNavigation() {
    const nav = document.querySelector("#nav");
    const navBtn = document.querySelector("#nav-btn");
    const navBtnImg = document.querySelector("#nav-btn-img");

    if (navBtn && nav && navBtnImg) {
        // Hamburger menu functionality
        navBtn.onclick = () => {
            if (nav.classList.toggle("open")) {
                navBtnImg.src = "../img/icons/close.svg";
            } else {
                navBtnImg.src = "../img/icons/open.svg";
            }
        };
    }

    // Header scroll effect
    window.addEventListener("scroll", function () {
        const header = document.querySelector("#header");
        const goToTop = document.querySelector("#goToTop");
        
        if (header && goToTop) {
            if (window.scrollY > 100) {
                header.classList.add("header-sticky");
                goToTop.classList.add("reveal");
            } else {
                header.classList.remove("header-sticky");
                goToTop.classList.remove("reveal");
            }
        }
    });
}

/**
 * Load a specific blog post
 */
async function loadPost(postId) {
    try {
        showLoading(true);
        
        // Fetch posts from JSON file
        const response = await fetch('posts.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        allPosts = data.posts || [];
        
        // Find the specific post
        currentPost = allPosts.find(post => post.id === postId);
        
        if (!currentPost) {
            showPostNotFound();
            return;
        }
        
        // Display the post
        displayPost();
        
    } catch (error) {
        console.error('Error loading blog post:', error);
        showPostNotFound();
    } finally {
        showLoading(false);
    }
}

/**
 * Display the loaded post
 */
function displayPost() {
    if (!currentPost || !blogPost) return;

    // Update page title
    document.title = `${currentPost.title} - Justin Wilson John`;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        metaDescription.setAttribute('content', currentPost.excerpt);
    }

    // Populate post data
    populatePostData();
    
    // Setup post functionality
    setupPostFunctionality();
    
    // Show the post
    blogPost.style.display = 'block';
    
    // Reinitialize AOS
    AOS.refresh();
}

/**
 * Populate post data in the DOM
 */
function populatePostData() {
    // Post category
    const postCategory = document.getElementById('postCategory');
    if (postCategory) {
        postCategory.textContent = currentPost.category;
    }

    // Post date
    const postDate = document.getElementById('postDate');
    if (postDate) {
        postDate.textContent = formatDate(currentPost.date);
    }

    // Post read time
    const postReadTime = document.getElementById('postReadTime');
    if (postReadTime) {
        const readTime = calculateReadTime(currentPost.content);
        postReadTime.textContent = `${readTime} min read`;
    }

    // Post title
    const postTitleMain = document.getElementById('postTitleMain');
    if (postTitleMain) {
        postTitleMain.textContent = currentPost.title;
    }

    // Post excerpt
    const postExcerpt = document.getElementById('postExcerpt');
    if (postExcerpt) {
        postExcerpt.textContent = currentPost.excerpt;
    }

    // Post image
    if (currentPost.image) {
        const postImageContainer = document.getElementById('postImageContainer');
        const postImage = document.getElementById('postImage');
        if (postImageContainer && postImage) {
            postImage.src = currentPost.image;
            postImage.alt = currentPost.title;
            postImageContainer.style.display = 'block';
        }
    }

    // Post content
    const postContent = document.getElementById('postContent');
    if (postContent) {
        // Convert markdown-like content to HTML
        postContent.innerHTML = parseContent(currentPost.content);
    }

    // Post tags
    populateTags();
    
    // Post navigation
    populateNavigation();
}

/**
 * Parse content and convert basic markdown to HTML
 */
function parseContent(content) {
    let html = content;

    // Store code blocks temporarily
    const codeBlocks = [];
    html = html.replace(/```([\w-]*)\n([\s\S]*?)\n```/g, (match, language, code) => {
        const placeholder = `___CODE_BLOCK_${codeBlocks.length}___`;
        codeBlocks.push({
            language: language || 'plaintext',
            code: code.replace(/[<>]/g, c => ({ '<': '&lt;', '>': '&gt;' }[c]))
                .split('\n')
                .map(line => line.trimRight())
                .join('\n')
        });
        return placeholder;
    });

    // Store inline code temporarily
    const inlineCode = [];
    html = html.replace(/`([^`]+)`/g, (match, code) => {
        const placeholder = `___INLINE_CODE_${inlineCode.length}___`;
        inlineCode.push(code);
        return placeholder;
    });
    // Convert images with optional caption
    html = html.replace(/!\[(.*?)\]\((.*?)(?:\s+"(.*?)")?\)/g, (match, alt, url, caption) => {
        if (caption) {
            return `
                <figure class="post-figure">
                    <img src="${url}" alt="${alt}" class="post-image">
                    <figcaption>${caption}</figcaption>
                </figure>
            `;
        }
        return `<img src="${url}" alt="${alt}" class="post-image">`;
    });
    // Convert headers
    html = html.replace(/^#{4,}\s+(.*$)/gim, '<h4>$1</h4>');
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Convert bold and italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Convert lists
    // Improved list handling
    let listItems = html.split('\n');
    let inList = false;
    html = listItems.map(line => {
        if (line.trim().startsWith('- ')) {
            if (!inList) {
                inList = true;
                return '<ul><li>' + line.trim().substring(2) + '</li>';
            }
            return '<li>' + line.trim().substring(2) + '</li>';
        } else if (inList && line.trim() === '') {
            inList = false;
            return '</ul>';
        }
        return line;
    }).join('\n');
    
    if (inList) {
        html += '</ul>';
    }

    // Convert blockquotes
    html = html.replace(/^\>(.+)/gm, '<blockquote>$1</blockquote>');

    // Convert links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Convert paragraphs
    html = html.split(/\n\s*\n/).map(paragraph => {
        if (paragraph.trim() && !paragraph.includes('___CODE_BLOCK_') &&
            !paragraph.includes('___INLINE_CODE_') && !paragraph.startsWith('<')) {
            return `<p>${paragraph.trim()}</p>`;
        }
        return paragraph.trim();
    }).join('\n\n');

    // Restore inline code
    inlineCode.forEach((code, index) => {
        html = html.replace(
            `___INLINE_CODE_${index}___`,
            `<code>${code.replace(/[<>]/g, c => ({ '<': '&lt;', '>': '&gt;' }[c]))}</code>`
        );
    });

    // Restore code blocks
    codeBlocks.forEach((block, index) => {
        html = html.replace(
            `___CODE_BLOCK_${index}___`,
            `<pre><code class="language-${block.language}">${block.code}</code></pre>`
        );
    });

    return html;
}

/*
Content Formatting Guidelines for Optimal Parsing:

1. Headers:
   - Use # for h1, ## for h2, ### for h3, #### for h4
   - Always add a newline after headers
   Example: 
   ## Main Header\n\n

2. Lists:
   - Start each item with "- " (hyphen followed by space)
   - Add two newlines (\n\n) between list items
   - End lists with two newlines before next content
   Example:
   - First item\n\n
   - Second item\n\n

3. Code Blocks:
   - Use triple backticks with language identifier
   - Add newline after opening and before closing
   Example:
   ```python\n
   code here\n
   ```\n\n

4. Text Formatting:
   - Bold: Use **double asterisks**
   - Italic: Use *single asterisks*
   - Add two newlines between paragraphs

5. Blockquotes:
   - Start with > followed by space
   - Add two newlines after
   Example:
   > Quote text\n\n

6. Links and Images:
   - Links: [text](url)
   - Images: ![alt text](url "optional title")

7. Line Breaks:
   - Use \n\n for paragraph breaks
   - Single \n within lists
   - Always end sections with \n\n

8. Images with Caption:
   - ![Alt text for the image](https://example.com/image.jpg "This is the image caption")

Example List Structure:
- **Bold Item**: Description\n\n
- **Second Item**: Description\n\n
- **Third Item**: Description\n\n

Note: Proper spacing and newlines are crucial for correct rendering.
*/

/**
 * Populate post tags
 */
function populateTags() {
    const postTags = document.getElementById('postTags');
    if (!postTags || !currentPost.tags || currentPost.tags.length === 0) {
        if (postTags) postTags.style.display = 'none';
        return;
    }

    postTags.innerHTML = `
        <h4>Tags:</h4>
        <div class="tag-list">
            ${currentPost.tags.map(tag => `
                <a href="index.html?search=${encodeURIComponent(tag)}" class="tag">#${tag}</a>
            `).join('')}
        </div>
    `;
}

/**
 * Populate post navigation (previous/next posts)
 */
function populateNavigation() {
    const postNavigation = document.getElementById('postNavigation');
    if (!postNavigation || !allPosts.length) return;

    const currentIndex = allPosts.findIndex(post => post.id === currentPost.id);
    const prevPost = allPosts[currentIndex + 1]; // Newer posts have lower index
    const nextPost = allPosts[currentIndex - 1]; // Older posts have higher index

    let navigationHTML = '';

    if (prevPost) {
        navigationHTML += `
            <a href="post.html?id=${prevPost.id}" class="nav-post prev">
                <div class="nav-post-label">← Previous Post</div>
                <div class="nav-post-title">${prevPost.title}</div>
            </a>
        `;
    } else {
        navigationHTML += '<div></div>'; // Empty div for grid alignment
    }

    if (nextPost) {
        navigationHTML += `
            <a href="post.html?id=${nextPost.id}" class="nav-post next">
                <div class="nav-post-label">Next Post →</div>
                <div class="nav-post-title">${nextPost.title}</div>
            </a>
        `;
    }

    if (navigationHTML) {
        postNavigation.innerHTML = navigationHTML;
    } else {
        postNavigation.style.display = 'none';
    }
}

/**
 * Setup post functionality (sharing, etc.)
 */
function setupPostFunctionality() {
    setupSocialSharing();
    setupCodeHighlighting();
    setupCopyLinkButton();
}

/**
 * Setup social sharing links
 */
function setupSocialSharing() {
    const postURL = encodeURIComponent(window.location.href);
    const postTitle = encodeURIComponent(currentPost.title);
    const postExcerpt = encodeURIComponent(currentPost.excerpt);

    // Twitter
    const shareTwitter = document.getElementById('shareTwitter');
    if (shareTwitter) {
        shareTwitter.href = `https://twitter.com/intent/tweet?url=${postURL}&text=${postTitle}`;
    }

    // LinkedIn
    const shareLinkedIn = document.getElementById('shareLinkedIn');
    if (shareLinkedIn) {
        shareLinkedIn.href = `https://www.linkedin.com/sharing/share-offsite/?url=${postURL}`;
    }

    // Facebook
    const shareFacebook = document.getElementById('shareFacebook');
    if (shareFacebook) {
        shareFacebook.href = `https://www.facebook.com/sharer/sharer.php?u=${postURL}`;
    }
}

/**
 * Setup code highlighting using Prism.js
 */
function setupCodeHighlighting() {
    if (typeof Prism !== 'undefined') {
        // Configure Prism
        Prism.highlightAll();
        
        // Add copy buttons to code blocks
        addCopyButtonsToCodeBlocks();
        
        // Add language labels
        addLanguageLabels();
    }
}

function addCopyButtonsToCodeBlocks() {
    const codeBlocks = document.querySelectorAll('pre code');
    
    codeBlocks.forEach((codeBlock) => {
        const pre = codeBlock.parentElement;
        
        // Skip if copy button already exists
        if (pre.querySelector('.copy-code-btn')) return;
        
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-code-btn';
        copyButton.innerHTML = '<i class="ri-file-copy-line"></i>';
        copyButton.setAttribute('aria-label', 'Copy code');
        
        pre.style.position = 'relative';
        pre.appendChild(copyButton);
        
        copyButton.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(codeBlock.textContent);
                copyButton.innerHTML = '<i class="ri-check-line"></i>';
                copyButton.style.background = '#28a745';
                
                setTimeout(() => {
                    copyButton.innerHTML = '<i class="ri-file-copy-line"></i>';
                    copyButton.style.background = '';
                }, 2000);
            } catch (err) {
                console.error('Failed to copy code:', err);
            }
        });
    });
}

function addLanguageLabels() {
    const codeBlocks = document.querySelectorAll('pre code[class*="language-"]');
    
    codeBlocks.forEach((codeBlock) => {
        const pre = codeBlock.parentElement;
        const className = codeBlock.className;
        const languageMatch = className.match(/language-(\w+)/);
        
        if (languageMatch && !pre.querySelector('.language-label')) {
            const language = languageMatch[1];
            const label = document.createElement('span');
            label.className = 'language-label';
            label.textContent = language.toUpperCase();
            pre.appendChild(label);
        }
    });
}


/**
 * Setup copy link button functionality
 */
function setupCopyLinkButton() {
    const copyLink = document.getElementById('copyLink');
    if (!copyLink) return;

    copyLink.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            showCopyNotification();
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = window.location.href;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showCopyNotification();
        }
    });
}

/**
 * Show copy notification
 */
function showCopyNotification() {
    if (!copyNotification) return;

    copyNotification.classList.add('show');
    setTimeout(() => {
        copyNotification.classList.remove('show');
    }, 3000);
}

/**
 * Calculate estimated read time for a post
 */
function calculateReadTime(content) {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return Math.max(1, readTime);
}

/**
 * Format date string
 */
function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

/**
 * Show or hide loading state
 */
function showLoading(show) {
    if (loadingState) {
        loadingState.style.display = show ? 'flex' : 'none';
    }
    if (blogPost) {
        blogPost.style.display = show ? 'none' : 'block';
    }
    if (postNotFound) {
        postNotFound.style.display = 'none';
    }
}

/**
 * Show post not found message
 */
function showPostNotFound() {
    if (loadingState) {
        loadingState.style.display = 'none';
    }
    if (blogPost) {
        blogPost.style.display = 'none';
    }
    if (postNotFound) {
        postNotFound.style.display = 'block';
    }
}

/**
 * Smooth scroll to top when page loads
 */
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

/**
 * Add reading progress indicator
 */
function addReadingProgress() {
    const progressBar = document.createElement('div');
    progressBar.id = 'reading-progress';
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background-color: var(--secondary-accent);
        z-index: 9999;
        transition: width 0.3s ease;
    `;
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + '%';
    });
}

/**
 * Initialize table of contents (if post has headings)
 */
function initializeTableOfContents() {
    const postContent = document.getElementById('postContent');
    if (!postContent) return;

    const headings = postContent.querySelectorAll('h2, h3, h4');
    if (headings.length < 3) return; // Only show TOC for posts with 3+ headings

    // Create TOC container
    const tocContainer = document.createElement('div');
    tocContainer.className = 'table-of-contents';
    tocContainer.innerHTML = `
        <h4>Table of Contents</h4>
        <ul class="toc-list"></ul>
    `;

    const tocList = tocContainer.querySelector('.toc-list');
    
    // Generate TOC items
    headings.forEach((heading, index) => {
        const id = `heading-${index}`;
        heading.id = id;
        
        const li = document.createElement('li');
        li.className = `toc-item toc-${heading.tagName.toLowerCase()}`;
        li.innerHTML = `<a href="#${id}" class="toc-link">${heading.textContent}</a>`;
        
        tocList.appendChild(li);
    });

    // Insert TOC after post header
    const postHeader = document.querySelector('.post-header');
    if (postHeader && postHeader.nextSibling) {
        postHeader.parentNode.insertBefore(tocContainer, postHeader.nextSibling);
    }

    // Add smooth scrolling to TOC links
    tocContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('toc-link')) {
            e.preventDefault();
            const targetId = e.target.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                const headerOffset = 100; // Adjust this value based on your header height
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        }
    });
}

/**
 * Add keyboard navigation
 */
function addKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        // Navigate with arrow keys
        if (e.altKey) {
            const currentIndex = allPosts.findIndex(post => post.id === currentPost.id);
            
            if (e.key === 'ArrowLeft' && currentIndex < allPosts.length - 1) {
                // Previous post
                const prevPost = allPosts[currentIndex + 1];
                window.location.href = `post.html?id=${prevPost.id}`;
            } else if (e.key === 'ArrowRight' && currentIndex > 0) {
                // Next post
                const nextPost = allPosts[currentIndex - 1];
                window.location.href = `post.html?id=${nextPost.id}`;
            }
        }
        
        // Escape key to go back to blog
        if (e.key === 'Escape') {
            window.location.href = 'index.html';
        }
    });
}

// Initialize additional features when post is loaded
function initializeAdditionalFeatures() {
    addReadingProgress();
    initializeTableOfContents();
    addKeyboardNavigation();
    scrollToTop();
}

// Call additional features after post is displayed
const originalDisplayPost = displayPost;
displayPost = function() {
    originalDisplayPost.call(this);
    setTimeout(initializeAdditionalFeatures, 100);
};

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculateReadTime,
        formatDate,
        parseContent,
        loadPost
    };
}


