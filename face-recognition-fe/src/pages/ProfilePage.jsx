import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function ProfilePage() {
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/auth/me')
            .then(res => setProfile(res.data))
            .catch(() => setError('Không thể tải thông tin hồ sơ'));
    }, []);

    if (error) return <p style={{ color: 'red', padding: 24 }}>{error}</p>;
    if (!profile) return <p style={{ padding: 24 }}>Đang tải...</p>;

    return (
        <div style={{ maxWidth: 500, margin: '2rem auto', padding: '0 1rem' }}>
            <h2>Hồ sơ của tôi</h2>
            <div style={{ background: '#f5f5f5', borderRadius: 8, padding: 20, marginTop: 16 }}>
                <div style={rowStyle}>
                    <span style={labelStyle}>Họ tên</span>
                    <span>{profile.fullName}</span>
                </div>
                <div style={rowStyle}>
                    <span style={labelStyle}>Tên đăng nhập</span>
                    <span>{profile.username}</span>
                </div>
                <div style={rowStyle}>
                    <span style={labelStyle}>Email</span>
                    <span>{profile.email}</span>
                </div>
                <div style={rowStyle}>
                    <span style={labelStyle}>Vai trò</span>
                    <span style={{
                        background: profile.role === 'ADMIN' ? '#1976d2' : '#4caf50',
                        color: '#fff', padding: '2px 10px', borderRadius: 12, fontSize: 13
                    }}>
                        {profile.role}
                    </span>
                </div>
            </div>
        </div>
    );
}

const rowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #e0e0e0',
};

const labelStyle = {
    color: '#666',
    fontSize: 14,
};