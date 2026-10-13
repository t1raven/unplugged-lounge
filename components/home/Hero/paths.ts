// Exact geometry, paint and drawing order from unplugged-scroll-path.svg.
export const VIEWBOX = { width: 970, height: 620 } as const;
export const HERO_PATHS = [
  {
    id: 'blue-top',
    stroke: '#4AACE0',
    strokeWidth: 46,
    d: 'M42 225C102 115 248 36 372 42C502 36 607 79 670 153',
  },
  {
    id: 'orange-guitar',
    stroke: '#F57900',
    strokeWidth: 55,
    d: 'M562 372C538 408 512 433 477 418C443 405 422 374 389 385C348 399 314 457 256 461C182 469 132 433 130 351C126 282 156 216 211 187C280 150 315 220 362 239C407 258 429 204 477 205C526 206 544 244 604 241C676 239 721 212 762 159C808 96 829 51 899 39C927 34 960 34 1004 34',
  },
  {
    id: 'blue-bottom',
    stroke: '#4AACE0',
    strokeWidth: 46,
    d: 'M298 513C387 578 505 599 606 584C745 563 862 475 897 341',
  },
] as const;
