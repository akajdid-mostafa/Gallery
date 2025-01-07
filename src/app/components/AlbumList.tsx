'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Album, deleteAlbum, updateAlbum } from '../../services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import AlbumForm from './AlbumForm';
import { useToast } from '@/components/ui/use-toast';
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";

interface AlbumListProps {
  initialAlbums: Album[];
  onAlbumsChange: () => Promise<void>;
}

export default function AlbumList({ initialAlbums, onAlbumsChange }: AlbumListProps) {
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [expandedAlbums, setExpandedAlbums] = useState<Record<string, boolean>>({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [albumToDelete, setAlbumToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    Fancybox.bind("[data-fancybox]", {
      // Your custom options
    });

    return () => {
      Fancybox.unbind("[data-fancybox]");
      Fancybox.close();
    };
  }, []);

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
    } finally {
      setIsDeleteDialogOpen(false);
      setAlbumToDelete(null);
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

  const openDeleteDialog = (id: string) => {
    setAlbumToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setAlbumToDelete(null);
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
              {/* Render only the first 3 images */}
              {album.img.slice(0, 3).map((url, index) => (
                <a key={index} href={url} data-fancybox={`gallery-${album.id}`} data-caption={`Album image ${index + 1}`}>
                  <Image
                    src={url}
                    alt={`Album image ${index + 1}`}
                    width={100} // Set appropriate width
                    height={100} // Set appropriate height
                    className="w-full h-24 object-cover"
                  />
                </a>
              ))}
              {/* Add hidden links for the rest of the images */}
              {album.img.slice(3).map((url, index) => (
                <a key={index + 3} href={url} data-fancybox={`gallery-${album.id}`} data-caption={`Album image ${index + 4}`} style={{ display: 'none' }}>
                  <Image
                    src={url}
                    alt={`Album image ${index + 4}`}
                    width={100} // Set appropriate width
                    height={100} // Set appropriate height
                    className="w-full h-24 object-cover"
                  />
                </a>
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
            <Button onClick={() => album.id && openDeleteDialog(album.id)} variant="destructive">Delete</Button>
          </CardFooter>
        </Card>
      ))}
      {editingAlbum && (
        <AlbumForm album={editingAlbum} onSubmit={handleUpdate} onCancel={() => setEditingAlbum(null)} />
      )}

      {/* Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the album.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeDeleteDialog}>Cancel</Button>
            <Button variant="destructive" onClick={() => albumToDelete && handleDelete(albumToDelete)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}