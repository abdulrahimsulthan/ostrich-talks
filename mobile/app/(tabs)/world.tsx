import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import React from 'react'
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons'

const world = () => {
  return (
    <ScrollView className='bg-background'>
      <View className='w-[90%] mx-auto'>
        {/* Worlds */}
        <View className='my-4 gap-4'>
          <Text className='text-xl '>Worlds</Text>
          <TouchableOpacity className='flex-row items-center gap-4 bg-primary p-4 rounded-lg shadow-md'>
            <MaterialIcons name='home-filled' color="white" size={24}/>
            <Text className='text-white'>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity className='flex-row items-center gap-4 bg-primary p-4 rounded-lg shadow-md'>
            <MaterialIcons name='home-filled' color="white" size={24}/>
            <Text className='text-white'>Office</Text>
          </TouchableOpacity>
          <TouchableOpacity className='flex-row items-center gap-4 bg-primary p-4 rounded-lg shadow-md'>
            <FontAwesome5 name="journal-whills" size={24} color="white" />
            <Text className='text-white'>Social</Text>
          </TouchableOpacity>
          <TouchableOpacity className='flex-row items-center gap-4 bg-primary p-4 rounded-lg shadow-md'>
            <FontAwesome5 name="journal-whills" size={24} color="white" />
            <Text className='text-white'>Leadership</Text>
          </TouchableOpacity>
        </View>

        {/* Your Collections */}
        <View className='my-4 gap-4'>
          <Text className='text-xl '>Your Collections</Text>
          <TouchableOpacity className='flex-row items-center justify-between bg-primary p-4 rounded-lg shadow-md'>
            <Text className='text-white'>Mistakes</Text>
            <MaterialIcons name='repeat' color="white" size={24}/>
          </TouchableOpacity>
          <TouchableOpacity className='flex-row items-center justify-between bg-primary p-4 rounded-lg shadow-md'>
            <Text className='text-white'>Stories</Text>
            <MaterialIcons name='book' color="white" size={24}/>
          </TouchableOpacity>
        </View>
        
      </View>
    </ScrollView >
  )
}

export default world