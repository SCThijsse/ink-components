import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Box } from 'ink'
import spinners from './spinners.json'

export const Spinner = ({ type }) => {
  const [frame, setFrame] = useState(0)
  const spinner = spinners[type] || spinners.dots

  useEffect(() => {
    const timer = setInterval(() => {
      const isLastFrame = frame === spinner.frames.length - 1
      const nextFrame = isLastFrame ? 0 : frame + 1
      setFrame(nextFrame)
    }, spinner.interval)

    return () => clearInterval(timer)
  }, [frame, setFrame, spinner.frames, spinner.interval])

  return (
    <Box>
      {spinner.frames[frame]}
    </Box>
  )
}

Spinner.propTypes = {
  type: PropTypes.string
}

Spinner.defaultProps = {
  type: 'point'
}
