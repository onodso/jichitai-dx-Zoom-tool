'use client';

import React, { useMemo, useState } from 'react';
import DeckGL from '@deck.gl/react';
import { GeoJsonLayer } from '@deck.gl/layers';
import { Map } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

const INITIAL_VIEW_STATE = {
    longitude: 139.6917,
    latitude: 35.6895,
    zoom: 10,
    pitch: 45,
    bearing: 0
};

export const OptimizedMap = () => {
    const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);

    const onViewStateChange = ({ viewState }: any) => {
        setViewState(viewState);
    };

    const layers = useMemo(() => [
        new GeoJsonLayer({
            id: 'municipalities',
            data: '/data/municipalities_simplified.json',
            getFillColor: (d: any) => {
                const score = d.properties.score || 50;
                if (score > 80) return [0, 255, 0, 200];
                if (score > 60) return [255, 255, 0, 200];
                return [255, 0, 0, 200];
            },
            getLineColor: [255, 255, 255, 100],
            lineWidthMinPixels: 1,
            visible: viewState.zoom >= 8,
            updateTriggers: {
                getFillColor: [viewState.zoom]
            },
            pickable: true,
            autoHighlight: true,
        })
    ], [viewState.zoom]);

    return (
        <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
            <DeckGL
                viewState={viewState}
                onViewStateChange={onViewStateChange}
                controller={true}
                layers={layers}
            >
                <Map
                    mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
                />
            </DeckGL>
        </div>
    );
};

export default OptimizedMap;
