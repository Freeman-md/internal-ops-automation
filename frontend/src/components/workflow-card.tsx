import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";

type WorkflowCardProps = {
  title: string;
  description: string;
  endpoint: string;
  method: string;
  tags: string[];
  intent: string;
};

export function WorkflowCard({
  title,
  description,
  endpoint,
  method,
  tags,
  intent,
}: WorkflowCardProps) {
  return (
    <Card className="group h-full border-border/60 bg-card/80 shadow-lg shadow-black/5 transition-transform duration-200 hover:-translate-y-1">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="accent">{method}</Badge>
          {tags.map((tag) => (
            <Badge key={tag} variant="outline" className="border-border/60">
              {tag}
            </Badge>
          ))}
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-xs text-muted-foreground">
        <span className="uppercase tracking-widest text-[10px] text-muted-foreground/70">
          Endpoint
        </span>
        <div className="mt-2 rounded-lg border border-dashed border-border/70 bg-background/60 px-3 py-2 font-mono text-[12px]">
          {endpoint}
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground">
          Intent:{" "}
          <span className="font-medium text-foreground/80">{intent}</span>
        </div>
        <Button variant="outline">Run</Button>
      </CardFooter>
    </Card>
  );
}
