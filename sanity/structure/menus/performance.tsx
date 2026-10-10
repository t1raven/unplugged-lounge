import type { MenuFactory } from '../types';
import { API_VERSION } from '../types';
import { CalendarIcon } from '@sanity/icons/Calendar';
import { MarkerIcon } from '@sanity/icons/Marker';
import { StarIcon } from '@sanity/icons/Star';
import { MicrophoneIcon } from '@sanity/icons/Microphone';
import { PerformanceCountBadge } from '../../components/ui/StudioCountBadge';
export const createPerformanceMenu: MenuFactory = (S, context) => {
  const client = context.getClient({ apiVersion: API_VERSION }).withConfig({
    perspective: 'drafts',
    useCdn: false,
  });
  return S.listItem()
    .id('performances')
    .title('공연 일정')
    .icon(CalendarIcon)
    .child(async () => {
      const now = new Date();

      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);

      const tomorrowStart = new Date(todayStart);
      tomorrowStart.setDate(tomorrowStart.getDate() + 1);

      const todayStartISO = todayStart.toISOString();
      const tomorrowStartISO = tomorrowStart.toISOString();

      return S.list()
        .id('performance-list')
        .title('공연 일정')
        .items([
          S.listItem()
            .id('performance-today')
            .title(`오늘 공연`)
            .icon(() => <PerformanceCountBadge type="today" />)
            .child(
              S.documentList()
                .id('performance-today-list')
                .title('오늘 공연')
                .schemaType('performance')
                .filter(
                  `
                  _type == "performance"
                  && date >= $todayStart
                  && date < $tomorrowStart
                `,
                )
                .params({
                  todayStart: todayStartISO,
                  tomorrowStart: tomorrowStartISO,
                })
                .defaultOrdering([
                  {
                    field: 'date',
                    direction: 'desc',
                  },
                ]),
            ),

          S.listItem()
            .id('performance-upcoming')
            .title(`다가오는 공연`)
            .icon(() => <PerformanceCountBadge type="upcoming" />)
            .child(
              S.documentList()
                .id('performance-upcoming-list')
                .title('다가오는 공연')
                .schemaType('performance')
                .filter(
                  `
                  _type == "performance"
                  && date >= $tomorrowStart
                `,
                )
                .params({
                  tomorrowStart: tomorrowStartISO,
                })
                .defaultOrdering([
                  {
                    field: 'date',
                    direction: 'desc',
                  },
                ]),
            ),

          S.listItem()
            .id('performance-past')
            .title(`이전 공연`)
            .icon(() => <PerformanceCountBadge type="past" />)
            .child(async () => {
              const cutoff = new Date();
              cutoff.setHours(0, 0, 0, 0);
              const todayStart = cutoff.toISOString();
              const performances = await client.fetch<{ date: string }[]>(
                '*[_type == "performance" && date < $todayStart]{date}',
                { todayStart },
              );
              const years = [
                ...new Set(
                  performances
                    .map(({ date }) => new Date(date).getFullYear())
                    .filter(Number.isFinite),
                ),
              ].sort((a, b) => b - a);

              return S.list()
                .id('performance-past-list')
                .title('이전 공연')
                .items(
                  years.map((year) =>
                    S.listItem()
                      .id(`performance-past-${year}`)
                      .title(`${year}년`)
                      .icon(() => <PerformanceCountBadge type="past" year={year} />)
                      .child(
                        S.documentList()
                          .id(`performance-past-${year}-list`)
                          .title(`${year}년 이전 공연`)
                          .schemaType('performance')
                          .apiVersion(API_VERSION)
                          .filter(
                            '_type == "performance" && date < $todayStart && date >= $yearStart && date < $yearEnd',
                          )
                          .params({
                            todayStart,
                            yearStart: new Date(year, 0, 1).toISOString(),
                            yearEnd: new Date(year + 1, 0, 1).toISOString(),
                          })
                          .defaultOrdering([{ field: 'date', direction: 'desc' }]),
                      ),
                  ),
                );
            }),
        ]);
    });
};
export const createPlaceMenu: MenuFactory = (S) => {
  return S.documentTypeListItem('place').title('공연 장소').icon(MarkerIcon);
};
export const createArtistMenu: MenuFactory = (S) => {
  return S.documentTypeListItem('artist').title('아티스트').icon(StarIcon);
};
export const createEquipmentMenu: MenuFactory = (S) => {
  return S.listItem()
    .id('equipment')
    .title('공연 장비')
    .icon(MicrophoneIcon)
    .child(S.document().schemaType('equipment').documentId('equipment').title('공연 장비'));
};
