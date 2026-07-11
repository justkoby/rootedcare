// @ts-nocheck
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
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
  const { slug } = useParams<{ slug: string }>();

  const [item, setItem] = useState<WellnessItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
