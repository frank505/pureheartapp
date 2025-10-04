import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { Colors } from '../constants';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CompositeScreenProps } from '@react-navigation/native';
import { TruthStackParamList } from '../navigation/TruthNavigator';
import { RootStackParamList } from '../navigation/types';
import { BlurView } from '@react-native-community/blur';

type TruthDetailScreenProps = CompositeScreenProps<
  NativeStackScreenProps<TruthStackParamList, 'TruthDetail'>,
  NativeStackScreenProps<RootStackParamList>
>;

const { width, height } = Dimensions.get('window');

const TruthDetailScreen: React.FC<TruthDetailScreenProps> = ({ navigation, route }) => {
  const { lie, truth, explanation } = route.params;
  const scrollY = useRef(new Animated.Value(0)).current;
  
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [0, 1],
    extrapolate: 'clamp'
  });

  const handleEdit = () => {
    navigation.navigate('AddTruth', { lie, truth, explanation, isEditing: true });
  };

  const openScriptureBrowser = () => {
    navigation.navigate('ScriptureBrowser');
  };

  const renderFloatingHeader = () => (
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
        <Text style={styles.headerTitle}>Replace with Truth</Text>
        <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
          <Icon name="create-outline" size="md" color={Colors.primary.main} />
        </TouchableOpacity>
      </SafeAreaView>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {renderFloatingHeader()}

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
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
            <Text style={styles.mainTitle}>Replace with Truth</Text>
            <Text style={styles.subtitle}>Transform your thinking with biblical truth</Text>
          </View>
        </SafeAreaView>
        {/* Display the Lie */}
        <ImageBackground
          source={require('../../assets/images/appbackgroundimage.png')}
          style={styles.lieCard}
          imageStyle={styles.lieImage}
        >
          <View style={styles.overlay}>
            <Text style={styles.lieLabel}>THE LIE</Text>
            <Text style={styles.lieText}>{lie}</Text>
            <View style={styles.divider} />
          </View>
        </ImageBackground>

        {/* Biblical Truth Response */}
        <View style={styles.contentContainer}>
          {truth ? (
            <>
              <View style={styles.truthCard}>
                <View style={styles.cardHeader}>
                  <Icon name="checkmark-circle" size="md" color={Colors.primary.main} />
                  <Text style={styles.cardTitle}>Biblical Truth</Text>
                </View>
                <Text style={styles.truthText}>{truth}</Text>
              </View>
              
              {explanation && (
                <View style={styles.explanationCard}>
                  <View style={styles.cardHeader}>
                    <Icon name="information-circle" size="md" color={Colors.primary.main} />
                    <Text style={styles.cardTitle}>More Details</Text>
                  </View>
                  <Text style={styles.explanationText}>{explanation}</Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.noTruthContainer}>
              <Icon name="alert-circle" size="xl" color={Colors.primary.light} />
              <Text style={styles.noTruthText}>
                No truth has been added yet for this lie.
              </Text>
              <TouchableOpacity 
                style={styles.addTruthButton}
                onPress={handleEdit}
              >
                <Icon name="add-circle" size="sm" color={Colors.white} />
                <Text style={styles.addTruthButtonText}>Add Truth</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        <View style={styles.bottomSpacer} />
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
    flex: 1,
    textAlign: 'center',
  },
  editButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  // Main Scroll Content
  scrollView: {
    flex: 1,
  },
  content: {
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
  // Lie Card
  lieCard: {
    borderRadius: 20,
    overflow: 'hidden',
    height: 200,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    marginHorizontal: 24,
    marginBottom: 24,
  },
  lieImage: {
    resizeMode: 'cover',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 24,
    justifyContent: 'center',
  },
  lieLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.error.main,
    marginBottom: 8,
    letterSpacing: 1.2,
  },
  lieText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 16,
    textAlign: 'center',
  },
  divider: {
    width: 40,
    height: 4,
    backgroundColor: Colors.error.main,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 16,
  },
  // Content Container
  contentContainer: {
    paddingHorizontal: 24,
  },
  // Truth Card
  truthCard: {
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
  truthText: {
    fontSize: 18,
    color: Colors.text.primary,
    lineHeight: 28,
    fontStyle: 'italic',
  },
  // Explanation Card
  explanationCard: {
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
  explanationText: {
    fontSize: 16,
    color: Colors.text.primary,
    lineHeight: 24,
  },
  // No Truth Container
  noTruthContainer: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  noTruthText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  addTruthButton: {
    backgroundColor: Colors.primary.main,
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addTruthButtonText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default TruthDetailScreen;
