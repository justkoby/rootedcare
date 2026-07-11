import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';

import { useAuth } from '../context/AuthContext';
import { getFavorites, removeFavorite } from '../services/favorites';
import { supabase } from '../lib/supabase';

type SavedItem = {
  favoriteId: string;
  itemType: 'herb' | 'wellness' | 'article';
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
};

export default function MyCareScreen() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadSavedItems = useCallback(async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const favorites = await getFavorites();

      const savedItems = await Promise.all(
        favorites.map(async (favorite) => {
          if (favorite.item_type === 'herb') {
            const { data } = await supabase
              .from('herbs')
              .select(
                'id, name, slug, short_description, image_url'
              )
              .eq('id', favorite.item_id)
              .eq('is_published', true)
              .maybeSingle();

            if (!data) return null;

            return {
              favoriteId: favorite.id,
              itemType: 'herb' as const,
              id: data.id,
              title: data.name,
              slug: data.slug,
              description: data.short_description,
              imageUrl: data.image_url,
            };
          }

          if (favorite.item_type === 'wellness') {
            const { data } = await supabase
              .from('wellness_concerns')
              .select(
                'id, name, slug, summary, image_url'
              )
              .eq('id', favorite.item_id)
              .eq('is_published', true)
              .maybeSingle();

            if (!data) return null;

            return {
              favoriteId: favorite.id,
              itemType: 'wellness' as const,
              id: data.id,
              title: data.name,
              slug: data.slug,
              description: data.summary,
              imageUrl: data.image_url,
            };
          }

          const { data } = await supabase
            .from('articles')
            .select(
              'id, title, slug, excerpt, short_description, image_url, cover_image_url'
            )
            .eq('id', favorite.item_id)
            .eq('is_published', true)
            .maybeSingle();

          if (!data) return null;

          return {
            favoriteId: favorite.id,
            itemType: 'article' as const,
            id: data.id,
            title: data.title,
            slug: data.slug,
            description:
              data.excerpt ?? data.short_description,
            imageUrl:
              data.image_url ?? data.cover_image_url,
          };
        })
      );

      setItems(
        savedItems.filter(
          (item): item is SavedItem => item !== null
        )
      );
    } catch (err) {
      console.error('My Care error:', err);
      setError('Unable to load your saved items.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadSavedItems();
    }, [loadSavedItems])
  );

  function openItem(item: SavedItem) {
    if (item.itemType === 'herb') {
      router.push(`/herb/${item.slug}` as any);
      return;
    }

    if (item.itemType === 'wellness') {
      router.push(`/explore` as any);
      return;
    }

    router.push(`/articles/${item.slug}` as any);
  }

  async function handleRemove(item: SavedItem) {
    Alert.alert(
      'Remove saved item',
      `Remove ${item.title} from My Care?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFavorite(
                item.itemType,
                item.id
              );

              setItems((currentItems) =>
                currentItems.filter(
                  (savedItem) =>
                    savedItem.favoriteId !== item.favoriteId
                )
              );
            } catch (error) {
              const message =
                error instanceof Error
                  ? error.message
                  : 'Unable to remove this item.';

              Alert.alert('Something went wrong', message);
            }
          },
        },
      ]
    );
  }

  if (authLoading || loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>
          Loading My Care...
        </Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>My Care</Text>

        <Text style={styles.emptyText}>
          Sign in to view and manage your saved care
          items.
        </Text>

        <Pressable
          onPress={() => router.push('/login' as any)}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>
            Sign in
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Care</Text>

      <Text style={styles.subtitle}>
        Your saved herbs, wellness guides and articles.
      </Text>

      {!!error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      <FlatList
        data={items}
        keyExtractor={(item) => item.favoriteId}
        contentContainerStyle={
          items.length === 0
            ? styles.emptyContainer
            : styles.listContent
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Pressable
              onPress={() => openItem(item)}
              style={styles.cardMain}
            >
              {item.imageUrl ? (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.image}
                />
              ) : (
                <View style={styles.imagePlaceholder} />
              )}

              <View style={styles.cardContent}>
                <Text style={styles.type}>
                  {item.itemType.toUpperCase()}
                </Text>

                <Text style={styles.cardTitle}>
                  {item.title}
                </Text>

                {!!item.description && (
                  <Text
                    numberOfLines={2}
                    style={styles.description}
                  >
                    {item.description}
                  </Text>
                )}
              </View>
            </Pressable>

            <Pressable
              onPress={() => handleRemove(item)}
              style={styles.removeButton}
            >
              <Text style={styles.removeButtonText}>
                Remove
              </Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyTitle}>
              Nothing saved yet
            </Text>

            <Text style={styles.emptyText}>
              Add herbs and wellness content to My Care
              and they'll appear here.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: 64,
    paddingHorizontal: 20,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  loadingText: {
    marginTop: 12,
  },
  errorText: {
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 40,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  card: {
    borderWidth: 1,
    borderColor: '#ece7e2',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 14,
    backgroundColor: '#ffffff',
  },
  cardMain: {
    flexDirection: 'row',
    flex: 1,
  },
  removeButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ece7e2',
  },
  removeButtonText: {
    color: '#98542f',
    fontSize: 14,
    fontWeight: '600',
  },
  image: {
    width: 110,
    height: 120,
  },
  imagePlaceholder: {
    width: 110,
    height: 120,
    backgroundColor: '#eee9e4',
  },
  cardContent: {
    flex: 1,
    padding: 14,
    justifyContent: 'center',
  },
  type: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
    marginBottom: 22,
  },
  primaryButton: {
    minWidth: 150,
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: '#98542f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
