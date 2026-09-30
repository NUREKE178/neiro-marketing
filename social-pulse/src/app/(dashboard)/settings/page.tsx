"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function SettingsPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-4xl font-black uppercase">SETTINGS</h1>
      
      <Card>
        <CardHeader className="bg-primary"><CardTitle>API Кілттері • Backend-та ғана сақталады</CardTitle></CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="border-3 border-black p-3 bg-background">
            <p className="font-black text-xs uppercase">Instagram Access Token</p>
            <input type="password" value="••••••••••••••••" readOnly className="w-full bg-white border-2 border-black mt-2 p-2 font-bold" />
            <p className="text-[10px] font-bold opacity-60 mt-1">Тек backend-та сақталады, frontend-қа шықпайды</p>
          </div>
          <div className="border-3 border-black p-3 bg-background">
            <p className="font-black text-xs uppercase">TikTok Client Key</p>
            <input type="password" value="••••••••••••••••" readOnly className="w-full bg-white border-2 border-black mt-2 p-2 font-bold" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Қауіпсіздік және Шектеулер</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm font-bold">
          <p>• Instagram/TikTok жеке аккаунттарына рұқсатсыз кіруге тыйым салынған</p>
          <p>• Құпия аккаунттар айналып өтілмейді</p>
          <p>• Scraping, CAPTCHA айналып өту қолданылмайды</p>
          <p>• Rate limit, кештеу, қате өңдеу іске асырылған</p>
          <p>• OAuth арқылы өз аккаунтын байланыстыру қолдауы</p>
          <p>• Дереккөз әр карточкада көрсетіледі</p>
        </CardContent>
      </Card>

      <Card className="bg-black text-white">
        <CardContent className="p-4">
          <p className="font-black uppercase">Тіл • Language • Язык</p>
          <div className="flex gap-2 mt-3">
            <button className="bg-primary text-black border-2 border-white px-4 py-2 font-black text-xs uppercase">Қазақша</button>
            <button className="bg-white text-black border-2 border-white px-4 py-2 font-black text-xs uppercase">Русский</button>
            <button className="bg-white text-black border-2 border-white px-4 py-2 font-black text-xs uppercase">English</button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
