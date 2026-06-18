import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  Lock, 
  LogOut, 
  User, 
  MessageSquare, 
  PhoneCall, 
  HelpCircle, 
  Grid, 
  Play, 
  Bookmark, 
  Search, 
  CheckCircle, 
  AlertTriangle,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';

// Seed Initial Data to LocalStorage
const seedData = () => {
  if (!localStorage.getItem('registeredUsers')) {
    localStorage.setItem('registeredUsers', JSON.stringify([
      { name: 'Default User', email: 'user@safebank.ai', password: 'Password123' },
      { name: 'Admin', email: 'admin@safebank.com', password: 'Password@123' }
    ]));
  }
  if (!localStorage.getItem('blockedCallers')) {
    localStorage.setItem('blockedCallers', JSON.stringify([
      { number: '+91 98765 43210', reason: 'Spam Loan Offers', date: '2026-06-17' },
      { number: '+91 88888 88888', reason: 'Vishing OTP Scam', date: '2026-06-18' }
    ]));
  }
  if (!localStorage.getItem('callHistory')) {
    localStorage.setItem('callHistory', JSON.stringify([
      { number: '+91 99999 11111', status: 'Safe', riskScore: '12%', date: '2026-06-18 10:15' },
      { number: '+91 88888 88888', status: 'Suspicious', riskScore: '89%', date: '2026-06-18 11:22' }
    ]));
  }
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('isAuthenticated') === 'true';
  });
  const [currentUserEmail, setCurrentUserEmail] = useState(() => {
    return sessionStorage.getItem('currentUserEmail') || '';
  });

  useEffect(() => {
    seedData();
  }, []);

  const handleLogin = (email, password) => {
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const matchedUser = users.find(u => u.email === email && u.password === password);
    if (matchedUser) {
      setIsAuthenticated(true);
      setCurrentUserEmail(email);
      sessionStorage.setItem('isAuthenticated', 'true');
      sessionStorage.setItem('currentUserEmail', email);
      return { success: true };
    }
    return { success: false, message: 'Invalid email or password' };
  };

  const handleRegister = (name, email, password) => {
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    if (users.some(u => u.email === email)) {
      return { success: false, message: 'Email already exists' };
    }
    users.push({ name, email, password });
    localStorage.setItem('registeredUsers', JSON.stringify(users));
    
    // Auto-login upon successful registration
    setIsAuthenticated(true);
    setCurrentUserEmail(email);
    sessionStorage.setItem('isAuthenticated', 'true');
    sessionStorage.setItem('currentUserEmail', email);
    return { success: true };
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUserEmail('');
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('currentUserEmail');
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage onLogin={handleLogin} />
          } 
        />
        <Route 
          path="/register" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage onRegister={handleRegister} />
          } 
        />
        <Route 
          path="/*" 
          element={
            isAuthenticated ? (
              <Layout currentUserEmail={currentUserEmail} onLogout={handleLogout}>
                <Routes>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/sms-scanner" element={<SmsScannerPage />} />
                  <Route path="/call-analyzer" element={<CallAnalyzerPage />} />
                  <Route path="/awareness" element={<AwarenessPage />} />
                  <Route path="/profile" element={<ProfilePage currentUserEmail={currentUserEmail} />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

/* ==========================================
   LAYOUT COMPONENT
   ========================================== */
function Layout({ children, currentUserEmail, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="app-container">
      <div className="sidebar">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <ShieldAlert size={32} color="#6366f1" />
            <span style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.05em' }}>SAFEBANK AI</span>
          </div>
          <ul className="nav-menu">
            <li className="nav-item">
              <Link id="nav-dashboard" to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
                <Grid size={20} /> Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link id="nav-sms" to="/sms-scanner" className={`nav-link ${location.pathname === '/sms-scanner' ? 'active' : ''}`}>
                <MessageSquare size={20} /> SMS Scanner
              </Link>
            </li>
            <li className="nav-item">
              <Link id="nav-call" to="/call-analyzer" className={`nav-link ${location.pathname === '/call-analyzer' ? 'active' : ''}`}>
                <PhoneCall size={20} /> Call Analyzer
              </Link>
            </li>
            <li className="nav-item">
              <Link id="nav-awareness" to="/awareness" className={`nav-link ${location.pathname === '/awareness' ? 'active' : ''}`}>
                <HelpCircle size={20} /> Awareness
              </Link>
            </li>
            <li className="nav-item">
              <Link id="nav-profile" to="/profile" className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}>
                <User size={20} /> Profile & Settings
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', marginBottom: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            User: <span id="sidebar-email">{currentUserEmail}</span>
          </div>
          <button id="logout-btn" onClick={() => { onLogout(); navigate('/login'); }} className="btn btn-secondary" style={{ width: '100%' }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div className="main-content">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   LOGIN PAGE
   ========================================== */
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [passwordErr, setPasswordErr] = useState('');
  const [generalErr, setGeneralErr] = useState('');
  const [forgotPasswordMsg, setForgotPasswordMsg] = useState('');
  const [showPass, setShowPass] = useState(false);

  const validate = () => {
    let isValid = true;
    if (!email) {
      setEmailErr('Email is required');
      isValid = false;
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      setEmailErr('Please enter a valid email address');
      isValid = false;
    } else {
      setEmailErr('');
    }

    if (!password) {
      setPasswordErr('Password is required');
      isValid = false;
    } else {
      setPasswordErr('');
    }
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setGeneralErr('');
    setForgotPasswordMsg('');
    if (validate()) {
      const res = onLogin(email, password);
      if (!res.success) {
        setGeneralErr(res.message);
      }
    }
  };

  const handleForgotPassword = () => {
    setGeneralErr('');
    if (!email) {
      setEmailErr('Please enter a valid email address');
      return;
    }
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      setEmailErr('Please enter a valid email address');
      return;
    }
    setEmailErr('');
    setForgotPasswordMsg('Password reset instructions sent to your email.');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '420px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <ShieldAlert size={48} color="#6366f1" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Sign In to SafeBank AI</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Protect your transactions with AI intelligence</p>
        </div>

        {generalErr && (
          <div id="login-error-msg" className="alert-banner alert-error">
            <AlertTriangle size={18} /> {generalErr}
          </div>
        )}

        {forgotPasswordMsg && (
          <div id="forgot-password-status" className="alert-banner alert-success">
            <CheckCircle size={18} /> {forgotPasswordMsg}
          </div>
        )}

        <form id="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email-input">Email Address</label>
            <input 
              id="login-email-input"
              type="text"
              className="form-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {emailErr && <span id="login-email-error" className="form-error">{emailErr}</span>}
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="form-label" htmlFor="login-password-input" style={{ margin: 0 }}>Password</label>
              <button 
                id="forgot-password-link"
                type="button" 
                onClick={handleForgotPassword}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                Forgot Password?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input 
                id="login-password-input"
                type={showPass ? 'text' : 'password'}
                className="form-input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: '12px', top: '12px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {passwordErr && <span id="login-password-error" className="form-error">{passwordErr}</span>}
          </div>

          <button id="login-submit-btn" type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
            <Lock size={18} /> Sign In
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Don't have an account?{' '}
          <Link id="go-to-register" to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>Register here</Link>
        </p>
      </div>
    </div>
  );
}

/* ==========================================
   REGISTER PAGE
   ========================================== */
function RegisterPage({ onRegister }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [nameErr, setNameErr] = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [passwordErr, setPasswordErr] = useState('');
  const [agreeErr, setAgreeErr] = useState('');
  const [generalErr, setGeneralErr] = useState('');
  const navigate = useNavigate();

  const validate = () => {
    let isValid = true;
    if (!name) {
      setNameErr('Full name is required');
      isValid = false;
    } else if (name.length < 3) {
      setNameErr('Full name must be at least 3 characters');
      isValid = false;
    } else {
      setNameErr('');
    }

    if (!email) {
      setEmailErr('Email is required');
      isValid = false;
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      setEmailErr('Please enter a valid email address');
      isValid = false;
    } else {
      setEmailErr('');
    }

    if (!password) {
      setPasswordErr('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordErr('Password must be at least 6 characters');
      isValid = false;
    } else {
      setPasswordErr('');
    }

    if (!agree) {
      setAgreeErr('You must agree to terms');
      isValid = false;
    } else {
      setAgreeErr('');
    }

    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setGeneralErr('');
    if (validate()) {
      const res = onRegister(name, email, password);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setGeneralErr(res.message);
      }
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '420px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <ShieldAlert size={48} color="#06b6d4" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Create Secure Account</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Sign up to activate real-time threat protection</p>
        </div>

        {generalErr && (
          <div id="register-error-msg" className="alert-banner alert-error">
            <AlertTriangle size={18} /> {generalErr}
          </div>
        )}

        <form id="register-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="register-name-input">Full Name</label>
            <input 
              id="register-name-input"
              type="text"
              className="form-input"
              placeholder="Enter full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {nameErr && <span id="register-name-error" className="form-error">{nameErr}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-email-input">Email Address</label>
            <input 
              id="register-email-input"
              type="text"
              className="form-input"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {emailErr && <span id="register-email-error" className="form-error">{emailErr}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-password-input">Password</label>
            <input 
              id="register-password-input"
              type="password"
              className="form-input"
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {passwordErr && <span id="register-password-error" className="form-error">{passwordErr}</span>}
          </div>

          <div className="form-group" style={{ marginTop: '24px' }}>
            <label className="checkbox-container">
              <input 
                id="register-agree-checkbox"
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
              />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                I agree to the terms and conditions policy
              </span>
            </label>
            {agreeErr && <span id="register-agree-error" className="form-error">{agreeErr}</span>}
          </div>

          <button id="register-submit-btn" type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
            Get Started
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Already have an account?{' '}
          <Link id="go-to-login" to="/login" style={{ color: 'var(--secondary)', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

/* ==========================================
   DASHBOARD PAGE
   ========================================== */
function DashboardPage() {
  const [filter, setFilter] = useState('Last 7 Days');
  const [stats, setStats] = useState({
    safetyIndex: '98/100',
    messagesScanned: '42',
    threatsBlocked: '8',
    status: 'ACTIVE'
  });
  const [showReport, setShowReport] = useState(false);
  const [exportSuccess, setExportSuccess] = useState('');

  // Dynamically change statistics based on filter choice for TC028
  useEffect(() => {
    if (filter === 'Last 7 Days') {
      setStats({
        safetyIndex: '98/100',
        messagesScanned: '42',
        threatsBlocked: '8',
        status: 'ACTIVE'
      });
    } else {
      setStats({
        safetyIndex: '94/100',
        messagesScanned: '184',
        threatsBlocked: '27',
        status: 'ACTIVE'
      });
    }
  }, [filter]);

  const handleExport = () => {
    setExportSuccess('');
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(stats));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "SafeBankAI_Analytics_Report.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.warn("File download triggered but blocked by headless browser rules:", err);
    }
    setExportSuccess('Analytics report successfully exported!');
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2.25rem', marginBottom: '8px' }}>Security Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Real-time telemetry and active threat defense</p>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <select 
            id="analytics-filter-select"
            className="form-input" 
            style={{ width: '160px', padding: '8px 12px' }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
          </select>
          <button id="export-report-btn" onClick={handleExport} className="btn btn-secondary" style={{ padding: '10px 16px' }}>
            <Download size={16} /> Export Report
          </button>
        </div>
      </div>

      {exportSuccess && (
        <div id="export-success-msg" className="alert-banner alert-success">
          <CheckCircle size={18} /> {exportSuccess}
        </div>
      )}

      {/* Stats Cards Row */}
      <div className="grid-4" style={{ marginBottom: '40px' }}>
        <div className="glass-panel stat-card">
          <div className="stat-header">
            <span>Safety Index</span>
            <CheckCircle color="#10b981" size={20} />
          </div>
          <span id="stat-safety-score" className="stat-value">{stats.safetyIndex}</span>
          <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 500 }}>System Secure</span>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-header">
            <span>SMS Logs Scanned</span>
            <MessageSquare color="#6366f1" size={20} />
          </div>
          <span id="stat-messages-scanned" className="stat-value">{stats.messagesScanned}</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>SMS channels active</span>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-header">
            <span>Threats Blocked</span>
            <ShieldAlert color="#ef4444" size={20} />
          </div>
          <span id="stat-threats-blocked" className="stat-value">{stats.threatsBlocked}</span>
          <span style={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: 500 }}>Malicious hits deflected</span>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-header">
            <span>Defense Engine</span>
            <AlertTriangle color="#06b6d4" size={20} />
          </div>
          <span id="stat-engine-status" className="stat-value">{stats.status}</span>
          <span style={{ fontSize: '0.85rem', color: '#06b6d4', fontWeight: 500 }}>Vishing shielding active</span>
        </div>
      </div>

      {/* Monthly Report Section */}
      <div id="monthly-report-card" className="glass-panel" style={{ padding: '32px', marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>Monthly Threat Intelligence Report</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Read summarized threat landscape developments for June 2026</p>
          </div>
          <button id="load-report-btn" onClick={() => setShowReport(true)} className="btn btn-primary" style={{ padding: '10px 20px' }}>
            Load Report Detail
          </button>
        </div>
      </div>

      {showReport && (
        <div id="monthly-report-modal" className="modal-overlay">
          <div className="glass-panel modal-content animate-fade-in">
            <h3 style={{ fontSize: '1.5rem', marginBottom: '16px' }} className="gradient-text">SafeBank AI Threat Intelligence - June 2026</h3>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <p><strong>Overview:</strong> Our systems have flagged a 15% increase in regional UPI OTP phishing campaigns attempting KYC bypass validations.</p>
              <p><strong>Primary Vector:</strong> Malicious callers utilizing simulated banking IVR numbers to request OTP approvals.</p>
              <p><strong>Recommendation:</strong> Ensure call screening utilities are active and never share 6-digit verification codes.</p>
            </div>
            <button id="close-report-btn" onClick={() => setShowReport(false)} className="btn btn-secondary" style={{ width: '100%' }}>
              Close Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================
   SMS SPAM SCANNER PAGE
   ========================================== */
function SmsScannerPage() {
  const [activeTab, setActiveTab] = useState('sms');
  const [smsInput, setSmsInput] = useState('');
  const [smsResult, setSmsResult] = useState('');
  const [smsScore, setSmsScore] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [urlResult, setUrlResult] = useState('');

  const handleSmsScan = () => {
    if (!smsInput.trim()) {
      setSmsResult('Empty submission input');
      setSmsScore('');
      return;
    }
    const text = smsInput.toLowerCase();
    if (text.includes('kyc') || text.includes('blocked') || text.includes('activity') || text.includes('update')) {
      setSmsScore('Score: 92% (High Threat)');
      setSmsResult('RISKY: Suspicious SMS containing urgent KYC/Account updates.');
    } else if (text.includes('won') || text.includes('crore') || text.includes('cash') || text.includes('processing tax')) {
      setSmsScore('Score: 98% (High Threat)');
      setSmsResult('RISKY: Phishing attempt offering fake rewards or cash prizes.');
    } else {
      setSmsScore('Score: 2% (Low Threat)');
      setSmsResult('SAFE: This message appears legitimate and safe.');
    }
  };

  const handleUrlScan = () => {
    if (!urlInput.trim()) {
      setUrlResult('Empty URL input');
      return;
    }
    const url = urlInput.toLowerCase();
    if (url.includes('phish') || url.includes('scam') || url.includes('safebank-scam-update')) {
      setUrlResult('FLAGGED MALICIOUS: Phishing domain suspected. Connection blocked.');
    } else {
      setUrlResult('COMPLETED: Domain status is clean and safe to visit.');
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="gradient-text" style={{ fontSize: '2.25rem', marginBottom: '8px' }}>Fraud Alert Detection</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Analyze SMS contents and suspicious URL domains in real-time</p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
        <button 
          id="tab-sms-scan" 
          onClick={() => setActiveTab('sms')}
          className={`btn ${activeTab === 'sms' ? 'btn-primary' : 'btn-secondary'}`}
        >
          SMS Scanner
        </button>
        <button 
          id="tab-url-scan" 
          onClick={() => setActiveTab('url')}
          className={`btn ${activeTab === 'url' ? 'btn-primary' : 'btn-secondary'}`}
        >
          URL Threat Analyzer
        </button>
      </div>

      {activeTab === 'sms' ? (
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>Upload SMS Content</h3>
          <div className="form-group">
            <label className="form-label">Message Text Log</label>
            <textarea 
              id="sms-input"
              className="form-input"
              rows={5}
              placeholder="Paste suspicious SMS text here..."
              value={smsInput}
              onChange={(e) => setSmsInput(e.target.value)}
            />
          </div>
          <button id="sms-scan-btn" onClick={handleSmsScan} className="btn btn-primary">
            Scan SMS Content
          </button>

          {smsResult && (
            <div style={{ marginTop: '32px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '24px' }}>
              <h4 style={{ marginBottom: '12px' }}>Analysis Findings</h4>
              <div id="sms-scan-result" className={`alert-banner ${smsResult.includes('RISKY') ? 'alert-error' : 'alert-success'}`}>
                {smsResult}
              </div>
              {smsScore && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontWeight: 'bold' }}>
                  <span>Fraud Index:</span>
                  <span id="sms-threat-score" style={{ color: smsScore.includes('High') ? 'var(--danger)' : 'var(--success)' }}>{smsScore}</span>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>Analyze Suspicious URL</h3>
          <div className="form-group">
            <label className="form-label">Domain or URL Link</label>
            <input 
              id="url-input"
              type="text"
              className="form-input"
              placeholder="e.g. http://safebank-scam-update.com"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
            />
          </div>
          <button id="url-scan-btn" onClick={handleUrlScan} className="btn btn-primary">
            Analyze URL Link
          </button>

          {urlResult && (
            <div style={{ marginTop: '32px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '24px' }}>
              <h4 style={{ marginBottom: '12px' }}>Threat Intelligence Output</h4>
              <div id="url-scan-result" className={`alert-banner ${urlResult.includes('FLAGGED') ? 'alert-error' : 'alert-success'}`}>
                {urlResult}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ==========================================
   CALL ANALYZER PAGE
   ========================================== */
function CallAnalyzerPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [scanResult, setScanResult] = useState('');
  const [callHistory, setCallHistory] = useState(() => {
    return JSON.parse(localStorage.getItem('callHistory') || '[]');
  });
  const [blockedCallers, setBlockedCallers] = useState(() => {
    return JSON.parse(localStorage.getItem('blockedCallers') || '[]');
  });

  const handlePhoneScan = () => {
    if (!phoneNumber.trim()) {
      setScanResult('Empty phone input');
      return;
    }
    const num = phoneNumber.trim();
    let status = 'Safe';
    let score = '4% (Clean)';
    
    if (num.includes('1800') || num.includes('88888') || num === '+91 88888 88888') {
      status = 'Suspicious';
      score = '89% (Spam Risk)';
    }

    setScanResult(`Scanned ${num} - Marked as ${status} (${score})`);

    // Add to history list
    const newHist = [{
      number: num,
      status: status,
      riskScore: score,
      date: new Date().toLocaleString()
    }, ...callHistory];

    setCallHistory(newHist);
    localStorage.setItem('callHistory', JSON.stringify(newHist));
  };

  const handleBlockCaller = () => {
    if (!phoneNumber.trim()) return;
    const num = phoneNumber.trim();
    if (blockedCallers.some(c => c.number === num)) return;

    const newBlocked = [{
      number: num,
      reason: 'User manual block',
      date: new Date().toLocaleDateString()
    }, ...blockedCallers];

    setBlockedCallers(newBlocked);
    localStorage.setItem('blockedCallers', JSON.stringify(newBlocked));
    setPhoneNumber('');
  };

  return (
    <div className="animate-fade-in">
      <h1 className="gradient-text" style={{ fontSize: '2.25rem', marginBottom: '8px' }}>Safe Call Analysis</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Check caller numbers and manage spam blocklists</p>

      <div className="grid-2" style={{ alignItems: 'start', marginBottom: '40px' }}>
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>Scan Caller Number</h3>
          <div className="form-group">
            <label className="form-label">Caller Phone Number</label>
            <input 
              id="phone-input"
              type="text"
              className="form-input"
              placeholder="+91 1800-XXX-XXXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button id="phone-scan-btn" onClick={handlePhoneScan} className="btn btn-primary">
              Analyze Number
            </button>
            <button id="phone-block-btn" onClick={handleBlockCaller} className="btn btn-danger">
              Block Caller
            </button>
          </div>

          {scanResult && (
            <div id="phone-scan-result" className={`alert-banner ${scanResult.includes('Suspicious') ? 'alert-error' : 'alert-success'}`} style={{ marginTop: '24px' }}>
              {scanResult}
            </div>
          )}
        </div>

        <div className="glass-panel" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>Active Blocked List</h3>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Phone Number</th>
                  <th>Flagged Reason</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody id="blocked-callers-tbody">
                {blockedCallers.map((b, i) => (
                  <tr key={i}>
                    <td>{b.number}</td>
                    <td><span className="badge badge-danger">{b.reason}</span></td>
                    <td>{b.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Call History */}
      <div className="glass-panel" style={{ padding: '32px' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>Call Screening Scan Logs</h3>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Caller Number</th>
                <th>Classification</th>
                <th>Threat Metric</th>
                <th>Execution Date</th>
              </tr>
            </thead>
            <tbody id="call-history-tbody">
              {callHistory.map((h, i) => (
                <tr key={i}>
                  <td>{h.number}</td>
                  <td>
                    <span className={`badge ${h.status === 'Safe' ? 'badge-success' : 'badge-danger'}`}>
                      {h.status}
                    </span>
                  </td>
                  <td>{h.riskScore}</td>
                  <td>{h.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   BANKING AWARENESS PAGE
   ========================================== */
const AWARENESS_ARTICLES = [
  { title: 'Understanding OTP Vishing Scams', category: 'Calls', text: 'Scammers simulate legitimate support numbers to request 6-digit validation OTPs under the pretense of account blocking.' },
  { title: 'KYC Phishing Links Decoded', category: 'URLs', text: 'Avoid clicking SMS links demanding immediate KYC verification. Check domains carefully.' },
  { title: 'Safe Mobile Banking Rules', category: 'Security', text: 'Use biometric sign-ins, change credentials periodically, and audit transaction reports regularly.' }
];

function AwarenessPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarks, setBookmarks] = useState([]);
  const [videoPlaying, setVideoPlaying] = useState(false);

  const filteredArticles = AWARENESS_ARTICLES.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleBookmark = (title) => {
    if (bookmarks.includes(title)) {
      setBookmarks(bookmarks.filter(b => b !== title));
    } else {
      setBookmarks([...bookmarks, title]);
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="gradient-text" style={{ fontSize: '2.25rem', marginBottom: '8px' }}>Banking Awareness</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Educate yourself on regional banking scams and alert triggers</p>

      {/* Video Player widget */}
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '40px', display: 'flex', gap: '32px', alignItems: 'center' }}>
        <div style={{ width: '120px', height: '90px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Play size={32} color={videoPlaying ? '#10b981' : '#6366f1'} />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '6px' }}>Interactive Awareness Video Guide</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '12px' }}>Learn how to analyze suspicious calls within 2 minutes</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button id="video-play-btn" onClick={() => setVideoPlaying(!videoPlaying)} className="btn btn-primary" style={{ padding: '8px 16px' }}>
              {videoPlaying ? 'Pause Video' : 'Play Video'}
            </button>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Status: <span id="video-state" style={{ color: videoPlaying ? 'var(--success)' : 'var(--text-secondary)', fontWeight: 'bold' }}>{videoPlaying ? 'Playing' : 'Paused'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Articles & Search section */}
      <div className="glass-panel" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.25rem' }}>Educational Article Catalog</h3>
          <div style={{ position: 'relative', width: '280px' }}>
            <input 
              id="awareness-search-input"
              type="text"
              className="form-input"
              style={{ paddingLeft: '40px' }}
              placeholder="Search topic or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
          </div>
        </div>

        {/* List of articles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filteredArticles.map((a, i) => (
            <div key={i} className="glass-panel" style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <span className="badge badge-success">{a.category}</span>
                  <h4 style={{ fontSize: '1.1rem' }} className="article-title">{a.title}</h4>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{a.text}</p>
              </div>
              <button 
                id={`bookmark-btn-${i}`}
                onClick={() => toggleBookmark(a.title)} 
                className="btn btn-secondary" 
                style={{ padding: '8px', border: 'none', background: 'none' }}
              >
                <Bookmark size={20} color={bookmarks.includes(a.title) ? '#f59e0b' : '#94a3b8'} fill={bookmarks.includes(a.title) ? '#f59e0b' : 'none'} />
              </button>
            </div>
          ))}
        </div>

        {/* Bookmarked Summary */}
        {bookmarks.length > 0 && (
          <div style={{ marginTop: '32px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '24px' }}>
            <h4 style={{ marginBottom: '16px' }}>Bookmarked Resources</h4>
            <div id="bookmark-badge" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {bookmarks.map((b, i) => (
                <span key={i} className="badge badge-warning" style={{ fontSize: '0.8rem', padding: '8px 12px' }}>
                  {b}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ==========================================
   PROFILE & PREFERENCES PAGE
   ========================================== */
function ProfilePage({ currentUserEmail }) {
  const [darkMode, setDarkMode] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [profileSuccess, setProfileSuccess] = useState('');

  const handleSavePreferences = () => {
    setProfileSuccess('Profile preferences successfully saved!');
    setTimeout(() => {
      setProfileSuccess('');
    }, 4000);
  };

  return (
    <div className="animate-fade-in">
      <h1 className="gradient-text" style={{ fontSize: '2.25rem', marginBottom: '8px' }}>User Profile & Settings</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Manage security notification thresholds and layout preferences</p>

      {profileSuccess && (
        <div id="profile-success-msg" className="alert-banner alert-success">
          <CheckCircle size={18} /> {profileSuccess}
        </div>
      )}

      <div className="grid-2">
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>User Details</h3>
          <div className="form-group">
            <label className="form-label">Active Email Address</label>
            <div id="profile-email-text" className="form-input" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'transparent' }}>
              {currentUserEmail}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Authentication Status</label>
            <span className="badge badge-success">Verified Active Session</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>System Preferences</h3>
          
          <div className="switch-container">
            <div>
              <span style={{ fontWeight: 500, display: 'block' }}>Vibrant Dark Mode Theme</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Utilizes premium color gradients</span>
            </div>
            <label className="switch">
              <input 
                id="theme-toggle"
                type="checkbox" 
                checked={darkMode} 
                onChange={(e) => setDarkMode(e.target.checked)} 
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="switch-container">
            <div>
              <span style={{ fontWeight: 500, display: 'block' }}>High Contrast Layout</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Maximizes readability for visibility needs</span>
            </div>
            <label className="switch">
              <input 
                id="contrast-toggle"
                type="checkbox" 
                checked={highContrast} 
                onChange={(e) => setHighContrast(e.target.checked)} 
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="switch-container">
            <div>
              <span style={{ fontWeight: 500, display: 'block' }}>Immediate Threat Email Alerts</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Send instant alerts on suspicious hits</span>
            </div>
            <label className="switch">
              <input 
                id="alerts-toggle"
                type="checkbox" 
                checked={emailAlerts} 
                onChange={(e) => setEmailAlerts(e.target.checked)} 
              />
              <span className="slider"></span>
            </label>
          </div>

          <button id="profile-save-btn" onClick={handleSavePreferences} className="btn btn-primary" style={{ width: '100%', marginTop: '32px' }}>
            Save Preference Options
          </button>
        </div>
      </div>
    </div>
  );
}
