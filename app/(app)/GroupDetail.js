import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/authContext';
import { db } from '../../firebaseConfig';

export default function GroupDetails() {
  const { groupId } = useLocalSearchParams();
  const [groupDetails, setGroupDetails] = useState(null);
  const [members, setMembers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const fetchGroupDetails = async () => {
      const groupRef = doc(db, 'groups', groupId);
      const groupSnapshot = await getDoc(groupRef);
      if (groupSnapshot.exists()) {
        const groupData = groupSnapshot.data();
        setGroupDetails(groupData);

        const memberIds = groupData.members; 
        const membersData = await fetchMembers(memberIds);
        setMembers(membersData);
      } else {
        Alert.alert('Error', 'Group not found');
      }
    };

    const fetchMembers = async (memberIds) => {
      const membersData = [];
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      const allUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      memberIds.forEach((memberId) => {
        const user = allUsers.find(user => user.id === memberId);
        if (user) {
          membersData.push(user);
        }
      });

      return membersData;
    };

    fetchGroupDetails()
      .then(fetchAvailableUsers)
      .catch(error => {
        console.error("Error fetching group details:", error);
      });
  }, [groupId]);

  const fetchAvailableUsers = async () => {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    const usersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const filteredUsers = usersList.filter(user => !members.some(member => member.id === user.id));
    setAvailableUsers(filteredUsers);
  };

  const UserList = ({ users, onUserSelect }) => {
    return (
      <FlatList
        data={users}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 }}>
            <Text>{item.username}</Text>
            <TouchableOpacity onPress={() => onUserSelect(item)}>
              <Text style={{ color: 'blue' }}>Add</Text>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item) => item.id} 
      />
    );
  };
  
  const addMember = async (newMember) => {
    const groupRef = doc(db, 'groups', groupId);
    const membersRef = collection(groupRef, 'members'); 
    await addDoc(membersRef, { id: newMember.id }); 

    Alert.alert('Success', 'Member added');
    setMembers(prevMembers => [...prevMembers, newMember]);
    await fetchAvailableUsers(); 
  };

  const removeMember = async (memberId) => {
    const groupRef = doc(db, 'groups', groupId);
    const membersRef = collection(groupRef, 'members'); 
    const memberRef = doc(membersRef, memberId);
    await deleteDoc(memberRef); 

    setMembers(prevMembers => prevMembers.filter(member => member.id !== memberId));
    Alert.alert('Success', 'Member removed');
    
    
    await fetchAvailableUsers(); 
  };

  const handleUserSelection = (selectedUser) => {
    addMember(selectedUser);
  };

  return (
    <View style={{ padding: 20 }}>
      {groupDetails && (
        <>
          <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>{groupDetails.name}</Text>
          <Image source={{ uri: groupDetails.groupImage }} style={{ width: 100, height: 100, borderRadius: 50 }} />
          <Text>{groupDetails.description}</Text>

          <Text style={{ marginTop: 20 }}>Members:</Text>
          <FlatList
            data={members}
            renderItem={({ item }) => (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 }}>
                <Text>{item.username}</Text>
                <TouchableOpacity onPress={() => removeMember(item.id)}>
                  <Text style={{ color: 'red' }}>Remove</Text>
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={(item) => item.id}
          />

          <Text style={{ marginTop: 20 }}>Available Users:</Text>
          <UserList users={availableUsers} onUserSelect={handleUserSelection} />
        </>
      )}
    </View>
  );
}
