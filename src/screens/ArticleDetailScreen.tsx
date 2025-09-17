import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants';
import Icon from '../components/Icon';
import { articleService, ArticleDetail } from '../services/articleService';
import { useRoute, useNavigation } from '@react-navigation/native';

interface RouteParams { slug: string }

const ArticleDetailScreen: React.FC = () => {
  const { params } = useRoute<any>();
  const navigation = useNavigation<any>();
  const { slug } = params as RouteParams;
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!slug) return;
    setLoading(true); setError(null);
    try {
      const data = await articleService.getArticleBySlug(slug);
      setArticle(data);
    } catch (e: any) {
      setError(e.message || 'Failed to load article');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} accessibilityLabel="Go back">
          <Icon name="arrow-back" size="lg" color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{article?.title || 'Article'}</Text>
        <View style={{ width: 44 }} />
      </View>
      {loading && (
        <View style={styles.center}><ActivityIndicator color={Colors.primary.main} /></View>
      )}
      {error && !loading && (
        <TouchableOpacity onPress={load} style={styles.errorBox}>
          <Text style={styles.errorText}>{error} - Tap to retry</Text>
        </TouchableOpacity>
      )}
      {!loading && article && (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>{article.title}</Text>
          {article.summary && <Text style={styles.summary}>{article.summary}</Text>}
          <View style={styles.metaRow}>
            {article.category && <Text style={styles.meta}>{article.category}</Text>}
            {Array.isArray(article.tags) && article.tags.map(tag => <Text key={tag} style={styles.tag}>#{tag}</Text>)}
            {article.createdAt && <Text style={styles.meta}>{new Date(article.createdAt).toLocaleDateString()}</Text>}
          </View>
          <View style={styles.divider} />
          <Text style={styles.content}>{article.content}</Text>
          {Array.isArray(article.references) && article.references.length > 0 && (
            <View style={styles.referencesBox}>
              <Text style={styles.referencesTitle}>Resources & References</Text>
              {article.references.map((ref, idx) => {
                // Normalize reference object
                let label: string = '';
                let url: string | undefined;
                if (typeof ref === 'string') {
                  // If it's a URL alone or embedded URL
                  const urlMatch = ref.match(/https?:\/\/[^\s)]+/i);
                  if (urlMatch) {
                    url = urlMatch[0];
                    label = ref.replace(url, '').trim() || url;
                  } else {
                    label = ref;
                  }
                } else if (ref && typeof ref === 'object') {
                  // Common shapes: { title, url } or { name, link }
                  const possibleUrl = (ref.url || ref.link || ref.href) as string | undefined;
                  const possibleTitle = (ref.title || ref.name || ref.label) as string | undefined;
                  url = possibleUrl;
                  if (possibleTitle) label = possibleTitle; else if (possibleUrl) label = possibleUrl; else label = JSON.stringify(ref);
                }
                const display = label || url || 'Reference';
                const onPress = () => { if (url) Linking.openURL(url).catch(() => {}); };
                return (
                  <TouchableOpacity key={idx} disabled={!url} onPress={onPress} style={styles.referenceRow} accessibilityRole={url ? 'link' : undefined}>
                    <Text style={[styles.referenceBullet]}>• </Text>
                    <Text style={[styles.referenceItem, url && styles.referenceLink]} numberOfLines={3}>
                      {display}{url && display !== url ? ` (${url})` : ''}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background.primary },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 4, paddingBottom: 8 },
  backBtn: { padding: 8, borderRadius: 30, backgroundColor: Colors.background.secondary },
  headerTitle: { flex: 1, textAlign: 'center', color: Colors.text.primary, fontWeight: '700', fontSize: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorBox: { margin: 16, backgroundColor: Colors.error.container, padding: 12, borderRadius: 8 },
  errorText: { color: Colors.error.light, textAlign: 'center' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text.primary, marginBottom: 8 },
  summary: { color: Colors.text.secondary, marginBottom: 12, fontSize: 15, lineHeight: 20 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12, gap: 8 },
  meta: { color: Colors.text.tertiary, fontSize: 12, marginRight: 12 },
  tag: { color: Colors.primary.main, fontSize: 12, marginRight: 10 },
  divider: { height: 1, backgroundColor: Colors.border.primary, marginBottom: 16 },
  content: { color: Colors.text.primary, lineHeight: 22, fontSize: 15 },
  referencesBox: { marginTop: 24, padding: 12, backgroundColor: Colors.background.secondary, borderRadius: 12, borderWidth: 1, borderColor: Colors.border.primary },
  referencesTitle: { color: Colors.text.primary, fontWeight: '700', marginBottom: 8 },
  referenceItem: { color: Colors.text.secondary, fontSize: 13, marginBottom: 4 },
  referenceRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  referenceBullet: { color: Colors.primary.main, fontSize: 14, lineHeight: 18, paddingTop: 1 },
  referenceLink: { color: Colors.primary.main },
});

export default ArticleDetailScreen;