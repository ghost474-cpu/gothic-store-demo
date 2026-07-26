// ==========================================
// Gothic E-Commerce Store - Main Script
// ==========================================

// Cart State
let cart = [];

// 1. Generate Unique 7-Character Order ID (No repetition guaranteed)
function generateUniqueOrderId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomPart = '';
  
  // 4 random characters
  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // 3 characters based on current millisecond timestamp
  const timePart = Date.now().toString(36).slice(-3).toUpperCase();
  
  return `#${randomPart}${timePart}`; // Example: #A9K2X8L
}

// 2. Add Item to Cart
function addToCart(title, price) {
  const existingItem = cart.find(item => item.title === title);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ title, price, quantity: 1 });
  }
  updateCartUI();
}

// 3. Update Cart Interface & Totals
function updateCartUI() {
  const cartItemsContainer = document.getElementById('cart-items');
  const cartCount = document.getElementById('cart-count');
  const totalPriceElement = document.getElementById('total-price');

  if (!cartItemsContainer || !cartCount || !totalPriceElement) return;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Your cart is currently empty in the dark shadows.</p>';
    cartCount.innerText = '0';
    totalPriceElement.innerText = '$0.00';
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
        <br><small style="color: #c5a059;">$${(item.price * item.quantity).toFixed(2)}</small>
      </div>
      <button onclick="removeFromCart(${index})" style="background: none; border: none; color: #8b0000; cursor: pointer; font-size: 0.9rem; font-weight: bold;">✕</button>
    `;
    cartItemsContainer.appendChild(itemElement);
  });

  cartCount.innerText = totalItemsCount;
  totalPriceElement.innerText = `$${total.toFixed(2)}`;
}

// 4. Remove Item from Cart
function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartUI();
}

// 5. Send Order via Netlify Secure Serverless Function
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

  // Generate unique order ID
  const orderId = generateUniqueOrderId();

  // Get customer input
  const customerName = document.getElementById('customer-name').value;
  const customerPhone = document.getElementById('customer-phone').value;
  const customerAddress = document.getElementById('customer-address').value;
  const totalPrice = document.getElementById('total-price').innerText;

  // Format product list
  let itemsList = '';
  cart.forEach((item, i) => {
    itemsList += `${i + 1}. *${item.title}* — x${item.quantity} ($${(item.price * item.quantity).toFixed(2)})\n`;
  });

  // Construct Markdown telegram message
  const telegramMessage = 
`🍷 *NEW GOTHIC ORDER RECEIVED* 🍷
━━━━━━━━━━━━━━━━━━━━
🆔 *Order ID:* \`${orderId}\`

👤 *Customer Details:*
• *Name:* ${customerName}
• *Phone:* \`${customerPhone}\`
• *Address:* ${customerAddress}

🛍️ *Order Items:*
${itemsList}
💰 *Total Amount:* *${totalPrice}*
━━━━━━━━━━━━━━━━━━━━
⏰ *Time:* ${new Date().toLocaleString()}`;

  // Call Netlify Function endpoint safely
  fetch('/.netlify/functions/send-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message: telegramMessage })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert(`🕯️ Thank you! Your order has been placed successfully.\n\nYour Unique Order ID is: ${orderId}\nPlease keep this ID for reference!`);
      
      // Reset cart and form
      cart = [];
      updateCartUI();
      document.getElementById('checkout-form').reset();
      
      if (typeof toggleCart === 'function') {
        toggleCart();
      }
    } else {
      throw new Error(data.error || 'Failed to process order via backend.');
    }
  })
  .catch(error => {
    console.error('Error sending order:', error);
    alert('Failed to process order. Please try again or check your connection.');
  })
  .finally(() => {
    if (submitBtn) {
      submitBtn.innerText = originalBtnText;
      submitBtn.disabled = false;
    }
  });
}