function ProductCard({ 
  title, 
  description, 
  price, 
  stock, 
  availability, 
  category,
  image_url 
}) {
  // Gambar default jika tidak ada gambar
  const defaultImage = "https://via.placeholder.com/300x200?text=Gerabah+Eqi";
  
  return (
    <div style={styles.card}>
      {/* Gambar Produk */}
      <div style={styles.imageContainer}>
        <img 
          src={image_url || defaultImage} 
          alt={title}
          style={styles.image}
          onError={(e) => {
            e.target.src = defaultImage;
          }}
        />
        
        {/* Badge Kategori di atas gambar */}
        {category && (
          <span style={styles.categoryBadge}>
            📁 {category}
          </span>
        )}
      </div>

      {/* Konten */}
      <div style={styles.content}>
        <h3 style={styles.title}>{title}</h3>
        <p style={styles.desc}>{description}</p>
        <p style={styles.price}>Rp {price}</p>

        {/* Info Stok */}
        <div style={styles.stockInfo}>
          <span style={{ 
            ...styles.stockBadge,
            color: stock <= 5 ? "#e74c3c" : "#27ae60",
            background: stock <= 5 ? "#fdeaea" : "#e8f5e9"
          }}>
            {stock <= 5 ? `⚠️ Stok: ${stock}` : `✅ Stok: ${stock}`}
          </span>
        </div>

        {/* Ketersediaan */}
        <span style={{ 
          ...styles.availability,
          color: availability ? "#27ae60" : "#e74c3c"
        }}>
          {availability ? "● Tersedia" : "● Tidak Tersedia"}
        </span>

        {/* Tombol Beli */}
        <button 
          style={styles.btn}
          onMouseEnter={(e) => {
            e.target.style.opacity = "0.9";
            e.target.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.target.style.opacity = "1";
            e.target.style.transform = "translateY(0)";
          }}
        >
          🛒 Beli Sekarang
        </button>
      </div>
    </div>
  );
}

const styles = {
  card: { 
    background: "white", 
    borderRadius: "12px", 
    boxShadow: "0 2px 12px rgba(0,0,0,0.07)", 
    border: "1px solid #f0f0f0", 
    transition: "transform 0.2s, box-shadow 0.2s",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    cursor: "pointer",
    ':hover': {
      transform: "translateY(-4px)",
      boxShadow: "0 4px 20px rgba(0,0,0,0.12)"
    }
  },
  imageContainer: {
    width: "100%",
    height: "200px",
    overflow: "hidden",
    background: "#f8f9fa",
    position: "relative"
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.3s",
    ':hover': {
      transform: "scale(1.05)"
    }
  },
  categoryBadge: {
    position: "absolute",
    top: "10px",
    left: "10px",
    fontSize: "11px",
    fontWeight: "600",
    color: "#667eea",
    background: "rgba(255,255,255,0.9)",
    padding: "4px 8px",
    borderRadius: "4px",
    backdropFilter: "blur(4px)",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
  },
  content: {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    flex: 1
  },
  title: { 
    margin: 0, 
    color: "#2c3e50", 
    fontSize: "18px", 
    fontWeight: "700" 
  },
  desc: { 
    color: "#777", 
    fontSize: "13px", 
    lineHeight: "1.5", 
    flexGrow: 1,
    margin: "4px 0"
  },
  price: { 
    fontWeight: "700", 
    color: "#27ae60", 
    fontSize: "22px", 
    margin: "4px 0" 
  },
  stockInfo: {
    margin: "4px 0"
  },
  stockBadge: {
    fontSize: "12px",
    fontWeight: "600",
    padding: "4px 8px",
    borderRadius: "4px",
    display: "inline-block"
  },
  availability: {
    fontSize: "12px",
    fontWeight: "600",
    marginBottom: "8px"
  },
  btn: { 
    marginTop: "10px", 
    width: "100%", 
    padding: "12px", 
    border: "none",
    background: "linear-gradient(135deg, #667eea, #764ba2)", 
    color: "white",
    borderRadius: "8px", 
    cursor: "pointer", 
    fontWeight: "700", 
    fontSize: "14px", 
    transition: "all 0.2s"
  },
};

export default ProductCard;