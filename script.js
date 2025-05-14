document.addEventListener('DOMContentLoaded', function() {
    // 1. Sistema de Carrito de Compras
    const cart = {
        items: [],
        total: 0,
        addItem: function(product) {
            const existingItem = this.items.find(item => item.id === product.id);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                this.items.push({...product, quantity: 1});
            }
            this.updateTotal();
            this.updateCartUI();
            this.showToast(`${product.name} agregado al carrito`);
        },
        removeItem: function(productId) {
            this.items = this.items.filter(item => item.id !== productId);
            this.updateTotal();
            this.updateCartUI();
            this.showToast('Producto eliminado del carrito');
        },
        updateTotal: function() {
            this.total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        },
        updateCartUI: function() {
            const cartCount = document.querySelector('.badge.bg-danger');
            if (cartCount) {
                const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
                cartCount.textContent = totalItems;
                
                // Mostrar u ocultar badge según items
                totalItems > 0 ? cartCount.style.display = 'block' : cartCount.style.display = 'none';
            }
        },
        showCartModal: function() {
            // Crear modal dinámico
            const modalHTML = `
                <div class="modal fade" id="cartModal" tabindex="-1" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content bg-dark2">
                            <div class="modal-header border-purple">
                                <h5 class="modal-title">Tu Carrito (${this.items.length})</h5>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                ${this.items.length === 0 ? 
                                    '<p class="text-center py-4">Tu carrito está vacío</p>' : 
                                    this.generateCartItemsHTML()
                                }
                            </div>
                            <div class="modal-footer border-purple">
                                <div class="w-100 d-flex justify-content-between align-items-center">
                                    <h5 class="mb-0">Total: $${this.total.toFixed(2)}</h5>
                                    <button class="btn btn-purple ${this.items.length === 0 ? 'disabled' : ''}" id="checkoutBtn">
                                        Finalizar Compra
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Insertar modal en el DOM
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            
            // Mostrar modal
            const cartModal = new bootstrap.Modal(document.getElementById('cartModal'));
            cartModal.show();
            
            // Eventos para el modal
            document.getElementById('cartModal').addEventListener('hidden.bs.modal', function() {
                this.remove();
            });
            
            // Evento para botón de checkout
            if (this.items.length > 0) {
                document.getElementById('checkoutBtn').addEventListener('click', () => {
                    this.showToast('Compra finalizada. ¡Gracias por tu pedido!');
                    this.items = [];
                    this.total = 0;
                    this.updateCartUI();
                    cartModal.hide();
                });
            }
        },
        generateCartItemsHTML: function() {
            return this.items.map(item => `
                <div class="cart-item mb-3 p-3 bg-dark3 rounded">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="d-flex align-items-center">
                            <img src="${item.image}" alt="${item.name}" class="rounded me-3" width="60" height="60" style="object-fit: cover;">
                            <div>
                                <h6 class="mb-1">${item.name}</h6>
                                <small class="text-muted">$${item.price.toFixed(2)} x ${item.quantity}</small>
                            </div>
                        </div>
                        <div class="d-flex align-items-center">
                            <span class="me-3">$${(item.price * item.quantity).toFixed(2)}</span>
                            <button class="btn btn-sm btn-outline-danger remove-item" data-id="${item.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        },
        showToast: function(message) {
            const toast = document.createElement('div');
            toast.className = 'position-fixed bottom-0 end-0 p-3';
            toast.style.zIndex = '11';
            
            const toastInner = document.createElement('div');
            toastInner.className = 'toast show bg-dark3 border-purple';
            toastInner.setAttribute('role', 'alert');
            toastInner.setAttribute('aria-live', 'assertive');
            toastInner.setAttribute('aria-atomic', 'true');
            
            toastInner.innerHTML = `
                <div class="toast-header bg-purple text-white">
                    <strong class="me-auto">TechNova</strong>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
                <div class="toast-body">
                    ${message}
                </div>
            `;
            
            toast.appendChild(toastInner);
            document.body.appendChild(toast);
            
            // Eliminar el toast después de 3 segundos
            setTimeout(() => {
                toast.remove();
            }, 3000);
        }
    };

    // 2. Inicializar productos desde el HTML
    function initializeProducts() {
        const productCards = document.querySelectorAll('.product-card');
        
        productCards.forEach(card => {
            const product = {
                id: card.querySelector('.card-title').textContent.trim().toLowerCase().replace(/\s+/g, '-'),
                name: card.querySelector('.card-title').textContent.trim(),
                price: parseFloat(card.querySelector('.text-purple').textContent.replace('$', '')),
                image: card.querySelector('.card-img-top').src
            };
            
            // Agregar evento al botón "Agregar al carrito"
            const addButton = card.querySelector('.btn-purple');
            addButton.addEventListener('click', function(e) {
                e.preventDefault();
                cart.addItem(product);
            });
        });
    }

    // 3. Evento para el icono del carrito
    const cartIcon = document.querySelector('.fa-shopping-cart').closest('a');
    if (cartIcon) {
        cartIcon.addEventListener('click', function(e) {
            e.preventDefault();
            cart.showCartModal();
        });
    }

    // 4. Delegación de eventos para eliminar items del carrito
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-item') || e.target.closest('.remove-item')) {
            const productId = e.target.dataset.id || e.target.closest('.remove-item').dataset.id;
            cart.removeItem(productId);
        }
    });

    // 5. Mejorar el buscador con sugerencias
    const searchInput = document.querySelector('input[type="search"]');
    if (searchInput) {
        const products = [
            "Laptop Gaming Pro", 
            "Workstation Elite", 
            "Ultrabook Slim", 
            "PC Gamer RGB", 
            "MacBook Pro", 
            "Surface Laptop"
        ];
        
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            if (searchTerm.length > 1) {
                const suggestions = products.filter(product => 
                    product.toLowerCase().includes(searchTerm)
                );
                
                // Mostrar sugerencias (podría mejorarse con un dropdown)
                if (suggestions.length > 0) {
                    console.log('Sugerencias:', suggestions.join(', '));
                    // Aquí podrías implementar un dropdown con las sugerencias
                }
            }
        });
        
        searchInput.addEventListener('focus', function() {
            this.placeholder = 'Ej: Laptop, Gaming, Workstation...';
        });
        
        searchInput.addEventListener('blur', function() {
            this.placeholder = 'Buscar productos...';
        });
    }

    // 6. Efectos de hover mejorados para las cards
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.3)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
        });
    });

    // 7. Inicializar productos
    initializeProducts();
});