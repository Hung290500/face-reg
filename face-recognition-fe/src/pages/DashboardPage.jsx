import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const SUBJECTS_PER_PAGE = 8;
const USERS_PER_PAGE = 8;

const validateSubject = (form) => {
    if (!form.fullName?.trim()) return 'Họ tên không được để trống!';
    if (form.phone && !/^0[0-9]{9}$/.test(form.phone)) return 'SĐT không hợp lệ (10 số, bắt đầu bằng 0)!';
    if (form.email && !/^[\w.]+@[\w.]+\.[a-z]{2,}$/.test(form.email)) return 'Email không hợp lệ!';
    return null;
};

function Modal({ title, onClose, children }) {
    return (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div style={{ background:'#fff', borderRadius:12, padding:28, width:520, maxWidth:'95vw', boxShadow:'0 8px 32px rgba(0,0,0,0.18)', maxHeight:'90vh', overflowY:'auto' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
                    <h3 style={{ margin:0, fontSize:18 }}>{title}</h3>
                    <button onClick={onClose} style={{ background:'none', border:'none', fontSize:22, cursor:'pointer', color:'#999' }}>×</button>
                </div>
                {children}
            </div>
        </div>
    );
}

function SubjectForm({ data, onChange, error, onSubmit, onCancel, submitLabel }) {
    const fields = [
        { key:'fullName',    label:'Họ tên *',       type:'text'  },
        { key:'dateOfBirth', label:'Ngày sinh',       type:'date'  },
        { key:'phone',       label:'Số điện thoại',   type:'text'  },
        { key:'email',       label:'Email',           type:'email' },
        { key:'address',     label:'Địa chỉ',         type:'text'  },
        { key:'notes',       label:'Ghi chú',         type:'text'  },
    ];
    return (
        <div>
            {error && <div style={{ background:'#ffebee', color:'#c62828', padding:'8px 12px', borderRadius:6, marginBottom:12, fontSize:13 }}>{error}</div>}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                {fields.map(f => (
                    <input key={f.key} type={f.type} placeholder={f.label}
                        value={data[f.key] || ''}
                        onChange={e => onChange({ ...data, [f.key]: e.target.value })}
                        style={inputStyle} />
                ))}
            </div>
            <div style={{ display:'flex', gap:8, marginTop:16, justifyContent:'flex-end' }}>
                <button onClick={onCancel} style={{ ...btn, background:'#eee', color:'#333' }}>Hủy</button>
                <button onClick={onSubmit} style={{ ...btn, background:'#1976d2', color:'#fff' }}>{submitLabel}</button>
            </div>
        </div>
    );
}

function Pagination({ current, total, onChange }) {
    if (total <= 1) return null;
    return (
        <div style={{ display:'flex', gap:4, justifyContent:'center', marginTop:16, alignItems:'center' }}>
            <button onClick={() => onChange(current - 1)} disabled={current === 1}
                style={{ ...btnSm, background: current === 1 ? '#eee':'#1976d2', color: current === 1 ? '#aaa':'#fff' }}>‹</button>
            {Array.from({ length: total }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => onChange(p)}
                    style={{ ...btnSm, background: p === current ? '#1976d2':'#eee', color: p === current ? '#fff':'#333', minWidth:32 }}>
                    {p}
                </button>
            ))}
            <button onClick={() => onChange(current + 1)} disabled={current === total}
                style={{ ...btnSm, background: current === total ? '#eee':'#1976d2', color: current === total ? '#aaa':'#fff' }}>›</button>
        </div>
    );
}

export default function DashboardPage() {
    const navigate = useNavigate();
    const role = localStorage.getItem('role');

    const [subjects, setSubjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [activeTab, setActiveTab] = useState('subjects');
    const [loading, setLoading] = useState(false);

    const [subjectSearch, setSubjectSearch] = useState('');
    const [subjectPage, setSubjectPage] = useState(1);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [addForm, setAddForm] = useState({ fullName:'', dateOfBirth:'', phone:'', email:'', address:'', notes:'' });
    const [editForm, setEditForm] = useState({});
    const [editingId, setEditingId] = useState(null);
    const [formError, setFormError] = useState('');

    const [userSearch, setUserSearch] = useState('');
    const [userPage, setUserPage] = useState(1);

    const fetchSubjects = useCallback(async () => {
        setLoading(true);
        try { const res = await api.get('/subjects'); setSubjects(res.data); }
        catch (e) { console.error(e); }
        setLoading(false);
    }, []);

    const fetchUsers = useCallback(async () => {
        try { const res = await api.get('/users'); setUsers(res.data); }
        catch (e) { console.error(e); }
    }, []);

    useEffect(() => {
        if (role !== 'ADMIN') { navigate('/scan'); return; }
        fetchSubjects();
        fetchUsers();
    }, [role, navigate, fetchSubjects, fetchUsers]);

    const handleAddSubject = async () => {
        const err = validateSubject(addForm);
        if (err) { setFormError(err); return; }
        try {
            await api.post('/subjects', addForm);
            setAddForm({ fullName:'', dateOfBirth:'', phone:'', email:'', address:'', notes:'' });
            setShowAddModal(false);
            setFormError('');
            fetchSubjects();
        } catch (e) { setFormError(e.response?.data?.message || 'Lỗi không xác định'); }
    };

    const openEdit = (s) => {
        setEditingId(s.id);
        setEditForm({ fullName:s.fullName||'', dateOfBirth:s.dateOfBirth||'', phone:s.phone||'', email:s.email||'', address:s.address||'', notes:s.notes||'' });
        setFormError('');
        setShowEditModal(true);
    };

    const handleUpdateSubject = async () => {
        const err = validateSubject(editForm);
        if (err) { setFormError(err); return; }
        try {
            await api.put(`/subjects/${editingId}`, editForm);
            setShowEditModal(false);
            setFormError('');
            fetchSubjects();
        } catch (e) { setFormError(e.response?.data?.message || 'Lỗi không xác định'); }
    };

    const handleDeleteSubject = async (id) => {
        if (!window.confirm('Xóa đối tượng này? Không thể hoàn tác!')) return;
        try { await api.delete(`/subjects/${id}`); fetchSubjects(); }
        catch { alert('Xóa thất bại!'); }
    };

    const handleToggleLock = async (u) => {
        const action = u.isLocked ? 'unlock' : 'lock';
        if (!window.confirm(`${u.isLocked ? 'Mở khóa' : 'Khóa'} tài khoản "${u.username}"?`)) return;
        try { await api.put(`/users/${u.id}/${action}`); fetchUsers(); }
        catch (e) { alert('Lỗi: ' + e.response?.data?.message); }
    };

    const handleDeleteUser = async (u) => {
        if (!window.confirm(`Xóa tài khoản "${u.username}"? Không thể hoàn tác!`)) return;
        try { await api.delete(`/users/${u.id}`); fetchUsers(); }
        catch (e) { alert('Xóa thất bại: ' + e.response?.data?.message); }
    };

    const filteredSubjects = subjects.filter(s =>
        s.fullName?.toLowerCase().includes(subjectSearch.toLowerCase()) ||
        s.phone?.includes(subjectSearch) ||
        s.email?.toLowerCase().includes(subjectSearch.toLowerCase())
    );
    const totalSubjectPages = Math.ceil(filteredSubjects.length / SUBJECTS_PER_PAGE);
    const pagedSubjects = filteredSubjects.slice((subjectPage - 1) * SUBJECTS_PER_PAGE, subjectPage * SUBJECTS_PER_PAGE);

    const filteredUsers = users.filter(u =>
        u.username?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.fullName?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email?.toLowerCase().includes(userSearch.toLowerCase())
    );
    const totalUserPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
    const pagedUsers = filteredUsers.slice((userPage - 1) * USERS_PER_PAGE, userPage * USERS_PER_PAGE);

    return (
        <div style={{ maxWidth:1100, margin:'2rem auto', padding:'0 1rem' }}>
            <div style={{ marginBottom:24 }}>
                <h2 style={{ margin:'0 0 4px', fontSize:24 }}>Dashboard quản trị</h2>
                <p style={{ margin:0, color:'#777', fontSize:14 }}>Quản lý toàn bộ dữ liệu hệ thống nhận diện khuôn mặt</p>
            </div>

            <div style={{ display:'flex', gap:4, marginBottom:24, borderBottom:'2px solid #eee' }}>
                {[
                    { key:'subjects', label:`👤 Đối tượng (${subjects.length})` },
                    { key:'users',    label:`🔐 Người dùng (${users.length})`   },
                ].map(t => (
                    <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
                        padding:'10px 20px', border:'none', borderRadius:'8px 8px 0 0',
                        cursor:'pointer', fontSize:14, fontWeight:500, marginBottom:-2,
                        background: activeTab === t.key ? '#1976d2' : '#f5f5f5',
                        color:      activeTab === t.key ? '#fff'    : '#555',
                        borderBottom: activeTab === t.key ? '2px solid #1976d2' : 'none',
                    }}>{t.label}</button>
                ))}
            </div>

            {activeTab === 'subjects' && (
                <div>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, gap:12, flexWrap:'wrap' }}>
                        <input placeholder="🔍 Tìm theo tên, SĐT, email..."
                            value={subjectSearch}
                            onChange={e => { setSubjectSearch(e.target.value); setSubjectPage(1); }}
                            style={{ ...inputStyle, width:300, margin:0 }} />
                        <button onClick={() => { setShowAddModal(true); setFormError(''); }}
                            style={{ ...btn, background:'#4caf50', color:'#fff' }}>+ Thêm đối tượng</button>
                    </div>

                    {loading ? <p style={{ textAlign:'center', color:'#999', padding:40 }}>Đang tải...</p> : (
                        <>
                            <div style={{ overflowX:'auto', borderRadius:10, boxShadow:'0 1px 6px rgba(0,0,0,0.09)' }}>
                                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
                                    <thead>
                                        <tr style={{ background:'#1976d2', color:'#fff' }}>
                                            {['ID','Họ tên','Ngày sinh','SĐT','Email','Địa chỉ','Trạng thái','Thao tác'].map(h => (
                                                <th key={h} style={th}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pagedSubjects.map((s, i) => (
                                            <tr key={s.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                                                <td style={td}><span style={{ color:'#aaa', fontSize:12 }}>#{s.id}</span></td>
                                                <td style={{ ...td, fontWeight:500 }}>{s.fullName}</td>
                                                <td style={td}>{s.dateOfBirth || '—'}</td>
                                                <td style={td}>{s.phone    || '—'}</td>
                                                <td style={td}>{s.email    || '—'}</td>
                                                <td style={td}>{s.address  || '—'}</td>
                                                <td style={td}>
                                                    <span style={{ background: s.isTrained ? '#e8f5e9':'#fff3e0', color: s.isTrained ? '#2e7d32':'#e65100', padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:500 }}>
                                                        {s.isTrained ? '✅ Đã train' : '⏳ Chưa train'}
                                                    </span>
                                                </td>
                                                <td style={td}>
                                                    <div style={{ display:'flex', gap:6 }}>
                                                        <button onClick={() => openEdit(s)} style={{ ...btnSm, background:'#1976d2', color:'#fff' }}>✏️ Sửa</button>
                                                        <button onClick={() => handleDeleteSubject(s.id)} style={{ ...btnSm, background:'#f44336', color:'#fff' }}>🗑️ Xóa</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {pagedSubjects.length === 0 && (
                                            <tr><td colSpan={8} style={{ textAlign:'center', padding:32, color:'#bbb' }}>
                                                {subjectSearch ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có đối tượng nào'}
                                            </td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <Pagination current={subjectPage} total={totalSubjectPages} onChange={setSubjectPage} />
                        </>
                    )}
                </div>
            )}

            {activeTab === 'users' && (
                <div>
                    <div style={{ marginBottom:16 }}>
                        <input placeholder="🔍 Tìm theo username, tên, email..."
                            value={userSearch}
                            onChange={e => { setUserSearch(e.target.value); setUserPage(1); }}
                            style={{ ...inputStyle, width:300, margin:0 }} />
                    </div>

                    <div style={{ overflowX:'auto', borderRadius:10, boxShadow:'0 1px 6px rgba(0,0,0,0.09)' }}>
                        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
                            <thead>
                                <tr style={{ background:'#1976d2', color:'#fff' }}>
                                    {['ID','Username','Họ tên','Email','Vai trò','Trạng thái','Thao tác'].map(h => (
                                        <th key={h} style={th}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {pagedUsers.map((u, i) => (
                                    <tr key={u.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                                        <td style={td}><span style={{ color:'#aaa', fontSize:12 }}>#{u.id}</span></td>
                                        <td style={{ ...td, fontWeight:500 }}>{u.username}</td>
                                        <td style={td}>{u.fullName || '—'}</td>
                                        <td style={td}>{u.email    || '—'}</td>
                                        <td style={td}>
                                            <span style={{ background: u.role === 'ADMIN' ? '#e3f2fd':'#e8f5e9', color: u.role === 'ADMIN' ? '#1565c0':'#2e7d32', padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:500 }}>
                                                {u.role === 'ADMIN' ? '👑 ADMIN' : '👤 USER'}
                                            </span>
                                        </td>
                                        <td style={td}>
                                            <span style={{ background: u.isLocked ? '#ffebee':'#e8f5e9', color: u.isLocked ? '#c62828':'#2e7d32', padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:500 }}>
                                                {u.isLocked ? '🔒 Đã khóa' : '✅ Hoạt động'}
                                            </span>
                                        </td>
                                        <td style={td}>
                                            {u.role !== 'ADMIN' ? (
                                                <div style={{ display:'flex', gap:6 }}>
                                                    <button onClick={() => handleToggleLock(u)}
                                                        style={{ ...btnSm, background: u.isLocked ? '#4caf50':'#ff9800', color:'#fff' }}>
                                                        {u.isLocked ? '🔓 Mở khóa' : '🔒 Khóa'}
                                                    </button>
                                                    <button onClick={() => handleDeleteUser(u)} style={{ ...btnSm, background:'#f44336', color:'#fff' }}>🗑️ Xóa</button>
                                                </div>
                                            ) : (
                                                <span style={{ color:'#bbb', fontSize:12 }}>—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {pagedUsers.length === 0 && (
                                    <tr><td colSpan={7} style={{ textAlign:'center', padding:32, color:'#bbb' }}>
                                        {userSearch ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có người dùng nào'}
                                    </td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <Pagination current={userPage} total={totalUserPages} onChange={setUserPage} />
                </div>
            )}

            {showAddModal && (
                <Modal title="➕ Thêm đối tượng mới" onClose={() => { setShowAddModal(false); setFormError(''); }}>
                    <SubjectForm data={addForm} onChange={setAddForm} error={formError}
                        onSubmit={handleAddSubject}
                        onCancel={() => { setShowAddModal(false); setFormError(''); }}
                        submitLabel="Thêm mới" />
                </Modal>
            )}

            {showEditModal && (
                <Modal title="✏️ Chỉnh sửa thông tin" onClose={() => { setShowEditModal(false); setFormError(''); }}>
                    <SubjectForm data={editForm} onChange={setEditForm} error={formError}
                        onSubmit={handleUpdateSubject}
                        onCancel={() => { setShowEditModal(false); setFormError(''); }}
                        submitLabel="Lưu thay đổi" />
                </Modal>
            )}
        </div>
    );
}

const inputStyle = { padding:'8px 12px', borderRadius:6, border:'1px solid #ddd', width:'100%', boxSizing:'border-box', fontSize:14 };
const btn    = { padding:'8px 18px', border:'none', borderRadius:6, cursor:'pointer', fontSize:14, fontWeight:500 };
const btnSm  = { padding:'4px 10px', border:'none', borderRadius:4, cursor:'pointer', fontSize:12, fontWeight:500 };
const th     = { padding:'12px 14px', textAlign:'left', fontWeight:500, whiteSpace:'nowrap' };
const td     = { padding:'11px 14px', borderBottom:'1px solid #f0f0f0', verticalAlign:'middle' };