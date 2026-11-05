import { client } from '@/sanity/lib/client';

import WebsiteJsonLd from '@/components/seo/WebsiteJsonLd';
import ScrollPath from '@/components/home/ScrollPath';
import Hero from '@/components/home/Hero';
import Upcoming from '@/components/home/Upcoming';
import About from '@/components/home/About';
import Location from '@/components/home/Location';
import { getSiteSettings } from '@/lib/siteSettings';

import type { Performance } from '@/types/performance';

const upcomingQuery = `
  *[
    _type == "performance"
    && defined(date)
    && date >= $today
    && isPrivate == false
  ]
  | order(date asc)[0...12] {
    _id,
    title,
    slug,
    date,
    poster,
    artists[]->{
      _id,
      name,
      slug
    },
  }
`;

const homeQuery = `
  *[_type == "home" && _id == "home"][0]{
    hero{
      bgImage,
      label,
      title,
      location,
    },
    about{
      title,
      images[]{
        image,
        alt,
      },
      description{
        text,
        align
      },
      faq[]{
        title,
        content
      },
      caution{
        title,
        texts[]
      },
    }
  }
`;

export const revalidate = 0;

export default async function Home() {
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  const performances: Performance[] = await client.fetch(upcomingQuery, {
    today,
  });
  const home = await client.fetch(homeQuery);
  const siteInfo = await getSiteSettings();

  return (
    <>
      <WebsiteJsonLd />
      <main
        id="site-body"
        className="home home-scroll-path"
        style={{ paddingTop: 'var(--header-height)' }}
      >
        <ScrollPath>
          <Hero data={home.hero} />
          <Upcoming performances={performances} />
          <About data={home.about} />
          <Location data={siteInfo?.general ?? {}} />
        </ScrollPath>
      </main>
    </>
  );
}
