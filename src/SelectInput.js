import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Box, useStdin } from 'ink'
import { CheckBox, Indicator, Item } from './SelectInput/index'

const ARROW_UP = '\u001B[A'
const ARROW_DOWN = '\u001B[B'
const ENTER = '\r'
const SPACE = ' '

const arrRotate = (input, n) => {
  if (!Array.isArray(input)) {
    throw new TypeError(`Expected an array, got ${typeof input}`)
  }

  const x = input.slice()
  const num = typeof n === 'number' ? n : 0

  return x.splice(-num % x.length).concat(x)
}

export const useSelectionList = ({
  items,
  defaultSelected,
  focus,
  initialIndex,
  limit,
  onSelect,
  onHighlight,
  onUnselect,
  onSubmit,
  vimMode,
  multi
}) => {
  const [{ rotateIndex, highlightedIndex }, setState] = useState({
    rotateIndex: 0,
    highlightedIndex: initialIndex
  })
  const [selected, setSelected] = useState(defaultSelected)
  const { stdin, setRawMode } = useStdin()

  const isSelected = value =>
    selected.map(({ value }) => value).includes(value)

  const selectItem = item => {
    if (isSelected(item.value)) {
      onUnselect(item)
      return selected.filter(({ value }) => value !== item.value)
    }

    onSelect(item)
    return [...selected, item]
  }

  useEffect(() => {
    const up = vimMode ? [ARROW_UP, 'k'] : [ARROW_UP]
    const down = vimMode ? [ARROW_DOWN, 'j'] : [ARROW_DOWN]

    const handleInput = data => {
      const hasLimit = items.length > limit
      if (focus === false) {
        return
      }

      const s = String(data)

      if (up.includes(s)) {
        const lastIndex = (hasLimit ? limit : items.length) - 1
        const atFirstIndex = highlightedIndex === 0
        const nextIndex = (hasLimit ? highlightedIndex : lastIndex)
        const nextRotateIndex = atFirstIndex ? rotateIndex + 1 : rotateIndex
        const nextSelectedIndex = atFirstIndex ? nextIndex : highlightedIndex - 1

        setState({
          rotateIndex: nextRotateIndex,
          highlightedIndex: nextSelectedIndex
        })

        const slicedItems = hasLimit
          ? arrRotate(items, nextRotateIndex).slice(0, limit)
          : items
        onHighlight(slicedItems[nextSelectedIndex])
      }

      if (down.includes(s)) {
        const atLastIndex = highlightedIndex === (hasLimit ? limit : items.length) - 1
        const nextIndex = (hasLimit ? highlightedIndex : 0)
        const nextRotateIndex = atLastIndex ? rotateIndex - 1 : rotateIndex
        const nextSelectedIndex = atLastIndex ? nextIndex : highlightedIndex + 1

        setState({
          rotateIndex: nextRotateIndex,
          highlightedIndex: nextSelectedIndex
        })

        const slicedItems = hasLimit
          ? arrRotate(items, nextRotateIndex).slice(0, limit)
          : items
        onHighlight(slicedItems[nextSelectedIndex])
      }

      if (s === SPACE && multi) {
        const slicedItems = hasLimit
          ? arrRotate(items, rotateIndex).slice(0, limit)
          : items

        setState({ rotateIndex, highlightedIndex })
        setSelected(selectItem(slicedItems[highlightedIndex]))
      }

      if (s === ENTER) {
        if (multi) {
          onSubmit(selected)
        } else {
          const slicedItems = hasLimit
            ? arrRotate(items, rotateIndex).slice(0, limit)
            : items
          onSelect(slicedItems[highlightedIndex])
        }
      }
    }

    setRawMode(true)
    stdin.on('data', handleInput)

    return () => {
      stdin.removeListener('data', handleInput)
      setRawMode(false)
    }
  }, [
    items, limit, selected, setSelected, rotateIndex, highlightedIndex,
    onSelect, onUnselect, onSubmit, onHighlight,
    setRawMode, setState, stdin, vimMode
  ])

  useEffect(() => {
    setState({ rotateIndex: 0, highlightedIndex: 0 })
  }, [items, setState])

  return [{ rotateIndex, highlightedIndex }, isSelected]
}

export const SelectInput = ({
  items,
  defaultSelected,
  focus,
  initialIndex,
  indicatorComponent,
  checkboxComponent,
  itemComponent,
  limit,
  onSelect,
  onUnselect,
  onSubmit,
  onHighlight,
  vimMode,
  multi
}) => {
  const [{ rotateIndex, highlightedIndex }, isSelected] = useSelectionList({
    items,
    defaultSelected,
    focus,
    initialIndex,
    limit,
    onSelect,
    onHighlight,
    onUnselect,
    onSubmit,
    vimMode,
    multi
  })

  const slicedItems = items.length > limit
    ? arrRotate(items, rotateIndex).slice(0, limit)
    : items

  return (
    <Box marinLeft={1} flexDirection='column'>
      {slicedItems.map((item, index) => {
        const isHighlighted = index === highlightedIndex
        return (
          <Box key={item.key || item.value}>
            {React.createElement(indicatorComponent, { isHighlighted })}
            {multi && React.createElement(checkboxComponent, { isSelected: isSelected(item.value) })}
            {React.createElement(itemComponent, { ...item, isHighlighted })}
          </Box>
        )
      })}
    </Box>
  )
}

SelectInput.propTypes = {
  items: PropTypes.array,
  defaultSelected: PropTypes.array,
  focus: PropTypes.bool,
  initialIndex: PropTypes.number,
  indicatorComponent: PropTypes.func,
  checkboxComponent: PropTypes.func,
  itemComponent: PropTypes.func,
  limit: PropTypes.number,
  onSelect: PropTypes.func,
  onUnselect: PropTypes.func,
  onSubmit: PropTypes.func,
  onHighlight: PropTypes.func,
  vimMode: PropTypes.bool,
  multi: PropTypes.bool
}

SelectInput.defaultProps = {
  items: [],
  defaultSelected: [],
  focus: true,
  initialIndex: 0,
  indicatorComponent: Indicator,
  checkboxComponent: CheckBox,
  itemComponent: Item,
  limit: 6,
  onSelect () {},
  onUnselect () {},
  onSubmit () {},
  onHighlight () {},
  vimMode: true,
  multi: false
}
