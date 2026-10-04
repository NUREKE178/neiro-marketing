"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function ReportsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <h1 className="text-4xl font-black uppercase">REPORTS</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary">
          <CardHeader><CardTitle>PDF Export</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm font-bold">Аккаунт, KPI, графиктер, AI қорытындысы, дереккөз ескертуі бар толық есеп</p>
            <Button variant="black" className="w-full">PDF ЖҮКТЕУ</Button>
            <p className="text-[10px] font-bold opacity-60">Ескерту: Бұл есеп тек қолжетімді жария деректер мен рұқсат етілген API нәтижелеріне негізделген. Деректер толық болмауы мүмкін</p>
          </CardContent>
        </Card>
        <Card className="bg-blue">
          <CardHeader><CardTitle>CSV Export</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm font-bold">Видео кестесін CSV ретінде</p>
            <Button variant="black" className="w-full mt-3">CSV ЖҮКТЕУ</Button>
          </CardContent>
        </Card>
        <Card className="bg-purple">
          <CardHeader><CardTitle>Excel Export</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm font-bold">Толық аналитика Excel</p>
            <Button variant="black" className="w-full mt-3">EXCEL ЖҮКТЕУ</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
