import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { Send, ImageIcon, X, Paperclip } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

export interface MediaFile {
  uri: string;
  name: string;
  mimeType: string;
}

interface AddNoteFormProps {
  onSubmit: (note: string, mediaFiles?: MediaFile[]) => Promise<void>;
  isLoading: boolean;
  isDark?: boolean;
}

export default function AddNoteForm({ onSubmit, isLoading, isDark = false }: AddNoteFormProps) {
  const [note, setNote] = useState('');
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);

  const canSubmit = note.trim().length > 0 && !isLoading;

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your photo library to attach images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const picked: MediaFile[] = result.assets.map((asset) => ({
        uri: asset.uri,
        name: asset.fileName ?? `photo_${Date.now()}.jpg`,
        mimeType: asset.mimeType ?? 'image/jpeg',
      }));
      setMediaFiles((prev) => [...prev, ...picked]);
    }
  };

  const removeFile = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      await onSubmit(note.trim(), mediaFiles.length > 0 ? mediaFiles : undefined);
      setNote('');
      setMediaFiles([]);
    } catch {
      // error handled by parent
    }
  };

  return (
    <View
      className={`rounded-2xl border p-4 shadow-sm ${
        isDark ? 'bg-slate-800/70 border-slate-700/60' : 'bg-white border-slate-200'
      }`}
    >
      {/* Label */}
      <View className="flex-row items-center gap-2 mb-3">
        <Send size={14} color="#6366f1" />
        <Text className={`text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
          Add Clinical Note
        </Text>
      </View>

      {/* Textarea */}
      <TextInput
        placeholder="Write your clinical observations, treatment notes, or findings..."
        placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
        value={note}
        onChangeText={setNote}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        className={`text-sm min-h-[90px] rounded-xl border p-3 mb-3 ${
          isDark
            ? 'bg-slate-900/50 border-slate-700 text-slate-200'
            : 'bg-slate-50 border-slate-200 text-slate-800'
        }`}
      />

      {/* Attached Images Preview */}
      {mediaFiles.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-3"
          contentContainerStyle={{ gap: 8 }}
        >
          {mediaFiles.map((file, index) => (
            <View key={index} className="relative">
              <Image
                source={{ uri: file.uri }}
                className="w-20 h-20 rounded-xl"
                resizeMode="cover"
              />
              {/* Remove button */}
              <TouchableOpacity
                onPress={() => removeFile(index)}
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-rose-500 items-center justify-center shadow-md"
                activeOpacity={0.8}
              >
                <X size={10} color="#ffffff" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Options Row */}
      <View className="flex-row items-center justify-between mb-3">
        {/* Attach images */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={pickImages}
          className={`flex-row items-center gap-2 px-3 py-2 rounded-xl border ${
            mediaFiles.length > 0
              ? isDark
                ? 'bg-violet-900/20 border-violet-800/40'
                : 'bg-violet-50 border-violet-200'
              : isDark
              ? 'bg-slate-700/60 border-slate-600/50'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <ImageIcon
            size={13}
            color={
              mediaFiles.length > 0
                ? isDark
                  ? '#a78bfa'
                  : '#7c3aed'
                : isDark
                ? '#94a3b8'
                : '#64748b'
            }
          />
          <Text
            className={`text-xs font-medium ${
              mediaFiles.length > 0
                ? isDark
                  ? 'text-violet-400'
                  : 'text-violet-600'
                : isDark
                ? 'text-slate-400'
                : 'text-slate-500'
            }`}
          >
            {mediaFiles.length > 0 ? `${mediaFiles.length} image${mediaFiles.length > 1 ? 's' : ''}` : 'Attach Images'}
          </Text>
        </TouchableOpacity>

        {/* Character counter */}
        <Text className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          {note.length} / 2000
        </Text>
      </View>

      {/* Divider */}
      <View className={`h-px mb-3 ${isDark ? 'bg-slate-700/60' : 'bg-slate-100'}`} />

      {/* Submit Button */}
      <TouchableOpacity
        activeOpacity={0.8}
        disabled={!canSubmit}
        onPress={handleSubmit}
        className={`w-full flex-row items-center justify-center gap-2 py-3 rounded-xl shadow-md ${
          canSubmit
            ? 'bg-indigo-600 shadow-indigo-500/30'
            : isDark
            ? 'bg-indigo-900/50 shadow-none'
            : 'bg-indigo-300 shadow-none'
        }`}
      >
        {isLoading ? (
          <>
            <ActivityIndicator size="small" color="#ffffff" />
            <Text className="text-sm font-semibold text-white">Saving Note...</Text>
          </>
        ) : (
          <>
            <Send size={15} color="#ffffff" />
            <Text className="text-sm font-semibold text-white">
              Add Note{mediaFiles.length > 0 ? ` (+${mediaFiles.length})` : ''}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}
