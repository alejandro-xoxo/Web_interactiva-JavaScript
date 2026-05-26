const STORAGE_KEYS = Object.freeze({
  categories: 'aethon_categories',
  products: 'aethon_products',
  orders: 'aethon_orders',
  cart: 'aethon_cart',
  session: 'aethon_session'
});

const DEFAULT_CATEGORIES = [
  { id: 'streetwear', name: 'Streetwear', description: 'Urban silhouettes for daily wear with premium detailing.' },
  { id: 'utility', name: 'Utility', description: 'Technical pieces designed for function, durability and layered styling.' },
  { id: 'outerwear', name: 'Outerwear', description: 'Protective layers with modern structure and sharp tailoring.' },
  { id: 'tops', name: 'Tops', description: 'Statement tees, hoodies and shirts with refined comfort.' },
  { id: 'bottoms', name: 'Bottoms', description: 'Cargo pants, skirts and trousers built for movement.' },
  { id: 'accessories', name: 'Accesorios', description: 'Minimal hardware, hats and small goods for every look.' },
  { id: 'footwear', name: 'Footwear', description: 'Performance-inspired sneakers and boots with bold silhouettes.' },
  { id: 'limited', name: 'Limited Edition', description: 'Curated capsule pieces produced in small runs for collectors.' }
];

const DEFAULT_PRODUCTS = [
  { id: 'AET-001', name: 'Chaos Zip Hoodie', categoryId: 'tops', category: 'Tops', price: 89.0, image: 'img/product-01.jpg', sku: 'AET-001', description: 'Oversized hoodie with matte zip closure and utility pocket details.' },
  { id: 'AET-002', name: 'Aethon Cargo Jeans', categoryId: 'bottoms', category: 'Bottoms', price: 109.0, image: 'img/product-02.jpg', sku: 'AET-002', description: 'Rugged cargo denim with articulated knees and tonal hardware.' },
  { id: 'AET-003', name: 'Shadow Oversize Tee', categoryId: 'tops', category: 'Tops', price: 49.0, image: 'img/product-03.jpg', sku: 'AET-003', description: 'Soft cotton tee with a dropped shoulder and minimal branding.' },
  { id: 'AET-004', name: 'Aethon Jacket', categoryId: 'outerwear', category: 'Outerwear', price: 129.0, image: 'img/product-04.jpg', sku: 'AET-004', description: 'Lightweight technical jacket with weather-resistant finish.' },
  { id: 'AET-005', name: 'Void Hoodie', categoryId: 'tops', category: 'Tops', price: 95.0, image: 'img/product-05.jpg', sku: 'AET-005', description: 'Clean pullover hoodie with structured hood and cargo-style pocket.' },
  { id: 'AET-006', name: 'Abyss Tee', categoryId: 'tops', category: 'Tops', price: 45.0, image: 'img/product-06.jpg', sku: 'AET-006', description: 'Premium jersey tee with a bold back graphic and relaxed fit.' },
  { id: 'AET-007', name: 'Phantom Cargo Pants', categoryId: 'bottoms', category: 'Bottoms', price: 119.0, image: 'img/product-07.jpg', sku: 'AET-007', description: 'Utility cargo pants with adjustable hem and concealed pocketing.' },
  { id: 'AET-008', name: 'Aethon Cap', categoryId: 'accessories', category: 'Accesorios', price: 35.0, image: 'img/product-08.jpg', sku: 'AET-008', description: 'Structured cap with tonal embroidery and breathable mesh panels.' },
  { id: 'AET-009', name: 'Setdow Oversize Tee', categoryId: 'tops', category: 'Tops', price: 49.0, image: 'img/product-09.jpg', sku: 'AET-009', description: 'Heavyweight cotton tee with elongated hem and dropped sleeves.' },
  { id: 'AET-010', name: 'Terrain Utility Vest', categoryId: 'utility', category: 'Utility', price: 135.0, image: 'img/product-01.jpg', sku: 'AET-010', description: 'Multi-pocket utility vest built for layering and city exploration.' },
  { id: 'AET-011', name: 'Nomad Track Pants', categoryId: 'bottoms', category: 'Bottoms', price: 84.0, image: 'img/product-02.jpg', sku: 'AET-011', description: 'Relaxed track pants with ripstop panels and tapered cuff.' },
  { id: 'AET-012', name: 'Eclipse Anorak', categoryId: 'outerwear', category: 'Outerwear', price: 159.0, image: 'img/product-03.jpg', sku: 'AET-012', description: 'Half-zip anorak with hidden zip pockets and adjustable hood.' },
  { id: 'AET-013', name: 'Helix Windbreaker', categoryId: 'outerwear', category: 'Outerwear', price: 112.0, image: 'img/product-04.jpg', sku: 'AET-013', description: 'Light windbreaker with reflective trims and mesh lining.' },
  { id: 'AET-014', name: 'Strata Leather Belt', categoryId: 'accessories', category: 'Accesorios', price: 59.0, image: 'img/product-05.jpg', sku: 'AET-014', description: 'Minimal leather belt with brushed metal buckle and tonal finish.' },
  { id: 'AET-015', name: 'Shadow Runner Sneakers', categoryId: 'footwear', category: 'Footwear', price: 139.0, image: 'img/product-06.jpg', sku: 'AET-015', description: 'Low-profile sneakers with grippy rubber sole and padded collar.' },
  { id: 'AET-016', name: 'Pulse Knit Beanie', categoryId: 'accessories', category: 'Accesorios', price: 28.0, image: 'img/product-07.jpg', sku: 'AET-016', description: 'Soft knit beanie with high-stretch ribbed edge and tonal label.' },
  { id: 'AET-017', name: 'Atlas Work Shirt', categoryId: 'utility', category: 'Utility', price: 92.0, image: 'img/product-08.jpg', sku: 'AET-017', description: 'Engineered work shirt with reinforced seams and chest utility pockets.' },
  { id: 'AET-018', name: 'Flux Cargo Skirt', categoryId: 'bottoms', category: 'Bottoms', price: 88.0, image: 'img/product-09.jpg', sku: 'AET-018', description: 'Contemporary cargo skirt with asymmetric paneling and snap details.' },
  { id: 'AET-019', name: 'Arc Mesh Tank', categoryId: 'tops', category: 'Tops', price: 39.0, image: 'img/product-01.jpg', sku: 'AET-019', description: 'Light mesh tank with contrast binding and breathable fit.' },
  { id: 'AET-020', name: 'Titan Field Boots', categoryId: 'footwear', category: 'Footwear', price: 169.0, image: 'img/product-02.jpg', sku: 'AET-020', description: 'Rugged field boots with lug sole and waterproof finish.' }
];

class StorageManager {
  constructor(storage = typeof window !== 'undefined' ? window.localStorage : null) {
    if (!storage || typeof storage.getItem !== 'function' || typeof storage.setItem !== 'function') {
      throw new Error('StorageManager requires window.localStorage.');
    }
    this.storage = storage;
  }

  getCategories() {
    return this._get(STORAGE_KEYS.categories, []);
  }

  saveCategories(categories) {
    this._validateArray(categories, 'categories');
    this._save(STORAGE_KEYS.categories, categories);
  }

  getProducts() {
    return this._get(STORAGE_KEYS.products, []);
  }

  saveProducts(products) {
    this._validateArray(products, 'products');
    this._save(STORAGE_KEYS.products, products);
  }

  getOrders() {
    return this._get(STORAGE_KEYS.orders, []);
  }

  saveOrders(orders) {
    this._validateArray(orders, 'orders');
    this._save(STORAGE_KEYS.orders, orders);
  }

  getCart() {
    return this._get(STORAGE_KEYS.cart, []);
  }

  saveCart(cart) {
    this._validateArray(cart, 'cart');
    this._save(STORAGE_KEYS.cart, cart);
  }

  getSession() {
    return this._get(STORAGE_KEYS.session, null);
  }

  saveSession(session) {
    this._save(STORAGE_KEYS.session, session ?? {});
  }

  clearSession() {
    this.storage.removeItem(STORAGE_KEYS.session);
  }

  seedData({ force = false } = {}) {
    const hasCategories = this.getCategories().length > 0;
    const hasProducts = this.getProducts().length > 0;

    if (!force && hasCategories && hasProducts) {
      return { categories: this.getCategories(), products: this.getProducts() };
    }

    this.saveCategories(DEFAULT_CATEGORIES);
    this.saveProducts(DEFAULT_PRODUCTS);

    if (force) {
      this.saveOrders([]);
      this.saveCart([]);
      this.saveSession(null);
    }

    return {
      categories: this.getCategories(),
      products: this.getProducts()
    };
  }

  _get(key, fallback) {
    const raw = this.storage.getItem(key);
    if (raw === null || raw === undefined) {
      return fallback;
    }
    return this._parseJSON(raw, fallback);
  }

  _save(key, value) {
    this.storage.setItem(key, JSON.stringify(value));
  }

  _parseJSON(value, fallback) {
    try {
      return JSON.parse(value);
    } catch (error) {
      console.warn(`StorageManager failed to parse key ${value}`);
      return fallback;
    }
  }

  _validateArray(value, name) {
    if (!Array.isArray(value)) {
      throw new TypeError(`${name} must be an array.`);
    }
  }
}

if (typeof window !== 'undefined') {
  window.StorageManager = StorageManager;
}
