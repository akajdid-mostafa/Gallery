'use client';

import { useState } from 'react';
import { Album } from '../../services/api';
import { uploadImage } from '../../services/upload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

interface AlbumFormProps {
  album?: Album;
  onSubmit: (album: Album) => Promise<void>;
  onCancel?: () => void;
}

export default function AlbumForm({ album, onSubmit, onCancel }: AlbumFormProps) {
  const [formData, setFormData] = useState<Album>(album || {
    type: '',
    title: '',
    img: [],
    dateAlbume: new Date().toISOString().split('T')[0],
  });
  const [images, setImages] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    try {
      const uploadedUrls = await Promise.all(images.map(uploadImage));
      const updatedAlbum = { ...formData, img: [...formData.img, ...uploadedUrls] };
      await onSubmit(updatedAlbum);
      setImages([]);
      setFormData({
        type: '',
        title: '',
        img: [],
        dateAlbume: new Date().toISOString().split('T')[0],
      });
      toast({
        title: "Success",
        description: album ? "Album updated successfully" : "Album added successfully",
      });
    } catch (error) {
      console.error('Error submitting album:', error);
      toast({
        title: "Error",
        description: `Failed to ${album ? 'update' : 'add'} album. ${error instanceof Error ? error.message : 'Unknown error occurred.'}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{album ? 'Edit Album' : 'Add New Album'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="type">Type</Label>
              <Input id="type" name="type" value={formData.type} onChange={handleChange} required />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="dateAlbume">Date</Label>
              <Input id="dateAlbume" name="dateAlbume" type="date" value={formData.dateAlbume} onChange={handleChange} required />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="images">Images</Label>
              <Input id="images" name="images" type="file" multiple onChange={handleImageChange} />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button type="submit" onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? 'Uploading...' : (album ? 'Update' : 'Add') + ' Album'}
        </Button>
        {onCancel && <Button onClick={onCancel} variant="outline">Cancel</Button>}
      </CardFooter>
    </Card>
  );
}

