import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Button, Modal, View } from 'react-native';
import CreateGroup from './CreateGroup';

const CreateGroupScreen = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const router = useRouter(); 

  const handleGroupCreated = (groupId, groupName, selectedUsers) => {
    
   router.push(`/GroupChatRoom?groupId=${groupId}&groupName=${groupName}&members=${JSON.stringify(selectedUsers)}`);
    
    setIsModalVisible(false); 
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
