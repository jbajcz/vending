import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function AccountScreen() {
    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.nameText}>First Last</Text>
                <Ionicons name="person-circle-outline" size={40} color="black" />
            </View>

            {/* Pills Row */}
            <View style={styles.pillsRow}>
                <View style={styles.pill}><Text style={styles.pillText}>Link Card</Text></View>
                <View style={styles.pill}><Text style={styles.pillText}>Help</Text></View>
                <View style={styles.pill}><Text style={styles.pillText}>ALLY</Text></View>
            </View>

            {/* Credit Card */}
            <View style={styles.cardContainer}>
                <View style={styles.cardInnerMock} />
                <View style={styles.cardDetails}>
                    <Text style={styles.cardLabel}>Card Account</Text>
                    <Text style={styles.cardLabel}>x1111</Text>
                    <Text style={styles.cardLabel}>EXP 2/30</Text>
                </View>

                <View style={styles.cardActions}>
                    <TouchableOpacity style={styles.smallButton}>
                        <Text style={styles.smallButtonText}>Add New</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.smallButton}>
                        <Text style={styles.smallButtonText}>Remove</Text>
                    </TouchableOpacity>
                </View>
            </View>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.card, padding: SPACING.m },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.l,
        paddingHorizontal: SPACING.s
    },
    nameText: { fontSize: 24, fontWeight: 'bold' },
    pillsRow: {
        flexDirection: 'row',
        marginBottom: SPACING.l,
    },
    pill: {
        backgroundColor: '#E0E0E0',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8
    },
    pillText: { fontWeight: 'bold', fontSize: 13 },

    cardContainer: {
        backgroundColor: '#D9D9D9',
        borderRadius: 20,
        padding: SPACING.m,
        height: 250,
    },
    cardInnerMock: {
        backgroundColor: 'white',
        height: 100,
        borderRadius: 16,
        marginBottom: SPACING.m
    },
    cardDetails: { marginBottom: SPACING.m },
    cardLabel: { fontWeight: 'bold', fontSize: 14 },
    cardActions: {
        flexDirection: 'row'
    },
    smallButton: {
        backgroundColor: 'white',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 12,
        marginRight: SPACING.s
    },
    smallButtonText: { fontSize: 12, fontWeight: 'bold' }
});
