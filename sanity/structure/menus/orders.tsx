import type { MenuFactory } from '../types';
import { API_VERSION } from '../types';
import type { StructureResolver } from 'sanity/structure';
import { BillIcon } from '@sanity/icons/Bill';
import { OrderCountBadge } from '../../components/StudioCountBadge';
export const createOrdersMenu: MenuFactory = (S) => {
  return S.listItem()
    .id('purchase-management') // 고유 ID 추가
    .title('굿즈 주문내역')
    .icon(BillIcon)
    .child(
      S.list()
        .id('purchase-management-list') // 고유 ID 추가
        .title('굿즈 주문내역')
        .items([
          createOrderList(S, 'all-orders', '전체', 'all'),

          createOrderList(S, 'pending-orders', '신청', 'pending'),

          createOrderList(S, 'confirmed-orders', '확인', 'confirmed'),

          createOrderList(S, 'paid-orders', '입금 완료', 'paid'),

          createOrderList(S, 'inTransit-orders', '배송 중', 'inTransit'),

          createOrderList(S, 'completed-orders', '수령 완료', 'completed'),

          createOrderList(S, 'cancelled-orders', '취소', 'cancelled'),
        ]),
    );
};
function createOrderList(
  S: Parameters<StructureResolver>[0],
  id: string,
  title: string,
  status: NonNullable<Parameters<typeof OrderCountBadge>[0]['status']>,
) {
  const filter =
    status != 'all'
      ? `_type == "purchaseOrder" && status == "${status}"`
      : `_type == "purchaseOrder"`;

  const list = S.documentList()
    .id(`${id}-list`)
    .title(title)
    .schemaType('purchaseOrder')
    .apiVersion(API_VERSION)
    .filter(filter)
    .defaultOrdering([
      {
        field: 'createdAt',
        direction: 'desc',
      },
    ]);

  if (status) {
    list.params({ status });
  }

  return S.listItem()
    .id(id)
    .icon(() => OrderCountBadge({ status: status }))
    .title(title)
    .child(list);
}
