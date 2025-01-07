import { initialProducts } from './constants/products.js';

let productDropdown,
  addToCartButton,
  cartItemContainer,
  cartTotalDisplay,
  inventoryStatus;
let lastSelectedProduct,
  loyaltyPoints = 0,
  cartTotalAmount = 0,
  totalItemQuantity = 0;

function initShoppingCart() {
  let root = document.getElementById('app');
  let container = document.createElement('div');
  let wrapper = document.createElement('div');
  let cartTitle = document.createElement('h1');
  cartItemContainer = document.createElement('div');
  cartTotalDisplay = document.createElement('div');
  productDropdown = document.createElement('select');
  addToCartButton = document.createElement('button');
  inventoryStatus = document.createElement('div');

  cartItemContainer.id = 'cart-items';
  cartTotalDisplay.id = 'cart-total';
  productDropdown.id = 'product-select';
  addToCartButton.id = 'add-to-cart';
  inventoryStatus.id = 'stock-status';
  container.className = 'bg-gray-100 p-8';
  wrapper.className =
    'max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8';
  cartTitle.className = 'text-2xl font-bold mb-4';
  cartTotalDisplay.className = 'text-xl font-bold my-4';
  productDropdown.className = 'border rounded p-2 mr-2';
  addToCartButton.className = 'bg-blue-500 text-white px-4 py-2 rounded';
  inventoryStatus.className = 'text-sm text-gray-500 mt-2';
  cartTitle.textContent = '장바구니';
  addToCartButton.textContent = '추가';

  updateProductOptions();
  wrapper.appendChild(cartTitle);
  wrapper.appendChild(cartItemContainer);
  wrapper.appendChild(cartTotalDisplay);
  wrapper.appendChild(productDropdown);
  wrapper.appendChild(addToCartButton);
  wrapper.appendChild(inventoryStatus);
  container.appendChild(wrapper);
  root.appendChild(container);

  calculateCartTotal();
  initFlashSaleTimer();
  initRecommendationTimer();
}

function initFlashSaleTimer() {
  setTimeout(function () {
    setInterval(function () {
      let randomProduct =
        initialProducts[Math.floor(Math.random() * initialProducts.length)];
      if (Math.random() < 0.3 && randomProduct.stock > 0) {
        randomProduct.price = Math.round(randomProduct.price * 0.8);
        alert('번개세일! ' + randomProduct.name + '이(가) 20% 할인 중입니다!');
        updateProductOptions();
      }
    }, 30000);
  }, Math.random() * 10000);
}

function initRecommendationTimer() {
  setTimeout(function () {
    setInterval(function () {
      if (lastSelectedProduct) {
        let recommendedProduct = initialProducts.find(function (item) {
          return item.id !== lastSelectedProduct && item.stock > 0;
        });
        if (recommendedProduct) {
          alert(
            recommendedProduct.name +
              '은(는) 어떠세요? 지금 구매하시면 5% 추가 할인!'
          );
          recommendedProduct.price = Math.round(
            recommendedProduct.price * 0.95
          );
          updateProductOptions();
        }
      }
    }, 60000);
  }, Math.random() * 20000);
}

function updateProductOptions() {
  productDropdown.innerHTML = '';
  initialProducts.forEach(function (product) {
    let option = document.createElement('option');
    option.value = product.id;
    option.textContent = product.name + ' - ' + product.price + '원';
    if (product.stock === 0) option.disabled = true;
    productDropdown.appendChild(option);
  });
}

function calculateCartTotal() {
  cartTotalAmount = 0;
  totalItemQuantity = 0;
  let cartItems = cartItemContainer.children;
  let subtotalBeforeDiscount = 0;

  for (let i = 0; i < cartItems.length; i++) {
    (function () {
      let currentProduct;
      for (let j = 0; j < initialProducts.length; j++) {
        if (initialProducts[j].id === cartItems[i].id) {
          currentProduct = initialProducts[j];
          break;
        }
      }
      let itemQuantity = parseInt(
        cartItems[i].querySelector('span').textContent.split('x ')[1]
      );
      let itemSubtotal = currentProduct.price * itemQuantity;
      let itemDiscountRate = 0;

      totalItemQuantity += itemQuantity;
      subtotalBeforeDiscount += itemSubtotal;

      if (itemQuantity >= 10) {
        if (currentProduct.id === 'p1') itemDiscountRate = 0.1;
        else if (currentProduct.id === 'p2') itemDiscountRate = 0.15;
        else if (currentProduct.id === 'p3') itemDiscountRate = 0.2;
        else if (currentProduct.id === 'p4') itemDiscountRate = 0.05;
        else if (currentProduct.id === 'p5') itemDiscountRate = 0.25;
      }
      cartTotalAmount += itemSubtotal * (1 - itemDiscountRate);
    })();
  }
  let finalDiscountRate = 0;
  finalDiscountRate = calculateFinalDiscount(subtotalBeforeDiscount);
  finalDiscountRate = applyTuesdayDiscount(finalDiscountRate);
  updateCartDisplay(finalDiscountRate);
  updateInventoryDisplay();
  updateLoyaltyPoints();
}

function calculateFinalDiscount(subtotalBeforeDiscount) {
  let finalDiscountRate = 0;
  if (totalItemQuantity >= 30) {
    let bulkDiscount = cartTotalAmount * 0.25;
    let itemDiscount = subtotalBeforeDiscount - cartTotalAmount;
    if (bulkDiscount > itemDiscount) {
      cartTotalAmount = subtotalBeforeDiscount * (1 - 0.25);
      finalDiscountRate = 0.25;
    } else {
      finalDiscountRate =
        (subtotalBeforeDiscount - cartTotalAmount) / subtotalBeforeDiscount;
    }
  } else {
    finalDiscountRate =
      (subtotalBeforeDiscount - cartTotalAmount) / subtotalBeforeDiscount;
  }
  return finalDiscountRate;
}

function applyTuesdayDiscount(finalDiscountRate) {
  if (new Date().getDay() === 2) {
    cartTotalAmount *= 1 - 0.1;
    return Math.max(finalDiscountRate, 0.1);
  }
  return finalDiscountRate;
}

function updateCartDisplay(discountRate) {
  cartTotalDisplay.textContent = '총액: ' + Math.round(cartTotalAmount) + '원';
  if (discountRate > 0) {
    let discountLabel = document.createElement('span');
    discountLabel.className = 'text-green-500 ml-2';
    discountLabel.textContent =
      '(' + (discountRate * 100).toFixed(1) + '% 할인 적용)';
    cartTotalDisplay.appendChild(discountLabel);
  }
}

function updateLoyaltyPoints() {
  loyaltyPoints = Math.floor(cartTotalAmount / 1000);
  let pointsDisplay = document.getElementById('loyalty-points');
  if (!pointsDisplay) {
    pointsDisplay = document.createElement('span');
    pointsDisplay.id = 'loyalty-points';
    pointsDisplay.className = 'text-blue-500 ml-2';
    cartTotalDisplay.appendChild(pointsDisplay);
  }
  pointsDisplay.textContent = '(포인트: ' + loyaltyPoints + ')';
}

function updateInventoryDisplay() {
  let statusMessage = '';
  initialProducts.forEach(function (product) {
    if (product.stock < 5) {
      statusMessage +=
        product.name +
        ': ' +
        (product.stock > 0
          ? '재고 부족 (' + product.stock + '개 남음)'
          : '품절') +
        '\n';
    }
  });
  inventoryStatus.textContent = statusMessage;
}

initShoppingCart();

addToCartButton.addEventListener('click', function () {
  let selectedProductId = productDropdown.value;
  let selectedProduct = initialProducts.find(function (p) {
    return p.id === selectedProductId;
  });
  if (selectedProduct && selectedProduct.stock > 0) {
    let cartItem = document.getElementById(selectedProduct.id);
    if (cartItem) {
      let newQuantity =
        parseInt(cartItem.querySelector('span').textContent.split('x ')[1]) + 1;
      if (newQuantity <= selectedProduct.stock) {
        cartItem.querySelector('span').textContent =
          selectedProduct.name +
          ' - ' +
          selectedProduct.price +
          '원 x ' +
          newQuantity;
        selectedProduct.stock--;
      } else {
        alert('재고가 부족합니다.');
      }
    } else {
      let newCartItem = document.createElement('div');
      newCartItem.id = selectedProduct.id;
      newCartItem.className = 'flex justify-between items-center mb-2';
      newCartItem.innerHTML =
        '<span>' +
        selectedProduct.name +
        ' - ' +
        selectedProduct.price +
        '원 x 1</span><div>' +
        '<button class="quantity-change bg-blue-500 text-white px-2 py-1 rounded mr-1" data-product-id="' +
        selectedProduct.id +
        '" data-change="-1">-</button>' +
        '<button class="quantity-change bg-blue-500 text-white px-2 py-1 rounded mr-1" data-product-id="' +
        selectedProduct.id +
        '" data-change="1">+</button>' +
        '<button class="remove-item bg-red-500 text-white px-2 py-1 rounded" data-product-id="' +
        selectedProduct.id +
        '">삭제</button></div>';
      cartItemContainer.appendChild(newCartItem);
      selectedProduct.stock--;
    }
    calculateCartTotal();
    lastSelectedProduct = selectedProductId;
  }
});

cartItemContainer.addEventListener('click', function (event) {
  let clickedButton = event.target;
  if (
    clickedButton.classList.contains('quantity-change') ||
    clickedButton.classList.contains('remove-item')
  ) {
    let productId = clickedButton.dataset.productId;
    let cartItem = document.getElementById(productId);
    let product = initialProducts.find(function (p) {
      return p.id === productId;
    });

    if (clickedButton.classList.contains('quantity-change')) {
      let quantityChange = parseInt(clickedButton.dataset.change);
      let newQuantity =
        parseInt(cartItem.querySelector('span').textContent.split('x ')[1]) +
        quantityChange;
      if (
        newQuantity > 0 &&
        newQuantity <=
          product.stock +
            parseInt(cartItem.querySelector('span').textContent.split('x ')[1])
      ) {
        cartItem.querySelector('span').textContent =
          cartItem.querySelector('span').textContent.split('x ')[0] +
          'x ' +
          newQuantity;
        product.stock -= quantityChange;
      } else if (newQuantity <= 0) {
        cartItem.remove();
        product.stock -= quantityChange;
      } else {
        alert('재고가 부족합니다.');
      }
    } else if (clickedButton.classList.contains('remove-item')) {
      let removeQuantity = parseInt(
        cartItem.querySelector('span').textContent.split('x ')[1]
      );
      product.stock += removeQuantity;
      cartItem.remove();
    }
    calculateCartTotal();
  }
});
