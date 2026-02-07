import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Package, MoreVertical, Edit, Trash2, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProductDialog } from "@/components/dialogs/ProductDialog";
import { useToast } from "@/hooks/use-toast";
import { productsService } from "@/services";

const statusColors = {
  active: "success",
  draft: "warning",
  archived: "secondary",
};

// ==========================================
// Mock data - Remove when backend is connected
// ==========================================
const Products = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState();

  // ==========================================
  // Fetch products from API on mount
  // ==========================================
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {};
        const userStr = localStorage.getItem("user");
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            if (user.role && user.role.toUpperCase() === "COMPANY") {
              params.companyId = user.id || -1;
            }
          } catch (e) {
            console.error("Error parsing user", e);
          }
        }
        const data = await productsService.getAll(params);
        const processedData = data.map(product => ({
          ...product,
          id: product.formattedId || product.id,
          originalId: product.id,
          status: product.statusString || product.status.toLowerCase()
        }));
        setProducts(processedData);
      } catch (error) {
        toast({ title: "Error", description: "Failed to load products", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(
    (product) =>
      (product.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (product.description?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const handleEdit = (product) => {
    setEditingProduct(product);
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const productToDelete = products.find(p => p.id === id || p.originalId === id);
      if (!productToDelete) return;

      await productsService.delete(productToDelete.originalId);

      setProducts(prev => prev.filter(p => p.id !== id));
      toast({ title: "Product deleted successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete product", variant: "destructive" });
    }
  };

  const handleDialogClose = (open) => {
    setDialogOpen(open);
    if (!open) setEditingProduct(undefined);
  };

  const handleProductSuccess = (product) => {
    const processedProduct = {
      ...product,
      id: product.formattedId || product.id,
      originalId: product.id,
      status: product.statusString || product.status?.toLowerCase()
    };
    if (editingProduct) {
      setProducts(prev => prev.map(p => p.originalId === processedProduct.originalId ? processedProduct : p));
    } else {
      setProducts(prev => [...prev, processedProduct]);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-1">Manage your subscription products and services</p>
        </div>
        <Button variant="gradient" className="gap-2 w-full md:w-auto" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 w-full" />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <Badge variant="outline" className="shrink-0">All ({products.length})</Badge>
          <Badge variant="success" className="shrink-0">Active ({products.filter((p) => p.status === "active").length})</Badge>
          <Badge variant="warning" className="shrink-0">Draft ({products.filter((p) => p.status === "draft").length})</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} variant="bordered" className="hover:shadow-elevated hover:border-primary/30 transition-all duration-300 group">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{product.name}</CardTitle>
                    <Badge variant={statusColors[product.status]} className="mt-1">{product.status}</Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem><Eye className="h-4 w-4 mr-2" />View Details</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEdit(product)}><Edit className="h-4 w-4 mr-2" />Edit Product</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(product.id)}><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                <div><p className="text-2xl font-bold">{product.plansCount}</p><p className="text-xs text-muted-foreground">Plans</p></div>
                <div><p className="text-2xl font-bold">{product.activeSubscriptions || 0}</p><p className="text-xs text-muted-foreground">Active</p></div>
                <div>
                  <p className="text-2xl font-bold">
                    ${(product.revenue || 0) >= 1000
                      ? `${((product.revenue || 0) / 1000).toFixed(1)}k`
                      : (product.revenue || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ProductDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        product={editingProduct}
        onSuccess={handleProductSuccess}
      />
    </div>
  );
};

export default Products;
