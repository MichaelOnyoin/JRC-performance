import{useState}from'react';
import{api}from'../api';

export default function ImportEntries({month,employeeId,onImported}){
    const[file,setFile]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[result,setResult]=useState(null);
    async function importWorkbook(){
        if(!file)return;
        setBusy(true);setError('');setResult(null);
        try{
            const form=new FormData();form.append('file',file);form.append('month',month);
            if(employeeId)form.append('employee_id',employeeId);
            const summary=await api('/api/entries/import-excel',{method:'POST',body:form});
            setResult(summary);setFile(null);await onImported?.();
        }catch(e){setError(e.message)}finally{setBusy(false)}
    }
    return <div className="panel excel-import-panel">
        <div><h2>Import past KPI actuals</h2><p>Upload a performance compact or KPI table with KPI name or ID, Actual, and optional Comments. The selected month will be used.</p></div>
        <div className="excel-import-controls"><label>Excel workbook<input type="file" accept=".xlsx" disabled={busy||!employeeId&&employeeId!==undefined} onChange={e=>setFile(e.target.files?.[0]||null)}/></label><button disabled={!file||busy||!employeeId&&employeeId!==undefined} onClick={importWorkbook}>{busy?'Importing…':'Import actuals'}</button></div>
        {!employeeId&&employeeId!==undefined&&<p className="import-hint">Select an employee before importing.</p>}
        {error&&<div className="error">{error}</div>}
        {result&&<div className="import-result"><b>{result.imported} KPI actual{result.imported===1?'':'s'} imported for {result.employee_name}.</b><span>{result.created_entries} monthly entries created; {result.protected} submitted or approved entries left unchanged.</span>{result.issues?.length>0&&<ul>{result.issues.map((issue,index)=><li key={index}>{issue.kpi||`Workbook row ${issue.row}`}: {issue.reason}</li>)}</ul>}</div>}
        <p className="import-hint">New entries start as Draft. Existing Draft and Rejected entries can be updated; Submitted and Approved entries stay unchanged. Excel targets and scores are ignored, and scores are recalculated from the assigned target and shared KPI weights. Maximum file size: 10 MB.</p>
    </div>
}
