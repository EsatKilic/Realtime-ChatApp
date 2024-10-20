import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import SignUp from '../app/signUp';
import { useAuth } from '../context/authContext';

jest.mock('../context/authContext', () => ({
  useAuth: jest.fn(),
}));

describe('SignUp Component', () => {
  it('should call register function when sign up button is pressed', async () => {
    const mockRegister = jest.fn(() => Promise.resolve({ success: true }));
    useAuth.mockReturnValue({ register: mockRegister });

    const { getByPlaceholderText, getByTestId } = render(<SignUp />);

    fireEvent.changeText(getByPlaceholderText('Username'), 'testuser');
    fireEvent.changeText(getByPlaceholderText('Email address'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Profile url'), 'https://example.com/profile.jpg');

    fireEvent.press(getByTestId('signUpButton'));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
        'testuser',
        'https://example.com/profile.jpg'
      );
    });
  });
});