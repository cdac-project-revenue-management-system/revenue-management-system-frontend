import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
// UNCOMMENT: Import service when backend is ready
import { productsService } from "@/services";

export const ProductDialog = ({ open, onOpenChange, product, onSuccess }) => {
  const { toast } = useToast();
  const isEdit = !!product;
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "draft",
  });

  useEffect(() => {
    if (product) {
      setFormData({ name: product.name, description: product.description, status: product.status });
    } else {
      setFormData({ name: "", description: "", status: "draft" });
    }
  }, [product, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isEdit && product) {
        // API Call
        const updatedProduct = await productsService.update(product.originalId, {
          ...formData,
          companyId: product.companyId || 1, // Keep existing companyId
          status: formData.status.toUpperCase() // Backend expects uppercase ENUM
        });
        onSuccess?.(updatedProduct);
        toast({ title: "Product updated successfully" });
      } else {
        // API Call
        let companyId = 1;
        const userStr = localStorage.getItem("user");
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            companyId = user.id || 1;
          } catch (e) {
            console.error("Error parsing user in dialog", e);
          }
        }

        const newProduct = await productsService.create({
          ...formData,
          companyId,
          status: formData.status.toUpperCase(), // Backend expects uppercase ENUM
          revenue: 0,
          activeSubscriptions: 0
        });
        onSuccess?.(newProduct);
        toast({ title: "Product created successfully" });
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Product Error:", error);
      toast({ title: "Error", description: error?.response?.data?.message || "Something went wrong", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Product" : "Add New Product"}</DialogTitle>
          <DialogDescription>{isEdit ? "Update the product details below." : "Create a new product for your catalog."}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter product name" required disabled={isLoading} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Enter product description" rows={3} disabled={isLoading} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })} disabled={isLoading}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button>
            <Button type="submit" variant="gradient" disabled={isLoading}>{isLoading ? "Saving..." : `${isEdit ? "Update" : "Create"} Product`}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
