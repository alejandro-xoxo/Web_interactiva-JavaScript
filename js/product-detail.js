(function () {
  'use strict';

  function _formatPrice(value) {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(Number(value || 0));
  }

  function _resolveImagePath(img) {
    if (!img) return '';
    if (img.startsWith('img/') || img.startsWith('/img/')) {
      return img.startsWith('/') ? `..${img}` : `../${img}`;
    }
    return img;
  }

  function _getProducts() {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return [];
    }
    try {
      const raw = window.localStorage.getItem('aethon_products');
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn('Unable to parse products from localStorage', error);
      return [];
    }
  }

  function _saveCart(cart) {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return;
    }
    try {
      window.localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cart-updated'));
    } catch (error) {
      console.warn('Unable to save cart to localStorage', error);
    }
  }

  function _addToCart(product) {
    if (!product || !product.id) return;

    const id = String(product.id).trim();
    const selectedSize = String(product.selectedSize || product.size || '').trim();
    const selectedColor = String(product.selectedColor || product.color || '').trim();

    let cart = [];
    try {
      cart = JSON.parse(window.localStorage.getItem('cart')) || [];
    } catch (error) {
      cart = [];
    }

    const existing = cart.find(item => {
      return (
        String(item.id) === id &&
        String(item.size || '') === selectedSize &&
        String(item.color || '') === selectedColor
      );
    });

    if (existing) {
      existing.quantity = Number(existing.quantity || 1) + 1;
    } else {
      cart.push({
        id,
        name: product.name || product.nombre || '',
        price: Number(product.price || product.precio || 0),
        image: product.image || product.url_imagen || '',
        size: selectedSize,
        color: selectedColor,
        quantity: 1
      });
    }

    _saveCart(cart);
  }

  function _buildAttributeButtons(type, values = []) {
    return values
      .map(value => `<button type="button" class="attr-btn" data-type="${type}" data-value="${value}">${value}</button>`)
      .join('');
  }

  function initProductDetail() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const container = document.getElementById('product-detail-container');
    if (!container || !id) {
      window.location.href = 'products.html';
      return;
    }

    const products = _getProducts();
    const product = products.find(p => String(p.id) === String(id));
    if (!product) {
      window.location.href = 'products.html';
      return;
    }

    let selectedSize = '';
    let selectedColor = '';
    const imageSrc = _resolveImagePath(product.image || product.url_imagen || '');
    const price = _formatPrice(product.price || product.precio || 0);
    const sizes = Array.isArray(product.sizes) ? product.sizes : [];
    const colors = Array.isArray(product.colors) ? product.colors : [];

    // Populate existing template areas if present, else render a simple structure
    const nameEl = document.getElementById('product-name') || document.getElementById('product-title');
    const priceEl = document.getElementById('product-price') || container.querySelector('.price') || document.getElementById('product-price');
    const descEl = document.getElementById('product-desc') || document.getElementById('product-description');
    const imageEl = document.getElementById('product-image') || document.getElementById('main-product-image');

    // If the page already contains placeholders, fill them. Otherwise, inject a compact structure.
    if (imageEl) {
      // If imageEl is a container, set its innerHTML to the image
      if (imageEl.tagName.toLowerCase() === 'div') {
        imageEl.innerHTML = `<img id="main-product-image" src="${imageSrc}" alt="${product.name || product.nombre || 'Producto'}">`;
      } else if (imageEl.tagName.toLowerCase() === 'img') {
        imageEl.src = imageSrc;
        imageEl.alt = product.name || product.nombre || 'Producto';
      }
    }

    if (nameEl) nameEl.textContent = product.name || product.nombre || '';
    if (priceEl) priceEl.textContent = price;
    if (descEl) descEl.innerHTML = product.description || product.descripcion || '';

    // Render selectors
    const sizeContainer = document.getElementById('size-selector') || container.querySelector('.sizes') || null;
    const colorContainer = document.getElementById('color-selector') || container.querySelector('.colors') || null;

    if (sizeContainer) sizeContainer.innerHTML = _buildAttributeButtons('size', sizes);
    if (colorContainer) colorContainer.innerHTML = _buildAttributeButtons('color', colors);

    container.addEventListener('click', event => {
      const button = event.target.closest('.attr-btn');
      if (!button) return;

      const type = button.dataset.type;
      const value = button.dataset.value;
      if (!type || !value) return;

      const group = container.querySelectorAll(`.attr-btn[data-type="${type}"]`);
      group.forEach(btn => btn.classList.remove('selected'));
      button.classList.add('selected');

      if (type === 'size') {
        selectedSize = value;
      }
      if (type === 'color') {
        selectedColor = value;
      }
    });

    const addBtn = document.getElementById('add-to-cart-btn') || document.getElementById('btn-add-to-cart');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        if (!selectedSize || !selectedColor) {
          alert('SELECCIONE TALLA Y COLOR');
          return;
        }

        // Minimal cart item shape as requested
        const item = {
          id: product.id,
          name: product.name || product.nombre || '',
          price: Number(product.price || product.precio || 0),
          selectedSize,
          selectedColor
        };

        // Read existing cart array from localStorage (key: 'cart')
        let cart = [];
        try {
          cart = JSON.parse(window.localStorage.getItem('cart')) || [];
        } catch (err) {
          cart = [];
        }

        cart.push(item);
        try {
          window.localStorage.setItem('cart', JSON.stringify(cart));
          window.dispatchEvent(new Event('cart-updated'));
        } catch (err) {
          console.warn('Unable to save cart', err);
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProductDetail);
  } else {
    initProductDetail();
  }

})();