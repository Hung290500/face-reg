import { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import api from '../api/axios';

export default function ScanPage() {
    const webcamRef  = useRef(null);
    const canvasRef  = useRef(null);
    const intervalRef = useRef(null);

    const [mode,           setMode]           = useState('recognize');
    const [status,         setStatus]         = useState('');
    const [statusType,     setStatusType]     = useState('info');
    const [result,         setResult]         = useState(null);
    const [imageCount,     setImageCount]     = useState(0);
    const [isCapturing,    setIsCapturing]    = useState(false);
    const [subjects,       setSubjects]       = useState([]);
    const [selectedId,     setSelectedId]     = useState('');

    useEffect(() => {
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, []);

    useEffect(() => {
        if (mode === 'register') {
            api.get('/subjects')
                .then(res => setSubjects(res.data))
                .catch(() => setSubjects([]));
        }
    }, [mode]);

    const drawFaceBox = useCallback((faceX, faceY, faceW, faceH, label) => {
        const canvas = canvasRef.current;
        const video  = webcamRef.current?.video;
        if (!canvas || !video) return;

        const scaleX = video.clientWidth  / video.videoWidth;
        const scaleY = video.clientHeight / video.videoHeight;

        canvas.width  = video.clientWidth;
        canvas.height = video.clientHeight;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const x = faceX * scaleX;
        const y = faceY * scaleY;
        const w = faceW * scaleX;
        const h = faceH * scaleY;

        ctx.strokeStyle = '#4caf50';
        ctx.lineWidth   = 3;
        ctx.strokeRect(x, y, w, h);

        ctx.fillStyle = '#4caf50';
        ctx.fillRect(x, y - 28, w, 28);

        ctx.fillStyle = '#fff';
        ctx.font      = 'bold 14px Arial';
        ctx.fillText(label, x + 6, y - 8);
    }, []);

    const clearCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    }, []);

    const capture = useCallback(async () => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (!imageSrc) { setStatus('Webcam chưa sẵn sàng!'); setStatusType('error'); return; }

        try {
            if (mode === 'register') {
                const res = await api.post(`/face/collect/${selectedId}`, { image: imageSrc });
                setImageCount(res.data.imageCount);
                setStatus(`Thu thập: ${res.data.imageCount}/50 ảnh`);
                setStatusType('info');
                if (res.data.imageCount >= 50) {
                    clearInterval(intervalRef.current);
                    setIsCapturing(false);
                    setStatus('Đủ 50 ảnh! Bấm Train Model để hoàn tất.');
                    setStatusType('success');
                }
            } else {
                const res = await api.post('/face/recognize', { image: imageSrc });
                setResult(res.data);
                if (res.data.recognized) {
                    setStatus('Nhận diện thành công!');
                    setStatusType('success');
                    drawFaceBox(res.data.faceX, res.data.faceY, res.data.faceW, res.data.faceH, res.data.subject?.fullName || '');
                } else {
                    setStatus('Không nhận ra khuôn mặt');
                    setStatusType('error');
                    clearCanvas();
                }
            }
        } catch (err) {
            setStatus('Lỗi: ' + (err.response?.data?.message || err.message));
            setStatusType('error');
            clearCanvas();
        }
    }, [mode, selectedId, drawFaceBox, clearCanvas]);

    const startAutoCapture = () => {
        if (!selectedId) {
            setStatus('Vui lòng chọn đối tượng!');
            setStatusType('error');
            return;
        }
        setIsCapturing(true);
        setImageCount(0);
        setStatus('Đang thu thập ảnh...');
        setStatusType('info');
        intervalRef.current = setInterval(capture, 500);
    };

    const stopCapture = () => {
        clearInterval(intervalRef.current);
        setIsCapturing(false);
        setStatus('Đã dừng thu thập.');
        setStatusType('info');
    };

    const handleTrain = async () => {
        try {
            setStatus('Đang train model...');
            setStatusType('info');
            const res = await api.post('/face/train');
            setStatus(res.data.message);
            setStatusType('success');
        } catch (err) {
            setStatus('Train thất bại: ' + err.response?.data?.message);
            setStatusType('error');
        }
    };

    const switchMode = (m) => {
        setMode(m);
        setResult(null);
        setStatus('');
        setStatusType('info');
        setImageCount(0);
        setSelectedId('');
        clearCanvas();
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsCapturing(false);
    };

    const statusColors = { info:'#1976d2', success:'#2e7d32', error:'#c62828' };

    return (
        <div style={{ maxWidth:640, margin:'2rem auto', padding:'0 1rem' }}>
            <h2 style={{ marginBottom:16 }}>Nhận diện khuôn mặt</h2>

            <div style={{ display:'flex', gap:8, marginBottom:16 }}>
                {[
                    { key:'recognize', label:'Nhận diện'      },
                    { key:'register',  label:'Đăng ký mặt mới' },
                ].map(m => (
                    <button key={m.key} onClick={() => switchMode(m.key)} style={{
                        padding:'8px 20px', border:'none', borderRadius:6, cursor:'pointer', fontSize:14,
                        background: mode === m.key ? '#1976d2' : '#eee',
                        color:      mode === m.key ? '#fff'    : '#333',
                    }}>{m.label}</button>
                ))}
            </div>

            <div style={{ position:'relative', width:'100%' }}>
                <Webcam ref={webcamRef} screenshotFormat="image/jpeg" width={640} height={480}
                    style={{ borderRadius:8, border:'2px solid #ddd', width:'100%', display:'block' }} />
                <canvas ref={canvasRef} style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', pointerEvents:'none', borderRadius:8 }} />
            </div>

            {mode === 'register' && (
                <div style={{ marginTop:12 }}>
                    {subjects.length === 0 ? (
                        <div style={{ padding:'14px 16px', background:'#fff3e0', borderRadius:8, borderLeft:'4px solid #ff9800', color:'#e65100', fontSize:14 }}>
                            ⚠️ Chưa có đối tượng nào trong hệ thống. Vui lòng liên hệ Admin để tạo đối tượng trước khi đăng ký khuôn mặt.
                        </div>
                    ) : (
                        <>
                            <select value={selectedId} onChange={e => { setSelectedId(e.target.value); setImageCount(0); setStatus(''); }}
                                style={{ padding:'8px 12px', width:'100%', borderRadius:6, border:'1px solid #ccc', marginBottom:10, fontSize:14, boxSizing:'border-box' }}>
                                <option value="">-- Chọn đối tượng --</option>
                                {subjects.map(s => (
                                    <option key={s.id} value={s.id}>
                                        #{s.id} — {s.fullName}{s.isTrained ? ' ✅' : ''}
                                    </option>
                                ))}
                            </select>

                            <div style={{ background:'#f0f0f0', borderRadius:6, padding:'8px 10px', marginBottom:10 }}>
                                <div style={{ background:'#1976d2', height:8, borderRadius:4, width:`${Math.min((imageCount/50)*100,100)}%`, transition:'width 0.3s' }} />
                                <span style={{ fontSize:13, color:'#555', marginTop:4, display:'block' }}>{imageCount}/50 ảnh</span>
                            </div>

                            <div style={{ display:'flex', gap:8 }}>
                                {!isCapturing ? (
                                    <button onClick={startAutoCapture}
                                        style={{ padding:'10px 20px', background:'#4caf50', color:'#fff', border:'none', borderRadius:6, cursor:'pointer', fontSize:14 }}>
                                        Bắt đầu thu thập
                                    </button>
                                ) : (
                                    <button onClick={stopCapture}
                                        style={{ padding:'10px 20px', background:'#ff9800', color:'#fff', border:'none', borderRadius:6, cursor:'pointer', fontSize:14 }}>
                                        Dừng
                                    </button>
                                )}
                                <button onClick={handleTrain}
                                    style={{ padding:'10px 20px', background:'#9c27b0', color:'#fff', border:'none', borderRadius:6, cursor:'pointer', fontSize:14 }}>
                                    Train Model
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {mode === 'recognize' && (
                <button onClick={capture}
                    style={{ marginTop:12, padding:'10px 32px', background:'#1976d2', color:'#fff', border:'none', borderRadius:6, cursor:'pointer', fontSize:16 }}>
                    Quét mặt
                </button>
            )}

            {status && (
                <div style={{ marginTop:12, padding:'10px 14px', background:'#f5f5f5', borderRadius:6, borderLeft:`4px solid ${statusColors[statusType]}`, color:statusColors[statusType], fontSize:14 }}>
                    {status}
                </div>
            )}

            {result?.recognized && (
                <div style={{ marginTop:12, padding:16, background:'#e8f5e9', borderRadius:8, border:'1px solid #4caf50' }}>
                    <h3 style={{ margin:'0 0 8px' }}>{result.subject.fullName}</h3>
                    <p style={{ margin:'4px 0' }}>Ngày sinh: {result.subject.dateOfBirth || '—'}</p>
                    <p style={{ margin:'4px 0' }}>SĐT: {result.subject.phone || '—'}</p>
                    <p style={{ margin:'4px 0' }}>Email: {result.subject.email || '—'}</p>
                    <p style={{ margin:'4px 0', color:'#555', fontSize:13 }}>Độ chính xác: {(100 - result.confidence).toFixed(1)}%</p>
                </div>
            )}
        </div>
    );
}