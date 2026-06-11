'use client'

import React from 'react'

interface State { hasError: boolean; message: string }

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error: unknown): State {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : String(error),
    }
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="flex flex-col items-center justify-center min-h-[100dvh] px-6 bg-[#FAF7F1] dark:bg-[#17141F]">
          <p className="text-4xl mb-4">⚠️</p>
          <p className="text-lg font-semibold text-[#1E1B2E] dark:text-[#D8D5E4] mb-2 text-center">
            Algo deu errado
          </p>
          <p className="text-sm text-[#8A8797] text-center mb-6">
            Feche o app e abra novamente.
          </p>
          <button
            onClick={() => { this.setState({ hasError: false, message: '' }) }}
            className="px-6 py-2.5 bg-[#2E2860] text-white rounded-xl text-sm font-medium"
          >
            Tentar novamente
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
