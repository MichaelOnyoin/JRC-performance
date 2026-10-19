import {useEffect, useState} from 'react';
import {api}from'../api';
import {BarChart,Bar,LineChart,Line,XAxis,YAxis,Tooltip,ResponsiveContainer,CartesianGrid} from 'recharts';
const canonicalTeam=team=>{
    const normalized=String(team||'').trim().toLowerCase().replace(/\s+/g,' ');
    if(normalized==='hlb jim roberts')return 'HLB Jim Roberts';
    if(normalized==='jim roberts consulting')return 'Jim Roberts Consulting';
    return String(team||'Unassigned').trim()||'Unassigned';
};
export default function Dashboard(){
    const[month,setMonth]=useState(new Date().toISOString().slice(0,7)+'-01'),[data,setData]=useState(null),[employees,setEmployees]=useState([]),[employeeId,setEmployeeId]=useState(''),[trend,setTrend]=useState(null),[error,setError]=useState(''),[teamFilter,setTeamFilter]=useState('All');
    const scoreEmployees=data?.employees.filter(employee=>teamFilter==='All'||canonicalTeam(employee.team)===teamFilter)||[];
    useEffect(()=>
    {
        api('/api/employees').then(result=>
        {
            setEmployees(result);
            if(result.length)setEmployeeId(String(result[0].id));
        }).catch(e=>setError(e.message));
    },[]);
    useEffect(()=>
    {
        if(!employeeId){setTrend(null);return;}
        let active=true;
        api(`/api/dashboard/employee-trend?employee_id=${employeeId}&year=${month.slice(0,4)}`).then(result=>
        {
            if(active)setTrend(result);
        }).catch(e=>
        {
            if(active)setError(e.message);
        });
        return()=>{active=false};
    },[employeeId,month]);
    async function load()
    {
        try
        {
            setData(await api(`/api/dashboard?month=${month}`));
            setError('')}
            catch(e)
            {
                setError(e.message)
            }
        }
        return <section>
            <div className="pagehead"><div><h1>Partner Dashboard</h1><p>Team and employee performance for the selected month.</p></div>
            <div className="actions"><input type="date" value={month} onChange={e=>setMonth(e.target.value)}/>
             <button onClick={load}>Load dashboard</button>
            </div>
            </div>
            {error&&
            <div className="error">{error}</div>}
            {data&&<>
            <div className="cards">
                <div>
                    <b>{data.teams.length}</b>
                    <span>Teams</span>
                </div>
                <div>
                 <b>{data.employees.length}</b>
                 <span>Employees</span>
                </div>
                <div>
                 <b>{data.month}</b>
                 <span>Reporting month</span>
                </div>
            </div>
            <div className="panel">
                <div className="pagehead chart-heading"><h2>Employee monthly scores</h2><label>Team<select value={teamFilter} onChange={e=>setTeamFilter(e.target.value)}><option>All</option><option>HLB Jim Roberts</option><option>Jim Roberts Consulting</option></select></label></div>
                {scoreEmployees.length===0?<p>No employee scores for this team in the selected month.</p>:
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={scoreEmployees}><CartesianGrid strokeDasharray="3 3"/>
                    <XAxis dataKey="employee"/><YAxis/><Tooltip/>
                    <Bar dataKey="sum_actual" fill="#003b70"/></BarChart>
                </ResponsiveContainer>}
            </div>
            <div className="panel">
                <h2>Employee actual trend</h2>
                <div className="actions">
                    <label>Employee
                        <select value={employeeId} onChange={e=>setEmployeeId(e.target.value)}>
                            {employees.map(employee=><option key={employee.id} value={employee.id}>{employee.name} (ID {employee.id})</option>)}
                        </select>
                    </label>
                </div>
                {trend&&<ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trend.points}><CartesianGrid strokeDasharray="3 3"/>
                    <XAxis dataKey="month" tickFormatter={value=>new Date(`${value}T00:00:00`).toLocaleString(undefined,{month:'short'})}/><YAxis/><Tooltip labelFormatter={value=>new Date(`${value}T00:00:00`).toLocaleString(undefined,{month:'long',year:'numeric'})} formatter={value=>[value,'Actual sum']}/>
                    <Line type="linear" dataKey="sum_actual" stroke="#003b70" strokeWidth={3} dot={{r:4}}/></LineChart>
                </ResponsiveContainer>}
            </div>
            <div className="panel">
                <h2>Employee ranking</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Team</th>
                            <th>Total score</th>
                            <th>% score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...data.employees].sort((a,b)=>b.total_score-a.total_score).map(x=>
                        <tr key={x.employee_id}>
                            <td>{x.employee}</td>
                            <td>{x.team}</td>
                            <td>{x.total_score.toFixed(3)}</td>
                            <td>{x.sum_actual.toFixed(1)} %</td>
                        </tr>
                        )}
                    </tbody>
                </table>
            </div></>}
        </section>}
