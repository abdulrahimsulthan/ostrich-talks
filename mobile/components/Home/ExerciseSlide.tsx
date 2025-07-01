import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import Voice from '@react-native-voice/voice';
import colors from '@/constants/colors';

interface ExerciseSlideProps {
  text: string;
  onSpeechResult: (result: string) => void;
}

interface SpeechResultsEvent {
  value?: string[];
}

const ExerciseSlide: React.FC<ExerciseSlideProps> = ({ text, onSpeechResult }) => {
  const [isListening, setIsListening] = useState(false);

  const speak = () => {
    Speech.speak(text, {
      language: 'en',
      pitch: 1,
      rate: 0.8,
    });
  };

  const startListening = async () => {
    try {
      await Voice.start('en-US');
      setIsListening(true);
    } catch (e) {
      console.error(e);
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
      setIsListening(false);
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    Voice.onSpeechResults = (e: SpeechResultsEvent) => {
      if (e.value && e.value[0]) {
        onSpeechResult(e.value[0]);
        stopListening();
      }
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  return (
    <View className="flex-1 bg-background p-6 rounded-lg shadow-md">
      <Text className="text-textPrimary text-xl mb-8">{text}</Text>
      
      <View className="flex-row justify-around">
        <TouchableOpacity onPress={speak} className="items-center">
          <MaterialIcons name="volume-up" size={32} color={colors.primary} />
          <Text className="text-textSecondary mt-2">Listen</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={isListening ? stopListening : startListening}
          className="items-center"
        >
          <MaterialIcons 
            name={isListening ? "mic-off" : "mic"} 
            size={32} 
            color={isListening ? colors.textSecondary : colors.primary} 
          />
          <Text className="text-textSecondary mt-2">
            {isListening ? 'Stop' : 'Speak'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ExerciseSlide; 