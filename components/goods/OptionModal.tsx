'use client';

import { useEffect, useMemo, useState } from 'react';
import { useCart } from '@/components/providers/CartProvider';
import { getGoodsUnitPrice } from '@/lib/goodsPrice';
import type { Goods } from '@/types/goods';
import type { CartOption } from '@/types/cart';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface Props {
  goods: Goods | null;
  onClose: () => void;
}

type SelectedOptions = Record<string, string>;

export default function GoodsOptionModal({ goods, onClose }: Props) {
  const addItem = useCart((state) => state.addItem);

  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({});

  const [quantity, setQuantity] = useState(1);

  const unitPrice = useMemo(() => {
    if (!goods) {
      return 0;
    }

    return getGoodsUnitPrice(goods, quantity);
  }, [goods, quantity]);

  const subtotal = unitPrice * quantity;

  /*
   * 모든 옵션 선택 여부
   */
  const isOptionComplete = useMemo(() => {
    if (!goods?.options?.length) {
      return true;
    }

    return goods.options.every((option) => Boolean(selectedOptions[option.name]));
  }, [goods, selectedOptions]);

  /*
   * 다른 상품을 열 때
   * 옵션 / 수량 초기화
   */
  useEffect(() => {
    if (!goods) return;

    const resetState = () => {
      setSelectedOptions({});
      setQuantity(1);
    };

    const frameId = window.requestAnimationFrame(resetState);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [goods]);

  if (!goods) {
    return null;
  }

  const handleSelectOption = (name: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,

      [name]: value,
    }));
  };

  const handleDecrease = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncrease = () => {
    setQuantity((prev) => Math.min(goods.stock, prev + 1));
  };

  const handleAddCart = () => {
    if (!isOptionComplete) {
      return;
    }

    const options: CartOption[] =
      goods.options?.map((option) => ({
        name: option.name,

        value: selectedOptions[option.name],
      })) ?? [];

    addItem({
      goodsId: goods._id,
      slug: goods.slug,

      name: goods.name,
      price: goods.price,
      salePrice: goods.salePrice ?? undefined,
      quantityDiscounts: goods.quantityDiscounts ?? undefined,

      image: goods.image,

      options,

      quantity,

      stock: goods.stock,
    });

    onClose();
  };

  return (
    <Modal
      className="goods-option-modal"
      contentKey={goods._id}
      open={goods !== null}
      onClose={onClose}
    >
      <button
        type="button"
        className="option-modal-close"
        onClick={onClose}
        aria-label="옵션창 닫기"
      >
        <span className="material-symbols-rounded">close</span>
      </button>

      <div className="option-modal-title">
        <strong id="goods-option-modal-title">{goods.name}</strong>

        <span>{goods.price.toLocaleString()}원</span>

        {goods.quantityDiscounts?.length
          ? goods.quantityDiscounts.map((discount) => (
              <small key={discount.minQuantity}>
                {discount.minQuantity}개 이상 구매시 {discount.unitPrice.toLocaleString()}원
              </small>
            ))
          : null}
      </div>

      {/* 옵션 */}
      {goods.options?.map((option) => (
        <div key={option.name} className="modal-option">
          <div className="option-title">{option.name}</div>

          <div className="option-list">
            {option.values.map((value) => {
              const active = selectedOptions[option.name] === value;

              return (
                <button
                  key={value}
                  type="button"
                  className={active ? 'active' : ''}
                  aria-pressed={active}
                  onClick={() => handleSelectOption(option.name, value)}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* 수량 */}
      <div className="modal-quantity">
        <span>수량</span>

        <div className="quantity-control">
          <button
            type="button"
            onClick={handleDecrease}
            disabled={quantity <= 1}
            aria-label="수량 감소"
          >
            −
          </button>

          <span>{quantity}</span>

          <button
            type="button"
            onClick={handleIncrease}
            disabled={quantity >= goods.stock}
            aria-label="수량 증가"
          >
            +
          </button>
        </div>
      </div>

      {/* 총 금액 */}
      <div className="modal-total">
        <span>총 금액</span>

        <strong>
          {goods.quantityDiscounts?.length ? (
            <small>(개당 {unitPrice.toLocaleString()}원)</small>
          ) : null}
          {subtotal.toLocaleString()}원
        </strong>
      </div>

      <Button className="modal-submit" disabled={!isOptionComplete} onClick={handleAddCart}>
        장바구니 담기
      </Button>
    </Modal>
  );
}
