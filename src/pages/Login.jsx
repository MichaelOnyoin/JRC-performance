import{useState}from'react';
import{useNavigate}from'react-router-dom';
import{login}from'../api';

export default function Login()
{
    const[email,setEmail]=useState(''),
    [password,setPassword]=useState(''),
    [error,setError]=useState(''),
    nav=useNavigate();
    async function submit(e)
    {
        e.preventDefault();
        try
        {
            const x=await login(email,password);
            localStorage.setItem('token',x.access_token);
            const me=await (await fetch(`${import.meta.env.VITE_API_URL||'http://127.0.0.1:8000'}/api/auth/me`,{headers:{Authorization:`Bearer ${x.access_token}`} })).json();
            nav(me.role==='Employee'?'/profile':'/dashboard')
        }catch(e){
            setError(e.message)
        }
    }return <div className="login">
        <form onSubmit={submit}>
            <img className="auth-logo" src="/hlb-jim-roberts.png" alt="HLB Jim Roberts Advisory and Accounting"/>
            <h1>Performance Hub</h1>
            <p>Sign in to manage firm-wide performance.</p>
            {error&&<div className="error">{error}
                </div>
            }
            <label>Email<input value={email} onChange={e=>setEmail(e.target.value)} type="email" required/></label>
            <label>Password<input value={password} onChange={e=>setPassword(e.target.value)} type="password" required/></label>
            <button>Sign in</button>
            <p className="auth-switch">New employee? <a href="/signup">Create an account</a></p>
        </form>
        </div>
    }
