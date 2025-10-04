import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Surface, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Colors } from '../../constants';
import { Icon } from '../../components';

const DeadlineMissedScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Error Icon */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Icon name="close-circle" size={100} color={Colors.error.main} />
          </View>
          <Text style={styles.title}>Deadline Missed</Text>
          <Text style={styles.subtitle}>You didn't complete the action within 48 hours</Text>
        </View>

        {/* What Happened */}
        <Surface style={styles.explanationCard}>
          <Text style={styles.cardTitle}>What Happened?</Text>
          <Text style={styles.explanationText}>
            When you reported a relapse, you committed to completing a service action within 48 hours.
            Unfortunately, the deadline has passed without receiving proof of completion.
          </Text>
        </Surface>

        {/* Consequences */}
        <Surface style={styles.consequencesCard}>
          <View style={styles.consequencesHeader}>
            <Icon name="alert-circle-outline" size={32} color={Colors.error.main} />
            <Text style={styles.cardTitle}>Consequences</Text>
          </View>
          <View style={styles.consequencesList}>
            <View style={styles.consequenceItem}>
              <Icon name="close-circle-outline" size={20} color={Colors.error.main} />
              <Text style={styles.consequenceText}>Your commitment has ended</Text>
            </View>
            <View style={styles.consequenceItem}>
              <Icon name="close-circle-outline" size={20} color={Colors.error.main} />
              <Text style={styles.consequenceText}>
                This will be recorded in your history
              </Text>
            </View>
            <View style={styles.consequenceItem}>
              <Icon name="close-circle-outline" size={20} color={Colors.error.main} />
              <Text style={styles.consequenceText}>
                Your accountability partner has been notified
              </Text>
            </View>
          </View>
        </Surface>

        {/* Reflection Section */}
        <Surface style={styles.reflectionCard}>
          <Text style={styles.cardTitle}>Take a Moment to Reflect</Text>
          <Text style={styles.reflectionText}>
            Accountability isn't about punishment—it's about growth. Missing this deadline is an opportunity
            to understand what went wrong and build better systems for next time.
          </Text>
          <View style={styles.reflectionQuestions}>
            <Text style={styles.questionTitle}>Consider these questions:</Text>
            <Text style={styles.question}>• What prevented you from completing the action?</Text>
            <Text style={styles.question}>• Was the action too difficult or time-consuming?</Text>
            <Text style={styles.question}>
              • Do you need a different support system or commitment type?
            </Text>
            <Text style={styles.question}>• Are you ready to try again?</Text>
          </View>
        </Surface>

        {/* Next Steps */}
        <Surface style={styles.nextStepsCard}>
          <Text style={styles.cardTitle}>What's Next?</Text>
          <View style={styles.optionsList}>
            <View style={styles.optionItem}>
              <View style={styles.optionNumber}>
                <Text style={styles.optionNumberText}>1</Text>
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Create a New Commitment</Text>
                <Text style={styles.optionDescription}>
                  Start fresh with a new commitment. Choose an easier action or a different accountability
                  structure.
                </Text>
              </View>
            </View>

            <View style={styles.optionItem}>
              <View style={styles.optionNumber}>
                <Text style={styles.optionNumberText}>2</Text>
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Talk to Your Partner</Text>
                <Text style={styles.optionDescription}>
                  Have an honest conversation with your accountability partner about what support you need.
                </Text>
              </View>
            </View>

            <View style={styles.optionItem}>
              <View style={styles.optionNumber}>
                <Text style={styles.optionNumberText}>3</Text>
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Seek Additional Support</Text>
                <Text style={styles.optionDescription}>
                  Consider joining a community group or seeking professional help for additional support.
                </Text>
              </View>
            </View>
          </View>
        </Surface>

        {/* Encouragement */}
        <Surface style={styles.encouragementCard}>
          <Icon name="heart-outline" size={48} color={Colors.primary.main} />
          <Text style={styles.encouragementTitle}>You're Not Alone</Text>
          <Text style={styles.encouragementText}>
            Setbacks are part of the journey. What matters is that you keep moving forward. Your worth isn't
            defined by your struggles, but by your willingness to keep fighting.
          </Text>
        </Surface>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('ChooseCommitmentType')}
            style={styles.primaryButton}
            contentStyle={styles.buttonContent}
            icon="refresh"
          >
            Create New Commitment
          </Button>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('PartnersList')}
            style={styles.button}
            icon="people-outline"
          >
            Talk to Partner
          </Button>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('AllGroups')}
            style={styles.button}
            icon="earth-outline"
          >
            Join Community
          </Button>
          <Button mode="text" onPress={() => navigation.navigate('Home')} style={styles.button}>
            Go Home
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
    marginVertical: 32,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.error.light + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 8,
  },
  explanationCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: Colors.background.secondary,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  explanationText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  consequencesCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: Colors.error.light + '15',
    borderWidth: 1,
    borderColor: Colors.error.light,
    elevation: 2,
  },
  consequencesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  consequencesList: {
    gap: 12,
  },
  consequenceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  consequenceText: {
    flex: 1,
    fontSize: 14,
    color: Colors.error.dark,
    lineHeight: 20,
  },
  reflectionCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: Colors.background.secondary,
    elevation: 2,
  },
  reflectionText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  reflectionQuestions: {
    backgroundColor: Colors.background.primary,
    padding: 16,
    borderRadius: 8,
  },
  questionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  question: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 24,
  },
  nextStepsCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: Colors.background.secondary,
    elevation: 2,
  },
  optionsList: {
    gap: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  optionNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionNumberText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  encouragementCard: {
    padding: 24,
    borderRadius: 12,
    marginBottom: 24,
    backgroundColor: Colors.primary.light + '15',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary.light,
  },
  encouragementTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginTop: 12,
    marginBottom: 8,
  },
  encouragementText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    textAlign: 'center',
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

export default DeadlineMissedScreen;
