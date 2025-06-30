import { PermissionsAndroid } from "react-native";
import messaging from '@react-native-firebase/messaging'
import { getApp } from "@react-native-firebase/app";

const requestUserPermission = async () => {
  PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS)
  const authStatus = await getApp().messaging().requestPermission();

  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
    const token = await getApp().messaging().getToken()
    console.log('FCM token ', token)
  }
};

export default requestUserPermission;
