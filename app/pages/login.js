import { useState,useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import {v4 as uuid} from 'uuid';


export default function Login({onIdSubmit}) {
    const idRef = useRef()

    const router = useRouter();


    const handleLogin = async (e) => {
        e.preventDefault();
        onIdSubmit(idRef.current.value)
    };

    function createNewId(){
        onIdSubmit(uuid())
    }

    return (
        <form onSubmit={handleLogin}>
            <input type="text" ref={idRef} placeholder="Id" required />
            <button type="submit">Login</button>
            <button onClick={createNewId}>Create</button>
        </form>
    );
}
