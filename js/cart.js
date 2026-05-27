function _getStorage() {
    if (typeof window === 'undefined' || typeof window.StorageManager !== 'function') {
        throw new Error('StorageManager is required and must be available on window.');
    }
    return new window.StorageManager(window.localStorage);
}

const storage = _getStorage();
const cartItemsContainer = document.getElementById('cart-items-container');
const emptyCartMessage = document.getElementById('empty-cart-message');
const checkoutForm = document.getElementById('checkout-form');
const orderSummaryBox = document.getElementById('order-summary-box');
const summaryItemsCount = document.getElementById('summary-items-count');
const summarySubtotalValue = document.getElementById('summary-subtotal-value');
const summaryTotalValue = document.getElementById('summary-total-value');
const checkoutSection = document.getElementById('checkout-section');

function _formatPrice(value) {
    return Number(value || 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
}

function _getCartItems() {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
        return [];
    }

    const rawCart = window.localStorage.getItem('cart');
    if (rawCart) {
        try {
            const parsed = JSON.parse(rawCart);
            if (Array.isArray(parsed)) {
                return parsed;
            }
        } catch (error) {
            console.warn('Cart parsing failed, falling back to storage wrapper.', error);
        }
    }

    const cart = storage.getCart ? storage.getCart() : [];
    return Array.isArray(cart) ? cart : [];
}

function _saveCartItems(items) {
    const normalized = Array.isArray(items) ? items : [];
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
        try {
            window.localStorage.setItem('cart', JSON.stringify(normalized));
        } catch (error) {
            console.warn('Unable to save cart to localStorage.', error);
        }
    }
    if (storage.saveCart) {
        storage.saveCart(normalized);
    }
    updateCartView();
}

function _getCartTotal(items) {
    return items.reduce((sum, item) => {
        const quantity = Number(item.quantity || item.qty || item.cantidad || 1);
        const price = Number(item.price || item.precio || 0);
        return sum + price * quantity;
    }, 0);
}

function _getCartItemKey(item) {
    const id = String(item.id || item.productId || item.codigo || '').trim();
    const size = String(item.size || '').trim();
    const color = String(item.color || '').trim();
    return `${id}::${size}::${color}`;
}

function _setCartItemQuantity(item, value) {
    const quantity = Math.max(1, Number(value || 1));
    return {
        ...item,
        quantity,
        qty: quantity,
        cantidad: quantity
    };
}

function _removeCartItem(itemKey) {
    const items = _getCartItems().filter(item => _getCartItemKey(item) !== String(itemKey));
    _saveCartItems(items);
}

function _updateCartItemQuantity(itemKey, delta) {
    const updated = _getCartItems().map(item => {
        if (_getCartItemKey(item) !== String(itemKey)) {
            return item;
        }

        const currentQuantity = Number(item.quantity || item.qty || item.cantidad || 1);
        return _setCartItemQuantity(item, currentQuantity + delta);
    });

    _saveCartItems(updated);
}

function updateCartView() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const container = document.getElementById('cart-items-container');

    if (!container) return;

    if (!Array.isArray(cart) || cart.length === 0) {
        container.innerHTML = '<p>TU CARRITO ESTÁ VACÍO</p>';
        if (summarySubtotalValue) summarySubtotalValue.textContent = '$0.00';
        if (summaryTotalValue) summaryTotalValue.textContent = '$0.00';
        if (summaryItemsCount) summaryItemsCount.textContent = '0';
        if (checkoutSection) checkoutSection.classList.add('hidden');
        if (orderSummaryBox) orderSummaryBox.classList.add('hidden');
        if (emptyCartMessage) {
            emptyCartMessage.classList.remove('hidden');
            emptyCartMessage.innerHTML = '<a href="products.html" class="btn btn--outline">EXPLORAR COLECCIÓN</a>';
        }
        return;
    }

    if (emptyCartMessage) emptyCartMessage.classList.add('hidden');
    if (checkoutSection) checkoutSection.classList.remove('hidden');
    if (orderSummaryBox) orderSummaryBox.classList.remove('hidden');

    container.innerHTML = cart.map(product => {
        const itemKey = _getCartItemKey(product);
        const img = product.url_imagen || product.image || '';
        const name = product.name || product.nombre || '';
        const price = Number(product.price || product.precio || 0);
        const qty = Number(product.quantity || product.qty || product.cantidad || 1);
        const variantText = [product.size, product.color].filter(Boolean).join(' / ');

        return `
            <div class="cart-item" data-item-key="${itemKey}">
              <div class="cart-item__image">
                <img src="${img}" alt="${name}">
              </div>
              <div class="cart-item__details">
                <h3 class="cart-item__name">${name}</h3>
                ${variantText ? `<p class="cart-item__variant">${variantText}</p>` : ''}
                <p class="cart-item__unit-price">${_formatPrice(price)}</p>
              </div>
              <div class="cart-item__quantity">
                <div class="qty-selector">
                  <button class="btn-qty-minus" type="button" data-action="decrease" data-key="${itemKey}">-</button>
                  <input class="input-qty" type="text" value="${qty}" readonly>
                  <button class="btn-qty-plus" type="button" data-action="increase" data-key="${itemKey}">+</button>
                </div>
              </div>
              <div class="cart-item__actions">
                <button class="btn-remove-item" data-action="remove" data-key="${itemKey}">Eliminar</button>
              </div>
              <div class="cart-item__subtotal">
                <span class="item-subtotal-value">${_formatPrice(price * qty)}</span>
              </div>
            </div>
        `;
    }).join('');

    const total = cart.reduce((sum, product) => {
        const quantity = Number(product.qty || product.quantity || product.cantidad || 1);
        const price = Number(product.price || product.precio || 0);
        return sum + price * quantity;
    }, 0);

    if (summarySubtotalValue) summarySubtotalValue.textContent = _formatPrice(total);
    if (summaryTotalValue) summaryTotalValue.textContent = _formatPrice(total);
    if (summaryItemsCount) summaryItemsCount.textContent = String(cart.reduce((sum, item) => sum + Number(item.qty || item.quantity || item.cantidad || 1), 0));
}

function _renderSummary(items) {
    const total = _getCartTotal(items);
    const count = items.reduce((sum, item) => sum + Number(item.qty || item.quantity || item.cantidad || 1), 0);

    if (summaryItemsCount) summaryItemsCount.textContent = String(count);
    if (summarySubtotalValue) summarySubtotalValue.textContent = _formatPrice(total);
    if (summaryTotalValue) summaryTotalValue.textContent = _formatPrice(total);
}

function _handleCartItemAction(event) {
    const button = event.target.closest('button[data-action][data-key]');
    if (!button || !cartItemsContainer.contains(button)) {
        return;
    }

    const itemKey = button.dataset.key;
    const action = button.dataset.action;
    if (!itemKey || !action) {
        return;
    }

    if (action === 'remove') {
        _removeCartItem(itemKey);
        updateCartView();
        return;
    }

    if (action === 'decrease') {
        _updateCartItemQuantity(itemKey, -1);
        updateCartView();
        return;
    }

    if (action === 'increase') {
        _updateCartItemQuantity(itemKey, 1);
        updateCartView();
    }
}

function _getOrderPayload() {
    const formData = new FormData(checkoutForm);
    return {
        customer: {
            idNumber: String(formData.get('idNumber') || '').trim(),
            name: String(formData.get('name') || '').trim(),
            address: String(formData.get('address') || '').trim(),
            phone: String(formData.get('phone') || '').trim(),
            email: String(formData.get('email') || '').trim()
        },
        items: _getCartItems().map(item => {
            const quantity = Number(item.qty || item.quantity || 1);
            const price = Number(item.price || 0);
            return {
                productId: item.productId || item.id || '',
                name: item.name || '',
                price,
                quantity,
                subtotal: price * quantity,
                image: item.image || ''
            };
        }),
        total: _getCartTotal(_getCartItems()),
        createdAt: new Date().toISOString(),
        created: new Date()
    };
}

function _validateOrder(order) {
    const customer = order.customer || {};
    if (!customer.idNumber || !customer.name || !customer.address || !customer.phone || !customer.email) {
        return false;
    }
    if (!order.items || !order.items.length) {
        return false;
    }
    return true;
}

function _handleCheckoutSubmit(event) {
    event.preventDefault();

    const cartItems = _getCartItems();
    if (!cartItems.length) {
        alert('El carrito está vacío. Agrega productos antes de pagar.');
        return;
    }

    const formData = new FormData(checkoutForm);
    const cliente = {
        id: String(formData.get('idNumber') || '').trim(),
        nombre: String(formData.get('name') || '').trim(),
        direccion: String(formData.get('address') || '').trim(),
        telefono: String(formData.get('phone') || '').trim(),
        email: String(formData.get('email') || '').trim()
    };

    if (!cliente.id || !cliente.nombre || !cliente.direccion || !cliente.telefono || !cliente.email) {
        alert('Completa todos los datos del formulario antes de generar el pedido.');
        return;
    }

    const total = _getCartTotal(cartItems);
    const nuevoPedido = {
        id_pedido: `PED-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
        fecha: new Date().toISOString(),
        cliente,
        productos: cartItems.map(item => ({ ...item })),
        total
    };

    let orders = [];
    try {
        const rawOrders = window.localStorage.getItem('orders');
        if (rawOrders) {
            const parsedOrders = JSON.parse(rawOrders);
            if (Array.isArray(parsedOrders)) {
                orders = parsedOrders;
            }
        }
    } catch (error) {
        console.warn('Error leyendo orders desde localStorage', error);
    }

    orders.push(nuevoPedido);

    try {
        window.localStorage.setItem('orders', JSON.stringify(orders));
    } catch (error) {
        console.error('No se pudo guardar el pedido en localStorage.', error);
        alert('No se pudo almacenar el pedido. Intenta de nuevo.');
        return;
    }

    _saveCartItems([]);
    alert('Pedido generado');
    window.location.href = '../index.html';
}

function initCartPage() {
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', _handleCheckoutSubmit);
    }
    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', _handleCartItemAction);
    }
    updateCartView();
}

if (typeof window !== 'undefined') {
    window.addEventListener('storage', updateCartView);
    window.addEventListener('cart-updated', updateCartView);
}

updateCartView();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCartPage);
} else {
    initCartPage();
}