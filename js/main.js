document.addEventListener('DOMContentLoaded', function() {
    initCarousel();
    initNavigation();
    initQuantitySelector();
    initFormValidation();
    initCartFunctions();
    initUserDisplay();
    initCategoryFilter();
    initPagination();
    initSearchBox();
    initFavoriteButtons();
});

function initCarousel() {
    const slides = document.querySelector('.banner-slides');
    const dots = document.querySelectorAll('.banner-dot');
    const slideElements = document.querySelectorAll('.banner-slide');
    if (!slides || slideElements.length === 0) return;

    let currentSlide = 0;
    const totalSlides = slideElements.length;
    let slideInterval;

    // 全局函数供HTML调用
    window.goToSlide = function(index) {
        currentSlide = index;
        updateSlide();
        resetInterval();
    };

    window.changeSlide = function(direction) {
        currentSlide = (currentSlide + direction + totalSlides) % totalSlides;
        updateSlide();
        resetInterval();
    };

    function updateSlide() {
        // 更新滑动位置
        slides.style.transform = `translateX(-${currentSlide * 100}%)`;

        // 更新指示器
        if (dots.length > 0) {
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === currentSlide);
            });
        }

        // 更新slide的active类（用于动画）
        slideElements.forEach((slide, i) => {
            slide.classList.toggle('active', i === currentSlide);
        });
    }

    function resetInterval() {
        clearInterval(slideInterval);
        slideInterval = setInterval(() => {
            window.changeSlide(1);
        }, 5000);
    }

    // 初始化第一个slide为active
    slideElements[0].classList.add('active');

    // 自动轮播
    resetInterval();
}

function initDateDisplay() {
    const dateElement = document.getElementById('current-date');
    if (!dateElement) return;

    function updateDate() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        const weekDay = weekDays[now.getDay()];
        dateElement.textContent = `${year}年${month}月${day}日 ${weekDay}`;
    }

    updateDate();
    setInterval(updateDate, 60000);
}

function initNavigation() {
    const header = document.querySelector('.header');
    if (!header) return;

    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll > 100) {
            header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.15)';
        } else {
            header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        }
        lastScroll = currentScroll;
    });
}

function initQuantitySelector() {
    // 购物车页面有自己的数量控制逻辑，跳过
    if (document.querySelector('.cart-page')) return;
    
    const minusBtns = document.querySelectorAll('.qty-minus');
    const plusBtns = document.querySelectorAll('.qty-plus');

    minusBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            let value = parseInt(input.value) || 1;
            if (value > 1) {
                input.value = value - 1;
            }
        });
    });

    plusBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            let value = parseInt(input.value) || 1;
            if (value < 99) {
                input.value = value + 1;
            }
        });
    });
}

function initFormValidation() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('username');
            const password = document.getElementById('password');
            let valid = true;

            if (!username.value.trim()) {
                showError(username, '请输入用户名');
                valid = false;
            } else {
                hideError(username);
            }

            if (!password.value.trim()) {
                showError(password, '请输入密码');
                valid = false;
            } else if (password.value.length < 6) {
                showError(password, '密码长度至少6位');
                valid = false;
            } else {
                hideError(password);
            }

            if (valid) {
                // 检查用户是否已注册
                const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
                const user = users.find(u => u.username === username.value.trim());
                
                if (!user) {
                    alert('该用户未注册，请先注册！');
                    switchTab('register');
                    return;
                }
                
                if (user.password !== password.value) {
                    showError(password, '密码错误');
                    return;
                }
                
                localStorage.setItem('loggedInUser', username.value.trim());
                alert('登录成功！');
                window.location.href = 'index.html';
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('reg-username');
            const email = document.getElementById('email');
            const password = document.getElementById('reg-password');
            const confirmPassword = document.getElementById('confirm-password');
            let valid = true;

            if (!username.value.trim()) {
                showError(username, '请输入用户名');
                valid = false;
            } else {
                hideError(username);
            }

            if (!email.value.trim()) {
                showError(email, '请输入邮箱');
                valid = false;
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
                showError(email, '请输入有效的邮箱地址');
                valid = false;
            } else {
                hideError(email);
            }

            if (!password.value.trim()) {
                showError(password, '请输入密码');
                valid = false;
            } else if (password.value.length < 6) {
                showError(password, '密码长度至少6位');
                valid = false;
            } else {
                hideError(password);
            }

            if (confirmPassword.value !== password.value) {
                showError(confirmPassword, '两次输入的密码不一致');
                valid = false;
            } else {
                hideError(confirmPassword);
            }

            if (valid) {
                // 保存注册用户到 localStorage
                const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
                
                // 检查用户名是否已存在
                if (users.find(u => u.username === username.value.trim())) {
                    showError(username, '该用户名已被注册');
                    return;
                }
                
                // 添加新用户
                users.push({
                    username: username.value.trim(),
                    email: email.value.trim(),
                    password: password.value
                });
                
                localStorage.setItem('registeredUsers', JSON.stringify(users));
                alert('注册成功！请登录');
                switchTab('login');
            }
        });
    }
}

function showError(input, message) {
    const formGroup = input.closest('.form-group');
    const error = formGroup.querySelector('.error');
    if (error) {
        error.textContent = message;
        error.style.display = 'block';
    }
    input.style.borderColor = '#e74c3c';
}

function hideError(input) {
    const formGroup = input.closest('.form-group');
    const error = formGroup.querySelector('.error');
    if (error) {
        error.style.display = 'none';
    }
    input.style.borderColor = '#ddd';
}

function initCartFunctions() {
    const addToCartBtns = document.querySelectorAll('.btn-add-cart');
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            alert('商品已添加到购物车！');
        });
    });
}

// ============================================
// 购物车功能
// ============================================

// 获取购物车数据
function getCart() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
}

// 保存购物车数据
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
}

// 更新购物车角标
function updateCartBadge() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // 更新导航栏购物车角标
    const cartLinks = document.querySelectorAll('a[href="cart.html"]');
    cartLinks.forEach(link => {
        // 移除旧的角标
        const oldBadge = link.querySelector('.cart-badge');
        if (oldBadge) oldBadge.remove();
        
        // 添加新角标
        if (totalItems > 0) {
            const badge = document.createElement('span');
            badge.className = 'cart-badge';
            badge.textContent = totalItems;
            link.appendChild(badge);
        }
    });
}

// 添加商品到购物车
function addToCart(productId, productName, productPrice, productImage, productUrl, size, color) {
    const cart = getCart();
    
    // 如果参数是对象形式（从详情页调用）
    if (typeof productId === 'object') {
        const product = productId;
        productId = product.id;
        productName = product.name;
        productPrice = product.price;
        productImage = product.image;
        productUrl = product.url;
        size = product.size;
        color = product.color;
    }
    
    // 查找是否已存在相同商品（相同ID、尺码、颜色）
    const existingItem = cart.find(item => 
        item.id === productId && 
        item.size === (size || '默认') && 
        item.color === (color || '默认')
    );
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        // 新商品添加到数组开头（显示在最上面）
        cart.unshift({
            id: productId,
            name: productName || '商品 ' + productId,
            price: productPrice || '¥0',
            image: productImage || '',
            url: productUrl || '#',
            size: size || '默认',
            color: color || '默认',
            quantity: 1
        });
    }
    
    saveCart(cart);
    alert('商品已添加到购物车！');
}

// 从购物车移除商品
function removeCartItem(productId, size, color) {
    if (!confirm('确定要删除这个商品吗？')) return;
    
    let cart = getCart();
    cart = cart.filter(item => !(item.id === productId && item.size === size && item.color === color));
    saveCart(cart);
    
    // 刷新购物车页面
    renderCartPage();
}

// 更新购物车商品数量
function updateCartItemQuantity(productId, size, color, quantity) {
    const cart = getCart();
    const item = cart.find(item => item.id === productId && item.size === size && item.color === color);

    if (item) {
        const newQuantity = parseInt(quantity);

        // 如果数量减到0，询问是否删除
        if (newQuantity <= 0) {
            if (confirm('商品数量将为0，是否从购物车删除该商品？')) {
                let updatedCart = cart.filter(cartItem => !(cartItem.id === productId && cartItem.size === size && cartItem.color === color));
                saveCart(updatedCart);
                renderCartPage();
            }
            return;
        }

        item.quantity = newQuantity;
        saveCart(cart);
        renderCartPage();
    }
}

// 渲染购物车页面
// 购物车分页相关变量
let cartCurrentPage = 1;
const cartItemsPerPage = 4;

// 订单分页变量
let ordersCurrentPage = 1;
const ordersPerPage = 4;

// 获取选中的购物车商品
function getSelectedCartItems() {
    const selected = localStorage.getItem('selectedCartItems');
    return selected ? JSON.parse(selected) : [];
}

// 保存选中的购物车商品
function saveSelectedCartItems(selected) {
    localStorage.setItem('selectedCartItems', JSON.stringify(selected));
}

// 切换商品选中状态
function toggleCartItemSelection(productId, size, color) {
    const selected = getSelectedCartItems();
    const itemKey = `${productId}_${size}_${color}`;
    const index = selected.indexOf(itemKey);
    
    if (index > -1) {
        selected.splice(index, 1);
    } else {
        selected.push(itemKey);
    }
    
    saveSelectedCartItems(selected);
    renderCartPage();
    updateSelectedCartTotal();
}

// 全选/取消全选
function toggleSelectAll() {
    const cart = getCart();
    const selectAllCheckbox = document.getElementById('selectAll');
    
    if (selectAllCheckbox.checked) {
        // 全选
        const allItems = cart.map(item => `${item.id}_${item.size}_${item.color}`);
        saveSelectedCartItems(allItems);
    } else {
        // 取消全选
        saveSelectedCartItems([]);
    }
    
    renderCartPage();
    updateSelectedCartTotal();
}

// 更新选中商品的总价
function updateSelectedCartTotal() {
    const cart = getCart();
    const selected = getSelectedCartItems();
    
    let total = 0;
    let count = 0;
    
    cart.forEach(item => {
        const itemKey = `${item.id}_${item.size}_${item.color}`;
        if (selected.includes(itemKey)) {
            const price = parseFloat(item.price.replace('¥', ''));
            total += price * item.quantity;
            count += item.quantity;
        }
    });
    
    const totalElement = document.getElementById('cart-total');
    if (totalElement) {
        totalElement.textContent = '¥' + total.toFixed(2);
    }
    
    const countElement = document.getElementById('cart-count');
    if (countElement) {
        countElement.textContent = count + ' 件';
    }
    
    // 更新全选状态
    const selectAllCheckbox = document.getElementById('selectAll');
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = selected.length > 0 && selected.length === cart.length;
    }
    
    // 更新结算按钮文字 - 1件显示"付款"，2件及以上显示"合并付款"
    const checkoutBtn = document.getElementById('btnCheckout');
    if (checkoutBtn) {
        const selectedCount = selected.length;
        if (selectedCount === 0) {
            checkoutBtn.textContent = '付款';
        } else if (selectedCount === 1) {
            checkoutBtn.textContent = '付款';
        } else {
            checkoutBtn.textContent = '合并付款';
        }
    }
}

function renderCartPage() {
    const cartContainer = document.getElementById('cartContainer');
    if (!cartContainer) return;

    const cart = getCart();
    const selected = getSelectedCartItems();

    // 控制结算区域显示
    const cartSummarySection = document.getElementById('cartSummarySection');
    if (cartSummarySection) {
        cartSummarySection.style.display = cart.length > 0 ? 'block' : 'none';
    }

    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="empty-cart">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <p>购物车是空的</p>
                <a href="index.html" class="btn-primary">去逛逛</a>
            </div>
        `;
        // 隐藏分页
        const cartPagination = document.getElementById('cartPagination');
        if (cartPagination) cartPagination.style.display = 'none';
        updateSelectedCartTotal();
        return;
    }

    // 计算分页
    const totalPages = Math.ceil(cart.length / cartItemsPerPage);
    // 确保当前页不超过总页数
    if (cartCurrentPage > totalPages) cartCurrentPage = totalPages;
    if (cartCurrentPage < 1) cartCurrentPage = 1;

    const startIndex = (cartCurrentPage - 1) * cartItemsPerPage;
    const endIndex = startIndex + cartItemsPerPage;
    const currentPageItems = cart.slice(startIndex, endIndex);

    cartContainer.innerHTML = currentPageItems.map(item => {
        const priceNum = parseFloat(item.price.replace('¥', ''));
        const itemTotal = priceNum * item.quantity;
        const itemKey = `${item.id}_${item.size}_${item.color}`;
        const isSelected = selected.includes(itemKey);
        
        return `
            <div class="cart-item ${isSelected ? 'selected' : ''}">
                <div class="cart-item-checkbox">
                    <input type="checkbox" ${isSelected ? 'checked' : ''} onchange="toggleCartItemSelection('${item.id}', '${item.size}', '${item.color}')">
                </div>
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-info">
                    <h3><a href="${item.url}">${item.name}</a></h3>
                    <p class="cart-item-spec">颜色：${item.color} | 尺码：${item.size}</p>
                </div>
                <div class="cart-item-price">${item.price}</div>
                <div class="cart-item-quantity">
                    <button class="qty-btn" onclick="updateCartItemQuantity('${item.id}', '${item.size}', '${item.color}', ${item.quantity - 1})">-</button>
                    <input type="number" value="${item.quantity}" min="1" max="99" onchange="updateCartItemQuantity('${item.id}', '${item.size}', '${item.color}', this.value)">
                    <button class="qty-btn" onclick="updateCartItemQuantity('${item.id}', '${item.size}', '${item.color}', ${item.quantity + 1})">+</button>
                </div>
                <div class="cart-item-total">¥${itemTotal.toFixed(2)}</div>
                <button class="cart-item-remove" onclick="removeCartItem('${item.id}', '${item.size}', '${item.color}')">删除</button>
            </div>
        `;
    }).join('');

    // 渲染分页
    renderCartPagination(totalPages);

    updateSelectedCartTotal();
}

// 渲染购物车分页
function renderCartPagination(totalPages) {
    const paginationContainer = document.getElementById('cartPagination');
    if (!paginationContainer) return;

    // 始终显示分页，即使只有一页
    paginationContainer.style.display = 'flex';

    let html = '';

    // 上一页按钮
    html += `<button onclick="changeCartPage(${cartCurrentPage - 1})" ${cartCurrentPage === 1 ? 'disabled' : ''}>上一页</button>`;

    // 页码按钮
    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="${i === cartCurrentPage ? 'active' : ''}" onclick="changeCartPage(${i})">${i}</button>`;
    }

    // 下一页按钮
    html += `<button onclick="changeCartPage(${cartCurrentPage + 1})" ${cartCurrentPage === totalPages ? 'disabled' : ''}>下一页</button>`;

    paginationContainer.innerHTML = html;
}

// 切换购物车页码
function changeCartPage(page) {
    cartCurrentPage = page;
    renderCartPage();
}

// 更新购物车总价
function updateCartTotal() {
    const cart = getCart();
    let total = 0;
    
    cart.forEach(item => {
        const price = parseFloat(item.price.replace('¥', ''));
        total += price * item.quantity;
    });
    
    const totalElement = document.getElementById('cart-total');
    if (totalElement) {
        totalElement.textContent = '¥' + total.toFixed(2);
    }
    
    // 更新结算金额
    const checkoutTotal = document.getElementById('checkout-total');
    if (checkoutTotal) {
        checkoutTotal.textContent = '¥' + total.toFixed(2);
    }
}

function initUserDisplay() {
    const userActions = document.querySelector('.user-actions');
    if (!userActions) return;

    const loginLink = userActions.querySelector('.login-link');
    const registerLink = userActions.querySelector('.register-link');
    const userMenu = userActions.querySelector('.user-menu');
    const userName = userActions.querySelector('.user-name');
    const logoutBtn = userActions.querySelector('.logout-btn');

    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
        // 隐藏登录/注册按钮
        if (loginLink) loginLink.style.display = 'none';
        if (registerLink) registerLink.style.display = 'none';
        // 显示用户菜单
        if (userMenu) userMenu.style.display = 'block';
        if (userName) userName.textContent = loggedInUser;
        // 绑定退出按钮
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                logout();
            });
        }
    }
}

function logout() {
    localStorage.removeItem('loggedInUser');
    window.location.href = 'index.html';
}

// 检查用户是否登录
function checkLoginStatus() {
    const loggedInUser = localStorage.getItem('loggedInUser');
    return !!loggedInUser;
}

// 显示登录提示
function showLoginPrompt(containerId, message) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
        <div class="login-prompt">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
            </svg>
            <p>${message || '请先登录后再使用此功能'}</p>
            <a href="login.html" class="btn-primary">立即登录</a>
        </div>
    `;
}

// 子分类筛选功能
function initCategoryFilter() {
    const categoryItems = document.querySelectorAll('.sub-category-item');
    const productCards = document.querySelectorAll('.product-card');

    if (categoryItems.length === 0 || productCards.length === 0) return;

    categoryItems.forEach(item => {
        item.addEventListener('click', function() {
            // 移除所有active状态
            categoryItems.forEach(cat => cat.classList.remove('active'));
            // 添加当前active状态
            this.classList.add('active');

            const category = this.getAttribute('data-category');

            // 筛选商品
            productCards.forEach(card => {
                if (category === 'all' || card.getAttribute('data-category') === category) {
                    card.style.display = 'block';
                    // 添加淡入动画
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        card.style.transition = 'all 0.4s ease';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// 分页功能
let currentPage = 1;
const itemsPerPage = 9;

function initPagination() {
    const productGrid = document.querySelector('.products-page .product-grid');
    if (!productGrid) return;

    const allProducts = Array.from(productGrid.querySelectorAll('.product-card'));
    const totalItems = allProducts.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalItems <= itemsPerPage) return; // 商品数量不足一页，不需要分页

    // 保存所有商品数据
    window.allProductsData = allProducts;
    window.totalPages = totalPages;

    // 初始化显示第一页
    showPage(1);
    renderPageNumbers();
    updatePaginationButtons();
}

function showPage(page) {
    const productGrid = document.querySelector('.products-page .product-grid');
    if (!productGrid || !window.allProductsData) return;

    currentPage = page;
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    // 清空当前显示
    productGrid.innerHTML = '';

    // 显示当前页的商品
    const pageProducts = window.allProductsData.slice(startIndex, endIndex);
    pageProducts.forEach(product => {
        productGrid.appendChild(product);
    });

    // 更新页码显示
    const currentPageEl = document.getElementById('currentPage');
    const totalPagesEl = document.getElementById('totalPages');
    if (currentPageEl) currentPageEl.textContent = page;
    if (totalPagesEl) totalPagesEl.textContent = window.totalPages;

    updatePaginationButtons();
    renderPageNumbers();

    // 滚动到页面顶部
    document.querySelector('.products-page').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function changePage(direction) {
    const newPage = currentPage + direction;
    if (newPage >= 1 && newPage <= window.totalPages) {
        showPage(newPage);
    }
}

function goToPage(page) {
    if (page >= 1 && page <= window.totalPages) {
        showPage(page);
    }
}

function updatePaginationButtons() {
    const prevBtn = document.querySelector('.page-btn.prev');
    const nextBtn = document.querySelector('.page-btn.next');

    if (prevBtn) {
        prevBtn.disabled = currentPage === 1;
    }
    if (nextBtn) {
        nextBtn.disabled = currentPage === window.totalPages;
    }
}

function renderPageNumbers() {
    const pageNumbersContainer = document.getElementById('pageNumbers');
    if (!pageNumbersContainer) return;

    pageNumbersContainer.innerHTML = '';

    for (let i = 1; i <= window.totalPages; i++) {
        const pageNumber = document.createElement('button');
        pageNumber.className = 'page-number';
        pageNumber.textContent = i;
        if (i === currentPage) {
            pageNumber.classList.add('active');
        }
        pageNumber.onclick = function() {
            goToPage(i);
        };
        pageNumbersContainer.appendChild(pageNumber);
    }
}

// 商品数据映射表 - 商品名称到详情页的映射
const productMap = {
    '经典休闲衬衫': 'product-detail.html',
    '休闲衬衫': 'product-detail.html',
    '衬衫': 'product-detail.html',
    '时尚印花T恤': 'product-tshirt.html',
    '印花T恤': 'product-tshirt.html',
    'T恤': 'product-tshirt.html',
    '修身牛仔裤': 'product-jeans.html',
    '牛仔裤': 'product-jeans.html',
    '法式连衣裙': 'product-down.html',
    '连衣裙': 'product-down.html',
    '商务休闲外套': 'product-jacket.html',
    '休闲外套': 'product-jacket.html',
    '外套': 'product-jacket.html',
    '纯棉针织衫': 'product-sweater.html',
    '针织衫': 'product-sweater.html',
    '运动休闲裤': 'products.html',
    '休闲裤': 'products.html',
    '时尚连衣裙': 'products.html',
    '连衣裙': 'products.html'
};

// 搜索框功能
function initSearchBox() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    // 回车键搜索
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchProducts();
        }
    });
}

function searchProducts() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    const keyword = searchInput.value.trim();
    if (!keyword) return;

    // 精确匹配商品名称，跳转到对应详情页
    for (const [productName, productUrl] of Object.entries(productMap)) {
        if (keyword.toLowerCase() === productName.toLowerCase() ||
            productName.toLowerCase().includes(keyword.toLowerCase())) {
            window.location.href = productUrl;
            return;
        }
    }

    // 如果没有精确匹配，跳转到商品展示页面并带上搜索参数
    window.location.href = 'products.html?search=' + encodeURIComponent(keyword);
}

// ============================================
// 收藏功能
// ============================================

// 获取收藏列表
function getFavorites() {
    const favorites = localStorage.getItem('favorites');
    return favorites ? JSON.parse(favorites) : [];
}

// 保存收藏列表
function saveFavorites(favorites) {
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

// 添加收藏
function addToFavorite(productId, productName, productPrice, productImage, productUrl) {
    const favorites = getFavorites();
    
    // 检查是否已收藏
    const exists = favorites.some(item => item.id === productId);
    if (exists) {
        alert('该商品已在收藏夹中！');
        return false;
    }
    
    // 添加新收藏
    favorites.push({
        id: productId,
        name: productName,
        price: productPrice,
        image: productImage,
        url: productUrl,
        addTime: new Date().toISOString()
    });
    
    saveFavorites(favorites);
    updateFavoriteButtonState(productId, true);
    alert('已添加到收藏夹！');
    return true;
}

// 移除收藏
function removeFromFavorite(productId) {
    let favorites = getFavorites();
    favorites = favorites.filter(item => item.id !== productId);
    saveFavorites(favorites);
    updateFavoriteButtonState(productId, false);
    
    // 如果在收藏页面，刷新显示
    if (window.location.href.includes('favorites.html')) {
        renderFavoritesPage();
    }
}

// 检查商品是否已收藏
function isFavorite(productId) {
    const favorites = getFavorites();
    return favorites.some(item => item.id === productId);
}

// 更新收藏按钮状态
function updateFavoriteButtonState(productId, isFav) {
    const buttons = document.querySelectorAll(`[data-product-id="${productId}"].btn-favorite, [data-product-id="${productId}"].btn-favorite-detail`);
    buttons.forEach(btn => {
        if (isFav) {
            btn.classList.add('active');
            btn.innerHTML = getHeartIcon(true);
        } else {
            btn.classList.remove('active');
            btn.innerHTML = getHeartIcon(false);
        }
    });
}

// 根据商品ID获取商品详细信息
function getProductInfoById(productId) {
    const productMap = {
        'shirt-001': {
            tag: '热销',
            desc: '优质棉质面料，简约设计，适合各种场合',
            sales: '2.3万+',
            rating: '4.9',
            originalPrice: '¥299',
            defaultSize: 'L',
            defaultColor: '白色'
        },
        'tshirt-001': {
            tag: '新品',
            desc: '潮流印花设计，舒适透气，夏日必备单品',
            sales: '1.8万+',
            rating: '4.8',
            originalPrice: '¥169',
            defaultSize: 'M',
            defaultColor: '黑色'
        },
        'jeans-001': {
            tag: '特惠',
            desc: '经典修身版型，显瘦显高，百搭时尚',
            sales: '3.5万+',
            rating: '4.9',
            originalPrice: '¥399',
            defaultSize: '32',
            defaultColor: '蓝色'
        },
        'down-001': {
            tag: '限量',
            desc: '优雅法式风情，收腰设计，限量发售',
            sales: '8千+',
            rating: '4.9',
            originalPrice: '¥899',
            defaultSize: 'L',
            defaultColor: '灰色'
        },
        'jacket-001': {
            tag: '新品',
            desc: '防风保暖面料，商务休闲两相宜',
            sales: '5千+',
            rating: '4.7',
            originalPrice: '¥599',
            defaultSize: 'XL',
            defaultColor: '黑色'
        },
        'sweater-001': {
            tag: '特惠',
            desc: '100%纯棉面料，柔软亲肤，秋冬必备',
            sales: '2.1万+',
            rating: '4.8',
            originalPrice: '¥259',
            defaultSize: 'L',
            defaultColor: '米色'
        }
    };
    
    return productMap[productId] || {
        tag: '热销',
        desc: '优质商品，值得收藏',
        sales: '1万+',
        rating: '4.8',
        originalPrice: '',
        defaultSize: 'M',
        defaultColor: '默认'
    };
}

// 获取心形图标
function getHeartIcon(filled) {
    if (filled) {
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="#C97B7B" stroke="#C97B7B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>`;
    } else {
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>`;
    }
}

// 切换收藏状态
function toggleFavorite(productId, productName, productPrice, productImage, productUrl) {
    if (isFavorite(productId)) {
        removeFromFavorite(productId);
        alert('已取消收藏！');
    } else {
        addToFavorite(productId, productName, productPrice, productImage, productUrl);
    }
}

// 初始化收藏按钮
function initFavoriteButtons() {
    // 为所有收藏按钮设置初始状态
    const buttons = document.querySelectorAll('.btn-favorite, .btn-favorite-detail');
    buttons.forEach(btn => {
        const productId = btn.getAttribute('data-product-id');
        if (productId && isFavorite(productId)) {
            btn.classList.add('active');
            btn.innerHTML = getHeartIcon(true);
        } else {
            btn.innerHTML = getHeartIcon(false);
        }
    });
}

// 渲染收藏页面
function renderFavoritesPage() {
    const favoritesGrid = document.getElementById('favoritesGrid');
    if (!favoritesGrid) return;
    
    const favorites = getFavorites();
    
    if (favorites.length === 0) {
        favoritesGrid.innerHTML = `
            <div class="empty-favorites">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                <p>暂无收藏商品</p>
                <a href="index.html" class="btn-primary">去逛逛</a>
            </div>
        `;
        return;
    }

    favoritesGrid.innerHTML = favorites.map(item => {
        // 根据商品ID获取对应的标签和描述信息
        const productInfo = getProductInfoById(item.id);
        
        return `
        <a href="${item.url}" class="product-card">
            <div class="product-image" style="background-image: url('${item.image}');">
                <span class="product-tag">${productInfo.tag}</span>
                <button class="btn-favorite active" data-product-id="${item.id}" onclick="event.preventDefault(); removeFromFavorite('${item.id}')">
                    ${getHeartIcon(true)}
                </button>
            </div>
            <div class="product-info">
                <h3>${item.name}</h3>
                <p class="product-desc">${productInfo.desc}</p>
                <div class="product-meta">
                    <span class="sales">已售 ${productInfo.sales}</span>
                    <span class="rating">★★★★★ ${productInfo.rating}</span>
                </div>
                <div class="price">${item.price} <span class="original">${productInfo.originalPrice}</span></div>
                <button class="btn-add-cart" onclick="event.preventDefault(); addToCart('${item.id}', '${item.name}', '${item.price}', '${item.image}', '${item.url}', '${productInfo.defaultSize}', '${productInfo.defaultColor}')">加入购物车</button>
            </div>
        </a>
    `}).join('');
}

// ============================================
// 订单功能
// ============================================

// 获取订单列表
function getOrders() {
    const orders = localStorage.getItem('orders');
    return orders ? JSON.parse(orders) : [];
}

// 保存订单列表
function saveOrders(orders) {
    localStorage.setItem('orders', JSON.stringify(orders));
    updateOrderBadge();
}

// 获取选中的订单
function getSelectedOrders() {
    const selected = localStorage.getItem('selectedOrders');
    return selected ? JSON.parse(selected) : [];
}

// 保存选中的订单
function saveSelectedOrders(selected) {
    localStorage.setItem('selectedOrders', JSON.stringify(selected));
}

// 生成订单号
function generateOrderNo() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    return `ORD${year}${month}${day}${random}`;
}

// 创建订单
function createOrder() {
    const cart = getCart();
    if (cart.length === 0) {
        alert('购物车是空的，无法结算！');
        return false;
    }
    
    // 计算总价
    let totalAmount = 0;
    cart.forEach(item => {
        const price = parseFloat(item.price.replace('¥', ''));
        totalAmount += price * item.quantity;
    });
    
    // 创建订单
    const order = {
        orderNo: generateOrderNo(),
        items: [...cart],
        totalAmount: totalAmount,
        status: 'paid', // pending: 待付款, paid: 已付款, shipped: 已发货, completed: 已完成
        statusText: '已付款',
        createTime: new Date().toISOString(),
        createTimeText: new Date().toLocaleString('zh-CN')
    };
    
    // 保存订单
    const orders = getOrders();
    orders.unshift(order); // 新订单放在最前面
    saveOrders(orders);
    
    // 清空购物车
    localStorage.removeItem('cart');
    updateCartBadge();
    
    alert(`订单创建成功！\n订单号：${order.orderNo}\n金额：¥${totalAmount.toFixed(2)}`);
    return true;
}

// 更新订单角标
function updateOrderBadge() {
    const orders = getOrders();
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    
    // 更新导航栏订单角标
    const orderLinks = document.querySelectorAll('a[href="orders.html"]');
    orderLinks.forEach(link => {
        // 移除旧的角标
        const oldBadge = link.querySelector('.order-badge');
        if (oldBadge) oldBadge.remove();
        
        // 添加新角标
        if (pendingOrders > 0) {
            const badge = document.createElement('span');
            badge.className = 'order-badge';
            badge.textContent = pendingOrders;
            link.appendChild(badge);
        }
    });
}

// 渲染订单页面
function renderOrdersPage() {
    const ordersContainer = document.getElementById('ordersContainer');
    if (!ordersContainer) return;

    // 自动将待付款订单更新为已付款
    let orders = getOrders();
    let hasUpdated = false;
    orders = orders.map(order => {
        if (order.status === 'pending') {
            hasUpdated = true;
            return {
                ...order,
                status: 'paid',
                statusText: '已付款'
            };
        }
        return order;
    });
    if (hasUpdated) {
        saveOrders(orders);
    }

    const selectedOrders = getSelectedOrders();

    if (orders.length === 0) {
        ordersContainer.innerHTML = `
            <div class="empty-orders">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5">
                    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"/>
                    <path d="M9 14l2 2 4-4"/>
                </svg>
                <p>暂无订单</p>
                <a href="index.html" class="btn-primary">去购物</a>
            </div>
        `;
        // 隐藏分页
        const ordersPagination = document.getElementById('ordersPagination');
        if (ordersPagination) ordersPagination.style.display = 'none';
        return;
    }

    // 计算分页
    const totalPages = Math.ceil(orders.length / ordersPerPage);
    // 确保当前页不超过总页数
    if (ordersCurrentPage > totalPages) ordersCurrentPage = totalPages;
    if (ordersCurrentPage < 1) ordersCurrentPage = 1;

    const startIndex = (ordersCurrentPage - 1) * ordersPerPage;
    const endIndex = startIndex + ordersPerPage;
    const currentPageOrders = orders.slice(startIndex, endIndex);

    ordersContainer.innerHTML = currentPageOrders.map(order => {
        const isSelected = selectedOrders.includes(order.orderNo);
        const statusClass = order.status === 'pending' ? 'status-pending' : 
                           order.status === 'paid' ? 'status-paid' :
                           order.status === 'shipped' ? 'status-shipped' :
                           order.status === 'completed' ? 'status-completed' :
                           order.status === 'refunding' ? 'status-refunding' :
                           order.status === 'refunded' ? 'status-refunded' :
                           order.status === 'exchanging' ? 'status-exchanging' : 'status-completed';
        
        // 检查是否有售后状态
        const hasAfterSale = ['refunding', 'refunded', 'exchanging', 'returned'].includes(order.status);
        
        // 状态文本映射
        const statusTextMap = {
            'pending': '待付款',
            'paid': '已付款',
            'shipped': '已发货',
            'completed': '已完成',
            'refunding': '退款中',
            'refunded': '已退款',
            'exchanging': '换货中',
            'returning': '退货中'
        };
        
        // 获取状态文本，如果没有则根据状态映射
        const statusText = order.statusText || statusTextMap[order.status] || '待付款';
        
        // 格式化时间，如果没有则使用订单号生成时间
        let createTimeText = order.createTimeText;
        if (!createTimeText && order.createTime) {
            createTimeText = new Date(order.createTime).toLocaleString('zh-CN');
        } else if (!createTimeText) {
            // 从订单号提取时间 ORD20260526xxxx -> 2026/5/26
            const timeMatch = order.orderNo.match(/ORD(\d{4})(\d{2})(\d{2})/);
            if (timeMatch) {
                createTimeText = `${timeMatch[1]}/${parseInt(timeMatch[2])}/${parseInt(timeMatch[3])}`;
            } else {
                createTimeText = new Date().toLocaleString('zh-CN');
            }
        }
        
        return `
            <div class="order-card">
                <div class="order-header">
                    <div class="order-info">
                        <span class="order-no">订单号：${order.orderNo}</span>
                        <span class="order-time">${createTimeText}</span>
                    </div>
                    <span class="order-status ${statusClass}">${statusText}</span>
                </div>
                <div class="order-items">
                    ${order.items.map(item => `
                        <div class="order-item">
                            <img src="${item.image}" alt="${item.name}" class="order-item-image">
                            <div class="order-item-info">
                                <h4>${item.name}</h4>
                                <p>${item.color} | ${item.size}</p>
                            </div>
                            <div class="order-item-price">
                                <span>${item.price} × ${item.quantity}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="order-footer">
                    <span class="order-total">合计：<strong>¥${order.totalAmount.toFixed(2)}</strong></span>
                    <div class="order-actions">
                        ${order.status === 'pending' ? `
                            <button class="btn-secondary btn-cancel" onclick="cancelOrder('${order.orderNo}')">取消订单</button>
                        ` : ''}
                        ${order.status === 'shipped' ? `
                            <button class="btn-primary btn-confirm" onclick="confirmOrder('${order.orderNo}')">确认收货</button>
                        ` : ''}
                        ${(order.status === 'completed' || order.status === 'paid' || order.status === 'shipped') ? `
                            <button class="btn-secondary" onclick="showAfterSaleModal('${order.orderNo}')">申请售后</button>
                        ` : ''}
                        ${hasAfterSale ? `
                            <button class="btn-text" onclick="viewAfterSaleStatus('${order.orderNo}')">售后进度</button>
                        ` : ''}
                        <button class="btn-text" onclick="viewLogistics('${order.orderNo}')">物流信息</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // 渲染分页
    renderOrdersPagination(totalPages);
}

// 渲染订单分页
function renderOrdersPagination(totalPages) {
    const paginationContainer = document.getElementById('ordersPagination');
    if (!paginationContainer) return;

    // 始终显示分页，即使只有一页
    paginationContainer.style.display = 'flex';

    let html = '';

    // 上一页按钮
    html += `<button onclick="changeOrdersPage(${ordersCurrentPage - 1})" ${ordersCurrentPage === 1 ? 'disabled' : ''}>上一页</button>`;

    // 页码按钮
    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="${i === ordersCurrentPage ? 'active' : ''}" onclick="changeOrdersPage(${i})">${i}</button>`;
    }

    // 下一页按钮
    html += `<button onclick="changeOrdersPage(${ordersCurrentPage + 1})" ${ordersCurrentPage === totalPages ? 'disabled' : ''}>下一页</button>`;

    paginationContainer.innerHTML = html;
}

// 切换订单页码
function changeOrdersPage(page) {
    ordersCurrentPage = page;
    renderOrdersPage();
    // 滚动到页面顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 取消订单
function cancelOrder(orderNo) {
    if (!confirm('确定要取消该订单吗？')) return;
    
    const orders = getOrders();
    const orderIndex = orders.findIndex(o => o.orderNo === orderNo);
    if (orderIndex > -1) {
        orders.splice(orderIndex, 1);
        saveOrders(orders);
        renderOrdersPage();
        alert('订单已取消！');
    }
}

// 确认收货
function confirmOrder(orderNo) {
    const orders = getOrders();
    const order = orders.find(o => o.orderNo === orderNo);
    if (order) {
        order.status = 'completed';
        order.statusText = '已完成';
        saveOrders(orders);
        renderOrdersPage();
        alert('确认收货成功！');
    }
}

// 查看物流信息
function viewLogistics(orderNo) {
    const orders = getOrders();
    const order = orders.find(o => o.orderNo === orderNo);
    if (!order) return;

    // 判断是否处于售后状态
    const hasAfterSale = order.afterSale && ['refunding', 'returning', 'exchanging'].includes(order.status);
    
    // 生成模拟物流信息 - 如果有售后，显示售后前的物流状态
    const logisticsStatus = hasAfterSale ? 'shipped' : order.status;
    const logisticsData = generateLogisticsData(orderNo, logisticsStatus);

    // 创建物流信息弹窗
    const modal = document.createElement('div');
    modal.className = 'logistics-modal';
    modal.innerHTML = `
        <div class="logistics-overlay" onclick="closeLogisticsModal()"></div>
        <div class="logistics-content">
            <div class="logistics-header">
                <h3>物流信息</h3>
                <button class="logistics-close" onclick="closeLogisticsModal()">×</button>
            </div>
            <div class="logistics-body">
                ${hasAfterSale ? `
                <div class="logistics-alert">
                    <span class="alert-icon">⚠️</span>
                    <span class="alert-text">用户已申请售后，物流信息停止更新</span>
                </div>
                ` : ''}
                <div class="logistics-info">
                    <div class="logistics-company">
                        <span class="label">物流公司：</span>
                        <span class="value">顺丰速运</span>
                    </div>
                    <div class="logistics-number">
                        <span class="label">运单编号：</span>
                        <span class="value">SF${orderNo.substring(3)}</span>
                    </div>
                </div>
                <div class="logistics-timeline">
                    ${logisticsData.map((item, index) => `
                        <div class="timeline-item ${index === 0 ? 'active' : ''}">
                            <div class="timeline-dot"></div>
                            <div class="timeline-content">
                                <p class="timeline-text">${item.text}</p>
                                <p class="timeline-time">${item.time}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

// 生成模拟物流数据
function generateLogisticsData(orderNo, orderStatus) {
    const now = new Date();
    const logistics = [];

    if (orderStatus === 'pending') {
        logistics.push({
            text: '订单已创建，等待付款',
            time: now.toLocaleString('zh-CN')
        });
    } else if (orderStatus === 'paid') {
        logistics.push({
            text: '商家已收到付款，正在准备发货',
            time: now.toLocaleString('zh-CN')
        });
        logistics.push({
            text: '订单已创建，等待付款',
            time: new Date(now - 3600000).toLocaleString('zh-CN')
        });
    } else if (orderStatus === 'shipped' || orderStatus === 'completed') {
        logistics.push({
            text: '您的订单已签收，感谢使用顺丰速运',
            time: new Date(now - 3600000).toLocaleString('zh-CN')
        });
        logistics.push({
            text: '快递员正在派送中，请保持电话畅通',
            time: new Date(now - 86400000).toLocaleString('zh-CN')
        });
        logistics.push({
            text: '快件已到达【北京市朝阳区营业点】',
            time: new Date(now - 172800000).toLocaleString('zh-CN')
        });
        logistics.push({
            text: '快件已发往【北京市朝阳区营业点】',
            time: new Date(now - 259200000).toLocaleString('zh-CN')
        });
        logistics.push({
            text: '顺丰速运已收取快件',
            time: new Date(now - 345600000).toLocaleString('zh-CN')
        });
        logistics.push({
            text: '商家已发货，等待快递揽收',
            time: new Date(now - 432000000).toLocaleString('zh-CN')
        });
    }

    return logistics;
}

// 关闭物流信息弹窗
function closeLogisticsModal() {
    const modal = document.querySelector('.logistics-modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
}

// 显示售后申请弹窗
function showAfterSaleModal(orderNo) {
    const orders = getOrders();
    const order = orders.find(o => o.orderNo === orderNo);
    
    const modal = document.createElement('div');
    modal.className = 'aftersale-modal';
    modal.innerHTML = `
        <div class="aftersale-overlay" onclick="closeAfterSaleModal()"></div>
        <div class="aftersale-content">
            <div class="aftersale-header">
                <h3>申请售后服务</h3>
                <button class="aftersale-close" onclick="closeAfterSaleModal()">×</button>
            </div>
            <div class="aftersale-body">
                <div class="aftersale-type">
                    <label>售后类型：</label>
                    <div class="type-options">
                        <label class="type-option">
                            <input type="radio" name="afterSaleType" value="refund" checked onchange="toggleExchangeOptions('${orderNo}')">
                            <span>退款</span>
                        </label>
                        <label class="type-option">
                            <input type="radio" name="afterSaleType" value="return" onchange="toggleExchangeOptions('${orderNo}')">
                            <span>退货退款</span>
                        </label>
                        <label class="type-option">
                            <input type="radio" name="afterSaleType" value="exchange" onchange="toggleExchangeOptions('${orderNo}')">
                            <span>换货</span>
                        </label>
                    </div>
                </div>
                <div id="afterSaleReasonSection" class="aftersale-reason">
                    <label>申请原因：</label>
                    <select id="afterSaleReason">
                        <option value="">请选择原因</option>
                        <option value="quality">商品质量问题</option>
                        <option value="wrong">商品与描述不符</option>
                        <option value="damage">商品破损/污渍</option>
                        <option value="size">尺码不合适</option>
                        <option value="color">颜色不喜欢</option>
                        <option value="other">其他原因</option>
                    </select>
                </div>
                <div id="exchangeOptions" style="display: none;">
                    <div class="aftersale-exchange">
                        <label>换货信息：</label>
                        <div class="exchange-fields">
                            <div class="exchange-field">
                                <span>新尺码：</span>
                                <select id="exchangeSize">
                                    <option value="">请选择尺码</option>
                                    <option value="S">S</option>
                                    <option value="M">M</option>
                                    <option value="L">L</option>
                                    <option value="XL">XL</option>
                                    <option value="XXL">XXL</option>
                                </select>
                            </div>
                            <div class="exchange-field">
                                <span>新颜色：</span>
                                <select id="exchangeColor">
                                    <option value="">请选择颜色</option>
                                    <option value="白色">白色</option>
                                    <option value="黑色">黑色</option>
                                    <option value="灰色">灰色</option>
                                    <option value="蓝色">蓝色</option>
                                    <option value="粉色">粉色</option>
                                    <option value="米色">米色</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="aftersale-desc">
                    <label>问题描述：</label>
                    <textarea id="afterSaleDesc" placeholder="请详细描述您遇到的问题..." rows="4"></textarea>
                </div>
            </div>
            <div class="aftersale-footer">
                <button class="btn-secondary" onclick="closeAfterSaleModal()">取消</button>
                <button class="btn-primary" onclick="submitAfterSale('${orderNo}')">提交申请</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

// 切换换货选项显示
function toggleExchangeOptions(orderNo) {
    const type = document.querySelector('input[name="afterSaleType"]:checked').value;
    const exchangeOptions = document.getElementById('exchangeOptions');
    const afterSaleReasonSection = document.getElementById('afterSaleReasonSection');
    const afterSaleReason = document.getElementById('afterSaleReason');
    
    if (exchangeOptions) {
        exchangeOptions.style.display = type === 'exchange' ? 'block' : 'none';
    }
    
    // 换货时隐藏申请原因，其他类型显示
    if (afterSaleReasonSection) {
        afterSaleReasonSection.style.display = type === 'exchange' ? 'none' : 'block';
    }
    
    // 换货时自动设置原因，其他类型清空
    if (afterSaleReason) {
        afterSaleReason.value = type === 'exchange' ? 'size' : '';
    }
}

// 关闭售后弹窗
function closeAfterSaleModal() {
    const modal = document.querySelector('.aftersale-modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
}

// 提交售后申请
function submitAfterSale(orderNo) {
    const type = document.querySelector('input[name="afterSaleType"]:checked').value;
    const reason = document.getElementById('afterSaleReason').value;
    const desc = document.getElementById('afterSaleDesc').value;

    if (!reason) {
        alert('请选择申请原因');
        return;
    }

    // 换货时验证尺码和颜色
    let exchangeInfo = {};
    if (type === 'exchange') {
        const exchangeSize = document.getElementById('exchangeSize').value;
        const exchangeColor = document.getElementById('exchangeColor').value;
        
        if (!exchangeSize) {
            alert('请选择换货后的尺码');
            return;
        }
        if (!exchangeColor) {
            alert('请选择换货后的颜色');
            return;
        }
        
        exchangeInfo = {
            newSize: exchangeSize,
            newColor: exchangeColor
        };
    }

    const orders = getOrders();
    const order = orders.find(o => o.orderNo === orderNo);
    if (order) {
        // 保存原始状态
        const originalStatus = order.status;
        const originalStatusText = order.statusText;
        
        // 根据类型设置状态
        if (type === 'refund') {
            order.status = 'refunding';
            order.statusText = '退款中';
        } else if (type === 'return') {
            order.status = 'returning';
            order.statusText = '退货中';
        } else if (type === 'exchange') {
            order.status = 'exchanging';
            order.statusText = '换货中';
        }
        
        // 保存售后信息
        order.afterSale = {
            type: type,
            reason: reason,
            desc: desc,
            applyTime: new Date().toLocaleString('zh-CN'),
            status: 'processing',
            originalStatus: originalStatus,
            originalStatusText: originalStatusText,
            ...exchangeInfo
        };
        
        saveOrders(orders);
        closeAfterSaleModal();
        renderOrdersPage();
        alert('售后申请已提交，客服将在24小时内处理！');
    }
}

// 查看售后进度
function viewAfterSaleStatus(orderNo) {
    const orders = getOrders();
    const order = orders.find(o => o.orderNo === orderNo);
    if (!order || !order.afterSale) return;

    const typeMap = {
        'refund': '退款',
        'return': '退货退款',
        'exchange': '换货'
    };

    const reasonMap = {
        'quality': '商品质量问题',
        'wrong': '商品与描述不符',
        'damage': '商品破损/污渍',
        'size': '尺码不合适',
        'color': '颜色不喜欢',
        'other': '其他原因'
    };

    const modal = document.createElement('div');
    modal.className = 'aftersale-modal';
    modal.innerHTML = `
        <div class="aftersale-overlay" onclick="closeAfterSaleModal()"></div>
        <div class="aftersale-content">
            <div class="aftersale-header">
                <h3>售后进度</h3>
                <button class="aftersale-close" onclick="closeAfterSaleModal()">×</button>
            </div>
            <div class="aftersale-body">
                <div class="aftersale-status-info">
                    <div class="status-item">
                        <span class="label">售后类型：</span>
                        <span class="value">${typeMap[order.afterSale.type] || order.afterSale.type}</span>
                    </div>
                    <div class="status-item">
                        <span class="label">申请原因：</span>
                        <span class="value">${reasonMap[order.afterSale.reason] || order.afterSale.reason}</span>
                    </div>
                    <div class="status-item">
                        <span class="label">申请时间：</span>
                        <span class="value">${order.afterSale.applyTime}</span>
                    </div>
                    <div class="status-item">
                        <span class="label">当前状态：</span>
                        <span class="value status-badge ${order.status}">${order.statusText}</span>
                    </div>
                    ${order.afterSale.type === 'exchange' && order.afterSale.newSize ? `
                    <div class="status-item">
                        <span class="label">换货尺码：</span>
                        <span class="value">${order.afterSale.newSize}</span>
                    </div>
                    <div class="status-item">
                        <span class="label">换货颜色：</span>
                        <span class="value">${order.afterSale.newColor}</span>
                    </div>
                    ` : ''}
                </div>
                <div class="aftersale-timeline">
                    <div class="timeline-item active">
                        <div class="timeline-dot"></div>
                        <div class="timeline-content">
                            <p class="timeline-text">售后申请已提交</p>
                            <p class="timeline-time">${order.afterSale.applyTime}</p>
                        </div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-dot"></div>
                        <div class="timeline-content">
                            <p class="timeline-text">客服审核中</p>
                            <p class="timeline-time">预计24小时内处理</p>
                        </div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-dot"></div>
                        <div class="timeline-content">
                            <p class="timeline-text">处理完成</p>
                            <p class="timeline-time">等待中</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="aftersale-footer">
                <button class="btn-secondary" onclick="cancelAfterSale('${orderNo}')">取消申请</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

// 取消售后申请
function cancelAfterSale(orderNo) {
    if (!confirm('确定要取消该售后申请吗？')) return;
    
    const orders = getOrders();
    const order = orders.find(o => o.orderNo === orderNo);
    if (order && order.afterSale) {
        // 恢复到售后前的状态
        if (order.afterSale.originalStatus) {
            order.status = order.afterSale.originalStatus;
            order.statusText = order.afterSale.originalStatusText;
        } else {
            // 默认恢复到已完成状态
            order.status = 'completed';
            order.statusText = '已完成';
        }
        
        // 删除售后信息
        delete order.afterSale;
        
        saveOrders(orders);
        closeAfterSaleModal();
        renderOrdersPage();
        alert('售后申请已取消！');
    }
}
