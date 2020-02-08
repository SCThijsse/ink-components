import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Color, useStdin } from 'ink'
import chalk from 'chalk'

const ARROW_UP = '\u001B[A'
const ARROW_DOWN = '\u001B[B'
const ARROW_LEFT = '\u001B[D'
const ARROW_RIGHT = '\u001B[C'
const ENTER = '\r'
const CTRL_C = '\x03'
const BACKSPACE = '\x08'
const DELETE = '\x7F'

export const TextInput = ({
  value,
  placeholder,
  focus,
  mask,
  highlightPastedText,
  showCursor,
  onChange,
  onSubmit
}) => {
  const { stdin, setRawMode } = useStdin()
  const [{ cursorOffset, cursorWidth }, setState] = useState({
    cursorOffset: (value || '').length,
    cursorWidth: 0
  })
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    const handleInput = data => {
      const originalValue = value
      const originalCursorOffset = cursorOffset

      if (focus === false || isMounted === false) {
        return
      }

      const s = String(data)

      if (s === ARROW_UP || s === ARROW_DOWN || s === CTRL_C) {
        return
      }

      if (s === ENTER) {
        if (onSubmit) {
          onSubmit(originalValue)
        }

        return
      }

      let newCursorOffset = originalCursorOffset
      let newValue = originalValue
      let cursorWidth = 0

      if (s === ARROW_LEFT) {
        if (showCursor && !mask) {
          newCursorOffset--
        }
      } else if (s === ARROW_RIGHT) {
        if (showCursor && !mask) {
          newCursorOffset++
        }
      } else if (s === BACKSPACE || s === DELETE) {
        newValue = newValue.slice(0, newCursorOffset - 1) + newValue.slice(newCursorOffset, newValue.length)
        newCursorOffset--
      } else {
        newValue = newValue.slice(0, newCursorOffset) + s + newValue.slice(newCursorOffset, newValue.length)
        newCursorOffset += s.length

        if (s.length > 1) {
          cursorWidth = s.length
        }
      }

      if (newCursorOffset < 0) {
        newCursorOffset = 0
      }

      if (newCursorOffset > newValue.length) {
        newCursorOffset = newValue.length
      }

      setState({ cursorOffset: newCursorOffset, cursorWidth })

      if (newValue !== originalValue) {
        onChange(newValue)
      }
    }

    setIsMounted(true)
    setRawMode(true)
    stdin.on('data', handleInput)

    return () => {
      setIsMounted(false)
      stdin.removeListener('data', handleInput)
      setRawMode(false)
    }
  }, [
    isMounted, setIsMounted, setRawMode, stdin, value, focus,
    showCursor, mask, onChange, onSubmit, cursorOffset, cursorWidth, setState
  ])

  const hasValue = value.length > 0
  let renderedValue = value
  const cursorActualWidth = highlightPastedText ? cursorWidth : 0

  // Fake mouse cursor, because it's too inconvenient to deal with actual cursor
  // and ansi escapes
  if (showCursor && !mask && focus) {
    renderedValue = value.length > 0 ? '' : chalk.inverse(' ')

    let i = 0
    for (const char of value) {
      if (i >= cursorOffset - cursorActualWidth && i <= cursorOffset) {
        renderedValue += chalk.inverse(char)
      } else {
        renderedValue += char
      }

      i++
    }

    if (value.length > 0 && cursorOffset === value.length) {
      renderedValue += chalk.inverse(' ')
    }
  }

  if (mask) {
    renderedValue = mask.repeat(renderedValue.length)
  }

  return (
    <Color dim={!hasValue && placeholder}>
      {placeholder ? (hasValue ? renderedValue : placeholder) : renderedValue}
    </Color>
  )
}

TextInput.propTypes = {
  value: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  focus: PropTypes.bool,
  mask: PropTypes.string,
  highlightPastedText: PropTypes.bool,
  showCursor: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func
}

TextInput.defaultProps = {
  placeholder: '',
  showCursor: true,
  focus: true,
  mask: undefined,
  highlightPastedText: false,
  onSubmit: undefined
}
