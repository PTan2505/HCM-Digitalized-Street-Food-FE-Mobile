import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    ScrollView,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

interface Location {
    id: string;
    name: string;
    rating: number;
    distance: string;
    priceRange: string;
    tag: string;
    tagColor: string;
    image: any;
    likes: number;
    comments: number;
    isTopPick?: boolean;
}

const CurrentPickDetailsScreen = () => {
    const [sortBy, setSortBy] = useState('default');

    const locations: Location[] = [
        {
            id: '1',
            name: 'Bánh mì Huỳnh Hoa',
            rating: 4.5,
            distance: '0.8 km',
            priceRange: 'Từ 150k đến 200k',
            tag: 'Món Việt',
            tagColor: '#00bfa5',
            image: { uri: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400' },
            likes: 2,
            comments: 0,
            isTopPick: true,
        },
        {
            id: '2',
            name: 'Quán Gà Ta Muối',
            rating: 4.5,
            distance: '0.8 km',
            priceRange: 'Từ 150k đến 200k',
            tag: 'Món Việt',
            tagColor: '#00bfa5',
            image: { uri: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400' },
            likes: 2,
            comments: 1,
        },
        {
            id: '3',
            name: 'The Gangs Mac Đĩnh Chi',
            rating: 4.5,
            distance: '0.8 km',
            priceRange: 'Từ 200k đến 500k',
            tag: 'Đi tập nhóm bè',
            tagColor: '#00bfa5',
            image: { uri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400' },
            likes: 2,
            comments: 1,
        },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerButton}>
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerButton}>
                    <Ionicons name="ellipsis-horizontal" size={24} color="#000" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Title Section */}
                <View style={styles.titleSection}>
                    <Text style={styles.title}>Current Picks #1</Text>
                    <Text style={styles.subtitle}>3 địa điểm</Text>

                    <View style={styles.statusContainer}>
                        <Text style={styles.statusText}>Danh sách hết hạn trong</Text>
                        <View style={styles.timeContainer}>
                            <View style={styles.timeBadge}>
                                <Text style={styles.timeText}>04 ngày</Text>
                            </View>
                            <Text style={styles.timeSeparator}>:</Text>
                            <View style={styles.timeBadge}>
                                <Text style={styles.timeText}>12 tiếng</Text>
                            </View>
                            <Text style={styles.timeSeparator}>:</Text>
                            <View style={styles.timeBadge}>
                                <Text style={styles.timeText}>21 phút</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.actionButton}>
                        <MaterialIcons name="restaurant-menu" size={20} color="#000" />
                        <Text style={styles.actionButtonText}>Bản đồ</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="share-outline" size={20} color="#000" />
                        <Text style={styles.actionButtonText}>Chia sẻ</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButtonPrimary}>
                        <Ionicons name="bed-outline" size={20} color="#00a86b" />
                        <Text style={styles.actionButtonPrimaryText}>Chọn ngẫu nhiên</Text>
                    </TouchableOpacity>
                </View>

                {/* List Header */}
                <View style={styles.listHeader}>
                    <Text style={styles.listTitle}>Danh sách địa điểm</Text>
                    <TouchableOpacity style={styles.sortButton}>
                        <MaterialIcons name="sort" size={20} color="#666" />
                        <Text style={styles.sortText}>Sắp xếp theo</Text>
                    </TouchableOpacity>
                </View>

                {/* Locations List */}
                <View style={styles.locationsList}>
                    {locations.map((location) => (
                        <View key={location.id} style={styles.locationCard}>
                            <View style={styles.locationImageContainer}>
                                {location.isTopPick && (
                                    <View style={styles.topPickBadge}>
                                        <Text style={styles.topPickText}>Top pick</Text>
                                    </View>
                                )}
                                <Image source={location.image} style={styles.locationImage} />
                            </View>

                            <View style={styles.locationInfo}>
                                <Text style={styles.locationName}>{location.name}</Text>

                                <View style={styles.locationMeta}>
                                    <Ionicons name="star" size={14} color="#ffc107" />
                                    <Text style={styles.ratingText}>{location.rating}</Text>
                                    <Text style={styles.metaSeparator}>·</Text>
                                    <Text style={styles.distanceText}>{location.distance}</Text>
                                </View>

                                <View style={styles.priceContainer}>
                                    <Ionicons name="diamond-outline" size={14} color="#00bfa5" />
                                    <Text style={styles.priceText}>{location.priceRange}</Text>
                                </View>

                                <View style={styles.tagContainer}>
                                    <View style={[styles.tag, { backgroundColor: location.tagColor }]}>
                                        <Text style={styles.tagText}>{location.tag}</Text>
                                    </View>
                                </View>

                                <View style={styles.engagementBar}>
                                    <View style={styles.engagementItem}>
                                        <Ionicons name="thumbs-up-outline" size={16} color="#666" />
                                        <Text style={styles.engagementText}>{location.likes}</Text>
                                    </View>
                                    <View style={styles.engagementItem}>
                                        <Ionicons name="chatbubble-outline" size={16} color="#666" />
                                        <Text style={styles.engagementText}>{location.comments}</Text>
                                    </View>
                                </View>
                            </View>

                            <TouchableOpacity style={styles.bookmarkButton}>
                                <Ionicons name="bookmark" size={24} color="#ff6b35" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    headerButton: {
        padding: 4,
    },
    scrollView: {
        flex: 1,
    },
    titleSection: {
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#000',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#999',
        marginBottom: 12,
    },
    statusContainer: {
        marginBottom: 20,
    },
    statusText: {
        fontSize: 14,
        color: '#00a86b',
        marginBottom: 8,
        fontWeight: '500',
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        borderWidth: 1.5,
        borderColor: '#4caf50',
        backgroundColor: '#fff',
    },
    timeText: {
        fontSize: 12,
        color: '#4caf50',
        fontWeight: '500',
    },
    timeSeparator: {
        fontSize: 14,
        color: '#4caf50',
        fontWeight: '600',
        marginHorizontal: 6,
    },
    actionButtons: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 20,
        gap: 8,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        backgroundColor: '#fff',
        gap: 6,
    },
    actionButtonText: {
        fontSize: 14,
        color: '#000',
        fontWeight: '500',
    },
    actionButtonPrimary: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#00a86b',
        backgroundColor: '#fff',
        gap: 6,
    },
    actionButtonPrimaryText: {
        fontSize: 14,
        color: '#00a86b',
        fontWeight: '500',
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    listTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    sortText: {
        fontSize: 14,
        color: '#666',
    },
    locationsList: {
        paddingHorizontal: 16,
    },
    locationCard: {
        flexDirection: 'row',
        marginBottom: 20,
        backgroundColor: '#fff',
    },
    locationImageContainer: {
        position: 'relative',
        marginRight: 12,
    },
    topPickBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: '#ff6b35',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        zIndex: 1,
    },
    topPickText: {
        fontSize: 10,
        color: '#fff',
        fontWeight: '600',
    },
    locationImage: {
        width: 100,
        height: 100,
        borderRadius: 12,
        backgroundColor: '#f0f0f0',
    },
    locationInfo: {
        flex: 1,
        justifyContent: 'flex-start',
    },
    locationName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 6,
    },
    locationMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    ratingText: {
        fontSize: 13,
        color: '#000',
        marginLeft: 4,
        fontWeight: '500',
    },
    metaSeparator: {
        fontSize: 13,
        color: '#999',
        marginHorizontal: 6,
    },
    distanceText: {
        fontSize: 13,
        color: '#666',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 4,
    },
    priceText: {
        fontSize: 13,
        color: '#00bfa5',
        fontWeight: '500',
    },
    tagContainer: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    tag: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    tagText: {
        fontSize: 11,
        color: '#fff',
        fontWeight: '600',
    },
    engagementBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    engagementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    engagementText: {
        fontSize: 13,
        color: '#666',
    },
    bookmarkButton: {
        padding: 4,
        alignSelf: 'flex-start',
    },
});

export default CurrentPickDetailsScreen;