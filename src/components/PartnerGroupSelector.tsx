import React from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Text, Checkbox, List, Divider } from 'react-native-paper';
import { Partner } from '../store/slices/invitationSlice';
import { GroupSummary } from '../services/groupService';
import { Colors } from '../constants';

interface PartnerGroupSelectorProps {
  partners: Partner[];
  groups: GroupSummary[];
  selectedPartners: string[];
  selectedGroups: string[];
  onPartnerSelectionChange: (selected: string[]) => void;
  onGroupSelectionChange: (selected: string[]) => void;
}

const PartnerGroupSelector: React.FC<PartnerGroupSelectorProps> = ({
  partners,
  groups,
  selectedPartners,
  selectedGroups,
  onPartnerSelectionChange,
  onGroupSelectionChange,
}) => {
  const handleSelectAllPartners = () => {
    if (selectedPartners.length === partners.length) {
      onPartnerSelectionChange([]);
    } else {
      const allPartnerIds = partners.map((p) => p.partner?.id).filter(Boolean) as string[];
      onPartnerSelectionChange(Array.from(new Set(allPartnerIds)));
    }
  };

  const handleSelectAllGroups = () => {
    if (selectedGroups.length === groups.length) {
      onGroupSelectionChange([]);
    } else {
      const allGroupIds = groups.map((g) => g.id);
      onGroupSelectionChange(Array.from(new Set(allGroupIds)));
    }
  };

  const renderPartnerItem = ({ item }: { item: Partner }) => {
    if (!item.partner) {
      return null;
    }

    const { id, firstName, lastName, username } = item.partner;

    return (
      <List.Item
        title={
          firstName && lastName
            ? `${firstName} ${lastName}`
            : username
        }
        left={() => (
          <Checkbox.Android
            status={selectedPartners.includes(id) ? 'checked' : 'unchecked'}
            onPress={() => {
              const newSelection = selectedPartners.includes(id)
                ? selectedPartners.filter((pid) => pid !== id)
                : [...selectedPartners, id];
              onPartnerSelectionChange(Array.from(new Set(newSelection)));
            }}
            color={Colors.primary.main}
          />
        )}
        key={id}
      />
    );
  };

  const renderGroupItem = ({ item }: { item: GroupSummary }) => (
    <List.Item
      title={item.name}
      left={() => (
        <Checkbox.Android
          status={selectedGroups.includes(item.id) ? 'checked' : 'unchecked'}
          onPress={() => {
            const newSelection = selectedGroups.includes(item.id)
              ? selectedGroups.filter((gid) => gid !== item.id)
              : [...selectedGroups, item.id];
            onGroupSelectionChange(Array.from(new Set(newSelection)));
          }}
          color={Colors.primary.main}
        />
      )}
    />
  );

  return (
    <View style={styles.container}>
      {partners.length > 0 && (
        <>
          <List.Subheader>Partners</List.Subheader>
          <FlatList
            data={partners.filter((p) => p.partner)}
            renderItem={renderPartnerItem}
            keyExtractor={(item) => item.partner?.id || item.id}
          />
          <TouchableOpacity onPress={handleSelectAllPartners} style={styles.selectAllButton}>
            <Text style={styles.selectAllText}>
              {selectedPartners.length === partners.length ? 'Deselect All' : 'Select All'}
            </Text>
          </TouchableOpacity>
          <Divider />
        </>
      )}
      {groups.length > 0 && (
        <>
          <List.Subheader>Groups</List.Subheader>
          <FlatList
            data={groups}
            renderItem={renderGroupItem}
            keyExtractor={(item) => item.id}
          />
          <TouchableOpacity onPress={handleSelectAllGroups} style={styles.selectAllButton}>
            <Text style={styles.selectAllText}>
              {selectedGroups.length === groups.length ? 'Deselect All' : 'Select All'}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  selectAllButton: {
    padding: 10,
    alignItems: 'center',
  },
  selectAllText: {
    color: Colors.primary.main,
    fontWeight: 'bold',
  },
});

export default PartnerGroupSelector;
