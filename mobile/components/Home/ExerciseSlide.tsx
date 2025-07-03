import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, PermissionsAndroid, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import colors from '@/constants/colors';
import api from '@/lib/api';

interface ExerciseSlideProps {
  text: string;
  onSpeechResult: (result: string) => void;
}

const ExerciseSlide: React.FC<ExerciseSlideProps> = ({ text, onSpeechResult }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribedText, setTranscribedText] = useState<string | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);

  const speak = () => {
    Speech.speak(text, {
      language: 'en',
      pitch: 1,
      rate: 0.8,
    });
  };

  const startRecording = async () => {
    try {
      setTranscribedText(null);
      setIsRecording(true);
      // Request permission on Android
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'We need access to your microphone to record your speech.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          alert('Permission to access microphone is required!');
          setIsRecording(false);
          return;
        }
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      recordingRef.current = recording;
    } catch (e) {
      setIsRecording(false);
      console.error(e);
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      const recording = recordingRef.current;
      if (!recording) return;
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (!uri) return;
      setIsTranscribing(true);
      // Send audio to backend for transcription
      const formData = new FormData();
      formData.append('audio', {
        uri,
        name: 'recording.wav',
        type: 'audio/wav',
      } as any);
      const response = await api.post('/transcribe', formData);
      const transcript = response.transcript || response.text || '';
      setTranscribedText(transcript);
      onSpeechResult(transcript);
      setIsTranscribing(false);
      recordingRef.current = null;
    } catch (e) {
      setIsTranscribing(false);
      console.error(e);
    }
  };

  return (
    <View className="flex-1 bg-background p-6 rounded-lg shadow-md">
      <Text className="text-textPrimary text-xl mb-8">{text}</Text>
      <View className="flex-row justify-around">
        <TouchableOpacity onPress={speak} className="items-center">
          <MaterialIcons name="volume-up" size={32} color={colors.primary} />
          <Text className="text-textSecondary mt-2">Listen</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={isRecording ? stopRecording : startRecording}
          className="items-center"
          disabled={isTranscribing}
        >
          <MaterialIcons 
            name={isRecording ? "mic-off" : "mic"} 
            size={32} 
            color={isRecording ? colors.textSecondary : colors.primary} 
          />
          <Text className="text-textSecondary mt-2">
            {isRecording ? 'Stop' : 'Speak'}
          </Text>
        </TouchableOpacity>
      </View>
      {isTranscribing && (
        <View className="mt-6 items-center">
          <ActivityIndicator size="small" color={colors.primary} />
          <Text className="text-textSecondary mt-2">Transcribing...</Text>
        </View>
      )}
      {transcribedText && (
        <View className="mt-6 p-4 bg-gray-100 rounded-lg">
          <Text className="text-textSecondary">Transcription:</Text>
          <Text className="text-textPrimary mt-2">{transcribedText}</Text>
        </View>
      )}
    </View>
  );
};

export default ExerciseSlide; 