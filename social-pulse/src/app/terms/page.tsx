export const dynamic = 'force-dynamic'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F9F9FB] p-6 md:p-12 max-w-4xl mx-auto">
      <div className="bg-white border-[4px] border-black shadow-[8px_8px_0px_0px_#000] p-8">
        <h1 className="text-3xl font-black uppercase mb-2">Terms of Service</h1>
        <p className="text-[11px] font-bold uppercase opacity-60 mb-6">Last updated: 2026-10-02</p>
        <div className="space-y-6 text-sm font-bold leading-relaxed opacity-80">
          <p><b className="bg-[#DFFF00] border-2 border-black px-1">No scraping:</b> App uses only official Meta Graph API and TikTok Display API. Any scraping attempt violates terms and will be blocked.</p>
          <p><b className="bg-[#A58BFF] border-2 border-black px-1">Official APIs:</b> You authorize us to access your Instagram Business/Creator and TikTok accounts via OAuth. You can revoke anytime in platform settings.</p>
          <p><b className="bg-[#FF85A1] border-2 border-black px-1">Competitor tracking:</b> Only public data via Business Discovery API. No private accounts. No Research API.</p>
          <p><b className="bg-[#70D6FF] border-2 border-black px-1">Token refresh:</b> IG long-lived 60 days auto-refreshed, TikTok refresh_token used. Expired tokens show Reconnect CTA.</p>
          <p>Service provided AS-IS. Rate limits: exponential backoff, queue per-account locks. Asia/Almaty timezone.</p>
          <p>Contact: terms@socialpulse.example</p>
        </div>
      </div>
    </div>
  )
}
