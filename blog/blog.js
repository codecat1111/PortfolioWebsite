/**
 * Blog Main JavaScript
 * Handles blog post loading, filtering, searching, and navigation
 * Author: Justin Wilson John
 */

"use strict";
// Global variables
let allPosts = [];
let filteredPosts = [];
let currentFilters = {
    search: '',
    category: '',
    sort: 'newest'
};

// DOM Elements
const blogGrid = document.getElementById('blogGrid');
const loadingState = document.getElementById('loadingState');
const noResults = document.getElementById('noResults');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const sortFilter = document.getElementById('sortFilter');

/**
 * Initialize the blog when DOM is loaded
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

    // Load blog posts
    await loadBlogPosts();

    // Set up event listeners
    setupEventListeners();
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
 * Load blog posts from JSON file
 */
async function loadBlogPosts() {
    try {
        showLoading(true);
        
        // Fetch posts from JSON file
        const response = await fetch('posts.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        allPosts = data.posts || [];
        
        // Apply initial filters and display posts
        applyFilters();
        
    } catch (error) {
        console.error('Error loading blog posts:', error);
        showError('Failed to load blog posts. Please try again later.');
    } finally {
        showLoading(false);
    }
}

/**
 * Set up event listeners for search and filters
 */
function setupEventListeners() {
    // Search input
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }

    // Category filter
    if (categoryFilter) {
        categoryFilter.addEventListener('change', handleCategoryFilter);
    }

    // Sort filter
    if (sortFilter) {
        sortFilter.addEventListener('change', handleSortFilter);
    }
}

/**
 * Handle search functionality
 */
function handleSearch(event) {
    currentFilters.search = event.target.value.toLowerCase();
    applyFilters();
}

/**
 * Handle category filtering
 */
function handleCategoryFilter(event) {
    currentFilters.category = event.target.value;
    applyFilters();
}

/**
 * Handle sort filtering
 */
function handleSortFilter(event) {
    currentFilters.sort = event.target.value;
    applyFilters();
}

/**
 * Apply all filters and sort to posts
 */
function applyFilters() {
    filteredPosts = [...allPosts];

    // Apply search filter
    if (currentFilters.search) {
        filteredPosts = filteredPosts.filter(post =>
            post.title.toLowerCase().includes(currentFilters.search) ||
            post.excerpt.toLowerCase().includes(currentFilters.search) ||
            post.content.toLowerCase().includes(currentFilters.search) ||
            post.tags.some(tag => tag.toLowerCase().includes(currentFilters.search))
        );
    }

    // Apply category filter
    if (currentFilters.category) {
        filteredPosts = filteredPosts.filter(post =>
            post.category === currentFilters.category
        );
    }

    // Apply sorting
    filteredPosts.sort((a, b) => {
        switch (currentFilters.sort) {
            case 'newest':
                return new Date(b.date) - new Date(a.date);
            case 'oldest':
                return new Date(a.date) - new Date(b.date);
            case 'title':
                return a.title.localeCompare(b.title);
            default:
                return 0;
        }
    });

    displayPosts();
}

/**
 * Display filtered posts in the grid
 */
function displayPosts() {
    if (!blogGrid) return;

    // Clear existing posts
    blogGrid.innerHTML = '';

    if (filteredPosts.length === 0) {
        showNoResults(true);
        return;
    }

    showNoResults(false);

    // Create post cards
    filteredPosts.forEach((post, index) => {
        const postCard = createPostCard(post, index);
        blogGrid.appendChild(postCard);
    });

    // Reinitialize AOS for new elements
    AOS.refresh();
}

/**
 * Create a post card element
 */
function createPostCard(post, index) {
    const card = document.createElement('div');
    card.className = 'blog-card';
    card.setAttribute('data-aos', 'fade-up');
    card.setAttribute('data-aos-delay', (index * 100).toString());
    
    // Calculate read time (approximate)
    const readTime = calculateReadTime(post.content);
    
    // Format date
    const formattedDate = formatDate(post.date);
    
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
                <a href="post.html?id=${post.id}" class="blog-card-link">
                    Read More <i class="ri-arrow-right-line"></i>
                </a>
            </div>
        </div>
    `;
    
    // Add click handler to entire card
    card.addEventListener('click', (e) => {
        // Don't navigate if clicking on the direct link
        if (e.target.closest('.blog-card-link')) return;
        
        window.location.href = `post.html?id=${post.id}`;
    });

    return card;
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
}

/**
 * Show or hide no results message
 */
function showNoResults(show) {
    if (noResults) {
        noResults.style.display = show ? 'block' : 'none';
    }
}

/**
 * Show error message
 */
function showError(message) {
    if (blogGrid) {
        blogGrid.innerHTML = `
            <div class="loading-state" style="grid-column: 1 / -1;">
                <i class="ri-error-warning-line" style="font-size: 3rem; color: var(--secondary-accent); margin-bottom: 1rem;"></i>
                <p style="color: var(--supportive-text-color); text-align: center;">${message}</p>
                <button onclick="location.reload()" class="btn btn-white" style="margin-top: 1rem;">
                    Try Again
                </button>
            </div>
        `;
    }
}

/**
 * Debounce function to limit search frequency
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Initialize search functionality with URL parameters
 */
function initializeFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    const category = urlParams.get('category');
    
    if (searchQuery && searchInput) {
        searchInput.value = searchQuery;
        currentFilters.search = searchQuery.toLowerCase();
    }
    
    if (category && categoryFilter) {
        categoryFilter.value = category;
        currentFilters.category = category;
    }
}

/**
 * Update URL with current filters (for sharing/bookmarking)
 */
function updateURL() {
    const params = new URLSearchParams();
    
    if (currentFilters.search) {
        params.set('search', currentFilters.search);
    }
    
    if (currentFilters.category) {
        params.set('category', currentFilters.category);
    }
    
    if (currentFilters.sort !== 'newest') {
        params.set('sort', currentFilters.sort);
    }
    
    const newURL = params.toString() ? 
        `${window.location.pathname}?${params.toString()}` : 
        window.location.pathname;
    
    window.history.replaceState({}, '', newURL);
}

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculateReadTime,
        formatDate,
        applyFilters,
        createPostCard
    };
}