import{useState}from'react';
import{Link}from'react-router-dom';
import{requestPasswordReset}from'../api';

export default function ForgotPassword(){
    const[email,setEmail]=useState(''),[error,setError]=useState(''),[message,setMessage]=useState(''),[sending,setSending]=useState(false);
    async function submit(event){
        event.preventDefault();setError('');setMessage('');setSending(true);
        try{const result=await requestPasswordReset(email);setMessage(result.message)}
        catch(e){setError(e.message)}finally{setSending(false)}
    }
    return <div className="login"><form onSubmit={submit}>
        <img className="auth-logo" src="/jrc-logo-horizontal.png" alt="Jim Roberts Consulting"/>
        <h1>Forgot password?</h1>
        <p>Enter your registered work email and we’ll send a password reset link if an active account exists.</p>
        {error&&<div className="error">{error}</div>}{message&&<div className="notice">{message}</div>}
        <label>Work email<input type="email" autoComplete="email" value={email} onChange={event=>setEmail(event.target.value)} required/></label>
        <button disabled={sending}>{sending?'Sending…':'Send reset link'}</button>
        <p className="auth-switch"><Link to="/login">Back to sign in</Link></p>
    </form></div>
}
