import{ useState }from'react';
import{ api }from'../api';
import{downloadFile}from'../api';
import Status from'../components/Status';

export default function Entries()
{
    const[month,setMonth]=useState(new Date().toISOString().slice(0,7)+'-01'),[employee,setEmployee]=useState(''),[rows,setRows]=useState([]),[error,setError]=useState('');
    async function load()
    {
        try
        {
            let q=`?month=${month}`;
            if(employee)q+=`&employee_id=${employee}`;
            setRows(await api('/api/entries'+q));
            setError('')
        }catch(e)
        {
            setError(e.message)
        }
    }
    async function save(r,actual)
    {
        console.log("Saving entry:", r);
        console.log("Entry ID:", r?.id);
        console.log("Actual:", actual);
        //console.log("kpi_name",name);
        try
        {
            const u = await api(`/api/entries/${r.id}`,
                {
                    method:'PATCH',
                    body:JSON.stringify({actual:Number(actual)})});
                    setRows(rows.map(x=>x.id===u.id?{...x,...u}:x))}
                    catch(e){
                        setError(e.message)
                    }
                }
                async function submit(id)
                {
                    try{
                        const u=await api(`/api/entries/${id}/submit`,
                            {
                                method:'POST'
                            });
                            setRows(rows.map(x=>x.id===u.id?{...x,...u}:x))}
                            catch(e){
                                setError(e.message)
                            }
                        }
                        async function uploadContext(r,file){if(!file)return;try{const form=new FormData();form.append('file',file);const result=await api(`/api/entries/${r.id}/context`,{method:'POST',body:form});setRows(old=>old.map(x=>x.id===r.id?{...x,...result}:x));setError('')}catch(e){setError(e.message)}}
                        async function downloadContext(r){try{await downloadFile(`/api/entries/${r.id}/context`,r.context_filename||'supporting-document')}catch(e){setError(e.message)}}
                        return <section>
                            <div className="pagehead">
                                <div>
                                    <h1>KPI Entries</h1>
                                    <p>Capture actuals and submit completed records.</p>
                                </div>
                                <div className="actions">
                                    <input type="date" value={month} onChange={e=>setMonth(e.target.value)}/>
                                    <input placeholder="Employee ID (optional)" value={employee} onChange={e=>setEmployee(e.target.value)}/>
                                    <button onClick={load}>Load</button>
                                </div>
                            </div>
                            {
                            error&&
                            <div className="error">{error}</div>}
                            <div className="panel tablewrap">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Entry ID</th>
                                            <th>Employee ID</th>
                                            <th>Employee name</th>
                                            <th>KPI ID</th>
                                            <th>Description</th>
                                            <th>Actual</th>
                                            <th>Proof document</th>
                                            <th>Score</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.map(r=><EntryRow key={r.id} r={r} save={save} submit={submit} uploadContext={uploadContext} downloadContext={downloadContext}/>)}
                                    </tbody>
                                </table>
                            </div>
                        </section>
}

function EntryRow({r,save,submit,uploadContext,downloadContext})
{
    const[actual, setV] = useState(r.actual??'');
    const editable=['Draft','Rejected'].includes(r.status);
    return <tr>
        <td>{r.id}</td>
        <td>{r.employee_id}</td>
        <td>{r.employee_name||'—'}</td>
        <td>{r.kpi_id}</td>
        <td>{r.kpi_name||'—'}</td>
        <td>
            <input className="small" type="number" step="any" disabled={!editable} value={actual} onChange={e=>setV(e.target.value)}/>
        </td>
        <td className="entry-document-cell">{r.has_context&&<button className="secondary" type="button" onClick={()=>downloadContext(r)}>Download</button>}{editable&&<label className="file-picker compact-file-picker"><span>{r.has_context?'Replace':'Attach'}</span><input type="file" accept=".pdf,.docx,.xlsx,.txt,.csv,.png,.jpg,.jpeg" onChange={e=>{uploadContext(r,e.target.files?.[0]);e.target.value=''}}/></label>}{r.has_context&&<small>{r.context_filename}</small>}</td>
        <td>{r.final_score?.toFixed(2)??'—'}</td>
        <td><Status value={r.status}/></td>
        <td>{editable&&<>
         
         <button className="secondary" onClick={() => save(r, actual)}>
                    Save
                </button>
         <button onClick={()=>submit(r.id)}>Submit</button></>}
        </td>
        </tr>
}
