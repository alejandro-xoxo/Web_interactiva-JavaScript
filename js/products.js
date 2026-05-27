/* Products module (ES Module)
	 Responsibilities:
	 - CRUD for products via StorageManager
	 - Search, filter, sort utilities
	 - Render product-card components into target containers
	 - Support featured/catalog/related product lists
*/

function _getStorage() {
	if (typeof window === 'undefined' || typeof window.StorageManager !== 'function') {
		throw new Error('StorageManager is required and must be available on window.');
	}
	return new window.StorageManager(window.localStorage);
}

const storage = _getStorage();

function _formatPrice(value) {
	const n = Number(value) || 0;
	return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n);
}

function _generateId(prefix = 'AET') {
	const products = storage.getProducts();
	const nums = products
		.map(p => {
			const m = String(p.id || '').match(/(\d+)$/);
			return m ? Number(m[1]) : NaN;
		})
		.filter(n => !Number.isNaN(n));
	const next = nums.length ? Math.max(...nums) + 1 : Date.now() % 100000;
	return `${prefix}-${String(next).padStart(3, '0')}`;
}

function createProduct(data = {}) {
	if (!data || typeof data !== 'object') throw new TypeError('data must be an object');
	const products = storage.getProducts();
	const id = data.id || _generateId();
	if (products.some(p => p.id === id)) throw new Error('Product id already exists');
	const product = Object.assign({}, data, {
		id,
		price: Number(data.price) || 0,
		createdAt: new Date().toISOString(),
	});
	products.push(product);
	storage.saveProducts(products);
	return product;
}

function updateProduct(id, updates = {}) {
	if (!id) throw new TypeError('id is required');
	const products = storage.getProducts();
	const idx = products.findIndex(p => p.id === id);
	if (idx === -1) return null;
	const existing = products[idx];
	const updated = Object.assign({}, existing, updates, { updatedAt: new Date().toISOString(), price: updates.price !== undefined ? Number(updates.price) : existing.price });
	products[idx] = updated;
	storage.saveProducts(products);
	return updated;
}

function deleteProduct(id) {
	if (!id) throw new TypeError('id is required');
	let products = storage.getProducts();
	const before = products.length;
	products = products.filter(p => p.id !== id);
	if (products.length === before) return false;
	storage.saveProducts(products);
	return true;
}

function getProductById(id) {
	if (!id) return null;
	const products = storage.getProducts();
	return products.find(p => p.id === id) || null;
}

// Simplified: search/filter/sort utilities removed for minimal inventory view.

function _createProductCardEl(product) {
	const el = document.createElement('product-card');
	el.setAttribute('product-id', product.id);
	el.setAttribute('name', product.name || 'Untitled');
	el.setAttribute('price', _formatPrice(product.price));
	el.setAttribute('image', product.image || '../img/product-01.jpg');
	el.setAttribute('category', product.category || '');
	return el;
}

function renderProducts() {
	const container = document.querySelector('#products-grid');
	if (!container) return { rendered: 0, results: [] };

	const products = storage.getProducts();
	container.innerHTML = '';
	products.forEach(p => {
		const card = _createProductCardEl(p);
		container.appendChild(card);
	});

	return { rendered: products.length, results: products };
}

// UI initialization helper. Call from app bootstrap.
function initProductsUI({ defaultRender = true } = {}) {
	if (defaultRender) {
		renderProducts();
	}

	// Delegate view-product events to navigate to product-detail with id param
	document.body.addEventListener('view-product', (ev) => {
		const id = ev.detail && ev.detail.productId;
		if (!id) return;
		const inScreens = location.pathname.includes('/screens/');
		const target = inScreens ? `product-detail.html?id=${encodeURIComponent(id)}` : `screens/product-detail.html?id=${encodeURIComponent(id)}`;
		location.assign(target);
	});
}

export { initProductsUI };

export { createProduct, updateProduct, deleteProduct, getProductById, renderProducts };

