import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import React from 'react'
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'
import colors from '@/constants/colors'
import overviewStore from '@/store/overviewStore'

const ProgressBar = ({progress}: {progress:number}) => {
  const totalBlocks = 10;
  const blocks = Array.from({ length: totalBlocks }, (_, i) => {
    const blockProgress = progress - i * 10;
    if (blockProgress >= 10) return 'full';
    if (blockProgress >= 5) return 'half';
    return 'empty';
  });

  return blocks.map((state, i) => (
        <View
          key={i}
          className="relative h-3 flex-1 mx-0.5 bg-gray-500 rounded overflow-hidden"
        >
          {state !== 'empty' && (
            <View
              className={`absolute top-0 left-0 h-full ${
                state === 'full' ? 'w-full' : 'w-1/2'
              } bg-primary`}
            />
          )}
        </View>
      ))
}

const WillPower = () => {
  // TODO: Learn a way to do lazy loading
  const {willPower} = overviewStore()
  return (
    <ScrollView className='flex-1 bg-background'>
      <View className='bg-background items-center justify-center'>
        {/* Heart Banner */}
        <View className='items-center justify-center py-4'>
          <MaterialCommunityIcons name="brain" size={175} color={colors.primary} />
          <Text className='text-textPrimary text-2xl'>Will Power</Text>
        </View>

        {/* Heart Counter */}
        <View className={`
          items-center justify-between rounded-lg 
          shadow-md p-4 my-4 w-[90%]
        `}>
          <Text className='p-2 mb-2 '>Will power increases when take some rest</Text>
          <View className='flex-row  w-[90%] items-center justify-around p-2 mb-2'>
            <ProgressBar progress={willPower}/>
          </View>
        </View>

        {/* Refill Hearts */}
        <TouchableOpacity>
          <View className='flex-row justify-between items-center rounded-lg bg-primary p-4 my-3 w-[90%]'>
            <View className='flex-row items-center'>
              <MaterialCommunityIcons name="brain" size={24} color="white" />
              <Text className='text-lg text-white ml-2'>Regain Will Power</Text>
            </View>
            <View className='flex-row items-center justify-center'>
              <MaterialIcons name='diamond' size={24} color="white" />
              <Text className='text-xl text-white ml-2'>300</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Unlimited Hearts CTA subscription pro */}
        <TouchableOpacity>
          <View className='flex-row justify-between items-center rounded-lg bg-primary p-4 my-3 w-[90%]'>
            <View className='flex-row items-center'>
              <MaterialCommunityIcons name="brain" size={24} color="white"/>
              <Text className='text-lg text-white ml-2'>GET Strong Will Power</Text>
            </View>
            <MaterialIcons name='diamond' size={24} color="white" />
          </View>
        </TouchableOpacity>

        {/* Earn Hearts */}
        <TouchableOpacity>
          <View className='flex-row justify-between items-center rounded-lg bg-primary p-4 my-3 w-[90%]'>
            <View className='flex-row items-center'>
              <MaterialCommunityIcons name="brain" size={24} color="white"/>
              <Text className='text-lg text-white ml-2'>Watch ad to earn 3 bars</Text>
            </View>
            <View />
          </View>
        </TouchableOpacity>


      </View>
    </ScrollView>
  )
}

export default WillPower