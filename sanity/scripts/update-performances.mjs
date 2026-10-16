import { createClient } from '@sanity/client';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_WRITE_TOKEN,
  apiVersion: '2025-02-19',
  useCdn: false,
});

async function addField() {
  const performances = await client.fetch(
    `*[
      _type == "performance" &&
      !defined(isPrivate) &&
      !(_id in path("drafts.**"))
    ]{
      _id
    }`,
  );

  console.log(`수정 대상: ${performances.length}개`);

  for (let i = 0; i < performances.length; i += 100) {
    const batch = performances.slice(i, i + 100);
    const transaction = client.transaction();

    batch.forEach(({ _id }) => {
      transaction.patch(_id, {
        setIfMissing: {
          isPrivate: false,
        },
      });
    });

    await transaction.commit();
    console.log(`${Math.min(i + 100, performances.length)}개 완료`);
  }

  console.log('전체 공연 수정 완료');
}

async function removeField() {
  const performances = await client.fetch(`
    *[_type == "performance" && defined(isPublished)]{
      _id
    }
  `);

  console.log(`수정 대상: ${performances.length}개`);

  for (let i = 0; i < performances.length; i += 100) {
    const batch = performances.slice(i, i + 100);
    const transaction = client.transaction();

    batch.forEach(({ _id }) => {
      transaction.patch(_id, {
        unset: ['isPublished'],
      });
    });

    await transaction.commit();
    console.log(`${Math.min(i + 100, performances.length)}개 완료`);
  }

  console.log('isPublished 필드 전체 제거 완료');
}

addField().catch(console.error);
