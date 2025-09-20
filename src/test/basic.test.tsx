import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

// Simple React component for testing
function TestComponent() {
  return <div>Hello Test World</div>
}

describe('Basic Test Suite', () => {
  it('should pass basic assertion', () => {
    expect(1 + 1).toBe(2)
  })

  it('should render React component', () => {
    render(<TestComponent />)
    expect(screen.getByText('Hello Test World')).toBeInTheDocument()
  })
})