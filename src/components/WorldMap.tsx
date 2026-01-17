'use client';

/**
 * WorldMap Component
 * 
 * Displays conferences on an interactive world map using react-leaflet.
 * Uses dynamic import with SSR disabled.
 */

import { useEffect, useState } from 'react';
import type { Conference } from '@/types/conference';
import 'leaflet/dist/leaflet.css';

interface WorldMapProps {
    conferences: Conference[];
    onMarkerClick?: (conference: Conference) => void;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
type LeafletComponents = {
    MapContainer: any;
    TileLayer: any;
    CircleMarker: any;
    Popup: any;
};
/* eslint-enable @typescript-eslint/no-explicit-any */

function MapContainerComponent({ conferences, onMarkerClick }: WorldMapProps) {
    const [components, setComponents] = useState<LeafletComponents | null>(null);

    useEffect(() => {
        import('react-leaflet').then(m => {
            setComponents({
                MapContainer: m.MapContainer,
                TileLayer: m.TileLayer,
                CircleMarker: m.CircleMarker,
                Popup: m.Popup,
            });
        });
    }, []);

    if (!components) {
        return (
            <div className="w-full h-[400px] bg-gray-900 rounded-lg flex items-center justify-center">
                <div className="text-gray-400">Loading map...</div>
            </div>
        );
    }

    const { MapContainer, TileLayer, CircleMarker, Popup } = components;

    // Filter conferences with valid coordinates
    const mappableConferences = conferences.filter(
        c => c.location?.lat && c.location?.lng
    );

    // Get marker color based on domain
    const getDomainColor = (domain: string): string => {
        const colors: Record<string, string> = {
            ai: '#8B5CF6',
            software: '#3B82F6',
            security: '#EF4444',
            web: '#10B981',
            mobile: '#F59E0B',
            cloud: '#06B6D4',
            data: '#EC4899',
            devops: '#8B5CF6',
            opensource: '#22C55E',
            academic: '#6366F1',
            general: '#6B7280',
        };
        return colors[domain] || '#6B7280';
    };

    return (
        <MapContainer
            center={[30, 0]}
            zoom={2}
            style={{ height: '400px', width: '100%', borderRadius: '0.5rem' }}
            scrollWheelZoom={false}
        >
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />
            {mappableConferences.map((conf, idx) => (
                <CircleMarker
                    key={`${conf.id}-${idx}`}
                    center={[conf.location.lat!, conf.location.lng!]}
                    radius={6}
                    pathOptions={{
                        fillColor: getDomainColor(conf.domain),
                        fillOpacity: 0.8,
                        color: '#fff',
                        weight: 1,
                    }}
                    eventHandlers={{
                        click: () => onMarkerClick?.(conf),
                    }}
                >
                    <Popup>
                        <div className="text-sm">
                            <div className="font-bold">{conf.name}</div>
                            <div className="text-gray-600">{conf.location.raw}</div>
                            {conf.startDate && (
                                <div className="text-gray-500">{conf.startDate}</div>
                            )}
                            {conf.cfp?.status === 'open' && (
                                <div className="text-green-600 font-medium">CFP Open</div>
                            )}
                        </div>
                    </Popup>
                </CircleMarker>
            ))}
        </MapContainer>
    );
}

export default function WorldMap(props: WorldMapProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return (
            <div className="w-full h-[400px] bg-gray-900 rounded-lg flex items-center justify-center">
                <div className="text-gray-400">Loading map...</div>
            </div>
        );
    }

    return <MapContainerComponent {...props} />;
}
