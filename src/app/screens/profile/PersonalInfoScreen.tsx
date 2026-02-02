import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '@app/store';
import { Colors, Typography, Spacing, BorderRadius } from '@app/utils/constants';
import { Header, Button, Input } from '@app/components';
import { supabase } from '@app/services/supabase';
import Toast from 'react-native-toast-message';

export const PersonalInfoScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [address, setAddress] = useState(user?.address || '');
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    setIsLoading(true);
    try {
      // Pick the image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];

        // Upload to Supabase Storage
        const fileExt = asset.uri.split('.').pop();
        const fileName = `${user!.id}-${Math.random()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        // Create form data for upload
        const formData = new FormData();
        formData.append('file', {
          uri: asset.uri,
          name: fileName,
          type: `image/${fileExt}`,
        } as any);

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, formData);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

        // Update profile with new avatar URL
        const { error: updateError } = await supabase.auth.updateUser({
          data: { avatar_url: publicUrl }
        });

        if (updateError) throw updateError;

        updateUser({ avatarUrl: publicUrl });
        Toast.show({ type: 'success', text1: 'Avatar Updated!' });
      }
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      Toast.show({ type: 'error', text1: 'Upload Failed', text2: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);

      // Update auth metadata
      const { data, error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          phone_number: phone,
          address: address,
        }
      });

      if (authError) throw authError;

      // Update local profile too
      // The onAuthStateChange listener in useAuthStore should handle this automatically
      // after a successful supabase.auth.updateUser call.
      // However, if direct local state update is needed for immediate UI reflection,
      // it can be done here.
      updateUser({ fullName, phoneNumber: phone, address });

      setIsEditing(false);
      Toast.show({ type: 'success', text1: 'Profile Updated!' });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      Toast.show({ type: 'error', text1: 'Error', text2: error.message || 'Failed to update profile.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Personal Info" rightComponent={<TouchableOpacity onPress={() => setIsEditing(!isEditing)}><Text style={styles.editText}>{isEditing ? 'Cancel' : 'Edit'}</Text></TouchableOpacity>} />
      <ScrollView style={styles.content}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {user?.avatarUrl ? <Image source={{ uri: user.avatarUrl }} style={styles.avatar} /> : <Ionicons name="person" size={60} color={Colors.gray400} />}
            {isEditing && (
              <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
                <Ionicons name="camera" size={20} color={Colors.white} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input label="Full Name" value={fullName} onChangeText={setFullName} editable={isEditing} />
          <Input label="Email" value={user?.email} editable={false} />
          <Input label="Phone Number" value={phone} onChangeText={setPhone} editable={isEditing} keyboardType="phone-pad" />
          <Input label="Address" value={address} onChangeText={setAddress} editable={isEditing} multiline numberOfLines={3} />
          <Input label="Employee ID" value={user?.employeeId || 'N/A'} editable={false} />
          <Input label="Date of Joining" value={user?.dateOfJoining || 'N/A'} editable={false} />

          {isEditing && <Button title="Save Changes" onPress={handleSave} isLoading={isLoading} style={styles.saveButton} />}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  content: {
    padding: Spacing.base,
  },
  editText: {
    fontSize: Typography.size.base,
    color: Colors.primary,
    fontWeight: Typography.weight.medium,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  saveButton: {
    marginTop: Spacing.lg,
  },
});
