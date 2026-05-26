const PRODUCT_CARD_TEMPLATE = document.createElement('template');
PRODUCT_CARD_TEMPLATE.innerHTML = `
  <style>
    :host { display: block; box-sizing: border-box; width: 100%; max-width: 100%; }
    .card { display: grid; grid-template-rows: auto 1fr; background: #ffffff; border: 1px solid #e3e3e3; border-radius: 18px; overflow: hidden; box-shadow: 0 18px 40px rgba(12, 15, 22, 0.06); transition: transform 0.25s ease, box-shadow 0.25s ease; }
    .card:hover { transform: translateY(-2px); box-shadow: 0 24px 46px rgba(12, 15, 22, 0.1); }
    .image-shell { position: relative; width: 100%; padding-top: 100%; overflow: hidden; background: linear-gradient(180deg, #f4f4f4 0%, #ededed 100%); }
    .product-image { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
    .content { display: flex; flex-direction: column; gap: 0.85rem; padding: 1rem; }
    .category { color: #7d7d7d; font-size: 0.78rem; letter-spacing: 0.12em; text-transform: uppercase; }
    .title { margin: 0; font-size: 1rem; line-height: 1.3; color: #111; }
    .price { margin: 0; font-size: 1.05rem; font-weight: 700; color: #111; }
    .actions { display: grid; gap: 0.7rem; grid-template-columns: 1fr 1fr; }
    .button { border: 1px solid transparent; border-radius: 999px; padding: 0.75rem 0.95rem; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
    .view-button { background: #111; color: #fff; border-color: #111; }
    .view-button:hover { background: #222; }
    .add-button { background: #fff; color: #111; border-color: #dcdcdc; }
    .add-button:hover { background: #f8f8f8; }
    @media (max-width: 640px) {
      .card { border-radius: 16px; }
      .actions { grid-template-columns: 1fr; }
      .content { padding: 0.95rem; }
    }
  </style>
  <article class="card" part="card">
    <div class="image-shell">
      <img class="product-image" src="" alt="" />
    </div>
    <div class="content">
      <span class="category"></span>
      <h2 class="title"></h2>
      <p class="price"></p>
      <div class="actions">
        <button class="button view-button" type="button">View Product</button>
        <button class="button add-button" type="button">Add To Cart</button>
      </div>
    </div>
  </article>
`;

class ProductCard extends HTMLElement {
  static get observedAttributes() {
    return ['product-id', 'name', 'price', 'image', 'category'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(PRODUCT_CARD_TEMPLATE.content.cloneNode(true));
    this.imageEl = this.shadowRoot.querySelector('.product-image');
    this.categoryEl = this.shadowRoot.querySelector('.category');
    this.titleEl = this.shadowRoot.querySelector('.title');
    this.priceEl = this.shadowRoot.querySelector('.price');
    this.handleActionClick = this.handleActionClick.bind(this);
  }

  connectedCallback() {
    this.render();
    this.shadowRoot.addEventListener('click', this.handleActionClick);
  }

  disconnectedCallback() {
    this.shadowRoot.removeEventListener('click', this.handleActionClick);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    switch (name) {
      case 'image':
        this.updateImage(newValue);
        break;
      case 'name':
        this.updateTitle(newValue);
        break;
      case 'price':
        this.updatePrice(newValue);
        break;
      case 'category':
        this.updateCategory(newValue);
        break;
      case 'product-id':
        // product-id is used by events; no DOM refresh required.
        break;
    }
  }

  get productId() {
    return this.getAttribute('product-id') || null;
  }

  render() {
    this.updateImage(this.getAttribute('image'));
    this.updateTitle(this.getAttribute('name'));
    this.updatePrice(this.getAttribute('price'));
    this.updateCategory(this.getAttribute('category'));
  }

  handleActionClick(event) {
    const viewButton = event.target.closest('.view-button');
    const addButton = event.target.closest('.add-button');

    if (viewButton) {
      this.dispatchEvent(new CustomEvent('view-product', {
        detail: { productId: this.productId },
        bubbles: true,
        composed: true
      }));
      return;
    }

    if (addButton) {
      this.dispatchEvent(new CustomEvent('add-cart', {
        detail: { productId: this.productId },
        bubbles: true,
        composed: true
      }));
    }
  }

  updateImage(value) {
    const imageSrc = value ? value.trim() : '';
    this.imageEl.src = imageSrc;
    this.imageEl.alt = this.getAttribute('name') ? this.getAttribute('name').trim() : 'Product image';
  }

  updateTitle(value) {
    this.titleEl.textContent = value ? value.trim() : 'Untitled product';
  }

  updateCategory(value) {
    this.categoryEl.textContent = value ? value.trim() : '';
    this.categoryEl.style.display = value ? 'inline-block' : 'none';
  }

  updatePrice(value) {
    this.priceEl.textContent = value ? value.trim() : '$0.00';
  }
}

customElements.define('product-card', ProductCard);
