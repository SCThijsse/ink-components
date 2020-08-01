import React from 'react'
import { Box, Color, Text } from 'ink'
import PropTypes from 'prop-types'
import { SelectInput, TextInput } from './'
import { Indicator, Item } from './SelectInput/index'

const match = input => ({ label }) =>
  input.length > 0 && label.toLowerCase().indexOf(input.toLowerCase()) > -1

export const AutoComplete = ({
  value,
  prompt,
  placeholder,
  items,
  getMatch,
  onChange,
  onSubmit,
  indicatorComponent,
  itemCompontent,
  limit
}) => {
  const matches = items.filter(getMatch(value))
  const hasSuggestion = matches.length !== 0

  return (
    <Box flexDirection='column'>
      <Box>
        <Text>{prompt !== '' && <Color green>{prompt}</Color>}</Text>
        <TextInput
          value={value}
          placeholder={placeholder}
          onChange={onChange}
        />
      </Box>
      <SelectInput
        items={(value.length > 0) ? matches : items}
        onSelect={onSubmit}
        focus={hasSuggestion}
        indicatorComponent={indicatorComponent}
        itemCompontent={itemCompontent}
        limit={limit}
        vimMode={false}
      />
    </Box>
  )
}

AutoComplete.propTypes = {
  value: PropTypes.string,
  prompt: PropTypes.string,
  placeholder: PropTypes.string,
  items: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.any.isRequired
  })),
  getMatch: PropTypes.func,
  onChange: PropTypes.func,
  onSubmit: PropTypes.func,
  indicatorComponent: PropTypes.func,
  itemComponent: PropTypes.func,
  limit: PropTypes.number
}

AutoComplete.defaultProps = {
  value: '',
  prompt: '',
  placeholder: '',
  items: [],
  getMatch: match,
  onChange () {},
  onSubmit () {},
  indicatorComponent: Indicator,
  itemComponent: Item,
  limit: 6
}
