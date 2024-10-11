import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import {  createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { addDoc, getDoc, setDoc } from "firebase/firestore";



export const AuthContext = createContext();

export const AuthContextProvider = ({Children}) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(undefined);

    useEffect(()=>{
       const unsub = onAuthStateChanged(auth,(user)=>{
        if(user){
            setIsAuthenticated(true);
            setUser(user);
        }else{
            setIsAuthenticated(false);
            setUser(null);
        }
       });
       return unsub;
    },[])
    
    const login = async (email,password) =>{
        try {
            
        } catch (error) {
            
        }
    }
    const logout = async () =>{
        try {
            
        } catch (error) {
            
        }
    }
    const register = async (email,password,username,profileUrl) =>{
        try {
            const response =await createUserWithEmailAndPassword(auth,email,password);
            console.log('response.user:',response?.user);

            // setUser(response?.user);
            // setIsAuthenticated(true);

            await setDoc(doc(db,"users", response?.user?.uid),{
                username,
                profileUrl,
                userId:response?.user?.uid
            });
            return {success: true,data:response?.user};
        } catch (error) {
            let msg=e.message;
            if(msg.includes('(auth/invalid-email)')) msg= 'invalid email'
            return{success:false , msg};
        }
    }
    return(
        <AuthContext.Provider value ={{user, isAuthenticated,login,register,logout}}>
            {Children}
        </AuthContext.Provider>
    )


}
export const useAuth = ()=>{
    const value = useContext(AuthContext);
    if(!value){
        throw new Error('useAuth must be wrapped inside AuthContextProvider')
    }
    return value;
}