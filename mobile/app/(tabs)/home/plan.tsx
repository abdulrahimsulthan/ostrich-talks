import { View, Text, ScrollView } from 'react-native'
import React from 'react'
import { TouchableOpacity } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import colors from '@/constants/colors'

const plan = () => {
  return (
    <ScrollView className='flex-1 bg-background'>
    <View className='bg-background items-center justify-center'>
      {/* Plan Banner */}
      <View className='items-center justify-center py-4 w-[75%]'>
        <MaterialIcons name='query-builder' size={175} color={colors.primary} />
        <Text className='text-textPrimary text-center text-wrap text-2xl'>Super learners are 4.2x more likely to finish the English course!</Text>
      </View>

      {/* Plan details */}
      <View className='flex-row rounded-xl bg-background shadow-lg p-6 my-4 w-[90%] gap-4'>
          <MaterialIcons name='favorite' size={24} color={colors.primary} />
          <Text className='text-xl text-textPrimary'>Unlimited Hearts</Text>
      </View>

      <View className='flex-row rounded-xl bg-background shadow-lg p-6 my-4 w-[90%] gap-4'>
          <MaterialIcons name='favorite' size={24} color={colors.primary} />
          <Text className='text-xl text-textPrimary'>No Ads</Text>
      </View>

      <View className='flex-row rounded-xl bg-background shadow-lg p-6 my-4 w-[90%] gap-4'>
          <MaterialIcons name='favorite' size={24} color={colors.primary} />
          <View>
            <Text className='text-xl text-textPrimary font-bold'>Speaking and Listening</Text>
            <Text className='text-textPrimary'>Practice on-demand</Text>
          </View>
      </View>

      <View className='flex-row rounded-xl bg-background shadow-lg p-6 my-4 w-[90%] gap-4'>
          <MaterialIcons name='favorite' size={24} color={colors.primary} />
          <View>
            <Text className='text-xl text-textPrimary font-bold'>Mistakes Review</Text>
            <Text className='text-textPrimary'>To target your weak areas</Text>
          </View>
      </View>

      {/* Cancel plan Banner */}
      <View className='items-center justify-center py-4 w-[75%]'>
        <MaterialIcons name='free-cancellation' size={175} color={colors.primary} />
        <Text className='text-textPrimary text-center text-wrap text-2xl'>Cancel anytime, no penalties or fees</Text>
      </View>

      {/* Buy Plan */}
      <TouchableOpacity>
        <View className='flex-row justify-between items-center rounded-lg bg-primary p-6 my-4 w-[90%]'>
            <Text className='text-xl text-white ml-2'>Try 1 week for Free</Text>
        </View>
      </TouchableOpacity>


    </View>
  </ScrollView>
  )
}

export default plan