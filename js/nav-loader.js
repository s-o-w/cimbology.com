document.addEventListener('DOMContentLoaded', function() {
    const navHtml = `
        <button class="mobile-menu-toggle" aria-label="Toggle menu">
            <span></span>
            <span></span>
            <span></span>
        </button>
        <nav class="main-nav">
            <ul>
                <li><a href="index.html">Home</a></li>
                <li><a href="technical-expertise.html">Technical Expertise</a></li>
                <li><a href="ai-philosophy.html">My AI Philosophy</a></li>
                <li><a href="dotTC57.html">dotTC57 Library</a></li>
                <li><a href="cimbology-case-study.html">Case Study: Cimbology</a></li>
                <li><a href="why-cim-matters.html">Why CIM Matters</a></li>
                <li><a href="ideal-role.html">My Ideal Role</a></li>
                <li><a href="index.html#contact">Contact</a></li>
            </ul>
        </nav>
    `;

    const logoContainer = document.querySelector('.logo-container');
    if (logoContainer) {
        logoContainer.insertAdjacentHTML('afterbegin', navHtml);
        initMobileMenu();
        highlightActiveLink();
    }
});

function initMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', function (e) {
            e.stopPropagation();
            mobileMenuToggle.classList.toggle('active');
            mainNav.classList.toggle('active');
        });

        const navLinks = document.querySelectorAll('.main-nav a');
        navLinks.forEach(link => {
            link.addEventListener('click', function () {
                mobileMenuToggle.classList.remove('active');
                mainNav.classList.remove('active');
            });
        });

        document.addEventListener('click', function (e) {
            if (!mainNav.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                mobileMenuToggle.classList.remove('active');
                mainNav.classList.remove('active');
            }
        });
    }
}

function highlightActiveLink() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.main-nav a');
    
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        // Handle exact matches and index.html aliases
        if (linkHref === currentPath) {
            link.classList.add('active');
        } else if ((currentPath === '' || currentPath === '/') && linkHref === 'index.html') {
            link.classList.add('active');
        }
    });
}
