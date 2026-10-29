import{useEffect,useState}from'react';
import{api}from'../api';

const teamOptions=[
    {label:'HLB Jim Roberts',value:'HLB JIM ROBERTS'},
    {label:'Jim Roberts Consulting',value:'JIM ROBERTS CONSULTING'}
];
const serviceLineOptions=['Unassigned','Internal Audit','External Audit'];

export default function Employees(){
    const[rows,setRows]=useState([]),[reviewers,setReviewers]=useState([]),[form,setForm]=useState({name:'',email:'',team:'',service_line:'',reviewer:''}),[error,setError]=useState(''),[message,setMessage]=useState(''),[loadingReviewers,setLoadingReviewers]=useState(true),[isAdmin,setIsAdmin]=useState(false),[deletingEmployee,setDeletingEmployee]=useState(null);
    const load=async()=>api('/api/employees').then(setRows).catch(e=>setError(e.message));
    useEffect(()=>{
        load();
        api('/api/auth/me').then(user=>setIsAdmin(user.role==='Admin')).catch(e=>setError(e.message));
        api('/api/reviewers').then(setReviewers).catch(e=>setError(e.message)).finally(()=>setLoadingReviewers(false));
    },[]);
    async function add(e){
        e.preventDefault();setError('');setMessage('');
        try{
            await api('/api/employees',{method:'POST',body:JSON.stringify({...form,email:form.email||null,reviewer:form.reviewer||null})});
            setForm({name:'',email:'',team:'',service_line:'',reviewer:''});
            setMessage('Employee added.');
            await load();
        }catch(e){setError(e.message)}
    }
    async function removeEmployee(employee){
        if(!window.confirm(`Remove ${employee.name} from active employees? Their login will be removed, but all KPI assignments, entries, scores and proof documents will be preserved in the database.`))return;
        setDeletingEmployee(employee.id);setError('');setMessage('');
        try{await api(`/api/admin/employees/${employee.id}`,{method:'DELETE'});setRows(old=>old.filter(item=>item.id!==employee.id));setMessage(`${employee.name} was archived. Their KPI data remains unchanged.`)}
        catch(e){setError(e.message)}finally{setDeletingEmployee(null)}
    }
    return <section>
        <h1>Employees</h1>
        <p>Firm-wide employee master data.</p>
        {error&&<div className="error">{error}</div>}{message&&<div className="notice">{message}</div>}
        <form className="panel formgrid" onSubmit={add}>
            <label>Name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>
            <label>Email<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label>
            <label>Team<select required value={form.team} onChange={e=>setForm({...form,team:e.target.value})}><option value="">Select team</option>{teamOptions.map(team=><option key={team.value} value={team.value}>{team.label}</option>)}</select></label>
            <label>Service line<select required value={form.service_line} onChange={e=>setForm({...form,service_line:e.target.value})}><option value="">Select service line</option>{serviceLineOptions.map(option=><option key={option} value={option}>{option}</option>)}</select></label>
            <label>Reviewer<select disabled={loadingReviewers} value={form.reviewer} onChange={e=>setForm({...form,reviewer:e.target.value})}><option value="">{loadingReviewers?'Loading reviewers…':'Select reviewer (optional)'}</option>{reviewers.map(person=><option key={person.id} value={person.full_name}>{person.full_name} ({person.role})</option>)}</select></label>
            <button type="submit">Add employee</button>
        </form>
        <div className="panel tablewrap">
            <table>
                <thead><tr><th>Name</th><th>Email</th><th>Company</th><th>Service line</th><th>Reviewer</th>{isAdmin&&<th>Action</th>}</tr></thead>
                <tbody>{rows.map(x=><tr key={x.id}><td>{x.name}</td><td>{x.email||'—'}</td><td>{x.team}</td><td>{x.service_line}</td><td>{x.reviewer||'—'}</td>{isAdmin&&<td><button className="icon-delete" type="button" aria-label={`Archive employee ${x.name}`} title={deletingEmployee===x.id?'Archiving employee…':'Archive employee'} disabled={deletingEmployee===x.id} onClick={()=>removeEmployee(x)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6m4-6v6M5 7l1 13h12l1-13M9 7V4h6v3"/></svg></button></td>}</tr>)}</tbody>
            </table>
        </div>
    </section>
}
