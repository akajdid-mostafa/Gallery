
//import "./globals.css";

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Album, fetchAlbums, addAlbum } from '../services/api';
import AlbumList from './components/AlbumList';
import AlbumForm from './components/AlbumForm';
import { useToast } from '@/components/ui/use-toast';
import "./globals.css";

export default function GalleryPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadAlbums = useCallback(async () => {
    try {
      const fetchedAlbums = await fetchAlbums();
      setAlbums(fetchedAlbums);
    } catch (error) {
      console.error('Error fetching albums:', error);
      toast({
        title: "Error",
        description: "Failed to load albums. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadAlbums();
  }, [loadAlbums]);

  const handleSubmit = async (newAlbum: Album) => {
    try {
      await addAlbum(newAlbum);
      await loadAlbums();
    } catch (error) {
      console.error('Error adding album:', error);
      toast({
        title: "Error",
        description: "Failed to add album. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Gallery Control</h1>
      {isLoading ? (
        <div>Loading albums...</div>
      ) : (
        <AlbumList initialAlbums={albums} />
      )}
      <AlbumForm onSubmit={handleSubmit} />
    </div>
  );
}

