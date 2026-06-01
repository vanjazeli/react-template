import { Typography } from '@/common/components/atoms/Typography/Typography'
import { Link } from '@tanstack/react-router'

export const AboutPage = () => {
  return (
    <div>
      <Typography variant="h1">About</Typography>
      <Link to="/home">Home</Link>
    </div>
  )
}
