function _getStorage() {
    if (typeof window === 'undefined' || typeof window.StorageManager !== 'function') {
        throw new Error('StorageManager is required and must be available on window.');
    }
    return new window.StorageManager(window.localStorage);
}

const storage = _getStorage();
const productModal = document.getElementById('product-modal');
const productForm = document.getElementById('product-form');
const productsTableBody = document.querySelector('#products-table tbody');
const addProductButton = document.getElementById('btn-open-product-modal');
const modalCloseButton = document.getElementById('product-modal-close');
const categorySelect = document.getElementById('product-category');
const modalTitle = document.getElementById('product-modal-title');

function _formatPrice(value) {
    return Number(value).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
}

function _getCategories() {
    return storage.getCategories() || [];
}

function _getProductValues() {
    return {
        codigo: productForm.codigo.value.trim(),
        nombre: productForm.nombre.value.trim(),
        id_categoria: productForm.id_categoria.value.trim(),
        precio: Number(productForm.precio.value) || 0,
        url_imagen: productForm.url_imagen.value.trim(),
        descripcion: productForm.descripcion.value.trim()
    };
}

function _resetForm() {
    productForm.reset();
    delete productForm.dataset.editing;
}

function _openModal(product = null) {
    if (!productModal) return;

    if (product) {
        modalTitle.textContent = 'Editar Producto';
        productForm.codigo.value = product.codigo;
        productForm.nombre.value = product.nombre;
        productForm.id_categoria.value = product.id_categoria;
        productForm.precio.value = product.precio;
        productForm.url_imagen.value = product.url_imagen;
        productForm.descripcion.value = product.descripcion;
        productForm.dataset.editing = product.codigo;
    } else {
        modalTitle.textContent = 'Agregar Producto';
        _resetForm();
    }

    if (typeof productModal.showModal === 'function') {
        productModal.showModal();
    } else {
        productModal.setAttribute('open', '');
    }
}

function _closeModal() {
    if (!productModal) return;
    if (typeof productModal.close === 'function') {
        productModal.close();
    } else {
        productModal.removeAttribute('open');
    }
    _resetForm();
}

function _renderProducts() {
    if (!productsTableBody) return;

    const products = storage.getProducts();
    const categories = _getCategories();
    const categoryMap = categories.reduce((map, category) => {
        map[category.id] = category.name || category.id;
        return map;
    }, {});

    productsTableBody.innerHTML = '';

    if (!Array.isArray(products) || products.length === 0) {
        productsTableBody.innerHTML = '<tr><td colspan="6">No hay productos registrados.</td></tr>';
        return;
    }

    products.forEach(product => {
        const row = document.createElement('tr');
        row.dataset.codigo = product.codigo;

        row.innerHTML = `
            <td>${product.codigo}</td>
            <td>${product.nombre}</td>
            <td>${categoryMap[product.id_categoria] || product.id_categoria}</td>
            <td>${_formatPrice(product.precio)}</td>
            <td><a href="${product.url_imagen}" target="_blank" rel="noopener">Ver imagen</a></td>
            <td>
                <button type="button" class="btn btn--sm btn--outline btn-edit-product" data-codigo="${product.codigo}">Editar</button>
                <button type="button" class="btn btn--sm btn--danger btn-delete-product" data-codigo="${product.codigo}">Eliminar</button>
            </td>
        `;

        productsTableBody.appendChild(row);
    });
}

function _populateCategoryOptions() {
    if (!categorySelect) return;

    const categories = _getCategories();
    categorySelect.innerHTML = '<option value="">Selecciona una categoría</option>';

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name || category.id;
        categorySelect.appendChild(option);
    });
}

function _handleFormSubmit(event) {
    event.preventDefault();

    try {
        const product = _getProductValues();
        if (!product.codigo || !product.nombre || !product.id_categoria || !product.url_imagen || !product.descripcion) {
            alert('Completa todos los campos antes de guardar.');
            return;
        }

        const originalCodigo = productForm.dataset.editing;
        const isEditing = Boolean(originalCodigo);

        storage.saveProduct(product);
        if (isEditing && originalCodigo && originalCodigo !== product.codigo) {
            storage.deleteProduct(originalCodigo);
        }

        _renderProducts();
        _closeModal();

        alert(isEditing ? 'Producto actualizado con éxito.' : 'Producto creado con éxito.');
    } catch (error) {
        alert(error.message || 'No se pudo guardar el producto.');
    }
}

function _handleTableClick(event) {
    const editButton = event.target.closest('.btn-edit-product');
    const deleteButton = event.target.closest('.btn-delete-product');

    if (editButton) {
        const codigo = editButton.dataset.codigo;
        const products = storage.getProducts();
        const product = products.find(item => item.codigo === codigo);
        if (product) {
            _openModal(product);
        }
        return;
    }

    if (deleteButton) {
        const codigo = deleteButton.dataset.codigo;
        if (!codigo) return;

        const confirmed = confirm('¿Seguro que deseas eliminar este producto?');
        if (!confirmed) return;

        storage.deleteProduct(codigo);
        _renderProducts();
        alert('Producto eliminado correctamente.');
    }
}

function initAdminProducts() {
    if (!productModal || !productForm || !productsTableBody || !addProductButton) {
        return;
    }

    _populateCategoryOptions();
    _renderProducts();

    addProductButton.addEventListener('click', () => _openModal());
    modalCloseButton.addEventListener('click', _closeModal);
    productForm.addEventListener('submit', _handleFormSubmit);
    productsTableBody.addEventListener('click', _handleTableClick);

    productModal.addEventListener('cancel', event => {
        event.preventDefault();
        _closeModal();
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminProducts);
} else {
    initAdminProducts();
}