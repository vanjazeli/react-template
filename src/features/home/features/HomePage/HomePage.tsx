import { Link } from '@tanstack/react-router'

import { Typography } from '@/common/components/atoms/Typography/Typography'

export const HomePage = () => {
  return (
    <div>
      <Typography variant="h1">Home</Typography>
      <Link to="/about">About</Link>
    </div>
  )
}
