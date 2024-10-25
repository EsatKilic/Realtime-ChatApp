import { addDoc, collection, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from '../firebaseConfig';
import CustomCheckBox from './CustomCheckBox';

const CreateGroup = ({ onGroupCreated }) => {
  const [groupName, setGroupName] = useState('');
  const [groupImageUrl, setGroupImageUrl] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersList);
    };

    fetchUsers();
  }, []);

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
        Alert.alert('Error', 'Please enter a group name.');
        return;
    }
  
    if (selectedUsers.length === 0) {
        Alert.alert('Error', 'Please select at least one user.');
        return;
    }
  
    try {
        const newGroup = {
            name: groupName.trim(),
            createdAt: new Date(),
            groupImage: groupImageUrl.trim() || null,
            members: selectedUsers, // Üyeleri doğrudan burada ekleyin
        };
  
        const groupRef = await addDoc(collection(db, 'groups'), newGroup);
        
        onGroupCreated(groupRef.id, groupName.trim(), selectedUsers, groupImageUrl.trim() || null);
    } catch (error) {
        console.error("Error creating group:", error);
        Alert.alert('Error', `There was an error creating the group: ${error.message}`);
    }
  };
  


  const toggleUserSelection = (userId) => {
    setSelectedUsers(prevSelected => {
      if (prevSelected.includes(userId)) {
        return prevSelected.filter(id => id !== userId);
      } else {
        return [...prevSelected, userId];
      }
    });
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>Create Group</Text>
      
      <TextInput
        placeholder="Group Name"
        value={groupName}
        onChangeText={setGroupName}
        style={{ borderWidth: 1, borderColor: '#ccc', marginBottom: 10, padding: 8 }}
      />

      <TextInput
        placeholder="Group Image URL (optional)"
        value={groupImageUrl}
        onChangeText={setGroupImageUrl}
        style={{ borderWidth: 1, borderColor: '#ccc', marginBottom: 10, padding: 8 }}
      />

      {groupImageUrl.trim() !== '' && (
        <Image 
          source={{ uri: groupImageUrl }} 
          style={{ width: 100, height: 100, borderRadius: 50, alignSelf: 'center', marginBottom: 10 }} 
          onError={() => Alert.alert('Error', 'Invalid image URL')}
        />
      )}

      <Text style={{ fontSize: 16, marginBottom: 10 }}>Select Users:</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CustomCheckBox
            isChecked={selectedUsers.includes(item.id)}
            onToggle={() => toggleUserSelection(item.id)}
            label={item.username || item.email}
          />
        )}
      />
      <TouchableOpacity onPress={handleCreateGroup} style={{ backgroundColor: '#6366F1', padding: 10, marginTop: 10 }}>
        <Text style={{ color: 'white', textAlign: 'center' }}>Create Group</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CreateGroup;