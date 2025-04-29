"use client"

import { useMemo } from "react"

interface GuessGridProps {
  guesses: string[]
  currentGuess: string
  targetUUID: string
  maxGuesses: number
}

export function GuessGrid({ guesses, currentGuess, targetUUID, maxGuesses }: GuessGridProps) {
  const UUID_LENGTH = 36
  const UUID_SEGMENTS = [8, 4, 4, 4, 12] // Standard UUID format segments
  // const HYPHEN_POSITIONS = [8, 13, 18, 23]

  // Create empty rows to fill up to maxGuesses
  const emptyRows = useMemo(() => {
    const rows = []
    for (let i = 0; i < maxGuesses - guesses.length - (currentGuess ? 1 : 0); i++) {
      rows.push(Array(UUID_LENGTH).fill(""))
    }
    return rows
  }, [guesses.length, currentGuess, maxGuesses])

  // Function to determine the status of each character
  const getCharStatus = (char: string, index: number, guess: string) => {
    if (!targetUUID) return "empty"

    // If it's a hyphen, it's always correct
    if (char === "-") return "correct"

    // If the character is in the correct position
    if (char.toLowerCase() === targetUUID[index]?.toLowerCase()) {
      return "correct"
    }

    // If the character exists in the target but in a different position
    if (targetUUID.toLowerCase().includes(char.toLowerCase())) {
      // Count occurrences in target
      const targetCount = [...targetUUID.toLowerCase()].filter((c) => c === char.toLowerCase()).length

      // Count correct position occurrences in the guess
      const correctPositions = [...guess.toLowerCase()].filter(
        (c, i) => c === char.toLowerCase() && c === targetUUID[i]?.toLowerCase(),
      ).length

      // Count previous occurrences in the guess
      const previousOccurrences = [...guess.toLowerCase().substring(0, index)].filter(
        (c) => c === char.toLowerCase(),
      ).length

      // If we've already marked enough of this character as present or correct
      if (previousOccurrences + correctPositions >= targetCount) {
        return "absent"
      }

      return "present"
    }

    return "absent"
  }

  // Function to get the background color based on status
  const getBackgroundColor = (status: string) => {
    switch (status) {
      case "correct":
        return "bg-green-500 text-black border-green-600"
      case "present":
        return "bg-yellow-500 text-black border-yellow-600"
      case "absent":
        return "bg-gray-300 text-gray-700 border-gray-400"
      default:
        return "bg-white border-gray-300"
    }
  }

  // Function to split UUID into segments for responsive display
  const renderUUIDSegments = (uuid: string, isCurrentGuess = false, rowIndex = 0) => {
    // Standard UUID format: 8-4-4-4-12
    const segments = []
    let pos = 0

    // Create segments based on UUID format
    for (let i = 0; i < UUID_SEGMENTS.length; i++) {
      const length = UUID_SEGMENTS[i]
      const end = pos + length
      const segment = uuid.substring(pos, end)
      segments.push(segment)
      pos = end + 1 // Skip the hyphen
    }

    return (
      <div className="flex flex-wrap gap-1 justify-center">
        {segments.map((segment, segmentIndex) => {
          const segmentLength = UUID_SEGMENTS[segmentIndex]
          const paddedSegment = isCurrentGuess ? segment.padEnd(segmentLength, " ") : segment

          // Calculate absolute position for this segment
          let absoluteStartPos = 0
          for (let i = 0; i < segmentIndex; i++) {
            absoluteStartPos += UUID_SEGMENTS[i] + 1 // Add 1 for hyphen
          }

          return (
            <div key={`segment-container-${segmentIndex}-${rowIndex}`} className="flex gap-1 mb-1">
              <div className="flex gap-1">
                {[...paddedSegment].map((char, charIndex) => {
                  const absolutePosition = absoluteStartPos + charIndex
                  const status = !isCurrentGuess ? getCharStatus(char, absolutePosition, uuid) : "empty"

                  return (
                    <div
                      key={`${rowIndex}-${absolutePosition}`}
                      className={`flex h-8 w-8 items-center justify-center rounded border font-mono text-sm font-bold uppercase transition-colors ${
                        isCurrentGuess
                          ? char === " "
                            ? "border-gray-300"
                            : "bg-white border-gray-300"
                          : getBackgroundColor(status)
                      }`}
                    >
                      {char !== " " ? char : ""}
                    </div>
                  )
                })}
              </div>

              {/* Add hyphen after each segment except the last one */}
              {segmentIndex < UUID_SEGMENTS.length - 1 && (
                <div
                  className={`flex h-8 w-8 items-center text-white justify-center rounded border font-mono text-sm font-bold uppercase ${
                    !isCurrentGuess ? "bg-green-500  border-green-600" : "border-gray-300 "
                  }`}
                >
                  -
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  // Function to render empty row with pre-placed hyphens
  const renderEmptyRow = (rowIndex: number) => {
    return (
      <div className="flex flex-wrap gap-1 justify-center">
        {UUID_SEGMENTS.map((segmentLength, segmentIndex) => (
          <div key={`empty-segment-container-${segmentIndex}-${rowIndex}`} className="flex gap-1 mb-1">
            <div className="flex gap-1">
              {Array(segmentLength)
                .fill("")
                .map((_, charIndex) => (
                  <div
                    key={`empty-${rowIndex}-${segmentIndex}-${charIndex}`}
                    className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 font-mono text-sm"
                  ></div>
                ))}
            </div>

            {/* Add hyphen after each segment except the last one */}
            {segmentIndex < UUID_SEGMENTS.length - 1 && (
              <div className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 font-mono text-sm">
                -
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {/* Completed guesses */}
      {guesses.map((guess, guessIndex) => (
        <div key={guessIndex} className="guess-row">
          {renderUUIDSegments(guess, false, guessIndex)}
        </div>
      ))}

      {/* Current guess */}
      {currentGuess && <div className="current-guess text-black">{renderUUIDSegments(currentGuess, true, guesses.length)}</div>}

      {/* Empty rows */}
      {emptyRows.map((_, rowIndex) => (
        <div key={`empty-row-${rowIndex}`} className="empty-row">
          {renderEmptyRow(rowIndex + guesses.length + (currentGuess ? 1 : 0))}
        </div>
      ))}
    </div>
  )
}
