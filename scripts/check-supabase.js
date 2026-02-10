
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('Testing connection to:', supabaseUrl);

    // 1. Check direct connection
    const { data: count, error: countError } = await supabase
        .from('sepay_transactions')
        .select('count', { count: 'exact', head: true });

    if (countError) {
        console.error('❌ Connection/Query Failed:', countError.message);
        return;
    }

    console.log('✅ Connection Successful!');

    // 2. Get recent transactions
    const { data: recent, error: recentError } = await supabase
        .from('sepay_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    if (recentError) {
        console.error('❌ Failed to fetch transactions:', recentError.message);
    } else {
        if (recent.length === 0) {
            console.log('ℹ️ Table "sepay_transactions" is empty.');
            console.log('👉 This means SePay Webhook -> Vercel -> Supabase path is NOT working yet.');
        } else {
            console.log(`📊 Found ${recent.length} recent transactions:`);
            recent.forEach(tx => {
                console.log(`   - [${tx.created_at}] Code: ${tx.code} | Amount: ${tx.amount_in}`);
            });
            console.log('👉 If transactions exist here but App doesn\'t show, check:');
            console.log('   1. App using correct credentials?');
            console.log('   2. Realtime subscription active?');
        }
    }
}

check();
