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
    { label: 'Drinks', color: COLORS.iconGreen, icon: 'water' },
    { label: 'Healthy', color: COLORS.iconOrange, icon: 'leaf' },
    { label: 'Snacks', color: COLORS.iconWhite, icon: 'fast-food' },
    { label: 'Candy', color: COLORS.iconBlue, icon: 'ice-cream' },
    { label: 'Meals', color: COLORS.iconOrange, icon: 'restaurant' },
];

export default function HomeScreen() {
    const navigation = useNavigation<any>();
    const [machines, setMachines] = useState<any[]>([]);
    const [suggestions, setSuggestions] = useState<Item[]>([]);

    // Refs for scrolling
    const scrollViewRef = React.useRef<ScrollView>(null);
    const sectionPositions = React.useRef<{ [key: string]: number }>({});

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Machines
            const machineData = await runQuery('SELECT * FROM vending_machines LIMIT 20');
            setMachines(machineData.map((m, i) => ({ ...m, distance: `${(i + 1) * 0.5 + 2} mi` })));

            // Fetch ALL items for categorization
            const items = await runQuery('SELECT * FROM items');
            setSuggestions(items); // Keep all in state
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

    const handleCategoryPress = (label: string) => {
        const y = sectionPositions.current[label];
        if (y !== undefined && scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ y, animated: true });
        }
    };

    const renderItemCarousel = (title: string, items: Item[]) => {
        if (!items || items.length === 0) return null;
        return (
            <View
                key={title}
                onLayout={(event) => {
                    const layout = event.nativeEvent.layout;
                    sectionPositions.current[title] = layout.y;
                }}
            >
                <Text style={styles.sectionTitle}>{title}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                    {items.map((item) => (
                        <TouchableOpacity
                            key={item.item_id}
                            style={styles.machineCard} // Reuse card style for uniformity
                            onPress={() => navigation.navigate('Map', { searchItem: item.name })}
                        >
                            <View style={styles.imagePlaceholder}>
                                <Image
                                    source={ITEM_IMAGES[item.name]}
                                    style={styles.itemImage}
                                    resizeMode="contain"
                                />
                            </View>
                            <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        );
    };

    const drinks = suggestions.filter(i => i.category === 'Drink');
    const snacks = suggestions.filter(i => i.category === 'Snack');
    const candy = suggestions.filter(i => i.category === 'Candy');
    const healthy = suggestions.filter(i => i.category === 'Health');
    // Random mix for "Suggestions" - shuffle and take 10
    const randomSuggestions = [...suggestions].sort(() => 0.5 - Math.random()).slice(0, 10);

    return (
        <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
            <ScrollView
                ref={scrollViewRef}
                contentContainerStyle={styles.content}
            >

                {/* Header title */}
                <Text style={styles.headerTitle}>Vendor</Text>

                {/* Search Bar */}
                <TouchableOpacity
                    style={styles.searchContainer}
                    activeOpacity={0.9}
                    onPress={() => navigation.navigate('Search')}
                >
                    <Ionicons name="search" size={20} color="#FFF" style={styles.searchIcon} />
                    <TextInput
                        placeholder="Search item"
                        placeholderTextColor="#FFF"
                        style={styles.searchInput}
                        editable={false}
                        pointerEvents="none"
                    />
                </TouchableOpacity>

                {/* Categories Row */}
                <View style={styles.categoriesRow}>
                    {CATEGORIES.map((cat, index) => (
                        <CategoryItem
                            key={index}
                            color={cat.color}
                            label={cat.label}
                            icon={cat.icon}
                            onPress={() => handleCategoryPress(cat.label)}
                        />
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

                {/* Item Suggestion Carousel */}
                {renderItemCarousel('Item Suggestions', randomSuggestions)}

                {/* Category Carousels */}
                {renderItemCarousel('Drinks', drinks)}
                {renderItemCarousel('Snacks', snacks)}
                {renderItemCarousel('Candy', candy)}
                {renderItemCarousel('Healthy', healthy)}
                {/* Note: "Meals" doesn't have a section yet in render logic above, assuming no logic for it requested, but icon exists. */}

                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const CategoryItem = ({ color, label, icon, onPress }: { color: string, label: string, icon: any, onPress: () => void }) => (
    <TouchableOpacity style={styles.categoryParam} onPress={onPress}>
        <Ionicons name={icon} size={28} color={color} style={{ marginBottom: 4 }} />
        <Text style={styles.categoryText}>{label}</Text>
    </TouchableOpacity>
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
        backgroundColor: '#333',
        borderRadius: RADIUS.l,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.m,
        height: 50,
        marginBottom: SPACING.l,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    searchIcon: { marginRight: 8 },
    searchInput: {
        flex: 1,
        height: '100%',
        color: '#FFF',
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
        justifyContent: 'center',
        backgroundColor: '#333',
        borderRadius: 10,
        padding: 10,
        width: 60, // Fixed width for uniformity
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
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
        width: 110,
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
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    machineImage: {
        width: 80,
        height: 80,
        opacity: 0.8,
    },
    itemImage: {
        width: 80,
        height: 80,
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
