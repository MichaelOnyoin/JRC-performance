import{NavLink,Outlet,useNavigate}from'react-router-dom';
import{useEffect,useState}from'react';
import{api}from'../api';

const navIcons={
    profile:<><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.7-3.2 3.1-5 7-5s6.3 1.8 7 5"/></>,
    kpis:<><path d="M5 4h14v16H5z"/><path d="M8 8h8M8 12h8M8 16h5"/></>,
    dashboard:<><path d="M4 19V5M4 19h16"/><path d="m7 15 4-4 3 2 5-6"/></>,
    entries:<><path d="M5 4h14v16H5z"/><path d="M8 8h8M8 12h8M8 16h4"/></>,
    employees:<><circle cx="9" cy="8" r="3"/><path d="M3 20c.4-3.1 2.4-5 6-5s5.6 1.9 6 5M16 5.5a3 3 0 0 1 0 5.8M17 15c2.3.7 3.6 2.3 4 5"/></>,
    admin:<><path d="M12 3 19 6v5c0 4.8-2.7 8-7 10-4.3-2-7-5.2-7-10V6z"/><path d="m9 12 2 2 4-4"/></>
};

function SideLink({to,icon,children,onClick}){
    return <NavLink to={to} onClick={onClick} title={children}>
        <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">{navIcons[icon]}</svg>
        <span>{children}</span>
    </NavLink>;
}

export default function Layout(){
    const nav=useNavigate();
    const[user,setUser]=useState(null);
    const[collapsed,setCollapsed]=useState(()=>localStorage.getItem('hlb-sidebar-collapsed')==='true');
    const[mobileOpen,setMobileOpen]=useState(false);
    useEffect(()=>{api('/api/auth/me').then(setUser).catch(()=>{});},[]);
    useEffect(()=>{localStorage.setItem('hlb-sidebar-collapsed',String(collapsed));},[collapsed]);
    function toggleSidebar(){
        if(window.matchMedia('(max-width: 820px)').matches)setMobileOpen(open=>!open);
        else setCollapsed(value=>!value);
    }
    function closeMobile(){setMobileOpen(false)}
    return <>
        <header className="app-header">
            <button className="nav-toggle" onClick={toggleSidebar} aria-label={mobileOpen?'Close navigation':'Toggle navigation'} aria-expanded={window.matchMedia('(max-width: 820px)').matches?mobileOpen:!collapsed} title="Toggle navigation">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
            <img className="brand-logo" src="/hlb-jim-roberts.png" alt="HLB Jim Roberts Advisory and Accounting"/>
            <div className="header-spacer"/>
            {user?.full_name&&<span className="header-user">{user.full_name}</span>}
            <button className="signout-button" onClick={()=>{localStorage.clear();nav('/login')}}>Sign out</button>
        </header>
        <div className={`shell${collapsed?' sidebar-collapsed':''}${mobileOpen?' mobile-nav-open':''}`}>
            <aside aria-label="Main navigation">
                {user?.role==='Employee'?<>
                    <SideLink to="/profile" icon="profile" onClick={closeMobile}>My Profile</SideLink>
                    <SideLink to="/my-kpis" icon="kpis" onClick={closeMobile}>My KPI actuals</SideLink>
                </>:<SideLink to="/dashboard" icon="dashboard" onClick={closeMobile}>Partner Dashboard</SideLink>}
                {user?.role!=='Employee'&&<>
                    <SideLink to="/entries" icon="entries" onClick={closeMobile}>KPI Entries</SideLink>
                    <SideLink to="/employees" icon="employees" onClick={closeMobile}>Employees</SideLink>
                    {(user?.role==='Admin'||user?.role==='Partner')&&<SideLink to="/admin" icon="admin" onClick={closeMobile}>Administration</SideLink>}
                </>}
            </aside>
            {mobileOpen&&<button className="sidebar-backdrop" aria-label="Close navigation" onClick={closeMobile}/>}
            <main><Outlet/></main>
        </div>
    </>;
}
