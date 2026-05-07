import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Clock, Paperclip, X, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { SessionNoteItem, SessionMediaItem } from '../../types/caseTypes';

interface NoteCardProps {
  note: SessionNoteItem;
  index: number;
  isDark?: boolean;
}

function formatTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '';
  }
}

/** Full-screen image viewer */
function ImageViewer({
  medias,
  startIndex,
  onClose,
}: {
  medias: SessionMediaItem[];
  startIndex: number;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(startIndex);
  const { width, height } = Dimensions.get('window');

  return (
    <Modal visible animationType="fade" transparent statusBarTranslucent>
      <View className="flex-1 bg-black/95 items-center justify-center">
        {/* Close */}
        <TouchableOpacity
          onPress={onClose}
          className="absolute top-12 right-4 z-20 w-10 h-10 rounded-full bg-white/10 items-center justify-center"
          activeOpacity={0.8}
        >
          <X size={20} color="#fff" />
        </TouchableOpacity>

        {/* Counter */}
        <Text className="absolute top-14 left-0 right-0 text-center text-white/60 text-sm font-medium z-20">
          {current + 1} / {medias.length}
        </Text>

        {/* Image */}
        <Image
          source={{ uri: medias[current]?.mediaUrl }}
          style={{ width, height: height * 0.75 }}
          resizeMode="contain"
        />

        {/* Prev / Next */}
        {medias.length > 1 && (
          <>
            <TouchableOpacity
              onPress={() => setCurrent((p) => Math.max(0, p - 1))}
              disabled={current === 0}
              className="absolute left-3 w-10 h-10 rounded-full bg-white/10 items-center justify-center"
              activeOpacity={0.7}
            >
              <ChevronLeft size={22} color={current === 0 ? '#ffffff40' : '#fff'} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setCurrent((p) => Math.min(medias.length - 1, p + 1))}
              disabled={current === medias.length - 1}
              className="absolute right-3 w-10 h-10 rounded-full bg-white/10 items-center justify-center"
              activeOpacity={0.7}
            >
              <ChevronRight size={22} color={current === medias.length - 1 ? '#ffffff40' : '#fff'} />
            </TouchableOpacity>
          </>
        )}

        {/* Thumbnails strip */}
        {medias.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="absolute bottom-8"
            contentContainerStyle={{ gap: 6, paddingHorizontal: 16 }}
          >
            {medias.map((m, i) => (
              <TouchableOpacity key={m.id} onPress={() => setCurrent(i)} activeOpacity={0.8}>
                <Image
                  source={{ uri: m.mediaUrl }}
                  className={`w-14 h-14 rounded-lg ${i === current ? 'opacity-100' : 'opacity-40'}`}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

export default function NoteCard({ note, index, isDark = false }: NoteCardProps) {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const time = formatTime(note.createAt);
  const hasMedia = note.medias && note.medias.length > 0;

  return (
    <>
      {viewerIndex !== null && (
        <ImageViewer
          medias={note.medias}
          startIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      )}

      <View className="relative">
        <View className="flex-row gap-3">
          {/* Timeline dot */}
          <View className="relative z-10 mt-1">
            <View
              className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${
                isDark ? 'bg-indigo-800' : 'bg-indigo-500'
              }`}
            >
              <Text className="text-white text-xs font-bold">{index + 1}</Text>
            </View>
          </View>

          {/* Note content */}
          <View className="flex-1 pb-5">
            <View
              className={`rounded-2xl border p-4 shadow-sm ${
                isDark
                  ? 'bg-slate-800/70 border-slate-700/60'
                  : 'bg-white border-slate-100'
              }`}
            >
              {/* Header */}
              <View className="flex-row items-center justify-between mb-2.5">
                <View className="flex-row items-center gap-2">
                  {/* Session Note badge */}
                  <View
                    className={`flex-row items-center gap-1 px-2 py-0.5 rounded-md ${
                      isDark ? 'bg-indigo-900/30' : 'bg-indigo-50'
                    }`}
                  >
                    <Clock size={9} color={isDark ? '#818cf8' : '#4f46e5'} />
                    <Text
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        isDark ? 'text-indigo-400' : 'text-indigo-600'
                      }`}
                    >
                      Session Note
                    </Text>
                  </View>

                  {/* Media badge */}
                  {hasMedia && (
                    <View
                      className={`flex-row items-center gap-1 px-2 py-0.5 rounded-md ${
                        isDark ? 'bg-violet-900/30' : 'bg-violet-50'
                      }`}
                    >
                      <Paperclip size={9} color={isDark ? '#a78bfa' : '#7c3aed'} />
                      <Text
                        className={`text-[10px] font-bold uppercase tracking-wider ${
                          isDark ? 'text-violet-400' : 'text-violet-600'
                        }`}
                      >
                        {note.medias.length} media
                      </Text>
                    </View>
                  )}
                </View>

                <Text
                  className={`text-[11px] font-medium ${
                    isDark ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  {time}
                </Text>
              </View>

              {/* Body */}
              <Text
                className={`text-sm leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                {note.note}
              </Text>

              {/* Media grid */}
              {hasMedia && (
                <View className="mt-3">
                  <View className="flex-row flex-wrap gap-2">
                    {note.medias.map((media, mi) => (
                      <TouchableOpacity
                        key={media.id}
                        onPress={() => setViewerIndex(mi)}
                        activeOpacity={0.85}
                      >
                        <Image
                          source={{ uri: media.mediaUrl }}
                          className="w-20 h-20 rounded-xl"
                          resizeMode="cover"
                        />
                        {/* overlay for extra count */}
                        {mi === 2 && note.medias.length > 3 && (
                          <View className="absolute inset-0 rounded-xl bg-black/50 items-center justify-center">
                            <Text className="text-white font-bold text-base">
                              +{note.medias.length - 3}
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Timeline connector line */}
        <View
          className={`absolute left-5 top-10 bottom-0 w-px ${
            isDark ? 'bg-slate-700/60' : 'bg-slate-200'
          }`}
          style={{ zIndex: 0 }}
        />
      </View>
    </>
  );
}
