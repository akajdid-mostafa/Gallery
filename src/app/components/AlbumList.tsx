'use client';

import { useState } from 'react';
import Image from 'next/image'; 
import { Album, deleteAlbum, updateAlbum } from '../../services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AlbumForm from './AlbumForm';
import { useToast } from '@/components/ui/use-toast';

interface AlbumListProps {
  initialAlbums: Album[];
  onAlbumsChange: () => Promise<void>;
}

export default function AlbumList({ initialAlbums, onAlbumsChange }: AlbumListProps) {
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [expandedAlbums, setExpandedAlbums] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    try {
      await deleteAlbum(id);
      await onAlbumsChange();
      toast({
        title: "Success",
        description: "Album deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting album:', error);
      toast({
        title: "Error",
        description: "Failed to delete album. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (album: Album) => {
    setEditingAlbum(album);
  };

  const handleUpdate = async (updatedAlbum: Album) => {
    try {
      if (editingAlbum && editingAlbum.id) {
        await updateAlbum(editingAlbum.id, updatedAlbum);
        await onAlbumsChange();
        setEditingAlbum(null);
        toast({
          title: "Success",
          description: "Album updated successfully",
        });
      }
    } catch (error) {
      console.error('Error updating album:', error);
      toast({
        title: "Error",
        description: "Failed to update album. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleAlbumExpansion = (albumId: string) => {
    setExpandedAlbums(prev => ({
      ...prev,
      [albumId]: !prev[albumId]
    }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {initialAlbums.map(album => (
        <Card key={album.id}>
          <CardHeader>
            <CardTitle>{album.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Type: {album.type}</p>
            <p>Date: {album.dateAlbume}</p>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {(expandedAlbums[album.id!] ? album.img : album.img.slice(0, 3)).map((url, index) => (
                <Image
                  key={index}
                  src={url}
                  alt={`Album image ${index + 1}`}
                  width={100} // Set appropriate width
                  height={100} // Set appropriate height
                  className="w-full h-24 object-cover"
                />
              ))}
            </div>
            {album.img.length > 3 && (
              <Button 
                onClick={() => toggleAlbumExpansion(album.id!)} 
                variant="outline" 
                className="mt-2 w-full"
              >
                {expandedAlbums[album.id!] ? 'Show Less' : `Show All (${album.img.length})`}
              </Button>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={() => handleEdit(album)} className="mr-2">Edit</Button>
            <Button onClick={() => album.id && handleDelete(album.id)} variant="destructive">Delete</Button>
          </CardFooter>
        </Card>
      ))}
      {editingAlbum && (
        <AlbumForm album={editingAlbum} onSubmit={handleUpdate} onCancel={() => setEditingAlbum(null)} />
      )}
    </div>
  );
}