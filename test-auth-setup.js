/**
 * Creates a test user in Supabase and generates a valid session token
 * This allows testing authenticated pages without relying on magic link emails
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Load Supabase credentials
const config = JSON.parse(fs.readFileSync('/workspace/group/.supabase-oneqr/config.json', 'utf8'));

// Create admin client with service role key (bypasses RLS)
const supabase = createClient(config.project_url, config.service_role_key, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const TEST_EMAIL = 'test-auth@theqrspot.com';
const TEST_PASSWORD = 'TestAuth2026!Secure#';

async function setupTestUser() {
  console.log('🔧 Setting up test user for authenticated page testing...\n');

  try {
    // Step 1: Delete existing test user if exists
    console.log('1️⃣ Cleaning up existing test user...');
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === TEST_EMAIL);

    if (existingUser) {
      await supabase.auth.admin.deleteUser(existingUser.id);
      console.log(`   ✅ Deleted existing user: ${existingUser.id}`);
    } else {
      console.log('   ℹ️  No existing user to clean up');
    }

    // Step 2: Create new test user
    console.log('\n2️⃣ Creating new test user...');
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true, // Auto-confirm email (bypass verification)
      user_metadata: {
        test_user: true,
        created_by: 'helix-testing-script'
      }
    });

    if (createError) throw createError;
    console.log(`   ✅ Created user: ${newUser.user.id}`);
    console.log(`   📧 Email: ${TEST_EMAIL}`);

    // Step 3: Generate session token
    console.log('\n3️⃣ Generating session token...');
    const { data: session, error: sessionError } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });

    if (sessionError) throw sessionError;
    console.log(`   ✅ Session created`);
    console.log(`   🔑 Access Token: ${session.session.access_token.substring(0, 50)}...`);
    console.log(`   🔄 Refresh Token: ${session.session.refresh_token.substring(0, 50)}...`);

    // Step 4: Save credentials for Playwright
    const authState = {
      user: {
        id: newUser.user.id,
        email: TEST_EMAIL
      },
      session: {
        access_token: session.session.access_token,
        refresh_token: session.session.refresh_token,
        expires_at: session.session.expires_at
      },
      created_at: new Date().toISOString()
    };

    fs.writeFileSync(
      '/workspace/group/oneqr/test-auth-state.json',
      JSON.stringify(authState, null, 2)
    );
    console.log('\n4️⃣ Saved auth state to test-auth-state.json');

    // Step 5: Test instructions
    console.log('\n✅ Test user ready!\n');
    console.log('📋 Next steps for Playwright testing:');
    console.log('   1. Read test-auth-state.json');
    console.log('   2. Inject session tokens into browser localStorage');
    console.log('   3. Navigate to /dashboard');
    console.log('   4. Test authenticated features\n');
    console.log('🔐 Manual login credentials (if needed):');
    console.log(`   Email: ${TEST_EMAIL}`);
    console.log(`   Password: ${TEST_PASSWORD}`);

  } catch (error) {
    console.error('\n❌ Error setting up test user:', error.message);
    process.exit(1);
  }
}

setupTestUser();
