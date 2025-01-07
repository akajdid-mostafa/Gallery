'use client';

import { useState } from 'react';
import Image from 'next/image'; // Import the Next.js Image component
import { Album, deleteAlbum, updateAlbum } from '../../services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog"
import AlbumForm from './AlbumForm';
import { useToast } from '@/components/ui/use-toast';

interface AlbumListProps {
  initialAlbums: Album[];
  onAlbumsChange: () => Promise<void>;
}

export default function AlbumList({ initialAlbums, onAlbumsChange }: AlbumListProps) {
  const [albums, setAlbums] = useState(initialAlbums);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [expandedAlbums, setExpandedAlbums] = useState<Record<string, boolean>>({});
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; albumId: string | null }>({
    isOpen: false,
    albumId: null,
  });
  const { toast } = useToast();

  const handleDeleteConfirmation = (id: string) => {
    setDeleteConfirmation({ isOpen: true, albumId: id });
  };

  const handleDelete = async () => {
    if (!deleteConfirmation.albumId) return;

    try {
      await deleteAlbum(deleteConfirmation.albumId);
      await onAlbumsChange();
      setDeleteConfirmation({ isOpen: false, albumId: null });
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
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {albums.map(album => (
          <Card key={album.id}>
            <CardHeader>
              <CardTitle>{album.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Type: {album.type}</p>
              <p>Date: {album.dateAlbume}</p>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {/* Safely access expandedAlbums[album.id] */}
                {((album.id && expandedAlbums[album.id]) ? album.img : album.img.slice(0, 3)).map((url, index) => (
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
                  onClick={() => album.id && toggleAlbumExpansion(album.id)} 
                  variant="outline" 
                  className="mt-2 w-full"
                >
                  {album.id && expandedAlbums[album.id] ? 'Show Less' : `Show All (${album.img.length})`}
                </Button>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleEdit(album)} className="mr-2">Edit</Button>
              <Button onClick={() => album.id && handleDeleteConfirmation(album.id)} variant="destructive">Delete</Button>
            </CardFooter>
          </Card>
        ))}
        {editingAlbum && (
          <AlbumForm album={editingAlbum} onSubmit={handleUpdate} onCancel={() => setEditingAlbum(null)} />
        )}
      </div>

      <Dialog open={deleteConfirmation.isOpen} onOpenChange={(isOpen) => setDeleteConfirmation({ isOpen, albumId: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this album? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmation({ isOpen: false, albumId: null })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}