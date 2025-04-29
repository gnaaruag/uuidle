"use client"

import type React from "react"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"

interface KeyboardProps {
  onKeyPress: (key: string) => void
  guesses: string[]
  targetUUID: string
  gameStatus: "playing" | "won" | "lost"
}

export function Keyboard({ onKeyPress, guesses, targetUUID, gameStatus }: KeyboardProps) {
  const rows = [
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    ["a", "b", "c", "d", "e", "f", "Backspace"],
    ["Enter"],
  ]

  // Calculate key statuses based on guesses
  const keyStatuses = useMemo(() => {
    const statuses: Record<string, "correct" | "present" | "absent" | undefined> = {}

    // Process all guesses to determine key statuses
    guesses.forEach((guess) => {
      ;[...guess].forEach((char, index) => {
        // Skip hyphens
        if (char === "-") return

        const lowerChar = char.toLowerCase()

        // If character is in correct position
        if (lowerChar === targetUUID[index]?.toLowerCase()) {
          statuses[lowerChar] = "correct"
          return
        }

        // If character exists in target but in wrong position
        if (targetUUID.toLowerCase().includes(lowerChar)) {
          // Only update if not already marked as correct
          if (statuses[lowerChar] !== "correct") {
            statuses[lowerChar] = "present"
          }
          return
        }

        // If character doesn't exist in target
        if (!statuses[lowerChar]) {
          statuses[lowerChar] = "absent"
        }
      })
    })

    return statuses
  }, [guesses, targetUUID])

  // Get background color based on key status
  const getKeyBackground = (key: string) => {
    const status = keyStatuses[key.toLowerCase()]

    switch (status) {
      case "correct":
        return "bg-green-500 text-black hover:bg-green-600"
      case "present":
        return "bg-yellow-500 text-black hover:bg-yellow-600"
      case "absent":
        return "bg-gray-300 text-black hover:bg-gray-400"
      default:
        return "bg-gray-100 text-black hover:bg-gray-200"
    }
  }

  // Handle physical keyboard input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (gameStatus !== "playing") return

    const key = e.key

    if (key === "Enter" || key === "Backspace" || /^[0-9a-f]$/i.test(key)) {
      onKeyPress(key)
    }
  }

  return (
    <div className="mt-4 select-none" onKeyDown={handleKeyDown} tabIndex={0}>
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="mb-2 flex justify-center gap-1">
          {row.map((key) => (
            <Button
              key={key}
              variant="outline"
              className={`h-10 ${key === "Enter" ? "w-full" : key === "Backspace" ? "w-16" : "w-8"} font-mono font-bold ${getKeyBackground(key)} ${gameStatus !== "playing" ? "opacity-50" : ""}`}
              onClick={() => onKeyPress(key)}
              disabled={gameStatus !== "playing"}
            >
              {key === "Backspace" ? "⌫" : key}
            </Button>
          ))}
        </div>
      ))}
    </div>
  )
}
