import React from 'react'
import PropTypes from 'prop-types'
import { Box, Color } from 'ink'

export const CheckBox = ({ isSelected }) => (
  <Box marginRight={1}>
    <Color green>{isSelected ? '◉' : '◯'}</Color>
  </Box>
)

CheckBox.propTypes = {
  isSelected: PropTypes.bool
}

CheckBox.defaultProps = {
  isSelected: false
}
