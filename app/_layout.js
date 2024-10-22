import { Slot, useRouter, useSegments } from "expo-router";
import React, { useEffect } from 'react';
import { MenuProvider } from 'react-native-popup-menu';
import { AuthContextProvider, useAuth } from '../context/authContext';
import "../global.css";

const MainLayout = () => {
    const { isAuthenticated, resetAuth } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
       
        resetAuth();
    }, []);

    useEffect(() => {
        
        if (typeof isAuthenticated == 'undefined') return;
        const inApp = segments[0] == '(app)';
        if (isAuthenticated && !inApp) {
          
            router.replace('home');
        } else if (isAuthenticated == false) {
           
            router.replace('signIn');
        }
    }, [isAuthenticated]);

    return <Slot />
}

export default function RootLayout() {
    return (
        <MenuProvider>
            <AuthContextProvider>
                <MainLayout />
            </AuthContextProvider>
        </MenuProvider>
    )
}