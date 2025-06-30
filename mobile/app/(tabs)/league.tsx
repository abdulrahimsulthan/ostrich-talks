import { View, Text, ScrollView, FlatList } from 'react-native'
import React from 'react'
import { Image } from 'expo-image'

const trophies = [
  {
    id: 1,
    name: 'Bronze',
    image: require('@/assets/league/trophy.png'),
  },
  {
    id: 2,
    name: 'Silver',
    image: require('@/assets/league/trophy.png'),
  },
  {
    id: 3,
    name: 'Gold',
    image: require('@/assets/league/trophy.png'),
  },
  {
    id: 4,
    name: 'Platinum',
    image: require('@/assets/league/trophy.png'),
  },
  {
    id: 5,
    name: 'Diamond',
    image: require('@/assets/league/trophy.png'),
  },
  {
    id: 6,
    name: 'Master',
    image: require('@/assets/league/trophy.png'),
  },
  {
    id: 7,
    name: 'Grandmaster',
    image: require('@/assets/league/trophy.png'),
  },
  {
    id: 8,
    name: 'Challenger',
    image: require('@/assets/league/trophy.png'),
  },
  {
    id: 9,
    name: 'Iron',
    image: require('@/assets/league/trophy.png'),
  },
  {
    id: 10,
    name: 'Emerald',
    image: require('@/assets/league/trophy.png'),
  }
]

const league = () => {
  const data = {
    level: 4,
    position: 13,
    xp: 310,
    leaderboard: [
      {
        name: "John Doe",
        level: 4,
        position: 1,
        xp: 1500,
        profileURI: "https://example.com/profile1.jpg",
      },
      {
        name: "Jane Smith",
        level: 4,
        position: 2,
        xp: 1400,
        profileURI: "https://example.com/profile2.jpg",
      },
      {
        name: "Alice Johnson",
        level: 4,
        position: 3,
        xp: 1300,
        profileURI: "https://example.com/profile3.jpg",
      },
      {
        name: "Bob Brown",
        level: 4,
        position: 4,
        xp: 1200,
        profileURI: "https://example.com/profile4.jpg",
      },
      {
        name: "Charlie Davis",
        level: 4,
        position: 5,
        xp: 1100,
        profileURI: "https://example.com/profile5.jpg",
      },
      {
        name: "David Wilson",
        level: 4,
        position: 6,
        xp: 1000,
        profileURI: "https://example.com/profile6.jpg",
      },
      {
        name: "Eva Martinez",
        level: 4,
        position: 7,
        xp: 900,
        profileURI: "https://example.com/profile7.jpg",
      },
      {
        name: "Frank Garcia",
        level: 4,
        position: 8,
        xp: 800,
        profileURI: "https://example.com/profile8.jpg",
      },
      {
        name: "Grace Lee",
        level: 4,
        position: 9,
        xp: 700,
        profileURI: "https://example.com/profile9.jpg",
      },
      {
        name: "Henry Adams",
        level: 4,
        position: 10,
        xp: 600,
        profileURI: "https://example.com/profile10.jpg",
      },
      {
        name: "Ivy Carter",
        level: 4,
        position: 11,
        xp: 500,
        profileURI: "https://example.com/profile11.jpg",
      },
      {
        name: "Jack Miller",
        level: 4,
        position: 12,
        xp: 400,
        profileURI: "https://example.com/profile12.jpg",
      },
      {
        name: "You",
        level: 4,
        position: 13,
        xp: 310,
        profileURI: "https://example.com/your-profile.jpg",
      },
      {
        name: "Karen Scott",
        level: 4,
        position: 14,
        xp: 300,
        profileURI: "https://example.com/profile14.jpg",
      },
      {
        name: "Liam Turner",
        level: 4,
        position: 15,
        xp: 290,
        profileURI: "https://example.com/profile15.jpg",
      },
      {
        name: "Mia White",
        level: 4,
        position: 16,
        xp: 280,
        profileURI: "https://example.com/profile16.jpg",
      },
      {
        name: "Noah Harris",
        level: 4,
        position: 17,
        xp: 270,
        profileURI: "https://example.com/profile17.jpg",
      },
      {
        name: "Olivia Martin",
        level: 4,
        position: 18,
        xp: 260,
        profileURI: "https://example.com/profile18.jpg",
      },
      {
        name: "Paul Walker",
        level: 4,
        position: 19,
        xp: 250,
        profileURI: "https://example.com/profile19.jpg",
      },
      {
        name: "Quinn Baker",
        level: 4,
        position: 20,
        xp: 240,
        profileURI: "https://example.com/profile20.jpg",
      },
    ]
  }

  return (
    <ScrollView className='bg-background '>
      <View className='w-[90%] mx-auto'>

        {/* Header */}
        <View className='my-2 w-full'>
          <Text className='font-bold text-xl'>{trophies[data.level].name} League</Text>
          <FlatList
            data={trophies}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <View className='flex flex-col items-center justify-center m-2 p-2'>
                <Image source={item.image} style={{ height: 60, width: 60 }} />
                <Text className=''>{item.name}</Text>
              </View>
            )}
          />
        </View>

        {/* Leaderboard */}
        <View className='my-2 w-full'>
          <Text className='font-bold text-xl'>Leaderboard</Text>

          {/* Promotion zone */}
          <FlatList
            scrollEnabled={false}
            data={data.leaderboard.slice(0, 5)}
            renderItem={({ item }) => (
              <View className='flex flex-row items-center justify-between my-2 p-2 bg-white rounded-lg'>
                <View className='flex flex-row items-center gap-5'>
                  <Text>{item.position}</Text>
                  {/* {{ uri: item.profileURI }} */}
                  <Image source={require('@/assets/avatars/penguin.png')} style={{ height: 40, width: 40, borderRadius: 20 }} />
                  <Text className='font-bold'>{item.name}</Text>

                </View>
                <Text>{item.xp} XP</Text>
              </View>
            )}
            keyExtractor={(item) => item.position.toString()}
          />
          <Text>PROMOTION ZONE</Text>

          {/* Same Zone */}
          <FlatList
            scrollEnabled={false}
            data={data.leaderboard.slice(5, 15)}
            renderItem={({ item }) => (
              <View className='flex flex-row items-center justify-between my-2 p-2 bg-white rounded-lg'>
                <View className='flex flex-row items-center gap-5'>
                  <Text>{item.position}</Text>
                  {/* {{ uri: item.profileURI }} */}
                  <Image source={require('@/assets/avatars/penguin.png')} style={{ height: 40, width: 40, borderRadius: 20 }} />
                  <Text className='font-bold'>{item.name}</Text>

                </View>
                <Text>{item.xp} XP</Text>
              </View>
            )}
            keyExtractor={(item) => item.position.toString()}
          />

          {/* Demotion zone */}
          <Text>DEMOTION ZONE</Text>
          <FlatList
            scrollEnabled={false}
            data={data.leaderboard.slice(15, 20)}
            renderItem={({ item }) => (
              <View className='flex flex-row items-center justify-between my-2 p-2 bg-white rounded-lg'>
                <View className='flex flex-row items-center gap-5'>
                  <Text>{item.position}</Text>
                  {/* {{ uri: item.profileURI }} */}
                  <Image source={require('@/assets/avatars/penguin.png')} style={{ height: 40, width: 40, borderRadius: 20 }} />
                  <Text className='font-bold'>{item.name}</Text>

                </View>
                <Text>{item.xp} XP</Text>
              </View>
            )}
            keyExtractor={(item) => item.position.toString()}
          />
        </View>

      </View>
    </ScrollView>
  )
}

export default league