const MODAL_CART_TEMPLATE = document.createElement('template');
MODAL_CART_TEMPLATE.innerHTML = `
  <style>
    :host { position: fixed; inset: 0; display: none; align-items: center; justify-content: center; z-index: 1200; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    :host(.open) { display: flex; }
    .overlay { position: absolute; inset: 0; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(2px); }
    .dialog { position: relative; width: min(98vw, 680px); max-height: 92vh; background: #fff; border-radius: 22px; box-shadow: 0 32px 80px rgba(15, 23, 42, 0.22); overflow: hidden; display: grid; grid-template-rows: auto 1fr auto; }
    .header { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 1.2rem 1.5rem; border-bottom: 1px solid rgba(15, 23, 42, 0.08); background: #fafafa; }
    .header h2 { margin: 0; font-size: 1.2rem; letter-spacing: 0.04em; color: #111; }
    .close-btn { border: none; background: transparent; color: #111; font-size: 1.2rem; cursor: pointer; line-height: 1; }
    .content { overflow-y: auto; padding: 1.25rem 1.5rem; display: grid; gap: 1rem; }
    .empty-state { padding: 2rem 1rem; text-align: center; color: #5a5a5a; border: 2px dashed #d8d8d8; border-radius: 18px; background: #fafafa; }
    .empty-state strong { display: block; margin-bottom: 0.5rem; color: #111; }
    .cart-list { display: grid; gap: 1rem; }
    .cart-item { display: grid; grid-template-columns: auto 1fr auto; gap: 1rem; align-items: center; padding: 1rem; border: 1px solid #ececec; border-radius: 18px; }
    .item-image { width: 84px; min-width: 84px; aspect-ratio: 1; overflow: hidden; border-radius: 16px; background: #f5f5f5; }
    .item-image img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .item-details { display: grid; gap: 0.45rem; }
    .item-title { margin: 0; font-size: 0.98rem; color: #111; }
    .item-meta { font-size: 0.82rem; color: #71717a; }
    .item-meta span + span::before { content: ' • '; color: #d1d5db; }
    .item-actions { display: grid; gap: 0.45rem; justify-items: end; text-align: right; }
    .item-actions button { border: none; background: transparent; color: #d11f3f; font-size: 0.95rem; cursor: pointer; padding: 0.3rem 0.4rem; }
    .summary { display: grid; gap: 0.75rem; padding: 1rem 1.5rem 1.5rem; background: #fff; border-top: 1px solid rgba(15, 23, 42, 0.08); }
    .summary-row { display: flex; justify-content: space-between; gap: 0.75rem; font-size: 0.95rem; color: #404040; }
    .summary-row.total { font-weight: 700; font-size: 1rem; color: #111; }
    .checkout-btn { width: 100%; border: none; border-radius: 999px; background: #111; color: #fff; padding: 0.95rem 1rem; font-size: 1rem; font-weight: 700; cursor: pointer; }
    .checkout-btn:disabled { background: #9ca3af; cursor: not-allowed; }
    @media (max-width: 520px) {
      .dialog { width: min(100vw, 100%); border-radius: 16px; }
      .cart-item { grid-template-columns: auto 1fr; }
      .item-actions { justify-items: start; text-align: left; }
      .summary { padding: 1rem; }
    }
  </style>
  <div class="overlay" part="overlay"></div>
  <section class="dialog" part="dialog" role="dialog" aria-modal="true" aria-labelledby="modal-cart-title">
    <header class="header">
      <h2 id="modal-cart-title">Tu carrito</h2>
      <button class="close-btn" type="button" aria-label="Cerrar carrito">✕</button>
    </header>
    <main class="content">
      <div class="empty-state" part="empty-state">
        <strong>Tu carrito está vacío</strong>
        <p>Añade productos para verlos aquí.</p>
      </div>
      <div class="cart-list" part="cart-list"></div>
    </main>
    <footer class="summary" part="summary">
      <div class="summary-row">
        <span>Total</span>
        <span class="total-value">€0,00</span>
      </div>
      <button class="checkout-btn" type="button" disabled>Checkout</button>
    </footer>
  </section>
`;

class ModalCart extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(MODAL_CART_TEMPLATE.content.cloneNode(true));

    this.overlay = this.shadowRoot.querySelector('.overlay');
    this.dialog = this.shadowRoot.querySelector('.dialog');
    this.emptyState = this.shadowRoot.querySelector('.empty-state');
    this.cartList = this.shadowRoot.querySelector('.cart-list');
    this.totalValue = this.shadowRoot.querySelector('.total-value');
    this.checkoutButton = this.shadowRoot.querySelector('.checkout-btn');
    this.closeButton = this.shadowRoot.querySelector('.close-btn');

    this.cartItems = [];
    this.handleRootClick = this.handleRootClick.bind(this);
    this.handleCheckout = this.handleCheckout.bind(this);
  }

  connectedCallback() {
    this.shadowRoot.addEventListener('click', this.handleRootClick);
    this.checkoutButton.addEventListener('click', this.handleCheckout);
    this.render();
  }

  disconnectedCallback() {
    this.shadowRoot.removeEventListener('click', this.handleRootClick);
    this.checkoutButton.removeEventListener('click', this.handleCheckout);
  }

  open() {
    this.classList.add('open');
    this.render();
  }

  close() {
    this.classList.remove('open');
  }

  render() {
    this.renderState();
    this.renderItems();
    this.renderSummary();
  }

  update(items = []) {
    if (!Array.isArray(items)) {
      throw new TypeError('ModalCart.update expects an array of cart items.');
    }
    this.cartItems = items.map(item => ({
      productId: String(item.productId || item.id || ''),
      image: String(item.image || ''),
      name: String(item.name || ''),
      quantity: Number(item.quantity || 1),
      price: Number(item.price || 0)
    }));
    this.render();
  }

  removeItem(productId) {
    const id = String(productId);
    const exists = this.cartItems.some(item => item.productId === id);
    if (!exists) return;
    this.cartItems = this.cartItems.filter(item => item.productId !== id);
    this.render();
    this.dispatchEvent(new CustomEvent('remove-item', {
      detail: { productId: id },
      bubbles: true,
      composed: true
    }));
  }

  handleRootClick(event) {
    const removeButton = event.target.closest('.remove-btn');
    if (removeButton) {
      const productId = removeButton.closest('[data-product-id]')?.dataset.productId;
      if (productId) {
        this.removeItem(productId);
      }
      return;
    }

    if (event.target === this.closeButton || event.target === this.overlay) {
      this.close();
    }
  }

  handleCheckout() {
    if (this.cartItems.length === 0) return;
    this.dispatchEvent(new CustomEvent('checkout', {
      detail: { total: this.getTotal(), itemCount: this.getItemCount() },
      bubbles: true,
      composed: true
    }));
  }

  renderState() {
    const hasItems = this.cartItems.length > 0;
    this.emptyState.style.display = hasItems ? 'none' : 'block';
    this.cartList.style.display = hasItems ? 'grid' : 'none';
    this.checkoutButton.disabled = !hasItems;
  }

  renderItems() {
    if (this.cartItems.length === 0) {
      this.cartList.innerHTML = '';
      return;
    }

    this.cartList.innerHTML = this.cartItems.map(item => {
      const subtotal = this.formatCurrency(item.price * item.quantity);
      const price = this.formatCurrency(item.price);
      return `
        <article class="cart-item" data-product-id="${item.productId}">
          <div class="item-image">
            <img src="${item.image}" alt="${this.escapeHtml(item.name)}" />
          </div>
          <div class="item-details">
            <h3 class="item-title">${this.escapeHtml(item.name)}</h3>
            <p class="item-meta">
              <span>Cantidad: ${item.quantity}</span>
              <span>Precio: ${price}</span>
              <span>Subtotal: ${subtotal}</span>
            </p>
          </div>
          <div class="item-actions">
            <button class="remove-btn" type="button" aria-label="Eliminar producto">Eliminar</button>
          </div>
        </article>
      `;
    }).join('');
  }

  renderSummary() {
    this.totalValue.textContent = this.formatCurrency(this.getTotal());
  }

  getTotal() {
    return this.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  getItemCount() {
    return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  formatCurrency(value) {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
  }

  escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

customElements.define('modal-cart', ModalCart);
