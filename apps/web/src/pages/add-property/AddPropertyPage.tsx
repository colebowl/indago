import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { BuyerType } from '@indago/types'
import { useCreateProperty } from '@/hooks/useProperty'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BuyerTypeSelector } from '@/components/features/BuyerTypeSelector'
import { ArrowRight, ArrowLeft, Loader2, Link as LinkIcon } from 'lucide-react'

export function AddPropertyPage() {
  const navigate = useNavigate()
  const createProperty = useCreateProperty()

  const [step, setStep] = useState(1)
  const [listingUrl, setListingUrl] = useState('')
  const [buyerType, setBuyerType] = useState<BuyerType | null>(null)
  const [isFirstTimeBuyer, setIsFirstTimeBuyer] = useState(false)
  const [buyerGoal, setBuyerGoal] = useState('')

  const isUrlValid = listingUrl.startsWith('http')
  const canSubmit = buyerType !== null

  const handleSubmit = async () => {
    if (!buyerType) return

    const result = await createProperty.mutateAsync({
      listingUrl,
      buyerType,
      isFirstTimeBuyer,
      buyerGoal: buyerGoal || undefined,
    })

    navigate(`/property/${result.id}`)
  }

  return (
    <div className="max-w-lg mx-auto">
      {step === 1 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add a Property</CardTitle>
            <CardDescription>
              Paste a listing URL and we'll research everything you need to know.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="listing-url">Listing URL</Label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="listing-url"
                  placeholder="https://www.realtor.ca/real-estate/..."
                  value={listingUrl}
                  onChange={(e) => setListingUrl(e.target.value)}
                  className="pl-9 h-12 text-base"
                  autoFocus
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Works with realtor.ca and most Canadian listing sites
              </p>
            </div>

            <Button
              onClick={() => setStep(2)}
              disabled={!isUrlValid}
              className="w-full gap-2"
              size="lg"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <button
            onClick={() => setStep(1)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">About You</CardTitle>
              <CardDescription>
                This helps us prioritize what matters most for your situation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>What kind of buyer are you?</Label>
                <BuyerTypeSelector value={buyerType} onChange={setBuyerType} />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="first-time" className="cursor-pointer">
                  First-time home buyer in BC?
                </Label>
                <Switch
                  id="first-time"
                  checked={isFirstTimeBuyer}
                  onCheckedChange={setIsFirstTimeBuyer}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goals">Anything specific you're looking for? (optional)</Label>
                <Textarea
                  id="goals"
                  placeholder="e.g., I want to build a laneway house, I'm looking to Airbnb it..."
                  value={buyerGoal}
                  onChange={(e) => setBuyerGoal(e.target.value)}
                  rows={3}
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!canSubmit || createProperty.isPending}
                className="w-full gap-2"
                size="lg"
              >
                {createProperty.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Generating Report...</>
                ) : (
                  'Generate Report'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
