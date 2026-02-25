import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppSelector } from '../../store/hooks';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

export default function DashboardScreen() {
  const { user, role } = useAppSelector((state) => state.auth);

  const mockCases = [
    { id: '1', patient: 'أحمد محمد', treatment: 'حشو عصب', status: 'Pending', time: '10:00 AM' },
    { id: '2', patient: 'سارة محمود', treatment: 'تقويم أسنان', status: 'Accepted', time: '01:30 PM' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView className="flex-1 px-5 pt-4">
        
        <View className="flex-row justify-between items-center mb-8">
          <View>
            <Text className="text-slate-500 font-medium">Welcome back,</Text>
            <Text className="text-2xl font-black text-slate-900">
              {role === 'Doctor' ? 'Dr. ' : ''}{user?.fullName || 'User'} 👋
            </Text>
          </View>
          <TouchableOpacity className="w-12 h-12 bg-white rounded-2xl items-center justify-center shadow-sm border border-slate-100">
            <MaterialCommunityIcons name="bell-outline" size={24} color="#1e293b" />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View className="flex-row justify-between mb-8">
          <View className="bg-blue-600 p-4 rounded-[24px] w-[48%] shadow-lg shadow-blue-300">
            <FontAwesome5 name="briefcase-medical" size={20} color="white" />
            <Text className="text-white/80 mt-2 font-medium">Total Cases</Text>
            <Text className="text-white text-2xl font-black">12</Text>
          </View>
          <View className="bg-white p-4 rounded-[24px] w-[48%] border border-slate-100 shadow-sm">
            <FontAwesome5 name="clock" size={20} color="#2563eb" />
            <Text className="text-slate-500 mt-2 font-medium">Pending</Text>
            <Text className="text-slate-900 text-2xl font-black">04</Text>
          </View>
        </View>

        {/* Recent Cases Section */}
        <View className="flex-row justify-between items-end mb-4">
          <Text className="text-lg font-bold text-slate-900">Recent Cases</Text>
          <TouchableOpacity>
            <Text className="text-blue-600 font-bold">View All</Text>
          </TouchableOpacity>
        </View>

        {mockCases.map((item) => (
          <TouchableOpacity 
            key={item.id}
            className="bg-white p-4 rounded-2xl mb-3 flex-row items-center border border-slate-50 shadow-sm"
          >
            <View className={`w-12 h-12 rounded-xl items-center justify-center ${item.status === 'Pending' ? 'bg-orange-100' : 'bg-green-100'}`}>
              <FontAwesome5 
                name="user-alt" 
                size={18} 
                color={item.status === 'Pending' ? '#f97316' : '#22c55e'} 
              />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-slate-900 font-bold text-base">{item.patient}</Text>
              <Text className="text-slate-500 text-sm">{item.treatment}</Text>
            </View>
            <View className="items-end">
              <Text className="text-slate-900 font-bold">{item.time}</Text>
              <Text className={`text-[10px] font-black uppercase tracking-tighter ${item.status === 'Pending' ? 'text-orange-500' : 'text-green-500'}`}>
                {item.status}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Quick Actions */}
        <Text className="text-lg font-bold text-slate-900 mt-6 mb-4">Quick Actions</Text>
        <TouchableOpacity className="bg-slate-900 p-4 rounded-2xl flex-row items-center justify-center mb-10">
          <FontAwesome5 name="plus" size={16} color="white" />
          <Text className="text-white font-bold ml-2">Add New Case Request</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}