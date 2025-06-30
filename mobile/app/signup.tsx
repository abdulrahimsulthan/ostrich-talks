import { View, Text, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native'
import React, { useRef, useState } from 'react'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '@react-native-firebase/auth';
import { router } from 'expo-router';
import { Image } from 'expo-image';


const login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const emailInputRef = useRef<TextInput>(null);
  const showError = (err: string) => {
    setError(err)
    setTimeout(() => {
      setError('')
    }, 2500)
  }

  const signup = async () => {
    if (password !== passwordConfirm) {
      return showError("Password are not same.")
    }
    try {
      setLoading(true)
      await createUserWithEmailAndPassword(getAuth(), email, password);
      setLoading(false)
      router.replace('/home')
    } catch (error) {
      setLoading(false)
      showError("Already signed up? please login.")
      emailInputRef.current?.focus()
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
          textContentType='password'
          value={password}
          onChangeText={setPassword}
        />

        <TextInput className={`
           my-4 items-center flex-row gap-2
             border border-black rounded text-left p-2
            `}
          placeholder='Confirm password'
          textContentType='password'
          value={passwordConfirm}
          onChangeText={setPasswordConfirm}
        />

        {error && <Text className='text-red-500'>{error}</Text>}

        <TouchableOpacity
          className='flex-row justify-center bg-primary px-4 py-2 rounded my-4'
          onPress={signup}
        >
          {
            loading
              ? <ActivityIndicator color="white" />
              : <Text className='text-white text-lg'>Sign Up</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity
          className='flex-row justify-center items-center gap-2 border px-4 py-2 rounded my-4'
          onPress={() => { }}
        >
          <Image source={require("@/assets/icons/google.png")} style={{ height: 20, width: 20, borderRadius: 10 }} />
          <Text className='text-lg'>Sign Up with Google</Text>
        </TouchableOpacity>
      </View>

    </View>
  )
}

export default login