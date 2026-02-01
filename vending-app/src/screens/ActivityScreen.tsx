import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { runQuery } from '../services/db';
import { Purchase } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { ITEM_IMAGES } from '../constants/assets';

export default function ActivityScreen() {
    const navigation = useNavigation<any>();
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
        <TouchableOpacity
            style={styles.listItem}
            onPress={() => item.item_name && navigation.navigate('Map', { searchItem: item.item_name })}
        >
            <View style={styles.imageContainer}>
                <Image
                    source={ITEM_IMAGES[item.item_name || ''] || null}
                    style={styles.listIcon}
                    resizeMode="contain"
                />
            </View>
            <View style={styles.listDetails}>
                <Text style={styles.listTitle}>Past Transaction</Text>
                <Text style={styles.listSub}>{item.timestamp}</Text>
                <Text style={styles.listPrice}>$1.50</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.headerTitle}>Activity</Text>

                <FlatList
                    data={purchases}
                    ListHeaderComponent={() => (
                        <View>
                            {/* Rewards Card */}
                            <View style={styles.rewardsCard}>
                                <Ionicons name="information-circle-outline" size={24} color="white" style={styles.infoIcon} />
                                <Text style={styles.rewardsAmount}>$29.50</Text>
                                <Text style={styles.rewardsLabel}>Rewards Cash</Text>

                                <View style={styles.rewardsFooter}>
                                    <Text style={styles.rewardsFooterText}>
                                        Earn more by letting us know your favorite items!
                                    </Text>
                                    <TouchableOpacity style={styles.earnMoreBtn}>
                                        <Text style={styles.earnMoreText}>Earn More!</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <Text style={styles.sectionTitle}>Transaction History</Text>
                        </View>
                    )}
                    keyExtractor={item => item.purchase_id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ItemSeparatorComponent={() => <View style={styles.divider} />}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { flex: 1, paddingHorizontal: SPACING.m },

    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.text,
        textAlign: 'center',
        marginVertical: SPACING.m,
    },

    // Rewards Card
    rewardsCard: {
        backgroundColor: '#4A7A8C', // Slate blue from screenshot
        borderRadius: 20,
        padding: SPACING.l,
        marginBottom: SPACING.xl,
        position: 'relative',
    },
    infoIcon: {
        position: 'absolute',
        top: SPACING.m,
        right: SPACING.m,
    },
    rewardsAmount: {
        fontSize: 48,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    rewardsLabel: {
        fontSize: 18,
        color: 'white',
        marginBottom: SPACING.xl,
    },
    rewardsFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    rewardsFooterText: {
        flex: 1,
        color: '#E0E0E0', // Light grey
        fontSize: 12,
        marginRight: SPACING.m,
    },
    earnMoreBtn: {
        backgroundColor: 'white',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    earnMoreText: {
        color: '#4A7A8C',
        fontWeight: 'bold',
        fontSize: 12,
    },

    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.m,
    },

    // List Item
    listContent: {
        paddingBottom: 100,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.m,
    },
    imageContainer: {
        width: 60,
        height: 60,
        backgroundColor: 'white',
        borderRadius: 10,
        marginRight: SPACING.m,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listIcon: {
        width: '80%',
        height: '80%',
    },
    listDetails: {
        flex: 1,
    },
    listTitle: {
        fontSize: 16,
        color: 'white',
        marginBottom: 4,
    },
    listSub: {
        fontSize: 12,
        color: '#CCC',
        marginBottom: 4,
    },
    listPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#F5A623', // Gold/Orange
    },
    divider: {
        height: 1,
        backgroundColor: '#444',
    }
});
