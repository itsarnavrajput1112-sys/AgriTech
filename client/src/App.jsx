import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { Sprout, LayoutDashboard, Tractor, Wheat, CloudSun, LogOut, Menu, X, Plus, Trash2, Pencil, Leaf, Droplets, MapPin, CalendarDays, Search, ShieldCheck } from 'lucide-react';
import api from './api';

const saveSession = (data) => {
  localStorage.setItem('agritech_token', data.token);
  localStorage.setItem('agritech_user', JSON.stringify(data.user));
};
const getUser = () => {
  try { return JSON.parse(localStorage.getItem('agritech_user') || 'null'); } catch { return null; }
};

function AuthPage({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  async function submit(e) {
    e.preventDefault(); setError(''); setBusy(true);
    try {
      const { data } = await api.post(`/auth/${mode}`, form);
      saveSession(data); onLogin(data.user); navigate('/');
    } catch (err) { setError(err.response?.data?.message || 'Could not connect to server. Is the backend running?'); }
    finally { setBusy(false); }
  }
  return <main className="auth-wrap">
    <section className="auth-art">
      <div className="brand brand-light"><span className="brand-icon"><Sprout size={23}/></span><span>AgriTech</span></div>
      <div className="auth-art-copy"><span className="eyebrow">SMART FARMING, BETTER FUTURES</span><h1>Grow smarter.<br/>Harvest better.</h1><p>Bring your farm records, crop plans and useful insights together in one simple workspace.</p></div>
      <div className="art-stats"><div><strong>01</strong><span>Know your farm</span></div><div><strong>02</strong><span>Track your crops</span></div><div><strong>03</strong><span>Plan with confidence</span></div></div>
      <div className="leaf-decoration"><Sprout size={190}/></div>
    </section>
    <section className="auth-form-side"><form className="auth-form" onSubmit={submit}>
      <span className="eyebrow green">{mode === 'login' ? 'WELCOME BACK' : 'START YOUR JOURNEY'}</span>
      <h2>{mode === 'login' ? 'Sign in to your farm' : 'Create your account'}</h2>
      <p className="muted">{mode === 'login' ? 'Your farm workspace is waiting for you.' : 'Set up your personal smart farming workspace.'}</p>
      {mode === 'register' && <label>Full name<input name="name" value={form.name} onChange={change} placeholder="Your name" required /></label>}
      <label>Email address<input type="email" name="email" value={form.email} onChange={change} placeholder="you@example.com" required /></label>
      <label>Password<input type="password" name="password" value={form.password} onChange={change} placeholder="At least 6 characters" minLength="6" required /></label>
      {error && <div className="alert error">{error}</div>}
      <button className="btn primary full" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'} <span>→</span></button>
      <p className="switch-auth">{mode === 'login' ? 'New to AgriTech?' : 'Already have an account?'} <button type="button" className="text-button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>{mode === 'login' ? 'Create an account' : 'Sign in'}</button></p>
      <div className="secure-note"><ShieldCheck size={16}/> Your password is securely hashed.</div>
    </form></section>
  </main>;
}

function App() {
  const [user, setUser] = useState(getUser);
  const [menuOpen, setMenuOpen] = useState(false);
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [farmForm, setFarmForm] = useState({ name: '', location: '', area: '', soilType: 'Loamy', notes: '' });
  const [cropForm, setCropForm] = useState({ name: '', variety: '', farm: '', sowingDate: '', expectedHarvest: '', status: 'Growing', notes: '' });
  const [editing, setEditing] = useState(null);
  const [weatherCity, setWeatherCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [weatherError, setWeatherError] = useState('');
  const navigate = useNavigate();

  async function loadData() {
    if (!localStorage.getItem('agritech_token')) return;
    setLoading(true); setError('');
    try {
      const [f, c] = await Promise.all([api.get('/farms'), api.get('/crops')]);
      setFarms(f.data); setCrops(c.data);
    } catch (err) { setError(err.response?.data?.message || 'Could not load records.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { if (user) loadData(); }, [user]);
  function logout() {
    localStorage.removeItem('agritech_token'); localStorage.removeItem('agritech_user');
    setUser(null); setFarms([]); setCrops([]); navigate('/login');
  }
  async function submitFarm(e) {
    e.preventDefault(); setNotice(''); setError('');
    try {
      const payload = { ...farmForm, area: Number(farmForm.area || 0) };
      if (editing?.type === 'farm') await api.put(`/farms/${editing.id}`, payload);
      else await api.post('/farms', payload);
      setFarmForm({ name: '', location: '', area: '', soilType: 'Loamy', notes: '' }); setEditing(null);
      setNotice(editing ? 'Farm updated successfully.' : 'Farm added successfully.'); await loadData();
    } catch (err) { setError(err.response?.data?.message || 'Could not save farm.'); }
  }
  async function submitCrop(e) {
    e.preventDefault(); setNotice(''); setError('');
    try {
      const payload = { ...cropForm, farm: cropForm.farm || null, sowingDate: cropForm.sowingDate || null, expectedHarvest: cropForm.expectedHarvest || null };
      if (editing?.type === 'crop') await api.put(`/crops/${editing.id}`, payload);
      else await api.post('/crops', payload);
      setCropForm({ name: '', variety: '', farm: '', sowingDate: '', expectedHarvest: '', status: 'Growing', notes: '' }); setEditing(null);
      setNotice(editing ? 'Crop updated successfully.' : 'Crop added successfully.'); await loadData();
    } catch (err) { setError(err.response?.data?.message || 'Could not save crop.'); }
  }
  async function deleteRecord(type, id) {
    if (!window.confirm(`Delete this ${type}? This cannot be undone.`)) return;
    try { await api.delete(`/${type === 'farm' ? 'farms' : 'crops'}/${id}`); setNotice(`${type === 'farm' ? 'Farm' : 'Crop'} deleted.`); await loadData(); }
    catch (err) { setError(err.response?.data?.message || 'Could not delete record.'); }
  }
  function editFarm(f) { setEditing({ type: 'farm', id: f._id }); setFarmForm({ name: f.name, location: f.location, area: String(f.area || ''), soilType: f.soilType || 'Loamy', notes: f.notes || '' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function editCrop(c) { setEditing({ type: 'crop', id: c._id }); setCropForm({ name: c.name, variety: c.variety || '', farm: c.farm?._id || '', sowingDate: c.sowingDate ? c.sowingDate.slice(0,10) : '', expectedHarvest: c.expectedHarvest ? c.expectedHarvest.slice(0,10) : '', status: c.status, notes: c.notes || '' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  async function searchWeather(e) {
    e.preventDefault(); setWeatherError(''); setWeather(null);
    try { const { data } = await api.get('/weather', { params: { city: weatherCity } }); setWeather(data); }
    catch (err) { setWeatherError(err.response?.data?.message || 'Could not retrieve weather.'); }
  }

  if (!user) return <Routes><Route path="*" element={<AuthPage onLogin={setUser}/>} /></Routes>;

  return <div className="app-shell">
    <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
      <Link to="/" className="brand"><span className="brand-icon"><Sprout size={23}/></span><span>AgriTech<span className="brand-dot">.</span></span></Link>
      <div className="side-label">WORKSPACE</div>
      <nav>
        <Link to="/" onClick={() => setMenuOpen(false)} className="nav-item"><LayoutDashboard size={18}/> Dashboard</Link>
        <a href="#farms" onClick={() => setMenuOpen(false)} className="nav-item"><Tractor size={18}/> My farms</a>
        <a href="#crops" onClick={() => setMenuOpen(false)} className="nav-item"><Wheat size={18}/> Crop tracker</a>
        <a href="#weather" onClick={() => setMenuOpen(false)} className="nav-item"><CloudSun size={18}/> Weather</a>
      </nav>
      <div className="sidebar-bottom"><div className="season-card"><span className="season-icon"><Leaf size={19}/></span><strong>Every season counts</strong><p>Small steps today can grow into a better harvest tomorrow.</p></div><div className="user-mini"><div className="avatar">{user.name?.slice(0,1).toUpperCase()}</div><div className="user-mini-info"><strong>{user.name}</strong><span>Farmer account</span></div><button className="icon-btn" title="Sign out" onClick={logout}><LogOut size={17}/></button></div></div>
    </aside>
    {menuOpen && <button aria-label="Close menu" className="mobile-overlay" onClick={() => setMenuOpen(false)} />}
    <main className="main-area">
      <header className="topbar"><button className="icon-btn menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? <X/> : <Menu/>}</button><div className="breadcrumb">Workspace <span>/</span> <strong>Dashboard</strong></div><div className="topbar-right"><span className="status-dot"/> Farm workspace <div className="avatar small">{user.name?.slice(0,1).toUpperCase()}</div></div></header>
      <div className="page-content">
        <section className="welcome-row"><div><span className="eyebrow green">TUESDAY · YOUR FARM AT A GLANCE</span><h1>Good day, {user.name?.split(' ')[0]} <span className="wave">✳</span></h1><p className="muted">A little planning today can make a big difference at harvest.</p></div><div className="date-chip"><CalendarDays size={16}/>{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div></section>
        {notice && <div className="alert success">{notice}<button onClick={() => setNotice('')}>×</button></div>}
        {error && <div className="alert error">{error}<button onClick={() => setError('')}>×</button></div>}
        <section className="hero-banner"><div className="hero-content"><span className="hero-tag"><Sprout size={14}/> YOUR SMART FARMING COMPANION</span><h2>Better insights.<br/><em>Healthier harvests.</em></h2><p>Keep your farm organised, monitor crop progress, and make informed decisions all in one place.</p><a className="btn hero-btn" href="#farms">Manage your farm <span>→</span></a></div><div className="hero-graphic"><div className="sun-disc"/><div className="hill hill-back"/><div className="hill hill-front"/><div className="plant plant-one"><Sprout size={94}/></div><div className="plant plant-two"><Sprout size={65}/></div><div className="hero-label"><span className="label-icon"><Droplets size={16}/></span><span><strong>Grow with purpose</strong><small>One season at a time</small></span></div></div></section>
        <section className="stats-grid">
          <StatCard icon={<Tractor/>} label="Total farms" value={farms.length} detail="Your registered farms" color="mint"/>
          <StatCard icon={<Wheat/>} label="Crop records" value={crops.length} detail="Crops you're tracking" color="gold"/>
          <StatCard icon={<Leaf/>} label="Growing" value={crops.filter(c => c.status === 'Growing').length} detail="Actively growing crops" color="blue"/>
          <StatCard icon={<CalendarDays/>} label="Ready to harvest" value={crops.filter(c => c.status === 'Ready to harvest').length} detail="Check these crops" color="peach"/>
        </section>
        <section className="content-grid">
          <section className="panel" id="farms"><div className="panel-heading"><div><span className="section-kicker">YOUR LAND</span><h3>{editing?.type === 'farm' ? 'Edit farm' : 'My farms'}</h3></div><span className="count-pill">{farms.length} farms</span></div>
            <form className="inline-form" onSubmit={submitFarm}>
              <div className="form-grid"><label>Farm name<input value={farmForm.name} onChange={e => setFarmForm({...farmForm, name:e.target.value})} placeholder="e.g. Green Valley" required/></label><label>Location<input value={farmForm.location} onChange={e => setFarmForm({...farmForm, location:e.target.value})} placeholder="Village, district" required/></label><label>Area (acres)<input type="number" min="0" step="0.1" value={farmForm.area} onChange={e => setFarmForm({...farmForm, area:e.target.value})} placeholder="e.g. 2.5"/></label><label>Soil type<select value={farmForm.soilType} onChange={e => setFarmForm({...farmForm, soilType:e.target.value})}><option>Loamy</option><option>Clay</option><option>Sandy</option><option>Silt</option><option>Black soil</option><option>Red soil</option><option>Other</option></select></label></div>
              <label>Notes (optional)<input value={farmForm.notes} onChange={e => setFarmForm({...farmForm, notes:e.target.value})} placeholder="Irrigation, field notes…"/></label>
              <div className="form-actions"><button className="btn primary" type="submit"><Plus size={16}/>{editing?.type === 'farm' ? 'Save changes' : 'Add farm'}</button>{editing?.type === 'farm' && <button className="btn subtle" type="button" onClick={() => {setEditing(null);setFarmForm({name:'',location:'',area:'',soilType:'Loamy',notes:''})}}>Cancel</button>}</div>
            </form>
            <div className="record-list">{loading ? <p className="empty-state">Loading farms…</p> : farms.length === 0 ? <EmptyState icon={<Tractor/>} title="Your farm story starts here" text="Add your first farm above to keep its details in one place."/> : farms.map(f => <div className="record-row" key={f._id}><div className="record-icon"><Tractor size={19}/></div><div className="record-main"><strong>{f.name}</strong><span><MapPin size={13}/>{f.location} · {f.area || 0} acres · {f.soilType}</span>{f.notes && <small>{f.notes}</small>}</div><div className="record-actions"><button className="icon-btn" title="Edit farm" onClick={() => editFarm(f)}><Pencil size={15}/></button><button className="icon-btn danger-icon" title="Delete farm" onClick={() => deleteRecord('farm',f._id)}><Trash2 size={15}/></button></div></div>)}</div>
          </section>
          <section className="panel" id="crops"><div className="panel-heading"><div><span className="section-kicker">WHAT'S IN THE FIELD</span><h3>{editing?.type === 'crop' ? 'Edit crop' : 'Crop tracker'}</h3></div><span className="count-pill">{crops.length} crops</span></div>
            <form className="inline-form" onSubmit={submitCrop}>
              <div className="form-grid"><label>Crop name<input value={cropForm.name} onChange={e => setCropForm({...cropForm,name:e.target.value})} placeholder="e.g. Soybean" required/></label><label>Variety<input value={cropForm.variety} onChange={e => setCropForm({...cropForm,variety:e.target.value})} placeholder="Optional"/></label><label>Farm<select value={cropForm.farm} onChange={e => setCropForm({...cropForm,farm:e.target.value})}><option value="">No farm selected</option>{farms.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}</select></label><label>Status<select value={cropForm.status} onChange={e => setCropForm({...cropForm,status:e.target.value})}><option>Planned</option><option>Growing</option><option>Ready to harvest</option><option>Harvested</option></select></label><label>Sowing date<input type="date" value={cropForm.sowingDate} onChange={e => setCropForm({...cropForm,sowingDate:e.target.value})}/></label><label>Expected harvest<input type="date" value={cropForm.expectedHarvest} onChange={e => setCropForm({...cropForm,expectedHarvest:e.target.value})}/></label></div>
              <label>Notes (optional)<input value={cropForm.notes} onChange={e => setCropForm({...cropForm,notes:e.target.value})} placeholder="Growth observations, pest notes…"/></label>
              <div className="form-actions"><button className="btn primary" type="submit"><Plus size={16}/>{editing?.type === 'crop' ? 'Save changes' : 'Add crop'}</button>{editing?.type === 'crop' && <button className="btn subtle" type="button" onClick={() => {setEditing(null);setCropForm({name:'',variety:'',farm:'',sowingDate:'',expectedHarvest:'',status:'Growing',notes:''})}}>Cancel</button>}</div>
            </form>
            <div className="record-list">{loading ? <p className="empty-state">Loading crops…</p> : crops.length === 0 ? <EmptyState icon={<Wheat/>} title="No crops tracked yet" text="Add a crop above to start tracking its growing stage."/> : crops.map(c => <div className="record-row" key={c._id}><div className="record-icon crop-icon"><Wheat size={19}/></div><div className="record-main"><strong>{c.name}{c.variety ? ` · ${c.variety}` : ''}</strong><span>{c.farm?.name || 'No farm linked'}{c.expectedHarvest ? ` · Harvest ${new Date(c.expectedHarvest).toLocaleDateString('en-IN')}` : ''}</span><small><span className={`status-pill ${c.status.toLowerCase().replaceAll(' ','-')}`}>{c.status}</span></small></div><div className="record-actions"><button className="icon-btn" title="Edit crop" onClick={() => editCrop(c)}><Pencil size={15}/></button><button className="icon-btn danger-icon" title="Delete crop" onClick={() => deleteRecord('crop',c._id)}><Trash2 size={15}/></button></div></div>)}</div>
          </section>
        </section>
        <section className="panel weather-panel" id="weather"><div className="panel-heading"><div><span className="section-kicker">PLAN AROUND THE WEATHER</span><h3>Weather lookup</h3><p className="muted small-copy">Check current conditions for a city. Requires an OpenWeather API key.</p></div><div className="weather-icon"><CloudSun size={27}/></div></div><form className="weather-search" onSubmit={searchWeather}><div className="search-input"><Search size={17}/><input value={weatherCity} onChange={e => setWeatherCity(e.target.value)} placeholder="Enter city, e.g. Bhopal" required/></div><button className="btn primary">Check weather <span>→</span></button></form>{weatherError && <div className="alert error">{weatherError}</div>}{weather && <div className="weather-result"><div><span className="muted">{weather.city}{weather.country ? `, ${weather.country}` : ''}</span><h2>{Math.round(weather.temperature)}°C</h2><span className="capitalize">{weather.description}</span></div><div className="weather-metric"><Droplets/><span>Humidity</span><strong>{weather.humidity}%</strong></div><div className="weather-metric"><CloudSun/><span>Feels like</span><strong>{Math.round(weather.feelsLike)}°C</strong></div><div className="weather-metric"><Sprout/><span>Wind speed</span><strong>{weather.windSpeed} m/s</strong></div></div>}</section>
        <footer className="footer"><span>© {new Date().getFullYear()} AgriTech</span><span>Made for a more connected farming future <Sprout size={14}/></span></footer>
      </div>
    </main>
  </div>;
}

function StatCard({ icon, label, value, detail, color }) {
  return <article className="stat-card"><div className={`stat-icon ${color}`}>{icon}</div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-detail">{detail}</div></article>;
}
function EmptyState({ icon, title, text }) {
  return <div className="empty-state"><div className="empty-icon">{icon}</div><strong>{title}</strong><p>{text}</p></div>;
}
export default App;
