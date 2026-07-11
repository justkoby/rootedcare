import {
  useEffect,
  useState,
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import {
  searchRootedCare,
  SearchResult,
} from '../services/search';

export default function SearchScreen() {
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [results, setResults] =
    useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] =
    useState(false);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      setResults([]);
      setLoading(false);
      setHasSearched(false);
      return;
    }

    setLoading(true);

    const timeout = setTimeout(async () => {
      try {
        const data =
          await searchRootedCare(trimmedQuery);

        setResults(data);
        setHasSearched(true);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
        setHasSearched(true);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      clearTimeout(timeout);
    };
  }, [query]);

  function openResult(item: SearchResult) {
    if (item.type === 'herb') {
      router.push(`/herb/${item.slug}` as any);
      return;
    }

    if (item.type === 'wellness') {
      router.push(`/explore` as any);
      return;
    }

    router.push(`/articles/${item.slug}` as any);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>←</Text>
        </Pressable>

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search herbs, wellness and articles"
          autoFocus
          autoCorrect={false}
          style={styles.searchInput}
        />
      </View>

      {loading && (
        <View style={styles.statusContainer}>
          <ActivityIndicator size="small" />
          <Text style={styles.statusText}>
            Searching...
          </Text>
        </View>
      )}

      {!loading &&
        query.trim().length < 2 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              What are you looking for?
            </Text>

            <Text style={styles.emptyText}>
              Search for herbs, symptoms, wellness
              topics or educational articles.
            </Text>
          </View>
        )}

      {!loading &&
        hasSearched &&
        results.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              No results found
            </Text>

            <Text style={styles.emptyText}>
              Try another herb, wellness topic or
              keyword.
            </Text>
          </View>
        )}

      <FlatList
        data={results}
        keyExtractor={(item) =>
          `${item.type}-${item.id}`
        }
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <Pressable
            onPress={() => openResult(item)}
            style={({ pressed }) => [
              styles.resultCard,
              pressed && styles.pressedCard,
            ]}
          >
            {item.imageUrl ? (
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.resultImage}
              />
            ) : (
              <View
                style={styles.imagePlaceholder}
              />
            )}

            <View style={styles.resultContent}>
              <Text style={styles.resultType}>
                {item.type.toUpperCase()}
              </Text>

              <Text style={styles.resultTitle}>
                {item.title}
              </Text>

              {!!item.description && (
                <Text
                  numberOfLines={2}
                  style={styles.resultDescription}
                >
                  {item.description}
                </Text>
              )}
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf7f2',
    paddingTop: 54,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  backButton: {
    width: 44,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 28,
    color: '#252525',
  },
  searchInput: {
    flex: 1,
    minHeight: 52,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ebe4dd',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  statusText: {
    marginLeft: 10,
    color: '#777777',
  },
  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 40,
  },
  resultCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#ebe4dd',
  },
  pressedCard: {
    opacity: 0.75,
  },
  resultImage: {
    width: 104,
    height: 120,
  },
  imagePlaceholder: {
    width: 104,
    height: 120,
    backgroundColor: '#eee8e1',
  },
  resultContent: {
    flex: 1,
    padding: 14,
    justifyContent: 'center',
  },
  resultType: {
    fontSize: 11,
    fontWeight: '700',
    color: '#98542f',
    marginBottom: 5,
  },
  resultTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#252525',
    marginBottom: 6,
  },
  resultDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#777777',
  },
  emptyContainer: {
    flex: 1,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#252525',
    marginBottom: 10,
  },
  emptyText: {
    maxWidth: 320,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 23,
    color: '#777777',
  },
});
