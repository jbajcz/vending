import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { runQuery } from '../services/db';
import { Purchase } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { ITEM_IMAGES } from '../constants/assets';

export default function ActivityScreen() {
    const [purchases, setPurchases] = useState<Purchase[]>([]);

    useEffect(() => {
        loadPurchases();
    }, []);

    const loadPurchases = async () => {
        const query = `
        SELECT p.*, i.name as item_name, m.address as machine_address
        FROM purchases p
        JOIN items i ON p.item_id = i.item_id
        JOIN vending_machines m ON p.machine_id = m.machine_id
        WHERE p.user_id = 1
        ORDER BY p.timestamp DESC
    `;
        const data = await runQuery(query);
        setPurchases(data);
    };

    const renderItem = ({ item }: { item: Purchase }) => (
        <View style={styles.listItem}>
            <Image
                source={ITEM_IMAGES[item.item_name || ''] || null}
                style={styles.listIcon}
                resizeMode="contain"
            />
            <View style={styles.listDetails}>
                <Text style={styles.listTitle}>Past Transaction</Text>
                <Text style={styles.listSub}>{item.timestamp} • {item.item_name}</Text>
                <Text style={styles.listPrice}>$1.50</Text>
            </View>
            <TouchableOpacity style={styles.reorderButton}>
                <Text style={styles.reorderText}>Reorder</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Activity</Text>
                <View style={styles.rewardsContainer}>
                    <Text style={styles.rewardsText}>Rewards</Text>
                    <Ionicons name="star" size={16} color="black" />
                </View>
            </View>

            <FlatList
                data={purchases}
                ListHeaderComponent={() => (
                    <View style={styles.featuredCard}>
                        <View style={styles.featuredPlaceholder} />
                        <Text style={styles.featuredTitle}>What the Past Transaction Is</Text>
                        <Text style={styles.featuredSub}>Date • time{'\n'}Price</Text>
                        <TouchableOpacity style={styles.reorderButtonSmall}>
                            <Text style={styles.reorderText}>Reorder</Text>
                        </TouchableOpacity>
                    </View>
                )}
                keyExtractor={item => item.purchase_id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.card },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.l
    },
    headerTitle: { fontSize: 32, fontWeight: 'bold', color: 'black' },
    rewardsContainer: { flexDirection: 'row', alignItems: 'center' },
    rewardsText: { fontSize: 16, fontWeight: 'bold', marginRight: 4 },

    listContent: { paddingHorizontal: SPACING.m, paddingBottom: 100 },

    featuredCard: {
        backgroundColor: '#D9D9D9',
        borderRadius: 20,
        padding: SPACING.m,
        marginBottom: SPACING.l,
        minHeight: 180,
        justifyContent: 'flex-end',
    },
    featuredPlaceholder: {
        position: 'absolute', top: 10, left: 10, right: 10, height: 80, backgroundColor: 'white', borderRadius: 10
    },
    featuredTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 80 },
    featuredSub: { fontSize: 14, marginBottom: 8 },
    reorderButtonSmall: {
        backgroundColor: 'white', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, alignSelf: 'flex-start'
    },

    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.l,
    },
    listIcon: {
        width: 60, height: 60, borderWidth: 1, borderColor: '#eee', marginRight: SPACING.m, borderRadius: 8, backgroundColor: 'white'
    },
    listDetails: { flex: 1 },
    listTitle: { fontWeight: 'bold', fontSize: 16 },
    listSub: { color: '#666', fontSize: 12 },
    listPrice: { fontWeight: 'bold', fontSize: 14 },

    reorderButton: {
        backgroundColor: '#888', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16
    },
    reorderText: { fontWeight: 'bold', fontSize: 12, color: 'black' }
});
