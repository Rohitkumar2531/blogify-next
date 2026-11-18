import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from './ui/alert-dialog';
import { Trash2 } from 'lucide-react';
import axios from 'axios';
import { deleteBlog } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const fetchUserBlogs = async (userId: string, status: 'published' | 'draft') => {
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/blogs?author=${userId}&status=${status}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json();
  return data.blogs;
};

interface Post {
  _id: string;
  title: string;
  createdAt: string;
  author?: string | {
    _id: string;
  };
}

interface UserPostListProps {
    userId: string;
    status: 'published' | 'draft';
}

export const UserPostList = ({ userId, status }: UserPostListProps) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [postToDelete, setPostToDelete] = useState<Post | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const postsQueryKey = ['userBlogs', userId, status];
    const { data: posts, isLoading, isError } = useQuery({
        queryKey: postsQueryKey,
        queryFn: () => fetchUserBlogs(userId, status),
    });

    const deleteMutation = useMutation({
        mutationFn: (postId: string) => {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Please log in to delete a post.');
            }
            return deleteBlog(postId, token);
        },
        onSuccess: (_, postId) => {
            queryClient.setQueryData<Post[]>(postsQueryKey, (currentPosts) =>
                currentPosts?.filter((post) => post._id !== postId)
            );
            queryClient.invalidateQueries({ queryKey: postsQueryKey });
            toast({
                title: 'Post deleted',
                description: 'Your post has been permanently deleted.',
            });
            setIsDeleteDialogOpen(false);
            setPostToDelete(null);
        },
        onError: (error) => {
            const serverMessage = axios.isAxiosError<{ msg?: string; message?: string }>(error)
                ? error.response?.data?.msg || error.response?.data?.message
                : undefined;
            toast({
                title: 'Unable to delete post',
                description: serverMessage || (error instanceof Error ? error.message : 'Please try again.'),
                variant: 'destructive',
            });
        },
    });

    if (isLoading) return <p className="text-muted-foreground">Loading posts...</p>;
    if (isError) return <p className="text-destructive">Error fetching posts.</p>;

    if (!posts || posts.length === 0) {
        return (
            <div className="py-12 text-center text-muted-foreground">
                <p>No {status} posts yet.</p>
                {status === 'published' && (
                  <Button className="mt-4" onClick={() => navigate('/write')}>
                      Write a Post
                  </Button>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {posts.map((post: Post) => {
                const authorId = typeof post.author === 'string' ? post.author : post.author?._id;
                const canDelete = status === 'published' && authorId === userId;

                return (
                    <div key={post._id} className="flex items-center justify-between gap-4 rounded-lg border p-4 hover:bg-muted">
                        <Link to={`/blog/${post._id}`} className="min-w-0 flex-1">
                            <h3 className="font-semibold">{post.title}</h3>
                            <p className="text-sm text-muted-foreground">
                                {new Date(post.createdAt).toLocaleDateString()}
                            </p>
                        </Link>
                        {canDelete && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="shrink-0 text-destructive hover:text-destructive"
                                aria-label={`Delete ${post.title}`}
                                disabled={deleteMutation.isPending}
                                onClick={() => {
                                    setPostToDelete(post);
                                    setIsDeleteDialogOpen(true);
                                }}
                            >
                                <Trash2 className="h-4 w-4" />
                                <span className="hidden sm:inline">Delete</span>
                            </Button>
                        )}
                    </div>
                );
            })}
            <AlertDialog
                open={isDeleteDialogOpen}
                onOpenChange={(open) => {
                    setIsDeleteDialogOpen(open);
                    if (!open) setPostToDelete(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this post?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this post? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={deleteMutation.isPending || !postToDelete}
                            onClick={(event) => {
                                event.preventDefault();
                                if (postToDelete) deleteMutation.mutate(postToDelete._id);
                            }}
                        >
                            {deleteMutation.isPending ? 'Deleting...' : 'Delete post'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

