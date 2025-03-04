import React, { useState, useMemo } from "react";
import {
  View,
  Modal,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Text, Input, SearchBar, Icon } from "@rneui/themed";
import { countries } from "countries-list";

interface CountryPickerProps {
  value: string;
  onChange: (country: string) => void;
}

export const CountryPicker = ({ value, onChange }: CountryPickerProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState("");

  const countryList = useMemo(() => {
    if (!countries) return [];
    return Object.entries(countries)
      .map(([code, data]) => ({
        code,
        name: data.name,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const filteredCountries = countryList.filter((country) =>
    country.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Input
          label="Country"
          value={value}
          editable={false}
          rightIcon={<Icon name="chevron-down" type="font-awesome" />}
        />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <Icon name="times" type="font-awesome" />
            </TouchableOpacity>
            <Text h4>Select Country</Text>
          </View>

          <SearchBar
            placeholder="Search countries..."
            value={search}
            onChangeText={setSearch}
            platform="ios"
            containerStyle={styles.searchContainer}
          />

          <FlatList
            data={filteredCountries}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.countryItem}
                onPress={() => {
                  onChange(item.name);
                  setModalVisible(false);
                }}
              >
                <Text>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: 44,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  closeButton: {
    position: "absolute",
    left: 16,
  },
  searchContainer: {
    backgroundColor: "transparent",
  },
  countryItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
});
