import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

function SimpleComponent() {
  return <div>Test Component</div>
}

describe('React Test', () => {
  it('should render component', () => {
    render(<SimpleComponent />)
    expect(screen.getByText('Test Component')).toBeInTheDocument()
  })
})