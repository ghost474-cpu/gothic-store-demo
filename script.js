// Cart State
let cart = [];

// دالة فتح وإغلاق النافذة الجانبية للسلة
function toggleCart() {
    const cartModal = document.getElementById('cart-modal');
    if (cartModal) {
        cartModal.classList.toggle('active');
    }
}

// دالة توليد كود فريد للطلب مكون من 7 رموز
function generateUniqueOrderId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomPart = '';
    
    for (let i = 0; i < 4; i++) {
        randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    const timePart = Date.now().toString(36).slice(-3).toUpperCase();
    return `#${randomPart}${timePart}`;
}

// 1. Add Product to Cart
function addToCart(buttonElement) {
    let title = "Relic Item";
    let price = 0;

    if (buttonElement && buttonElement.closest) {
        const productCard = buttonElement.closest('.product-card');
        if (productCard) {
            const titleEl = productCard.querySelector('.product-title');
            const priceEl = productCard.querySelector('.product-price');
            
            if (titleEl) title = titleEl.innerText.trim();
            if (priceEl) {
                // استخراج السعر الأرقام فقط وتجاهل DA
                price = parseFloat(priceEl.innerText.replace(/[^0-9.]/g, '')) || 0;
            }
        }
    } else if (typeof buttonElement === 'string') {
        title = buttonElement;
        price = arguments[1] || 0;
    }

    const existingItem = cart.find(item => item.title === title);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ title, price, quantity: 1 });
    }

    updateCartUI();
}

// 2. Update Cart UI & Totals
function updateCartUI() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const totalPriceElement = document.getElementById('total-price');

    if (!cartItemsContainer || !cartCount || !totalPriceElement) return;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Your cart is currently empty in the dark shadows.</p>';
        cartCount.innerText = '0';
        totalPriceElement.innerText = '0.00DA';
        return;
    }

    let total = 0;
    let totalItemsCount = 0;
    cartItemsContainer.innerHTML = '';

    cart.forEach((item, index) => {
        total += item.price * item.quantity;
        totalItemsCount += item.quantity;

        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item-row';
        itemElement.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-size: 0.95rem; border-bottom: 1px dashed #2a2430; padding-bottom: 8px;';
        itemElement.innerHTML = `
            <div>
                <strong style="color: #e0dcd3;">${item.title}</strong> x${item.quantity}
                <br><small style="color: #c5a059;">${(item.price * item.quantity).toFixed(2)}DA</small>
            </div>
            <button onclick="removeFromCart(${index})" style="background: none; border: none; color: #8b0000; cursor: pointer; font-size: 1.1rem; font-weight: bold;">✕</button>
        `;
        cartItemsContainer.appendChild(itemElement);
    });

    cartCount.innerText = totalItemsCount;
    totalPriceElement.innerText = `${total.toFixed(2)}DA`;
}

// 3. Remove Item
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

// 4. Send Order via Netlify Serverless Function (Production Safe)
function sendOrderEmail(event) {
    event.preventDefault();

    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    const submitBtn = document.getElementById('submit-btn');
    const originalBtnText = submitBtn ? submitBtn.innerText : 'Send Order';
    
    if (submitBtn) {
        submitBtn.innerText = 'Transmitting Order... 🦇';
        submitBtn.disabled = true;
    }

    const orderId = generateUniqueOrderId();

    // جلب التفاصيل من عناصر HTML
    const customerName = document.getElementById('customer-name').value;
    const customerPhone = document.getElementById('customer-phone').value;
    const customerWilaya = document.getElementById('customer-wilaya') ? document.getElementById('customer-wilaya').value : 'N/A';
    const customerAddress = document.getElementById('customer-address').value;
    
    // جلب الملاحظة بأمان
    const noteElement = document.getElementById('customer-note');
    const customerNote = (noteElement && noteElement.value.trim() !== '') ? noteElement.value.trim() : 'None';
    
    const deliveryTypeOption = document.querySelector('input[name="delivery_type"]:checked');
    const deliveryType = deliveryTypeOption ? deliveryTypeOption.value : 'Home Delivery';
    const totalPrice = document.getElementById('total-price').innerText;

    let itemsList = '';
    cart.forEach((item, i) => {
        itemsList += `${i + 1}. ${item.title} — x${item.quantity} (${(item.price * item.quantity).toFixed(2)}DA)\n`;
    });
    
    // إعداد نص الرسالة كاملة
    const telegramMessage = 
`🍷 NEW GOTHIC ORDER RECEIVED 🍷
------------------------------------
🆔 Order ID: ${orderId}

👤 Customer Details:
• Name: ${customerName}
• Phone: ${customerPhone}
• Wilaya: ${customerWilaya}
• Address: ${customerAddress}
• Delivery Type: ${deliveryType}
• Note: ${customerNote}

🛍️ Order Items:
${itemsList}
💰 Total Amount: ${totalPrice}
------------------------------------
⏰ Time: ${new Date().toLocaleString()}`;

    // الإرسال الخفي عبر Netlify Function
    fetch('/.netlify/functions/send-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramMessage: telegramMessage })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(`🕯️ Thank you! Your order has been placed successfully.\n\nYour Unique Order ID is: ${orderId}\nPlease keep this ID for reference!`);
            
            cart = [];
            updateCartUI();
            document.getElementById('checkout-form').reset();
            
            if (typeof toggleCart === 'function') {
                toggleCart();
            }
        } else {
            throw new Error(data.error || 'Failed to send to Telegram');
        }
    })
    .catch(error => {
        console.error('Error sending order:', error);
        alert(`Failed to process order: ${error.message}`);
    })
    .finally(() => {
        if (submitBtn) {
            submitBtn.innerText = originalBtnText;
            submitBtn.disabled = false;
        }
    });
}
