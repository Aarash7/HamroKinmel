/* .................................................................................
   Hamro Kinmel – App Script (shared on all pages)
   ................................................................................. */

// ------- DOM READY ------- //
document.addEventListener('DOMContentLoaded', () => {
  // Load navbar
  let navbarContainer = document.getElementById('navbar-container');
  if (navbarContainer) {
    fetch('navigation.html')
      .then(r => r.text())
      .then(html => {
        navbarContainer.innerHTML = html;

        // After nav is injected:
        showDashboardIfLoggedIn();
        attachNavbarAndModalListeners();
        attachSearchHandlers();
        attachThemeToggle();
        attachNavToogle();
        updateCartBadge();
        setActiveNavLink();
        window.addEventListener('popstate', setActiveNavLink);
      })
      .catch(err => console.error('Error loading navigation:', err));
  } else {
    showDashboardIfLoggedIn();
  }

  // Registration page
  let registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', (event) => {
      event.preventDefault();
      let username = document.getElementById('regUsername').value.trim();
      let email = document.getElementById('regEmail').value.trim();
      let password = document.getElementById('regPassword').value.trim();
      localStorage.setItem('user', JSON.stringify({ username, email, password }));
      showToast('Registration successful!');
      let loginModal = document.getElementById('loginModal');
      if (loginModal) {
        loginModal.classList.remove('hidden');
        loginModal.style.display = 'flex';
      }
    });
  }

  //Scroll to top button
  let scrollToTopButton = document.getElementById('scrollToTop');
  if(scrollToTopButton){
    window.addEventListener('scroll', () => {
      if (window.scrollY > 200) {
        scrollToTopButton.style.display = 'block';
      } else {
        scrollToTopButton.style.display = 'none';
      }
    });
    scrollToTopButton.addEventListener('click', () => {
      window.scrollTo({ top:0, behavior: 'smooth' });
    });
  }

  // Home page (Featured)
  if (document.getElementById('featuredProducts')) {
    renderFeaturedProducts();
  }

  // Page initializers
  initAdminPageIfPresent();
  initProductsPage();
  initCartPage();
  initCheckoutPage();
  initDashboardPage();
});

// ------- AUTH / NAVBAR ------- //
function showDashboardIfLoggedIn() {
  let dashboardMenu = document.getElementById('dashboardMenu');
  let loginButton = document.getElementById('loginButton');
  let registerButton = document.getElementById('registerButton');
  let logoutButton = document.getElementById('logoutButton');

  let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  // Show login modal from navbar login button
  if (loginButton && loginModal) {
    loginButton.addEventListener('click', () => {
      loginModal.classList.remove('hidden');
      loginModal.style.display = 'flex';
    });
  }
  if (dashboardMenu) dashboardMenu.style.display = isLoggedIn ? 'flex' : 'none';
  if (loginButton) loginButton.style.display = isLoggedIn ? 'none' : 'flex';
  if (registerButton) registerButton.style.display = isLoggedIn ? 'none' : 'flex';
  if (logoutButton) {
    logoutButton.style.display = isLoggedIn ? 'flex' : 'none';
    logoutButton.onclick = () => {
      localStorage.removeItem('isLoggedIn');
      showDashboardIfLoggedIn();
      window.location.href = 'index.html';
    };
  }
}

function attachNavbarAndModalListeners() {
  // Register button
  let registerButton = document.getElementById('registerButton');
  if (registerButton) {
    registerButton.addEventListener('click', () => (window.location.href = 'register.html'));
  }

  // Login modal
  let loginLink = document.getElementById('showLogin');
  let loginButton = document.getElementById('loginButton');
  let loginModal = document.getElementById('loginModal');
  let closeLoginButton = document.getElementById('closeLoginModal');

  if (loginButton && loginModal) {
    loginButton.addEventListener('click', () => {
      loginModal.classList.remove('hidden');
      loginModal.style.display = 'flex';
    });
  }
  if (loginLink && loginModal) {
    loginLink.addEventListener('click', (e) => {
      e.preventDefault();
      loginModal.classList.remove('hidden');
      loginModal.style.display = 'flex';
    });
  }
  if (closeLoginButton && loginModal) {
    closeLoginButton.addEventListener('click', () => {
      loginModal.classList.add('hidden');
      loginModal.style.display = 'none';
    });
  }

  // Login submit
  let loginForm = document.getElementById('loginForm');
  if (loginForm && loginModal) {
    loginForm.addEventListener('submit', (event) => {
      event.preventDefault();
      let usernameOrEmail = document.getElementById('loginUsernameOrEmail').value.trim();
      let password = document.getElementById('loginPassword').value.trim();
      let userData = JSON.parse(localStorage.getItem('user'));

      if (userData && (usernameOrEmail === userData.username || usernameOrEmail === userData.email) && password === userData.password) {
        localStorage.setItem('isLoggedIn', 'true');
        showDashboardIfLoggedIn();
        showToast("Login Successful");
        loginModal.classList.add('hidden');
        loginModal.style.display = 'none';
      } else {
        alert('Invalid credentials. Please try again.');
      }
    });
  }

  // Cart button → cart.html
  let cartBtn = document.getElementById('cartBtn');
  if (cartBtn) {
    cartBtn.addEventListener('click', () => {
      window.location.href = 'cart.html';
    });
  }
}

// ------- THEME TOGGLE ------- //
function attachThemeToggle() {
  let themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    if (localStorage.getItem('theme') === 'dark') {
      document.body.classList.add('dark-mode');
      themeToggle.textContent = '☀️';
    } else {
      themeToggle.textContent = '🌙';
    }
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
        themeToggle.textContent = '☀️';
      } else {
        localStorage.setItem('theme', 'light');
        themeToggle.textContent = '🌙';
        }
    });
  }
}

// ------- NAB TOGGLE ------- //
function attachNavToogle(){
  let navToggle = document.getElementById('navToggle');
  let navMenu = document.getElementById('navMenu');

  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    // Toggle button aria-expanded attribute for accessibility
    let expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', !expanded);
    
  });

  // Optional: close menu on clicking a nav link for better UX on mobile
  navMenu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

}

// ------- ACTIVE NAB LINK ------- //
function setActiveNavLink() {
  let nav = document.getElementById('navMenu');
  if (!nav) return;
  let links = nav.querySelectorAll('.nav-link');
  let current = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

  links.forEach(a => {
    try {
      let hrefFile = (new URL(a.href, location.href).pathname.split('/').pop() || '').toLowerCase();
      a.classList.toggle('active', hrefFile === current);
    } catch {
      a.classList.remove('active');
    }
  });
}

// ------- SEARCH BAR ------- //
function attachSearchHandlers() {
  let input = document.getElementById('searchInput');
  let btn = document.getElementById('searchBtn');

  if (!input || !btn) return;
  let go = () => {
    let q = (input.value || '').trim();
    let url = q ? `product.html?search=${encodeURIComponent(q)}` : `product.html`;
    window.location.href = url;
  };
  btn.addEventListener('click', go);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
}

// Cart badge helper
function updateCartBadge() {
  let badge = document.getElementById('cartBadge');
  if (!badge) return;
  let count = getCart().reduce((s, x) => s + Number(x.qty || 1), 0);
  badge.textContent = count;
  badge.classList.toggle('hidden', count <= 0);
}

// ------- ADD TO CART ------- //
window.addToCart = function(productId, qty = 1) {
  let id = Number(productId);
  let q = Math.max(1, Number(qty) || 1);
  let cart = getCart();
  let line = cart.find(i => Number(i.productId) === id);
  if (line) line.qty = Number(line.qty || 1) + q;
  else cart.push({ productId: id, qty: q });
  saveCart(cart);
  showToast('Successfully Added to cart!');
};

/* .................................................................................
   PRODUCT STORAGE & HOME FEATURED
   ................................................................................. */
let defaultProducts = [
  { id: 1,  name: "iPhone 15 Pro",         category: "Electronics", price: 999.99,  image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=300",  description: "Latest iPhone with advanced camera system",  stock: 25,  featured: true  },
  { id: 2,  name: "MacBook Air M2",        category: "Electronics", price: 1199.99, image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=300",     description: "Powerful laptop for professionals",          stock: 15,  featured: true  },
  { id: 3,  name: "Sony WH-1000XM5",       category: "Electronics", price: 349.99,  image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300",  description: "Premium noise-canceling headphones",         stock: 40,  featured: false },
  { id: 4,  name: "iPad Pro 12.9",         category: "Electronics", price: 1099.99, image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300",     description: "Professional tablet with M2 chip",           stock: 20,  featured: false },
  { id: 5,  name: "Classic T-Shirt",       category: "Clothing",    price: 29.99,   image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300",  description: "100% cotton comfortable t-shirt",            stock: 100, featured: true  },
  { id: 6,  name: "Denim Jeans",           category: "Clothing",    price: 79.99,   image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=300",     description: "Premium denim with perfect fit",             stock: 60,  featured: false },
  { id: 7,  name: "Running Shoes",         category: "Clothing",    price: 129.99,  image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300",     description: "Comfortable running shoes with cushioning",  stock: 45,  featured: false },
  { id: 8,  name: "JavaScript Guide",      category: "Books",       price: 39.99,   image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300",     description: "Complete guide to JavaScript programming",   stock: 80,  featured: true  },
  { id: 9,  name: "Design Thinking",       category: "Books",       price: 34.99,   image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300",  description: "Learn design thinking methodology",          stock: 50,  featured: false },
  { id: 10, name: "Data Science Handbook", category: "Books",       price: 49.99,   image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300",     description: "Comprehensive guide to data science",        stock: 35,  featured: false },
  { id: 11, name: "Creative Writing",      category: "Books",       price: 24.99,   image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300",  description: "Improve your creative writing skills",       stock: 70,  featured: true  },
  { id: 12, name: "Tennis Racket",         category: "Sports",      price: 149.99,  image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300",     description: "Professional tennis racket",                 stock: 25,  featured: false },
  { id: 13, name: "Yoga Mat",              category: "Sports",      price: 39.99,   image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=300",  description: "High-quality yoga mat for practice",         stock: 80,  featured: true  }
];

let STORAGE_KEY = 'products';
function getProducts() {
  let saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProducts));
    return [...defaultProducts];
  }
  try { return JSON.parse(saved) || []; } catch { return []; }
}
function saveProducts(products) { localStorage.setItem(STORAGE_KEY, JSON.stringify(products)); }

// ------- FEATURED PRODUCTS ------- //
function renderFeaturedProducts() {
  let container = document.getElementById('featuredProducts');
  if (!container) return;
  let products = getProducts().filter(p => p.featured === true);
  container.innerHTML = products.length ? '' : '<p>No featured products right now.</p>';
  products.forEach(product => {
    let card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" class="product-image" />
      <h3 class="product-name">${product.name}</h3>
      <p class="product-price">$${Number(product.price).toFixed(2)}</p>
      <button class="btn btn--primary" onclick="addToCart(${product.id})">Add to Cart</button>
    `;
    container.appendChild(card);
  });
}

/* .................................................................................
                                      ADMIN PAGE
   ................................................................................. */
let editingId = null;

function nextProductId(products) 
{ return products.length ? Math.max(...products.map(p => Number(p.id) || 0)) + 1 : 1; }

function updateTotalProductsCount() { 
  let el = document.getElementById('totalProducts');
   if (el) el.textContent = getProducts().length; 
}

function uniqueCategories(products)
 { return Array.from(new Set(products.map(p => p.category))).filter(Boolean); }

function fillCategoryDropdown() {
  let select = document.getElementById('productCategory'); if (!select) return;
  let cats = uniqueCategories(getProducts());
  let defaults = ['Electronics','Clothing','Books','Sports','Home'];
  let all = Array.from(new Set([...cats, ...defaults]));
  select.innerHTML = '<option value="">Select Category</option>';
  all.forEach(c => select.insertAdjacentHTML('beforeend', `<option value="${c}">${c}</option>`));
}

function clearProductForm() {
  ['productName','productCategory','productPrice','productDescription','productImage','productStock'].forEach(id => {
    let el = document.getElementById(id); if (el) el.value = '';
  });
  let chk = document.getElementById('productFeatured'); if (chk) chk.checked = false;
  editingId = null; 
  let title = document.getElementById('productModalTitle'); 
  if (title) title.textContent = 'Add Product';
}

function openProductModal() { 
  fillCategoryDropdown(); 
  let m = document.getElementById('productModal'); 
  if (m) { 
    m.classList.remove('hidden'); 
    m.style.display='flex'; 
  } 
}

function closeProductModal() 
{ let m = document.getElementById('productModal'); 
  if (m){ m.classList.add('hidden'); m.style.display='none'; } 
  clearProductForm(); 
}

function renderAdminProducts() {
  let wrap = document.getElementById('adminProducts'); if (!wrap) return;
  let products = getProducts();
  if (!products.length) { wrap.innerHTML = `<div class="empty">No products yet. Click “Add New Product”.</div>`; updateTotalProductsCount(); return; }

  let rows = products.map(p => `
    <tr>
      <td style="min-width:56px"><img src="${p.image}" alt="${p.name}" style="width:56px;height:56px;object-fit:cover;border-radius:6px"></td>
      <td>${p.name}</td>
      <td>${p.category}</td>
      <td>$${Number(p.price).toFixed(2)}</td>
      <td>${p.stock}</td>
      <td>${p.featured ? 'Yes' : 'No'}</td>
      <td>
        <div class="button-wrap">
        <button class="btn btn--option" data-action="edit" data-id="${p.id}">Edit</button>
        <button class="btn btn--danger" data-action="delete" data-id="${p.id}">Delete</button>
        <div>
      </td>
    </tr>
  `).join('');

  wrap.innerHTML = `
    <div class="table-responsive">
      <table class="table">
        <thead>
          <tr>
            <th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Featured</th><th style="width:160px">Actions</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;

  wrap.querySelector('tbody').addEventListener('click', (e) => {
    let btn = e.target.closest('button[data-action]'); if (!btn) return;
    let id = Number(btn.dataset.id);
    if (btn.dataset.action === 'edit') handleEditProduct(id);
    if (btn.dataset.action === 'delete') handleDeleteProduct(id);
  });

  updateTotalProductsCount();
}

function handleEditProduct(id) {
  let p = getProducts().find(x => Number(x.id) === Number(id)); if (!p) return;
  editingId = id; let title = document.getElementById('productModalTitle'); if (title) title.textContent='Edit Product';
  fillCategoryDropdown();
  document.getElementById('productName').value = p.name || '';
  document.getElementById('productCategory').value = p.category || '';
  document.getElementById('productPrice').value = p.price || '';
  document.getElementById('productDescription').value = p.description || '';
  document.getElementById('productImage').value = p.image || '';
  document.getElementById('productStock').value = p.stock || 0;
  let chk = document.getElementById('productFeatured'); if (chk) chk.checked = !!p.featured;
  openProductModal();
}

function handleDeleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  let products = getProducts().filter(p => Number(p.id) !== Number(id));
  saveProducts(products);
  renderAdminProducts();
}

function attachProductFormHandlers() {
  let addBtn = document.getElementById('addProductBtn');
  let closeBtn = document.getElementById('closeProductModal');
  let form = document.getElementById('productForm');
  if (addBtn) addBtn.addEventListener('click', () => { clearProductForm(); openProductModal(); });
  if (closeBtn) closeBtn.addEventListener('click', closeProductModal);

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let name = document.getElementById('productName').value.trim();
      let category = document.getElementById('productCategory').value.trim();
      let price = Number(document.getElementById('productPrice').value);
      let description = document.getElementById('productDescription').value.trim();
      let image = document.getElementById('productImage').value.trim();
      let stock = Number(document.getElementById('productStock').value);
      let featured = document.getElementById('productFeatured').checked;

      if (!name || !category || !Number.isFinite(price) || !description || !image || !Number.isFinite(stock)) {
        alert('Please fill every field correctly.'); return;
      }

      let products = getProducts();
      if (editingId == null) {
        products.push({ id: nextProductId(products), name, category, price, description, image, stock, rating: 0, featured });
      } else {
        products = products.map(p => Number(p.id) === Number(editingId) ? { ...p, name, category, price, description, image, stock, featured } : p);
      }
      saveProducts(products);
      showToast("Product Added Successfully");
      renderAdminProducts();
      closeProductModal();

      if (document.getElementById('featuredProducts')) renderFeaturedProducts();
    });
  }
}

function initAdminPageIfPresent() {
  if (!document.getElementById('adminPage')) return;
  getProducts(); // seed
  attachProductFormHandlers();
  renderAdminProducts();
  updateTotalProductsCount();
}

/* .................................................................................
                                    PRODUCTS PAGE 
   ................................................................................. */
function getAllCategories() { return Array.from(new Set(getProducts().map(p => p.category))).filter(Boolean).sort(); }
function fillProductsCategoryFilter() {
  let sel = document.getElementById('filterCategory'); if (!sel) return;
  sel.innerHTML = `<option value="">All Categories</option>`;
  getAllCategories().forEach(cat => sel.insertAdjacentHTML('beforeend', `<option value="${cat}">${cat}</option>`));
}
function renderProductsToGrid(products) {
  let grid = document.getElementById('productGrid');
  let empty = document.getElementById('emptyState');
  let resultsText = document.getElementById('resultsText');
  if (!grid) return;

  grid.innerHTML = '';
  if (!products.length) {
    if (empty) empty.classList.remove('hidden'); if (resultsText) resultsText.textContent = '0 results'; return;
  }
  if (empty) empty.classList.add('hidden');
  if (resultsText) resultsText.textContent = `${products.length} result${products.length === 1 ? '' : 's'}`;

  products.forEach(p => {
    let card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}" class="product-image" />
      <h3 class="product-name">${p.name}</h3>
      <p class="product-price">$${Number(p.price).toFixed(2)}</p>
      <p class="product-desc">${p.description || ''}</p>
      <button class="btn btn--primary" onclick="addToCart(${p.id})">Add to Cart</button>
    `;
    grid.appendChild(card);
  });
}
function applyCatalogFilters(baseList) {
  let q = new URLSearchParams(window.location.search).get('search')?.toLowerCase() || '';
  let cat = (document.getElementById('filterCategory')?.value || '').trim();
  let min = parseFloat(document.getElementById('filterMin')?.value || '');
  let max = parseFloat(document.getElementById('filterMax')?.value || '');
  let sort = document.getElementById('sortSelect')?.value || '';

  let list = [...baseList];
  if (q) list = list.filter(p => (p.name?.toLowerCase().includes(q)) || (p.category?.toLowerCase().includes(q)) || (p.description?.toLowerCase().includes(q)));
  if (cat) list = list.filter(p => p.category === cat);
  if (!isNaN(min)) list = list.filter(p => Number(p.price) >= min);
  if (!isNaN(max)) list = list.filter(p => Number(p.price) <= max);
  if (sort === 'price-asc') list.sort((a,b) => Number(a.price) - Number(b.price));
  if (sort === 'price-desc') list.sort((a,b) => Number(b.price) - Number(a.price));
  if (sort === 'name-asc') list.sort((a,b) => (a.name||'').localeCompare(b.name||''));
  if (sort === 'name-desc') list.sort((a,b) => (b.name||'').localeCompare(a.name||''));
  return list;
}
function initProductsPage() {
  if (!document.getElementById('productsPage')) return;
  fillProductsCategoryFilter();
  renderProductsToGrid(applyCatalogFilters(getProducts()));

  let applyBtn = document.getElementById('applyFiltersBtn');
  let clearBtn = document.getElementById('clearFiltersBtn');
  let catSel = document.getElementById('filterCategory');
  let sortSel = document.getElementById('sortSelect');
  let minInp = document.getElementById('filterMin');
  let maxInp = document.getElementById('filterMax');
  let rerender = () => renderProductsToGrid(applyCatalogFilters(getProducts()));

  if (applyBtn) applyBtn.addEventListener('click', rerender);
  [catSel, sortSel].forEach(el => el && el.addEventListener('change', rerender));
  [minInp, maxInp].forEach(el => el && el.addEventListener('keydown', e => { if (e.key === 'Enter') rerender(); }));
  if (clearBtn) clearBtn.addEventListener('click', () => {
    if (catSel) catSel.value = '';
    if (sortSel) sortSel.value = '';
    if (minInp) minInp.value = '';
    if (maxInp) maxInp.value = '';
    let url = new URL(window.location.href); url.searchParams.delete('search'); window.history.replaceState({}, '', url.toString());
    rerender();
  });
}

/* .................................................................................
                              CART STORAGE & CHECKOUT
   ................................................................................. */
let CART_KEY = 'cart';
let ORDERS_KEY = 'orders';
function getCart() { try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; } }
function saveCart(cart) { localStorage.setItem(CART_KEY, JSON.stringify(cart)); updateCartBadge(); }
function clearCart() { saveCart([]); }
function getOrders() { try { return JSON.parse(localStorage.getItem(ORDERS_KEY)) || []; } catch { return []; } }
function saveOrders(orders) { localStorage.setItem(ORDERS_KEY, JSON.stringify(orders)); }

function getCartItemsDetailed() {
  let products = getProducts(); let cart = getCart();
  return cart.map(item => {
    let product = products.find(p => Number(p.id) === Number(item.productId));
    if (!product) return null;
    let qty = Math.max(1, Number(item.qty) || 1);
    let lineTotal = qty * Number(product.price);
    return { product, qty, lineTotal };
  }).filter(Boolean);
}
function getCartTotals() {
  let items = getCartItemsDetailed();
  let subtotal = items.reduce((s, it) => s + it.lineTotal, 0);
  let shipping = items.length ? 0 : 0; // free shipping demo
  let total = subtotal + shipping;
  return { subtotal, shipping, total };
}
function formatMoney(n) { return `$${Number(n).toFixed(2)}`; }

function renderCartPage() {
  let page = document.getElementById('cartPage'); if (!page) return;
  let empty = document.getElementById('cartEmpty');
  let tableWrap = document.getElementById('cartTableWrap');
  let body = document.getElementById('cartBody');
  let summaryWrap = document.getElementById('cartSummaryWrap');

  let items = getCartItemsDetailed();
  if (!items.length) {
    if (empty) empty.classList.remove('hidden');
    if (tableWrap) tableWrap.classList.add('hidden');
    if (summaryWrap) summaryWrap.classList.add('hidden');
    return;
  }
  if (empty) empty.classList.add('hidden');
  if (tableWrap) tableWrap.classList.remove('hidden');
  if (summaryWrap) summaryWrap.classList.remove('hidden');

  if (body) {
    body.innerHTML = items.map(({product, qty, lineTotal}) => `
      <tr data-id="${product.id}">
        <td><img src="${product.image}" alt="${product.name}" style="width:56px;height:56px;object-fit:cover;border-radius:6px"></td>
        <td><strong>${product.name}</strong><br><small>${product.category || ''}</small></td>
        <td>${formatMoney(product.price)}</td>
        <td><input type="number" min="1" class="qty-input" value="${qty}" style="width:80px"></td>
        <td class="line-total">${formatMoney(lineTotal)}</td>
        <td><button class="btn btn--danger btn--sm remove-line">Remove</button></td>
      </tr>
    `).join('');
  }

  updateCartSummary();

  if (body) {
    body.addEventListener('input', (e) => {
      let input = e.target.closest('.qty-input'); if (!input) return;
      let tr = e.target.closest('tr[data-id]'); if (!tr) return;
      let id = Number(tr.dataset.id);
      let qty = Math.max(1, Number(input.value) || 1);

      let cart = getCart();
      let line = cart.find(i => Number(i.productId) === id);
      if (line) { line.qty = qty; saveCart(cart); }
      let p = getProducts().find(x => Number(x.id) === id);
      tr.querySelector('.line-total').textContent = formatMoney(qty * Number(p.price));
      updateCartSummary();
    });

    body.addEventListener('click', (e) => {
      let btn = e.target.closest('.remove-line'); if (!btn) return;
      let tr = e.target.closest('tr[data-id]'); if (!tr) return;
      let id = Number(tr.dataset.id);
      let cart = getCart().filter(i => Number(i.productId) !== id);
      saveCart(cart);
      tr.remove();
      if (!getCartItemsDetailed().length) renderCartPage(); else updateCartSummary();
    });
  }

  let form = document.getElementById('checkoutForm');
  let checkoutModal = document.getElementById('checkoutModal');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let name = document.getElementById('coName').value.trim();
      let email = document.getElementById('coEmail').value.trim();
      let address = document.getElementById('coAddress').value.trim();
      let payment = document.getElementById('coPayment').value;

      let itemsNow = getCartItemsDetailed();
      if (!itemsNow.length) return alert('Your cart is empty.');
      if (!name || !email || !address || !payment) return alert('Please fill all checkout fields.');

      let totals = getCartTotals();
      let orders = getOrders();
      let orderId = 'ORD-' + Date.now();
      orders.push({
        id: orderId,
        createdAt: new Date().toISOString(),
        customer: { name, email, address, payment },
        items: itemsNow.map(({product, qty, lineTotal}) => ({
          productId: product.id, name: product.name, price: product.price, qty, lineTotal
        })),
        totals
      });
      saveOrders(orders);
      clearCart();
      updateCartSummary();
      renderCartPage();
      showToast(`✅ Order placed! Your order ID is ${orderId}.`);
      checkoutModal.classList.add('hidden');
      checkoutModal.style.display = 'none';
    });
  }
}
function updateCartSummary() {
  let { subtotal, shipping, total } = getCartTotals();
  let sv = document.getElementById('subtotalVal');
  let shv = document.getElementById('shippingVal');
  let tv = document.getElementById('totalVal');
  if (sv) sv.textContent = formatMoney(subtotal);
  if (shv) shv.textContent = formatMoney(shipping);
  if (tv) tv.textContent = formatMoney(total);
}
function initCartPage() { if (document.getElementById('cartPage')) renderCartPage(); }

//user login status
function isUserLoggedIn() {
  return localStorage.getItem('isLoggedIn') === 'true';
}

//Checkout Modal
function initCheckoutPage(){
  let checkoutButton = document.getElementById('checkoutButton');
  let checkoutModal = document.getElementById('checkoutModal');
  let closeCheckoutButton = document.getElementById('closeCheckoutModal');

  if (checkoutButton && checkoutModal) {
    checkoutButton.addEventListener('click', () => {
      if(isUserLoggedIn()) {
        checkoutModal.classList.remove('hidden');
        checkoutModal.style.display = 'flex'; 
        // Scroll the modal into view or focus first input:
        checkoutModal.scrollIntoView({ behavior: 'smooth' });
        let firstInput = checkoutModal.querySelector('input, select, textarea');
        if (firstInput) firstInput.focus();
      } else {
          alert('Please log in to proceed to checkout.');
      }
    });     
  }
  if (closeCheckoutButton && checkoutModal) {
    closeCheckoutButton.addEventListener('click', () => {
      checkoutModal.classList.add('hidden');
      checkoutModal.style.display = 'none';
    });
  }
}

/* ...............................
           Dashboard
   ............................... */

function initDashboardPage(){

  // Modal open/close
  let editBtn = document.getElementById('editProfileBtn');
  let editModal = document.getElementById('editModal');
  let closeEditButton = document.getElementById('closeeditModal');
  let editForm = document.getElementById('editForm');

  // Profile elements
  let nameSpan = document.getElementById('profileName');
  let emailSpan = document.getElementById('profileEmail');
  let phoneSpan = document.getElementById('profilePhone');

  // Modal fields
  let nameInput = document.getElementById('editName');
  let emailInput = document.getElementById('editEmail');
  let phoneInput = document.getElementById('editPhone');

  // Open modal & fill with current data
  if (editBtn && editModal) {
    editBtn.addEventListener('click', () => {
      nameInput.value = nameSpan.textContent;
      emailInput.value = emailSpan.textContent;
      phoneInput.value = phoneSpan.textContent;
      editModal.classList.remove('hidden');
      editModal.style.display = 'flex'; 
       
    });     
  }

  // Close Modal
  if (closeEditButton && editModal) {
   closeEditButton.addEventListener('click', () => {
      editModal.classList.add('hidden');
      editModal.style.display = 'none';
    });
  }
 
  // Save edit and update profile
  if (editForm) {
    editForm.addEventListener('submit', (e) => {
      e.preventDefault();
      nameSpan.textContent = nameInput.value;
      emailSpan.textContent = emailInput.value;
      phoneSpan.textContent = phoneInput.value;
      editModal.classList.add('hidden');
      editModal.style.display = 'none';
      showToast('Profile updated successfully');

    });
  }
  orderHistory();
}

// Order History
function orderHistory() {
  let orderHistoryDiv = document.getElementById('orderHistory');
  let orders = getOrders();
  if (!orderHistoryDiv) return;
  if (!orders.length) {
    orderHistoryDiv.innerHTML = '<p>No orders yet.</p>';
    return;
  }
  orderHistoryDiv.innerHTML = '';

  orders.slice().reverse().forEach(order => {
    let orderId = order.id || 'NA';
    let price = Number(order.totals?.total || 0).toFixed(2);
    let html = `
      <div class="order-item">
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Amount:</strong> $${price}</p>
      </div>
    `;
    orderHistoryDiv.insertAdjacentHTML('beforeend', html);
  });
}

  // Toast notification logic
function showToast(message) {
  let toast = document.getElementById('toast');
  if(!toast) return;

  toast.textContent = message;
  toast.classList.remove('hidden');
  toast.classList.add('active');

  setTimeout(() => {
    toast.classList.remove('active'); //Fade out
    setTimeout(() => {
      toast.classList.add('hidden');  // Hide completely after fade
    }, 400);
  }, 3000);

}