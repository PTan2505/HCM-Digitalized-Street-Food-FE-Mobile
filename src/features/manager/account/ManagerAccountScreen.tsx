import { userLogout } from '@slices/auth';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';

export const ManagerAccountScreen = (): React.JSX.Element => {
  const { t } = useTranslation();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dispatch = useDispatch<any>();

  const handleLogout = useCallback(() => {
    Alert.alert(
      t('manager_account.logout'),
      t('manager_account.logout_confirm'),
      [
        { text: t('manager_orders.cancel'), style: 'cancel' },
        {
          text: t('manager_account.logout'),
          style: 'destructive',
          onPress: () => {
            void dispatch(userLogout());
          },
        },
      ]
    );
  }, [dispatch, t]);

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('manager_account.title')}</Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>{t('manager_account.logout')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FBEC',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: 'Nunito-Bold',
    color: '#1F2937',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  logoutBtn: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 15,
    fontFamily: 'Nunito-SemiBold',
    color: '#DC2626',
  },
});
