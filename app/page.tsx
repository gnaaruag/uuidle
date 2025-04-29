"use client"

import { useEffect, useState, useCallback } from "react"
import { v4 as uuidv4 } from "uuid"
import { Keyboard } from "@/components/keyboard"
import { GuessGrid } from "@/components/guess-grid"
import { Button } from "@/components/ui/button"
import { RefreshCw, Info } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function UUIDWordle() {
  const [targetUUID, setTargetUUID] = useState("")
  const [currentGuess, setCurrentGuess] = useState("")
  const [guesses, setGuesses] = useState<string[]>([])
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">("playing")
  const [message, setMessage] = useState("")
  const [isMobile, setIsMobile] = useState(false) // NEW

  const MAX_GUESSES = 5
  const UUID_LENGTH = 36
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const HYPHEN_POSITIONS = [8, 13, 18, 23]

  useEffect(() => {
    startNewGame()
  }, [])

  useEffect(() => {
    const checkScreenWidth = () => {
      setIsMobile(window.innerWidth < 600)
    }
    checkScreenWidth()
    window.addEventListener("resize", checkScreenWidth)
    return () => window.removeEventListener("resize", checkScreenWidth)
  }, [])

  const startNewGame = () => {
    const newUUID = uuidv4()
    setTargetUUID(newUUID)
    setCurrentGuess("")
    setGuesses([])
    setGameStatus("playing")
    setMessage("")
  }

  const handleBackspace = useCallback(() => {
    setCurrentGuess((prev) => {
      if (HYPHEN_POSITIONS.includes(prev.length - 2)) {
        return prev.slice(0, -2)
      }
      return prev.slice(0, -1)
    })
  }, [HYPHEN_POSITIONS])

  const handleSubmitGuess = useCallback(() => {
    if (currentGuess.length !== UUID_LENGTH) {
      setMessage("UUID must be complete")
      setTimeout(() => setMessage(""), 2000)
      return
    }

    const newGuesses = [...guesses, currentGuess]
    setGuesses(newGuesses)

    if (currentGuess === targetUUID) {
      setGameStatus("won")
      setMessage("You won! 🎉")
    } else if (newGuesses.length >= MAX_GUESSES) {
      setGameStatus("lost")
      setMessage(`Game over! The UUID was: ${targetUUID}`)
    }

    setCurrentGuess("")
  }, [currentGuess, guesses, targetUUID, UUID_LENGTH, MAX_GUESSES])

  const handleKeyPress = useCallback(
    (key: string) => {
      if (gameStatus !== "playing") return

      if (key === "Enter") {
        handleSubmitGuess()
        return
      }

      if (key === "Backspace") {
        handleBackspace()
        return
      }

      if (/^[0-9a-f]$/.test(key.toLowerCase()) && currentGuess.length < UUID_LENGTH) {
        const nextPosition = currentGuess.length

        if (HYPHEN_POSITIONS.includes(nextPosition)) {
          setCurrentGuess((prev) => prev + "-" + key.toLowerCase())
        } else {
          setCurrentGuess((prev) => prev + key.toLowerCase())
        }
      }
    },
    [currentGuess, gameStatus, handleSubmitGuess, handleBackspace, UUID_LENGTH, HYPHEN_POSITIONS],
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameStatus !== "playing") return

      if (e.key === "Enter") {
        handleSubmitGuess()
        return
      }

      if (e.key === "Backspace") {
        handleBackspace()
        return
      }

      if (/^[0-9a-f]$/i.test(e.key)) {
        handleKeyPress(e.key.toLowerCase())
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [gameStatus, handleSubmitGuess, handleBackspace, handleKeyPress])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      {isMobile ? (
        <div className="w-full max-w-md rounded-md bg-yellow-100 p-6 text-center text-lg font-semibold text-yellow-800">
          For the best experience, please open this game on a desktop or larger screen!
        </div>
      ) : (
        <div className="w-full max-w-3xl space-y-6">
          <header className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">UUID{"'"}le</h1>
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <Info className="h-4 w-4" />
                    <span className="sr-only">How to play</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>How to Play UUID Wordle</DialogTitle>
                    <DialogDescription>
                    <p className="mt-2">Guess the UUID in 5 tries. Each guess must be a valid UUID format.</p>
                    <p className="mt-2">
                      After each guess, the color of the tiles will change to show how close your guess was:
                    </p>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 bg-green-500 rounded flex items-center justify-center text-black font-bold">
                          a
                        </div>
                        <span>Correct character in the correct position</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 bg-yellow-500 rounded flex items-center justify-center text-black font-bold">
                          b
                        </div>
                        <span>Correct character in the wrong position</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 bg-gray-300 rounded flex items-center justify-center text-gray-700 font-bold">
                          c
                        </div>
                        <span>Character not in the UUID</span>
                      </div>
                    </div>
                    <p className="mt-2">
                      The hyphens (-) are pre-placed for you. Focus on guessing the hex characters.
                    </p>
                    <p className="mt-2">You can use your keyboard to type directly into the game!</p>
                  </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={startNewGame}>
                <RefreshCw className="h-4 w-4" />
                <span className="sr-only">New game</span>
              </Button>
            </div>
          </header>
  
          {message && (
            <div className="rounded-md bg-blue-50 p-2 text-center text-sm font-medium text-blue-800">{message}</div>
          )}
  
          <GuessGrid
            guesses={guesses}
            currentGuess={gameStatus === "playing" ? currentGuess : ""}
            targetUUID={targetUUID}
            maxGuesses={MAX_GUESSES}
          />
  
          <Keyboard onKeyPress={handleKeyPress} guesses={guesses} targetUUID={targetUUID} gameStatus={gameStatus} />
  
          <div className="text-center text-sm text-black">
            {gameStatus === "playing" && (
              <p>
                {guesses.length} of {MAX_GUESSES} guesses
              </p>
            )}
            {gameStatus === "won" && (
              <Button variant="outline" onClick={startNewGame} className="mt-2">
                Play Again
              </Button>
            )}
            {gameStatus === "lost" && (
              <Button variant="outline" onClick={startNewGame} className="mt-2">
                Try Again
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
  
}
