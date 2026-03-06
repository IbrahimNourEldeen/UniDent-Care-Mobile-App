import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import {
  ArrowRight,
  ArrowUpRight,
  GraduationCap,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function LandingScreen() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await SecureStore.getItemAsync("token");
        if (token) {
          router.replace("/(screens)" as any);
        } else {
          setIsChecking(false);
        }
      } catch (e) {
        setIsChecking(false);
      }
    };
    checkAuth();
  }, []);

  const roles = [
    {
      title: "Doctor",
      desc: "Manage clinical cases & provide care.",
      icon: <Stethoscope color="#2563eb" size={26} />,
      href: "/(auth)/doctor-signup",
      bgLight: "bg-blue-50",
      accent: "text-blue-600",
      tag: "Professional",
    },
    {
      title: "Student",
      desc: "Document cases & build portfolio.",
      icon: <GraduationCap color="#7c3aed" size={26} />,
      href: "/(auth)/student-signup",
      bgLight: "bg-violet-50",
      accent: "text-violet-600",
      tag: "Academic",
    },
    {
      title: "Patient",
      desc: "Access top-tier dental services.",
      icon: <UserRound color="#059669" size={26} />,
      href: "/(auth)/patient-signup",
      bgLight: "bg-emerald-50",
      accent: "text-emerald-600",
      tag: "Care",
    },
  ];

  // إذا كان يفحص الحالة لا نعرض شيئاً لمنع الوميض (Flicker)
  if (isChecking) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Floating Modern Navbar (Capsule Design) */}
      <View className="px-5 pt-2 z-50 absolute top-12 left-0 right-0">
        <View className="flex-row items-center justify-between bg-white/90 px-2 py-2 rounded-full shadow-xl shadow-slate-200 border border-slate-50">
          <View className="flex-row items-center pl-2">
            <View className="w-9 h-9 bg-blue-600 rounded-full items-center justify-center">
              <FontAwesome5 name="tooth" size={16} color="white" />
            </View>
            <Text className="ml-3 text-lg font-black text-slate-900 tracking-tight">
              UniDent<Text className="text-blue-600">Care</Text>
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/(auth)/login")}
            className="bg-slate-900 px-6 py-3 rounded-full"
          >
            <Text className="text-white font-bold text-sm">Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 100, paddingBottom: 60 }}
        className="bg-slate-50/30"
      >
        <View className="px-6 pt-10 pb-10">
          <View className="flex-row items-center self-start bg-blue-50 px-4 py-2 rounded-full mb-6">
            <ShieldCheck color="#2563eb" size={16} />
            <Text className="ml-2 text-blue-700 text-xs font-extrabold tracking-wide uppercase">
              Dental Excellence
            </Text>
          </View>

          <Text className="text-[46px] font-black text-slate-900 leading-[52px] tracking-tight">
            The Future of{"\n"}
            <Text className="text-blue-600">Dentistry.</Text>
          </Text>

          <Text className="mt-5 text-slate-500 text-lg font-medium leading-7 pr-6">
            Connecting experts, students, and patients in one seamless digital
            environment.
          </Text>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push("/(auth)/patient-signup")}
            className="mt-10 w-full bg-blue-600 h-16 rounded-full flex-row items-center justify-center shadow-2xl shadow-blue-300"
          >
            <Text className="text-white font-bold text-lg mr-2">
              Start Journey
            </Text>
            <ArrowRight color="white" size={22} />
          </TouchableOpacity>
        </View>

        <View className="px-5">
          <Text className="ml-2 text-sm font-black text-slate-400 mb-5 uppercase tracking-[2px]">
            Choose Your Portal
          </Text>

          {roles.map((role, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => router.push(role.href as any)}
              activeOpacity={0.8}
              className="mb-4 bg-white p-6 rounded-[35px] border border-slate-100 shadow-sm shadow-slate-200/50"
            >
              <View className="flex-row items-center justify-between mb-5">
                <View
                  className={`w-14 h-14 rounded-2xl ${role.bgLight} items-center justify-center`}
                >
                  {role.icon}
                </View>
                <View className="bg-slate-50 px-3 py-1.5 rounded-full">
                  <Text
                    className={`${role.accent} text-[10px] font-black uppercase tracking-widest`}
                  >
                    {role.tag}
                  </Text>
                </View>
              </View>

              <Text className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
                {role.title}
              </Text>

              <Text className="text-slate-500 text-sm font-medium leading-5 mb-6 pr-4">
                {role.desc}
              </Text>

              <View className="flex-row items-center bg-slate-50 self-start px-4 py-2 rounded-full">
                <Text className="text-xs font-bold text-slate-900 mr-2">
                  Enter Portal
                </Text>
                <ArrowUpRight color="#0f172a" size={14} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View className="mt-12 items-center px-6 opacity-30">
          <FontAwesome5 name="tooth" size={16} color="#94a3b8" />
          <Text className="mt-2 font-black text-slate-900 tracking-[3px] uppercase text-[10px]">
            UniDent Care
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
