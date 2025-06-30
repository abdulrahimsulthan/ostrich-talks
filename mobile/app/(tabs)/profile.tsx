import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import React from 'react'
import dayjs from 'dayjs'
import Profile from "@/assets/avatars/profile.svg"
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'
import colors from '@/constants/colors'
import { Image } from 'expo-image'
import userStore from '@/store/userStore'
import overviewStore from '@/store/overviewStore'
import progressStore from '@/store/progressStore'

const profile = () => {
  const { name, joined, followers, following } = userStore()
  const { streak, xp, league, leagueWeek } = overviewStore()
  const { level, title } = progressStore()
  return (
    <ScrollView className='flex-1 bg-background'>
      <View className='flex-1 w-full items-center justify-center bg-background'>

        {/* Header */}
        <View className={`
          flex-1 items-center justify-center mt-4 mb-2 p-4 bg-background
        `}>
          <View className={`
            h-40  w-40 rounded-full shadow-md items-center 
            shadow-primary justify-center
          `}>
            <Profile width={100} height={100} />
          </View>
          <Text className="my-2">{name}</Text>
          <Text>Joined on {dayjs(joined).format("DD MMM YYYY")}</Text>
        </View>

        {/* Social */}
        <View className='w-[90%] flex-1 items-center justify-center my-2 bg-background shadow-md rounded-xl p-4'>
          {/* followers */}
          <View className='flex-row items-center justify-around w-full'>
            <View className='flex-row items-center justify-center gap-4'>
              <Text className='font-bold'>{followers}</Text>
              <Text>Followers</Text>
            </View>
            <View className='flex-row items-center justify-center gap-4'>
              <Text className='font-bold'>{following}</Text>
              <Text>Following</Text>
            </View>
          </View>

          {/* Add Friends button */}
          <View className='flex-row items-center justify-around w-full mt-4'>
            <TouchableOpacity className='flex-row bg-primary rounded-full px-4 py-3 w-[60%] justify-center items-center gap-4'>
              <MaterialIcons name="person-add" size={24} color="white" />
              <Text className='text-white text-center'>Add Friends</Text>
            </TouchableOpacity>

            <TouchableOpacity>
              <MaterialIcons className='px-4 py-3 bg-primary rounded-full' name="share" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        {/* TODO: Friend Suggestions */}

        {/* Overview */}
        <View className='w-[90%] flex-1 my-4 bg-background justify-center'>
          <View className='mb-2'>
            <Text className='text-xl font-bold'>Overview</Text>
          </View>
          <View >
            <View className='mb-5 flex-row w-full items-center justify-around gap-4'>
              {/* Day Streak */}
              <View className='w-[45%] flex-row items-center gap-2 rounded-xl border border-primary px-4 py-3'>
                <MaterialIcons name='whatshot' size={24} color={colors.primary} />
                <View className='gap-1'>
                  <Text>{streak}</Text>
                  <Text>Day Streak</Text>
                </View>
              </View>

              {/* Total XP */}
              <View className='w-[45%] flex-row items-center gap-2 rounded-xl border border-primary px-4 py-3'>
                <MaterialCommunityIcons name="lightning-bolt" size={24} color={colors.primary} />
                <View className='gap-1'>
                  <Text>{xp}</Text>
                  <Text>Total XP</Text>
                </View>
              </View>
            </View>

            <View className='mb-2 flex-row w-full items-center justify-around gap-4'>
              {/* League */}
              <View className='w-[45%] flex-row items-center gap-2 rounded-xl border border-primary px-4 py-3'>
                <View className="absolute -top-2 right-2 bg-primary px-2 py-1 rounded-md">
                  <Text className="text-xs font-bold text-white">WEEK {leagueWeek}</Text>
                </View>
                <MaterialCommunityIcons name="trophy-outline" size={24} color={colors.primary} />
                <View className='gap-1'>
                  <Text>{league}</Text>
                  <Text>Current League</Text>
                </View>
              </View>

              {/* English Score */}
              <View className='w-[45%] flex-row items-center gap-2 rounded-xl border border-primary px-4 py-3'>
                <MaterialIcons name='score' size={24} color={colors.primary} />
                <View className='gap-1'>
                  <Text>{level}</Text>
                  <Text>{title}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Achievements */}
        <View className='w-[90%] flex-1 my-4 bg-background justify-center'>
          <View className='mb-2 flex-row items-center justify-between'>
            <Text className='text-xl font-bold'>Achievements</Text>
            <Text className='text-lg font-bold'>View All</Text>
          </View>

          {/* Achievements Row */}
          <View className="flex-row justify-between">
            {/* Achievement Item */}
            <View className="items-center flex-1">
              <Image
                style={{ width: 100, height: 100 }}
                source={require('@/assets/avatars/penguin.png')}
              />
              <View className="absolute -bottom-safe-offset-0.5 z-10 bg-primary px-2 py-1 rounded-md">
                <Text className="text-xs font-bold text-white">34</Text>
              </View>
            </View>

            <View className="items-center flex-1">
              <Image
                style={{ width: 100, height: 100 }}
                source={require('@/assets/avatars/penguin.png')}
              />
              <View className="absolute -bottom-safe-offset-0.5 z-10 bg-primary px-2 py-1 rounded-md">
                <Text className="text-xs font-bold text-white">50</Text>
              </View>
            </View>

            <View className="items-center flex-1 justify-center">
              <View className="absolute -bottom-safe-offset-0.5 z-10 bg-primary px-2 py-1 rounded-md">
                <Text className="text-xs font-bold text-white">75</Text>
              </View>
              <Image
                style={{ width: 100, height: 100 }}
                source={require('@/assets/avatars/penguin.png')}
              />
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

export default profile