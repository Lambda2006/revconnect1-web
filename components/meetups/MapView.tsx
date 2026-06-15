import React, { useEffect } from 'react'
import { View, Text, StyleSheet, Platform } from 'react-native'
import Mapbox, {
  MapView as RNMapView,
  Camera,
  ShapeSource,
  CircleLayer,
  SymbolLayer,
  Images,
} from '@rnmapbox/maps'
import { colors, typography, spacing } from '@/lib/theme'

// Initialise token — set EXPO_PUBLIC_MAPBOX_TOKEN in .env before running
Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? '')

type MeetupPin = {
  id: string
  lat: number
  lng: number
  title: string
}

type BusinessPin = {
  id: string
  lat: number
  lng: number
  name: string
}

type MapViewProps = {
  meetups?: MeetupPin[]
  businesses?: BusinessPin[]
  onMeetupPress?: (meetupId: string) => void
  onBusinessPress?: (businessId: string) => void
  centerLat?: number
  centerLng?: number
  zoomLevel?: number
}

function toGeoJSON(
  meetups: MeetupPin[],
  businesses: BusinessPin[]
): {
  meetupFC: GeoJSON.FeatureCollection
  businessFC: GeoJSON.FeatureCollection
} {
  const meetupFC: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: meetups.map((m) => ({
      type: 'Feature',
      id: m.id,
      geometry: { type: 'Point', coordinates: [m.lng, m.lat] },
      properties: { id: m.id, title: m.title, kind: 'meetup' },
    })),
  }
  const businessFC: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: businesses.map((b) => ({
      type: 'Feature',
      id: b.id,
      geometry: { type: 'Point', coordinates: [b.lng, b.lat] },
      properties: { id: b.id, name: b.name, kind: 'business' },
    })),
  }
  return { meetupFC, businessFC }
}

export function MapView({
  meetups = [],
  businesses = [],
  onMeetupPress,
  onBusinessPress,
  centerLat = 27.9944024,
  centerLng = -81.7602544,
  zoomLevel = 6,
}: MapViewProps) {
  const { meetupFC, businessFC } = toGeoJSON(meetups, businesses)

  // If token is missing, show a clear placeholder rather than a broken map
  if (!process.env.EXPO_PUBLIC_MAPBOX_TOKEN) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderIcon}>🗺️</Text>
        <Text style={styles.placeholderText}>Map requires Mapbox token</Text>
        <Text style={styles.placeholderSub}>
          Set EXPO_PUBLIC_MAPBOX_TOKEN in .env
        </Text>
      </View>
    )
  }

  function handleMeetupPress(event: any) {
    const feature = event?.features?.[0]
    if (feature?.properties?.id) {
      onMeetupPress?.(feature.properties.id)
    }
  }

  function handleBusinessPress(event: any) {
    const feature = event?.features?.[0]
    if (feature?.properties?.id) {
      onBusinessPress?.(feature.properties.id)
    }
  }

  return (
    <View style={styles.container}>
      <RNMapView
        style={styles.map}
        styleURL={Mapbox.StyleURL.Street}
        logoEnabled={false}
        attributionEnabled={false}
        compassEnabled
      >
        <Camera
          zoomLevel={zoomLevel}
          centerCoordinate={[centerLng, centerLat]}
          animationMode="none"
        />

        {/* Meetup pins — red circles */}
        <ShapeSource
          id="meetupsSource"
          shape={meetupFC}
          onPress={handleMeetupPress}
        >
          <CircleLayer
            id="meetupsCircle"
            style={{
              circleRadius: 10,
              circleColor: colors.meetupPin,
              circleStrokeWidth: 2,
              circleStrokeColor: colors.white,
            }}
          />
          <SymbolLayer
            id="meetupsLabel"
            style={{
              textField: ['get', 'title'],
              textSize: 11,
              textOffset: [0, 1.8],
              textAnchor: 'top',
              textColor: colors.textPrimary,
              textHaloColor: colors.white,
              textHaloWidth: 1.5,
              textOptional: true,
            }}
          />
        </ShapeSource>

        {/* Business pins — navy circles */}
        <ShapeSource
          id="businessesSource"
          shape={businessFC}
          onPress={handleBusinessPress}
        >
          <CircleLayer
            id="businessesCircle"
            style={{
              circleRadius: 8,
              circleColor: colors.businessPin,
              circleStrokeWidth: 2,
              circleStrokeColor: colors.white,
            }}
          />
        </ShapeSource>
      </RNMapView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  placeholder: {
    flex: 1,
    backgroundColor: '#D9E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  placeholderIcon: { fontSize: 48, marginBottom: spacing.sm },
  placeholderText: {
    fontSize: typography.md,
    fontWeight: '600',
    color: colors.textNavy,
    marginBottom: spacing.xs,
  },
  placeholderSub: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
})
