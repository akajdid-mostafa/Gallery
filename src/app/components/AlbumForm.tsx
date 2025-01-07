'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image'; // Import the Next.js Image component
import { Album } from '../../services/api';
import { uploadImage } from '../../services/upload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { X } from 'lucide-react';

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
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Cleanup preview URLs when component unmounts
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setImages(prevImages => [...prevImages, ...newImages]);

      const newPreviewUrls = newImages.map(file => URL.createObjectURL(file));
      setPreviewUrls(prevUrls => [...prevUrls, ...newPreviewUrls]);
    }
  };

  const handleRemoveImage = (index: number, isExisting: boolean) => {
    if (isExisting) {
      setFormData(prevData => ({
        ...prevData,
        img: prevData.img.filter((_, i) => i !== index),
      }));
    } else {
      setImages(prevImages => prevImages.filter((_, i) => i !== index));
      URL.revokeObjectURL(previewUrls[index]);
      setPreviewUrls(prevUrls => prevUrls.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);

    try {
      // Upload new images
      const uploadedUrls = await Promise.all(
        images.map(async (file) => {
          try {
            return await uploadImage(file);
          } catch (error) {
            console.error('Error uploading image:', error);
            toast({
              title: 'Error',
              description: `Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`,
              variant: 'destructive',
            });
            return null; // Skip failed uploads
          }
        })
      );

      // Filter out null values (failed uploads)
      const successfulUploads = uploadedUrls.filter(url => url !== null) as string[];

      // Update album data
      const updatedAlbum = { ...formData, img: [...formData.img, ...successfulUploads] };
      await onSubmit(updatedAlbum);

      // Reset form
      setImages([]);
      setPreviewUrls([]);
      setFormData({
        type: '',
        title: '',
        img: [],
        dateAlbume: new Date().toISOString().split('T')[0],
      });

      // Show success toast
      toast({
        title: 'Success',
        description: album ? 'Album updated successfully' : 'Album added successfully',
      });
    } catch (error) {
      console.error('Error submitting album:', error);
      toast({
        title: 'Error',
        description: `Failed to ${album ? 'update' : 'add'} album. ${error instanceof Error ? error.message : 'Unknown error occurred.'}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
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
              <Input
                id="images"
                name="images"
                type="file"
                multiple
                onChange={handleImageChange}
                className="mb-2"
                disabled={isLoading}
              />
              <div className="grid grid-cols-3 gap-2">
                {formData.img.map((url, index) => (
                  <div key={`existing-${index}`} className="relative">
                    <Image
                      src={url}
                      alt={`Album image ${index + 1}`}
                      width={100}
                      height={100}
                      className="w-full h-24 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index, true)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                      aria-label={`Remove image ${index + 1}`}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                {previewUrls.map((url, index) => (
                  <div key={`preview-${index}`} className="relative">
                    <Image
                      src={url}
                      alt={`Preview ${index + 1}`}
                      width={100}
                      height={100}
                      className="w-full h-24 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index, false)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                      aria-label={`Remove preview ${index + 1}`}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <CardFooter className="flex justify-between p-0">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Uploading...' : (album ? 'Update' : 'Add') + ' Album'}
              </Button>
              {onCancel && <Button onClick={onCancel} variant="outline" disabled={isLoading}>Cancel</Button>}
            </CardFooter>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}