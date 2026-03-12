const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DB_CONN,
    ssl: { rejectUnauthorized: false }
});

pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Gagal konek ke database:', err.message);
    } else {
        console.log('✅ Database terhubung ke Supabase!');
        release();
    }
});

module.exports = pool;