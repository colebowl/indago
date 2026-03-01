import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Search, Lightbulb, HelpCircle } from 'lucide-react'

export function ChatWithReport() {
  const examples = [
    { icon: HelpCircle, text: 'What are the biggest risks with this property?' },
    { icon: Search, text: 'Explain the zoning implications for a laneway house' },
    { icon: Lightbulb, text: 'What should I ask my realtor about the title?' },
  ]

  return (
    <Card className="border-dashed border-2 border-muted-foreground/20">
      <CardHeader className="pb-2 p-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            Chat with Report
          </CardTitle>
          <Badge variant="outline" className="text-[10px]">Coming Soon</Badge>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <p className="text-xs text-muted-foreground mb-3">
          Ask questions about your due diligence report and get instant answers grounded in the checks, sources, and insights already gathered.
        </p>

        <div className="rounded-lg border border-muted bg-muted/30 p-3 mb-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground/50">
            <MessageSquare className="h-3.5 w-3.5 shrink-0" />
            <span className="italic">Ask anything about this report...</span>
          </div>
        </div>

        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
          Example Questions
        </p>
        <div className="space-y-1.5">
          {examples.map((ex) => {
            const Icon = ex.icon
            return (
              <div key={ex.text} className="flex items-start gap-2 text-xs text-muted-foreground/60">
                <Icon className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>{ex.text}</span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
