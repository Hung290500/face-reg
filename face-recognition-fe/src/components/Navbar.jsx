import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
    const navigate = useNavigate();
    const role = localStorage.getItem('role');
    const fullName = localStorage.getItem('fullName');

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        localStorage.removeItem('fullName');
        navigate('/login');
    };

    return (
        <nav style={{ background: '#1976d2', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 24 }}>
            <span style={{ color: '#fff', fontWeight: 600, fontSize: 18 }}>FaceApp</span>
            <Link to="/scan" style={linkStyle}>Quét mặt</Link>
            <Link to="/profile" style={linkStyle}>Hồ sơ</Link>
            {role === 'ADMIN' && (
                <Link to="/dashboard" style={{ ...linkStyle, background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: 6 }}>
                    Dashboard
                </Link>
            )}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ color: '#fff', fontSize: 14 }}>{fullName}</span>
                <button onClick={logout} style={{ background: 'transparent', border: '1px solid #fff', color: '#fff', padding: '6px 16px', borderRadius: 6, cursor: 'pointer' }}>
                    Đăng xuất
                </button>
            </div>
        </nav>
    );
}

const linkStyle = {
    color: '#fff',
    textDecoration: 'none',
    fontSize: 15,
};