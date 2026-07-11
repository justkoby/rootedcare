// @ts-nocheck
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
} from 'react-native';
import { Link, useParams } from 'react-router-dom';
import { useRouter } from 'expo-router';

import { useAuth } from '../context/AuthContext';
import {
  addFavorite,
  checkFavorite,
  removeFavorite,
} from '../services/favorites';
import { getWellnessItemBySlug } from '../services/wellness';

type WellnessItem = {
  id: string;
  title: string;
  slug: string;
  short_description?: string | null;
  description?: string | null;
  image_url?: string | null;
  benefits?: string[] | null;
  recommendations?: string[] | null;
  precautions?: string | null;
};

export default function WellnessDetails() {
  const router = useRouter();
  const { user } = useAuth();
  const { slug } = useParams<{ slug: string }>();

  const [item, setItem] = useState<WellnessItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] =
    useState(false);

  useEffect(() => {
    async function loadWellnessItem() {
      if (!slug) {
        setError('Wellness item not found.');
        setLoading(false);
        return;
      }

      try {
        const data = await getWellnessItemBySlug(slug);

        if (!data) {
          setError('Wellness item not found.');
        } else {
          setItem(data);
        }
      } catch (err) {
        console.error(err);
        setError('Unable to load this wellness item.');
      } finally {
        setLoading(false);
      }
    }

    loadWellnessItem();
  }, [slug]);

  useEffect(() => {
    async function loadFavoriteStatus() {
      if (!user || !item?.id) {
        setIsFavorite(false);
        return;
      }

      try {
        const saved = await checkFavorite(
          'wellness',
          item.id
        );

        setIsFavorite(saved);
      } catch (error) {
        console.error(
          'Unable to check wellness favorite:',
          error
        );
      }
    }

    loadFavoriteStatus();
  }, [user, item?.id]);

  async function handleFavorite() {
    if (!user) {
      Alert.alert(
        'Sign in required',
        'Sign in to save this wellness guide to My Care.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Sign in',
            onPress: () => router.push('/login'),
          },
        ]
      );

      return;
    }

    if (!item?.id || favoriteLoading) return;

    try {
      setFavoriteLoading(true);

      if (isFavorite) {
        await removeFavorite('wellness', item.id);
        setIsFavorite(false);
      } else {
        await addFavorite('wellness', item.id);
        setIsFavorite(true);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to update My Care.';

      Alert.alert('Something went wrong', message);
    } finally {
      setFavoriteLoading(false);
    }
  }

  if (loading) {
    return <p>Loading wellness content...</p>;
  }

  if (error || !item) {
    return (
      <main>
        <p>{error || 'Wellness item not found.'}</p>
        <Link to="/wellness">← Back to wellness</Link>
      </main>
    );
  }

  return (
    <main>
      <Link to="/wellness">← Back to wellness</Link>

      {item.image_url && (
        <img
          src={item.image_url}
          alt={item.title}
        />
      )}

      <h1>{item.title}</h1>

      {item.short_description && (
        <p>{item.short_description}</p>
      )}

      <Pressable
        onPress={handleFavorite}
        disabled={favoriteLoading}
        style={{
          minHeight: 54,
          borderRadius: 16,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isFavorite
            ? '#efe5dc'
            : '#98542f',
          opacity: favoriteLoading ? 0.6 : 1,
          marginTop: 24,
          marginBottom: 24,
        }}
      >
        {favoriteLoading ? (
          <ActivityIndicator
            color={isFavorite ? '#98542f' : '#ffffff'}
          />
        ) : (
          <Text
            style={{
              color: isFavorite ? '#98542f' : '#ffffff',
              fontSize: 16,
              fontWeight: '600',
            }}
          >
            {isFavorite
              ? '✓ Added to My Care'
              : '+ Add to My Care'}
          </Text>
        )}
      </Pressable>

      {item.description && (
        <section>
          <h2>Overview</h2>
          <p>{item.description}</p>
        </section>
      )}

      {item.benefits?.length ? (
        <section>
          <h2>Benefits</h2>

          <ul>
            {item.benefits.map((benefit) => (
              <li key={benefit}>{benefit}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {item.recommendations?.length ? (
        <section>
          <h2>Recommendations</h2>

          <ul>
            {item.recommendations.map((recommendation) => (
              <li key={recommendation}>{recommendation}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {item.precautions && (
        <section>
          <h2>Precautions</h2>
          <p>{item.precautions}</p>
        </section>
      )}
    </main>
  );
}
