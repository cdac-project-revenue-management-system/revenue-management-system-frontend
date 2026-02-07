import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";

export const TopProducts = ({ data = [] }) => {
  return (
    <Card variant="gradient">
      <CardHeader>
        <CardTitle>Top Products</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {data.length === 0 ? (
          <p className="text-muted-foreground text-sm">No products found</p>
        ) : (
          data.map((product) => (
            <div key={product.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {product.subscriptions} active subscriptions
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    ₹{(product.revenue / 1000).toFixed(0)}k
                  </p>
                  <Badge variant="success" className="text-xs">
                    +{product.growth}%
                  </Badge>
                </div>
              </div>
              <Progress value={product.progress} className="h-1.5" />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
