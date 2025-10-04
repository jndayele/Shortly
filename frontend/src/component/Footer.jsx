import React from 'react'

const Footer = () => {
  return (
    <div>
          <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200/50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap justify-center sm:justify-start gap-4 sm:gap-6 text-sm">
              <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">About</a>
              <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">FAQ</a>
              <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">Contact</a>
              <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">Privacy</a>
            </div>
            <p className="text-gray-600 text-sm flex items-center gap-1">
              Made with <span className="text-red-500 animate-pulse">❤️</span> by a Concerned Citizen
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Footer