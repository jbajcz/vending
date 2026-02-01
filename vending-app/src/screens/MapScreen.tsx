import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Image, Linking, Platform, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Callout } from 'react-native-maps';
import { COLORS, SPACING, SHADOWS, RADIUS } from '../constants/theme';
import { runQuery } from '../services/db';
import { VendingMachine } from '../types';
import { UI_ICONS } from '../constants/assets';
import { Ionicons } from '@expo/vector-icons';

const DEFAULT_REGION = {
    latitude: 40.7128,
    longitude: -74.0060,
    latitudeDelta: 0.015,
    longitudeDelta: 0.015,
};

// Helper: Normalize text for fuzzy search (remove non-alphanumeric, lowercase)
const normalizeText = (text: string) => {
    return text.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
};

export default function MapScreen() {
    const [machines, setMachines] = useState<VendingMachine[]>([]);
    const [region, setRegion] = useState(DEFAULT_REGION);
    const [searchText, setSearchText] = useState('');
    const [searchResults, setSearchResults] = useState<number[]>([]); // Machine IDs that have the item

    useEffect(() => {
        loadMachines();
    }, []);

    useEffect(() => {
        handleSearch(searchText);
    }, [searchText]);

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

        // Fetch all available inventory meta data
        // (For a larger DB, we would do this more efficiently or keep it in memory)
        const query = `
        SELECT DISTINCT m.machine_id, i.name as item_name
        FROM vending_machines m
        JOIN inventory inv ON m.machine_id = inv.machine_id
        JOIN items i ON inv.item_id = i.item_id
        WHERE inv.quantity > 0
      `;

        const inventoryData = await runQuery(query);

        // Filter in JS for "fuzzy" match
        const matchedMachineIds = inventoryData
            .filter((row: any) => normalizeText(row.item_name).includes(normalizedQuery))
            .map((row: any) => row.machine_id);

        // Unique IDs
        setSearchResults([...new Set(matchedMachineIds)]);
    };

    const handleDirections = (machine: VendingMachine) => {
        const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
        const latLng = `${machine.location_lat},${machine.location_lng}`;
        const label = machine.address;
        const url = Platform.select({
            ios: `${scheme}${label}@${latLng}`,
            android: `${scheme}${latLng}(${label})`
        });

        if (url) {
            Linking.openURL(url).catch(err => {
                console.error("Error opening maps", err);
                Alert.alert("Error", "Could not open maps application.");
            });
        }
    };

    const getPinIcon = (machineId: number) => {
        // If no search, all red.
        if (!searchText || searchText.length < 2) return UI_ICONS.mapPin;

        // If match, red. Else black.
        return searchResults.includes(machineId) ? UI_ICONS.mapPin : UI_ICONS.mapPinBlack;
    };

    return (
        <View style={styles.container}>
            {/* Map View - Top Portion */}
            <MapView
                style={styles.map}
                region={region}
                showsUserLocation
            >
                {machines.map(m => (
                    <Marker
                        key={m.machine_id}
                        coordinate={{ latitude: m.location_lat, longitude: m.location_lng }}
                        image={getPinIcon(m.machine_id)}
                        title={m.address}
                        description={"Tap for directions"}
                        onCalloutPress={() => handleDirections(m)}
                    >
                        <Callout tooltip={false} onPress={() => handleDirections(m)} />
                    </Marker>
                ))}
            </MapView>

            {/* Bottom Sheet UI */}
            <View style={styles.bottomSheet}>
                <View style={styles.handle} />

                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="black" style={{ marginRight: 8 }} />
                    <TextInput
                        placeholder="Search for an item..."
                        style={styles.searchInput}
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                </View>

                <Text style={styles.sheetTitle}>
                    {searchText ? `Results for "${searchText}"` : "Vending Machines"}
                </Text>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.machineList}>
                    {/* Actual machines */}
                    {machines.map(m => (
                        <TouchableOpacity
                            key={m.machine_id}
                            style={[styles.machineItem, {
                                opacity: (searchText && !searchResults.includes(m.machine_id)) ? 0.3 : 1
                            }]}
                            onPress={() => handleDirections(m)}
                        >
                            <Image source={UI_ICONS.vendingMachine || UI_ICONS.mapPin} style={styles.machineImage} resizeMode="contain" />
                            <Text style={{ fontSize: 10, textAlign: 'center' }} numberOfLines={1}>{m.address}</Text>
                            <Text style={{ fontSize: 8, color: COLORS.primary, textAlign: 'center' }}>Get Directions</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#ccc' },
    map: { width: '100%', height: '55%' },
    bottomSheet: {
        flex: 1,
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: SPACING.m,
    },
    handle: {
        width: 40, height: 4, backgroundColor: '#ccc', alignSelf: 'center', borderRadius: 2, marginBottom: SPACING.m
    },
    searchContainer: {
        flexDirection: 'row',
        backgroundColor: '#E0E0E0',
        borderRadius: 20,
        paddingHorizontal: SPACING.m,
        paddingVertical: 8,
        marginBottom: SPACING.l,
        alignItems: 'center'
    },
    searchInput: { flex: 1, fontSize: 14, color: 'black' },

    sheetTitle: {
        fontSize: 16, fontWeight: 'bold', marginBottom: SPACING.m
    },
    machineList: {
        flexDirection: 'row',
    },
    machineItem: {
        width: 80, marginRight: SPACING.m, alignItems: 'center'
    },
    machineImage: {
        width: 60, height: 60, marginBottom: 4, backgroundColor: '#f0f0f0', borderRadius: 4
    }
});
