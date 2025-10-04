import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Surface, TextInput, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Colors } from '../../constants';
import { Icon } from '../../components';
import { useAppDispatch } from '../../store/hooks';
import { setSelectedAction } from '../../store/slices/commitmentsSlice';

const CreateCustomActionScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [category, setCategory] = useState('');

  const handleCreate = () => {
    const customAction = {
      id: `custom_${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      category: category.trim() || 'Custom',
      estimatedHours: parseFloat(estimatedHours) || 3,
      difficulty: 'Medium',
      isCustom: true,
    };

    dispatch(setSelectedAction(customAction as any));
    navigation.navigate('SetTargetDate', {});
  };

  const isValid = title.trim().length > 0 && description.trim().length > 0 && parseFloat(estimatedHours) > 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Icon name="create-outline" size={64} color={Colors.primary.main} />
          <Text style={styles.title}>Create Custom Action</Text>
          <Text style={styles.subtitle}>Design your own service action</Text>
        </View>

        <Surface style={styles.formCard}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Action Title *</Text>
            <TextInput
              mode="outlined"
              value={title}
              onChangeText={setTitle}
              placeholder="E.g., Tutor underprivileged children"
              maxLength={100}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              mode="outlined"
              value={description}
              onChangeText={setDescription}
              placeholder="Describe what you'll do and how it helps others..."
              multiline
              numberOfLines={6}
              maxLength={500}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Estimated Hours *</Text>
            <TextInput
              mode="outlined"
              value={estimatedHours}
              onChangeText={setEstimatedHours}
              placeholder="3"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Category (Optional)</Text>
            <TextInput
              mode="outlined"
              value={category}
              onChangeText={setCategory}
              placeholder="E.g., Education, Community Service"
              maxLength={50}
            />
          </View>
        </Surface>

        <View style={styles.actionButtons}>
          <Button
            mode="contained"
            onPress={handleCreate}
            disabled={!isValid}
            style={styles.primaryButton}
            contentStyle={styles.buttonContent}
          >
            Continue
          </Button>
          <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.button}>
            Cancel
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 8,
  },
  formCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    backgroundColor: Colors.background.secondary,
    elevation: 2,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  actionButtons: {
    gap: 12,
    marginBottom: 24,
  },
  button: {
    borderRadius: 8,
  },
  primaryButton: {
    borderRadius: 8,
    backgroundColor: Colors.primary.main,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});

export default CreateCustomActionScreen;
