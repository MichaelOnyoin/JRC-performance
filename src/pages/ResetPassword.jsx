import{useState}from'react';
import{Link,useSearchParams}from'react-router-dom';
import{resetPassword}from'../api';

export default function ResetPassword(){
    const[params]=useSearchParams(),token=params.get('token')||'', [password,setPassword]=useState(''),[confirmPassword,setConfirmPassword]=useState(''),[error,setError]=useState(''),[message,setMessage]=useState(''),[saving,setSaving]=useState(false);
    async function submit(event){
        event.preventDefault();setError('');setMessage('');
        if(password!==confirmPassword){setError('The passwords do not match.');return}
        setSaving(true);
        try{const result=await resetPassword(token,password);setMessage(result.message)}
        catch(e){setError(e.message)}finally{setSaving(false)}
    }
    return <div className="login"><form onSubmit={submit}>
        <img className="auth-logo" src="/hlb-jim-roberts.png" alt="HLB Jim Roberts Advisory and Accounting"/>
        <h1>Set a new password</h1>
        {!token?<div className="error">This reset link is missing its token. Request a new link below.</div>:<>
            <p>Choose a new password with at least 8 characters.</p>
            {error&&<div className="error">{error}</div>}{message&&<div className="notice">{message}</div>}
            {!message&&<>
                <label>New password<input type="password" autoComplete="new-password" minLength={8} value={password} onChange={event=>setPassword(event.target.value)} required/></label>
                <label>Confirm new password<input type="password" autoComplete="new-password" minLength={8} value={confirmPassword} onChange={event=>setConfirmPassword(event.target.value)} required/></label>
                <button disabled={saving}>{saving?'Saving…':'Reset password'}</button>
            </>}
        </>}
        <p className="auth-switch"><Link to="/forgot-password">Request another reset link</Link> · <Link to="/login">Sign in</Link></p>
    </form></div>
}
