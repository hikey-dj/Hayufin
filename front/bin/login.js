import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authParam } from './cred';
import * as fetchData from './fetchData';


const Login = (props) => {
    const param = authParam.kv;
    const {setUser,setUserName} = props.data;
    const navigate = useNavigate();
    const [error, setError] = React.useState(null);
    const [pass, setPass] = React.useState(null);

    function updateUser(obj) {
        const val = obj.target.value;
        setUser(val);
    }   

    function updatePass(obj) {
        const val = obj.target.value;
        setPass(val);
    }  
    
    function onSubmit() {
        fetchData.login(param).then(res => {
            console.log(res)
            if (res.stat === "Ok") {
                console.log("Success:" , res)
                setUserName(res.uname)
            }
            else if(res.stat === "Not_Ok") setError(res.emsg)
            navigate("./home") 
        })
    }

    return(
        <div id = "master_login" className = "master_login">
            <div className="container">
                <form id="loginForm" className ="loginForm">
                <label className = "fp_label" htmlFor="username">Username:</label>
                <input type="text" className="fp_input" id="username" name="username" required onChange={updateUser}></input>

                <label className = "fp_label" htmlFor="password">Password:</label>
                <input type="password" className="fp_input" id="password" name="password" required onChange={updatePass}></input>
                {error ? <label className= "fp_label fp_error" >{error}</label> :""}
                <button type="button" className="fp_submit" onClick={onSubmit}>Submit</button>
                </form>

                <div className="result" id="result"></div>
            </div>
        </div>
    );
}

export default Login;