import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import colors from '@/constants/colors';
import ExerciseSlide from '@/components/Home/ExerciseSlide';

const exercises = [
  {
    id: 1,
    text: "Hello! How are you today?",
  },
  {
    id: 2,
    text: "I'm learning English to improve my communication skills.",
  },
  {
    id: 3,
    text: "Could you please help me with my pronunciation?",
  },
  {
    id: 4,
    text: "Thank you for helping me practice English.",
  },
];

export default function StartLevel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [userResponses, setUserResponses] = useState<{ [key: number]: string }>({});

  const handleSpeechResult = (result: string) => {
    setUserResponses(prev => ({
      ...prev,
      [exercises[currentSlide].id]: result
    }));
  };

  const goToNextSlide = () => {
    if (currentSlide < exercises.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const goToPreviousSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const handleFinish = () => {
    // TODO: Save progress and return to home
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-border">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View className="flex-row items-center">
          <Text className="text-textPrimary text-lg font-semibold">
            Level {currentSlide + 1}
          </Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Progress Bar */}
      <View className="w-full h-2 bg-gray-200">
        <View
          className="h-full bg-primary"
          style={{
            width: `${((currentSlide + 1) / exercises.length) * 100}%`,
          }}
        />
      </View>

      {/* Exercise Content */}
      <View className="flex-1 p-4">
        <ExerciseSlide
          text={exercises[currentSlide].text}
          onSpeechResult={handleSpeechResult}
        />

        {userResponses[exercises[currentSlide].id] && (
          <View className="mt-6 p-4 bg-gray-100 rounded-lg">
            <Text className="text-textSecondary">Your response:</Text>
            <Text className="text-textPrimary mt-2">
              {userResponses[exercises[currentSlide].id]}
            </Text>
          </View>
        )}
      </View>

      {/* Navigation Buttons */}
      <View className="flex-row justify-between items-center p-4 border-t border-border">
        <TouchableOpacity
          onPress={goToPreviousSlide}
          disabled={currentSlide === 0}
          className={`p-2 ${currentSlide === 0 ? 'opacity-50' : ''}`}
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={colors.textPrimary}
          />
        </TouchableOpacity>

        {currentSlide === exercises.length - 1 ? (
          <TouchableOpacity
            onPress={handleFinish}
            className="bg-primary px-8 py-3 rounded-full"
          >
            <Text className="text-white font-semibold">Finish</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={goToNextSlide}
            className="bg-primary px-8 py-3 rounded-full"
          >
            <Text className="text-white font-semibold">Next</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
} 