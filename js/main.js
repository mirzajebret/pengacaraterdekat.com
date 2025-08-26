// --- LANGUAGE SWITCHER LOGIC ---

// Sets the language of the page
const setLanguage = (lang) => {
    // Save preference to local storage
    localStorage.setItem('language', lang);

    // Update the HTML lang attribute for SEO and accessibility
    document.documentElement.lang = lang;

    // Translate all elements with the data-translate attribute
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[key] && translations[key][lang]) {
            element.innerHTML = translations[key][lang];
        }
    });

    // Translate the page title
    const pageKey = document.body.dataset.pageKey;
    if (pageKey && translations[pageKey] && translations[pageKey][lang]) {
        document.title = translations[pageKey][lang];
    }
    
    // Translate the meta description tag
    const metaDescElement = document.querySelector('meta[name="description"]');
    if (metaDescElement) {
        const metaDescKey = metaDescElement.dataset.translate;
         if (metaDescKey && translations[metaDescKey] && translations[metaDescKey][lang]) {
            metaDescElement.setAttribute('content', translations[metaDescKey][lang]);
        }
    }

    // Update active language button style
    document.querySelectorAll('.lang-btn').forEach(btn => {
        if (btn.dataset.lang === lang) {
            btn.classList.add('font-bold', 'text-white');
            btn.classList.remove('opacity-70');
        } else {
            btn.classList.remove('font-bold', 'text-white');
            btn.classList.add('opacity-70');
        }
    });
};

// Initializes the language on page load
const initializeLanguage = () => {
    // Get saved language or default to Indonesian ('id')
    const savedLang = localStorage.getItem('language') || 'id';
    setLanguage(savedLang);
};


// This function contains all the logic that depends on the DOM being fully ready, including loaded components
function initializeApp() {
    // Mobile Menu
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
        // Close mobile menu when a link is clicked
        mobileMenu.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                mobileMenu.classList.add('hidden');
            }
        });
    }

    // Scroll to Top Button
    const toTopButton = document.getElementById('to-top-button');
    if (toTopButton) {
        // Scroll to Top Button Visibility
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                toTopButton.classList.remove('hidden');
            } else {
                toTopButton.classList.add('hidden');
            }
        });
        // Scroll to Top on click
        toTopButton.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Set active navigation link
    const setActiveNavLink = () => {
        const navLinks = document.querySelectorAll('.nav-link');
        let currentPath = window.location.pathname.split('/').pop();
        if (currentPath === '' || currentPath === 'index.html') {
            currentPath = 'index.html';
        }

        navLinks.forEach(link => {
            const linkPath = link.getAttribute('href').split('/').pop();
            // Also check for the root case for index.html
            if (linkPath === currentPath || (linkPath === 'index.html' && currentPath === '')) {
                link.classList.add('text-secondary', 'font-bold');
            } else {
                link.classList.remove('text-secondary', 'font-bold');
            }
        });
    };
    setActiveNavLink();

    // Practice Area Tabs - only on practice-areas.html
    const initializePracticeAreaTabs = () => {
        const tabsContainer = document.getElementById('practice-areas');
        if (!tabsContainer) return;

        const tabs = tabsContainer.querySelectorAll('.practice-tab');
        const contents = tabsContainer.querySelectorAll('.practice-content');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => {
                    t.classList.remove('active', 'border-secondary', 'bg-surface');
                    t.classList.add('border-transparent');
                });
                tab.classList.add('active', 'border-secondary', 'bg-surface');
                tab.classList.remove('border-transparent');
                
                const targetId = tab.dataset.target;
                contents.forEach(content => {
                    if (content.id === targetId) {
                        content.classList.remove('hidden');
                    } else {
                        content.classList.add('hidden');
                    }
                });
            });
        });
    };
    // Only try to initialize tabs on the practice areas page
    if (window.location.pathname.includes('practice-areas.html')) {
        initializePracticeAreaTabs();
    }


    // Fade-in animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.remove('opacity-0', 'translate-y-5');
                entry.target.classList.add('opacity-100', 'translate-y-0');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });

    // Setup language switcher event listeners
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const lang = e.target.dataset.lang;
            setLanguage(lang);
        });
    });
    // Set the initial language for the page
    initializeLanguage();
}

// Function to handle page transitions
function handlePageTransition() {
    const loader = document.getElementById('loader');
    const pageContent = document.getElementById('page-content');

    // On initial load, fade in the content and fade out the loader.
    if (loader && pageContent) {
        // Use a short timeout to ensure the browser has rendered the initial state before transitioning.
        setTimeout(() => {
            loader.style.opacity = '0';
            loader.style.pointerEvents = 'none';
            pageContent.style.opacity = '1';
        }, 100);
    }

    // Intercept clicks on internal links to trigger the exit animation.
    document.querySelectorAll('a').forEach(link => {
        const href = link.getAttribute('href');
        const target = link.getAttribute('target');

        // Check if it's a valid, internal link for navigation.
        if (href && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:') && target !== '_blank') {
            // Also check for absolute URLs that point to the same origin
            try {
                const url = new URL(href, window.location.origin);
                if (url.origin === window.location.origin) {
                     link.addEventListener('click', (e) => {
                        e.preventDefault();
                        
                        if (loader && pageContent) {
                            loader.style.opacity = '1';
                            loader.style.pointerEvents = 'auto';
                            pageContent.style.opacity = '0';
                        }

                        // Wait for the transition to complete before navigating.
                        setTimeout(() => {
                            window.location.href = href;
                        }, 500); // This duration should match the CSS transition duration.
                    });
                }
            } catch (e) {
                // Invalid URL, ignore it.
            }
        }
    });
}

// Function to load HTML components
async function loadComponent(url, elementId) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
        }
        const text = await response.text();
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = text;
        }
    } catch (error) {
        console.error(`Error loading component into ${elementId}:`, error);
    }
}

// Main execution flow
document.addEventListener('DOMContentLoaded', async () => {
    // Load header and footer in parallel
    await Promise.all([
        loadComponent('components/header.html', 'header-placeholder'),
        loadComponent('components/footer.html', 'footer-placeholder')
    ]);
    
    // Once components are loaded, initialize the app's interactive elements
    initializeApp();
    
    // Initialize page transitions
    handlePageTransition();
});