import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function LoginPage() {
    const [form, setForm] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/login', form);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('role', res.data.role);
            localStorage.setItem('username', res.data.username);
            localStorage.setItem('fullName', res.data.fullName);
            navigate('/scan');
        } catch {
            setError('Sai tên đăng nhập hoặc mật khẩu!');
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: '5rem auto', padding: '2rem', border: '1px solid #ddd', borderRadius: 8 }}>
            <h2 style={{ marginBottom: 24 }}>Đăng nhập</h2>
            <form onSubmit={handleSubmit}>
                <input
                    placeholder="Tên đăng nhập"
                    value={form.username}
                    onChange={e => setForm({ ...form, username: e.target.value })}
                    style={{ display: 'block', width: '100%', padding: '8px 12px', marginBottom: 12, borderRadius: 6, border: '1px solid #ccc', boxSizing: 'border-box' }}
                />
                <input
                    type="password"
                    placeholder="Mật khẩu"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    style={{ display: 'block', width: '100%', padding: '8px 12px', marginBottom: 12, borderRadius: 6, border: '1px solid #ccc', boxSizing: 'border-box' }}
                />
                {error && <p style={{ color: 'red', marginBottom: 8 }}>{error}</p>}
                <button type="submit" style={{ width: '100%', padding: '10px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 16 }}>
                    Đăng nhập
                </button>
            </form>
            <p style={{ marginTop: 16, textAlign: 'center' }}>
                Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
            </p>
        </div>
    );
}