import{useEffect,useState}from'react';
import{api,downloadFile}from'../api';
import Status from'../components/Status';

const currentMonth=()=>{const now=new Date();return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`};
export default function Entries(){
    const[month,setMonth]=useState(currentMonth),[employee,setEmployee]=useState(''),[rows,setRows]=useState([]),[role,setRole]=useState(''),[error,setError]=useState(''),[loading,setLoading]=useState(false);
    useEffect(()=>{api('/api/auth/me').then(user=>setRole(user.role)).catch(e=>setError(e.message))},[]);
    async function load(){setLoading(true);setError('');try{let query=`?month=${month}`;if(employee)query+=`&employee_id=${employee}`;setRows(await api(`/api/entries${query}`))}catch(e){setError(e.message)}finally{setLoading(false)}}
    useEffect(()=>{if(role)load()},[role]);
    async function saveReviewerEdits(row,actual,employeeComments){setError('');try{const updated=await api(`/api/entries/${row.id}/review-edit`,{method:'PATCH',body:JSON.stringify({actual:actual===''?null:Number(actual),employee_comments:employeeComments||null})});setRows(old=>old.map(item=>item.id===updated.id?{...item,...updated}:item));return updated}catch(e){setError(e.message);return null}}
    async function review(row,status,comments){setError('');if(status==='Rejected'&&!comments.trim()){setError('Add reviewer feedback before rejecting an entry.');return null}try{const updated=await api(`/api/entries/${row.id}/review`,{method:'PATCH',body:JSON.stringify({status,supervisor_comments:comments.trim()||null})});setRows(old=>old.map(item=>item.id===updated.id?{...item,...updated}:item));return updated}catch(e){setError(e.message);return null}}
    async function download(row){try{await downloadFile(`/api/entries/${row.id}/context`,row.context_filename||'supporting-document')}catch(e){setError(e.message)}}
    return <section>
        <div className="pagehead"><div><h1>KPI Entries</h1><p>Review employee submissions and their supporting documents.</p></div><div className="actions"><label>Month<input type="date" value={month} onChange={e=>setMonth(e.target.value)}/></label><label>Employee ID<input placeholder="All employees" value={employee} onChange={e=>setEmployee(e.target.value)}/></label><button onClick={load}>Load</button></div></div>
        {error&&<div className="error">{error}</div>}
        {role&&role!=='Admin'&&<div className="notice">Only an Admin can approve or reject submitted KPI entries.</div>}
        <div className="panel tablewrap"><table><thead><tr><th>Entry ID</th><th>Employee ID</th><th>Employee name</th><th>KPI ID</th><th>Description</th><th>Target</th><th>Actual</th><th>Employee comments</th><th>Proof document</th><th>Score</th><th>Status</th><th>Reviewer feedback</th><th>Review</th></tr></thead>
            <tbody>{loading?<tr><td colSpan="13">Loading entries…</td></tr>:rows.map(row=><ReviewRow key={row.id} row={row} isAdmin={role==='Admin'} review={review} saveReviewerEdits={saveReviewerEdits} download={download}/>)}{!loading&&!rows.length&&<tr><td colSpan="13">Load entries for a month to review submissions.</td></tr>}</tbody>
        </table></div>
    </section>
}

function ReviewRow({row,isAdmin,review,saveReviewerEdits,download}){
    const[comments,setComments]=useState(row.supervisor_comments||'');
    const[actual,setActual]=useState(row.actual??''),[employeeComments,setEmployeeComments]=useState(row.employee_comments||'');
    const[busy,setBusy]=useState(false),submitted=row.status==='Submitted';
    async function saveEdits(){setBusy(true);try{return await saveReviewerEdits(row,actual,employeeComments)}finally{setBusy(false)}}
    async function decide(status){setBusy(true);try{const edited=await saveReviewerEdits(row,actual,employeeComments);if(edited)await review({...row,...edited},status,comments)}finally{setBusy(false)}}
    return <tr>
        <td>{row.id}</td><td>{row.employee_id}</td><td>{row.employee_name||'—'}</td><td>{row.kpi_id}</td><td className="entry-description">{row.kpi_name||'—'}</td><td>{row.target??'—'}</td>
        <td>{isAdmin&&submitted?<input className="review-actual-input" type="number" step="any" value={actual} onChange={e=>setActual(e.target.value)}/>:row.actual??'—'}</td>
        <td>{isAdmin&&submitted?<textarea className="review-comment-input" rows="2" value={employeeComments} onChange={e=>setEmployeeComments(e.target.value)} placeholder="Employee comments"/>:row.employee_comments||'—'}</td>
        <td className="entry-document-cell">{row.has_context?<><button className="secondary" type="button" onClick={()=>download(row)}>Download</button><small>{row.context_filename}</small></>:'—'}</td>
        <td>{row.final_score?.toFixed(2)??'—'}</td><td><Status value={row.status}/></td>
        <td>{isAdmin&&submitted?<textarea className="review-comment-input" rows="2" value={comments} onChange={e=>setComments(e.target.value)} placeholder="Required when rejecting"/>:row.supervisor_comments||'—'}</td>
        <td>{isAdmin&&submitted?<div className="review-actions review-actions-stacked"><button className="secondary" disabled={busy} onClick={saveEdits}>Save edits</button><button disabled={busy||actual===''} onClick={()=>decide('Approved')}>{busy?'Saving…':'Approve'}</button><button className="secondary" disabled={busy||!comments.trim()} onClick={()=>decide('Rejected')}>Reject</button></div>:submitted?'Waiting for review':'—'}</td>
    </tr>
}
