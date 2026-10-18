import{NavLink,Outlet,useNavigate}from'react-router-dom';
import{useEffect,useState}from'react';
import{api}from'../api';

export default function Layout()
{
    const nav=useNavigate();
    const[user,setUser]=useState(null);
    useEffect(()=>{api('/api/auth/me').then(setUser).catch(()=>{});},[]);
    return <>
    <header><div className="brand">HLB <span>JIM ROBERTS</span></div>
    <button className="ghost" onClick={()=>{localStorage.clear();nav('/login')}}>Sign out</button>
    </header>
    <div className="shell"><aside>
        {user?.role==='Employee'?<><NavLink to="/profile">My Profile</NavLink><NavLink to="/my-kpis">My KPI actuals</NavLink></>:<NavLink to="/dashboard">Partner Dashboard</NavLink>}
        {user?.role!=='Employee'&&<>
        <NavLink to="/entries">KPI Entries</NavLink>
        <NavLink to="/employees">Employees</NavLink>
        {(user?.role==='Admin'||user?.role==='Partner')&&<NavLink to="/admin">Administration</NavLink>}
        </>}
        </aside>
        <main>
            <Outlet/></main>
    </div>
    </>
}
