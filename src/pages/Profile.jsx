import{useEffect,useState}from'react';
import{api}from'../api';
import{CartesianGrid,Line,LineChart,ResponsiveContainer,Tooltip,XAxis,YAxis}from'recharts';

const number=value=>Number(value||0).toLocaleString(undefined,{maximumFractionDigits:2});
export default function Profile(){
    const[data,setData]=useState(null),[error,setError]=useState('');
    useEffect(()=>{api('/api/profile').then(setData).catch(e=>setError(e.message))},[]);
    return <section>
        <div className="pagehead"><div><h1>My performance</h1><p>Your personal KPI results over time.</p></div></div>
        {error&&<div className="error">{error}</div>}
        {data&&<>
            <div className="profile-intro"><div><h2>{data.employee.name}</h2><p>{data.employee.team} · {data.employee.service_line}</p></div><span>{data.employee.email}</span></div>
            <div className="cards profile-cards">
                <div><b>{number(data.total_score)}</b><span>Total score</span></div>
                <div><b>{number(data.actual_sum)}</b><span>Actual sum</span></div>
                <div><b>{data.points.length}</b><span>Months with recorded performance</span></div>
            </div>
            <div className="panel"><h2>Performance by month</h2>
                {data.points.length?<ResponsiveContainer width="100%" height={340}>
                    <LineChart data={data.points} margin={{top:12,right:20,left:8,bottom:8}}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#dce5ee"/>
                        <XAxis dataKey="month" tickFormatter={value=>new Date(`${value}T00:00:00`).toLocaleDateString(undefined,{month:'short',year:'2-digit'})}/>
                        <YAxis yAxisId="score" stroke="#003b70"/><YAxis yAxisId="actual" orientation="right" stroke="#d71920"/>
                        <Tooltip labelFormatter={value=>new Date(`${value}T00:00:00`).toLocaleDateString(undefined,{month:'long',year:'numeric'})} formatter={(value,name)=>[number(value),name==='total_score'?'Total score':'Score']}/>
                        <Line yAxisId="score" type="monotone" dataKey="total_score" name="Total score" stroke="#003b70" strokeWidth={3} dot={{r:4}} connectNulls/>
                        {/* <Line yAxisId="actual" type="monotone" dataKey="actual_sum" name="Actual sum" stroke="#d71920" strokeWidth={3} dot={{r:4}} connectNulls/> */}
                    </LineChart>
                </ResponsiveContainer>:<p>No performance has been recorded for your account yet.</p>}
            </div>
        </>}
    </section>
}
