import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, User, DollarSign, TrendingDown, Clipboard, Calendar, FileText, CheckCircle2, AlertCircle, Eye, EyeOff, HelpCircle } from 'lucide-react';
import appMetadata from '../../config/app-metadata.json';

// Seed Initial Mock Data to SessionStorage
const seedMockData = () => {
  if (!sessionStorage.getItem('incomes')) {
    sessionStorage.setItem('incomes', JSON.stringify([
      { id: 1, source: 'January Salary', amount: 50000, date: '2026-01-01', category: 'Salary' },
      { id: 2, source: 'Freelance Design', amount: 12000, date: '2026-01-15', category: 'Investments' }
    ]));
  }
  if (!sessionStorage.getItem('expenses')) {
    sessionStorage.setItem('expenses', JSON.stringify([
      { id: 1, title: 'House Rent', amount: 15000, date: '2026-01-02', category: 'Housing' },
      { id: 2, title: 'Organic Groceries', amount: 4500, date: '2026-01-05', category: 'Food' },
      { id: 3, title: 'Electricity Bill', amount: 2200, date: '2026-01-08', category: 'Utilities' }
    ]));
  }
  if (!sessionStorage.getItem('budgets')) {
    sessionStorage.setItem('budgets', JSON.stringify([
      { id: 1, category: 'Food', limit: 8000 },
      { id: 2, category: 'Housing', limit: 20000 },
      { id: 3, category: 'Entertainment', limit: 5000 },
      { id: 4, category: 'Utilities', limit: 4000 }
    ]));
  }
};

export default function App() {
  const [session, setSession] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('isAuthenticated') === 'true';
  });

  useEffect(() => {
    seedMockData();
    const isAuth = sessionStorage.getItem('isAuthenticated') === 'true';
    if (isAuth) {
      const email = sessionStorage.getItem('currentUserEmail') || 'user@budget.com';
      setSession({ email });
    }
  }, []);

  const handleLogin = (email, password) => {
    // Check if the user is registered
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const userExists = registeredUsers.find(u => u.email === email && u.password === password);

    if (userExists || (email === 'admin@safebank.com' && password === 'Password@123') || (email === 'user@budget.com' && password === 'Password123')) {
      setIsAuthenticated(true);
      setSession({ email });
      sessionStorage.setItem('isAuthenticated', 'true');
      sessionStorage.setItem('currentUserEmail', email);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setSession(null);
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
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />
          }
        />
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout} session={session}>
                <DashboardPage />
              </Layout>
            ) : (
              <Navigate to="/login" replace state={{ error: "Please log in first" }} />
            )
          }
        />
        <Route
          path="/income"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout} session={session}>
                <IncomePage />
              </Layout>
            ) : (
              <Navigate to="/login" replace state={{ error: "Please log in first" }} />
            )
          }
        />
        <Route
          path="/expense"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout} session={session}>
                <ExpensePage />
              </Layout>
            ) : (
              <Navigate to="/login" replace state={{ error: "Please log in first" }} />
            )
          }
        />
        <Route
          path="/budget"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout} session={session}>
                <BudgetPage />
              </Layout>
            ) : (
              <Navigate to="/login" replace state={{ error: "Please log in first" }} />
            )
          }
        />
        <Route
          path="/reports"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout} session={session}>
                <ReportsPage />
              </Layout>
            ) : (
              <Navigate to="/login" replace state={{ error: "Please log in first" }} />
            )
          }
        />
        <Route
          path="/profile"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout} session={session}>
                <ProfilePage session={session} />
              </Layout>
            ) : (
              <Navigate to="/login" replace state={{ error: "Please log in first" }} />
            )
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

// --- LAYOUT WRAPPER ---
function Layout({ children, onLogout, session }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo-section">
          <DollarSign className="logo-icon" size={28} style={{ color: 'var(--border-focus)' }} />
          <span>Smart Budget v3</span>
        </div>
        <nav className="sidebar-nav">
          <Link id="nav-dashboard-link" to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link id="nav-income-link" to="/income" className={`nav-link ${location.pathname === '/income' ? 'active' : ''}`}>
            <DollarSign size={20} />
            <span>Income Manager</span>
          </Link>
          <Link id="nav-expense-link" to="/expense" className={`nav-link ${location.pathname === '/expense' ? 'active' : ''}`}>
            <TrendingDown size={20} />
            <span>Expense Manager</span>
          </Link>
          <Link id="nav-budget-link" to="/budget" className={`nav-link ${location.pathname === '/budget' ? 'active' : ''}`}>
            <Clipboard size={20} />
            <span>Budget Allocator</span>
          </Link>
          <Link id="nav-reports-link" to="/reports" className={`nav-link ${location.pathname === '/reports' ? 'active' : ''}`}>
            <FileText size={20} />
            <span>Financial Reports</span>
          </Link>
          <Link id="nav-profile-link" to="/profile" className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}>
            <User size={20} />
            <span>User Profile</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="main-content">
        <header className="navbar">
          <div className="navbar-title">
            <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
              Environment: <strong style={{ color: 'var(--border-focus)' }}>Production v3</strong>
            </span>
          </div>
          <div className="navbar-user">
            <span id="welcome-message" className="user-welcome">
              Welcome, {session?.email || 'User'}
            </span>
            <button id="logout-btn" className="btn-logout" onClick={() => {
              onLogout();
              navigate('/login');
            }}>
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </header>
        <main className="content-body">
          {children}
        </main>
      </div>
    </div>
  );
}

// --- LOGIN PAGE ---
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.error) {
      setGeneralError(location.state.error);
    }
  }, [location.state]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validate login form
    const loginMeta = appMetadata.forms.login;
    loginMeta.fields.forEach(field => {
      const val = field.name === 'email' ? email : password;
      if (field.validations.required && !val.trim()) {
        newErrors[field.name] = field.validations.required.message;
      } else if (field.name === 'email' && field.validations.pattern) {
        const regex = new RegExp(field.validations.pattern.value);
        if (!regex.test(val)) {
          newErrors.email = field.validations.pattern.message;
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setGeneralError('');
      return;
    }

    setErrors({});
    const success = onLogin(email, password);
    if (!success) {
      setGeneralError('Invalid email or password');
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-card glass-card">
        <div className="login-header">
          <DollarSign className="logo-icon" size={48} style={{ margin: '0 auto', color: 'var(--border-focus)' }} />
          <h1>Smart Budget v3</h1>
          <p>Secure Personal Wealth Console</p>
        </div>

        {generalError && (
          <div id="login-error-msg" className="login-error-banner">
            {generalError}
          </div>
        )}

        <form id="login-form" onSubmit={handleSubmit}>
          <div className="form-fields-grid" style={{ gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email-input">Email Address</label>
              <input
                id="login-email-input"
                type="text"
                className="form-input"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                }}
              />
              {errors.email && <span id="email-error" className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group" style={{ position: 'relative' }}>
              <label className="form-label" htmlFor="login-password-input">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password-input"
                  type={showPass ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                  }}
                  style={{ paddingRight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer'
                  }}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <span id="password-error" className="error-text">{errors.password}</span>}
            </div>

            <button id="login-submit-btn" type="submit" className="btn-primary" style={{ width: '100%', marginTop: '12px' }}>
              Sign In
            </button>
          </div>
        </form>
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Don't have an account? </span>
          <Link id="go-to-register-link" to="/register" style={{ color: 'var(--border-focus)', fontWeight: 600, textDecoration: 'none' }}>Register here</Link>
        </div>
      </div>
    </div>
  );
}

// --- REGISTER PAGE ---
function RegisterPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    const regMeta = appMetadata.forms.registration;
    regMeta.fields.forEach(field => {
      let val = '';
      if (field.name === 'fullName') val = fullName;
      else if (field.name === 'email') val = email;
      else if (field.name === 'password') val = password;
      else if (field.name === 'agreeTerms') val = agreeTerms;

      if (field.validations.required && (typeof val === 'boolean' ? !val : !val.toString().trim())) {
        newErrors[field.name] = field.validations.required.message;
      } else if (field.name === 'fullName' && field.validations.minLength && val.length < field.validations.minLength.value) {
        newErrors.fullName = field.validations.minLength.message;
      } else if (field.name === 'email' && field.validations.pattern) {
        const regex = new RegExp(field.validations.pattern.value);
        if (!regex.test(val)) {
          newErrors.email = field.validations.pattern.message;
        }
      } else if (field.name === 'password' && field.validations.minLength && val.length < field.validations.minLength.value) {
        newErrors.password = field.validations.minLength.message;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSuccessMsg('');
      return;
    }

    setErrors({});
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    registeredUsers.push({ fullName, email, password });
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));

    setSuccessMsg('Account registered successfully! Redirecting to login...');
    setTimeout(() => {
      navigate('/login');
    }, 1500);
  };

  return (
    <div className="login-page-wrapper">
      <div className="form-container glass-card" style={{ width: '100%', maxWidth: '450px' }}>
        <div className="form-title">
          <h1>System Registration</h1>
          <p className="stat-title">Configure user details for Smart Budget account setup.</p>
        </div>

        {successMsg && (
          <div id="register-success-banner" style={{ background: 'var(--green-light)', color: 'var(--accent-green)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontWeight: 600 }}>
            {successMsg}
          </div>
        )}

        <form id="register-form" onSubmit={handleSubmit}>
          <div className="form-fields-grid" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="register-name-input">Full Name</label>
              <input
                id="register-name-input"
                type="text"
                className="form-input"
                placeholder="Enter full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              {errors.fullName && <span id="fullName-error" className="error-text">{errors.fullName}</span>}
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
              {errors.email && <span id="email-error" className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-password-input">Password</label>
              <input
                id="register-password-input"
                type="password"
                className="form-input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && <span id="password-error" className="error-text">{errors.password}</span>}
            </div>

            <div className="form-group checkbox-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <input
                id="register-agree-checkbox"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />
              <label htmlFor="register-agree-checkbox" className="form-label" style={{ cursor: 'pointer', margin: 0 }}>
                I agree to the terms and conditions
              </label>
            </div>
            {errors.agreeTerms && <span id="agreeTerms-error" className="error-text" style={{ marginTop: '-8px' }}>{errors.agreeTerms}</span>}

            <button id="register-submit-btn" type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
              Register Account
            </button>
          </div>
        </form>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Already have an account? </span>
          <Link id="go-to-login-link" to="/login" style={{ color: 'var(--border-focus)', fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
        </div>
      </div>
    </div>
  );
}

// --- DASHBOARD PAGE ---
function DashboardPage() {
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    setIncomes(JSON.parse(sessionStorage.getItem('incomes') || '[]'));
    setExpenses(JSON.parse(sessionStorage.getItem('expenses') || '[]'));
    setBudgets(JSON.parse(sessionStorage.getItem('budgets') || '[]'));
  }, []);

  const totalIncome = incomes.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalExpense = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const remainingBalance = totalIncome - totalExpense;

  const triggerVulnerabilityScan = () => {
    setIsModalOpen(false);
    setToastMsg('Security Vulnerability Scan Completed Successfully');
    setTimeout(() => setToastMsg(''), 3000);
  };

  return (
    <>
      <div className="page-header">
        <h1>Financial Dashboard</h1>
        <p>Real-time asset intelligence and budget compliance metrics.</p>
      </div>

      {toastMsg && (
        <div id="toast-notification" className="toast-container">
          <div className="toast-box">
            <CheckCircle2 size={20} color="var(--accent-green)" />
            <span id="toast-msg-text" className="toast-msg">{toastMsg}</span>
            <button id="toast-close-btn" className="btn-close" onClick={() => setToastMsg('')}>✕</button>
          </div>
        </div>
      )}

      {/* Grid of stats */}
      <div className="stats-grid">
        <div className="stat-card glass-card blue">
          <span className="stat-title">Total Income</span>
          <span id="dashboard-total-income" className="stat-value">₹{totalIncome.toLocaleString()}</span>
        </div>
        <div className="stat-card glass-card purple">
          <span className="stat-title">Total Expenses</span>
          <span id="dashboard-total-expense" className="stat-value">₹{totalExpense.toLocaleString()}</span>
        </div>
        <div className="stat-card glass-card green">
          <span className="stat-title">Remaining Balance</span>
          <span id="dashboard-balance" className="stat-value">₹{remainingBalance.toLocaleString()}</span>
        </div>
      </div>

      {/* Budget list status cards */}
      <div className="table-section glass-card" style={{ marginTop: '24px' }}>
        <h3>Active Category Limits</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
          {budgets.map(b => {
            const spent = expenses.filter(e => e.category === b.category).reduce((sum, item) => sum + Number(item.amount), 0);
            const percentage = Math.min((spent / b.limit) * 100, 100);
            const isOver = spent > b.limit;

            return (
              <div key={b.id} style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 600 }}>{b.category}</span>
                  <span style={{ color: isOver ? 'var(--accent-red)' : 'var(--text-secondary)' }}>
                    ₹{spent.toLocaleString()} / ₹{b.limit.toLocaleString()}
                  </span>
                </div>
                <div style={{ height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${percentage}%`, height: '100%', background: isOver ? 'var(--accent-red)' : 'var(--accent-green)', borderRadius: '4px' }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive elements section */}
      <div className="widgets-section" style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="widget-control-card glass-card">
          <h4>Vulnerability Assessment</h4>
          <p className="stat-title">Run dynamic diagnostics on current wealth allocations.</p>
          <button id="open-modal-btn" className="btn-primary" onClick={() => setIsModalOpen(true)}>
            Open Intel Modal
          </button>
        </div>

        <div className="widget-control-card glass-card">
          <h4>System Compliance</h4>
          <p className="stat-title">Check real-time security verification status.</p>
          <div className="tooltip-wrapper" style={{ position: 'relative', display: 'inline-block' }}
            onMouseEnter={() => setIsTooltipOpen(true)} onMouseLeave={() => setIsTooltipOpen(false)}
          >
            <button id="tooltip-trigger-btn" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HelpCircle size={16} />
              Hover Verification
            </button>
            {isTooltipOpen && (
              <div id="tooltip-container" className="tooltip-box" style={{ bottom: '125%' }}>
                Compliance Engine Active: V3.12
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div id="modal-container" className="modal-container glass-card">
            <div className="modal-header">
              <h2>Smart Budget Security Diagnostics</h2>
              <button id="close-modal-btn" className="btn-close" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <p id="modal-content-text" style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Offline intelligence models are synchronized. No leaks detected in sessionStorage records.
            </p>
            <button id="run-scan-btn" className="btn-primary" onClick={triggerVulnerabilityScan}>
              Run Vulnerability Scan
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// --- INCOME PAGE ---
function IncomePage() {
  const [incomes, setIncomes] = useState([]);
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    setIncomes(JSON.parse(sessionStorage.getItem('incomes') || '[]'));
  }, []);

  const handleAddIncome = (e) => {
    e.preventDefault();
    const newErrors = {};

    const incomeMeta = appMetadata.forms.income;
    incomeMeta.fields.forEach(field => {
      let val = '';
      if (field.name === 'source') val = source;
      else if (field.name === 'amount') val = amount;
      else if (field.name === 'date') val = date;
      else if (field.name === 'category') val = category;

      if (field.validations.required && !val.toString().trim()) {
        newErrors[field.name] = field.validations.required.message;
      } else if (field.name === 'amount' && Number(val) <= 0) {
        newErrors.amount = field.validations.min.message;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSuccessMsg('');
      return;
    }

    setErrors({});
    const newIncome = {
      id: Date.now(),
      source,
      amount: Number(amount),
      date,
      category
    };

    const updated = [...incomes, newIncome];
    setIncomes(updated);
    sessionStorage.setItem('incomes', JSON.stringify(updated));

    // Clear form
    setSource('');
    setAmount('');
    setDate('');
    setCategory('');
    setSuccessMsg('Income source successfully recorded!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDelete = (id) => {
    const updated = incomes.filter(item => item.id !== id);
    setIncomes(updated);
    sessionStorage.setItem('incomes', JSON.stringify(updated));
  };

  return (
    <>
      <div className="page-header">
        <h1>Income Manager</h1>
        <p>Record and analyze incoming cashflows and interest credits.</p>
      </div>

      <div className="widgets-section" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
        {/* Form Container */}
        <div className="form-container glass-card">
          <h3>Add Income Stream</h3>
          {successMsg && (
            <div id="income-success-banner" style={{ background: 'var(--green-light)', color: 'var(--accent-green)', padding: '10px', borderRadius: '8px', marginBottom: '14px', fontWeight: 600 }}>
              {successMsg}
            </div>
          )}
          <form id="income-form" onSubmit={handleAddIncome}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="income-source-input">Income Source</label>
                <input
                  id="income-source-input"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Salary, Freelance"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                />
                {errors.source && <span id="source-error" className="error-text">{errors.source}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="income-amount-input">Amount (INR)</label>
                <input
                  id="income-amount-input"
                  type="number"
                  className="form-input"
                  placeholder="e.g. 50000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                {errors.amount && <span id="amount-error" className="error-text">{errors.amount}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="income-date-input">Date Received</label>
                <input
                  id="income-date-input"
                  type="date"
                  className="form-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                {errors.date && <span id="date-error" className="error-text">{errors.date}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="income-category-select">Category</label>
                <select
                  id="income-category-select"
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">-- Choose Category --</option>
                  <option value="Salary">Salary</option>
                  <option value="Investments">Investments</option>
                  <option value="Gifts">Gifts</option>
                  <option value="Other">Other</option>
                </select>
                {errors.category && <span id="category-error" className="error-text">{errors.category}</span>}
              </div>

              <button id="income-submit-btn" type="submit" className="btn-primary" style={{ marginTop: '8px' }}>
                Add Income
              </button>
            </div>
          </form>
        </div>

        {/* List Table */}
        <div className="table-section glass-card">
          <h3>Income Ledger</h3>
          <div className="data-table-container" style={{ marginTop: '16px' }}>
            <table className="data-table">
              <thead>
                <tr className="table-header">
                  <th>Source</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody id="income-table-body">
                {incomes.map(item => (
                  <tr key={item.id} className="table-row">
                    <td>{item.source}</td>
                    <td style={{ fontWeight: 600, color: 'var(--accent-green)' }}>₹{item.amount.toLocaleString()}</td>
                    <td>{item.date}</td>
                    <td>{item.category}</td>
                    <td>
                      <button id={`delete-income-${item.id}`} className="btn-close" style={{ color: 'var(--accent-red)', cursor: 'pointer' }} onClick={() => handleDelete(item.id)}>
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

// --- EXPENSE PAGE ---
function ExpensePage() {
  const [expenses, setExpenses] = useState([]);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    setExpenses(JSON.parse(sessionStorage.getItem('expenses') || '[]'));
  }, []);

  const handleAddExpense = (e) => {
    e.preventDefault();
    const newErrors = {};

    const expenseMeta = appMetadata.forms.expense;
    expenseMeta.fields.forEach(field => {
      let val = '';
      if (field.name === 'title') val = title;
      else if (field.name === 'amount') val = amount;
      else if (field.name === 'date') val = date;
      else if (field.name === 'category') val = category;

      if (field.validations.required && !val.toString().trim()) {
        newErrors[field.name] = field.validations.required.message;
      } else if (field.name === 'amount' && Number(val) <= 0) {
        newErrors.amount = field.validations.min.message;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSuccessMsg('');
      return;
    }

    setErrors({});
    const newExpense = {
      id: Date.now(),
      title,
      amount: Number(amount),
      date,
      category
    };

    const updated = [...expenses, newExpense];
    setExpenses(updated);
    sessionStorage.setItem('expenses', JSON.stringify(updated));

    // Clear form
    setTitle('');
    setAmount('');
    setDate('');
    setCategory('');
    setSuccessMsg('Expense transaction successfully logged!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDelete = (id) => {
    const updated = expenses.filter(item => item.id !== id);
    setExpenses(updated);
    sessionStorage.setItem('expenses', JSON.stringify(updated));
  };

  return (
    <>
      <div className="page-header">
        <h1>Expense Manager</h1>
        <p>Log outbound utility bills, rent, groceries, and services.</p>
      </div>

      <div className="widgets-section" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
        {/* Form Container */}
        <div className="form-container glass-card">
          <h3>Add Expense</h3>
          {successMsg && (
            <div id="expense-success-banner" style={{ background: 'var(--green-light)', color: 'var(--accent-green)', padding: '10px', borderRadius: '8px', marginBottom: '14px', fontWeight: 600 }}>
              {successMsg}
            </div>
          )}
          <form id="expense-form" onSubmit={handleAddExpense}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="expense-title-input">Expense Item</label>
                <input
                  id="expense-title-input"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Grocery, Rent"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                {errors.title && <span id="title-error" className="error-text">{errors.title}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="expense-amount-input">Amount (INR)</label>
                <input
                  id="expense-amount-input"
                  type="number"
                  className="form-input"
                  placeholder="e.g. 2500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                {errors.amount && <span id="amount-error" className="error-text">{errors.amount}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="expense-date-input">Date Spent</label>
                <input
                  id="expense-date-input"
                  type="date"
                  className="form-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                {errors.date && <span id="date-error" className="error-text">{errors.date}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="expense-category-select">Category</label>
                <select
                  id="expense-category-select"
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">-- Choose Category --</option>
                  <option value="Food">Food</option>
                  <option value="Housing">Housing</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Other">Other</option>
                </select>
                {errors.category && <span id="category-error" className="error-text">{errors.category}</span>}
              </div>

              <button id="expense-submit-btn" type="submit" className="btn-primary" style={{ marginTop: '8px' }}>
                Add Expense
              </button>
            </div>
          </form>
        </div>

        {/* List Table */}
        <div className="table-section glass-card">
          <h3>Expense Ledger</h3>
          <div className="data-table-container" style={{ marginTop: '16px' }}>
            <table className="data-table">
              <thead>
                <tr className="table-header">
                  <th>Item</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody id="expense-table-body">
                {expenses.map(item => (
                  <tr key={item.id} className="table-row">
                    <td>{item.title}</td>
                    <td style={{ fontWeight: 600, color: 'var(--accent-red)' }}>₹{item.amount.toLocaleString()}</td>
                    <td>{item.date}</td>
                    <td>{item.category}</td>
                    <td>
                      <button id={`delete-expense-${item.id}`} className="btn-close" style={{ color: 'var(--accent-red)', cursor: 'pointer' }} onClick={() => handleDelete(item.id)}>
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

// --- BUDGET PAGE ---
function BudgetPage() {
  const [budgets, setBudgets] = useState([]);
  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState('');
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    setBudgets(JSON.parse(sessionStorage.getItem('budgets') || '[]'));
  }, []);

  const handleAddBudget = (e) => {
    e.preventDefault();
    const newErrors = {};

    const budgetMeta = appMetadata.forms.budget;
    budgetMeta.fields.forEach(field => {
      let val = '';
      if (field.name === 'category') val = category;
      else if (field.name === 'limit') val = limit;

      if (field.validations.required && !val.toString().trim()) {
        newErrors[field.name] = field.validations.required.message;
      } else if (field.name === 'limit' && Number(val) <= 0) {
        newErrors.limit = field.validations.min.message;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSuccessMsg('');
      return;
    }

    setErrors({});
    
    // Check if category budget already exists, overwrite if so
    let updated;
    const existingIdx = budgets.findIndex(b => b.category === category);
    if (existingIdx !== -1) {
      updated = [...budgets];
      updated[existingIdx].limit = Number(limit);
    } else {
      const newBudget = {
        id: Date.now(),
        category,
        limit: Number(limit)
      };
      updated = [...budgets, newBudget];
    }
    
    setBudgets(updated);
    sessionStorage.setItem('budgets', JSON.stringify(updated));

    // Clear form
    setCategory('');
    setLimit('');
    setSuccessMsg('Budget limit successfully updated!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDelete = (id) => {
    const updated = budgets.filter(item => item.id !== id);
    setBudgets(updated);
    sessionStorage.setItem('budgets', JSON.stringify(updated));
  };

  return (
    <>
      <div className="page-header">
        <h1>Budget Allocator</h1>
        <p>Allocate maximum monthly allowances to check spending policies.</p>
      </div>

      <div className="widgets-section" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
        {/* Form Container */}
        <div className="form-container glass-card">
          <h3>Set Category Budget</h3>
          {successMsg && (
            <div id="budget-success-banner" style={{ background: 'var(--green-light)', color: 'var(--accent-green)', padding: '10px', borderRadius: '8px', marginBottom: '14px', fontWeight: 600 }}>
              {successMsg}
            </div>
          )}
          <form id="budget-form" onSubmit={handleAddBudget}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="budget-category-select">Category</label>
                <select
                  id="budget-category-select"
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">-- Choose Category --</option>
                  <option value="Food">Food</option>
                  <option value="Housing">Housing</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Other">Other</option>
                </select>
                {errors.category && <span id="category-error" className="error-text">{errors.category}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="budget-limit-input">Monthly Limit (INR)</label>
                <input
                  id="budget-limit-input"
                  type="number"
                  className="form-input"
                  placeholder="e.g. 15000"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                />
                {errors.limit && <span id="limit-error" className="error-text">{errors.limit}</span>}
              </div>

              <button id="budget-submit-btn" type="submit" className="btn-primary" style={{ marginTop: '8px' }}>
                Save Budget
              </button>
            </div>
          </form>
        </div>

        {/* List Table */}
        <div className="table-section glass-card">
          <h3>Category Allocations</h3>
          <div className="data-table-container" style={{ marginTop: '16px' }}>
            <table className="data-table">
              <thead>
                <tr className="table-header">
                  <th>Category</th>
                  <th>Monthly Limit</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody id="budget-table-body">
                {budgets.map(item => (
                  <tr key={item.id} className="table-row">
                    <td style={{ fontWeight: 600 }}>{item.category}</td>
                    <td style={{ fontWeight: 600, color: 'var(--border-focus)' }}>₹{item.limit.toLocaleString()}</td>
                    <td>
                      <button id={`delete-budget-${item.id}`} className="btn-close" style={{ color: 'var(--accent-red)', cursor: 'pointer' }} onClick={() => handleDelete(item.id)}>
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

// --- REPORTS PAGE ---
function ReportsPage() {
  const [expenses, setExpenses] = useState([]);
  const [filterCategory, setFilterCategory] = useState('');

  useEffect(() => {
    setExpenses(JSON.parse(sessionStorage.getItem('expenses') || '[]'));
  }, []);

  const categories = ["Food", "Housing", "Entertainment", "Utilities", "Other"];
  const totalSpent = expenses.reduce((sum, item) => sum + Number(item.amount), 0);

  // Group by category
  const categoryBreakdown = categories.map(cat => {
    const spent = expenses.filter(e => e.category === cat).reduce((sum, item) => sum + Number(item.amount), 0);
    const percentage = totalSpent > 0 ? ((spent / totalSpent) * 100).toFixed(1) : 0;
    return { category: cat, spent, percentage };
  });

  const filteredExpenses = filterCategory
    ? expenses.filter(e => e.category === filterCategory)
    : expenses;

  return (
    <>
      <div className="page-header">
        <h1>Financial Reports</h1>
        <p>Comprehensive wealth charts, ledger distributions, and policy metrics.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
        {/* Left Card: Summary Stats */}
        <div className="form-container glass-card" style={{ height: 'fit-content' }}>
          <h3>Category Distributions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
            {categoryBreakdown.map(item => (
              <div key={item.category} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{item.category}</span>
                <span style={{ fontWeight: 600 }}>₹{item.spent.toLocaleString()} ({item.percentage}%)</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem', marginTop: '8px' }}>
              <span>Total Spent</span>
              <span id="reports-total-spent">₹{totalSpent.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Right Table: Filtered Transactions */}
        <div className="table-section glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3>Transaction Distributions</h3>
            <select
              id="report-category-filter"
              className="form-select"
              style={{ width: '200px' }}
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">-- All Categories --</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr className="table-header">
                  <th>Item</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Category</th>
                </tr>
              </thead>
              <tbody id="report-table-body">
                {filteredExpenses.map(item => (
                  <tr key={item.id} className="table-row">
                    <td>{item.title}</td>
                    <td style={{ color: 'var(--accent-red)', fontWeight: 600 }}>₹{item.amount.toLocaleString()}</td>
                    <td>{item.date}</td>
                    <td>{item.category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

// --- PROFILE PAGE ---
function ProfilePage({ session }) {
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [themeDark, setThemeDark] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setSuccessMsg('Profile preferences successfully saved!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <>
      <div className="page-header">
        <h1>User Profile Settings</h1>
        <p>Configure wealth alerts, theme preferences, and security models.</p>
      </div>

      <div className="form-container glass-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h3>Account Preferences</h3>
        {successMsg && (
          <div id="profile-success-banner" style={{ background: 'var(--green-light)', color: 'var(--accent-green)', padding: '10px', borderRadius: '8px', marginBottom: '14px', fontWeight: 600 }}>
            {successMsg}
          </div>
        )}
        <form id="profile-form" onSubmit={handleSaveProfile}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <div className="form-group">
              <label className="form-label">Active Email</label>
              <input
                id="profile-email-display"
                type="text"
                className="form-input"
                value={session?.email || 'user@budget.com'}
                disabled
                style={{ opacity: 0.6 }}
              />
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontWeight: 600, display: 'block' }}>High Contrast Dark Mode</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Enhance UI colors for clarity</span>
              </div>
              <button
                id="profile-theme-toggle"
                type="button"
                className={`toggle ${themeDark ? 'on' : ''}`}
                onClick={() => setThemeDark(!themeDark)}
              ></button>
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontWeight: 600, display: 'block' }}>Receive Wealth Reports</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Send monthly compliance summary via email</span>
              </div>
              <button
                id="profile-reports-toggle"
                type="button"
                className={`toggle ${agreeTerms ? 'on' : ''}`}
                onClick={() => setAgreeTerms(!agreeTerms)}
              ></button>
            </div>

            <button id="profile-submit-btn" type="submit" className="btn-primary" style={{ marginTop: '8px' }}>
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
