import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Image, Linking, Platform, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Callout } from 'react-native-maps';
import { useRoute, useFocusEffect, useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { runQuery } from '../services/db';
import { VendingMachine, Item } from '../types';
import { UI_ICONS, ITEM_IMAGES } from '../constants/assets';
import { Ionicons } from '@expo/vector-icons';

const DEFAULT_REGION = {
    latitude: 40.7128,
    longitude: -74.0060,
    latitudeDelta: 0.015,
    longitudeDelta: 0.015,
};

// Helper to normalize text
const normalizeText = (text: string) => text.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

export default function MapScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation();

    // State
    const [machines, setMachines] = useState<VendingMachine[]>([]);
    const [selectedMachine, setSelectedMachine] = useState<VendingMachine | null>(null);
    const [machineInventory, setMachineInventory] = useState<any[]>([]);
    const [searchText, setSearchText] = useState('');
    const [searchResults, setSearchResults] = useState<number[]>([]); // Machine IDs with item

    // Load initial machines
    useEffect(() => {
        loadMachines();
    }, []);

    // Handle Route Params (from Home "Suggestions" or Activity "Reorder")
    useFocusEffect(
        useCallback(() => {
            if (route.params?.searchItem) {
                setSearchText(route.params.searchItem);
                setSelectedMachine(null); // Reset selection on new search
            }
        }, [route.params?.searchItem])
    );

    // Search Logic
    useEffect(() => {
        handleSearch(searchText);
    }, [searchText]);

    // Load Inventory when a machine is selected
    useEffect(() => {
        if (selectedMachine) {
            loadMachineInventory(selectedMachine.machine_id);
        }
    }, [selectedMachine]);

    const loadMachines = async () => {
        const data = await runQuery('SELECT * FROM vending_machines');
        setMachines(data);
    };

    const handleSearch = async (text: string) => {
        if (!text || text.length < 2) {
            setSearchResults([]);
            return;
        }
        const normalizedQuery = normalizeText(text);

        // Find machines containing the item
        const query = `
            SELECT DISTINCT m.machine_id, i.name as item_name
            FROM vending_machines m
            JOIN inventory inv ON m.machine_id = inv.machine_id
            JOIN items i ON inv.item_id = i.item_id
            WHERE inv.quantity > 0
        `;
        const inventoryData = await runQuery(query);
        const matchedMachineIds = inventoryData
            .filter((row: any) => normalizeText(row.item_name).includes(normalizedQuery))
            .map((row: any) => row.machine_id);

        setSearchResults([...new Set(matchedMachineIds)]);
    };

    const loadMachineInventory = async (machineId: number) => {
        // Fetch items for this machine
        const query = `
            SELECT i.name, inv.quantity
            FROM inventory inv
            JOIN items i ON inv.item_id = i.item_id
            WHERE inv.machine_id = ? AND inv.quantity > 0
        `;
        const data = await runQuery(query, [machineId]);
        setMachineInventory(data);
    };

    const getPinIcon = (machineId: number) => {
        if (!searchText || searchText.length < 2) return UI_ICONS.mapPin; // Default Red
        return searchResults.includes(machineId) ? UI_ICONS.mapPin : UI_ICONS.mapPinBlack; // Filtered
    };

    // Header Back Action
    const handleBack = () => {
        if (selectedMachine) {
            setSelectedMachine(null);
        } else if (searchText) {
            setSearchText('');
            setSearchResults([]); // Clear results
            navigation.setParams({ searchItem: null } as any);
        } else {
            navigation.goBack();
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* 1. Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    Map
                </Text>
                <View style={{ width: 24 }} />
            </View>

            {/* 2. Map Area */}
            <View style={styles.mapContainer}>
                <MapView
                    style={StyleSheet.absoluteFillObject}
                    initialRegion={DEFAULT_REGION}
                    showsUserLocation
                >
                    {machines.map(m => (
                        <Marker
                            key={m.machine_id}
                            coordinate={{ latitude: m.location_lat, longitude: m.location_lng }}
                            image={getPinIcon(m.machine_id)}
                            onPress={() => setSelectedMachine(m)}
                        />
                    ))}
                </MapView>
            </View>

            {/* 3. Bottom Sheet */}
            <View style={styles.bottomSheet}>
                {/* Search Bar */}
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color="#FFF" style={{ marginRight: 8 }} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search item"
                        placeholderTextColor="#FFF"
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                </View>

                {/* Content switching based on selection */}
                {selectedMachine ? (
                    <View>
                        <Text style={styles.sheetTitle}>{selectedMachine.address}</Text>
                        <Text style={styles.subTitle}>Other items in stock</Text>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.list}>
                            {machineInventory.map((item, i) => (
                                <View key={i} style={styles.inventoryCard}>
                                    <View style={styles.imagePlaceholder}>
                                        <Image source={ITEM_IMAGES[item.name]} style={styles.itemImage} resizeMode="contain" />
                                        {/* Badge as Black Circle with Number */}
                                        <View style={styles.badge}>
                                            <Text style={styles.badgeText}>{item.quantity}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.cardLabel}>{item.name}</Text>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                ) : (
                    <View>
                        <Text style={styles.sheetTitle}>Vending Machines Near You</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.list}>
                            {machines.map(m => (
                                <TouchableOpacity
                                    key={m.machine_id}
                                    style={styles.machineCard}
                                    onPress={() => setSelectedMachine(m)}
                                >
                                    <View style={[styles.imagePlaceholder,
                                    (searchText && !searchResults.includes(m.machine_id)) && { opacity: 0.3 }
                                    ]}>
                                        <Image source={UI_ICONS.vendingMachine} style={styles.machineImage} resizeMode="contain" />
                                    </View>
                                    <Text style={styles.cardLabel} numberOfLines={1}>{m.address}</Text>
                                    <Text style={styles.distanceMeta}>2.2 mi</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#222' },

    header: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.m,
        backgroundColor: '#222',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        textTransform: 'capitalize',
    },
    backBtn: { padding: 4 },

    mapContainer: {
        flex: 1,
        backgroundColor: '#A3C55A', // Olive Green Placeholder in case map loads slow/fails?
    },

    bottomSheet: {
        backgroundColor: '#222',
        padding: SPACING.m,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        marginTop: -20, // Overlap map
        paddingBottom: 40,
    },
    searchBar: {
        backgroundColor: '#333', // Dark background
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.m,
        height: 50,
        marginBottom: SPACING.l,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: 'white',
    },

    sheetTitle: {
        color: 'white',
        fontSize: 21,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    subTitle: {
        color: '#BBB',
        fontSize: 14,
        marginBottom: SPACING.m,
    },

    list: {
        flexDirection: 'row',
        paddingBottom: SPACING.m,
    },

    // Cards
    machineCard: {
        width: 110,
        marginRight: SPACING.m,
    },
    inventoryCard: {
        width: 110,
        marginRight: SPACING.m,
    },
    cardLabel: {
        color: 'white',
        fontSize: 12,
        marginTop: 6,
        textAlign: 'center',
    },
    distanceMeta: {
        color: COLORS.accent,
        fontSize: 10,
        textAlign: 'center',
        marginTop: 2,
    },

    imagePlaceholder: {
        width: 110,
        height: 110,
        backgroundColor: '#FFFFFF', // White Card
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 8,
        position: 'relative',
    },
    machineImage: { width: '80%', height: '80%' },
    itemImage: { width: '90%', height: '90%' },

    badge: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: '#333', // Dark Grey Circle
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#555',
    },
    badgeText: { color: '#8BC34A', fontSize: 12, fontWeight: 'bold' }, // Green Text

    accessIcon: { position: 'absolute', top: 8, right: 8 }
});
