import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore';
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
      try {
        const groupRef = doc(db, 'groups', groupId);
        const groupSnapshot = await getDoc(groupRef);
        
        if (groupSnapshot.exists()) {
          const groupData = groupSnapshot.data();
          setGroupDetails(groupData);

          const memberIds = groupData.members || [];
          const membersData = await fetchMembers(memberIds);
          setMembers(membersData);

          await fetchAvailableUsers(memberIds);
        } else {
          Alert.alert('Error', 'Group not found');
        }
      } catch (error) {
        console.error("Error while retrieving group details:", error);
        Alert.alert('Error', 'Failed to retrieve group information');
      }
    };

    fetchGroupDetails();
  }, [groupId]);

  const fetchMembers = async (memberIds) => {
    try {
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
    } catch (error) {
      console.error("Error while importing members:", error);
      return [];
    }
  };

  const fetchAvailableUsers = async (currentMemberIds) => {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      const allUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const filteredUsers = allUsers.filter(user => 
        !currentMemberIds.includes(user.id) 
      );

      setAvailableUsers(filteredUsers);
    } catch (error) {
      console.error("Error retrieving available users:", error);
      setAvailableUsers([]);
    }
  };

  const addMember = async (newMember) => {
    try {
      const groupRef = doc(db, 'groups', groupId);
      const groupDoc = await getDoc(groupRef);
      
      if (groupDoc.exists()) {
        const currentMembers = groupDoc.data().members || [];
        const updatedMembers = [...currentMembers, newMember.id];
        
        await updateDoc(groupRef, {  
          members: updatedMembers
        });

        setMembers(prevMembers => [...prevMembers, newMember]);
        setAvailableUsers(prev => prev.filter(user => user.id !== newMember.id));
        
        Alert.alert('Successful', 'Member added');
      }
    } catch (error) {
      console.error("Error while adding member:", error);
      Alert.alert('Error', 'Failed to add member');
    }
};

const removeMember = async (memberId) => {
  try {
    const groupRef = doc(db, 'groups', groupId);
    const groupDoc = await getDoc(groupRef);
    
    if (groupDoc.exists()) {
      const currentMembers = groupDoc.data().members || [];
      const updatedMembers = currentMembers.filter(id => id !== memberId);
      
      await updateDoc(groupRef, {  
        members: updatedMembers
      });

      const removedMember = members.find(member => member.id === memberId);
      setMembers(prevMembers => prevMembers.filter(member => member.id !== memberId));
      if (removedMember) {
        setAvailableUsers(prev => [...prev, removedMember]);
      }
      
      Alert.alert('Successful', 'Member removed');
    }
  } catch (error) {
    console.error("Error while removing member:", error);
    Alert.alert('Error', 'Failed to remove member');
  }
};

  const handleUserSelection = (selectedUser) => {
    addMember(selectedUser);
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      {groupDetails && (
        <>
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Image 
              source={{ uri: groupDetails.groupImage }} 
              style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 10 }} 
            />
            <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{groupDetails.name}</Text>
            <Text style={{ color: '#666' }}>{groupDetails.description}</Text>
          </View>

          <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 20, marginBottom: 10 }}>
            Group Members:
          </Text>
          <FlatList
            data={members}
            renderItem={({ item }) => (
              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                paddingVertical: 10,
                borderBottomWidth: 1,
                borderBottomColor: '#eee'
              }}>
                <Text>{item.username}</Text>
                <TouchableOpacity 
                  onPress={() => removeMember(item.id)}
                  style={{
                    padding: 8,
                    backgroundColor: '#ffebee',
                    borderRadius: 5
                  }}
                >
                  <Text style={{ color: '#d32f2f' }}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={(item) => item.id}
          />

          <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 20, marginBottom: 10 }}>
            Available Users:
          </Text>
          <FlatList
            data={availableUsers}
            renderItem={({ item }) => (
              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                paddingVertical: 10,
                borderBottomWidth: 1,
                borderBottomColor: '#eee'
              }}>
                <Text>{item.username}</Text>
                <TouchableOpacity 
                  onPress={() => handleUserSelection(item)}
                  style={{
                    padding: 8,
                    backgroundColor: '#e3f2fd',
                    borderRadius: 5
                  }}
                >
                  <Text style={{ color: '#1976d2' }}>Add</Text>
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={(item) => item.id} 
          />
        </>
      )}
    </View>
  );
}