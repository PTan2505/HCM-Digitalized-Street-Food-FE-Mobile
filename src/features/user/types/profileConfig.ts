import { ComponentType } from 'react';
import { GestureResponderEvent } from 'react-native';

export type ProfileSectionType =
  | 'header'
  | 'action-cards'
  | 'tabs'
  | 'payment-cards'
  | 'feature-buttons'
  | 'list-items'
  | 'custom';

export interface ProfileSectionItem {
  id: string;
  icon?: string;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  onPress?: (event: GestureResponderEvent) => void;
  rightText?: string;
  rightIcon?: string;
  color?: string;
  visible?: boolean;
}

export interface ProfileActionCard {
  id: string;
  icon?: string;
  title: string;
  subtitle?: string;
  onPress?: (event: GestureResponderEvent) => void;
  backgroundColor?: string;
}

export interface ProfileTab {
  id: string;
  title: string;
}

export interface ProfileSection {
  id: string;
  title?: string;
  type: ProfileSectionType;
  items?: ProfileSectionItem[];
  actionCards?: ProfileActionCard[];
  tabs?: ProfileTab[];
  component?: ComponentType<Record<string, never>>;
  visible?: boolean;
  containerClassName?: string;
  titleClassName?: string;
}
