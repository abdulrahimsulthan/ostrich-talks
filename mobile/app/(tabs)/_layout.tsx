import { Tabs } from 'expo-router';
import colors from '@/constants/colors';
import { Fontisto, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { getAuth, signOut } from '@react-native-firebase/auth';
import appStore from '@/store/appStore';

export default function TabLayout() {
    const { loading, setLoading } = appStore()
    const logoutIcon = () =>
        <TouchableOpacity
            onPress={() => {
                setLoading(true)
                signOut(getAuth()).then(() => setLoading(false));
            }}
            className='pr-4 flex-row  items-center gap-2 '
        >
            <MaterialIcons name="logout" size={28} color={colors.primary} />
            {loading ? <ActivityIndicator color={colors.primary}/>:<Text>Logout</Text>}
            
        </TouchableOpacity>

    return (
        <Tabs screenOptions={{
            popToTopOnBlur: true,
            tabBarActiveTintColor: colors.primaryDark,
            tabBarInactiveTintColor: colors.textSecondary,
            tabBarLabelStyle: { fontSize: 12 },
            tabBarStyle: {
                backgroundColor: colors.background,
                height: 80,
                paddingBottom: 10,
                paddingTop: 10
            }
        }}>
            <Tabs.Screen
                name="home"
                options={{
                    headerShown: false,
                    title: 'Home',
                    tabBarIcon: ({ color }) => <MaterialIcons size={28} name="home" color={color} />,
                }}
            />
            <Tabs.Screen
                name="world"
                options={{
                    title: 'World',
                    tabBarIcon: ({ color }) => <Fontisto name="world" size={24} color={color} />
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    headerRight: logoutIcon,
                    tabBarIcon: ({ color }) => <MaterialIcons size={28} name="person" color={color} />
                }} />
            <Tabs.Screen
                name="league"
                options={{
                    title: 'League',
                    tabBarIcon: ({ color }) => <MaterialIcons size={28} name="leaderboard" color={color} />
                }} />
            <Tabs.Screen
                name="quest"
                options={{
                    title: 'Quest',
                    tabBarIcon: ({ color }) => <MaterialCommunityIcons name="treasure-chest" size={28} color={color} />
                }} />

        </Tabs>
    );
}
