/**
 * DailyDoseScreen Component
 * 
 * A dedicated screen to display the daily dose of God's word, including scripture
 * and a recommended video.
 */
import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ImageBackground, 
  TouchableOpacity, 
  ActivityIndicator, 
  Linking, 
  Animated, 
  Platform,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import YoutubeIframe from 'react-native-youtube-iframe';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchTodaysRecommendation } from '../store/slices/recommendationsSlice';
import { Colors } from '../constants';
import Icon from '../components/Icon';
import { generateDailyRecommendation } from '../services/recommendationService';
import { BlurView } from '@react-native-community/blur';

const { width, height } = Dimensions.get('window');

const DailyDoseScreen = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const { today: todaysRecommendation, loading, error } = useAppSelector((state:any) => state.recommendations);
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [0, 1],
    extrapolate: 'clamp'
  });

  useEffect(() => {
    dispatch(fetchTodaysRecommendation());
  }, [dispatch]);

  const renderHeader = () => (
    <Animated.View style={[styles.floatingHeader, { opacity: headerOpacity }]}>
      <BlurView
        style={styles.blurView}
        blurType="light"
        blurAmount={10}
        reducedTransparencyFallbackColor="white"
      />
      <SafeAreaView style={styles.headerContent}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size="lg" color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Daily Dose</Text>
        <View style={{ width: 40 }} />
      </SafeAreaView>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <Animated.ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.topSpacer} />
          
          <View style={styles.introContainer}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonAlt}>
              <Icon name="arrow-back" size="lg" color={Colors.white} />
            </TouchableOpacity>
            <Text style={styles.mainTitle}>Your Daily Dose</Text>
            <Text style={styles.subtitle}>Renew your mind and heart with God's word today</Text>
          </View>
        </SafeAreaView>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary.main} />
            <Text style={styles.loadingText}>Preparing your daily dose...</Text>
          </View>
        )}
        
        {error && (
          <View style={styles.errorContainer}>
            <Icon name="alert-circle" size="xl" color={Colors.error.main} />
            <Text style={styles.errorText}>{typeof error === 'string' ? error : JSON.stringify(error)}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => dispatch(fetchTodaysRecommendation())}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {todaysRecommendation && (
          <View style={styles.contentContainer}>
            {/* Scripture Section */}
            <View style={styles.scriptureContainer}>
              <ImageBackground
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJ87m37g4Nzqol-5HwrAqG5tuz0iLsPn6SlN35g7W0m2rmY8KkqJlTjnc1A7Q-zJbqa6R3MC9cS-3-_VoMJmZwvNw8-6voNswPtWixjoA1u4DTs_1QOXXUj0vKfxcSVm3QAuzhRSo_VkjTCc0qkgWXkQRnKhG1_7GxhxY3602QraOfB2RjNFdz7Id7Q1Y-BAMTF3Q9tjV_aNoAypAWaV2tuPszKiclQGk60gOhMsDuKJ9XcKnI4Ts41zKaYl5wVpxkw3GonWSgnp47' }}
                style={styles.scriptureCard}
                imageStyle={styles.scriptureImage}
              >
                <View style={styles.overlay}>
                  <Text style={styles.todaysLabel}>TODAY'S WORD</Text>
                  <Text style={styles.scriptureReference}>{todaysRecommendation.scriptureReference}</Text>
                  <ScrollView style={styles.scriptureScrollView} nestedScrollEnabled={true}>
                    <Text style={styles.scriptureText}>{todaysRecommendation.scriptureText}</Text>
                  </ScrollView>
                  <View style={styles.divider} />
                </View>
              </ImageBackground>
            </View>


            {/* Video Section */}
            {todaysRecommendation.youtube?.videoId && (
              <View style={styles.videoCard}>
                <View style={styles.cardHeader}>
                  <Icon name="video" size="md" color={Colors.primary.main} />
                  <Text style={styles.cardTitle}>Today's Video</Text>
                </View>
                <View style={styles.videoContainer}>
                  <YoutubeIframe
                    videoId={todaysRecommendation.youtube.videoId}
                    height={220}
                    width={width - 64}
                    play={false}
                  />
                  {todaysRecommendation.youtube.title ? (
                    <Text style={styles.videoTitle}>{todaysRecommendation.youtube.title}</Text>
                  ) : null}
                  {todaysRecommendation.youtube.channelTitle ? (
                    <Text style={styles.videoChannel}>{todaysRecommendation.youtube.channelTitle}</Text>
                  ) : null}
                  {todaysRecommendation.youtube.url ? (
                    <TouchableOpacity
                      style={styles.openYoutubeBtn}
                      onPress={() => Linking.openURL(todaysRecommendation.youtube!.url!)}
                    >
                      <Icon name="youtube" size="sm" color={Colors.white} />
                      <Text style={styles.openYoutubeText}>Watch on YouTube</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            )}

            {/* Prayer Focus */}
            {todaysRecommendation.prayerFocus ? (
              <View style={styles.prayerFocusCard}>
                <View style={styles.cardHeader}>
                  <Icon name="heart" size="md" color={Colors.primary.main} />
                  <Text style={styles.cardTitle}>Prayer Focus</Text>
                </View>
                <Text style={styles.prayerFocusText}>{todaysRecommendation.prayerFocus}</Text>
              </View>
            ) : null}

        

            {/* Scriptures to Pray With */}
            {Array.isArray(todaysRecommendation.scripturesToPrayWith) && todaysRecommendation.scripturesToPrayWith.length > 0 ? (
              <View style={styles.prayScripturesCard}>
                <View style={styles.cardHeader}>
                  <Icon name="book-open" size="md" color={Colors.primary.main} />
                  <Text style={styles.cardTitle}>Scriptures to Pray With</Text>
                </View>
                {todaysRecommendation.scripturesToPrayWith.map((s: { reference: string; text?: string; version?: string; reason?: string }, idx: number) => (
                  <View key={idx} style={styles.scriptureListItem}>
                    <View style={styles.scriptureRefContainer}>
                      <Text style={styles.scriptureNumber}>{idx + 1}</Text>
                      <Text style={styles.scriptureListRef}>{s.reference}{s.version ? ` (${s.version.toUpperCase()})` : ''}</Text>
                    </View>
                    {s.text ? <Text style={styles.scriptureListText}>{s.text}</Text> : null}
                    {s.reason ? (
                      <View style={styles.reasonContainer}>
                        <Text style={styles.reasonLabel}>Why pray this:</Text>
                        <Text style={styles.scriptureListReason}>{s.reason}</Text>
                      </View>
                    ) : null}
                  </View>
                ))}
              </View>
            ) : null}

            

            <View style={styles.bottomSpacer} />
          </View>
        )}
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  // Floating Header
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  // Main Scroll Content
  scrollContent: {
    paddingHorizontal: 0,
  },
  topSpacer: {
    height: 24,
  },
  bottomSpacer: {
    height: 40,
  },
  // Intro
  introContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  backButtonAlt: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.white,
    opacity: 0.8,
  },
  // Loading State
  loadingContainer: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: Colors.text.primary,
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    fontWeight: '500',
  },
  // Error State
  errorContainer: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    color: Colors.error.main,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: Colors.primary.main,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
  },
  retryButtonText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
  // Content
  contentContainer: {
    paddingHorizontal: 24,
  },
  // Scripture Card
  scriptureContainer: {
    marginBottom: 32,
  },
  scriptureCard: {
    borderRadius: 20,
    overflow: 'hidden',
    height: 350,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
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
  todaysLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary.main,
    marginBottom: 8,
    letterSpacing: 1.2,
  },
  scriptureReference: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 16,
    textAlign: 'center',
  },
  scriptureScrollView: {
    maxHeight: 200,
  },
  scriptureText: {
    fontSize: 18,
    color: Colors.white,
    lineHeight: 28,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  divider: {
    width: 40,
    height: 4,
    backgroundColor: Colors.primary.main,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 24,
  },
  // Prayer Focus Card
  prayerFocusCard: {
    borderRadius: 20,
    backgroundColor: Colors.background.secondary,
    padding: 24,
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginLeft: 10,
  },
  prayerFocusText: {
    fontSize: 16,
    color: Colors.text.primary,
    lineHeight: 24,
  },
  // Scriptures to Pray Card
  prayScripturesCard: {
    borderRadius: 20,
    backgroundColor: Colors.background.secondary,
    padding: 24,
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scriptureListItem: {
    marginBottom: 20,
    borderLeftWidth: 2,
    borderLeftColor: Colors.primary.main,
    paddingLeft: 16,
  },
  scriptureRefContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  scriptureNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary.main,
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 22,
    marginRight: 8,
  },
  scriptureListRef: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text.primary,
    flex: 1,
  },
  scriptureListText: {
    fontSize: 15,
    color: Colors.text.primary,
    lineHeight: 22,
    marginBottom: 8,
  },
  reasonContainer: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  reasonLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary.main,
    marginBottom: 4,
  },
  scriptureListReason: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  // Video Card
  videoCard: {
    borderRadius: 20,
    backgroundColor: Colors.background.secondary,
    padding: 24,
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  videoContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.background.primary,
    alignItems: 'center',
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginTop: 16,
    paddingHorizontal: 12,
  },
  videoChannel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 4,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  openYoutubeBtn: {
    marginVertical: 16,
    backgroundColor: '#FF0000', // YouTube red
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },
  openYoutubeText: {
    color: Colors.white,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default DailyDoseScreen;
