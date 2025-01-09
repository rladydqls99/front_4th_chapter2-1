import { ITEM_DISCOUNT_RATE, PRODUCT_LIST } from './constants/constants.js';

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
      let _randomProduct =
        PRODUCT_LIST[Math.floor(Math.random() * PRODUCT_LIST.length)];
      if (Math.random() < 0.3 && _randomProduct.stock > 0) {
        _randomProduct.price = Math.round(_randomProduct.price * 0.8);
        alert('번개세일! ' + _randomProduct.name + '이(가) 20% 할인 중입니다!');
        updateProductOptions();
      }
    }, 30000);
  }, Math.random() * 10000);
}

function initRecommendationTimer() {
  setTimeout(function () {
    setInterval(function () {
      if (lastSelectedProduct) {
        let _recommendedProduct = PRODUCT_LIST.find(function (item) {
          return item.id !== lastSelectedProduct && item.stock > 0;
        });
        if (_recommendedProduct) {
          alert(
            _recommendedProduct.name +
              '은(는) 어떠세요? 지금 구매하시면 5% 추가 할인!'
          );
          _recommendedProduct.price = Math.round(
            _recommendedProduct.price * 0.95
          );
          updateProductOptions();
        }
      }
    }, 60000);
  }, Math.random() * 20000);
}

// 상품 개수가 변했을 때 옵션의 속성을 변경하는 함수
function updateProductOptions() {
  productDropdown.innerHTML = '';
  PRODUCT_LIST.forEach((product) => {
    let _option = document.createElement('option');

    _option.value = product.id;
    _option.textContent = `${product.name} - ${product.price}원`;

    if (product.stock === 0) _option.disabled = true;

    productDropdown.appendChild(_option);
  });
}

function calculateCartTotal() {
  cartTotalAmount = 0;
  totalItemQuantity = 0;

  let _cartItems = cartItemContainer.children;
  let _subtotalBeforeDiscount = 0;

  for (let i = 0; i < _cartItems.length; i++) {
    (function () {
      let _currentProduct;
      for (let j = 0; j < PRODUCT_LIST.length; j++) {
        if (PRODUCT_LIST[j].id === _cartItems[i].id) {
          _currentProduct = PRODUCT_LIST[j];
          break;
        }
      }
      let _itemQuantity = parseInt(
        _cartItems[i].querySelector('span').textContent.split('x ')[1]
      );
      let _itemSubtotal = _currentProduct.price * _itemQuantity;
      let _itemDiscountRate = 0;

      totalItemQuantity += _itemQuantity;
      _subtotalBeforeDiscount += _itemSubtotal;

      if (_itemQuantity >= 10) {
        _itemDiscountRate = ITEM_DISCOUNT_RATE[_currentProduct.id];
      }
      cartTotalAmount += _itemSubtotal * (1 - _itemDiscountRate);
    })();
  }
  let _finalDiscountRate = 0;
  _finalDiscountRate = calculateFinalDiscount(_subtotalBeforeDiscount);
  _finalDiscountRate = applyTuesdayDiscount(_finalDiscountRate);

  updateCartDisplay(_finalDiscountRate);
  updateInventoryDisplay();
  updateLoyaltyPoints();
}

function calculateFinalDiscount(subtotalBeforeDiscount) {
  let _finalDiscountRate = 0;
  if (totalItemQuantity >= 30) {
    let _bulkDiscount = cartTotalAmount * 0.25;
    let _itemDiscount = subtotalBeforeDiscount - cartTotalAmount;

    if (_bulkDiscount > _itemDiscount) {
      cartTotalAmount = subtotalBeforeDiscount * (1 - 0.25);
      _finalDiscountRate = 0.25;
    } else {
      _finalDiscountRate = _itemDiscount / subtotalBeforeDiscount;
    }
  } else {
    _finalDiscountRate =
      (subtotalBeforeDiscount - cartTotalAmount) / subtotalBeforeDiscount;
  }
  return _finalDiscountRate;
}

function applyTuesdayDiscount(finalDiscountRate) {
  if (new Date().getDay() === 2) {
    cartTotalAmount *= 1 - 0.1;
    return Math.max(finalDiscountRate, 0.1);
  }
  return finalDiscountRate;
}

function updateCartDisplay(discountRate) {
  cartTotalDisplay.textContent = `총액: ${Math.round(cartTotalAmount)}원`;

  if (discountRate > 0) {
    let _discountLabel = document.createElement('span');

    _discountLabel.className = 'text-green-500 ml-2';
    _discountLabel.textContent = `(${(discountRate * 100).toFixed(1)}% 할인 적용)`;

    cartTotalDisplay.appendChild(_discountLabel);
  }
}

function updateLoyaltyPoints() {
  loyaltyPoints = Math.floor(cartTotalAmount / 1000);

  let _pointsDisplay = document.getElementById('loyalty-points');

  if (!_pointsDisplay) {
    _pointsDisplay = document.createElement('span');
    _pointsDisplay.id = 'loyalty-points';
    _pointsDisplay.className = 'text-blue-500 ml-2';

    cartTotalDisplay.appendChild(_pointsDisplay);
  }
  _pointsDisplay.textContent = `(포인트: ${loyaltyPoints})`;
}

function updateInventoryDisplay() {
  let _statusMessage = '';

  PRODUCT_LIST.forEach((product) => {
    if (product.stock < 5) {
      if (product.stock > 0) {
        _statusMessage = `${product.name}: 재고 부족 ('${product.stock}'개 남음`;
      } else {
        _statusMessage = `${product.name}: 품절`;
      }
    }
  });
  inventoryStatus.textContent = _statusMessage;
}

initShoppingCart();

addToCartButton.addEventListener('click', () => {
  let _selectedProductId = productDropdown.value;
  let _selectedProduct = PRODUCT_LIST.find((p) => {
    return p.id === _selectedProductId;
  });

  if (_selectedProduct && _selectedProduct.stock > 0) {
    let _cartItem = document.getElementById(_selectedProduct.id);

    if (_cartItem) {
      let _newQuantity =
        parseInt(_cartItem.querySelector('span').textContent.split('x ')[1]) +
        1;

      if (_newQuantity <= _selectedProduct.stock) {
        _cartItem.querySelector('span').textContent =
          `${_selectedProduct.name} - ${_selectedProduct.price} +원 x ${_newQuantity}`;

        _selectedProduct.stock--;
      } else {
        alert('재고가 부족합니다.');
      }
    } else {
      let _newCartItem = document.createElement('div');

      _newCartItem.id = _selectedProduct.id;
      _newCartItem.className = 'flex justify-between items-center mb-2';
      _newCartItem.innerHTML =
        '<span>' +
        _selectedProduct.name +
        ' - ' +
        _selectedProduct.price +
        '원 x 1</span><div>' +
        '<button class="quantity-change bg-blue-500 text-white px-2 py-1 rounded mr-1" data-product-id="' +
        _selectedProduct.id +
        '" data-change="-1">-</button>' +
        '<button class="quantity-change bg-blue-500 text-white px-2 py-1 rounded mr-1" data-product-id="' +
        _selectedProduct.id +
        '" data-change="1">+</button>' +
        '<button class="remove-item bg-red-500 text-white px-2 py-1 rounded" data-product-id="' +
        _selectedProduct.id +
        '">삭제</button></div>';
      cartItemContainer.appendChild(_newCartItem);
      _selectedProduct.stock--;
    }
    calculateCartTotal();
    lastSelectedProduct = _selectedProductId;
  }
});

cartItemContainer.addEventListener('click', function (event) {
  let _clickedButton = event.target;
  if (
    _clickedButton.classList.contains('quantity-change') ||
    _clickedButton.classList.contains('remove-item')
  ) {
    let _productId = _clickedButton.dataset.productId;
    let _cartItem = document.getElementById(_productId);
    let _product = PRODUCT_LIST.find((product) => {
      return product.id === _productId;
    });

    if (_clickedButton.classList.contains('quantity-change')) {
      let _quantityChange = parseInt(_clickedButton.dataset.change);
      let _newQuantity =
        parseInt(_cartItem.querySelector('span').textContent.split('x ')[1]) +
        _quantityChange;
      if (
        _newQuantity > 0 &&
        _newQuantity <=
          _product.stock +
            parseInt(_cartItem.querySelector('span').textContent.split('x ')[1])
      ) {
        _cartItem.querySelector('span').textContent =
          _cartItem.querySelector('span').textContent.split('x ')[0] +
          'x ' +
          _newQuantity;
        _product.stock -= _quantityChange;
      } else if (_newQuantity <= 0) {
        _cartItem.remove();
        _product.stock -= _quantityChange;
      } else {
        alert('재고가 부족합니다.');
      }
    } else if (_clickedButton.classList.contains('remove-item')) {
      let _removeQuantity = parseInt(
        _cartItem.querySelector('span').textContent.split('x ')[1]
      );
      _product.stock += _removeQuantity;
      _cartItem.remove();
    }
    calculateCartTotal();
  }
});
