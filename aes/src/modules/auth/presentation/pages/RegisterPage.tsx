// src/modules/auth/presentation/pages/RegisterPage.tsx

import { useState } from 'react';
import { Link } from 'react-router-dom';

export function RegisterPage() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // اینجا بعداً ثبت‌نام واقعی رو وصل می‌کنیم
      setMessage('✅ ثبت‌نام با موفقیت انجام شد!');
    } catch (error) {
      setMessage('❌ خطا در ثبت‌نام');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: 400, 
      margin: '50px auto', 
      padding: 30,
      background: 'white',
      borderRadius: 16,
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      direction: 'rtl'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: 24, color: '#1a1a2e' }}>
        ثبت‌نام در AES
      </h1>

      {message && (
        <div style={{
          padding: 12,
          borderRadius: 8,
          marginBottom: 16,
          backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
          color: message.includes('✅') ? '#155724' : '#721c24',
          textAlign: 'center'
        }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>
            ایمیل
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: 10,
              borderRadius: 8,
              border: '1px solid #ddd',
              fontSize: 16
            }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>
            نام کامل
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            style={{
              width: '100%',
              padding: 10,
              borderRadius: 8,
              border: '1px solid #ddd',
              fontSize: 16
            }}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>
            رمز عبور
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: 10,
              borderRadius: 8,
              border: '1px solid #ddd',
              fontSize: 16
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: 12,
            backgroundColor: loading ? '#aaa' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            cursor: loading ? 'default' : 'pointer'
          }}
        >
          {loading ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: 20 }}>
        قبلاً ثبت‌نام کردی؟ <Link to="/login" style={{ color: '#2563eb' }}>وارد شو</Link>
      </p>
    </div>
  );
}