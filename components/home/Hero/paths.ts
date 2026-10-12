// Exact geometry, paint and drawing order from unplugged-scroll-path.svg.
export const VIEWBOX = { width: 2048, height: 724 } as const;
export const HERO_PATHS = [
  {
    id: 'blue-top',
    stroke: '#4AACE0',
    strokeWidth: 46,
    d: 'M1120 218 C1180 108 1326 29 1450 35 C1580 29 1685 72 1748 146',
  },
  {
    id: 'orange-guitar',
    stroke: '#F57900',
    strokeWidth: 55,
    d: 'M1640 365 C1616 401 1590 426 1555 411 C1521 398 1500 367 1467 378 C1426 392 1392 450 1334 454 C1260 462 1210 426 1208 344 C1204 275 1234 209 1289 180 C1358 143 1393 213 1440 232 C1485 251 1507 197 1555 198 C1604 199 1622 237 1682 234 C1754 232 1799 205 1840 152 C1886 89 1907 44 1977 32 C2005 27 2038 27 2082 27',
  },
  {
    id: 'blue-bottom',
    stroke: '#4AACE0',
    strokeWidth: 46,
    d: 'M1376 506 C1465 571 1583 592 1684 577 C1823 556 1940 468 1975 334',
  },
  {
    id: 'orange-wave',
    stroke: '#F57900',
    strokeWidth: 62,
    d: 'M-38 369 C62 390 133 540 233 602 C341 665 509 632 669 557 C814 490 929 400 1035 435 C1194 480 1323 605 1502 653 C1704 711 1870 584 2085 588',
  },
] as const;

export function exitOrangeWave(): string {
  // Keep the artwork and join tangent, while sending the left end off canvas.
  return HERO_PATHS[3].d.replace('M-38 369 C62 390', 'M-240 520 C-120 540');
}
