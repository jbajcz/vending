import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function AccountScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Header */}
                <Text style={styles.headerTitle}>Account</Text>
                <Text style={styles.userName}>Jack Adams</Text>

                {/* Payment Methods */}
                <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>Payment Methods</Text>
                    <TouchableOpacity>
                        <Text style={styles.addNew}>+ Add new</Text>
                    </TouchableOpacity>
                </View>

                {/* Visa Cards List */}
                <View style={styles.paymentList}>
                    {[1, 2, 3].map((_, i) => (
                        <View key={i} style={styles.paymentRow}>
                            <View style={styles.cardIcon}>
                                <Text style={styles.cardIconText}>VISA</Text>
                            </View>
                            <View style={styles.cardDetails}>
                                <Text style={styles.cardName}>Visa •••••1111</Text>
                                <Text style={styles.cardExp}>John Adams • 11/2029</Text>
                            </View>
                        </View>
                    ))}
                    <View style={styles.divider} />
                </View>

                {/* Settings */}
                <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>Settings</Text>
                </TouchableOpacity>

                <View style={styles.settingRow}>
                    <Text style={styles.settingText}>Text-to-speech</Text>
                    <Switch value={true} trackColor={{ false: "#767577", true: COLORS.primary }} thumbColor={"#f4f3f4"} />
                </View>

                <TouchableOpacity style={[
                    styles.actionButton,
                    { backgroundColor: '#666', marginTop: SPACING.l }
                ]}>
                    <Text style={styles.actionButtonText}>Log out</Text>
                </TouchableOpacity>

            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: SPACING.l },

    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.text,
        textAlign: 'center',
    },
    userName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#8BC34A', // Greenish from screenshot
        textAlign: 'center',
        marginBottom: SPACING.xl,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.m,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    addNew: {
        color: '#4A90E2', // Blue
        fontSize: 14,
    },
    paymentList: {
        marginBottom: SPACING.xl,
    },
    paymentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.m,
        borderBottomWidth: 1,
        borderBottomColor: '#444',
        paddingBottom: SPACING.m,
    },
    cardIcon: {
        width: 60,
        height: 40,
        backgroundColor: '#FFF',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.m,
    },
    cardIconText: {
        color: '#1A1F71', // Visa Blue
        fontWeight: '900',
        fontSize: 16,
        fontStyle: 'italic',
    },
    cardDetails: {
        flex: 1,
    },
    cardName: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '500',
    },
    cardExp: {
        color: '#AAA',
        fontSize: 12,
    },
    divider: {
        borderBottomWidth: 1,
        borderBottomColor: '#444',
    },
    actionButton: {
        backgroundColor: '#555',
        padding: SPACING.m,
        borderRadius: RADIUS.m,
        marginBottom: SPACING.m,
        alignItems: 'center',
    },
    actionButtonText: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '500',
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.m,
    },
    settingText: {
        color: COLORS.text,
        fontSize: 18,
    }
});
