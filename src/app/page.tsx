'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Album, fetchAlbums, addAlbum } from '../services/api';
import AlbumList from './components/AlbumList';
import AlbumForm from './components/AlbumForm';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '../contexts/AuthContext';
//import "./globals.css";

export default function GalleryPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const loadAlbums = useCallback(async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

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
  }, [toast, isAuthenticated, router]);

  useEffect(() => {
    loadAlbums();
  }, [loadAlbums]);

  const handleSubmit = async (newAlbum: Album) => {
    try {
      const addedAlbum = await addAlbum(newAlbum);
      setAlbums(prevAlbums => [...prevAlbums, addedAlbum]);
      toast({
        title: "Success",
        description: "Album added successfully",
      });
    } catch (error) {
      console.error('Error adding album:', error);
      toast({
        title: "Error",
        description: "Failed to add album. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated) {
    return null; // Or you can return a loading spinner
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Gallery Control</h1>
      <div className="mb-6"> 
      <AlbumForm onSubmit={handleSubmit}  />
      </div>
      {isLoading ? (
        <div>Loading albums...</div>
      ) : (
        <div className='mb-16'>
          <AlbumList initialAlbums={albums} onAlbumsChange={loadAlbums} />
        </div>
        
      )}
      
    </div>
  );
}

