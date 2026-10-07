'use client';

import Image from 'next/image';

import type { CartItem } from '@/types/cart';
import { getGoodsUnitPrice } from '@/lib/goodsPrice';
import { Button } from '@/components/ui/Button';

interface Props {
  items: CartItem[];

  quantityByGoodsId: Map<string, number>;

  originalTotalPrice: number;
  discountedTotalPrice: number;
  totalDiscountPrice: number;

  removeItem: (cartId: string) => void;

  increaseQuantity: (cartId: string) => void;

  decreaseQuantity: (cartId: string) => void;

  //clearCart: () => void;

  //closeCart: () => void;

  onOrder: () => void;
}

export default function Cart({
  items,
  quantityByGoodsId,
  originalTotalPrice,
  discountedTotalPrice,
  totalDiscountPrice,
  removeItem,
  increaseQuantity,
  decreaseQuantity,
  //clearCart,
  //closeCart,
  onOrder,
}: Props) {
  return (
    <>
      {/* <div className="cart-header">
        <h2>장바구니</h2>

        <button type="button" className="cart-close" onClick={closeCart} aria-label="닫기">
          <span className="material-symbols-rounded">close</span>
        </button>
      </div> */}

      {items.length === 0 ? (
        <div className="cart-empty">장바구니가 비어 있습니다.</div>
      ) : (
        <div className="cart-body">
          <div className="cart-list">
            {items.map((item) => {
              const totalQuantity = quantityByGoodsId.get(item.goodsId) ?? item.quantity;
              const unitPrice = getGoodsUnitPrice(item, totalQuantity);
              const originalSubtotal = item.price * item.quantity;
              const subtotal = unitPrice * item.quantity;
              const discountPrice = originalSubtotal - subtotal;

              return (
                <article key={item.cartId} className="cart-item">
                  <div className="cart-image">
                    {item.image && <Image src={item.image} alt={item.name} fill sizes="96px" />}
                  </div>

                  <div className="cart-info">
                    <div className="cart-item-head">
                      <div>
                        <h3>{item.name}</h3>

                        {!!item.options.length && (
                          <div className="cart-options">
                            {item.options.map((option) => (
                              <span key={`${option.name}-${option.value}`}>
                                {option.name}: {option.value}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        className="cart-remove"
                        onClick={() => removeItem(item.cartId)}
                        aria-label={`${item.name} 삭제`}
                      >
                        <span className="material-symbols-rounded">delete</span>
                      </button>
                    </div>

                    <div className="cart-item-bottom">
                      <div className="cart-item-quantity">
                        <button
                          type="button"
                          onClick={() => decreaseQuantity(item.cartId)}
                          disabled={item.quantity <= 1}
                        >
                          −
                        </button>

                        <span>{item.quantity}</span>

                        <button
                          type="button"
                          onClick={() => increaseQuantity(item.cartId)}
                          disabled={item.quantity >= item.stock}
                        >
                          +
                        </button>
                      </div>

                      <div className="cart-item-price">
                        {discountPrice > 0 && <del>{originalSubtotal.toLocaleString()}원</del>}

                        <strong>{subtotal.toLocaleString()}원</strong>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="cart-summary">
            <div className="cart-summary-row">
              <span>상품금액</span>

              <span>{originalTotalPrice.toLocaleString()}원</span>
            </div>

            <div className="cart-summary-row discount">
              <span>할인금액</span>

              <span>-{totalDiscountPrice.toLocaleString()}원</span>
            </div>

            <div className="cart-summary-row total">
              <span>총 주문금액</span>

              <strong>
                {discountedTotalPrice.toLocaleString()}
                <small>원</small>
              </strong>
            </div>
          </div>

          <div className="cart-actions">
            <Button className="cart-order" onClick={onOrder} opacity={0.7}>
              주문하기
            </Button>

            {/* <button
              type="button"
              className="cart-clear"
              onClick={clearCart}
            >
              비우기
            </button> */}
          </div>

          {/* <div className="cart-footer"></div> */}
        </div>
      )}
    </>
  );
}
