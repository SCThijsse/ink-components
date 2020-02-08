import React from 'react'
import PropTypes from 'prop-types'
import { Box, Color } from 'ink'

export const Indicator = ({ isHighlighted }) =>
  <Box marginRight={1}>{isHighlighted ? <Color blue>❯</Color> : ' '}</Box>

Indicator.propTypes = {
  isHighlighted: PropTypes.bool
}

Indicator.defaultProps = {
  isHighlighted: false
}
