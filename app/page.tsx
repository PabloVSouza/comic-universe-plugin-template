'use client'

import { useState } from 'react'
import Image from 'next/image'
import StarrySky from './components/StarrySky'

export default function Home() {
  const [installStatus, setInstallStatus] = useState<string>('')

  const handleInstall = () => {
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      const pluginUrl = `${baseUrl}/api`
      const pluginMetadataUrl = `${baseUrl}/api/metadata`
      const pluginName = 'UTOON'
      const pluginTag = 'utoon'

      const deepLink = `comic-universe://plugin/install?url=${encodeURIComponent(
        pluginUrl
      )}&metadataUrl=${encodeURIComponent(pluginMetadataUrl)}&name=${encodeURIComponent(pluginName)}&tag=${encodeURIComponent(pluginTag)}`

      setInstallStatus('Opening Comic Universe...')

      window.location.href = deepLink

      setTimeout(() => {
        setInstallStatus(
          'If Comic Universe did not open, make sure it is installed and set as the default handler for comic-universe:// links.'
        )
      }, 2000)
    } catch (error) {
      console.error('Error creating deep link:', error)
      setInstallStatus('Error: Could not create install link. Please check the console.')
    }
  }

  return (
    <div className="size-full relative min-h-screen">
      <StarrySky className="fixed inset-0 w-full h-full -z-0" />
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-8">
        <div className="text-center mb-6 max-w-4xl">
          <div className="flex justify-center mb-2">
            <Image
              src="/logo.svg"
              alt="Comic Universe Logo"
              className="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80"
              width={320}
              height={320}
            />
          </div>
          <h1
            className="font-bangers text-yellow-400 text-3xl md:text-4xl mb-3"
            style={{
              textShadow:
                '2px 2px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000, 0px 2px 0px #000, 0px -2px 0px #000, 2px 0px 0px #000, -2px 0px 0px #000'
            }}
          >
            Comic Universe Plugin - UTOON
          </h1>
          <p className="text-white text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-6">
            Remote Comic Universe plugin for browsing UTOON titles, chapters, and page lists
            through the standard plugin HTTP API.
          </p>
        </div>

        <div className="bg-purple-900/40 backdrop-blur-sm rounded-2xl p-8 md:p-12 max-w-4xl mx-auto border border-purple-500/30 w-full">
          <div className="text-center mb-8">
            <h2
              className="font-bangers text-yellow-400 text-3xl md:text-4xl mb-4"
              style={{
                textShadow:
                  '2px 2px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000, 0px 2px 0px #000, 0px -2px 0px #000, 2px 0px 0px #000, -2px 0px 0px #000'
              }}
            >
              UTOON API
            </h2>
            <p className="text-white/80 text-lg mb-6">
              This plugin exposes the endpoints Comic Universe needs for searching UTOON, loading
              chapters, and fetching pages on demand:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-purple-900/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
              <h3 className="text-white text-lg font-semibold mb-2">getList</h3>
              <p className="text-white/80 text-sm">Retrieve a list of comics</p>
            </div>
            <div className="bg-purple-900/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
              <h3 className="text-white text-lg font-semibold mb-2">search</h3>
              <p className="text-white/80 text-sm">Search for comics</p>
            </div>
            <div className="bg-purple-900/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
              <h3 className="text-white text-lg font-semibold mb-2">getDetails</h3>
              <p className="text-white/80 text-sm">Get detailed information about a comic</p>
            </div>
            <div className="bg-purple-900/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
              <h3 className="text-white text-lg font-semibold mb-2">getChapters</h3>
              <p className="text-white/80 text-sm">Get chapters for a comic</p>
            </div>
            <div className="bg-purple-900/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
              <h3 className="text-white text-lg font-semibold mb-2">getPages</h3>
              <p className="text-white/80 text-sm">Get pages for a chapter</p>
            </div>
            <div className="bg-purple-900/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
              <h3 className="text-white text-lg font-semibold mb-2">downloadChapter</h3>
              <p className="text-white/80 text-sm">Download a chapter</p>
            </div>
          </div>

          <p className="text-white/60 text-sm text-center mb-8">
            UTOON is protected by Cloudflare. If your deployment is blocked, configure
            `UTOON_COOKIE` or `UTOON_CF_CLEARANCE` in the hosting environment.
          </p>

          <div className="flex flex-col items-center gap-4">
            <button
              onClick={handleInstall}
              className="font-light bg-yellow-400 hover:bg-yellow-500 text-black shadow-lg px-8 py-4 rounded-lg text-lg transition-colors flex items-center justify-center gap-3 cursor-pointer w-full md:w-auto"
            >
              Install Plugin
            </button>
            {installStatus && (
              <p className="text-white/80 text-sm text-center max-w-md">{installStatus}</p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
