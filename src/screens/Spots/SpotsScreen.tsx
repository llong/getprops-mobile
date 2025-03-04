import React, { useState, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableWithoutFeedback,
} from "react-native";
import { useSpotSearch } from "@hooks/useSpotSearch";
import { SearchInput } from "@components/SearchInput/SearchInput";
import { useAuth } from "@hooks/useAuth";
import { useAtom } from "jotai";
import { regionAtom } from "@state/location";
import { SpotListItem } from "./components/SpotListItem";
import { SpotViewToggle } from "./components/SpotViewToggle";
import { SpotMap } from "@/components/Spots/SpotMap";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type SpotViewMode = "list" | "map";

export const SpotsScreen = React.memo(() => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [viewMode, setViewMode] = useState<SpotViewMode>("map");
  const [region, setRegion] = useAtom(regionAtom);
  const { results: spots, search } = useSpotSearch();
  const searchInputRef = useRef(null);
  const { user } = useAuth();
  const [mapInteractionDisabled, setMapInteractionDisabled] = useState(false);
  const [searchResultsVisible, setSearchResultsVisible] = useState(false);
  const insets = useSafeAreaInsets();

  const handleSearch = useCallback(
    (query: string, location?: { lat: number; lng: number }) => {
      if (location) {
        const newRegion = {
          ...region,
          latitude: location.lat,
          longitude: location.lng,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        };
        setRegion(newRegion);
      }
      search(query, {
        maxDistance: 50,
        ...(location && {
          latitude: location.lat,
          longitude: location.lng,
        }),
      });
      setSearchResultsVisible(false);
    },
    [region, search, setRegion]
  );

  const handleSearchFocus = () => {
    setSearchResultsVisible(true);
    setMapInteractionDisabled(true);
  };

  const handleSearchDismiss = () => {
    setSearchResultsVisible(false);
    setMapInteractionDisabled(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <SearchInput
          ref={searchInputRef}
          placeholder="Search spots..."
          onSearch={handleSearch}
          onFocus={handleSearchFocus}
          onDismiss={handleSearchDismiss}
        />

        <SpotViewToggle
          isMapView={viewMode === "map"}
          onToggle={(newMode) => setViewMode(newMode)}
        />
      </View>

      {searchResultsVisible && (
        <TouchableWithoutFeedback onPress={handleSearchDismiss}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
      )}

      <View style={styles.content}>
        {viewMode === "list" ? (
          <FlatList
            data={spots}
            renderItem={({ item }) => (
              <SpotListItem
                spot={item}
                onPress={() =>
                  navigation.navigate("SpotDetails", {
                    spotId: item.id,
                    spot: item,
                  })
                }
              />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        ) : (
          <SpotMap
            user={user}
            spots={spots}
            region={region}
            onRegionChangeComplete={setRegion}
            disableInteraction={mapInteractionDisabled}
          />
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "white",
    zIndex: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  headerElevated: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchContainer: {
    flex: 1,
    marginRight: 10,
  },
  toggleContainer: {
    width: 80, // Fixed width for toggle
  },
  content: {
    flex: 1,
    marginTop: 60, // Adjust based on header height
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    zIndex: 5,
  },
  listContent: {
    padding: 16,
  },
  separator: {
    height: 12,
  },
});
