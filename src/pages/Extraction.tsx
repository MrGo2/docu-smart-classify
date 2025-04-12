
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Extraction = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Data Extraction</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Extract Data</CardTitle>
          <CardDescription>
            Configure and manage data extraction variables
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Data extraction configuration will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Extraction;
