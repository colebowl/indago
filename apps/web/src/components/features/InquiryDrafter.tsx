import { useState } from 'react'
import type { EmailDraft } from '@indago/types'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Copy,
  CheckCircle2,
  Mail,
  Send,
  Clock,
  MailOpen,
  MessageSquare,
  Calendar,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface InquiryDrafterProps {
  emailDraft: EmailDraft
  trackingId?: string
  steps: readonly string[]
}

interface TrackedEmail {
  id: string
  recipient: string
  org: string
  subject: string
  sentAt: string
  status: 'sent' | 'opened' | 'replied'
  openedAt?: string
  repliedAt?: string
  replySummary?: string
}

const MOCK_TRACKED_EMAILS: TrackedEmail[] = [
  {
    id: 'IND-7829',
    recipient: 'environmental.services@vancouver.ca',
    org: 'City of Vancouver Environmental Services',
    subject: 'Property Environmental History Inquiry — 123 Main Street [Ref: IND-7829]',
    sentAt: '2026-03-01T11:30:00Z',
    status: 'opened',
    openedAt: '2026-03-01T14:15:00Z',
  },
]

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-CA', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

const TIMELINE_STEPS = [
  { key: 'sent', icon: Send, label: 'Sent' },
  { key: 'opened', icon: MailOpen, label: 'Opened' },
  { key: 'replied', icon: MessageSquare, label: 'Replied' },
] as const

function EmailTimeline({ email }: { email: TrackedEmail }) {
  const stepIndex = TIMELINE_STEPS.findIndex(s => s.key === email.status)

  return (
    <div className="flex items-center gap-0 mt-2">
      {TIMELINE_STEPS.map((step, i) => {
        const Icon = step.icon
        const isComplete = i <= stepIndex
        const isCurrent = i === stepIndex
        const isLast = i === TIMELINE_STEPS.length - 1

        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'h-6 w-6 rounded-full flex items-center justify-center transition-colors',
                  isComplete
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground',
                  isCurrent && 'ring-2 ring-primary/30',
                )}
              >
                <Icon className="h-3 w-3" />
              </div>
              <span className={cn(
                'text-[9px] mt-0.5 font-medium',
                isComplete ? 'text-primary' : 'text-muted-foreground',
              )}>
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div className={cn(
                'h-0.5 w-6 sm:w-10 mx-0.5',
                i < stepIndex ? 'bg-primary' : 'bg-muted',
              )} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function EmailTracker({ emails }: { emails: TrackedEmail[] }) {
  return (
    <div className="mt-3 space-y-3">
      <div className="flex items-center gap-2">
        <Mail className="h-4 w-4 text-primary" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Email Tracking
        </span>
        <Badge variant="secondary" className="text-[10px]">
          {emails.length} sent
        </Badge>
      </div>

      {emails.map((email) => (
        <Card key={email.id} className="p-3 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-medium truncate">{email.org}</p>
              <p className="text-[11px] text-muted-foreground truncate">{email.recipient}</p>
            </div>
            <Badge variant="outline" className="text-[9px] font-mono shrink-0">
              {email.id}
            </Badge>
          </div>

          <EmailTimeline email={email} />

          <div className="space-y-1 pt-1">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Calendar className="h-3 w-3 shrink-0" />
              <span>Sent {formatDate(email.sentAt)}</span>
            </div>
            {email.openedAt && (
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <MailOpen className="h-3 w-3 shrink-0" />
                <span>Opened {formatDate(email.openedAt)}</span>
              </div>
            )}
            {email.repliedAt && (
              <div className="flex items-center gap-1.5 text-[11px] text-primary">
                <MessageSquare className="h-3 w-3 shrink-0" />
                <span>Reply received {formatDate(email.repliedAt)}</span>
              </div>
            )}
          </div>

          {email.replySummary && (
            <div className="p-2 rounded bg-accent/60 border border-primary/10">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-0.5">
                AI Summary of Reply
              </p>
              <p className="text-xs text-muted-foreground">{email.replySummary}</p>
            </div>
          )}

          {email.status !== 'replied' && (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                {email.status === 'opened'
                  ? 'Recipient has opened the email — follow up if no reply within 5 business days'
                  : 'Awaiting confirmation of receipt'}
              </span>
            </div>
          )}
        </Card>
      ))}

      <Button variant="outline" size="sm" className="gap-1.5 w-full">
        <ArrowRight className="h-3 w-3" />
        Send Follow-up
      </Button>
    </div>
  )
}

export function InquiryDrafter({ emailDraft, trackingId, steps }: InquiryDrafterProps) {
  const [subject, setSubject] = useState(emailDraft.subject)
  const [body, setBody] = useState(emailDraft.body)
  const [copied, setCopied] = useState(false)
  const [markedSent, setMarkedSent] = useState(false)

  const handleCopy = async () => {
    const text = `To: ${emailDraft.recipientEmail}\nSubject: ${subject}\n\n${body}`
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleMarkSent = () => {
    setMarkedSent(true)
  }

  if (markedSent) {
    return <EmailTracker emails={MOCK_TRACKED_EMAILS} />
  }

  return (
    <div className="mt-3 space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <Mail className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Draft Email</span>
        {trackingId && (
          <Badge variant="outline" className="text-[10px] font-mono">
            Ref: {trackingId}
          </Badge>
        )}
      </div>

      <div className="space-y-2">
        <div className="text-xs text-muted-foreground">
          <span className="font-medium">To:</span> {emailDraft.recipientEmail}
          {emailDraft.recipientOrg && <span> ({emailDraft.recipientOrg})</span>}
        </div>

        <Input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="text-xs h-8"
          aria-label="Email subject"
        />

        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={8}
          className="text-xs font-mono"
          aria-label="Email body"
        />
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="gap-1.5"
        >
          {copied ? (
            <><CheckCircle2 className="h-3 w-3 text-green-600" /> Copied!</>
          ) : (
            <><Copy className="h-3 w-3" /> Copy to Clipboard</>
          )}
        </Button>

        <Button
          variant="default"
          size="sm"
          onClick={handleMarkSent}
          className="gap-1.5"
        >
          <Send className="h-3 w-3" /> Mark as Sent
        </Button>
      </div>

      {steps.length > 0 && (
        <div className="pt-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Next Steps</p>
          <ol className="space-y-1">
            {steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <span className="font-semibold text-primary shrink-0 w-4 text-right">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
