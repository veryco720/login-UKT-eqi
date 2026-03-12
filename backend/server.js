const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const pool = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ── MIDDLEWARE VERIFY TOKEN ───────────────────────────────
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Token tidak ditemukan. Silakan login." });
    }

    jwt.verify(token, process.env.JWT_SECRET || "SECRET_KEY", (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Token tidak valid atau sudah kadaluarsa." });
        }
        req.user = user;
        next();
    });
};

// ── MIDDLEWARE CEK ROLE ───────────────────────────────────
const allowRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: "⛔ Akses ditolak! Anda tidak memiliki izin." 
            });
        }
        next();
    };
};

// ── REGISTER ─────────────────────────────────────────────
app.post("/auth/register", async (req, res) => {
    const { fullname, username, email, password, role } = req.body;

    if (!fullname || !username || !email || !password || !role) {
        return res.status(400).json({ message: "Semua field wajib diisi." });
    }

    try {
        const cek = await pool.query(
            "SELECT id_user FROM users WHERE username = $1 OR email = $2",
            [username, email]
        );
        if (cek.rows.length > 0) {
            return res.status(409).json({ message: "Username atau email sudah digunakan." });
        }

        const result = await pool.query(
            `INSERT INTO users (fullname, username, email, password, role, active) 
             VALUES ($1, $2, $3, $4, $5, true) 
             RETURNING id_user, fullname, username, email, role`,
            [fullname, username, email, password, role]
        );

        res.status(201).json({
            message: "Registrasi berhasil!",
            user: result.rows[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan server." });
    }
});

// ── LOGIN ─────────────────────────────────────────────────
app.post("/auth/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await pool.query(
            `SELECT * FROM users 
             WHERE (LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($1)) 
             AND TRIM(password) = TRIM($2) 
             AND active = true`,
            [username.trim(), password.trim()]
        );

        if (user.rows.length === 0) {
            return res.status(401).json({ message: "Username/email atau password salah." });
        }

        const token = jwt.sign(
            { 
                id:       user.rows[0].id_user, 
                username: user.rows[0].username, 
                role:     user.rows[0].role 
            },
            process.env.JWT_SECRET || "SECRET_KEY",
            { expiresIn: "1h" }
        );

        res.json({
            message: "Login berhasil!",
            token,
            user: {
                id:       user.rows[0].id_user,
                fullname: user.rows[0].fullname,
                username: user.rows[0].username,
                email:    user.rows[0].email,
                role:     user.rows[0].role
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan server." });
    }
});

// ── GET SEMUA KATEGORI ────────────────────────────────────
app.get("/kategori", verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM categories ORDER BY id ASC"
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Gagal mengambil data kategori." });
    }
});

// ── GET SEMUA PRODUK DENGAN NAMA KATEGORI ─────────────────
app.get("/produk", verifyToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                p.*,
                c.name as category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            ORDER BY p.id_produk ASC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Gagal mengambil data produk." });
    }
});

// ── TAMBAH PRODUK (admin & kasir) ─────────────────────────
app.post("/produk", verifyToken, allowRoles("admin", "kasir"), async (req, res) => {
    const { name, description, price, stock, availability, category_id, image_url } = req.body;

    if (!name || !price) {
        return res.status(400).json({ message: "Nama dan harga wajib diisi." });
    }

    try {
        const result = await pool.query(
            `INSERT INTO products (name, description, price, stock, availability, category_id, image_url) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) 
             RETURNING *`,
            [name, description, price, stock || 0, availability ?? true, category_id, image_url || null]
        );

        const produkWithCategory = await pool.query(`
            SELECT 
                p.*,
                c.name as category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id_produk = $1
        `, [result.rows[0].id_produk]);

        res.status(201).json({ 
            message: "Produk berhasil ditambahkan!", 
            produk: produkWithCategory.rows[0] 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Gagal menambahkan produk." });
    }
});

// ── EDIT PRODUK (admin & kasir) ───────────────────────────
app.put("/produk/:id", verifyToken, allowRoles("admin", "kasir"), async (req, res) => {
    const { id } = req.params;
    const { name, description, price, stock, availability, category_id, image_url } = req.body;

    if (!name || !price) {
        return res.status(400).json({ message: "Nama dan harga wajib diisi." });
    }

    try {
        const result = await pool.query(
            `UPDATE products 
             SET name=$1, description=$2, price=$3, stock=$4, availability=$5, category_id=$6, image_url=$7
             WHERE id_produk=$8 
             RETURNING *`,
            [name, description, price, stock, availability, category_id, image_url, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Produk tidak ditemukan." });
        }

        const produkWithCategory = await pool.query(`
            SELECT 
                p.*,
                c.name as category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id_produk = $1
        `, [id]);

        res.json({ 
            message: "Produk berhasil diupdate!", 
            produk: produkWithCategory.rows[0] 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Gagal mengupdate produk." });
    }
});

// ── HAPUS PRODUK (admin & kasir) ──────────────────────────
app.delete("/produk/:id", verifyToken, allowRoles("admin", "kasir"), async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            "DELETE FROM products WHERE id_produk = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Produk tidak ditemukan." });
        }

        res.json({ message: "Produk berhasil dihapus!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Gagal menghapus produk." });
    }
});

// ── START SERVER ──────────────────────────────────────────
app.listen(5000, () => {
    console.log("Server berjalan di http://localhost:5000");
});