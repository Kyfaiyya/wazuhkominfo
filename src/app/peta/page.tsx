"use client";

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageHeader } from "@/frontend/components/layout/page-header";
import { Card } from "@/frontend/components/ui/card";
import { Button } from "@/frontend/components/ui/button";
import { useInlineEdit } from "@/frontend/components/shared/use-inline-edit";
import { useAuth } from "@/frontend/components/shared/auth-context";
import { InlineEditToolbar } from "@/frontend/components/shared/inline-edit-toolbar";
import { Wifi, Video, Radio, Search, MapPin, Plus, Trash2, CheckCircle2, AlertTriangle, Layers, Loader2, Eye, EyeOff, MoreVertical, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// Types for Map Points
interface MapPoint {
  id: string;
  name: string;
  category: 'wifi' | 'cctv' | 'bts';
  lat: number;
  lng: number;
  status: 'Aktif' | 'Nonaktif';
  details: string; // Speed for wifi, stream url for cctv, provider for bts
  location: string; // District / Kecamatan
  videoId?: string; // Optional video ID for CCTV
}

const DEFAULT_POINTS: MapPoint[] = [];

function CCTVPlayer({ videoId }: { videoId: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    
    const video = videoRef.current;
    if (!video) return;

    const streamUrl = `https://cctv.penajamkab.go.id/cam${videoId}/index.m3u8`;
    let hls: any;

    const Hls = (window as any).Hls;
    if (Hls) {
      initPlayer(Hls, video);
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
      script.onload = () => {
        const LoadedHls = (window as any).Hls;
        if (LoadedHls) initPlayer(LoadedHls, video);
      };
      script.onerror = () => {
        setError(true);
        setLoading(false);
      };
      document.head.appendChild(script);
    }

    function initPlayer(HlsClass: any, playerEl: HTMLVideoElement) {
      if (HlsClass.isSupported()) {
        hls = new HlsClass({
          maxMaxBufferLength: 8,
          enableWorker: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(playerEl);
        hls.on(HlsClass.Events.MANIFEST_PARSED, () => {
          setLoading(false);
          playerEl.play().catch(() => {});
        });
        hls.on(HlsClass.Events.ERROR, (event: any, data: any) => {
          if (data.fatal) {
            switch (data.type) {
              case HlsClass.ErrorTypes.NETWORK_ERROR:
                console.warn("HLS network error, trying to recover...", data);
                hls.startLoad();
                break;
              case HlsClass.ErrorTypes.MEDIA_ERROR:
                console.warn("HLS media error, trying to recover...", data);
                hls.recoverMediaError();
                break;
              default:
                console.warn("HLS unrecoverable error:", data);
                setError(true);
                setLoading(false);
                break;
            }
          }
        });
      } else if (playerEl.canPlayType('application/vnd.apple.mpegurl')) {
        playerEl.src = streamUrl;
        playerEl.addEventListener('loadedmetadata', () => {
          setLoading(false);
          playerEl.play().catch(() => {});
        });
        playerEl.addEventListener('error', () => {
          setError(true);
          setLoading(false);
        });
      } else {
        setError(true);
        setLoading(false);
      }
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [videoId]);

  return (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-gray-800 shadow-inner mt-2 shrink-0">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 z-10 text-white gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-red-500" />
          <span className="text-[9px] text-gray-400 font-medium">Menghubungkan ke CCTV...</span>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/90 z-10 text-white p-4 text-center">
          <AlertTriangle className="w-5 h-5 text-red-500 mb-1" />
          <span className="text-[9px] font-bold text-gray-200">Kamera Offline / Timeout</span>
          <span className="text-[8px] text-gray-400 mt-0.5 leading-snug">Tidak dapat memuat aliran HLS (.m3u8)</span>
        </div>
      )}

      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        controls
        muted
        playsInline
      />
    </div>
  );
}



function MapPortalContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab'); // wifi, cctv, bts
  
  const { isEditMode } = useAuth();
  const { fields, updateField, save, reset, hasChanges, saving, isAdmin } = useInlineEdit({
    slug: 'map-portal',
    defaultFields: {
      points_json: JSON.stringify(DEFAULT_POINTS),
      page_title: 'Peta Digital Diskominfo',
      page_description: 'Sistem Informasi Geografis sebaran Wifi Publik, CCTV Kota, dan Menara Telekomunikasi di Penajam Paser Utara.'
    }
  });

  const [points, setPoints] = useState<MapPoint[]>(DEFAULT_POINTS);
  const [activeCategory, setActiveCategory] = useState<'all' | 'wifi' | 'cctv' | 'bts'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [mapReady, setMapReady] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null);
  const [activeCctvStream, setActiveCctvStream] = useState<MapPoint | null>(null);
  const [showBoundaries, setShowBoundaries] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Geographic boundaries dynamic loaders
  const [ppuBoundary, setPpuBoundary] = useState<any>(null);
  const [districtsBoundary, setDistrictsBoundary] = useState<any[]>([]);

  useEffect(() => {
    fetch('/geojson/ppu-boundary.json')
      .then(res => res.json())
      .then(data => setPpuBoundary(data))
      .catch(err => console.error('Gagal memuat batas PPU:', err));

    fetch('/geojson/districts-boundary.json')
      .then(res => res.json())
      .then(data => setDistrictsBoundary(data))
      .catch(err => console.error('Gagal memuat batas kecamatan:', err));
  }, []);

  // Form states for new point
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPoint, setNewPoint] = useState<Partial<MapPoint>>({
    name: '',
    category: 'wifi',
    lat: -1.2420,
    lng: 116.7160,
    status: 'Aktif',
    details: '',
    location: 'Kec. Penajam'
  });

  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const fetchPoints = async () => {
    try {
      const res = await fetch('/api/mappoints');
      if (res.ok) {
        const data = await res.json();
        setPoints(data);
      }
    } catch (e) {
      console.error("Gagal mengambil data titik peta:", e);
    }
  };

  useEffect(() => {
    fetchPoints();
  }, []);

  // Register global window function for MapLibre popup video stream buttons
  useEffect(() => {
    if (typeof window === 'undefined') return;
    (window as any).playCctvStream = (id: string) => {
      const point = points.find(p => p.id === id);
      if (point) {
        setSelectedPoint(point);
        setActiveCctvStream(point);
      }
    };
    return () => {
      delete (window as any).playCctvStream;
    };
  }, [points]);

  // Set tab category based on URL param
  useEffect(() => {
    if (tabParam === 'wifi' || tabParam === 'cctv' || tabParam === 'bts') {
      setActiveCategory(tabParam);
    }
  }, [tabParam]);

  // Redraw map on sidebar collapse/expand transitions
  useEffect(() => {
    if (mapRef.current) {
      const timer = setTimeout(() => {
        mapRef.current.resize();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isCollapsed]);

  // Load MapLibre dynamically
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkMapLibre = () => {
      if ((window as any).maplibregl) {
        setMapReady(true);
        return true;
      }
      return false;
    };

    if (checkMapLibre()) return;

    // Inject MapLibre CSS from unpkg
    if (!document.getElementById('maplibre-css')) {
      const link = document.createElement('link');
      link.id = 'maplibre-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/maplibre-gl@4.3.2/dist/maplibre-gl.css';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }

    // Inject MapLibre JS from unpkg
    let script = document.getElementById('maplibre-js') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = 'maplibre-js';
      script.src = 'https://unpkg.com/maplibre-gl@4.3.2/dist/maplibre-gl.js';
      script.crossOrigin = 'anonymous';
      document.body.appendChild(script);
    }

    const handleLoad = () => {
      setMapReady(true);
    };

    script.addEventListener('load', handleLoad);

    // Fallback polling
    const interval = setInterval(() => {
      if (checkMapLibre()) {
        clearInterval(interval);
      }
    }, 100);

    return () => {
      if (script) {
        script.removeEventListener('load', handleLoad);
      }
      clearInterval(interval);
    };
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapReady || !ppuBoundary || districtsBoundary.length === 0 || typeof window === 'undefined' || !(window as any).maplibregl) return;

    const maplibregl = (window as any).maplibregl;

    if (!mapRef.current) {
      // Define standard OSM raster tile style object
      const style = {
        version: 8,
        sources: {
          'osm': {
            type: 'raster',
            tiles: [
              'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
          }
        },
        layers: [
          {
            id: 'osm-layer',
            type: 'raster',
            source: 'osm',
            minzoom: 0,
            maxzoom: 19
          }
        ]
      };

      mapRef.current = new maplibregl.Map({
        container: 'map-container',
        style: style,
        center: [116.7160, -1.2420], // [lng, lat] format
        zoom: 10,
        attributionControl: false
      });

      // Add navigation control to bottom-right
      mapRef.current.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
      mapRef.current.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

      const onMapLoad = () => {
        if (!mapRef.current) return;

        // PPU official boundary GeoJSON source
        if (!mapRef.current.getSource('ppu-boundary')) {
          mapRef.current.addSource('ppu-boundary', {
            type: 'geojson',
            data: ppuBoundary
          });

          // 1. Add PPU fill layer first
          mapRef.current.addLayer({
            id: 'ppu-boundary-fill',
            type: 'fill',
            source: 'ppu-boundary',
            paint: {
              'fill-color': '#1E6F3D', // GSM primary green
              'fill-opacity': 0.02
            }
          });

          // Register all district sources and add their fill layers
          districtsBoundary.forEach((d) => {
            const sourceId = `district-${d.name.replace(/\s+/g, '-')}`;
            mapRef.current.addSource(sourceId, {
              type: 'geojson',
              data: d.geojson
            });

            mapRef.current.addLayer({
              id: `${sourceId}-fill`,
              type: 'fill',
              source: sourceId,
              paint: {
                'fill-color': d.color,
                'fill-opacity': 0.03
              }
            });
          });

          // 2. Register hover tooltip effects for district fills (no district line layers)
          districtsBoundary.forEach((d) => {
            const sourceId = `district-${d.name.replace(/\s+/g, '-')}`;

            // hover tooltip effects
            mapRef.current.on('mouseenter', `${sourceId}-fill`, () => {
              mapRef.current.setPaintProperty(`${sourceId}-fill`, 'fill-opacity', 0.18);
              mapRef.current.getCanvas().style.cursor = 'pointer';
            });

            mapRef.current.on('mouseleave', `${sourceId}-fill`, () => {
              mapRef.current.setPaintProperty(`${sourceId}-fill`, 'fill-opacity', 0.03);
              mapRef.current.getCanvas().style.cursor = '';
            });
          });

          // 3. Add PPU outer line boundary last (so it sits on top of everything)
          mapRef.current.addLayer({
            id: 'ppu-boundary-line',
            type: 'line',
            source: 'ppu-boundary',
            paint: {
              'line-color': '#1E6F3D', // GSM primary green
              'line-width': 3.5, // Bolder main county boundary line
              'line-dasharray': [3, 3]
            }
          });
        }

        // Force initial state sync
        const visibility = showBoundaries ? 'visible' : 'none';
        if (mapRef.current.getLayer('ppu-boundary-fill')) {
          mapRef.current.setLayoutProperty('ppu-boundary-fill', 'visibility', visibility);
          mapRef.current.setLayoutProperty('ppu-boundary-line', 'visibility', visibility);
        }
        districtsBoundary.forEach(d => {
          const fillId = `district-${d.name.replace(/\s+/g, '-')}-fill`;
          if (mapRef.current.getLayer(fillId)) {
            mapRef.current.setLayoutProperty(fillId, 'visibility', visibility);
          }
        });
      };

      if (mapRef.current.isStyleLoaded()) {
        onMapLoad();
      } else {
        mapRef.current.once('load', onMapLoad);
      }
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mapReady, ppuBoundary, districtsBoundary]);

  // Update Boundaries when showBoundaries changes
  useEffect(() => {
    if (!mapRef.current || !mapReady || districtsBoundary.length === 0 || typeof window === 'undefined' || !(window as any).maplibregl) return;

    const visibility = showBoundaries ? 'visible' : 'none';

    const syncVisibility = () => {
      if (mapRef.current.getLayer('ppu-boundary-fill')) {
        mapRef.current.setLayoutProperty('ppu-boundary-fill', 'visibility', visibility);
        mapRef.current.setLayoutProperty('ppu-boundary-line', 'visibility', visibility);
      }
      districtsBoundary.forEach(d => {
        const fillId = `district-${d.name.replace(/\s+/g, '-')}-fill`;
        if (mapRef.current.getLayer(fillId)) {
          mapRef.current.setLayoutProperty(fillId, 'visibility', visibility);
        }
      });
    };

    if (mapRef.current.isStyleLoaded()) {
      syncVisibility();
    } else {
      mapRef.current.once('idle', syncVisibility);
    }
  }, [showBoundaries, mapReady, districtsBoundary]);

  // Update Markers when points, activeCategory, or search change
  useEffect(() => {
    if (!mapRef.current || !mapReady || typeof window === 'undefined' || !(window as any).maplibregl) return;

    const maplibregl = (window as any).maplibregl;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const filteredPoints = points.filter(p => {
      const matchCat = activeCategory === 'all' || p.category === activeCategory;
      const matchQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.details.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });

    filteredPoints.forEach(p => {
      const el = document.createElement('div');
      el.className = 'custom-maplibre-marker';

      let iconUrl = '/icon-wifi.png';
      if (p.category === 'bts') iconUrl = '/icon-bts.png';
      if (p.category === 'cctv') iconUrl = '/icon-cctv.png';

      el.style.width = '38px';
      el.style.height = '38px';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.cursor = 'pointer';

      // Inner wrapper for styling & transforms to keep MapLibre's absolute positioning transform untouched
      const inner = document.createElement('div');
      inner.style.width = '100%';
      inner.style.height = '100%';
      inner.style.backgroundColor = '#ffffff';
      inner.style.borderRadius = '50%';
      inner.style.border = `2.5px solid ${
        p.category === 'wifi' ? '#1E6F3D' : p.category === 'cctv' ? '#dc2626' : '#8b5cf6'
      }`;
      inner.style.boxShadow = '0 3px 6px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.2)';
      inner.style.display = 'flex';
      inner.style.alignItems = 'center';
      inner.style.justifyContent = 'center';
      inner.style.transition = 'transform 0.15s ease-out';

      // Hover zoom effect on the INNER div
      el.addEventListener('mouseenter', () => {
        inner.style.transform = 'scale(1.15)';
      });
      el.addEventListener('mouseleave', () => {
        inner.style.transform = 'scale(1)';
      });

      const img = document.createElement('img');
      img.src = iconUrl;
      img.style.width = '20px';
      img.style.height = '20px';
      img.style.objectFit = 'contain';
      inner.appendChild(img);
      el.appendChild(inner);

      const popupContent = `
        <div style="font-family: inherit; width: 220px;" class="p-1">
          <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: ${
            p.category === 'wifi' ? '#10b981' : p.category === 'cctv' ? '#ef4444' : '#8b5cf6'
          };">
            ${p.category === 'wifi' ? '📶 Wifi Publik' : p.category === 'cctv' ? '📹 CCTV Kota' : '🗼 Menara BTS'}
          </span>
          <h4 style="font-weight: 700; margin: 4px 0; color: #111827; font-size: 14px;">${p.name}</h4>
          <p style="margin: 0; font-size: 12px; color: #4b5563;">${p.location}</p>
          <div style="margin-top: 8px; font-size: 12px; color: #374151; font-weight: 500;">
            ${p.details}
          </div>
          <div style="margin-top: 8px; display: flex; align-items: center; gap: 4px; border-bottom: 1px solid #f3f4f6; padding-bottom: 8px;">
            <span style="display: inline-block; width: 6px; height: 6px; border-radius: 999px; background-color: ${
              p.status === 'Aktif' ? '#10b981' : '#f59e0b'
            };"></span>
            <span style="font-size: 11px; font-weight: 600; color: #374151;">Status: ${p.status}</span>
          </div>
          
          ${p.category === 'cctv' ? `
          <div style="margin-top: 8px;">
            <button onclick="window.playCctvStream('${p.id}')" 
                    style="display: block; width: 100%; text-align: center; font-size: 11px; font-weight: 700; color: #ffffff; border: none; border-radius: 8px; background-color: #1E6F3D; padding: 6px 8px; cursor: pointer; transition: all 0.2s;"
                    onmouseover="this.style.backgroundColor='#0a2715';"
                    onmouseout="this.style.backgroundColor='#1E6F3D';">
              📹 Putar Live Streaming
            </button>
          </div>
          ` : ''}

          <div style="margin-top: 8px;">
            <a href="/layanan/pengaduan-masyarakat?device=${encodeURIComponent(p.name)}&category=${p.category}" 
               style="display: block; text-align: center; font-size: 11px; font-weight: 700; color: #dc2626; text-decoration: none; padding: 6px 8px; border: 1px solid #fee2e2; border-radius: 8px; background-color: #fef2f2; transition: all 0.2s;"
               onmouseover="this.style.backgroundColor='#dc2626'; this.style.color='#ffffff'; this.style.borderColor='#dc2626';"
               onmouseout="this.style.backgroundColor='#fef2f2'; this.style.color='#dc2626'; this.style.borderColor='#fee2e2';">
              ⚠️ Laporkan Gangguan
            </a>
          </div>
        </div>
      `;

      const popup = new maplibregl.Popup({ offset: 20 }).setHTML(popupContent);

      el.addEventListener('click', () => {
        setSelectedPoint(p);
        if (p.category === 'cctv') {
          setActiveCctvStream(p);
        }
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([p.lng, p.lat]);

      if (p.category !== 'cctv') {
        marker.setPopup(popup);
      }

      marker.addTo(mapRef.current);

      markersRef.current.push(marker);
    });

    // Fit map bounds to show all active markers
    if (filteredPoints.length > 0) {
      const coordinates = filteredPoints.map(p => [p.lng, p.lat]);
      const bounds = coordinates.reduce((b, coord) => b.extend(coord), new maplibregl.LngLatBounds(coordinates[0], coordinates[0]));
      
      const fitBoundsOptions = { padding: 50, maxZoom: 14 };
      if (mapRef.current.isStyleLoaded()) {
        mapRef.current.fitBounds(bounds, fitBoundsOptions);
      } else {
        mapRef.current.once('idle', () => {
          mapRef.current.fitBounds(bounds, fitBoundsOptions);
        });
      }
    }
  }, [points, activeCategory, searchQuery, mapReady]);

  // Center map on specific point with premium flyTo animation
  const handleFocusPoint = (p: MapPoint) => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: [p.lng, p.lat],
      zoom: 14,
      speed: 1.2,
      curve: 1.42,
      essential: true
    });
    setSelectedPoint(p);
  };

  // Auto-select and play point from query param (?select=id or ?id=id)
  useEffect(() => {
    if (points.length > 0) {
      const selectParam = searchParams.get('select') || searchParams.get('id');
      const playParam = searchParams.get('play') === 'true';
      if (selectParam) {
        const point = points.find(p => p.id === selectParam);
        if (point) {
          setActiveCategory(point.category);
          setSelectedPoint(point);
          if (point.category === 'cctv' && playParam) {
            setActiveCctvStream(point);
          }
          // Center and focus map
          setTimeout(() => {
            handleFocusPoint(point);
          }, 800);
        }
      }
    }
  }, [points, searchParams]);

  // Add new point
  const handleAddPoint = () => {
    if (!newPoint.name || !newPoint.lat || !newPoint.lng) {
      alert("Nama, Latitude, dan Longitude wajib diisi!");
      return;
    }

    const pointToAdd = {
      name: newPoint.name,
      category: newPoint.category,
      lat: Number(newPoint.lat),
      lng: Number(newPoint.lng),
      status: newPoint.status,
      details: newPoint.details || '',
      location: newPoint.location || 'Kec. Penajam',
      videoId: newPoint.videoId || undefined
    };

    fetch('/api/mappoints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pointToAdd)
    }).then(res => {
      if (res.ok) {
        fetchPoints();
        // Reset Form
        setNewPoint({
          name: '',
          category: 'wifi',
          lat: -1.2420,
          lng: 116.7160,
          status: 'Aktif',
          details: '',
          location: 'Kec. Penajam'
        });
        setShowAddForm(false);
      } else {
        alert("Gagal menyimpan titik koordinat ke database");
      }
    }).catch(err => {
      console.error(err);
      alert("Terjadi kesalahan koneksi");
    });
  };

  // Delete point
  const handleDeletePoint = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus titik koordinat ini?")) {
      fetch(`/api/mappoints?id=${id}`, {
        method: 'DELETE'
      }).then(res => {
        if (res.ok) {
          fetchPoints();
          if (selectedPoint?.id === id) setSelectedPoint(null);
        } else {
          alert("Gagal menghapus titik koordinat dari database");
        }
      }).catch(err => {
        console.error(err);
        alert("Terjadi kesalahan koneksi");
      });
    }
  };

  return (
    <div>
      <PageHeader
        title={fields.page_title}
        description={fields.page_description}
        category={fields.page_category || "Informasi"}
        onTitleChange={(v) => updateField('page_title', v)}
        onDescriptionChange={(v) => updateField('page_description', v)}
        onCategoryChange={(v) => updateField('page_category', v)}
      />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Full-width and constrained-height wrapper for the map and panel */}
        <div className="h-[83vh] min-h-[660px] rounded-2xl overflow-hidden border border-gray-200/50 shadow-lg relative bg-white flex z-0">
          
          {/* 1. Left Sidebar Panel */}
          <div 
            className={`flex flex-col h-full bg-gray-50 border-r border-gray-200 transition-all duration-300 ease-in-out shrink-0 overflow-hidden ${
              isCollapsed ? 'w-16' : 'w-full lg:w-[420px]'
            }`}
          >
            {isCollapsed ? (
              <div className="flex flex-col items-center py-4 h-full w-full shrink-0">
                <button
                  onClick={() => setIsCollapsed(false)}
                  className="p-2 rounded-lg hover:bg-gray-200 text-gray-600 hover:text-[#1E6F3D] transition-colors cursor-pointer shrink-0 mb-8"
                  title="Tampilkan Menu"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="flex-1 flex items-center justify-center w-full">
                  <span 
                    className="text-xs font-bold text-gray-500 uppercase tracking-widest cursor-pointer select-none whitespace-nowrap block"
                    onClick={() => setIsCollapsed(false)}
                    style={{ writingMode: 'vertical-rl' }}
                  >
                    JELAJAH PETA
                  </span>
                </div>
              </div>
            ) : (
              <>
                {/* Header with Title and Collapse Button */}
                <div className="p-3.5 border-b border-gray-200 bg-white flex items-center justify-between shrink-0">
                  <div>
                    <h3 className="text-xs font-bold text-gray-800">Jelajah Peta</h3>
                    <p className="text-[9px] text-gray-500">Pilih kategori untuk memfilter</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Link
                      href="/layanan/pengaduan-masyarakat"
                      className="inline-flex items-center gap-1 text-[9px] font-extrabold text-[#1E6F3D] hover:bg-[#1E6F3D]/5 border border-[#1E6F3D]/20 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                      title="Kirim Pengaduan Umum"
                    >
                      <AlertTriangle className="w-2.5 h-2.5 text-[#1E6F3D]" /> Pengaduan
                    </Link>
                    <button
                      onClick={() => setIsCollapsed(true)}
                      className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#1E6F3D] transition-colors cursor-pointer"
                      title="Sembunyikan Menu"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Search Input, Categories & Options Row */}
                <div className="p-3 border-b border-gray-100 bg-white space-y-3 shrink-0 shadow-sm">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Cari lokasi wifi, cctv, bts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1E6F3D] text-gray-900 placeholder-gray-400 bg-gray-50/50"
                    />
                  </div>

                  {/* Category Filter Tabs */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 pl-0.5">
                      Kategori Layanan
                    </label>
                    <div className="grid grid-cols-4 bg-white p-0.5 rounded-lg gap-0.5 border border-gray-200">
                      {(['all', 'wifi', 'cctv', 'bts'] as const).map((cat) => (
                        <button
                          key={cat}
                          onClick={() => {
                            setActiveCategory(cat);
                            setSelectedPoint(null);
                          }}
                          className={`py-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                            activeCategory === cat
                              ? 'bg-[#1E6F3D] text-white shadow-sm'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {cat === 'all' && 'Semua'}
                          {cat === 'wifi' && 'Wifi'}
                          {cat === 'cctv' && 'CCTV'}
                          {cat === 'bts' && 'BTS'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Boundaries Toggle */}
                  <div className="flex items-center justify-between bg-gray-50 border border-gray-150 rounded-lg px-2.5 py-1.5">
                    <div className="flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-gray-500" />
                      <span className="text-[11px] font-semibold text-gray-700">Batas Wilayah PPU</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showBoundaries}
                        onChange={(e) => setShowBoundaries(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1E6F3D]"></div>
                    </label>
                  </div>

                  {/* Admin Create Point Button */}
                  {isAdmin && isEditMode && (
                    <Button
                      onClick={() => setShowAddForm(!showAddForm)}
                      className="w-full bg-[#1E6F3D] hover:bg-[#1E6F3D]/90 text-white rounded-lg flex items-center justify-center gap-1.5 py-2 text-xs font-bold cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      {showAddForm ? 'Batal Tambah' : 'Tambah Titik Baru'}
                    </Button>
                  )}
                </div>

                {/* Scrollable list items panel */}
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden p-4 bg-gray-50/50">
                  <div className="flex-1 overflow-y-auto min-h-0 relative pr-0.5">
                    <AnimatePresence mode="wait">
                      {showAddForm ? (
                        <motion.div
                          key="add-form"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="space-y-4 bg-white p-4 border border-gray-200 rounded-xl shadow-sm"
                        >
                          <h4 className="text-sm font-bold text-gray-800">Tambah Koordinat Baru</h4>
                          
                          <div className="space-y-3">
                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 uppercase">Nama Lokasi</label>
                              <input
                                type="text"
                                value={newPoint.name}
                                onChange={(e) => setNewPoint({ ...newPoint, name: e.target.value })}
                                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white"
                                placeholder="Contoh: Wifi Publik - RSU Daerah"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase">Kategori</label>
                                <select
                                  value={newPoint.category}
                                  onChange={(e) => setNewPoint({ ...newPoint, category: e.target.value as any })}
                                  className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-white"
                                >
                                  <option value="wifi">📶 Wifi Publik</option>
                                  <option value="cctv">📹 CCTV Kota</option>
                                  <option value="bts">🗼 Menara BTS</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase">Kecamatan</label>
                                <select
                                  value={newPoint.location}
                                  onChange={(e) => setNewPoint({ ...newPoint, location: e.target.value })}
                                  className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-white"
                                >
                                  <option value="Kec. Penajam">Penajam</option>
                                  <option value="Kec. Waru">Waru</option>
                                  <option value="Kec. Babulu">Babulu</option>
                                  <option value="Kec. Sepaku">Sepaku</option>
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase">Latitude</label>
                                <input
                                  type="number"
                                  step="0.000001"
                                  value={newPoint.lat}
                                  onChange={(e) => setNewPoint({ ...newPoint, lat: Number(e.target.value) })}
                                  className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white font-mono"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase">Longitude</label>
                                <input
                                  type="number"
                                  step="0.000001"
                                  value={newPoint.lng}
                                  onChange={(e) => setNewPoint({ ...newPoint, lng: Number(e.target.value) })}
                                  className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white font-mono"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 uppercase">Detail Spesifik</label>
                              <input
                                type="text"
                                value={newPoint.details}
                                onChange={(e) => setNewPoint({ ...newPoint, details: e.target.value })}
                                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white"
                                placeholder="Contoh: Speed / Live Stream / Provider"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-2">
                              <Button
                                onClick={() => setShowAddForm(false)}
                                variant="outline"
                                className="w-full rounded-lg text-xs"
                              >
                                Batal
                              </Button>
                              <Button
                                onClick={handleAddPoint}
                                className="w-full bg-[#1E6F3D] hover:bg-[#1E6F3D]/90 text-white rounded-lg text-xs font-bold"
                              >
                                Tambahkan
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="lists"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="space-y-2"
                        >
                          {points
                            .filter(p => {
                              const matchCat = activeCategory === 'all' || p.category === activeCategory;
                              const matchQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                                 p.location.toLowerCase().includes(searchQuery.toLowerCase());
                              return matchCat && matchQuery;
                            })
                            .map(p => (
                              <div
                                key={p.id}
                                onClick={() => handleFocusPoint(p)}
                                className={`p-3 border rounded-xl flex items-start justify-between gap-3 transition-all cursor-pointer hover:border-[#1E6F3D]/50 hover:bg-[#1E6F3D]/5 ${
                                  selectedPoint?.id === p.id
                                    ? 'border-[#1E6F3D] bg-[#1E6F3D]/5 shadow-sm'
                                    : 'border-gray-200 bg-white'
                                }`}
                              >
                                <div className="flex gap-2.5 items-start">
                                  <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                                    p.category === 'wifi'
                                      ? 'bg-emerald-50 text-emerald-600'
                                      : p.category === 'cctv'
                                      ? 'bg-red-50 text-red-600'
                                      : 'bg-violet-50 text-violet-600'
                                  }`}>
                                    {p.category === 'wifi' && <Wifi className="w-4 h-4" />}
                                    {p.category === 'cctv' && <Video className="w-4 h-4" />}
                                    {p.category === 'bts' && <Radio className="w-4 h-4" />}
                                  </div>
                                  <div className="min-w-0">
                                    <h5 className="text-xs font-bold text-gray-900 leading-snug truncate">{p.name}</h5>
                                    <p className="text-[10px] text-gray-500 mt-0.5">{p.location}</p>
                                    <p className="text-[10px] font-medium text-gray-700 mt-1">{p.details}</p>
                                  </div>
                                </div>
                                
                                {isAdmin && isEditMode && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeletePoint(p.id);
                                    }}
                                    className="p-1 text-gray-400 hover:text-red-500 shrink-0 transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            ))}
                          {points.filter(p => {
                            const matchCat = activeCategory === 'all' || p.category === activeCategory;
                            const matchQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                               p.location.toLowerCase().includes(searchQuery.toLowerCase());
                            return matchCat && matchQuery;
                          }).length === 0 && (
                            <div className="text-center py-10 text-gray-400 text-xs italic">
                              Tidak ada titik koordinat yang cocok.
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Selected Point Detail Panel at the bottom of the sidebar (outside scrollable area) */}
                {selectedPoint && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 border-t border-gray-200 bg-white space-y-3 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.03)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider mb-1 ${
                          selectedPoint.category === 'wifi'
                            ? 'bg-emerald-50 text-emerald-700'
                            : selectedPoint.category === 'cctv'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-violet-50 text-violet-700'
                        }`}>
                          {selectedPoint.category === 'wifi' ? '📶 Wifi Publik' : selectedPoint.category === 'cctv' ? '📹 CCTV Kota' : '🗼 Menara BTS'}
                        </span>
                        <h4 className="text-xs font-bold text-gray-900 leading-snug truncate">{selectedPoint.name}</h4>
                        <p className="text-[10px] text-gray-500 mt-0.5">{selectedPoint.location}</p>
                      </div>
                      <button 
                        onClick={() => setSelectedPoint(null)}
                        className="text-gray-400 hover:text-gray-600 text-[10px] font-bold shrink-0 cursor-pointer border border-gray-200 hover:border-gray-300 px-1.5 py-0.5 rounded-md transition-colors"
                      >
                        Tutup
                      </button>
                    </div>

                    {selectedPoint.category === 'cctv' && selectedPoint.videoId && (
                      <Button
                        onClick={() => setActiveCctvStream(selectedPoint)}
                        className="w-full py-2.5 bg-[#0a2715] hover:bg-[#1E6F3D] text-white text-[11px] font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer border border-[#FFD700]/30"
                      >
                        <Video className="w-3.5 h-3.5 text-[#FFD700]" /> Putar Live Streaming CCTV
                      </Button>
                    )}

                    <Link
                      href={`/layanan/pengaduan-masyarakat?device=${encodeURIComponent(selectedPoint.name)}&category=${selectedPoint.category}`}
                      className="w-full py-2 bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-white animate-pulse" /> Laporkan Gangguan Perangkat
                    </Link>
                  </motion.div>
                )}
              </>
            )}
          </div>

          {/* 2. Map Container Panel */}
          <div className="flex-1 h-full relative bg-gray-50 min-w-0">
            <div id="map-container" className="w-full h-full" />

            {!mapReady && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-gray-100">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-[#1E6F3D]" />
                  <span className="text-xs text-gray-500 font-semibold">Memuat Peta Interaktif...</span>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
      
      {isAdmin && (
        <InlineEditToolbar
          hasChanges={hasChanges}
          saving={saving}
          onSave={save}
          onReset={reset}
        />
      )}

      {/* CCTV Live Stream Modal Popup */}
      <AnimatePresence>
        {activeCctvStream && activeCctvStream.videoId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setActiveCctvStream(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl relative flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-4 border-b border-zinc-850 flex items-center justify-between bg-zinc-950/80 backdrop-blur shrink-0">
                <div className="min-w-0 font-sans text-left">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[9px] font-extrabold uppercase tracking-wide mb-1 border border-red-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> LIVE STREAM
                  </span>
                  <h3 className="text-sm font-extrabold text-white truncate leading-snug">{activeCctvStream.name}</h3>
                </div>
                <button
                  onClick={() => setActiveCctvStream(null)}
                  className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title="Tutup Player"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Video Player Container */}
              <div className="bg-black relative aspect-video w-full flex items-center justify-center">
                <CCTVPlayer videoId={activeCctvStream.videoId} />
              </div>

              {/* Modal Footer / Details */}
              <div className="p-4 border-t border-zinc-850 bg-zinc-950/40 text-xs text-zinc-450 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
                <div className="min-w-0 font-sans text-left">
                  <p className="font-semibold text-zinc-300 truncate">{activeCctvStream.location}</p>
                  <p className="text-[10px] text-zinc-500 truncate mt-0.5">{activeCctvStream.details}</p>
                </div>
                
                <Link
                  href={`/layanan/pengaduan-masyarakat?device=${encodeURIComponent(activeCctvStream.name)}&category=${activeCctvStream.category}`}
                  className="inline-flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-extrabold px-4 py-2 rounded-xl text-xs transition-colors shadow-md cursor-pointer shrink-0"
                  onClick={() => setActiveCctvStream(null)}
                >
                  <AlertTriangle className="w-4 h-4 text-white" /> Laporkan Gangguan
                </Link>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function InteractiveMapPortalPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#1E6F3D]" />
      </div>
    }>
      <MapPortalContent />
    </Suspense>
  );
}
