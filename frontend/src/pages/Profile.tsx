import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Camera, MapPin, Link as LinkIcon, Mail, Edit2, Save, X } from 'lucide-react';
import {UserPostList} from '@/components/UserPostList';
import { useQuery } from '@tanstack/react-query';

interface Blog {
  _id: string;
  title: string;
  content: string;
  coverImage: string;
  author: {
    name: string;
  };
  createdAt: string;
}

const Profile = () => {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || '',
    avatar: user?.avatar || '',
  });

  const { data: drafts, isLoading: draftsLoading, error: draftsError } = useQuery<{ blogs: Blog[] }>({
    queryKey: ['drafts', user?._id],
    queryFn: () => {
      const token = localStorage.getItem('token');
      return fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/blogs/drafts?author=${user?._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).then(res => res.json());
    },
    enabled: !!user,
  });

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Please login to view your profile</h1>
          <Button onClick={() => navigate('/login')}>Go to Login</Button>
        </div>
        <Footer />
      </div>
    );
  }

  const handleSave = () => {
    (async () => {
      try {
        await updateProfile(formData);
        setIsEditing(false);
        toast({
          title: "Profile updated",
          description: "Your changes have been saved successfully.",
        });
      } catch (err: any) {
        toast({
          title: "Update failed",
          description: err?.message || 'Failed to update profile',
          variant: 'destructive',
        });
      }
    })();
  };

  const handleCancel = () => {
    setFormData({
      name: user.name,
      email: user.email,
      bio: user.bio || '',
      location: user.location || '',
      website: user.website || '',
      avatar: user.avatar || '',
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Profile Header */}
        <div className="relative mb-8">
          {/* Cover Image */}
          <div className="h-32 md:h-48 rounded-xl bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
          </div>
          
          {/* Avatar */}
          <div className="absolute -bottom-12 left-4 md:left-8">
            <div className="relative group">
              <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-background shadow-xl">
                <AvatarImage src={isEditing ? formData.avatar || user.avatar : user.avatar} alt={isEditing ? formData.name || user.name : user.name} />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {(isEditing ? (formData.name || user.name) : user.name).split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <>
                  <input
                    id="avatarInput"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files && e.target.files[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                  <button onClick={() => document.getElementById('avatarInput')?.click()} className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Edit Button */}
          <div className="absolute bottom-4 right-4">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2">
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleCancel} variant="outline" size="icon">
                  <X className="w-4 h-4" />
                </Button>
                <Button onClick={handleSave} className="gap-2">
                  <Save className="w-4 h-4" />
                  Save
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Content */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl">Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">{user.name}</h2>
                      {user.bio && (
                        <p className="text-muted-foreground mt-2">{user.bio}</p>
                      )}
                    </div>
                    <div className="space-y-3 pt-4 border-t border-border/50">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm">{user.email}</span>
                      </div>
                      {user.location && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">{user.location}</span>
                        </div>
                      )}
                      {user.website && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <LinkIcon className="w-4 h-4" />
                          <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                            {user.website.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Activity */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="posts" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="posts">My Posts</TabsTrigger>
                <TabsTrigger value="drafts">Drafts</TabsTrigger>
                <TabsTrigger value="liked">Liked</TabsTrigger>
              </TabsList>
              
              <TabsContent value="posts">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <UserPostList userId={user._id} status="published" />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="drafts">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-6">
                    {draftsLoading ? (
                      <p>Loading drafts...</p>
                    ) : draftsError ? (
                      <p className="text-destructive">Error loading drafts.</p>
                    ) : drafts && drafts.blogs.length > 0 ? (
                      <div className="space-y-4">
                        {drafts.blogs.map((draft) => (
                          <div key={draft._id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                            <Link to={`/write?draftId=${draft._id}`}>
                              <h3 className="font-semibold">{draft.title}</h3>
                              <p className="text-sm text-muted-foreground truncate">{draft.content}</p>
                            </Link>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center text-muted-foreground">
                        <p>No drafts saved.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="liked">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <p>No liked posts yet.</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
export default Profile;