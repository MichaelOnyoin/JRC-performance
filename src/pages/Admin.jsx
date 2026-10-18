import{useEffect,useState}from'react';
import{api}from'../api';

const freshMonth=()=>{const now=new Date();return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`};
export default function Admin(){
    const[month,setMonth]=useState(freshMonth),[msg,setMsg]=useState(''),[error,setError]=useState(''),[role,setRole]=useState(''),[kpis,setKpis]=useState([]),[editing,setEditing]=useState(null),[saving,setSaving]=useState(false),[loading,setLoading]=useState(true);
    useEffect(()=>{(async()=>{try{const user=await api('/api/auth/me');setRole(user.role);if(user.role==='Admin')setKpis(await api('/api/kpis'))}catch(e){setError(e.message)}finally{setLoading(false)}})()},[]);
    async function generate(){setError('');setMsg('');try{const result=await api('/api/admin/generate-month',{method:'POST',body:JSON.stringify({month})});setMsg(`${result.created} KPI entries created.`)}catch(e){setError(e.message)}}
    function beginEdit(kpi){setEditing({...kpi})}
    function change(field,value){setEditing(old=>({...old,[field]:value}))}
    async function saveKpi(){if(!editing.name.trim()||!editing.perspective.trim()||editing.perspective_weight===''||editing.kpi_weight===''||editing.target===''){setError('Complete the KPI name, perspective, both weights, and target before saving.');return}setSaving(true);setError('');setMsg('');try{const updated=await api(`/api/kpis/${editing.id}`,{method:'PATCH',body:JSON.stringify({name:editing.name.trim(),perspective:editing.perspective.trim(),perspective_weight:Number(editing.perspective_weight),kpi_weight:Number(editing.kpi_weight),target:Number(editing.target),unit_notes:editing.unit_notes?.trim()||null})});setKpis(old=>old.map(kpi=>kpi.id===updated.id?updated:kpi));setEditing(null);setMsg(`KPI ${updated.code} updated.`)}catch(e){setError(e.message)}finally{setSaving(false)}}
    return <section>
        <h1>Administration</h1><p>Generate monthly KPI records and maintain KPI definitions.</p>
        {error&&<div className="error">{error}</div>}{msg&&<div className="notice">{msg}</div>}
        <div className="panel admin-generator"><div><h2>Generate monthly entries</h2><p>Creates missing KPI records for each employee.</p></div><label>Month<input type="date" value={month} onChange={e=>setMonth(e.target.value)}/></label><button onClick={generate}>Generate monthly KPIs</button></div>
        {role==='Admin'&&<div className="panel kpi-admin-panel">
            <div className="pagehead"><div><h2>KPI definitions</h2><p>Review and edit KPI descriptions, weights, targets, and notes.</p></div><span className="kpi-count">{kpis.length} KPIs</span></div>
            {loading?<p>Loading KPI definitions…</p>:kpis.length===0?<p>No KPI definitions found.</p>:
                <div className="tablewrap kpi-table-wrap"><table className="kpi-admin-table"><thead><tr><th>KPI ID</th><th>KPI name / description</th><th>Perspective</th><th>Perspective weight</th><th>KPI weight</th><th>Target</th><th>Unit / notes</th><th>Action</th></tr></thead>
                <tbody>{kpis.map(kpi=>editing?.id===kpi.id?<tr key={kpi.id} className="kpi-edit-row">
                    <td>{kpi.code}</td><td><input aria-label="KPI name or description" value={editing.name} maxLength={500} onChange={e=>change('name',e.target.value)}/></td>
                    <td><input aria-label="Perspective" value={editing.perspective} maxLength={255} onChange={e=>change('perspective',e.target.value)}/></td>
                    <td><input aria-label="Perspective weight" type="number" min="0" step="any" value={editing.perspective_weight} onChange={e=>change('perspective_weight',e.target.value)}/></td>
                    <td><input aria-label="KPI weight" type="number" min="0" step="any" value={editing.kpi_weight} onChange={e=>change('kpi_weight',e.target.value)}/></td>
                    <td><input aria-label="Target" type="number" step="any" value={editing.target} onChange={e=>change('target',e.target.value)}/></td>
                    <td><input aria-label="Unit or notes" value={editing.unit_notes||''} maxLength={255} onChange={e=>change('unit_notes',e.target.value)}/></td>
                    <td className="kpi-actions"><button disabled={saving} onClick={saveKpi}>{saving?'Saving…':'Save'}</button><button className="secondary" disabled={saving} onClick={()=>setEditing(null)}>Cancel</button></td>
                </tr>:<tr key={kpi.id}>
                    <td>{kpi.code}</td><td className="kpi-description">{kpi.name}</td><td>{kpi.perspective}</td><td>{kpi.perspective_weight}</td><td>{kpi.kpi_weight}</td><td>{kpi.target}</td><td>{kpi.unit_notes||'—'}</td><td><button className="secondary" onClick={()=>beginEdit(kpi)}>Edit</button></td>
                </tr>)}</tbody></table></div>
            }
        </div>}
    </section>
}
