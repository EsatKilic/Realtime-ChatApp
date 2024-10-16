import React, { useState } from 'react';
import { View, Modal, Button } from 'react-native';
import CreateGroup from './CreateGroup';
import { useRouter } from 'expo-router'; // Import router from expo-router

const CreateGroupScreen = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const router = useRouter(); // Use router from expo-router

  const handleGroupCreated = (groupId, groupName, selectedUsers) => {
    console.log(`New group created with ID: ${groupId}, Name: ${groupName}, Members: ${selectedUsers}`);
    
    // Grup sohbet ekranına yönlendirme
    router.push(`/GroupChatRoom?groupId=${groupId}&groupName=${groupName}&members=${JSON.stringify(selectedUsers)}`);
    
    setIsModalVisible(false); // Modalı kapat
  };

  const handleOpenModal = () => {
    setIsModalVisible(true);
  };

  return (
    <View>
      <Button title="Create Group" onPress={handleOpenModal} />

      <Modal
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <CreateGroup 
          onGroupCreated={handleGroupCreated} 
        />
      </Modal>
    </View>
  );
};

export default CreateGroupScreen;
