
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';


// Load .env from project root
require('dotenv').config({ path: path.resolve('c:/Users/admin/FlashSwtich/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('Testing connection to:', supabaseUrl);

    // Try to select from the table
    const { data, error } = await supabase
        .from('sepay_transactions')
        .select('count(*)', { count: 'exact', head: true });

    if (error) {
        if (error.code === '42P01') { // undefined_table
            console.error('❌ Table "sepay_transactions" DOES NOT EXIST.');
            console.log('👉 Please go to Supabase SQL Editor and run the schema script.');
        } else {
            console.error('❌ Connection failed:', error.message);
        }
    } else {
        console.log('✅ Connection SUCCESS!');
        console.log('✅ Table "sepay_transactions" exists.');

        // Fetch last 5 transactions
        const { data: recent } = await supabase
            .from('sepay_transactions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);

        if (recent && recent.length > 0) {
            console.log('📊 Recent transactions:', recent);
        } else {
            console.log('ℹ️ Table is empty (No transactions yet).');
        }
    }
}

check();
