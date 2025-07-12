document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initApp();
});

function initApp() {
    // Initialize all components
    initNavigation();
    initDateTime();
    initProductManagement();
    initSalesPOS();
    initExpenseManagement();
    initInventoryManagement();
    initReports();
    initModals();
    
    // Load initial data
    loadInitialData();
    
    // Show sales section by default
    showSection('sales-section');
}

// Global variables
let products = [];
let categories = [];
let cart = [];
let sales = [];
let expenses = [];
let inventory = [];
let heldCarts = [];
let currentReceiptId = 1000;

// Initialize navigation
function initNavigation() {
    const navLinks = document.querySelectorAll('.main-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.id.replace('nav-', '') + '-section';
            showSection(sectionId);
            
            // Update active state
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Show/hide sections
function showSection(sectionId) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.classList.add('active');
        
        // Refresh section data if needed
        switch(sectionId) {
            case 'products-section':
                refreshProductsTable();
                break;
            case 'sales-section':
                refreshProductsGrid();
                break;
            case 'receipts-section':
                refreshReceiptsTable();
                break;
            case 'expenses-section':
                refreshExpensesTable();
                break;
            case 'inventory-section':
                refreshInventoryTable();
                break;
            case 'reports-section':
                generateReport('daily', new Date());
                break;
        }
    }
}

// Initialize date and time display
function initDateTime() {
    function updateDateTime() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        };
        document.getElementById('current-date-time').textContent = now.toLocaleDateString('en-US', options);
    }
    
    updateDateTime();
    setInterval(updateDateTime, 1000);
}

// Initialize product management
function initProductManagement() {
    // Add product button
    document.getElementById('add-product-btn').addEventListener('click', function() {
        openProductModal();
    });
    
    // Product form submission
    document.getElementById('product-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveProduct();
    });
    
    // Product image preview
    document.getElementById('product-image').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const preview = document.getElementById('product-image-preview');
                preview.innerHTML = `<img src="${event.target.result}" alt="Product Preview">`;
            };
            reader.readAsDataURL(file);
        }
    });
}

// Initialize sales POS
function initSalesPOS() {
    // Search functionality
    document.getElementById('product-search').addEventListener('input', function() {
        filterProducts(this.value);
    });
    
    document.getElementById('search-btn').addEventListener('click', function() {
        filterProducts(document.getElementById('product-search').value);
    });
    
    // Category filter
    document.getElementById('category-select').addEventListener('change', function() {
        filterProductsByCategory(this.value);
    });
    
    // Cart actions
    document.getElementById('clear-cart').addEventListener('click', clearCart);
    document.getElementById('hold-cart').addEventListener('click', holdCart);
    
    // Payment buttons
    document.getElementById('cash-payment').addEventListener('click', function() {
        processPayment('Cash');
    });
    
    document.getElementById('card-payment').addEventListener('click', function() {
        processPayment('Card');
    });
    
    document.getElementById('other-payment').addEventListener('click', function() {
        processPayment('Other');
    });
    
    // Promo code
    document.getElementById('apply-promo').addEventListener('click', applyPromoCode);
}

// Initialize expense management
function initExpenseManagement() {
    // Add expense button
    document.getElementById('add-expense-btn').addEventListener('click', function() {
        openExpenseModal();
    });
    
    // Expense form submission
    document.getElementById('expense-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveExpense();
    });
    
    // Filter expenses by date
    document.getElementById('filter-receipts').addEventListener('click', function() {
        const date = document.getElementById('receipts-date-filter').value;
        filterReceiptsByDate(date);
    });
}

// Initialize inventory management
function initInventoryManagement() {
    // Add inventory button
    document.getElementById('add-inventory-btn').addEventListener('click', function() {
        openInventoryModal();
    });
    
    // Inventory form submission
    document.getElementById('inventory-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveInventory();
    });
}

// Initialize reports
function initReports() {
    // Generate report button
    document.getElementById('generate-report').addEventListener('click', function() {
        const period = document.getElementById('report-period').value;
        const date = new Date(document.getElementById('report-date').value);
        generateReport(period, date);
    });
    
    // Set default report date to today
    document.getElementById('report-date').valueAsDate = new Date();
}

// Initialize modals
function initModals() {
    // Close modals when clicking X
    document.querySelectorAll('.close-modal, .close-modal-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            closeAllModals();
        });
    });
    
    // Close modals when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeAllModals();
            }
        });
    });
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

// Load initial data from localStorage
function loadInitialData() {
    // Load products
    const savedProducts = localStorage.getItem('pos-products');
    if (savedProducts) {
        products = JSON.parse(savedProducts);
    } else {
        // Sample products if none exist
        products = [
            { id: 1, name: 'T-Shirt', category: 'Clothing', price: 19.99, cost: 10.00, stock: 50, image: '', description: 'Basic cotton t-shirt' },
            { id: 2, name: 'Jeans', category: 'Clothing', price: 49.99, cost: 25.00, stock: 30, image: '', description: 'Blue denim jeans' },
            { id: 3, name: 'Sneakers', category: 'Footwear', price: 79.99, cost: 40.00, stock: 20, image: '', description: 'Running sneakers' },
            { id: 4, name: 'Backpack', category: 'Accessories', price: 39.99, cost: 20.00, stock: 15, image: '', description: 'School backpack' }
        ];
        localStorage.setItem('pos-products', JSON.stringify(products));
    }
    
    // Load categories from products
    categories = [...new Set(products.map(product => product.category))];
    refreshCategoryFilters();
    
    // Load sales
    const savedSales = localStorage.getItem('pos-sales');
    if (savedSales) {
        sales = JSON.parse(savedSales);
    }
    
    // Load expenses
    const savedExpenses = localStorage.getItem('pos-expenses');
    if (savedExpenses) {
        expenses = JSON.parse(savedExpenses);
    }
    
    // Load inventory
    const savedInventory = localStorage.getItem('pos-inventory');
    if (savedInventory) {
        inventory = JSON.parse(savedInventory);
    }
    
    // Load held carts
    const savedHeldCarts = localStorage.getItem('pos-held-carts');
    if (savedHeldCarts) {
        heldCarts = JSON.parse(savedHeldCarts);
    }
    
    // Load current receipt ID
    const savedReceiptId = localStorage.getItem('pos-receipt-id');
    if (savedReceiptId) {
        currentReceiptId = parseInt(savedReceiptId);
    }
    
    // Refresh all displays
    refreshProductsGrid();
    refreshProductsTable();
    refreshReceiptsTable();
    refreshExpensesTable();
    refreshInventoryTable();
}

// Save all data to localStorage
function saveAllData() {
    localStorage.setItem('pos-products', JSON.stringify(products));
    localStorage.setItem('pos-sales', JSON.stringify(sales));
    localStorage.setItem('pos-expenses', JSON.stringify(expenses));
    localStorage.setItem('pos-inventory', JSON.stringify(inventory));
    localStorage.setItem('pos-held-carts', JSON.stringify(heldCarts));
    localStorage.setItem('pos-receipt-id', currentReceiptId.toString());
}

// Refresh category filters in all select elements
function refreshCategoryFilters() {
    const categorySelects = document.querySelectorAll('#category-select, #product-category');
    
    categorySelects.forEach(select => {
        const currentValue = select.value;
        select.innerHTML = '';
        
        if (select.id === 'category-select') {
            select.innerHTML = '<option value="all">All Categories</option>';
        } else {
            select.innerHTML = '<option value="">Select Category</option>';
        }
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            select.appendChild(option);
        });
        
        // Restore previous selection if it still exists
        if (currentValue && categories.includes(currentValue)) {
            select.value = currentValue;
        }
    });
}

// PRODUCT MANAGEMENT FUNCTIONS
function openProductModal(product = null) {
    const modal = document.getElementById('product-modal');
    const form = document.getElementById('product-form');
    const title = document.getElementById('product-modal-title');
    const imagePreview = document.getElementById('product-image-preview');
    
    if (product) {
        // Edit mode
        title.textContent = 'Edit Product';
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-cost').value = product.cost;
        document.getElementById('product-stock').value = product.stock;
        document.getElementById('product-description').value = product.description || '';
        
        if (product.image) {
            imagePreview.innerHTML = `<img src="${product.image}" alt="Product Preview">`;
        } else {
            imagePreview.innerHTML = '';
        }
    } else {
        // Add mode
        title.textContent = 'Add New Product';
        form.reset();
        imagePreview.innerHTML = '';
        document.getElementById('product-id').value = '';
    }
    
    modal.classList.add('active');
}

function saveProduct() {
    const form = document.getElementById('product-form');
    const productId = document.getElementById('product-id').value;
    const productName = document.getElementById('product-name').value;
    const productCategory = document.getElementById('product-category').value;
    const productPrice = parseFloat(document.getElementById('product-price').value);
    const productCost = parseFloat(document.getElementById('product-cost').value);
    const productStock = parseInt(document.getElementById('product-stock').value);
    const productDescription = document.getElementById('product-description').value;
    const imageFile = document.getElementById('product-image').files[0];
    
    // Validate
    if (!productName || !productCategory || isNaN(productPrice) || isNaN(productCost) || isNaN(productStock)) {
        showNotification('Please fill all required fields with valid values', 'error');
        return;
    }
    
    // Handle image
    let productImage = '';
    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function(event) {
            productImage = event.target.result;
            completeProductSave();
        };
        reader.readAsDataURL(imageFile);
    } else {
        // If editing and no new image selected, keep existing image
        if (productId) {
            const existingProduct = products.find(p => p.id == productId);
            if (existingProduct && existingProduct.image) {
                productImage = existingProduct.image;
            }
        }
        completeProductSave();
    }
    
    function completeProductSave() {
        if (productId) {
            // Update existing product
            const index = products.findIndex(p => p.id == productId);
            if (index !== -1) {
                products[index] = {
                    id: parseInt(productId),
                    name: productName,
                    category: productCategory,
                    price: productPrice,
                    cost: productCost,
                    stock: productStock,
                    image: productImage,
                    description: productDescription
                };
            }
        } else {
            // Add new product
            const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
            products.push({
                id: newId,
                name: productName,
                category: productCategory,
                price: productPrice,
                cost: productCost,
                stock: productStock,
                image: productImage,
                description: productDescription
            });
            
            // Add to categories if new
            if (!categories.includes(productCategory)) {
                categories.push(productCategory);
                refreshCategoryFilters();
            }
        }
        
        saveAllData();
        refreshProductsGrid();
        refreshProductsTable();
        refreshProductSelects();
        closeAllModals();
        showNotification('Product saved successfully');
    }
}

function refreshProductsTable() {
    const tbody = document.getElementById('products-table-body');
    tbody.innerHTML = '';
    
    products.forEach(product => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${product.image ? `<img src="${product.image}" alt="${product.name}" class="table-product-image">` : ''}</td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>$${product.cost.toFixed(2)}</td>
            <td>${product.stock}</td>
            <td>
                <button class="action-btn edit-btn" data-id="${product.id}"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete-btn" data-id="${product.id}"><i class="fas fa-trash"></i></button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            const product = products.find(p => p.id === productId);
            if (product) {
                openProductModal(product);
            }
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            if (confirm('Are you sure you want to delete this product?')) {
                deleteProduct(productId);
            }
        });
    });
}

function deleteProduct(productId) {
    const index = products.findIndex(p => p.id === productId);
    if (index !== -1) {
        products.splice(index, 1);
        saveAllData();
        refreshProductsGrid();
        refreshProductsTable();
        refreshProductSelects();
        showNotification('Product deleted successfully');
    }
}

function refreshProductsGrid() {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = '';
    
    products.forEach(product => {
        if (product.stock > 0) { // Only show products with stock
            const card = document.createElement('div');
            card.className = 'product-card';
            card.setAttribute('data-id', product.id);
            
            card.innerHTML = `
                ${product.image ? `<img src="${product.image}" class="product-image" alt="${product.name}">` : '<div class="product-image"><i class="fas fa-box-open"></i></div>'}
                <div class="product-name">${product.name}</div>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <div class="product-stock">${product.stock} in stock</div>
            `;
            
            card.addEventListener('click', function() {
                addToCart(product.id);
            });
            
            grid.appendChild(card);
        }
    });
}

function refreshProductSelects() {
    const productSelect = document.getElementById('inventory-product');
    if (productSelect) {
        const currentValue = productSelect.value;
        productSelect.innerHTML = '<option value="">Select Product</option>';
        
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = product.name;
            productSelect.appendChild(option);
        });
        
        // Restore previous selection if it still exists
        if (currentValue && products.some(p => p.id == currentValue)) {
            productSelect.value = currentValue;
        }
    }
}

// SALES POS FUNCTIONS
function filterProducts(searchTerm) {
    const grid = document.getElementById('products-grid');
    const cards = grid.querySelectorAll('.product-card');
    
    cards.forEach(card => {
        const productName = card.querySelector('.product-name').textContent.toLowerCase();
        if (productName.includes(searchTerm.toLowerCase())) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

function filterProductsByCategory(category) {
    const grid = document.getElementById('products-grid');
    const cards = grid.querySelectorAll('.product-card');
    
    if (category === 'all') {
        cards.forEach(card => {
            card.style.display = 'flex';
        });
        return;
    }
    
    cards.forEach(card => {
        const productId = parseInt(card.getAttribute('data-id'));
        const product = products.find(p => p.id === productId);
        
        if (product && product.category === category) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Check if product already in cart
    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
        // Check if enough stock
        if (existingItem.quantity < product.stock) {
            existingItem.quantity++;
        } else {
            showNotification('Not enough stock available', 'warning');
            return;
        }
    } else {
        // Add new item to cart
        if (product.stock > 0) {
            cart.push({
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: 1
            });
        } else {
            showNotification('Product out of stock', 'warning');
            return;
        }
    }
    
    refreshCartDisplay();
    showNotification(`${product.name} added to cart`);
}

function refreshCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
        updateCartSummary();
        return;
    }
    
    cart.forEach((item, index) => {
        const product = products.find(p => p.id === item.productId);
        if (!product) return;
        
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        
        itemElement.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">$${item.price.toFixed(2)} each</div>
            </div>
            <div class="cart-item-quantity">
                <button class="decrease-qty" data-index="${index}">-</button>
                <span>${item.quantity}</span>
                <button class="increase-qty" data-index="${index}">+</button>
            </div>
            <div class="cart-item-remove" data-index="${index}">
                <i class="fas fa-times"></i>
            </div>
        `;
        
        cartItems.appendChild(itemElement);
    });
    
    // Add event listeners to quantity buttons
    document.querySelectorAll('.decrease-qty').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            decreaseQuantity(index);
        });
    });
    
    document.querySelectorAll('.increase-qty').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            increaseQuantity(index);
        });
    });
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            removeFromCart(index);
        });
    });
    
    updateCartSummary();
}

function decreaseQuantity(index) {
    if (index >= 0 && index < cart.length) {
        if (cart[index].quantity > 1) {
            cart[index].quantity--;
        } else {
            cart.splice(index, 1);
        }
        refreshCartDisplay();
    }
}

function increaseQuantity(index) {
    if (index >= 0 && index < cart.length) {
        const product = products.find(p => p.id === cart[index].productId);
        if (product && cart[index].quantity < product.stock) {
            cart[index].quantity++;
            refreshCartDisplay();
        } else {
            showNotification('Not enough stock available', 'warning');
        }
    }
}

function removeFromCart(index) {
    if (index >= 0 && index < cart.length) {
        cart.splice(index, 1);
        refreshCartDisplay();
    }
}

function updateCartSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = 0; // Will be calculated when promo applied
    const total = subtotal - discount;
    
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('discount').textContent = `$${discount.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
}

function clearCart() {
    if (cart.length === 0) return;
    
    if (confirm('Are you sure you want to clear the cart?')) {
        cart = [];
        refreshCartDisplay();
        showNotification('Cart cleared');
    }
}

function holdCart() {
    if (cart.length === 0) {
        showNotification('Cart is empty', 'warning');
        return;
    }
    
    heldCarts.push({
        id: Date.now(),
        items: [...cart],
        date: new Date()
    });
    
    cart = [];
    refreshCartDisplay();
    saveAllData();
    showNotification('Cart held successfully');
}

function applyPromoCode() {
    const promoCode = document.getElementById('promo-code').value.trim();
    if (!promoCode) {
        showNotification('Please enter a promo code', 'warning');
        return;
    }
    
    // Simple promo code logic - in a real app, this would be more complex
    let discount = 0;
    
    if (promoCode === 'DISCOUNT10') {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        discount = subtotal * 0.1; // 10% discount
    } else if (promoCode === 'DISCOUNT20') {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        discount = subtotal * 0.2; // 20% discount
    } else {
        showNotification('Invalid promo code', 'error');
        return;
    }
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal - discount;
    
    document.getElementById('discount').textContent = `$${discount.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
    showNotification('Promo code applied successfully');
}

function processPayment(paymentMethod) {
    if (cart.length === 0) {
        showNotification('Cart is empty', 'warning');
        return;
    }
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = parseFloat(document.getElementById('discount').textContent.replace('$', ''));
    const total = subtotal - discount;
    
    // Create receipt
    const receipt = {
        id: currentReceiptId++,
        date: new Date(),
        items: [...cart],
        subtotal: subtotal,
        discount: discount,
        total: total,
        paymentMethod: paymentMethod
    };
    
    // Update product stock
    cart.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
            product.stock -= item.quantity;
        }
    });
    
    // Add to sales
    sales.push(receipt);
    
    // Clear cart and reset
    cart = [];
    document.getElementById('promo-code').value = '';
    document.getElementById('discount').textContent = '$0.00';
    
    saveAllData();
    refreshProductsGrid();
    refreshCartDisplay();
    refreshReceiptsTable();
    
    // Show receipt
    showReceipt(receipt);
    
    showNotification('Sale completed successfully');
}

function showReceipt(receipt) {
    const receiptContent = document.getElementById('receipt-details-content');
    
    receiptContent.innerHTML = `
        <div class="receipt-header">
            <h3>Retail POS</h3>
            <p>123 Main Street, City</p>
            <p>Tel: (123) 456-7890</p>
        </div>
        <div class="receipt-info">
            <div>
                <p><strong>Receipt #:</strong> ${receipt.id}</p>
                <p><strong>Date:</strong> ${new Date(receipt.date).toLocaleString()}</p>
            </div>
            <div>
                <p><strong>Cashier:</strong> User</p>
                <p><strong>Payment:</strong> ${receipt.paymentMethod}</p>
            </div>
        </div>
        <div class="receipt-items">
            ${receipt.items.map(item => `
                <div class="receipt-item">
                    <div>${item.name} x${item.quantity}</div>
                    <div>$${(item.price * item.quantity).toFixed(2)}</div>
                </div>
            `).join('')}
        </div>
        <div class="receipt-totals">
            <div class="receipt-total-row">
                <span>Subtotal:</span>
                <span>$${receipt.subtotal.toFixed(2)}</span>
            </div>
            <div class="receipt-total-row">
                <span>Discount:</span>
                <span>$${receipt.discount.toFixed(2)}</span>
            </div>
            <div class="receipt-total-row total">
                <span>Total:</span>
                <span>$${receipt.total.toFixed(2)}</span>
            </div>
        </div>
        <div class="receipt-footer">
            <p>Thank you for your purchase!</p>
        </div>
    `;
    
    document.getElementById('receipt-modal').classList.add('active');
}

// EXPENSE MANAGEMENT FUNCTIONS
function openExpenseModal(expense = null) {
    const modal = document.getElementById('expense-modal');
    const form = document.getElementById('expense-form');
    const title = document.getElementById('expense-modal-title');
    
    if (expense) {
        // Edit mode
        title.textContent = 'Edit Expense';
        document.getElementById('expense-id').value = expense.id;
        document.getElementById('expense-date').value = expense.date.split('T')[0];
        document.getElementById('expense-description').value = expense.description;
        document.getElementById('expense-category').value = expense.category;
        document.getElementById('expense-amount').value = expense.amount;
    } else {
        // Add mode
        title.textContent = 'Add New Expense';
        form.reset();
        document.getElementById('expense-id').value = '';
        document.getElementById('expense-date').valueAsDate = new Date();
    }
    
    modal.classList.add('active');
}

function saveExpense() {
    const form = document.getElementById('expense-form');
    const expenseId = document.getElementById('expense-id').value;
    const expenseDate = document.getElementById('expense-date').value;
    const expenseDescription = document.getElementById('expense-description').value;
    const expenseCategory = document.getElementById('expense-category').value;
    const expenseAmount = parseFloat(document.getElementById('expense-amount').value);
    
    // Validate
    if (!expenseDate || !expenseDescription || !expenseCategory || isNaN(expenseAmount)) {
        showNotification('Please fill all required fields with valid values', 'error');
        return;
    }
    
    if (expenseId) {
        // Update existing expense
        const index = expenses.findIndex(e => e.id == expenseId);
        if (index !== -1) {
            expenses[index] = {
                id: parseInt(expenseId),
                date: expenseDate,
                description: expenseDescription,
                category: expenseCategory,
                amount: expenseAmount
            };
        }
    } else {
        // Add new expense
        const newId = expenses.length > 0 ? Math.max(...expenses.map(e => e.id)) + 1 : 1;
        expenses.push({
            id: newId,
            date: expenseDate,
            description: expenseDescription,
            category: expenseCategory,
            amount: expenseAmount
        });
    }
    
    saveAllData();
    refreshExpensesTable();
    closeAllModals();
    showNotification('Expense saved successfully');
}

function refreshExpensesTable() {
    const tbody = document.getElementById('expenses-table-body');
    tbody.innerHTML = '';
    
    expenses.forEach(expense => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${new Date(expense.date).toLocaleDateString()}</td>
            <td>${expense.description}</td>
            <td>${expense.category}</td>
            <td>$${expense.amount.toFixed(2)}</td>
            <td>
                <button class="action-btn edit-btn" data-id="${expense.id}"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete-btn" data-id="${expense.id}"><i class="fas fa-trash"></i></button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const expenseId = parseInt(this.getAttribute('data-id'));
            const expense = expenses.find(e => e.id === expenseId);
            if (expense) {
                openExpenseModal(expense);
            }
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const expenseId = parseInt(this.getAttribute('data-id'));
            if (confirm('Are you sure you want to delete this expense?')) {
                deleteExpense(expenseId);
            }
        });
    });
}

function deleteExpense(expenseId) {
    const index = expenses.findIndex(e => e.id === expenseId);
    if (index !== -1) {
        expenses.splice(index, 1);
        saveAllData();
        refreshExpensesTable();
        showNotification('Expense deleted successfully');
    }
}

// INVENTORY MANAGEMENT FUNCTIONS
function openInventoryModal(inventoryRecord = null) {
    const modal = document.getElementById('inventory-modal');
    const form = document.getElementById('inventory-form');
    const title = document.getElementById('inventory-modal-title');
    
    if (inventoryRecord) {
        // Edit mode
        title.textContent = 'Edit Inventory Record';
        document.getElementById('inventory-id').value = inventoryRecord.id;
        document.getElementById('inventory-date').value = inventoryRecord.date.split('T')[0];
        document.getElementById('inventory-product').value = inventoryRecord.productId;
        document.getElementById('inventory-supplier').value = inventoryRecord.supplier;
        document.getElementById('inventory-quantity').value = inventoryRecord.quantity;
        document.getElementById('inventory-unit-cost').value = inventoryRecord.unitCost;
    } else {
        // Add mode
        title.textContent = 'Receive New Inventory';
        form.reset();
        document.getElementById('inventory-id').value = '';
        document.getElementById('inventory-date').valueAsDate = new Date();
    }
    
    modal.classList.add('active');
}

function saveInventory() {
    const form = document.getElementById('inventory-form');
    const inventoryId = document.getElementById('inventory-id').value;
    const inventoryDate = document.getElementById('inventory-date').value;
    const inventoryProductId = parseInt(document.getElementById('inventory-product').value);
    const inventorySupplier = document.getElementById('inventory-supplier').value;
    const inventoryQuantity = parseInt(document.getElementById('inventory-quantity').value);
    const inventoryUnitCost = parseFloat(document.getElementById('inventory-unit-cost').value);
    
    // Validate
    if (!inventoryDate || isNaN(inventoryProductId) || !inventorySupplier || isNaN(inventoryQuantity) || isNaN(inventoryUnitCost)) {
        showNotification('Please fill all required fields with valid values', 'error');
        return;
    }
    
    const product = products.find(p => p.id === inventoryProductId);
    if (!product) {
        showNotification('Selected product not found', 'error');
        return;
    }
    
    if (inventoryId) {
        // Update existing inventory record
        const index = inventory.findIndex(i => i.id == inventoryId);
        if (index !== -1) {
            // First reverse the previous stock addition
            const prevRecord = inventory[index];
            const prevProduct = products.find(p => p.id === prevRecord.productId);
            if (prevProduct) {
                prevProduct.stock -= prevRecord.quantity;
            }
            
            // Then update the record and add the new stock
            inventory[index] = {
                id: parseInt(inventoryId),
                date: inventoryDate,
                productId: inventoryProductId,
                productName: product.name,
                supplier: inventorySupplier,
                quantity: inventoryQuantity,
                unitCost: inventoryUnitCost,
                totalCost: inventoryQuantity * inventoryUnitCost
            };
            
            product.stock += inventoryQuantity;
        }
    } else {
        // Add new inventory record
        const newId = inventory.length > 0 ? Math.max(...inventory.map(i => i.id)) + 1 : 1;
        inventory.push({
            id: newId,
            date: inventoryDate,
            productId: inventoryProductId,
            productName: product.name,
            supplier: inventorySupplier,
            quantity: inventoryQuantity,
            unitCost: inventoryUnitCost,
            totalCost: inventoryQuantity * inventoryUnitCost
        });
        
        // Update product stock
        product.stock += inventoryQuantity;
    }
    
    saveAllData();
    refreshInventoryTable();
    refreshProductsGrid();
    refreshProductsTable();
    closeAllModals();
    showNotification('Inventory record saved successfully');
}

function refreshInventoryTable() {
    const tbody = document.getElementById('inventory-table-body');
    tbody.innerHTML = '';
    
    inventory.forEach(record => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${new Date(record.date).toLocaleDateString()}</td>
            <td>${record.productName}</td>
            <td>${record.supplier}</td>
            <td>${record.quantity}</td>
            <td>$${record.unitCost.toFixed(2)}</td>
            <td>$${record.totalCost.toFixed(2)}</td>
            <td>
                <button class="action-btn edit-btn" data-id="${record.id}"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete-btn" data-id="${record.id}"><i class="fas fa-trash"></i></button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const recordId = parseInt(this.getAttribute('data-id'));
            const record = inventory.find(r => r.id === recordId);
            if (record) {
                openInventoryModal(record);
            }
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const recordId = parseInt(this.getAttribute('data-id'));
            if (confirm('Are you sure you want to delete this inventory record?')) {
                deleteInventoryRecord(recordId);
            }
        });
    });
}

function deleteInventoryRecord(recordId) {
    const index = inventory.findIndex(r => r.id === recordId);
    if (index !== -1) {
        const record = inventory[index];
        const product = products.find(p => p.id === record.productId);
        
        if (product) {
            // Reverse the stock addition
            product.stock -= record.quantity;
        }
        
        inventory.splice(index, 1);
        saveAllData();
        refreshInventoryTable();
        refreshProductsGrid();
        refreshProductsTable();
        showNotification('Inventory record deleted successfully');
    }
}

// RECEIPTS FUNCTIONS
function refreshReceiptsTable() {
    const tbody = document.getElementById('receipts-table-body');
    tbody.innerHTML = '';
    
    sales.forEach(receipt => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${receipt.id}</td>
            <td>${new Date(receipt.date).toLocaleString()}</td>
            <td>${receipt.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
            <td>$${receipt.total.toFixed(2)}</td>
            <td>${receipt.paymentMethod}</td>
            <td>
                <button class="action-btn view-btn" data-id="${receipt.id}"><i class="fas fa-eye"></i></button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    // Add event listeners to view buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const receiptId = parseInt(this.getAttribute('data-id'));
            const receipt = sales.find(r => r.id === receiptId);
            if (receipt) {
                showReceipt(receipt);
            }
        });
    });
}

function filterReceiptsByDate(date) {
    if (!date) {
        refreshReceiptsTable();
        return;
    }
    
    const filteredReceipts = sales.filter(receipt => {
        return new Date(receipt.date).toDateString() === new Date(date).toDateString();
    });
    
    const tbody = document.getElementById('receipts-table-body');
    tbody.innerHTML = '';
    
    filteredReceipts.forEach(receipt => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${receipt.id}</td>
            <td>${new Date(receipt.date).toLocaleString()}</td>
            <td>${receipt.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
            <td>$${receipt.total.toFixed(2)}</td>
            <td>${receipt.paymentMethod}</td>
            <td>
                <button class="action-btn view-btn" data-id="${receipt.id}"><i class="fas fa-eye"></i></button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    // Add event listeners to view buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const receiptId = parseInt(this.getAttribute('data-id'));
            const receipt = sales.find(r => r.id === receiptId);
            if (receipt) {
                showReceipt(receipt);
            }
        });
    });
}

// REPORTS FUNCTIONS
function generateReport(period, date) {
    if (!date) date = new Date();
    
    let startDate, endDate;
    const reportDate = new Date(date);
    
    switch (period) {
        case 'daily':
            startDate = new Date(reportDate);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(reportDate);
            endDate.setHours(23, 59, 59, 999);
            break;
        case 'weekly':
            // Start of week (Sunday)
            startDate = new Date(reportDate);
            startDate.setDate(reportDate.getDate() - reportDate.getDay());
            startDate.setHours(0, 0, 0, 0);
            // End of week (Saturday)
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);
            endDate.setHours(23, 59, 59, 999);
            break;
        case 'monthly':
            // Start of month
            startDate = new Date(reportDate.getFullYear(), reportDate.getMonth(), 1);
            startDate.setHours(0, 0, 0, 0);
            // End of month
            endDate = new Date(reportDate.getFullYear(), reportDate.getMonth() + 1, 0);
            endDate.setHours(23, 59, 59, 999);
            break;
    }
    
    // Filter sales and expenses for the period
    const periodSales = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= startDate && saleDate <= endDate;
    });
    
    const periodExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= startDate && expenseDate <= endDate;
    });
    
    // Calculate totals
    const totalSales = periodSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalExpenses = periodExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const grossProfit = totalSales;
    const netProfit = totalSales - totalExpenses;
    
    // Update summary cards
    document.getElementById('total-sales').textContent = `$${totalSales.toFixed(2)}`;
    document.getElementById('total-expenses').textContent = `$${totalExpenses.toFixed(2)}`;
    document.getElementById('gross-profit').textContent = `$${grossProfit.toFixed(2)}`;
    document.getElementById('net-profit').textContent = `$${netProfit.toFixed(2)}`;
    
    // Get top selling products
    const productSales = {};
    periodSales.forEach(sale => {
        sale.items.forEach(item => {
            if (!productSales[item.productId]) {
                productSales[item.productId] = {
                    name: item.name,
                    quantity: 0,
                    revenue: 0
                };
            }
            productSales[item.productId].quantity += item.quantity;
            productSales[item.productId].revenue += item.price * item.quantity;
        });
    });
    
    const topProducts = Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    
    // Update top products table
    const topProductsBody = document.getElementById('top-products-body');
    topProductsBody.innerHTML = '';
    
    topProducts.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.quantity}</td>
            <td>$${product.revenue.toFixed(2)}</td>
        `;
        topProductsBody.appendChild(row);
    });
    
    // Get expense breakdown
    const expenseBreakdown = {};
    periodExpenses.forEach(expense => {
        if (!expenseBreakdown[expense.category]) {
            expenseBreakdown[expense.category] = 0;
        }
        expenseBreakdown[expense.category] += expense.amount;
    });
    
    // Update expense breakdown table
    const expenseBreakdownBody = document.getElementById('expense-breakdown-body');
    expenseBreakdownBody.innerHTML = '';
    
    Object.entries(expenseBreakdown).forEach(([category, amount]) => {
        const percentage = (amount / totalExpenses) * 100;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${category}</td>
            <td>$${amount.toFixed(2)}</td>
            <td>${percentage.toFixed(1)}%</td>
        `;
        expenseBreakdownBody.appendChild(row);
    });
    
    // Update charts
    updateCharts(periodSales, periodExpenses, period, date);
}

function updateCharts(salesData, expensesData, period, date) {
    const salesCtx = document.getElementById('sales-chart').getContext('2d');
    const profitCtx = document.getElementById('profit-chart').getContext('2d');
    
    // Destroy existing charts if they exist
    if (window.salesChart) {
        window.salesChart.destroy();
    }
    if (window.profitChart) {
        window.profitChart.destroy();
    }
    
    // Prepare data for charts based on period
    let labels = [];
    let salesValues = [];
    let expenseValues = [];
    let profitValues = [];
    
    const reportDate = new Date(date);
    
    if (period === 'daily') {
        // Hourly breakdown for daily report
        for (let hour = 0; hour < 24; hour++) {
            labels.push(`${hour}:00`);
            
            const hourSales = salesData.filter(sale => {
                const saleHour = new Date(sale.date).getHours();
                return saleHour === hour;
            }).reduce((sum, sale) => sum + sale.total, 0);
            
            salesValues.push(hourSales);
            
            const hourExpenses = expensesData.filter(expense => {
                const expenseHour = new Date(expense.date).getHours();
                return expenseHour === hour;
            }).reduce((sum, expense) => sum + expense.amount, 0);
            
            expenseValues.push(hourExpenses);
            profitValues.push(hourSales - hourExpenses);
        }
    } else if (period === 'weekly') {
        // Daily breakdown for weekly report
        const startDate = new Date(reportDate);
        startDate.setDate(reportDate.getDate() - reportDate.getDay()); // Start of week (Sunday)
        
        for (let day = 0; day < 7; day++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + day);
            
            const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'short' });
            labels.push(dayName);
            
            const daySales = salesData.filter(sale => {
                const saleDate = new Date(sale.date);
                return saleDate.getDate() === currentDate.getDate() && 
                       saleDate.getMonth() === currentDate.getMonth() && 
                       saleDate.getFullYear() === currentDate.getFullYear();
            }).reduce((sum, sale) => sum + sale.total, 0);
            
            salesValues.push(daySales);
            
            const dayExpenses = expensesData.filter(expense => {
                const expenseDate = new Date(expense.date);
                return expenseDate.getDate() === currentDate.getDate() && 
                       expenseDate.getMonth() === currentDate.getMonth() && 
                       expenseDate.getFullYear() === currentDate.getFullYear();
            }).reduce((sum, expense) => sum + expense.amount, 0);
            
            expenseValues.push(dayExpenses);
            profitValues.push(daySales - dayExpenses);
        }
    } else if (period === 'monthly') {
        // Weekly breakdown for monthly report
        const firstDay = new Date(reportDate.getFullYear(), reportDate.getMonth(), 1);
        const lastDay = new Date(reportDate.getFullYear(), reportDate.getMonth() + 1, 0);
        
        let weekStart = new Date(firstDay);
        let weekNumber = 1;
        
        while (weekStart <= lastDay) {
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            if (weekEnd > lastDay) weekEnd = new Date(lastDay);
            
            labels.push(`Week ${weekNumber}`);
            
            const weekSales = salesData.filter(sale => {
                const saleDate = new Date(sale.date);
                return saleDate >= weekStart && saleDate <= weekEnd;
            }).reduce((sum, sale) => sum + sale.total, 0);
            
            salesValues.push(weekSales);
            
            const weekExpenses = expensesData.filter(expense => {
                const expenseDate = new Date(expense.date);
                return expenseDate >= weekStart && expenseDate <= weekEnd;
            }).reduce((sum, expense) => sum + expense.amount, 0);
            
            expenseValues.push(weekExpenses);
            profitValues.push(weekSales - weekExpenses);
            
            weekStart.setDate(weekStart.getDate() + 7);
            weekNumber++;
        }
    }
    
    // Sales chart
    window.salesChart = new Chart(salesCtx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Sales',
                data: salesValues,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
    
    // Profit chart (sales - expenses)
    window.profitChart = new Chart(profitCtx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Sales',
                    data: salesValues,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 2,
                    fill: true
                },
                {
                    label: 'Expenses',
                    data: expenseValues,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 2,
                    fill: true
                },
                {
                    label: 'Profit',
                    data: profitValues,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 2,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// UTILITY FUNCTIONS
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = 'notification show ' + type;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Initialize print receipt button
document.getElementById('print-receipt').addEventListener('click', function() {
    const receiptContent = document.getElementById('receipt-details-content').innerHTML;
    const printWindow = window.open('', '', 'width=600,height=600');
    printWindow.document.write(`
        <html>
            <head>
                <title>Receipt</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    .receipt-header { text-align: center; margin-bottom: 20px; }
                    .receipt-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
                    .receipt-items { margin: 20px 0; }
                    .receipt-item { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px dashed #eee; }
                    .receipt-totals { margin-top: 20px; }
                    .receipt-total-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
                    .receipt-total-row.total { font-weight: bold; font-size: 1.1em; padding-top: 5px; border-top: 1px solid #000; }
                    .receipt-footer { text-align: center; margin-top: 30px; font-style: italic; }
                </style>
            </head>
            <body>
                ${receiptContent}
                <script>
                    window.onload = function() {
                        setTimeout(function() {
                            window.print();
                            window.close();
                        }, 200);
                    };
                </script>
            </body>
        </html>
    `);
    printWindow.document.close();
});