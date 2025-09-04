import { useState } from "react";
import { usePages } from "@/hooks/usePages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export const PageManagement = () => {
  const { pages, isLoading, createPage, updatePage, deletePage, isCreating, isUpdating, isDeleting } = usePages();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<any>(null);

  const [newPage, setNewPage] = useState({
    slug: '',
    title: '',
    is_published: true,
    content: {},
    sort_order: 0,
  });

  const handleCreatePage = () => {
    if (!newPage.slug || !newPage.title) {
      toast.error('Slug and title are required');
      return;
    }

    createPage(newPage);
    setNewPage({ slug: '', title: '', is_published: true, content: {}, sort_order: 0 });
    setIsCreateDialogOpen(false);
  };

  const handleUpdatePage = () => {
    if (!editingPage.slug || !editingPage.title) {
      toast.error('Slug and title are required');
      return;
    }

    updatePage(editingPage);
    setEditingPage(null);
  };

  const handleDeletePage = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deletePage(id);
    }
  };

  const togglePublished = (page: any) => {
    updatePage({
      ...page,
      is_published: !page.is_published,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-light text-foreground">Manage Pages</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Page
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Page</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="slug">Page Slug</Label>
                <Input
                  id="slug"
                  placeholder="about-us"
                  value={newPage.slug}
                  onChange={(e) => setNewPage({ ...newPage, slug: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="title">Page Title</Label>
                <Input
                  id="title"
                  placeholder="About Us"
                  value={newPage.title}
                  onChange={(e) => setNewPage({ ...newPage, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={newPage.sort_order}
                  onChange={(e) => setNewPage({ ...newPage, sort_order: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="published"
                  checked={newPage.is_published}
                  onCheckedChange={(checked) => setNewPage({ ...newPage, is_published: checked })}
                />
                <Label htmlFor="published">Published</Label>
              </div>
              <Button 
                onClick={handleCreatePage} 
                className="w-full"
                disabled={isCreating}
              >
                {isCreating ? 'Creating...' : 'Create Page'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {pages.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No pages created yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {pages.map((page) => (
            <Card key={page.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{page.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">/{page.slug}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePublished(page)}
                      className="flex items-center gap-1"
                    >
                      {page.is_published ? (
                        <>
                          <Eye className="w-4 h-4" />
                          Published
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-4 h-4" />
                          Draft
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingPage({ ...page })}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePage(page.id, page.title)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingPage} onOpenChange={() => setEditingPage(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Page</DialogTitle>
          </DialogHeader>
          {editingPage && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-slug">Page Slug</Label>
                <Input
                  id="edit-slug"
                  value={editingPage.slug}
                  onChange={(e) => setEditingPage({ ...editingPage, slug: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-title">Page Title</Label>
                <Input
                  id="edit-title"
                  value={editingPage.title}
                  onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-sort-order">Sort Order</Label>
                <Input
                  id="edit-sort-order"
                  type="number"
                  value={editingPage.sort_order}
                  onChange={(e) => setEditingPage({ ...editingPage, sort_order: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-published"
                  checked={editingPage.is_published}
                  onCheckedChange={(checked) => setEditingPage({ ...editingPage, is_published: checked })}
                />
                <Label htmlFor="edit-published">Published</Label>
              </div>
              <Button 
                onClick={handleUpdatePage} 
                className="w-full"
                disabled={isUpdating}
              >
                {isUpdating ? 'Updating...' : 'Update Page'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};