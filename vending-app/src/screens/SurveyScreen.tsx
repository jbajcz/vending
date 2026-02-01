import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { runQuery } from '../services/db';
import { Ionicons } from '@expo/vector-icons';
import { ITEM_IMAGES } from '../constants/assets';
import { Item } from '../types';

export default function SurveyScreen() {
    const navigation = useNavigation();
    const [items, setItems] = useState<Item[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        const data = await runQuery('SELECT * FROM items ORDER BY name');
        setItems(data);
    };

    const toggleSelection = (id: number) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(itemId => itemId !== id));
        } else {
            if (selectedIds.length >= 5) {
                Alert.alert("Limit Reached", "You can only choose up to 5 favorites.");
                return;
            }
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleSubmit = async () => {
        if (selectedIds.length === 0) {
            Alert.alert("No Selection", "Please select at least one item.");
            return;
        }

        try {
            // Save to DB (surveys table)
            // Assuming user_id = 1 for now
            const userId = 1;
            const timestamp = new Date().toISOString();

            const queries = selectedIds.map(itemId => ({
                sql: 'INSERT INTO surveys (user_id, item_id, vote, created_at) VALUES (?, ?, ?, ?)',
                args: [userId, itemId, 1, timestamp]
            }));

            // Execute sequentially or modify runQuery to handle batch/transaction if supported. 
            // For now, loop calls.
            for (const q of queries) {
                await runQuery(q.sql, q.args);
            }

            Alert.alert("Thank You!", "Your feedback helps us stock better items.", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Could not submit survey.");
        }
    };

    const renderItem = ({ item }: { item: Item }) => {
        const isSelected = selectedIds.includes(item.item_id);

        return (
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => toggleSelection(item.item_id)}
                style={styles.gridItem}
            >
                <View style={styles.cardContent}>
                    <View style={styles.imageContainer}>
                        <Image
                            source={ITEM_IMAGES[item.name]}
                            style={styles.image}
                            resizeMode="contain"
                        />
                        <View style={styles.heartContainer}>
                            <Ionicons
                                name={isSelected ? "heart" : "heart-outline"}
                                size={24}
                                color={isSelected ? "#F5A623" : "#FFF"} // Gold/Orange when selected, White outline otherwise
                            />
                        </View>
                    </View>
                    <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Choose Your Favorites!</Text>
                <Text style={styles.subtitle}>
                    Choose your top 5 favorite items to help us decide what to stock our vending machines with next!
                </Text>
            </View>

            <FlatList
                data={items}
                keyExtractor={(item) => item.item_id.toString()}
                renderItem={renderItem}
                numColumns={3}
                columnWrapperStyle={styles.columnWrapper}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />

            <View style={styles.footer}>
                <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                    <Text style={styles.submitText}>Submit</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#222' }, /* Match screenshot dark background */
    header: { padding: SPACING.m, alignItems: 'center' },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 8,
        textAlign: 'center'
    },
    subtitle: {
        fontSize: 14,
        color: '#CCC',
        textAlign: 'center',
        paddingHorizontal: SPACING.m
    },

    listContent: { padding: SPACING.m },
    columnWrapper: { justifyContent: 'space-between', marginBottom: SPACING.m },
    gridItem: {
        width: '31%', // 3 columns
    },
    cardContent: {
        alignItems: 'center'
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 1,
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
        position: 'relative'
    },
    image: {
        width: '80%',
        height: '80%'
    },
    heartContainer: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.5)', // Tiny backdrop for visibility? Or match screenshot circle
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center'
    },
    itemName: {
        color: 'white',
        fontSize: 12,
        textAlign: 'center'
    },

    footer: {
        padding: SPACING.m,
        backgroundColor: '#222',
        borderTopWidth: 1,
        borderTopColor: '#333'
    },
    submitBtn: {
        backgroundColor: '#4A809C', // Blue-ish from screenshot
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center'
    },
    submitText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold'
    }
});
