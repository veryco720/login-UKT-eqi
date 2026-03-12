import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [username, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post("http://localhost:5000/auth/login", {
        username,
        password
      });

      // Simpan token dan data user
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      
      alert("✅ Login berhasil!");
      navigate("/dashboard");
    } catch (error) {
      alert("❌ Login gagal: Username atau password salah");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Selamat Datang</h2>
        <p style={styles.subtitle}>Silakan login untuk melanjutkan</p>
        
        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="text"
            placeholder="Username atau Email"
            value={username}
            onChange={(e) => setUser(e.target.value)}
            style={styles.input}
            required
          />
          
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          
          <button 
            type="submit" 
            style={styles.button}
            disabled={loading}
          >
            {loading ? "⏳ Loading..." : "🔐 Login"}
          </button>
        </form>
        
        <p style={{ textAlign: "center", marginTop: "18px", fontSize: "14px", color: "#666" }}>
          Belum punya akun?{" "}
          <Link to="/register" style={{ color: "#23e4f1", fontWeight: "700", textDecoration: "none" }}>
            Daftar
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh', 
    backgroundColor: '#f4f7f6' 
  },
  card: { 
    backgroundColor: '#fff', 
    padding: '40px', 
    borderRadius: '12px', 
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)', 
    width: '350px', 
    textAlign: 'center' 
  },
  title: { 
    marginBottom: '10px', 
    color: '#333',
    fontSize: '24px',
    fontWeight: '700'
  },
  subtitle: { 
    fontSize: '14px', 
    color: '#777', 
    marginBottom: '25px' 
  },
  form: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '15px' 
  },
  input: { 
    padding: '12px', 
    borderRadius: '6px', 
    border: '1px solid #ddd', 
    fontSize: '16px',
    outline: 'none',
    transition: 'border 0.3s'
  },
  button: { 
    padding: '12px', 
    borderRadius: '6px', 
    border: 'none', 
    backgroundColor: '#3498db', 
    color: 'white', 
    fontSize: '16px', 
    cursor: 'pointer', 
    fontWeight: 'bold',
    transition: 'background 0.3s'
  }
};

export default Login;