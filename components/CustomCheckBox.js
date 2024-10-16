// components/CustomCheckBox.js
import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';

const CustomCheckBox = ({ isChecked, onToggle, label }) => {
  return (
    <TouchableOpacity onPress={onToggle} style={styles.container}>
      <View style={[styles.checkbox, isChecked ? styles.checked : styles.unchecked]}>
        {isChecked && <View style={styles.checkMark} />}
      </View>
      {label && <Text style={styles.label}>{label}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checked: {
    backgroundColor: '#4CAF50',
  },
  unchecked: {
    backgroundColor: '#fff',
  },
  checkMark: {
    width: 10,
    height: 10,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
  },
});

export default CustomCheckBox;
