export default function WebsiteJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://www.unplugged-lounge.com/#website',
    name: '언플러그드 라운지',
    alternateName: ['언플러그드', '언플러그드 라운지', 'UNPLUGGED', 'UNPLUGGED LOUNGE'],
    url: 'https://www.unplugged-lounge.com/',
    inLanguage: 'ko-KR',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}
