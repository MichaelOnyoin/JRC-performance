import{ useState } from 'react';
import{ useNavigate } from 'react-router-dom';
import{ signup } from '../api';

export default function Signup(){
    const[fullName,setFullName]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[error,setError]=useState(''),nav=useNavigate();
    async function submit(e){e.preventDefault();setError('');try{const result=await signup(fullName,email,password);localStorage.setItem('token',result.access_token);nav('/profile')}catch(err){setError(err.message)}}
    return <div className="login"><form onSubmit={submit}>
        <img className="auth-logo" src="/jrc-logo-horizontal.png" alt="Jim Roberts Consulting"/><h1>Employee sign up</h1>
        <p>Use the work email linked to your employee record.</p>
        {error&&<div className="error">{error}</div>}
        <label>Full name<input value={fullName} onChange={e=>setFullName(e.target.value)} autoComplete="name" required maxLength={255}/></label>
        <label>Work email<input value={email} onChange={e=>setEmail(e.target.value)} type="email" autoComplete="email" required/></label>
        <label>Password<input value={password} onChange={e=>setPassword(e.target.value)} type="password" autoComplete="new-password" minLength={8} required/></label>
        <button>Create account</button><p className="auth-switch">Already registered? <a href="/login">Sign in</a></p>
    </form></div>
}
