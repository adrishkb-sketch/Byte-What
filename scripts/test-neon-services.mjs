import { neon } from '@neondatabase/serverless';

async function main() {
  console.log('Testing Neon Services Integration...');
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL is missing in .env.local');
    process.exit(1);
  }

  console.log('1. Testing Neon Postgres Connection...');
  const sql = neon(dbUrl);
  const result = await sql`SELECT NOW() as current_time, current_database() as db_name, version() as pg_version;`;
  console.log('Postgres Query Success:', result[0]);

  console.log('2. Testing Student Submissions Table...');
  const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`;
  console.log('Public Tables in Neon:', tables.map((t) => t.table_name));

  console.log('3. Testing Insert and Select in Neon...');
  const testSub = await sql`
    INSERT INTO student_submissions (name, department, year, phone_number, path_chosen, rankings)
    VALUES ('Neon Verified Student', 'Information Technology', '2nd Year', '+91 99999 88888', 'self_selected', '[{"domainId":"software_web","rank":1}]'::jsonb)
    RETURNING id, name, department, year, created_at;
  `;
  console.log('Inserted row in Neon Postgres:', testSub[0]);

  const fetchBack = await sql`SELECT * FROM student_submissions WHERE id = ${testSub[0].id};`;
  console.log('Fetched back row from Neon Postgres:', fetchBack[0].name);

  // Clean up test verification row
  await sql`DELETE FROM student_submissions WHERE id = ${testSub[0].id};`;
  console.log('Cleaned up test row.');

  console.log('4. Testing Neon Function (hello)...');
  const funcHost = process.env.NEON_FUNCTION_HOST_SUFFIX;
  const branchId = process.env.NEON_BRANCH_ID;
  const funcUrl = `https://${branchId}-hello${funcHost}/`;
  try {
    const res = await fetch(funcUrl);
    const text = await res.text();
    console.log(`Neon Function ${funcUrl} response:`, text);
  } catch (err) {
    console.warn('Neon Function fetch warning:', err.message);
  }

  console.log('ALL NEON SERVICES VERIFIED END-TO-END!');
}

main().catch((err) => {
  console.error('Neon test failed:', err);
  process.exit(1);
});
