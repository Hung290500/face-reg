import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function RegisterPage() {
    const [form, setForm] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        email: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setError('');

        if (form.password !== form.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp!');
            return;
        }

        try {
            await api.post('/auth/register', {
                username: form.username,
                password: form.password,
                fullName: form.fullName,
                email: form.email,
            });
            setSuccess('Đăng ký thành công! Đang chuyển hướng...');
            setTimeout(() => navigate('/login'), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng ký thất bại!');
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: '3rem auto', padding: '2rem', border: '1px solid #ddd', borderRadius: 8 }}>
            <h2 style={{ marginBottom: 24 }}>Đăng ký tài khoản</h2>
            <form onSubmit={handleSubmit}>
                <input
                    name="fullName"
                    placeholder="Họ và tên"
                    value={form.fullName}
                    onChange={handleChange}
                    style={inputStyle}
                />
                <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    style={inputStyle}
                />
                <input
                    name="username"
                    placeholder="Tên đăng nhập"
                    value={form.username}
                    onChange={handleChange}
                    style={inputStyle}
                />
                <input
                    name="password"
                    type="password"
                    placeholder="Mật khẩu"
                    value={form.password}
                    onChange={handleChange}
                    style={inputStyle}
                />
                <input
                    name="confirmPassword"
                    type="password"
                    placeholder="Xác nhận mật khẩu"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    style={inputStyle}
                />

                {error && (
                    <p style={{ color: '#c62828', marginBottom: 8, fontSize: 14 }}>{error}</p>
                )}
                {success && (
                    <p style={{ color: '#2e7d32', marginBottom: 8, fontSize: 14 }}>{success}</p>
                )}

                <button type="submit" style={btnStyle}>
                    Đăng ký
                </button>
            </form>
            <p style={{ marginTop: 16, textAlign: 'center', fontSize: 14 }}>
                Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
            </p>
        </div>
    );
}

const inputStyle = {
    display: 'block',
    width: '100%',
    padding: '8px 12px',
    marginBottom: 12,
    borderRadius: 6,
    border: '1px solid #ccc',
    boxSizing: 'border-box',
    fontSize: 14,
};

const btnStyle = {
    width: '100%',
    padding: '10px',
    background: '#1976d2',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 16,
};