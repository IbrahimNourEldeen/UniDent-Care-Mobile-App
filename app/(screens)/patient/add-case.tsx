import { zodResolver } from "@hookform/resolvers/zod";
import * as ImagePicker from "expo-image-picker";
import {
  Check,
  ChevronDown,
  ClipboardPlus,
  FileText,
  ImageIcon,
  Stethoscope,
  X,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

import {
  AddCaseFormValues,
  addCaseSchema,
} from "@/features/cases/schemas/addCaseSchema";
import { getCaseTypes } from "@/features/cases/server/caseTypes.action";
import { createCase } from "@/features/cases/services/caseService";
import { RootState } from "@/store/store";
export default function AddCaseScreen() {
  const patientId = useSelector(
    (state: RootState) => (state?.auth.user as any)?.publicId,
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [caseTypes, setCaseTypes] = useState<any[]>([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);
  const [selectedTypeName, setSelectedTypeName] = useState("");
  const [images, setImages] = useState<any[]>([]);

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddCaseFormValues>({
    resolver: zodResolver(addCaseSchema),
    defaultValues: { PatientId: patientId },
  });

  // تحميل التخصصات
  useEffect(() => {
    const loadTypes = async () => {
      setIsLoadingTypes(true);
      try {
        const res = await getCaseTypes(1, 20, search);
        const items = (res as any).data?.items || (res as any).items || [];
        setCaseTypes(items.map((i: any) => ({ id: i.publicId, name: i.name })));
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoadingTypes(false);
      }
    };
    const delay = setTimeout(loadTypes, 400);
    return () => clearTimeout(delay);
  }, [search]);

  // اختيار الصور من المعرض
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const newImages = result.assets.map((asset) => ({
        uri: asset.uri,
        name: asset.fileName || `img_${Date.now()}.jpg`,
        type: "image/jpeg",
      }));
      const updated = [...images, ...newImages];
      setImages(updated);
      setValue("Images", updated as any, { shouldValidate: true });
    }
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    setImages(updated);
    setValue("Images", updated as any, { shouldValidate: true });
  };

  const onSubmit = async (values: AddCaseFormValues) => {
    try {
      const res = await createCase(values);
      if (res.data?.success) {
        Alert.alert("Success 🎉", "Case submitted perfectly!");
        reset();
        setImages([]);
        setSelectedTypeName("");
      } else {
        Alert.alert("Error", res.data?.message || "Failed to create case");
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-6 pb-48"
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center mt-6 mb-8">
            <View className="w-14 h-14 bg-indigo-600 rounded-2xl items-center justify-center shadow-lg shadow-indigo-200">
              <ClipboardPlus size={28} color="white" />
            </View>
            <Text className="text-2xl font-black text-slate-800 mt-4">
              Create Case
            </Text>
            <Text className="text-slate-400 text-sm">
              Fill in the medical details
            </Text>
          </View>

          {/* Case Subject */}
          <View className="mb-5">
            <Text className="text-[12px] font-black text-slate-500 uppercase ml-1 mb-2">
              Subject
            </Text>
            <View
              className={`bg-slate-50 border-2 ${errors.Title ? "border-red-200" : "border-slate-50"} rounded-2xl px-4 py-3 flex-row items-center`}
            >
              <FileText size={18} color="#64748b" />
              <Controller
                control={control}
                name="Title"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    className="flex-1 ml-3 font-bold text-slate-800"
                    placeholder="Brief condition name"
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
            </View>
            {errors.Title && (
              <Text className="text-red-500 text-[10px] mt-1 ml-1 font-bold">
                {errors.Title.message}
              </Text>
            )}
          </View>

          {/* Specialty Dropdown */}
          <View className="mb-5" style={{ zIndex: 1000 }}>
            <Text className="text-[12px] font-black text-slate-500 uppercase ml-1 mb-2">
              Specialty
            </Text>
            <TouchableOpacity
              onPress={() => setIsDropdownOpen(!isDropdownOpen)}
              className="bg-slate-50 border-2 border-slate-50 rounded-2xl px-4 py-4 flex-row justify-between items-center"
            >
              <View className="flex-row items-center">
                <Stethoscope size={18} color="#4f46e5" />
                <Text
                  className={`ml-3 font-bold ${selectedTypeName ? "text-slate-800" : "text-slate-400"}`}
                >
                  {selectedTypeName || "Select Specialty"}
                </Text>
              </View>
              <ChevronDown size={18} color="#94a3b8" />
            </TouchableOpacity>

            {isDropdownOpen && (
              <View className="bg-white border border-slate-100 rounded-2xl mt-2 shadow-xl p-3 max-h-60">
                <TextInput
                  placeholder="Search..."
                  className="bg-slate-50 rounded-xl px-4 py-2 mb-2 font-bold"
                  onChangeText={setSearch}
                />
                <ScrollView nestedScrollEnabled>
                  {isLoadingTypes ? (
                    <ActivityIndicator size="small" color="#4f46e5" />
                  ) : (
                    caseTypes.map((type) => (
                      <TouchableOpacity
                        key={type.id}
                        onPress={() => {
                          setValue("CaseTypeId", type.id);
                          setSelectedTypeName(type.name);
                          setIsDropdownOpen(false);
                        }}
                        className="py-3 px-2 border-b border-slate-50 flex-row justify-between"
                      >
                        <Text className="font-bold text-slate-700">
                          {type.name}
                        </Text>
                        {selectedTypeName === type.name && (
                          <Check size={16} color="#4f46e5" />
                        )}
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>
              </View>
            )}
            {errors.CaseTypeId && (
              <Text className="text-red-500 text-[10px] mt-1 ml-1 font-bold">
                {errors.CaseTypeId.message}
              </Text>
            )}
          </View>

          {/* Symptom Details */}
          <View className="mb-5">
            <Text className="text-[12px] font-black text-slate-500 uppercase ml-1 mb-2">
              Details
            </Text>
            <View
              className={`bg-slate-50 border-2 ${errors.Description ? "border-red-200" : "border-slate-50"} rounded-2xl px-4 py-4`}
            >
              <Controller
                control={control}
                name="Description"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    placeholder="Describe your pain..."
                    className="font-bold text-slate-800 h-32"
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
            </View>
          </View>

          {/* Image Upload */}
          <View className="mb-8">
            <Text className="text-[12px] font-black text-slate-500 uppercase ml-1 mb-2">
              Case Images
            </Text>
            <TouchableOpacity
              onPress={pickImage}
              className="border-2 border-dashed border-slate-200 bg-slate-50 rounded-2xl p-6 items-center"
            >
              <ImageIcon size={32} color="#4f46e5" />
              <Text className="text-slate-600 font-bold mt-2">
                Upload Medical Photos
              </Text>
              <Text className="text-slate-400 text-xs mt-1">
                Select from gallery
              </Text>
            </TouchableOpacity>

            <View className="flex-row flex-wrap mt-4 gap-3">
              {images.map((img, idx) => (
                <View key={idx} className="relative">
                  <Image
                    source={{ uri: img.uri }}
                    className="w-20 h-20 rounded-xl bg-slate-100"
                  />
                  <TouchableOpacity
                    onPress={() => removeImage(idx)}
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                  >
                    <X size={12} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className={`bg-slate-900 h-16 rounded-2xl items-center justify-center mb-10 shadow-lg ${isSubmitting ? "opacity-50" : ""}`}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <View className="flex-row items-center">
                <Text className="text-white font-black text-lg mr-2">
                  Submit Request
                </Text>
                <Check size={20} color="white" />
              </View>
            )}
          </TouchableOpacity>
          <Text className="mb-14"></Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
