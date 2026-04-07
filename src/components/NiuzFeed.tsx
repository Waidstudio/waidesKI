import { cn } from '@/lib/utils';
import type { NiuzArticle } from '@/lib/konsmia/types';
import { AlertCircle, TrendingUp, Lightbulb, Bell } from 'lucide-react';

interface NiuzFeedProps {
  articles: NiuzArticle[];
  className?: string;
}

const categoryConfig = {
  analysis: { icon: Lightbulb, color: 'text-info' },
  signal: { icon: TrendingUp, color: 'text-success' },
  insight: { icon: Lightbulb, color: 'text-warning' },
  alert: { icon: Bell, color: 'text-danger' },
};

export function NiuzFeed({ articles, className }: NiuzFeedProps) {
  if (!articles.length) {
    return (
      <div className={cn('flex items-center justify-center py-8 text-muted-foreground text-sm', className)}>
        No intelligence reports available yet.
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {articles.map(article => {
        const config = categoryConfig[article.category];
        const Icon = config.icon;
        return (
          <div key={article.id} className="terminal-border rounded-lg p-3 hover:bg-secondary/20 transition-colors">
            <div className="flex items-start gap-3">
              <Icon className={cn('h-4 w-4 mt-0.5 shrink-0', config.color)} />
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-foreground leading-snug">{article.title}</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{article.content}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">{article.category}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {new Date(article.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
