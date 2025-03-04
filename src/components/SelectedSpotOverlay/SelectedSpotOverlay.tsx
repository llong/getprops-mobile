import React, { useMemo } from "react";
import { View } from "react-native";
import { Overlay, Text, Button } from "@rneui/themed";
import { User } from "@supabase/supabase-js";
import { ISpot, SpotImage } from "@/types/spot";
import { SelectedSpotCarousel } from "@components/SelectedSpotCarousel/SelectedSpotCarousel";
import { useSpotImages } from "@hooks/useSpotImages";
import styles from "./SelectedSpotOverlayStyles"; // Import the new styles

type SelectedSpotOverlayProps = {
  spot: ISpot;
  isVisible: boolean;
  onClose: () => void;
  onView: (spot: ISpot) => void;
  onEdit?: () => void;
  currentUser?: User | null;
};

export const SelectedSpotOverlay: React.FC<SelectedSpotOverlayProps> =
  React.memo(({ spot, isVisible, onClose, onView, onEdit, currentUser }) => {
    console.log("Spot:", spot);
    const { images: spotImages, loading } = useSpotImages(spot.id);
    const canEdit = currentUser?.id === spot.createdBy;

    // Memoize mapped photos to prevent unnecessary recalculations
    const mappedPhotos: SpotImage[] = useMemo(() => {
      return Array.isArray(spot.photos)
        ? spot.photos.map((photo, index) => ({
            id: `photo-${index}`,
            url: photo,
            uri: photo,
          }))
        : [];
    }, [spot.photos]);

    console.log("Spot Images:", spotImages); // Debugging line
    console.log("Mapped Photos:", mappedPhotos); // Debugging line
    console.log("Spot Images in Overlay:", spotImages); // Debugging line
    console.log("spot", spot);

    return (
      <Overlay
        isVisible={isVisible}
        onBackdropPress={onClose}
        overlayStyle={styles.overlay}
        backdropStyle={styles.backdrop}
      >
        <View style={styles.content}>
          <View>
            <Text h4 style={styles.title}>
              {spot.name}
            </Text>
            <Button
              icon={{
                name: "close",
                type: "material",
                size: 25,
              }}
              type="clear"
              onPress={onClose}
            />
          </View>

          {/* Use the photos prop, which is what the component actually uses */}
          <SelectedSpotCarousel
            spotId={spot.id}
            photos={mappedPhotos}
            isLoading={loading}
          />

          <Text style={styles.address}>
            {spot.address ?? "Address not available"}
          </Text>

          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Text>Difficulty</Text>
              <Text>{spot.difficulty ?? "Not specified"}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text>Lit</Text>
              <Text>{spot.isLit ? "Yes" : "No"}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text>Kickout Risk</Text>
              <Text>{spot.kickoutRisk ?? "Low"}</Text>
            </View>
          </View>

          <Text>{spot.description ?? "No description available"}</Text>

          <View style={styles.buttonContainer}>
            <Button
              title="View Details"
              onPress={() => onView(spot)}
              buttonStyle={styles.viewButton}
            />
            {canEdit && onEdit && (
              <Button
                title="Edit"
                onPress={onEdit}
                buttonStyle={styles.editButton}
                type="outline"
              />
            )}
          </View>
        </View>
      </Overlay>
    );
  });
