'use client';

import React, { useRef, useEffect } from 'react';
// @ts-ignore
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import useStore from '../lib/store.ts';

export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { activeDomain, selectedYear } = useStore();

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: process.env.NEXT_PUBLIC_MAP_STYLE || 'mapbox://styles/mapbox/streets-v12',
        center: [2.5, 28.0],
        zoom: 4,
      });

      map.current.on('load', () => {
        // Add sources and layers
        fetch('/api/regions/geojson')
          .then((res) => res.json())
          .then((data) => {
            map.current.addSource('regions', { type: 'geojson', data });
            map.current.addLayer({
              id: 'regions-layer',
              type: 'fill',
              source: 'regions',
              paint: {
                'fill-color': '#888',
                'fill-opacity': 0.4,
              },
            });
          });
      });
    }

    // Update layers based on domain/year
    const updateLayers = async () => {
      if (activeDomain === 'economy') {
        const gdp = await fetch(`/api/economy/gdp?year=${selectedYear}`).then((res) => res.json());
        // Join to map and update color (simple scale)
        const expression = ['match', ['get', 'code']];
        gdp.data.forEach((d) => {
          const color = d.value > 1e9 ? '#800026' : '#FFEDA0'; // example scale
          expression.push(d.code, color);
        });
        expression.push('#888888');
        map.current.setPaintProperty('regions-layer', 'fill-color', expression);
      } else if (activeDomain === 'infrastructure') {
        const projects = await fetch('/api/infrastructure/projects').then((res) => res.json());
        map.current.addSource('projects', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: projects.map((p) => ({
              type: 'Feature',
              geometry: p.location,
              properties: p,
            })),
          },
        });
        map.current.addLayer({
          id: 'projects-layer',
          type: 'circle',
          source: 'projects',
          paint: {
            'circle-color': '#4264fb',
            'circle-radius': 6,
          },
        });
      }
    };
    if (map.current.loaded()) updateLayers();
    else map.current.on('load', updateLayers);

    return () => map.current.remove();
  }, [activeDomain, selectedYear]);

  return <div ref={mapContainer} style={{ height: '100vh' }} />;
}
