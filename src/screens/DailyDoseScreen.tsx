/**
 * DailyDoseScreen Component
 * 
 * A dedicated screen to display the daily dose of God's word, including scripture
 * and a recommended video.
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import YoutubeIframe from 'react-native-youtube-iframe';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchTodaysRecommendation } from '../store/slices/recommendationsSlice';
import { Colors } from '../constants';
import Icon from '../components/Icon';
import { generateDailyRecommendation } from '../services/recommendationService';

const DailyDoseScreen = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const { today: todaysRecommendation, loading, error } = useAppSelector((state) => state.recommendations);

  const handleGenerateRecommendation = async () => {
    try {
      const result = await generateDailyRecommendation();
      Alert.alert('Success', result.message);
    } catch (err) {
      Alert.alert('Error', 'Failed to generate recommendation.');
    }
  };

  useEffect(() => {
    dispatch(fetchTodaysRecommendation());
  }, [dispatch]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size="lg" color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Daily Dose</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* <TouchableOpacity onPress={handleGenerateRecommendation} style={styles.testButton}>
        <Text style={styles.testButtonText}>Generate Recommendation (Test)</Text>
      </TouchableOpacity> */}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading && <ActivityIndicator size="large" color={Colors.primary.main} style={{ marginTop: 20 }} />}
        {error && <Text style={styles.errorText}>{typeof error === 'string' ? error : JSON.stringify(error)}</Text>}
        
        {todaysRecommendation && (
          <>
            {/* Scripture Section */}
            <Text style={styles.sectionTitle}>Today's Word</Text>
            <ImageBackground
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJ87m37g4Nzqol-5HwrAqG5tuz0iLsPn6SlN35g7W0m2rmY8KkqJlTjnc1A7Q-zJbqa6R3MC9cS-3-_VoMJmZwvNw8-6voNswPtWixjoA1u4DTs_1QOXXUj0vKfxcSVm3QAuzhRSo_VkjTCc0qkgWXkQRnKhG1_7GxhxY3602QraOfB2RjNFdz7Id7Q1Y-BAMTF3Q9tjV_aNoAypAWaV2tuPszKiclQGk60gOhMsDuKJ9XcKnI4Ts41zKaYl5wVpxkw3GonWSgnp47' }}
              style={styles.scriptureCard}
              imageStyle={styles.scriptureImage}
            >
              <View style={styles.overlay}>
                <Text style={styles.scriptureReference}>{todaysRecommendation.scriptureReference}</Text>
                <ScrollView style={styles.scriptureScrollView} nestedScrollEnabled={true}>
                  <Text style={styles.scriptureText}>{todaysRecommendation.scriptureText}</Text>
                </ScrollView>
              </View>
            </ImageBackground>

            {/* Video Section */}
            {todaysRecommendation.youtube?.videoId && (
              <View style={styles.videoSection}>
                <Text style={styles.sectionTitle}>Today's Video</Text>
                <View style={styles.videoContainer}>
                  <YoutubeIframe
                    videoId={todaysRecommendation.youtube.videoId}
                    height={200}
                    play={false}
                  />
                  <Text style={styles.videoTitle}>{todaysRecommendation.youtube.title}</Text>
                  <Text style={styles.videoChannel}>{todaysRecommendation.youtube.channelTitle}</Text>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  scrollContent: {
    padding: 16,
  },
  loadingText: {
    color: Colors.text.primary,
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    color: Colors.error.main,
    textAlign: 'center',
    marginTop: 20,
  },
  scriptureCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    height: 300,
  },
  scriptureImage: {
    resizeMode: 'cover',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 24,
    justifyContent: 'center',
  },
  scriptureReference: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 16,
    textAlign: 'center',
  },
  scriptureScrollView: {
    maxHeight: 180,
  },
  scriptureText: {
    fontSize: 18,
    color: Colors.white,
    lineHeight: 28,
    textAlign: 'center',
  },
  videoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  videoContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.background.secondary,
    padding: 16,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginTop: 12,
  },
  videoChannel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  testButton: {
    backgroundColor: Colors.primary.main,
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 20,
    marginBottom: 10,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default DailyDoseScreen;
