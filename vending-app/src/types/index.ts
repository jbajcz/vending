export interface User {
    user_id: number;
    name: string;
    email: string;
    credits: number;
    accessibility_preferences: string;
}

export interface BusinessUser {
    business_user_id: number;
    name: string;
    email: string;
    role: string;
}

export interface VendingMachine {
    machine_id: number;
    location_lat: number;
    location_lng: number;
    address: string;
    accessible_features: string;
    status: 'operational' | 'maintenance' | 'offline';
    // Calculated fields
    distance?: number;
}

export interface Item {
    item_id: number;
    name: string;
    category: string;
    image_url?: string; // Placeholder for UI
}

export interface InventoryItem extends Item {
    quantity: number;
    inventory_id: number;
    machine_id: number;
}

export interface Purchase {
    purchase_id: number;
    user_id: number;
    machine_id: number;
    item_id: number;
    timestamp: string;
    credits_earned: number;
    // Joins
    item_name?: string;
    machine_address?: string;
}

export interface ProblemReport {
    report_id: number;
    user_id: number;
    machine_id: number;
    description: string;
    photo_url?: string;
    status: 'open' | 'resolved';
    created_at: string;
}
