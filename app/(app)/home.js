import { View, Text, Pressable, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { useAuth } from '../../context/authContext'
import { StatusBar } from 'expo-status-bar';
import ChatList from '../../components/ChatList';
import { getDocs, query, where } from 'firebase/firestore';
import { usersRef } from '../../firebaseConfig';

export default function Home() {
  const {logout,user}= useAuth();
  const [users, setUsers] = useState([]);
  useEffect(()=>{
    if(user?.uid)
        getUsers();
},[])
const getUsers = async ()=>{
    // fetch users
    const q = query(usersRef, where('userId', '!=', user?.uid));

    const querySnapshot = await getDocs(q);
    let data = [];
    querySnapshot.forEach(doc=>{
        data.push({...doc.data()});
    });

    setUsers(data);
}
  return (
    <View className="flex-1 bg-white">
      <StatusBar style="light" />
      {
        users.lenght>0? (
          <ChatList users={users} />
        ):(
          <View className="flex items-center" style={{top: hp(30)}}>
             <ActivityIndicator size="large" />
          </View>
        )
      }
      
    </View>
  )
} 