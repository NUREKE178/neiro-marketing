export const dynamic = 'force-dynamic'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F9F9FB] flex items-center justify-center p-8">
      <div className="bg-white border-[4px] border-black shadow-[8px_8px_0px_0px_#000] p-8 text-center">
        <h1 className="text-4xl font-black uppercase">404 — Not Found</h1>
        <p className="mt-4 font-bold">Бет табылмады. Басты бетке оралыңыз.</p>
        <a href="/" className="mt-6 inline-block bg-black text-white border-3 border-black px-6 py-2 font-black uppercase">Басты бет</a>
      </div>
    </div>
  )
}
