const BASE= import.meta.env.VITE_API_URL||"http://127.0.0.1:8000";
console.log(BASE);
export async function api(path, options={})
{
    const token=localStorage.getItem('token');
    const headers={
                  ...(options.body instanceof FormData?{}
                    :{'Content-Type':'application/json'}),...(token?{Authorization:`Bearer ${token}`}
                    :{ }),...options.headers};
    const res= await fetch(`${BASE}${path}`,{...options,headers});
    if(res.status===401){localStorage.clear();location.href='/login';}
    if(!res.ok)
        {
            let detail='Request failed';
            try{
                detail=(await res.json()).detail||detail
            }
            catch{}
            throw new Error(detail)}return res.status===204?null:res.json()}
export async function login(email,password)
{
    const body=new URLSearchParams({username:email,password});
    const res=await fetch(
        `${BASE}/api/auth/token`,
        {
            method:'POST',
            headers:{'Content-Type':'application/x-www-form-urlencoded'},
            body
        }
    );
    if(!res.ok)throw new Error('Incorrect email or password');
    return res.json()
}
export async function signup(full_name,email,password)
{
    const res=await fetch(`${BASE}/api/auth/signup`,{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({full_name,email,password})
    });
    if(!res.ok){let detail='Could not create account';try{detail=(await res.json()).detail||detail}catch{}throw new Error(detail)}
    return res.json()
}
export async function requestPasswordReset(email)
{
    return api('/api/auth/forgot-password',{method:'POST',body:JSON.stringify({email})})
}
export async function resetPassword(token,new_password)
{
    return api('/api/auth/reset-password',{method:'POST',body:JSON.stringify({token,new_password})})
}
export async function downloadFile(path,filename='supporting-document')
{
    const token=localStorage.getItem('token');
    const res=await fetch(`${BASE}${path}`,{headers:token?{Authorization:`Bearer ${token}`}:{}});
    if(res.status===401){localStorage.clear();location.href='/login';throw new Error('Please sign in again')}
    if(!res.ok){let detail='Could not download document';try{detail=(await res.json()).detail||detail}catch{}throw new Error(detail)}
    const blob=await res.blob(),url=URL.createObjectURL(blob),link=document.createElement('a');
    link.href=url;link.download=filename;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
