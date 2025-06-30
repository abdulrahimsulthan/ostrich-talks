import { View, Text, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native'
import React, { useRef, useState } from 'react'
import { getAuth, signInWithEmailAndPassword } from '@react-native-firebase/auth';
import { Link, router } from 'expo-router';
import { Image } from 'expo-image';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const emailInputRef = useRef<TextInput>(null);
  const [loading, setLoading] = useState(false)

  const login = async () => {
    setLoading(true)
    try {
      await signInWithEmailAndPassword(getAuth(), email, password);
      setLoading(false)
      router.replace('/home')
    } catch (error) {
      setLoading(false)
      setError("Incorrect email or password.")
      setEmail('')
      setPassword('')
      emailInputRef.current?.focus()
      setTimeout(() => {
        setError('')
      }, 2500)
      console.log(error)
    }
  }

  return (
    <View className='bg-background flex-1 justify-center items-center'>
      <View className={`bg-background w-[80%] p-10 rounded-lg shadow-md`}>

        <TextInput className={`
          my-4 justify-around items-center flex-row gap-2
            border border-black rounded text-left p-3
            `}
          ref={emailInputRef}
          placeholder='Email'
          value={email}
          onChangeText={setEmail}
        />

        <TextInput className={`
           my-4 items-center flex-row gap-2
             border border-black rounded text-left p-2
            `}
          placeholder='Password'
          keyboardType='visible-password'
          value={password}
          onChangeText={setPassword}
        />

        {error && <Text className='text-red-500'>{error}</Text>}

        <TouchableOpacity
          className='flex-row justify-center bg-primary px-4 py-2 rounded my-4'
          onPress={login}
        >
          {loading
            ? <ActivityIndicator color="white" />
            : <Text className='text-white text-lg'>Login</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          className='flex-row justify-center items-center gap-2 border px-4 py-2 rounded my-4'
          onPress={() => { }}
        >
          <Image source={require("@/assets/icons/google.png")} style={{ height: 20, width: 20, borderRadius: 10 }} />
          <Text className='text-lg'>Sign in with Google</Text>
        </TouchableOpacity>

        <Text className='text-center'>Don't have an account <Link className={`text-blue-500`} href={'/signup'}>Sign Up</Link></Text>

      </View>

    </View>
  )
}

export default Login