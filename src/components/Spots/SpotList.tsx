import React from "react";
import { FlatList, RefreshControl } from "react-native";

import { ISpot } from "@/types/spot";
import { SpotListItem } from "@/screens/Spots/components/SpotListItem";

interface SpotListProps {
  spots: ISpot[];
  onSpotPress: (spot: ISpot) => void;
  refreshing: boolean;
  onRefresh: () => void;
}

export const SpotList: React.FC<SpotListProps> = ({
  spots,
  onSpotPress,
  refreshing,
  onRefresh,
}) => {
  return (
    <FlatList
      data={spots}
      renderItem={({ item }) => (
        <SpotListItem spot={item} onPress={() => onSpotPress(item)} />
      )}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    />
  );
};
