import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import { Text, Surface, Button, TextInput, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Colors } from '../../constants';
import { Icon } from '../../components';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { submitProof } from '../../store/slices/commitmentsSlice';
// TODO: Install react-native-image-picker and @react-native-community/geolocation
// import { launchCamera, launchImageLibrary, Asset } from 'react-native-image-picker';
// import Geolocation from '@react-native-community/geolocation';

// Temporary placeholders until packages are installed
type Asset = { uri?: string; type?: string; fileName?: string };
const launchCamera = (options: any, callback: (response: any) => void) => {
  callback({ didCancel: true });
};
const launchImageLibrary = (options: any, callback: (response: any) => void) => {
  callback({ didCancel: true });
};
const Geolocation = {
  getCurrentPosition: (success: (position: any) => void, error: (error: any) => void, options?: any) => {
    error({ message: 'Geolocation not installed' });
  }
};

const UploadProofScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const activeCommitment = useAppSelector((state) => state.commitments.activeCommitment);
  const user = useAppSelector((state) => state.user);
  const submitting = useAppSelector((state) => state.commitments.loading.proof);

  const [selectedMedia, setSelectedMedia] = useState<Asset[]>([]);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [capturingLocation, setCapturingLocation] = useState(false);

  // Capture current location
  const captureLocation = () => {
    setCapturingLocation(true);
    Geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setCapturingLocation(false);
        Alert.alert('Success', 'Location captured successfully');
      },
      (error) => {
        console.error('Location error:', error);
        setCapturingLocation(false);
        Alert.alert(
          'Location Error',
          'Could not get your location. Please enable location services and try again.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => Linking.openSettings() },
          ]
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  // Launch camera
  const takePhoto = () => {
    launchCamera(
      {
        mediaType: 'mixed',
        quality: 0.8,
        includeBase64: false,
        saveToPhotos: true,
      },
      (response) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert('Camera Error', response.errorMessage || 'Failed to open camera');
          return;
        }
        if (response.assets) {
          setSelectedMedia((prev) => [...prev, ...response.assets!]);
          // Auto-capture location when photo is taken
          if (!location) {
            captureLocation();
          }
        }
      }
    );
  };

  // Pick from gallery
  const pickFromGallery = () => {
    launchImageLibrary(
      {
        mediaType: 'mixed',
        quality: 0.8,
        selectionLimit: 5,
      },
      (response) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert('Gallery Error', response.errorMessage || 'Failed to open gallery');
          return;
        }
        if (response.assets) {
          setSelectedMedia((prev) => [...prev, ...response.assets!]);
        }
      }
    );
  };

  // Remove media
  const removeMedia = (index: number) => {
    setSelectedMedia((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit proof
  const handleSubmit = async () => {
    if (!activeCommitment) {
      Alert.alert('Error', 'No active commitment found');
      return;
    }

    if (selectedMedia.length === 0) {
      Alert.alert('No Media', 'Please add at least one photo or video as proof');
      return;
    }

    if (!location) {
      Alert.alert(
        'Location Required',
        'Please capture your current location to verify you completed the action',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Capture Location', onPress: captureLocation },
        ]
      );
      return;
    }

    if (!description.trim()) {
      Alert.alert('Description Required', 'Please add a description of what you did');
      return;
    }

    try {
      await dispatch(
        submitProof({
          commitmentId: activeCommitment.id,
          mediaFile: new Blob(), // Placeholder - will be fixed when packages installed
          payload: {
            mediaType: 'photo',
            userNotes: description.trim(),
            latitude: location.latitude,
            longitude: location.longitude,
            capturedAt: new Date().toISOString(),
          },
        })
      ).unwrap();

      Alert.alert('Success!', 'Your proof has been submitted', [
        {
          text: 'OK',
          onPress: () => navigation.replace('ProofSubmitted' as any),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Submission Failed', error?.message || 'Failed to submit proof');
    }
  };

  if (!activeCommitment) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Icon name="alert-circle-outline" size={64} color={Colors.error.main} />
          <Text style={styles.errorText}>No active commitment found</Text>
          <Button mode="contained" onPress={() => navigation.navigate('Home')} style={styles.button}>
            Go Home
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Icon name="camera-outline" size={64} color={Colors.primary.main} />
          <Text style={styles.title}>Upload Proof</Text>
          <Text style={styles.subtitle}>
            Show that you completed: {activeCommitment.action?.title}
          </Text>
        </View>

        {/* Action Requirements */}
        <Surface style={styles.requirementsCard}>
          <View style={styles.requirementsHeader}>
            <Icon name="checkbox-outline" size={24} color={Colors.primary.main} />
            <Text style={styles.requirementsTitle}>Proof Requirements</Text>
          </View>
          <View style={styles.requirementsList}>
            {activeCommitment.action?.proofRequirements?.map((req, index) => (
              <View key={index} style={styles.requirementItem}>
                <Icon name="checkmark-circle" size={20} color={Colors.success.main} />
                <Text style={styles.requirementText}>{req}</Text>
              </View>
            ))}
          </View>
        </Surface>

        {/* Media Upload Section */}
        <Surface style={styles.uploadCard}>
          <Text style={styles.sectionTitle}>Photos/Videos</Text>
          <Text style={styles.sectionSubtitle}>
            Take photos or videos showing you completing the action
          </Text>

          <View style={styles.mediaButtons}>
            <Button
              mode="contained"
              onPress={takePhoto}
              icon="camera"
              style={[styles.mediaButton, styles.cameraButton]}
              contentStyle={styles.mediaButtonContent}
            >
              Take Photo/Video
            </Button>
            <Button
              mode="outlined"
              onPress={pickFromGallery}
              icon="image"
              style={styles.mediaButton}
              contentStyle={styles.mediaButtonContent}
            >
              Choose from Gallery
            </Button>
          </View>

          {/* Media Preview Grid */}
          {selectedMedia.length > 0 && (
            <View style={styles.mediaGrid}>
              {selectedMedia.map((media, index) => (
                <View key={index} style={styles.mediaItem}>
                  <Image source={{ uri: media.uri }} style={styles.mediaImage} />
                  <TouchableOpacity
                    style={styles.removeMediaButton}
                    onPress={() => removeMedia(index)}
                  >
                    <Icon name="close-circle" size={24} color={Colors.error.main} />
                  </TouchableOpacity>
                  {media.type?.startsWith('video') && (
                    <View style={styles.videoOverlay}>
                      <Icon name="play-circle" size={32} color={Colors.white} />
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </Surface>

        {/* Location Section */}
        <Surface style={styles.locationCard}>
          <View style={styles.locationHeader}>
            <Icon name="location-outline" size={24} color={Colors.primary.main} />
            <Text style={styles.sectionTitle}>Location Verification</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            We need your location to verify you completed the action at the right place
          </Text>

          {location ? (
            <View style={styles.locationCaptured}>
              <Icon name="checkmark-circle" size={32} color={Colors.success.main} />
              <View style={styles.locationInfo}>
                <Text style={styles.locationText}>Location Captured</Text>
                <Text style={styles.locationCoords}>
                  {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </Text>
              </View>
            </View>
          ) : (
            <Button
              mode="contained"
              onPress={captureLocation}
              icon="navigate"
              loading={capturingLocation}
              disabled={capturingLocation}
              style={styles.locationButton}
              contentStyle={styles.mediaButtonContent}
            >
              {capturingLocation ? 'Getting Location...' : 'Capture Current Location'}
            </Button>
          )}
        </Surface>

        {/* Description Section */}
        <Surface style={styles.descriptionCard}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.sectionSubtitle}>Describe what you did and how it went</Text>
          <TextInput
            mode="outlined"
            value={description}
            onChangeText={setDescription}
            placeholder="Example: I spent 3 hours serving meals at the local homeless shelter. It was a humbling experience..."
            multiline
            numberOfLines={6}
            style={styles.descriptionInput}
            maxLength={1000}
          />
          <Text style={styles.characterCount}>{description.length}/1000</Text>
        </Surface>

        {/* Submit Button */}
        <View style={styles.submitSection}>
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={submitting}
            disabled={submitting || selectedMedia.length === 0 || !location || !description.trim()}
            style={styles.submitButton}
            contentStyle={styles.submitButtonContent}
            icon="cloud-upload"
          >
            {submitting ? 'Submitting...' : 'Submit Proof'}
          </Button>
          <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.cancelButton}>
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
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
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
  errorText: {
    fontSize: 18,
    color: Colors.text.secondary,
    marginTop: 16,
    textAlign: 'center',
  },
  requirementsCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: Colors.background.secondary,
    elevation: 2,
  },
  requirementsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  requirementsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginLeft: 8,
  },
  requirementsList: {
    gap: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  requirementText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  uploadCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: Colors.background.secondary,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  mediaButtons: {
    gap: 12,
    marginBottom: 16,
  },
  mediaButton: {
    borderRadius: 8,
  },
  cameraButton: {
    backgroundColor: Colors.primary.main,
  },
  mediaButtonContent: {
    paddingVertical: 8,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mediaItem: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  removeMediaButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  locationCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: Colors.background.secondary,
    elevation: 2,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationButton: {
    borderRadius: 8,
    backgroundColor: Colors.primary.main,
  },
  locationCaptured: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.success.light,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.success.main,
  },
  locationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.success.dark,
    marginBottom: 4,
  },
  locationCoords: {
    fontSize: 12,
    color: Colors.success.dark,
  },
  descriptionCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    backgroundColor: Colors.background.secondary,
    elevation: 2,
  },
  descriptionInput: {
    backgroundColor: Colors.background.primary,
    minHeight: 120,
  },
  characterCount: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'right',
    marginTop: 8,
  },
  submitSection: {
    gap: 12,
    marginBottom: 24,
  },
  submitButton: {
    borderRadius: 8,
    backgroundColor: Colors.primary.main,
  },
  submitButtonContent: {
    paddingVertical: 12,
  },
  cancelButton: {
    borderRadius: 8,
  },
  button: {
    borderRadius: 8,
    marginTop: 16,
  },
});

export default UploadProofScreen;
