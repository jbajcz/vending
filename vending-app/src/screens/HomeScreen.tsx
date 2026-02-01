import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, SHADOWS, RADIUS } from '../constants/theme';
import { runQuery } from '../services/db';
import { Item, User } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { ITEM_IMAGES, UI_ICONS } from '../constants/assets';

export default function HomeScreen() {
    const [user, setUser] = useState<User | null>(null);
    const [recommendations, setRecommendations] = useState<Item[]>([]);
    const [machines, setMachines] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const userData = await runQuery('SELECT * FROM users WHERE user_id = 1');
            if (userData && userData.length > 0) setUser(userData[0]);

            const items = await runQuery('SELECT * FROM items LIMIT 5');
            setRecommendations(items);

            // Mock fetching machines with distance
            const machineData = await runQuery('SELECT * FROM vending_machines LIMIT 5');
            setMachines(machineData.map((m, i) => ({ ...m, distance: `${(i + 1) * 0.5} mi` })));
        } catch (e) {
            console.error("Home Load Error", e);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                {/* Header Text */}
                <Text style={styles.welcomeText}>Welcome {user?.name || 'User'}!</Text>

                {/* Search Bar */}
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color={COLORS.subtext} style={{ marginRight: 8 }} />
                    <Text style={styles.searchText}>Search</Text>
                </View>

                {/* Categories Circles */}
                <View style={styles.categoriesRow}>
                    {Object.entries(UI_ICONS.categories).map(([name, source], i) => (
                        <View key={i} style={styles.categoryContainer}>
                            <Image source={source} style={styles.categoryCircle} resizeMode="contain" />
                            <Text style={styles.categoryText}>{name}</Text>
                        </View>
                    ))}
                </View>

                {/* Near You Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Vending Machines Near You</Text>
                    <Ionicons name="chevron-forward" size={20} color="black" />
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                    {machines.map((m) => (
                        <View key={m.machine_id} style={styles.machineCard}>
                            <Image source={UI_ICONS.vendingMachine || null} style={styles.machineImage} resizeMode="contain" />
                            <View style={styles.metaRow}>
                                <Text style={styles.cardTitle} numberOfLines={1}>{m.address || 'Machine'}</Text>
                                <Text style={styles.distanceText}>{m.distance}</Text>
                            </View>
                        </View>
                    ))}
                </ScrollView>

                {/* Suggestions Section */}
                <Text style={styles.sectionTitle}>Suggestions</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                    {recommendations.map((item) => (
                        <View key={item.item_id} style={styles.itemCard}>
                            <Image
                                source={ITEM_IMAGES[item.name] || null}
                                style={styles.itemImage}
                                resizeMode="cover"
                            />
                            <Text style={styles.cardTitle}>{item.name}</Text>
                        </View>
                    ))}
                </ScrollView>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.card },
    content: { padding: SPACING.m },
    welcomeText: {
        fontSize: 28,
        fontWeight: '900',
        color: 'black',
        marginBottom: SPACING.m,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E0E0E0',
        padding: SPACING.m,
        borderRadius: RADIUS.l,
        marginBottom: SPACING.l,
    },
    searchText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    categoriesRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.l,
    },
    categoryContainer: {
        alignItems: 'center'
    },
    categoryCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#F0F0F0',
        marginBottom: 4,
    },
    categoryText: {
        fontSize: 10,
        color: COLORS.subtext
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.s,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: 'black',
        marginRight: 4,
        marginBottom: SPACING.s,
    },
    horizontalScroll: {
        marginBottom: SPACING.l,
    },
    machineCard: {
        width: 120,
        marginRight: SPACING.m,
    },
    itemCard: {
        width: 120,
        marginRight: SPACING.m,
    },
    machineImage: {
        width: '100%',
        height: 120,
        borderRadius: 8,
        marginBottom: 4,
        backgroundColor: '#f9f9f9',
    },
    itemImage: {
        width: '100%',
        height: 120,
        borderRadius: 8,
        marginBottom: 4,
        backgroundColor: '#f9f9f9'
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cardTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: 'black',
        flex: 1,
        marginRight: 4,
    },
    distanceText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: 'black',
    }
});
