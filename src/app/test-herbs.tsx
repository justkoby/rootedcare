import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, SafeAreaView } from 'react-native';
import { getHerbs } from '../services/herbs';

export default function HerbsPage() {
  const [herbs, setHerbs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadHerbs() {
      try {
        const data = await getHerbs();
        console.log('Fetched herbs successfully from Supabase:', data);
        setHerbs(data ?? []);
      } catch (error: any) {
        console.error('Error fetching herbs in component:', error);
        setErrorMsg(error?.message || String(error));
      } finally {
        setLoading(false);
      }
    }

    loadHerbs();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Loading herbs from Supabase...</Text>
      </SafeAreaView>
    );
  }

  if (errorMsg) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorTitle}>Error Loading Herbs</Text>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Supabase Herbs Connection Test</Text>
        
        {herbs.map((herb) => (
          <View key={herb.id} style={styles.card}>
            {/* Note: The DB uses common_name and summary */}
            <Text style={styles.herbName}>{herb.common_name || herb.name || 'Unnamed'}</Text>
            <Text style={styles.scientificName}>{herb.scientific_name || 'No scientific name'}</Text>
            <Text style={styles.herbDesc}>{herb.summary || herb.short_description || herb.description || 'No description available'}</Text>
          </View>
        ))}

        {herbs.length === 0 && (
          <Text style={styles.emptyText}>No herbs found in database.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F5ECE3',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5ECE3',
  },
  loadingText: {
    fontSize: 16,
    color: '#1F1A17',
    marginTop: 15,
    fontFamily: 'System',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#EF4444',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 14,
    color: '#1F1A17',
    textAlign: 'center',
  },
  container: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F1A17',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E3D3C4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  herbName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F1A17',
  },
  scientificName: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#10B981',
    marginTop: 2,
    marginBottom: 8,
  },
  herbDesc: {
    fontSize: 14,
    color: '#554A42',
    lineHeight: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#554A42',
    textAlign: 'center',
    marginTop: 40,
  },
});
