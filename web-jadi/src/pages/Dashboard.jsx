import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import Header from "../components/Header";
import Footer from "../components/Footer";

function Dashboard() {
  const navigate = useNavigate();
  const [produk, setProduk] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Ambil data user dari localStorage dengan validasi
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  const fetchProduk = useCallback(() => {
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
  }, [token, navigate]);

  useEffect(() => {
    fetchProduk();
  }, [fetchProduk]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const produkFiltered = produk.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ backgroundColor: "#f4f6f9", minHeight: "100vh", paddingBottom: "80px" }}>
      <Header />

      <div style={{ padding: "30px 60px" }}>
        {/* Top Bar */}
        <div style={styles.topBar}>
          <div>
            <h2 style={styles.pageTitle}>🏺 Katalog Produk</h2>
            <p style={styles.welcome}>
              Selamat datang, <strong>{user.fullname || user.username || "User"}</strong>!
              {" "}
              {user.role && (
                <span style={styles.roleBadge(user.role)}>
                  {user.role.toUpperCase()}
                </span>
              )}
            </p>
          </div>
          
          <div style={{ display: "flex", gap: "10px" }}>
            {/* Tombol Kelola Produk - muncul untuk admin & kasir */}
            {(user.role === "admin" || user.role === "kasir") && (
              <Link to="/produk/kelola" style={styles.manageBtn}>
                ⚙️ Kelola Produk
              </Link>
            )}
            <button onClick={handleLogout} style={styles.logoutBtn}>
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="🔍 Cari produk..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={styles.search}
        />

        {/* Grid Produk */}
        {loading ? (
          <p style={styles.msg}>⏳ Memuat produk...</p>
        ) : produkFiltered.length === 0 ? (
          <p style={styles.msg}>😕 Produk tidak ditemukan.</p>
        ) : (
          <div style={styles.grid}>
            {produkFiltered.map(p => (
              <ProductCard
                key={p.id_produk}
                title={p.name}
                description={p.description}
                price={Number(p.price).toLocaleString("id-ID")}
                stock={p.stock}
                availability={p.availability}
                category={p.category_name}
                image_url={p.image_url}
              />
            ))}
          </div>
        )}
      </div>

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
  welcome: { 
    margin: 0, 
    color: "#666", 
    fontSize: "14px", 
    display: "flex", 
    alignItems: "center", 
    gap: "8px" 
  },
  roleBadge: (role) => ({
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "uppercase",
    background: role === "admin" ? "#fdecea" : role === "kasir" ? "#e8f5e9" : "#e3f2fd",
    color:      role === "admin" ? "#c0392b" : role === "kasir" ? "#2e7d32" : "#1565c0",
  }),
  manageBtn: { 
    padding: "10px 18px", 
    background: "linear-gradient(135deg, #667eea, #764ba2)", 
    color: "white", 
    borderRadius: "8px", 
    textDecoration: "none", 
    fontWeight: "600", 
    fontSize: "14px",
    display: "inline-block",
    transition: "transform 0.2s"
  },
  logoutBtn: { 
    padding: "10px 18px", 
    background: "#e74c3c", 
    color: "white", 
    border: "none", 
    borderRadius: "8px", 
    cursor: "pointer", 
    fontWeight: "600", 
    fontSize: "14px" 
  },
  search: { 
    padding: "10px 16px", 
    borderRadius: "8px", 
    border: "1.5px solid #ddd", 
    fontSize: "14px", 
    width: "300px", 
    marginBottom: "24px", 
    outline: "none" 
  },
  grid: { 
    display: "grid", 
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
    gap: "24px" 
  },
  msg: { 
    textAlign: "center", 
    padding: "60px", 
    color: "#888", 
    fontSize: "16px" 
  },
};

export default Dashboard;