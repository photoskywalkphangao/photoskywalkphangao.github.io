// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCcls0141UfD9ZgsSl4K9jIeXdzWXDDGe8",
  authDomain: "shopskywalk-3d72a.firebaseapp.com",
  databaseURL: "https://shopskywalk-3d72a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "shopskywalk-3d72a",
  storageBucket: "shopskywalk-3d72a.firebasestorage.app",
  messagingSenderId: "1055684669213",
  appId: "1:1055684669213:web:858cf5ec699f2794f4bbf4"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// DOM Elements
const pages = {
    sale: document.getElementById('sale-page'),
    products: document.getElementById('products-page'),
    receipts: document.getElementById('receipts-page'),
    expenses: document.getElementById('expenses-page'),
    inventory: document.getElementById('inventory-page'),
    reports: document.getElementById('reports-page')
};

const navLinks = {
    sale: document.getElementById('nav-sale'),
    products: document.getElementById('nav-products'),
    receipts: document.getElementById('nav-receipts'),
    expenses: document.getElementById('nav-expenses'),
    inventory: document.getElementById('nav-inventory'),
    reports: document.getElementById('nav-reports')
};

// Global Variables
let currentPage = 'sale';
let cart = [];
let products = [];
let categories = ['น้ำดื่ม', 'ขนม', 'สมุนไพร', 'อื่นๆ'];
let expenseCategories = ['ค่าน้ำค่าไฟ', 'เงินเดือนพนักงาน', 'วัสดุอุปกรณ์', 'สั่งซื้อสินค้า', 'อื่นๆ'];
let salesChart = null;
let currentReportPeriod = 'day';

// Initialize the app
function initApp() {
    setupNavigation();
    setupEventListeners();
    loadProducts();
    loadExpenses();
    loadInventoryHistory();
    loadReceipts();
    showPage(currentPage);
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('inventory-date').value = today;
    document.getElementById('report-date').value = today;
    document.getElementById('receipt-date-filter').value = today;
    document.getElementById('expense-date-filter').value = today;
}

// Setup navigation
function setupNavigation() {
    // Handle internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const pageName = this.getAttribute('href').substring(1);
            showPage(pageName.replace('-page', ''));
        });
    });
    
    // Highlight active nav link
    for (const [pageName, link] of Object.entries(navLinks)) {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showPage(pageName);
        });
    }
}

// Show specific page
function showPage(pageName) {
    // Hide all pages
    for (const page of Object.values(pages)) {
        page.classList.remove('active-page');
    }
    
    // Remove active class from all nav links
    for (const link of Object.values(navLinks)) {
        link.classList.remove('active');
    }
    
    // Show selected page and set active nav link
    pages[pageName].classList.add('active-page');
    navLinks[pageName].classList.add('active');
    currentPage = pageName;
    
    // Additional setup for specific pages
    if (pageName === 'reports') {
        setupReportCharts();
    } else if (pageName === 'inventory') {
        loadProductsForSelect();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Sale page
    document.getElementById('product-search').addEventListener('input', filterProducts);
    document.getElementById('search-btn').addEventListener('click', filterProducts);
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', filterByCategory);
    });
    document.getElementById('clear-cart').addEventListener('click', clearCart);
    document.getElementById('checkout-btn').addEventListener('click', checkout);
    
    // Products page
    document.getElementById('add-product-btn').addEventListener('click', showAddProductModal);
    
    // Expenses page
    document.getElementById('add-expense-btn').addEventListener('click', showAddExpenseModal);
    document.getElementById('filter-expenses').addEventListener('click', filterExpenses);
    document.getElementById('reset-expenses-filter').addEventListener('click', resetExpensesFilter);
    
    // Inventory page
    document.getElementById('inventory-quantity').addEventListener('input', calculateInventoryTotal);
    document.getElementById('inventory-cost').addEventListener('input', calculateInventoryTotal);
    document.getElementById('inventory-product-select').addEventListener('change', function() {
        const productId = this.value;
        if (productId) {
            const product = products.find(p => p.id === productId);
            if (product) {
                document.getElementById('inventory-product-name').value = product.name;
                document.getElementById('inventory-product-category').value = product.category;
                document.getElementById('inventory-cost').value = product.cost || '';
            }
        }
    });
    document.getElementById('add-new-product-btn').addEventListener('click', function() {
        document.getElementById('inventory-product-select').value = '';
        document.getElementById('inventory-product-name').value = '';
        document.getElementById('inventory-product-category').value = 'น้ำดื่ม';
        document.getElementById('inventory-cost').value = '';
    });
    document.getElementById('inventory-form').addEventListener('submit', function(e) {
        e.preventDefault();
        processInventory();
    });
    document.getElementById('cancel-inventory').addEventListener('click', resetInventoryForm);
    
    // Receipts page
    document.getElementById('filter-receipts').addEventListener('click', filterReceipts);
    document.getElementById('reset-receipts-filter').addEventListener('click', resetReceiptsFilter);
    
    // Reports page
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.addEventListener('click', changeReportPeriod);
    });
    document.getElementById('generate-report').addEventListener('click', generateReport);
    
    // Modal
    document.querySelector('.close-modal').addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === document.getElementById('modal')) {
            closeModal();
        }
    });
}

// Load products from Firebase
function loadProducts() {
    database.ref('products').on('value', (snapshot) => {
        products = [];
        const data = snapshot.val();
        if (data) {
            for (const id in data) {
                products.push({ id, ...data[id] });
            }
        }
        renderProducts();
        renderProductsTable();
    });
}

// Render products on sale page
function renderProducts() {
    const productsGrid = document.getElementById('products-grid');
    productsGrid.innerHTML = '';
    
    products.forEach(product => {
        if (product.stock > 0) {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.dataset.id = product.id;
            productCard.dataset.category = product.category;
            productCard.innerHTML = `
                <div class="product-image">
                    <img src="${product.image || 'https://via.placeholder.com/150'}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <div class="product-name">${product.name}</div>
                    <div class="product-price">${product.price.toFixed(2)} ฿</div>
                    <div class="product-stock">คงเหลือ: ${product.stock}</div>
                </div>
            `;
            productCard.addEventListener('click', () => addToCart(product));
            productsGrid.appendChild(productCard);
        }
    });
}

// Filter products by search term
function filterProducts() {
    const searchTerm = document.getElementById('product-search').value.toLowerCase();
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        const productName = card.querySelector('.product-name').textContent.toLowerCase();
        if (productName.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Filter products by category
function filterByCategory(e) {
    const category = e.target.dataset.category;
    
    // Update active category button
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    e.target.classList.add('active');
    
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Add product to cart
function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        if (existingItem.quantity < product.stock) {
            existingItem.quantity++;
        } else {
            alert('สินค้าในสต็อกไม่เพียงพอ');
            return;
        }
    } else {
        if (product.stock > 0) {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        } else {
            alert('สินค้าหมดสต็อก');
            return;
        }
    }
    
    renderCart();
}

// Render cart
function renderCart() {
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = '';
    
    let subtotal = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-image">
                    <img src="${item.image || 'https://via.placeholder.com/50'}" alt="${item.name}">
                </div>
                <div>
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${item.price.toFixed(2)} ฿</div>
                </div>
            </div>
            <div class="cart-item-quantity">
                <button class="decrease-qty" data-id="${item.id}">-</button>
                <input type="number" value="${item.quantity}" min="1" data-id="${item.id}">
                <button class="increase-qty" data-id="${item.id}">+</button>
            </div>
            <div class="cart-item-total">${itemTotal.toFixed(2)} ฿</div>
            <div class="cart-item-remove" data-id="${item.id}"><i class="fas fa-times"></i></div>
        `;
        cartItems.appendChild(cartItem);
    });
    
    // Add event listeners for quantity changes
    document.querySelectorAll('.decrease-qty').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            const item = cart.find(item => item.id === id);
            if (item.quantity > 1) {
                item.quantity--;
                renderCart();
            }
        });
    });
    
    document.querySelectorAll('.increase-qty').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            const item = cart.find(item => item.id === id);
            const product = products.find(p => p.id === id);
            
            if (item.quantity < product.stock) {
                item.quantity++;
                renderCart();
            } else {
                alert('สินค้าในสต็อกไม่เพียงพอ');
            }
        });
    });
    
    document.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.closest('.cart-item-remove').dataset.id;
            cart = cart.filter(item => item.id !== id);
            renderCart();
        });
    });
    
    // Update totals
    document.getElementById('subtotal').textContent = subtotal.toFixed(2) + ' ฿';
    document.getElementById('total').textContent = subtotal.toFixed(2) + ' ฿';
}

// Clear cart
function clearCart() {
    if (cart.length > 0 && confirm('คุณต้องการล้างรายการขายทั้งหมดหรือไม่?')) {
        cart = [];
        renderCart();
    }
}

// Checkout
function checkout() {
    if (cart.length === 0) {
        alert('ไม่มีสินค้าในตะกร้า');
        return;
    }
    

    // สร้างวัตถุใบเสร็จ
    const receipt = {
        date: new Date().toISOString(),
        items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
        })),
        subtotal: calculateSubtotal(),
        discount: 0,
        total: calculateTotal(),
        status: 'completed'
    };
    
    // บันทึกใบเสร็จ
    const newReceiptRef = database.ref('receipts').push();
    
    newReceiptRef.set(receipt)
        .then(() => {
            console.log('บันทึกใบเสร็จสำเร็จ');
            
            // อัปเดตสต็อกสินค้า
            const updatePromises = cart.map(item => {
                const productRef = database.ref(`products/${item.id}`);
                return productRef.once('value').then(snapshot => {
                    const product = snapshot.val();
                    const newStock = product.stock - item.quantity;
                    return productRef.update({ stock: newStock });
                });
            });

            return Promise.all(updatePromises);
        })
        .then(() => {
            console.log('อัปเดตสต็อกสินค้าสำเร็จ');
            
            // ล้างตะกร้า
            cart = [];
            renderCart();
            
            // แสดงเลขที่ใบเสร็จ
            const receiptId = newReceiptRef.key.substring(0, 8);
            alert(`ชำระเงินสำเร็จ!\nเลขที่ใบเสร็จ: ${receiptId}\nรวมสุทธิ: ${receipt.total.toFixed(2)} บาท`);
            
            // โหลดข้อมูลใหม่
            loadProducts();
            loadReceipts();
        })
        .catch(error => {
            console.error('เกิดข้อผิดพลาดในการชำระเงิน:', error);
            alert('เกิดข้อผิดพลาดในการชำระเงิน: ' + error.message);
        });
}

// Calculate subtotal
function calculateSubtotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// Calculate total
function calculateTotal() {
    return calculateSubtotal();
}

// Update product stocks after sale
function updateProductStocks() {
    const updates = {};
    
    cart.forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (product) {
            updates[`products/${item.id}/stock`] = product.stock - item.quantity;
        }
    });
    
    return database.ref().update(updates);
}

// Render products table
function renderProductsTable() {
    const tbody = document.getElementById('products-table-body');
    tbody.innerHTML = '';
    
    products.forEach(product => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${product.image || 'https://via.placeholder.com/50'}" alt="${product.name}" style="width:50px;height:50px;object-fit:cover;"></td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>${product.price.toFixed(2)}</td>
            <td>${product.cost ? product.cost.toFixed(2) : '0.00'}</td>
            <td>${product.stock}</td>
            <td class="table-actions">
                <button class="btn-secondary edit-product" data-id="${product.id}"><i class="fas fa-edit"></i></button>
                <button class="btn-danger delete-product" data-id="${product.id}"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    // Add event listeners for edit and delete buttons
    document.querySelectorAll('.edit-product').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = e.target.closest('button').dataset.id;
            showEditProductModal(productId);
        });
    });
    
    document.querySelectorAll('.delete-product').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = e.target.closest('button').dataset.id;
            deleteProduct(productId);
        });
    });
}

// Show add product modal
function showAddProductModal() {
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <h2 class="modal-title">เพิ่มสินค้าใหม่</h2>
        <form id="add-product-form">
            <div class="form-group">
                <label for="product-name">ชื่อสินค้า</label>
                <input type="text" id="product-name" required>
            </div>
            <div class="form-group">
                <label for="product-category">หมวดหมู่</label>
                <select id="product-category" required>
                    <option value="">เลือกหมวดหมู่</option>
                    ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="product-price">ราคาขาย</label>
                <input type="number" id="product-price" min="0" step="0.01" required>
            </div>
            <div class="form-group">
                <label for="product-cost">ราคาต้นทุน</label>
                <input type="number" id="product-cost" min="0" step="0.01" required>
            </div>
            <div class="form-group">
                <label for="product-stock">จำนวนคงเหลือ</label>
                <input type="number" id="product-stock" min="0" required>
            </div>
            <div class="form-group">
                <label for="product-image">รูปภาพ (URL)</label>
                <input type="text" id="product-image">
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeModal()">ยกเลิก</button>
                <button type="submit" class="btn-primary">บันทึก</button>
            </div>
        </form>
    `;
    
    document.getElementById('add-product-form').addEventListener('submit', (e) => {
        e.preventDefault();
        addProduct();
    });
    
    document.getElementById('modal').style.display = 'block';
}

// Add new product
function addProduct() {
    const product = {
        name: document.getElementById('product-name').value,
        category: document.getElementById('product-category').value,
        price: parseFloat(document.getElementById('product-price').value),
        cost: parseFloat(document.getElementById('product-cost').value),
        stock: parseInt(document.getElementById('product-stock').value),
        image: document.getElementById('product-image').value || null
    };
    
    database.ref('products').push(product)
        .then(() => {
            alert('เพิ่มสินค้าสำเร็จ!');
            closeModal();
        })
        .catch(error => {
            console.error('Error adding product:', error);
            alert('เกิดข้อผิดพลาดในการเพิ่มสินค้า');
        });
}

// Show edit product modal
function showEditProductModal(productId) {
    const product = products.find(p => p.id === productId);
    
    if (!product) return;
    
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <h2 class="modal-title">แก้ไขสินค้า</h2>
        <form id="edit-product-form">
            <div class="form-group">
                <label for="edit-product-name">ชื่อสินค้า</label>
                <input type="text" id="edit-product-name" value="${product.name}" required>
            </div>
            <div class="form-group">
                <label for="edit-product-category">หมวดหมู่</label>
                <select id="edit-product-category" required>
                    ${categories.map(cat => 
                        `<option value="${cat}" ${cat === product.category ? 'selected' : ''}>${cat}</option>`
                    ).join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="edit-product-price">ราคาขาย</label>
                <input type="number" id="edit-product-price" value="${product.price}" min="0" step="0.01" required>
            </div>
            <div class="form-group">
                <label for="edit-product-cost">ราคาต้นทุน</label>
                <input type="number" id="edit-product-cost" value="${product.cost || 0}" min="0" step="0.01" required>
            </div>
            <div class="form-group">
                <label for="edit-product-stock">จำนวนคงเหลือ</label>
                <input type="number" id="edit-product-stock" value="${product.stock}" min="0" required>
            </div>
            <div class="form-group">
                <label for="edit-product-image">รูปภาพ (URL)</label>
                <input type="text" id="edit-product-image" value="${product.image || ''}">
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeModal()">ยกเลิก</button>
                <button type="submit" class="btn-primary">บันทึก</button>
            </div>
        </form>
    `;
    
    document.getElementById('edit-product-form').addEventListener('submit', (e) => {
        e.preventDefault();
        updateProduct(productId);
    });
    
    document.getElementById('modal').style.display = 'block';
}

// Update product
function updateProduct(productId) {
    const product = {
        name: document.getElementById('edit-product-name').value,
        category: document.getElementById('edit-product-category').value,
        price: parseFloat(document.getElementById('edit-product-price').value),
        cost: parseFloat(document.getElementById('edit-product-cost').value),
        stock: parseInt(document.getElementById('edit-product-stock').value),
        image: document.getElementById('edit-product-image').value || null
    };
    
    database.ref(`products/${productId}`).update(product)
        .then(() => {
            alert('อัปเดตสินค้าสำเร็จ!');
            closeModal();
        })
        .catch(error => {
            console.error('Error updating product:', error);
            alert('เกิดข้อผิดพลาดในการอัปเดตสินค้า');
        });
}

// Delete product
function deleteProduct(productId) {
    if (confirm('คุณต้องการลบสินค้านี้หรือไม่?')) {
        database.ref(`products/${productId}`).remove()
            .then(() => {
                alert('ลบสินค้าสำเร็จ!');
            })
            .catch(error => {
                console.error('Error deleting product:', error);
                alert('เกิดข้อผิดพลาดในการลบสินค้า');
            });
    }
}

// Load expenses from Firebase
function loadExpenses() {
    database.ref('expenses').on('value', (snapshot) => {
        const expenses = [];
        const data = snapshot.val();
        if (data) {
            for (const id in data) {
                expenses.push({ id, ...data[id] });
            }
        }
        renderExpensesTable(expenses);
    });
}

// Render expenses table
function renderExpensesTable(expenses) {
    const tbody = document.getElementById('expenses-table-body');
    tbody.innerHTML = '';
    
    expenses.forEach(expense => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatDate(expense.date)}</td>
            <td>${expense.category}</td>
            <td>${expense.description}</td>
            <td>${expense.amount.toFixed(2)}</td>
            <td>${expense.notes || '-'}</td>
            <td class="table-actions">
                <button class="btn-secondary edit-expense" data-id="${expense.id}"><i class="fas fa-edit"></i></button>
                <button class="btn-danger delete-expense" data-id="${expense.id}"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    // Add event listeners for edit and delete buttons
    document.querySelectorAll('.edit-expense').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const expenseId = e.target.closest('button').dataset.id;
            showEditExpenseModal(expenseId);
        });
    });
    
    document.querySelectorAll('.delete-expense').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const expenseId = e.target.closest('button').dataset.id;
            deleteExpense(expenseId);
        });
    });
}

// Show add expense modal
function showAddExpenseModal() {
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <h2 class="modal-title">เพิ่มรายจ่าย</h2>
        <form id="add-expense-form">
            <div class="form-group">
                <label for="expense-date">วันที่</label>
                <input type="date" id="expense-date" required>
            </div>
            <div class="form-group">
                <label for="expense-category">หมวดหมู่</label>
                <select id="expense-category" required>
                    <option value="">เลือกหมวดหมู่</option>
                    ${expenseCategories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="expense-description">รายการ</label>
                <input type="text" id="expense-description" required>
            </div>
            <div class="form-group">
                <label for="expense-amount">จำนวนเงิน</label>
                <input type="number" id="expense-amount" min="0" step="0.01" required>
            </div>
            <div class="form-group">
                <label for="expense-notes">หมายเหตุ</label>
                <textarea id="expense-notes"></textarea>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeModal()">ยกเลิก</button>
                <button type="submit" class="btn-primary">บันทึก</button>
            </div>
        </form>
    `;
    
    // Set default date to today
    document.getElementById('expense-date').valueAsDate = new Date();
    
    document.getElementById('add-expense-form').addEventListener('submit', (e) => {
        e.preventDefault();
        addExpense();
    });
    
    document.getElementById('modal').style.display = 'block';
}

// Add new expense
function addExpense() {
    const expense = {
        date: document.getElementById('expense-date').value,
        category: document.getElementById('expense-category').value,
        description: document.getElementById('expense-description').value,
        amount: parseFloat(document.getElementById('expense-amount').value),
        notes: document.getElementById('expense-notes').value || null
    };
    
    database.ref('expenses').push(expense)
        .then(() => {
            alert('เพิ่มรายจ่ายสำเร็จ!');
            closeModal();
        })
        .catch(error => {
            console.error('Error adding expense:', error);
            alert('เกิดข้อผิดพลาดในการเพิ่มรายจ่าย');
        });
}

// Show edit expense modal
function showEditExpenseModal(expenseId) {
    database.ref(`expenses/${expenseId}`).once('value')
        .then(snapshot => {
            const expense = snapshot.val();
            if (!expense) return;
            
            const modalBody = document.getElementById('modal-body');
            modalBody.innerHTML = `
                <h2 class="modal-title">แก้ไขรายจ่าย</h2>
                <form id="edit-expense-form">
                    <div class="form-group">
                        <label for="edit-expense-date">วันที่</label>
                        <input type="date" id="edit-expense-date" value="${expense.date}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-expense-category">หมวดหมู่</label>
                        <select id="edit-expense-category" required>
                            ${expenseCategories.map(cat => 
                                `<option value="${cat}" ${cat === expense.category ? 'selected' : ''}>${cat}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="edit-expense-description">รายการ</label>
                        <input type="text" id="edit-expense-description" value="${expense.description}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-expense-amount">จำนวนเงิน</label>
                        <input type="number" id="edit-expense-amount" value="${expense.amount}" min="0" step="0.01" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-expense-notes">หมายเหตุ</label>
                        <textarea id="edit-expense-notes">${expense.notes || ''}</textarea>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="closeModal()">ยกเลิก</button>
                        <button type="submit" class="btn-primary">บันทึก</button>
                    </div>
                </form>
            `;
            
            document.getElementById('edit-expense-form').addEventListener('submit', (e) => {
                e.preventDefault();
                updateExpense(expenseId);
            });
            
            document.getElementById('modal').style.display = 'block';
        });
}

// Update expense
function updateExpense(expenseId) {
    const expense = {
        date: document.getElementById('edit-expense-date').value,
        category: document.getElementById('edit-expense-category').value,
        description: document.getElementById('edit-expense-description').value,
        amount: parseFloat(document.getElementById('edit-expense-amount').value),
        notes: document.getElementById('edit-expense-notes').value || null
    };
    
    database.ref(`expenses/${expenseId}`).update(expense)
        .then(() => {
            alert('อัปเดตรายจ่ายสำเร็จ!');
            closeModal();
        })
        .catch(error => {
            console.error('Error updating expense:', error);
            alert('เกิดข้อผิดพลาดในการอัปเดตรายจ่าย');
        });
}

// Delete expense
function deleteExpense(expenseId) {
    if (confirm('คุณต้องการลบรายจ่ายนี้หรือไม่?')) {
        database.ref(`expenses/${expenseId}`).remove()
            .then(() => {
                alert('ลบรายจ่ายสำเร็จ!');
            })
            .catch(error => {
                console.error('Error deleting expense:', error);
                alert('เกิดข้อผิดพลาดในการลบรายจ่าย');
            });
    }
}

// Filter expenses
function filterExpenses() {
    const category = document.getElementById('expense-category-filter').value;
    const date = document.getElementById('expense-date-filter').value;
    
    let query = database.ref('expenses');
    
    if (category !== 'all') {
        query = query.orderByChild('category').equalTo(category);
    }
    
    if (date) {
        // This is a simplified date filter - for production you'd need a more robust solution
        query = query.orderByChild('date').equalTo(date);
    }
    
    query.once('value')
        .then(snapshot => {
            const expenses = [];
            const data = snapshot.val();
            if (data) {
                for (const id in data) {
                    expenses.push({ id, ...data[id] });
                }
            }
            renderExpensesTable(expenses);
        });
}

// Reset expenses filter
function resetExpensesFilter() {
    document.getElementById('expense-category-filter').value = 'all';
    document.getElementById('expense-date-filter').value = '';
    loadExpenses();
}

// Load inventory history
function loadInventoryHistory() {
    // แสดง loading state
    const tbody = document.getElementById('inventory-history-body');
    tbody.innerHTML = '<tr><td colspan="7">กำลังโหลดข้อมูล...</td></tr>';
    
    database.ref('inventory').orderByChild('date').once('value')
        .then(snapshot => {
            const history = [];
            const data = snapshot.val();
            
            if (data) {
                for (const id in data) {
                    history.push({ 
                        id, 
                        ...data[id],
                        // ตรวจสอบและกำหนดค่าเริ่มต้นหากไม่มี
                        costPerUnit: data[id].costPerUnit || 0,
                        totalCost: data[id].totalCost || 0
                    });
                }
            }
            
            // เรียงลำดับจากวันที่ล่าสุด
            history.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            if (history.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7">ไม่มีประวัติการรับสินค้า</td></tr>';
            } else {
                renderInventoryHistory(history);
            }
        })
        .catch(error => {
            console.error('Error loading inventory:', error);
            tbody.innerHTML = '<tr><td colspan="7">เกิดข้อผิดพลาดในการโหลดข้อมูล</td></tr>';
        });
}

// Render inventory history
function renderInventoryHistory(history) {
    const tbody = document.getElementById('inventory-history-body');
    tbody.innerHTML = '';
    
    history.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatDate(item.date)}</td>
            <td>${item.productName}</td>
            <td>${item.quantity}</td>
            <td>${item.costPerUnit.toFixed(2)}</td>
            <td>${item.totalCost.toFixed(2)}</td>
            <td>${item.supplier || '-'}</td>
            <td class="table-actions">
                <button class="btn-danger delete-inventory-btn" data-id="${item.id}">
                    <i class="fas fa-trash"></i> ลบ
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    // Add Event Listener สำหรับปุ่มลบ
    document.querySelectorAll('.delete-inventory-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const inventoryId = this.getAttribute('data-id');
            deleteInventoryRecord(inventoryId);
        });
    });
}

// Load products for select dropdown
function loadProductsForSelect() {
    database.ref('products').once('value')
        .then(snapshot => {
            const select = document.getElementById('inventory-product-select');
            select.innerHTML = '<option value="">เลือกสินค้าจากรายการ</option>';
            
            const data = snapshot.val();
            if (data) {
                for (const id in data) {
                    const product = data[id];
                    const option = document.createElement('option');
                    option.value = id;
                    option.textContent = product.name;
                    select.appendChild(option);
                }
            }
        });
}

// Calculate inventory total
function calculateInventoryTotal() {
    const quantity = parseInt(document.getElementById('inventory-quantity').value) || 0;
    const cost = parseFloat(document.getElementById('inventory-cost').value) || 0;
    const total = quantity * cost;
    
    document.getElementById('inventory-total').value = total.toFixed(2);
}

// Process inventory
function processInventory() {
    const productSelect = document.getElementById('inventory-product-select');
    const productName = document.getElementById('inventory-product-name').value;
    const category = document.getElementById('inventory-product-category').value;
    const quantity = parseInt(document.getElementById('inventory-quantity').value);
    const costPerUnit = parseFloat(document.getElementById('inventory-cost').value);
    const totalCost = quantity * costPerUnit;
    const supplier = document.getElementById('inventory-supplier').value;
    const date = document.getElementById('inventory-date').value;
    const notes = document.getElementById('inventory-notes').value;
    
    // ตรวจสอบข้อมูล
    if (!productName || !quantity || !costPerUnit || !supplier || !date) {
        alert('กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
    }
    
    // สร้างวัตถุสินค้าเข้า
    const inventoryItem = {
        date,
        productName,
        category,
        quantity,
        costPerUnit,
        totalCost,
        supplier,
        notes: notes || null
    };
    
    // ตรวจสอบว่าเป็นสินค้าใหม่หรือมีอยู่แล้ว
    const productId = productSelect.value;
    
    if (productId) {
        // อัปเดตสินค้าที่มีอยู่
        updateExistingProduct(productId, quantity, costPerUnit, inventoryItem);
    } else {
        // เพิ่มสินค้าใหม่
        addNewProduct(quantity, costPerUnit, inventoryItem);
    }
}

// Update existing product
function updateExistingProduct(productId, quantity, costPerUnit, inventoryItem) {
    // ดึงข้อมูลสินค้าปัจจุบัน
    database.ref(`products/${productId}`).once('value')
        .then(snapshot => {
            const product = snapshot.val();
            const updates = {};
            
            // คำนวณสต็อกใหม่
            updates.stock = (product.stock || 0) + quantity;
            
            // อัปเดตราคาต้นทุน (เฉลี่ย)
            if (product.cost) {
                const totalUnits = (product.stock || 0) + quantity;
                const totalCost = (product.cost * (product.stock || 0)) + (costPerUnit * quantity);
                updates.cost = totalCost / totalUnits;
            } else {
                updates.cost = costPerUnit;
            }
            
            // อัปเดตสินค้า
            return database.ref(`products/${productId}`).update(updates)
                .then(() => inventoryItem);
        })
        .then(inventoryItem => {
            // บันทึกประวัติการรับสินค้า
            saveInventoryRecord(inventoryItem);
            
            // บันทึกรายจ่าย
            saveInventoryExpense(inventoryItem);
            
            // รีเซ็ตฟอร์ม
            resetInventoryForm();
            
            alert('รับสินค้าเข้าและอัปเดตสินค้าสำเร็จ!');
        })
        .catch(error => {
            console.error('Error updating product:', error);
            alert('เกิดข้อผิดพลาดในการอัปเดตสินค้า');
        });
}

// Add new product from inventory
function addNewProduct(quantity, costPerUnit, inventoryItem) {
    const newProduct = {
        name: inventoryItem.productName,
        category: inventoryItem.category,
        cost: costPerUnit,
        price: costPerUnit * 1.3, // ตั้งราคาขายเพิ่ม 30%
        stock: quantity,
        image: null
    };
    
    // เพิ่มสินค้าใหม่
    database.ref('products').push(newProduct)
        .then(() => inventoryItem)
        .then(inventoryItem => {
            // บันทึกประวัติการรับสินค้า
            saveInventoryRecord(inventoryItem);
            
            // บันทึกรายจ่าย
            saveInventoryExpense(inventoryItem);
            
            // รีเซ็ตฟอร์ม
            resetInventoryForm();
            
            alert('เพิ่มสินค้าใหม่และรับเข้าสต็อกสำเร็จ!');
        })
        .catch(error => {
            console.error('Error adding new product:', error);
            alert('เกิดข้อผิดพลาดในการเพิ่มสินค้าใหม่');
        });
}

// Save inventory record
function saveInventoryRecord(inventoryItem) {
    database.ref('inventory').push(inventoryItem)
        .then(() => loadInventoryHistory())
        .catch(error => console.error('Error saving inventory record:', error));
}

// Save inventory expense
function saveInventoryExpense(inventoryItem) {
    const expense = {
        date: inventoryItem.date,
        category: 'สั่งซื้อสินค้า',
        description: `สั่งซื้อ ${inventoryItem.productName} จาก ${inventoryItem.supplier}`,
        amount: inventoryItem.totalCost,
        notes: inventoryItem.notes || null
    };
    
    database.ref('expenses').push(expense)
        .catch(error => console.error('Error saving inventory expense:', error));
}

// Delete inventory record
function deleteInventoryRecord(inventoryId) {
    if (!inventoryId) {
        alert('ไม่พบรหัสรายการรับสินค้า');
        return;
    }

    if (confirm('คุณต้องการลบรายการรับสินค้านี้หรือไม่? การลบจะไม่สามารถกู้คืนได้')) {
        // 1. ดึงข้อมูลรายการที่จะลบเพื่อตรวจสอบ
        database.ref(`inventory/${inventoryId}`).once('value')
            .then(snapshot => {
                const inventoryItem = snapshot.val();
                if (!inventoryItem) {
                    throw new Error('ไม่พบรายการรับสินค้านี้ในระบบ');
                }

                // 2. ดึงข้อมูลสินค้าที่เกี่ยวข้อง
                return database.ref('products').orderByChild('name').equalTo(inventoryItem.productName).once('value')
                    .then(productSnapshot => {
                        const updates = {};
                        let productFound = false;

                        // 3. อัปเดตสต็อกสินค้ากลับคืน (หากพบสินค้า)
                        productSnapshot.forEach(childSnapshot => {
                            const product = childSnapshot.val();
                            const newStock = product.stock - inventoryItem.quantity;
                            
                            if (newStock >= 0) {
                                updates[`products/${childSnapshot.key}/stock`] = newStock;
                                productFound = true;
                            }
                        });

                        // 4. ถ้าพบสินค้า ให้อัปเดตสต็อก
                        if (productFound) {
                            return database.ref().update(updates)
                                .then(() => inventoryId);
                        }
                        return inventoryId;
                    });
            })
            .then(inventoryId => {
                // 5. ลบรายการรับสินค้า
                return database.ref(`inventory/${inventoryId}`).remove();
            })
            .then(() => {
                alert('ลบรายการรับสินค้าสำเร็จ');
                loadInventoryHistory(); // โหลดประวัติใหม่
            })
            .catch(error => {
                console.error('เกิดข้อผิดพลาดในการลบ:', error);
                alert('เกิดข้อผิดพลาด: ' + error.message);
            });
    }
}

// Reset inventory form
function resetInventoryForm() {
    document.getElementById('inventory-form').reset();
    document.getElementById('inventory-date').valueAsDate = new Date();
    document.getElementById('inventory-total').value = '';
    document.getElementById('inventory-product-select').value = '';
}

// Load receipts from Firebase
function loadReceipts() {
    database.ref('receipts').on('value', (snapshot) => {
        const receipts = [];
        const data = snapshot.val();
        if (data) {
            for (const id in data) {
                receipts.push({ id, ...data[id] });
            }
        }
        renderReceiptsTable(receipts);
    });
}

// Render receipts table
function renderReceiptsTable(receipts) {
    const tbody = document.getElementById('receipts-table-body');
    tbody.innerHTML = '';
    
    receipts.forEach(receipt => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${receipt.id.substring(0, 8)}</td>
            <td>${formatDate(receipt.date)}</td>
            <td>${receipt.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
            <td>${receipt.total.toFixed(2)}</td>
            <td class="table-actions">
                <button class="btn-secondary view-receipt" data-id="${receipt.id}"><i class="fas fa-eye"></i></button>
                <button class="btn-danger delete-receipt" data-id="${receipt.id}"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    // Add event listeners for view and delete buttons
    document.querySelectorAll('.view-receipt').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const receiptId = e.target.closest('button').dataset.id;
            viewReceipt(receiptId);
        });
    });
    
    document.querySelectorAll('.delete-receipt').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const receiptId = e.target.closest('button').dataset.id;
            deleteReceipt(receiptId);
        });
    });
}

// View receipt details
function viewReceipt(receiptId) {
    database.ref(`receipts/${receiptId}`).once('value')
        .then(snapshot => {
            const receipt = snapshot.val();
            if (!receipt) return;
            
            const modalBody = document.getElementById('modal-body');
            modalBody.innerHTML = `
                <h2 class="modal-title">ใบเสร็จ #${receiptId.substring(0, 8)}</h2>
                <div class="receipt-info">
                    <p><strong>วันที่:</strong> ${formatDate(receipt.date)}</p>
                </div>
                <div class="receipt-items">
                    <h3>รายการสินค้า</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>สินค้า</th>
                                <th>จำนวน</th>
                                <th>ราคา</th>
                                <th>รวม</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${receipt.items.map(item => `
                                <tr>
                                    <td>${item.name}</td>
                                    <td>${item.quantity}</td>
                                    <td>${item.price.toFixed(2)}</td>
                                    <td>${(item.price * item.quantity).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="receipt-summary">
                    <div class="summary-row">
                        <span>รวม:</span>
                        <span>${receipt.subtotal.toFixed(2)} ฿</span>
                    </div>
                    <div class="summary-row">
                        <span>ส่วนลด:</span>
                        <span>${receipt.discount ? receipt.discount.toFixed(2) : '0.00'} ฿</span>
                    </div>
                    <div class="summary-row total">
                        <span>รวมสุทธิ:</span>
                        <span>${receipt.total.toFixed(2)} ฿</span>
                    </div>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="closeModal()">ปิด</button>
                    <button type="button" class="btn-primary" onclick="printReceipt('${receiptId}')"><i class="fas fa-print"></i> พิมพ์</button>
                </div>
            `;
            
            document.getElementById('modal').style.display = 'block';
        });
}

// Print receipt
function printReceipt(receiptId) {
    // In a real app, you would implement actual printing functionality
    alert(`พิมพ์ใบเสร็จ #${receiptId.substring(0, 8)}`);
}

// Delete receipt
function deleteReceipt(receiptId) {
    if (confirm('คุณต้องการลบใบเสร็จนี้หรือไม่?')) {
        database.ref(`receipts/${receiptId}`).remove()
            .then(() => {
                alert('ลบใบเสร็จสำเร็จ!');
            })
            .catch(error => {
                console.error('Error deleting receipt:', error);
                alert('เกิดข้อผิดพลาดในการลบใบเสร็จ');
            });
    }
}

// Filter receipts
function filterReceipts() {
    const date = document.getElementById('receipt-date-filter').value;
    
    if (!date) {
        loadReceipts();
        return;
    }
    
    database.ref('receipts').orderByChild('date').startAt(date).endAt(date + '\uf8ff').once('value')
        .then(snapshot => {
            const receipts = [];
            const data = snapshot.val();
            if (data) {
                for (const id in data) {
                    receipts.push({ id, ...data[id] });
                }
            }
            renderReceiptsTable(receipts);
        });
}

// Reset receipts filter
function resetReceiptsFilter() {
    document.getElementById('receipt-date-filter').value = '';
    loadReceipts();
}

// Setup report charts
function setupReportCharts() {
    const ctx = document.getElementById('sales-expense-chart').getContext('2d');
    
    // ถ้ามีกราฟอยู่แล้วให้ทำลายก่อนสร้างใหม่
    if (salesChart) {
        salesChart.destroy();
    }
    
    // สร้างกราฟเปล่าๆ ก่อน
    salesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'รายรับ',
                    data: [],
                    backgroundColor: 'rgba(75, 192, 192, 0.7)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                },
                {
                    label: 'รายจ่าย',
                    data: [],
                    backgroundColor: 'rgba(255, 99, 132, 0.7)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'จำนวนเงิน (บาท)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'วันที่'
                    }
                }
            }
        }
    });
}

// Change report period
function changeReportPeriod(e) {
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    e.target.classList.add('active');
    currentReportPeriod = e.target.dataset.period;
    generateReport();
}

// Generate report
function generateReport() {
    const selectedDate = document.getElementById('report-date').value;
    
    if (!selectedDate) {
        alert('กรุณาเลือกวันที่');
        return;
    }
    
    // คำนวนวันที่เริ่มต้นและสิ้นสุดตามช่วงเวลา
    const dateRange = calculateDateRange(selectedDate, currentReportPeriod);
    
    // ดึงข้อมูลจาก Firebase
    Promise.all([
        fetchSalesData(dateRange),
        fetchExpensesData(dateRange)
    ]).then(([salesData, expensesData]) => {
        // คำนวณยอดรวม
        const totalIncome = calculateTotalIncome(salesData);
        const totalExpense = calculateTotalExpenses(expensesData);
        const netProfit = totalIncome - totalExpense;
        
        // อัปเดตการ์ดสรุป
        document.getElementById('total-income').textContent = totalIncome.toFixed(2) + ' ฿';
        document.getElementById('total-expense').textContent = totalExpense.toFixed(2) + ' ฿';
        document.getElementById('net-profit').textContent = netProfit.toFixed(2) + ' ฿';
        
        // สร้างกราฟ
        renderChart(salesData, expensesData, dateRange);
        
        // สร้างตารางสินค้าขายดี
        renderTopProducts(salesData);
        
        // สร้างตารางรายจ่ายหลัก
        renderTopExpenses(expensesData);
    }).catch(error => {
        console.error('Error generating report:', error);
        alert('เกิดข้อผิดพลาดในการสร้างรายงาน');
    });
}

// Calculate date range
function calculateDateRange(dateString, period) {
    const date = new Date(dateString);
    const startDate = new Date(date);
    const endDate = new Date(date);
    
    switch(period) {
        case 'day':
            endDate.setDate(endDate.getDate() + 1);
            break;
        case 'week':
            startDate.setDate(date.getDate() - date.getDay()); // เริ่มต้นวันอาทิตย์
            endDate.setDate(startDate.getDate() + 7);
            break;
        case 'month':
            startDate.setDate(1);
            endDate.setMonth(endDate.getMonth() + 1);
            endDate.setDate(0);
            break;
        case 'year':
            startDate.setMonth(0);
            startDate.setDate(1);
            endDate.setMonth(11);
            endDate.setDate(31);
            break;
    }
    
    return {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
    };
}

// Fetch sales data
function fetchSalesData(dateRange) {
    return database.ref('receipts')
        .orderByChild('date')
        .startAt(dateRange.start)
        .endAt(dateRange.end)
        .once('value')
        .then(snapshot => {
            const sales = [];
            const data = snapshot.val();
            
            if (data) {
                for (const id in data) {
                    sales.push({ id, ...data[id] });
                }
            }
            
            return sales;
        });
}

// Fetch expenses data
function fetchExpensesData(dateRange) {
    return database.ref('expenses')
        .orderByChild('date')
        .startAt(dateRange.start)
        .endAt(dateRange.end)
        .once('value')
        .then(snapshot => {
            const expenses = [];
            const data = snapshot.val();
            
            if (data) {
                for (const id in data) {
                    expenses.push({ id, ...data[id] });
                }
            }
            
            return expenses;
        });
}

// Calculate total income
function calculateTotalIncome(salesData) {
    return salesData.reduce((sum, sale) => sum + sale.total, 0);
}

// Calculate total expenses
function calculateTotalExpenses(expensesData) {
    return expensesData.reduce((sum, expense) => sum + expense.amount, 0);
}

// Render chart
function renderChart(salesData, expensesData, dateRange) {
    const ctx = document.getElementById('sales-expense-chart').getContext('2d');
    
    // กรองข้อมูลตามวันที่และจัดกลุ่ม
    const dates = getDateLabels(dateRange);
    const salesByDate = groupDataByDate(salesData, dates, 'total');
    const expensesByDate = groupDataByDate(expensesData, dates, 'amount');
    
    // อัปเดตกราฟ
    salesChart.data.labels = dates;
    salesChart.data.datasets[0].data = salesByDate;
    salesChart.data.datasets[1].data = expensesByDate;
    salesChart.update();
}

// Render top products
function renderTopProducts(salesData) {
    // นับจำนวนสินค้าที่ขาย
    const productSales = {};
    
    salesData.forEach(sale => {
        sale.items.forEach(item => {
            if (!productSales[item.name]) {
                productSales[item.name] = {
                    quantity: 0,
                    total: 0
                };
            }
            
            productSales[item.name].quantity += item.quantity;
            productSales[item.name].total += item.price * item.quantity;
        });
    });
    
    // เรียงลำดับตามจำนวนขาย
    const sortedProducts = Object.entries(productSales)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5); // เลือกมา 5 อันดับแรก
    
    // แสดงผลในตาราง
    const tbody = document.getElementById('top-products-body');
    tbody.innerHTML = '';
    
    sortedProducts.forEach((product, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${product.name}</td>
            <td>${product.quantity}</td>
            <td>${product.total.toFixed(2)}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Render top expenses
function renderTopExpenses(expensesData) {
    // จัดกลุ่มรายจ่ายตามหมวดหมู่
    const expenseByCategory = {};
    const totalExpense = expensesData.reduce((sum, exp) => sum + exp.amount, 0);
    
    expensesData.forEach(expense => {
        if (!expenseByCategory[expense.category]) {
            expenseByCategory[expense.category] = 0;
        }
        
        expenseByCategory[expense.category] += expense.amount;
    });
    
    // เรียงลำดับตามจำนวนเงิน
    const sortedExpenses = Object.entries(expenseByCategory)
        .map(([category, amount]) => ({
            category,
            amount,
            percentage: totalExpense > 0 ? (amount / totalExpense * 100) : 0
        }))
        .sort((a, b) => b.amount - a.amount);
    
    // แสดงผลในตาราง
    const tbody = document.getElementById('top-expenses-body');
    tbody.innerHTML = '';
    
    sortedExpenses.forEach(expense => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${expense.category}</td>
            <td>${expense.amount.toFixed(2)}</td>
            <td>${expense.percentage.toFixed(1)}%</td>
        `;
        tbody.appendChild(tr);
    });
}

// Helper function to get date labels
function getDateLabels(dateRange) {
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    const dates = [];
    
    while (start <= end) {
        dates.push(start.toISOString().split('T')[0]);
        start.setDate(start.getDate() + 1);
    }
    
    return dates;
}

// Helper function to group data by date
function groupDataByDate(data, dates, valueField) {
    const grouped = {};
    dates.forEach(date => grouped[date] = 0);
    
    data.forEach(item => {
        const date = item.date.split('T')[0];
        if (grouped[date] !== undefined) {
            grouped[date] += item[valueField] || 0;
        }
    });
    
    return dates.map(date => grouped[date]);
}

// Format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('th-TH', options);
}

// Close modal
function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);