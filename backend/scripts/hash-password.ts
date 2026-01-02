// ============================================
// HASH PASSWORD UTILITY
// Generate password hash for Silvana
// ============================================

import { hashPassword } from '../src/utils/auth';

async function main() {
  const password = 'Panqueque';
  const hash = await hashPassword(password);

  console.log('\n=================================');
  console.log('Password Hash Generated:');
  console.log('=================================');
  console.log(`Password: ${password}`);
  console.log(`Hash: ${hash}`);
  console.log('\nReplace HASH_PLACEHOLDER in schema.sql with this hash');
  console.log('=================================\n');
}

main().catch(console.error);
