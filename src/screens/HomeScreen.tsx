import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Modal, Alert, TextInput, Animated, Easing, Linking, Platform } from 'react-native';
import RNShare from 'react-native-share';
import messaging, { AuthorizationStatus } from '@react-native-firebase/messaging';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Polyline, Circle } from 'react-native-svg';
import { Colors, ColorUtils } from '../constants';
import { TabIcon } from '../components/Icon';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import ScreenHeader from '../components/ScreenHeader';
import { subDays, addDays, format, isSameDay } from 'date-fns';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchCheckIns, createCheckIn } from '../store/slices/checkinsSlice';
import { getStreaks } from '../store/slices/streaksSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchPartners } from '../store/slices/invitationSlice';
import { ContentFilter } from '../services/contentFilter';
import userFirstsService, { UserFirstsFlags } from '../services/userFirstsService';

const { width, height: winHeight } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const chartWidth = useMemo(() => Math.min(width - 40, 340), []);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const daysRef = useRef<ScrollView>(null);
  const dispatch = useAppDispatch();
  const checkins = useAppSelector((s) => s.checkins.items);
  const streaks = useAppSelector((s) => s.streaks.streaks);
  const { connectedPartners, groups } = useAppSelector((s) => s.invitation || ({} as any));
  const [tick, setTick] = useState(0);
  // Which action button is currently selected (for green ring). None by default.
  const [selectedAction, setSelectedAction] = useState<null | 'tapIn' | 'history' | 'reflections' | 'relapsed'>(null);

  // Tap in modal state (minimal check-in: note + submit)
  const [checkinVisible, setCheckinVisible] = useState(false);
  const [note, setNote] = useState('');
  const [moodValue, setMoodValue] = useState(0.75);
  const [creating, setCreating] = useState(false);
  type Visibility = 'private' | 'allPartners' | 'selectPartners' | 'group';
  const [visibilityOption, setVisibilityOption] = useState<Visibility>('private');
  const [selectedPartnerIds, setSelectedPartnerIds] = useState<string[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);

  // External community links and actions
  const REDDIT_URL = 'https://www.reddit.com'; // TODO: replace with your Reddit community link
  const handleShareApp = useCallback(async () => {
    try {
      const APP_STORE_URL = 'https://apps.apple.com/app/pureheart/id123456789';
      const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.pureheart';
      await RNShare.open({
        title: 'Join me on The Purity App',
        message: `I am finding freedom with The Purity App. Walk with me.\n\nDownload: \n• iOS: ${APP_STORE_URL}\n• Android: ${PLAY_STORE_URL}`,
        failOnCancel: false,
      });
    } catch {}
  }, []);

  // Setup statuses
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const [contentFilterOn, setContentFilterOn] = useState<boolean>(false);
  const [redditJoined, setRedditJoined] = useState<boolean>(false);
  const [hasShared, setHasShared] = useState<boolean>(false);
  const [firsts, setFirsts] = useState<UserFirstsFlags | null>(null);

  const refreshFirsts = useCallback(async () => {
    try {
      const f = await userFirstsService.getUserFirsts();
      setFirsts(f);
      setRedditJoined(Boolean(f?.has_joined_reddit));
      setHasShared(Boolean(f?.has_shared_with_a_friend));
    } catch {
      // noop
    }
  }, []);

  const refreshNotificationsStatus = useCallback(async () => {
    try {
      // Try hasPermission (cast to any for compatibility), else requestPermission
      const anyMessaging: any = messaging();
      let status: number | undefined = undefined;
      if (typeof anyMessaging.hasPermission === 'function') {
        status = await anyMessaging.hasPermission();
      } else if (typeof anyMessaging.getAuthorizationStatus === 'function') {
        status = await anyMessaging.getAuthorizationStatus();
      }
      if (status == null) {
        // Do not prompt here; just infer via requestPermission with provisional on iOS
        const req = await messaging().requestPermission({ provisional: true });
        status = req as any;
      }
  const enabled = status === AuthorizationStatus.AUTHORIZED || status === AuthorizationStatus.PROVISIONAL;
      setNotificationsEnabled(Boolean(enabled));
    } catch (e) {
      setNotificationsEnabled(false);
    }
  }, []);

  const refreshContentFilterStatus = useCallback(async () => {
    if (Platform.OS !== 'ios') { setContentFilterOn(false); return; }
    try {
      const on = await ContentFilter.isFilterEnabled();
      setContentFilterOn(Boolean(on));
    } catch {
      setContentFilterOn(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshNotificationsStatus();
      refreshContentFilterStatus();
    refreshFirsts();
    }, [refreshNotificationsStatus, refreshContentFilterStatus])
  );

  // Also load firsts on initial mount (in case screen is already focused)
  useEffect(() => { refreshFirsts(); }, [refreshFirsts]);

  // Daily Reflections modal state
  const [reflectionsVisible, setReflectionsVisible] = useState(false);
  const defaultReflections = useMemo(
    () => [
      'Walk by the Spirit, and you will not gratify the desires of the flesh. (Gal 5:16)',
      'You are not your past; you are God’s beloved, renewed daily.',
      'Small obediences stack into great freedom. Keep going.',
      'His grace empowers what His truth reveals. Breathe and receive.',
      'Fix your eyes on Jesus; He is faithful to finish what He started.'
    ],
    []
  );
  const [reflections, setReflections] = useState<string[]>(defaultReflections);
  const [reflectionIndex, setReflectionIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const textTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Reflections background animation
  const gradientSets = useMemo(
    () => [
      ['#0f172a', '#1e293b', '#0ea5e9'],
      ['#0f172a', '#1e293b', '#a855f7'],
      ['#0b132b', '#1c2541', '#3a506b'],
      ['#0f172a', '#334155', '#22d3ee'],
      ['#0f172a', '#1e293b', '#10b981'],
      ['#0f172a', '#1e293b', '#f97316'],
      ['#101828', '#1f2937', '#6366f1'],
      ['#0f172a', '#1e293b', '#ef4444'],
    ],
    []
  );
  const [bgIndex, setBgIndex] = useState(0);
  const [nextBgIndex, setNextBgIndex] = useState(1);
  const bgFade = useRef(new Animated.Value(0)).current;
  const bgTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const orbPulse = useRef(new Animated.Value(0)).current;
  const orbPulse2 = useRef(new Animated.Value(0)).current;
  // Load daily reflections from API; fallback to defaults
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Dynamically import service to avoid cycle if any
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const { default: _ref } = await import('../services/reflectionsService');
        const items = await _ref.getTodayReflections(tz);
        if (!mounted) return;
        if (items && items.length) {
          const sorted = items.slice().sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
          setReflections(sorted.map((r: any) => r.body));
        } else {
          setReflections(defaultReflections);
        }
      } catch {
        if (mounted) setReflections(defaultReflections);
      }
    })();
    return () => { mounted = false; };
  }, []);
  // Falling streak (projectile-like) state/anim
  const dropProg = useRef(new Animated.Value(0)).current;
  const [dropStartX, setDropStartX] = useState(0);
  const [dropDriftX, setDropDriftX] = useState(0);
  const [dropRotate, setDropRotate] = useState(0);
  const dropTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Build last 7 days, oldest -> newest (assumption: includes today)
  const last7Days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => subDays(today, 6 - i));
  }, []);

  // Fetch check-ins for the last 7 days on screen focus (ensures fresh data for "today")
  useFocusEffect(
    useCallback(() => {
      const from = format(subDays(new Date(), 6), 'yyyy-MM-dd');
      const to = format(addDays(new Date(), 1), 'yyyy-MM-dd');
      dispatch(fetchCheckIns({ from, to, limit: 200 }));
      dispatch(getStreaks());
      dispatch(fetchPartners());
    }, [dispatch])
  );

  // Determine start of current streak to compute live timer
  const streakStartDate = useMemo(() => {
    const days = streaks?.currentStreak ?? 0;
    if (streaks?.streakDates && streaks.streakDates.length > 0) {
      // API may return strings; ensure Date
      const first = new Date(streaks.streakDates[0] as any);
      if (!isNaN(first.getTime())) return first;
    }
    // Fallback: approximate by subtracting days (start of days ago)
    const approx = subDays(new Date(), days);
    return approx;
  }, [streaks?.currentStreak, streaks?.streakDates]);

  // Live countdown: total time since streak start (updates every second)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Helper to compute mark for a given day based on check-ins (local same-day)
  const getMarkForDate = useCallback((date: Date) => {
    let hasAny = false;
    let hasRelapse = false;
    for (const c of checkins) {
      if (!c?.createdAt) continue;
      const d = new Date(c.createdAt);
      if (isSameDay(d, date)) {
        hasAny = true;
        if (c.status === 'relapse') { hasRelapse = true; break; }
      }
    }
    if (hasRelapse) return 'x';
    if (hasAny) return '✓';
    return '-';
  }, [checkins]);

  // Reflections animations (text + background) using scheduled timeouts
  useEffect(() => {
    if (!reflectionsVisible) {
      if (textTimerRef.current) { clearTimeout(textTimerRef.current); textTimerRef.current = null; }
      if (bgTimeoutRef.current) { clearTimeout(bgTimeoutRef.current); bgTimeoutRef.current = null; }
  if (dropTimerRef.current) { clearTimeout(dropTimerRef.current); dropTimerRef.current = null; }
      return;
    }

    const scheduleTextCycle = () => {
      textTimerRef.current = setTimeout(() => {
        Animated.timing(fadeAnim, { toValue: 0, duration: 900, useNativeDriver: true, easing: Easing.inOut(Easing.cubic) }).start(() => {
          setReflectionIndex((i) => (i + 1) % reflections.length);
          Animated.timing(fadeAnim, { toValue: 1, duration: 1600, useNativeDriver: true, easing: Easing.inOut(Easing.cubic) }).start(() => {
            scheduleTextCycle();
          });
        });
      }, 12000);
    };
    scheduleTextCycle();

    const pickNextIndex = () => {
      const n = gradientSets.length;
      let idx = Math.floor(Math.random() * n);
      if (idx === bgIndex) idx = (idx + 1) % n;
      setNextBgIndex(idx);
      Animated.timing(bgFade, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }).start(() => {
        setBgIndex(idx);
        bgFade.setValue(0);
        bgTimeoutRef.current = setTimeout(pickNextIndex, 18000);
      });
    };
    bgTimeoutRef.current = setTimeout(pickNextIndex, 6000);

    // pulsing orbs (up/down sequence to avoid jumps)
    Animated.loop(
      Animated.sequence([
        Animated.timing(orbPulse, { toValue: 1, duration: 9000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(orbPulse, { toValue: 0, duration: 9000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    ).start();
    const orb2Timeout = setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(orbPulse2, { toValue: 1, duration: 12000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(orbPulse2, { toValue: 0, duration: 12000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ])
      ).start();
    }, 800);

    // Falling streak scheduler
    const launchDrop = () => {
      // pick random start X within screen bounds (with margin)
      const startX = Math.max(16, Math.min(width - 16, Math.random() * width));
      const drift = (Math.random() - 0.5) * 160; // -80..80 horizontal drift
      const rot = (Math.random() - 0.5) * 24; // -12..12 degrees
      setDropStartX(startX);
      setDropDriftX(drift);
      setDropRotate(rot);
      dropProg.setValue(0);
      Animated.timing(dropProg, {
        toValue: 1,
        duration: 2200,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        // schedule next drop in 2.5s - 5.5s
        dropTimerRef.current = setTimeout(launchDrop, 2500 + Math.random() * 3000);
      });
    };
    // initial delay to avoid overlapping with first bg fade
    dropTimerRef.current = setTimeout(launchDrop, 1400);

    return () => {
      if (textTimerRef.current) clearTimeout(textTimerRef.current);
      textTimerRef.current = null;
      if (bgTimeoutRef.current) clearTimeout(bgTimeoutRef.current);
      bgTimeoutRef.current = null;
      if (dropTimerRef.current) clearTimeout(dropTimerRef.current);
      dropTimerRef.current = null;
      clearTimeout(orb2Timeout);
    };
  }, [reflectionsVisible]);

  const timeSinceStreakStart = useMemo(() => {
    const now = new Date();
    const start = streakStartDate;
    const diffMs = Math.max(0, now.getTime() - start.getTime());
    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / (24 * 3600));
    const rem = totalSeconds - days * 24 * 3600;
    const hrs = Math.floor(rem / 3600);
    const mins = Math.floor((rem % 3600) / 60);
    const secs = rem % 60;
    return { days, hrs, mins, secs };
  }, [streakStartDate, tick]);

  // Relapse check-in handler (ported from OldHomeScreen, simplified)
  const handleRelapsed = useCallback(() => {
    Alert.alert(
      'Record a Relapse',
      'This will reset your streak count to 0. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, I Relapsed',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(
                createCheckIn({ mood: 0.25, note: 'I struggled today and relapsed.', visibility: 'private', status: 'relapse' } as any)
              ).unwrap();
              try { await AsyncStorage.removeItem('ph_milestones_celebrated'); } catch {}
              Alert.alert('Streak Reset', 'Your relapse has been recorded and your streak has been reset to 0. Tomorrow is a fresh start.');
              dispatch(getStreaks());
              const from = format(subDays(new Date(), 6), 'yyyy-MM-dd');
              const to = format(addDays(new Date(), 1), 'yyyy-MM-dd');
              dispatch(fetchCheckIns({ from, to, limit: 200 }));
            } catch (e: any) {
              Alert.alert('Error', e?.message || 'Failed to record relapse');
            }
          },
        },
      ]
    );
  }, [dispatch]);

  // Scripture mapping exactly as OldHomeScreen
  const scriptureText = useMemo(() => {
    const currentStreak = streaks?.currentStreak ?? 0;
    if (currentStreak === 0) {
  return '"No temptation has overtaken you except what is common to mankind. And God is faithful; he will not let you be tempted beyond what you can bear. But when you are tempted, he will also provide a way out." (1 Corinthians 10:13)';
    } else if (currentStreak <= 7) {
  return '"Submit yourselves, then, to God. Resist the devil, and he will flee from you." (James 4:7)';
    } else if (currentStreak <= 30) {
  return '"It is for freedom that Christ has set us free. Stand firm, then, and do not let yourselves be burdened again by a yoke of slavery." (Galatians 5:1)';
    } else if (currentStreak <= 90) {
  return '"I have been crucified with Christ and I no longer live, but Christ lives in me. The life I now live in the body, I live by faith in the Son of God." (Galatians 2:20)';
    } else if (currentStreak <= 180) {
  return '"Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!" (2 Corinthians 5:17)';
    } else if (currentStreak <= 365) {
  return '"You, dear children, are from God and have overcome them, because the one who is in you is greater than the one who is in the world." (1 John 4:4)';
    } else {
  return '"Then you will know the truth, and the truth will set you free... So if the Son sets you free, you will be free indeed." (John 8:32,36)';
    }
  }, [streaks?.currentStreak]);

  // Partner choices derived from connectedPartners (fallbacks included)
  const partnerChoices = useMemo(() => {
    const list = (connectedPartners || []) as any[];
    return list.map((p: any) => ({
      id: p?.partner?.id ?? p?.id,
      name: p?.partner ? `${p.partner.firstName ?? ''} ${p.partner.lastName ?? ''}`.trim() || 'Partner' : (p?.name || 'Partner'),
    })).filter((x) => !!x.id);
  }, [connectedPartners]);

  const groupChoices = useMemo(() => {
    const list = (groups || []) as any[];
    return list.map((g: any) => ({ id: g?.id ?? g?._id ?? String(g?.code ?? ''), name: g?.name || g?.title || 'Group' })).filter((x) => !!x.id);
  }, [groups]);

  // Dynamic motivational text based on streak ranges
  const motivationalMessage = useMemo(() => {
    const d = Math.max(0, streaks?.currentStreak ?? 0);
    const thresholds = [7, 14, 21, 31, 60, 90, 121, 180, 240, 300, 365];
    const messages = [
      // 1–7 days
  "You’re choosing a new way. Every small ‘yes’ matters. Fix your eyes on Jesus. He’s faithful to finish what He started (Phil 1:6).",
      // 7–14 days
  "One week in, well done. Establish rhythms of prayer, truth, and light. Ask the Spirit to renew your mind (Rom 12:2).",
      // 14–21 days
      "Two weeks strong. Old patterns are losing power. Walk in the light, confess quickly, and celebrate progress (1 Jn 1:7).",
      // 21–31 days
  "Three weeks, roots are growing. Flee temptation and pursue what is pure, with Jesus leading your steps (2 Tim 2:22).",
      // 31–60 days
      "Over a month. Freedom is taking shape. Stay in Scripture, stay accountable, and keep showing up in the light (Jn 8:36).",
      // 60–90 days
  "Two months. Your desires are being retrained toward life. Seed by seed, a holy harvest is growing (Gal 6:8 to 9).",
      // 90–121 days
  "Three months. New identity is outshining old shame. Clothe yourself with compassion and love (Col 3:12 to 14).",
      // 121–180 days
      "Four to six months. You’re steady under pressure. Guard your heart and keep a restful, prayerful pace (Prov 4:23).",
      // 181–240 days
      "Six to eight months. Your story now strengthens others. Share hope, stay humble, and guard your inputs (2 Cor 1:4).",
      // 241–300 days
  "Eight to ten months. Freedom is becoming a lifestyle. Delight in the Word and bear lasting fruit (Ps 1:2 to 3).",
      // 301–365 days
    "Ten months to a year, what a testimony. Keep your oil burning: intimacy over activity, Jesus at the center (Mt 5:8).",
    ];
    const idx = thresholds.findIndex((t) => d < t);
    if (idx === -1) {
  return "One year and beyond. You’re a pillar for others. Keep pursuing purity of heart and joyful obedience (Phil 3:12 to 14).";
    }
    return messages[idx];
  }, [streaks?.currentStreak]);

  return (
  <SafeAreaView style={styles.root}>
      <LinearGradient
        colors={['#0f172a', '#1e293b', '#334155', '#475569', '#64748b']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    
      {/* Fixed Screen Header (outside scroll) */}
      <ScreenHeader title="Home" navigation={navigation} showBackButton={false} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.container, { paddingBottom: Math.max(160, 40 + insets.bottom + 96) }]}
        showsVerticalScrollIndicator={false}
      >

    {/* Last 7 days tracker (horizontal) */}
        <View style={styles.weekRow}>
          <ScrollView
            ref={daysRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled
            contentContainerStyle={styles.daysRow}
          >
            {last7Days.map((date) => {
              const label = format(date, 'EEEEE'); // First letter of weekday
              const dayNum = format(date, 'd');
              const mark = getMarkForDate(date);
              const circleStyle =
                mark === 'x'
                  ? styles.dayFailed
                  : mark === '✓'
                  ? styles.dayCompleted
                  : styles.dayInactive;
              return (
                <View key={String(date)} style={styles.dayItem}>
                  <View style={[styles.dayCircle, circleStyle]}>
                    <Text style={styles.daySymbol}>{mark}</Text>
                  </View>
                  <Text style={styles.dayLabel}>{label}</Text>
                  <Text style={styles.dateLabel}>{dayNum}</Text>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* Central Orb */}
        <View style={styles.orbOuter}>
          <LinearGradient
            colors={[Colors.secondary.main, '#3b82f6', '#a855f7', Colors.secondary.main]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.orbOuterGradient}
          >
            <LinearGradient
              colors={[ColorUtils.withOpacity('#ffffff', 0.2), ColorUtils.withOpacity(Colors.secondary.main, 0.6), ColorUtils.withOpacity('#0f172a', 0.8)]}
              style={styles.orbInner}
            />
          </LinearGradient>
        </View>

        {/* Scripture placed directly under the orb */}
        <View style={styles.scriptureBlock}>
          <Text style={styles.scriptureBody}>{scriptureText}</Text>
        </View>

        {/* Progress text */}
        <View style={styles.progressText}>
          <Text style={styles.progressLabel}>You've been porn free for:</Text>
          <Text style={styles.daysCount}>{streaks?.currentStreak ?? 0} days</Text>
          <Text style={styles.timeCounter}>
            {timeSinceStreakStart.hrs}hr {timeSinceStreakStart.mins}m {timeSinceStreakStart.secs}s
          </Text>
        </View>

        {/* Action buttons */}
        <View style={styles.actionsRow}>
          {[
            { key: 'tapIn' as const, label: 'Tap in' as const, icon: 'create-outline', onPress: () => { setSelectedAction('tapIn'); setCheckinVisible(true); } },
            { key: 'history' as const, label: "Tap in history" as const, icon: 'time-outline', onPress: () => { setSelectedAction('history'); navigation.navigate('CheckInHistory'); } },
            { key: 'reflections' as const, label: 'Daily Reflections' as const, icon: 'leaf-outline', onPress: () => { setSelectedAction('reflections'); setReflectionsVisible(true); } },
            { key: 'relapsed' as const, label: 'Relapsed' as const, icon: 'refresh-outline', onPress: () => { setSelectedAction('relapsed'); handleRelapsed(); } },
          ].map((b) => {
            const active = selectedAction === b.key;
            return (
              <TouchableOpacity key={b.label} style={[styles.actionBtn, active && styles.actionBtnActive]} onPress={b.onPress}>
                <View style={[styles.btnIcon, active && styles.btnIconActive]}>
                  <TabIcon name={b.icon} focused={active} color={Colors.white} />
                </View>
                <Text style={styles.btnLabel}>{b.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressHeaderText}>Recâblage cérébral</Text>
            <Text style={styles.progressHeaderText}>6%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>
        </View>

  {/* Panic button moved to fixed bottom */}

        {/* Motivational text (dynamic by streak range) */}
        <View style={styles.motivational}>
          <Text style={styles.motivationalText}>{motivationalMessage}</Text>
        </View>

        {/* Analytics */}
        <TouchableOpacity style={styles.analytics} onPress={() => navigation.navigate('Analytics') as any}>
          <Text style={styles.analyticsTitle}>Open Analytics</Text>
          <View style={[styles.chartCard, { width: chartWidth }]}> 
            <Svg width={chartWidth - 40} height={60}>
              <Polyline
                points="0,50 30,45 60,40 90,35 120,30 150,25 180,30 210,20 240,25 270,15 300,20"
                fill="none"
                stroke={Colors.secondary.main}
                strokeWidth={3}
                strokeLinecap="round"
              />
              {[0,30,60,90,120,150,180,210,240,270,300].map((cx, i) => (
                <Circle key={i} cx={cx} cy={i===0?50:i===1?45:i===2?40:i===3?35:i===4?30:i===5?25:i===6?30:i===7?20:i===8?25:i===9?15:20} r={3} fill={Colors.white} />
              ))}
            </Svg>
          </View>
        </TouchableOpacity>

        {/* Life Tree only */}
        <View style={styles.challengeRow}>
          <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('GrowthTracker') as any} style={[styles.challengeCard, styles.challengeGreen]}>
            <Text style={styles.challengeTitle}>Life Tree</Text>
            <View style={styles.treeBox} />
          </TouchableOpacity>
        </View>

    {/* Therapist */}
    <TouchableOpacity style={styles.therapist} activeOpacity={0.9} onPress={() => navigation.navigate('AISessions') as any}>
          <View style={styles.therapistInfo}>
      <Text style={styles.therapistTitle}>🧠 Speak to Barnabas</Text>
            <Text style={styles.therapistDesc}>Our 24/7 therapist who specialized in porn addiction</Text>
          </View>
          <View style={styles.therapistAvatar}><Text style={styles.therapistEmoji}>🤖</Text></View>
    </TouchableOpacity>

        {/* Upgrade */}
        <View style={styles.upgradeSection}>
          <View style={styles.upgradeHeader}>
            <Text style={styles.upgradeIcon}>🎁</Text>
            <Text style={styles.upgradeTitle}>Upgrade to Lifetime</Text>
          </View>
          <Text style={styles.upgradeSubtitle}>Get The Purity App for life instead of paying a subscription</Text>
          <View style={styles.lifetimeCard}>
            <View style={styles.lifetimeInfo}>
              <Text style={styles.upgradeIcon}>🎁</Text>
              <Text style={styles.lifetimeText}>The Purity App Lifetime Access</Text>
            </View>
            <Text style={styles.upgradeIcon}>👥</Text>
          </View>
        </View>

        {/* Content blocker */}
        <View style={styles.blocker}>
          <View style={styles.blockerHeader}>
            <Text style={styles.upgradeIcon}>🛡️</Text>
            <Text style={styles.blockerTitle}>NSFW Content Blocker</Text>
          </View>
          <Text style={styles.blockerSubtitle}>Block 1M+ porn websites from your browser.</Text>
          <TouchableOpacity style={styles.blockerCard} onPress={async () => {
            await refreshContentFilterStatus();
            if (!contentFilterOn) {
              Alert.alert('Enable Content Filter', 'Open settings to enable the Safari Content Filter.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Open Settings', onPress: () => ContentFilter.openContentBlockerSettings() }
              ]);
            }
            navigation.navigate('Settings' as any);
          }}>
            <Text style={styles.blockerText}>Visit Content Blocker ➤</Text>
            <View style={styles.blockerIcon}><Text style={styles.blockerBolt}>⚡</Text></View>
          </TouchableOpacity>
        </View>

  {/* (moved scripture block under orb) */}

        {/* Setup */}
        <View style={styles.todo}>
          <View style={styles.todoHeader}>
            <Text style={styles.upgradeIcon}>⚙️</Text>
            <Text style={styles.todoTitle}>Please setup</Text>
          </View>

      <TouchableOpacity
            style={styles.todoItem}
            onPress={async () => {
              await refreshNotificationsStatus();
              if (!notificationsEnabled) {
                Alert.alert(
                  'Enable Notifications',
                  'Notifications are off. Open system settings to turn them on.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Open Settings', onPress: () => Linking.openSettings() },
                  ]
                );
              }
        navigation.navigate('Settings' as any, { autoEnablePush: true } as any);
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.todoItemTitle}>Enable notifications</Text>
              <Text style={styles.todoItemDesc}>Turn on reminders and updates</Text>
            </View>
            <View style={[styles.checkbox, notificationsEnabled && styles.checkboxOn]}>
              {notificationsEnabled ? <Text style={styles.checkboxMark}>✓</Text> : null}
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.todoItem, { marginTop: 10 }]} onPress={() => navigation.navigate('PartnerFastingHub') as any}>
            <View style={{ flex: 1 }}>
              <Text style={styles.todoItemTitle}>Start A Fast</Text>
              <Text style={styles.todoItemDesc}>Begin a fast for breakthrough</Text>
            </View>
            <View style={[styles.checkbox, (firsts?.has_created_fast ?? false) && styles.checkboxOn]}>
              {(firsts?.has_created_fast ?? false) ? <Text style={styles.checkboxMark}>✓</Text> : null}
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.todoItem, { marginTop: 10 }]} onPress={() => navigation.navigate('InvitePartner') as any}>
            <View style={{ flex: 1 }}>
              <Text style={styles.todoItemTitle}>Add a partner</Text>
              <Text style={styles.todoItemDesc}>Invite a trusted brother or sister</Text>
            </View>
            <View style={[styles.checkbox, (firsts?.has_added_a_partner ?? false) && styles.checkboxOn]}>
              {(firsts?.has_added_a_partner ?? false) ? <Text style={styles.checkboxMark}>✓</Text> : null}
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.todoItem, { marginTop: 10 }]} onPress={() => navigation.navigate('CreatePrayerRequest') as any}>
            <View style={{ flex: 1 }}>
              <Text style={styles.todoItemTitle}>make a prayer request</Text>
              <Text style={styles.todoItemDesc}>Ask the community to pray with you</Text>
            </View>
            <View style={[styles.checkbox, (firsts?.has_made_a_prayer_request ?? false) && styles.checkboxOn]}>
              {(firsts?.has_made_a_prayer_request ?? false) ? <Text style={styles.checkboxMark}>✓</Text> : null}
            </View>
          </TouchableOpacity>

          {/* Join Community removed per spec */}

      <TouchableOpacity
            style={[styles.todoItem, { marginTop: 10 }]}
      onPress={async () => {
              try {
        await Linking.openURL(REDDIT_URL);
        setRedditJoined(true);
    try { await userFirstsService.markJoinedReddit(); await refreshFirsts(); } catch {}
              } catch {
                Alert.alert('Open failed', 'Could not open Reddit.');
              }
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.todoItemTitle}>Join Reddit</Text>
              <Text style={styles.todoItemDesc}>Connect on our Reddit community</Text>
            </View>
            <View style={[styles.checkbox, redditJoined && styles.checkboxOn]}>
              {redditJoined ? <Text style={styles.checkboxMark}>✓</Text> : null}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.todoItem, { marginTop: 10 }]}
            onPress={async () => {
              await refreshContentFilterStatus();
              if (!contentFilterOn) {
                Alert.alert('Enable Content Filter', 'Open settings to enable the Safari Content Filter.', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Open Settings', onPress: () => ContentFilter.openContentBlockerSettings() }
                ]);
              }
              navigation.navigate('Settings' as any);
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.todoItemTitle}>Enable Content Blocker</Text>
              <Text style={styles.todoItemDesc}>Block explicit websites on your device</Text>
            </View>
            <View style={[styles.checkbox, contentFilterOn && styles.checkboxOn]}>
              {contentFilterOn ? <Text style={styles.checkboxMark}>✓</Text> : null}
            </View>
          </TouchableOpacity>

      <TouchableOpacity
            style={[styles.todoItem, { marginTop: 10 }]}
      onPress={async () => {
              try {
        await handleShareApp();
        setHasShared(true);
    try { await userFirstsService.markSharedWithFriend(); await refreshFirsts(); } catch {}
              } catch {}
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.todoItemTitle}>Share with a friend</Text>
              <Text style={styles.todoItemDesc}>Invite someone to journey with you</Text>
            </View>
            <View style={[styles.checkbox, hasShared && styles.checkboxOn]}>
              {hasShared ? <Text style={styles.checkboxMark}>✓</Text> : null}
            </View>
          </TouchableOpacity>
        </View>

  {/* New session removed */}

        {/* Spacer for bottom */}
        <View style={{ height: 24 }} />
      </ScrollView>

  {/* Tap in Modal */}
      <Modal visible={checkinVisible} animationType="slide" transparent={false} onRequestClose={() => setCheckinVisible(false)}>
        <SafeAreaView style={styles.fullscreenModalRoot}>
          <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.fullscreenModalHeader}>
            <Text style={styles.modalTitle}>Today’s Tap in</Text>
            <Text style={styles.modalSubtitle}>Record how you feel and choose visibility.</Text>
          </LinearGradient>

          <ScrollView contentContainerStyle={styles.fullscreenModalBody} showsVerticalScrollIndicator={false}>
            <Text style={styles.modalSectionTitle}>How are you feeling?</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Add how you’re feeling, a win, or a prayer…"
              placeholderTextColor={ColorUtils.withOpacity(Colors.white, 0.5)}
              value={note}
              onChangeText={setNote}
              multiline
            />

            <Text style={[styles.modalSectionTitle, { marginTop: 16 }]}>Visibility</Text>
            <View style={styles.visibilityRow}>
              {[
                { key: 'private', label: 'Private' },
                { key: 'allPartners', label: 'All partners' },
                { key: 'selectPartners', label: 'Select partners' },
                { key: 'group', label: 'Groups' },
              ].map((o) => {
                const active = visibilityOption === (o.key as Visibility);
                return (
                  <TouchableOpacity key={o.key} style={[styles.visChip, active && styles.visChipActive]} onPress={() => setVisibilityOption(o.key as Visibility)}>
                    <Text style={[styles.visChipText, active && styles.visChipTextActive]}>{o.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {visibilityOption === 'selectPartners' && (
              <View style={{ marginTop: 8 }}>
                <Text style={styles.modalLabel}>Choose partners</Text>
                <View style={styles.chipsWrap}>
                  {partnerChoices.length === 0 ? (
                    <Text style={styles.emptyText}>No partners yet.</Text>
                  ) : (
                    partnerChoices.map((p) => {
                      const on = selectedPartnerIds.includes(p.id);
                      return (
                        <TouchableOpacity key={p.id} style={[styles.entityChip, on && styles.entityChipOn]} onPress={() => {
                          setSelectedPartnerIds((prev) => (prev.includes(p.id) ? prev.filter((i) => i !== p.id) : [...prev, p.id]));
                        }}>
                          <Text style={[styles.entityChipText, on && styles.entityChipTextOn]}>{p.name}</Text>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </View>
              </View>
            )}

            {visibilityOption === 'group' && (
              <View style={{ marginTop: 8 }}>
                <Text style={styles.modalLabel}>Choose group(s)</Text>
                <View style={styles.chipsWrap}>
                  {groupChoices.length === 0 ? (
                    <Text style={styles.emptyText}>No groups yet.</Text>
                  ) : (
                    groupChoices.map((g) => {
                      const on = selectedGroupIds.includes(g.id);
                      return (
                        <TouchableOpacity key={g.id} style={[styles.entityChip, on && styles.entityChipOn]} onPress={() => {
                          setSelectedGroupIds((prev) => (prev.includes(g.id) ? prev.filter((i) => i !== g.id) : [...prev, g.id]));
                        }}>
                          <Text style={[styles.entityChipText, on && styles.entityChipTextOn]}>{g.name}</Text>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.modalBtn, styles.modalCancel]} onPress={() => setCheckinVisible(false)} disabled={creating}>
              <Text style={styles.modalBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalBtn, styles.modalPrimary]}
              disabled={creating}
              onPress={async () => {
                try {
                  setCreating(true);
                  const payload: any = { mood: Math.max(0, Math.min(1, moodValue)), note: note?.trim() || undefined, status: 'victory' };
                  if (visibilityOption === 'private') {
                    payload.visibility = 'private';
                  } else if (visibilityOption === 'group') {
                    if (!selectedGroupIds.length) { Alert.alert('Group required', 'Select at least one group.'); setCreating(false); return; }
                    payload.visibility = 'group';
                    payload.groupIds = selectedGroupIds;
                  } else {
                    payload.visibility = 'partner';
                    if (visibilityOption === 'allPartners') {
                      const ids = partnerChoices.map((p) => p.id);
                      if (!ids.length) { Alert.alert('No partners', 'You have no partners to share with.'); setCreating(false); return; }
                      payload.partnerIds = ids;
                    } else if (visibilityOption === 'selectPartners') {
                      if (!selectedPartnerIds.length) { Alert.alert('Partners required', 'Select at least one partner.'); setCreating(false); return; }
                      payload.partnerIds = selectedPartnerIds;
                    }
                  }
                  await dispatch(createCheckIn(payload)).unwrap();
                  setNote('');
                  setSelectedPartnerIds([]);
                  setSelectedGroupIds([]);
                  setVisibilityOption('private');
                  setCheckinVisible(false);
                  const from = format(subDays(new Date(), 6), 'yyyy-MM-dd');
                  const to = format(addDays(new Date(), 1), 'yyyy-MM-dd');
                  dispatch(fetchCheckIns({ from, to, limit: 200 }));
                  dispatch(getStreaks());
                  Alert.alert('Victory Recorded!', 'Your daily Tap in has been saved. Keep going strong!');
                } catch (e: any) {
                  Alert.alert('Tap in failed', e?.message || 'Unable to create check in.');
                } finally {
                  setCreating(false);
                }
              }}
            >
              <Text style={styles.modalBtnText}>Save Tap in</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Daily Reflections Modal */}
      <Modal visible={reflectionsVisible} animationType="fade" transparent={false} onRequestClose={() => setReflectionsVisible(false)}>
        <SafeAreaView style={styles.fullscreenModalRoot}>
          <View style={styles.reflectionsBgContainer}>
            <Animated.View style={[StyleSheet.absoluteFill, { opacity: bgFade.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }]}>
              <LinearGradient colors={gradientSets[bgIndex]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
            </Animated.View>
            <Animated.View style={[StyleSheet.absoluteFill, { opacity: bgFade.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }) }]}>
              <LinearGradient colors={gradientSets[nextBgIndex]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
            </Animated.View>
            {/* Subtle animated orbs */}
            <Animated.View
              style={[
                styles.orb,
                {
                  top: 80,
                  left: -40,
                  transform: [
                    {
                      scale: orbPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.25] }),
                    },
                  ],
                  opacity: orbPulse.interpolate({ inputRange: [0, 1], outputRange: [0.12, 0.28] }),
                  backgroundColor: ColorUtils.withOpacity('#22d3ee', 0.35),
                },
              ]}
            />
            <Animated.View
              style={[
                styles.orb,
                {
                  bottom: 100,
                  right: -30,
                  transform: [
                    {
                      scale: orbPulse2.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] }),
                    },
                  ],
                  opacity: orbPulse2.interpolate({ inputRange: [0, 1], outputRange: [0.10, 0.24] }),
                  backgroundColor: ColorUtils.withOpacity('#a855f7', 0.35),
                },
              ]}
            />
          </View>
          <View style={styles.reflectionCenter}>
            <Animated.Text style={[styles.reflectionTextBig, { opacity: fadeAnim }]}>
              {reflections[reflectionIndex]}
            </Animated.Text>
          </View>
          {/* Falling streak (projectile-like) */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.dropContainer,
              { left: dropStartX - 1 },
              {
                transform: [
                  { translateY: dropProg.interpolate({ inputRange: [0, 1], outputRange: [-120, winHeight + 120] }) },
                  { translateX: dropProg.interpolate({ inputRange: [0, 1], outputRange: [0, dropDriftX] }) },
                  { rotate: `${dropRotate}deg` },
                ],
                opacity: dropProg.interpolate({ inputRange: [0, 0.1, 0.7, 1], outputRange: [0, 0.9, 0.6, 0] }),
              },
            ]}
          >
            <LinearGradient
              colors={[ColorUtils.withOpacity(Colors.secondary.main, 0), ColorUtils.withOpacity(Colors.secondary.main, 0.9), ColorUtils.withOpacity(Colors.secondary.main, 0)]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.dropStreak}
            />
          </Animated.View>
          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.modalBtn, styles.modalPrimary]} onPress={() => setReflectionsVisible(false)}>
              <Text style={styles.modalBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Fixed Bottom Panic Button */}
      <View style={[styles.panicContainer, { paddingBottom: insets.bottom + 10 }]}>
        <TouchableOpacity style={styles.panicButton}>
          <Text style={styles.panicText}>⏰ Panic Button</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Relapse check-in handler (port of OldHomeScreen logic, simplified)
async function handleRelapsed() {
  Alert.alert(
    'Record a Relapse',
    'This will reset your streak count to 0. Are you sure?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes, I Relapsed',
        style: 'destructive',
        onPress: async () => {
          try {
            // We cannot access dispatch here directly; perform a lightweight inline dispatch via a dynamic import pattern inside component is tricky.
            // Instead, we will create a no-op to be replaced at runtime. This function will be reassigned inside the component scope below.
          } catch {}
        },
      },
    ]
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background.primary },
  container: { padding: 20, paddingBottom: 40 },

  // Removed inline header/status styles in favor of global ScreenHeader

  weekRow: { marginBottom: 24 },
  daysRow: { paddingHorizontal: 4, gap: 10 as any },
  dayItem: { width: 48, alignItems: 'center' },
  dayCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  dayCompleted: { backgroundColor: Colors.secondary.main, borderWidth: 2, borderColor: Colors.secondary.main },
  dayFailed: { backgroundColor: Colors.error.main, borderWidth: 2, borderColor: Colors.error.main },
  dayInactive: { backgroundColor: ColorUtils.withOpacity(Colors.white, 0.1), borderWidth: 2, borderColor: ColorUtils.withOpacity(Colors.white, 0.3) },
  daySymbol: { color: Colors.white, fontWeight: '700' },
  dayLabel: { marginTop: 6, color: ColorUtils.withOpacity(Colors.white, 0.8), fontSize: 11 },
  dateLabel: { marginTop: 2, color: ColorUtils.withOpacity(Colors.white, 0.9), fontSize: 11, fontWeight: '600' },

  orbOuter: { alignItems: 'center', marginTop: 10, marginBottom: 24 },
  orbOuterGradient: { width: 200, height: 200, borderRadius: 100, padding: 8, shadowColor: Colors.secondary.main, shadowOpacity: 0.3, shadowRadius: 12 },
  orbInner: { flex: 1, borderRadius: 100 },

  // Scripture under orb
  scriptureBlock: {
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: ColorUtils.withOpacity(Colors.primary.main, 0.15),
    borderWidth: 1,
    borderColor: ColorUtils.withOpacity(Colors.primary.main, 0.3),
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary.main,
  },
  scriptureRef: { color: Colors.white, fontWeight: '700', textAlign: 'center', marginBottom: 6 },
  scriptureBody: { color: Colors.primary.main, textAlign: 'center', lineHeight: 20, fontStyle: 'italic', fontWeight: '500' },
  scriptureFocus: { marginTop: 8, color: ColorUtils.withOpacity(Colors.white, 0.85), fontStyle: 'italic' },

  progressText: { alignItems: 'center', marginVertical: 24 },
  progressLabel: { fontSize: 18, color: ColorUtils.withOpacity(Colors.white, 0.8), marginBottom: 8 },
  daysCount: { fontSize: 48, fontWeight: '900', color: Colors.white, marginBottom: 10 },
  timeCounter: { 
    backgroundColor: ColorUtils.withOpacity(Colors.white, 0.12), 
    borderWidth: 1, 
    borderColor: ColorUtils.withOpacity(Colors.white, 0.35), 
    borderRadius: 28, 
    paddingVertical: 12, 
    paddingHorizontal: 22, 
    fontSize: 20, 
    fontWeight: '700', 
    letterSpacing: 0.5,
    color: Colors.white 
  },

  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 24 },
  actionBtn: { alignItems: 'center' },
  actionBtnActive: { },
  btnIcon: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: ColorUtils.withOpacity(Colors.white, 0.3), alignItems: 'center', justifyContent: 'center' },
  btnIconActive: { borderColor: Colors.secondary.main, backgroundColor: ColorUtils.withOpacity(Colors.secondary.main, 0.1) },
  btnLabel: { fontSize: 12, color: Colors.white, marginTop: 8 },

  progressSection: { marginVertical: 16 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressHeaderText: { color: Colors.white },
  progressBar: { height: 6, backgroundColor: ColorUtils.withOpacity(Colors.white, 0.1), borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', width: '6%', backgroundColor: Colors.secondary.main, borderRadius: 3 },

  panicContainer: { position: 'absolute', left: 20, right: 20, bottom: 0 },
  panicButton: { backgroundColor: Colors.error.dark, borderRadius: 25, paddingVertical: 16, alignItems: 'center', marginVertical: 10, shadowColor: '#000', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 6 }, shadowRadius: 12, elevation: 6 },
  panicText: { color: Colors.white, fontSize: 16, fontWeight: '600' },

  motivational: { backgroundColor: ColorUtils.withOpacity(Colors.secondary.main, 0.1), borderWidth: 1, borderColor: ColorUtils.withOpacity(Colors.secondary.main, 0.2), borderRadius: 20, padding: 20, marginVertical: 20 },
  motivationalText: { color: Colors.white, lineHeight: 22, fontSize: 15, textAlign: 'center' },

  analytics: { marginVertical: 20 },
  analyticsTitle: { color: ColorUtils.withOpacity(Colors.white, 0.9), fontWeight: '600', fontSize: 18, marginBottom: 12 },
  chartCard: { backgroundColor: ColorUtils.withOpacity('#0f172a', 0.3), borderWidth: 1, borderColor: ColorUtils.withOpacity(Colors.secondary.main, 0.2), borderRadius: 20, padding: 20, height: 120, alignSelf: 'center', overflow: 'hidden' },

  challengeRow: { flexDirection: 'row', gap: 15 as any, marginVertical: 20 },
  challengeCard: { flex: 1, backgroundColor: ColorUtils.withOpacity('#ffffff', 0.08), borderRadius: 20, padding: 20, borderWidth: 1, borderColor: ColorUtils.withOpacity('#ffffff', 0.1) },
  challengePurple: { backgroundColor: ColorUtils.withOpacity('#a855f7', 0.2), borderColor: ColorUtils.withOpacity('#a855f7', 0.3) },
  challengeGreen: { backgroundColor: ColorUtils.withOpacity(Colors.secondary.main, 0.2), borderColor: ColorUtils.withOpacity(Colors.secondary.main, 0.3) },
  challengeTitle: { color: Colors.white, fontWeight: '600', fontSize: 14 },
  challengeNumber: { color: Colors.white, fontWeight: '900', fontSize: 40, marginTop: 6 },
  treeBox: { marginTop: 10, height: 80, borderRadius: 10, backgroundColor: Colors.secondary.dark },

  therapist: { flexDirection: 'row', alignItems: 'center', gap: 12 as any, backgroundColor: ColorUtils.withOpacity('#0f172a', 0.4), borderWidth: 1, borderColor: ColorUtils.withOpacity(Colors.secondary.main, 0.2), borderRadius: 20, padding: 20, marginVertical: 20 },
  therapistInfo: { flex: 1 },
  therapistTitle: { color: Colors.white, fontWeight: '600', fontSize: 18, marginBottom: 4 },
  therapistDesc: { color: ColorUtils.withOpacity(Colors.white, 0.8), fontSize: 14, lineHeight: 20 },
  therapistAvatar: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.secondary.main },
  therapistEmoji: { fontSize: 28 },

  upgradeSection: { marginTop: 30, marginBottom: 10 },
  upgradeHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 as any, marginBottom: 10 },
  upgradeIcon: { fontSize: 20 },
  upgradeTitle: { color: Colors.white, fontWeight: '600', fontSize: 18 },
  upgradeSubtitle: { color: ColorUtils.withOpacity(Colors.white, 0.7), fontSize: 14, marginBottom: 15 },
  lifetimeCard: { backgroundColor: ColorUtils.withOpacity('#a855f7', 0.2), borderColor: ColorUtils.withOpacity('#a855f7', 0.3), borderWidth: 1, borderRadius: 20, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lifetimeInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 as any },
  lifetimeText: { color: Colors.white, fontSize: 16, fontWeight: '600' },

  blocker: { marginVertical: 20 },
  blockerHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 as any, marginBottom: 10 },
  blockerTitle: { color: Colors.white, fontWeight: '600', fontSize: 18 },
  blockerSubtitle: { color: ColorUtils.withOpacity(Colors.white, 0.7), fontSize: 14, marginBottom: 15 },
  blockerCard: { backgroundColor: ColorUtils.withOpacity('#0f172a', 0.4), borderWidth: 1, borderColor: ColorUtils.withOpacity('#f97316', 0.3), borderRadius: 20, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  blockerText: { color: Colors.white, fontWeight: '600', fontSize: 16 },
  blockerIcon: { width: 40, height: 40, backgroundColor: '#f97316', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  blockerBolt: { fontSize: 18 },

  quote: { marginVertical: 20 },
  quoteHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 as any, marginBottom: 10 },
  quoteTitle: { color: Colors.white, fontWeight: '600', fontSize: 18 },
  quoteCard: { backgroundColor: ColorUtils.withOpacity('#0f172a', 0.4), borderWidth: 1, borderColor: ColorUtils.withOpacity(Colors.secondary.main, 0.3), borderRadius: 20, padding: 20, alignItems: 'center' },
  quoteIcon: { fontSize: 22, marginBottom: 8 },
  quoteText: { color: Colors.white, fontStyle: 'italic', textAlign: 'center' },
  quoteMeta: { marginTop: 8, color: ColorUtils.withOpacity(Colors.white, 0.85) },

  todo: { marginVertical: 20 },
  todoHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 as any, marginBottom: 12 },
  todoTitle: { color: Colors.white, fontWeight: '600', fontSize: 18 },
  todoItem: { backgroundColor: ColorUtils.withOpacity('#0f172a', 0.4), borderWidth: 1, borderColor: ColorUtils.withOpacity('#ffffff', 0.1), borderRadius: 15, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  todoItemTitle: { color: Colors.white, fontWeight: '600', fontSize: 16, marginBottom: 4 },
  todoItemDesc: { color: ColorUtils.withOpacity(Colors.white, 0.7), fontSize: 14 },
  toggle: { width: 50, height: 28, backgroundColor: ColorUtils.withOpacity(Colors.white, 0.2), borderRadius: 14, borderWidth: 1, borderColor: ColorUtils.withOpacity(Colors.white, 0.3) },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: ColorUtils.withOpacity(Colors.white, 0.35), alignItems: 'center', justifyContent: 'center' },
  checkboxOn: { borderColor: Colors.secondary.main, backgroundColor: ColorUtils.withOpacity(Colors.secondary.main, 0.25) },
  checkboxMark: { color: Colors.white, fontWeight: '900' },

  newSession: { backgroundColor: ColorUtils.withOpacity(Colors.secondary.main, 0.2), borderWidth: 1, borderColor: ColorUtils.withOpacity(Colors.secondary.main, 0.3), borderRadius: 15, padding: 16, alignItems: 'center', marginTop: 10 },
  newSessionText: { color: Colors.white, fontWeight: '600', fontSize: 16 },

  // Modal styles
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  modalCard: { width: '90%', borderRadius: 16, backgroundColor: ColorUtils.withOpacity('#0f172a', 0.95), borderWidth: 1, borderColor: ColorUtils.withOpacity(Colors.white, 0.1), overflow: 'hidden' },
  modalHeader: { padding: 16, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: ColorUtils.withOpacity(Colors.white, 0.08) },
  modalTitle: { color: Colors.white, fontWeight: '700', fontSize: 18 },
  modalSubtitle: { color: ColorUtils.withOpacity(Colors.white, 0.8), marginTop: 4, fontSize: 13, textAlign: 'center' },
  modalBody: { padding: 16 },
  modalLabel: { color: Colors.white, fontWeight: '600', marginBottom: 8 },
  modalInput: { minHeight: 80, color: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: ColorUtils.withOpacity(Colors.white, 0.2), padding: 12, backgroundColor: ColorUtils.withOpacity('#0f172a', 0.4) },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 as any, padding: 12, borderTopWidth: 1, borderTopColor: ColorUtils.withOpacity(Colors.white, 0.08) },
  modalBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1 },
  modalCancel: { borderColor: ColorUtils.withOpacity(Colors.white, 0.25) },
  modalPrimary: { backgroundColor: Colors.secondary.main, borderColor: Colors.secondary.main },
  modalBtnText: { color: Colors.white, fontWeight: '700' },

  // Reflections modal
  reflectionHeader: { padding: 16, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: ColorUtils.withOpacity(Colors.white, 0.08) },
  reflectionBody: { padding: 24, alignItems: 'center', justifyContent: 'center', minHeight: 160, backgroundColor: ColorUtils.withOpacity('#0f172a', 0.2) },
  reflectionText: { color: Colors.white, textAlign: 'center', fontSize: 16, lineHeight: 22, fontStyle: 'italic' },
  reflectionsBgContainer: { ...StyleSheet.absoluteFillObject },
  orb: { position: 'absolute', width: 160, height: 160, borderRadius: 80 },
  reflectionCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  reflectionTextBig: { color: Colors.white, textAlign: 'center', fontSize: 20, lineHeight: 28, fontWeight: '800' },
  dropContainer: { position: 'absolute', top: 0, width: 2, height: 140 },
  dropStreak: { width: 2, height: 140, borderRadius: 1 },

  // Fullscreen modal layout
  fullscreenModalRoot: { flex: 1, backgroundColor: '#0f172a' },
  fullscreenModalHeader: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: ColorUtils.withOpacity(Colors.white, 0.08) },
  fullscreenModalBody: { padding: 16, paddingBottom: 24 },
  modalSectionTitle: { color: Colors.white, fontWeight: '700', fontSize: 16, marginBottom: 8 },
  moodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 as any },
  moodChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, borderWidth: 1, borderColor: ColorUtils.withOpacity(Colors.white, 0.25), backgroundColor: ColorUtils.withOpacity('#0f172a', 0.3) },
  moodChipActive: { backgroundColor: ColorUtils.withOpacity(Colors.secondary.main, 0.25), borderColor: Colors.secondary.main },
  moodChipText: { color: Colors.white },
  moodChipTextActive: { fontWeight: '700', color: Colors.white },
  visibilityRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 as any },
  visChip: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 16, borderWidth: 1, borderColor: ColorUtils.withOpacity(Colors.white, 0.25), backgroundColor: ColorUtils.withOpacity('#0f172a', 0.3) },
  visChipActive: { backgroundColor: ColorUtils.withOpacity(Colors.secondary.main, 0.25), borderColor: Colors.secondary.main },
  visChipText: { color: Colors.white, fontSize: 12 },
  visChipTextActive: { color: Colors.white, fontWeight: '700' },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 as any, marginTop: 8 },
  entityChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, borderWidth: 1, borderColor: ColorUtils.withOpacity(Colors.white, 0.25), backgroundColor: ColorUtils.withOpacity('#0f172a', 0.3) },
  entityChipOn: { backgroundColor: ColorUtils.withOpacity(Colors.secondary.main, 0.25), borderColor: Colors.secondary.main },
  entityChipText: { color: Colors.white },
  entityChipTextOn: { color: Colors.white, fontWeight: '700' },
  emptyText: { color: ColorUtils.withOpacity(Colors.white, 0.7), fontStyle: 'italic' },
});

export default HomeScreen;
