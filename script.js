document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initApp();
});
const waterProducts = [
    {
        id: 101,
        name: "น้ำดื่มคริสตัล",
        category: "น้ำดื่ม",
        price: 10,
        cost: 6,
        stock: 100,
        description: "น้ำดื่มบรรจุขวดขนาด 600 มล."
    },
    {
        id: 102,
        name: "น้ำดื่มสิงห์",
        category: "น้ำดื่ม",
        price: 12,
        cost: 7,
        stock: 80,
        description: "น้ำดื่มบรรจุขวดขนาด 600 มล."
    },
    {
        id: 103,
        name: "น้ำแร่สปริงเกิล",
        category: "น้ำดื่ม",
        price: 15,
        cost: 9,
        stock: 60,
        description: "น้ำแร่ธรรมชาติขวด 500 มล."
    }
];
const snackProducts = [
    {
        id: 201,
        name: "ขนมทอดกรอบลยส์",
        category: "ขนม",
        price: 20,
        cost: 12,
        stock: 50,
        description: "ขนมถุงขนาด 50 กรัม"
    },
    {
        id: 202,
        name: "ขนมปังกรอบ",
        category: "ขนม",
        price: 15,
        cost: 8,
        stock: 70,
        description: "ขนมปังกรอบรสชาติเดิม"
    },
    {
        id: 203,
        name: "ช็อกโกแลตคิทแคท",
        category: "ขนม",
        price: 25,
        cost: 15,
        stock: 40,
        description: "ช็อกโกแลตแท่งขนาดมาตรฐาน"
    }
];
const herbProducts = [
    {
        id: 301,
        name: "ยาอบสมุนไพร",
        category: "สมุนไพร",
        price: 150,
        cost: 80,
        stock: 30,
        description: "สมุนไพรอบสำหรับสระผม"
    },
    {
        id: 302,
        name: "น้ำมันไพล",
        category: "สมุนไพร",
        price: 120,
        cost: 60,
        stock: 25,
        description: "น้ำมันไพลบรรจุขวด 50 มล."
    },
    {
        id: 303,
        name: "ชาสมุนไพร",
        category: "สมุนไพร",
        price: 40,
        cost: 20,
        stock: 60,
        description: "ชาสมุนไพรบรรจุซอง 20 ซอง"
    }
];
const otherProducts = [
    {
        id: 401,
        name: "ถ่านไฟฉาย AA",
        category: "อื่นๆ",
        price: 40,
        cost: 25,
        stock: 40,
        description: "ถ่านไฟฉายขนาด AA แพ็ค 2 ก้อน"
    },
    {
        id: 402,
        name: "หลอดไฟ LED",
        category: "อื่นๆ",
        price: 80,
        cost: 50,
        stock: 20,
        description: "หลอดไฟ LED ขนาด 9 วัตต์"
    },
    {
        id: 403,
        name: "แปรงสีฟัน",
        category: "อื่นๆ",
        price: 30,
        cost: 15,
        stock: 50,
        description: "แปรงสีฟันขนนุ่ม"
    }
];
function initApp() {
    // เรียกฟังก์ชันเริ่มต้นต่างๆ
    initNavigation();
    initDateTime();
    initProductManagement();
    initSalesPOS();
    initExpenseManagement();
    initInventoryManagement();
    initReports();
    initModals();
    
    // โหลดข้อมูลเริ่มต้น
    loadInitialData();
    
    // (Optional) สามารถเรียกใช้ addSampleProducts() โดยอัตโนมัติได้หากต้องการ
    // addSampleProducts();
    
    // แสดงส่วน POS เป็นค่าเริ่มต้น
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
        document.getElementById('add-sample-products-btn').addEventListener('click', function() {
        addSampleProducts();
    });
}
function getNextProductId() {
    if (products.length === 0) return 1;
    return Math.max(...products.map(p => p.id)) + 1;
}

// ในฟังก์ชัน addSampleProducts() ควรแก้ไข ID ให้เหมาะสม
function addSampleProducts() {
    // ...
    let nextId = getNextProductId();
    
    const newProducts = [
        ...waterProducts.map(p => ({ ...p, id: nextId++ })),
        ...snackProducts.map(p => ({ ...p, id: nextId++ })),
        // ...
    ];
    
    products = [...products, ...newProducts];
    // ...
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
    // ตั้งค่าหมวดหมู่
    categories = ['น้ำดื่ม', 'ขนม', 'สมุนไพร', 'อื่นๆ'];
    
    // ตรวจสอบว่ามีสินค้าใน localStorage หรือไม่
    const savedProducts = localStorage.getItem('pos-products');
    
    if (!savedProducts) {
        // ถ้าไม่มีข้อมูลใน localStorage ให้ใช้ข้อมูลตัวอย่าง
        products = [
            ...waterProducts,
            ...snackProducts,
            ...herbProducts,
            ...otherProducts
        ];
        localStorage.setItem('pos-products', JSON.stringify(products));
    } else {
        products = JSON.parse(savedProducts);
    }
    
    refreshCategoryFilters();
    refreshProductsGrid();
    refreshProductsTable();
}
function addSampleProducts() {
    // ตรวจสอบว่ามีสินค้าอยู่แล้วหรือไม่
    if (products.length > 0) {
        if (!confirm('ระบบมีสินค้าอยู่แล้ว คุณต้องการเพิ่มสินค้าตัวอย่างซ้ำหรือไม่?')) {
            return;
        }
    }
    
    // เพิ่มสินค้าตัวอย่างทั้งหมด
    products = [
        ...waterProducts,
        ...snackProducts,
        ...herbProducts,
        ...otherProducts
    ];
    
    saveAllData();
    refreshProductsGrid();
    refreshProductsTable();
    showNotification('เพิ่มสินค้าตัวอย่างเรียบร้อยแล้ว');
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
            select.innerHTML = '<option value="all">ทั้งหมด</option>';
        } else {
            select.innerHTML = '<option value="">เลือกหมวดหมู่</option>';
        }
        
        // เพิ่มหมวดหมู่ตามที่กำหนด
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
    const imageInput = document.getElementById('product-image');
    const imagePreview = document.getElementById('product-image-preview');
     imageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // ตรวจสอบขนาดไฟล์ (ไม่เกิน 2MB)
            if (file.size > 2 * 1024 * 1024) {
                showNotification('ขนาดไฟล์รูปภาพไม่ควรเกิน 2MB', 'error');
                return;
            }
            
            // ตรวจสอบประเภทไฟล์
            const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                showNotification('รองรับเฉพาะไฟล์รูปภาพ (JPEG, PNG, GIF)', 'error');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(event) {
                // สร้าง Image object เพื่อตรวจสอบขนาด
                const img = new Image();
                img.onload = function() {
                    // กำหนดขนาดสูงสุดที่ต้องการ
                    const MAX_WIDTH = 800;
                    const MAX_HEIGHT = 800;
                    
                    // คำนวณขนาดใหม่หากรูปใหญ่เกินไป
                    let width = img.width;
                    let height = img.height;
                    
                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }
                    
                    // สร้าง canvas เพื่อปรับขนาดรูปภาพ
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // แสดงตัวอย่างรูปภาพ
                    imagePreview.innerHTML = `<img src="${canvas.toDataURL('image/jpeg', 0.8)}" class="modal-product-image" alt="Preview">`;
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
    
    if (product) {
        // Edit mode
        title.textContent = 'แก้ไขสินค้า';
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
        title.textContent = 'เพิ่มสินค้าใหม่';
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
        // สร้างหัวตารางใหม่
    const thead = document.querySelector('#products-table thead');
    thead.innerHTML = `
        <tr>
            <th>รูปภาพ</th>
            <th>ชื่อสินค้า</th>
            <th>หมวดหมู่</th>
            <th>ราคาขาย</th>
            <th>ต้นทุน</th>
            <th>คงเหลือ</th>
            <th>การดำเนินการ</th>
        </tr>
    `;
    products.forEach(product => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${product.image ? `<img src="${product.image}" alt="${product.name}" class="table-product-image">` : ''}</td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>${formatCurrency(product.price)}</td>
            <td>${formatCurrency(product.cost)}</td>
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
        if (product.stock > 0) {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.setAttribute('data-id', product.id);
            
            card.innerHTML = `
                ${product.image ? `<img src="${product.image}" class="product-image" alt="${product.name}">` : '<div class="product-image"><i class="fas fa-box-open"></i></div>'}
                <div class="product-name">${product.name}</div>
                <div class="product-price">${formatCurrency(product.price)}</div>
                <div class="product-stock">คงเหลือ ${product.stock} ชิ้น</div>
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
    if (!productSelect) return;

    const currentValue = productSelect.value;
    productSelect.innerHTML = '<option value="">เลือกสินค้า</option>';

    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = `${product.name} (คงเหลือ: ${product.stock} ชิ้น)`;
        productSelect.appendChild(option);
    });

    if (currentValue && products.some(p => p.id == currentValue)) {
        productSelect.value = currentValue;
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
                <div class="cart-item-price">=ชิ้นละ ฿${item.price.toFixed(2)} </div>
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
    
    document.getElementById('subtotal').textContent = formatCurrency(subtotal);
    document.getElementById('discount').textContent = formatCurrency(discount);
    document.getElementById('total').textContent = formatCurrency(total);
}

function formatCurrency(amount) {
    // แสดงผลเป็น "฿1,234.56" หรือ "1,234.56 บาท" แล้วแต่ต้องการ
    return '฿' + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    
    // หรือถ้าต้องการแสดงคำว่า "บาท" แทนสัญลักษณ์
    // return amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') + ' บาท';
}

function clearCart() {
    if (cart.length === 0) return;
    
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการล้างตะกร้าสินค้า?')) {
        cart = [];
        refreshCartDisplay();
        showNotification('ล้างตะกร้าสินค้าเรียบร้อยแล้ว');
    }
}

function holdCart() {
    if (cart.length === 0) {
        showNotification('ไม่มีสินค้าในตะกร้า', 'warning');
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
    showNotification('เก็บตะกร้าสินค้าเรียบร้อยแล้ว');
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
        showNotification('ไม่มีสินค้าในตะกร้า', 'warning');
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
    
    showNotification('บันทึกการขายเรียบร้อยแล้ว');
}

function showReceipt(receipt) {
    const receiptContent = document.getElementById('receipt-details-content');
    
    receiptContent.innerHTML = `
        <div class="receipt-header">
            <h3>ใบเสร็จรับเงิน</h3>
            <p>ที่อยู่ร้าน: 123 ถนนหลัก, กรุงเทพฯ</p>
            <p>โทรศัพท์: 02-123-4567</p>
        </div>
        <div class="receipt-info">
            <div>
                <p><strong>เลขที่ใบเสร็จ:</strong> ${receipt.id}</p>
                <p><strong>วันที่:</strong> ${new Date(receipt.date).toLocaleString()}</p>
            </div>
            <div>
                <p><strong>พนักงานขาย:</strong> ผู้ใช้งาน</p>
                <p><strong>วิธีการชำระ:</strong> ${receipt.paymentMethod === 'Cash' ? 'เงินสด' : receipt.paymentMethod === 'Card' ? 'บัตรเครดิต' : 'อื่นๆ'}</p>
            </div>
        </div>
        <div class="receipt-items">
            <div class="receipt-item header">
                <div><strong>รายการ</strong></div>
                <div><strong>จำนวน</strong></div>
                <div><strong>ราคา</strong></div>
            </div>
            ${receipt.items.map(item => `
                <div class="receipt-item">
                    <div>${item.name}</div>
                    <div>${item.quantity} ชิ้น</div>
                    <div>${formatCurrency(item.price * item.quantity)}</div>
                </div>
            `).join('')}
        </div>
        <div class="receipt-totals">
            <div class="receipt-total-row">
                <span>รวม:</span>
                <span>${formatCurrency(receipt.subtotal)}</span>
            </div>
            <div class="receipt-total-row">
                <span>ส่วนลด:</span>
                <span>${formatCurrency(receipt.discount)}</span>
            </div>
            <div class="receipt-total-row total">
                <span>รวมสุทธิ:</span>
                <span>${formatCurrency(receipt.total)}</span>
            </div>
        </div>
        <div class="receipt-footer">
            <p>ขอบคุณที่ใช้บริการ</p>
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
        title.textContent = 'แก้ไขค่าใช้จ่าย';
        document.getElementById('expense-id').value = expense.id;
        document.getElementById('expense-date').value = expense.date.split('T')[0];
        document.getElementById('expense-description').value = expense.description;
        document.getElementById('expense-category').value = expense.category;
        document.getElementById('expense-amount').value = expense.amount;
    } else {
        // Add mode
        title.textContent = 'เพิ่มค่าใช้จ่ายใหม่';
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
    
    const thead = document.querySelector('#expenses-table thead');
    thead.innerHTML = `
        <tr>
            <th>วันที่</th>
            <th>รายการ</th>
            <th>หมวดหมู่</th>
            <th>จำนวนเงิน</th>
            <th>การดำเนินการ</th>
        </tr>
    `;   
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
        title.textContent = 'แก้ไขการรับสินค้า';
        document.getElementById('inventory-id').value = inventoryRecord.id;
        document.getElementById('inventory-date').value = inventoryRecord.date.split('T')[0];
        document.getElementById('inventory-product').value = inventoryRecord.productId;
        document.getElementById('inventory-supplier').value = inventoryRecord.supplier;
        document.getElementById('inventory-quantity').value = inventoryRecord.quantity;
        document.getElementById('inventory-unit-cost').value = inventoryRecord.unitCost;
    } else {
        title.textContent = 'รับสินค้าใหม่';
        form.reset();
        document.getElementById('inventory-id').value = '';
        document.getElementById('inventory-date').valueAsDate = new Date();
    }

    // อัพเดท dropdown เมื่อเปิด modal
    refreshProductSelects();
    
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

    // ตรวจสอบข้อมูล
    if (!inventoryDate || isNaN(inventoryProductId) || !inventorySupplier || 
        isNaN(inventoryQuantity) || isNaN(inventoryUnitCost)) {
        showNotification('กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง', 'error');
        return;
    }

    const product = products.find(p => p.id === inventoryProductId);
    if (!product) {
        showNotification('ไม่พบสินค้าที่เลือก', 'error');
        return;
    }

    if (inventoryId) {
        // แก้ไขการรับสินค้า
        const index = inventory.findIndex(i => i.id == inventoryId);
        if (index !== -1) {
            // คืนจำนวนสินค้าเดิมก่อน
            const prevRecord = inventory[index];
            const prevProduct = products.find(p => p.id === prevRecord.productId);
            if (prevProduct) {
                prevProduct.stock -= prevRecord.quantity;
            }

            // อัพเดทข้อมูล
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

            // เพิ่มจำนวนสินค้าใหม่
            product.stock += inventoryQuantity;
        }
    } else {
        // เพิ่มการรับสินค้าใหม่
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

        // อัพเดทสต็อกสินค้า
        product.stock += inventoryQuantity;
    }

    saveAllData();
    refreshInventoryTable();
    refreshProductsGrid();
    refreshProductsTable();
    refreshProductSelects(); // อัพเดท dropdown ใหม่
    closeAllModals();
    showNotification('บันทึกการรับสินค้าเรียบร้อยแล้ว');
}
function refreshInventoryTable() {
    const tbody = document.getElementById('inventory-table-body');
    tbody.innerHTML = '';
    
    const thead = document.querySelector('#inventory-table thead');
    thead.innerHTML = `
        <tr>
            <th>วันที่</th>
            <th>สินค้า</th>
            <th>ผู้ผลิต/ซัพพลายเออร์</th>
            <th>จำนวน</th>
            <th>ต้นทุนต่อหน่วย</th>
            <th>รวมต้นทุน</th>
            <th>การดำเนินการ</th>
        </tr>
    `;
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
    
    const thead = document.querySelector('#receipts-table thead');
    thead.innerHTML = `
        <tr>
            <th>เลขที่ใบเสร็จ</th>
            <th>วันที่</th>
            <th>จำนวนรายการ</th>
            <th>รวมเงิน</th>
            <th>การชำระเงิน</th>
            <th>การดำเนินการ</th>
        </tr>
    `;  
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
        let periodName = '';
    switch (period) {
        case 'daily': periodName = 'รายวัน'; break;
        case 'weekly': periodName = 'รายสัปดาห์'; break;
        case 'monthly': periodName = 'รายเดือน'; break;
    }
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
    if (type === 'success') {
        notification.className = 'notification show success';
    } else if (type === 'error') {
        notification.className = 'notification show error';
        message = 'ข้อผิดพลาด: ' + message;
    } else if (type === 'warning') {
        notification.className = 'notification show warning';
        message = 'คำเตือน: ' + message;
    }
    
    notification.textContent = message;
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