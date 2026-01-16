import { useState } from 'react';
import type { JSX } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  type ImageSourcePropType,
} from 'react-native';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  image: ImageSourcePropType;
  category: CategoryType;
}

export type CategoryType = 'all' | 'new' | 'main' | 'appetizer' | 'dessert';

interface MenuTabProps {
  menuItems: MenuItem[];
  appetizers: MenuItem[];
  desserts: MenuItem[];
}

const MenuTab = ({
  menuItems,
  appetizers,
  desserts,
}: MenuTabProps): JSX.Element => {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('all');

  const allMenuItems = [...menuItems, ...appetizers, ...desserts];

  const filteredMenuItems =
    activeCategory === 'all'
      ? allMenuItems
      : allMenuItems.filter((item) => item.category === activeCategory);

  const renderMenuItem = (item: MenuItem): JSX.Element => (
    <View key={item.id} className="mb-4 flex-row">
      <Image
        source={item.image}
        className="mr-3 h-[100px] w-[100px] rounded-lg bg-gray-100"
      />
      <View className="flex-1 justify-between">
        <Text className="mb-1 text-base font-semibold text-black">
          {item.name}
        </Text>
        <Text
          className="text-[13px] leading-[18px] text-gray-400 font-semibold"
          numberOfLines={2}
        >
          {item.description}
        </Text>
        <Text className="text-base font-semibold text-[#00B14F]">
          {item.price}
        </Text>
      </View>
    </View>
  );

  return (
    <>
      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="border-b border-gray-200 px-4 pt-4"
      >
        <TouchableOpacity
          className={`mr-2 flex-row items-center justify-center border-b-2 px-3 py-2 ${
            activeCategory === 'all' ? 'border-[#FF6B35]' : 'border-transparent'
          }`}
          onPress={() => setActiveCategory('all')}
        >
          <Text
            className={`text-sm ${
              activeCategory === 'all'
                ? 'font-semibold text-[#FF6B35]'
                : 'text-black-400'
            }`}
          >
            Tất cả
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`mr-2 flex-row items-center justify-center border-b-2 px-3 py-2 ${
            activeCategory === 'new' ? 'border-[#FF6B35]' : 'border-transparent'
          }`}
          onPress={() => setActiveCategory('new')}
        >
          <Text
            className={`text-sm ${
              activeCategory === 'new'
                ? 'font-semibold text-[#FF6B35]'
                : 'text-black-400'
            }`}
          >
            Món mới
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`mr-2 flex-row items-center justify-center border-b-2 px-3 py-2 ${
            activeCategory === 'main'
              ? 'border-[#FF6B35]'
              : 'border-transparent'
          }`}
          onPress={() => setActiveCategory('main')}
        >
          <Text
            className={`text-sm ${
              activeCategory === 'main'
                ? 'font-semibold text-[#FF6B35]'
                : 'text-black-400'
            }`}
          >
            Món chính
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`mr-2 flex-row items-center justify-center border-b-2 px-3 py-2 ${
            activeCategory === 'appetizer'
              ? 'border-[#FF6B35]'
              : 'border-transparent'
          }`}
          onPress={() => setActiveCategory('appetizer')}
        >
          <Text
            className={`text-sm ${
              activeCategory === 'appetizer'
                ? 'font-semibold text-[#FF6B35]'
                : 'text-black-400'
            }`}
          >
            Món khai vị
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`mr-2 flex-row items-center justify-center border-b-2 px-3 py-2 ${
            activeCategory === 'dessert'
              ? 'border-[#FF6B35]'
              : 'border-transparent'
          }`}
          onPress={() => setActiveCategory('dessert')}
        >
          <Text
            className={`text-sm ${
              activeCategory === 'dessert'
                ? 'font-semibold text-[#FF6B35]'
                : 'text-black-400'
            }`}
          >
            Món tráng miệng
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Menu Items */}
      {activeCategory === 'all' ? (
        <>
          {menuItems.length > 0 && (
            <View className="border-b border-gray-200 p-4">
              <Text className="mb-4 text-lg font-bold text-black">Món mới</Text>
              {menuItems.map(renderMenuItem)}
            </View>
          )}
          {appetizers.length > 0 && (
            <View className="border-b border-gray-200 p-4">
              <Text className="mb-4 text-lg font-bold text-black">
                Món khai vị
              </Text>
              {appetizers.map(renderMenuItem)}
            </View>
          )}
          {desserts.length > 0 && (
            <View className="border-b border-gray-200 p-4">
              <Text className="mb-4 text-lg font-bold text-black">
                Món tráng miệng
              </Text>
              {desserts.map(renderMenuItem)}
            </View>
          )}
          {allMenuItems.filter((item) => item.category === 'main').length >
            0 && (
            <View className="border-b border-gray-200 p-4">
              <Text className="mb-4 text-lg font-bold text-black">
                Món chính
              </Text>
              {allMenuItems
                .filter((item) => item.category === 'main')
                .map(renderMenuItem)}
            </View>
          )}
        </>
      ) : (
        <View className="border-b border-gray-200 p-4">
          <Text className="mb-4 text-lg font-bold text-black">
            {activeCategory === 'new'
              ? 'Món mới'
              : activeCategory === 'main'
                ? 'Món chính'
                : activeCategory === 'appetizer'
                  ? 'Món khai vị'
                  : 'Món tráng miệng'}
          </Text>
          {filteredMenuItems.length > 0 ? (
            filteredMenuItems.map(renderMenuItem)
          ) : (
            <Text className="py-8 text-center text-base text-gray-400">
              Không có món ăn nào
            </Text>
          )}
        </View>
      )}
    </>
  );
};

export default MenuTab;
