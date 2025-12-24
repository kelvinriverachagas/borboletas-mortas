/* ============================================
   INICIALIZAÇÃO E CONFIGURAÇÃO
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initScrollEffects();
    initModal();
    initStripe();
});

/* ============================================
   NAVEGAÇÃO
   ============================================ */

function initNavigation() {
    const navbar = document.getElementById('navbar');
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        menuToggle.classList.toggle('active');
    });

    // Close menu when link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            menuToggle.classList.remove('active');
        });
    });

    // Smooth scroll for anchor links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
}

/* ============================================
   SCROLL EFFECTS
   ============================================ */

function initScrollEffects() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });

    // Observe highlight cards
    document.querySelectorAll('.highlight-card').forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        observer.observe(card);
    });
}

/* ============================================
   MODAL
   ============================================ */

function initModal() {
    setupModal('purchaseModal', ['btnComprar', 'btnComprarFinal']);
    setupModal('excerptModal', ['btnLerTrecho']);
}

function setupModal(modalId, openTriggerIds) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    const closeButtons = modal.querySelectorAll('.modal-close, .modal-close-bottom');

    openTriggerIds.forEach(triggerId => {
        const trigger = document.getElementById(triggerId);
        trigger?.addEventListener('click', () => {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    closeButtons.forEach(btn => {
        btn?.addEventListener('click', () => {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

/* ============================================
   BOTÕES
   ============================================ */

function initButtons() {
}

/* ============================================
   STRIPE INTEGRATION
   ============================================ */

function initStripe() {
    // Verificar se há uma chave pública do Stripe
    const stripePublicKey = getStripeKey();
    
    if (!stripePublicKey) {
        console.warn('Stripe public key não configurada. Pagamentos desativados.');
        return;
    }

    try {
        const stripe = Stripe(stripePublicKey);
        console.log('Stripe inicializado com sucesso');
    } catch (error) {
        console.error('Erro ao inicializar Stripe:', error);
    }
}

function getStripeKey() {
    // Tentar obter a chave de várias fontes
    // 1. Variável global
    if (window.STRIPE_PUBLIC_KEY) {
        return window.STRIPE_PUBLIC_KEY;
    }
    
    // 2. Meta tag
    const metaTag = document.querySelector('meta[name="stripe-public-key"]');
    if (metaTag) {
        return metaTag.getAttribute('content');
    }
    
    // 3. Data attribute no body
    if (document.body.dataset.stripeKey) {
        return document.body.dataset.stripeKey;
    }
    
    return null;
}

/* ============================================
   UTILITÁRIOS
   ============================================ */

// Adicionar animação fadeInUp ao CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Função para rastrear eventos (útil para analytics)
function trackEvent(eventName, eventData = {}) {
    if (window.gtag) {
        gtag('event', eventName, eventData);
    }
    console.log('Event tracked:', eventName, eventData);
}

// Rastrear cliques em botões de compra
document.getElementById('btnComprar')?.addEventListener('click', () => {
    trackEvent('purchase_modal_opened', { source: 'hero' });
});

document.getElementById('btnComprarFinal')?.addEventListener('click', () => {
    trackEvent('purchase_modal_opened', { source: 'cta' });
});



/* ============================================
   VALIDAÇÃO E SEGURANÇA
   ============================================ */

// Validar que o site está sendo servido via HTTPS em produção
if (window.location.protocol === 'http:' && !window.location.hostname.includes('localhost')) {
    console.warn('⚠️ Este site deve ser servido via HTTPS para segurança.');
}

// Verificar suporte a recursos necessários
function checkBrowserSupport() {
    const requiredFeatures = {
        'IntersectionObserver': typeof IntersectionObserver !== 'undefined',
        'fetch': typeof fetch !== 'undefined',
        'CSS Grid': CSS.supports('display', 'grid'),
        'CSS Custom Properties': CSS.supports('--test', '0')
    };

    const unsupported = Object.entries(requiredFeatures)
        .filter(([, supported]) => !supported)
        .map(([feature]) => feature);

    if (unsupported.length > 0) {
        console.warn('Recursos não suportados:', unsupported);
    }
}

checkBrowserSupport();

/* ============================================
   PERFORMANCE
   ============================================ */

// Lazy loading para imagens
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Prefetch recursos importantes
function prefetchResources() {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = 'https://js.stripe.com/v3/';
    document.head.appendChild(link);
}

prefetchResources();

console.log('✅ Script carregado com sucesso');
