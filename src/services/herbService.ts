import { herbs, Herb } from '../data/herbs';

// Mock service — swap implementation for Supabase calls later
// The public API stays the same; only the internals change.

let _herbs = [...herbs];

export function resetHerbs(data?: Herb[]) {
  _herbs = data ?? [...herbs];
}

export async function getHerbs(): Promise<Herb[]> {
  return Promise.resolve(_herbs);
}

export async function getHerbById(id: string): Promise<Herb | undefined> {
  return Promise.resolve(_herbs.find(h => h.id === id));
}

export async function searchHerbs(query: string): Promise<Herb[]> {
  const q = query.toLowerCase().trim();
  if (!q) return Promise.resolve(_herbs);
  return Promise.resolve(
    _herbs.filter(h =>
      h.name.toLowerCase().includes(q) ||
      h.scientificName.toLowerCase().includes(q) ||
      h.description.toLowerCase().includes(q) ||
      h.overview.toLowerCase().includes(q) ||
      h.bestFor.some(b => b.toLowerCase().includes(q)) ||
      h.symptoms.some(s => s.toLowerCase().includes(q)) ||
      Object.values(h.localNames).some(n => n?.toLowerCase().includes(q))
    )
  );
}

export async function getHerbsByCategory(category: string): Promise<Herb[]> {
  if (category === 'all') return Promise.resolve(_herbs);
  return Promise.resolve(
    _herbs.filter(h =>
      h.bestFor.some(b => b.toLowerCase().replace(/\s/g, '-') === category) ||
      h.bestFor.some(b => b.toLowerCase() === category)
    )
  );
}

export async function getHerbsBySymptom(symptom: string): Promise<Herb[]> {
  const q = symptom.toLowerCase();
  return Promise.resolve(
    _herbs.filter(h =>
      h.symptoms.some(s => s.toLowerCase().includes(q))
    )
  );
}

export async function getRelatedHerbs(herbId: string): Promise<Herb[]> {
  const herb = _herbs.find(h => h.id === herbId);
  if (!herb) return Promise.resolve([]);
  return Promise.resolve(_herbs.filter(h => herb.relatedHerbIds.includes(h.id)));
}
