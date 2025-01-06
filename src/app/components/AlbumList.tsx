"use client";

import { useState } from "react";
import { Album, deleteAlbum } from "../../services/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AlbumForm from "./AlbumForm";
import Image from "next/image";

interface AlbumListProps {
  initialAlbums: Album[];
  onAlbumsChange?: () => Promise<void>; // Add this prop
}

export default function AlbumList({ initialAlbums, onAlbumsChange }: AlbumListProps) {
  const [albums, setAlbums] = useState(initialAlbums);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);

  const handleDelete = async (id: string) => {
    await deleteAlbum(id);
    setAlbums(albums.filter((album) => album.id !== id));
    if (onAlbumsChange) {
      await onAlbumsChange(); // Reload albums after deletion
    }
  };

  const handleEdit = (album: Album) => {
    setEditingAlbum(album);
  };

  const handleUpdate = async (updatedAlbum: Album) => {
    setAlbums(
      albums.map((album) =>
        album.id === updatedAlbum.id ? updatedAlbum : album
      )
    );
    setEditingAlbum(null);
    if (onAlbumsChange) {
      await onAlbumsChange(); // Reload albums after update
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {albums.map((album) => (
        <Card key={album.id}>
          <CardHeader>
            <CardTitle>{album.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Type: {album.type}</p>
            <p>Date: {album.dateAlbume}</p>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {album.img.map((url, index) => (
                <div key={index} className="w-full h-24 overflow-hidden">
                  <Image
                    src={url}
                    alt={`Album image ${index + 1}`}
                    width={300}
                    height={96}
                    className="object-cover"
                    priority
                  />
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => handleEdit(album)} className="mr-2">
              Edit
            </Button>
            <Button
              onClick={() => album.id && handleDelete(album.id)}
              variant="destructive"
            >
              Delete
            </Button>
          </CardFooter>
        </Card>
      ))}
      {editingAlbum && (
        <AlbumForm
          album={editingAlbum}
          onSubmit={handleUpdate}
          onCancel={() => setEditingAlbum(null)}
        />
      )}
    </div>
  );
}