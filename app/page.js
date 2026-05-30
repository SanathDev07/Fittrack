import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💪</span>
          <span className="text-xl font-bold text-white">FitTrack</span>
        </div>
        <div className="flex gap-4">
          <Link href="/auth/signin" className="text-gray-400 hover:text-white transition px-4 py-2">
            Sign In
          </Link>
          <Link href="/auth/signup" className="bg-blue-600 hover:bg-blue-700 transition px-4 py-2 rounded-lg font-medium">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 py-24 text-center">
        <div className="inline-block bg-blue-600/20 text-blue-400 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          Track • Share • Improve
        </div>
        <h1 className="text-6xl font-extrabold mb-6 leading-tight">
          Your Workouts.<br />
          <span className="text-blue-500">Your Progress.</span>
        </h1>
        <p className="text-gray-400 text-xl mb-10 max-w-2xl mx-auto">
          Create workout routines, log your sessions, and share with the community. Built for athletes who take their training seriously.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/auth/signup" className="bg-blue-600 hover:bg-blue-700 transition px-8 py-3 rounded-lg font-semibold text-lg">
            Start for Free
          </Link>
          <Link href="/routines" className="border border-gray-700 hover:border-gray-500 transition px-8 py-3 rounded-lg font-semibold text-lg text-gray-300">
            Browse Routines
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-6 pb-24 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: "🏋️", title: "Build Routines", desc: "Create custom workout routines with exercises, sets, and reps." },
          { icon: "📊", title: "Track Progress", desc: "Log every session and watch your fitness journey unfold." },
          { icon: "🌍", title: "Share & Discover", desc: "Share routines publicly or clone from the community." },
        ].map((f) => (
          <div key={f.title} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-blue-500 transition">
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
            <p className="text-gray-400 text-sm">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}