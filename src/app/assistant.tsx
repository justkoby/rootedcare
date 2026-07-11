import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { askRootedCareAI, type AIResponse, type RelatedItem } from '../services/ai';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  related?: {
    herbs: RelatedItem[];
    wellness: RelatedItem[];
    articles: RelatedItem[];
  };
  safetyLevel?: string;
};

const starterMessage: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    'Hello, I\u2019m the RootedCare assistant. Ask me about Ghanaian herbs, preparation methods, wellness practices or safety considerations.',
};

function RelatedCard({ item, type }: { item: RelatedItem; type: 'herb' | 'wellness' | 'article' }) {
  const router = useRouter();

  const routeMap = {
    herb: `/herb/${item.slug}` as any,
    wellness: `/explore` as any,
    article: `/articles/${item.slug}` as any,
  };

  return (
    <Pressable
      onPress={() => router.push(routeMap[type])}
      style={styles.relatedCard}
    >
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} style={styles.relatedImage} />
      ) : (
        <View style={[styles.relatedImage, styles.relatedImageFallback]}>
          <Text style={styles.relatedFallbackText}>
            {type === 'herb' ? '🌿' : type === 'wellness' ? '💚' : '📄'}
          </Text>
        </View>
      )}
      <Text style={styles.relatedName} numberOfLines={2}>
        {item.name}
      </Text>
      <Text style={styles.relatedType}>{type}</Text>
    </Pressable>
  );
}

function SafetyBadge({ level }: { level: string }) {
  const config: Record<string, { label: string; color: string; bg: string }> = {
    possible_emergency: { label: 'EMERGENCY', color: '#ffffff', bg: '#D32F2F' },
    pregnancy: { label: 'Pregnancy', color: '#E65100', bg: '#FFF3E0' },
    medication_interaction: { label: 'Medication', color: '#E65100', bg: '#FFF3E0' },
    child_related: { label: 'Children', color: '#2E7D32', bg: '#E8F5E9' },
    allergy: { label: 'Allergy', color: '#E65100', bg: '#FFF3E0' },
    unknown_herb: { label: 'Unknown Herb', color: '#555555', bg: '#F5F5F5' },
  };

  const c = config[level] ?? { label: 'General', color: '#1B5E20', bg: '#E8F5E9' };
  if (level === 'general' || !level) return null;

  return (
    <View style={[styles.safetyBadge, { backgroundColor: c.bg }]}>
      <Text style={[styles.safetyBadgeText, { color: c.color }]}>{c.label}</Text>
    </View>
  );
}

export default function AssistantScreen() {
  const router = useRouter();
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([starterMessage]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  async function handleSend() {
    const message = input.trim();
    if (!message || sending) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
    };

    setMessages((current) => [...current, userMessage]);
    setInput('');
    setSending(true);

    try {
      const result: AIResponse = await askRootedCareAI(message);

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: result.reply ?? '',
        related: {
          herbs: result.relatedHerbs ?? [],
          wellness: result.relatedWellness ?? [],
          articles: result.relatedArticles ?? [],
        },
        safetyLevel: result.safetyLevel,
      };

      setMessages((current) => [...current, assistantMessage]);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unable to reach the assistant.';
      Alert.alert('Assistant unavailable', msg);
    } finally {
      setSending(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }

  const hasRelated = (item: ChatMessage): boolean =>
    item.role === 'assistant' &&
    !!item.related &&
    (item.related.herbs.length > 0 ||
      item.related.wellness.length > 0 ||
      item.related.articles.length > 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </Pressable>
          <View>
            <Text style={styles.headerTitle}>RootedCare Assistant</Text>
            <Text style={styles.headerSubtitle}>Educational guidance only</Text>
          </View>
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => (
            <View>
              <View
                style={[
                  styles.messageBubble,
                  item.role === 'user' ? styles.userBubble : styles.assistantBubble,
                ]}
              >
                {item.role === 'assistant' && item.safetyLevel && (
                  <SafetyBadge level={item.safetyLevel} />
                )}
                <Text
                  style={[
                    styles.messageText,
                    item.role === 'user' ? styles.userText : styles.assistantText,
                  ]}
                >
                  {item.content}
                </Text>
              </View>

              {hasRelated(item) && (
                <View style={styles.relatedSection}>
                  {item.related!.herbs.length > 0 && (
                    <View style={styles.relatedGroup}>
                      <Text style={styles.relatedGroupLabel}>🌿 Herbs</Text>
                      <FlatList
                        horizontal
                        data={item.related!.herbs}
                        keyExtractor={(r) => r.id}
                        renderItem={({ item: ri }) => (
                          <RelatedCard item={ri} type="herb" />
                        )}
                        contentContainerStyle={styles.relatedRow}
                        showsHorizontalScrollIndicator={false}
                      />
                    </View>
                  )}

                  {item.related!.wellness.length > 0 && (
                    <View style={styles.relatedGroup}>
                      <Text style={styles.relatedGroupLabel}>💚 Wellness</Text>
                      <FlatList
                        horizontal
                        data={item.related!.wellness}
                        keyExtractor={(r) => r.id}
                        renderItem={({ item: ri }) => (
                          <RelatedCard item={ri} type="wellness" />
                        )}
                        contentContainerStyle={styles.relatedRow}
                        showsHorizontalScrollIndicator={false}
                      />
                    </View>
                  )}

                  {item.related!.articles.length > 0 && (
                    <View style={styles.relatedGroup}>
                      <Text style={styles.relatedGroupLabel}>📄 Articles</Text>
                      <FlatList
                        horizontal
                        data={item.related!.articles}
                        keyExtractor={(r) => r.id}
                        renderItem={({ item: ri }) => (
                          <RelatedCard item={ri} type="article" />
                        )}
                        contentContainerStyle={styles.relatedRow}
                        showsHorizontalScrollIndicator={false}
                      />
                    </View>
                  )}
                </View>
              )}
            </View>
          )}
          ListFooterComponent={
            sending ? (
              <View style={[styles.messageBubble, styles.assistantBubble, styles.loadingBubble]}>
                <ActivityIndicator size="small" />
                <Text style={styles.thinkingText}>RootedCare is thinking...</Text>
              </View>
            ) : null
          }
        />

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            This assistant does not diagnose conditions or replace professional medical care.
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask about herbs or wellness..."
            multiline
            maxLength={1000}
            editable={!sending}
            style={styles.input}
          />
          <Pressable
            onPress={handleSend}
            disabled={!input.trim() || sending}
            style={[styles.sendButton, (!input.trim() || sending) && styles.disabledButton]}
          >
            {sending ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.sendButtonText}>Send</Text>}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#faf7f2' },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee6df',
  },
  backButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  backText: { fontSize: 28, color: '#252525' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#252525' },
  headerSubtitle: { fontSize: 12, color: '#777777', marginTop: 2 },
  messageList: { padding: 16, paddingBottom: 24 },
  messageBubble: { maxWidth: '84%', borderRadius: 18, paddingHorizontal: 15, paddingVertical: 12, marginBottom: 12 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#98542f', borderBottomRightRadius: 5 },
  assistantBubble: { alignSelf: 'flex-start', backgroundColor: '#ffffff', borderBottomLeftRadius: 5, borderWidth: 1, borderColor: '#eee6df' },
  messageText: { fontSize: 15, lineHeight: 22 },
  userText: { color: '#ffffff' },
  assistantText: { color: '#252525' },
  loadingBubble: { flexDirection: 'row', alignItems: 'center' },
  thinkingText: { marginLeft: 10, fontSize: 14, color: '#777777' },
  disclaimer: { paddingHorizontal: 18, paddingVertical: 8 },
  disclaimerText: { textAlign: 'center', fontSize: 11, lineHeight: 16, color: '#777777' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 14,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#eee6df',
  },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#f5f1ed',
    fontSize: 15,
  },
  sendButton: { minWidth: 70, minHeight: 48, marginLeft: 10, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#98542f' },
  sendButtonText: { color: '#ffffff', fontWeight: '700' },
  disabledButton: { opacity: 0.45 },

  // Safety badge
  safetyBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, marginBottom: 8 },
  safetyBadgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },

  // Related content
  relatedSection: { marginBottom: 16, paddingLeft: 16 },
  relatedGroup: { marginBottom: 10 },
  relatedGroupLabel: { fontSize: 13, fontWeight: '600', color: '#777777', marginBottom: 6, marginLeft: 4 },
  relatedRow: { gap: 10 },
  relatedCard: {
    width: 130,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee6df',
    overflow: 'hidden',
  },
  relatedImage: { width: '100%', height: 72 },
  relatedImageFallback: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f1ed' },
  relatedFallbackText: { fontSize: 28 },
  relatedName: { fontSize: 13, fontWeight: '600', color: '#252525', paddingHorizontal: 8, paddingTop: 8, lineHeight: 18 },
  relatedType: { fontSize: 10, color: '#98542f', paddingHorizontal: 8, paddingBottom: 8, paddingTop: 2, textTransform: 'uppercase', fontWeight: '700' },
});
