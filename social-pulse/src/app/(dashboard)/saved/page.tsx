"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { mockAccounts } from "@/lib/mockData"
import { Button } from "@/components/ui/button"

export default function SavedPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <h1 className="text-4xl font-black uppercase">SAVED ACCOUNTS <Badge variant="demo">DEMO DATA</Badge></h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mockAccounts.slice(0,3).map(acc => (
          <Card key={acc.id}>
            <CardHeader className="bg-primary"><CardTitle className="text-sm">{acc.username}</CardTitle></CardHeader>
            <CardContent className="pt-4 flex justify-between items-center">
              <p className="font-bold text-sm">{acc.displayName}</p>
              <Button size="sm" variant="black">Ашу</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
