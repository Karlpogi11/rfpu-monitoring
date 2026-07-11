import 'dotenv/config';
import { getDb } from './index';
import { sites } from './schema';

const SITE_NAMES = [
  'Site A',
  'Site B',
  'Site C',
  'Site D',
  'Site E',
];

async function seed() {
  const db = await getDb();

  for (const name of SITE_NAMES) {
    try {
      await db.insert(sites).values({ name });
      console.log(`Seeded site: ${name}`);
    } catch {
      console.log(`Site already exists: ${name}`);
    }
  }

  console.log('Seed complete.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
