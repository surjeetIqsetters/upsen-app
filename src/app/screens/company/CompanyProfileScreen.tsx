import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header, Card, Loading } from '@app/components';
import { companyApi } from '@app/services/api';
import { Colors, Typography, Spacing, BorderRadius } from '@app/utils/constants';

interface CompanyInfo {
  name: string;
  legalName: string;
  logoUrl?: string;
  ceoName: string;
  employeeCount: number;
  headquarters: string;
  sector: string;
  industry: string;
  description: string;
  website: string;
}

export const CompanyProfileScreen: React.FC = () => {
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCompanyInfo();
  }, []);

  const loadCompanyInfo = async () => {
    try {
      const data = await companyApi.getCompanyInfo();
      setCompany(data as CompanyInfo);
    } catch (error) {
      console.error('Failed to load company info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Header title="Company Profile" />
        <Loading fullScreen />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Company Profile" />
      <ScrollView style={styles.content}>
        {/* Company Header */}
        <Card style={styles.headerCard}>
          <View style={styles.logoContainer}>
            {company?.logoUrl ? (
              <Image source={{ uri: company.logoUrl }} style={styles.logo} />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Ionicons name="business" size={48} color={Colors.primary} />
              </View>
            )}
          </View>
          <Text style={styles.companyName}>{company?.name || 'Company Name'}</Text>
          <Text style={styles.legalName}>{company?.legalName || 'Legal Name'}</Text>
        </Card>

        {/* About */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{company?.description || 'No description available.'}</Text>
        </Card>

        {/* Details */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Company Details</Text>
          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={20} color={Colors.gray400} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>CEO</Text>
              <Text style={styles.detailValue}>{company?.ceoName || 'N/A'}</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="people-outline" size={20} color={Colors.gray400} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Employees</Text>
              <Text style={styles.detailValue}>{company?.employeeCount || 'N/A'}</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={20} color={Colors.gray400} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Headquarters</Text>
              <Text style={styles.detailValue}>{company?.headquarters || 'N/A'}</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="briefcase-outline" size={20} color={Colors.gray400} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Industry</Text>
              <Text style={styles.detailValue}>{company?.industry || 'N/A'}</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="globe-outline" size={20} color={Colors.gray400} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Website</Text>
              <Text style={styles.detailValue}>{company?.website || 'N/A'}</Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  content: {
    padding: Spacing.base,
  },
  headerCard: {
    alignItems: 'center',
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  logoContainer: {
    marginBottom: Spacing.md,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLighter,
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyName: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
  },
  legalName: {
    fontSize: Typography.size.base,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  section: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: Typography.size.base,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  detailContent: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  detailLabel: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.medium,
    color: Colors.textPrimary,
    marginTop: 2,
  },
});
