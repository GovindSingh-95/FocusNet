
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";
import { storage } from "@/lib/storage";
import { Plus, ExternalLink, Trash2, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Bookmark {
  id: string;
  title: string;
  url: string;
  category: string;
}

export function BookmarkManager() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() =>
    storage.get<Bookmark[]>("focusnest-bookmarks", [])
  );
  const [newBookmark, setNewBookmark] = useState({
    title: "",
    url: "",
    category: "General",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<string>("all");

  // Save bookmarks to local storage whenever they change
  useEffect(() => {
    storage.set("focusnest-bookmarks", bookmarks);
  }, [bookmarks]);

  const addBookmark = () => {
    if (newBookmark.title.trim() === "" || newBookmark.url.trim() === "") {
      return;
    }

    // Add http:// if not present
    let url = newBookmark.url;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    const bookmark: Bookmark = {
      id: Date.now().toString(),
      title: newBookmark.title,
      url: url,
      category: newBookmark.category || "General",
    };

    setBookmarks([...bookmarks, bookmark]);
    setNewBookmark({ title: "", url: "", category: "General" });
  };

  const deleteBookmark = (id: string) => {
    setBookmarks(bookmarks.filter((bookmark) => bookmark.id !== id));
  };

  const openBookmark = (url: string) => {
    window.open(url, "_blank");
  };

  // Get unique categories
  const categories = ["all", ...new Set(bookmarks.map((b) => b.category))];

  // Filter bookmarks
  const filteredBookmarks = bookmarks.filter((bookmark) => {
    const matchesSearch = 
      bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bookmark.url.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filter === "all" || bookmark.category === filter;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex gap-2">
          <Input
            placeholder="Title"
            value={newBookmark.title}
            onChange={(e) => 
              setNewBookmark({ ...newBookmark, title: e.target.value })
            }
          />
          <Input
            placeholder="URL"
            value={newBookmark.url}
            onChange={(e) => 
              setNewBookmark({ ...newBookmark, url: e.target.value })
            }
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={newBookmark.category}
            onValueChange={(value) => 
              setNewBookmark({ ...newBookmark, category: value })
            }
          >
            <SelectTrigger className="flex-grow">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.filter(c => c !== "all").map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
              <SelectItem value="General">General</SelectItem>
              <SelectItem value="Work">Work</SelectItem>
              <SelectItem value="Personal">Personal</SelectItem>
              <SelectItem value="Learning">Learning</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={addBookmark}>
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bookmarks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category === "all" ? "All Categories" : category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-grow overflow-auto space-y-2">
        {filteredBookmarks.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            {bookmarks.length === 0
              ? "No bookmarks yet. Add one above!"
              : "No bookmarks match your search."}
          </div>
        ) : (
          filteredBookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors group"
            >
              <div className="flex-grow overflow-hidden">
                <div className="font-medium truncate">{bookmark.title}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {bookmark.url}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{bookmark.category}</Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openBookmark(bookmark.url)}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteBookmark(bookmark.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
