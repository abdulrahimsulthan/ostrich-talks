import { View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native'
import React from 'react'
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'
import colors from '@/constants/colors'
import { Image } from 'expo-image'

const quest = () => {
  const data = {
    dailyQuest: [
      {
        title: "Start a streak",
        progress: { completed: 1, total: 1 },
        chestColor: colors.primary
      },
      {
        title: "Complete 5 lessons",
        progress: { completed: 2, total: 5 },
        chestColor: colors.primary
      },
      {
        title: "Score 90% or higher in 4 lessons",
        progress: { completed: 1, total: 4 },
        chestColor: colors.primary
      }
    ]
  }
  return (
    <ScrollView className='bg-background'>
      <View className='w-[90%] mx-auto mt-2'>

        {/* Weekly Challenge */}
        <View className='flex-row justify-between items-center my-4 w-full shadow-md rounded-lg p-4 bg-background'>
          <View className='w-[60%]'>
            <View className='mb-2'>
              <Text className='font-bold text-xl mb-1'>Weekly Challenge</Text>
              <View className='flex-row items-center'>
                <MaterialIcons className='mr-2' name="timelapse" size={20} color={colors.primary} />
                <Text className='text-sm text-gray-500'>4 DAYS</Text>
              </View>
            </View>

            <Text className='text-lg mb-2'>Earn 12 quest points</Text>

            {/* progress bar */}
            <View className='flex-1 h-6 bg-gray-300 rounded-full w-full justify-center items-center'>
              <Text className='text-textPrimary z-10'>3 / 12</Text>
              <View className='absolute left-0 h-6 bg-primary rounded-full ' style={{ width: '25%' }} >
              </View>
            </View>
          </View>

          <MaterialCommunityIcons className='mr-2' name="treasure-chest" size={100} color={colors.primary} />
        </View>

        {/* Friends Quest */}
        <View className='my-4 w-full'>
          {/* Header */}
          <View className='flex-row justify-between items-center'>
            <Text className='font-bold text-xl'>Friends Quest</Text>
            <View className='flex-row'>
              <MaterialIcons className='mr-2' name="timelapse" size={20} color={colors.primary} />
              <Text className='text-sm text-gray-500'>3 DAYS</Text>
            </View>
          </View>

          {/* Friend Quest progress */}
          <View className='w-[90%] mx-auto my-2'>
            <Text className='text-xl mb-2'>Complete 5 lessons</Text>
            <View className='flex-1 justify-center items-center'>
              {/* progress bar */}
              <View className='flex-1 h-6 bg-gray-300 rounded-full w-[80%] justify-center items-center'>
                <Text className='text-textPrimary z-10'>3 / 5</Text>
                <View className='absolute left-0 h-6 bg-primary rounded-l-full ' style={{ width: '60%' }} >
                </View>
              </View>
            </View>
          </View>

          {/* Friend Quest status */}
          <View className='flex-row justify-around items-center my-2'>
            {/* Your status */}
            <View className='flex justify-center items-center gap-1'>
              <Image source={require("@/assets/avatars/penguin.png")} style={{ width: 60, height: 60, borderRadius: 25 }} />
              <Text>You </Text>
              <Text>1 lesson</Text>
              <TouchableOpacity className='bg-primary px-4 py-2 my-2 rounded-md'>
                <Text className='text-white text-center'>Nudge</Text>
              </TouchableOpacity>
            </View>

            {/* Friend status */}
            <View className='flex justify-center items-center gap-1'>
              <Image source={require("@/assets/avatars/penguin.png")} style={{ width: 60, height: 60, borderRadius: 25 }} />
              <Text>John Doe</Text>
              <Text>0 lessons</Text>
              <TouchableOpacity className='bg-primary px-4 py-2 my-2 rounded-md'>
                <Text className='text-white text-center'>Gift</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>

        {/* Daily Quests */}
        <View className='my-2 w-full'>
          {/* Header */}
          <View className='flex-row justify-between items-center'>
            <Text className='font-bold text-xl'>Daily Quests</Text>
            <View className='flex-row items-center'>
              <MaterialIcons className='mr-2' name="timelapse" size={20} color={colors.primary} />
              <Text className='text-sm text-gray-500'>13 HOURS</Text>
            </View>
          </View>

          {/* Daily quest list */}
          <FlatList data={data.dailyQuest}
            scrollEnabled={false}
            renderItem={({
              item: {
                title,
                progress: { total, completed },
                chestColor
              }
            }) => <View className='my-2'>
                <Text className='text-xl mb-2'>{title}</Text>
                <View className='flex-row justify-center items-center gap-5 px-4'>
                  {/* progress bar */}
                  <View className='flex-1 h-6 bg-gray-300 rounded-full justify-center items-center'>
                    <Text className='text-textPrimary z-10'>{completed} / {total}</Text>
                    <View className='absolute left-0 h-6 bg-primary rounded-full ' style={{ width: `${(completed / total) * 100}%` }} >
                    </View>
                  </View>

                  <MaterialCommunityIcons name="treasure-chest" size={50} color={chestColor} />
                </View>
              </View>
            } />
        </View>

      </View>
    </ScrollView>
  )
}

export default quest