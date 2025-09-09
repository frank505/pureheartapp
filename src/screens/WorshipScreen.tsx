import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  ImageStyle,
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { Colors } from '../constants';

interface WorshipScreenProps {
  navigation?: any;
  route?: any;
}

const WorshipScreen: React.FC<WorshipScreenProps> = ({ navigation }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleClose = () => {
    navigation?.goBack();
  };

  const playlist = [
    {
      id: '1',
      title: 'Grace Upon Grace',
      artist: 'The Faithful',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_F6OrXGEstqlSjNNr_vl3o-Di5NWmpSq2DVM3rYe3sLsFPRNKvX9gTo5OOntze463zfhVQx1XSfuzPnuN5gfPJtKeLdoR355fRbzKZ8JV35vRX1mOe7OwD4YSgeFobB0tM-R5p2HeahK5imjdFancVDUoUeTQg7vcN2g7bngMBi4S6SZElOiHQTe5SRTEWAeTldGIRCUzmW3MzOWlBbmfs2QAld1D5NhGyWiLMNKmu2eIaz0CFcQ84GyC2SIqt6Y_JJk3P7I78yA'
    },
    {
      id: '2',
      title: 'Everlasting Love',
      artist: 'The Faithful',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAI5bNPry7sAjgm_N72pJ53MBirC2m4n7YlqWW7wkRZT8-FagWfuz6E35LLg8MMKd62fynizGft2pmfP4Cskyh0WtkHP7P0Gteer7XZvhB-bFyhxwEMEbb3PZ6oPkHQrMdD0nB9wZ4YYvtWMtDuAAzzteGpNyhwTeFXb_ej1HY2X7b7I6TMOf_pDhj5rSa4mld6bxgXDo5Rj0ZDOLmaZOZWjniuHM3GoPIlLewPwkjJ9M1yuc2TiP6QrdDlQX8Vfz432bA0BXFPpb4'
    },
    {
      id: '3',
      title: "Hope's Anthem",
      artist: 'The Faithful',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBdgdVDFg5o0N1KbqLi77SthZ3HT9s9WOBOehWSPXlFh9sUHnqzPGD_GlfGoZXqNL4fhaB_xZSd0XKoJVMqvc4-9tc0RSQvWL4wTPeMl6OW5gYhMeycfEkgPpc5x9WGqyLxAaIUju2Mqc4pACeS2W9GRQJ_3QEoLXwopuVSVZTBSOEcOoh_l_EUeaMef3U3oZ7Zodo2Q3stTNwPbGQvqb7DVuaLhFuciNYdmpDFadWpSDHkoI9DmFXpY770xcu-SPA0l7ZAL0m-90'
    },
    {
      id: '4',
      title: "Faith's Embrace",
      artist: 'The Faithful',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCPBai8ydlVmE7uldBHhFVQ68lg5L1PnuAbuCGiVQNKNo1M8fL7nBtRpLn1ensVDrvENAlEYv4NjRpPqTF61NOLvrIfZn39ZuEfZ4-_3uONhDR61uat-Jl7IyGUdsihP5NoCHhTXWIYb8zhrRKyK0I1Awm-FpFzug2mpVfg3Gy97vFXlRE0kI-4YrtbH_O9d69s8tEKu4Onk_fR8XC9DtSYyAz7f5TrBOnPHbE4kyweHM32lZyfiX7MM3Ygn4YL7lRGTT3GakIePOU'
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Icon name="close-outline" size="lg" color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Worship For the day</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Main Album Art */}
          <View style={styles.albumArtContainer}>
            <ImageBackground
              source={{ uri: playlist[0].image }}
              style={styles.albumArt}
              imageStyle={styles.albumArtImage}
            />
          </View>

          {/* Song Info */}
          <View style={styles.songInfoContainer}>
            <Text style={styles.songTitle}>{playlist[0].title}</Text>
            <Text style={styles.artistName}>{playlist[0].artist}</Text>
          </View>

          {/* Player Controls */}
          <View style={styles.controlsContainer}>
            <TouchableOpacity style={styles.controlButton}>
              <Icon name="skip-back" size="xl" color="#47a7eb" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton}>
              <Icon name="play-back" size="xl" color="#47a7eb" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.playButton}
              onPress={() => setIsPlaying(!isPlaying)}
            >
              <Icon 
                name={isPlaying ? "pause" : "play"} 
                size="xl" 
                color="#111b22"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton}>
              <Icon name="play-forward" size="xl" color="#47a7eb" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton}>
              <Icon name="skip-forward" size="xl" color="#47a7eb" />
            </TouchableOpacity>
          </View>

          {/* Interaction Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Icon name="heart-outline" size="lg" color="#93b2c8" />
              <Text style={styles.statText}>12K</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="bookmark-outline" size="lg" color="#93b2c8" />
              <Text style={styles.statText}>2K</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="share-outline" size="lg" color="#93b2c8" />
              <Text style={styles.statText}>1K</Text>
            </View>
          </View>

          {/* Playlist Section */}
          <Text style={styles.playlistTitle}>Playlist</Text>
          {playlist.map((song) => (
            <TouchableOpacity 
              key={song.id}
              style={styles.playlistItem}
            >
              <ImageBackground
                source={{ uri: song.image }}
                style={styles.songThumb}
                imageStyle={styles.songThumbImage}
              />
              <View style={styles.songDetails}>
                <Text style={styles.playlistSongTitle}>{song.title}</Text>
                <Text style={styles.playlistArtistName}>{song.artist}</Text>
              </View>
            </TouchableOpacity>
          ))}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 8,
  },
  closeButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 48,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  albumArtContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
  },
  albumArt: {
    width: 256,
    height: 256,
    borderRadius: 12,
    overflow: 'hidden',
  },
  albumArtImage: {
    borderRadius: 12,
    resizeMode: 'cover',
  } as ImageStyle,
  songInfoContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  songTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 4,
  },
  artistName: {
    fontSize: 16,
    color: '#93b2c8',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    paddingVertical: 4,
    marginTop: 16,
  },
  controlButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#47a7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
  },
  statText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#93b2c8',
  },
  playlistTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.white,
    marginTop: 20,
    marginBottom: 12,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 8,
    minHeight: 72,
  },
  songThumb: {
    width: 56,
    height: 56,
    borderRadius: 8,
    overflow: 'hidden',
  },
  songThumbImage: {
    borderRadius: 8,
    resizeMode: 'cover',
  } as ImageStyle,
  songDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  playlistSongTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.white,
  },
  playlistArtistName: {
    fontSize: 14,
    color: '#93b2c8',
  },
});

export default WorshipScreen;
