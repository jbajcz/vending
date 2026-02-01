import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

// Dummy Recent Data
const RECENT_SEARCHES = [
    { id: '1', label: 'Coca-Cola' },
    { id: '2', label: 'Snickers' },
];

const CATEGORIES = [
    { label: 'Snacks', icon: 'fast-food', color: '#FF9800' },
    { label: 'Drinks', icon: 'water', color: '#2196F3' },
    { label: 'Candy', icon: 'nutrition', color: '#E91E63' },
    { label: 'Healthy', icon: 'leaf', color: '#4CAF50' },
    { label: 'Meals', icon: 'restaurant', color: '#FF5722' },
];

export default function SearchScreen() {
    const navigation = useNavigation<any>();
    const [searchText, setSearchText] = useState('');
    const inputRef = useRef<TextInput>(null);

    useEffect(() => {
        // Auto-focus optional
        const timer = setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const handleSearch = (term: string) => {
        if (!term.trim()) return;
        // Navigate to Map with search term (Nested in Main tab)
        navigation.navigate('Main', {
            screen: 'Map',
            params: { searchItem: term }
        });
    };

    const renderCategoryItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.categoryRow}
            onPress={() => handleSearch(item.label)}
        >
            <View style={styles.categoryIconContainer}>
                <Ionicons name={item.icon as any} size={24} color={item.color} />
            </View>
            <Text style={styles.categoryText}>{item.label}</Text>
        </TouchableOpacity>
    );

    const renderRecentItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.recentRow}
            onPress={() => handleSearch(item.label)}
        >
            <Ionicons name="time-outline" size={20} color={COLORS.subtext} style={{ marginRight: 15 }} />
            <Text style={styles.recentText}>{item.label}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Search</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Search Bar */}
            <View style={{ paddingHorizontal: SPACING.m }}>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#FFF" style={styles.searchIcon} />
                    <TextInput
                        ref={inputRef}
                        style={styles.searchInput}
                        placeholder="Search Vending..."
                        placeholderTextColor="#888"
                        value={searchText}
                        onChangeText={setSearchText}
                        returnKeyType="search"
                        onSubmitEditing={() => handleSearch(searchText)}
                    />
                </View>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {/* Reusing a single scroll view or specific lists */}

                {/* Recent */}
                <Text style={styles.sectionTitle}>Recent</Text>
                <FlatList
                    data={RECENT_SEARCHES}
                    keyExtractor={item => item.id}
                    renderItem={renderRecentItem}
                    scrollEnabled={false}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                />

                <View style={{ height: SPACING.l }} />

                {/* Top Categories */}
                <Text style={styles.sectionTitle}>Top categories</Text>
                <FlatList
                    data={CATEGORIES}
                    keyExtractor={item => item.label}
                    renderItem={renderCategoryItem}
                    scrollEnabled={false}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111', // Darker background to match screenshot
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.m,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    backButton: {
        padding: 4,
    },
    searchContainer: {
        backgroundColor: '#333',
        borderRadius: RADIUS.l, // More rounded like pill
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.m,
        height: 50,
        marginBottom: SPACING.m,
    },
    searchIcon: { marginRight: 8 },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#FFF',
        height: '100%',
    },
    content: {
        flex: 1,
        paddingHorizontal: SPACING.m,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.subtext,
        marginBottom: SPACING.s,
        marginTop: SPACING.s,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.m,
    },

    // Recent
    recentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    recentText: {
        color: 'white',
        fontSize: 16,
    },

    // Categories
    categoryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    categoryIconContainer: {
        width: 30, // Fixed width for alignment
        marginRight: 10,
        alignItems: 'center',
    },
    categoryText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
    separator: {
        height: 1,
        backgroundColor: '#222',
        marginLeft: 45, // Indent separator to align with text
    }
});
