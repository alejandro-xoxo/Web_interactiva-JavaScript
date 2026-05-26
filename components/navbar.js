const NAVBAR_TEMPLATE = document.createElement('template');
NAVBAR_TEMPLATE.innerHTML = `
  <style>
    :host { display: block; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .navbar { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.85rem 1rem; background: #111; color: #fff; border-bottom: 1px solid rgba(255,255,255,.08); }
    .navbar__brand, .navbar__links, .navbar__actions { display: flex; align-items: center; gap: 0.75rem; }
    .navbar__logo { color: #fff; text-decoration: none; font-size: 1.05rem; font-weight: 800; letter-spacing: 0.12em; }
    .nav-link { color: rgba(255,255,255,.8); text-decoration: none; text-transform: uppercase; font-size: 0.82rem; padding: 0.35rem 0.55rem; border-radius: 999px; transition: all 0.2s ease; }
    .nav-link:hover, .nav-link.active { color: #fff; background: rgba(255,255,255,.08); }
    .action-btn { border: 1px solid rgba(255,255,255,.2); background: transparent; color: #fff; cursor: pointer; padding: 0.55rem 0.9rem; border-radius: 999px; font-size: 0.82rem; transition: background 0.2s ease, transform 0.2s ease; }
    .action-btn:hover { background: rgba(255,255,255,.08); transform: translateY(-1px); }
    .action-btn:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }
    .cart-count { margin-left: 0.45rem; font-weight: 700; }
    .navbar--admin { background: #07101f; border-color: rgba(255,255,255,.06); }
    .navbar__actions { margin-left: auto; }
    @media (max-width: 860px) {
      .navbar { flex-wrap: wrap; }
      .navbar__brand { flex: 1 1 100%; }
      .navbar__links { order: 3; width: 100%; justify-content: center; flex-wrap: wrap; gap: 0.5rem; }
      .navbar__actions { order: 2; width: 100%; justify-content: center; }
    }
  </style>
  <nav class="navbar" role="navigation">
    <div class="navbar__brand">
      <a class="navbar__logo" href="#">AETHON</a>
    </div>
    <div class="navbar__links"></div>
    <div class="navbar__actions"></div>
  </nav>
`;

class AethonNavbar extends HTMLElement {
  static get observedAttributes() {
    return ['cart-count'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(NAVBAR_TEMPLATE.content.cloneNode(true));
    this.linksContainer = this.shadowRoot.querySelector('.navbar__links');
    this.actionsContainer = this.shadowRoot.querySelector('.navbar__actions');
    this.logoLink = this.shadowRoot.querySelector('.navbar__logo');
    this.navShell = this.shadowRoot.querySelector('.navbar');
    this.handleActionClick = this.handleActionClick.bind(this);
  }

  connectedCallback() {
    this.render();
    this.actionsContainer.addEventListener('click', this.handleActionClick);
  }

  disconnectedCallback() {
    this.actionsContainer.removeEventListener('click', this.handleActionClick);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'cart-count' && oldValue !== newValue) {
      this.updateCartCount(newValue);
    }
  }

  // Detect the current page file name for active link and admin/front-end layout selection.
  get currentPage() {
    const pathname = window.location.pathname;
    return pathname.split('/').pop() || 'index.html';
  }

  get isAdminPage() {
    return ['dashboard.html', 'categories.html', 'orders.html'].includes(this.currentPage);
  }

  get isWithinScreensFolder() {
    return window.location.pathname.includes('/screens/');
  }

  get basePath() {
    return this.isWithinScreensFolder ? '../' : '';
  }

  get activePageKey() {
    const mapping = {
      'index.html': 'index.html',
      'products.html': 'products.html',
      'product-detail.html': 'products.html',
      'cart.html': 'cart.html',
      'categories.html': 'categories.html',
      'dashboard.html': 'dashboard.html',
      'orders.html': 'orders.html'
    };
    return mapping[this.currentPage] || this.currentPage;
  }

  // Build the link structure for front-end or admin pages and render the proper layout.
  render() {
    const frontendLinks = [
      { label: 'Inicio', href: `${this.basePath}index.html`, key: 'index.html' },
      { label: 'Colección', href: this.isWithinScreensFolder ? 'products.html' : 'screens/products.html', key: 'products.html' },
      { label: 'Categorías', href: this.isWithinScreensFolder ? 'categories.html' : 'screens/categories.html', key: 'categories.html' }
    ];

    const adminLinks = [
      { label: 'Dashboard', href: 'dashboard.html', key: 'dashboard.html' },
      { label: 'Categorías', href: 'categories.html', key: 'categories.html' },
      { label: 'Pedidos', href: 'orders.html', key: 'orders.html' }
    ];

    const links = this.isAdminPage ? adminLinks : frontendLinks;
    this.linksContainer.innerHTML = links.map(link => {
      const activeClass = this.activePageKey === link.key ? ' active' : '';
      return `<a class="nav-link${activeClass}" href="${link.href}">${link.label}</a>`;
    }).join('');

    if (this.isAdminPage) {
      this.actionsContainer.innerHTML = `<button class="action-btn logout-btn" type="button">CERRAR SESIÓN</button>`;
      this.navShell.classList.add('navbar--admin');
      this.logoLink.setAttribute('href', `${this.basePath}index.html`);
    } else {
      const accountHref = this.isWithinScreensFolder ? 'login.html' : 'screens/login.html';
      const cartCount = this.getAttribute('cart-count') || '0';

      this.actionsContainer.innerHTML = `
        <button class="action-btn search-btn" type="button">BUSCAR</button>
        <a class="action-btn account-btn" href="${accountHref}">CUENTA</a>
        <button class="action-btn cart-btn" type="button">CARRITO <span class="cart-count">${cartCount}</span></button>
      `;
      this.navShell.classList.remove('navbar--admin');
      this.logoLink.setAttribute('href', `${this.basePath}index.html`);
    }
  }

  handleActionClick(event) {
    const searchButton = event.target.closest('.search-btn');
    const cartButton = event.target.closest('.cart-btn');
    const logoutButton = event.target.closest('.logout-btn');

    if (searchButton) {
      this.dispatchEvent(new CustomEvent('open-search', { bubbles: true, composed: true }));
      return;
    }

    if (cartButton) {
      this.dispatchEvent(new CustomEvent('open-cart', { bubbles: true, composed: true }));
      return;
    }

    if (logoutButton) {
      this.dispatchEvent(new CustomEvent('logout', { bubbles: true, composed: true }));
    }
  }

  updateCartCount(count) {
    const badge = this.actionsContainer.querySelector('.cart-count');
    if (badge) {
      badge.textContent = String(count || '0');
    }
  }
}

customElements.define('aethon-navbar', AethonNavbar);
