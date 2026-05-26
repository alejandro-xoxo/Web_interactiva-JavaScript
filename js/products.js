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

function searchProducts(query = '', pool = null) {
	const q = String(query || '').trim().toLowerCase();
	const products = Array.isArray(pool) ? pool : storage.getProducts();
	if (!q) return products.slice();
	return products.filter(p => {
		return [p.name, p.description, p.sku, p.category, p.categoryId, p.id]
			.filter(Boolean)
			.some(field => String(field).toLowerCase().includes(q));
	});
}

function filterProducts(filters = {}, pool = null) {
	const products = Array.isArray(pool) ? pool : storage.getProducts();
	return products.filter(p => {
		if (filters.category && (p.categoryId !== filters.category && p.category !== filters.category)) return false;
		if (filters.minPrice !== undefined && Number(p.price) < Number(filters.minPrice)) return false;
		if (filters.maxPrice !== undefined && Number(p.price) > Number(filters.maxPrice)) return false;
		if (filters.ids && Array.isArray(filters.ids) && filters.ids.length) {
			if (!filters.ids.includes(p.id)) return false;
		}
		if (filters.featured !== undefined && Boolean(p.featured) !== Boolean(filters.featured)) return false;
		return true;
	});
}

function sortProducts(key = 'destacados', pool = null) {
	const products = Array.isArray(pool) ? pool.slice() : storage.getProducts().slice();
	switch (key) {
		case 'precio-asc':
			return products.sort((a, b) => Number(a.price) - Number(b.price));
		case 'precio-desc':
			return products.sort((a, b) => Number(b.price) - Number(a.price));
		case 'nuevos':
			return products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
		case 'destacados':
		default:
			// featured first, then by createdAt desc
			return products.sort((a, b) => {
				const fa = a.featured ? 1 : 0;
				const fb = b.featured ? 1 : 0;
				if (fa !== fb) return fb - fa; // featured true first
				return new Date(b.createdAt) - new Date(a.createdAt);
			});
	}
}

function _createProductCardEl(product) {
	const el = document.createElement('product-card');
	el.setAttribute('product-id', product.id);
	el.setAttribute('name', product.name || 'Untitled');
	el.setAttribute('price', _formatPrice(product.price));
	el.setAttribute('image', product.image || '../img/product-01.jpg');
	el.setAttribute('category', product.category || '');
	return el;
}

function renderProducts(options = {}) {
	const {
		target = null,
		mode = 'catalog', // 'featured' | 'catalog' | 'related'
		products: pool = null,
		query = '',
		filters = {},
		sort = 'destacados',
		limit = 0,
		relatedToId = null
	} = options;

	const defaultTargets = {
		featured: '#featured-products-grid',
		catalog: '#products-grid',
		related: '#related-products-grid'
	};

	const container = typeof target === 'string' ? document.querySelector(target) : target || document.querySelector(defaultTargets[mode] || '#products-grid');
	if (!container) return { rendered: 0, results: [] };

	let products = Array.isArray(pool) ? pool.slice() : storage.getProducts().slice();

	if (mode === 'featured') {
		filters.featured = true;
	}

	if (mode === 'related' && relatedToId) {
		const base = getProductById(relatedToId);
		if (base) {
			const catKey = base.categoryId || base.category;
			products = products.filter(p => p.id !== relatedToId && (p.categoryId === catKey || p.category === catKey));
		}
	}

	if (query) products = searchProducts(query, products);
	if (filters && Object.keys(filters).length) products = filterProducts(filters, products);
	if (sort) products = sortProducts(sort, products);

	if (limit && Number(limit) > 0) products = products.slice(0, Number(limit));

	// Clear container and render
	container.innerHTML = '';
	products.forEach(p => {
		const card = _createProductCardEl(p);
		container.appendChild(card);
	});

	// Update results count if present
	const resultsEl = document.querySelector('.results-count');
	if (resultsEl) resultsEl.textContent = `${products.length} resultados encontrados`;

	return { rendered: products.length, results: products };
}

// UI initialization helper. Call from app bootstrap.
function initProductsUI({ mode = 'catalog', searchInputSelector = '#search-input', sortSelectSelector = '#sort-filter', defaultRender = true } = {}) {
	if (defaultRender) {
		renderProducts({ mode });
	}

	const searchInput = document.querySelector(searchInputSelector);
	const sortSelect = document.querySelector(sortSelectSelector);

	if (searchInput) {
		let timer = null;
		searchInput.addEventListener('input', (e) => {
			clearTimeout(timer);
			timer = setTimeout(() => {
				renderProducts({ mode: 'catalog', query: e.target.value, sort: sortSelect ? sortSelect.value : 'destacados' });
			}, 250);
		});
	}

	if (sortSelect) {
		sortSelect.addEventListener('change', (e) => {
			renderProducts({ mode: 'catalog', query: searchInput ? searchInput.value : '', sort: e.target.value });
		});
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

export { createProduct, updateProduct, deleteProduct, getProductById, renderProducts, searchProducts, filterProducts, sortProducts };

