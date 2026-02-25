import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Stethoscope,
  GraduationCap,
  UserRound,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  CircleDot,
} from "lucide-react-native";
import { FontAwesome5 } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function LandingScreen() {
  const router = useRouter();

  const roles = [
    {
      title: "Doctor",
      desc: "Manage clinical cases, supervise students, and provide expert care.",
      icon: <Stethoscope color="#2563eb" size={28} />,
      href: "/(auth)/doctor-signup",
      bgColor: "bg-blue-50",
      accentColor: "text-blue-600",
      stats: "Verified Professionals",
      tag: "Mentor",
    },
    {
      title: "Student",
      desc: "Document clinical cases, learn from experts, and build your portfolio.",
      icon: <GraduationCap color="#4f46e5" size={28} />,
      href: "/(auth)/student-signup",
      bgColor: "bg-indigo-50",
      accentColor: "text-indigo-600",
      stats: "Academic Track",
      tag: "Learner",
    },
    {
      title: "Patient",
      desc: "Access top-tier dental services and track your medical history.",
      icon: <UserRound color="#0d9488" size={28} />,
      href: "/(auth)/patient-signup",
      bgColor: "bg-teal-50",
      accentColor: "text-teal-600",
      stats: "Quality Care",
      tag: "Health",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" />
      
      {/* Header - Glassmorphism style */}
      <View className="px-6 h-18 flex-row items-center justify-between bg-white/80 border-b border-slate-200">
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-blue-600 rounded-2xl items-center justify-center shadow-lg shadow-blue-300">
            <FontAwesome5 name="tooth" size={20} color="white" />
          </View>
          <Text className="ml-3 text-2xl font-black text-slate-900 tracking-tighter">
            UniDent<Text className="text-blue-600">Care</Text>
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/(auth)/login")}
          className="bg-slate-100 px-5 py-2.5 rounded-2xl border border-slate-200"
        >
          <Text className="text-slate-900 font-bold text-sm">Sign In</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {/* Hero Section */}
        <View className="px-8 pt-14 pb-12">
          <View className="flex-row items-center self-start bg-white border border-blue-100 px-3 py-1.5 rounded-full mb-6 shadow-sm">
            <ShieldCheck color="#2563eb" size={14} />
            <Text className="ml-2 text-blue-700 text-[10px] font-black uppercase tracking-widest">
              End-to-End Dental Ecosystem
            </Text>
          </View>

          <Text className="text-[42px] font-black text-slate-900 leading-[52px] tracking-tight">
            Bridging the gap in{"\n"}
            <Text className="text-blue-600 italic">Dental Excellence.</Text>
          </Text>

          <Text className="mt-6 text-slate-500 text-lg font-medium leading-7">
            A unified platform where Doctors mentor, Students excel, and
            Patients receive the best care.
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/(auth)/patient-signup")}
            className="mt-10 w-full bg-slate-900 h-16 rounded-[22px] flex-row items-center justify-center shadow-2xl shadow-slate-400"
          >
            <Text className="text-white font-bold text-lg mr-2">
              Get Started Now
            </Text>
            <ArrowRight color="white" size={20} />
          </TouchableOpacity>
        </View>

        {/* Roles Section */}
        <View className="px-6 mt-2">
          <View className="flex-row items-center mb-6">
            <CircleDot color="#2563eb" size={16} />
            <Text className="ml-2 text-xl font-black text-slate-900">
              Select Your Portal
            </Text>
          </View>

          {roles.map((role, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => router.push(role.href as any)}
              activeOpacity={0.95}
              className="mb-5 bg-white p-6 rounded-[32px] border border-white shadow-xl shadow-slate-200/50"
            >
              <View className="flex-row items-center mb-4">
                <View
                  className={`w-14 h-14 rounded-[20px] ${role.bgColor} items-center justify-center`}
                >
                  {role.icon}
                </View>
                <View className="ml-4 flex-1">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-xl font-black text-slate-900 tracking-tight">
                      {role.title}
                    </Text>
                    <View className={`${role.bgColor} px-3 py-1 rounded-full`}>
                       <Text className={`${role.accentColor} text-[9px] font-black uppercase`}>{role.tag}</Text>
                    </View>
                  </View>
                  <Text className="text-slate-400 text-xs font-bold mt-0.5">
                    {role.stats}
                  </Text>
                </View>
              </View>

              <Text className="text-slate-500 font-medium leading-6 mb-5">
                {role.desc}
              </Text>

              <View className="flex-row items-center justify-between bg-slate-50 p-4 rounded-2xl">
                <Text className="text-sm font-bold text-slate-600">
                  Access Portal
                </Text>
                <ChevronRight color="#cbd5e1" size={18} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <View className="mt-12 items-center px-6">
          <View className="w-12 h-1 bg-slate-200 rounded-full mb-8" />
          <View className="flex-row items-center opacity-40 mb-2">
            <FontAwesome5 name="tooth" size={14} color="#000" />
            <Text className="ml-2 font-black text-slate-900 tracking-widest uppercase text-[10px]">
              UniDent Care
            </Text>
          </View>
          <Text className="text-slate-400 text-[10px] font-bold">
            DESIGNED FOR THE FUTURE OF DENTISTRY
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}