import React from 'react';
import { View, StyleSheet, ScrollView, ImageBackground, Dimensions, Pressable } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, ScreenHeader } from '../components';
import { Colors } from '../constants';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

const { width: screenWidth } = Dimensions.get('window');

const FastingScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ScreenHeader 
          title="Fasting" 
          iconName="settings-outline" 
          navigation={navigation} 
        />
        <ScrollView>
          <Text style={styles.mainTitle}>
            Fasting is a powerful spiritual discipline that can bring you closer to God.
          </Text>
          
          <Text style={styles.description}>
            Fasting is a spiritual discipline that involves abstaining from food for a specific period to focus on prayer and seeking God's presence. It's a way to humble ourselves, seek guidance, and align our hearts with His will.
          </Text>

          <View style={styles.testimonialContainer}>
            <ImageBackground
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjMIO37Ea7Dim5t4Bnibqdsr-3VMH17PFayqtw7kFGijKLLswJoV0vzJFIAWvXLPNQR14mogD26DN34PVMmbSU6eiYZfet9Ew7-G-5vrIueIObkSQLxh8oh-4LZ0OTqo8JWQCsj2zz417x-G4n3AY1X8tPeLAYNEzykMLZgEkZ8VsoskAngy9i2bwwMym7dEPlUtIRx7J9R4MJO6O89STGkBybbYH5NkjwtUb-OVb8upLtLzLMiSaqS19mTTm7cUdU0ouq-JPhGztG' }}
              style={styles.testimonialBg}
              imageStyle={styles.testimonialImage}
            >
              <View style={styles.testimonialContent}>
                <View style={styles.testimonialTextContainer}>
                  <Text style={styles.testimonialTitle}>From Chains to Freedom</Text>
                  <Text style={styles.testimonialDescription}>
                    I overcame a 10-year addiction through fasting and prayer. God's grace is real.
                  </Text>
                </View>
                <Button
                  mode="contained"
                  style={styles.readMoreButton}
                  labelStyle={styles.readMoreButtonText}
                  onPress={() => {}}
                >
                  Read More
                </Button>
              </View>
            </ImageBackground>
          </View>

          <Text style={styles.sectionTitle}>Recommended Prayers</Text>
          <Text style={styles.sectionDescription}>
            During your fast, focus on prayers for strength and guidance. Prayer is essential in overcoming addiction and finding peace.
          </Text>

          <View style={styles.buttonContainer}>
           

            <Button
              mode="contained"
              style={styles.startButton}
              labelStyle={styles.startButtonText}
              onPress={() => navigation.navigate('StartFast')}
            >
              Start Fasting
            </Button>

            
          </View>
        </ScrollView>
      </View>

     
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  content: {
    flex: 1,
  },
  mainTitle: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 32,
    paddingHorizontal: 16,
    textAlign: 'center',
    paddingBottom: 8,
    paddingTop: 20,
  },
  description: {
    color: Colors.white,
    fontSize: 16,
    lineHeight: 24,
    paddingHorizontal: 16,
    textAlign: 'center',
    paddingBottom: 12,
    paddingTop: 4,
  },
  testimonialContainer: {
    padding: 16,
  },
  testimonialBg: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  testimonialImage: {
    borderRadius: 12,
  },
  testimonialContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  testimonialTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  testimonialTitle: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  testimonialDescription: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
  readMoreButton: {
    backgroundColor: Colors.primary.main,
    borderRadius: 8,
    minWidth: 84,
    height: 40,
  },
  readMoreButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 16,
  },
  sectionDescription: {
    color: Colors.white,
    fontSize: 16,
    lineHeight: 24,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    gap: 12,
    paddingVertical: 12,
  },
  prayerButton: {
    backgroundColor: Colors.background.tertiary,
    borderRadius: 8,
    height: 40,
  },
  startButton: {
    backgroundColor: Colors.primary.main,
    borderRadius: 8,
    height: 48,
  },
  supportButton: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    height: 40,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  supportButtonText: {
    color: Colors.white,
  },
  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.border.primary,
    backgroundColor: Colors.background.secondary,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  navText: {
    color: '#93acc8',
    fontSize: 12,
    fontWeight: '500',
  },
  activeNavText: {
    color: Colors.white,
  },
});

export default FastingScreen;
