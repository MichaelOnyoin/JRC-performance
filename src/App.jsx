import{Routes,Route,Navigate}from'react-router-dom';
import Layout from'./components/Layout';
import Login from'./pages/Login';
import Dashboard from'./pages/Dashboard';
import Entries from'./pages/Entries';
import Employees from'./pages/Employees';
import Admin from'./pages/Admin';
import Profile from'./pages/Profile';
import Signup from'./pages/Signup';
import{useEffect,useState}from'react';
import{api}from'./api';
import MyKpis from'./pages/MyKpis';

const Guard=({children})=>localStorage.getItem('token')?children:<Navigate to="/login" replace/>;
function Home(){const[route,setRoute]=useState('');useEffect(()=>{api('/api/auth/me').then(user=>setRoute(user.role==='Employee'?'/profile':'/dashboard')).catch(()=>setRoute('/login'))},[]);return route?<Navigate to={route} replace/>:null}
export default function App()
{
    return <Routes><Route path="/login" element={<Login/>}/><Route path="/signup" element={<Signup/>}/>
           <Route path="/" element={<Guard><Layout/></Guard>}>
           <Route index element={<Home/>}/>
           <Route path="dashboard" element={<Dashboard/>}/>
           <Route path="profile" element={<Profile/>}/>
           <Route path="my-kpis" element={<MyKpis/>}/>
           <Route path="entries" element={<Entries/>}/>
           <Route path="employees" element={<Employees/>}/>
           <Route path="admin" element={<Admin/>}/></Route>
           </Routes>
}
