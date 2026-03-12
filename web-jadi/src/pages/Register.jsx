import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const [form, setForm] = useState({
    fullname: "",
    username: "",
    email: "",
    password: "",
    role: "customer",   // default role
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      await axios.post("http://localhost:5000/auth/register", {
        fullname:  form.fullname,
        username:  form.username,
        email:     form.email,
        password:  form.password,
        role:      form.role,
      });
      alert("Registrasi berhasil! Silakan login.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Registrasi gagal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.bg}>
      <div style={styles.card}>
        <h2 style={styles.title}>Buat Akun Baru</h2>

        <form onSubmit={handleRegister}>

          <label style={styles.label}>Nama Lengkap</label>
          <input name="fullname" placeholder="Nama lengkap" value={form.fullname}
            onChange={handleChange} style={styles.input} required />

          <label style={styles.label}>Username</label>
          <input name="username" placeholder="Username" value={form.username}
            onChange={handleChange} style={styles.input} required />

          <label style={styles.label}>Email</label>
          <input name="email" type="email" placeholder="contoh@email.com" value={form.email}
            onChange={handleChange} style={styles.input} required />

          <label style={styles.label}>Password</label>
          <input name="password" type="password" placeholder="Password" value={form.password}
            onChange={handleChange} style={styles.input} required />


          <label style={styles.label}>Role</label>
          <select name="role" value={form.role} onChange={handleChange} style={styles.input}>
            <option value="customer">Customer</option>
            <option value="kasir">Kasir</option>
            <option value="admin">Admin</option>
          </select>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Mendaftar..." : "Daftar Sekarang"}
          </button>

        </form>

        <p style={styles.loginText}>
          Sudah punya akun?{" "}
          <Link to="/login" style={styles.link}>Masuk</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  bg: {
    minHeight: "100vh",
    background: "#f5f5f5",
    display: "flex", justifyContent: "center", alignItems: "center",
    padding: "20px",
  },
  card: {
    background: "white",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    width: "100%", maxWidth: "420px",
  },
  title: {
    textAlign: "center", marginBottom: "24px",
    fontSize: "22px", fontWeight: "700", color: "#222",
  },
  label: {
    display: "block", fontSize: "13px",
    fontWeight: "600", color: "#444", marginBottom: "5px", marginTop: "14px",
  },
  input: {
    width: "100%", padding: "12px", borderRadius: "8px",
    border: "1px solid #ddd", fontSize: "14px",
    boxSizing: "border-box", outline: "none",
  },
  button: {
    marginTop: "22px", width: "100%", padding: "13px",
    background: "#26b4c4", color: "white", border: "none",
    borderRadius: "8px", fontSize: "15px",
    fontWeight: "700", cursor: "pointer",
  },
  loginText: {
    textAlign: "center", marginTop: "18px",
    fontSize: "14px", color: "#666",
  },
  link: { color: "#39a2c8", fontWeight: "700", textDecoration: "none" },
};

export default Register;