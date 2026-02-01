import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Image, TouchableOpacity, Linking, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { runQuery } from '../services/db';
import { Item, User, VendingMachine } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { ITEM_IMAGES, UI_ICONS } from '../constants/assets';

const CATEGORIES = [
    { label: 'Drinks', color: COLORS.iconGreen },
    { label: 'Healthy', color: COLORS.iconOrange },
    { label: 'Snacks', color: COLORS.iconWhite },
    { label: 'Candy', color: COLORS.iconBlue },
    { label: 'Meals', color: COLORS.iconOrange },
];

export default function HomeScreen() {
    const navigation = useNavigation<any>();
    const [machines, setMachines] = useState<any[]>([]);
    const [suggestions, setSuggestions] = useState<Item[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Machines - Mocking distance sort by index functionality
            const machineData = await runQuery('SELECT * FROM vending_machines LIMIT 20');
            setMachines(machineData.map((m, i) => ({ ...m, distance: `${(i + 1) * 0.5 + 2} mi` })));

            // Suggestions
            const items = await runQuery('SELECT * FROM items LIMIT 20');
            setSuggestions(items);
        } catch (e) {
            console.error(e);
        }
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

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>

                {/* Header title */}
                <Text style={styles.headerTitle}>Vendor</Text>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                    <TextInput
                        placeholder="Search item"
                        placeholderTextColor="#666"
                        style={styles.searchInput}
                    />
                </View>

                {/* Categories Row */}
                <View style={styles.categoriesRow}>
                    {CATEGORIES.map((cat, index) => (
                        <CategoryItem key={index} color={cat.color} label={cat.label} />
                    ))}
                </View>

                {/* Near You */}
                <Text style={styles.sectionTitle}>Vending Machines Near You</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                    {machines.map((m) => (
                        <TouchableOpacity
                            key={m.machine_id}
                            style={styles.machineCard}
                            onPress={() => handleDirections(m)}
                        >
                            <View style={styles.imagePlaceholder}>
                                {/* White rounded box as placeholder for machine visual */}
                                <Image source={UI_ICONS.vendingMachine || null} style={styles.machineImage} resizeMode="contain" />
                            </View>
                            <View style={styles.metaRow}>
                                <Text style={styles.cardTitle} numberOfLines={1}>{m.address}</Text>
                                <Text style={styles.distanceText}>{m.distance}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Suggestions Grid */}
                <Text style={styles.sectionTitle}>Item Suggestions</Text>
                <View style={styles.grid}>
                    {suggestions.map((item) => (
                        <TouchableOpacity
                            key={item.item_id}
                            style={styles.gridItem}
                            onPress={() => navigation.navigate('Map', { searchItem: item.name })}
                        >
                            <View style={styles.imagePlaceholder}>
                                <Image
                                    source={ITEM_IMAGES[item.name]}
                                    style={styles.itemImage}
                                    resizeMode="contain"
                                />
                            </View>
                            <Text style={styles.cardTitle}>{item.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const CategoryItem = ({ color, label }: { color: string, label: string }) => (
    <View style={styles.categoryParam}>
        <Ionicons name="cafe" size={28} color={color} style={{ marginBottom: 4 }} />
        <Text style={styles.categoryText}>{label}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: SPACING.m },

    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: SPACING.l,
    },
    searchContainer: {
        backgroundColor: COLORS.inputBackground,
        borderRadius: RADIUS.l,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.m,
        height: 50,
        marginBottom: SPACING.l,
    },
    searchIcon: { marginRight: 8 },
    searchInput: {
        flex: 1,
        height: '100%',
        color: '#000',
        fontSize: 16,
    },
    categoriesRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.xl,
        paddingHorizontal: SPACING.s,
    },
    categoryParam: {
        alignItems: 'center',
    },
    categoryText: {
        color: COLORS.text,
        fontSize: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.m,
    },
    horizontalScroll: {
        marginBottom: SPACING.xl,
    },
    machineCard: {
        width: 140,
        marginRight: SPACING.m,
    },
    imagePlaceholder: {
        width: '100%',
        aspectRatio: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: RADIUS.s,
        marginBottom: 8,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 8,
    },
    machineImage: {
        width: '80%',
        height: '80%',
        opacity: 0.8,
    },
    itemImage: {
        width: '90%',
        height: '90%',
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardTitle: {
        color: COLORS.text,
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
    },
    distanceText: {
        color: COLORS.accent, // Yellow from theme
        fontSize: 12,
        fontWeight: 'bold',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    gridItem: {
        width: '31%', // 3 columns
        marginBottom: SPACING.m,
    }
});
