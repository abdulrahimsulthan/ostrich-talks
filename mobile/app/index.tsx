import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import userStore from '../store/userStore';
import requestUserPermission from '../services/firebase/requestUserPermission';
import api from '../lib/api';
import { getApp } from '@react-native-firebase/app';

export default function Root() {
  const { user, idToken } = userStore();

  useEffect(() => {
    const handleFCMToken = async () => {
        console.log("user", user, idToken)
      if (user && idToken) {
        try {
          // Request notification permission and get FCM token
          await requestUserPermission();
          
          // Get FCM token from Firebase Messaging
          const fcmToken = await getApp().messaging().getToken();
          
          if (fcmToken) {
            // Send FCM token to backend
            await api.put('/users/fcm-token', { fcmToken });
          }
        } catch (error) {
          console.error('Error updating FCM token:', error);
        }
      }
    };

    handleFCMToken();
  }, [user, idToken]);

  return <Redirect href="/(tabs)/home" />;
}