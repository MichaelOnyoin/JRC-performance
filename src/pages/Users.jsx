import{useEffect,useState}from'react';
import{api}from'../api';

const roleOptions=['Admin','Partner','Employee'];

export default function Users(){
    const[users,setUsers]=useState([]),[currentUserId,setCurrentUserId]=useState(null),[draftRoles,setDraftRoles]=useState({}),[savingUser,setSavingUser]=useState(null),[deletingUser,setDeletingUser]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState(''),[message,setMessage]=useState(''),[isAdmin,setIsAdmin]=useState(false);
    useEffect(()=>{
        (async()=>{
            try{
                const current=await api('/api/auth/me');
                setCurrentUserId(current.id);
                setIsAdmin(current.role==='Admin');
                if(current.role!=='Admin')return;
                setUsers(await api('/api/admin/users'));
            }catch(e){setError(e.message)}finally{setLoading(false)}
        })();
    },[]);
    async function saveRole(user){
        const role=draftRoles[user.id];if(!role||role===user.role)return;
        setSavingUser(user.id);setError('');setMessage('');
        try{
            const updated=await api(`/api/admin/users/${user.id}/role`,{method:'PATCH',body:JSON.stringify({role})});
            setUsers(old=>old.map(item=>item.id===updated.id?updated:item));
            setDraftRoles(old=>{const next={...old};delete next[user.id];return next});
            setMessage(`${updated.full_name}'s role is now ${updated.role}.`);
        }catch(e){setError(e.message)}finally{setSavingUser(null)}
    }
    async function removeUser(user){
        if(!window.confirm(`Delete the login account for ${user.full_name} (${user.email})? This does not delete their employee record or KPI history.`))return;
        setDeletingUser(user.id);setError('');setMessage('');
        try{await api(`/api/admin/users/${user.id}`,{method:'DELETE'});setUsers(old=>old.filter(item=>item.id!==user.id));setMessage(`${user.full_name}'s user account was deleted.`)}
        catch(e){setError(e.message)}finally{setDeletingUser(null)}
    }
    return <section>
        <div className="pagehead"><div><h1>Users</h1><p>View user accounts and manage their application roles.</p></div><span className="kpi-count">{users.length} accounts</span></div>
        {error&&<div className="error">{error}</div>}{message&&<div className="notice">{message}</div>}
        {!isAdmin&&!loading?<div className="panel empty-state"><h2>Admin access required</h2><p>Only an Admin can view and update user roles.</p></div>:<div className="panel tablewrap users-table-wrap">
            <table className="users-table"><thead><tr><th>ID</th><th>Email</th><th>Full name</th><th>Company</th><th>Role</th><th>Action</th></tr></thead>
                <tbody>
                    {loading?<tr><td colSpan="6">Loading users…</td></tr>:
                    users.map(user=>{
                    const draft=draftRoles[user.id]??user.role,
                    isCurrent=user.id===currentUserId,
                    disabled=!user.is_active||isCurrent||savingUser===user.id;
                    return <tr key={user.id}>
                        <td>{user.id}</td><td>{user.email}</td><td>{user.full_name}{isCurrent&&<small className="user-self-label">Current account</small>}</td><td>{user.company||'—'}</td>
                        <td><div className="user-role-control"><span className={`role-badge role-${user.role.toLowerCase()}`}>{user.role}</span><select aria-label={`Role for ${user.full_name}`} value={draft} disabled={disabled||deletingUser===user.id} onChange={e=>setDraftRoles(old=>({...old,[user.id]:e.target.value}))}>
                            {!roleOptions.includes(user.role)&&<option value={user.role}>{user.role} (legacy)</option>}
                            {roleOptions.map(option=><option key={option} value={option}>{option}</option>)}
                        </select><button disabled={disabled||deletingUser===user.id||!draftRoles[user.id]||draftRoles[user.id]===user.role} onClick={()=>saveRole(user)}>{savingUser===user.id?'Saving…':'Save'}</button></div></td>
                        <td><button className="icon-delete" type="button" aria-label={`Delete user ${user.full_name}`} title={deletingUser===user.id?'Deleting user…':'Delete user'} disabled={isCurrent||savingUser===user.id||deletingUser===user.id} onClick={()=>removeUser(user)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6m4-6v6M5 7l1 13h12l1-13M9 7V4h6v3"/></svg></button></td>
                    </tr>;
                })}{!loading&&users.length===0&&<tr><td colSpan="6">No user accounts found. Employee accounts appear here after signup.</td></tr>}</tbody>
            </table>
        </div>}
        {isAdmin&&<p className="user-role-note">Your own role is locked here, and at least one active Admin must remain in the system.</p>}
    </section>;
}
