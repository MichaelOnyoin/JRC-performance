import{useEffect,useState}from'react';
import{api}from'../api';

export default function Employees()
{
    const[rows,setRows]=useState([]),[form,setForm]=useState({name:'',email:'',team:'',service_line:'',reviewer:''}),[error,setError]=useState('');
    const load = async () => api('/api/employees').then(setRows).catch(e=>setError(e.message));
    useEffect(() => {
    load();
    }, []);
    async function add(e)
    {
        e.preventDefault();
        try
        {
            await api('/api/employees',
                {
                    method:'POST',
                    body:JSON.stringify(
                        {
                            ...form,
                            email:form.email||null,
                            reviewer:form.reviewer||null
                        }
                    )
                }
            );
                setForm({name:'',email:'',team:'',service_line:'',reviewer:''});
                load()
        }
        catch(e)
            {
               setError(e.message)
            }
    }
            return <section>
                <h1>Employees</h1>
                <p>Firm-wide employee master data.</p>
                {error&&
                <div className="error">{error}</div>}
                <form className="panel formgrid" onSubmit={add}>
                    {Object.keys(form).map(k=>
                    <label key={k}>{k.replace('_',' ')}
                        <input required={['name','team','service_line'].includes(k)} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/>
                    </label>)}
                    <button>Add employee</button>
                </form>
                    <div className="panel tablewrap">
                        <table>
                            <thead>
                            <tr><th>Name</th><th>Email</th><th>Company</th><th>Service line</th><th>Reviewer</th></tr>
                            </thead>
                            <tbody>
                                {rows.map(x=>
                                <tr key={x.id}>
                                    <td>{x.name}</td>
                                    <td>{x.email||'—'}</td>
                                    <td>{x.team}</td>
                                    <td>{x.service_line}</td>
                                    <td>{x.reviewer||'—'}</td>
                                </tr>)}
                            </tbody>
                        </table>
                    </div>
            </section>
}
