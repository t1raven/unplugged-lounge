'use client';

import { useState } from 'react';

import Modal from '@/components/ui/Modal';
import { useCart } from '@/components/providers/CartProvider';
import { getGoodsUnitPrice } from '@/lib/goodsPrice';

import Cart from './Cart';
import Order from './Order';
import Complete from './Complete';

import type { OrderDelivery } from '@/types/siteSettings';

import './style.scss';

interface Props {
  orderDeliverySettings: OrderDelivery;
}

export default function CartModal({ orderDeliverySettings }: Props) {
  const { isCartOpen } = useCart();

  // 열릴 때마다 새로 마운트되어 state가 초기화됨 (장바구니 화면부터 시작)
  if (!isCartOpen) {
    return null;
  }

  return <CartModalContent orderDeliverySettings={orderDeliverySettings} />;
}

function CartModalContent({ orderDeliverySettings }: Props) {
  const {
    items,
    isCartOpen,
    closeCart,
    removeItem,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
  } = useCart();

  const [step, setStep] = useState('cart');

  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const originalTotalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0);

  const quantityByGoodsId = items.reduce((map, item) => {
    map.set(item.goodsId, (map.get(item.goodsId) ?? 0) + item.quantity);

    return map;
  }, new Map<string, number>());

  const discountedTotalPrice = items.reduce((total, item) => {
    const totalQuantity = quantityByGoodsId.get(item.goodsId) ?? item.quantity;

    const unitPrice = getGoodsUnitPrice(item, totalQuantity);

    return total + unitPrice * item.quantity;
  }, 0);

  const totalDiscountPrice = originalTotalPrice - discountedTotalPrice;

  const totalPrice = items.reduce((total, item) => {
    const unitPrice = getGoodsUnitPrice(item, item.quantity);

    return total + unitPrice * item.quantity;
  }, 0);

  const handleComplete = (orderNumber: string) => {
    setOrderNumber(orderNumber);

    clearCart();

    setStep('complete');
  };

  return (
    <Modal className="cart-modal" open={isCartOpen} onClose={closeCart}>
      {step === 'cart' && (
        <Cart
          items={items}
          quantityByGoodsId={quantityByGoodsId}
          originalTotalPrice={originalTotalPrice}
          discountedTotalPrice={discountedTotalPrice}
          totalDiscountPrice={totalDiscountPrice}
          removeItem={removeItem}
          increaseQuantity={increaseQuantity}
          decreaseQuantity={decreaseQuantity}
          clearCart={clearCart}
          closeCart={closeCart}
          onOrder={() => setStep('order')}
        />
      )}

      {step === 'order' && (
        <Order
          items={items}
          totalPrice={totalPrice}
          orderDeliverySettings={orderDeliverySettings}
          onBack={() => setStep('cart')}
          closeCart={closeCart}
          onComplete={handleComplete}
        />
      )}

      {step === 'complete' && <Complete orderNumber={orderNumber} onClose={closeCart} />}
    </Modal>
  );
}
