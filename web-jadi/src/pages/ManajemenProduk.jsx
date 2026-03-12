import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";

const emptyForm = { 
  name: "", 
  description: "", 
  price: "", 
  stock: "", 
  availability: true, 
  category_id: "",
  image_url: "" 
};

function ManajemenProduk() {
  const navigate = useNavigate();
  const [produk, setProduk] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [previewImage, setPreviewImage] = useState("");

  const getToken = () => localStorage.getItem("token");

  // Fetch produk dengan nama kategori
  const fetchProduk = useCallback(() => {
    const token = getToken();
    if (!token) { 
      navigate("/login"); 
      return; 
    }

    setLoading(true);
    axios.get("http://localhost:5000/produk", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => { 
      setProduk(res.data); 
      setLoading(false); 
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.clear();
        navigate("/login");
      }
    });
  }, [navigate]);

  // Fetch categories untuk dropdown
  const fetchCategories = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await axios.get("http://localhost:5000/kategori", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(response.data);
    } catch (err) {
      console.error("Gagal ambil kategori:", err);
    }
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) { 
      navigate("/login"); 
      return; 
    }

    // Cek role — customer tidak boleh masuk
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.role === "customer") {
      alert("⛔ Akses Ditolak! Halaman ini hanya untuk Admin dan Kasir.");
      navigate("/dashboard");
      return;
    }

    fetchProduk();
    fetchCategories();
  }, [navigate, fetchProduk, fetchCategories]);

  const handleChange = e => {
    let val = e.target.value;
    if (e.target.name === "availability") {
      val = e.target.value === "true";
    }
    
    setForm({ ...form, [e.target.name]: val });

    // Update preview image
    if (e.target.name === "image_url") {
      setPreviewImage(val);
    }
  };

  const openTambah = () => {
    setIsEdit(false);
    setForm(emptyForm);
    setPreviewImage("");
    setShowModal(true);
  };

  const openEdit = item => {
    setIsEdit(true);
    setEditId(item.id_produk);
    setForm({
      name:         item.name,
      description:  item.description,
      price:        item.price,
      stock:        item.stock,
      availability: item.availability,
      category_id:  item.category_id || "",
      image_url:    item.image_url || ""
    });
    setPreviewImage(item.image_url || "");
    setShowModal(true);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const token = getToken();
    if (!token) { navigate("/login"); return; }

    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      if (isEdit) {
        await axios.put(
          `http://localhost:5000/produk/${editId}`, 
          form, 
          config
        );
        alert("✅ Produk berhasil diupdate!");
      } else {
        await axios.post(
          "http://localhost:5000/produk", 
          form, 
          config
        );
        alert("✅ Produk berhasil ditambah!");
      }
      setShowModal(false);
      fetchProduk();
    } catch (err) {
      alert(err.response?.data?.message || "Terjadi kesalahan.");
    }
  };

  const handleHapus = async id => {
    if (!window.confirm("Yakin ingin menghapus produk ini?")) return;

    const token = getToken();
    if (!token) { navigate("/login"); return; }

    try {
      await axios.delete(`http://localhost:5000/produk/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("✅ Produk berhasil dihapus!");
      fetchProduk();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus produk.");
    }
  };

  // Helper untuk mendapatkan nama kategori
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : "-";
  };

  return (
    <div style={{ backgroundColor: "#f4f6f9", minHeight: "100vh", paddingBottom: "80px" }}>
      <Header />

      <div style={{ padding: "30px 60px" }}>
        {/* Top Bar */}
        <div style={styles.topBar}>
          <div>
            <h2 style={styles.pageTitle}>⚙️ Manajemen Produk</h2>
            <p style={styles.subTitle}>Kelola data produk toko Anda</p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <Link to="/dashboard" style={styles.backBtn}>← Kembali</Link>
            <button onClick={openTambah} style={styles.tambahBtn}>
              + Tambah Produk
            </button>
          </div>
        </div>

        {/* Tabel Produk */}
        {loading ? (
          <p style={styles.msg}>⏳ Memuat data...</p>
        ) : produk.length === 0 ? (
          <p style={styles.msg}>😕 Belum ada produk.</p>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th style={styles.th}>No</th>
                  <th style={styles.th}>Gambar</th>
                  <th style={styles.th}>Nama Produk</th>
                  <th style={styles.th}>Deskripsi</th>
                  <th style={styles.th}>Harga</th>
                  <th style={styles.th}>Stok</th>
                  <th style={styles.th}>Tersedia</th>
                  <th style={styles.th}>Kategori</th>
                  <th style={styles.th}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {produk.map((item, idx) => (
                  <tr 
                    key={item.id_produk} 
                    style={idx % 2 === 0 ? styles.trEven : styles.trOdd}
                  >
                    <td style={styles.td}>{idx + 1}</td>
                    <td style={styles.td}>
                      {item.image_url ? (
                        <img 
                          src={item.image_url} 
                          alt={item.name}
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                            borderRadius: "4px"
                          }}
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/50?text=No+Image";
                          }}
                        />
                      ) : (
                        <span style={{ color: "#999", fontSize: "12px" }}>📷 No Image</span>
                      )}
                    </td>
                    <td style={{ ...styles.td, fontWeight: "600", color: "#2c3e50" }}>
                      {item.name}
                    </td>
                    <td style={{ ...styles.td, color: "#666", fontSize: "13px" }}>
                      {item.description || "-"}
                    </td>
                    <td style={{ ...styles.td, color: "#27ae60", fontWeight: "600" }}>
                      Rp {Number(item.price).toLocaleString("id-ID")}
                    </td>
                    <td style={styles.td}>{item.stock}</td>
                    <td style={styles.td}>
                      <span style={{ 
                        color: item.availability ? "#27ae60" : "#e74c3c", 
                        fontWeight: "600" 
                      }}>
                        {item.availability ? "✅ Ya" : "❌ Tidak"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        background: "#e3f2fd",
                        color: "#1565c0",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "600"
                      }}>
                        {item.category_name || getCategoryName(item.category_id) || "-"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button 
                          onClick={() => openEdit(item)} 
                          style={styles.editBtn}
                        >
                          ✏️ Edit
                        </button>
                        <button 
                          onClick={() => handleHapus(item.id_produk)} 
                          style={styles.deleteBtn}
                        >
                          🗑️ Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tambah / Edit */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            {/* Header Modal */}
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0 }}>
                {isEdit ? "✏️ Edit Produk" : "➕ Tambah Produk Baru"}
              </h3>
              <button 
                onClick={() => setShowModal(false)} 
                style={styles.closeBtn}
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={styles.modalForm}>
              <label style={styles.label}>Nama Produk *</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Contoh: Vas Motif Bunga"
                style={styles.input}
                required
              />

              <label style={styles.label}>Deskripsi</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Deskripsi produk..."
                style={{ ...styles.input, height: "70px", resize: "vertical" }}
              />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={styles.label}>Harga (Rp) *</label>
                  <input
                    name="price"
                    type="number"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="Contoh: 150000"
                    style={styles.input}
                    required
                  />
                </div>
                <div>
                  <label style={styles.label}>Stok</label>
                  <input
                    name="stock"
                    type="number"
                    value={form.stock}
                    onChange={handleChange}
                    placeholder="Jumlah stok"
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={styles.label}>Tersedia</label>
                  <select
                    name="availability"
                    value={form.availability}
                    onChange={handleChange}
                    style={styles.input}
                  >
                    <option value="true">Ya</option>
                    <option value="false">Tidak</option>
                  </select>
                </div>
                <div>
                  <label style={styles.label}>Kategori *</label>
                  <select
                    name="category_id"
                    value={form.category_id}
                    onChange={handleChange}
                    style={styles.input}
                    required
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <label style={styles.label}>URL Gambar</label>
              <input
                name="image_url"
                value={form.image_url}
                onChange={handleChange}
                placeholder="https://example.com/gambar.jpg"
                style={styles.input}
              />
              
              {/* Preview Gambar */}
              {previewImage && (
                <div style={{ marginTop: "8px" }}>
                  <p style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>Preview:</p>
                  <img 
                    src={previewImage} 
                    alt="Preview" 
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                      borderRadius: "4px",
                      border: "1px solid #ddd"
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              )}
              
              <small style={{ color: "#888", fontSize: "11px", marginTop: "4px", display: "block" }}>
                *Kosongkan jika tidak ada gambar
              </small>

              {/* Tombol */}
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "16px" }}>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  style={styles.cancelBtn}
                >
                  Batal
                </button>
                <button type="submit" style={styles.submitBtn}>
                  {isEdit ? "💾 Simpan Perubahan" : "➕ Tambah Produk"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

const styles = {
  topBar: { 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "flex-start", 
    marginBottom: "24px", 
    flexWrap: "wrap", 
    gap: "12px" 
  },
  pageTitle: { 
    margin: "0 0 4px 0", 
    color: "#2c3e50", 
    fontSize: "24px" 
  },
  subTitle: { 
    margin: 0, 
    color: "#666", 
    fontSize: "14px" 
  },
  backBtn: { 
    padding: "10px 18px", 
    background: "white", 
    color: "#555", 
    border: "1.5px solid #ddd", 
    borderRadius: "8px", 
    textDecoration: "none", 
    fontWeight: "600", 
    fontSize: "14px" 
  },
  tambahBtn: { 
    padding: "10px 20px", 
    background: "linear-gradient(135deg, #11998e, #38ef7d)", 
    color: "white", 
    border: "none", 
    borderRadius: "8px", 
    cursor: "pointer", 
    fontWeight: "700", 
    fontSize: "14px" 
  },
  tableWrap: { 
    background: "white", 
    borderRadius: "12px", 
    boxShadow: "0 2px 12px rgba(0,0,0,0.07)", 
    overflow: "auto" 
  },
  table: { 
    width: "100%", 
    borderCollapse: "collapse" 
  },
  thead: { 
    background: "linear-gradient(135deg, #667eea, #764ba2)" 
  },
  th: { 
    padding: "14px 16px", 
    color: "white", 
    textAlign: "left", 
    fontSize: "13px", 
    fontWeight: "600", 
    whiteSpace: "nowrap" 
  },
  trEven: { 
    background: "white" 
  },
  trOdd: { 
    background: "#fafafa" 
  },
  td: { 
    padding: "12px 16px", 
    fontSize: "14px", 
    borderBottom: "1px solid #f0f0f0" 
  },
  editBtn: { 
    padding: "6px 12px", 
    background: "#3498db", 
    color: "white", 
    border: "none", 
    borderRadius: "6px", 
    cursor: "pointer", 
    fontSize: "12px" 
  },
  deleteBtn: { 
    padding: "6px 12px", 
    background: "#e74c3c", 
    color: "white", 
    border: "none", 
    borderRadius: "6px", 
    cursor: "pointer", 
    fontSize: "12px" 
  },
  msg: { 
    textAlign: "center", 
    padding: "60px", 
    color: "#888", 
    fontSize: "16px" 
  },
  overlay: { 
    position: "fixed", 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    background: "rgba(0,0,0,0.5)", 
    display: "flex", 
    justifyContent: "center", 
    alignItems: "center", 
    zIndex: 1000, 
    padding: "20px" 
  },
  modal: { 
    background: "white", 
    borderRadius: "16px", 
    width: "100%", 
    maxWidth: "500px", 
    maxHeight: "90vh", 
    overflowY: "auto", 
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)" 
  },
  modalHeader: { 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center", 
    padding: "20px 24px", 
    borderBottom: "1px solid #eee" 
  },
  closeBtn: { 
    background: "none", 
    border: "none", 
    fontSize: "18px", 
    cursor: "pointer", 
    color: "#888" 
  },
  modalForm: { 
    padding: "24px", 
    display: "flex", 
    flexDirection: "column", 
    gap: "10px" 
  },
  label: { 
    fontSize: "13px", 
    fontWeight: "600", 
    color: "#555", 
    marginBottom: "4px", 
    display: "block" 
  },
  input: { 
    width: "100%", 
    padding: "10px 12px", 
    borderRadius: "8px", 
    border: "1.5px solid #ddd", 
    fontSize: "14px", 
    outline: "none", 
    boxSizing: "border-box" 
  },
  cancelBtn: { 
    padding: "10px 20px", 
    background: "#f5f5f5", 
    color: "#555", 
    border: "1px solid #ddd", 
    borderRadius: "8px", 
    cursor: "pointer", 
    fontWeight: "600" 
  },
  submitBtn: { 
    padding: "10px 24px", 
    background: "linear-gradient(135deg, #667eea, #764ba2)", 
    color: "white", 
    border: "none", 
    borderRadius: "8px", 
    cursor: "pointer", 
    fontWeight: "700" 
  },
};

export default ManajemenProduk;