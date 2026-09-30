"use client"
import { useState } from "react"
import { Search, Bell, User, MapPin, Calendar, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export function Header() {
  const [region, setRegion] = useState("Алматы")
  
  return (
    <header className="h-[80px] bg-white border-b-4 border-black flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4 flex-1 max-w-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" />
          <Input 
            placeholder="Search a niche, account, product or paste a link..." 
            className="pl-12 h-12 bg-background"
          />
        </div>
        <Button variant="black" size="lg">ANALYZE →</Button>
      </div>

      <div className="flex items-center gap-3 ml-6">
        {/* Region selector */}
        <div className="flex items-center gap-2 border-3 border-black px-3 py-2 bg-white shadow-[3px_3px_0px_0px_#111]">
          <MapPin className="w-4 h-4" />
          <select 
            value={region} 
            onChange={(e) => setRegion(e.target.value)}
            className="bg-transparent font-bold text-sm uppercase outline-none"
          >
            <option>Барлық өңірлер</option>
            <option>Алматы</option>
            <option>Астана</option>
            <option>Шымкент</option>
            <option>Қарағанды</option>
            <option>Қазақстан</option>
          </select>
        </div>

        <div className="flex items-center gap-2 border-3 border-black px-3 py-2 bg-background">
          <Calendar className="w-4 h-4" />
          <span className="font-bold text-xs uppercase">Last 7 days</span>
        </div>

        <Button variant="outline" size="icon">
          <Bell className="w-5 h-5" />
        </Button>

        <div className="w-10 h-10 bg-primary border-3 border-black flex items-center justify-center">
          <User className="w-5 h-5" />
        </div>
      </div>
    </header>
  )
}
