export const dynamic = 'force-dynamic'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F9F9FB] p-6 md:p-12 max-w-4xl mx-auto">
      <div className="bg-white border-[4px] border-black shadow-[8px_8px_0px_0px_#000] p-8">
        <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-[11px] font-bold uppercase opacity-60 mb-6">Last updated: 2026-10-02 | Asia/Almaty</p>

        <div className="space-y-6 text-sm font-bold leading-relaxed">
          <section>
            <h2 className="font-black uppercase bg-[#DFFF00] border-2 border-black inline-block px-2 mb-2">1. Data we collect — Official APIs only</h2>
            <ul className="list-disc pl-5 opacity-80">
              <li>Instagram: via Meta Graph API v19.0 scopes instagram_basic, instagram_manage_insights, pages_show_list, pages_read_engagement. Only YOUR account profile, media (last 90 days), insights.</li>
              <li>Competitor tracking: ONLY via Business Discovery API — public fields only (followers, media count, public profile). No private data.</li>
              <li>TikTok: via Login Kit + Display API scopes user.info.basic, video.list. Only YOUR own profile/videos. NO Research API for competitors.</li>
              <li>No scraping. No third-party data brokers.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-black uppercase bg-[#A58BFF] border-2 border-black inline-block px-2 mb-2">2. Storage & Encryption</h2>
            <p className="opacity-80">Tokens encrypted at rest AES-256-GCM. Key from ENCRYPTION_KEY env (32 bytes base64). Never sent to client. IV 12 bytes + authTag 16 bytes format iv:authTag:ciphertext. Row-level security per userId.</p>
          </section>

          <section>
            <h2 className="font-black uppercase bg-[#FF85A1] border-2 border-black inline-block px-2 mb-2">3. Retention</h2>
            <p className="opacity-80">Media metrics snapshots daily at 00:00 Asia/Almaty. Account metrics every 6h. You can delete anytime via Settings → Delete all data or via Meta Data Deletion Callback.</p>
          </section>

          <section>
            <h2 className="font-black uppercase bg-[#70D6FF] border-2 border-black inline-block px-2 mb-2">4. Data Deletion</h2>
            <p className="opacity-80">
              POST /api/data-deletion with Meta signed_request. We verify HMAC SHA256 with META_APP_SECRET, then delete connected accounts, media, snapshots for that external userId.
              Status URL: /data-deletion/status?code=...
            </p>
          </section>

          <section>
            <h2 className="font-black uppercase border-2 border-black inline-block px-2 mb-2">5. Contact</h2>
            <p className="opacity-80">Email: privacy@socialpulse.example | Address: Astana, KZ</p>
          </section>
        </div>

        <div className="mt-8 border-t-[3px] border-black border-dashed pt-4">
          <p className="text-[10px] font-black uppercase opacity-50">i18n: kk default, ru/en secondary. No mixed EN/KZ. Locale stored in localStorage.</p>
        </div>
      </div>
    </div>
  )
}
