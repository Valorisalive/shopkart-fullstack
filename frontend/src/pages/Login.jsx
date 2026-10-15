import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api, { errorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";
export default function Login() {
 const [form,setForm] = useState({email:"",password:""}); const [busy,setBusy]=useState(false); const [error,setError]=useState("");
 const {setCustomer,refreshCustomer}=useAuth(); const navigate=useNavigate(); const location=useLocation();
 function change(e){setForm({...form,[e.target.name]:e.target.value});}
 async function submit(e){e.preventDefault();setError("");setBusy(true);try{const {data}=await api.post("/customers/login",form);setCustomer(data.customer);await refreshCustomer();navigate(location.state?.from || "/home",{replace:true});}catch(err){setError(err.response?.status===401?"Invalid Credentials":errorMessage(err,"Unable to log in"));}finally{setBusy(false);}}
 return <main className="auth-layout"><div className="auth-aside"><p className="eyebrow">WELCOME BACK</p><h1>Your good<br/><em>things await.</em></h1><p>Pick up where you left off. Your saved finds are right where you left them.</p></div><section className="auth-card"><p className="eyebrow">YOUR ACCOUNT</p><h2>Log in</h2><p className="muted">Good to have you here again.</p><form onSubmit={submit} className="form-stack"><label>Email address<input type="email" name="email" autoComplete="email" value={form.email} onChange={change} required /></label><label>Password<input type="password" name="password" autoComplete="current-password" value={form.password} onChange={change} required /></label>{error&&<p className="error-box">{error}</p>}<button className="button button-large" disabled={busy}>{busy?"Logging in…":"Log in →"}</button></form><p className="auth-switch">New to ShopKart? <Link to="/register">Create an account</Link></p></section></main>;
}
